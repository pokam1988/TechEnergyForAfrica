import React, { useState, useEffect, useMemo } from 'react';
import { useProjects } from '../../context/ProjectContext';
import { useAuthRole } from '../../context/AuthRoleContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { InventoryAsset, Project } from '../../types';
import { SEED_INVENTORY } from '../../data/seedProjects';
import {
  IntelligenceViewTab,
  IntelligenceFilters,
  KPICardDef,
} from './types';
import { ExecutiveOverviewTab } from './ExecutiveOverviewTab';
import { PortfolioTab } from './PortfolioTab';
import { PlanningMilestonesTab } from './PlanningMilestonesTab';
import { FinancialControllingTab } from './FinancialControllingTab';
import { FundraisingPartnershipsTab } from './FundraisingPartnershipsTab';
import { OperationsTab } from './OperationsTab';
import { InventoryAnalyticsTab } from './InventoryAnalyticsTab';
import { ImpactBeneficiariesTab } from './ImpactBeneficiariesTab';
import { RisksComplianceTab } from './RisksComplianceTab';
import { ReportingExportsTab } from './ReportingExportsTab';
import { KPIFormulaModal } from './KPIFormulaModal';
import { AIAssistantDrawer } from './AIAssistantDrawer';
import { DataImportModal } from './DataImportModal';
import { ProjectComparisonModal } from './ProjectComparisonModal';
import {
  LayoutDashboard,
  Layers,
  Calendar,
  Wallet,
  PiggyBank,
  Settings,
  Server,
  TrendingUp,
  ShieldAlert,
  Download,
  Filter,
  RotateCcw,
  Sparkles,
  Upload,
  Scale,
  Calculator,
  ChevronDown,
  Info,
  Check,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  X,
} from 'lucide-react';

const DEFAULT_FILTERS: IntelligenceFilters = {
  projectId: 'all',
  country: 'all',
  category: 'all',
  manager: 'all',
  status: 'all',
  reportingPeriod: 'all',
  fundingSource: 'all',
  donor: 'all',
  partner: 'all',
  budgetCategory: 'all',
  evidenceStatus: 'all',
  riskPriority: 'all',
  environment: 'all',
};

