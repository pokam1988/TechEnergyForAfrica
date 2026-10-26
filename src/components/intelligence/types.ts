import { Project, InventoryAsset } from '../../types';

export type IntelligenceViewTab =
  | 'executive'
  | 'portfolio'
  | 'planning'
  | 'finance'
  | 'fundraising'
  | 'operations'
  | 'inventory'
  | 'impact'
  | 'risks'
  | 'exports';

export interface IntelligenceFilters {
  projectId: string; // 'all' or specific project id
  country: string; // 'all' or specific
  category: string; // 'all' or specific
  manager: string; // 'all' or specific
  status: string; // 'all' or specific
  reportingPeriod: string; // 'all', '2026', '2025', 'Q1-2026', etc.
  fundingSource: string; // 'all' or specific
  donor: string; // 'all' or specific
  partner: string; // 'all' or specific
  budgetCategory: string; // 'all' or specific
  evidenceStatus: string; // 'all', 'verified', 'user_provided_unverified', 'hypothetical_assumption'
  riskPriority: string; // 'all', 'high', 'critical', 'medium', 'low'
  environment: 'all' | 'live' | 'demo';
}

export interface KPICardDef {
  id: string;
  label: string;
  value: string | number;
  subValue?: string;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'blue' | 'rose' | 'slate';
  formulaRule: string;
  isUnknown?: boolean;
  unknownReason?: string;
  targetView: IntelligenceViewTab;
  filterAction?: Partial<IntelligenceFilters>;
}

export interface PortfolioMetricRow {
  id: string;
  referenceId: string;
  title: string;
  country: string;
  category: string;
  status: string;
  manager: string;
  totalBudgetEUR: number;
  confirmedFundingEUR: number;
  pendingFundingEUR: number;
  fundingGapEUR: number;
  overdueMilestones: number;
  openHighRisks: number;
  verifiedBeneficiaries: number | null;
  readinessScorePct: number;
  isDemoOrHypothetical: boolean;
}
