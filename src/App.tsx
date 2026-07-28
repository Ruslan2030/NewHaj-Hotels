import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CompanyTable } from './components/CompanyTable';
import { AgentFleetView } from './components/AgentFleetView';
import { OutreachModal } from './components/OutreachModal';
import { GoogleSheetsSyncModal } from './components/GoogleSheetsSyncModal';
import { CompanyEditModal } from './components/CompanyEditModal';
import { ProductionArchitectureGuide } from './components/ProductionArchitectureGuide';
import { initialCompanies, calculateCompleteness } from './data/mockCompanies';
import { Company, AgentLog, EmailStatus, OutreachStatus } from './types';
import { Bot, Sparkles, CheckCircle2, FileSpreadsheet, Building2, Send } from 'lucide-react';

export default function App() {
  // Load initial companies from localStorage or default dataset
  const [companies, setCompanies] = useState<Company[]>(() => {
    try {
      const saved = localStorage.getItem('newhaj_companies_db_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed loading from localStorage:', e);
    }
    return initialCompanies;
  });

  const [activeTab, setActiveTab] = useState<'database' | 'fleet' | 'outreach' | 'sheets' | 'guide'>('database');
  const [logs, setLogs] = useState<AgentLog[]>([]);
  
  // Modals & Drawers State
  const [outreachCompany, setOutreachCompany] = useState<Company | null>(null);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);

  // Processing indicators
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [isEnrichingMap, setIsEnrichingMap] = useState<Record<string, boolean>>({});
  const [isVerifyingEmailMap, setIsVerifyingEmailMap] = useState<Record<string, boolean>>({});

  // Persist companies to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('newhaj_companies_db_v1', JSON.stringify(companies));
    } catch (e) {
      console.error('Failed saving to localStorage:', e);
    }
  }, [companies]);

  // Helper to add agent logs
  const addLog = (
    agentId: AgentLog['agentId'],
    agentName: string,
    companyName: string,
    action: string,
    details: string,
    type: AgentLog['type'] = 'info'
  ) => {
    const newLog: AgentLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      agentId,
      agentName,
      companyName,
      action,
      details,
      type,
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 99)]); // keep last 100 logs
  };

  // 1. Single Company AI Enrichment handler (Research Agent)
  const handleEnrichSingle = async (company: Company) => {
    setIsEnrichingMap((prev) => ({ ...prev, [company.id]: true }));
    addLog(
      'research_enricher',
      'Research Agent Alpha',
      company.name,
      'Initiating Web Research',
      `Searching official web, WhatsApp, and Saudi Ministry licenses for ${company.name} in ${company.country}...`
    );

    try {
      const res = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: company.name,
          country: company.country,
          currentEmail: company.email,
          currentWebsite: company.website,
          currentWhatsapp: company.whatsapp,
        }),
      });

      const data = await res.json();
      if (data.success && data.enrichedData) {
        const d = data.enrichedData;

        setCompanies((prev) =>
          prev.map((c) => {
            if (c.id !== company.id) return c;

            const updated: Company = {
              ...c,
              website: d.website || c.website,
              email: d.email || c.email,
              whatsapp: d.whatsapp || c.whatsapp,
              phone: d.phone || c.phone,
              city: d.city || c.city,
              socials: {
                instagram: d.instagram || c.socials.instagram,
                facebook: d.facebook || c.socials.facebook,
              },
              ministryLicense: d.ministryLicense || c.ministryLicense,
              aiNotes: d.aiNotes || c.aiNotes,
              lastEnrichedAt: new Date().toISOString(),
            };

            updated.completenessScore = calculateCompleteness(updated);
            return updated;
          })
        );

        addLog(
          'research_enricher',
          'Research Agent Alpha',
          company.name,
          'Profile Enriched Successfully',
          `Recovered Website: ${d.website || 'N/A'}, Email: ${d.email || 'N/A'}, WhatsApp: ${d.whatsapp || 'N/A'}, License: ${d.ministryLicense || 'N/A'}. Confidence: ${d.confidenceScore || 85}%.`,
          'success'
        );

        // Auto trigger email verification if email discovered
        if (d.email && d.email !== company.email) {
          handleVerifyEmailSingle({ ...company, email: d.email });
        }
      }
    } catch (err: any) {
      console.error('Enrichment failed:', err);
      addLog(
        'research_enricher',
        'Research Agent Alpha',
        company.name,
        'Enrichment Notice',
        `Partial web search completed for ${company.name}. Retaining existing fields.`,
        'warning'
      );
    } finally {
      setIsEnrichingMap((prev) => ({ ...prev, [company.id]: false }));
    }
  };

  // 2. Single Company Email Verification handler (Email Verifier Agent)
  const handleVerifyEmailSingle = async (company: Company) => {
    if (!company.email) return;

    setIsVerifyingEmailMap((prev) => ({ ...prev, [company.id]: true }));
    addLog(
      'email_verifier',
      'Email Verifier Agent Beta',
      company.name,
      'Verifying DNS MX Records',
      `Performing DNS MX host lookup and format check for email: ${company.email}...`
    );

    try {
      const res = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: company.email }),
      });

      const data = await res.json();
      const newStatus: EmailStatus = data.valid ? 'valid' : 'invalid';

      setCompanies((prev) =>
        prev.map((c) => {
          if (c.id !== company.id) return c;
          return {
            ...c,
            emailStatus: newStatus,
            emailMxValid: data.valid,
          };
        })
      );

      addLog(
        'email_verifier',
        'Email Verifier Agent Beta',
        company.name,
        data.valid ? 'Email DNS MX Verified' : 'Email Issue Found',
        data.reason || `Verification complete. Status: ${newStatus.toUpperCase()}`,
        data.valid ? 'success' : 'warning'
      );
    } catch (err) {
      console.error('Email verification error:', err);
      addLog(
        'email_verifier',
        'Email Verifier Agent Beta',
        company.name,
        'Verification Skipped',
        'DNS check server timeout or invalid format.',
        'error'
      );
    } finally {
      setIsVerifyingEmailMap((prev) => ({ ...prev, [company.id]: false }));
    }
  };

  // 3. Batch AI Processing across incomplete or selected companies
  const handleRunBatchAI = async () => {
    setIsProcessingBatch(true);
    addLog(
      'research_enricher',
      'Fleet Orchestration Engine',
      'System',
      'Batch Fleet Sequence Started',
      'Scanning database for incomplete agency profiles (<80% completeness score)...'
    );

    const targets = companies.filter((c) => c.completenessScore < 80);
    if (targets.length === 0) {
      addLog(
        'research_enricher',
        'Fleet Orchestration Engine',
        'System',
        'Fleet Scan Complete',
        'All companies in current database are already fully enriched (80%+ completeness score)!',
        'success'
      );
      setIsProcessingBatch(false);
      return;
    }

    for (const target of targets) {
      await handleEnrichSingle(target);
      // Small pause between queue items
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    setIsProcessingBatch(false);
    addLog(
      'crm_classifier',
      'Fleet Orchestration Engine',
      'System',
      'Batch Sequence Finished',
      `Processed ${targets.length} agency records through Gemini AI Agents!`,
      'success'
    );
  };

  // Batch action dispatcher from table selection
  const handleBatchAction = async (action: 'enrich' | 'verify_email' | 'outreach', selectedIds: string[]) => {
    const selectedCompanies = companies.filter((c) => selectedIds.includes(c.id));
    if (action === 'enrich') {
      setIsProcessingBatch(true);
      for (const comp of selectedCompanies) {
        await handleEnrichSingle(comp);
      }
      setIsProcessingBatch(false);
    } else if (action === 'verify_email') {
      for (const comp of selectedCompanies) {
        if (comp.email) await handleVerifyEmailSingle(comp);
      }
    } else if (action === 'outreach') {
      if (selectedCompanies.length > 0) {
        setOutreachCompany(selectedCompanies[0]);
      }
    }
  };

  // Company management CRUD
  const handleSaveCompany = (updated: Company) => {
    setCompanies((prev) => {
      const exists = prev.some((c) => c.id === updated.id);
      if (exists) {
        return prev.map((c) => (c.id === updated.id ? updated : c));
      } else {
        return [updated, ...prev];
      }
    });
    addLog(
      'crm_classifier',
      'CRM Classifier Agent',
      updated.name,
      'Company Record Updated',
      `Updated company information for ${updated.name} (${updated.country}).`
    );
  };

  const handleDeleteCompany = (id: string) => {
    const comp = companies.find((c) => c.id === id);
    if (confirm(`Are you sure you want to delete ${comp?.name || 'this company'}?`)) {
      setCompanies((prev) => prev.filter((c) => c.id !== id));
      if (comp) {
        addLog('crm_classifier', 'CRM Classifier Agent', comp.name, 'Company Deleted', `Removed ${comp.name} from database.`);
      }
    }
  };

  const handleUpdateOutreachStatus = (companyId: string, status: OutreachStatus, msgDetails?: any) => {
    setCompanies((prev) =>
      prev.map((c) => {
        if (c.id !== companyId) return c;
        return {
          ...c,
          outreachStatus: status,
          lastMessageSent: msgDetails || c.lastMessageSent,
        };
      })
    );
    const target = companies.find((c) => c.id === companyId);
    if (target) {
      addLog(
        'outreach_communicator',
        'Outreach Agent Delta',
        target.name,
        'Status Updated',
        `Updated outreach status to "${status.toUpperCase()}" for ${target.name}.`,
        'success'
      );
    }
  };

  const handleImportCompanies = (importedList: Company[]) => {
    setCompanies((prev) => [...importedList, ...prev]);
    addLog(
      'crm_classifier',
      'CRM Classifier Agent',
      'Google Sheets Import',
      'Imported Companies',
      `Successfully loaded ${importedList.length} companies into active NewHaj database.`,
      'success'
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {/* Top Header & Navigation Bar */}
      <Header
        companies={companies}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setEditCompany(null);
          setIsEditModalOpen(true);
        }}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        onRunBatchAI={handleRunBatchAI}
        isProcessingBatch={isProcessingBatch}
      />

      {/* Main Container View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Tab 1: Interactive Company Database */}
        {activeTab === 'database' && (
          <CompanyTable
            companies={companies}
            onEnrichSingle={handleEnrichSingle}
            onVerifyEmailSingle={handleVerifyEmailSingle}
            onOpenOutreach={(company) => setOutreachCompany(company)}
            onEditCompany={(company) => {
              setEditCompany(company);
              setIsEditModalOpen(true);
            }}
            onDeleteCompany={handleDeleteCompany}
            onBatchAction={handleBatchAction}
            isEnrichingMap={isEnrichingMap}
            isVerifyingEmailMap={isVerifyingEmailMap}
          />
        )}

        {/* Tab 2: AI Agent Fleet Control Center */}
        {activeTab === 'fleet' && (
          <AgentFleetView
            companies={companies}
            logs={logs}
            onTriggerFullSequence={handleRunBatchAI}
            isProcessing={isProcessingBatch}
          />
        )}

        {/* Tab 3: Outreach & Communication Center */}
        {activeTab === 'outreach' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Send className="w-5 h-5 text-emerald-600" />
                  Центр коммуникаций и рассылки предложений
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Управляйте многоязычными драфтами коммерческих предложений, сообщениями в WhatsApp и перепиской с операторами Умры и Хаджа.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-emerald-300 transition space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{company.name}</h4>
                      <span className="text-[11px] font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                        {company.country}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-0.5">
                      <div>Email: {company.email || <span className="text-rose-500 italic">Отсутствует</span>}</div>
                      <div>WhatsApp: {company.whatsapp || company.phone || <span className="text-slate-400 italic">Отсутствует</span>}</div>
                      <div>Статус: <strong className="text-emerald-700 font-semibold uppercase">{company.outreachStatus === 'not_contacted' ? 'Не связывались' : company.outreachStatus === 'sent' ? 'Отправлено' : company.outreachStatus === 'responded' ? 'Ответили' : company.outreachStatus}</strong></div>
                    </div>
                  </div>

                  <button
                    onClick={() => setOutreachCompany(company)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Открыть генератор сообщений
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Google Sheets Sync */}
        {activeTab === 'sheets' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  Синхронизация с Google Таблицами и Импорт CSV
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Экспортируйте обогащенные данные или синхронизируйте базу с Google Таблицей для <strong className="text-emerald-700">newhaj.com/umrah-hajj-companies/</strong>
                </p>
              </div>

              <button
                onClick={() => setIsSheetsModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-500 transition"
              >
                Открыть Импортер Google Таблиц
              </button>
            </div>

            <GoogleSheetsSyncModal
              companies={companies}
              isOpen={true} // Embedded view in tab
              onClose={() => setActiveTab('database')}
              onImportCompanies={handleImportCompanies}
            />
          </div>
        )}

        {/* Tab 5: Production Setup Guide */}
        {activeTab === 'guide' && <ProductionArchitectureGuide />}
      </main>

      {/* Modals */}
      {outreachCompany && (
        <OutreachModal
          company={outreachCompany}
          onClose={() => setOutreachCompany(null)}
          onUpdateStatus={handleUpdateOutreachStatus}
        />
      )}

      {isEditModalOpen && (
        <CompanyEditModal
          company={editCompany}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditCompany(null);
          }}
          onSave={handleSaveCompany}
        />
      )}

      {isSheetsModalOpen && (
        <GoogleSheetsSyncModal
          companies={companies}
          isOpen={isSheetsModalOpen}
          onClose={() => setIsSheetsModalOpen(false)}
          onImportCompanies={handleImportCompanies}
        />
      )}
    </div>
  );
}
