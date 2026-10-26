import React from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  PlayCircle,
  PauseCircle,
  Award,
  Wallet,
  Receipt,
  PiggyBank,
  TrendingDown,
  CalendarX,
  AlertTriangle,
  Users,
  Vote,
  Info,
  ArrowUpRight,
} from 'lucide-react';
import { Project, InventoryAsset } from '../../types';
import { KPICardDef, IntelligenceFilters, IntelligenceViewTab } from './types';

interface ExecutiveOverviewTabProps {
  projects: Project[];
  filteredProjects: Project[];
  inventory: InventoryAsset[];
  filters: IntelligenceFilters;
  onSelectKpiForFormula: (kpi: KPICardDef) => void;
  onNavigateView: (view: IntelligenceViewTab, filterChanges?: Partial<IntelligenceFilters>) => void;
  kpis: KPICardDef[];
}

export const ExecutiveOverviewTab: React.FC<ExecutiveOverviewTabProps> = ({
  projects,
  filteredProjects,
  inventory,
  filters,
  onSelectKpiForFormula,
  onNavigateView,
  kpis,
}) => {
  // Financial computations
  const totalBudget = filteredProjects.reduce(
    (sum, p) =>
      sum +
      (p.budgetItems?.reduce((bSum, b) => bSum + (b.approvedBudget || b.plannedCost || 0), 0) ||
        p.proposal?.estimatedBudgetEUR ||
        0),
    0
  );

  const confirmedFunding = filteredProjects.reduce(
    (sum, p) =>
      sum +
      (p.fundingSources
        ?.filter((f) => f.status === 'confirmed')
        .reduce(
          (fSum, f) =>
            fSum + (f.currency === 'XAF' ? Math.round(f.amount / 655.957) : f.amount),
          0
        ) || 0),
    0
  );

  const pendingFunding = filteredProjects.reduce(
    (sum, p) =>
      sum +
      (p.fundingSources
        ?.filter((f) => f.status === 'pending_application')
        .reduce(
          (fSum, f) =>
            fSum + (f.currency === 'XAF' ? Math.round(f.amount / 655.957) : f.amount),
          0
        ) || 0),
    0
  );

  const actualExpenditure = filteredProjects.reduce((sum, p) => {
    if (filters.reportingPeriod && filters.reportingPeriod !== 'all') {
      const periodTxs = (p.transactions || []).filter(
        (t) =>
          t.date.startsWith(filters.reportingPeriod) &&
          (filters.budgetCategory === 'all' || t.category === filters.budgetCategory)
      );
      return (
        sum +
        periodTxs
          .filter((t) => t.type === 'expense')
          .reduce(
            (tSum, t) =>
              tSum + (t.currency === 'XAF' ? Math.round(t.amount / 655.957) : t.amount),
            0
          )
      );
    }
    const items =
      filters.budgetCategory !== 'all'
        ? p.budgetItems?.filter((b) => b.category === filters.budgetCategory)
        : p.budgetItems;
    return sum + (items?.reduce((bSum, b) => bSum + (b.actualExpenditure || 0), 0) || 0);
  }, 0);

  const openFundingGap = Math.max(0, totalBudget - confirmedFunding);

  // Status breakdown
  const statusCounts: Record<string, number> = {};
  filteredProjects.forEach((p) => {
    statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
  });

  const statusColors: Record<string, string> = {
    Draft: '#94a3b8',
    'Under Review': '#f59e0b',
    Approved: '#10b981',
    Fundraising: '#6366f1',
    'Ready for Implementation': '#06b6d4',
    'In Progress': '#3b82f6',
    'On Hold': '#eab308',
    Completed: '#14b8a6',
    Closed: '#64748b',
    Rejected: '#f43f5e',
  };

  // Overdue milestones list (filtered by reportingPeriod if set)
  const today = new Date().toISOString().split('T')[0];
  const overdueMilestonesList: { project: Project; title: string; dueDate: string }[] = [];
  filteredProjects.forEach((p) => {
    p.milestones?.forEach((m) => {
      if (
        filters.reportingPeriod &&
        filters.reportingPeriod !== 'all' &&
        !m.targetDate.startsWith(filters.reportingPeriod)
      ) {
        return;
      }
      if (!m.isCompleted && m.targetDate < today) {
        overdueMilestonesList.push({ project: p, title: m.title, dueDate: m.targetDate });
      }
    });
  });

  // Open high-priority risks
  const openHighRisksList: { project: Project; description: string; priority: string }[] = [];
  filteredProjects.forEach((p) => {
    p.risks?.forEach((r) => {
      if (r.status === 'active' && (r.impact === 'high' || r.probability === 'high')) {
        openHighRisksList.push({
          project: p,
          description: r.description || r.category,
          priority: r.impact === 'high' && r.probability === 'high' ? 'Kritisch' : 'Hoch',
        });
      }
    });
  });

  return (
    <div className="space-y-6">
      {/* Empty State when no projects match filters */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Info className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-[#0f2b48] text-base mb-1">Keine Projekte gefunden</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            Für die gewählte Filterkombination liegen aktuell keine Datensätze vor. Bitte passen Sie die Filter im oberen Bereich an.
          </p>
          <button
            onClick={() => onNavigateView('executive', { projectId: 'all', country: 'all', category: 'all', status: 'all', reportingPeriod: 'all', budgetCategory: 'all', riskPriority: 'all', environment: 'all' })}
            className="px-4 py-2 bg-[#0f2b48] text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
          >
            Alle Filter zurücksetzen
          </button>
        </div>
      ) : (
        <>
          {/* 14 Interactive KPI Cards Grid */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-[#0f2b48] text-sm md:text-base tracking-tight">
                  Executive Key Performance Indicators (14 Leitmetriken)
                </h3>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  • Interaktiv: Klick filtert Teilbereich • &apos;i&apos; zeigt Formel
                </span>
              </div>
              <button
                onClick={() => onSelectKpiForFormula(kpis[0])}
                className="text-xs text-[#0f2b48] hover:text-blue-700 font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                <Info className="w-3.5 h-3.5 text-blue-600" /> Formelkatalog einsehen
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
              {kpis.map((kpi) => {
                const isEmerald = kpi.badgeColor === 'emerald';
                const isAmber = kpi.badgeColor === 'amber';
                const isRose = kpi.badgeColor === 'rose';

                return (
                  <div
                    key={kpi.id}
                    onClick={() => onNavigateView(kpi.targetView, kpi.filterAction)}
                    className={`group relative bg-white rounded-xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-md ${
                      isEmerald
                        ? 'border-slate-200 hover:border-emerald-400'
                        : isAmber
                        ? 'border-slate-200 hover:border-amber-400'
                        : isRose
                        ? 'border-slate-200 hover:border-rose-400'
                        : 'border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <span className="text-[11px] font-semibold text-slate-500 line-clamp-1 group-hover:text-[#0f2b48] transition-colors">
                          {kpi.label}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectKpiForFormula(kpi);
                          }}
                          title="Berechnungsformel anzeigen"
                          className="p-1 -mr-1 -mt-1 text-slate-300 hover:text-[#0f2b48] hover:bg-slate-100 rounded transition-colors"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-baseline gap-1.5 my-1">
                        <span className="text-2xl font-black font-mono tracking-tight text-slate-900">
                          {kpi.isUnknown ? (
                            <span className="text-sm font-semibold text-slate-400">N/A</span>
                          ) : (
                            kpi.value
                          )}
                        </span>
                      </div>

                      {kpi.subValue && (
                        <div className="text-[11px] text-slate-500 line-clamp-1">
                          {kpi.subValue}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded ${
                          isEmerald
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/50'
                            : isAmber
                            ? 'bg-amber-50 text-amber-900 border border-amber-200/50'
                            : isRose
                            ? 'bg-rose-50 text-rose-800 border border-rose-200/50'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {kpi.badge || 'Aktiv'}
                      </span>
                      <span className="text-[#0f2b48] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 font-bold">
                        Details <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Charts Row: Larger, more readable charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Financial Flow Overview */}
            <div className="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-bold text-[#0f2b48] text-base">Finanzcontrolling & Fördermittelstatus</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Gegenüberstellung: Genehmigtes Budget vs. gesicherte Mittel vs. offene Lücke
                  </p>
                </div>
                <button
                  onClick={() => onNavigateView('finance')}
                  className="text-xs font-semibold text-[#0f2b48] hover:text-blue-700 hover:underline flex items-center gap-1"
                >
                  Finanzen öffnen →
                </button>
              </div>

              {/* Multi-tier Visual Bar Breakdown */}
              <div className="space-y-4 pt-1">
                {/* 1. Approved Budget */}
                <div>
                  <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                    <span className="text-slate-800 flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-slate-600" />
                      Genehmigtes Gesamtbudget (100%)
                    </span>
                    <span className="font-mono text-slate-900 font-bold text-sm">
                      {totalBudget.toLocaleString('de-DE')} €
                    </span>
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-800 rounded-full w-full" />
                  </div>
                </div>

                {/* 2. Confirmed Funding */}
                <div>
                  <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                    <span className="text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Bestätigte Fördermittel (Vertraglich gesichert)
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 font-mono">
                        {totalBudget > 0 ? Math.round((confirmedFunding / totalBudget) * 100) : 0}%
                      </span>
                      <span className="font-mono text-emerald-800 font-bold text-sm">
                        {confirmedFunding.toLocaleString('de-DE')} €
                      </span>
                    </div>
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all"
                      style={{ width: `${totalBudget > 0 ? Math.min(100, (confirmedFunding / totalBudget) * 100) : 0}%` }}
                    />
                  </div>
                </div>

                {/* 3. Actual Outflow */}
                <div>
                  <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                    <span className="text-slate-700 flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-slate-600" />
                      Bisheriger Ist-Mittelabfluss (Ausgaben mit Beleg)
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-mono">
                        {totalBudget > 0 ? ((actualExpenditure / totalBudget) * 100).toFixed(1) : 0}%
                      </span>
                      <span className="font-mono text-slate-800 font-bold text-sm">
                        {actualExpenditure.toLocaleString('de-DE')} €
                      </span>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{ width: `${totalBudget > 0 ? Math.min(100, (actualExpenditure / totalBudget) * 100) : 0}%` }}
                    />
                  </div>
                </div>

                {/* 4. Open Funding Gap */}
                <div>
                  <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                    <span className="text-rose-800 flex items-center gap-1.5">
                      <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                      Offene Finanzierungslücke (Bedarf)
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200/60 font-mono">
                        {totalBudget > 0 ? Math.round((openFundingGap / totalBudget) * 100) : 0}%
                      </span>
                      <span className="font-mono text-rose-800 font-bold text-sm">
                        {openFundingGap.toLocaleString('de-DE')} €
                      </span>
                    </div>
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all"
                      style={{ width: `${totalBudget > 0 ? Math.min(100, (openFundingGap / totalBudget) * 100) : 0}%` }}
                    />
                  </div>
                </div>

                {/* 5. Pending Applications */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                    <span className="text-amber-800 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Beantragte (Noch unbestätigte) Mittel
                    </span>
                    <span className="font-mono text-amber-900 font-bold text-sm">
                      {pendingFunding.toLocaleString('de-DE')} €
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{ width: `${totalBudget > 0 ? Math.min(100, (pendingFunding / totalBudget) * 100) : 0}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 italic flex items-center gap-1">
                    <span>* Hinweis: Beantragte Mittel gelten laut TEFA-Governance nicht als Deckung.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Status Distribution */}
            <div className="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-bold text-[#0f2b48] text-base">Portfolio nach Projektstatus</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verteilung aller {filteredProjects.length} Vorhaben nach Reifegrad
                  </p>
                </div>
                <button
                  onClick={() => onNavigateView('portfolio')}
                  className="text-xs font-semibold text-[#0f2b48] hover:text-blue-700 hover:underline flex items-center gap-1"
                >
                  Portfolio öffnen →
                </button>
              </div>

              {/* Status Visual Distribution Bar */}
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
                {Object.entries(statusCounts).map(([status, count]) => {
                  const pct = filteredProjects.length > 0 ? (count / filteredProjects.length) * 100 : 0;
                  return (
                    <div
                      key={status}
                      style={{
                        width: `${pct}%`,
                        backgroundColor: statusColors[status] || '#94a3b8',
                      }}
                      title={`${status}: ${count} (${Math.round(pct)}%)`}
                      className="h-full transition-all first:rounded-l-full last:rounded-r-full"
                    />
                  );
                })}
              </div>

              {/* Itemized Status Cards */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {Object.entries(statusCounts).map(([status, count]) => {
                  const pct = filteredProjects.length > 0 ? Math.round((count / filteredProjects.length) * 100) : 0;
                  return (
                    <div
                      key={status}
                      onClick={() => onNavigateView('portfolio', { status })}
                      className="p-3 rounded-xl border border-slate-200/90 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-300 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                          style={{ backgroundColor: statusColors[status] || '#94a3b8' }}
                        />
                        <div>
                          <div className="text-xs font-semibold text-slate-800">{status}</div>
                          <div className="text-[10px] text-slate-400">{pct}% des Portfolios</div>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-sm text-[#0f2b48]">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Items: Overdue Milestones & Critical Risks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Overdue Milestones */}
            <div className="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CalendarX className="w-4 h-4 text-rose-600" />
                  <h4 className="font-bold text-[#0f2b48] text-base">
                    Überfällige Meilensteine ({overdueMilestonesList.length})
                  </h4>
                </div>
                <button
                  onClick={() => onNavigateView('planning')}
                  className="text-xs font-semibold text-[#0f2b48] hover:text-blue-700 hover:underline"
                >
                  Gantt-Planung öffnen →
                </button>
              </div>

              {overdueMilestonesList.length === 0 ? (
                <div className="p-4 bg-emerald-50/80 border border-emerald-200/70 text-emerald-800 rounded-xl text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Alle Meilensteine im aktuellen Portfolio liegen im Soll-Zeitplan. Keine Terminverzögerungen.</span>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {overdueMilestonesList.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl flex items-center justify-between text-xs hover:bg-rose-50 transition-colors"
                    >
                      <div className="pr-3">
                        <div className="font-bold text-rose-950 text-xs">{item.title}</div>
                        <div className="text-[11px] text-rose-800 font-medium mt-0.5">
                          {item.project.title} · <span className="font-mono font-bold">{item.project.referenceId}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-200/80 text-rose-900 inline-block mb-0.5">
                          Fällig: {item.dueDate}
                        </span>
                        <div className="text-[10px] text-rose-700 font-semibold">Verzug erfordert Beschluss</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* High-Priority Risks */}
            <div className="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <h4 className="font-bold text-[#0f2b48] text-base">
                    Offene Hoch- & Kritisch-Risiken ({openHighRisksList.length})
                  </h4>
                </div>
                <button
                  onClick={() => onNavigateView('risks')}
                  className="text-xs font-semibold text-[#0f2b48] hover:text-blue-700 hover:underline"
                >
                  Risikomatrix öffnen →
                </button>
              </div>

              {openHighRisksList.length === 0 ? (
                <div className="p-4 bg-emerald-50/80 border border-emerald-200/70 text-emerald-800 rounded-xl text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Keine offenen Hoch- oder Kritisch-Risiken erfasst. Risikoexposition im Normalbereich.</span>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {openHighRisksList.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between text-xs hover:bg-amber-50 transition-colors"
                    >
                      <div className="pr-3">
                        <div className="font-bold text-amber-950 text-xs">{item.description}</div>
                        <div className="text-[11px] text-amber-800 font-medium mt-0.5">
                          {item.project.title} · <span className="font-mono font-bold">{item.project.referenceId}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-200/90 text-amber-950 shrink-0">
                        {item.priority}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
