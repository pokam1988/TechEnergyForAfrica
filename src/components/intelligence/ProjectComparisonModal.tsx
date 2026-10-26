import React, { useState } from 'react';
import { X, Scale, CheckCircle2, AlertTriangle, Building, ShieldCheck } from 'lucide-react';
import { Project } from '../../types';

interface ProjectComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  activeProjectId?: string;
}

export const ProjectComparisonModal: React.FC<ProjectComparisonModalProps> = ({
  isOpen,
  onClose,
  projects,
  activeProjectId,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const list = ['proj_ifopsim_001', 'proj_gen_green_002', 'proj_dfg_003'];
    return list.filter((id) => projects.some((p) => p.id === id)).slice(0, 3);
  });

  if (!isOpen) return null;

  const toggleProject = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((x) => x !== id));
      }
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      } else {
        // replace last
        setSelectedIds([selectedIds[0], selectedIds[1], id]);
      }
    }
  };

  const comparedProjects = projects.filter((p) => selectedIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Vergleichende Projektportfolio-Analyse
              </h3>
              <p className="text-xs text-slate-500">
                Direkter Kennzahlen- & Governance-Vergleich ausgewählter TEFA-Vorhaben
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project selector bar */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs font-semibold text-slate-700">
            Vergleichskandidaten wählen (max. 3):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {projects.map((p) => {
              const isSelected = selectedIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => toggleProject(p.id)}
                  className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {p.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Comparison table */}
        <div className="p-6 overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-300">
                  <th className="p-3 bg-slate-50 font-bold text-slate-700 w-1/4">Dimension / Kriterium</th>
                  {comparedProjects.map((p) => (
                    <th key={p.id} className="p-3 bg-slate-50 font-bold text-slate-900 w-1/4">
                      <div className="text-sm">{p.title}</div>
                      <div className="text-[11px] font-mono text-blue-600">{p.referenceId}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3 font-semibold text-slate-700 bg-slate-50/50">Status & Phase</td>
                  {comparedProjects.map((p) => (
                    <td key={p.id} className="p-3">
                      <span className="px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-800">
                        {p.status}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-0.5">Phase: {p.lifecyclePhase}</div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-700 bg-slate-50/50">Länderkontext & Ort</td>
                  {comparedProjects.map((p) => (
                    <td key={p.id} className="p-3">
                      {p.country} ({p.locationDetails || 'Hauptstandort'})
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-700 bg-slate-50/50">Genehmigtes / Geplantes Budget</td>
                  {comparedProjects.map((p) => {
                    const total = p.budgetItems?.reduce((sum, b) => sum + (b.approvedBudget || b.plannedCost || 0), 0) || p.proposal?.estimatedBudgetEUR || 0;
                    return (
                      <td key={p.id} className="p-3 font-mono font-bold text-slate-900">
                        {total > 0 ? `${total.toLocaleString('de-DE')} €` : 'N/A'}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-700 bg-slate-50/50">Bestätigte Fördermittel</td>
                  {comparedProjects.map((p) => {
                    const confirmed = p.fundingSources?.filter((f) => f.status === 'confirmed').reduce((sum, f) => sum + (f.currency === 'XAF' ? Math.round(f.amount / 655.957) : f.amount), 0) || 0;
                    return (
                      <td key={p.id} className="p-3 font-mono text-emerald-700 font-bold">
                        {confirmed.toLocaleString('de-DE')} €
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-700 bg-slate-50/50">Beantragte (Ungesicherte) Mittel</td>
                  {comparedProjects.map((p) => {
                    const pending = p.fundingSources?.filter((f) => f.status === 'pending_application').reduce((sum, f) => sum + (f.currency === 'XAF' ? Math.round(f.amount / 655.957) : f.amount), 0) || 0;
                    return (
                      <td key={p.id} className="p-3 font-mono text-amber-700">
                        {pending.toLocaleString('de-DE')} €
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-700 bg-slate-50/50">Offene Finanzierungslücke</td>
                  {comparedProjects.map((p) => {
                    const total = p.budgetItems?.reduce((sum, b) => sum + (b.approvedBudget || b.plannedCost || 0), 0) || p.proposal?.estimatedBudgetEUR || 0;
                    const confirmed = p.fundingSources?.filter((f) => f.status === 'confirmed').reduce((sum, f) => sum + (f.currency === 'XAF' ? Math.round(f.amount / 655.957) : f.amount), 0) || 0;
                    const gap = Math.max(0, total - confirmed);
                    return (
                      <td key={p.id} className="p-3 font-mono font-bold text-rose-700">
                        {gap.toLocaleString('de-DE')} €
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-700 bg-slate-50/50">Meilensteine & Termintreue</td>
                  {comparedProjects.map((p) => {
                    const total = p.milestones?.length || 0;
                    const done = p.milestones?.filter((m) => m.isCompleted).length || 0;
                    const today = new Date().toISOString().split('T')[0];
                    const overdue = p.milestones?.filter((m) => !m.isCompleted && m.targetDate < today).length || 0;
                    return (
                      <td key={p.id} className="p-3">
                        <div>{done} / {total} abgeschlossen</div>
                        {overdue > 0 ? (
                          <div className="text-rose-600 font-semibold">{overdue} überfällig</div>
                        ) : (
                          <div className="text-emerald-600 font-medium">Im Zeitplan</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-700 bg-slate-50/50">Risikoprofil</td>
                  {comparedProjects.map((p) => {
                    const highRisks = p.risks?.filter((r) => r.status === 'active' && (r.impact === 'high' || r.probability === 'high')).length || 0;
                    return (
                      <td key={p.id} className="p-3">
                        {highRisks > 0 ? (
                          <span className="text-amber-700 font-bold">{highRisks} Hochrisiken offen</span>
                        ) : (
                          <span className="text-emerald-700">Keine kritischen Risiken</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-700 bg-slate-50/50">Begünstigte (Verifiziert vs Geplant)</td>
                  {comparedProjects.map((p) => {
                    const planned = p.proposal?.beneficiaryCountPlanned || 'N/A';
                    const verified = p.impactIndicators?.find((i) => i.evidenceStatus === 'verified')?.actual;
                    return (
                      <td key={p.id} className="p-3">
                        <div>Geplant: {planned}</div>
                        <div className="text-slate-500 text-[11px]">
                          Verifiziert: {verified !== undefined ? verified : 'Noch unbestätigt (Planungsphase)'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
