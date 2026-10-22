import React from 'react';
import { Project } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { CheckCircle2, AlertCircle, Info, ExternalLink, ShieldCheck } from 'lucide-react';

interface ProjectSelectorProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
  onContinueToBrief: () => void;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  onContinueToBrief,
}) => {
  const { t } = useLanguage();
  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  return (
    <div className="space-y-6">
      {/* Informative Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Sektion A: Verifiziertes Projekt auswählen
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              TEFA Projektgrundlage für Kampagne wählen
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Wählen Sie ein registriertes TEFA-Projekt aus. Vorhandene Daten zu Zielen, Standort und Zielgruppe
              werden automatisch übernommen. Nicht belegte Kennzahlen verbleiben strikt als unbekannt.
            </p>
          </div>

          <button
            onClick={onContinueToBrief}
            className="self-start sm:self-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <span>Weiter zum Kampagnen-Briefing</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((proj) => {
          const isSelected = proj.id === selectedProjectId;
          const isDfg = proj.id === 'proj_dfg_003';
          const isIfopsim = proj.id === 'proj_ifopsim_001';
          const isGenGreen = proj.id === 'proj_gen_green_002';

          return (
            <div
              key={proj.id}
              onClick={() => onSelectProject(proj.id)}
              className={`rounded-xl border p-5 cursor-pointer transition-all duration-200 relative flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    {proj.referenceId}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      proj.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : proj.status === 'Under Review'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {t.status[proj.status] || proj.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mb-1 leading-snug">
                  {proj.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                  {proj.shortDescription}
                </p>

                <div className="space-y-1.5 text-[11px] text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Standort:</span>
                    <span className="font-medium text-slate-800">{proj.country} ({proj.locationDetails || 'Region nicht spezifiziert'})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Projektphase:</span>
                    <span className="font-medium text-slate-800 capitalize">{t.phases[proj.lifecyclePhase] || proj.lifecyclePhase}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Demo/Hypothetisch:</span>
                    <span className="font-medium text-amber-700">
                      {proj.isDemoOrHypothetical ? 'Ja (Modellfall)' : 'Nein (Realdaten)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ausgewählt
                    </span>
                  ) : (
                    'Klicken zum Auswählen'
                  )}
                </span>
                <span className="text-xs font-semibold text-emerald-600">
                  {isIfopsim && 'Agrar-Solar'}
                  {isGenGreen && 'Umweltbildung'}
                  {isDfg && 'Digitale Bildung'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Project Fact Sheet with Unknowns Marked */}
      {selectedProject && (
        <div className="bg-slate-900 text-slate-100 rounded-xl p-5 shadow-lg border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-sm text-white">
                Geladene Projektdaten: {selectedProject.title} ({selectedProject.referenceId})
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">
              Datensatz-Integrität: Keine erfundenen Statistiken
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-800/80 rounded-lg p-3.5 border border-slate-700 space-y-2">
              <div className="text-slate-400 font-medium text-[11px]">Verifizierte Projektziele</div>
              <ul className="space-y-1 list-disc list-inside text-slate-200">
                {selectedProject.proposal?.objectives?.length ? (
                  selectedProject.proposal.objectives.map((obj, i) => (
                    <li key={i} className="line-clamp-2">{obj}</li>
                  ))
                ) : (
                  <li className="text-amber-400 italic">Keine Ziele hinterlegt [UNBEKANNT]</li>
                )}
              </ul>
            </div>

            <div className="bg-slate-800/80 rounded-lg p-3.5 border border-slate-700 space-y-2">
              <div className="text-slate-400 font-medium text-[11px]">Zielgruppe & Geplante Begünstigte</div>
              <p className="text-slate-200">
                <span className="text-slate-400">Zielgruppe: </span>
                {selectedProject.proposal?.targetBeneficiaries || '[UNBEKANNT / Noch nicht erhoben]'}
              </p>
              <p className="text-slate-200">
                <span className="text-slate-400">Begünstigte (geplant): </span>
                <span className="font-semibold text-emerald-400">
                  {selectedProject.proposal?.beneficiaryCountPlanned || '[UNBEKANNT]'}
                </span>
              </p>
              <p className="text-amber-300 text-[11px] flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                Erreichte Begünstigte (Ist): Noch nicht eingetreten (Projekt ist {selectedProject.status})
              </p>
            </div>

            <div className="bg-slate-800/80 rounded-lg p-3.5 border border-slate-700 space-y-2">
              <div className="text-slate-400 font-medium text-[11px]">Kommunikations- & Freigabestatus</div>
              <p className="text-slate-200">
                <span className="text-slate-400">Projektträger: </span>
                TechEnergy For Africa e.V.
              </p>
              <p className="text-slate-200">
                <span className="text-slate-400">Freigabestatus: </span>
                <span className="font-semibold text-slate-100">{selectedProject.status}</span>
              </p>
              <p className="text-[11px] text-slate-400">
                Bestätigte Mittel: {selectedProject.simulationParams?.confirmedGrantsEUR ?? 0} € | Finanzierungslücke vorhanden
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
