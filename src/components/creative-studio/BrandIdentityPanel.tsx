import React, { useRef } from 'react';
import { BrandIdentitySpec } from '../../types';
import {
  Palette,
  ShieldCheck,
  Upload,
  Type,
  Layout,
  Info,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface BrandIdentityPanelProps {
  brandIdentity: BrandIdentitySpec;
  onChange: (updatedIdentity: BrandIdentitySpec) => void;
  onContinueToGeneration: () => void;
}

const TEFA_PALETTES = [
  {
    name: 'TEFA Standard (Blau / Smaragd / Solar)',
    primary: '#0f2b48',
    secondary: '#10b981',
    accent: '#f97316',
    neutralLight: '#ffffff',
    neutralDark: '#0f172a',
  },
  {
    name: 'Generation Green (Deep Eco Forest)',
    primary: '#064e3b',
    secondary: '#10b981',
    accent: '#eab308',
    neutralLight: '#f0fdf4',
    neutralDark: '#022c22',
  },
  {
    name: 'Digital Future Girls (Tech Blue / Violet / Solar)',
    primary: '#1e1b4b',
    secondary: '#0284c7',
    accent: '#f59e0b',
    neutralLight: '#ffffff',
    neutralDark: '#0f172a',
  },
  {
    name: 'IFOPSIM Agro-Solar (Earth & Photovoltaic)',
    primary: '#1e293b',
    secondary: '#059669',
    accent: '#ea580c',
    neutralLight: '#f8fafc',
    neutralDark: '#0f172a',
  },
];

export const BrandIdentityPanel: React.FC<BrandIdentityPanelProps> = ({
  brandIdentity,
  onChange,
  onContinueToGeneration,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onChange({
          ...brandIdentity,
          approvedLogo: {
            useOfficialTefaLogo: false,
            customLogoUrl: reader.result as string,
            logoSource: 'custom_uploaded',
            disclaimer: `Hochgeladenes Projektlogo: ${file.name} (Geprüft & autorisiert für diese Kampagne).`,
          },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const setTefaOfficialLogo = (useOfficial: boolean) => {
    if (useOfficial) {
      onChange({
        ...brandIdentity,
        approvedLogo: {
          useOfficialTefaLogo: true,
          logoSource: 'official_approved_asset',
          disclaimer: 'Offizielles TEFA e.V. Verbands-Brandmark (genehmigt nach Satzung).',
        },
      });
    } else {
      onChange({
        ...brandIdentity,
        approvedLogo: {
          useOfficialTefaLogo: false,
          logoSource: 'none',
          disclaimer: 'Kein Verbandslogo verwendet. Kampagnen-Typografie fungiert als Kennung.',
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
              <Palette className="w-3.5 h-3.5 text-emerald-600" />
              Sektion C: Einheitenübergreifende Markenidentität
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Markenrichtlinien & visuelle DNA festlegen
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Sichern Sie Wiedererkennungswert und Konsistenz über alle Kampagnenformate.
              Farbpalette, Typografie und Logo-Verwendung folgen den TEFA-Richtlinien.
            </p>
          </div>

          <button
            type="button"
            onClick={onContinueToGeneration}
            className="self-start sm:self-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <span>Weiter zur Bildgenerierung</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Logo & Colors & Visual Specs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Approved Logo Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Autorisiertes Logo-Asset & Verbandsbindung
              </h3>
              <span className="text-[11px] font-semibold text-slate-500">
                Anti-Slop Regel: Niemals ein unechtes Logo erfinden
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Gemäß den Vorgaben von TechEnergy For Africa e.V. darf das offizielle Verbandslogo
              nur aus genehmigten Vereins-Assets stammen oder durch den Projektleiter als Vektor/PNG hochgeladen werden.
              Die KI erfindet keine Fantasie-Logos im Bild.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Official TEFA Badge */}
              <div
                onClick={() => setTefaOfficialLogo(true)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  brandIdentity.approvedLogo.useOfficialTefaLogo
                    ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white font-black text-xs shadow-xs border border-slate-800">
                      TEFA
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Offizielles TEFA e.V. Brandmark
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        TechEnergy For Africa e.V. Standard
                      </p>
                    </div>
                  </div>
                  {brandIdentity.approvedLogo.useOfficialTefaLogo && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-600 mt-3 bg-white p-2 rounded border border-slate-100">
                  Wird in der typografischen Vektorebene exakt und messerscharf platziert.
                </p>
              </div>

              {/* Option 2: Upload Custom Project Logo */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  brandIdentity.approvedLogo.logoSource === 'custom_uploaded'
                    ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 border border-dashed border-slate-400 flex items-center justify-center text-slate-600">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Eigenes Projektlogo hochladen
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        PNG, SVG oder JPEG
                      </p>
                    </div>
                  </div>
                  {brandIdentity.approvedLogo.logoSource === 'custom_uploaded' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleCustomLogoUpload}
                  accept="image/png,image/svg+xml,image/jpeg"
                  className="hidden"
                />

                {brandIdentity.approvedLogo.customLogoUrl ? (
                  <div className="mt-3 flex items-center gap-2 bg-white p-2 rounded border border-slate-100">
                    <img
                      src={brandIdentity.approvedLogo.customLogoUrl}
                      alt="Custom logo"
                      className="h-6 w-auto object-contain"
                    />
                    <span className="text-[11px] text-emerald-700 font-semibold truncate">
                      Eigenes Logo aktiv
                    </span>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 mt-3">
                    Klicken zum Hochladen für projektbezogene Co-Branding-Partner.
                  </p>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 flex items-start gap-2 border border-slate-200">
              <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <span>{brandIdentity.approvedLogo.disclaimer}</span>
            </div>
          </div>

          {/* Color Palette Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Palette className="w-4 h-4 text-emerald-600" />
                Farbpalette & Kontrastharmonie
              </h3>
              <span className="text-xs text-slate-500">Wird für KI-Prompt & Overlays verwendet</span>
            </div>

            {/* Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Vordefinierte TEFA-Farbschemata
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {TEFA_PALETTES.map((pal) => (
                  <div
                    key={pal.name}
                    onClick={() =>
                      onChange({
                        ...brandIdentity,
                        colorPalette: {
                          primary: pal.primary,
                          secondary: pal.secondary,
                          accent: pal.accent,
                          neutralLight: pal.neutralLight,
                          neutralDark: pal.neutralDark,
                        },
                      })
                    }
                    className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-white cursor-pointer transition-all hover:shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800">{pal.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 h-6 rounded overflow-hidden">
                      <div className="h-full flex-1" style={{ backgroundColor: pal.primary }} title={`Primary: ${pal.primary}`} />
                      <div className="h-full flex-1" style={{ backgroundColor: pal.secondary }} title={`Secondary: ${pal.secondary}`} />
                      <div className="h-full flex-1" style={{ backgroundColor: pal.accent }} title={`Accent: ${pal.accent}`} />
                      <div className="h-full w-6 border border-slate-200" style={{ backgroundColor: pal.neutralLight }} title="Light" />
                      <div className="h-full w-6" style={{ backgroundColor: pal.neutralDark }} title="Dark" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Primärfarbe</label>
                <div className="flex items-center gap-1.5 p-1.5 rounded border border-slate-300">
                  <input
                    type="color"
                    value={brandIdentity.colorPalette.primary}
                    onChange={(e) =>
                      onChange({
                        ...brandIdentity,
                        colorPalette: { ...brandIdentity.colorPalette, primary: e.target.value },
                      })
                    }
                    className="w-6 h-6 rounded cursor-pointer border-0"
                  />
                  <span className="text-[11px] font-mono text-slate-700">{brandIdentity.colorPalette.primary}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Sekundärfarbe</label>
                <div className="flex items-center gap-1.5 p-1.5 rounded border border-slate-300">
                  <input
                    type="color"
                    value={brandIdentity.colorPalette.secondary}
                    onChange={(e) =>
                      onChange({
                        ...brandIdentity,
                        colorPalette: { ...brandIdentity.colorPalette, secondary: e.target.value },
                      })
                    }
                    className="w-6 h-6 rounded cursor-pointer border-0"
                  />
                  <span className="text-[11px] font-mono text-slate-700">{brandIdentity.colorPalette.secondary}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Akzent (Solar)</label>
                <div className="flex items-center gap-1.5 p-1.5 rounded border border-slate-300">
                  <input
                    type="color"
                    value={brandIdentity.colorPalette.accent}
                    onChange={(e) =>
                      onChange({
                        ...brandIdentity,
                        colorPalette: { ...brandIdentity.colorPalette, accent: e.target.value },
                      })
                    }
                    className="w-6 h-6 rounded cursor-pointer border-0"
                  />
                  <span className="text-[11px] font-mono text-slate-700">{brandIdentity.colorPalette.accent}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Hell / Weiß</label>
                <div className="flex items-center gap-1.5 p-1.5 rounded border border-slate-300">
                  <input
                    type="color"
                    value={brandIdentity.colorPalette.neutralLight}
                    onChange={(e) =>
                      onChange({
                        ...brandIdentity,
                        colorPalette: { ...brandIdentity.colorPalette, neutralLight: e.target.value },
                      })
                    }
                    className="w-6 h-6 rounded cursor-pointer border-0"
                  />
                  <span className="text-[11px] font-mono text-slate-700">{brandIdentity.colorPalette.neutralLight}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Dunkel / Text</label>
                <div className="flex items-center gap-1.5 p-1.5 rounded border border-slate-300">
                  <input
                    type="color"
                    value={brandIdentity.colorPalette.neutralDark}
                    onChange={(e) =>
                      onChange({
                        ...brandIdentity,
                        colorPalette: { ...brandIdentity.colorPalette, neutralDark: e.target.value },
                      })
                    }
                    className="w-6 h-6 rounded cursor-pointer border-0"
                  />
                  <span className="text-[11px] font-mono text-slate-700">{brandIdentity.colorPalette.neutralDark}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Typography Guidance */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Type className="w-4 h-4 text-emerald-600" />
              Typografie & Tonalität
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Überschriften-Schriftfamilie
                </label>
                <input
                  type="text"
                  value={brandIdentity.typographyGuidance.headingFont}
                  onChange={(e) =>
                    onChange({
                      ...brandIdentity,
                      typographyGuidance: {
                        ...brandIdentity.typographyGuidance,
                        headingFont: e.target.value,
                      },
                    })
                  }
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Fließtext & Badges
                </label>
                <input
                  type="text"
                  value={brandIdentity.typographyGuidance.bodyFont}
                  onChange={(e) =>
                    onChange({
                      ...brandIdentity,
                      typographyGuidance: {
                        ...brandIdentity.typographyGuidance,
                        bodyFont: e.target.value,
                      },
                    })
                  }
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tonalität (Style Tone)
                </label>
                <input
                  type="text"
                  value={brandIdentity.typographyGuidance.styleTone}
                  onChange={(e) =>
                    onChange({
                      ...brandIdentity,
                      typographyGuidance: {
                        ...brandIdentity.typographyGuidance,
                        styleTone: e.target.value,
                      },
                    })
                  }
                  placeholder="z.B. Professionell, gemeinnützig, zukunftsorientiert, transparent und lösungsorientiert"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Visual Specification Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Layout className="w-4 h-4 text-emerald-600" />
              Strukturierte Bild-Spezifikation
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="block font-bold text-slate-700 mb-1">Projekt:</span>
                <span className="text-slate-800 font-semibold">{brandIdentity.projectName}</span>
              </div>

              <div>
                <span className="block font-bold text-slate-700 mb-1">Kampagne:</span>
                <span className="text-slate-800">{brandIdentity.campaignName}</span>
              </div>

              <div>
                <span className="block font-bold text-slate-700 mb-1">Kernmotiv (Visual Subject):</span>
                <textarea
                  rows={2}
                  value={brandIdentity.coreVisualSubject}
                  onChange={(e) => onChange({ ...brandIdentity, coreVisualSubject: e.target.value })}
                  className="w-full text-xs p-2 rounded border border-slate-300"
                />
              </div>

              <div>
                <span className="block font-bold text-slate-700 mb-1">Visuelle Bildkomposition:</span>
                <textarea
                  rows={2}
                  value={brandIdentity.visualComposition}
                  onChange={(e) => onChange({ ...brandIdentity, visualComposition: e.target.value })}
                  className="w-full text-xs p-2 rounded border border-slate-300"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-1.5">
                <span className="font-bold text-amber-900 block">
                  Erlaubte Elemente (No People Modus):
                </span>
                <p className="text-[11px] text-amber-800">
                  {brandIdentity.allowedVisualElements.join(', ')}
                </p>
                <span className="font-bold text-rose-900 block pt-1">
                  Strikt verbotene Elemente:
                </span>
                <p className="text-[11px] text-rose-800">
                  {brandIdentity.disallowedVisualElements.join(', ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
