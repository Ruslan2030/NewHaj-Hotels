import React from 'react';
import { 
  BookOpen, 
  Cpu, 
  Globe, 
  FileSpreadsheet, 
  Zap, 
  Share2, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  ExternalLink,
  Layers,
  Bot
} from 'lucide-react';

export const ProductionArchitectureGuide: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-lg space-y-3">
        <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full border border-amber-500/30">
          <BookOpen className="w-3.5 h-3.5" />
          Технический План & Дорожная Карта Развертывания
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white">
          Как развернуть систему с десятками ИИ-Агентов для NewHaj.com
        </h2>

        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Это готовое решение и пошаговая архитектура для автоматического сбора, обогащения, проверки емейлов и ведения переговоров с компаниями по Умре и Хаджу для вашего сайта{' '}
          <a href="https://newhaj.com/umrah-hajj-companies/" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline inline-flex items-center">
            newhaj.com/umrah-hajj-companies/ <ExternalLink className="w-3 h-3 ml-1" />
          </a>.
        </p>
      </div>

      {/* 4 Pillars of Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Pillar 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-emerald-600 font-bold text-sm">
            <Bot className="w-5 h-5 text-emerald-600" />
            <span>1. Множество ИИ-Агентов (Gemini 3.6 Flash)</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Вместо одного бота создается <strong>оркестр специализированных агентов</strong>:
          </p>
          <ul className="space-y-1.5 text-slate-700 pl-4 list-disc">
            <li><strong>Research Agent:</strong> ищет официальные сайты, ватсап и лицензии в Google Search Grounding.</li>
            <li><strong>Email Verifier:</strong> делает запрос к DNS MX серверу домена емейла и проверяет доставляемость.</li>
            <li><strong>Social Scraper Agent:</strong> находит аккаунты Instagram, Facebook и профили в соцсетях.</li>
            <li><strong>Outreach Communicator:</strong> генерирует предложения на арабском, английском, русском, турецком и индонезийском.</li>
          </ul>
        </div>

        {/* Pillar 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-teal-600 font-bold text-sm">
            <FileSpreadsheet className="w-5 h-5 text-teal-600" />
            <span>2. Двусторонняя Синхронизация с Google Sheets</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Так как данные на <strong className="text-slate-800">newhaj.com</strong> подтягиваются из Google Таблицы:
          </p>
          <ul className="space-y-1.5 text-slate-700 pl-4 list-disc">
            <li>При появлении новой строки в таблице запускается <strong>Google Apps Script webhook</strong>.</li>
            <li>Webhook отправляет название компании в наш backend API <code className="bg-slate-100 text-slate-800 px-1 rounded">/api/enrich</code>.</li>
            <li>ИИ-Агенты за 3 секунды обогащают данные и записывают найденные сайты/емейлы прямо обратно в Google Таблицу!</li>
          </ul>
        </div>

        {/* Pillar 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-amber-600 font-bold text-sm">
            <Share2 className="w-5 h-5 text-amber-600" />
            <span>3. Автоматизированная Коммуникация (WhatsApp & Email)</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Агенты не просто копят данные, а ведут диалог с туроператорами Хаджа & Умры:
          </p>
          <ul className="space-y-1.5 text-slate-700 pl-4 list-disc">
            <li><strong>WhatsApp Business Webhook:</strong> мгновенная отправка приветственного сообщения с предложением верифицировать аккаунт на newhaj.com.</li>
            <li><strong>Email Dispatch:</strong> отправка персонализированных B2B писем через Resend / SendGrid API.</li>
          </ul>
        </div>

        {/* Pillar 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-purple-600 font-bold text-sm">
            <Layers className="w-5 h-5 text-purple-600" />
            <span>4. Масштабирование на Десятки Агентов (Queue Engine)</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Для параллельной обработки сотен компаний одновременно:
          </p>
          <ul className="space-y-1.5 text-slate-700 pl-4 list-disc">
            <li>Используется воркер-очередь <strong>n8n</strong> или <strong>Node.js BullMQ</strong>.</li>
            <li>Каждый агент работает в отдельном параллельном потоке.</li>
            <li>Успешно обработанные компании автоматически получают статус "Enriched Partner".</li>
          </ul>
        </div>
      </div>

      {/* Step by Step Workflow */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-600" />
          Пошаговый План Реализации Проекта NewHaj Hub
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">1</div>
            <div>
              <strong className="text-slate-900 block text-sm">Запуск этого веб-сервера NewHaj Hub</strong>
              <span className="text-slate-600">Сервер уже готов на Express + React с подключенным Gemini 3.6 Flash и Google Search Grounding API. Вы можете прямо сейчас обогащать компании и экспортировать CSV.</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">2</div>
            <div>
              <strong className="text-slate-900 block text-sm">Импорт Вашей Google Таблицы</strong>
              <span className="text-slate-600">Перейдите во вкладку "Google Таблицы" и вставьте ссылку на вашу Гугл Таблицу. Все компании загрузятся в интерактивную панель управления.</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">3</div>
            <div>
              <strong className="text-slate-900 block text-sm">Запуск ИИ-Агентов</strong>
              <span className="text-slate-600">Нажмите "Запустить ИИ-Обогащение" или воспользуйтесь вкладкой "Центр управления ИИ-Агентами", чтобы запустить агентов на заполнение сайтов, емейлов, соцсетей и лицензий Саудовской Аравии.</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">4</div>
            <div>
              <strong className="text-slate-900 block text-sm">Коммуникация с Туроператорами</strong>
              <span className="text-slate-600">Используйте Генератор Сообщений для отправки персонализированных писем и WhatsApp сообщений на арабском, английском, русском, турецком или индонезийском языках.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
