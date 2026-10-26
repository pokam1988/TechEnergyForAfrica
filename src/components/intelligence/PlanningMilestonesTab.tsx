import React from 'react';
import { Project, Milestone, TaskItem } from '../../types';
import { Calendar, CheckCircle2, AlertTriangle, Clock, User, CheckSquare } from 'lucide-react';

interface PlanningMilestonesTabProps {
  filteredProjects: Project[];
  onSelectProject: (id: string) => void;
  reportingPeriod?: string;
}

export const PlanningMilestonesTab: React.FC<PlanningMilestonesTabProps> = ({
  filteredProjects,
  onSelectProject,
  reportingPeriod,
}) => {
  const today = new Date().toISOString().split('T')[0];

  // Aggregate all milestones
  const allMilestones: { project: Project; milestone: Milestone }[] = [];
  const allTasks: { project: Project; task: TaskItem }[] = [];

  filteredProjects.forEach((p) => {
    p.milestones?.forEach((m) => {
      if (!reportingPeriod || reportingPeriod === 'all' || m.targetDate.startsWith(reportingPeriod)) {
        allMilestones.push({ project: p, milestone: m });
      }
    });
    p.tasks?.forEach((t) => {
      if (!reportingPeriod || reportingPeriod === 'all' || t.dueDate.startsWith(reportingPeriod)) {
        allTasks.push({ project: p, task: t });
      }
    });
  });

  const totalMs = allMilestones.length;
  const completedMs = allMilestones.filter((item) => item.milestone.isCompleted).length;
  const overdueMs = allMilestones.filter(
    (item) => !item.milestone.isCompleted && item.milestone.targetDate < today
  ).length;
  const inProgressMs = totalMs - completedMs - overdueMs;

  const msCompletionPct = totalMs > 0 ? Math.round((completedMs / totalMs) * 100) : 0;

  // Task status distribution
  const taskStatusCounts = {
    backlog: allTasks.filter((t) => t.task.status === 'backlog').length,
    in_progress: allTasks.filter((t) => t.task.status === 'in_progress').length,
    review: allTasks.filter((t) => t.task.status === 'review').length,
    done: allTasks.filter((t) => t.task.status === 'done').length,
  };

  return (
    <div className="space-y-6">
      {/* KPI summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-sm transition-all">
          <div className="text-xs font-semibold text-slate-500 mb-1">Erfasste Meilensteine</div>
          <div className="text-2xl font-black font-mono text-[#0f2b48]">{totalMs}</div>
          <div className="text-[11px] text-slate-400 mt-1">Über alle gefilterten Projekte</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/10 shadow-xs hover:shadow-sm transition-all">
          <div className="text-xs font-semibold text-emerald-800 mb-1">Erfolgreich abgeschlossen</div>
          <div className="text-2xl font-black font-mono text-emerald-800">
            {completedMs} ({msCompletionPct}%)
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Nachweise vorliegend</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200/80 bg-rose-50/10 shadow-xs hover:shadow-sm transition-all">
          <div className="text-xs font-semibold text-rose-800 mb-1">Überfällige Termine</div>
          <div className="text-2xl font-black font-mono text-rose-800">{overdueMs}</div>
          <div className="text-[11px] text-rose-600 mt-1">Zieltermin in der Vergangenheit</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-sm transition-all">
          <div className="text-xs font-semibold text-[#0f2b48] mb-1">Operative Aufgaben (Tasks)</div>
          <div className="text-2xl font-black font-mono text-[#0f2b48]">{allTasks.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">{taskStatusCounts.done} abgeschlossen</div>
        </div>
      </div>

      {/* Overdue milestones alerts */}
      {overdueMs > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-900 uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Kritische Terminverzögerungen ({overdueMs} Meilensteine überfällig):
          </div>
          <div className="space-y-2">
            {allMilestones
              .filter((item) => !item.milestone.isCompleted && item.milestone.targetDate < today)
              .map(({ project, milestone }) => (
                <div
                  key={milestone.id}
                  onClick={() => onSelectProject(project.id)}
                  className="p-3 bg-white rounded-lg border border-rose-200 flex items-center justify-between hover:border-rose-400 cursor-pointer text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{milestone.title}</div>
                    <div className="text-[11px] text-slate-500">
                      Projekt: {project.title} ({project.referenceId}) • Verantwortlich:{' '}
                      {milestone.responsiblePerson}
                    </div>
                  </div>
                  <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded">
                    Soll-Termin: {milestone.targetDate}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Milestones timeline / table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-600" />
            Meilenstein-Zeitstrahl & Liefergegenstände
          </h4>
        </div>

        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
          {allMilestones.map(({ project, milestone }) => {
            const isOverdue = !milestone.isCompleted && milestone.targetDate < today;
            return (
              <div
                key={milestone.id}
                onClick={() => onSelectProject(project.id)}
                className="p-4 hover:bg-slate-50 cursor-pointer flex items-start justify-between gap-4 transition-colors text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {milestone.isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isOverdue ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{milestone.title}</div>
                    <div className="text-slate-500 mt-0.5">{milestone.description}</div>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                      <span className="font-mono text-blue-600 font-semibold">
                        {project.referenceId}
                      </span>
                      <span>Phase: {milestone.phase}</span>
                      <span>Verantw.: {milestone.responsiblePerson}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`font-mono text-xs font-bold ${
                      milestone.isCompleted
                        ? 'text-emerald-700'
                        : isOverdue
                        ? 'text-rose-700'
                        : 'text-slate-700'
                    }`}
                  >
                    {milestone.targetDate}
                  </div>
                  <span
                    className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded ${
                      milestone.isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : isOverdue
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {milestone.isCompleted
                      ? 'Abgeschlossen'
                      : isOverdue
                      ? 'Überfällig'
                      : 'In Bearbeitung'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
