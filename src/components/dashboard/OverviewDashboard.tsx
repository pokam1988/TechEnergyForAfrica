import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuthRole } from '../../context/AuthRoleContext';
import { useProjects } from '../../context/ProjectContext';
import { ProjectLifecyclePhase, ProjectStatus } from '../../types';
import { ProjectLaunchCountdownWidget } from './ProjectLaunchCountdownWidget';
import {
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Sparkles,
  FileText,
  AlertCircle,
  Building,
  Pencil,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

const LIFECYCLE_STEPS: { phase: ProjectLifecyclePhase; labelKey: string }[] = [
  { phase: 'idea', labelKey: 'idea' },
  { phase: 'proposal', labelKey: 'proposal' },
  { phase: 'feasibility', labelKey: 'feasibility' },
  { phase: 'planning', labelKey: 'planning' },
  { phase: 'approval', labelKey: 'approval' },
  { phase: 'fundraising', labelKey: 'fundraising' },
  { phase: 'implementation', labelKey: 'implementation' },
  { phase: 'monitoring', labelKey: 'monitoring' },
  { phase: 'financial_accounting', labelKey: 'financial_accounting' },
  { phase: 'evaluation', labelKey: 'evaluation' },
  { phase: 'closure', labelKey: 'closure' },
  { phase: 'impact_reporting', labelKey: 'impact_reporting' },
];

interface OverviewDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenExport: () => void;
  onOpenProjectSettings?: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  onNavigateTab,
  onOpenExport,
  onOpenProjectSettings,
}) => {
  const { t } = useLanguage();
  const { currentUser, canApproveProposals } = useAuthRole();
  const { activeProject, updateLifecyclePhase, updateProject, deleteProject } = useProjects();
  const [transitionMsg, setTransitionMsg] = useState<string | null>(null);

  if (!activeProject) {
    return (
      <div className="p-8 text-center text-slate-500">
        {t.dashboard?.noProject || 'Kein aktives Projekt ausgewählt. Bitte wählen Sie ein Projekt aus oder legen Sie ein neues an.'}
      </div>
    );
  }

  // Calculate financial KPI totals
  const totalPlanned = activeProject.budgetItems.reduce((sum, item) => sum + item.plannedCost, 0);
  const totalApproved = activeProject.budgetItems.reduce((sum, item) => sum + item.approvedBudget, 0);
  const totalActual = activeProject.budgetItems.reduce((sum, item) => sum + item.actualExpenditure, 0);
  const confirmedFunding = activeProject.fundingSources
    .filter((f) => f.status === 'confirmed')
    .reduce((sum, f) => sum + f.amount, 0);
  const pendingFunding = activeProject.fundingSources
    .filter((f) => f.status === 'pending_application')
    .reduce((sum, f) => sum + f.amount, 0);
  const fundingGap = Math.max(0, totalPlanned - confirmedFunding);

  // Calculate milestone progress
  const completedMilestones = activeProject.milestones.filter((m) => m.isCompleted).length;
  const milestoneProgressPct =
    activeProject.milestones.length > 0
      ? Math.round((completedMilestones / activeProject.milestones.length) * 100)
      : 0;

  // Active phase index
  const activePhaseIndex = LIFECYCLE_STEPS.findIndex((s) => s.phase === activeProject.lifecyclePhase);

  // Governance action handlers
  const handleStatusTransition = async (newStatus: ProjectStatus, newPhase?: ProjectLifecyclePhase) => {
    // Proposer cannot self-approve check
    if (newStatus === 'Approved') {
      if (activeProject.createdBy.toLowerCase().includes(currentUser.name.toLowerCase())) {
        alert(t.dashboard?.governanceSelfApproveError || 'Governance-Regel: Ein Antragsteller darf seinen eigenen Projektantrag nicht genehmigen!');
        return;
      }
      if (!canApproveProposals()) {
        alert(t.dashboard?.governancePermissionError || 'Unzureichende Berechtigung: Nur Vorstandsmitglieder oder Systemadministratoren können Anträge genehmigen.');
        return;
      }
    }

    const targetPhase = newPhase || activeProject.lifecyclePhase;
    await updateLifecyclePhase(activeProject.id, targetPhase, newStatus);
    setTransitionMsg(`${t.dashboard?.statusChangeSuccess || 'Status erfolgreich geändert auf'} "${newStatus}".`);
    setTimeout(() => setTransitionMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300">
              {activeProject.referenceId}
            </span>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              {t.status[activeProject.status] || activeProject.status}
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              {activeProject.country} • {activeProject.locationDetails}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {activeProject.title}
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            {activeProject.shortDescription}
          </p>

          {/* Quick Demo-To-Official Activation Banner */}
          {activeProject.isDemoOrHypothetical && (
            <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Demo- / Planszenario aktiv:</strong> Alle Planungsdaten sind beispielhaft.
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={async () => {
                    await updateProject({
                      ...activeProject,
                      isDemoOrHypothetical: false,
                      demoDisclaimer: undefined,
                    });
                  }}
                  className="px-2.5 py-1 text-xs font-bold rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>Als offiziell aktivieren</span>
                </button>
                {onOpenProjectSettings && (
                  <button
                    type="button"
                    onClick={onOpenProjectSettings}
                    className="px-2.5 py-1 text-xs font-medium rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors"
                  >
                    Bearbeiten
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick actions buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenProjectSettings && (
            <button
              onClick={onOpenProjectSettings}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors"
              title="Projekt-Stammdaten & Modus bearbeiten"
            >
              <Pencil className="w-3.5 h-3.5 text-slate-600" />
              <span>Projekt bearbeiten</span>
            </button>
          )}

          <button
            onClick={async () => {
              if (window.confirm(`Möchten Sie das Projekt "${activeProject.title}" wirklich löschen?`)) {
                await deleteProject(activeProject.id);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 transition-colors"
            title="Projekt löschen"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Löschen</span>
          </button>

          <button
            onClick={() => onNavigateTab('simulator')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 transition-colors"
          >
            <Sliders className="w-4 h-4 text-emerald-600" />
            <span>{t.dashboard?.actionSimulator || 'Finanzsimulator'}</span>
          </button>
          <button
            onClick={() => onNavigateTab('advisor')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-300 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>{t.dashboard?.actionAdvisor || 'KI Tiebreaker'}</span>
          </button>
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
            title="Offizielle Dokumente (Antrag, Verwendungsnachweis, MoU) mit Logo drucken & signieren"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Dokument drucken &amp; signieren</span>
          </button>
        </div>
      </div>

      {transitionMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-4 py-2.5 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{transitionMsg}</span>
        </div>
      )}

      {/* Interactive Project Launch Countdown & Readiness Radar Widget */}
      <ProjectLaunchCountdownWidget
        project={activeProject}
        onNavigateTab={onNavigateTab}
      />

      {/* Lifecycle Progress Pipeline */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
              {t.dashboard?.lifecyclePipelineTitle || 'Projekt-Lebenszyklus (From Idea to Impact)'}
            </h2>
            <span className="text-[11px] sm:text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
              {t.dashboard?.phaseOf || 'Phase'} {activePhaseIndex + 1} {t.dashboard?.ofTotal || 'von'} {LIFECYCLE_STEPS.length}: {t.phases[activeProject.lifecyclePhase]}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            {t.dashboard?.pipelineHint || 'Klicken Sie auf eine Phase, um direkt zum Arbeitsmodul zu springen'}
          </span>
        </div>

        {/* Pipeline Bar */}
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-12 gap-1.5">
          {LIFECYCLE_STEPS.map((step, idx) => {
            const isCurrent = step.phase === activeProject.lifecyclePhase;
            const isPassed = idx < activePhaseIndex;
            return (
              <button
                key={step.phase}
                onClick={() => {
                  if (step.phase === 'proposal' || step.phase === 'idea') onNavigateTab('proposal');
                  else if (step.phase === 'feasibility') onNavigateTab('feasibility');
                  else if (step.phase === 'planning') onNavigateTab('planning');
                  else if (step.phase === 'fundraising') onNavigateTab('partners');
                  else if (step.phase === 'implementation' || step.phase === 'monitoring') onNavigateTab('monitoring');
                  else if (step.phase === 'financial_accounting') onNavigateTab('finance');
                  else if (step.phase === 'evaluation' || step.phase === 'impact_reporting') onNavigateTab('impact');
                  else if (step.phase === 'closure') onNavigateTab('closure');
                  else onNavigateTab('dashboard');
                }}
                className={`p-2 rounded-lg text-left border transition-all text-xs flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-400'
                    : isPassed
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] font-bold opacity-80">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  {isPassed && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                  {isCurrent && <Clock className="w-3 h-3 text-white animate-pulse" />}
                </div>
                <span className="font-semibold truncate text-[11px] leading-tight">
                  {t.phases[step.phase] || step.phase}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Planned Budget */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {t.dashboard?.kpiPlannedBudget || 'Gesamtbudget (Geplant)'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">
              € {totalPlanned.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
              <span>{t.dashboard?.kpiApproved || 'Freigegeben'}: € {totalApproved.toLocaleString()}</span>
              <span className="text-[11px] font-mono text-slate-400">
                {(totalPlanned * 655.957).toLocaleString(undefined, { maximumFractionDigits: 0 })} XAF
              </span>
            </div>
          </div>
        </div>

        {/* Confirmed Funding vs Gap */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {t.dashboard?.kpiConfirmedFunding || 'Bestätigte Finanzierung'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-emerald-600">
              € {confirmedFunding.toLocaleString()}
            </div>
            <div className="text-xs text-amber-700 mt-1 flex items-center justify-between font-medium">
              <span>{t.dashboard?.kpiFundingGap || 'Lücke'}: € {fundingGap.toLocaleString()}</span>
              <span className="text-[11px] text-slate-400">
                {t.dashboard?.kpiFundingPending || 'Beantragt'}: € {pendingFunding.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Actual Expenses */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {t.dashboard?.kpiActualExpenditure || 'Bisherige Ist-Ausgaben'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">
              € {totalActual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {t.dashboard?.kpiBudgetConsumed || 'Verbrauch'}: {totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0}% {t.dashboard?.kpiOfPlanned || 'des Planbudgets'}
            </div>
          </div>
        </div>

        {/* Beneficiaries & Milestone Progress */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {t.dashboard?.kpiBeneficiariesMilestones || 'Zielgruppe & Meilensteine'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">
              {activeProject.proposal.beneficiaryCountPlanned} <span className="text-sm font-normal text-slate-500">{t.dashboard?.kpiBeneficiariesCount || 'Teilnehmende'}</span>
            </div>
            <div className="text-xs text-slate-600 mt-1 flex items-center justify-between">
              <span>{t.dashboard?.kpiMilestoneProgress || 'Meilenstein-Fortschritt'}:</span>
              <span className="font-bold text-emerald-600">{milestoneProgressPct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Governance & Status Control Box */}
      <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
                {t.dashboard?.governanceTitle || 'Governance & Status-Workflow (Rollen-Validierung)'}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {t.dashboard?.activeRoleLabel || 'Aktive Rolle'}: <strong className="text-white">{currentUser.name}</strong> ({t.roles[currentUser.role] || currentUser.role}).{' '}
              {currentUser.role === 'board_member' && (t.dashboard?.boardDesc || 'Sie sind autorisiert, Anträge formell zu genehmigen oder abzulehnen.')}
              {currentUser.role === 'project_manager' && (t.dashboard?.pmDesc || 'Sie steuern die Planung, Machbarkeit und Umsetzung.')}
              {currentUser.role === 'finance_officer' && (t.dashboard?.financeDesc || 'Sie kontrollieren Budgets und prüfen Nachweise.')}
              {currentUser.role === 'visitor' && (t.dashboard?.visitorDesc || 'Sie können Projekte einsehen und neue Vorschläge einreichen.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeProject.status === 'Draft' && (
              <button
                onClick={() => handleStatusTransition('Submitted', 'proposal')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                {t.dashboard?.btnSubmit || 'Antrag einreichen (Zur Prüfung)'}
              </button>
            )}

            {activeProject.status === 'Submitted' && (
              <button
                onClick={() => handleStatusTransition('Under Review', 'feasibility')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                {t.dashboard?.btnReview || 'In Begutachtung nehmen'}
              </button>
            )}

            {(activeProject.status === 'Under Review' || activeProject.status === 'Draft') && (
              <>
                <button
                  onClick={() => handleStatusTransition('Approved', 'planning')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.dashboard?.btnApprove || 'Projekt formell genehmigen (Vorstand)'}</span>
                </button>
                <button
                  onClick={() => handleStatusTransition('Rejected')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-700 hover:bg-rose-600 text-white transition-colors"
                >
                  {t.dashboard?.btnReject || 'Antrag ablehnen'}
                </button>
              </>
            )}

            {activeProject.status === 'Approved' && (
              <button
                onClick={() => handleStatusTransition('Ready for Implementation', 'implementation')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>{t.dashboard?.btnReady || 'Freigabe zur Umsetzung'}</span>
              </button>
            )}

            {activeProject.status === 'Ready for Implementation' && (
              <button
                onClick={() => handleStatusTransition('In Progress', 'implementation')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                {t.dashboard?.btnStart || 'Durchführung starten (In Progress)'}
              </button>
            )}

            {activeProject.status === 'In Progress' && (
              <button
                onClick={() => handleStatusTransition('Completed', 'closure')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors"
              >
                {t.dashboard?.btnComplete || 'Umsetzung abgeschlossen (Zur Abnahme)'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Section: Project Objectives & Feasibility Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Objectives & Results */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {t.dashboard?.objectivesTitle || 'Projektziele & Zielerreichung'}
            </h2>
            <button
              onClick={() => onNavigateTab('proposal')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              {t.dashboard?.editInProposal || 'Im Antrag bearbeiten →'}
            </button>
          </div>

          <ul className="space-y-2 text-xs text-slate-700">
            {activeProject.proposal.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Readiness Checklist Highlights */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              {t.dashboard?.feasibilityTitle || 'Machbarkeits- & Governance-Status'}
            </h2>
            <button
              onClick={() => onNavigateTab('feasibility')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              {t.dashboard?.viewChecklist || 'Vollständige Checkliste →'}
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {activeProject.feasibilityChecks.slice(0, 4).map((fc) => (
              <div
                key={fc.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200"
              >
                <div>
                  <div className="font-semibold text-slate-800">{fc.title}</div>
                  <div className="text-[11px] text-slate-500">{fc.description}</div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                    fc.status === 'verified'
                      ? 'bg-emerald-100 text-emerald-800'
                      : fc.status === 'under_review'
                      ? 'bg-blue-100 text-blue-800'
                      : fc.status === 'missing_information'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {fc.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
