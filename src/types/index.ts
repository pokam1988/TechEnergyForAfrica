/**
 * TEFA ProjectHub Data Types & Enums
 * Organization: TechEnergy For Africa e.V. (TEFA)
 */

export type UserRole =
  | 'visitor'
  | 'tefa_member'
  | 'project_manager'
  | 'project_reviewer'
  | 'finance_officer'
  | 'board_member'
  | 'system_admin'
  | 'local_partner';

export type ProjectLifecyclePhase =
  | 'idea'
  | 'proposal'
  | 'feasibility'
  | 'planning'
  | 'approval'
  | 'fundraising'
  | 'implementation'
  | 'monitoring'
  | 'financial_accounting'
  | 'evaluation'
  | 'closure'
  | 'impact_reporting';

export type ProjectStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Fundraising'
  | 'Ready for Implementation'
  | 'In Progress'
  | 'On Hold'
  | 'Completed'
  | 'Closed'
  | 'Rejected';

export type EvidenceStatus =
  | 'verified'
  | 'user_provided_unverified'
  | 'hypothetical_assumption'
  | 'ai_generated'
  | 'missing_information';

export type ReadinessStatus =
  | 'not_assessed'
  | 'missing_information'
  | 'under_review'
  | 'verified'
  | 'not_applicable';

export type TaskStatus = 'backlog' | 'in_progress' | 'review' | 'done';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  phase: ProjectLifecyclePhase;
  targetDate: string;
  completedDate?: string;
  isCompleted: boolean;
  responsiblePerson: string;
  deliverables: string[];
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  milestoneId?: string;
  status: TaskStatus;
  priority: PriorityLevel;
  assignee: string;
  dueDate: string;
  tags?: string[];
}

export interface RiskItem {
  id: string;
  title?: string;
  category: 'technical' | 'financial' | 'operational' | 'legal' | 'environmental' | 'social';
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigationStrategy: string;
  responsiblePerson: string;
  status: 'active' | 'mitigated' | 'closed';
}

export interface FeasibilityRequirement {
  id: string;
  category:
    | 'strategic_alignment'
    | 'beneficiary_needs'
    | 'technical_feasibility'
    | 'financial_feasibility'
    | 'partner_readiness'
    | 'legal_regulatory'
    | 'environmental_sustainability'
    | 'social_inclusion'
    | 'operational_capacity'
    | 'major_risks';
  title: string;
  description: string;
  status: ReadinessStatus;
  evidenceSource?: string;
  notes?: string;
  lastVerifiedDate?: string;
  verifiedBy?: string;
}

export interface DecisionOption {
  id: string;
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  swot?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  scores?: Record<string, number>; // criterionId -> score (1-10)
  totalWeightedScore?: number;
}

export interface DecisionCriterion {
  id: string;
  name: string;
  weight: number; // 1-10
  description?: string;
}

export interface DecisionRecord {
  id: string;
  decisionTitle: string;
  problemStatement: string;
  analysisType: 'pros_cons' | 'swot' | 'comparison' | 'weighted_matrix' | 'cost_benefit';
  criteria: DecisionCriterion[];
  options: DecisionOption[];
  aiAnalysis?: {
    recommendation: string;
    reasoning: string;
    assumptions: string[];
    missingInfo: string[];
    limitations: string[];
    generatedAt: string;
  };
  humanDecision?: {
    selectedOptionId: string;
    decisionRationale: string;
    decidedBy: string;
    decidedAt: string;
  };
  status: 'draft' | 'ai_analyzed' | 'human_decided';
}

export interface BudgetItem {
  id: string;
  category:
    | 'Personnel'
    | 'Equipment & Hardware'
    | 'Logistics & Customs'
    | 'Training & Pedagogy'
    | 'Accessibility & Interpretation'
    | 'Infrastructure & Solar'
    | 'Administration & Ops'
    | 'Contingency Reserve';
  description: string;
  plannedCost: number;
  approvedBudget: number;
  committedCost: number;
  actualExpenditure: number;
  currency: 'EUR' | 'XAF';
  fundingSourceId?: string;
  notes?: string;
}

export interface FundingSource {
  id: string;
  name: string;
  type: 'grant' | 'donation' | 'co_financing' | 'in_kind' | 'corporate';
  status: 'confirmed' | 'pending_application' | 'potential_pipeline' | 'rejected';
  amount: number;
  currency: 'EUR' | 'XAF';
  isRestricted: boolean;
  notes?: string;
  applicationDeadline?: string;
  expectedDecisionDate?: string;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  description: string;
  category: string;
  costCenter: string;
  type: 'expense' | 'income';
  amount: number;
  currency: 'EUR' | 'XAF';
  exchangeRate: number; // e.g., 655.957 for EUR to XAF
  accountingAmountEUR: number;
  paymentStatus: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'paid';
  receiptAttached: boolean;
  receiptFileName?: string;
  receiptNotes?: string;
  payerOrVendor: string;
  recordedBy: string;
  reviewedBy?: string;
  approvedBy?: string;
}

