import React from 'react';
import { 
  Building2, 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  Globe2, 
  FileSpreadsheet, 
  PlusCircle, 
  Share2,
  BookOpen
} from 'lucide-react';
import { Company } from '../types';

interface HeaderProps {
  companies: Company[];
  activeTab: 'database' | 'fleet' | 'outreach' | 'sheets' | 'guide';
  setActiveTab: (tab: 'database' | 'fleet' | 'outreach' | 'sheets' | 'guide') => void;
  onOpenAddModal: () => void;
  onOpenSheetsModal: () => void;
  onRunBatchAI: () => void;
  isProcessingBatch: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  companies,
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenSheetsModal,
  onRunBatchAI,
  isProcessingBatch,
}) => {
  const total = companies.length;
  const enrichedCount = companies.filter((c) => c.completenessScore >= 80).length;
  const validEmailCount = companies.filter((c) => c.emailStatus === 'valid').length;
  const contactedCount = companies.filter((c) => c.outreachStatus !== 'not_contacted').length;

  const enrichedPct = total > 0 ? Math.round((enrichedCount / total) * 100) : 0;
  const validEmailPct = total > 0 ? Math.round((validEmailCount / total) * 100) : 0;

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand info */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-500 p-0.5 flex items-center justify-center shadow-md">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                NewHaj Hub <span className="text-xs bg-emerald-500/20 text-emerald-300 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30">Оркестратор ИИ-Агентов</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>Автоматическое обогащение базы B2B компаний для</span>
              <a 
                href="https://newhaj.com/umrah-hajj-companies/" 
                target="_blank" 
                rel="noreferrer"
                className="text-amber-400 hover:underline inline-flex items-center font-medium"
              >
                newhaj.com/umrah-hajj-companies <Globe2 className="w-3 h-3 ml-1" />
              </a>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRunBatchAI}
            disabled={isProcessingBatch}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition shadow-sm ${
              isProcessingBatch
                ? 'bg-amber-600/50 text-amber-200 cursor-not-allowed animate-pulse'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/30'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${isProcessingBatch ? 'animate-spin' : 'text-amber-300'}`} />
            {isProcessingBatch ? 'Агенты обрабатывают базу...' : 'Запустить ИИ-Обогащение'}
          </button>

          <button
            onClick={onOpenSheetsModal}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Синхронизация с Google Sheets / CSV
          </button>

          <button
            onClick={onOpenAddModal}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
          >
            <PlusCircle className="w-4 h-4 text-slate-300" />
            Добавить компанию
          </button>
        </div>
      </div>

      {/* Metric Counters & Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 pt-2 pb-1">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Tabs */}
          <nav className="flex space-x-1 overflow-x-auto pb-1 scrollbar-none text-xs font-medium">
            <button
              onClick={() => setActiveTab('database')}
              className={`px-3.5 py-2 rounded-md flex items-center gap-2 transition whitespace-nowrap ${
                activeTab === 'database'
                  ? 'bg-slate-800 text-emerald-400 font-semibold border-b-2 border-emerald-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Building2 className="w-4 h-4" />
              База компаний ({total})
            </button>

            <button
              onClick={() => setActiveTab('fleet')}
              className={`px-3.5 py-2 rounded-md flex items-center gap-2 transition whitespace-nowrap ${
                activeTab === 'fleet'
                  ? 'bg-slate-800 text-emerald-400 font-semibold border-b-2 border-emerald-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Bot className="w-4 h-4 text-teal-400" />
              Центр управления ИИ-Агентами
            </button>

            <button
              onClick={() => setActiveTab('outreach')}
              className={`px-3.5 py-2 rounded-md flex items-center gap-2 transition whitespace-nowrap ${
                activeTab === 'outreach'
                  ? 'bg-slate-800 text-emerald-400 font-semibold border-b-2 border-emerald-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              Рассылка и Аутрич
            </button>

            <button
              onClick={() => setActiveTab('sheets')}
              className={`px-3.5 py-2 rounded-md flex items-center gap-2 transition whitespace-nowrap ${
                activeTab === 'sheets'
                  ? 'bg-slate-800 text-emerald-400 font-semibold border-b-2 border-emerald-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Google Таблицы
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3.5 py-2 rounded-md flex items-center gap-2 transition whitespace-nowrap ${
                activeTab === 'guide'
                  ? 'bg-slate-800 text-amber-400 font-semibold border-b-2 border-amber-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              Инструкция и Архитектура
            </button>
          </nav>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-xs text-slate-400 pb-1">
            <div className="flex items-center gap-1.5 bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-800">
              <span className="text-slate-300 font-medium">Обогащенные профили:</span>
              <span className="text-emerald-400 font-bold">{enrichedCount}/{total} ({enrichedPct}%)</span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-slate-300 font-medium">Проверенные Email:</span>
              <span className="text-teal-400 font-bold">{validEmailCount} ({validEmailPct}%)</span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-800">
              <span className="text-slate-300 font-medium">Активный аутрич:</span>
              <span className="text-amber-400 font-bold">{contactedCount}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
