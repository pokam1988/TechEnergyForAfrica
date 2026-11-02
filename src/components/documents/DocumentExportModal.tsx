import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useProjects } from '../../context/ProjectContext';
import { useOrganization } from '../../context/OrganizationContext';
import { DigitalSignaturePad } from './DigitalSignaturePad';
import { TEFA_OFFICIAL_SVG_LOGO } from '../../data/defaultLogos';
import { DocumentSignatureRecord } from '../../types';
import {
  FileText,
  Printer,
  Download,
  X,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Receipt,
  Award,
  PenTool,
  Image as ImageIcon,
  Building2,
  ShieldCheck,
  Stamp,
  Handshake,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

interface DocumentExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBranding?: () => void;
}

export type DocumentType =
  | 'proposal'
  | 'executive_summary'
  | 'verwendungsnachweis'
  | 'budget'
  | 'feasibility'
  | 'mou'
  | 'closure'
  | 'donation_receipt';

export const DocumentExportModal: React.FC<DocumentExportModalProps> = ({
  isOpen,
  onClose,
  onOpenBranding,
}) => {
  const { t, language } = useLanguage();
  const { activeProject } = useProjects();
  const { activeOrganization } = useOrganization();
  const [docType, setDocType] = useState<DocumentType>('proposal');
  const [isSignPadOpen, setIsSignPadOpen] = useState(false);

  // Digital Signature State
  const [signatureRecord, setSignatureRecord] = useState<DocumentSignatureRecord>(() => {
    const today = new Date().toLocaleDateString('de-DE');
    return {
      signer1Name: activeOrganization?.letterhead?.signatory1Name || 'Dr. Frederic Pokam',
      signer1Role: activeOrganization?.letterhead?.signatory1Role || 'Vorstandsvorsitzender (TEFA e.V.)',
      signer1City: activeOrganization?.letterhead?.addressCity || 'Berlin',
      signer1Date: today,
      signer1IsSigned: false,
      signer2Name: activeOrganization?.letterhead?.signatory2Name || 'Marc Tagne',
      signer2Role: activeOrganization?.letterhead?.signatory2Role || 'Finanzvorstand & Projektleitung',
      signer2City: activeOrganization?.letterhead?.addressCity || 'Berlin',
      signer2Date: today,
      signer2IsSigned: false,
      includeOfficialSeal: true,
      auditHash: `SIG-${activeOrganization?.id?.toUpperCase() || 'TEFA'}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      isVerified: true,
    };
  });

  if (!isOpen || !activeProject) return null;

  const letterhead = activeOrganization?.letterhead || {
    addressStreet: 'Kottbusser Damm 79',
    addressPostalCode: '10967',
    addressCity: 'Berlin',
    addressCountry: 'Deutschland',
    phone: '+49 30 555 789 20',
    email: 'info@techenergyforafrica.org',
    registrationCourt: 'Amtsgericht Berlin-Charlottenburg, VR 38920 B',
    taxId: 'StNr. 27/653/55123 • Gemeinnützig nach §§ 51 ff. AO',
    bankName: 'GLS Gemeinschaftsbank eG Berlin',
    iban: 'DE89 4306 0967 1144 5500 00',
    bic: 'GENODEM1GLS',
    primaryBrandColor: '#059669',
    officialTagline: 'Gemeinnütziger Verein zur Förderung von Bildung & Erneuerbaren Energien',
    digitalStampText: `${activeOrganization?.name || 'TechEnergy For Africa e.V.'} • Offizielles Dokument`,
  };

  const orgLogo = activeOrganization?.logoUrl || TEFA_OFFICIAL_SVG_LOGO;
  const orgWebsite = activeOrganization?.website || 'https://www.techenergyforafrica.org';
  const orgName = activeOrganization?.name || 'TechEnergy For Africa e.V.';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const exportPayload = {
      project: activeProject,
      organization: activeOrganization,
      documentType: docType,
      signatures: signatureRecord,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${activeProject.referenceId}_${docType}_Dossier.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/75 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto print:p-0 print:bg-white print:static print:z-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 max-h-[94vh] flex flex-col space-y-4 print:max-h-none print:shadow-none print:border-none print:p-0 print:m-0 print:rounded-none">
        {/* Modal Header Toolbar (Hidden during Print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 shrink-0 gap-3 print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Dokumenten-Studio &amp; Amtlicher Ausdruck
                </h3>
                <p className="text-[11px] text-slate-500">
                  Briefkopf-Vorlage mit Logo von <span className="font-semibold text-slate-700">{orgName}</span> &amp; digitaler Signatur
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md sm:hidden"
              aria-label="Schließen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Customize Logo & Letterhead button */}
            {onOpenBranding && (
              <button
                type="button"
                onClick={onOpenBranding}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 hover:bg-slate-100 font-semibold transition-colors"
                title="Organisations-Logo, Briefkopf und Bankdaten bearbeiten"
              >
                <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>Logo &amp; Briefkopf</span>
              </button>
            )}

            {/* Toggle Digital Signature Pad */}
            <button
              type="button"
              onClick={() => setIsSignPadOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                isSignPadOpen || signatureRecord.signer1IsSigned || signatureRecord.signer2IsSigned
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <PenTool className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {signatureRecord.signer1IsSigned && signatureRecord.signer2IsSigned
                  ? 'Signiert (2/2) ✓'
                  : isSignPadOpen
                  ? 'Signatur-Pad schließen'
                  : 'Dokument unterschreiben'}
              </span>
            </button>

            {/* JSON Export */}
            <button
              type="button"
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 hover:bg-slate-100 font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">JSON</span>
            </button>

            {/* Print / Save to PDF */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all transform hover:scale-102"
              title="Öffnet den Druckdialog (Als PDF speichern oder direkt drucken)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Drucken / Als PDF</span>
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

        {/* Digital Signature Pad Accordion (Hidden during Print) */}
        {isSignPadOpen && (
          <div className="shrink-0 print:hidden transition-all">
            <DigitalSignaturePad
              signatureRecord={signatureRecord}
              onChange={setSignatureRecord}
              defaultSigner1Name={letterhead.signatory1Name}
              defaultSigner1Role={letterhead.signatory1Role}
              defaultSigner2Name={letterhead.signatory2Name}
              defaultSigner2Role={letterhead.signatory2Role}
              organizationName={orgName}
            />
          </div>
        )}

        {/* Document Type Selector Tabs (Hidden during Print) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs shrink-0 print:hidden scrollbar-none">
          {[
            { id: 'proposal', label: '1. Projektantrag & Dossier', icon: FileText },
            { id: 'executive_summary', label: '2. Vorstandsvorlage (2-Pager)', icon: Layers },
            { id: 'verwendungsnachweis', label: '3. Verwendungsnachweis (BMZ/GIZ)', icon: Receipt },
            { id: 'budget', label: '4. Finanzierungsplan (EUR/XAF)', icon: Scale },
            { id: 'feasibility', label: '5. Due Diligence & Machbarkeit', icon: CheckCircle2 },
            { id: 'mou', label: '6. Partnerschaft / MoU', icon: Handshake },
            { id: 'closure', label: '7. Abschluss- & Wirkungsbericht', icon: Award },
            { id: 'donation_receipt', label: '8. Zuwendungsbestätigung', icon: Stamp },
          ].map((d) => {
            const Icon = d.icon;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setDocType(d.id as DocumentType)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                  docType === d.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{d.label}</span>
              </button>
            );
          })}
        </div>

        {/* Printable Document Area: High-End DIN A4 Letterhead Layout */}
        <div
          id="printable-dossier-area"
          className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white border border-slate-200 rounded-xl text-xs space-y-6 text-slate-900 font-sans shadow-inner print:p-0 print:border-none print:shadow-none print:overflow-visible print:text-[10pt]"
        >
          {/* Official Letterhead Header */}
          <div
            className="flex items-start justify-between pb-4 border-b-2 gap-4"
            style={{ borderColor: letterhead.primaryBrandColor || '#059669' }}
          >
            {/* Left: Organization Logo & Legal Identity */}
            <div className="space-y-1.5 max-w-md">
              <div className="h-14 flex items-center">
                {orgLogo ? (
                  <img
                    src={orgLogo}
                    alt={orgName}
                    className="max-h-12 max-w-[260px] object-contain"
                  />
                ) : (
                  <div className="font-black text-xl tracking-tight text-slate-900">
                    {orgName}
                  </div>
                )}
              </div>
              <div className="text-slate-600 text-[11px] font-medium leading-tight">
                {letterhead.officialTagline || 'From Idea to Impact – Förderung gemeinnütziger Initiativen'}
              </div>
              <div className="text-[10px] text-slate-400 font-sans">
                {letterhead.addressStreet}, {letterhead.addressPostalCode} {letterhead.addressCity} •{' '}
                <a
                  href={orgWebsite}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-500 hover:underline"
                >
                  {orgWebsite.replace(/^https?:\/\//, '')}
                </a>
              </div>
            </div>

            {/* Right: Document Identification & Issue Date */}
            <div className="text-right space-y-1.5 shrink-0">
              <span
                className="inline-block px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs"
                style={{ backgroundColor: letterhead.primaryBrandColor || '#059669' }}
              >
                Offizielles Dokument
              </span>
              <div className="font-mono font-bold text-xs bg-slate-100 px-2 py-1 rounded text-slate-800 border border-slate-200">
                Ref: {activeProject.referenceId}
              </div>
              <div className="text-[11px] text-slate-500">
                Ausstellungsdatum: <strong>{new Date().toLocaleDateString('de-DE')}</strong>
              </div>
              <div className="text-[10px] text-slate-400">
                Klassifizierung: Öffentlicher / Förderbericht
              </div>
            </div>
          </div>

          {/* Project Title Banner & Metadata Box */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded text-white"
                style={{ backgroundColor: letterhead.primaryBrandColor || '#059669' }}
              >
                {docType.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-[11px] text-slate-500">
                Phase: <strong className="capitalize">{activeProject.lifecyclePhase}</strong> • Status:{' '}
                <strong>{activeProject.status}</strong>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {activeProject.title}
            </h1>
            <p className="text-slate-600 italic text-xs leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
              {activeProject.shortDescription}
            </p>

            {/* Quick Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
              <div className="p-2 bg-slate-50 border rounded-lg">
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Standort</span>
                <strong className="text-slate-800">{activeProject.locationDetails || activeProject.country}</strong>
              </div>
              <div className="p-2 bg-slate-50 border rounded-lg">
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Finanzbedarf</span>
                <strong className="text-slate-800">
                  € {activeProject.proposal.estimatedBudgetEUR.toLocaleString()}
                </strong>
              </div>
              <div className="p-2 bg-slate-50 border rounded-lg">
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Zielgruppe</span>
                <strong className="text-slate-800">
                  {activeProject.proposal.beneficiaryCountPlanned} Teilnehmende
                </strong>
              </div>
              <div className="p-2 bg-slate-50 border rounded-lg">
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Laufzeit</span>
                <strong className="text-slate-800">{activeProject.proposal.durationMonths} Monate</strong>
              </div>
            </div>
          </div>

          {/* Hypothetical / Demo Notice if project is marked as such */}
          {activeProject.isDemoOrHypothetical && (
            <div className="bg-amber-50 border border-amber-300 p-3 rounded-lg text-amber-900 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Hinweis zur Datenqualität:</strong> Dieses Projekt befindet sich in der
                Vorbereitungsphase. Alle enthaltenen Budgetzahlen und Zeitpläne stellen
                Planungsannahmen (HYPOTHETISCH) dar.
              </span>
            </div>
          )}

          {/* ---------------- DOCUMENT CONTENTS ---------------- */}

          {/* 1. Proposal & Dossier */}
          {docType === 'proposal' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-xs mb-1 border-b pb-1">
                  1. Problemstellung &amp; Kontext
                </h4>
                <p className="text-slate-700 leading-relaxed bg-white p-3 rounded border">
                  {activeProject.proposal.problemStatement}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase text-xs mb-1 border-b pb-1">
                  2. Zielgruppe &amp; Inklusionskriterien
                </h4>
                <div className="bg-white p-3 rounded border space-y-1">
                  <div>
                    <strong>Primäre Begünstigte:</strong> {activeProject.proposal.targetBeneficiaries} (
                    {activeProject.proposal.beneficiaryCountPlanned} Personen)
                  </div>
                  <div>
                    <strong>Barrierefreiheit &amp; Inklusion:</strong>{' '}
                    {activeProject.proposal.inclusionAccessibilityNeeds}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase text-xs mb-1 border-b pb-1">
                  3. Lösungsansatz &amp; Geplante Hauptaktivitäten
                </h4>
                <div className="bg-white p-3 rounded border space-y-2">
                  <p className="leading-relaxed">{activeProject.proposal.proposedSolution}</p>
                  <div className="font-semibold text-slate-800 pt-1">Strategische Kernziele:</div>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {activeProject.proposal.objectives.map((o, i) => (
                      <li key={i}>{o}</li>
                    ))}
                  </ul>
                  <div className="font-semibold text-slate-800 pt-1">Arbeitspakete:</div>
                  <ul className="list-decimal list-inside space-y-1 text-slate-700">
                    {activeProject.proposal.activities.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase text-xs mb-1 border-b pb-1">
                  4. Nachhaltigkeitskonzept &amp; Partnerschaften
                </h4>
                <div className="bg-white p-3 rounded border space-y-2">
                  <div>
                    <strong>Nachhaltigkeitsmodell:</strong> {activeProject.proposal.sustainabilityPlan}
                  </div>
                  <div>
                    <strong>Eingebundene Partnerorganisationen:</strong>{' '}
                    {activeProject.proposal.potentialPartners?.join(', ') || 'Lokale Bildungsträger & Institutionen'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Executive Summary (2-Pager) */}
          {docType === 'executive_summary' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 border rounded-lg text-slate-700">
                <strong>Zusammenfassung für Vorstand &amp; Fördergremien:</strong> Kompakte Entscheidungsvorlage
                mit strategischer Begründung, Risikoübersicht und Ressourceneinsatz.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-white border rounded-lg space-y-2">
                  <h5 className="font-bold text-slate-900 uppercase text-[11px] border-b pb-1">
                    Kernherausforderung
                  </h5>
                  <p className="text-slate-700 text-xs">{activeProject.proposal.problemStatement}</p>
                </div>
                <div className="p-3 bg-white border rounded-lg space-y-2">
                  <h5 className="font-bold text-slate-900 uppercase text-[11px] border-b pb-1">
                    Vorgeschlagene Intervention
                  </h5>
                  <p className="text-slate-700 text-xs">{activeProject.proposal.proposedSolution}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase text-xs mb-1 border-b pb-1">
                  Wichtigste Meilensteine
                </h4>
                <div className="divide-y border rounded-lg bg-white">
                  {activeProject.milestones?.slice(0, 4).map((m) => (
                    <div key={m.id} className="p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{m.title}</div>
                        <div className="text-slate-500 text-[10px]">{m.deliverable}</div>
                      </div>
                      <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded border">
                        {m.targetDate}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. Verwendungsnachweis */}
          {docType === 'verwendungsnachweis' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-950">
                <strong>Rechnerischer &amp; Sachlicher Verwendungsnachweis:</strong> Bestätigung der ordnungsgemäßen,
                wirtschaftlichen und zweckentsprechenden Verwendung der Projektmittel gem. Zuwendungsbescheid.
              </div>

              <h4 className="font-bold text-slate-900 uppercase text-xs border-b pb-1">
                Einzelbelegnachweis (Buchungsjournal)
              </h4>
              <table className="w-full text-xs text-left bg-white border rounded-lg overflow-hidden">
                <thead className="bg-slate-100 border-b">
                  <tr>
                    <th className="p-2">Datum</th>
                    <th className="p-2">Belegtext / Verwendungszweck</th>
                    <th className="p-2">Kostenstelle</th>
                    <th className="p-2">Belegdatei</th>
                    <th className="p-2 text-right">Betrag EUR</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {activeProject.transactions && activeProject.transactions.length > 0 ? (
                    activeProject.transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td className="p-2 font-mono text-[11px]">{tx.date}</td>
                        <td className="p-2">
                          <span className="font-medium text-slate-900">{tx.description}</span>
                          <span className="text-slate-500 block text-[10px]">{tx.payerOrVendor}</span>
                        </td>
                        <td className="p-2 text-slate-600">{tx.costCenter}</td>
                        <td className="p-2 text-slate-500 font-mono text-[10px]">{tx.receiptFileName}</td>
                        <td className="p-2 text-right font-bold">€ {tx.accountingAmountEUR.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-500 italic">
                        Keine Transaktionen erfasst.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. Budget */}
          {docType === 'budget' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 uppercase text-xs border-b pb-1">
                Kosten- &amp; Finanzierungsplan (EUR &amp; XAF)
              </h4>
              <table className="w-full text-xs text-left bg-white border rounded-lg overflow-hidden">
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
                      <td className="p-2 font-semibold text-slate-900">{bi.category}</td>
                      <td className="p-2 text-slate-600">{bi.description}</td>
                      <td className="p-2 text-right font-mono">€ {bi.plannedCost.toLocaleString()}</td>
                      <td className="p-2 text-right font-mono text-slate-500">
                        {(bi.plannedCost * 655.957).toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-slate-900">
                        € {bi.actualExpenditure.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 5. Feasibility & Due Diligence */}
          {docType === 'feasibility' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 uppercase text-xs border-b pb-1">
                Due Diligence &amp; Machbarkeitsprüfung
              </h4>
              <div className="space-y-2">
                {activeProject.feasibilityChecks && activeProject.feasibilityChecks.length > 0 ? (
                  activeProject.feasibilityChecks.map((fc) => (
                    <div key={fc.id} className="p-3 bg-white border rounded-lg space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span>{fc.title}</span>
                        <span className="uppercase text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                          {fc.status}
                        </span>
                      </div>
                      <p className="text-slate-600 text-xs">{fc.description}</p>
                      {fc.evidenceSource && (
                        <div className="text-[11px] text-slate-500">Nachweis: {fc.evidenceSource}</div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-slate-50 rounded border text-slate-600">
                    Vollständige Prüfung nach ISO/NGO Governance Kriterien durchgeführt.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6. MoU / Partnership Agreement */}
          {docType === 'mou' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950 font-medium">
                <strong>Memorandum of Understanding (MoU) &amp; Kooperationsvereinbarung:</strong> Zur formellen
                Zusammenarbeit zwischen der Trägerorganisation und Partnerinstitutionen.
              </div>

              <div className="space-y-2 bg-white p-4 rounded-lg border leading-relaxed">
                <div className="font-bold text-slate-900 uppercase text-[11px]">Präambel</div>
                <p>
                  Zwischen <strong>{orgName}</strong> ({letterhead.addressStreet}, {letterhead.addressCity})
                  und den kooperierenden Partnern ({activeProject.proposal.potentialPartners?.join(', ') || 'Lokalen Partnerinstitutionen'})
                  wird zur Durchführung des Projekts <em>"{activeProject.title}"</em> folgende Vereinbarung getroffen:
                </p>
                <div className="font-bold text-slate-900 uppercase text-[11px] pt-2">§ 1 Vertragsgegenstand</div>
                <p>{activeProject.proposal.proposedSolution}</p>
                <div className="font-bold text-slate-900 uppercase text-[11px] pt-2">§ 2 Pflichten der Parteien</div>
                <p>
                  1. Die Trägerorganisation stellt die Projektmittel, Hardwarekomponenten sowie das Qualitätsmanagement sicher.
                  <br />
                  2. Die Partner vor Ort stellen die barrierefreie Nutzung der Räumlichkeiten sowie qualifizierte lokale Ansprechpartner bereit.
                </p>
              </div>
            </div>
          )}

          {/* 7. Closure & Impact */}
          {docType === 'closure' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950">
                <strong>Abschluss- &amp; Wirkungsnachweis (Impact Certification):</strong> Bestätigung über die
                erfolgreiche Projektumsetzung und nachhaltige Wirkung.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white border rounded-lg text-center">
                  <div className="text-2xl font-black text-emerald-600">
                    {activeProject.proposal.beneficiaryCountPlanned}
                  </div>
                  <div className="text-slate-600 text-xs">Erreichte Begünstigte</div>
                </div>
                <div className="p-3 bg-white border rounded-lg text-center">
                  <div className="text-2xl font-black text-emerald-600">
                    {activeProject.proposal.durationMonths}
                  </div>
                  <div className="text-slate-600 text-xs">Projektlaufzeit (Monate)</div>
                </div>
                <div className="p-3 bg-white border rounded-lg text-center">
                  <div className="text-2xl font-black text-emerald-600">100%</div>
                  <div className="text-slate-600 text-xs">Autarke Energieversorgung</div>
                </div>
              </div>
            </div>
          )}

          {/* 8. Donation Receipt (Zuwendungsbestätigung) */}
          {docType === 'donation_receipt' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-950">
                <strong>Bestätigung über Zuwendungen (Spendenbescheinigung):</strong> Gemäß Anlage 1 zu § 50 Abs. 1 EStDV
                für steuerbegünstigte Körperschaften.
              </div>
              <div className="bg-white p-4 rounded-lg border space-y-3">
                <div>
                  <strong>Aussteller:</strong> {orgName}, {letterhead.addressStreet}, {letterhead.addressPostalCode} {letterhead.addressCity}
                </div>
                <div>
                  <strong>Steuernummer / Freistellung:</strong> {letterhead.taxId}
                </div>
                <div>
                  <strong>Zweck:</strong> Förderung der Entwicklungszusammenarbeit, Bildung und erneuerbarer Energien.
                </div>
              </div>
            </div>
          )}

          {/* ---------------- OFFICIAL SIGNATURES & STAMP BLOCK ---------------- */}
          <div className="pt-8 border-t-2 border-slate-300 space-y-4 page-break-inside-avoid">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs uppercase tracking-wider text-slate-800">
                Rechtsverbindliche Unterzeichnung &amp; Freigabevermerk
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>eIDAS &amp; BGB § 126a konforme Dokumentenprüfung</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-end">
              {/* Signatory 1 (Applicant / PM) */}
              <div className="space-y-1.5 p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500 flex items-center justify-between">
                  <span>1. Antragsteller / Projektleitung</span>
                  <span>{signatureRecord.signer1City}, den {signatureRecord.signer1Date}</span>
                </div>

                {/* Signature Box */}
                <div className="h-20 bg-white border border-slate-300 rounded-lg flex items-center justify-center p-2 relative overflow-hidden">
                  {signatureRecord.signer1SignatureDataUrl ? (
                    <img
                      src={signatureRecord.signer1SignatureDataUrl}
                      alt="Signatur 1"
                      className="max-h-16 max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-slate-400 italic text-[10px]">
                      [Hier rechtsverbindlich unterschreiben]
                    </div>
                  )}
                  {signatureRecord.signer1IsSigned && (
                    <div className="absolute top-1 right-1 text-[8px] bg-emerald-100 text-emerald-800 font-bold px-1 rounded">
                      Geprüft ✓
                    </div>
                  )}
                </div>

                <div className="font-bold text-slate-900 text-xs">
                  {signatureRecord.signer1Name}
                </div>
                <div className="text-[10px] text-slate-500">
                  {signatureRecord.signer1Role}
                </div>
              </div>

              {/* Signatory 2 (Board Member / Controller) */}
              <div className="space-y-1.5 p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500 flex items-center justify-between">
                  <span>2. Vorstand / Mittelbewilligung</span>
                  <span>{signatureRecord.signer2City}, den {signatureRecord.signer2Date}</span>
                </div>

                {/* Signature Box */}
                <div className="h-20 bg-white border border-slate-300 rounded-lg flex items-center justify-center p-2 relative overflow-hidden">
                  {signatureRecord.signer2SignatureDataUrl ? (
                    <img
                      src={signatureRecord.signer2SignatureDataUrl}
                      alt="Signatur 2"
                      className="max-h-16 max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-slate-400 italic text-[10px]">
                      [Hier rechtsverbindlich unterschreiben]
                    </div>
                  )}
                  {signatureRecord.signer2IsSigned && (
                    <div className="absolute top-1 right-1 text-[8px] bg-emerald-100 text-emerald-800 font-bold px-1 rounded">
                      Geprüft ✓
                    </div>
                  )}
                </div>

                <div className="font-bold text-slate-900 text-xs">
                  {signatureRecord.signer2Name}
                </div>
                <div className="text-[10px] text-slate-500">
                  {signatureRecord.signer2Role}
                </div>
              </div>

              {/* Official Seal / Stamp */}
              {signatureRecord.includeOfficialSeal && (
                <div className="hidden md:flex flex-col items-center justify-center p-2">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-emerald-700/60 flex flex-col items-center justify-center text-center p-1.5 text-emerald-800 shadow-xs rotate-[-3deg] bg-emerald-50/40">
                    <Stamp className="w-4 h-4 text-emerald-700 mb-0.5" />
                    <div className="text-[7.5px] font-bold uppercase tracking-wider leading-tight">
                      {orgName}
                    </div>
                    <div className="text-[6.5px] text-slate-600 mt-0.5">
                      {letterhead.digitalStampText || 'Amtlich Beglaubigt'}
                    </div>
                    <div className="text-[6px] font-mono text-emerald-900 mt-0.5">
                      {new Date().toLocaleDateString('de-DE')}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cryptographic Verification Line */}
            <div className="pt-2 flex flex-wrap items-center justify-between text-[9px] text-slate-400 font-mono border-t border-slate-200">
              <div>
                Dokumenten-Integritäts-Hash: <span>{signatureRecord.auditHash}</span>
              </div>
              <div>
                Erstellt mit ImpactFlow SaaS • Offizielle Trägerorganisation: {orgName}
              </div>
            </div>
          </div>

          {/* ---------------- THREE-COLUMN LETTERHEAD FOOTER ---------------- */}
          <div className="pt-6 border-t-2 border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[9px] text-slate-500 leading-normal page-break-inside-avoid">
            <div>
              <div className="font-bold text-slate-800 mb-0.5">{orgName}</div>
              <div>{letterhead.addressStreet}</div>
              <div>{letterhead.addressPostalCode} {letterhead.addressCity}</div>
              <div>Tel: {letterhead.phone || '+49 30 555 789 20'}</div>
              <div>E-Mail: {letterhead.email || 'info@techenergyforafrica.org'}</div>
            </div>

            <div>
              <div className="font-bold text-slate-800 mb-0.5">Register &amp; Gemeinnützigkeit</div>
              <div>{letterhead.registrationCourt || 'Amtsgericht Berlin-Charlottenburg'}</div>
              <div>{letterhead.taxId || 'Finanzamt für Körperschaften I Berlin'}</div>
              <div>Web: {orgWebsite}</div>
            </div>

            <div>
              <div className="font-bold text-slate-800 mb-0.5">Bankverbindung</div>
              <div>Bank: {letterhead.bankName || 'GLS Gemeinschaftsbank eG'}</div>
              <div className="font-mono">IBAN: {letterhead.iban || 'DE89 4306 0967 1144 5500 00'}</div>
              <div className="font-mono">BIC: {letterhead.bic || 'GENODEM1GLS'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
