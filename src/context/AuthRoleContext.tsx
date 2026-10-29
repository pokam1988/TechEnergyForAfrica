import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, AuditLogEntry, UserProfile } from '../types';

export const DEFAULT_ROLE_PROFILES: Record<UserRole, UserProfile> = {
  visitor: {
    id: 'user_visitor',
    organizationId: 'org_tefa',
    name: 'External Proposer (Gast / Bewerber)',
    role: 'visitor',
    email: 'applicant@external-partner.org',
    customTitle: 'External Proposer',
    avatarInitials: 'EX',
  },
  tefa_member: {
    id: 'user_tefa_member',
    organizationId: 'org_tefa',
    name: 'Amina Diallo (TEFA Member)',
    role: 'tefa_member',
    email: 'amina.diallo@techenergyforafrica.org',
    customTitle: 'Education & Solar Club Lead',
    avatarInitials: 'AD',
  },
  project_manager: {
    id: 'user_pm',
    organizationId: 'org_tefa',
    name: 'Marc Tagne (Project Manager)',
    role: 'project_manager',
    email: 'marc.tagne@techenergyforafrica.org',
    customTitle: 'Technical Project Director',
    avatarInitials: 'MT',
  },
  project_reviewer: {
    id: 'user_reviewer',
    organizationId: 'org_tefa',
    name: 'Dr. Sophie Becker (Reviewer)',
    role: 'project_reviewer',
    email: 'sophie.becker@eval-nonprofit.de',
    customTitle: 'Independent NGO Evaluation Expert',
    avatarInitials: 'SB',
  },
  finance_officer: {
    id: 'user_finance',
    organizationId: 'org_tefa',
    name: 'Klaus Weber (Finance Officer)',
    role: 'finance_officer',
    email: 'klaus.weber@techenergyforafrica.org',
    customTitle: 'Treasurer & Compliance Officer',
    avatarInitials: 'KW',
  },
  board_member: {
    id: 'user_board',
    organizationId: 'org_tefa',
    name: 'Dr. Frederic Pokam (TEFA Board Member)',
    role: 'board_member',
    email: 'frederic.pokam@techenergyforafrica.org',
    customTitle: 'President & Board Member',
    avatarInitials: 'FP',
  },
  system_admin: {
    id: 'user_admin',
    organizationId: 'org_tefa',
    name: 'Admin User (System Administrator)',
    role: 'system_admin',
    email: 'admin@techenergyforafrica.org',
    customTitle: 'Platform & Security Administrator',
    avatarInitials: 'AU',
  },
  local_partner: {
    id: 'user_local_partner',
    organizationId: 'org_tefa',
    name: 'Christian Kamga (Local Partner, Douala)',
    role: 'local_partner',
    email: 'c.kamga@ifopsim-partner.cm',
    customTitle: 'In-Country Implementation Partner',
    avatarInitials: 'CK',
  },
};

export const INITIAL_CUSTOM_PROFILES: UserProfile[] = [
  {
    id: 'user_pikop',
    organizationId: 'org_tefa',
    name: 'Pikop (TEFA Executive & Projects)',
    role: 'board_member',
    email: 'pikop@techenergyforafrica.org',
    customTitle: 'Vorstand & Projektsteuerung',
    avatarInitials: 'PK',
    bio: 'Leitung internationaler Projekte und strategische Kooperationen für TechEnergy For Africa e.V.',
  },
  {
    id: 'user_mistral',
    organizationId: 'org_tefa',
    name: 'Mistral (AI & Systems Coordination)',
    role: 'system_admin',
    email: 'mistral@techenergyforafrica.org',
    customTitle: 'AI & Systems Administrator',
    avatarInitials: 'MI',
    bio: 'Koordination der KI-Assistenzsysteme, digitaler Infrastruktur und Plattform-Governance.',
  },
  {
    id: 'user_info',
    organizationId: 'org_tefa',
    name: 'TEFA Info & Central Operations',
    role: 'tefa_member',
    email: 'info@techenergyforafrica.org',
    customTitle: 'Zentrale Geschäftsstelle & Mitgliederbetreuung',
    avatarInitials: 'IN',
    bio: 'Zentrale Anlaufstelle für Anfragen, Spenden- und Partnerkommunikation.',
  },
  {
    id: 'user_frederic_gmail',
    organizationId: 'org_tefa',
    name: 'Dr. Frederic Pokam (Externes Profil)',
    role: 'board_member',
    email: 'fredericpokam26@gmail.com',
    customTitle: 'Initiator & Akademische Partnerschaften',
    avatarInitials: 'FP',
    bio: 'Extern verknüpftes Profil für TGIEP Bildungsaustausch und Universitätsnetzwerke.',
  },
  {
    id: 'user_partner_yahoo',
    organizationId: 'org_global_eco',
    name: 'Jean-Marc T. (Externer Berater)',
    role: 'project_reviewer',
    email: 'jm.consultant@yahoo.com',
    customTitle: 'Senior M&E Consultant (Monitoring & Evaluation)',
    avatarInitials: 'JM',
    bio: 'Unabhängiger Wirkungs- und Finanzgutachter für Umwelt- und Bildungsprojekte.',
  },
];

