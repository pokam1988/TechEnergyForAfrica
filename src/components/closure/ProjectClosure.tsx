import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuthRole } from '../../context/AuthRoleContext';
import { useProjects } from '../../context/ProjectContext';
import { ClosureChecklist } from '../../types';
import {
  Award,
  CheckCircle2,
  Save,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Archive,
} from 'lucide-react';

const CLOSURE_STEPS: { key: keyof ClosureChecklist; title: string; desc: string }[] = [
  {
    key: 'deliverablesAccepted',
    title: '1. Alle vertraglichen Liefergegenstände abgenommen',
    desc: 'Protokollarische Übergabe aller Arbeitsergebnisse an den lokalen Partner.',
  },
  {
    key: 'financialReconciliationDone',
    title: '2. Vollständige finanzielle Mittelabstimmung (Reconciliation)',
    desc: 'Alle Ausgaben gebucht, Bankkonten abgeglichen, kein ungeklärtes Restobligo.',
  },
  {
    key: 'commitmentsReviewed',
    title: '3. Offene Verpflichtungen & Verträge aufgelöst',
    desc: 'Lieferantenverträge und Honorarvereinbarungen ordnungsgemäß beendet.',
  },
  {
    key: 'assetsHandedOver',
    title: '4. Anlagen & Hardware formal übergeben (Asset Transfer)',
    desc: 'Inventarunterlagen und Eigentumsrechte an lokalen Träger übertragen.',
  },
  {
    key: 'finalPartnerReportReceived',
    title: '5. Abschlussbericht des lokalen Partners eingegangen',
    desc: 'Schriftlicher Endbericht der Ausbildungsstätte in Kamerun liegt vor.',
  },
  {
    key: 'lessonsLearnedDocumented',
    title: '6. Lessons Learned & Wissensmanagement dokumentiert',
    desc: 'Erkenntnisse für Folgeprojekte im TEFA-Wissensspeicher gesichert.',
  },
  {
    key: 'impactEvaluationComplete',
    title: '7. Abschließende Wirkungsevaluierung durchgeführt',
    desc: 'Absolventenbefragung und Auswertung der Zielerreichung abgeschlossen.',
  },
  {
    key: 'donorReportingFinalized',
    title: '8. Endgültiger Verwendungsnachweis an Geldgeber übermittelt',
    desc: 'Finanzbericht und Sachbericht vom Zuschussgeber formal quittiert.',
  },
  {
    key: 'boardApprovedClosure',
    title: '9. Formelle Entlastung & Beschluss durch den TEFA-Vorstand',
    desc: 'Der Vorstand hat den Projektabschluss und die Entlastung genehmigt.',
  },
  {
    key: 'archiveRetentionConfigured',
    title: '10. Revisionssichere Archivierung (10 Jahre Aufbewahrungsfrist)',
    desc: 'Alle Originalbelege und Verträge gemäß AO §147 archiviert.',
  },
];

export const ProjectClosure: React.FC = () => {
  const { t } = useLanguage();
  const { currentUser, canManageClosure } = useAuthRole();
  const { activeProject, updateProject } = useProjects();

  const [closure, setClosure] = useState<ClosureChecklist>(() => {
    return (
      activeProject?.closure || {
        deliverablesAccepted: false,
        financialReconciliationDone: false,
        commitmentsReviewed: false,
        assetsHandedOver: false,
        finalPartnerReportReceived: false,
        lessonsLearnedDocumented: false,
        impactEvaluationComplete: false,
        donorReportingFinalized: false,
        boardApprovedClosure: false,
        archiveRetentionConfigured: false,
      }
    );
  });

  const [notes, setNotes] = useState(activeProject?.closure.boardSignOffNotes || '');
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (activeProject?.closure) {
      setClosure(activeProject.closure);
      setNotes(activeProject.closure.boardSignOffNotes || '');
    }
  }, [activeProject]);

  const toggleCheck = (key: keyof ClosureChecklist) => {
    if (typeof closure[key] === 'boolean') {
      setClosure({ ...closure, [key]: !closure[key] });
    }
  };

  const completedCount = CLOSURE_STEPS.filter((s) => Boolean(closure[s.key])).length;
  const isAllDone = completedCount === CLOSURE_STEPS.length;

  const handleSaveClosure = async () => {
    if (!activeProject) return;

    const updatedClosure: ClosureChecklist = {
      ...closure,
      boardSignOffNotes: notes,
      boardSignOffDate: isAllDone ? new Date().toISOString().split('T')[0] : closure.boardSignOffDate,
      boardMemberName: currentUser.name,
    };

    const newStatus = isAllDone ? 'Closed' : activeProject.status;
    const newPhase = isAllDone ? 'closure' : activeProject.lifecyclePhase;

    await updateProject({
      ...activeProject,
      status: newStatus,
      lifecyclePhase: newPhase,
      closure: updatedClosure,
    });

    setSaveMsg('Projektabschluss-Status erfolgreich gesichert.');
    setTimeout(() => setSaveMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
              Modul L
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Formaler Projektabschluss & Entlastung
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Strukturierter Projektabschluss-Workflow
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
            10-Punkte-Abschlussprüfung zur formalen Entlastung des Projektleiters, Übergabe der Anlagen
            und revisionssicheren Archivierung.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManageClosure() && (
            <button
              onClick={handleSaveClosure}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Abschlussstand speichern</span>
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

      {/* Progress Card */}
      <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
              Abschlussfortschritt
            </span>
            <div className="text-2xl font-black mt-1">
              {completedCount} von {CLOSURE_STEPS.length} Kriterien erfüllt
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAllDone
                ? 'Alle 10 Prüfkriterien sind erfüllt. Das Projekt kann formell auf "Closed" gesetzt werden.'
                : 'Ausstehende Kriterien müssen vor Entlastung durch Vorstand und Finanzstelle abgearbeitet werden.'}
            </p>
          </div>

          <div className="w-32 h-32 rounded-full border-4 border-slate-800 flex items-center justify-center shrink-0">
            <span className="text-2xl font-black text-emerald-400">
              {Math.round((completedCount / CLOSURE_STEPS.length) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* 10 Step Checklist */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
          Abschlusskatalog & Entlastungskriterien
        </h2>

        <div className="space-y-3">
          {CLOSURE_STEPS.map((s) => {
            const isChecked = Boolean(closure[s.key]);
            return (
              <div
                key={s.key}
                onClick={() => canManageClosure() && toggleCheck(s.key)}
                className={`p-4 rounded-xl border transition-all text-xs flex items-start gap-3 cursor-pointer ${
                  isChecked
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                    : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isChecked ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <div className="font-bold text-sm text-slate-900">{s.title}</div>
                  <div className="text-slate-600 text-xs">{s.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Board Sign-Off Section */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Vorstands-Vermerk & Beschlussfassung (Board Sign-Off)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Beschluss des Vorstands zur Entlastung des Projektleiters..."
            className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />

          <div className="flex justify-end">
            <button
              onClick={handleSaveClosure}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 transition-colors shadow-sm"
            >
              <FileCheck className="w-4 h-4" />
              <span>Abschlussbeschluss vollziehen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
