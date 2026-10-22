import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuthRole } from '../../context/AuthRoleContext';
import { useProjects } from '../../context/ProjectContext';
import { FeasibilityRequirement, ReadinessStatus } from '../../types';
import {
  CheckSquare,
  AlertCircle,
  FileText,
  Save,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  HelpCircle,
  XCircle,
} from 'lucide-react';

const CATEGORY_LABELS: Record<FeasibilityRequirement['category'], string> = {
  strategic_alignment: 'Strategische Ausrichtung (TEFA Mission)',
  beneficiary_needs: 'Bedarf der Zielgruppe (Needs Assessment)',
  technical_feasibility: 'Technische Machbarkeit (Solar & IT)',
  financial_feasibility: 'Finanzielle Tragfähigkeit & Kofinanzierung',
  partner_readiness: 'Reifegrad des lokalen Partners (Partner Capacity)',
  legal_regulatory: 'Rechtliche & behördliche Rahmenbedingungen',
  environmental_sustainability: 'Ökologische Nachhaltigkeit & Klima',
  social_inclusion: 'Soziale Inklusion & Barrierefreiheit',
  operational_capacity: 'Betriebliche Durchführbarkeit vor Ort',
  major_risks: 'Hauptrisiken & Risikominimierung',
};

export const FeasibilityChecklist: React.FC = () => {
  const { t } = useLanguage();
  const { currentUser, canReviewFeasibility } = useAuthRole();
  const { activeProject, updateProject } = useProjects();

  const [checks, setChecks] = useState<FeasibilityRequirement[]>(() => {
    return activeProject ? JSON.parse(JSON.stringify(activeProject.feasibilityChecks)) : [];
  });
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Sync if activeProject updates
  React.useEffect(() => {
    if (activeProject) {
      setChecks(JSON.parse(JSON.stringify(activeProject.feasibilityChecks)));
    }
  }, [activeProject]);

  const handleStatusChange = (id: string, status: ReadinessStatus) => {
    setChecks((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            status,
            lastVerifiedDate: status === 'verified' ? new Date().toISOString().split('T')[0] : c.lastVerifiedDate,
            verifiedBy: status === 'verified' ? currentUser.name : c.verifiedBy,
          };
        }
        return c;
      })
    );
  };

  const handleUpdateField = (id: string, field: keyof FeasibilityRequirement, val: string) => {
    setChecks((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: val } : c))
    );
  };

  const handleAddRequirement = () => {
    const newItem: FeasibilityRequirement = {
      id: 'fc_' + Date.now(),
      category: 'technical_feasibility',
      title: 'Neuer Prüfpunkt zur Machbarkeit',
      description: 'Genaue Prüfkriterien beschreiben...',
      status: 'under_review',
    };
    setChecks([newItem, ...checks]);
  };

  const handleSave = async () => {
    if (!activeProject) return;
    await updateProject({
      ...activeProject,
      feasibilityChecks: checks,
    });
    setSaveMsg('Machbarkeitskatalog erfolgreich aktualisiert.');
    setTimeout(() => setSaveMsg(null), 3000);
  };

  const verifiedCount = checks.filter((c) => c.status === 'verified').length;
  const underReviewCount = checks.filter((c) => c.status === 'under_review').length;
  const missingInfoCount = checks.filter((c) => c.status === 'missing_information').length;

  const filteredChecks =
    filterCategory === 'all' ? checks : checks.filter((c) => c.category === filterCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
              Modul C
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Due Diligence & Governance Readiness
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Machbarkeits- & Governance-Checkliste
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
            Sorgfältige Prüfung der 10 Dimensionen vor Mittelbindung. Fehlende Informationen werden
            niemals als Null oder Negativbefund interpretiert, sondern als Klärungsbedarf markiert.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canReviewFeasibility() && (
            <button
              onClick={handleAddRequirement}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <Plus className="w-4 h-4 text-slate-600" />
              <span>Prüfpunkt hinzufügen</span>
            </button>
          )}

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Checkliste speichern</span>
          </button>
        </div>
      </div>

      {saveMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-4 py-2.5 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveMsg}</span>
        </div>
      )}

      {/* Status Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Geprüft & Belegt</span>
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-1">{verifiedCount}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5">Dokumente/Nachweise vorhanden</div>
        </div>

        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 text-blue-800 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>In Begutachtung</span>
          </div>
          <div className="text-2xl font-black text-blue-900 mt-1">{underReviewCount}</div>
          <div className="text-[11px] text-blue-700 mt-0.5">Prüfbericht noch ausstehend</div>
        </div>

        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
          <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>Fehlende Info (Offen)</span>
          </div>
          <div className="text-2xl font-black text-amber-900 mt-1">{missingInfoCount}</div>
          <div className="text-[11px] text-amber-700 mt-0.5">Erfordert Vor-Ort-Rücksprache</div>
        </div>

        <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-slate-800 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-slate-600" />
            <span>Gesamt Prüfpunkte</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{checks.length}</div>
          <div className="text-[11px] text-slate-600 mt-0.5">Verifizierungsquote: {checks.length > 0 ? Math.round((verifiedCount / checks.length) * 100) : 0}%</div>
        </div>
      </div>

      {/* Filter by Category */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="font-semibold text-slate-500 whitespace-nowrap">Kategorie filtern:</span>
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-colors ${
            filterCategory === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Alle ({checks.length})
        </button>
        {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => {
          const count = checks.filter((c) => c.category === catKey).length;
          if (count === 0) return null;
          return (
            <button
              key={catKey}
              onClick={() => setFilterCategory(catKey)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-colors ${
                filterCategory === catKey
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Checklist Table / Items */}
      <div className="space-y-3">
        {filteredChecks.map((item) => (
          <div
            key={item.id}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {CATEGORY_LABELS[item.category] || item.category}
                  </span>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleUpdateField(item.id, 'title', e.target.value)}
                    className="font-bold text-sm text-slate-900 focus:outline-none focus:border-b focus:border-emerald-500"
                  />
                </div>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleUpdateField(item.id, 'description', e.target.value)}
                  className="text-xs text-slate-600 w-full focus:outline-none focus:border-b focus:border-emerald-500"
                />
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold text-slate-500">Status:</span>
                <select
                  value={item.status}
                  onChange={(e) =>
                    handleStatusChange(item.id, e.target.value as ReadinessStatus)
                  }
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-none cursor-pointer ${
                    item.status === 'verified'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : item.status === 'under_review'
                      ? 'bg-blue-50 text-blue-800 border-blue-300'
                      : item.status === 'missing_information'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  <option value="not_assessed">Noch nicht geprüft</option>
                  <option value="missing_information">Fehlende Information</option>
                  <option value="under_review">In Begutachtung</option>
                  <option value="verified">Geprüft & Verifiziert</option>
                  <option value="not_applicable">Nicht zutreffend (N/A)</option>
                </select>
              </div>
            </div>

            {/* Evidence & Verification Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                  Nachweisquelle / Belegdokument (Evidence Source)
                </label>
                <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded border border-slate-200">
                  <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={item.evidenceSource || ''}
                    onChange={(e) => handleUpdateField(item.id, 'evidenceSource', e.target.value)}
                    placeholder="z.B. Gutachten Akku-Lebensdauer v2, MoU Partner Douala..."
                    className="w-full bg-transparent text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                  Gutachter-Anmerkungen & Vor-Ort-Befund
                </label>
                <input
                  type="text"
                  value={item.notes || ''}
                  onChange={(e) => handleUpdateField(item.id, 'notes', e.target.value)}
                  placeholder="Ergebnisse, offene Fragen oder Auflagen des Gutachters..."
                  className="w-full bg-slate-50 p-2 rounded border border-slate-200 text-xs text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {item.lastVerifiedDate && (
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>
                  Zuletzt geprüft am: <strong className="text-slate-600">{item.lastVerifiedDate}</strong>
                </span>
                {item.verifiedBy && (
                  <span>
                    Verifiziert durch: <strong className="text-slate-600">{item.verifiedBy}</strong>
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
