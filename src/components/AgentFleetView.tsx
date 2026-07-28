import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  Play, 
  Pause, 
  Terminal, 
  Cpu, 
  Globe2, 
  MailCheck, 
  Share2, 
  Filter, 
  Sliders, 
  Activity, 
  ShieldCheck,
  Zap,
  RotateCw
} from 'lucide-react';
import { AgentInfo, AgentLog, Company } from '../types';

interface AgentFleetViewProps {
  companies: Company[];
  logs: AgentLog[];
  onTriggerFullSequence: () => void;
  isProcessing: boolean;
}

export const AgentFleetView: React.FC<AgentFleetViewProps> = ({
  companies,
  logs,
  onTriggerFullSequence,
  isProcessing,
}) => {
  const [concurrency, setConcurrency] = useState(5);
  const [autoVerifyEmail, setAutoVerifyEmail] = useState(true);
  const [autoFindSocials, setAutoFindSocials] = useState(true);

  // Define 5 AI Agents
  const agents: AgentInfo[] = [
    {
      id: 'research_enricher',
      name: 'Агент Альфа: Веб-Исследователь',
      nameRu: 'Поиск контактов и сайтов',
      role: 'Поиск информации в интернете',
      description: 'Анализирует веб-ресурсы через Gemini 3.6 Flash и Google Поиск для нахождения официальных сайтов, номеров WhatsApp, телефонов и номеров лицензий МинХадж КСА.',
      status: isProcessing ? 'running' : 'idle',
      tasksCompleted: companies.filter((c) => c.completenessScore >= 80).length,
      iconName: 'Sparkles',
      modelUsed: 'gemini-3.6-flash',
    },
    {
      id: 'email_verifier',
      name: 'Агент Бета: Валидатор Емейлов',
      nameRu: 'Проверка DNS MX серверов',
      role: 'Проверка доставочности почты',
      description: 'Проверяет синтаксис email, совершает прямые DNS MX запросы к почтовым серверам, фильтрует спам-домены и оценивает реальную доставочность писем.',
      status: isProcessing ? 'running' : 'idle',
      tasksCompleted: companies.filter((c) => c.emailStatus === 'valid').length,
      iconName: 'MailCheck',
      modelUsed: 'Node DNS MX Inspector',
    },
    {
      id: 'social_finder',
      name: 'Агент Гамма: Поисковик Соцсетей',
      nameRu: 'Инстаграм, Facebook и мессенджеры',
      role: 'Поиск цифрового присутствия',
      description: 'Находит официальные аккаунты Instagram (@...), страницы Facebook, профили LinkedIn и проверяет статус WhatsApp Business.',
      status: isProcessing ? 'running' : 'idle',
      tasksCompleted: companies.filter((c) => c.socials.instagram || c.socials.facebook).length,
      iconName: 'Globe2',
      modelUsed: 'gemini-3.6-flash',
    },
    {
      id: 'outreach_communicator',
      name: 'Агент Дельта: Многоязычный Коммуникатор',
      nameRu: 'Составление коммерческих предложений',
      role: 'Агент переговоров и партнерств',
      description: 'Составляет персонализированные предложения о сотрудничестве по Умре/Хаджу на арабском, английском, русском, турецком, индонезийском или урду.',
      status: isProcessing ? 'running' : 'idle',
      tasksCompleted: companies.filter((c) => c.outreachStatus !== 'not_contacted').length,
      iconName: 'Share2',
      modelUsed: 'gemini-3.6-flash',
    },
    {
      id: 'crm_classifier',
      name: 'Агент Эпсилон: Классификатор & Синхронизатор CRM',
      nameRu: 'Синхронизация с Google Таблицами',
      role: 'Оценка лидов и экспортирование',
      description: 'Оценивает готовность туроператоров к партнерству, классифицирует статус ответов и форматирует данные для автоматической синхронизации с Google Таблицами.',
      status: 'idle',
      tasksCompleted: companies.length,
      iconName: 'Cpu',
      modelUsed: 'NewHaj Core Engine',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Hero Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-400 via-teal-500 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30">
              <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              Автономная система оркестрации ИИ-Агентов
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Центр управления ИИ-Агентами (Десятки ИИ-Агентов)
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Управляйте автономными специализированными агентами, параллельно обрабатывающими вашу базу операторов Умры и Хаджа. Агенты ищут контакты в интернете, проверяют записи почтовых серверов DNS MX, находят соцсети и генерируют коммерческие предложения.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onTriggerFullSequence}
              disabled={isProcessing}
              className={`px-5 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5 transition shadow-lg ${
                isProcessing
                  ? 'bg-amber-500 text-slate-950 font-bold animate-pulse cursor-wait'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-emerald-900/40'
              }`}
            >
              {isProcessing ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  Агенты выполняют последовательность...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current text-slate-950" />
                  Запустить ПОЛНЫЙ цикл работы агентов
                </>
              )}
            </button>
          </div>
        </div>

        {/* Fleet Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block">Активные Агенты</span>
            <span className="text-lg font-bold text-white flex items-center gap-1.5 mt-0.5">
              <Bot className="w-4 h-4 text-emerald-400" />
              5 Специализированных Агентов
            </span>
          </div>

          <div>
            <span className="text-slate-400 block">Обогащено в базе</span>
            <span className="text-lg font-bold text-emerald-400 mt-0.5 block">
              {companies.filter((c) => c.completenessScore >= 80).length} / {companies.length} ({Math.round((companies.filter((c) => c.completenessScore >= 80).length / (companies.length || 1)) * 100)}%)
            </span>
          </div>

          <div>
            <span className="text-slate-400 block">Проверено Email (MX)</span>
            <span className="text-lg font-bold text-teal-400 mt-0.5 block">
              {companies.filter((c) => c.emailStatus === 'valid').length} Валидных
            </span>
          </div>

          <div>
            <span className="text-slate-400 block">Параллельные потоки</span>
            <span className="text-lg font-bold text-amber-400 mt-0.5 block">
              {concurrency} Потоков обработки
            </span>
          </div>
        </div>
      </div>

      {/* Agents Grid & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Cards (2 Columns on Large Screens) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-600" />
            Модули Агентов ({agents.length})
          </h3>

          <div className="space-y-3">
            {agents.map((agent) => {
              return (
                <div
                  key={agent.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2.5 rounded-xl bg-slate-900 text-emerald-400 border border-slate-800 shrink-0 mt-0.5">
                      {agent.id === 'research_enricher' && <Sparkles className="w-5 h-5 text-amber-400" />}
                      {agent.id === 'email_verifier' && <MailCheck className="w-5 h-5 text-teal-400" />}
                      {agent.id === 'social_finder' && <Globe2 className="w-5 h-5 text-sky-400" />}
                      {agent.id === 'outreach_communicator' && <Share2 className="w-5 h-5 text-emerald-400" />}
                      {agent.id === 'crm_classifier' && <Cpu className="w-5 h-5 text-purple-400" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{agent.name}</h4>
                        <span className="text-[11px] text-slate-500 font-medium">({agent.nameRu})</span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1 leading-normal max-w-xl">
                        {agent.description}
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 font-mono">
                        <span>Движок: <strong className="text-slate-700">{agent.modelUsed}</strong></span>
                        <span>•</span>
                        <span>Обработано: <strong className="text-emerald-700">{agent.tasksCompleted} записей</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        agent.status === 'running'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${agent.status === 'running' ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
                      {agent.status === 'running' ? 'Работает' : 'В ожидании'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fleet Controls Config */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-600" />
              Конфигурация флота и параллельные потоки
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Параллельные потоки ({concurrency} воркеров)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={concurrency}
                  onChange={(e) => setConcurrency(parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <span className="text-[11px] text-slate-400">Определяет количество компаний, обрабатываемых одновременно.</span>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoVerifyEmail}
                    onChange={(e) => setAutoVerifyEmail(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Авто-проверка DNS MX при нахождении email
                </label>

                <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoFindSocials}
                    onChange={(e) => setAutoFindSocials(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Авто-поиск профилей Instagram & Facebook
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Real-Time Agent Logs Console */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-700" />
            Логи консоли агентов в реальном времени
          </h3>

          <div className="bg-slate-950 text-slate-200 rounded-xl p-4 font-mono text-xs h-[520px] overflow-y-auto border border-slate-800 space-y-2.5 shadow-inner">
            {logs.length === 0 ? (
              <div className="text-slate-500 italic text-center pt-20">
                Консоль агентов молчит. Нажмите "Запустить ИИ-Обогащение" или "Запустить ПОЛНЫЙ цикл", чтобы увидеть работу агентов в реальном времени.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="border-b border-slate-900 pb-2 space-y-0.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="text-emerald-400 font-semibold">{log.agentName}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString('ru-RU')}</span>
                  </div>
                  <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                    <span className="text-amber-400">[{log.companyName}]</span>
                    <span>{log.action}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-normal pl-2 border-l-2 border-slate-800">
                    {log.details}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
