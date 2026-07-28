import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Globe, 
  Mail, 
  Phone, 
  MessageSquare, 
  ExternalLink, 
  Instagram, 
  Facebook, 
  Edit, 
  Trash2, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Send,
  Building2,
  Share2,
  Check
} from 'lucide-react';
import { Company, EmailStatus, OutreachStatus } from '../types';

interface CompanyTableProps {
  companies: Company[];
  onEnrichSingle: (company: Company) => void;
  onVerifyEmailSingle: (company: Company) => void;
  onOpenOutreach: (company: Company) => void;
  onEditCompany: (company: Company) => void;
  onDeleteCompany: (id: string) => void;
  onBatchAction: (action: 'enrich' | 'verify_email' | 'outreach', selectedIds: string[]) => void;
  isEnrichingMap: Record<string, boolean>;
  isVerifyingEmailMap: Record<string, boolean>;
}

export const CompanyTable: React.FC<CompanyTableProps> = ({
  companies,
  onEnrichSingle,
  onVerifyEmailSingle,
  onOpenOutreach,
  onEditCompany,
  onDeleteCompany,
  onBatchAction,
  isEnrichingMap,
  isVerifyingEmailMap,
}) => {
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [completenessFilter, setCompletenessFilter] = useState('all');
  const [emailFilter, setEmailFilter] = useState('all');
  const [outreachFilter, setOutreachFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Extract unique countries
  const countries = Array.from(new Set(companies.map((c) => c.country).filter(Boolean))).sort();

  // Filter companies
  const filtered = companies.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.country && c.country.toLowerCase().includes(search.toLowerCase())) ||
      (c.city && c.city.toLowerCase().includes(search.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.phone && c.phone.includes(search)) ||
      (c.whatsapp && c.whatsapp.includes(search));

    const matchesCountry = countryFilter === 'all' || c.country === countryFilter;
    
    const matchesCompleteness = 
      completenessFilter === 'all' ||
      (completenessFilter === 'incomplete' && c.completenessScore < 80) ||
      (completenessFilter === 'complete' && c.completenessScore >= 80);

    const matchesEmail = 
      emailFilter === 'all' ||
      c.emailStatus === emailFilter;

    const matchesOutreach = 
      outreachFilter === 'all' ||
      c.outreachStatus === outreachFilter;

    return matchesSearch && matchesCountry && matchesCompleteness && matchesEmail && matchesOutreach;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((c) => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getCompletenessBadge = (score: number) => {
    if (score >= 90) return <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded text-xs">Заполнено ({score}%)</span>;
    if (score >= 60) return <span className="bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded text-xs">Частично ({score}%)</span>;
    return <span className="bg-rose-100 text-rose-800 font-semibold px-2 py-0.5 rounded text-xs">Низкое ({score}%)</span>;
  };

  const getEmailBadge = (status: EmailStatus, mxValid?: boolean) => {
    switch (status) {
      case 'valid':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-xs font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            MX Валиден
          </span>
        );
      case 'invalid':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-xs font-medium">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            Недействителен
          </span>
        );
      case 'checking':
        return (
          <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded text-xs font-medium animate-pulse">
            <Clock className="w-3 h-3 text-sky-600" />
            Проверка MX...
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded text-xs font-medium">
            Не проверен
          </span>
        );
    }
  };

  const getOutreachBadge = (status: OutreachStatus) => {
    switch (status) {
      case 'partner_onboarded':
        return <span className="bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full text-xs">Партнер зарегистрирован</span>;
      case 'replied':
        return <span className="bg-teal-100 text-teal-800 font-semibold px-2 py-0.5 rounded-full text-xs">Получен ответ</span>;
      case 'sent':
      case 'opened':
        return <span className="bg-sky-100 text-sky-800 font-semibold px-2 py-0.5 rounded-full text-xs">Письмо отправлено</span>;
      case 'drafted':
        return <span className="bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full text-xs">Черновик готов</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full text-xs">Не связывались</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск компании по названию, стране, email или телефону..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Country filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-medium focus:outline-none"
            >
              <option value="all">Все страны ({countries.length})</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Completeness filter */}
          <div className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs">
            <select
              value={completenessFilter}
              onChange={(e) => setCompletenessFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-medium focus:outline-none"
            >
              <option value="all">Все профили</option>
              <option value="incomplete">Неполные (&lt;80%)</option>
              <option value="complete">Обогащенные (&ge;80%)</option>
            </select>
          </div>

          {/* Email MX Status filter */}
          <div className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs">
            <select
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-medium focus:outline-none"
            >
              <option value="all">Все Email</option>
              <option value="valid">MX Валидные</option>
              <option value="unverified">Непроверенные</option>
              <option value="invalid">Недействительные</option>
            </select>
          </div>

          {/* Outreach filter */}
          <div className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs">
            <select
              value={outreachFilter}
              onChange={(e) => setOutreachFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-medium focus:outline-none"
            >
              <option value="all">Все статусы связи</option>
              <option value="not_contacted">Не связывались</option>
              <option value="sent">Письмо отправлено</option>
              <option value="replied">Получен ответ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Batch Actions Bar (when selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-emerald-900 text-white p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md animate-fade-in">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold bg-emerald-800 px-2.5 py-1 rounded-md">Выбрано компаний: {selectedIds.length}</span>
            <span className="text-emerald-200">Выберите действие ИИ-Агентов для групповой обработки:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onBatchAction('enrich', selectedIds)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Обогатить (Research Agent)
            </button>

            <button
              onClick={() => onBatchAction('verify_email', selectedIds)}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Mail className="w-3.5 h-3.5 text-white" />
              Проверить DNS MX Email
            </button>

            <button
              onClick={() => onBatchAction('outreach', selectedIds)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Share2 className="w-3.5 h-3.5 text-white" />
              Создать МНОГОЯЗЫЧНУЮ рассылку
            </button>
          </div>
        </div>
      )}

      {/* Main Companies Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.length === filtered.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th className="p-3 min-w-[200px]">Название компании</th>
                <th className="p-3">Страна / Город</th>
                <th className="p-3">Email и статус</th>
                <th className="p-3">Сайт и Соцсети</th>
                <th className="p-3">WhatsApp / Телефон</th>
                <th className="p-3 text-center">Заполненность</th>
                <th className="p-3">Статус связи</th>
                <th className="p-3 text-right">Действия Агентов</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Компания не найдена по выбранным фильтрам.
                  </td>
                </tr>
              ) : (
                filtered.map((company) => {
                  const isSelected = selectedIds.includes(company.id);
                  const isExpanded = expandedId === company.id;
                  const isEnriching = isEnrichingMap[company.id];
                  const isVerifying = isVerifyingEmailMap[company.id];

                  return (
                    <React.Fragment key={company.id}>
                      <tr
                        className={`hover:bg-slate-50/80 transition ${
                          isSelected ? 'bg-emerald-50/40' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(company.id)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        </td>

                        {/* Name & License */}
                        <td className="p-3">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : company.id)}
                              className="text-slate-400 hover:text-slate-700"
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                            <span>{company.name}</span>
                          </div>
                          {company.ministryLicense && (
                            <div className="text-[10px] text-emerald-700 font-mono flex items-center gap-1 mt-0.5">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              Лицензия: {company.ministryLicense}
                            </div>
                          )}
                        </td>

                        {/* Country / City */}
                        <td className="p-3">
                          <span className="font-medium text-slate-800">{company.country}</span>
                          {company.city && <span className="text-slate-400 text-[11px] block">{company.city}</span>}
                        </td>

                        {/* Email & Status */}
                        <td className="p-3">
                          {company.email ? (
                            <div className="space-y-1">
                              <div className="truncate max-w-[160px] text-slate-800 font-mono text-[11px]" title={company.email}>
                                {company.email}
                              </div>
                              {getEmailBadge(company.emailStatus, company.emailMxValid)}
                            </div>
                          ) : (
                            <span className="text-rose-400 italic font-mono text-[11px]">Email отсутствует</span>
                          )}
                        </td>

                        {/* Website & Socials */}
                        <td className="p-3">
                          <div className="space-y-1">
                            {company.website ? (
                              <a
                                href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-600 hover:underline inline-flex items-center gap-1 text-[11px] font-medium"
                              >
                                <Globe className="w-3 h-3" />
                                {company.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Сайт не указан</span>
                            )}

                            {/* Social icons */}
                            <div className="flex items-center gap-1.5 text-slate-400">
                              {company.socials.instagram && (
                                <span title={company.socials.instagram} className="text-pink-600">
                                  <Instagram className="w-3 h-3" />
                                </span>
                              )}
                              {company.socials.facebook && (
                                <span title={company.socials.facebook} className="text-blue-600">
                                  <Facebook className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* WhatsApp / Phone */}
                        <td className="p-3">
                          <div className="space-y-0.5">
                            {company.whatsapp ? (
                              <a
                                href={`https://wa.me/${company.whatsapp.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-teal-700 font-medium hover:underline inline-flex items-center gap-1 text-[11px]"
                              >
                                <MessageSquare className="w-3 h-3 text-teal-600" />
                                {company.whatsapp}
                              </a>
                            ) : company.phone ? (
                              <span className="text-slate-600 inline-flex items-center gap-1 text-[11px]">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {company.phone}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Нет телефона/WA</span>
                            )}
                          </div>
                        </td>

                        {/* Profile Completeness */}
                        <td className="p-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {getCompletenessBadge(company.completenessScore)}
                            <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  company.completenessScore >= 80
                                    ? 'bg-emerald-500'
                                    : company.completenessScore >= 50
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${company.completenessScore}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Outreach Status */}
                        <td className="p-3">
                          {getOutreachBadge(company.outreachStatus)}
                        </td>

                        {/* Quick AI Action Buttons */}
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* AI Enrich Button */}
                            <button
                              onClick={() => onEnrichSingle(company)}
                              disabled={isEnriching}
                              title="Исследовать и автоматически заполнить данные с помощью Gemini 3.6 Flash AI"
                              className={`p-1.5 rounded-lg border text-xs font-medium transition ${
                                isEnriching
                                  ? 'bg-amber-100 text-amber-700 border-amber-300 animate-spin'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              }`}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>

                            {/* Verify Email DNS MX Button */}
                            <button
                              onClick={() => onVerifyEmailSingle(company)}
                              disabled={isVerifying || !company.email}
                              title={company.email ? 'Проверить DNS MX записи email' : 'Email отсутствует'}
                              className={`p-1.5 rounded-lg border text-xs font-medium transition ${
                                !company.email
                                  ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200'
                                  : isVerifying
                                  ? 'bg-sky-100 text-sky-700 border-sky-300 animate-pulse'
                                  : 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
                              }`}
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>

                            {/* Draft Outreach Button */}
                            <button
                              onClick={() => onOpenOutreach(company)}
                              title="Создать многоязычное предложение (Email и WhatsApp)"
                              className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 text-xs font-medium transition"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit company */}
                            <button
                              onClick={() => onEditCompany(company)}
                              title="Редактировать поля компании"
                              className="p-1.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete company */}
                            <button
                              onClick={() => onDeleteCompany(company.id)}
                              title="Удалить компанию"
                              className="p-1.5 rounded-lg bg-slate-50 text-rose-600 border border-slate-200 hover:bg-rose-50 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 border-b border-slate-200">
                          <td colSpan={9} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                              {/* Contact & Socials */}
                              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                                <span className="font-semibold text-slate-800 block border-b pb-1">Цифровое присутствие и ссылки</span>
                                <div><strong className="text-slate-600">Сайт:</strong> {company.website || 'Не указан'}</div>
                                <div><strong className="text-slate-600">Instagram:</strong> {company.socials.instagram || 'Не найден'}</div>
                                <div><strong className="text-slate-600">Facebook:</strong> {company.socials.facebook || 'Не найден'}</div>
                                <div><strong className="text-slate-600">Лицензия МинХадж КСА:</strong> {company.ministryLicense || 'Не проверено'}</div>
                              </div>

                              {/* AI Research Notes */}
                              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5 md:col-span-2">
                                <span className="font-semibold text-slate-800 block border-b pb-1 flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                  Аналитика и заметки ИИ-Агента
                                </span>
                                <p className="text-slate-600 leading-relaxed italic">
                                  {company.aiNotes || 'Заметки агента пока отсутствуют. Нажмите кнопку со звездочками, чтобы запустить Research Agent на Gemini.'}
                                </p>
                                {company.lastEnrichedAt && (
                                  <div className="text-[10px] text-slate-400 mt-2">
                                    Последнее обогащение: {new Date(company.lastEnrichedAt).toLocaleString('ru-RU')}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
