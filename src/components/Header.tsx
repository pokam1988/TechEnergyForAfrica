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
  Sparkles,
  ChevronDown,
  Pencil,
  Trash2,
} from 'lucide-react';

interface HeaderProps {
  onOpenExport: () => void;
  onOpenAudit: () => void;
  onOpenProfile?: () => void;
  onOpenNewOrg?: () => void;
  onOpenProjectSettings?: () => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
  onOpenChat?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenExport,
  onOpenAudit,
  onOpenProfile,
  onOpenNewOrg,
  onOpenProjectSettings,
  onToggleMobileMenu,
  isMobileMenuOpen = false,
  onOpenChat,
}) => {
  const { t, language, setLanguage } = useLanguage();
  const { currentUser, setRole } = useAuthRole();
  const {
    projects,
    activeProject,
    setActiveProjectId,
    resetDemoData,
    updateProject,
    deleteProject,
    cleanPlatformForOfficialUse,
  } = useProjects();
  const { organizations, activeOrgId, setActiveOrgId, activeOrganization } = useOrganization();
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    const confirmText =
      language === 'fr'
        ? 'Voulez-vous vraiment réinitialiser toutes les données aux valeurs de démonstration ?'
        : language === 'en'
        ? 'Do you really want to reset all data to the initial demonstration state?'
        : 'Möchten Sie alle Daten wirklich auf den initialen Demo-Stand zurücksetzen?';

    if (window.confirm(confirmText)) {
      setIsResetting(true);
      await resetDemoData();
      setIsResetting(false);
    }
  };

  const orgWebsite = activeOrganization?.website || 'https://www.techenergyforafrica.org';
  const orgName = activeOrganization?.name || 'TechEnergy For Africa e.V.';

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-lg w-full">
      {/* Top Notice Banner for Demo / Hypothetical Mode */}
      {activeProject?.isDemoOrHypothetical && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-3 sm:px-6 py-2 text-xs text-amber-200 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-bold text-amber-300 shrink-0 hidden sm:inline">
              {t.app.hypotheticalBadge}:
            </span>
            <span className="truncate text-xs text-amber-100">
              {activeProject.demoDisclaimer || t.app.demoNotice}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={async () => {
                await updateProject({
                  ...activeProject,
                  isDemoOrHypothetical: false,
                  demoDisclaimer: undefined,
                });
              }}
              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 transition-colors shadow-xs"
              title="Dieses Projekt sofort als offizielles Reales Projekt aktivieren"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Als offiziell aktivieren</span>
            </button>

            {onOpenProjectSettings && (
              <button
                type="button"
                onClick={onOpenProjectSettings}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] flex items-center gap-1 border border-slate-700 transition-colors"
                title="Stammdaten & Modus bearbeiten"
              >
                <Pencil className="w-3 h-3" />
                <span>Bearbeiten</span>
              </button>
            )}

            <button
              type="button"
              onClick={async () => {
                if (window.confirm(`Möchten Sie das Projekt "${activeProject.title}" wirklich löschen?`)) {
                  await deleteProject(activeProject.id);
                }
              }}
              className="px-2.5 py-1 rounded bg-rose-900/60 hover:bg-rose-800 text-rose-200 font-semibold text-[11px] flex items-center gap-1 border border-rose-700/50 transition-colors"
              title="Dieses Demo-Projekt löschen"
            >
              <Trash2 className="w-3 h-3 text-rose-300" />
              <span>Löschen</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                if (window.confirm('Möchten Sie alle Demo- und Test-Projekte entfernen und eine saubere, offizielle Arbeitsumgebung für TechEnergy For Africa starten?')) {
                  await cleanPlatformForOfficialUse();
                }
              }}
              className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-amber-200 font-semibold text-[11px] border border-amber-500/40 transition-colors"
              title="Alle Demo-Projekte bereinigen & offizielle Umgebung starten"
            >
              🧹 Demo bereinigen
            </button>

            <span className="text-[10px] bg-amber-500/25 text-amber-200 px-2 py-0.5 rounded font-mono font-bold border border-amber-500/40">
              {activeProject.referenceId}
            </span>
          </div>
        </div>
      )}

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Brand Identity & Mobile Hamburger */}
          <div className="flex items-center gap-3 min-w-0">
            {onToggleMobileMenu && (
              <button
                type="button"
                onClick={onToggleMobileMenu}
                aria-label={isMobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
                className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            )}

            {/* ImpactFlow Brand Badge */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-teal-800 flex items-center justify-center font-black text-lg tracking-wider text-white shadow-md shrink-0 border border-emerald-400/30">
              IF
            </div>

            {/* Product Title & Organization Link */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white truncate">
                  ImpactFlow
                </span>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium hidden sm:inline-block shrink-0">
                  From Idea to Impact
                </span>
              </div>
              <a
                href={orgWebsite}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-400 hover:text-emerald-300 flex items-center gap-1 transition-colors truncate"
                title={`Offizielle Webseite: ${orgWebsite}`}
              >
                <span className="truncate max-w-[160px] sm:max-w-[240px] font-medium">{orgName}</span>
                <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
              </a>
            </div>
          </div>

          {/* Desktop Center: Workspace & Project Switchers */}
          <div className="hidden lg:flex items-center gap-3 flex-1 justify-center max-w-2xl px-4">
            {/* Workspace Selector */}
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-lg px-3 py-1.5 shadow-xs">
              <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="flex flex-col min-w-0">
                <label htmlFor="desktop-workspace-select" className="text-[10px] uppercase tracking-wider text-slate-400 font-bold leading-tight">
                  Workspace
                </label>
                <select
                  id="desktop-workspace-select"
                  value={activeOrgId}
                  onChange={(e) => {
                    if (e.target.value === '__new__') {
                      onOpenNewOrg?.();
                    } else {
                      setActiveOrgId(e.target.value);
                    }
                  }}
                  aria-label="Workspace auswählen"
                  className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer max-w-[160px] truncate"
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

            {/* Project Selector & Actions */}
            <div className="flex items-center gap-1.5 flex-1 min-w-0 max-w-lg">
              <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-lg px-3 py-1.5 shadow-xs flex-1 min-w-0">
                <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex flex-col min-w-0 w-full">
                  <label htmlFor="desktop-project-select" className="text-[10px] uppercase tracking-wider text-slate-400 font-bold leading-tight">
                    {t.app.selectProject}
                  </label>
                  <select
                    id="desktop-project-select"
                    value={activeProject?.id || ''}
                    onChange={(e) => setActiveProjectId(e.target.value)}
                    aria-label={t.app.selectProject}
                    className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer truncate w-full"
                  >
                    {projects.length === 0 ? (
                      <option value="">Keine Projekte in dieser Organisation</option>
                    ) : (
                      projects.map((proj) => (
                        <option key={proj.id} value={proj.id} className="bg-slate-800 text-white">
                          [{proj.referenceId}] {proj.title} {proj.isDemoOrHypothetical ? '(Demo)' : ''}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {activeProject && (
                <div className="flex items-center gap-1 shrink-0">
                  {onOpenProjectSettings && (
                    <button
                      type="button"
                      onClick={onOpenProjectSettings}
                      title="Projekt bearbeiten & verwalten"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm(`Möchten Sie das Projekt "${activeProject.title}" wirklich löschen?`)) {
                        await deleteProject(activeProject.id);
                      }
                    }}
                    title="Aktives Projekt löschen"
                    className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-700/50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* ✨ AI Companion Button (Desktop & Mobile) */}
            {onOpenChat && (
              <button
                type="button"
                onClick={onOpenChat}
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-md border border-emerald-400/40 transition-all transform hover:scale-102 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                title="ImpactFlow KI-Projektbegleiter öffnen (Gemini & ChatGPT)"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span className="hidden sm:inline">{t.chat?.badge || 'KI-Begleiter'}</span>
              </button>
            )}

            {/* Quick Export Dossier (Tablet/Desktop) */}
            <button
              type="button"
              onClick={onOpenExport}
              title={t.app.exportSummary}
              className="hidden md:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>{t.common.export}</span>
            </button>

            {/* Role Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="flex flex-col min-w-0">
                <label htmlFor="header-role-select" className="text-[10px] uppercase tracking-wider text-slate-400 font-bold leading-tight hidden xl:block">
                  {t.app.switchRole}
                </label>
                <select
                  id="header-role-select"
                  value={currentUser.role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  aria-label={t.app.switchRole}
                  className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer max-w-[110px] sm:max-w-[140px] truncate"
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

            {/* Language Switcher Pill (DE | EN | FR) */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-1 gap-0.5">
              <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 mr-0.5 hidden xs:inline" />
              {(['de', 'en', 'fr'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`text-xs px-2 py-1 rounded font-bold transition-all ${
                    language === lang
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            {/* User Profile Avatar */}
            {onOpenProfile && (
              <button
                type="button"
                onClick={onOpenProfile}
                title={`Profil von ${currentUser.name} (${currentUser.email || 'Benutzer'})`}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-1.5 rounded-lg transition-colors shrink-0"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 border border-emerald-400/50">
                  {currentUser.avatarInitials || 'U'}
                </div>
                <span className="hidden xl:inline text-xs font-semibold text-slate-200 truncate max-w-[90px]">
                  {currentUser.name.split(' ')[0]}
                </span>
              </button>
            )}

            {/* Reset Demo Data Button */}
            <button
              type="button"
              onClick={handleReset}
              disabled={isResetting}
              title={t.app.storageReset}
              className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors shrink-0 focus:outline-none focus:ring-1 focus:ring-amber-400"
            >
              <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Secondary Toolbar: Workspace & Project Switcher */}
      <div className="lg:hidden bg-slate-950/95 border-t border-slate-800 px-3 py-2">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Mobile Workspace Selector */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5">
            <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <label htmlFor="mobile-workspace-select" className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                Workspace:
              </label>
              <select
                id="mobile-workspace-select"
                value={activeOrgId}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    onOpenNewOrg?.();
                  } else {
                    setActiveOrgId(e.target.value);
                  }
                }}
                className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer w-full truncate"
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

          {/* Mobile Project Selector & Actions */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5">
            <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <label htmlFor="mobile-project-select" className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                {t.app.selectProject}:
              </label>
              <select
                id="mobile-project-select"
                value={activeProject?.id || ''}
                onChange={(e) => setActiveProjectId(e.target.value)}
                className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer w-full truncate"
              >
                {projects.length === 0 ? (
                  <option value="">Keine Projekte in dieser Organisation</option>
                ) : (
                  projects.map((proj) => (
                    <option key={proj.id} value={proj.id} className="bg-slate-800 text-white">
                      [{proj.referenceId}] {proj.title} {proj.isDemoOrHypothetical ? '(Demo)' : ''}
                    </option>
                  ))
                )}
              </select>
            </div>

            {activeProject && (
              <div className="flex items-center gap-1 shrink-0">
                {onOpenProjectSettings && (
                  <button
                    type="button"
                    onClick={onOpenProjectSettings}
                    title="Projekt bearbeiten"
                    className="p-1 text-slate-300 hover:text-white"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm(`Möchten Sie das Projekt "${activeProject.title}" wirklich löschen?`)) {
                      await deleteProject(activeProject.id);
                    }
                  }}
                  title="Projekt löschen"
                  className="p-1 text-slate-300 hover:text-rose-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
