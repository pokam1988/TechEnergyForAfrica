import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuthRole } from '../context/AuthRoleContext';
import { useProjects } from '../context/ProjectContext';
import { useOrganization } from '../context/OrganizationContext';
import { UserRole } from '../types';
import {
  Globe,
  Shield,
  Layers,
  Database,
  RefreshCw,
  FileText,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Menu,
  X,
  Building2,
  User,
  Plus,
} from 'lucide-react';

interface HeaderProps {
  onOpenExport: () => void;
  onOpenAudit: () => void;
  onOpenProfile?: () => void;
  onOpenNewOrg?: () => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenExport,
  onOpenAudit,
  onOpenProfile,
  onOpenNewOrg,
  onToggleMobileMenu,
  isMobileMenuOpen = false,
}) => {
  const { t, language, setLanguage } = useLanguage();
  const { currentUser, setRole } = useAuthRole();
  const { projects, activeProject, setActiveProjectId, resetDemoData } = useProjects();
  const { organizations, activeOrgId, setActiveOrgId, activeOrganization } = useOrganization();
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    if (window.confirm('Möchten Sie alle Daten wirklich auf den initialen Demo-Stand zurücksetzen?')) {
      setIsResetting(true);
      await resetDemoData();
      setIsResetting(false);
    }
  };

  const orgWebsite = activeOrganization?.website || 'https://www.techenergyforafrica.org';
  const orgName = activeOrganization?.name || 'TechEnergy For Africa e.V.';

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md w-full overflow-x-hidden">
      {/* Top Banner for Demo / Pre-Implementation Notice */}
      {activeProject?.isDemoOrHypothetical && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-3 sm:px-4 py-1.5 text-xs text-amber-200 flex items-center justify-between gap-2 overflow-x-hidden">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold shrink-0 hidden xs:inline">{t.app.hypotheticalBadge}:</span>
            <span className="truncate text-[11px] sm:text-xs">{activeProject.demoDisclaimer || t.app.demoNotice}</span>
          </div>
          <span className="shrink-0 text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
            {activeProject.referenceId}
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Brand & Hamburger */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            {onToggleMobileMenu && (
              <button
                type="button"
                onClick={onToggleMobileMenu}
                aria-label={isMobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
                className="md:hidden p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 min-h-[38px] min-w-[38px] flex items-center justify-center shrink-0"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            )}

            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-black text-lg sm:text-xl tracking-wider text-white shadow-inner shrink-0">
              IF
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm sm:text-base lg:text-lg tracking-tight text-white truncate">
                  ImpactFlow
                </span>
                <span className="text-[10px] sm:text-xs bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full font-medium hidden lg:inline-block shrink-0">
                  From Idea to Impact
                </span>
              </div>
              <a
                href={orgWebsite}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] sm:text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors truncate"
              >
                <span className="truncate">{orgName}</span>
                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
              </a>
            </div>
          </div>

          {/* Organization Workspace Selector */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 rounded-md px-2 py-1">
            <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold leading-none">
                Workspace
              </span>
              <select
                value={activeOrgId}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    onOpenNewOrg?.();
                  } else {
                    setActiveOrgId(e.target.value);
                  }
                }}
                aria-label="Workspace auswählen"
                className="bg-transparent text-white text-[11px] font-medium focus:outline-none cursor-pointer max-w-[150px] truncate"
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id} className="bg-slate-800 text-white">
                    {org.name} ({org.defaultCurrency})
                  </option>
                ))}
                <option value="__new__" className="bg-slate-800 text-emerald-300 font-semibold">
                  + Neue Organisation...
                </option>
              </select>
            </div>
          </div>

          {/* Center Project Selector (Desktop) */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.app.selectProject}:</span>
            </div>
            <select
              value={activeProject?.id || ''}
              onChange={(e) => setActiveProjectId(e.target.value)}
              aria-label={t.app.selectProject}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-md px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none max-w-xs truncate"
            >
              {projects.length === 0 ? (
                <option value="">Keine Projekte in dieser Organisation</option>
              ) : (
                projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    [{proj.referenceId}] {proj.title}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Right Controls: User Profile, Role Switcher, Language, Export */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Quick Export Dossier Button */}
            <button
              onClick={onOpenExport}
              title={t.app.exportSummary}
              className="hidden sm:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs px-2 sm:px-2.5 py-1.5 rounded-md transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">{t.common.export}</span>
            </button>

            {/* User Profile Button */}
            {onOpenProfile && (
              <button
                onClick={onOpenProfile}
                title="Benutzerprofil anzeigen / wechseln / neu erstellen"
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs px-2 py-1 rounded-md transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {currentUser.avatarInitials || 'U'}
                </div>
                <span className="hidden xl:inline text-xs font-medium text-slate-200 truncate max-w-[80px]">
                  {currentUser.name.split(' ')[0]}
                </span>
              </button>
            )}

            {/* Role Switcher */}
            <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-800/80 border border-slate-700 rounded-md px-1.5 sm:px-2 py-1 max-w-[105px] xs:max-w-[135px] sm:max-w-none">
              <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-400 font-semibold leading-none truncate hidden xs:block">
                  {t.app.switchRole}
                </span>
                <select
                  value={currentUser.role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  aria-label={t.app.switchRole}
                  className="bg-transparent text-white text-[11px] sm:text-xs font-medium focus:outline-none cursor-pointer pr-1 truncate w-full"
                >
                  <option value="board_member" className="bg-slate-800 text-white">
                    {t.roles.board_member}
                  </option>
                  <option value="project_manager" className="bg-slate-800 text-white">
                    {t.roles.project_manager}
                  </option>
                  <option value="finance_officer" className="bg-slate-800 text-white">
                    {t.roles.finance_officer}
                  </option>
                  <option value="project_reviewer" className="bg-slate-800 text-white">
                    {t.roles.project_reviewer}
                  </option>
                  <option value="tefa_member" className="bg-slate-800 text-white">
                    {t.roles.tefa_member}
                  </option>
                  <option value="local_partner" className="bg-slate-800 text-white">
                    {t.roles.local_partner}
                  </option>
                  <option value="visitor" className="bg-slate-800 text-white">
                    {t.roles.visitor}
                  </option>
                  <option value="system_admin" className="bg-slate-800 text-white">
                    {t.roles.system_admin}
                  </option>
                </select>
              </div>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-800 border border-slate-700 rounded-md p-0.5 sm:px-1 sm:py-1">
              <Globe className="w-3 h-3 text-slate-400 shrink-0 hidden xs:inline" />
              <button
                onClick={() => setLanguage('de')}
                className={`text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded transition-colors ${
                  language === 'de'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                DE
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded transition-colors ${
                  language === 'en'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('fr')}
                className={`text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded transition-colors ${
                  language === 'fr'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                FR
              </button>
            </div>

            {/* Backend Status indicator */}
            <div
              className="hidden 2xl:flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 rounded px-2 py-1"
              title="Persistent Server JSON Database & Multi-Org Integration"
            >
              <Database className="w-3 h-3 text-emerald-400" />
              <span>SaaS Store</span>
              <CheckCircle className="w-3 h-3 text-emerald-400" />
            </div>

            {/* Reset Demo Button */}
            <button
              onClick={handleReset}
              disabled={isResetting}
              title={t.app.storageReset}
              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-md transition-colors shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