export const ProjectIntelligenceView: React.FC = () => {
  const { projects, activeProjectId, setActiveProjectId, refreshProjects } = useProjects();
  const { currentUser } = useAuthRole();
  const { language } = useLanguage();

  const [activeView, setActiveView] = useState<IntelligenceViewTab>('executive');
  const [filters, setFilters] = useState<IntelligenceFilters>(() => {
    const saved = localStorage.getItem('tefa_intelligence_filters');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_FILTERS;
  });

  const [isFilterBarOpen, setIsFilterBarOpen] = useState(true);
  const [saveViewMsg, setSaveViewMsg] = useState<string | null>(null);

  // Modals & Drawer states
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [selectedKpiForFormula, setSelectedKpiForFormula] = useState<KPICardDef | null>(null);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Inventory state
  const [inventory, setInventory] = useState<InventoryAsset[]>(() => {
    const saved = localStorage.getItem('tefa_inventory');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return SEED_INVENTORY;
  });

  useEffect(() => {
    fetch('/api/inventory')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setInventory(data);
        }
      })
      .catch(() => {});
  }, []);

  // Filter application
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (filters.projectId !== 'all' && p.id !== filters.projectId) return false;
      if (filters.country !== 'all' && p.country !== filters.country) return false;
      if (filters.category !== 'all' && p.category !== filters.category) return false;
      if (filters.manager !== 'all' && p.createdBy !== filters.manager) return false;
      if (filters.status !== 'all' && p.status !== filters.status) return false;

      if (filters.environment === 'live' && p.isDemoOrHypothetical) return false;
      if (filters.environment === 'demo' && !p.isDemoOrHypothetical) return false;

      if (filters.riskPriority !== 'all') {
        const hasRisk = p.risks?.some((r) => {
          if (filters.riskPriority === 'critical') return r.impact === 'high' && r.probability === 'high';
          if (filters.riskPriority === 'high') return r.impact === 'high' || r.probability === 'high';
          if (filters.riskPriority === 'medium') return r.impact === 'medium';
          if (filters.riskPriority === 'low') return r.impact === 'low';
          return true;
        });
        if (!hasRisk) return false;
      }

      return true;
    });
  }, [projects, filters]);

  // Documented 14 KPI Cards Computation
  const today = new Date().toISOString().split('T')[0];
  const EUR_TO_XAF = 655.957;

  const kpis: KPICardDef[] = useMemo(() => {
    // 1. Total registered projects
    const totalProjects = filteredProjects.length;

    // 2. Projects awaiting review
    const awaitingReview = filteredProjects.filter(
      (p) => p.status === 'Under Review' || p.status === 'Submitted'
    ).length;

    // 3. Approved projects
    const approvedProjects = filteredProjects.filter((p) => p.status === 'Approved').length;

    // 4. Active projects
    const activeProjects = filteredProjects.filter(
      (p) =>
        p.status === 'In Progress' ||
        p.status === 'Ready for Implementation' ||
        p.status === 'Fundraising'
    ).length;

    // 5. Projects on hold
    const onHoldProjects = filteredProjects.filter((p) => p.status === 'On Hold').length;

    // 6. Completed projects
    const completedProjects = filteredProjects.filter(
      (p) => p.status === 'Completed' || p.status === 'Closed'
    ).length;

    // 7. Approved total budget
    const approvedTotalBudget = filteredProjects.reduce((sum, p) => {
      const items = filters.budgetCategory !== 'all'
        ? p.budgetItems?.filter((b) => b.category === filters.budgetCategory)
        : p.budgetItems;
      const pApproved =
        items?.reduce((bSum, b) => bSum + (b.approvedBudget || 0), 0) || 0;
      return sum + pApproved;
    }, 0);

    const isBudgetUnknown =
      approvedTotalBudget === 0 &&
      filteredProjects.some(
        (p) => p.status === 'Approved' && (!p.budgetItems || p.budgetItems.length === 0)
      );

    // 8. Actual expenditure
    const actualSpend = filteredProjects.reduce((sum, p) => {
      if (filters.reportingPeriod !== 'all') {
        const periodTxs = (p.transactions || []).filter((t) =>
          t.date.startsWith(filters.reportingPeriod) &&
          (filters.budgetCategory === 'all' || t.category === filters.budgetCategory)
        );
        return (
          sum +
          periodTxs
            .filter((t) => t.type === 'expense')
            .reduce(
              (tSum, t) =>
                tSum + (t.currency === 'XAF' ? Math.round(t.amount / EUR_TO_XAF) : t.amount),
              0
            )
        );
      }
      const items = filters.budgetCategory !== 'all'
        ? p.budgetItems?.filter((b) => b.category === filters.budgetCategory)
        : p.budgetItems;
      return (
        sum +
        (items?.reduce((bSum, b) => bSum + (b.actualExpenditure || 0), 0) || 0)
      );
    }, 0);

    // 9. Confirmed funding (NEVER count pending grants!)
    const confirmedFunding = filteredProjects.reduce((sum, p) => {
      return (
        sum +
        (p.fundingSources
          ?.filter((f) => f.status === 'confirmed')
          .reduce(
            (fSum, f) =>
              fSum + (f.currency === 'XAF' ? Math.round(f.amount / EUR_TO_XAF) : f.amount),
            0
          ) || 0)
      );
    }, 0);

    // 10. Open funding gap
    const totalPlannedBudget = filteredProjects.reduce((sum, p) => {
      const items = filters.budgetCategory !== 'all'
        ? p.budgetItems?.filter((b) => b.category === filters.budgetCategory)
        : p.budgetItems;
      return (
        sum +
        (items?.reduce((bSum, b) => bSum + (b.approvedBudget || b.plannedCost || 0), 0) ||
          p.proposal?.estimatedBudgetEUR ||
          0)
      );
    }, 0);
    const openFundingGap = Math.max(0, (approvedTotalBudget || totalPlannedBudget) - confirmedFunding);

    // 11. Overdue milestones
    let overdueMilestonesCount = 0;
    filteredProjects.forEach((p) => {
      p.milestones?.forEach((m) => {
        if (filters.reportingPeriod !== 'all' && !m.targetDate.startsWith(filters.reportingPeriod)) {
          return;
        }
        if (!m.isCompleted && m.targetDate < today) {
          overdueMilestonesCount++;
        }
      });
    });

    // 12. Open high-priority risks
    let openHighRisksCount = 0;
    filteredProjects.forEach((p) => {
      p.risks?.forEach((r) => {
        if (r.status === 'active' && (r.impact === 'high' || r.probability === 'high')) {
          openHighRisksCount++;
        }
      });
    });

    // 13. Verified beneficiaries reached
    let verifiedBeneficiariesCount = 0;
    let hasVerifiedRecord = false;
    filteredProjects.forEach((p) => {
      p.impactIndicators?.forEach((i) => {
        if (i.evidenceStatus === 'verified') {
          verifiedBeneficiariesCount += i.actual || 0;
          hasVerifiedRecord = true;
        }
      });
    });

    // 14. Projects requiring board decisions
    const requiringBoardDecision = filteredProjects.filter((p) => {
      if (p.status === 'Under Review' || p.status === 'Submitted') return true;
      if (p.decisions?.some((d) => d.status !== 'human_decided')) return true;
      return false;
    }).length;

    return [
      {
        id: 'total_registered_projects',
        label: '1. Registrierte Projekte',
        value: totalProjects,
        badge: 'Portfolio',
        badgeColor: 'blue',
        formulaRule: 'COUNT(projects) im aktuell gewählten Filterkontext.',
        targetView: 'portfolio',
      },
      {
        id: 'projects_awaiting_review',
        label: '2. In Begutachtung',
        value: awaitingReview,
        badge: 'Review',
        badgeColor: 'amber',
        formulaRule: 'COUNT(projects WHERE status IN ("Under Review", "Submitted")).',
        targetView: 'portfolio',
        filterAction: { status: 'Under Review' },
      },
      {
        id: 'approved_projects',
        label: '3. Genehmigte Projekte',
        value: approvedProjects,
        badge: 'Genehmigt',
        badgeColor: 'emerald',
        formulaRule: 'COUNT(projects WHERE status == "Approved").',
        targetView: 'portfolio',
        filterAction: { status: 'Approved' },
      },
      {
        id: 'active_projects',
        label: '4. Aktive Vorhaben',
        value: activeProjects,
        badge: 'In Umsetzung',
        badgeColor: 'blue',
        formulaRule: 'COUNT(projects WHERE status IN ("In Progress", "Ready for Implementation", "Fundraising")).',
        targetView: 'operations',
      },
      {
        id: 'projects_on_hold',
        label: '5. Pausierte Vorhaben',
        value: onHoldProjects,
        badge: 'Pausiert',
        badgeColor: 'amber',
        formulaRule: 'COUNT(projects WHERE status == "On Hold").',
        targetView: 'portfolio',
        filterAction: { status: 'On Hold' },
      },
      {
        id: 'completed_projects',
        label: '6. Abgeschlossen',
        value: completedProjects,
        badge: 'Finalisiert',
        badgeColor: 'slate',
        formulaRule: 'COUNT(projects WHERE status IN ("Completed", "Closed")).',
        targetView: 'portfolio',
        filterAction: { status: 'Completed' },
      },
      {
        id: 'approved_total_budget',
        label: '7. Genehmigtes Budget',
        value: approvedTotalBudget > 0 ? `${approvedTotalBudget.toLocaleString('de-DE')} €` : 'N/A',
        isUnknown: approvedTotalBudget === 0,
        unknownReason: 'Noch kein formales Vorstandsvotum für dieses Teilportfolio erteilt.',
        badge: 'Budget',
        badgeColor: 'emerald',
        formulaRule: 'SUM(budgetItems.approvedBudget); falls 0 oder noch in Antragsphase, als N/A ausgewiesen.',
        targetView: 'finance',
      },
      {
        id: 'actual_expenditure',
        label: '8. Ist-Ausgaben (Mittelabfluss)',
        value: `${actualSpend.toLocaleString('de-DE')} €`,
        badge: 'Mittelabfluss',
        badgeColor: 'slate',
        formulaRule: 'SUM(budgetItems.actualExpenditure) über alle verbuchten und freigegebenen Rechnungen.',
        targetView: 'finance',
      },
      {
        id: 'confirmed_funding',
        label: '9. Bestätigte Finanzierung',
        value: `${confirmedFunding.toLocaleString('de-DE')} €`,
        badge: 'Zugesagt',
        badgeColor: 'emerald',
        formulaRule: 'SUM(fundingSources WHERE status == "confirmed"). Beantragte Mittel werden strikt ausgeschlossen!',
        targetView: 'fundraising',
      },
      {
        id: 'open_funding_gap',
        label: '10. Offene Finanzierungslücke',
        value: `${openFundingGap.toLocaleString('de-DE')} €`,
        badge: 'Deckungslücke',
        badgeColor: 'rose',
        formulaRule: 'MAX(0, (Genehmigtes/Geplantes Budget - Bestätigte Finanzierung)).',
        targetView: 'finance',
      },
      {
        id: 'overdue_milestones',
        label: '11. Überfällige Meilensteine',
        value: overdueMilestonesCount,
        badge: overdueMilestonesCount > 0 ? 'Verzug' : 'Im Plan',
        badgeColor: overdueMilestonesCount > 0 ? 'rose' : 'emerald',
        formulaRule: 'COUNT(milestones WHERE isCompleted == false AND targetDate < HEUTE()).',
        targetView: 'planning',
      },
      {
        id: 'open_high_priority_risks',
        label: '12. Offene Hochrisiken',
        value: openHighRisksCount,
        badge: openHighRisksCount > 0 ? 'Überwachung' : 'Stabil',
        badgeColor: openHighRisksCount > 0 ? 'amber' : 'emerald',
        formulaRule: 'COUNT(risks WHERE status == "active" AND (impact == "high" OR probability == "high")).',
        targetView: 'risks',
        filterAction: { riskPriority: 'high' },
      },
      {
        id: 'verified_beneficiaries_reached',
        label: '13. Verifizierte Begünstigte',
        value: hasVerifiedRecord ? verifiedBeneficiariesCount : 'N/A',
        isUnknown: !hasVerifiedRecord,
        unknownReason: 'Keine auditierten Teilnehmernachweise vorliegend (Planungsphase).',
        badge: 'Audit-Proof',
        badgeColor: hasVerifiedRecord ? 'emerald' : 'slate',
        formulaRule: 'SUM(impactIndicators.actual WHERE evidenceStatus == "verified"). Schätzungen sind ausgeschlossen.',
        targetView: 'impact',
      },
      {
        id: 'projects_requiring_board_decisions',
        label: '14. Vorstandsbeschlüsse fällig',
        value: requiringBoardDecision,
        badge: 'Beschluss',
        badgeColor: requiringBoardDecision > 0 ? 'amber' : 'emerald',
        formulaRule: 'COUNT(projects WHERE status IN ("Under Review", "Submitted") OR decisions mit unbestätigter Beschlussfassung).',
        targetView: 'portfolio',
      },
    ];
  }, [filteredProjects, today]);

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    localStorage.removeItem('tefa_intelligence_filters');
  };

  const handleSaveView = () => {
    localStorage.setItem('tefa_intelligence_filters', JSON.stringify(filters));
    setSaveViewMsg('Dashboard-Filteransicht erfolgreich gespeichert.');
    setTimeout(() => setSaveViewMsg(null), 3000);
  };

  const handleSelectProjectFromDrilldown = (id: string) => {
    setActiveProjectId(id);
    setFilters((prev) => ({ ...prev, projectId: id }));
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.projectId !== 'all') count++;
    if (filters.country !== 'all') count++;
    if (filters.category !== 'all') count++;
    if (filters.manager !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.reportingPeriod !== 'all') count++;
    if (filters.budgetCategory !== 'all') count++;
    if (filters.riskPriority !== 'all') count++;
    if (filters.environment !== 'all') count++;
    return count;
  }, [filters]);

  const navTabs: { id: IntelligenceViewTab; label: string; icon: React.ElementType }[] = [
    { id: 'executive', label: 'A. Executive Overview', icon: LayoutDashboard },
    { id: 'portfolio', label: 'B. Project Portfolio', icon: Layers },
    { id: 'planning', label: 'C. Planning & Milestones', icon: Calendar },
    { id: 'finance', label: 'D. Financial Controlling', icon: Wallet },
    { id: 'fundraising', label: 'E. Fundraising & Partners', icon: PiggyBank },
    { id: 'operations', label: 'F. Operations & Setup', icon: Settings },
    { id: 'inventory', label: 'G. Equipment & Inventory', icon: Server },
    { id: 'impact', label: 'H. Impact & Beneficiaries', icon: TrendingUp },
    { id: 'risks', label: 'I. Risks & Compliance', icon: ShieldAlert },
    { id: 'exports', label: 'J. Reporting & Exports', icon: Download },
  ];

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* Top Banner & Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                TEFA Intelligence Hub
              </span>
              <span className="text-xs text-slate-400">
                TechEnergy For Africa e.V. • BI & Controlling
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              TEFA Project Intelligence – Interactive Dashboard & Impact Analytics
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl">
              Ganzheitliches Projekt- & Finanzcontrolling über den gesamten Lebenszyklus. Revisionssichere
              Evidenz-Governance, Budgetabgleich und wirkungsbezogene M&E-Analysen.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => setIsAiDrawerOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              KI-Controlling-Assistent
            </button>

            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Scale className="w-4 h-4 text-blue-400" />
              Projekte vergleichen
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              Datenimport (CSV/XLSX)
            </button>

            <button
              onClick={() => {
                setSelectedKpiForFormula(kpis[0]);
                setIsFormulaModalOpen(true);
              }}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
              title="Berechnungsvorschriften einsehen"
            >
              <Calculator className="w-4 h-4 text-purple-400" />
              KPI-Formeln
            </button>
          </div>
        </div>

        {/* Environment Filter Pill (LIVE vs DEMO vs ALL) */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Daten-Modus:</span>
            <div className="bg-slate-800 p-0.5 rounded-lg border border-slate-700 flex items-center">
              <button
                onClick={() => setFilters((prev) => ({ ...prev, environment: 'all' }))}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  filters.environment === 'all'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Gesamtportfolio ({projects.length})
              </button>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, environment: 'live' }))}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  filters.environment === 'live'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                LIVE Real-Portfolio ({projects.filter((p) => !p.isDemoOrHypothetical).length})
              </button>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, environment: 'demo' }))}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  filters.environment === 'demo'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                DEMO / Planung ({projects.filter((p) => p.isDemoOrHypothetical).length})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveViewMsg && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                <Check className="w-3.5 h-3.5" /> {saveViewMsg}
              </span>
            )}
            <button
              onClick={handleSaveView}
              className="text-xs text-slate-300 hover:text-white underline font-medium"
            >
              Ansicht speichern
            </button>
            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-medium ml-3"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Filter zurücksetzen
            </button>
          </div>
        </div>
      </div>

      {/* Clear Visual Distinction Banner: DEMO vs LIVE vs Gesamt */}
      {filters.environment === 'demo' || filters.projectId === 'proj_ifopsim_001' ? (
        <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold flex items-center gap-2 flex-wrap">
                <span>DEMO-MODUS / HYPOTHETISCHES PLANUNGSPORTFOLIO</span>
                <span className="text-[10px] bg-amber-200/90 text-amber-900 px-2 py-0.5 rounded font-mono font-bold">
                  IFOPSIM SYNTHETISCH
                </span>
              </div>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Alle angezeigten Meilensteine, Budgetposten und Inventardaten sind synthetische Planungsszenarien. Reale Konten und Live-Bestände sind geschützt.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, environment: 'live', projectId: 'all' }))}
            className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-semibold transition-colors shrink-0"
          >
            Zu LIVE Real-Portfolio wechseln
          </button>
        </div>
      ) : filters.environment === 'live' ? (
        <div className="bg-emerald-50/90 border border-emerald-300 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950 shadow-xs">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold flex items-center gap-2 flex-wrap">
                <span>LIVE REAL-PORTFOLIO AKTIV</span>
                <span className="text-[10px] bg-emerald-200/90 text-emerald-900 px-2 py-0.5 rounded font-mono font-bold">
                  REVISIONSSICHER
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Ausschließlich genehmigte Beschlüsse, verifizierte Kassenbelege und technisch geprüfte Anlagegüter ohne hypothetische Annahmen.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, environment: 'demo', projectId: 'proj_ifopsim_001' }))}
            className="px-3 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 rounded-lg text-xs font-semibold transition-colors shrink-0"
          >
            DEMO-Planungsszenarien ansehen
          </button>
        </div>
      ) : null}

      {/* Sticky Global Filter Toolbar & Navigation on Desktop */}
      <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md pb-2 pt-1 -mt-2 space-y-3 shadow-xs">
        {/* Global Filter Bar Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-3.5">
          {/* Header row with active counter and toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-[#0f2b48]" />
              <h3 className="font-bold text-[#0f2b48] text-xs uppercase tracking-wider">
                Portfolio-Filter & Dimensionen
              </h3>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {filteredProjects.length} {filteredProjects.length === 1 ? 'Projekt' : 'Projekte'}
              </span>
              {activeFilterCount > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {activeFilterCount} Filter aktiv
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-medium mr-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Zurücksetzen
                </button>
              )}
              <button
                onClick={() => setIsFilterBarOpen((prev) => !prev)}
                className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                <span>{isFilterBarOpen ? 'Filter einklappen' : 'Filter ausklappen'}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transform transition-transform ${
                    isFilterBarOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Active filter summary chips when collapsed */}
          {!isFilterBarOpen && activeFilterCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-2 mt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-400 text-[11px]">Aktive Filter:</span>
              {filters.projectId !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium text-[11px]">
                  Projekt: {projects.find((p) => p.id === filters.projectId)?.referenceId || filters.projectId}
                  <button onClick={() => setFilters({ ...filters, projectId: 'all' })} className="hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.reportingPeriod !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium text-[11px]">
                  Zeitraum: {filters.reportingPeriod}
                  <button onClick={() => setFilters({ ...filters, reportingPeriod: 'all' })} className="hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.budgetCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium text-[11px]">
                  Kategorie: {filters.budgetCategory}
                  <button onClick={() => setFilters({ ...filters, budgetCategory: 'all' })} className="hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.status !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium text-[11px]">
                  Status: {filters.status}
                  <button onClick={() => setFilters({ ...filters, status: 'all' })} className="hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Filter dropdowns grid (Desktop & Expanded Mobile) */}
          {isFilterBarOpen && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-2.5 pt-3 mt-2 border-t border-slate-100">
              {/* Project */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Projekt:
                </label>
                <select
                  value={filters.projectId}
                  onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-[#0f2b48]"
                >
                  <option value="all">Alle Projekte ({projects.length})</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.referenceId} - {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Country */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Land:</label>
                <select
                  value={filters.country}
                  onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-[#0f2b48]"
                >
                  <option value="all">Alle Länder</option>
                  <option value="Cameroon">Kamerun (CMR)</option>
                  <option value="Germany">Deutschland (DE)</option>
                  <option value="Ghana">Ghana</option>
                  <option value="Senegal">Senegal</option>
                  <option value="Kenya">Kenia</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Thema:
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-[#0f2b48]"
                >
                  <option value="all">Alle Kategorien</option>
                  <option value="digital_inclusion">Digitale Teilhabe & Inklusion</option>
                  <option value="inclusive_education">Inklusive Berufsbildung</option>
                  <option value="renewable_energy">Erneuerbare Energien & Solar</option>
                  <option value="environmental_education">Umwelt & Generation Green</option>
                  <option value="community_development">Gemeindeentwicklung</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Status:
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-[#0f2b48]"
                >
                  <option value="all">Alle Status</option>
                  <option value="Draft">Entwurf (Draft)</option>
                  <option value="Under Review">In Begutachtung</option>
                  <option value="Approved">Genehmigt</option>
                  <option value="Fundraising">In Mittelakquise</option>
                  <option value="Ready for Implementation">Bereit zur Umsetzung</option>
                  <option value="In Progress">In Durchführung</option>
                  <option value="On Hold">Pausiert</option>
                  <option value="Completed">Abgeschlossen</option>
                </select>
              </div>

              {/* Risk Priority */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Risiko:
                </label>
                <select
                  value={filters.riskPriority}
                  onChange={(e) => setFilters({ ...filters, riskPriority: e.target.value })}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-[#0f2b48]"
                >
                  <option value="all">Alle Risiken</option>
                  <option value="critical">Nur Kritisch (Rot)</option>
                  <option value="high">Hoch (Gelb/Rot)</option>
                  <option value="medium">Mittel</option>
                  <option value="low">Gering</option>
                </select>
              </div>

              {/* Manager */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Projektleiter:
                </label>
                <select
                  value={filters.manager}
                  onChange={(e) => setFilters({ ...filters, manager: e.target.value })}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-[#0f2b48]"
                >
                  <option value="all">Alle Verantwortlichen</option>
                  {Array.from(new Set(projects.map((p) => p.createdBy).filter(Boolean))).map((mgr) => (
                    <option key={mgr} value={mgr}>
                      {mgr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reporting Period */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Zeitraum:
                </label>
                <select
                  value={filters.reportingPeriod}
                  onChange={(e) => setFilters({ ...filters, reportingPeriod: e.target.value })}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-[#0f2b48]"
                >
                  <option value="all">Alle Zeiträume</option>
                  <option value="2026">Geschäftsjahr 2026</option>
                  <option value="2027">Geschäftsjahr 2027</option>
                </select>
              </div>

              {/* Budget Category */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Budgetkosten:
                </label>
                <select
                  value={filters.budgetCategory}
                  onChange={(e) => setFilters({ ...filters, budgetCategory: e.target.value })}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-[#0f2b48]"
                >
                  <option value="all">Alle Kostenarten</option>
                  <option value="Personnel">Personnel (Personal)</option>
                  <option value="Infrastructure & Solar">Infrastructure & Solar</option>
                  <option value="Equipment & Hardware">Equipment & Hardware</option>
                  <option value="Accessibility & Interpretation">Accessibility & Interpretation</option>
                  <option value="Administration & Ops">Administration & Ops</option>
                  <option value="Contingency Reserve">Contingency Reserve</option>
                </select>
              </div>
            </div>
          )}

          {/* Data Governance & Provenance Classification Legend */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-2.5 mt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700">Evidenz-Klassifikation:</span>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5 text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                <span className="font-medium">Bestätigter Beleg</span>
              </span>
              <span className="flex items-center gap-1.5 text-amber-800">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                <span className="font-medium">Hypothetische Annahme / Plan</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
                <span className="font-medium">Fehlende Info (N/A)</span>
              </span>
              <span className="flex items-center gap-1.5 text-purple-700">
                <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                <span className="font-medium">KI-Controlling-Hinweis</span>
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (A through J) with Dark Blue Active Tab */}
        <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-xs overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#0f2b48] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main View Display */}
      <div>
        {activeView === 'executive' && (
          <ExecutiveOverviewTab
            projects={projects}
            filteredProjects={filteredProjects}
            inventory={inventory}
            filters={filters}
            onSelectKpiForFormula={(kpi) => {
              setSelectedKpiForFormula(kpi);
              setIsFormulaModalOpen(true);
            }}
            onNavigateView={(view, filterChanges) => {
              setActiveView(view);
              if (filterChanges) {
                setFilters((prev) => ({ ...prev, ...filterChanges }));
              }
            }}
            kpis={kpis}
          />
        )}

        {activeView === 'portfolio' && (
          <PortfolioTab
            projects={projects}
            filteredProjects={filteredProjects}
            filters={filters}
            onSelectProject={handleSelectProjectFromDrilldown}
            onOpenCompare={() => setIsCompareModalOpen(true)}
          />
        )}

        {activeView === 'planning' && (
          <PlanningMilestonesTab
            filteredProjects={filteredProjects}
            onSelectProject={handleSelectProjectFromDrilldown}
            reportingPeriod={filters.reportingPeriod}
          />
        )}

        {activeView === 'finance' && (
          <FinancialControllingTab
            filteredProjects={filteredProjects}
            onSelectProject={handleSelectProjectFromDrilldown}
            initialCategoryFilter={filters.budgetCategory}
            reportingPeriod={filters.reportingPeriod}
          />
        )}

        {activeView === 'fundraising' && (
          <FundraisingPartnershipsTab
            filteredProjects={filteredProjects}
            onSelectProject={handleSelectProjectFromDrilldown}
          />
        )}

        {activeView === 'operations' && (
          <OperationsTab
            filteredProjects={filteredProjects}
            onSelectProject={handleSelectProjectFromDrilldown}
          />
        )}

        {activeView === 'inventory' && (
          <InventoryAnalyticsTab
            inventory={inventory}
            projects={projects}
          />
        )}

        {activeView === 'impact' && (
          <ImpactBeneficiariesTab
            filteredProjects={filteredProjects}
            onSelectProject={handleSelectProjectFromDrilldown}
          />
        )}

        {activeView === 'risks' && (
          <RisksComplianceTab
            filteredProjects={filteredProjects}
            onSelectProject={handleSelectProjectFromDrilldown}
          />
        )}

        {activeView === 'exports' && (
          <ReportingExportsTab
            projects={projects}
            filteredProjects={filteredProjects}
            inventory={inventory}
            filters={filters}
          />
        )}
      </div>

      {/* Formula Modal */}
      <KPIFormulaModal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
        selectedKpi={selectedKpiForFormula}
        allKpis={kpis}
      />

      {/* AI Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        filters={filters}
        onSelectProject={(id) => {
          handleSelectProjectFromDrilldown(id);
          setIsAiDrawerOpen(false);
        }}
      />

      {/* Data Import Modal */}
      <DataImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => {
          refreshProjects();
        }}
      />

      {/* Project Comparison Modal */}
      <ProjectComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        projects={projects}
        activeProjectId={activeProjectId}
      />
    </div>
  );
};
