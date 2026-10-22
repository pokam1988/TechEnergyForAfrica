import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuthRole } from '../context/AuthRoleContext';
import { useProjects } from '../context/ProjectContext';
import {
  LayoutDashboard,
  FilePlus,
  Compass,
  CheckSquare,
  Calendar,
  Wallet,
  Sliders,
  Users,
  Server,
  Activity,
  Receipt,
  TrendingUp,
  Award,
  History,
  Lock,
  X,
  Palette,
  Sparkles,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'proposal'
  | 'advisor'
  | 'feasibility'
  | 'planning'
  | 'budget'
  | 'simulator'
  | 'partners'
  | 'creative_studio'
  | 'inventory'
  | 'monitoring'
  | 'finance'
  | 'impact'
  | 'closure'
  | 'audit';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onNewProjectClick: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onNewProjectClick,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { t } = useLanguage();
  const { currentUser, canViewInternalFinances } = useAuthRole();
  const { projects, activeProject, setActiveProjectId } = useProjects();

  const isVisitor = currentUser.role === 'visitor';

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: t.nav.dashboard,
      icon: LayoutDashboard,
      badge: null,
      allowed: true,
    },
    {
      id: 'proposal' as ActiveTab,
      label: t.nav.proposalWizard,
      icon: FilePlus,
      badge: 'Modul A',
      allowed: true,
    },
    {
      id: 'advisor' as ActiveTab,
      label: t.nav.advisor,
      icon: Compass,
      badge: 'KI Tiebreaker',
      allowed: !isVisitor,
    },
    {
      id: 'feasibility' as ActiveTab,
      label: t.nav.feasibility,
      icon: CheckSquare,
      badge: 'Governance',
      allowed: !isVisitor,
    },
    {
      id: 'planning' as ActiveTab,
      label: t.nav.planning,
      icon: Calendar,
      badge: 'Gantt/Kanban',
      allowed: !isVisitor,
    },
    {
      id: 'budget' as ActiveTab,
      label: t.nav.budget,
      icon: Wallet,
      badge: 'EUR / XAF',
      allowed: canViewInternalFinances(),
    },
    {
      id: 'simulator' as ActiveTab,
      label: t.nav.simulator,
      icon: Sliders,
      badge: 'Interaktiv',
      allowed: true,
    },
    {
      id: 'partners' as ActiveTab,
      label: t.nav.partners,
      icon: Users,
      badge: 'KI Pitch',
      allowed: !isVisitor,
    },
    {
      id: 'creative_studio' as ActiveTab,
      label: t.nav.creativeStudio || 'Creative Studio',
      icon: Palette,
      badge: 'KI Kampagnen',
      allowed: true,
    },
    {
      id: 'inventory' as ActiveTab,
      label: t.nav.inventory,
      icon: Server,
      badge: 'Assets',
      allowed: !isVisitor,
    },
    {
      id: 'monitoring' as ActiveTab,
      label: t.nav.monitoring,
      icon: Activity,
      badge: 'Live',
      allowed: !isVisitor,
    },
    {
      id: 'finance' as ActiveTab,
      label: t.nav.finance,
      icon: Receipt,
      badge: 'Belege',
      allowed: canViewInternalFinances(),
    },
    {
      id: 'impact' as ActiveTab,
      label: t.nav.impact,
      icon: TrendingUp,
      badge: 'KPIs',
      allowed: !isVisitor,
    },
    {
      id: 'closure' as ActiveTab,
      label: t.nav.closure,
      icon: Award,
      badge: 'Abschluss',
      allowed: !isVisitor,
    },
    {
      id: 'audit' as ActiveTab,
      label: t.nav.audit,
      icon: History,
      badge: 'Log',
      allowed: currentUser.role === 'system_admin' || currentUser.role === 'board_member',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
          md:static md:w-64 md:translate-x-0 md:z-auto md:shadow-none md:flex md:shrink-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Mobile Header with Close Button */}
        <div className="flex md:hidden items-center justify-between p-3 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-emerald-600 flex items-center justify-center font-black text-sm text-white">
              T
            </div>
            <div>
              <span className="font-bold text-white text-xs block leading-tight">TEFA ProjectHub</span>
              <span className="text-[10px] text-slate-400 block leading-tight">From Idea to Impact</span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Menü schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Create Project Button */}
        <div className="p-3 border-b border-slate-800">
          <button
            onClick={() => {
              onNewProjectClick();
              onCloseMobile?.();
            }}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs py-2 px-3 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <FilePlus className="w-4 h-4" />
            <span>{t.app.newProject}</span>
          </button>
        </div>

        {/* Current Project Info Banner with Selector */}
        {activeProject && (
          <div className="p-3 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
              <span>Aktives Dossier</span>
              <span className="text-[10px] bg-slate-800 text-emerald-400 px-1 rounded font-mono">
                {activeProject.referenceId}
              </span>
            </div>
            <select
              value={activeProject.id}
              onChange={(e) => setActiveProjectId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded p-1.5 focus:ring-1 focus:ring-emerald-500 font-medium truncate"
              title="Projekt wechseln"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-1.5 py-0.5 rounded font-medium">
                {t.status[activeProject.status] || activeProject.status}
              </span>
              <span className="text-[10px] text-slate-400">
                {activeProject.country}
              </span>
            </div>
          </div>
        )}

        {/* Nav List */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (!item.allowed) {
              return (
                <div
                  key={item.id}
                  title="Zugriff mit Ihrer aktuellen Rolle eingeschränkt"
                  className="flex items-center justify-between px-3 py-2 text-xs text-slate-600 cursor-not-allowed rounded-md opacity-60"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-slate-600" />
                    <span>{item.label}</span>
                  </div>
                  <Lock className="w-3 h-3 text-slate-600" />
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono shrink-0 ${
                      isActive
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User profile footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center text-xs font-bold shrink-0">
            {currentUser.avatarInitials}
          </div>
          <div className="truncate">
            <div className="text-xs font-medium text-white truncate">{currentUser.name}</div>
            <div className="text-[10px] text-slate-400 truncate">{currentUser.email}</div>
          </div>
        </div>
      </aside>
    </>
  );
};
