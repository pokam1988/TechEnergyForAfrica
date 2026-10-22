import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Project } from '../types';
import { SEED_PROJECTS } from '../data/seedProjects';
import { useAuthRole } from './AuthRoleContext';

interface ProjectContextType {
  projects: Project[];
  activeProject: Project | null;
  activeProjectId: string;
  setActiveProjectId: (id: string) => void;
  isLoading: boolean;
  error: string | null;
  createProject: (newProject: Partial<Project>) => Promise<Project>;
  updateProject: (updatedProject: Project) => Promise<Project>;
  deleteProject: (id: string) => Promise<boolean>;
  resetDemoData: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  updateLifecyclePhase: (projectId: string, newPhase: Project['lifecyclePhase'], newStatus?: Project['status']) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectIdState] = useState<string>(() => {
    return localStorage.getItem('tefa_active_proj_id') || 'proj_ifopsim_001';
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { currentUser, logAuditAction } = useAuthRole();

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/projects', {
        headers: {
          'x-user-role': currentUser?.role || 'visitor',
          'x-user-id': currentUser?.id || 'anonymous',
          'x-user-name': currentUser?.name || 'Anonymous',
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
          // verify activeProjectId exists
          if (!data.some((p: Project) => p.id === activeProjectId)) {
            setActiveProjectIdState(data[0].id);
          }
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
          setProjects(parsed);
          setIsLoading(false);
          return;
        } catch {
          // ignore
        }
      }
      setProjects(SEED_PROJECTS);
      setIsLoading(false);
    }
  }, [activeProjectId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const setActiveProjectId = (id: string) => {
    setActiveProjectIdState(id);
    localStorage.setItem('tefa_active_proj_id', id);
  };

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || null;

  const createProject = async (newProjectData: Partial<Project>): Promise<Project> => {
    const year = new Date().getFullYear();
    const count = projects.length + 1;
    const refId = newProjectData.referenceId || `TEFA-${year}-PRJ-${String(count).padStart(3, '0')}`;

    const newProject: Project = {
      id: 'proj_' + Date.now(),
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
      createdBy: newProjectData.createdBy || 'Authorized User',
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
        },
        body: JSON.stringify(newProject),
      });
      if (res.ok) {
        const savedProject = await res.json();
        setProjects((prev) => [savedProject, ...prev]);
        setActiveProjectId(savedProject.id);
        localStorage.setItem('tefa_projects_backup', JSON.stringify([savedProject, ...projects]));
        logAuditAction('PROJECT_CREATED', `Created new project ${savedProject.title}`, savedProject.id, savedProject.title);
        return savedProject;
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Serverfehler: ${err.error || 'Projekt konnte nicht angelegt werden.'}`);
      }
    } catch (e) {
      console.warn('Backend offline, saving locally:', e);
    }

    setProjects((prev) => [newProject, ...prev]);
    setActiveProjectId(newProject.id);
    localStorage.setItem('tefa_projects_backup', JSON.stringify([newProject, ...projects]));
    logAuditAction('PROJECT_CREATED', `Created new project (local storage) ${newProject.title}`, newProject.id, newProject.title);
    return newProject;
  };

  const updateProject = async (updatedProject: Project): Promise<Project> => {
    const finalProj = { ...updatedProject, updatedAt: new Date().toISOString() };

    try {
      const res = await fetch(`/api/projects/${finalProj.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id,
          'x-user-name': currentUser.name,
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
      setProjects((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      localStorage.setItem('tefa_projects_backup', JSON.stringify(projects.map((p) => (p.id === saved.id ? saved : p))));
      return saved;
    } catch (e) {
      if ((e as Error).message.includes('Forbidden') || (e as Error).message.includes('Governance')) {
        throw e;
      }
      console.warn('Backend offline, saving locally:', e);
      setProjects((prev) => prev.map((p) => (p.id === finalProj.id ? finalProj : p)));
      localStorage.setItem('tefa_projects_backup', JSON.stringify(projects.map((p) => (p.id === finalProj.id ? finalProj : p))));
      return finalProj;
    }
  };

  const updateLifecyclePhase = async (
    projectId: string,
    newPhase: Project['lifecyclePhase'],
    newStatus?: Project['status']
  ) => {
    const target = projects.find((p) => p.id === projectId);
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
    const target = projects.find((p) => p.id === id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (activeProjectId === id && projects.length > 1) {
      const remaining = projects.filter((p) => p.id !== id);
      setActiveProjectId(remaining[0].id);
    }

    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    } catch {
      // ignore
    }

    if (target) {
      logAuditAction('PROJECT_DELETED', `Deleted project ${target.title}`, id, target.title);
    }
    return true;
  };

  const resetDemoData = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/projects/reset-demo', { method: 'POST' });
    } catch {
      // ignore
    }
    setProjects(SEED_PROJECTS);
    setActiveProjectId(SEED_PROJECTS[0].id);
    localStorage.removeItem('tefa_projects_backup');
    setIsLoading(false);
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        activeProjectId,
        setActiveProjectId,
        isLoading,
        error,
        createProject,
        updateProject,
        deleteProject,
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
