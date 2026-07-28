import React, { useState, useEffect } from 'react';
import { X, Building2, Save, Sparkles } from 'lucide-react';
import { Company } from '../types';
import { calculateCompleteness } from '../data/mockCompanies';

interface CompanyEditModalProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (company: Company) => void;
}

export const CompanyEditModal: React.FC<CompanyEditModalProps> = ({
  company,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<Partial<Company>>({
    name: '',
    country: 'Saudi Arabia',
    city: '',
    email: '',
    emailStatus: 'unverified',
    website: '',
    whatsapp: '',
    phone: '',
    socials: { instagram: '', facebook: '' },
    ministryLicense: '',
    outreachStatus: 'not_contacted',
    aiNotes: '',
  });

  useEffect(() => {
    if (company) {
      setFormData(company);
    } else {
      setFormData({
        id: `c-${Date.now()}`,
        name: '',
        country: 'Saudi Arabia',
        city: '',
        email: '',
        emailStatus: 'unverified',
        website: '',
        whatsapp: '',
        phone: '',
        socials: { instagram: '', facebook: '' },
        ministryLicense: '',
        outreachStatus: 'not_contacted',
        aiNotes: 'New company added manually.',
      });
    }
  }, [company, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const score = calculateCompleteness(formData);
    const updated: Company = {
      ...(formData as Company),
      completenessScore: score,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              {company ? 'Редактировать информацию о компании' : 'Добавить новую туроператорскую компанию'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Название компании *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="например, Al Safa Umrah Travel"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Страна *</label>
              <input
                type="text"
                required
                value={formData.country || ''}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="например, Турция, Узбекистан, Казахстан"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Город</label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="например, Стамбул, Ташкент, Мекка"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Электронная почта (Email)</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="info@company.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Веб-сайт</label>
              <input
                type="text"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://company.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Номер WhatsApp</label>
              <input
                type="text"
                value={formData.whatsapp || ''}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="+966500000000"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Instagram аккаунт</label>
              <input
                type="text"
                value={formData.socials?.instagram || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  socials: { ...formData.socials, instagram: e.target.value }
                })}
                placeholder="@company_hajj"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Номер лицензии МинХадж КСА</label>
              <input
                type="text"
                value={formData.ministryLicense || ''}
                onChange={(e) => setFormData({ ...formData, ministryLicense: e.target.value })}
                placeholder="UMR-12345"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Заметки ИИ и оператора</label>
            <textarea
              rows={3}
              value={formData.aiNotes || ''}
              onChange={(e) => setFormData({ ...formData, aiNotes: e.target.value })}
              placeholder="Заметки о компании..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1.5 transition shadow-sm"
            >
              <Save className="w-4 h-4" />
              Сохранить профиль компании
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
