import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  CheckCircle2, 
  Copy, 
  Check, 
  Globe2, 
  Code,
  ArrowRight
} from 'lucide-react';
import { Company } from '../types';
import { calculateCompleteness } from '../data/mockCompanies';

interface GoogleSheetsSyncModalProps {
  companies: Company[];
  isOpen: boolean;
  onClose: () => void;
  onImportCompanies: (imported: Company[]) => void;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  companies,
  isOpen,
  onClose,
  onImportCompanies,
}) => {
  if (!isOpen) return null;

  const [sheetUrl, setSheetUrl] = useState('');
  const [csvText, setCsvText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedCsv, setCopiedCsv] = useState(false);
  const [importCount, setImportCount] = useState<number | null>(null);

  // Parse CSV text into Company objects
  const handleParseCsv = (rawText: string) => {
    try {
      const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length < 2) return [];

      const headers = lines[0].split(',').map((h) => h.toLowerCase().replace(/[^a-z]/g, ''));
      const newCompanies: Company[] = [];

      for (let i = 1; i < lines.length; i++) {
        // basic regex for CSV splitting
        const cols = lines[i].split(',').map((c) => c.replace(/^["']|["']$/g, '').trim());
        if (!cols[0]) continue;

        const company: Partial<Company> = {
          id: `imp-${Date.now()}-${i}`,
          name: cols[0] || 'Unknown Company',
          country: cols[1] || 'Saudi Arabia',
          city: cols[2] || '',
          email: cols[3] || '',
          emailStatus: 'unverified',
          website: cols[4] || '',
          whatsapp: cols[5] || '',
          phone: cols[6] || '',
          socials: {
            instagram: cols[7] || '',
            facebook: cols[8] || '',
          },
          ministryLicense: cols[9] || '',
          outreachStatus: 'not_contacted',
        };

        company.completenessScore = calculateCompleteness(company);
        newCompanies.push(company as Company);
      }

      return newCompanies;
    } catch (err) {
      console.error('Error parsing CSV:', err);
      return [];
    }
  };

  const handleFetchSheet = async () => {
    if (!sheetUrl) return;
    setIsImporting(true);
    try {
      // Ensure export format csv
      let exportUrl = sheetUrl;
      if (sheetUrl.includes('/edit')) {
        exportUrl = sheetUrl.replace(/\/edit.*$/, '/export?format=csv');
      }

      const res = await fetch(exportUrl);
      const text = await res.text();
      const parsed = handleParseCsv(text);
      if (parsed.length > 0) {
        onImportCompanies(parsed);
        setImportCount(parsed.length);
      }
    } catch (err) {
      alert('Could not fetch Google Sheet CSV automatically. Please copy & paste the CSV content directly below.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleManualCsvImport = () => {
    const parsed = handleParseCsv(csvText);
    if (parsed.length > 0) {
      onImportCompanies(parsed);
      setImportCount(parsed.length);
    } else {
      alert('Please enter valid CSV formatted data with header: Company Name, Country, City, Email, Website, WhatsApp...');
    }
  };

  // Export current companies as CSV
  const exportToCsv = () => {
    const headers = ['Company Name', 'Country', 'City', 'Email', 'Email Status', 'Website', 'WhatsApp', 'Phone', 'Instagram', 'Facebook', 'Saudi License', 'Completeness %', 'Outreach Status', 'AI Notes'];
    const rows = companies.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${(c.country || '').replace(/"/g, '""')}"`,
      `"${(c.city || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${c.emailStatus}"`,
      `"${(c.website || '').replace(/"/g, '""')}"`,
      `"${(c.whatsapp || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.socials.instagram || '').replace(/"/g, '""')}"`,
      `"${(c.socials.facebook || '').replace(/"/g, '""')}"`,
      `"${(c.ministryLicense || '').replace(/"/g, '""')}"`,
      `"${c.completenessScore}"`,
      `"${c.outreachStatus}"`,
      `"${(c.aiNotes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    
    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `NewHaj_Umrah_Companies_Enriched_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const appsScriptCode = `// Google Apps Script to auto-sync Google Sheets with NewHaj Hub AI Agents
function onEdit(e) {
  var sheet = e.source.getActiveSheet();
  var range = e.range;
  var row = range.getRow();
  
  if (row > 1) { // Skip header
    var companyName = sheet.getRange(row, 1).getValue();
    var country = sheet.getRange(row, 2).getValue();
    
    // Call NewHaj Hub API for automated enrichment
    var url = "YOUR_APP_URL/api/enrich";
    var payload = JSON.stringify({
      "companyName": companyName,
      "country": country
    });
    
    var options = {
      "method": "post",
      "contentType": "application/json",
      "payload": payload
    };
    
    try {
      var response = UrlFetchApp.fetch(url, options);
      var result = JSON.parse(response.getContentText());
      if (result.success && result.enrichedData) {
        var d = result.enrichedData;
        if (d.email) sheet.getRange(row, 4).setValue(d.email);
        if (d.website) sheet.getRange(row, 5).setValue(d.website);
        if (d.whatsapp) sheet.getRange(row, 6).setValue(d.whatsapp);
      }
    } catch (err) {
      Logger.log("Enrichment error: " + err);
    }
  }
}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Синхронизация с Google Таблицами и Импорт CSV
              </h3>
              <p className="text-xs text-slate-400">
                Синхронизация базы напрямую с <strong className="text-emerald-300">newhaj.com/umrah-hajj-companies/</strong>
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

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Section 1: Fetch from Google Sheet URL */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-emerald-600" />
              1. Импорт по публичной ссылке Google Таблицы
            </h4>
            <p className="text-xs text-slate-600">
              Вставьте ссылку на вашу Гугл Таблицу ("Доступ всем, у кого есть ссылка"), чтобы загрузить компании напрямую в очередь ИИ-обогащения:
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit#gid=0"
                className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleFetchSheet}
                disabled={isImporting || !sheetUrl}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                {isImporting ? 'Загрузка...' : 'Загрузить Google Таблицу'}
              </button>
            </div>
          </div>

          {/* Section 2: Manual Copy-Paste CSV */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-600" />
              2. Или вставьте данные CSV вручную
            </h4>
            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Название компании, Страна, Город, Email, Сайт, WhatsApp, Телефон&#10;Al Mosafer, Саудовская Аравия, Мекка, info@mosafer.sa, https://mosafer.sa, +966501234567&#10;Tazkia Travel, Индонезия, Джакарта, info@tazkia.co.id, https://tazkia.co.id, +6281234567"
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-mono leading-relaxed"
            />
            <button
              onClick={handleManualCsvImport}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs transition flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Распознать и добавить компании
            </button>
          </div>

          {importCount !== null && (
            <div className="p-3 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Успешно импортировано {importCount} компаний в систему NewHaj Hub!
            </div>
          )}

          {/* Section 3: Export Enriched CSV */}
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-emerald-900 text-xs uppercase tracking-wide">
                3. Скачать обогащенную базу для newhaj.com
              </h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                Экспортируйте все {companies.length} обогащенных компаний с проверенными почтами, WhatsApp и заметками ИИ.
              </p>
            </div>

            <button
              onClick={exportToCsv}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs transition flex items-center gap-2 shrink-0 shadow-md"
            >
              <Download className="w-4 h-4" />
              Скачать файл CSV
            </button>
          </div>

          {/* Section 4: Apps Script snippet */}
          <div className="bg-slate-900 text-slate-200 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                <Code className="w-4 h-4" />
                Код авто-триггера Google Apps Script
              </span>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(appsScriptCode);
                  setCopiedScript(true);
                  setTimeout(() => setCopiedScript(false), 2000);
                }}
                className="text-slate-400 hover:text-white text-xs flex items-center gap-1"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedScript ? 'Скопировано!' : 'Скопировать скрипт'}
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Вставьте этот скрипт в Расширения &gt; Apps Script в вашей Гугл Таблице, чтобы автоматически запускать ИИ-Агентов NewHaj при добавлении новой компании!
            </p>

            <pre className="text-[10px] text-emerald-300 bg-slate-950 p-2.5 rounded border border-slate-800 overflow-x-auto font-mono max-h-36">
              {appsScriptCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
