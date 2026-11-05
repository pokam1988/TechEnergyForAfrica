/**
 * Deadline Alert & Automated Email Preparation Center
 * Designed for Senior NGO Project Managers & Senior System Administrators
 * TechEnergy For Africa e.V. (TEFA) & Global NGO Workspaces
 * Official Website: https://www.techenergyforafrica.org
 */

import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useProjects } from '../../context/ProjectContext';
import { useOrganization } from '../../context/OrganizationContext';
import { useAuthRole } from '../../context/AuthRoleContext';
import { Milestone } from '../../types';
import {
  Clock,
  Mail,
  Bell,
  AlertTriangle,
  CheckCircle2,
  Copy,
  ExternalLink,
  Zap,
  Sparkles,
  ShieldCheck,
  FileText,
  Calendar,
  X,
  Send,
  Laptop,
  Smartphone,
  Ship,
  Sun,
  BookOpen,
  Info,
  Check,
} from 'lucide-react';

interface DeadlineAlertNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  initialMilestoneId?: string;
}

export const DeadlineAlertNotificationCenter: React.FC<DeadlineAlertNotificationCenterProps> = ({
  isOpen,
  onClose,
  initialMilestoneId,
}) => {
  const { t, language } = useLanguage();
  const { activeProject } = useProjects();
  const { activeOrganization } = useOrganization();
  const { currentUser } = useAuthRole();

  const [activeTab, setActiveTab] = useState<'alerts' | 'email' | 'acceleration'>('alerts');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>(initialMilestoneId || '');
  const [customDeadlineDate, setCustomDeadlineDate] = useState<string>('');
  const [customDeadlineTitle, setCustomDeadlineTitle] = useState<string>('');

  // Lead-time alerts toggle
  const [alertDays, setAlertDays] = useState<number[]>([30, 14, 7, 3, 1, 0]);

  // Recipient selection
  const [recipients, setRecipients] = useState<string[]>([
    'marc.tagne@techenergyforafrica.org',
    'pikop@techenergyforafrica.org',
    'mistral@techenergyforafrica.org',
  ]);

  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [alertSavedSuccess, setAlertSavedSuccess] = useState(false);

  // Available milestones
  const milestones: Milestone[] = useMemo(() => {
    return activeProject?.milestones || [];
  }, [activeProject]);

  // Determine active target milestone
  const activeMilestone = useMemo(() => {
    if (selectedMilestoneId) {
      return milestones.find((m) => m.id === selectedMilestoneId) || null;
    }
    return milestones[0] || null;
  }, [milestones, selectedMilestoneId]);

  // Target date calculation
  const targetDateStr = useMemo(() => {
    if (customDeadlineDate) return customDeadlineDate;
    if (activeMilestone?.targetDate) return activeMilestone.targetDate;
    return '2026-12-31';
  }, [customDeadlineDate, activeMilestone]);

  const daysRemaining = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [targetDateStr]);

  const urgencyStatus = useMemo<'overdue' | 'critical' | 'urgent' | 'upcoming' | 'planned'>(() => {
    if (daysRemaining < 0) return 'overdue';
    if (daysRemaining <= 3) return 'critical';
    if (daysRemaining <= 7) return 'urgent';
    if (daysRemaining <= 30) return 'upcoming';
    return 'planned';
  }, [daysRemaining]);

  const milestoneTitle = customDeadlineTitle || activeMilestone?.title || 'Projekt-Meilenstein';
  const orgName = activeOrganization?.name || 'TechEnergy For Africa e.V.';
  const orgWebsite = activeOrganization?.website || 'https://www.techenergyforafrica.org';

  // Toggle alert day
  const toggleAlertDay = (day: number) => {
    setAlertDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => b - a)
    );
  };

  // Toggle recipient
  const toggleRecipient = (email: string) => {
    setRecipients((prev) =>
      prev.includes(email) ? prev.filter((r) => r !== email) : [...prev, email]
    );
  };

  // Generate Email Content
  const emailData = useMemo(() => {
    const urgencyLabel =
      urgencyStatus === 'overdue'
        ? '[ÜBERFÄLLIG / OVERDUE]'
        : urgencyStatus === 'critical'
        ? '[DRINGEND: 3 TAGE / CRITICAL]'
        : urgencyStatus === 'urgent'
        ? '[WARNUNG: 7 TAGE / URGENT]'
        : '[ERINNERUNG / REMINDER]';

    const subject = `${urgencyLabel} Frist-Erinnerung: ${milestoneTitle} | ${activeProject?.title || 'NGO Projekt'} [${activeProject?.referenceId || 'TEFA-2026'}]`;

    let salutation = 'Liebes Projektteam, geschätzter Vorstand und Systemadministration,\n\n';
    if (language === 'en') {
      salutation = 'Dear Project Team, Executive Board, and System Administration,\n\n';
    } else if (language === 'fr') {
      salutation = 'Chère équipe projet, membres du conseil et administration système,\n\n';
    }

    let bodyText = '';
    if (language === 'de') {
      bodyText = `${salutation}im Rahmen des Vier-Augen-Prinzips und der NGO-Qualitätssicherung von ${orgName} möchten wir Sie über eine bevorstehende Projektfrist informieren:

📌 PROJEKT-DETAILS:
• Projekt: ${activeProject?.title || 'Unbekannt'} (Referenz: ${activeProject?.referenceId || 'N/A'})
• Organisation: ${orgName} (${orgWebsite})
• Land & Einsatzort: ${activeProject?.country || 'Kamerun'} (${activeProject?.locationDetails || 'Douala / Yaoundé'})
• Aktuelle Projektphase: ${activeProject?.lifecyclePhase?.toUpperCase() || 'PLANUNG'} | Status: ${activeProject?.status || 'In Durchführung'}

⏰ FRIST & MEILENSTEIN:
• Bezeichnung: ${milestoneTitle}
• Zieldatum: ${targetDateStr}
• Verbleibende Zeit: ${daysRemaining < 0 ? `${Math.abs(daysRemaining)} Tage ÜBERFÄLLIG` : `${daysRemaining} Tag(e)`}
• Dringlichkeitsstufe: ${urgencyStatus.toUpperCase()}
• Geplante Abgabe/Ergebnis: ${activeMilestone?.deliverable || 'Verwendungsnachweis / Zollfreigabe / Hardware-Lieferung'}

📋 ANSTEHENDE AUFGABEN & QUALITÄTSCHECKLISTE:
1. Vollständigkeit der Nachweisdokumente und Rechnungen prüfen.
2. Vier-Augen-Freigabe durch Vorstand und Projektleitung abstimmen.
3. Zoll- und Logistikdokumente (Douala / Yaoundé) auf Vollständigkeit prüfen.
4. Bei Hardware (Laptops, Smartphones): Inventarisierungsdaten im System erfassen.
5. Soll-Ist-Abgleich mit dem genehmigten Budgetplan sicherstellen.

🔗 DIREKTZUGRIFF AUF DAS PROJEKT-DOSSIER:
${orgWebsite}/projects/${activeProject?.id || 'tefa'}

Mit freundlichen Grüßen,
Automatisches Fristen- & Monitoringsystem
${currentUser.name} (${currentUser.role})
${orgName}
${orgWebsite}`;
    } else if (language === 'fr') {
      bodyText = `${salutation}Dans le cadre du principe de double contrôle et de l’assurance qualité des ONG chez ${orgName}, nous vous informons d’une échéance de projet imminente :

📌 DÉTAILS DU PROJET :
• Projet : ${activeProject?.title || 'Inconnu'} (Réf : ${activeProject?.referenceId || 'N/A'})
• Organisation : ${orgName} (${orgWebsite})
• Pays & Lieu : ${activeProject?.country || 'Cameroun'} (${activeProject?.locationDetails || 'Douala / Yaoundé'})
• Phase actuelle : ${activeProject?.lifecyclePhase?.toUpperCase() || 'PLANIFICATION'} | Statut : ${activeProject?.status || 'En cours'}

⏰ ÉCHÉANCE & JALON :
• Intitulé : ${milestoneTitle}
• Date cible : ${targetDateStr}
• Délai restant : ${daysRemaining < 0 ? `${Math.abs(daysRemaining)} jours DE RETARD` : `${daysRemaining} jour(s)`}
• Niveau d’urgence : ${urgencyStatus.toUpperCase()}
• Livrable attendu : ${activeMilestone?.deliverable || 'Rapport financier / Dédouanement / Livraison matériel'}

📋 CHECK-LIST QUALITÉ & TÂCHES CRITIQUES :
1. Vérification des pièces justificatives et factures conformes.
2. Validation selon le principe des quatre yeux (Direction & Chef de projet).
3. Contrôle des documents douaniers et fret (Port de Douala / Yaoundé).
4. Enregistrement des numéros de série (ordinateurs, smartphones) dans l'inventaire.
5. Rapprochement budgétaire dépenses réelles vs. budget approuvé.

🔗 ACCÈS DIRECT AU DOSSIER :
${orgWebsite}/projects/${activeProject?.id || 'tefa'}

Cordialement,
Système automatisé de surveillance des échéances
${currentUser.name} (${currentUser.role})
${orgName}
${orgWebsite}`;
    } else {
      bodyText = `${salutation}As part of our NGO Four-Eyes governance and quality assurance at ${orgName}, this is an automated alert regarding an upcoming project deadline:

📌 PROJECT DETAILS:
• Project: ${activeProject?.title || 'Unknown'} (Ref: ${activeProject?.referenceId || 'N/A'})
• Organization: ${orgName} (${orgWebsite})
• Country & Location: ${activeProject?.country || 'Cameroon'} (${activeProject?.locationDetails || 'Douala / Yaoundé'})
• Lifecycle Phase: ${activeProject?.lifecyclePhase?.toUpperCase() || 'PLANNING'} | Status: ${activeProject?.status || 'In Progress'}

⏰ DEADLINE & MILESTONE:
• Milestone: ${milestoneTitle}
• Due Date: ${targetDateStr}
• Remaining Time: ${daysRemaining < 0 ? `${Math.abs(daysRemaining)} days OVERDUE` : `${daysRemaining} day(s)`}
• Urgency Level: ${urgencyStatus.toUpperCase()}
• Deliverable: ${activeMilestone?.deliverable || 'Financial report / Customs clearance / Equipment delivery'}

📋 IMMEDIATE ACTION CHECKLIST:
1. Verify required supporting documentation and vouchers.
2. Complete Four-Eyes approval by Executive Board and Project Manager.
3. Validate customs and shipping documentation for Douala port clearance.
4. Log hardware asset serial numbers (laptops, smartphones) in the system.
5. Ensure budget variance reconciliation against approved figures.

🔗 DIRECT LINK TO PROJECT DOSSIER:
${orgWebsite}/projects/${activeProject?.id || 'tefa'}

Best regards,
Automated Project Monitoring & Alert Engine
${currentUser.name} (${currentUser.role})
${orgName}
${orgWebsite}`;
    }

    const mailtoUrl = `mailto:${recipients.join(',')}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(bodyText)}`;

    return {
      subject,
      bodyText,
      mailtoUrl,
    };
  }, [
    activeProject,
    activeMilestone,
    milestoneTitle,
    orgName,
    orgWebsite,
    targetDateStr,
    daysRemaining,
    urgencyStatus,
    recipients,
    language,
    currentUser,
  ]);

  const handleCopyEmail = async () => {
    try {
      const fullText = `AN: ${recipients.join(', ')}\nBETREFF: ${emailData.subject}\n\n${emailData.bodyText}`;
      await navigator.clipboard.writeText(fullText);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 3000);
    } catch {
      // fallback
    }
  };

  const handleSaveAlertSchedule = () => {
    try {
      const alertConfig = {
        projectId: activeProject?.id,
        milestoneId: activeMilestone?.id || 'custom',
        milestoneTitle,
        targetDate: targetDateStr,
        alertDays,
        recipients,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(`tefa_deadline_alert_${activeProject?.id || 'global'}`, JSON.stringify(alertConfig));
      setAlertSavedSuccess(true);
      setTimeout(() => setAlertSavedSuccess(false), 3000);
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Banner */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Fristen-Alarm & E-Mail-Vorbereitung
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PM &amp; SysAdmin Engine
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Automatisierte Vorwarnungen für Meilensteine, Spendenaufrufe &amp; Verwendungsnachweise
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 sm:px-6 gap-2 pt-2 overflow-x-auto whitespace-nowrap scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'alerts'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Fristen &amp; Vorwarn-Konfiguration</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'email'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>E-Mail Vorbereitung &amp; Versand</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('acceleration')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'acceleration'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Recherche &amp; Beschleunigungs-Ideen</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Active Context Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Aktives Projekt &amp; Organisation
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                [{activeProject?.referenceId || 'TEFA-2026'}] {activeProject?.title || 'Projektvorhaben'}
              </h3>
              <p className="text-xs text-slate-600">
                {orgName} • {activeProject?.country || 'Kamerun'} • Phase: {activeProject?.lifecyclePhase}
              </p>
            </div>

            {/* Countdown Badge */}
            <div
              className={`px-4 py-2.5 rounded-xl border flex items-center gap-3 shrink-0 ${
                urgencyStatus === 'overdue'
                  ? 'bg-rose-50 border-rose-300 text-rose-800'
                  : urgencyStatus === 'critical'
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : urgencyStatus === 'urgent'
                  ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-800'
              }`}
            >
              <Clock className="w-5 h-5 shrink-0" />
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider">
                  {urgencyStatus === 'overdue' ? 'Frist überschritten' : 'Verbleibende Zeit'}
                </div>
                <div className="text-lg font-black leading-tight">
                  {daysRemaining < 0 ? `${Math.abs(daysRemaining)} Tage Überfällig` : `${daysRemaining} Tage`}
                </div>
                <div className="text-[10px]">Zieldatum: {targetDateStr}</div>
              </div>
            </div>
          </div>

          {/* TAB 1: ALERTS & CONFIGURATION */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              {/* Milestone Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    Meilenstein aus Projektplan wählen
                  </label>
                  <select
                    value={selectedMilestoneId}
                    onChange={(e) => {
                      setSelectedMilestoneId(e.target.value);
                      setCustomDeadlineDate('');
                      setCustomDeadlineTitle('');
                    }}
                    className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Meilenstein wählen --</option>
                    {milestones.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title} ({m.targetDate}) {m.isCompleted ? '✓ Erledigt' : '⏳ Offen'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-emerald-600" />
                    Oder benutzerdefinierte Deadline eintragen
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="z.B. Zollbefreiung Douala / GIZ Bericht"
                      value={customDeadlineTitle}
                      onChange={(e) => setCustomDeadlineTitle(e.target.value)}
                      className="text-xs flex-1 bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      type="date"
                      value={customDeadlineDate}
                      onChange={(e) => setCustomDeadlineDate(e.target.value)}
                      className="text-xs w-36 bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* System Admin Lead-Time Alert Schedule */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Automatische Vorwarnzeiten (SysAdmin Benachrichtigungsplan)
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Cron-Daemon prüft täglich um 08:00 UTC
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Stellen Sie ein, an welchen Meilenstein-Vorlauftagen automatische Erinnerungen an die
                  Projektleitung (Marc Tagne), den Vorstand (Dr. Frederic Pokam) und die Systemadministration versendet werden:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {[
                    { day: 30, label: '30 Tage vorher', phase: 'Planungsstart' },
                    { day: 14, label: '14 Tage vorher', phase: 'Beschaffung' },
                    { day: 7, label: '7 Tage vorher', phase: 'Dokumentenprüfung' },
                    { day: 3, label: '3 Tage vorher', phase: 'Dringend' },
                    { day: 1, label: '1 Tag vorher', phase: 'Kritisch' },
                    { day: 0, label: 'Am Stichtag', phase: 'Fälligkeit' },
                  ].map(({ day, label, phase }) => {
                    const isSelected = alertDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleAlertDay(day)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold">{label}</div>
                        <div
                          className={`text-[10px] mt-0.5 ${
                            isSelected ? 'text-emerald-100' : 'text-slate-400'
                          }`}
                        >
                          {phase}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Responsible Stakeholders & Notification Recipients */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Verteiler für Deadline-Benachrichtigungen
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      name: 'Marc Tagne',
                      role: 'Projektleiter & Operative Leitung Kamerun',
                      email: 'marc.tagne@techenergyforafrica.org',
                    },
                    {
                      name: 'Dr. Frederic Pokam',
                      role: 'Vorstand & Freigabebevollmächtigter (TEFA)',
                      email: 'pikop@techenergyforafrica.org',
                    },
                    {
                      name: 'Systemadministrator',
                      role: 'IT-Infrastruktur & Systemüberwachung',
                      email: 'mistral@techenergyforafrica.org',
                    },
                    {
                      name: 'TEFA Generalsekretariat',
                      role: 'Allgemeine Poststelle & Nachweisablage',
                      email: 'info@techenergyforafrica.org',
                    },
                  ].map((user) => {
                    const isChecked = recipients.includes(user.email);
                    return (
                      <label
                        key={user.email}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isChecked ? 'bg-white border-emerald-500' : 'bg-slate-100/60 border-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleRecipient(user.email)}
                          className="mt-0.5 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900">{user.name}</div>
                          <div className="text-[11px] text-slate-500 truncate">{user.role}</div>
                          <div className="text-[10px] text-emerald-700 font-mono mt-0.5">{user.email}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Save Configuration & Next Step */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveAlertSchedule}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  {alertSavedSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Benachrichtigungsplan gespeichert!</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4 text-amber-400" />
                      <span>Erinnerungsplan scharfschalten &amp; speichern</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('email')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>Weiter zur E-Mail-Vorbereitung →</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: EMAIL PREPARATION & DISPATCH */}
          {activeTab === 'email' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-50 border border-amber-200 p-4 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-5 h-5 text-amber-700 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900">
                      Fertig vorbereiteter E-Mail-Entwurf für die Deadline
                    </h4>
                    <p className="text-[11px] text-amber-700">
                      Sofort kopierbar oder direkt in Ihrem E-Mail-Programm (Thunderbird, Outlook, Gmail) öffnen.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 text-xs font-bold shadow-xs transition-colors"
                  >
                    {copiedSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">Kopiert!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>E-Mail kopieren</span>
                      </>
                    )}
                  </button>

                  <a
                    href={emailData.mailtoUrl}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>In Mail-Client öffnen</span>
                  </a>
                </div>
              </div>

              {/* Pre-Formatted Email Viewer */}
              <div className="bg-slate-900 text-slate-100 rounded-xl p-5 font-mono text-xs space-y-4 shadow-inner border border-slate-800">
                <div className="border-b border-slate-800 pb-3 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <span className="text-slate-400 font-semibold w-16 shrink-0">AN:</span>
                    <span className="text-emerald-400 break-all">{recipients.join('; ')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-slate-400 font-semibold w-16 shrink-0">BETREFF:</span>
                    <span className="text-amber-300 font-bold">{emailData.subject}</span>
                  </div>
                </div>

                <div className="whitespace-pre-wrap leading-relaxed text-slate-200 overflow-x-auto max-h-96 pr-2">
                  {emailData.bodyText}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACCELERATION & IMPLEMENTATION INTELLIGENCE */}
          {activeTab === 'acceleration' && (
            <div className="space-y-6">
              <div className="bg-linear-to-r from-emerald-900 to-teal-900 text-white p-5 rounded-2xl shadow-md border border-emerald-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-300">
                    <Zap className="w-6 h-6 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold">
                      Recherche &amp; Beschleunigungs-Strategien für Projektumsetzung
                    </h3>
                    <p className="text-xs text-emerald-200">
                      Erprobte NGO-Best-Practices zur Verkürzung von Realisierungs- &amp; Beschaffungszeiten in Kamerun
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 Acceleration Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Hardware Donation Appeal */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs hover:border-emerald-300 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        1. Beschleunigung des Spendenaufrufs für Laptops &amp; Handys
                      </h4>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        Laufende Kampagne 2026 für IFOP-SIM
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Unternehmen mustern regelmäßig Business-Laptops (ThinkPad, Dell Latitude) nach 3 Jahren Leasing aus.
                    Durch gezielte CSR-Partnerschaften (Corporate Social Responsibility) in Berlin und NRW können 20–30 Laptops
                    innerhalb von 14 Tagen gesichert werden.
                  </p>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] space-y-1">
                    <div className="font-bold text-slate-800">🚀 Sofortmaßnahme:</div>
                    <div className="text-slate-600">
                      Ansprache von IT-Systemhäusern &amp; Stiftungen (z.B. AfB Social IT, Labdoo, Stifter-helfen) mit
                      Spendenbescheinigung nach §52 AO von TEFA e.V.
                    </div>
                  </div>
                </div>

                {/* 2. Customs & Logistics Fast-Track Douala */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs hover:border-emerald-300 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
                      <Ship className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        2. Zollfreistellung &amp; Fracht nach Douala beschleunigen
                      </h4>
                      <span className="text-[10px] text-blue-700 font-semibold">
                        Vermeidung von 4–6 Wochen Standzeiten am Hafen
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Hafenverzögerungen in Douala sind das Hauptrisiko. Durch eine offizielle Beantragung der
                    <em> Franchise Douanière</em> (Zollbefreiung für Bildungsgüter) beim zuständigen Ministerium (MINJEC / MINAS)
                    vor dem Eintreffen des Containers wird die Ware innerhalb von 48h freigegeben.
                  </p>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] space-y-1">
                    <div className="font-bold text-slate-800">🚀 Sofortmaßnahme:</div>
                    <div className="text-slate-600">
                      Beglaubigtes Spendenverzeichnis (Packing List + Donation Deed) mit TEFA-Vereinsstempel und
                      Partner-MoU vor Versand an Marc Tagne in Douala übermitteln.
                    </div>
                  </div>
                </div>

                {/* 3. Modular Solar Deployment */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs hover:border-emerald-300 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                      <Sun className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        3. Modulare Solarenergie-Stufenbereitstellung
                      </h4>
                      <span className="text-[10px] text-amber-700 font-semibold">
                        Schulungsstart ohne Verzug bei Netzausfällen
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Statt auf die vollständige 10-kWp-Dachanlage zu warten: Stufe 1 mit einem mobilen 2,5-kW-Hybrid-Wechselrichter
                    und LiFePO4-Akkus starten. Dies versorgt 20 Laptops und den Unterricht sofort und überbrückt 8 Stunden Stromausfall.
                  </p>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] space-y-1">
                    <div className="font-bold text-slate-800">🚀 Sofortmaßnahme:</div>
                    <div className="text-slate-600">
                      Lokale Beschaffung der LiFePO4-Zellen direkt in Douala/Akwa über zertifizierte TEFA-Partnerkontakte.
                    </div>
                  </div>
                </div>

                {/* 4. Inclusive Sign-Language Offline Content */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs hover:border-emerald-300 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-purple-100 text-purple-800">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        4. Offline-Lernplattform für Gehörlose (Kolibri / Kiwix)
                      </h4>
                      <span className="text-[10px] text-purple-700 font-semibold">
                        Unterricht auch ohne teure Internet-Glasfaser
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Installation eines autarken Kolibri-Offline-Servers im lokalen WLAN des Ausbildungszentrums.
                    Gebärdensprach-Lehrvideos, interaktive Tipp-Trainer und visuelle Programmier-Übungen sind direkt vorinstalliert.
                  </p>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] space-y-1">
                    <div className="font-bold text-slate-800">🚀 Sofortmaßnahme:</div>
                    <div className="text-slate-600">
                      Laptops vor dem Versand in Deutschland mit Ubuntu LTS, Kolibri und französischer Gebärdensprach-Software bespielen.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-5 sm:px-6 py-3 flex items-center justify-between">
          <div className="text-xs text-slate-500 hidden sm:block">
            {orgName} • Audit- &amp; Governance-Konform
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            >
              Schließen
            </button>
            {activeTab !== 'email' ? (
              <button
                type="button"
                onClick={() => setActiveTab('email')}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
              >
                E-Mail vorbereiten
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCopyEmail}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
              >
                {copiedSuccess ? 'E-Mail kopiert!' : 'E-Mail Text kopieren'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
