import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useProjects } from '../../context/ProjectContext';
import {
  FileText,
  Printer,
  Download,
  X,
  Building,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Receipt,
  Award,
} from 'lucide-react';

interface DocumentExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type DocumentType =
  | 'proposal'
  | 'executive_summary'
  | 'feasibility'
  | 'budget'
  | 'verwendungsnachweis'
  | 'closure';

export const DocumentExportModal: React.FC<DocumentExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();
  const { activeProject } = useProjects();
  const [docType, setDocType] = useState<DocumentType>('proposal');

  if (!isOpen || !activeProject) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeProject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${activeProject.referenceId}_Dossier.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 shrink-0 gap-2 sm:gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Projektdokumentation & Dossier-Export
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md sm:hidden"
              aria-label="Schließen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 hover:bg-slate-100 font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON Export</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Drucken / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="hidden sm:inline-flex p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
              aria-label="Schließen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs shrink-0">
          {[
            { id: 'proposal', label: 'Projektantrag (Vollständig)' },
            { id: 'executive_summary', label: '2-Seiter Zusammenfassung' },
            { id: 'feasibility', label: 'Machbarkeitsbericht' },
            { id: 'budget', label: 'Finanzplan (EUR/XAF)' },
            { id: 'verwendungsnachweis', label: 'Entwurf Verwendungsnachweis' },
            { id: 'closure', label: 'Abschlussbericht' },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => setDocType(d.id as DocumentType)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                docType === d.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Printable Document Preview Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-6 print:p-0 print:border-none print:bg-white text-slate-900 font-sans">
          {/* Org Header */}
          <div className="flex items-start justify-between border-b-2 border-emerald-600 pb-4">
            <div>
              <div className="font-black text-xl text-slate-900 tracking-tight">
                TechEnergy For Africa e.V.
              </div>
              <div className="text-slate-500 text-xs">
                Gemeinnütziger Verein zur Förderung von Bildung & Erneuerbaren Energien
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                www.techenergyforafrica.com • München & Douala
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-xs bg-slate-200 px-2 py-1 rounded text-slate-800">
                {activeProject.referenceId}
              </span>
              <div className="text-[11px] text-slate-500 mt-1">
                Datum: {new Date().toLocaleDateString('de-DE')}
              </div>
            </div>
          </div>

          {/* Title Banner */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
              {docType.replace('_', ' ').toUpperCase()}
            </span>
            <h1 className="text-xl font-bold text-slate-900">{activeProject.title}</h1>
            <p className="text-slate-600 italic">{activeProject.shortDescription}</p>
          </div>

          {/* Hypothetical Notice if applicable */}
          {activeProject.isDemoOrHypothetical && (
            <div className="bg-amber-50 border border-amber-300 p-3 rounded-lg text-amber-900 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Hinweis zur Datenqualität:</strong> Dieses Projekt befindet sich in der
                Vorbereitungsphase. Alle enthaltenen Budgetzahlen, Hardwarekontingente und Zeitpläne
                stellen unverbindliche Planungsannahmen (HYPOTHETISCH) dar.
              </span>
            </div>
          )}

          {/* Content based on selected document */}
          {docType === 'proposal' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-xs mb-1">
                  1. Problemstellung & Kontext
                </h4>
                <p className="text-slate-700 leading-relaxed bg-white p-3 rounded border">
                  {activeProject.proposal.problemStatement}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase text-xs mb-1">
                  2. Zielgruppe & Inklusion
                </h4>
                <div className="bg-white p-3 rounded border space-y-1">
                  <div>
                    <strong>Begünstigte:</strong> {activeProject.proposal.targetBeneficiaries} (
                    {activeProject.proposal.beneficiaryCountPlanned} Personen)
                  </div>
                  <div>
                    <strong>Inklusionsmaßnahmen:</strong>{' '}
                    {activeProject.proposal.inclusionAccessibilityNeeds}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase text-xs mb-1">
                  3. Lösungsansatz & Projektziele
                </h4>
                <div className="bg-white p-3 rounded border space-y-2">
                  <p>{activeProject.proposal.proposedSolution}</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {activeProject.proposal.objectives.map((o, i) => (
                      <li key={i}>{o}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase text-xs mb-1">
                  4. Kosten- & Finanzierungsübersicht
                </h4>
                <div className="bg-white p-3 rounded border">
                  <div>
                    Geschätzter Finanzbedarf:{' '}
                    <strong>€ {activeProject.proposal.estimatedBudgetEUR.toLocaleString()}</strong> (ca.{' '}
                    {(activeProject.proposal.estimatedBudgetEUR * 655.957).toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}{' '}
                    XAF)
                  </div>
                  <div className="text-slate-500 mt-1">
                    Nachhaltigkeitsmodell: {activeProject.proposal.sustainabilityPlan}
                  </div>
                </div>
              </div>
            </div>
          )}

          {docType === 'budget' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 uppercase text-xs">
                Budgetposten nach Kategorien (EUR & XAF)
              </h4>
              <table className="w-full text-xs text-left bg-white border">
                <thead className="bg-slate-100 border-b">
                  <tr>
                    <th className="p-2">Kostenart</th>
                    <th className="p-2">Beschreibung</th>
                    <th className="p-2 text-right">Geplant (€)</th>
                    <th className="p-2 text-right">Geplant (XAF)</th>
                    <th className="p-2 text-right">Ist-Ausgaben (€)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {activeProject.budgetItems.map((bi) => (
                    <tr key={bi.id}>
                      <td className="p-2 font-medium">{bi.category}</td>
                      <td className="p-2 text-slate-600">{bi.description}</td>
                      <td className="p-2 text-right">€ {bi.plannedCost.toLocaleString()}</td>
                      <td className="p-2 text-right">
                        {(bi.plannedCost * 655.957).toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </td>
                      <td className="p-2 text-right font-bold">
                        € {bi.actualExpenditure.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {docType === 'verwendungsnachweis' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-900">
                <strong>Vorläufiger Verwendungsnachweis:</strong> Dient der rechnerischen und
                sachlichen Nachweisführung über die eingesetzten Fördermittel.
              </div>
              <h4 className="font-bold text-slate-900 uppercase text-xs">
                Einzelbelegnachweis (Buchungsjournal)
              </h4>
              <table className="w-full text-xs text-left bg-white border">
                <thead className="bg-slate-100 border-b">
                  <tr>
                    <th className="p-2">Datum</th>
                    <th className="p-2">Empfänger / Belegtext</th>
                    <th className="p-2">Belegdatei</th>
                    <th className="p-2 text-right">Betrag EUR</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {activeProject.transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="p-2">{tx.date}</td>
                      <td className="p-2">{tx.description} ({tx.payerOrVendor})</td>
                      <td className="p-2 text-slate-500">{tx.receiptFileName}</td>
                      <td className="p-2 text-right font-bold">€ {tx.accountingAmountEUR.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {docType === 'feasibility' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 uppercase text-xs">
                Due Diligence & Governance Prüfstatus
              </h4>
              <div className="space-y-2">
                {activeProject.feasibilityChecks.map((fc) => (
                  <div key={fc.id} className="p-3 bg-white border rounded space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span>{fc.title}</span>
                      <span className="uppercase text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        {fc.status}
                      </span>
                    </div>
                    <p className="text-slate-600">{fc.description}</p>
                    {fc.evidenceSource && (
                      <div className="text-[11px] text-slate-500">Nachweis: {fc.evidenceSource}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signatures Footer */}
          <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs">
            <div>
              <div className="border-b border-slate-400 pb-8 mb-1"></div>
              <div className="font-bold">Projektleitung (PM)</div>
              <div className="text-slate-500">Marc Tagne / TEFA Projektteam</div>
            </div>
            <div>
              <div className="border-b border-slate-400 pb-8 mb-1"></div>
              <div className="font-bold">Vorstand / Controller</div>
              <div className="text-slate-500">Dr. Frederic Pokam / Vorstand TEFA e.V.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
