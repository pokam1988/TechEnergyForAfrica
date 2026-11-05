import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useProjects } from '../../context/ProjectContext';
import { useOrganization } from '../../context/OrganizationContext';
import { useAuthRole } from '../../context/AuthRoleContext';
import {
  NewsletterSubscriber,
  NewsletterIssue,
  SubscriberSegment,
  NewsletterCadence,
} from '../../types';
import { SEED_SUBSCRIBERS, SEED_ISSUES } from '../../data/seedNewsletters';
import { TEFA_OFFICIAL_SVG_LOGO } from '../../data/defaultLogos';
import { ActiveTab } from '../Sidebar';
import {
  Send,
  Mail,
  Users,
  Calendar,
  Sparkles,
  Download,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Layers,
  Clock,
  Smartphone,
  Monitor,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Search,
  Filter,
  FileText,
  Heart,
  Share2,
  TrendingUp,
  Inbox,
  Settings,
  BellRing,
} from 'lucide-react';

interface NewsletterManagerProps {
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const NewsletterManager: React.FC<NewsletterManagerProps> = ({ onNavigateTab }) => {
  const { t, language } = useLanguage();
  const { projects, activeProject } = useProjects();
  const { activeOrganization } = useOrganization();
  const { currentUser } = useAuthRole();

  // Active view tab inside Newsletter Manager
  const [activeSubTab, setActiveSubTab] = useState<'issues' | 'preview' | 'contacts' | 'automation'>(
    'issues'
  );

  // Persistence keys scoped to organization
  const orgId = activeOrganization?.id || 'org_tefa';
  const subscribersStorageKey = `impactflow_subscribers_${orgId}`;
  const issuesStorageKey = `impactflow_issues_${orgId}`;

  // Subscribers state
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>(() => {
    try {
      const saved = localStorage.getItem(subscribersStorageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return SEED_SUBSCRIBERS.filter((s) => s.organizationId === orgId);
  });

  // Newsletter issues state
  const [issues, setIssues] = useState<NewsletterIssue[]>(() => {
    try {
      const saved = localStorage.getItem(issuesStorageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return SEED_ISSUES.filter((i) => i.organizationId === orgId);
  });

  // Currently selected issue for preview & dispatch
  const [selectedIssueId, setSelectedIssueId] = useState<string>(() => {
    const orgIssues = SEED_ISSUES.filter((i) => i.organizationId === orgId);
    return orgIssues[0]?.id || '';
  });

  // Preview device mode (desktop vs. smartphone)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Preview format mode (visual HTML vs. raw text)
  const [previewFormat, setPreviewFormat] = useState<'html' | 'text'>('html');

  // Contact list search & filter
  const [contactSearch, setContactSearch] = useState('');
  const [contactSegmentFilter, setContactSegmentFilter] = useState<SubscriberSegment | 'all'>('all');

  // Modal / drawer states
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [isNewIssueModalOpen, setIsNewIssueModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCopiedHtml, setIsCopiedHtml] = useState(false);
  const [isCopiedText, setIsCopiedText] = useState(false);

  // New Contact Form state
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactRole, setNewContactRole] = useState('');
  const [newContactSegment, setNewContactSegment] = useState<SubscriberSegment>('donors');
  const [newContactLanguage, setNewContactLanguage] = useState<'de' | 'en' | 'fr'>('de');

  // Save subscribers helper
  const saveSubscribers = (updated: NewsletterSubscriber[]) => {
    setSubscribers(updated);
    try {
      localStorage.setItem(subscribersStorageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Save issues helper
  const saveIssues = (updated: NewsletterIssue[]) => {
    setIssues(updated);
    try {
      localStorage.setItem(issuesStorageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Organization branding details
  const orgName = activeOrganization?.name || 'TechEnergy For Africa e.V.';
  const orgLogo = activeOrganization?.logoUrl || TEFA_OFFICIAL_SVG_LOGO;
  const orgWebsite = activeOrganization?.website || 'https://www.techenergyforafrica.org';
  const letterhead = activeOrganization?.letterhead || {
    addressStreet: 'Neuköllnische Allee 10',
    addressPostalCode: '12057',
    addressCity: 'Berlin',
    addressCountry: 'Deutschland',
    email: 'info@techenergyforafrica.org',
    phone: '+49 30 555 789 20',
    registrationCourt: 'Amtsgericht Berlin-Charlottenburg, VR 38920 B',
    taxId: 'StNr. 27/653/55123 • Gemeinnützig nach §§ 51 ff. AO',
    bankName: 'GLS Gemeinschaftsbank eG Berlin',
    iban: 'DE89 4306 0967 1144 5500 00',
  };

  // Active Issue
  const activeIssue = useMemo(() => {
    return issues.find((i) => i.id === selectedIssueId) || issues[0] || null;
  }, [issues, selectedIssueId]);

  // Filtered subscribers
  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((sub) => {
      const matchSearch =
        contactSearch === '' ||
        sub.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
        sub.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
        (sub.roleOrAffiliation && sub.roleOrAffiliation.toLowerCase().includes(contactSearch.toLowerCase()));

      const matchSegment =
        contactSegmentFilter === 'all' || sub.segment === contactSegmentFilter;

      return matchSearch && matchSegment;
    });
  }, [subscribers, contactSearch, contactSegmentFilter]);

  // Segment subscriber counts
  const segmentCounts = useMemo(() => {
    const counts: Record<SubscriberSegment, number> = {
      all: subscribers.filter((s) => s.status === 'active').length,
      donors: subscribers.filter((s) => s.segment === 'donors' && s.status === 'active').length,
      partners: subscribers.filter((s) => s.segment === 'partners' && s.status === 'active').length,
      board: subscribers.filter((s) => s.segment === 'board' && s.status === 'active').length,
      volunteers: subscribers.filter((s) => s.segment === 'volunteers' && s.status === 'active').length,
      media: subscribers.filter((s) => s.segment === 'media' && s.status === 'active').length,
    };
    return counts;
  }, [subscribers]);

  // -------------------------------------------------------------
  // AUTOMATED UPDATE GENERATOR (from real organization projects)
  // -------------------------------------------------------------
  const handleGenerateAutomatedUpdate = () => {
    const orgProjects = projects.filter((p) => (p.organizationId || 'org_tefa') === orgId);
    const mainProject = activeProject || orgProjects[0];

    const todayDate = new Date().toISOString().split('T')[0];
    const newEditionNumber = issues.length + 1;

    let storyTitle = '';
    let storyContent = '';
    let headerBanner = `AUTOMATISIERTES PROJEKT-UPDATE • ${orgName.toUpperCase()}`;

    if (mainProject && mainProject.id === 'proj_ifopsim_001') {
      storyTitle = 'Aktueller Projektstand IFOPSIM: Spendenaufruf für Laptops & Vorbereitung Kamerun';
      storyContent = `Für das Projekt IFOPSIM in Douala (Kamerun) sammeln wir dringend gut erhaltene Laptops und internetfähige Smartphones. Bereits 8 von 20 geplanten Geräten konnten an unserer Sammelstelle in Berlin aufbereitet werden. Parallel läuft die behördliche Zollvorbereitung für Douala sowie die Konzeption des 5-kWp-Solar-Backup-Systems.`;
    } else if (mainProject) {
      storyTitle = `Fortschrittsbericht: ${mainProject.title} (${mainProject.referenceId})`;
      storyContent = `Das Projekt befindet sich aktuell in der Phase "${mainProject.lifecyclePhase.toUpperCase()}". Geplantes Gesamtbudget beträgt € ${mainProject.proposal?.estimatedBudgetEUR?.toLocaleString() || '45.000'} für ${mainProject.proposal?.beneficiaryCountPlanned || '60'} Teilnehmende in ${mainProject.country}.`;
    } else {
      storyTitle = `Strategisches Portfolio-Update für ${orgName}`;
      storyContent = `Aktuelle Übersicht unserer gemeinnützigen Initiativen, Bildungsförderung und nachhaltigen Entwicklungspartnerschaften.`;
    }

    const autoHighlights = orgProjects.slice(0, 3).map((p) => {
      const budget = p.proposal?.estimatedBudgetEUR || 40000;
      const approved = p.budgetItems?.reduce((sum, b) => sum + (b.approvedBudget || 0), 0) || 15000;
      const percent = Math.min(100, Math.round((approved / budget) * 100));

      return {
        projectId: p.id,
        projectTitle: p.title,
        referenceId: p.referenceId,
        summary: p.shortDescription?.slice(0, 140) + '...',
        milestoneAchieved: p.milestones?.[0]?.title || 'Projektvorbereitung & Meilensteinplanung aktiv',
        progressPercent: percent || 40,
        fundingStatus: `Budget: € ${budget.toLocaleString()} (${percent}% gedeckt)`,
      };
    });

    const newAutoIssue: NewsletterIssue = {
      id: `issue_${orgId}_${Date.now()}`,
      organizationId: orgId,
      projectIds: orgProjects.map((p) => p.id),
      editionNumber: newEditionNumber,
      title: `Ausgabe #${String(newEditionNumber).padStart(2, '0')}: Projekt-Update & Meilensteine – ${orgName}`,
      publishDate: todayDate,
      cadence: 'monthly',
      status: 'draft',
      headerBannerText: headerBanner,
      introMessage: `Liebe Unterstützerinnen, Förderer und Projektpartner von ${orgName},\n\nhier ist unser automatisches Projekt-Update zu unseren laufenden Initiativen in ${mainProject?.country || 'Afrika und Deutschland'}. Erfahren Sie hier die wichtigsten Fortschritte, Meilensteine und anstehenden Termine!`,
      highlightStoryTitle: storyTitle,
      highlightStoryContent: storyContent,
      projectHighlights: autoHighlights,
      callToAction: {
        label: 'Projekt-Dossier ansehen & Spenden',
        url: `${orgWebsite}/projects/${mainProject?.id || 'tefa'}`,
        description: 'Transparente Verwendungsnachweise, Meilensteinplan und Bedarfe einsehen.',
      },
      metricsSnapshot: [
        { label: 'Aktive Projekte', value: `${orgProjects.length} Vorhaben` },
        { label: 'Gesamtbudget Portfolio', value: `€ ${(orgProjects.reduce((sum, p) => sum + (p.proposal?.estimatedBudgetEUR || 0), 0)).toLocaleString()}` },
        { label: 'Geförderte Zielgruppe', value: `${orgProjects.reduce((sum, p) => sum + (p.proposal?.beneficiaryCountPlanned || 0), 0)} Personen` },
        { label: 'Governance-Check', value: '100% 4-Augen-Geprüft' },
      ],
      recipientSegment: 'all',
    };

    const updatedIssues = [newAutoIssue, ...issues];
    saveIssues(updatedIssues);
    setSelectedIssueId(newAutoIssue.id);
    setActiveSubTab('preview');
    showToast(`Neues Update "Ausgabe #${newEditionNumber}" wurde automatisch aus Projektdaten generiert!`);
  };

  // Add Contact Handler
  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactEmail.trim()) {
      alert('Bitte Name und E-Mail-Adresse angeben.');
      return;
    }

    const newSub: NewsletterSubscriber = {
      id: `sub_${orgId}_${Date.now()}`,
      organizationId: orgId,
      name: newContactName.trim(),
      email: newContactEmail.trim(),
      roleOrAffiliation: newContactRole.trim() || 'Förderer & Stakeholder',
      segment: newContactSegment,
      subscribedAt: new Date().toISOString(),
      status: 'active',
      preferredLanguage: newContactLanguage,
    };

    const updated = [newSub, ...subscribers];
    saveSubscribers(updated);

    setNewContactName('');
    setNewContactEmail('');
    setNewContactRole('');
    setIsAddContactModalOpen(false);
    showToast(`Kontakt "${newSub.name}" erfolgreich hinzugefügt!`);
  };

  // Delete Contact Handler
  const handleDeleteContact = (id: string, name: string) => {
    if (window.confirm(`Möchten Sie "${name}" wirklich aus der Verteilerliste entfernen?`)) {
      const updated = subscribers.filter((s) => s.id !== id);
      saveSubscribers(updated);
      showToast(`Kontakt "${name}" wurde entfernt.`);
    }
  };

  // Mark Issue as Sent
  const handleMarkAsSent = (issueId: string) => {
    const target = issues.find((i) => i.id === issueId);
    if (!target) return;

    const recipientsCount =
      target.recipientSegment === 'all'
        ? segmentCounts.all
        : segmentCounts[target.recipientSegment] || 0;

    const updated = issues.map((i) => {
      if (i.id === issueId) {
        return {
          ...i,
          status: 'sent' as const,
          sentAt: new Date().toISOString(),
          sentRecipientsCount: recipientsCount,
        };
      }
      return i;
    });

    saveIssues(updated);
    showToast(`Ausgabe wurde als versendet markiert (${recipientsCount} Empfänger)!`);
  };

  // Generate Email Text for Mailto & Copy
  const emailTextRepresentation = useMemo(() => {
    if (!activeIssue) return '';

    return `================================================================================
${activeIssue.headerBannerText || `OFFIZIELLES UPDATE • ${orgName.toUpperCase()}`}
${activeIssue.title}
Datum: ${activeIssue.publishDate} • Organisation: ${orgName}
================================================================================

${activeIssue.introMessage}

--------------------------------------------------------------------------------
🔥 TOP-STORY: ${activeIssue.highlightStoryTitle.toUpperCase()}
--------------------------------------------------------------------------------
${activeIssue.highlightStoryContent}

--------------------------------------------------------------------------------
📊 PROJEKT-STATUS & MEILENSTEINE:
--------------------------------------------------------------------------------
${activeIssue.projectHighlights
  .map(
    (ph, i) => `${i + 1}. [${ph.referenceId}] ${ph.projectTitle}
   • Status/Fortschritt: ${ph.progressPercent}% abgeschlossen
   • Meilenstein: ${ph.milestoneAchieved || 'Planmäßig'}
   • Finanzierung: ${ph.fundingStatus}
   • Kurzbeschreibung: ${ph.summary}`
  )
  .join('\n\n')}

--------------------------------------------------------------------------------
📈 ECKWERTE & KENNZAHLEN AUF EINEN BLICK:
--------------------------------------------------------------------------------
${activeIssue.metricsSnapshot.map((m) => `• ${m.label}: ${m.value}`).join('\n')}

--------------------------------------------------------------------------------
👉 AUFRUF ZUM HANDELN (CALL TO ACTION):
--------------------------------------------------------------------------------
${activeIssue.callToAction.label}
Link: ${activeIssue.callToAction.url}
${activeIssue.callToAction.description}

================================================================================
IMPRESSUM & ANSPRECHPARTNER:
${orgName}
${letterhead.addressStreet}, ${letterhead.addressPostalCode} ${letterhead.addressCity}, ${letterhead.addressCountry}
Webseite: ${orgWebsite} • E-Mail: ${letterhead.email}
Register: ${letterhead.registrationCourt} • Steuernummer: ${letterhead.taxId}
Bank: ${letterhead.bankName} (IBAN: ${letterhead.iban})

Sie erhalten diese E-Mail als registrierter Partner oder Förderer von ${orgName}.
Abmeldung jederzeit formlos per E-Mail an ${letterhead.email}.
================================================================================
`;
  }, [activeIssue, orgName, letterhead, orgWebsite]);

  // Copy HTML
  const handleCopyHtml = async () => {
    const el = document.getElementById('newsletter-preview-render-area');
    if (!el) return;
    try {
      await navigator.clipboard.writeText(el.innerHTML);
      setIsCopiedHtml(true);
      setTimeout(() => setIsCopiedHtml(false), 3000);
      showToast('HTML-Code erfolgreich kopiert! Bereit zum Einfügen in Mailchimp, Brevo oder Gmail.');
    } catch {
      // ignore
    }
  };

  // Copy Plain Text
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(emailTextRepresentation);
      setIsCopiedText(true);
      setTimeout(() => setIsCopiedText(false), 3000);
      showToast('Text-Rundmail in die Zwischenablage kopiert!');
    } catch {
      // ignore
    }
  };

  // Mailto Launcher with BCC List
  const handleOpenMailto = () => {
    if (!activeIssue) return;
    const targetSegment = activeIssue.recipientSegment;
    const recipients = subscribers
      .filter((s) => s.status === 'active' && (targetSegment === 'all' || s.segment === targetSegment))
      .map((s) => s.email);

    const subject = encodeURIComponent(`${activeIssue.title} - ${orgName}`);
    const body = encodeURIComponent(emailTextRepresentation);
    const bcc = encodeURIComponent(recipients.slice(0, 40).join(','));

    const mailto = `mailto:${encodeURIComponent(letterhead.email || 'info@techenergyforafrica.org')}?bcc=${bcc}&subject=${subject}&body=${body}`;
    window.location.href = mailto;
  };

  // Download Standalone Newsletter HTML / PDF File
  const handleDownloadStandaloneHtml = () => {
    if (!activeIssue) return;
    const el = document.getElementById('newsletter-preview-render-area');
    const content = el ? el.innerHTML : '<p>Newsletter wird geladen...</p>';

    const fullHtml = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${activeIssue.title} - ${orgName}</title>
  <style>
    @page { size: A4; margin: 12mm 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #1e293b; margin: 0; padding: 20px; line-height: 1.6; }
    .container { max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    @media print {
      body { background: #fff; padding: 0; }
      .container { border: none; box-shadow: none; max-width: 100%; border-radius: 0; }
      .no-print { display: none !important; }
    }
    .toolbar { max-width: 680px; margin: 0 auto 16px auto; display: flex; justify-content: space-between; align-items: center; background: #0f172a; color: white; padding: 12px 20px; border-radius: 8px; font-size: 13px; }
    .btn-print { background: #059669; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; }
    table { width: 100%; border-collapse: collapse; }
    a { color: #059669; text-decoration: none; }
  </style>
</head>
<body>
  <div class="toolbar no-print">
    <div><strong>${orgName}</strong> • ${activeIssue.title}</div>
    <button class="btn-print" onclick="window.print()">🖨️ Drucken / Als PDF speichern</button>
  </div>
  <div class="container">
    ${content}
  </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeIssue.id}_${activeIssue.publishDate}_Newsletter.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Druckfertige HTML-Datei erfolgreich auf Ihren PC / Smartphone heruntergeladen!');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                {activeOrganization?.legalForm || 'Multi-Organisation Engine'}
              </span>
              <span className="text-xs text-slate-400">
                Workspace: <strong className="text-white">{orgName}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <Send className="w-7 h-7 text-emerald-400" />
              <span>Newsletter &amp; Stakeholder-Updates</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Halten Sie Spender, Projektpartner in Douala &amp; Yaoundé, Beirat und Helfer automatisch auf dem Laufenden über Meilensteine, Hardware-Spendenaufrufe und Fortschritte.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleGenerateAutomatedUpdate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg transition-all transform hover:scale-102 cursor-pointer"
              title="Analysiert die aktuellen Projekte & Meilensteine und generiert mit 1 Klick einen druckreifen Update-Entwurf"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Automatisches Update generieren</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddContactModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Kontakt hinzufügen</span>
            </button>
          </div>
        </div>

        {/* Top KPIs Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Aktive Kontakte
            </span>
            <div className="text-xl font-black text-white mt-0.5">{segmentCounts.all}</div>
            <span className="text-[10px] text-emerald-400">Verteiler bereit</span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Spender &amp; Förderer
            </span>
            <div className="text-xl font-black text-amber-300 mt-0.5">{segmentCounts.donors}</div>
            <span className="text-[10px] text-slate-400">CSR &amp; Philanthropie</span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Partner in Afrika
            </span>
            <div className="text-xl font-black text-teal-300 mt-0.5">{segmentCounts.partners}</div>
            <span className="text-[10px] text-slate-400">Douala, Yaoundé &amp; NGOs</span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Erstellte Ausgaben
            </span>
            <div className="text-xl font-black text-emerald-400 mt-0.5">{issues.length}</div>
            <span className="text-[10px] text-slate-400">
              {issues.filter((i) => i.status === 'sent').length} versendet
            </span>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main SubTab Navigation */}
      <div className="border-b border-slate-200 bg-white rounded-xl shadow-xs p-1.5 flex items-center gap-1 overflow-x-auto whitespace-nowrap">
        <button
          type="button"
          onClick={() => setActiveSubTab('issues')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'issues'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Ausgaben &amp; Entwürfe ({issues.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('preview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'preview'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Monitor className="w-4 h-4" />
          <span>Live-Vorschau &amp; Versand-Studio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('contacts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'contacts'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Kontakte &amp; Verteilerlisten ({subscribers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('automation')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'automation'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Automatisierung &amp; Zeitplan</span>
        </button>
      </div>

      {/* -------------------------------------------------------------
       * SUBTAB 1: ISSUES & DRAFTS LIST
       * ------------------------------------------------------------- */}
      {activeSubTab === 'issues' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Newsletter-Ausgaben von {orgName}
              </h2>
              <p className="text-xs text-slate-500">
                Wählen Sie eine Ausgabe aus, um sie in der Live-Vorschau zu betrachten oder als Rundmail zu versenden.
              </p>
            </div>
            <button
              type="button"
              onClick={handleGenerateAutomatedUpdate}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Aus aktiven Projekten generieren</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {issues.map((issue) => {
              const isSelected = issue.id === selectedIssueId;
              const isSent = issue.status === 'sent';

              return (
                <div
                  key={issue.id}
                  className={`bg-white rounded-xl p-5 border-2 transition-all flex flex-col justify-between shadow-xs ${
                    isSelected
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border">
                        Ausgabe #{issue.editionNumber}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isSent
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {isSent ? 'Gesendet ✓' : 'Entwurf'}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {issue.cadence === 'special_appeal'
                            ? '🚨 Spendenaufruf'
                            : issue.cadence === 'milestone_alert'
                            ? '🔔 Meilenstein-Alarm'
                            : issue.cadence === 'quarterly'
                            ? '📅 Quartal'
                            : '📅 Monatlich'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                        {issue.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {issue.highlightStoryContent}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
                      <div>
                        <strong>Verteiler-Segment:</strong>{' '}
                        {issue.recipientSegment === 'all'
                          ? 'Alle aktiven Kontakte'
                          : issue.recipientSegment}
                      </div>
                      <div>
                        <strong>Veröffentlichungsdatum:</strong> {issue.publishDate}
                      </div>
                      {isSent && issue.sentRecipientsCount && (
                        <div className="text-emerald-700 font-semibold">
                          Erfolgreich an {issue.sentRecipientsCount} Kontakte versendet
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedIssueId(issue.id);
                        setActiveSubTab('preview');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>Vorschau &amp; Versand</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {!isSent && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsSent(issue.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                        >
                          Als versendet markieren
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
       * SUBTAB 2: LIVE PREVIEW & DISPATCH STUDIO
       * ------------------------------------------------------------- */}
      {activeSubTab === 'preview' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-700">Ausgabe:</span>
              <select
                value={selectedIssueId}
                onChange={(e) => setSelectedIssueId(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-900 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-[280px] truncate"
              >
                {issues.map((iss) => (
                  <option key={iss.id} value={iss.id}>
                    #{iss.editionNumber} - {iss.title}
                  </option>
                ))}
              </select>

              {/* Device Toggle */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 ml-2">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-all ${
                    previewDevice === 'desktop'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Desktop-Darstellung (Breitbild)"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-all ${
                    previewDevice === 'mobile'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Smartphone-Darstellung (380px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Handy</span>
                </button>
              </div>

              {/* Format Toggle */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setPreviewFormat('html')}
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    previewFormat === 'html'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  HTML-Design
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewFormat('text')}
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    previewFormat === 'text'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Text-Version
                </button>
              </div>
            </div>

            {/* Quick Dispatch Action Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={handleCopyHtml}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                title="Kopiert den fertigen E-Mail-HTML-Code für externe Newsletter-Tools"
              >
                {isCopiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopiedHtml ? 'HTML kopiert!' : 'HTML kopieren'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyText}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                title="Kopiert die saubere Textfassung für WhatsApp oder E-Mail"
              >
                {isCopiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileText className="w-3.5 h-3.5" />}
                <span>{isCopiedText ? 'Text kopiert!' : 'Text kopieren'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadStandaloneHtml}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 text-xs font-bold transition-colors"
                title="Druckfertige HTML/PDF-Datei auf PC oder Handy abspeichern"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download (.html / PDF)</span>
              </button>

              <button
                type="button"
                onClick={handleOpenMailto}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors"
                title="Startet Ihr Standard-E-Mail-Programm mit BCC an alle Kontakte des gewählten Segments"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>In E-Mail-App versenden</span>
              </button>
            </div>
          </div>

          {/* Render Area */}
          {activeIssue ? (
            <div className="flex justify-center p-2 sm:p-6 bg-slate-200/80 rounded-2xl border border-slate-300 overflow-x-auto">
              {previewFormat === 'text' ? (
                <div
                  className={`bg-white p-6 rounded-xl border border-slate-300 shadow-md font-mono text-xs text-slate-800 whitespace-pre-wrap ${
                    previewDevice === 'mobile' ? 'max-w-[390px] w-full' : 'max-w-2xl w-full'
                  }`}
                >
                  {emailTextRepresentation}
                </div>
              ) : (
                <div
                  id="newsletter-preview-render-area"
                  className={`bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-slate-900 transition-all ${
                    previewDevice === 'mobile' ? 'max-w-[390px] w-full text-xs' : 'max-w-2xl w-full text-sm'
                  }`}
                >
                  {/* Top Letterhead Header */}
                  <div
                    className="p-6 text-white text-center space-y-2"
                    style={{ backgroundColor: letterhead.primaryBrandColor || '#059669' }}
                  >
                    <div className="flex items-center justify-center gap-3">
                      {orgLogo ? (
                        <img src={orgLogo} alt={orgName} className="max-h-12 max-w-[200px] object-contain" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-white text-emerald-800 font-black flex items-center justify-center text-lg shadow-sm">
                          IF
                        </div>
                      )}
                    </div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-100 opacity-90">
                      {activeIssue.headerBannerText || `OFFIZIELLES UPDATE • ${orgName.toUpperCase()}`}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                      {activeIssue.title}
                    </h2>
                    <div className="text-[10px] text-emerald-100 pt-1">
                      Ausgabe #{activeIssue.editionNumber} • Datum: {activeIssue.publishDate} • {orgName}
                    </div>
                  </div>

                  {/* Intro Message */}
                  <div className="p-6 border-b border-slate-100 bg-slate-50/60 leading-relaxed text-slate-700">
                    <p className="whitespace-pre-line">{activeIssue.introMessage}</p>
                  </div>

                  {/* Highlight Story Card */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        Top-Thema &amp; Meilenstein
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      {activeIssue.highlightStoryTitle}
                    </h3>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                      {activeIssue.highlightStoryContent}
                    </p>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="px-6 py-4 bg-emerald-50/50 border-y border-emerald-100">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 mb-2">
                      Wirkung &amp; Kennzahlen im Überblick:
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {activeIssue.metricsSnapshot.map((metric, idx) => (
                        <div key={idx} className="bg-white p-2.5 rounded-lg border border-emerald-200">
                          <span className="text-[10px] text-slate-500 block leading-tight">
                            {metric.label}
                          </span>
                          <span className="text-sm font-black text-emerald-700 mt-0.5 block">
                            {metric.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Featured Projects Highlight */}
                  <div className="p-6 space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Laufende Projektvorhaben:
                    </div>
                    <div className="space-y-3">
                      {activeIssue.projectHighlights.map((ph, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded">
                              {ph.referenceId}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700">
                              {ph.progressPercent}% Fortschritt
                            </span>
                          </div>
                          <div className="font-bold text-sm text-slate-900">{ph.projectTitle}</div>
                          <p className="text-xs text-slate-600">{ph.summary}</p>
                          <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 flex justify-between">
                            <span>
                              <strong>Meilenstein:</strong> {ph.milestoneAchieved}
                            </span>
                            <span className="font-semibold text-slate-700">{ph.fundingStatus}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Call to Action Box */}
                  <div className="p-6 bg-slate-900 text-white text-center space-y-3">
                    <h4 className="text-base font-extrabold text-white">
                      {activeIssue.callToAction.description}
                    </h4>
                    <div>
                      <a
                        href={activeIssue.callToAction.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-transform hover:scale-102"
                      >
                        <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
                        <span>{activeIssue.callToAction.label}</span>
                      </a>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Link: {activeIssue.callToAction.url}
                    </div>
                  </div>

                  {/* Impressum & Legal Footer */}
                  <div className="p-6 bg-slate-100 border-t border-slate-200 text-[10px] text-slate-500 space-y-2 leading-relaxed">
                    <div className="font-bold text-slate-800">{orgName}</div>
                    <div>
                      {letterhead.addressStreet}, {letterhead.addressPostalCode} {letterhead.addressCity}, {letterhead.addressCountry}
                    </div>
                    <div>
                      Register: {letterhead.registrationCourt} • Steuernummer: {letterhead.taxId}
                    </div>
                    <div>
                      Bankverbindung: {letterhead.bankName} • IBAN: {letterhead.iban}
                    </div>
                    <div className="pt-2 border-t border-slate-200 text-[9px] text-slate-400">
                      Sie erhalten diesen Projekt-Newsletter im Rahmen Ihrer Partnerschaft oder Förderung für {orgName}.
                      Abmeldung formlos an {letterhead.email}.
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
              Keine Ausgabe ausgewählt. Bitte erstellen Sie eine neue Ausgabe oder klicken Sie oben auf &quot;Automatisches Update generieren&quot;.
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------
       * SUBTAB 3: CONTACTS & DISTRIBUTION LISTS
       * ------------------------------------------------------------- */}
      {activeSubTab === 'contacts' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            {/* Search Input */}
            <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                placeholder="Kontakte nach Name, E-Mail oder Rolle durchsuchen..."
                className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full"
              />
              {contactSearch && (
                <button
                  type="button"
                  onClick={() => setContactSearch('')}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Segment Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {(
                [
                  { id: 'all', label: `Alle (${segmentCounts.all})` },
                  { id: 'donors', label: `Spender (${segmentCounts.donors})` },
                  { id: 'partners', label: `Partner (${segmentCounts.partners})` },
                  { id: 'board', label: `Vorstand (${segmentCounts.board})` },
                  { id: 'volunteers', label: `Helfer (${segmentCounts.volunteers})` },
                  { id: 'media', label: `Medien (${segmentCounts.media})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setContactSegmentFilter(tab.id as SubscriberSegment | 'all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    contactSegmentFilter === tab.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setIsAddContactModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors ml-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Neu</span>
              </button>
            </div>
          </div>

          {/* Contacts Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                    <th className="py-3 px-4">Name &amp; Ansprechpartner</th>
                    <th className="py-3 px-4">E-Mail-Adresse</th>
                    <th className="py-3 px-4">Segment / Kategorie</th>
                    <th className="py-3 px-4">Funktion / Affiliation</th>
                    <th className="py-3 px-4">Sprache</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubscribers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Keine Kontakte für den aktuellen Suchfilter gefunden.
                      </td>
                    </tr>
                  ) : (
                    filteredSubscribers.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {sub.name}
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-mono text-[11px]">
                          <a
                            href={`mailto:${sub.email}`}
                            className="hover:text-emerald-600 hover:underline"
                          >
                            {sub.email}
                          </a>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              sub.segment === 'donors'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : sub.segment === 'partners'
                                ? 'bg-teal-100 text-teal-900 border border-teal-300'
                                : sub.segment === 'board'
                                ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                : sub.segment === 'media'
                                ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                : 'bg-slate-100 text-slate-800 border border-slate-300'
                            }`}
                          >
                            {sub.segment}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {sub.roleOrAffiliation || 'Stakeholder'}
                        </td>
                        <td className="py-3 px-4 uppercase font-bold text-slate-500 text-[10px]">
                          {sub.preferredLanguage || 'de'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              sub.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                sub.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                            {sub.status === 'active' ? 'Aktiv' : 'Abgemeldet'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteContact(sub.id, sub.name)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Kontakt löschen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
       * SUBTAB 4: AUTOMATION & CADENCE SCHEDULER
       * ------------------------------------------------------------- */}
      {activeSubTab === 'automation' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Automatischer Meilenstein-Alarm
                </h3>
                <p className="text-xs text-slate-500">
                  Generiert und versendet automatisierte Kurzberichte bei Projektmeilensteinen.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg border bg-slate-50 hover:bg-slate-100">
                <input type="checkbox" defaultChecked className="rounded text-emerald-600 focus:ring-emerald-500" />
                <span>Bei Meilenstein-Abschluss (z. B. Hardware-Sammelziel erreicht)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg border bg-slate-50 hover:bg-slate-100">
                <input type="checkbox" defaultChecked className="rounded text-emerald-600 focus:ring-emerald-500" />
                <span>Bei Vorbereitung von Transport &amp; Zollabfertigung (Douala Port)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg border bg-slate-50 hover:bg-slate-100">
                <input type="checkbox" defaultChecked className="rounded text-emerald-600 focus:ring-emerald-500" />
                <span>Monatliche Transparenz-Übersicht für Spender &amp; Beirat</span>
              </label>
            </div>

            <div className="pt-2 border-t text-[11px] text-slate-500">
              Absender-Adresse: <strong>{letterhead.email}</strong> ({orgName})
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Regelmäßige Update-Kadenz
                </h3>
                <p className="text-xs text-slate-500">
                  Feste Termine für automatische Rundbrief-Entwürfe konfigurieren.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Standard-Turnus:</label>
                <select className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-slate-50">
                  <option value="monthly">Monatlich (immer am 1. des Monats)</option>
                  <option value="biweekly">Alle 14 Tage (z. B. während Spendenaktion)</option>
                  <option value="quarterly">Quartalsweise (Quartalsbericht für Stiftungen)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Standard-Empfänger:</label>
                <select className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-slate-50">
                  <option value="all">Alle aktiven Kontakte ({segmentCounts.all})</option>
                  <option value="donors">Nur Spender &amp; Förderer ({segmentCounts.donors})</option>
                  <option value="partners">Nur Partner &amp; Ausbilder ({segmentCounts.partners})</option>
                </select>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px]">
                <strong>DSGVO / Compliance Hinweis:</strong> Alle E-Mails enthalten automatisch die amtliche Anschrift ({letterhead.addressStreet}, {letterhead.addressPostalCode} {letterhead.addressCity}) sowie einen transparenten Abmeldehinweis.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
       * MODAL: ADD CONTACT MODAL
       * ------------------------------------------------------------- */}
      {isAddContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>Neuen Stakeholder-Kontakt anlegen</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddContactModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Vollständiger Name *</label>
                <input
                  type="text"
                  required
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="z.B. Dr. Frederic Pokam oder Partner Douala"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">E-Mail-Adresse *</label>
                <input
                  type="email"
                  required
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  placeholder="partner@techenergyforafrica.org"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Funktion / Organisation</label>
                <input
                  type="text"
                  value={newContactRole}
                  onChange={(e) => setNewContactRole(e.target.value)}
                  placeholder="z.B. CSR Sponsor, Ausbilder Douala, Vorstandsmitglied"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Verteiler-Segment</label>
                  <select
                    value={newContactSegment}
                    onChange={(e) => setNewContactSegment(e.target.value as SubscriberSegment)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="donors">Spender &amp; Förderer</option>
                    <option value="partners">Partner &amp; Universitäten</option>
                    <option value="board">Vorstand &amp; Beirat</option>
                    <option value="volunteers">Helfer &amp; Freiwillige</option>
                    <option value="media">Presse &amp; Medien</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sprachpräferenz</label>
                  <select
                    value={newContactLanguage}
                    onChange={(e) => setNewContactLanguage(e.target.value as 'de' | 'en' | 'fr')}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="de">Deutsch (DE)</option>
                    <option value="fr">Français (FR)</option>
                    <option value="en">English (EN)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddContactModalOpen(false)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-sm"
                >
                  Kontakt speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
