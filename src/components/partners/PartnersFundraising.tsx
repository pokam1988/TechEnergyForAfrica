import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuthRole } from '../../context/AuthRoleContext';
import { useProjects } from '../../context/ProjectContext';
import { PartnerOpportunity } from '../../types';
import {
  Users,
  Building,
  Mail,
  Sparkles,
  Plus,
  Send,
  Calendar,
  Copy,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';

export const PartnersFundraising: React.FC = () => {
  const { t, language } = useLanguage();
  const { currentUser } = useAuthRole();
  const { activeProject } = useProjects();

  const [partners, setPartners] = useState<PartnerOpportunity[]>([
    {
      id: 'p1',
      organizationName: 'GIZ Regionalbüro Kamerun & Engagement Global',
      type: 'government',
      contactPerson: 'Referat Berufliche Bildung & Inklusion',
      email: 'develoPPP@giz.de',
      country: 'Kamerun / Deutschland',
      status: 'grant_negotiation',
      eligibilityNotes: 'Fördert deutsch-afrikanische Bildungsvorhaben mit Fokus auf Inklusion.',
      nextDeadline: '2026-11-30',
      fundingFocus: 'Inklusive Digitalbildung, Solarenergie',
      lastContactDate: '2026-08-10',
    },
    {
      id: 'p2',
      organizationName: 'Deloitte Germany CSR Initiative',
      type: 'corporate_csr',
      contactPerson: 'Corporate Citizenship Team',
      email: 'csr-spenden@deloitte.de',
      country: 'Deutschland',
      status: 'active_partner',
      eligibilityNotes: 'Spendet generalüberholte Business-Laptops für afrikanische Bildungsprojekte.',
      nextDeadline: '2026-12-15',
      fundingFocus: 'Hardware-Spenden, IT-Schulungen',
      lastContactDate: '2026-09-02',
    },
    {
      id: 'p3',
      organizationName: 'Association Nationale des Sourds du Cameroun (ANSC)',
      type: 'ngo_partner',
      contactPerson: 'Jean-Paul Kamto (Präsident)',
      email: 'ansc-cameroun@partner.org',
      country: 'Kamerun',
      status: 'active_partner',
      eligibilityNotes: 'Lokaler Implementierungspartner für Gebärdensprachpädagogik.',
      fundingFocus: 'Pädagogik, Inklusion, Rekrutierung von Teilnehmenden',
      lastContactDate: '2026-09-18',
    },
  ]);

  // AI Drafter State
  const [draftType, setDraftType] = useState<string>('partnership_inquiry');
  const [recipientOrg, setRecipientOrg] = useState<string>('GIZ Regionalbüro Kamerun');
  const [recipientPerson, setRecipientPerson] = useState<string>('Frau Dr. Meyer');
  const [keyPoints, setKeyPoints] = useState<string>(
    'Vorstellung unseres barrierefreien Solar-IT-Labors für gehörlose Jugendliche in Douala; Anfrage bzgl. Fördermöglichkeiten im develoPPP-Programm.'
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [draftResult, setDraftResult] = useState<{
    subject: string;
    salutation?: string;
    body: string;
    callToAction?: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const handleGenerateDraft = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/draft-communication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: draftType,
          recipientName: recipientPerson,
          recipientOrg,
          projectTitle: activeProject?.title || 'TEFA Project',
          keyPoints,
          lang: language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDraftResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopy = () => {
    if (!draftResult) return;
    const fullText = `Betreff: ${draftResult.subject}\n\n${draftResult.salutation || ''}\n\n${draftResult.body}\n\n${draftResult.callToAction || ''}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              Modul G
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Partnerbeziehungen & Förderakquise
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Partnernetzwerk & Förderakquise (Fundraising CRM)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Verwaltung von Geldgebern, Ministerien, Stiftungen und lokalen NGOs mit integriertem
            KI-Formulierungsassistenten für partnerschaftliche Anschreiben.
          </p>
        </div>
      </div>

      {/* Grid: Partner CRM Table + AI Drafter Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Partner Directory (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-600" />
              Bestehende Kontakte & Förderpipelines ({partners.length})
            </h2>
            <button
              onClick={() => {
                const newP: PartnerOpportunity = {
                  id: 'p_' + Date.now(),
                  organizationName: 'Neue Förderorganisation',
                  type: 'donor_foundation',
                  contactPerson: 'Ansprechperson',
                  email: 'kontakt@organisation.org',
                  country: 'Kamerun / Deutschland',
                  status: 'prospect',
                  fundingFocus: 'Bildung',
                };
                setPartners([newP, ...partners]);
              }}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Partner hinzufügen</span>
            </button>
          </div>

          <div className="space-y-3">
            {partners.map((p, idx) => (
              <div
                key={p.id}
                className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2 hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <input
                      type="text"
                      value={p.organizationName}
                      onChange={(e) => {
                        const updated = [...partners];
                        updated[idx].organizationName = e.target.value;
                        setPartners(updated);
                      }}
                      className="font-bold text-slate-900 text-sm bg-transparent focus:outline-none focus:border-b focus:border-emerald-500 w-full"
                    />
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>Ansprechpartner: {p.contactPerson}</span>
                      <span>•</span>
                      <span>{p.email}</span>
                      <span>•</span>
                      <span>{p.country}</span>
                    </div>
                  </div>

                  <select
                    value={p.status}
                    onChange={(e) => {
                      const updated = [...partners];
                      updated[idx].status = e.target.value as PartnerOpportunity['status'];
                      setPartners(updated);
                    }}
                    className={`text-[11px] font-bold px-2 py-1 rounded border focus:outline-none shrink-0 ${
                      p.status === 'active_partner'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : p.status === 'grant_negotiation'
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                  >
                    <option value="prospect">Interessent / Prospect</option>
                    <option value="initial_contact">Erstkontakt erfolgt</option>
                    <option value="concept_submitted">Konzept eingereicht</option>
                    <option value="grant_negotiation">In Bewilligungsverhandlung</option>
                    <option value="active_partner">Aktiver Kooperationspartner</option>
                  </select>
                </div>

                <div className="text-slate-600 text-[11px] bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-700">Fokus & Kriterien: </span>
                  {p.eligibilityNotes || 'Keine spezifischen Kriterien hinterlegt.'}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  {p.nextDeadline && (
                    <span className="flex items-center gap-1 text-amber-700 font-medium">
                      <Calendar className="w-3 h-3 text-amber-500" />
                      Nächste Antragsfrist: {p.nextDeadline}
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setRecipientOrg(p.organizationName);
                      setRecipientPerson(p.contactPerson);
                    }}
                    className="text-emerald-600 hover:text-emerald-700 font-semibold"
                  >
                    Im KI-Entwurfsassistenten verwenden →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Communications Drafter (1 col) */}
        <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  KI-Kommunikationsassistent
                </h2>
                <div className="text-[11px] text-slate-400">
                  Fundraising & Kooperations-Entwürfe
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Art des Schreibens</label>
                <select
                  value={draftType}
                  onChange={(e) => setDraftType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="partnership_inquiry">Erstkontakt & Kooperationsanfrage</option>
                  <option value="grant_concept_note">Förderantrags-Konzeptpapier (Concept Note)</option>
                  <option value="donor_update">Status-Update an Geldgeber</option>
                  <option value="mou_draft">Entwurf Absichtserklärung (MoU-Vorlage)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Empfänger-Organisation</label>
                <input
                  type="text"
                  value={recipientOrg}
                  onChange={(e) => setRecipientOrg(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Ansprechpartner / Name</label>
                <input
                  type="text"
                  value={recipientPerson}
                  onChange={(e) => setRecipientPerson(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Schwerpunkte & Argumente</label>
                <textarea
                  rows={3}
                  value={keyPoints}
                  onChange={(e) => setKeyPoints(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <button
                onClick={handleGenerateDraft}
                disabled={aiLoading}
                className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {aiLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Entwurf wird generiert...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Musterschreiben erstellen</span>
                  </>
                )}
              </button>
            </div>

            {/* Draft Result Box */}
            {draftResult && (
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <span className="font-bold text-emerald-400">Entwurf generiert</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Kopiert!' : 'Kopieren'}</span>
                  </button>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Betreff:</span>
                  <span className="font-semibold text-white">{draftResult.subject}</span>
                </div>
                <div className="text-slate-300 text-[11px] whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto">
                  {draftResult.body}
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-800 text-[10px] text-slate-400 flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Governance-Regel: Diese Funktion erstellt lediglich Entwürfe. Es werden keine E-Mails
              automatisch versendet.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
