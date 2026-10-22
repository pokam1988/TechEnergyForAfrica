import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuthRole } from '../../context/AuthRoleContext';
import { useProjects } from '../../context/ProjectContext';
import { ImpactIndicator, EvidenceStatus } from '../../types';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  Plus,
  Save,
  AlertTriangle,
  HelpCircle,
  FileText,
} from 'lucide-react';

export const ImpactEvaluation: React.FC = () => {
  const { t } = useLanguage();
  const { currentUser, canEditProject } = useAuthRole();
  const { activeProject, updateProject } = useProjects();

  const [indicators, setIndicators] = useState<ImpactIndicator[]>(() => {
    return activeProject ? JSON.parse(JSON.stringify(activeProject.impactIndicators)) : [];
  });

  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (activeProject) {
      setIndicators(JSON.parse(JSON.stringify(activeProject.impactIndicators)));
    }
  }, [activeProject]);

  const handleSaveIndicators = async () => {
    if (!activeProject) return;
    await updateProject({
      ...activeProject,
      impactIndicators: indicators,
    });
    setSaveMsg('Wirkungsindikatoren erfolgreich aktualisiert.');
    setTimeout(() => setSaveMsg(null), 3000);
  };

  const handleAddIndicator = () => {
    const newInd: ImpactIndicator = {
      id: 'ind_' + Date.now(),
      name: 'Neuer Wirkungsindikator',
      category: 'education',
      definition: 'Messvorschrift und Zieldefinition...',
      baseline: 0,
      target: 50,
      actual: 0,
      unit: 'Teilnehmende',
      reportingPeriod: '2026-2027',
      evidenceSource: 'Absolventenregister',
      evidenceStatus: 'hypothetical_assumption',
      responsiblePerson: currentUser.name,
    };
    setIndicators([...indicators, newInd]);
  };

  const handleUpdate = (id: string, field: keyof ImpactIndicator, val: string | number) => {
    setIndicators((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: val } : i))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Modul K
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Wirkungsmessung & Förderbericht (M&E)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Wirkungs- & KPI-Evaluation
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
            Strikte Messung der Zielerreichung mit transparenter Unterscheidung zwischen geprüften
            Fakten, ungeprüften Selbstauskünften und hypothetischen Planungsannahmen.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canEditProject() && (
            <button
              onClick={handleAddIndicator}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <Plus className="w-4 h-4 text-slate-600" />
              <span>Indikator anlegen</span>
            </button>
          )}

          <button
            onClick={handleSaveIndicators}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Indikatoren speichern</span>
          </button>
        </div>
      </div>

      {saveMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-4 py-2.5 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveMsg}</span>
        </div>
      )}

      {/* Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {indicators.map((ind, idx) => {
          const pct = ind.target > 0 ? Math.min(100, Math.round((ind.actual / ind.target) * 100)) : 0;
          return (
            <div
              key={ind.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {ind.category}
                    </span>
                    <input
                      type="text"
                      value={ind.name}
                      onChange={(e) => handleUpdate(ind.id, 'name', e.target.value)}
                      className="font-bold text-sm text-slate-900 mt-1 block w-full focus:outline-none focus:border-b focus:border-emerald-500"
                    />
                  </div>

                  {/* Evidence Status Badge */}
                  <select
                    value={ind.evidenceStatus}
                    onChange={(e) =>
                      handleUpdate(ind.id, 'evidenceStatus', e.target.value as EvidenceStatus)
                    }
                    className={`text-[10px] font-bold px-2 py-1 rounded border focus:outline-none shrink-0 ${
                      ind.evidenceStatus === 'verified'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : ind.evidenceStatus === 'hypothetical_assumption'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : ind.evidenceStatus === 'user_provided_unverified'
                        ? 'bg-blue-50 text-blue-800 border-blue-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    <option value="verified">Geprüft & Belegt</option>
                    <option value="user_provided_unverified">Selbstauskunft (Ungeprüft)</option>
                    <option value="hypothetical_assumption">Hypothetische Annahme</option>
                    <option value="missing_information">Fehlende Information</option>
                  </select>
                </div>

                <p className="text-xs text-slate-600">{ind.definition}</p>

                {/* Progress Bar & Numerical Target/Actual */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Zielerreichung:</span>
                    <span className="font-bold text-slate-900">
                      {ind.actual} / {ind.target} {ind.unit} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Actual Value Editor */}
                <div className="flex items-center gap-3 pt-2 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">Ist-Wert:</span>
                    <input
                      type="number"
                      value={ind.actual}
                      onChange={(e) => handleUpdate(ind.id, 'actual', parseFloat(e.target.value) || 0)}
                      className="w-16 p-1 border border-slate-300 rounded font-bold text-slate-900 text-center"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">Zielwert:</span>
                    <input
                      type="number"
                      value={ind.target}
                      onChange={(e) => handleUpdate(ind.id, 'target', parseFloat(e.target.value) || 0)}
                      className="w-16 p-1 border border-slate-300 rounded font-bold text-slate-900 text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Evidence Source Footer */}
              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span className="truncate">Nachweis: {ind.evidenceSource}</span>
                <span className="shrink-0">{ind.reportingPeriod}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
