import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuthRole } from '../../context/AuthRoleContext';
import { useProjects } from '../../context/ProjectContext';
import { BudgetItem, FundingSource } from '../../types';
import {
  Wallet,
  DollarSign,
  TrendingUp,
  Plus,
  Save,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  Building,
  FileCheck,
} from 'lucide-react';

const EUR_TO_XAF_RATE = 655.957;

export const BudgetDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { currentUser, canApproveExpenses } = useAuthRole();
  const { activeProject, updateProject } = useProjects();

  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(() => {
    return activeProject ? JSON.parse(JSON.stringify(activeProject.budgetItems)) : [];
  });
  const [fundingSources, setFundingSources] = useState<FundingSource[]>(() => {
    return activeProject ? JSON.parse(JSON.stringify(activeProject.fundingSources)) : [];
  });
  const [currencyView, setCurrencyView] = useState<'EUR' | 'XAF'>('EUR');
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (activeProject) {
      setBudgetItems(JSON.parse(JSON.stringify(activeProject.budgetItems)));
      setFundingSources(JSON.parse(JSON.stringify(activeProject.fundingSources)));
    }
  }, [activeProject]);

  // Calculations
  const totalPlannedEUR = budgetItems.reduce((acc, i) => acc + i.plannedCost, 0);
  const totalApprovedEUR = budgetItems.reduce((acc, i) => acc + i.approvedBudget, 0);
  const totalCommittedEUR = budgetItems.reduce((acc, i) => acc + i.committedCost, 0);
  const totalActualEUR = budgetItems.reduce((acc, i) => acc + i.actualExpenditure, 0);

  const confirmedFundingEUR = fundingSources
    .filter((f) => f.status === 'confirmed')
    .reduce((acc, f) => acc + f.amount, 0);

  const pendingFundingEUR = fundingSources
    .filter((f) => f.status === 'pending_application')
    .reduce((acc, f) => acc + f.amount, 0);

  const unfundedGapEUR = Math.max(0, totalPlannedEUR - confirmedFundingEUR);

  const formatAmount = (eurAmount: number) => {
    if (currencyView === 'XAF') {
      const xaf = eurAmount * EUR_TO_XAF_RATE;
      return `${xaf.toLocaleString(undefined, { maximumFractionDigits: 0 })} XAF`;
    }
    return `€ ${eurAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleSaveBudget = async () => {
    if (!activeProject) return;
    await updateProject({
      ...activeProject,
      budgetItems,
      fundingSources,
    });
    setSaveMsg('Budget- und Finanzierungsstruktur erfolgreich aktualisiert.');
    setTimeout(() => setSaveMsg(null), 3000);
  };

  const handleAddBudgetItem = () => {
    const newItem: BudgetItem = {
      id: 'b_' + Date.now(),
      category: 'Training & Pedagogy',
      description: 'Neue Kostenposition',
      plannedCost: 1000,
      approvedBudget: 1000,
      committedCost: 0,
      actualExpenditure: 0,
      currency: 'EUR',
    };
    setBudgetItems([...budgetItems, newItem]);
  };

  const handleAddFundingSource = () => {
    const newSource: FundingSource = {
      id: 'f_' + Date.now(),
      name: 'Neue Förderquelle / Stiftung',
      type: 'grant',
      status: 'pending_application',
      amount: 5000,
      currency: 'EUR',
      isRestricted: true,
      notes: 'Antrag in Vorbereitung (Noch nicht bestätigt!)',
    };
    setFundingSources([...fundingSources, newSource]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Modul E
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Finanzplanung & Mittelabstimmung
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Projektbudget & Finanzierungsstruktur
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Nonprofit-Budgetierung in EUR und XAF (FCFA). Strikte Trennung von bestätigten Mitteln und
            unverbindlichen Förderanträgen.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Currency Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setCurrencyView('EUR')}
              className={`px-3 py-1 rounded-md font-bold transition-colors ${
                currencyView === 'EUR' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              EUR (€)
            </button>
            <button
              onClick={() => setCurrencyView('XAF')}
              className={`px-3 py-1 rounded-md font-bold transition-colors ${
                currencyView === 'XAF' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              XAF (FCFA)
            </button>
          </div>

          <button
            onClick={handleSaveBudget}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Budget sichern</span>
          </button>
        </div>
      </div>

      {saveMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-4 py-2.5 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveMsg}</span>
        </div>
      )}

      {/* Financial Health Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Planned vs Approved */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
            Geplantes Gesamtbudget
          </span>
          <div className="text-2xl font-black text-slate-900">{formatAmount(totalPlannedEUR)}</div>
          <div className="text-xs text-slate-500 mt-1">
            Genehmigt: <strong className="text-slate-700">{formatAmount(totalApprovedEUR)}</strong>
          </div>
        </div>

        {/* Confirmed Funding */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-emerald-700 uppercase tracking-wider block mb-1">
            Bestätigte Finanzierung
          </span>
          <div className="text-2xl font-black text-emerald-600">
            {formatAmount(confirmedFundingEUR)}
          </div>
          <div className="text-xs text-emerald-700 mt-1 font-medium">
            Deckungsgrad: {totalPlannedEUR > 0 ? Math.round((confirmedFundingEUR / totalPlannedEUR) * 100) : 0}% des Bedarfs
          </div>
        </div>

        {/* Unfunded Gap */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-amber-700 uppercase tracking-wider block mb-1">
            Offene Finanzierungslücke
          </span>
          <div className="text-2xl font-black text-amber-600">
            {formatAmount(unfundedGapEUR)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            In Antragsprüfung: {formatAmount(pendingFundingEUR)}
          </div>
        </div>

        {/* Actual Expenses & Commitments */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
            Ist-Ausgaben & Gebunden
          </span>
          <div className="text-2xl font-black text-slate-900">{formatAmount(totalActualEUR)}</div>
          <div className="text-xs text-slate-500 mt-1">
            Obligo (Gebunden): {formatAmount(totalCommittedEUR)}
          </div>
        </div>
      </div>

      {/* Currency Exchange Notice Banner */}
      <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs text-slate-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Währungskurs-Annahme: <strong>1 EUR = 655,957 XAF</strong> (Fester Wechselkurs FCFA CEMAC
            an Euro). Transaktionen in XAF werden für die Buchhaltung tagesaktuell umgerechnet.
          </span>
        </div>
        <span className="font-mono text-[11px] text-slate-400 shrink-0">Stand: 2026</span>
      </div>

      {/* Budget Items Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Budgetposten nach Kostenarten (Soll-Ist-Abgleich)
          </h2>
          <button
            onClick={handleAddBudgetItem}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Kostenposition hinzufügen</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Kategorie</th>
                <th className="py-2.5 px-3">Beschreibung</th>
                <th className="py-2.5 px-3 text-right">Geplant (Plan)</th>
                <th className="py-2.5 px-3 text-right">Freigegeben</th>
                <th className="py-2.5 px-3 text-right">Gebunden (Obligo)</th>
                <th className="py-2.5 px-3 text-right">Ist-Ausgaben</th>
                <th className="py-2.5 px-3 text-center">Verbrauch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {budgetItems.map((item, idx) => {
                const pct =
                  item.plannedCost > 0
                    ? Math.round((item.actualExpenditure / item.plannedCost) * 100)
                    : 0;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                      {item.category}
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...budgetItems];
                          updated[idx].description = e.target.value;
                          setBudgetItems(updated);
                        }}
                        className="w-full bg-transparent focus:outline-none focus:border-b focus:border-emerald-500 text-slate-700"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                      <input
                        type="number"
                        value={item.plannedCost}
                        onChange={(e) => {
                          const updated = [...budgetItems];
                          updated[idx].plannedCost = parseFloat(e.target.value) || 0;
                          setBudgetItems(updated);
                        }}
                        className="w-24 text-right bg-transparent border-b border-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700">
                      {formatAmount(item.approvedBudget)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {formatAmount(item.committedCost)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {formatAmount(item.actualExpenditure)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          pct > 100
                            ? 'bg-rose-100 text-rose-800'
                            : pct > 80
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {pct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300">
              <tr>
                <td colSpan={2} className="py-3 px-3 text-slate-900">
                  SUMME
                </td>
                <td className="py-3 px-3 text-right text-slate-900">
                  {formatAmount(totalPlannedEUR)}
                </td>
                <td className="py-3 px-3 text-right text-slate-900">
                  {formatAmount(totalApprovedEUR)}
                </td>
                <td className="py-3 px-3 text-right text-slate-900">
                  {formatAmount(totalCommittedEUR)}
                </td>
                <td className="py-3 px-3 text-right text-emerald-700">
                  {formatAmount(totalActualEUR)}
                </td>
                <td className="py-3 px-3 text-center">
                  {totalPlannedEUR > 0 ? Math.round((totalActualEUR / totalPlannedEUR) * 100) : 0}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Funding Sources Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Finanzierungsquellen & Förderzusagen (Funding Sources)
          </h2>
          <button
            onClick={handleAddFundingSource}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Förderquelle hinzufügen</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Geldgeber / Quelle</th>
                <th className="py-2.5 px-3">Art</th>
                <th className="py-2.5 px-3">Verbindlichkeit (Status)</th>
                <th className="py-2.5 px-3 text-right">Betrag</th>
                <th className="py-2.5 px-3">Zweckbindung</th>
                <th className="py-2.5 px-3">Anmerkungen / Frist</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fundingSources.map((source, idx) => (
                <tr key={source.id} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 font-semibold text-slate-800">
                    <input
                      type="text"
                      value={source.name}
                      onChange={(e) => {
                        const updated = [...fundingSources];
                        updated[idx].name = e.target.value;
                        setFundingSources(updated);
                      }}
                      className="w-full bg-transparent focus:outline-none focus:border-b focus:border-emerald-500"
                    />
                  </td>
                  <td className="py-2.5 px-3 capitalize text-slate-600">{source.type}</td>
                  <td className="py-2.5 px-3">
                    <select
                      value={source.status}
                      onChange={(e) => {
                        const updated = [...fundingSources];
                        updated[idx].status = e.target.value as FundingSource['status'];
                        setFundingSources(updated);
                      }}
                      className={`text-[11px] font-bold px-2 py-1 rounded border focus:outline-none ${
                        source.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : source.status === 'pending_application'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      <option value="confirmed">Bestätigt & Fest zugesagt</option>
                      <option value="pending_application">Beantragt (Noch offen)</option>
                      <option value="potential_pipeline">Pipeline / Vorprüfung</option>
                      <option value="rejected">Abgelehnt</option>
                    </select>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                    <input
                      type="number"
                      value={source.amount}
                      onChange={(e) => {
                        const updated = [...fundingSources];
                        updated[idx].amount = parseFloat(e.target.value) || 0;
                        setFundingSources(updated);
                      }}
                      className="w-24 text-right bg-transparent border-b border-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        source.isRestricted
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {source.isRestricted ? 'Zweckgebunden' : 'Freie Mittel'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">{source.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
