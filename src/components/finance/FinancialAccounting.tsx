import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuthRole } from '../../context/AuthRoleContext';
import { useProjects } from '../../context/ProjectContext';
import { FinancialTransaction } from '../../types';
import {
  Receipt,
  Plus,
  Save,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ArrowRightLeft,
  DollarSign,
  Download,
  ShieldCheck,
  Eye,
} from 'lucide-react';

const EUR_TO_XAF = 655.957;

export const FinancialAccounting: React.FC = () => {
  const { t } = useLanguage();
  const { currentUser, canApproveExpenses } = useAuthRole();
  const { activeProject, updateProject } = useProjects();

  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    return activeProject ? JSON.parse(JSON.stringify(activeProject.transactions)) : [];
  });

  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<FinancialTransaction | null>(null);

  React.useEffect(() => {
    if (activeProject) {
      setTransactions(JSON.parse(JSON.stringify(activeProject.transactions)));
    }
  }, [activeProject]);

  const handleSaveTransactions = async () => {
    if (!activeProject) return;

    // Recalculate actual expenditures in budget items
    const updatedBudgetItems = activeProject.budgetItems.map((bi) => {
      const catExpenses = transactions
        .filter((t) => t.category === bi.category && t.type === 'expense' && t.paymentStatus === 'paid')
        .reduce((sum, t) => sum + t.accountingAmountEUR, 0);
      return {
        ...bi,
        actualExpenditure: catExpenses,
      };
    });

    await updateProject({
      ...activeProject,
      transactions,
      budgetItems: updatedBudgetItems,
    });
    setSaveMsg('Buchungsjournal und Verwendungsnachweis erfolgreich aktualisiert.');
    setTimeout(() => setSaveMsg(null), 3000);
  };

  const handleAddTransaction = () => {
    const newTx: FinancialTransaction = {
      id: 'tx_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      description: 'Neue Ausgabe / Materialkauf',
      category: 'Equipment & Hardware',
      costCenter: 'CC-CMR-OPS-01',
      type: 'expense',
      amount: 150,
      currency: 'EUR',
      exchangeRate: 1,
      accountingAmountEUR: 150,
      paymentStatus: 'draft',
      receiptAttached: true,
      receiptFileName: `Beleg_Material_${Date.now().toString().slice(-4)}.pdf`,
      payerOrVendor: 'Lokaler Fachhandel',
      recordedBy: currentUser.name,
    };
    setTransactions([newTx, ...transactions]);
  };

  const handleStatusChange = (
    txId: string,
    newStatus: FinancialTransaction['paymentStatus']
  ) => {
    if (newStatus === 'approved' || newStatus === 'paid') {
      if (!canApproveExpenses()) {
        alert('Zugriff verweigert: Nur Finanzbeauftragte oder Administratoren dürfen Ausgaben autorisieren!');
        return;
      }
    }

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === txId
          ? {
              ...t,
              paymentStatus: newStatus,
              reviewedBy: newStatus === 'reviewed' ? currentUser.name : t.reviewedBy,
              approvedBy: newStatus === 'approved' || newStatus === 'paid' ? currentUser.name : t.approvedBy,
            }
          : t
      )
    );
  };

  const totalExpenseEUR = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.accountingAmountEUR, 0);

  const missingReceiptsCount = transactions.filter((t) => !t.receiptAttached).length;

  const filteredTx =
    filterType === 'all'
      ? transactions
      : transactions.filter((t) => t.type === filterType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Modul J
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Finanzbuchhaltung, Belege & Nachweise
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Projektbuchhaltung & Verwendungsnachweis (VwN)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
            Lückenloses Kassen- und Bankbuch für TEFA-Projekte mit Zwei-Augen-Prinzip, Währungsumrechnung
            (EUR/XAF) und revisionssicherer Belegzuordnung.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddTransaction}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Plus className="w-4 h-4 text-slate-600" />
            <span>Beleg buchen</span>
          </button>
          <button
            onClick={handleSaveTransactions}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Buchungen festschreiben</span>
          </button>
        </div>
      </div>

      {saveMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-4 py-2.5 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveMsg}</span>
        </div>
      )}

      {/* Accounting KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
            Gebuchte Gesamtausgaben (Ist)
          </span>
          <div className="text-2xl font-black text-slate-900">
            € {totalExpenseEUR.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Ca. {(totalExpenseEUR * EUR_TO_XAF).toLocaleString(undefined, { maximumFractionDigits: 0 })} XAF
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
            Belegvollständigkeit
          </span>
          <div className="text-2xl font-black text-emerald-600">
            {transactions.length > 0
              ? Math.round(
                  ((transactions.length - missingReceiptsCount) / transactions.length) * 100
                )
              : 100}
            %
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {missingReceiptsCount === 0
              ? 'Alle Buchungen haben Originalbelege'
              : `${missingReceiptsCount} Buchung(en) ohne Beleg!`}
          </div>
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
            Governance & Prüfstatus
          </span>
          <div className="text-sm font-bold text-white mt-1">
            {canApproveExpenses() ? 'Finanzfreigabe autorisiert' : 'Nur Lese-/Erfassungsrecht'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Angemeldet als: {currentUser.name}
          </div>
        </div>
      </div>

      {/* Transactions Ledger Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Buchungsjournal (General Ledger)
          </h2>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Filter:</span>
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded font-medium ${
                filterType === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Alle
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-2.5 py-1 rounded font-medium ${
                filterType === 'expense'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              Ausgaben
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-2.5 py-1 rounded font-medium ${
                filterType === 'income'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              Einnahmen
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Datum</th>
                <th className="py-2.5 px-3">Beschreibung & Empfänger</th>
                <th className="py-2.5 px-3">Kostenart / Kostenstelle</th>
                <th className="py-2.5 px-3 text-right">Originalbetrag</th>
                <th className="py-2.5 px-3 text-right">Buchungswert (EUR)</th>
                <th className="py-2.5 px-3 text-center">Beleg</th>
                <th className="py-2.5 px-3">Prüfstatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTx.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-3 font-mono text-slate-700 whitespace-nowrap">{tx.date}</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{tx.description}</div>
                    <div className="text-[11px] text-slate-500">
                      Zahlungsempfänger / Vendor: {tx.payerOrVendor}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-slate-800">{tx.category}</span>
                    <div className="text-[10px] text-slate-400 font-mono">{tx.costCenter}</div>
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-700">
                    {tx.amount.toLocaleString(undefined, {
                      minimumFractionDigits: tx.currency === 'EUR' ? 2 : 0,
                    })}{' '}
                    {tx.currency}
                    {tx.currency === 'XAF' && (
                      <div className="text-[10px] text-slate-400">Kurs: {tx.exchangeRate}</div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">
                    € {tx.accountingAmountEUR.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {tx.receiptAttached ? (
                      <button
                        onClick={() => setSelectedReceipt(tx)}
                        title="Beleg einsehen"
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900 font-medium"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        <span>PDF</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                        Fehlt!
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <select
                      value={tx.paymentStatus}
                      onChange={(e) =>
                        handleStatusChange(
                          tx.id,
                          e.target.value as FinancialTransaction['paymentStatus']
                        )
                      }
                      className={`text-[11px] font-bold px-2 py-1 rounded border focus:outline-none ${
                        tx.paymentStatus === 'paid' || tx.paymentStatus === 'approved'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : tx.paymentStatus === 'reviewed'
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      <option value="draft">Entwurf</option>
                      <option value="submitted">Eingereicht</option>
                      <option value="reviewed">Geprüft (Reviewer)</option>
                      <option value="approved">Freigegeben (Finance)</option>
                      <option value="paid">Bezahlt & Gebucht</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Preview Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Belegprüfung & Dokumentenansicht</h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800 text-sm">{selectedReceipt.description}</div>
                <div className="text-slate-500">Dateiname: {selectedReceipt.receiptFileName}</div>
                <div className="text-slate-500">
                  Rechnungssteller / Empfänger: {selectedReceipt.payerOrVendor}
                </div>
                <div className="text-slate-500">Datum: {selectedReceipt.date}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Betrag (Original)
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {selectedReceipt.amount.toLocaleString()} {selectedReceipt.currency}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Buchungsbetrag (EUR)
                  </span>
                  <span className="font-bold text-emerald-700 text-sm">
                    € {selectedReceipt.accountingAmountEUR.toFixed(2)}
                  </span>
                </div>
              </div>

              {selectedReceipt.receiptNotes && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-[11px]">
                  <span className="font-bold block">Prüfvermerk:</span>
                  {selectedReceipt.receiptNotes}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
