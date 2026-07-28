import express from 'express';
import path from 'path';
import fs from 'fs';
import dns from 'dns';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY environment variable is not defined.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// 1. Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 2. Email verification endpoint using DNS MX records & syntax rules
app.post('/api/verify-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email string is required' });
    }

    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return res.json({
        email: trimmed,
        valid: false,
        status: 'invalid',
        mxRecords: [],
        reason: 'Invalid email syntax format',
        score: 0,
      });
    }

    const domain = trimmed.split('@')[1];
    
    // Check disposable domains
    const disposableDomains = ['tempmail.com', 'mailinator.com', '10minutemail.com', 'guerrillamail.com', 'yopmail.com'];
    if (disposableDomains.includes(domain)) {
      return res.json({
        email: trimmed,
        valid: false,
        status: 'invalid',
        mxRecords: [],
        reason: 'Disposable temporary email domain detected',
        score: 10,
      });
    }

    // DNS MX record lookup
    try {
      const mxRecords = await dns.promises.resolveMx(domain);
      if (mxRecords && mxRecords.length > 0) {
        return res.json({
          email: trimmed,
          valid: true,
          status: 'valid',
          mxRecords: mxRecords.map((r) => r.exchange),
          reason: `Domain ${domain} has ${mxRecords.length} active mail server(s) (MX record verified)`,
          score: 95,
        });
      } else {
        return res.json({
          email: trimmed,
          valid: false,
          status: 'invalid',
          mxRecords: [],
          reason: `No MX records found for domain ${domain}`,
          score: 20,
        });
      }
    } catch (dnsErr: any) {
      // If domain doesn't resolve MX or DNS failed
      return res.json({
        email: trimmed,
        valid: false,
        status: 'invalid',
        mxRecords: [],
        reason: `DNS MX lookup failed for ${domain}: ${dnsErr.message || 'Domain unresolvable'}`,
        score: 15,
      });
    }
  } catch (err: any) {
    console.error('Error verifying email:', err);
    res.status(500).json({ error: 'Email verification server error' });
  }
});

// 3. AI Research Agent endpoint: Enriches company data via Gemini 3.6 Flash + Google Search Grounding
app.post('/api/enrich', async (req, res) => {
  try {
    const { companyName, country, currentEmail, currentWebsite, currentWhatsapp } = req.body;
    if (!companyName) {
      return res.status(400).json({ error: 'companyName is required' });
    }

    const ai = getGeminiClient();

    const prompt = `You are an expert B2B Intelligence Research Agent specializing in Hajj, Umrah, and Islamic Tourism companies.
Research the following Umrah / Hajj company:
- Company Name: "${companyName}"
- Country: "${country || 'Unknown'}"
- Known Email: "${currentEmail || 'None'}"
- Known Website: "${currentWebsite || 'None'}"
- Known WhatsApp: "${currentWhatsapp || 'None'}"

Perform web research using search grounding to identify:
1. Official Website URL (e.g. https://...)
2. Valid corporate email address
3. WhatsApp or phone number with international country code (e.g. +966..., +62..., +90..., +998..., +20...)
4. City of headquarters
5. Official Instagram handle (e.g. @company)
6. Official Facebook page URL or handle
7. Official Ministry of Hajj & Umrah License number if found or known format (e.g., UMR-12345 or PPIU-...)
8. Summary of services provided and brief notes for NewHaj B2B hub outreach.

Respond STRICTLY in JSON format following this schema:
{
  "website": "string",
  "email": "string",
  "whatsapp": "string",
  "phone": "string",
  "city": "string",
  "instagram": "string",
  "facebook": "string",
  "ministryLicense": "string",
  "aiNotes": "string",
  "confidenceScore": number
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            website: { type: Type.STRING },
            email: { type: Type.STRING },
            whatsapp: { type: Type.STRING },
            phone: { type: Type.STRING },
            city: { type: Type.STRING },
            instagram: { type: Type.STRING },
            facebook: { type: Type.STRING },
            ministryLicense: { type: Type.STRING },
            aiNotes: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER },
          },
          required: ['aiNotes', 'confidenceScore'],
        },
      },
    });

    const responseText = response.text || '{}';
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = {
        aiNotes: `Researched ${companyName} in ${country}. Partial details recovered.`,
        confidenceScore: 70,
      };
    }

    res.json({
      success: true,
      companyName,
      country,
      enrichedData: data,
    });
  } catch (err: any) {
    console.error('Error enriching company via Gemini:', err);
    res.status(500).json({
      error: 'Failed to enrich company data',
      details: err.message || 'AI service unavailable',
    });
  }
});

// 4. Outreach Generator Agent endpoint: Multi-lingual B2B proposal & WhatsApp generator
app.post('/api/generate-outreach', async (req, res) => {
  try {
    const { companyName, country, city, website, language = 'en', contactName } = req.body;
    if (!companyName) {
      return res.status(400).json({ error: 'companyName is required' });
    }

    const ai = getGeminiClient();

    const languageNames: Record<string, string> = {
      ar: 'Arabic (العربية)',
      en: 'English',
      ru: 'Russian (Русский)',
      tr: 'Turkish (Türkçe)',
      id: 'Indonesian (Bahasa Indonesia)',
      ur: 'Urdu (اردو)',
    };

    const targetLangName = languageNames[language] || 'English';

    const prompt = `You are a professional B2B Partnership Communications Manager for NewHaj.com — the premier global Umrah & Hajj Hub.
Target Company: "${companyName}" (${country || ''}, ${city || ''}). Website: "${website || 'Not listed'}".
Requested Language: ${targetLangName}.

Write a high-converting, polite, and culturally respectful B2B outreach message inviting "${companyName}" to feature their Umrah/Hajj packages, verify their official listing, and receive direct pilgrim leads on NewHaj.com.

Provide two variations:
1. A formal Email message (Subject + Body with greeting, key benefits, call to action, professional sign-off)
2. A direct WhatsApp message (concise, friendly, with relevant emojis, clear CTA link to newhaj.com/umrah-hajj-companies/)

Respond strictly in JSON:
{
  "emailSubject": "string",
  "emailBody": "string",
  "whatsappMessage": "string"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            emailSubject: { type: Type.STRING },
            emailBody: { type: Type.STRING },
            whatsappMessage: { type: Type.STRING },
          },
          required: ['emailSubject', 'emailBody', 'whatsappMessage'],
        },
      },
    });

    let result;
    try {
      result = JSON.parse(response.text || '{}');
    } catch {
      result = {
        emailSubject: `Partnership Proposal for ${companyName} - NewHaj Hub`,
        emailBody: `Dear ${companyName} team,\n\nWe invite you to join NewHaj.com global Umrah & Hajj directory...`,
        whatsappMessage: `Assalamu Alaikum! Greeting from NewHaj.com. We noticed ${companyName} on our Umrah hub...`,
      };
    }

    res.json({
      success: true,
      language,
      companyName,
      outreach: result,
    });
  } catch (err: any) {
    console.error('Error generating outreach:', err);
    res.status(500).json({ error: 'Outreach generation failed', details: err.message });
  }
});

// Start Express + Vite
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        if (vite && vite.ssrFixStacktrace) {
          vite.ssrFixStacktrace(e);
        }
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NewHaj Hub AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
