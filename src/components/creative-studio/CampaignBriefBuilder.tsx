import React, { useState } from 'react';
import { CampaignBrief, Project, CampaignLifecyclePhase, CampaignFormatType } from '../../types';
import { CAMPAIGN_FORMAT_CONFIGS } from '../../data/seedCampaigns';
import {
  Sparkles,
  Users,
  Target,
  MessageSquare,
  Globe,
  Palette,
  ShieldCheck,
  Calendar,
  Layers,
  FileText,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  EyeOff,
  RefreshCw,
} from 'lucide-react';

interface CampaignBriefBuilderProps {
  brief: CampaignBrief;
  selectedProject: Project | null;
  onChange: (updatedBrief: CampaignBrief) => void;
  onContinueToIdentity: () => void;
  onSaveDraft: () => void;
  isSaving?: boolean;
}

const LIFECYCLE_PHASES: { id: CampaignLifecyclePhase; label: string; desc: string }[] = [
  { id: 'idea_proposal', label: '1. Projektidee & Antrag', desc: 'Frühphase, Stakeholder-Mobilisierung' },
  { id: 'fundraising_outreach', label: '2. Fundraising & Partnerschaften', desc: 'Stiftungen, CSR-Förderer, Geber' },
  { id: 'project_launch', label: '3. Projektstart / Kickoff', desc: 'Offizielle Eröffnung vor Ort' },
  { id: 'implementation_update', label: '4. Umsetzungs-Update', desc: 'Fortschrittsberichte & Meilensteine' },
  { id: 'awareness_campaign', label: '5. Aufklärung & Sensibilisierung', desc: 'Lokale Gemeinschaft & Inklusion' },
  { id: 'impact_communication', label: '6. Wirkungskommunikation', desc: 'Ergebnisse, messbare Veränderungen' },
  { id: 'final_reporting', label: '7. Abschluss & Evaluierung', desc: 'Stifterbericht & Lessons Learned' },
];

const VISUAL_STYLES = [
  { id: 'modern_flat_vector', label: 'Moderner Vektor & Flachgrafik', hint: 'Klar, zugänglich, barrierearm' },
  { id: 'photo_documentary', label: 'Dokumentarischer Fotorealismus', hint: 'Authentisch, technisch präzise' },
  { id: 'isometric_tech', label: 'Isometrische Technik-Illustration', hint: 'Solaranlagen, Schaltpläne, IT' },
  { id: 'clean_minimalist', label: 'Minimalistische Bildungsästhetik', hint: 'Fokussiert, ruhige Typografie' },
  { id: '3d_conceptual', label: '3D-Konzeptuelle Visualisierung', hint: 'Zukunftsvision, Modellcharakter' },
];

