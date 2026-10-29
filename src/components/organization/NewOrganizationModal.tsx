import React, { useState } from 'react';
import { useOrganization } from '../../context/OrganizationContext';
import { Building2, X, Plus, Globe, DollarSign, MapPin, FileCheck, CheckCircle2 } from 'lucide-react';

interface NewOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewOrganizationModal: React.FC<NewOrganizationModalProps> = ({ isOpen, onClose }) => {
  const { createOrganization } = useOrganization();

  const [name, setName] = useState('');
  const [legalForm, setLegalForm] = useState('Eingetragener Verein (e.V.)');
  const [country, setCountry] = useState('Deutschland');
  const [website, setWebsite] = useState('');
  const [currency, setCurrency] = useState<'EUR' | 'USD' | 'XAF' | 'GBP' | 'CHF'>('EUR');
  const [language, setLanguage] = useState<'de' | 'en' | 'fr'>('de');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createOrganization({
      name: name.trim(),
      legalForm,
      country,
      website: website.trim(),
      defaultCurrency: currency,
      primaryLanguage: language,
      description: description.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-inner">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Neue Organisation / Workspace anlegen</h3>
              <p className="text-xs text-slate-300">
                Eigenständiger, datenisolierter Arbeitsbereich für Ihre NGO oder Stiftung
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 leading-relaxed">
            <span className="font-bold block mb-0.5">Sicher & Datenisoliert:</span>
            In diesem neuen Workspace arbeiten Sie vollkommen unabhängig. Projekte, Budgets und Kontakte anderer Organisationen sind für Sie weder sichtbar noch zugänglich.
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">
              Organisationsname / NGO-Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="z.B. Hope & Solar Foundation International"
              className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5 text-slate-400" /> Rechtsform
              </label>
              <select
                value={legalForm}
                onChange={(e) => setLegalForm(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Eingetragener Verein (e.V.)">Eingetragener Verein (e.V.)</option>
                <option value="Gemeinnützige GmbH (gGmbH)">Gemeinnützige GmbH (gGmbH)</option>
                <option value="Stiftung (Foundation)">Stiftung (Foundation)</option>
                <option value="Non-Governmental Organization (NGO)">NGO / ASBL / Association</option>
                <option value="Sozialunternehmen (Social Enterprise)">Sozialunternehmen</option>
                <option value="Universitäre Initiative">Universitäre Initiative</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Hauptsitz (Land)
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
                placeholder="z.B. Deutschland, Schweiz, Kamerun..."
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Standardwährung
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-semibold"
              >
                <option value="EUR">EUR (€) - Euro</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="XAF">XAF (FCFA) - Central African Franc</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="CHF">CHF (Fr.) - Schweizer Franken</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" /> Primärsprache
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="de">Deutsch (DE)</option>
                <option value="en">English (EN)</option>
                <option value="fr">Français (FR)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-400" /> Offizielle Webseite
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://meine-organisation.org"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              Kurzbeschreibung & Mission (optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Zweck der Organisation, Schwerpunktbereiche..."
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Workspace erstellen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
