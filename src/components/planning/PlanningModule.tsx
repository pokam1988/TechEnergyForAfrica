import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuthRole } from '../../context/AuthRoleContext';
import { useProjects } from '../../context/ProjectContext';
import { TaskItem, Milestone, RiskItem, TaskStatus, PriorityLevel } from '../../types';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  AlertTriangle,
  Save,
  Tag,
  User,
  ShieldAlert,
  ArrowRight,
  ListTodo,
} from 'lucide-react';

export const PlanningModule: React.FC = () => {
  const { t } = useLanguage();
  const { currentUser, canEditProject } = useAuthRole();
  const { activeProject, updateProject } = useProjects();

  const [activeSubTab, setActiveSubTab] = useState<'kanban' | 'milestones' | 'risks'>('kanban');

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    return activeProject ? JSON.parse(JSON.stringify(activeProject.tasks)) : [];
  });
  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    return activeProject ? JSON.parse(JSON.stringify(activeProject.milestones)) : [];
  });
  const [risks, setRisks] = useState<RiskItem[]>(() => {
    return activeProject ? JSON.parse(JSON.stringify(activeProject.risks)) : [];
  });

  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Sync when activeProject changes
  React.useEffect(() => {
    if (activeProject) {
      setTasks(JSON.parse(JSON.stringify(activeProject.tasks)));
      setMilestones(JSON.parse(JSON.stringify(activeProject.milestones)));
      setRisks(JSON.parse(JSON.stringify(activeProject.risks)));
    }
  }, [activeProject]);

  const handleSaveAll = async () => {
    if (!activeProject) return;
    await updateProject({
      ...activeProject,
      tasks,
      milestones,
      risks,
    });
    setSaveMsg('Projektplanung (Aufgaben, Meilensteine, Risiken) erfolgreich gespeichert.');
    setTimeout(() => setSaveMsg(null), 3000);
  };

  // Task actions
  const moveTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  const handleAddTask = (status: TaskStatus = 'backlog') => {
    const newTask: TaskItem = {
      id: 'task_' + Date.now(),
      title: 'Neue Arbeitsaufgabe',
      status,
      priority: 'medium',
      assignee: currentUser.name,
      dueDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
      tags: ['Allgemein'],
    };
    setTasks([...tasks, newTask]);
  };

  // Milestone actions
  const toggleMilestone = (milestoneId: string) => {
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === milestoneId
          ? {
              ...m,
              isCompleted: !m.isCompleted,
              completedDate: !m.isCompleted ? new Date().toISOString().split('T')[0] : undefined,
            }
          : m
      )
    );
  };

  const handleAddMilestone = () => {
    const newM: Milestone = {
      id: 'm_' + Date.now(),
      title: 'Neuer Meilenstein',
      description: 'Beschreibung des Meilensteins...',
      phase: activeProject?.lifecyclePhase || 'implementation',
      targetDate: new Date(Date.now() + 86400000 * 60).toISOString().split('T')[0],
      isCompleted: false,
      responsiblePerson: currentUser.name,
      deliverables: ['Liefergegenstand 1'],
    };
    setMilestones([...milestones, newM]);
  };

  // Risk actions
  const handleAddRisk = () => {
    const newRisk: RiskItem = {
      id: 'r_' + Date.now(),
      category: 'operational',
      description: 'Neues Projektrisiko identifizieren...',
      probability: 'medium',
      impact: 'medium',
      mitigationStrategy: 'Maßnahme zur Risikominderung...',
      responsiblePerson: currentUser.name,
      status: 'active',
    };
    setRisks([...risks, newRisk]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              Modul D
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Work Breakdown & Operational Control
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Projektplanung, Meilensteine & Risikoregister
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Agiles Aufgabenboard (Kanban), Meilenstein-Zeitachse und Risikomanagement für das
            Projekt.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canEditProject() && (
            <button
              onClick={handleSaveAll}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Änderungen speichern</span>
            </button>
          )}
        </div>
      </div>

      {saveMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-4 py-2.5 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveMsg}</span>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('kanban')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeSubTab === 'kanban'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>Agiles Kanban-Board ({tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('milestones')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeSubTab === 'milestones'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Meilensteine & Zeitplan ({milestones.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('risks')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeSubTab === 'risks'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Risikoregister ({risks.length})</span>
        </button>
      </div>

      {/* TAB 1: KANBAN BOARD */}
      {activeSubTab === 'kanban' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Verschieben Sie Aufgaben zwischen den Spalten Backlog, In Bearbeitung, Review und Erledigt.
            </span>
            {canEditProject() && (
              <button
                onClick={() => handleAddTask('backlog')}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Neue Aufgabe</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(
              [
                { id: 'backlog', title: 'Backlog / Vorbereitung', color: 'border-slate-300' },
                { id: 'in_progress', title: 'In Bearbeitung', color: 'border-blue-400' },
                { id: 'review', title: 'In Begutachtung / QA', color: 'border-amber-400' },
                { id: 'done', title: 'Erledigt & Abgenommen', color: 'border-emerald-500' },
              ] as { id: TaskStatus; title: string; color: string }[]
            ).map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.id);
              return (
                <div
                  key={col.id}
                  className="bg-slate-100 p-3 rounded-xl border border-slate-200 flex flex-col min-h-[450px]"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {col.title}
                    </span>
                    <span className="text-[11px] font-mono bg-white px-1.5 py-0.5 rounded text-slate-600 font-semibold">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-2 flex-1">
                    {colTasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <input
                            type="text"
                            value={task.title}
                            onChange={(e) => {
                              const updated = tasks.map((t) =>
                                t.id === task.id ? { ...t, title: e.target.value } : t
                              );
                              setTasks(updated);
                            }}
                            className="font-semibold text-slate-800 text-xs w-full focus:outline-none focus:border-b focus:border-emerald-500"
                          />
                        </div>

                        {task.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>{task.assignee}</span>
                          </div>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                              task.priority === 'critical'
                                ? 'bg-rose-100 text-rose-800'
                                : task.priority === 'high'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        {/* Status Mover Quick Buttons */}
                        <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 border-t border-slate-50">
                          <span>Frist: {task.dueDate}</span>
                          <div className="flex items-center gap-1">
                            {col.id !== 'backlog' && (
                              <button
                                onClick={() => {
                                  const prev =
                                    col.id === 'done'
                                      ? 'review'
                                      : col.id === 'review'
                                      ? 'in_progress'
                                      : 'backlog';
                                  moveTaskStatus(task.id, prev as TaskStatus);
                                }}
                                className="hover:text-slate-800 font-bold px-1"
                              >
                                ←
                              </button>
                            )}
                            {col.id !== 'done' && (
                              <button
                                onClick={() => {
                                  const next =
                                    col.id === 'backlog'
                                      ? 'in_progress'
                                      : col.id === 'in_progress'
                                      ? 'review'
                                      : 'done';
                                  moveTaskStatus(task.id, next as TaskStatus);
                                }}
                                className="hover:text-emerald-600 font-bold px-1"
                              >
                                →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleAddTask(col.id)}
                    className="mt-3 w-full py-1 text-center text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
                  >
                    + Aufgabe hinzufügen
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MILESTONES & TIMELINE */}
      {activeSubTab === 'milestones' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Formale Meilensteine mit vertraglichen Liefergegenständen (Deliverables).
            </span>
            {canEditProject() && (
              <button
                onClick={handleAddMilestone}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Meilenstein anlegen</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {milestones.map((m) => (
              <div
                key={m.id}
                className={`p-5 rounded-xl border transition-all text-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  m.isCompleted
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleMilestone(m.id)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-600"
                  >
                    {m.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-emerald-500" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{m.title}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono uppercase">
                        Phase: {m.phase}
                      </span>
                      {m.isCompleted && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                          Abgeschlossen am {m.completedDate}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-xs">{m.description}</p>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-slate-500">
                        Deliverables:
                      </span>
                      {m.deliverables.map((del, i) => (
                        <span
                          key={i}
                          className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded border border-slate-200"
                        >
                          {del}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs shrink-0">
                  <div className="text-right">
                    <div className="text-slate-500 text-[11px]">Zieltermin:</div>
                    <div className="font-bold text-slate-800">{m.targetDate}</div>
                    <div className="text-[11px] text-slate-400">{m.responsiblePerson}</div>
                  </div>
                  <button
                    onClick={() => toggleMilestone(m.id)}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${
                      m.isCompleted
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {m.isCompleted ? 'Als offen markieren' : 'Als erreicht abhaken'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RISK REGISTER */}
      {activeSubTab === 'risks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Identifizierte Risiken (Zoll, Netzausfälle, Kofinanzierung) und definierte Gegenmaßnahmen.
            </span>
            {canEditProject() && (
              <button
                onClick={handleAddRisk}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Neues Risiko erfassen</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {risks.map((risk) => (
              <div
                key={risk.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {risk.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        risk.impact === 'high'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      Impact: {risk.impact} | Prob: {risk.probability}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mt-2">{risk.description}</h3>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mt-3 text-xs">
                    <span className="font-bold text-slate-800 block mb-1">
                      Gegenmaßnahme (Mitigation Strategy):
                    </span>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {risk.mitigationStrategy}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>Verantwortlich: {risk.responsiblePerson}</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                      risk.status === 'mitigated'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Status: {risk.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
