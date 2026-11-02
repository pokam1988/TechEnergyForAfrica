import React, { useState } from 'react';
import { useOrganization } from '../../context/OrganizationContext';
import { PRESET_NGO_LOGOS, TEFA_OFFICIAL_SVG_LOGO } from '../../data/defaultLogos';
import { Organization, OrganizationLetterhead } from '../../types';
import {
  Building2,
  Image,
  Upload,
  Globe,
  Mail,
  Phone,
  MapPin,
  FileCheck,
  CreditCard,
  UserCheck,
  Check,
  X,
  Palette,
  Stamp,
  Sparkles,
  Eye,
} from 'lucide-react';

interface OrganizationBrandingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrganizationBrandingModal: React.FC<OrganizationBrandingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeOrganization, updateOrganization } = useOrganization();

  // Local state initialized with current active organization data
  const [name, setName] = useState(activeOrganization.name || '');
  const [legalForm, setLegalForm] = useState(activeOrganization.legalForm || '');
  const [website, setWebsite] = useState(activeOrganization.website || '');
  const [logoUrl, setLogoUrl] = useState(activeOrganization.logoUrl || '');
  const [description, setDescription] = useState(activeOrganization.description || '');

  const [letterhead, setLetterhead] = useState<OrganizationLetterhead>(
    activeOrganization.letterhead || {
      addressStreet: 'Kottbusser Damm 79',
      addressPostalCode: '10967',
      addressCity: 'Berlin',
      addressCountry: activeOrganization.country || 'Deutschland',
      phone: '+49 30 555 789 20',
      email: 'info@techenergyforafrica.org',
      registrationCourt: 'Amtsgericht Berlin-Charlottenburg, VR 38920 B',
      taxId: 'StNr. 27/653/55123 • Finanzamt für Körperschaften I Berlin',
      bankName: 'GLS Gemeinschaftsbank eG Berlin',
      iban: 'DE89 4306 0967 1144 5500 00',
      bic: 'GENODEM1GLS',
      signatory1Name: 'Dr. Frederic Pokam',
      signatory1Role: 'Vorstandsvorsitzender',
      signatory2Name: 'Marc Tagne',
      signatory2Role: 'Finanzvorstand & Projektleitung',
      primaryBrandColor: '#059669',
      officialTagline: 'Gemeinnütziger Verein zur Förderung von Bildung & Erneuerbaren Energien',
      digitalStampText: `${activeOrganization.name} • Offizielles Dokument`,
    }
  );

  const [activeTab, setActiveTab] = useState<'logo' | 'letterhead' | 'signatories' | 'preview'>('logo');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setLogoUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const updated: Organization = {
      ...activeOrganization,
      name,
      legalForm,
      website,
      logoUrl,
      description,
      letterhead,
    };

    updateOrganization(updated);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                Organisations-Branding & Briefkopf
              </h3>
              <p className="text-xs text-slate-500">
                Logo, amtliche Briefkopfdaten & Druck-Vorlagen für {activeOrganization.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('logo')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'logo'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Image className="w-4 h-4 text-emerald-400" />
            <span>1. Logo & Farben</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('letterhead')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'letterhead'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>2. Anschrift, Register & Bank</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('signatories')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'signatories'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>3. Unterzeichner (Vorstand)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'preview'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>4. Briefkopf-Vorschau</span>
          </button>
        </div>

        {/* Tab 1: Logo & Visual Identity */}
        {activeTab === 'logo' && (
          <div className="flex-1 overflow-y-auto space-y-5 text-xs">
            {/* Current Logo Display */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="font-bold text-slate-800 text-xs">Aktuelles Organisations-Logo:</span>
                <p className="text-slate-500 text-[11px]">
                  Erscheint auf allen offiziellen Projektanträgen, Dossiers, Budgets und Berichten.
                </p>
              </div>

              <div className="p-3 bg-white border border-slate-300 rounded-lg shadow-xs flex items-center justify-center min-w-[200px] max-w-xs h-20">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="max-h-14 max-w-full object-contain" />
                ) : (
                  <div className="text-slate-400 italic text-[11px] flex items-center gap-1">
                    <Image className="w-4 h-4" /> Kein Logo hinterlegt
                  </div>
                )}
              </div>
            </div>

            {/* Upload Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* File Upload Box */}
              <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl text-center space-y-3 bg-slate-50 hover:bg-slate-100/80 transition-colors">
                <Upload className="w-7 h-7 text-emerald-600 mx-auto" />
                <div>
                  <span className="font-bold text-slate-800 text-xs block">
                    Eigenes Logo hochladen
                  </span>
                  <span className="text-[11px] text-slate-500">
                    PNG, SVG, JPG oder WebP (optimal mit transparentem Hintergrund)
                  </span>
                </div>
                <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs cursor-pointer shadow-xs">
                  <span>Datei vom Computer wählen</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* URL Input Box */}
              <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50">
                <span className="font-bold text-slate-800 text-xs block">
                  Oder Logo-URL eingeben:
                </span>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://meine-ngo.org/assets/logo.png"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    className="text-[11px] text-red-600 hover:underline"
                  >
                    Logo entfernen
                  </button>
                )}
              </div>
            </div>

            {/* Preset NGO Logos */}
            <div className="space-y-2">
              <span className="font-bold text-slate-800 text-xs block">
                Schnellauswahl: Professionelle Vorlagen & Logos
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_NGO_LOGOS.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setLogoUrl(p.svgDataUrl);
                      setLetterhead((prev) => ({
                        ...prev,
                        primaryBrandColor: p.brandColor,
                      }));
                    }}
                    className={`p-2.5 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                      logoUrl === p.svgDataUrl
                        ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-400/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-10 bg-slate-50 rounded border p-1 flex items-center justify-center">
                        <img src={p.svgDataUrl} alt={p.name} className="max-h-8 max-w-full" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{p.name}</div>
                        <div className="text-[10px] text-slate-500">{p.category}</div>
                      </div>
                    </div>
                    {logoUrl === p.svgDataUrl && (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Brand Color Selector */}
            <div className="space-y-2">
              <span className="font-bold text-slate-800 text-xs block flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-slate-600" />
                Primäre Briefkopf-Akzentfarbe
              </span>
              <div className="flex items-center gap-3 flex-wrap">
                {[
                  { name: 'Smaragdgrün (TEFA)', hex: '#059669' },
                  { name: 'Marineblau (Global)', hex: '#0284c7' },
                  { name: 'Solar Orange', hex: '#d97706' },
                  { name: 'Humanitär Rot', hex: '#dc2626' },
                  { name: 'Bildung Indigo', hex: '#4f46e5' },
                  { name: 'Anthrazit Klassik', hex: '#334155' },
                ].map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() =>
                      setLetterhead((prev) => ({ ...prev, primaryBrandColor: c.hex }))
                    }
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                      letterhead.primaryBrandColor === c.hex
                        ? 'border-slate-900 bg-slate-100 ring-2 ring-slate-400'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border shadow-xs"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Letterhead, Legal & Bank */}
        {activeTab === 'letterhead' && (
          <div className="flex-1 overflow-y-auto space-y-4 text-xs">
            {/* General Legal Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Name der Organisation *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Rechtsform
                </label>
                <input
                  type="text"
                  value={legalForm}
                  onChange={(e) => setLegalForm(e.target.value)}
                  placeholder="z.B. Eingetragener Verein (e.V.) / Stiftung"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Tagline */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Offizielles Leitmotiv / Slogan (erscheint im Briefkopf)
              </label>
              <input
                type="text"
                value={letterhead.officialTagline || ''}
                onChange={(e) =>
                  setLetterhead({ ...letterhead, officialTagline: e.target.value })
                }
                placeholder="z.B. Gemeinnütziger Verein zur Förderung von Bildung & Erneuerbaren Energien"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Address */}
            <div className="border-t pt-3">
              <span className="font-bold text-slate-800 text-xs block mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Postanschrift & Sitz
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="block text-slate-500 text-[10px] mb-0.5">Straße & Hausnummer</label>
                  <input
                    type="text"
                    value={letterhead.addressStreet || ''}
                    onChange={(e) =>
                      setLetterhead({ ...letterhead, addressStreet: e.target.value })
                    }
                    placeholder="Kottbusser Damm 79"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] mb-0.5">PLZ & Stadt</label>
                  <input
                    type="text"
                    value={`${letterhead.addressPostalCode || ''} ${letterhead.addressCity || ''}`}
                    onChange={(e) => {
                      const parts = e.target.value.split(' ');
                      const zip = parts[0] || '';
                      const city = parts.slice(1).join(' ') || '';
                      setLetterhead({
                        ...letterhead,
                        addressPostalCode: zip,
                        addressCity: city,
                      });
                    }}
                    placeholder="10967 Berlin"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Web, Phone, Mail */}
            <div className="border-t pt-3">
              <span className="font-bold text-slate-800 text-xs block mb-2 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-600" />
                Kontakt & Offizielle Webpräsenz
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-500 text-[10px] mb-0.5">Offizielle Webseite *</label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://www.techenergyforafrica.org"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] mb-0.5">E-Mail</label>
                  <input
                    type="email"
                    value={letterhead.email || ''}
                    onChange={(e) =>
                      setLetterhead({ ...letterhead, email: e.target.value })
                    }
                    placeholder="info@techenergyforafrica.org"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] mb-0.5">Telefon</label>
                  <input
                    type="text"
                    value={letterhead.phone || ''}
                    onChange={(e) =>
                      setLetterhead({ ...letterhead, phone: e.target.value })
                    }
                    placeholder="+49 30 555 789 20"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Register Court & Tax ID */}
            <div className="border-t pt-3">
              <span className="font-bold text-slate-800 text-xs block mb-2 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                Registergericht & Gemeinnützigkeit
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 text-[10px] mb-0.5">Vereinsregister / Handelsregister</label>
                  <input
                    type="text"
                    value={letterhead.registrationCourt || ''}
                    onChange={(e) =>
                      setLetterhead({ ...letterhead, registrationCourt: e.target.value })
                    }
                    placeholder="Amtsgericht Berlin-Charlottenburg, VR 38920 B"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] mb-0.5">Steuernummer / Freistellungsbescheid</label>
                  <input
                    type="text"
                    value={letterhead.taxId || ''}
                    onChange={(e) =>
                      setLetterhead({ ...letterhead, taxId: e.target.value })
                    }
                    placeholder="StNr. 27/653/55123 • Finanzamt für Körperschaften I Berlin"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="border-t pt-3">
              <span className="font-bold text-slate-800 text-xs block mb-2 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                Bankverbindung (für Spenden & Verwendungsnachweise)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-500 text-[10px] mb-0.5">Kreditinstitut</label>
                  <input
                    type="text"
                    value={letterhead.bankName || ''}
                    onChange={(e) =>
                      setLetterhead({ ...letterhead, bankName: e.target.value })
                    }
                    placeholder="GLS Gemeinschaftsbank eG"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] mb-0.5">IBAN</label>
                  <input
                    type="text"
                    value={letterhead.iban || ''}
                    onChange={(e) =>
                      setLetterhead({ ...letterhead, iban: e.target.value })
                    }
                    placeholder="DE89 4306 0967 1144 5500 00"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] mb-0.5">BIC</label>
                  <input
                    type="text"
                    value={letterhead.bic || ''}
                    onChange={(e) =>
                      setLetterhead({ ...letterhead, bic: e.target.value })
                    }
                    placeholder="GENODEM1GLS"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Signatories */}
        {activeTab === 'signatories' && (
          <div className="flex-1 overflow-y-auto space-y-4 text-xs">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 flex items-start gap-2">
              <UserCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong>Vier-Augen-Prinzip:</strong> Hinterlegen Sie die zeichnungsberechtigten
                Personen Ihrer Organisation. Diese Namen erscheinen standardmäßig in den
                Signaturfeldern aller generierten und gedruckten Dokumente.
              </div>
            </div>

            {/* Signatory 1 */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <span className="font-bold text-slate-800 text-xs block">
                1. Zeichnungsberechtigter (z.B. Vorstand / Geschäftsführung)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 text-[10px] mb-1">Vollständiger Name</label>
                  <input
                    type="text"
                    value={letterhead.signatory1Name || ''}
                    onChange={(e) =>
                      setLetterhead({ ...letterhead, signatory1Name: e.target.value })
                    }
                    placeholder="Dr. Frederic Pokam"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] mb-1">Amtliche Funktion / Rolle</label>
                  <input
                    type="text"
                    value={letterhead.signatory1Role || ''}
                    onChange={(e) =>
                      setLetterhead({ ...letterhead, signatory1Role: e.target.value })
                    }
                    placeholder="Vorstandsvorsitzender"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Signatory 2 */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <span className="font-bold text-slate-800 text-xs block">
                2. Zeichnungsberechtigter (z.B. Finanzen / Controlling / Stellvertretung)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 text-[10px] mb-1">Vollständiger Name</label>
                  <input
                    type="text"
                    value={letterhead.signatory2Name || ''}
                    onChange={(e) =>
                      setLetterhead({ ...letterhead, signatory2Name: e.target.value })
                    }
                    placeholder="Marc Tagne"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] mb-1">Amtliche Funktion / Rolle</label>
                  <input
                    type="text"
                    value={letterhead.signatory2Role || ''}
                    onChange={(e) =>
                      setLetterhead({ ...letterhead, signatory2Role: e.target.value })
                    }
                    placeholder="Finanzvorstand & Projektkoordination"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Digital Stamp Text */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-slate-800 text-xs block flex items-center gap-1.5">
                <Stamp className="w-4 h-4 text-emerald-600" />
                Text für digitalen Organisationsstempel (Siegel)
              </span>
              <input
                type="text"
                value={letterhead.digitalStampText || ''}
                onChange={(e) =>
                  setLetterhead({ ...letterhead, digitalStampText: e.target.value })
                }
                placeholder="TechEnergy For Africa e.V. • Berlin • Amtlich Bestätigt"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Tab 4: Live Letterhead Preview */}
        {activeTab === 'preview' && (
          <div className="flex-1 overflow-y-auto p-4 bg-slate-100 rounded-xl space-y-4">
            <div className="bg-white rounded-lg p-6 shadow-md border border-slate-200 space-y-6 max-w-2xl mx-auto text-[11px] font-sans">
              {/* Top Letterhead Preview */}
              <div
                className="flex items-start justify-between pb-3 border-b-2"
                style={{ borderColor: letterhead.primaryBrandColor || '#059669' }}
              >
                <div className="space-y-1">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-10 object-contain" />
                  ) : (
                    <div className="font-extrabold text-base text-slate-900">{name}</div>
                  )}
                  <div className="text-[10px] text-slate-500">
                    {letterhead.officialTagline || 'From Idea to Impact'}
                  </div>
                  <div className="text-[9px] text-slate-400">
                    {letterhead.addressStreet}, {letterhead.addressPostalCode} {letterhead.addressCity} •{' '}
                    {website}
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <span
                    className="inline-block px-2 py-0.5 rounded text-[9px] font-bold text-white uppercase tracking-wider"
                    style={{ backgroundColor: letterhead.primaryBrandColor || '#059669' }}
                  >
                    Offizielles Dokument
                  </span>
                  <div className="text-[10px] text-slate-500">
                    Datum: {new Date().toLocaleDateString('de-DE')}
                  </div>
                  <div className="text-[9px] font-mono text-slate-400">
                    Ref: TEFA-2026-OFFICIAL
                  </div>
                </div>
              </div>

              {/* Sample Document Body */}
              <div className="py-4 space-y-3 text-slate-700">
                <h4 className="font-bold text-sm text-slate-900">
                  Muster: Vorlage für Projektantrag &amp; Mittelverwendung
                </h4>
                <p className="text-[11px] leading-relaxed">
                  Dieses Dokument demonstriert das offizielle Erscheinungsbild aller gedruckten und
                  exportierten Dokumente dieser Organisation mit individuellem Logo, Briefkopf und
                  Vier-Augen-Unterschriftenblock.
                </p>
                <div className="p-3 bg-slate-50 rounded border text-[10px] space-y-1">
                  <div><strong>Projekt:</strong> TechEnergy For Africa – Offizielles Solar- &amp; Digitalbildungsprogramm</div>
                  <div><strong>Organisation:</strong> {name} ({legalForm})</div>
                  <div><strong>Zielort:</strong> Douala &amp; Yaoundé, Kamerun / Berlin</div>
                </div>
              </div>

              {/* Sample Signatures Block Preview */}
              <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-[10px]">
                <div className="border border-slate-200 rounded p-2 text-center bg-slate-50">
                  <div className="text-slate-400 italic text-[9px] mb-2">[Digitale Signatur 1]</div>
                  <div className="font-bold text-slate-900">{letterhead.signatory1Name}</div>
                  <div className="text-slate-500 text-[9px]">{letterhead.signatory1Role}</div>
                </div>
                <div className="border border-slate-200 rounded p-2 text-center bg-slate-50">
                  <div className="text-slate-400 italic text-[9px] mb-2">[Digitale Signatur 2]</div>
                  <div className="font-bold text-slate-900">{letterhead.signatory2Name}</div>
                  <div className="text-slate-500 text-[9px]">{letterhead.signatory2Role}</div>
                </div>
              </div>

              {/* Letterhead Footer Preview */}
              <div className="pt-3 border-t border-slate-200 grid grid-cols-3 gap-2 text-[8px] text-slate-500 text-center sm:text-left">
                <div>
                  <strong>{name}</strong>
                  <br />
                  {letterhead.addressStreet}
                  <br />
                  {letterhead.addressPostalCode} {letterhead.addressCity}
                </div>
                <div>
                  <strong>Register &amp; Steuern</strong>
                  <br />
                  {letterhead.registrationCourt}
                  <br />
                  {letterhead.taxId}
                </div>
                <div>
                  <strong>Bankverbindung</strong>
                  <br />
                  {letterhead.bankName}
                  <br />
                  IBAN: {letterhead.iban}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t pt-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
          >
            Abbrechen
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all transform hover:scale-102"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Gespeichert!</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Branding &amp; Briefkopf speichern</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
