import React, { useState, useEffect } from 'react';
import { Project, ProjectCategory, ProjectLifecyclePhase, ProjectStatus } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuthRole } from '../../context/AuthRoleContext';
import { useProjects } from '../../context/ProjectContext';
import {
  X,
  Save,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Building,
  Globe,
  Tag,
  DollarSign,
  Users,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const { t } = useLanguage();
  const { currentUser, canEditProject } = useAuthRole();
  const { updateProject, deleteProject } = useProjects();

  const [formData, setFormData] = useState<Partial<Project>>({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        shortDescription: project.shortDescription,
        category: project.category,
        country: project.country,
        locationDetails: project.locationDetails,
        lifecyclePhase: project.lifecyclePhase,
        status: project.status,
        isDemoOrHypothetical: project.isDemoOrHypothetical,
        demoDisclaimer: project.demoDisclaimer || '',
        proposal: {
          ...project.proposal,
          beneficiaryCountPlanned: project.proposal?.beneficiaryCountPlanned || 0,
          estimatedBudgetEUR: project.proposal?.estimatedBudgetEUR || 0,
        },
      });
      setConfirmDelete(false);
      setErrorMessage(null);
      setSaveSuccess(false);
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      const updated: Project = {
        ...project,
        title: formData.title || project.title,
        shortDescription: formData.shortDescription ?? project.shortDescription,
        category: (formData.category as ProjectCategory) || project.category,
        country: formData.country || project.country,
        locationDetails: formData.locationDetails ?? project.locationDetails,
        lifecyclePhase: (formData.lifecyclePhase as ProjectLifecyclePhase) || project.lifecyclePhase,
        status: (formData.status as ProjectStatus) || project.status,
        isDemoOrHypothetical: !!formData.isDemoOrHypothetical,
        demoDisclaimer: formData.isDemoOrHypothetical ? (formData.demoDisclaimer || '') : undefined,
        proposal: {
          ...project.proposal,
          beneficiaryCountPlanned: Number(formData.proposal?.beneficiaryCountPlanned) || 0,
          estimatedBudgetEUR: Number(formData.proposal?.estimatedBudgetEUR) || 0,
        },
        updatedAt: new Date().toISOString(),
      };

      await updateProject(updated);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 900);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Fehler beim Speichern der Änderungen.');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setIsDeleting(true);
    try {
      const success = await deleteProject(project.id);
      if (success) {
        onClose();
      }
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Projekt konnte nicht gelöscht werden.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">Projekt bearbeiten & verwalten</h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {project.referenceId}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Stammdaten, offiziellen Status anpassen oder Projekt löschen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5 max-h-[calc(85vh-120px)] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Änderungen erfolgreich gespeichert!</span>
            </div>
          )}

          {/* Section 1: Official vs Demo Mode Toggle */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  Projekt-Betriebsmodus
                </span>
                <p className="text-[11px] text-slate-500">
                  Wählen Sie, ob dies ein offizielles Reales Projekt oder ein Demo-/Planszenario ist.
                </p>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
                  formData.isDemoOrHypothetical
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                {formData.isDemoOrHypothetical ? '🧪 Demo / Hypothetisch' : '✅ Offizielles Reales Projekt'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <label
                className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                  !formData.isDemoOrHypothetical
                    ? 'bg-emerald-50/70 border-emerald-400 ring-1 ring-emerald-400'
                    : 'bg-white border-slate-200 hover:bg-slate-100/60'
                }`}
              >
                <input
                  type="radio"
                  name="projectMode"
                  checked={!formData.isDemoOrHypothetical}
                  onChange={() => setFormData({ ...formData, isDemoOrHypothetical: false })}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Offizielles Reales Projekt</span>
                  <span className="text-[11px] text-slate-600">
                    Produktivbetrieb. Keine Demo-Warnhinweise oder Einschränkungen.
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                  formData.isDemoOrHypothetical
                    ? 'bg-amber-50/70 border-amber-400 ring-1 ring-amber-400'
                    : 'bg-white border-slate-200 hover:bg-slate-100/60'
                }`}
              >
                <input
                  type="radio"
                  name="projectMode"
                  checked={formData.isDemoOrHypothetical}
                  onChange={() => setFormData({ ...formData, isDemoOrHypothetical: true })}
                  className="mt-0.5 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Demo- / Test-Projekt</span>
                  <span className="text-[11px] text-slate-600">
                    Für Schulung & Planung mit Kennzeichnung als Beispieldaten.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 2: Core Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Projekttitel *
              </label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="Vollständiger offizieller Projekttitel"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kurzbeschreibung & Projektziel
              </label>
              <textarea
                rows={3}
                value={formData.shortDescription || ''}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="Kurze Zusammenfassung für Berichte, Dashboard und Förderanträge"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  Kategorie / Schwerpunkt
                </label>
                <select
                  value={formData.category || 'digital_inclusion'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ProjectCategory })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  <option value="digital_inclusion">Digitale Teilhabe & Inklusion</option>
                  <option value="inclusive_education">Inklusive Bildung & Berufsbildung</option>
                  <option value="renewable_energy">Erneuerbare Energien & Solar</option>
                  <option value="environmental_education">Umweltbildung & Generation Green</option>
                  <option value="international_exchange">Internationaler Austausch</option>
                  <option value="community_development">Gemeinschaftsentwicklung</option>
                  <option value="youth_empowerment">Jugendförderung & Empowerment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  Land / Region
                </label>
                <select
                  value={formData.country || 'Cameroon'}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value as any })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  <option value="Cameroon">Kamerun (Cameroon)</option>
                  <option value="Germany">Deutschland (Germany)</option>
                  <option value="Ghana">Ghana</option>
                  <option value="Senegal">Senegal</option>
                  <option value="Kenya">Kenia (Kenya)</option>
                  <option value="Other">Anderes Land / International</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  Standortdetails / Partnerzentrum
                </label>
                <input
                  type="text"
                  value={formData.locationDetails || ''}
                  onChange={(e) => setFormData({ ...formData, locationDetails: e.target.value })}
                  placeholder="z.B. Douala / Littoral Region"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  Projektstatus
                </label>
                <select
                  value={formData.status || 'Draft'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  <option value="Draft">{t.status.Draft || 'Entwurf (Draft)'}</option>
                  <option value="Submitted">{t.status.Submitted || 'Eingereicht'}</option>
                  <option value="Under Review">{t.status['Under Review'] || 'In Begutachtung'}</option>
                  <option value="Approved">{t.status.Approved || 'Genehmigt (Approved)'}</option>
                  <option value="Fundraising">{t.status.Fundraising || 'Fundraising'}</option>
                  <option value="Ready for Implementation">{t.status['Ready for Implementation'] || 'Bereit zur Umsetzung'}</option>
                  <option value="In Progress">{t.status['In Progress'] || 'In Umsetzung'}</option>
                  <option value="Completed">{t.status.Completed || 'Abgeschlossen'}</option>
                  <option value="Closed">{t.status.Closed || 'Archiviert / Beendet'}</option>
                  <option value="Rejected">{t.status.Rejected || 'Abgelehnt'}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  Geplante Begünstigte (Teilnehmende)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.proposal?.beneficiaryCountPlanned || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      proposal: {
                        ...formData.proposal!,
                        beneficiaryCountPlanned: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                  Geschätztes Gesamtbudget (€)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={formData.proposal?.estimatedBudgetEUR || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      proposal: {
                        ...formData.proposal!,
                        estimatedBudgetEUR: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Danger Zone (Delete Project) */}
          <div className="pt-4 border-t border-slate-200">
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-rose-900 block flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Gefahrenzone: Projekt löschen
                </span>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  Löscht dieses Projekt inklusive aller Meilensteine, Budgets und Belege dauerhaft aus der Datenbank.
                </p>
              </div>

              <div className="shrink-0">
                {confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-2.5 py-1.5 text-xs rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="px-3 py-1.5 text-xs rounded bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors shadow-xs"
                    >
                      {isDeleting ? 'Wird gelöscht...' : 'Ja, endgültig löschen'}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 border border-rose-300 text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Projekt löschen</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Änderungen speichern</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
