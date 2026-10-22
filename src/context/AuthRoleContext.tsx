import React, { createContext, useContext, useState } from 'react';
import { UserRole, AuditLogEntry } from '../types';

interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatarInitials: string;
}

const ROLE_PROFILES: Record<UserRole, UserProfile> = {
  visitor: {
    id: 'user_visitor',
    name: 'External Proposer (Gast / Bewerber)',
    role: 'visitor',
    email: 'applicant@external-partner.org',
    avatarInitials: 'EX',
  },
  tefa_member: {
    id: 'user_tefa_member',
    name: 'Amina Diallo (TEFA Member)',
    role: 'tefa_member',
    email: 'amina.diallo@techenergyforafrica.com',
    avatarInitials: 'AD',
  },
  project_manager: {
    id: 'user_pm',
    name: 'Marc Tagne (Project Manager)',
    role: 'project_manager',
    email: 'marc.tagne@techenergyforafrica.com',
    avatarInitials: 'MT',
  },
  project_reviewer: {
    id: 'user_reviewer',
    name: 'Dr. Sophie Becker (Reviewer)',
    role: 'project_reviewer',
    email: 'sophie.becker@eval-nonprofit.de',
    avatarInitials: 'SB',
  },
  finance_officer: {
    id: 'user_finance',
    name: 'Klaus Weber (Finance Officer)',
    role: 'finance_officer',
    email: 'klaus.weber@techenergyforafrica.com',
    avatarInitials: 'KW',
  },
  board_member: {
    id: 'user_board',
    name: 'Dr. Frederic Pokam (TEFA Board Member)',
    role: 'board_member',
    email: 'frederic.pokam@techenergyforafrica.com',
    avatarInitials: 'FP',
  },
  system_admin: {
    id: 'user_admin',
    name: 'Admin User (TEFA SysAdmin)',
    role: 'system_admin',
    email: 'admin@techenergyforafrica.com',
    avatarInitials: 'AU',
  },
  local_partner: {
    id: 'user_local_partner',
    name: 'Christian Kamga (Local Partner, Douala)',
    role: 'local_partner',
    email: 'c.kamga@ifopsim-partner.cm',
    avatarInitials: 'CK',
  },
};

interface AuthRoleContextType {
  currentUser: UserProfile;
  setRole: (role: UserRole) => void;
  canViewInternalFinances: () => boolean;
  canApproveProposals: () => boolean;
  canApproveExpenses: () => boolean;
  canEditProject: () => boolean;
  canReviewFeasibility: () => boolean;
  canManageClosure: () => boolean;
  logAuditAction: (action: string, details: string, projectId?: string, projectTitle?: string) => Promise<void>;
  auditLogs: AuditLogEntry[];
}

const AuthRoleContext = createContext<AuthRoleContextType | undefined>(undefined);

export const AuthRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem('tefa_active_role');
    return (saved as UserRole) || 'board_member';
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'log-seed-1',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      userId: 'user_pm',
      userName: 'Marc Tagne (Project Manager)',
      userRole: 'project_manager',
      action: 'PROJECT_UPDATED',
      projectId: 'proj_ifopsim_001',
      projectTitle: 'IFOPSIM – Inclusive Digital Vocational Training',
      details: 'Updated hypothetical planning scenario and equipment feasibility requirements.',
    },
    {
      id: 'log-seed-2',
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      userId: 'user_finance',
      userName: 'Klaus Weber (Finance Officer)',
      userRole: 'finance_officer',
      action: 'BUDGET_VERIFIED',
      projectId: 'proj_ifopsim_001',
      projectTitle: 'IFOPSIM – Inclusive Digital Vocational Training',
      details: 'Reviewed budget vs. actuals; marked grant as pending application (not confirmed).',
    },
    {
      id: 'log-seed-3',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      userId: 'user_board',
      userName: 'Dr. Frederic Pokam (TEFA Board Member)',
      userRole: 'board_member',
      action: 'FEASIBILITY_REVIEW',
      projectId: 'proj_gen_green_002',
      projectTitle: 'Generation Green – Environmental Education',
      details: 'Approved solar curriculum milestone for implementation phase.',
    },
  ]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('tefa_active_role', newRole);
    logAuditAction('ROLE_SWITCH', `Switched active user profile to ${ROLE_PROFILES[newRole].name} (${newRole})`);
  };

  const currentUser = ROLE_PROFILES[role];

  // RBAC permissions logic
  const canViewInternalFinances = () => {
    return role !== 'visitor' && role !== 'local_partner';
  };

  const canApproveProposals = () => {
    return role === 'board_member' || role === 'system_admin';
  };

  const canApproveExpenses = () => {
    return role === 'finance_officer' || role === 'system_admin';
  };

  const canEditProject = () => {
    return (
      role === 'project_manager' ||
      role === 'board_member' ||
      role === 'system_admin' ||
      role === 'tefa_member'
    );
  };

  const canReviewFeasibility = () => {
    return (
      role === 'project_reviewer' ||
      role === 'board_member' ||
      role === 'system_admin' ||
      role === 'project_manager'
    );
  };

  const canManageClosure = () => {
    return role === 'board_member' || role === 'system_admin';
  };

  const logAuditAction = async (
    action: string,
    details: string,
    projectId?: string,
    projectTitle?: string
  ) => {
    const entry: AuditLogEntry = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      projectId,
      projectTitle,
      details,
    };

    setAuditLogs((prev) => [entry, ...prev]);

    // Send to server-side audit endpoint
    try {
      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch {
      // Backend may be offline in purely client mode; local log remains intact
    }
  };

  return (
    <AuthRoleContext.Provider
      value={{
        currentUser,
        setRole,
        canViewInternalFinances,
        canApproveProposals,
        canApproveExpenses,
        canEditProject,
        canReviewFeasibility,
        canManageClosure,
        logAuditAction,
        auditLogs,
      }}
    >
      {children}
    </AuthRoleContext.Provider>
  );
};

export const useAuthRole = (): AuthRoleContextType => {
  const context = useContext(AuthRoleContext);
  if (!context) {
    throw new Error('useAuthRole must be used within an AuthRoleProvider');
  }
  return context;
};