export interface InventoryAsset {
  id: string;
  assetTag: string;
  projectId?: string;
  category: 'Laptops' | 'Desktops' | 'Solar & Power' | 'Assistive Tech' | 'Network & Telecom' | 'Classroom Furniture';
  manufacturerModel: string;
  serialNumber: string;
  quantity: number;
  technicalSpecs: string;
  location: string;
  ownership: string;
  donorName?: string;
  donationStatus: 'offered' | 'confirmed' | 'shipped' | 'in_transit' | 'customs_processing' | 'arrived' | 'inspected' | 'approved_for_use';
  operationalCondition: 'new' | 'excellent_refurbished' | 'good' | 'needs_repair' | 'scrap';
  dataWipingEvidence: boolean;
  acceptanceDate?: string;
  technicianInCharge: string;
  environment: 'live' | 'test';
}

export interface ImpactIndicator {
  id: string;
  name: string;
  category: 'education' | 'energy' | 'inclusion' | 'community';
  definition: string;
  baseline: number;
  target: number;
  actual: number;
  unit: string;
  reportingPeriod: string;
  evidenceSource: string;
  evidenceStatus: EvidenceStatus;
  responsiblePerson: string;
}

export interface ClosureChecklist {
  deliverablesAccepted: boolean;
  financialReconciliationDone: boolean;
  commitmentsReviewed: boolean;
  assetsHandedOver: boolean;
  finalPartnerReportReceived: boolean;
  lessonsLearnedDocumented: boolean;
  impactEvaluationComplete: boolean;
  donorReportingFinalized: boolean;
  boardApprovedClosure: boolean;
  archiveRetentionConfigured: boolean;
  boardSignOffNotes?: string;
  boardSignOffDate?: string;
  boardMemberName?: string;
}

export interface PartnerOpportunity {
  id: string;
  organizationName: string;
  type: 'donor_foundation' | 'corporate_csr' | 'ngo_partner' | 'government' | 'university';
  contactPerson: string;
  email: string;
  phone?: string;
  country: string;
  status: 'prospect' | 'initial_contact' | 'concept_submitted' | 'grant_negotiation' | 'active_partner' | 'dormant';
  eligibilityNotes?: string;
  nextDeadline?: string;
  fundingFocus?: string;
  lastContactDate?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  projectId?: string;
  projectTitle?: string;
  details: string;
}

export interface ProjectProposal {
  problemStatement: string;
  targetBeneficiaries: string;
  beneficiaryCountPlanned: number;
  proposedSolution: string;
  objectives: string[];
  expectedResults: string[];
  activities: string[];
  durationMonths: number;
  estimatedBudgetEUR: number;
  potentialPartners: string[];
  sustainabilityPlan: string;
  inclusionAccessibilityNeeds: string;
  proposerName: string;
  proposerEmail: string;
  proposerOrganization?: string;
  submissionDate: string;
}

export interface SimulationParameters {
  beneficiariesCount: number;
  trainersCount: number;
  trainingDurationMonths: number;
  usableWorkstations: number;
  studentsPerWorkstation: number;
  donatedHardwareCount: number;
  hardwareUnitPurchaseCostEUR: number;
  logisticsCustomsCostEUR: number;
  infrastructureSolarCostEUR: number;
  monthlyOperatingCostEUR: number;
  accessibilityInterpreterCostEUR: number;
  maintenanceReservePct: number;
  confirmedGrantsEUR: number;
  pendingGrantsEUR: number;
}

export interface Project {
  id: string;
  referenceId: string; // e.g. TEFA-2026-CMR-001
  title: string;
  shortDescription: string;
  category:
    | 'digital_inclusion'
    | 'inclusive_education'
    | 'renewable_energy'
    | 'environmental_education'
    | 'international_exchange'
    | 'community_development'
    | 'youth_empowerment';
  country: 'Cameroon' | 'Germany' | 'Ghana' | 'Senegal' | 'Kenya' | 'Other';
  locationDetails: string;
  lifecyclePhase: ProjectLifecyclePhase;
  status: ProjectStatus;
  isDemoOrHypothetical: boolean;
  demoDisclaimer?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  proposal: ProjectProposal;
  feasibilityChecks: FeasibilityRequirement[];
  decisions: DecisionRecord[];
  milestones: Milestone[];
  tasks: TaskItem[];
  risks: RiskItem[];
  budgetItems: BudgetItem[];
  fundingSources: FundingSource[];
  transactions: FinancialTransaction[];
  impactIndicators: ImpactIndicator[];
  closure: ClosureChecklist;
  simulationParams: SimulationParameters;
  communicationCampaigns?: GeneratedCampaign[];
  campaignAssets?: CampaignAsset[];
}

