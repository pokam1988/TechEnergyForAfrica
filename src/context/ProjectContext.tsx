import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Project } from '../types';
import { SEED_PROJECTS } from '../data/seedProjects';
import { useAuthRole } from './AuthRoleContext';
import { useOrganization } from './OrganizationContext';

interface ProjectContextType {
  projects: Project[];
  allProjects: Project[];
  activeProject: Project | null;
  activeProjectId: string;
  setActiveProjectId: (id: string) => void;
  isLoading: boolean;
  error: string | null;
  createProject: (newProject: Partial<Project>) => Promise<Project>;
  updateProject: (updatedProject: Project) => Promise<Project>;
  deleteProject: (id: string) => Promise<boolean>;
  cleanPlatformForOfficialUse: () => Promise<void>;
  resetDemoData: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  updateLifecyclePhase: (projectId: string, newPhase: Project['lifecyclePhase'], newStatus?: Project['status']) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const { activeOrgId } = useOrganization();
  const [activeProjectId, setActiveProjectIdState] = useState<string>(() => {
    return localStorage.getItem('tefa_active_proj_id') || 'proj_tefa_official_001';
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { currentUser, logAuditAction } = useAuthRole();

  // Filter projects by current active organization workspace
  const projects = allProjects.filter((p) => (p.organizationId || 'org_tefa') === activeOrgId);

  // Sync active project if active organization changes or projects update
  useEffect(() => {
    if (projects.length > 0) {
      if (!projects.some((p) => p.id === activeProjectId)) {
        setActiveProjectIdState(projects[0].id);
      }
    }
  }, [projects, activeProjectId, activeOrgId]);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/projects', {
        headers: {
          'x-user-role': currentUser?.role || 'visitor',
          'x-user-id': currentUser?.id || 'anonymous',
          'x-user-name': currentUser?.name || 'Anonymous',
          'x-organization-id': activeOrgId || 'org_tefa',
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setAllProjects(data);
          setIsLoading(false);
          return;
        }
      }
      throw new Error('API returned empty or non-200');
    } catch {
      // Fallback to local storage or seed
      const saved = localStorage.getItem('tefa_projects_backup');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setAllProjects(parsed);
          setIsLoading(false);
          return;
        } catch {
          // ignore
        }
      }
      setAllProjects(SEED_PROJECTS);
      setIsLoading(false);
    }
  }, [activeOrgId, currentUser]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const setActiveProjectId = (id: string) => {
    setActiveProjectIdState(id);
    localStorage.setItem(`tefa_active_proj_id_${activeOrgId}`, id);
    localStorage.setItem('tefa_active_proj_id', id);
  };

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || null;

  const createProject = async (newProjectData: Partial<Project>): Promise<Project> => {
    const year = new Date().getFullYear();
    const count = allProjects.length + 1;
    const prefix = activeOrgId === 'org_tefa' ? 'TEFA' : activeOrgId.replace('org_', '').toUpperCase().slice(0, 6);
    const refId = newProjectData.referenceId || `${prefix}-${year}-PRJ-${String(count).padStart(3, '0')}`;

    const newProject: Project = {
      id: 'proj_' + Date.now(),
      organizationId: newProjectData.organizationId || activeOrgId,
      programmeId: newProjectData.programmeId,
      referenceId: refId,
      title: newProjectData.title || 'New Untitled Project',
      shortDescription: newProjectData.shortDescription || '',
      category: newProjectData.category || 'digital_inclusion',
      country: newProjectData.country || 'Cameroon',
      locationDetails: newProjectData.locationDetails || '',
      lifecyclePhase: newProjectData.lifecyclePhase || 'idea',
      status: newProjectData.status || 'Draft',
      isDemoOrHypothetical: newProjectData.isDemoOrHypothetical ?? false,
      demoDisclaimer: newProjectData.demoDisclaimer,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: newProjectData.createdBy || currentUser.name || 'Authorized User',
      proposal: newProjectData.proposal || {
        problemStatement: '',
        targetBeneficiaries: '',
        beneficiaryCountPlanned: 0,
        proposedSolution: '',
        objectives: [],
        expectedResults: [],
        activities: [],
        durationMonths: 6,
        estimatedBudgetEUR: 0,
        potentialPartners: [],
        sustainabilityPlan: '',
        inclusionAccessibilityNeeds: '',
        proposerName: '',
        proposerEmail: '',
        submissionDate: new Date().toISOString().split('T')[0],
      },
      feasibilityChecks: newProjectData.feasibilityChecks || [],
      decisions: newProjectData.decisions || [],
      milestones: newProjectData.milestones || [],
      tasks: newProjectData.tasks || [],
      risks: newProjectData.risks || [],
      budgetItems: newProjectData.budgetItems || [],
      fundingSources: newProjectData.fundingSources || [],
      transactions: newProjectData.transactions || [],
      impactIndicators: newProjectData.impactIndicators || [],
      closure: newProjectData.closure || {
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
      },
      simulationParams: newProjectData.simulationParams || {
        beneficiariesCount: 50,
        trainersCount: 2,
        trainingDurationMonths: 6,
        usableWorkstations: 15,
        studentsPerWorkstation: 3,
        donatedHardwareCount: 0,
        hardwareUnitPurchaseCostEUR: 200,
        logisticsCustomsCostEUR: 1500,
        infrastructureSolarCostEUR: 5000,
        monthlyOperatingCostEUR: 300,
        accessibilityInterpreterCostEUR: 1000,
        maintenanceReservePct: 10,
        confirmedGrantsEUR: 0,
        pendingGrantsEUR: 0,
      },
    };

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id,
          'x-user-name': currentUser.name,
          'x-organization-id': activeOrgId || 'org_tefa',
        },
        body: JSON.stringify(newProject),
      });
      if (res.ok) {
        const savedProject = await res.json();
        setAllProjects((prev) => [savedProject, ...prev]);
        setActiveProjectId(savedProject.id);
        localStorage.setItem('tefa_projects_backup', JSON.stringify([savedProject, ...allProjects]));
        logAuditAction('PROJECT_CREATED', `Created new project ${savedProject.title}`, savedProject.id, savedProject.title);
        return savedProject;
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Serverfehler: ${err.error || 'Projekt konnte nicht angelegt werden.'}`);
      }
    } catch (e) {
      console.warn('Backend offline, saving locally:', e);
    }

    setAllProjects((prev) => [newProject, ...prev]);
    setActiveProjectId(newProject.id);
    localStorage.setItem('tefa_projects_backup', JSON.stringify([newProject, ...allProjects]));
    logAuditAction('PROJECT_CREATED', `Created new project (local storage) ${newProject.title}`, newProject.id, newProject.title);
    return newProject;
  };

  const updateProject = async (updatedProject: Project): Promise<Project> => {
    const finalProj = {
      ...updatedProject,
      organizationId: updatedProject.organizationId || activeOrgId,
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`/api/projects/${finalProj.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id,
          'x-user-name': currentUser.name,
          'x-organization-id': activeOrgId || 'org_tefa',
        },
        body: JSON.stringify(finalProj),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errorMsg = errData.error || `Server Fehler ${res.status}`;
        await fetchProjects();
        alert(`Governance-Verstoß / Zugriff verweigert: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      const saved = await res.json();
      setAllProjects((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      localStorage.setItem('tefa_projects_backup', JSON.stringify(allProjects.map((p) => (p.id === saved.id ? saved : p))));
      return saved;
    } catch (e) {
      if ((e as Error).message.includes('Forbidden') || (e as Error).message.includes('Governance')) {
        throw e;
      }
      console.warn('Backend offline, saving locally:', e);
      setAllProjects((prev) => prev.map((p) => (p.id === finalProj.id ? finalProj : p)));
      localStorage.setItem('tefa_projects_backup', JSON.stringify(allProjects.map((p) => (p.id === finalProj.id ? finalProj : p))));
      return finalProj;
    }
  };

  const updateLifecyclePhase = async (
    projectId: string,
    newPhase: Project['lifecyclePhase'],
    newStatus?: Project['status']
  ) => {
    const target = allProjects.find((p) => p.id === projectId);
    if (!target) return;
    const updated: Project = {
      ...target,
      lifecyclePhase: newPhase,
      status: newStatus || target.status,
    };
    await updateProject(updated);
    logAuditAction(
      'PHASE_TRANSITION',
      `Advanced project phase to ${newPhase}${newStatus ? ` (Status: ${newStatus})` : ''}`,
      target.id,
      target.title
    );
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    const target = allProjects.find((p) => p.id === id);
    const updatedAll = allProjects.filter((p) => p.id !== id);
    setAllProjects(updatedAll);
    localStorage.setItem('tefa_projects_backup', JSON.stringify(updatedAll));

    const remainingInOrg = projects.filter((p) => p.id !== id);
    if (activeProjectId === id) {
      if (remainingInOrg.length > 0) {
        setActiveProjectId(remainingInOrg[0].id);
      } else {
        // If no projects remain in this organization, create a clean official starter project
        try {
          const starter = await createProject({
            title: activeOrgId === 'org_tefa' ? 'TechEnergy For Africa – Offizielles Projekt 2026' : 'Offizielles Projekt 2026',
            category: 'renewable_energy',
            country: 'Cameroon',
            isDemoOrHypothetical: false,
            shortDescription: 'Offizielles Projekt für Produktivbetrieb und Förderanträge.',
            status: 'Draft',
            lifecyclePhase: 'idea',
          });
          setActiveProjectId(starter.id);
        } catch {
          // ignore
        }
      }
    }

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id,
          'x-user-name': currentUser.name,
          'x-organization-id': activeOrgId || 'org_tefa',
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.warn('Server project delete response:', err);
      }
    } catch (e) {
      console.warn('Network error during project delete:', e);
    }

    if (target) {
      logAuditAction('PROJECT_DELETED', `Deleted project [${target.referenceId}] ${target.title}`, id, target.title);
    }
    return true;
  };

  const cleanPlatformForOfficialUse = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/projects/clean-official', {
        method: 'POST',
        headers: {
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id,
          'x-user-name': currentUser.name,
          'x-organization-id': activeOrgId || 'org_tefa',
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.projects) && data.projects.length > 0) {
          setAllProjects(data.projects);
          localStorage.setItem('tefa_projects_backup', JSON.stringify(data.projects));
          const orgProjects = data.projects.filter((p: Project) => (p.organizationId || 'org_tefa') === activeOrgId);
          if (orgProjects.length > 0) {
            setActiveProjectId(orgProjects[0].id);
          }
          logAuditAction('PLATFORM_CLEANED', 'Cleaned demo and test projects for official production use.');
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Backend clean-official error:', e);
    }

    // Fallback client-side cleaning
    const cleaned = allProjects.filter((p) => !p.isDemoOrHypothetical && p.title.toLowerCase() !== 'test');
    if (cleaned.length === 0) {
      const starter: Project = {
        id: 'proj_official_' + Date.now(),
        organizationId: activeOrgId || 'org_tefa',
        referenceId: 'TEFA-2026-OFFICIAL-001',
        title: 'TechEnergy For Africa – Offizielles Projekt 2026',
        shortDescription: 'Offizielles Projekt für den Produktivbetrieb, Fördermittel und reale Wirkungsberichte.',
        category: 'renewable_energy',
        country: 'Cameroon',
        locationDetails: 'Douala & Yaoundé, Kamerun / Berlin, Deutschland',
        lifecyclePhase: 'planning',
        status: 'Approved',
        isDemoOrHypothetical: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentUser.name || 'Dr. Frederic Pokam (TEFA Board Member)',
        proposal: {
          problemStatement: 'Nachhaltige Energie- und digitale Bildungsinfrastruktur in West- und Zentralafrika aufbauen.',
          targetBeneficiaries: 'Jugendliche, Auszubildende und Lehrkräfte',
          beneficiaryCountPlanned: 120,
          proposedSolution: 'Installation von Solarinselanlagen und barrierereien IT-Schulungslaboren.',
          objectives: ['Aufbau von 2 Solar-IT-Zentren', 'Zertifizierung von 120 Teilnehmenden'],
          expectedResults: ['Nachhaltige Stromversorgung', 'Qualifizierte IT-Absolventen'],
          activities: ['Standortprüfung', 'Beschaffung', 'Installation', 'Schulung'],
          durationMonths: 12,
          estimatedBudgetEUR: 50000,
          potentialPartners: ['Lokale Partnerorganisationen vor Ort', 'Bildungsministerien'],
          sustainabilityPlan: 'Betriebskostenfinanzierung über lokale Solarenergie-Dienstleistungen.',
          inclusionAccessibilityNeeds: 'Barrierefreie Räume und inklusive Schulungsmaterialien.',
          proposerName: currentUser.name || 'Dr. Frederic Pokam',
          proposerEmail: currentUser.email || 'frederic.pokam@techenergyforafrica.org',
          submissionDate: new Date().toISOString().split('T')[0],
        },
        feasibilityChecks: [],
        decisions: [],
        milestones: [],
        tasks: [],
        risks: [],
        budgetItems: [
          {
            id: 'b1',
            category: 'Equipment & Hardware',
            description: 'Solarsysteme & IT-Arbeitsplätze',
            plannedCost: 35000,
            approvedBudget: 35000,
            actualExpenditure: 0,
            committedCost: 0,
            currency: 'EUR',
          },
          {
            id: 'b2',
            category: 'Personnel',
            description: 'Ausbilder & Projektleitung vor Ort',
            plannedCost: 15000,
            approvedBudget: 15000,
            actualExpenditure: 0,
            committedCost: 0,
            currency: 'EUR',
          },
        ],
        fundingSources: [
          {
            id: 'f1',
            name: 'TechEnergy For Africa e.V. Eigenmittel & Förderer',
            type: 'grant',
            amount: 50000,
            currency: 'EUR',
            status: 'confirmed',
            isRestricted: false,
          },
        ],
        transactions: [],
        impactIndicators: [],
        closure: {
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
        },
        simulationParams: {
          beneficiariesCount: 120,
          trainersCount: 4,
          trainingDurationMonths: 12,
          usableWorkstations: 25,
          studentsPerWorkstation: 2,
          donatedHardwareCount: 10,
          hardwareUnitPurchaseCostEUR: 250,
          logisticsCustomsCostEUR: 2000,
          infrastructureSolarCostEUR: 12000,
          monthlyOperatingCostEUR: 500,
          accessibilityInterpreterCostEUR: 1500,
          maintenanceReservePct: 10,
          confirmedGrantsEUR: 50000,
          pendingGrantsEUR: 0,
        },
      };
      cleaned.push(starter);
    }
    setAllProjects(cleaned);
    localStorage.setItem('tefa_projects_backup', JSON.stringify(cleaned));
    const tefaProjects = cleaned.filter((p) => (p.organizationId || 'org_tefa') === activeOrgId);
    if (tefaProjects.length > 0) {
      setActiveProjectId(tefaProjects[0].id);
    }
    setIsLoading(false);
  };

  const resetDemoData = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/projects/reset-demo', { method: 'POST' });
    } catch {
      // ignore
    }
    setAllProjects(SEED_PROJECTS);
    const tefaProjects = SEED_PROJECTS.filter((p) => (p.organizationId || 'org_tefa') === activeOrgId);
    if (tefaProjects.length > 0) {
      setActiveProjectId(tefaProjects[0].id);
    }
    localStorage.removeItem('tefa_projects_backup');
    setIsLoading(false);
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        allProjects,
        activeProject,
        activeProjectId,
        setActiveProjectId,
        isLoading,
        error,
        createProject,
        updateProject,
        deleteProject,
        cleanPlatformForOfficialUse,
        resetDemoData,
        refreshProjects: fetchProjects,
        updateLifecyclePhase,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
