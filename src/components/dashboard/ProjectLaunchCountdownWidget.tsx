import React, { useState, useEffect } from 'react';
import { Project, Milestone } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { useProjects } from '../../context/ProjectContext';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flag,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Sliders,
  ShieldCheck,
  Building,
  Target,
  Zap,
  Users,
} from 'lucide-react';

interface ProjectLaunchCountdownWidgetProps {
  project: Project;
  onNavigateTab: (tab: string) => void;
}

export const ProjectLaunchCountdownWidget: React.FC<ProjectLaunchCountdownWidgetProps> = ({
  project,
  onNavigateTab,
}) => {
  const { t } = useLanguage();
  const { setActiveProjectId } = useProjects();

  // Find relevant launch milestone (M3: Start Schulungsbetrieb or first implementation milestone)
  const defaultLaunchMilestone =
    project.milestones.find((m) => m.id === 'm-dfg-3' || m.phase === 'implementation') ||
    project.milestones[0];

  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>(
    defaultLaunchMilestone?.id || 'custom'
  );
  const [customTargetDate, setCustomTargetDate] = useState<string>(
    defaultLaunchMilestone?.targetDate || '2027-03-15'
  );
  const [viewMode, setViewMode] = useState<'days' | 'weeks' | 'workdays'>('days');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Time remaining calculation
  const [timeLeft, setTimeLeft] = useState<{
    totalDays: number;
    weeks: number;
    remainingDays: number;
    workDays: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({
    totalDays: 0,
    weeks: 0,
    remainingDays: 0,
    workDays: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  const activeMilestone = project.milestones.find((m) => m.id === selectedMilestoneId);
  const effectiveTargetDate = activeMilestone ? activeMilestone.targetDate : customTargetDate;

  // Calculate workdays between two dates (excluding Saturday & Sunday)
  const calculateWorkdays = (startDate: Date, endDate: Date): number => {
    let count = 0;
    const cur = new Date(startDate.getTime());
    while (cur < endDate) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  };

  useEffect(() => {
    const updateCountdown = () => {
      const target = new Date(`${effectiveTargetDate}T09:00:00Z`).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({
          totalDays: 0,
          weeks: 0,
          remainingDays: 0,
          workDays: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: true,
        });
        return;
      }

      const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const weeks = Math.floor(totalDays / 7);
      const remainingDays = totalDays % 7;
      const workDays = calculateWorkdays(new Date(), new Date(`${effectiveTargetDate}T09:00:00Z`));

      setTimeLeft({
        totalDays,
        weeks,
        remainingDays,
        workDays,
        hours,
        minutes,
        seconds,
        isPast: false,
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [effectiveTargetDate]);

  // Overall Preparation Readiness Calculation (0-100%)
  // Components:
  // 1. Feasibility checks verified / total (30%)
  // 2. Milestones completed / total (30%)
  // 3. Status progression (Draft = 15%, Submitted = 25%, Approved = 50%, Ready = 75%, In Progress = 90%) (25%)
  // 4. Strategic decision analyzed / decided (15%)
  const verifiedChecks = project.feasibilityChecks.filter((c) => c.status === 'verified').length;
  const totalChecks = Math.max(1, project.feasibilityChecks.length);
  const feasibilityScore = (verifiedChecks / totalChecks) * 30;

  const completedMilestones = project.milestones.filter((m) => m.isCompleted).length;
  const totalMilestones = Math.max(1, project.milestones.length);
  const milestoneScore = (completedMilestones / totalMilestones) * 30;

  let statusScore = 15;
  if (project.status === 'Submitted') statusScore = 20;
  if (project.status === 'Under Review') statusScore = 25;
  if (project.status === 'Approved') statusScore = 30;
  if (project.status === 'Ready for Implementation') statusScore = 35;
  if (project.status === 'In Progress') statusScore = 40;

  const hasStrategicDecisions = project.decisions && project.decisions.length > 0;
  const strategicScore = hasStrategicDecisions ? 15 : 5;

  const readinessPercentage = Math.min(
    100,
    Math.round(feasibilityScore + milestoneScore + statusScore * 0.5 + strategicScore)
  );

  // Workflow stages definition for visual progress
  const workflowStages = [
    {
      id: 'concept',
      title: '1. Projektantrag & Konzept',
      status: project.proposal.objectives.length > 0 ? 'completed' : 'in_progress',
      detail: `${project.proposal.beneficiaryCountPlanned} Teilnehmerinnen • 15.000 € Plan`,
      tab: 'proposal',
    },
    {
      id: 'feasibility',
      title: '2. Machbarkeit & Standort',
      status: verifiedChecks >= 3 ? 'completed' : verifiedChecks > 0 ? 'in_progress' : 'pending',
      detail: `${verifiedChecks}/${project.feasibilityChecks.length} Kriterien verifiziert`,
      tab: 'feasibility',
    },
    {
      id: 'strategy',
      title: '3. Strategische Beschaffung',
      status: hasStrategicDecisions ? 'completed' : 'pending',
      detail: 'Vergleichsmatrix A / B / C vorliegend',
      tab: 'advisor',
    },
    {
      id: 'funding',
      title: '4. Finanzierung & Budget',
      status: project.status === 'Approved' ? 'completed' : 'in_progress',
      detail: 'Förderantrag & CSR-Spenden in Vorbereitung',
      tab: 'budget',
    },
    {
      id: 'launch',
      title: '5. Schulungsstart & Kohorte',
      status: project.status === 'In Progress' ? 'completed' : 'pending',
      detail: `Zieltermin: ${new Date(effectiveTargetDate).toLocaleDateString('de-DE')}`,
      tab: 'planning',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-emerald-900/40 transition-all">
      {/* Switcher notice if another project is active */}
      {project.id !== 'proj_dfg_003' && (
        <div className="mb-4 bg-emerald-950/70 border border-emerald-600/50 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs text-emerald-200">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Sie betrachten aktuell <strong>{project.title}</strong>. Möchten Sie zum Bildungsprojekt{' '}
              <strong>Digital Future Girls</strong> wechseln?
            </span>
          </div>
          <button
            onClick={() => setActiveProjectId('proj_dfg_003')}
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span>Zu Digital Future Girls wechseln</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                Launch Countdown & Status-Radar
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-700/80 text-slate-300 border border-slate-600">
                {project.referenceId}
              </span>
              <span className="text-[11px] text-emerald-300/80 flex items-center gap-1">
                <Building className="w-3 h-3" />
                {project.country}
              </span>
              {project.id === 'proj_dfg_003' && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Strategie: Option B (ThinkPads)
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
              {project.title}
            </h2>
          </div>
        </div>

        {/* Action Controls & Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title={isExpanded ? 'Kompaktansicht' : 'Detailansicht'}
          >
            <span>{isExpanded ? 'Details verbergen' : 'Details anzeigen'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onNavigateTab('planning')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
          >
            <span>Meilensteinplan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Countdown & Readiness Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">
        {/* Left Column: Countdown & Target Selector (5 cols) */}
        <div className="lg:col-span-5 bg-slate-800/80 rounded-xl p-4 sm:p-5 border border-slate-700/80 flex flex-col justify-between backdrop-blur-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                Geplanter Projektstart
              </span>
              {/* Unit Toggle */}
              <div className="inline-flex rounded-lg bg-slate-900/80 p-0.5 border border-slate-700 text-[10px]">
                <button
                  onClick={() => setViewMode('days')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    viewMode === 'days' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tage
                </button>
                <button
                  onClick={() => setViewMode('weeks')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    viewMode === 'weeks' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Wochen
                </button>
                <button
                  onClick={() => setViewMode('workdays')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    viewMode === 'workdays' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Werktage ohne Wochenenden"
                >
                  Werktage
                </button>
              </div>
            </div>

            {/* Target Milestone Selector */}
            <div className="mb-4">
              <label htmlFor="milestone-select" className="text-[11px] text-slate-400 block mb-1">
                Aktiver Stichtag:
              </label>
              <select
                id="milestone-select"
                value={selectedMilestoneId}
                onChange={(e) => {
                  setSelectedMilestoneId(e.target.value);
                  const m = project.milestones.find((m) => m.id === e.target.value);
                  if (m) setCustomTargetDate(m.targetDate);
                }}
                className="w-full text-xs bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-medium"
              >
                {project.milestones.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({new Date(m.targetDate).toLocaleDateString('de-DE')})
                  </option>
                ))}
                <option value="custom">Individuelles Zieldatum manuell wählen...</option>
              </select>
            </div>

            {selectedMilestoneId === 'custom' && (
              <div className="mb-4 flex items-center gap-2">
                <input
                  type="date"
                  value={customTargetDate}
                  onChange={(e) => setCustomTargetDate(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-2 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {/* Graphical Countdown Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center my-3">
              {viewMode === 'days' && (
                <>
                  <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-700/60 shadow-inner">
                    <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
                      {timeLeft.totalDays}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Tage</div>
                  </div>
                  <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-700/60 shadow-inner">
                    <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Stunden</div>
                  </div>
                  <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-700/60 shadow-inner">
                    <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Minuten</div>
                  </div>
                  <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-700/60 shadow-inner">
                    <div className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono tracking-tight">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Sekunden</div>
                  </div>
                </>
              )}

              {viewMode === 'weeks' && (
                <>
                  <div className="col-span-2 bg-slate-900/90 rounded-lg p-2.5 border border-slate-700/60 shadow-inner">
                    <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight">
                      {timeLeft.weeks}
                    </div>
                    <div className="text-[11px] uppercase font-bold text-slate-400 mt-0.5">Wochen</div>
                  </div>
                  <div className="col-span-2 bg-slate-900/90 rounded-lg p-2.5 border border-slate-700/60 shadow-inner">
                    <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                      {timeLeft.remainingDays}
                    </div>
                    <div className="text-[11px] uppercase font-bold text-slate-400 mt-0.5">Rest-Tage</div>
                  </div>
                </>
              )}

              {viewMode === 'workdays' && (
                <>
                  <div className="col-span-2 bg-slate-900/90 rounded-lg p-2.5 border border-slate-700/60 shadow-inner">
                    <div className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight">
                      {timeLeft.workDays}
                    </div>
                    <div className="text-[11px] uppercase font-bold text-slate-400 mt-0.5">Werktage (Mo–Fr)</div>
                  </div>
                  <div className="col-span-2 bg-slate-900/90 rounded-lg p-2.5 border border-slate-700/60 shadow-inner">
                    <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                      {timeLeft.totalDays}
                    </div>
                    <div className="text-[11px] uppercase font-bold text-slate-400 mt-0.5">Kalendertage gesamt</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Context Note & Callout */}
          <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-emerald-300 font-medium">
                {timeLeft.totalDays > 0 ? `${timeLeft.totalDays} Tage bis zum Rollout` : 'Zieltermin erreicht'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Stichtag: {new Date(effectiveTargetDate).toLocaleDateString('de-DE')}
            </span>
          </div>
        </div>

        {/* Right Column: Graphical Preparation & Status Progress (7 cols) */}
        <div className="lg:col-span-7 bg-slate-800/80 rounded-xl p-4 sm:p-5 border border-slate-700/80 flex flex-col justify-between backdrop-blur-sm">
          <div>
            {/* Overall Progress Gauge Bar */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Vorbereitungsgrad & Reifegrad
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Gesamtreife:</span>
                <span className="text-sm font-black text-emerald-400 font-mono">
                  {readinessPercentage}%
                </span>
              </div>
            </div>

            {/* High-visibility Graphical Progress Bar */}
            <div className="w-full bg-slate-900 rounded-full h-3.5 p-0.5 border border-slate-700 overflow-hidden mb-4 relative">
              <div
                role="progressbar"
                aria-valuenow={readinessPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 transition-all duration-700 relative flex items-center justify-end pr-1"
                style={{ width: `${readinessPercentage}%` }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white shadow animate-pulse"></span>
              </div>
            </div>

            {/* Mini Metric Badges Grid */}
            <div className="grid grid-cols-3 gap-2 text-xs mb-4">
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60">
                <div className="text-[11px] text-slate-400">Antragsstatus</div>
                <div className="font-bold text-white flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>{project.status}</span>
                </div>
              </div>

              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60">
                <div className="text-[11px] text-slate-400">Machbarkeit</div>
                <div className="font-bold text-white flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>
                    {verifiedChecks} / {project.feasibilityChecks.length} Verifiziert
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60">
                <div className="text-[11px] text-slate-400">Meilensteine</div>
                <div className="font-bold text-white flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  <span>
                    {completedMilestones} / {project.milestones.length} Erledigt
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Workflow Stages Pipeline */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Vorbereitungsphasen bis zum Schulungsstart</span>
                <span className="text-[10px] text-emerald-400 font-normal">Klicken zum Öffnen</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-1.5">
                {workflowStages.map((stage, idx) => {
                  const isDone = stage.status === 'completed';
                  const isInProgress = stage.status === 'in_progress';
                  return (
                    <button
                      key={stage.id}
                      onClick={() => onNavigateTab(stage.tab)}
                      className={`p-2 rounded-lg text-left border transition-all text-xs flex flex-col justify-between group ${
                        isDone
                          ? 'bg-emerald-950/40 border-emerald-600/50 hover:bg-emerald-900/40 text-emerald-200'
                          : isInProgress
                          ? 'bg-amber-950/40 border-amber-600/50 hover:bg-amber-900/40 text-amber-200'
                          : 'bg-slate-900/40 border-slate-700/50 hover:bg-slate-800/50 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono font-bold opacity-70">0{idx + 1}</span>
                        {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />}
                        {isInProgress && <Zap className="w-3 h-3 text-amber-400 shrink-0 animate-pulse" />}
                        {!isDone && !isInProgress && <Clock className="w-3 h-3 text-slate-500 shrink-0" />}
                      </div>
                      <div className="font-semibold text-[11px] leading-tight truncate group-hover:text-white">
                        {stage.title.split('. ')[1]}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Accordion: Detailed Milestones & Actionable Next Steps */}
      {isExpanded && (
        <div className="mt-5 pt-5 border-t border-slate-700/70 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {project.milestones.map((m, idx) => (
            <div
              key={m.id}
              className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                m.isCompleted
                  ? 'bg-emerald-950/30 border-emerald-600/40 text-slate-300'
                  : m.id === selectedMilestoneId
                  ? 'bg-slate-800 border-emerald-500 ring-1 ring-emerald-500 text-white'
                  : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    M{idx + 1}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-400">
                    {new Date(m.targetDate).toLocaleDateString('de-DE')}
                  </span>
                </div>
                <div className="font-bold text-white text-xs mt-1 line-clamp-1">{m.title}</div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{m.description}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 truncate">Verantw.: {m.responsiblePerson}</span>
                {m.isCompleted ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Erledigt
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedMilestoneId(m.id);
                      setCustomTargetDate(m.targetDate);
                    }}
                    className="text-emerald-400 hover:text-emerald-300 font-medium underline cursor-pointer"
                  >
                    Als Countdown
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
