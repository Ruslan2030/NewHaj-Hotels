import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  MessageSquare, 
  Mail, 
  Copy, 
  Check, 
  ExternalLink, 
  Globe, 
  Languages,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { Company } from '../types';

interface OutreachModalProps {
  company: Company | null;
  onClose: () => void;
  onUpdateStatus: (companyId: string, status: Company['outreachStatus'], msgDetails?: any) => void;
}

export const OutreachModal: React.FC<OutreachModalProps> = ({
  company,
  onClose,
  onUpdateStatus,
}) => {
  if (!company) return null;

  const [language, setLanguage] = useState<'ar' | 'en' | 'ru' | 'tr' | 'id' | 'ur'>('en');
  const [isGenerating, setIsGenerating] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [whatsappMsg, setWhatsappMsg] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedWA, setCopiedWA] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // Auto-select initial language based on country
  useEffect(() => {
    if (!company) return;
    const country = company.country?.toLowerCase() || '';
    if (country.includes('saudi') || country.includes('egypt') || country.includes('emirates') || country.includes('uae') || country.includes('qatar') || country.includes('jordan')) {
      setLanguage('ar');
    } else if (country.includes('russia') || country.includes('uzbekistan') || country.includes('kazakhstan') || country.includes('kyrgyzstan') || country.includes('tajikistan')) {
      setLanguage('ru');
    } else if (country.includes('turkey') || country.includes('türkiye')) {
      setLanguage('tr');
    } else if (country.includes('indonesia') || country.includes('malaysia')) {
      setLanguage('id');
    } else if (country.includes('pakistan')) {
      setLanguage('ur');
    } else {
      setLanguage('en');
    }
  }, [company]);

  const generateOutreach = async (selectedLang: typeof language) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: company.name,
          country: company.country,
          city: company.city,
          website: company.website,
          language: selectedLang,
        }),
      });

      const data = await res.json();
      if (data.success && data.outreach) {
        setEmailSubject(data.outreach.emailSubject || '');
        setEmailBody(data.outreach.emailBody || '');
        setWhatsappMsg(data.outreach.whatsappMessage || '');
      }
    } catch (err) {
      console.error('Failed to generate outreach:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Trigger generation on initial open
  useEffect(() => {
    if (company) {
      generateOutreach(language);
    }
  }, [company]);

  const handleLangChange = (newLang: typeof language) => {
    setLanguage(newLang);
    generateOutreach(newLang);
  };

  const copyToClipboard = (text: string, type: 'email' | 'wa') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedWA(true);
      setTimeout(() => setCopiedWA(false), 2000);
    }
  };

  const markAsSent = (type: 'email' | 'whatsapp') => {
    onUpdateStatus(company.id, 'sent', {
      type,
      language,
      content: type === 'email' ? emailBody : whatsappMsg,
      sentAt: new Date().toISOString(),
    });
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      onClose();
    }, 1500);
  };

  const waNumberClean = company.whatsapp?.replace(/[^0-9]/g, '') || company.phone?.replace(/[^0-9]/g, '') || '';
  const waUrl = waNumberClean ? `https://wa.me/${waNumberClean}?text=${encodeURIComponent(whatsappMsg)}` : '';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Генератор многоязычных коммерческих предложений
              </h3>
              <p className="text-xs text-slate-400">
                Компания: <strong className="text-emerald-300">{company.name}</strong> ({company.country})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Language selection bar */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-emerald-600" />
              Выберите язык коммерческого предложения:
            </label>

            <div className="flex flex-wrap gap-2 text-xs font-medium">
              {[
                { code: 'ar', label: '🇸🇦 Арабский (العربية)' },
                { code: 'en', label: '🇬🇧 Английский' },
                { code: 'ru', label: '🇷🇺 Русский' },
                { code: 'tr', label: '🇹🇷 Турецкий (Türkçe)' },
                { code: 'id', label: '🇮🇩 Индонезийский (Bahasa)' },
                { code: 'ur', label: '🇵🇰 Урду (اردو)' },
              ].map((item) => (
                <button
                  key={item.code}
                  onClick={() => handleLangChange(item.code as any)}
                  className={`px-3 py-1.5 rounded-lg border transition ${
                    language === item.code
                      ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loader */}
          {isGenerating ? (
            <div className="p-12 text-center space-y-3 bg-slate-50 rounded-xl border border-slate-200">
              <Sparkles className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-700">
                Агент Gemini 3.6 Flash составит предложение на выбранном языке...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email Proposal Column */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-emerald-600" />
                      Шаблон Email Письма
                    </span>

                    <button
                      onClick={() => copyToClipboard(`Тема: ${emailSubject}\n\n${emailBody}`, 'email')}
                      className="text-slate-500 hover:text-emerald-600 text-xs flex items-center gap-1"
                    >
                      {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedEmail ? 'Скопировано!' : 'Копировать'}
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Тема письма:</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs font-medium text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Текст письма:</label>
                    <textarea
                      rows={9}
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded p-2 text-xs text-slate-800 leading-relaxed font-sans"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-200">
                  {company.email ? (
                    <a
                      href={`mailto:${company.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
                      onClick={() => markAsSent('email')}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1.5 transition"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Открыть почтовый клиент и отправить
                    </a>
                  ) : (
                    <span className="text-rose-500 text-xs italic">Email адрес отсутствует</span>
                  )}
                </div>
              </div>

              {/* WhatsApp Message Column */}
              <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-200 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-teal-200 pb-2">
                    <span className="font-bold text-teal-900 text-xs flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-teal-600" />
                      Шаблон сообщения в WhatsApp
                    </span>

                    <button
                      onClick={() => copyToClipboard(whatsappMsg, 'wa')}
                      className="text-teal-700 hover:text-teal-900 text-xs flex items-center gap-1"
                    >
                      {copiedWA ? <Check className="w-3.5 h-3.5 text-teal-700" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedWA ? 'Скопировано!' : 'Копировать'}
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-teal-800 block mb-1">Текст WhatsApp:</label>
                    <textarea
                      rows={12}
                      value={whatsappMsg}
                      onChange={(e) => setWhatsappMsg(e.target.value)}
                      className="w-full bg-white border border-teal-200 rounded p-2 text-xs text-slate-800 leading-relaxed font-sans"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-2 border-t border-teal-200">
                  {waUrl ? (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => markAsSent('whatsapp')}
                      className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1.5 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Открыть чат WhatsApp <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-slate-500 text-xs italic">Телефон/WhatsApp отсутствует</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {sentSuccess && (
            <div className="p-3 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Статус изменен на "Письмо отправлено"!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
