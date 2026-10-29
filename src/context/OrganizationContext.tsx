import React, { createContext, useContext, useState, useEffect } from 'react';
import { Organization, Programme } from '../types';
import { SEED_ORGANIZATIONS, SEED_PROGRAMMES } from '../data/seedOrganizations';

interface OrganizationContextType {
  organizations: Organization[];
  activeOrganization: Organization;
  activeOrgId: string;
  setActiveOrgId: (id: string) => void;
  createOrganization: (orgData: Partial<Organization>) => Organization;
  updateOrganization: (updated: Organization) => void;
  programmes: Programme[];
  createProgramme: (progData: Partial<Programme>) => Programme;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [organizations, setOrganizations] = useState<Organization[]>(() => {
    try {
      const saved = localStorage.getItem('impactflow_organizations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure org_tefa always exists and has the correct official URL
          const tefaIdx = parsed.findIndex((o: Organization) => o.id === 'org_tefa');
          if (tefaIdx >= 0) {
            parsed[tefaIdx].website = 'https://www.techenergyforafrica.org';
          } else {
            parsed.unshift(SEED_ORGANIZATIONS[0]);
          }
          return parsed;
        }
      }
    } catch {
      // Fallback to seed
    }
    return SEED_ORGANIZATIONS;
  });

  const [activeOrgId, setActiveOrgIdState] = useState<string>(() => {
    return localStorage.getItem('impactflow_active_org_id') || 'org_tefa';
  });

  const [programmes, setProgrammes] = useState<Programme[]>(() => {
    try {
      const saved = localStorage.getItem('impactflow_programmes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback
    }
    return SEED_PROGRAMMES;
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('impactflow_organizations', JSON.stringify(organizations));
    } catch (e) {
      console.warn('Failed to persist organizations:', e);
    }
  }, [organizations]);

  useEffect(() => {
    try {
      localStorage.setItem('impactflow_programmes', JSON.stringify(programmes));
    } catch (e) {
      console.warn('Failed to persist programmes:', e);
    }
  }, [programmes]);

  const setActiveOrgId = (id: string) => {
    setActiveOrgIdState(id);
    localStorage.setItem('impactflow_active_org_id', id);
  };

  const activeOrganization =
    organizations.find((o) => o.id === activeOrgId) ||
    organizations.find((o) => o.id === 'org_tefa') ||
    organizations[0];

  const createOrganization = (orgData: Partial<Organization>): Organization => {
    const newOrg: Organization = {
      id: orgData.id || 'org_' + Date.now(),
      name: orgData.name || 'Neue Organisation',
      legalForm: orgData.legalForm || 'Nonprofit Association',
      country: orgData.country || 'Deutschland',
      website: orgData.website || '',
      defaultCurrency: orgData.defaultCurrency || 'EUR',
      timeZone: orgData.timeZone || 'Europe/Berlin',
      primaryLanguage: orgData.primaryLanguage || 'de',
      description: orgData.description || '',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    setOrganizations((prev) => {
      const updated = [newOrg, ...prev];
      return updated;
    });

    // Auto-switch to newly created organization
    setActiveOrgId(newOrg.id);
    return newOrg;
  };

  const updateOrganization = (updated: Organization) => {
    setOrganizations((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  const createProgramme = (progData: Partial<Programme>): Programme => {
    const newProg: Programme = {
      id: progData.id || 'prog_' + Date.now(),
      organizationId: progData.organizationId || activeOrgId,
      name: progData.name || 'Neues Programm',
      description: progData.description || '',
      lead: progData.lead || 'Programmleitung',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    setProgrammes((prev) => [newProg, ...prev]);
    return newProg;
  };

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        activeOrganization,
        activeOrgId,
        setActiveOrgId,
        createOrganization,
        updateOrganization,
        programmes: programmes.filter((p) => p.organizationId === activeOrgId),
        createProgramme,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = (): OrganizationContextType => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};
