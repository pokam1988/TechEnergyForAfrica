import React from 'react';
import { Project, BudgetItem, FinancialTransaction, FundingSource } from '../../types';
import {
  Wallet,
  Receipt,
  PiggyBank,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  FileCheck,
  FileX,
  CreditCard,
  PieChart,
} from 'lucide-react';
import { useAuthRole } from '../../context/AuthRoleContext';

interface FinancialControllingTabProps {
  filteredProjects: Project[];
  onSelectProject: (id: string) => void;
  initialCategoryFilter?: string;
  reportingPeriod?: string;
}

export const FinancialControllingTab: React.FC<FinancialControllingTabProps> = ({
  filteredProjects,
  onSelectProject,
  initialCategoryFilter,
  reportingPeriod,
}) => {
  const { canViewInternalFinances } = useAuthRole();
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
    initialCategoryFilter && initialCategoryFilter !== 'all' ? initialCategoryFilter : null
  );

  React.useEffect(() => {
    if (initialCategoryFilter !== undefined) {
      setSelectedCategory(initialCategoryFilter !== 'all' ? initialCategoryFilter : null);
    }
  }, [initialCategoryFilter]);
  const EUR_TO_XAF = 655.957;

  // Flatten budget items and transactions
  const allBudgetItems: { project: Project; item: BudgetItem }[] = [];
  const allTransactions: { project: Project; tx: FinancialTransaction }[] = [];
  const allFundingSources: { project: Project; funding: FundingSource }[] = [];

  filteredProjects.forEach((p) => {
    p.budgetItems?.forEach((b) => allBudgetItems.push({ project: p, item: b }));
    p.transactions?.forEach((tx) => {
      if (!reportingPeriod || reportingPeriod === 'all' || tx.date.startsWith(reportingPeriod)) {
        allTransactions.push({ project: p, tx });
      }
    });
    p.fundingSources?.forEach((f) => allFundingSources.push({ project: p, funding: f }));
  });

  // Totals
  const plannedBudget = allBudgetItems.reduce((sum, { item }) => sum + (item.plannedCost || 0), 0);
  const approvedBudget = allBudgetItems.reduce(
    (sum, { item }) => sum + (item.approvedBudget || 0),
    0
  );
  const committedExpenditure = allBudgetItems.reduce(
    (sum, { item }) => sum + (item.committedCost || 0),
    0
  );
  const actualExpenditure =
    reportingPeriod && reportingPeriod !== 'all'
      ? allTransactions
          .filter(({ tx }) => tx.type === 'expense')
          .reduce(
            (sum, { tx }) =>
              sum + (tx.currency === 'XAF' ? Math.round(tx.amount / EUR_TO_XAF) : tx.amount),
            0
          )
      : allBudgetItems.reduce((sum, { item }) => sum + (item.actualExpenditure || 0), 0);

  const remainingApprovedBudget = approvedBudget - actualExpenditure;

  const confirmedFinancing = allFundingSources
    .filter(({ funding }) => funding.status === 'confirmed')
    .reduce(
      (sum, { funding }) =>
        sum + (funding.currency === 'XAF' ? Math.round(funding.amount / EUR_TO_XAF) : funding.amount),
      0
    );

  const pendingFinancing = allFundingSources
    .filter(({ funding }) => funding.status === 'pending_application')
    .reduce(
      (sum, { funding }) =>
        sum + (funding.currency === 'XAF' ? Math.round(funding.amount / EUR_TO_XAF) : funding.amount),
      0
    );

  const financingGap = Math.max(0, (approvedBudget || plannedBudget) - confirmedFinancing);
  const budgetVariance = approvedBudget - (actualExpenditure + committedExpenditure);

  // Spending by category
  const spendingByCategory: Record<string, { planned: number; approved: number; actual: number }> =
    {};
  allBudgetItems.forEach(({ item }) => {
    if (!spendingByCategory[item.category]) {
      spendingByCategory[item.category] = { planned: 0, approved: 0, actual: 0 };
    }
    spendingByCategory[item.category].planned += item.plannedCost || 0;
    spendingByCategory[item.category].approved += item.approvedBudget || 0;
    spendingByCategory[item.category].actual += item.actualExpenditure || 0;
  });

  // Missing receipts
  const missingReceiptTxs = allTransactions.filter(
    (item) => item.tx.type === 'expense' && !item.tx.receiptAttached
  );

  return (
    <div className="space-y-6">
      {/* Financial KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-sm transition-all">
          <div className="text-[11px] font-semibold text-slate-500 mb-1">Geplantes Budget</div>
          <div className="text-xl font-black font-mono text-slate-900">
            {plannedBudget.toLocaleString('de-DE')} €
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Antragswerte</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-sm transition-all">
          <div className="text-[11px] font-semibold text-[#0f2b48] mb-1">Genehmigtes Budget</div>
          <div className="text-xl font-black font-mono text-[#0f2b48]">
            {approvedBudget > 0 ? `${approvedBudget.toLocaleString('de-DE')} €` : 'N/A'}
          </div>
          <div className="text-[10px] text-blue-600 mt-1">Vorstandsbeschluss</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/10 shadow-xs hover:shadow-sm transition-all">
          <div className="text-[11px] font-semibold text-emerald-800 mb-1">Bestätigte Deckung</div>
          <div className="text-xl font-black font-mono text-emerald-800">
            {confirmedFinancing.toLocaleString('de-DE')} €
          </div>
          <div className="text-[10px] text-emerald-700 mt-1">Vertraglich gesichert</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200/80 bg-rose-50/10 shadow-xs hover:shadow-sm transition-all">
          <div className="text-[11px] font-semibold text-rose-800 mb-1">Finanzierungslücke</div>
          <div className="text-xl font-black font-mono text-rose-800">
            {financingGap.toLocaleString('de-DE')} €
          </div>
          <div className="text-[10px] text-rose-700 mt-1">Netto-Bedarf</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-sm transition-all">
          <div className="text-[11px] font-semibold text-slate-700 mb-1">Ist-Ausgaben (Abfluss)</div>
          <div className="text-xl font-black font-mono text-slate-900">
            {actualExpenditure.toLocaleString('de-DE')} €
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Verbuchte Ausgaben</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200/80 bg-amber-50/10 shadow-xs hover:shadow-sm transition-all">
          <div className="text-[11px] font-semibold text-amber-900 mb-1">Beantragte Mittel</div>
          <div className="text-xl font-black font-mono text-amber-900">
            {pendingFinancing.toLocaleString('de-DE')} €
          </div>
          <div className="text-[10px] text-amber-700 mt-1">Nicht als Deckung gezählt</div>
        </div>
      </div>

      {/* Audit Alert: Missing receipts */}
      {missingReceiptTxs.length > 0 && (
        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-950 uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            Revision & Verwendungsnachweis: {missingReceiptTxs.length} Ausgaben ohne archivierten Beleg
          </div>
          <div className="text-xs text-amber-900">
            Gemäß Gemeinnützigkeitsrecht und TEFA-Richtlinien dürfen Aufwendungen ohne Originalbelege nicht in den abschließenden Verwendungsnachweis aufgenommen werden.
          </div>
        </div>
      )}

      {/* Budget by Category Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#0f2b48]" />
            <h4 className="font-bold text-[#0f2b48] text-sm tracking-tight">
              Soll-Ist-Vergleich nach Kostenarten (Budgetkategorien)
            </h4>
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                Gefiltert: {selectedCategory}
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="ml-1 text-emerald-700 hover:text-emerald-950 font-bold"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500">
            Zeile anklicken zum Filtern • Währung: EUR
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th className="p-3">Kostenkategorie</th>
                <th className="p-3 text-right">Geplant (€)</th>
                <th className="p-3 text-right">Genehmigt (€)</th>
                <th className="p-3 text-right">Ist-Abfluss (€)</th>
                <th className="p-3 text-right">Restbudget (€)</th>
                <th className="p-3 text-center">Mittelabfluss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(spendingByCategory)
                .filter(([cat]) => !selectedCategory || cat === selectedCategory)
                .map(([cat, vals]) => {
                  const rest = vals.approved - vals.actual;
                  const pct = vals.approved > 0 ? Math.round((vals.actual / vals.approved) * 100) : 0;
                  const isSelected = selectedCategory === cat;
                  return (
                    <tr
                      key={cat}
                      onClick={() => setSelectedCategory(isSelected ? null : cat)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-emerald-50/70 font-semibold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-3 text-slate-800 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                        {cat}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-600">
                        {vals.planned.toLocaleString('de-DE')} €
                      </td>
                      <td className="p-3 text-right font-mono text-slate-900 font-bold">
                        {vals.approved > 0 ? `${vals.approved.toLocaleString('de-DE')} €` : 'N/A'}
                      </td>
                      <td className="p-3 text-right font-mono text-emerald-700 font-bold">
                        {vals.actual.toLocaleString('de-DE')} €
                      </td>
                      <td
                        className={`p-3 text-right font-mono font-bold ${
                          rest < 0 ? 'text-rose-700' : 'text-slate-800'
                        }`}
                      >
                        {vals.approved > 0 ? `${rest.toLocaleString('de-DE')} €` : 'N/A'}
                      </td>
                      <td className="p-3 text-center">
                        <div className="w-24 mx-auto bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full"
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5 inline-block">
                          {pct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail items table when a category is selected */}
      {selectedCategory && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-5 py-3 border-b border-slate-200 bg-emerald-50/40 flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Einzelne Budgetposten für &quot;{selectedCategory}&quot;
            </h4>
            <span className="text-[11px] text-emerald-800 font-semibold">
              {allBudgetItems.filter((i) => i.item.category === selectedCategory).length} Posten
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="p-3">Projekt</th>
                  <th className="p-3">Beschreibung</th>
                  <th className="p-3 text-right">Geplant (€)</th>
                  <th className="p-3 text-right">Genehmigt (€)</th>
                  <th className="p-3 text-right">Gebunden (€)</th>
                  <th className="p-3 text-right">Ist (€)</th>
                  <th className="p-3">Anmerkungen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allBudgetItems
                  .filter(({ item }) => item.category === selectedCategory)
                  .map(({ project, item }) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-blue-600 font-semibold">{project.referenceId}</td>
                      <td className="p-3 font-medium text-slate-800">{item.description}</td>
                      <td className="p-3 text-right font-mono text-slate-600">{(item.plannedCost || 0).toLocaleString('de-DE')} €</td>
                      <td className="p-3 text-right font-mono text-slate-900 font-bold">{(item.approvedBudget || 0).toLocaleString('de-DE')} €</td>
                      <td className="p-3 text-right font-mono text-amber-700">{(item.committedCost || 0).toLocaleString('de-DE')} €</td>
                      <td className="p-3 text-right font-mono text-emerald-700 font-bold">{(item.actualExpenditure || 0).toLocaleString('de-DE')} €</td>
                      <td className="p-3 text-slate-500 text-[11px]">{item.notes || '—'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