// -------------------------------------------------------------
// TEFA Creative Studio – AI Branding & Campaign Builder Types
// -------------------------------------------------------------

export type CampaignLifecyclePhase =
  | 'idea_proposal'
  | 'fundraising_outreach'
  | 'project_launch'
  | 'implementation_update'
  | 'awareness_campaign'
  | 'impact_communication'
  | 'final_reporting';

export type CampaignFormatType =
  | 'billboard_poster'
  | 'magazine_ad'
  | 'instagram_square'
  | 'instagram_story'
  | 'linkedin_graphic'
  | 'website_hero'
  | 'project_flyer'
  | 'donor_presentation_cover'
  | 'project_report_cover';

export interface CampaignFormatConfig {
  id: CampaignFormatType;
  name: string;
  category: 'social' | 'print' | 'digital' | 'donor_reporting';
  aspectRatio: '1:1' | '16:9' | '9:16' | '3:4' | '4:3';
  aspectRatioLabel: string;
  width: number;
  height: number;
  description: string;
}

export type CampaignStatus = 'draft' | 'under_review' | 'approved' | 'rejected' | 'archived';

export interface TextOverlayConfig {
  headline: string;
  subtitle: string;
  callToAction: string;
  organizationBadge: string;
  logoPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'none';
  textAlignment: 'left' | 'center' | 'right';
  fontSize: 'compact' | 'medium' | 'prominent';
  textColor: 'light' | 'dark';
  overlayOpacity: number;
  badgeText?: string;
}

export interface CampaignAsset {
  id: string;
  campaignId: string;
  format: CampaignFormatType;
  version: number;
  imageUrl: string;
  thumbnailUrl?: string;
  headline: string;
  subtitle: string;
  callToAction: string;
  overlayConfig: TextOverlayConfig;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
  isAiGenerated: boolean;
  modelUsed?: string;
}

export interface BrandIdentitySpec {
  projectName: string;
  campaignName: string;
  approvedLogo: {
    useOfficialTefaLogo: boolean;
    customLogoUrl?: string;
    logoSource: 'official_approved_asset' | 'custom_uploaded' | 'none';
    disclaimer: string;
  };
  colorPalette: {
    primary: string; // e.g. #0f2b48 (Dark Blue)
    secondary: string; // e.g. #10b981 (Emerald Green)
    accent: string; // e.g. #f97316 (Solar Orange)
    neutralLight: string; // #ffffff / #f8fafc
    neutralDark: string; // #0f172a
  };
  typographyGuidance: {
    headingFont: string;
    bodyFont: string;
    styleTone: string;
  };
  visualComposition: string;
  visualStyle: 'photo_documentary' | 'modern_flat_vector' | 'isometric_tech' | '3d_conceptual' | 'clean_minimalist';
  coreVisualSubject: string;
  keyCampaignMessage: string;
  noPeopleMode: boolean; // MANDATORY: true by default
  disallowedVisualElements: string[];
  allowedVisualElements: string[];
}

export interface CampaignBrief {
  id: string;
  projectId: string; // linked project ID or 'new_proposal'
  projectTitle: string;
  title: string;
  lifecyclePhase: CampaignLifecyclePhase;
  objective: string;
  targetAudience: string;
  mainMessage: string;
  callToAction: string;
  language: 'de' | 'en' | 'fr';
  channels: string[];
  visualStyle: 'photo_documentary' | 'modern_flat_vector' | 'isometric_tech' | '3d_conceptual' | 'clean_minimalist';
  preferredColors: string[];
  imageDescription: string;
  textToDisplay: {
    headline: string;
    subtitle: string;
    callToAction: string;
  };
  startDate: string;
  endDate: string;
  requiredApprovals: string[];
  supportingDocuments: string[];
  noPeopleMode: boolean; // default: true
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface GeneratedCampaign {
  id: string;
  brief: CampaignBrief;
  brandIdentity: BrandIdentitySpec;
  masterVisual: {
    imageUrl: string;
    promptUsed: string;
    negativePrompt: string;
    generatedAt: string;
    model: string;
    isApprovedAsMaster: boolean;
  };
  selectedFormats: CampaignFormatType[];
  assets: CampaignAsset[];
  approvalHistory: {
    id: string;
    status: CampaignStatus;
    changedBy: string;
    changedByRole: string;
    timestamp: string;
    comment?: string;
  }[];
  isSavedToProject: boolean;
  savedToProjectId?: string;
}
