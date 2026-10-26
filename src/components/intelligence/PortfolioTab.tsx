import React from 'react';
import { Project } from '../../types';
import { IntelligenceFilters } from './types';
import {
  Globe,
  Tag,
  User,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  BarChart2,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';

interface PortfolioTabProps {
  projects: Project[];
  filteredProjects: Project[];
  filters: IntelligenceFilters;
  onSelectProject: (id: string) => void;
  onOpenCompare: () => void;
}

export const PortfolioTab: React.FC<PortfolioTabProps> = ({
  projects,
  filteredProjects,
  filters,
  onSelectProject,
  onOpenCompare,
}) => {
  // Aggregate stats
  const countryCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  const managerCounts: Record<string, number> = {};

  filteredProjects.forEach((p) => {
    countryCounts[p.country] = (countryCounts[p.country] || 0) + 1;
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    const mgr = p.createdBy || 'Unbekannt';
    managerCounts[mgr] = (managerCounts[mgr] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Top summary & compare trigger */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="font-bold text-[#0f2b48] text-base tracking-tight">
            TEFA Projektportfolio ({filteredProjects.length} Vorhaben)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Strategische Verteilung nach Ländern, Themenschwerpunkten & Umsetzungsreife
          </p>
        </div>
        <button
          onClick={onOpenCompare}
          className="px-3.5 py-2 bg-[#0f2b48] hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Layers className="w-4 h-4" /> Projekte im Detail vergleichen
        </button>
      </div>

      {/* Distribution charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Country distribution */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-blue-600" /> Verteilung nach Ländern
          </div>
          <div className="space-y-2">
            {Object.entries(countryCounts).map(([country, count]) => {
              const pct = Math.round((count / (filteredProjects.length || 1)) * 100);
              return (
                <div key={country} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-700">
                    <span className="font-medium">{country}</span>
                    <span className="font-mono text-slate-500">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category distribution */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-emerald-600" /> Strategische Schwerpunkte
          </div>
          <div className="space-y-2">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / (filteredProjects.length || 1)) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-700">
                    <span className="font-medium capitalize">{cat.replace(/_/g, ' ')}</span>
                    <span className="font-mono text-slate-500">{count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Manager distribution */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
            <User className="w-4 h-4 text-amber-600" /> Projektverantwortung
          </div>
          <div className="space-y-2">
            {Object.entries(managerCounts).map(([mgr, count]) => {
              const pct = Math.round((count / (filteredProjects.length || 1)) * 100);
              return (
                <div key={mgr} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-700">
                    <span className="font-medium">{mgr}</span>
                    <span className="font-mono text-slate-500">{count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Portfolio Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Detaillierte Portfolio-Übersicht & Reifegrad
          </h4>
          <span className="text-[11px] text-slate-500">
            Zeile anklicken, um das Projekt im Hub zu öffnen
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th className="p-3">Ref-ID</th>
                <th className="p-3">Projektname & Thema</th>
                <th className="p-3">Land / Ort</th>
                <th className="p-3">Phase & Status</th>
                <th className="p-3 text-right">Budget (€)</th>
                <th className="p-3 text-right">Gesichert (€)</th>
                <th className="p-3 text-right">Lücke (€)</th>
                <th className="p-3 text-center">Meilensteine</th>
                <th className="p-3 text-center">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map((p) => {
                const total =
                  p.budgetItems?.reduce(
                    (sum, b) => sum + (b.approvedBudget || b.plannedCost || 0),
                    0
                  ) || p.proposal?.estimatedBudgetEUR || 0;
                const confirmed =
                  p.fundingSources
                    ?.filter((f) => f.status === 'confirmed')
                    .reduce(
                      (sum, f) =>
                        sum + (f.currency === 'XAF' ? Math.round(f.amount / 655.957) : f.amount),
                      0
                    ) || 0;
                const gap = Math.max(0, total - confirmed);

                const totalMs = p.milestones?.length || 0;
                const doneMs = p.milestones?.filter((m) => m.isCompleted).length || 0;

                return (
                  <tr
                    key={p.id}
                    onClick={() => onSelectProject(p.id)}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-mono font-bold text-blue-600">
                      {p.referenceId}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{p.title}</div>
                      <div className="text-[11px] text-slate-500 capitalize">
                        {p.category.replace(/_/g, ' ')}
                      </div>
                    </td>
                    <td className="p-3 text-slate-700">
                      {p.country}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-800">
                        {p.status}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5 capitalize">
                        {p.lifecyclePhase}
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono font-semibold text-slate-900">
                      {total.toLocaleString('de-DE')} €
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-700 font-bold">
                      {confirmed.toLocaleString('de-DE')} €
                    </td>
                    <td className="p-3 text-right font-mono text-rose-700 font-bold">
                      {gap.toLocaleString('de-DE')} €
                    </td>
                    <td className="p-3 text-center">
                      <span className="font-mono text-xs text-slate-700">
                        {doneMs}/{totalMs}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProject(p.id);
                        }}
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-white rounded"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
