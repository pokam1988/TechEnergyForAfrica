/**
 * TEFA ProjectHub – From Idea to Impact
 * TechEnergy For Africa e.V. (TEFA)
 * https://www.techenergyforafrica.com
 */

import React, { useState } from 'react';
import { LanguageProvider } from './i18n/LanguageContext';
import { AuthRoleProvider } from './context/AuthRoleContext';
import { ProjectProvider, useProjects } from './context/ProjectContext';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { ProposalWizard } from './components/proposal/ProposalWizard';
import { AIDecisionAdvisor } from './components/advisor/AIDecisionAdvisor';
import { FeasibilityChecklist } from './components/feasibility/FeasibilityChecklist';
import { PlanningModule } from './components/planning/PlanningModule';
import { BudgetDashboard } from './components/budget/BudgetDashboard';
import { ProjectSimulator } from './components/simulator/ProjectSimulator';
import { PartnersFundraising } from './components/partners/PartnersFundraising';
import { InventoryManager } from './components/inventory/InventoryManager';
import { ImplementationMonitoring } from './components/monitoring/ImplementationMonitoring';
import { FinancialAccounting } from './components/finance/FinancialAccounting';
import { ImpactEvaluation } from './components/impact/ImpactEvaluation';
import { ProjectClosure } from './components/closure/ProjectClosure';
import { AuditLogViewer } from './components/audit/AuditLogViewer';
import { DocumentExportModal } from './components/documents/DocumentExportModal';
import { X, Plus, Sparkles, Building } from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { createProject } = useProjects();
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<
    | 'digital_inclusion'
    | 'inclusive_education'
    | 'renewable_energy'
    | 'environmental_education'
    | 'international_exchange'
    | 'community_development'
    | 'youth_empowerment'
  >('digital_inclusion');
  const [newCountry, setNewCountry] = useState<'Cameroon' | 'Germany' | 'Ghana' | 'Senegal' | 'Kenya' | 'Other'>('Cameroon');
  const [newDesc, setNewDesc] = useState('');

  const handleCreateNewProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await createProject({
      title: newTitle.trim(),
      category: newCategory,
      country: newCountry,
      shortDescription: newDesc.trim() || 'Neues Projektvorhaben',
      lifecyclePhase: 'proposal',
      status: 'Draft',
    });

    setIsNewProjectModalOpen(false);
    setNewTitle('');
    setNewDesc('');
    setActiveTab('proposal');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800 w-full overflow-x-hidden">
      <Header
        onOpenExport={() => setIsExportOpen(true)}
        onOpenAudit={() => {
          setActiveTab('audit');
          setIsMobileMenuOpen(false);
        }}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setIsMobileMenuOpen(false);
          }}
          onNewProjectClick={() => {
            setIsNewProjectModalOpen(true);
            setIsMobileMenuOpen(false);
          }}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-3 sm:p-5 lg:p-8 w-full">
          <div className="max-w-7xl mx-auto w-full">
            {activeTab === 'dashboard' && (
              <OverviewDashboard
                onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
                onOpenExport={() => setIsExportOpen(true)}
              />
            )}
            {activeTab === 'proposal' && <ProposalWizard />}
            {activeTab === 'advisor' && <AIDecisionAdvisor />}
            {activeTab === 'feasibility' && <FeasibilityChecklist />}
            {activeTab === 'planning' && <PlanningModule />}
            {activeTab === 'budget' && <BudgetDashboard />}
            {activeTab === 'simulator' && <ProjectSimulator />}
            {activeTab === 'partners' && <PartnersFundraising />}
            {activeTab === 'inventory' && <InventoryManager />}
            {activeTab === 'monitoring' && <ImplementationMonitoring />}
            {activeTab === 'finance' && <FinancialAccounting />}
            {activeTab === 'impact' && <ImpactEvaluation />}
            {activeTab === 'closure' && <ProjectClosure />}
            {activeTab === 'audit' && <AuditLogViewer />}
          </div>
        </main>
      </div>

      {/* Export Modal */}
      <DocumentExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      {/* New Project Dialog */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Neues TEFA-Projektvorhaben anlegen
                </h3>
              </div>
              <button
                onClick={() => setIsNewProjectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewProject} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Projekttitel *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="z.B. Solar Literacy Hub Garoua"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Schwerpunktbereich *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as typeof newCategory)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="digital_inclusion">Digitale Teilhabe</option>
                    <option value="inclusive_education">Inklusive Bildung</option>
                    <option value="renewable_energy">Erneuerbare Energien</option>
                    <option value="environmental_education">Umweltbildung (Gen Green)</option>
                    <option value="international_exchange">Internationaler Austausch</option>
                    <option value="community_development">Gemeindeentwicklung</option>
                    <option value="youth_empowerment">Jugendförderung</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Zielland *
                  </label>
                  <select
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value as typeof newCountry)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Cameroon">Kamerun</option>
                    <option value="Germany">Deutschland</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Senegal">Senegal</option>
                    <option value="Kenya">Kenia</option>
                    <option value="Other">Anderes Land</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kurze Beschreibung der Projektidee
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Kernziel, geplante Aktivitäten und Zielgruppe..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Projekt anlegen & zum Antrag →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthRoleProvider>
        <ProjectProvider>
          <AppContent />
        </ProjectProvider>
      </AuthRoleProvider>
    </LanguageProvider>
  );
}
