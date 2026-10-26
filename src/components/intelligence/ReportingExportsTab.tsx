import React, { useState } from 'react';
import { Project, InventoryAsset } from '../../types';
import { IntelligenceFilters } from './types';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  CheckCircle2,
  Table,
  Building,
  ShieldCheck,
} from 'lucide-react';
import { useAuthRole } from '../../context/AuthRoleContext';

interface ReportingExportsTabProps {
  projects: Project[];
  filteredProjects: Project[];
  inventory: InventoryAsset[];
  filters: IntelligenceFilters;
}

export const ReportingExportsTab: React.FC<ReportingExportsTabProps> = ({
  projects,
  filteredProjects,
  inventory,
  filters,
}) => {
  const { currentUser } = useAuthRole();
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);

  const notifyDownload = (filename: string) => {
    setDownloadMsg(`Datei "${filename}" wurde erfolgreich generiert und heruntergeladen.`);
    setTimeout(() => setDownloadMsg(null), 4000);
  };

  // 1. Export CSV Data Table
  const handleExportCSV = () => {
    const headers = [
      'ReferenceId',
      'Title',
      'Country',
      'Category',
      'Status',
      'LifecyclePhase',
      'TotalBudgetEUR',
      'ConfirmedFundingEUR',
      'FundingGapEUR',
      'ActualExpenditureEUR',
      'PlannedBeneficiaries',
      'OverdueMilestones',
      'ActiveRisks',
      'Environment',
    ];

    const rows = filteredProjects.map((p) => {
      const budgetItemsFiltered =
        filters.budgetCategory !== 'all'
          ? p.budgetItems?.filter((b) => b.category === filters.budgetCategory)
          : p.budgetItems;

      const totalBudget =
        budgetItemsFiltered?.reduce(
          (sum, b) => sum + (b.approvedBudget || b.plannedCost || 0),
          0
        ) || (filters.budgetCategory === 'all' ? p.proposal?.estimatedBudgetEUR || 0 : 0);

      const confirmedFunding =
        p.fundingSources
          ?.filter((f) => f.status === 'confirmed')
          .reduce(
            (sum, f) =>
              sum + (f.currency === 'XAF' ? Math.round(f.amount / 655.957) : f.amount),
            0
          ) || 0;

      const actualSpend =
        filters.reportingPeriod && filters.reportingPeriod !== 'all'
          ? (p.transactions || [])
              .filter(
                (t) =>
                  t.date.startsWith(filters.reportingPeriod) &&
                  t.type === 'expense' &&
                  (filters.budgetCategory === 'all' || t.category === filters.budgetCategory)
              )
              .reduce(
                (sum, t) =>
                  sum + (t.currency === 'XAF' ? Math.round(t.amount / 655.957) : t.amount),
                0
              )
          : budgetItemsFiltered?.reduce((sum, b) => sum + (b.actualExpenditure || 0), 0) || 0;

      const gap = Math.max(0, totalBudget - confirmedFunding);
      const today = new Date().toISOString().split('T')[0];
      const overdue =
        p.milestones?.filter((m) => {
          if (
            filters.reportingPeriod &&
            filters.reportingPeriod !== 'all' &&
            !m.targetDate.startsWith(filters.reportingPeriod)
          ) {
            return false;
          }
          return !m.isCompleted && m.targetDate < today;
        }).length || 0;
      const risksCount = p.risks?.filter((r) => r.status === 'active').length || 0;

      return [
        `"${p.referenceId}"`,
        `"${p.title.replace(/"/g, '""')}"`,
        `"${p.country}"`,
        `"${p.category}"`,
        `"${p.status}"`,
        `"${p.lifecyclePhase}"`,
        totalBudget,
        confirmedFunding,
        gap,
        actualSpend,
        p.proposal?.beneficiaryCountPlanned || 0,
        overdue,
        risksCount,
        p.isDemoOrHypothetical ? '"DEMO"' : '"LIVE"',
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = `TEFA_Portfolio_Export_${new Date().toISOString().split('T')[0]}.csv`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notifyDownload(filename);
  };

  // 2. Export Formatted Excel / XLSX Workbook (HTML-based spreadsheet compatible with Excel)
  const handleExportXLSX = () => {
    let tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <style>
          table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
          th { background-color: #1e3a8a; color: #ffffff; border: 1px solid #cbd5e1; padding: 8px; font-size: 11pt; text-align: left; }
          td { border: 1px solid #e2e8f0; padding: 6px; font-size: 10pt; }
          .num { text-align: right; mso-number-format: "#,##0.00\\ €"; }
          .bold { font-weight: bold; }
          .header-title { font-size: 16pt; font-weight: bold; color: #1e3a8a; }
        </style>
      </head>
      <body>
        <div class="header-title">TechEnergy For Africa e.V. – TEFA Project Intelligence Financial Controlling</div>
        <p>Erstellt am: ${new Date().toLocaleString('de-DE')} | Exportiert von: ${currentUser.name} (${currentUser.role})</p>
        <table>
          <thead>
            <tr>
              <th>Ref-ID</th>
              <th>Projekttitel</th>
              <th>Land</th>
              <th>Kategorie</th>
              <th>Status</th>
              <th>Genehmigtes Budget (€)</th>
              <th>Bestätigte Fördermittel (€)</th>
              <th>Offene Lücke (€)</th>
              <th>Ist-Ausgaben (€)</th>
              <th>Restbudget (€)</th>
              <th>Geplante Begünstigte</th>
              <th>Status Umgebung</th>
            </tr>
          </thead>
          <tbody>
    `;

    filteredProjects.forEach((p) => {
      const budgetItemsFiltered =
        filters.budgetCategory !== 'all'
          ? p.budgetItems?.filter((b) => b.category === filters.budgetCategory)
          : p.budgetItems;

      const totalBudget =
        budgetItemsFiltered?.reduce(
          (sum, b) => sum + (b.approvedBudget || b.plannedCost || 0),
          0
        ) || (filters.budgetCategory === 'all' ? p.proposal?.estimatedBudgetEUR || 0 : 0);

      const confirmedFunding =
        p.fundingSources
          ?.filter((f) => f.status === 'confirmed')
          .reduce(
            (sum, f) =>
              sum + (f.currency === 'XAF' ? Math.round(f.amount / 655.957) : f.amount),
            0
          ) || 0;

      const actualSpend =
        filters.reportingPeriod && filters.reportingPeriod !== 'all'
          ? (p.transactions || [])
              .filter(
                (t) =>
                  t.date.startsWith(filters.reportingPeriod) &&
                  t.type === 'expense' &&
                  (filters.budgetCategory === 'all' || t.category === filters.budgetCategory)
              )
              .reduce(
                (sum, t) =>
                  sum + (t.currency === 'XAF' ? Math.round(t.amount / 655.957) : t.amount),
                0
              )
          : budgetItemsFiltered?.reduce((sum, b) => sum + (b.actualExpenditure || 0), 0) || 0;

      const gap = Math.max(0, totalBudget - confirmedFunding);
      const restBudget = totalBudget - actualSpend;

      tableHtml += `
        <tr>
          <td class="bold">${p.referenceId}</td>
          <td>${p.title}</td>
          <td>${p.country}</td>
          <td>${p.category}</td>
          <td>${p.status}</td>
          <td class="num bold">${totalBudget.toFixed(2)}</td>
          <td class="num">${confirmedFunding.toFixed(2)}</td>
          <td class="num">${gap.toFixed(2)}</td>
          <td class="num">${actualSpend.toFixed(2)}</td>
          <td class="num">${restBudget.toFixed(2)}</td>
          <td>${p.proposal?.beneficiaryCountPlanned || 'N/A'}</td>
          <td>${p.isDemoOrHypothetical ? 'DEMO' : 'LIVE'}</td>
        </tr>
      `;
    });

    tableHtml += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = `TEFA_Finanzcontrolling_Workbook_${new Date().toISOString().split('T')[0]}.xls`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notifyDownload(filename);
  };

  // 3. Print / PDF Snapshot Trigger
  const handlePrintSnapshot = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-600" />
            Offizielle Reporting- & Export-Zentrale
          </h3>
          <p className="text-xs text-slate-500">
            Revisionssichere Datenexporte für Vorstand, Mittelgeber & Wirtschaftsprüfer
          </p>
        </div>
        <div className="text-xs font-mono text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          Gefilterte Datensätze: {filteredProjects.length} Vorhaben
        </div>
      </div>

      {downloadMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="font-medium">{downloadMsg}</div>
        </div>
      )}

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* CSV Export */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between shadow-xs">
          <div>
            <div className="p-3 bg-blue-100 text-blue-800 rounded-lg w-fit mb-3">
              <Table className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Gefilterte Datentabelle (CSV)</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Exportiert alle {filteredProjects.length} aktiven Projekte inklusive Referenz-IDs,
              Budgets, Fördermittellücken und Meilensteinstatus in standardisiertem CSV-Format
              (Semikolon-separiert, UTF-8 mit BOM).
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="w-full mt-4 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" /> CSV-Tabelle herunterladen
          </button>
        </div>

        {/* Excel / XLSX Export */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between shadow-xs">
          <div>
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-lg w-fit mb-3">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">
              Finanzcontrolling-Arbeitsmappe (XLSX)
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Vollständiges Finanz-Workbook mit formatierten Währungszellen, Summenzeilen, Soll-Ist-
              Kategorien und Revisionsattributen für Excel und Google Sheets.
            </p>
          </div>
          <button
            onClick={handleExportXLSX}
            className="w-full mt-4 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" /> Excel-Workbook (.xls) laden
          </button>
        </div>

        {/* PDF / Print Briefing */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between shadow-xs">
          <div>
            <div className="p-3 bg-amber-100 text-amber-800 rounded-lg w-fit mb-3">
              <Printer className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">
              Executive Briefing / PDF-Snapshot
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Generiert eine druckfertige Zusammenfassung der 14 Executive-KPIs, des
              Finanzstatus und der Risikomatrix für Vorstandssitzungen und Fördermittelgeber.
            </p>
          </div>
          <button
            onClick={handlePrintSnapshot}
            className="w-full mt-4 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" /> Druckansicht / PDF erstellen
          </button>
        </div>
      </div>
    </div>
  );
};
