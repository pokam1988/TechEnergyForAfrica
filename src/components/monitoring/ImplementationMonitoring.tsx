import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuthRole } from '../../context/AuthRoleContext';
import { useProjects } from '../../context/ProjectContext';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Calendar,
  Layers,
  Save,
} from 'lucide-react';

export const ImplementationMonitoring: React.FC = () => {
  const { t } = useLanguage();
  const { currentUser, canEditProject } = useAuthRole();
  const { activeProject, updateProject } = useProjects();

  const [evidenceNote, setEvidenceNote] = useState('');
  const [evidenceList, setEvidenceList] = useState<
    { id: string; date: string; author: string; note: string }[]
  >([
    {
      id: 'ev-1',
      date: '2026-08-25',
      author: 'Christian Kamga (Local Partner)',
      note: 'Vor-Ort-Begehung des Partnerzentrums Bonabéri: Stromanschluss geprüft; Dachfläche für 5kW-Photovoltaik freigegeben.',
    },
    {
      id: 'ev-2',
      date: '2026-09-14',
      author: 'Marc Tagne (Project Manager)',
      note: 'Abstimmung mit Association Nationale des Sourds du Cameroun: 60 Voranmeldungen für Ausbildungszyklus 1 vorliegend.',
    },
  ]);

  if (!activeProject) return null;

  const completedMilestones = activeProject.milestones.filter((m) => m.isCompleted).length;
  const totalMilestones = activeProject.milestones.length;
  const progressPct =
    totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const completedTasks = activeProject.tasks.filter((t) => t.status === 'done').length;
  const totalTasks = activeProject.tasks.length;
  const taskProgressPct =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleAddEvidence = () => {
    if (!evidenceNote.trim()) return;
    const newEv = {
      id: 'ev_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      author: currentUser.name,
      note: evidenceNote.trim(),
    };
    setEvidenceList([newEv, ...evidenceList]);
    setEvidenceNote('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Modul I
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Operatives Controlling & Fortschrittsbericht
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Projektumsetzung & Monitoring Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
            Live-Status der Meilensteine, Liefergegenstände und Aufgabenfortschritte basierend auf
            dokumentierten Nachweisen und Vor-Ort-Rückmeldungen.
          </p>
        </div>
      </div>

      {/* Progress Bars & Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span>Meilenstein-Erreichung</span>
            <span className="text-emerald-600 font-bold">{progressPct}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            {completedMilestones} von {totalMilestones} Meilensteinen vertraglich erfüllt
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span>Aufgabenfortschritt (Tasks)</span>
            <span className="text-blue-600 font-bold">{taskProgressPct}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${taskProgressPct}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            {completedTasks} von {totalTasks} Arbeitspaketen abgeschlossen
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span>Zielgruppen-Erreichung</span>
            <span className="text-purple-600 font-bold">In Vorbereitung</span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {activeProject.proposal.beneficiaryCountPlanned}{' '}
            <span className="text-xs font-normal text-slate-500">geplante Teilnehmende</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            2 Ausbildungsjahrgänge (Cohorts à 30 Personen)
          </div>
        </div>
      </div>

      {/* Deliverables Checklist & Evidence Upload Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deliverables Status */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Liefergegenstände & Meilenstein-Deliverables
          </h2>

          <div className="space-y-3 text-xs">
            {activeProject.milestones.map((m) => (
              <div
                key={m.id}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{m.title}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {m.isCompleted ? 'Vollständig erbracht' : 'In Bearbeitung'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {m.deliverables.map((d, i) => (
                    <span
                      key={i}
                      className="bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200 text-[11px] flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3 text-slate-400" />
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Log & Site Update Register */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Nachweis- & Monitoring-Log (Vor-Ort-Belege)
          </h2>

          {canEditProject() && (
            <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700">
                Neuen Vor-Ort-Nachweis oder Begehungsbericht protokollieren
              </label>
              <textarea
                rows={2}
                value={evidenceNote}
                onChange={(e) => setEvidenceNote(e.target.value)}
                placeholder="z.B. Installation der Solarmodule abgeschlossen, Testmessung erfolgreich..."
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleAddEvidence}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Nachweis eintragen</span>
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {evidenceList.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1 shadow-2xs"
              >
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span className="font-semibold text-slate-800">{item.author}</span>
                  <span>{item.date}</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-[11px]">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