interface AuthRoleContextType {
  currentUser: UserProfile;
  profiles: UserProfile[];
  setRole: (role: UserRole) => void;
  createProfile: (profileData: Partial<UserProfile>) => UserProfile;
  updateProfile: (updatedProfile: UserProfile) => void;
  selectProfile: (profileId: string) => void;
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

  // Custom User Profiles list (including seed profiles and dynamically created profiles)
  const [customProfiles, setCustomProfiles] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('impactflow_custom_profiles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = [...parsed];
          for (const init of INITIAL_CUSTOM_PROFILES) {
            if (!merged.some((p: UserProfile) => p.email === init.email)) {
              merged.push(init);
            }
          }
          return merged;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_CUSTOM_PROFILES;
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    return localStorage.getItem('impactflow_active_profile_id') || 'user_pikop';
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

  useEffect(() => {
    try {
      localStorage.setItem('impactflow_custom_profiles', JSON.stringify(customProfiles));
    } catch (e) {
      console.warn('Failed to save custom profiles:', e);
    }
  }, [customProfiles]);

  // Combine standard default role profiles with custom created profiles
  const allProfiles: UserProfile[] = [
    ...Object.values(DEFAULT_ROLE_PROFILES),
    ...customProfiles,
  ];

  // Resolve current active user profile
  const customActive = customProfiles.find((p) => p.id === activeProfileId);
  const currentUser: UserProfile = customActive || DEFAULT_ROLE_PROFILES[role] || DEFAULT_ROLE_PROFILES.board_member;

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('tefa_active_role', newRole);
    setActiveProfileId(DEFAULT_ROLE_PROFILES[newRole].id);
    localStorage.setItem('impactflow_active_profile_id', DEFAULT_ROLE_PROFILES[newRole].id);
    logAuditAction('ROLE_SWITCH', `Switched active user profile to ${DEFAULT_ROLE_PROFILES[newRole].name} (${newRole})`);
  };

  const selectProfile = (profileId: string) => {
    const found = allProfiles.find((p) => p.id === profileId);
    if (found) {
      setActiveProfileId(profileId);
      localStorage.setItem('impactflow_active_profile_id', profileId);
      setRoleState(found.role);
      localStorage.setItem('tefa_active_role', found.role);
      logAuditAction('PROFILE_SWITCH', `Switched to user profile: ${found.name} (${found.role})`);
    }
  };

  const createProfile = (profileData: Partial<UserProfile>): UserProfile => {
    const names = (profileData.name || 'Neuer Benutzer').trim().split(' ');
    const initials = names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : names[0].substring(0, 2).toUpperCase();

    const newProfile: UserProfile = {
      id: profileData.id || 'usr_' + Date.now(),
      organizationId: profileData.organizationId || 'org_tefa',
      name: profileData.name || 'Neues Profil',
      role: profileData.role || 'project_manager',
      email: profileData.email || 'user@organization.org',
      customTitle: profileData.customTitle || 'Mitarbeiter / Projektbeteiligter',
      avatarInitials: profileData.avatarInitials || initials,
      phone: profileData.phone || '',
      bio: profileData.bio || '',
    };

    setCustomProfiles((prev) => [newProfile, ...prev]);
    selectProfile(newProfile.id);
    logAuditAction('PROFILE_CREATED', `Neues Benutzerprofil erstellt: ${newProfile.name} (${newProfile.role})`);
    return newProfile;
  };

  const updateProfile = (updated: UserProfile) => {
    setCustomProfiles((prev) => {
      const exists = prev.some((p) => p.id === updated.id);
      if (exists) {
        return prev.map((p) => (p.id === updated.id ? updated : p));
      } else {
        return [...prev, updated];
      }
    });
    if (activeProfileId === updated.id) {
      setRoleState(updated.role);
    }
  };

  // RBAC permissions logic
  const canViewInternalFinances = () => {
    return currentUser.role !== 'visitor' && currentUser.role !== 'local_partner';
  };

  const canApproveProposals = () => {
    return currentUser.role === 'board_member' || currentUser.role === 'system_admin';
  };

  const canApproveExpenses = () => {
    return currentUser.role === 'finance_officer' || currentUser.role === 'system_admin';
  };

  const canEditProject = () => {
    return (
      currentUser.role === 'project_manager' ||
      currentUser.role === 'board_member' ||
      currentUser.role === 'system_admin' ||
      currentUser.role === 'tefa_member'
    );
  };

  const canReviewFeasibility = () => {
    return (
      currentUser.role === 'project_reviewer' ||
      currentUser.role === 'board_member' ||
      currentUser.role === 'system_admin' ||
      currentUser.role === 'project_manager'
    );
  };

  const canManageClosure = () => {
    return currentUser.role === 'board_member' || currentUser.role === 'system_admin';
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
      // Backend offline fallback
    }
  };

  return (
    <AuthRoleContext.Provider
      value={{
        currentUser,
        profiles: allProfiles,
        setRole,
        createProfile,
        updateProfile,
        selectProfile,
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