export const CampaignBriefBuilder: React.FC<CampaignBriefBuilderProps> = ({
  brief,
  selectedProject,
  onChange,
  onContinueToIdentity,
  onSaveDraft,
  isSaving = false,
}) => {
  const [isAiPlanning, setIsAiPlanning] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  const handleAiPlan = async () => {
    setIsAiPlanning(true);
    setAiError(null);
    setAiSuccessMessage(null);

    try {
      const res = await fetch('/api/creative-studio/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: selectedProject,
          brief,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server meldete HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.briefSuggestions) {
        onChange({
          ...brief,
          ...data.briefSuggestions,
          noPeopleMode: brief.noPeopleMode, // ensure strict compliance preserved
        });
        setAiSuccessMessage('KI-Vorschlag erfolgreich auf Basis der verifizierten Projektdaten generiert.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Fehler bei der KI-Briefing-Generierung';
      setAiError(message);
    } finally {
      setIsAiPlanning(false);
    }
  };

  const toggleChannel = (formatId: string) => {
    const exists = brief.channels.includes(formatId);
    const updated = exists ? brief.channels.filter((c) => c !== formatId) : [...brief.channels, formatId];
    onChange({ ...brief, channels: updated });
  };

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 mb-2">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              Sektion B: Kampagnen-Briefing & Leitlinie
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Strategisches Kampagnen-Briefing erstellen
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">
              Definieren Sie Botschaft, Zielgruppe, Kanäle und optische Leitplanken. Alle Daten werden mit dem
              Projekt{' '}
              <strong className="text-slate-800 font-semibold">
                {selectedProject ? selectedProject.title : brief.projectTitle || 'TEFA Vorhaben'}
              </strong>{' '}
              verknüpft.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAiPlan}
              disabled={isAiPlanning}
              className="px-3.5 py-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
            >
              {isAiPlanning ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              )}
              <span>{isAiPlanning ? 'Plane mit Gemini...' : 'KI-Briefing vorschlagen'}</span>
            </button>

            <button
              type="button"
              onClick={onSaveDraft}
              disabled={isSaving}
              className="px-3.5 py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 text-xs font-medium cursor-pointer transition-colors"
            >
              {isSaving ? 'Wird gespeichert...' : 'Entwurf speichern'}
            </button>

            <button
              type="button"
              onClick={onContinueToIdentity}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Weiter zu Markenidentität</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>

        {aiSuccessMessage && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{aiSuccessMessage}</span>
          </div>
        )}

        {aiError && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{aiError}</span>
          </div>
        )}
      </div>

      {/* Mandatory "No People" Compliance Banner */}
      <div className={`p-4 rounded-xl border transition-all ${brief.noPeopleMode ? 'bg-amber-50/80 border-amber-300' : 'bg-slate-50 border-slate-300'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg shrink-0 ${brief.noPeopleMode ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'}`}>
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900">
                  Option: Keine Personen in generierten Bildern (No People Mode)
                </h3>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  Standardmäßig Aktiv
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Wenn aktiviert, verbietet das System strikt Gesichter, menschliche Silhouetten, Menschenmengen und Hände.
                Stattdessen stehen Solaranlagen, IT-Hardware, Klassenzimmer-Infrastruktur, Setzlinge und saubere Technologie im visuellen Mittelpunkt.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0 self-start sm:self-center">
            <input
              type="checkbox"
              checked={brief.noPeopleMode}
              onChange={(e) => onChange({ ...brief, noPeopleMode: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            <span className="ml-2.5 text-xs font-bold text-slate-800">
              {brief.noPeopleMode ? 'Aktiviert (Keine Personen)' : 'Deaktiviert (Menschen erlaubt)'}
            </span>
          </label>
        </div>
      </div>

      {/* Main Briefing Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Core Campaign Strategy (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Core Message & Lifecycle */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Target className="w-4 h-4 text-emerald-600" />
              1. Kampagnentitel, Lebenszyklus & Hauptbotschaft
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kampagnen-Titel *
                </label>
                <input
                  type="text"
                  value={brief.title}
                  onChange={(e) => onChange({ ...brief, title: e.target.value })}
                  placeholder="z.B. Digital Future Girls: Solar-Inklusion & Bildungschancen"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Projektlebenszyklus-Phase *
                </label>
                <select
                  value={brief.lifecyclePhase}
                  onChange={(e) =>
                    onChange({ ...brief, lifecyclePhase: e.target.value as CampaignLifecyclePhase })
                  }
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {LIFECYCLE_PHASES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  {LIFECYCLE_PHASES.find((p) => p.id === brief.lifecyclePhase)?.desc}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kampagnensprache *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: 'de', label: 'Deutsch (DE)' },
                    { code: 'en', label: 'English (EN)' },
                    { code: 'fr', label: 'Français (FR)' },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => onChange({ ...brief, language: lang.code as 'de' | 'en' | 'fr' })}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                        brief.language === lang.code
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hauptbotschaft (Key Message) *
              </label>
              <textarea
                rows={2}
                value={brief.mainMessage}
                onChange={(e) => onChange({ ...brief, mainMessage: e.target.value })}
                placeholder="Prägnanter Satz: Was ist der emotionale oder faktische Kern dieser Kampagne?"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kampagnenziel (Objective)
                </label>
                <textarea
                  rows={2}
                  value={brief.objective}
                  onChange={(e) => onChange({ ...brief, objective: e.target.value })}
                  placeholder="z.B. Gewinnung von 3 institutionellen Stiftungen für Solarmodule"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Zielgruppe (Target Audience)
                </label>
                <textarea
                  rows={2}
                  value={brief.targetAudience}
                  onChange={(e) => onChange({ ...brief, targetAudience: e.target.value })}
                  placeholder="z.B. CSR-Manager in Deutschland, Bildungsministerium Kamerun"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Typography & Display Copy */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              2. Typografische Texte für Bild-Overlays
            </h3>
            <p className="text-xs text-slate-500">
              Für exakte Lesbarkeit generiert das System den Bildhintergrund und legt die Texte als
              grafische HTML/Canvas-Ebene darüber. So entstehen keine KI-Rechtschreibfehler.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Schlagzeile (Headline) *
                </label>
                <input
                  type="text"
                  value={brief.textToDisplay.headline}
                  onChange={(e) =>
                    onChange({
                      ...brief,
                      textToDisplay: { ...brief.textToDisplay, headline: e.target.value },
                    })
                  }
                  placeholder="z.B. Solar-Bildung für die nächste Generation"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Untertitel (Subtitle / Erläuterung)
                </label>
                <input
                  type="text"
                  value={brief.textToDisplay.subtitle}
                  onChange={(e) =>
                    onChange({
                      ...brief,
                      textToDisplay: { ...brief.textToDisplay, subtitle: e.target.value },
                    })
                  }
                  placeholder="z.B. 10 verlässliche Lernstationen mit sauberer Solarenergie in Yaoundé"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Handlungsaufforderung (Call to Action) *
                </label>
                <input
                  type="text"
                  value={brief.textToDisplay.callToAction}
                  onChange={(e) =>
                    onChange({
                      ...brief,
                      textToDisplay: { ...brief.textToDisplay, callToAction: e.target.value },
                    })
                  }
                  placeholder="z.B. Jetzt Bildungspartner werden | techenergyforafrica.com"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Visual Subject & Prompt Details */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Palette className="w-4 h-4 text-emerald-600" />
              3. Visueller Stil & Bildbeschreibung für die KI
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gewünschter optischer Stil
                </label>
                <select
                  value={brief.visualStyle}
                  onChange={(e) =>
                    onChange({
                      ...brief,
                      visualStyle: e.target.value as CampaignBrief['visualStyle'],
                    })
                  }
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {VISUAL_STYLES.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  {VISUAL_STYLES.find((s) => s.id === brief.visualStyle)?.hint}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Laufzeit / Kampagnenzeitraum
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={brief.startDate}
                    onChange={(e) => onChange({ ...brief, startDate: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                  <input
                    type="date"
                    value={brief.endDate}
                    onChange={(e) => onChange({ ...brief, endDate: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bildmotiv-Beschreibung für Bildgenerator (Nano Banana)
              </label>
              <textarea
                rows={3}
                value={brief.imageDescription}
                onChange={(e) => onChange({ ...brief, imageDescription: e.target.value })}
                placeholder="Beschreiben Sie die gewünschte Szene, z.B. Solar-IT-Klassenzimmer mit Laptops, Wechselrichtern, sonnigem Ausblick, grüner Natur..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                {brief.noPeopleMode
                  ? 'Hinweis: Der Prompt wird automatisch um strenge No-People-Filter und Gegenstandsvorschläge ergänzt.'
                  : 'Hinweis: Authentische Bilddarstellung.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Channels & Formats selection (1 col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                Kampagnenkanäle & Formate
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {brief.channels.length} gewählt
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Wählen Sie die Formate, die im Rahmen der koordinierten Kampagne generiert werden sollen:
            </p>

            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {CAMPAIGN_FORMAT_CONFIGS.map((fmt) => {
                const isSelected = brief.channels.includes(fmt.id);

                return (
                  <div
                    key={fmt.id}
                    onClick={() => toggleChannel(fmt.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-500 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // handled by parent div
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 pointer-events-none"
                          />
                          <span className="text-xs font-bold text-slate-900">
                            {fmt.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                          {fmt.description}
                        </p>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0">
                        {fmt.aspectRatio}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...brief,
                    channels: CAMPAIGN_FORMAT_CONFIGS.map((f) => f.id),
                  })
                }
                className="text-emerald-700 hover:underline font-semibold text-[11px]"
              >
                Alle 9 auswählen
              </button>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...brief,
                    channels: ['billboard_poster', 'instagram_square', 'linkedin_graphic'],
                  })
                }
                className="text-slate-600 hover:underline font-semibold text-[11px]"
              >
                MVP 3 Formate
              </button>
            </div>
          </div>

          {/* Approvals & Governance Notice */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>TEFA Governance & Freigabepflicht</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Gemäß Satzung von TechEnergy For Africa e.V. darf kein generiertes Kampagnenbild ohne
              dokumentierte Freigabe durch die Projektleitung oder den Vorstand veröffentlicht werden.
            </p>
            <div className="p-2.5 bg-white rounded border border-slate-200 text-[11px] text-slate-700">
              <strong>Zuständige Freigabeinstanz:</strong> Vorstand TEFA e.V. (Dr. Sophie Becker, Frederic Pokam)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
