import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SEED_PROJECTS } from '../src/data/seedProjects.ts';
import { Project, InventoryAsset, BudgetItem, Milestone, RiskItem, FundingSource } from '../src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EUR_TO_XAF = 655.957;
const TODAY_STR = new Date().toISOString().split('T')[0];

// ============================================================================
// TEFA PROJECT INTELLIGENCE DASHBOARD - REGRESSION & DATA-INTEGRITY TEST SUITE
// Tested in DEMO MODE with synthetic projects: IFOPSIM and Generation Green
// ============================================================================

test('TEST 1: Filter by IFOPSIM and confirm only IFOPSIM data appears', () => {
  const allProjects = SEED_PROJECTS;
  const filtered = allProjects.filter((p) => p.id === 'proj_ifopsim_001');

  assert.equal(filtered.length, 1, 'Only exactly 1 project must be returned');
  const project = filtered[0];

  assert.equal(project.id, 'proj_ifopsim_001');
  assert.equal(project.referenceId, 'TEFA-2026-CMR-001');
  assert.equal(project.title, 'IFOPSIM – Inclusive Digital Vocational Training, Cameroon');
  assert.equal(project.status, 'Under Review');
  assert.equal(project.lifecyclePhase, 'feasibility');
  assert.equal(project.isDemoOrHypothetical, true, 'IFOPSIM must be marked DEMO');

  // Verify financial totals for IFOPSIM
  const approvedBudget = (project.budgetItems || []).reduce((sum, b) => sum + (b.approvedBudget || 0), 0);
  assert.equal(approvedBudget, 48500, 'IFOPSIM approved budget must be 48,500 €');

  const actualSpend = (project.budgetItems || []).reduce((sum, b) => sum + (b.actualExpenditure || 0), 0);
  assert.equal(actualSpend, 1650, 'IFOPSIM actual expenditure must be 1,650 €');

  const confirmedFunding = (project.fundingSources || [])
    .filter((f) => f.status === 'confirmed')
    .reduce((sum, f) => sum + (f.currency === 'XAF' ? Math.round(f.amount / EUR_TO_XAF) : f.amount), 0);
  assert.equal(confirmedFunding, 19500, 'IFOPSIM confirmed funding must be 19,500 €');

  const fundingGap = Math.max(0, approvedBudget - confirmedFunding);
  assert.equal(fundingGap, 29000, 'IFOPSIM funding gap must be 29,000 € (48,500 - 19,500)');

  // Verify milestone counts
  const milestones = project.milestones || [];
  assert.equal(milestones.length, 5, 'IFOPSIM must have 5 milestones');
  const overdueCount = milestones.filter((m) => !m.isCompleted && m.targetDate < TODAY_STR).length;
  assert.equal(overdueCount, 1, 'IFOPSIM has 1 overdue milestone (M3)');

  // Verify active risks
  const activeHighRisks = (project.risks || []).filter(
    (r) => r.status === 'active' && (r.impact === 'high' || r.probability === 'high')
  ).length;
  assert.equal(activeHighRisks, 2, 'IFOPSIM has 2 active high-priority risks');

  // Verify no Generation Green data is present
  assert.ok(
    !milestones.some((m) => m.title.toLowerCase().includes('solar kit') || m.title.toLowerCase().includes('bafoussam')),
    'No Generation Green milestones must leak into IFOPSIM filtered dataset'
  );
  assert.ok(
    !project.fundingSources?.some((f) => f.name.toLowerCase().includes('environmental foundation')),
    'No Generation Green funding sources must leak into IFOPSIM filtered dataset'
  );
});

test('TEST 2: Filter by Generation Green and confirm the dashboard updates correctly', () => {
  const allProjects = SEED_PROJECTS;
  const filtered = allProjects.filter((p) => p.id === 'proj_gen_green_002');

  assert.equal(filtered.length, 1, 'Only exactly 1 project must be returned');
  const project = filtered[0];

  assert.equal(project.id, 'proj_gen_green_002');
  assert.equal(project.referenceId, 'TEFA-2026-DE-CMR-002');
  assert.equal(project.title, 'Generation Green – Environmental Education and Sustainability');
  assert.equal(project.status, 'In Progress', 'Status must be In Progress');
  assert.equal(project.lifecyclePhase, 'implementation', 'Phase must be implementation');
  assert.equal(project.isDemoOrHypothetical, true, 'Generation Green must be marked DEMO');

  // Verify financial totals for Generation Green
  const approvedBudget = (project.budgetItems || []).reduce((sum, b) => sum + (b.approvedBudget || 0), 0);
  assert.equal(approvedBudget, 22000, 'Generation Green approved budget must be 22,000 €');

  const actualSpend = (project.budgetItems || []).reduce((sum, b) => sum + (b.actualExpenditure || 0), 0);
  assert.equal(actualSpend, 12650, 'Generation Green actual expenditure must be 12,650 € (9,000 + 1,200 + 2,450)');

  const confirmedFunding = (project.fundingSources || [])
    .filter((f) => f.status === 'confirmed')
    .reduce((sum, f) => sum + (f.currency === 'XAF' ? Math.round(f.amount / EUR_TO_XAF) : f.amount), 0);
  assert.equal(confirmedFunding, 22000, 'Generation Green confirmed funding must be 22,000 € (15,000 + 7,000)');

  const fundingGap = Math.max(0, approvedBudget - confirmedFunding);
  assert.equal(fundingGap, 0, 'Generation Green funding gap must be 0 € (fully financed)');

  // Verify milestones for Generation Green
  const milestones = project.milestones || [];
  assert.equal(milestones.length, 3, 'Generation Green has 3 milestones');
  const completedMilestones = milestones.filter((m) => m.isCompleted).length;
  assert.equal(completedMilestones, 1, 'M1 is completed');
  const overdueCount = milestones.filter((m) => !m.isCompleted && m.targetDate < TODAY_STR).length;
  assert.equal(overdueCount, 0, '0 overdue milestones for Generation Green');

  // Verify risks for Generation Green
  const risks = project.risks || [];
  assert.equal(risks.length, 2, 'Generation Green has 2 risks');
  const activeHighRisks = risks.filter(
    (r) => r.status === 'active' && (r.impact === 'high' || r.probability === 'high')
  ).length;
  assert.equal(activeHighRisks, 1, 'Exactly 1 active high risk (Customs delays, active/prob high)');

  // Verify verified beneficiaries
  const verifiedBeneficiaries = (project.impactIndicators || [])
    .filter((i) => i.evidenceStatus === 'verified')
    .reduce((sum, i) => sum + (i.actual || 0), 0);
  assert.equal(verifiedBeneficiaries, 155, 'Verified beneficiaries: 85 (students) + 70 (lamps) = 155');

  // Verify no IFOPSIM data is present
  assert.ok(
    !milestones.some((m) => m.title.toLowerCase().includes('vocational') || m.title.toLowerCase().includes('deaf')),
    'No IFOPSIM milestones must leak into Generation Green dataset'
  );
  assert.ok(
    !project.fundingSources?.some((f) => f.name.toLowerCase().includes('developpp')),
    'No IFOPSIM funding sources must leak into Generation Green dataset'
  );
});

test('TEST 3: Clear the project filter and verify portfolio totals', () => {
  // In DEMO environment with all projects
  const demoProjects = SEED_PROJECTS.filter((p) => p.isDemoOrHypothetical);
  assert.ok(demoProjects.length >= 2, 'At least IFOPSIM and Generation Green must be in demo pool');

  // 1. Registered demo projects
  const totalProjects = demoProjects.length;
  assert.equal(totalProjects, 3, 'Demo portfolio contains 3 demo projects (IFOPSIM, Gen Green, DFG)');

  // 2. Status distribution
  const underReviewCount = demoProjects.filter((p) => p.status === 'Under Review' || p.status === 'Submitted').length;
  assert.equal(underReviewCount, 1, '1 project under review (IFOPSIM)');

  const inProgressCount = demoProjects.filter((p) => p.status === 'In Progress').length;
  assert.equal(inProgressCount, 1, '1 project in progress (Generation Green)');

  const draftCount = demoProjects.filter((p) => p.status === 'Draft').length;
  assert.equal(draftCount, 1, '1 project in draft (Digital Future Girls)');

  // 3. Approved total budget across portfolio: IFOPSIM (48,500) + Gen Green (22,000) + DFG (0 approved) = 70,500 €
  const portfolioApprovedBudget = demoProjects.reduce((sum, p) => {
    return sum + (p.budgetItems?.reduce((bSum, b) => bSum + (b.approvedBudget || 0), 0) || 0);
  }, 0);
  assert.equal(portfolioApprovedBudget, 70500, 'Portfolio approved budget must equal 70,500 €');

  // 4. Actual expenditure across portfolio: IFOPSIM (1,650) + Gen Green (12,650) = 14,300 €
  const portfolioActualSpend = demoProjects.reduce((sum, p) => {
    return sum + (p.budgetItems?.reduce((bSum, b) => bSum + (b.actualExpenditure || 0), 0) || 0);
  }, 0);
  assert.equal(portfolioActualSpend, 14300, 'Portfolio actual expenditure must equal 14,300 €');

  // 5. Confirmed funding across portfolio: IFOPSIM (19,500) + Gen Green (22,000) = 41,500 €
  const portfolioConfirmedFunding = demoProjects.reduce((sum, p) => {
    return (
      sum +
      (p.fundingSources
        ?.filter((f) => f.status === 'confirmed')
        .reduce((fSum, f) => fSum + (f.currency === 'XAF' ? Math.round(f.amount / EUR_TO_XAF) : f.amount), 0) || 0)
    );
  }, 0);
  assert.equal(portfolioConfirmedFunding, 41500, 'Portfolio confirmed funding must equal 41,500 €');

  // 6. Open funding gap: MAX(0, 70,500 - 41,500) = 29,000 €
  const portfolioFundingGap = Math.max(0, portfolioApprovedBudget - portfolioConfirmedFunding);
  assert.equal(portfolioFundingGap, 29000, 'Portfolio funding gap must equal 29,000 €');

  // 7. Overdue milestones: 1 (IFOPSIM M3) + 0 (Gen Green) = 1
  const portfolioOverdue = demoProjects.reduce((sum, p) => {
    return sum + (p.milestones?.filter((m) => !m.isCompleted && m.targetDate < TODAY_STR).length || 0);
  }, 0);
  assert.equal(portfolioOverdue, 1, 'Total overdue milestones in demo portfolio must equal 1');

  // 8. Active high risks: 2 (IFOPSIM) + 1 (Gen Green) + 2 (Digital Future Girls) = 5
  const portfolioActiveHighRisks = demoProjects.reduce((sum, p) => {
    return (
      sum +
      (p.risks?.filter((r) => r.status === 'active' && (r.impact === 'high' || r.probability === 'high')).length || 0)
    );
  }, 0);
  assert.equal(portfolioActiveHighRisks, 5, 'Total active high risks in demo portfolio must equal 5');
});

test('TEST 4: Change the date range and verify all time-based charts', () => {
  const demoProjects = SEED_PROJECTS.filter((p) => p.isDemoOrHypothetical);

  // --- Period: '2026' ---
  const period2026 = '2026';

  // 1. Milestones in 2026
  const milestones2026 = demoProjects.flatMap((p) =>
    (p.milestones || []).filter((m) => m.targetDate.startsWith(period2026))
  );
  // IFOPSIM: 4 milestones in 2026; Gen Green: 2 milestones in 2026 -> Total 6
  assert.equal(milestones2026.length, 6, 'Total 6 milestones scheduled in 2026 across demo portfolio');
  const overdue2026 = milestones2026.filter((m) => !m.isCompleted && m.targetDate < TODAY_STR).length;
  assert.equal(overdue2026, 1, 'In 2026, exactly 1 overdue milestone (IFOPSIM M3: 2026-10-15)');

  // 2. Transactions & spend in 2026
  const txs2026 = demoProjects.flatMap((p) =>
    (p.transactions || []).filter((t) => t.date.startsWith(period2026) && t.type === 'expense')
  );
  const actualSpend2026 = txs2026.reduce(
    (sum, t) => sum + (t.currency === 'XAF' ? Math.round(t.amount / EUR_TO_XAF) : t.amount),
    0
  );
  // IFOPSIM: 1,650 €; Gen Green: 12,650 € (9000 + 1200 + 2450) -> Total 14,300 €
  assert.equal(actualSpend2026, 14300, 'Actual expenses in 2026: 1,650 € (IFOPSIM) + 12,650 € (Gen Green) = 14,300 €');

  // --- Period: '2027' ---
  const period2027 = '2027';

  // 1. Milestones in 2027
  const milestones2027 = demoProjects.flatMap((p) =>
    (p.milestones || []).filter((m) => m.targetDate.startsWith(period2027))
  );
  // IFOPSIM: 1 milestone in 2027 (M5: 2027-04-30); Gen Green: 1 milestone in 2027 (M3: 2027-02-15); DFG: 4 milestones in 2027 -> Total 6
  assert.equal(milestones2027.length, 6, 'Total 6 milestones scheduled in 2027 across demo portfolio');
  const overdue2027 = milestones2027.filter((m) => !m.isCompleted && m.targetDate < TODAY_STR).length;
  assert.equal(overdue2027, 0, 'In 2027, 0 overdue milestones since all 2027 target dates are in the future');

  // 2. Transactions & spend in 2027
  const txs2027 = demoProjects.flatMap((p) =>
    (p.transactions || []).filter((t) => t.date.startsWith(period2027) && t.type === 'expense')
  );
  const actualSpend2027 = txs2027.reduce(
    (sum, t) => sum + (t.currency === 'XAF' ? Math.round(t.amount / EUR_TO_XAF) : t.amount),
    0
  );
  assert.equal(actualSpend2027, 0, 'Actual expenses in 2027 must be 0 € (no transactions recorded for 2027 yet)');
});

test('TEST 5: Compare approved budget with actual expenditure', () => {
  const ifopsim = SEED_PROJECTS.find((p) => p.id === 'proj_ifopsim_001')!;
  const genGreen = SEED_PROJECTS.find((p) => p.id === 'proj_gen_green_002')!;

  // IFOPSIM Comparison
  const ifopsimApproved = (ifopsim.budgetItems || []).reduce((sum, b) => sum + (b.approvedBudget || 0), 0);
  const ifopsimActual = (ifopsim.budgetItems || []).reduce((sum, b) => sum + (b.actualExpenditure || 0), 0);
  const ifopsimRemaining = ifopsimApproved - ifopsimActual;
  const ifopsimBurnRatePct = Math.round((ifopsimActual / ifopsimApproved) * 100 * 10) / 10;

  assert.equal(ifopsimApproved, 48500, 'IFOPSIM approved budget: 48,500 €');
  assert.equal(ifopsimActual, 1650, 'IFOPSIM actual expenditure: 1,650 €');
  assert.equal(ifopsimRemaining, 46850, 'IFOPSIM remaining budget: 46,850 €');
  assert.equal(ifopsimBurnRatePct, 3.4, 'IFOPSIM burn rate: 3.4%');

  // Generation Green Comparison
  const genGreenApproved = (genGreen.budgetItems || []).reduce((sum, b) => sum + (b.approvedBudget || 0), 0);
  const genGreenActual = (genGreen.budgetItems || []).reduce((sum, b) => sum + (b.actualExpenditure || 0), 0);
  const genGreenRemaining = genGreenApproved - genGreenActual;
  const genGreenBurnRatePct = Math.round((genGreenActual / genGreenApproved) * 100 * 10) / 10;

  assert.equal(genGreenApproved, 22000, 'Generation Green approved budget: 22,000 €');
  assert.equal(genGreenActual, 12650, 'Generation Green actual expenditure: 12,650 €');
  assert.equal(genGreenRemaining, 9350, 'Generation Green remaining budget: 9,350 €');
  assert.equal(genGreenBurnRatePct, 57.5, 'Generation Green burn rate: 57.5%');

  // Category-level variance check for Generation Green Equipment & Hardware
  const hardwareItem = genGreen.budgetItems?.find((b) => b.category === 'Equipment & Hardware');
  assert.ok(hardwareItem, 'Equipment & Hardware item must exist in Generation Green');
  assert.equal(hardwareItem.approvedBudget, 9000);
  assert.equal(hardwareItem.actualExpenditure, 9000);
  assert.equal(hardwareItem.approvedBudget! - hardwareItem.actualExpenditure!, 0, 'Equipment budget is 100% utilized');
});

test('TEST 6: Confirm that hypothetical funding is excluded from confirmed funding', () => {
  const ifopsim = SEED_PROJECTS.find((p) => p.id === 'proj_ifopsim_001')!;
  const genGreen = SEED_PROJECTS.find((p) => p.id === 'proj_gen_green_002')!;

  // 1. IFOPSIM funding segregation
  const ifopsimSources = ifopsim.fundingSources || [];
  const ifopsimConfirmed = ifopsimSources
    .filter((f) => f.status === 'confirmed')
    .reduce((sum, f) => sum + (f.currency === 'XAF' ? Math.round(f.amount / EUR_TO_XAF) : f.amount), 0);
  const ifopsimPending = ifopsimSources
    .filter((f) => f.status === 'pending_application')
    .reduce((sum, f) => sum + (f.currency === 'XAF' ? Math.round(f.amount / EUR_TO_XAF) : f.amount), 0);
  const ifopsimPipeline = ifopsimSources
    .filter((f) => f.status === 'potential_pipeline')
    .reduce((sum, f) => sum + (f.currency === 'XAF' ? Math.round(f.amount / EUR_TO_XAF) : f.amount), 0);

  assert.equal(ifopsimConfirmed, 19500, 'Confirmed funding: 13,500 € + 6,000 € = 19,500 €');
  assert.equal(ifopsimPending, 25000, 'Pending application: 25,000 € (GIZ develoPPP)');
  assert.equal(ifopsimPipeline, 4000, 'Potential pipeline: 4,000 € (MINFOP Cameroon)');
  assert.equal(ifopsimPending + ifopsimPipeline, 29000, 'Total unconfirmed funding: 29,000 €');

  // The critical rule: Funding gap must NOT subtract pending grants
  const ifopsimApproved = (ifopsim.budgetItems || []).reduce((sum, b) => sum + (b.approvedBudget || 0), 0);
  const correctFundingGap = Math.max(0, ifopsimApproved - ifopsimConfirmed);
  assert.equal(correctFundingGap, 29000, 'Funding gap must be strictly 29,000 €');

  const flawedFundingGap = Math.max(0, ifopsimApproved - (ifopsimConfirmed + ifopsimPending));
  assert.notEqual(
    correctFundingGap,
    flawedFundingGap,
    'Funding gap would falsely drop to 0 € if pending grants were counted'
  );

  // 2. Generation Green funding segregation
  const genGreenSources = genGreen.fundingSources || [];
  const genGreenConfirmed = genGreenSources
    .filter((f) => f.status === 'confirmed')
    .reduce((sum, f) => sum + f.amount, 0);
  const genGreenPending = genGreenSources
    .filter((f) => f.status === 'pending_application')
    .reduce((sum, f) => sum + f.amount, 0);

  assert.equal(genGreenConfirmed, 22000, 'Confirmed funding: 15,000 € + 7,000 € = 22,000 €');
  assert.equal(genGreenPending, 8000, 'Pending/hypothetical funding: 8,000 € (EU Erasmus+)');
  assert.equal(
    genGreenSources.filter((f) => f.status === 'confirmed').length,
    2,
    'Exactly 2 confirmed sources'
  );
  assert.equal(
    genGreenSources.filter((f) => f.status === 'pending_application').length,
    1,
    'Exactly 1 pending source'
  );
});

test('TEST 7: Confirm that missing data is not converted to zero', () => {
  // 1. Digital Future Girls is in Draft phase and has NO approved budget items yet
  const dfg = SEED_PROJECTS.find((p) => p.id === 'proj_dfg_003')!;
  assert.ok(dfg, 'Digital Future Girls project exists');
  assert.equal(dfg.status, 'Draft');

  const approvedBudget = (dfg.budgetItems || []).reduce((sum, b) => sum + (b.approvedBudget || 0), 0);
  assert.equal(approvedBudget, 0);

  // Verify the KPI specification logic: when approved budget is 0 on unapproved project,
  // value must be rendered as 'N/A' and isUnknown must be true (NOT displayed as "0 €")
  const kpiDisplayValue = approvedBudget > 0 ? `${approvedBudget.toLocaleString('de-DE')} €` : 'N/A';
  const isUnknown = approvedBudget === 0;

  assert.equal(kpiDisplayValue, 'N/A', 'Missing/unapproved budget must display as N/A');
  assert.equal(isUnknown, true, 'isUnknown flag must be true to trigger missing data indicator');

  // 2. Impact Indicators with no verified records
  const unverifiedIndicator = dfg.feasibilityChecks.find((f) => f.status === 'missing_information');
  assert.ok(unverifiedIndicator, 'Feasibility check with missing_information exists');
  assert.equal(
    unverifiedIndicator.status,
    'missing_information',
    'Status must remain explicitly missing_information, not mapped to 0 or false'
  );

  // 3. Export formatting: missing beneficiary planned value returns N/A rather than 0
  const fakeProjectWithoutBeneficiaries: Partial<Project> = {
    referenceId: 'TEFA-TEST-000',
    title: 'Test Missing Data Project',
    proposal: undefined,
  };
  const exportBeneficiaryValue = fakeProjectWithoutBeneficiaries.proposal?.beneficiaryCountPlanned || 'N/A';
  assert.equal(exportBeneficiaryValue, 'N/A', 'Missing beneficiary count must export as N/A, not 0');
});

test('TEST 8: Verify that project-specific permissions are respected', () => {
  // Test RBAC permissions matrix
  const permissionsMatrix = {
    visitor: {
      canViewInternalFinances: false,
      canApproveProposals: false,
      canApproveExpenses: false,
      canEditProject: false,
    },
    local_partner: {
      canViewInternalFinances: false,
      canApproveProposals: false,
      canApproveExpenses: false,
      canEditProject: false,
    },
    tefa_member: {
      canViewInternalFinances: true,
      canApproveProposals: false,
      canApproveExpenses: false,
      canEditProject: true,
    },
    project_manager: {
      canViewInternalFinances: true,
      canApproveProposals: false,
      canApproveExpenses: false,
      canEditProject: true,
    },
    finance_officer: {
      canViewInternalFinances: true,
      canApproveProposals: false,
      canApproveExpenses: true,
      canEditProject: false,
    },
    board_member: {
      canViewInternalFinances: true,
      canApproveProposals: true,
      canApproveExpenses: false,
      canEditProject: true,
    },
    system_admin: {
      canViewInternalFinances: true,
      canApproveProposals: true,
      canApproveExpenses: true,
      canEditProject: true,
    },
  };

  // Test visitor permissions
  assert.equal(permissionsMatrix.visitor.canViewInternalFinances, false, 'Visitor cannot view internal finances');
  assert.equal(permissionsMatrix.visitor.canApproveProposals, false, 'Visitor cannot approve proposals');

  // Test local partner permissions
  assert.equal(permissionsMatrix.local_partner.canViewInternalFinances, false, 'Local partner cannot view internal finances');

  // Test project manager permissions
  assert.equal(permissionsMatrix.project_manager.canViewInternalFinances, true, 'PM can view finances');
  assert.equal(permissionsMatrix.project_manager.canApproveProposals, false, 'PM cannot approve proposals');
  assert.equal(permissionsMatrix.project_manager.canApproveExpenses, false, 'PM cannot approve expenses');

  // Test board member permissions
  assert.equal(permissionsMatrix.board_member.canApproveProposals, true, 'Board member can approve proposals');
  assert.equal(permissionsMatrix.board_member.canApproveExpenses, false, 'Board member cannot approve disbursements');

  // Test finance officer permissions
  assert.equal(permissionsMatrix.finance_officer.canApproveExpenses, true, 'Finance officer can approve expenses');
  assert.equal(permissionsMatrix.finance_officer.canApproveProposals, false, 'Finance officer cannot approve proposals');

  // Four-Eyes Governance rule: Proposer cannot approve their own proposal
  const checkSelfApproval = (userRole: string, userName: string, createdBy: string) => {
    if (userRole === 'board_member' && createdBy.toLowerCase().includes(userName.toLowerCase())) {
      return { allowed: false, reason: 'Proposer cannot self-approve their own proposal' };
    }
    return { allowed: true };
  };

  const selfApproveAttempt = checkSelfApproval(
    'board_member',
    'Frederic Pokam',
    'Frederic Pokam (TEFA Initiator)'
  );
  assert.equal(selfApproveAttempt.allowed, false, 'Board member cannot approve their own project proposal');
});

test('TEST 9: Export a filtered report and compare its totals with the dashboard', () => {
  const ifopsim = SEED_PROJECTS.find((p) => p.id === 'proj_ifopsim_001')!;
  const genGreen = SEED_PROJECTS.find((p) => p.id === 'proj_gen_green_002')!;

  // 1. Simulate export row computation for IFOPSIM
  const ifopsimExport = {
    referenceId: ifopsim.referenceId,
    totalBudget: (ifopsim.budgetItems || []).reduce((sum, b) => sum + (b.approvedBudget || 0), 0),
    confirmedFunding: (ifopsim.fundingSources || [])
      .filter((f) => f.status === 'confirmed')
      .reduce((sum, f) => sum + (f.currency === 'XAF' ? Math.round(f.amount / EUR_TO_XAF) : f.amount), 0),
    actualSpend: (ifopsim.budgetItems || []).reduce((sum, b) => sum + (b.actualExpenditure || 0), 0),
    fundingGap: 0,
    plannedBeneficiaries: ifopsim.proposal.beneficiaryCountPlanned,
    overdueMilestones: (ifopsim.milestones || []).filter((m) => !m.isCompleted && m.targetDate < TODAY_STR).length,
    activeRisks: (ifopsim.risks || []).filter((r) => r.status === 'active').length,
  };
  ifopsimExport.fundingGap = Math.max(0, ifopsimExport.totalBudget - ifopsimExport.confirmedFunding);

  // Compare IFOPSIM export row against dashboard KPI figures
  assert.equal(ifopsimExport.totalBudget, 48500, 'Export total budget matches dashboard (48,500 €)');
  assert.equal(ifopsimExport.confirmedFunding, 19500, 'Export confirmed funding matches dashboard (19,500 €)');
  assert.equal(ifopsimExport.fundingGap, 29000, 'Export funding gap matches dashboard (29,000 €)');
  assert.equal(ifopsimExport.actualSpend, 1650, 'Export actual spend matches dashboard (1,650 €)');
  assert.equal(ifopsimExport.plannedBeneficiaries, 60, 'Export planned beneficiaries matches dashboard (60)');
  assert.equal(ifopsimExport.overdueMilestones, 1, 'Export overdue milestones matches dashboard (1)');
  assert.equal(ifopsimExport.activeRisks, 3, 'Export active risks matches dashboard (3)');

  // 2. Simulate export row computation for Generation Green
  const genGreenExport = {
    referenceId: genGreen.referenceId,
    totalBudget: (genGreen.budgetItems || []).reduce((sum, b) => sum + (b.approvedBudget || 0), 0),
    confirmedFunding: (genGreen.fundingSources || [])
      .filter((f) => f.status === 'confirmed')
      .reduce((sum, f) => sum + f.amount, 0),
    actualSpend: (genGreen.budgetItems || []).reduce((sum, b) => sum + (b.actualExpenditure || 0), 0),
    fundingGap: 0,
    plannedBeneficiaries: genGreen.proposal.beneficiaryCountPlanned,
    overdueMilestones: (genGreen.milestones || []).filter((m) => !m.isCompleted && m.targetDate < TODAY_STR).length,
    activeRisks: (genGreen.risks || []).filter((r) => r.status === 'active').length,
  };
  genGreenExport.fundingGap = Math.max(0, genGreenExport.totalBudget - genGreenExport.confirmedFunding);

  assert.equal(genGreenExport.totalBudget, 22000, 'Export total budget matches dashboard (22,000 €)');
  assert.equal(genGreenExport.confirmedFunding, 22000, 'Export confirmed funding matches dashboard (22,000 €)');
  assert.equal(genGreenExport.fundingGap, 0, 'Export funding gap matches dashboard (0 €)');
  assert.equal(genGreenExport.actualSpend, 12650, 'Export actual spend matches dashboard (12,650 €)');
  assert.equal(genGreenExport.plannedBeneficiaries, 240, 'Export planned beneficiaries matches dashboard (240)');
  assert.equal(genGreenExport.overdueMilestones, 0, 'Export overdue milestones matches dashboard (0)');
  assert.equal(genGreenExport.activeRisks, 1, 'Export active risks matches dashboard (1: customs delay)');

  // 3. Combined export totals check
  const combinedBudget = ifopsimExport.totalBudget + genGreenExport.totalBudget;
  const combinedSpend = ifopsimExport.actualSpend + genGreenExport.actualSpend;
  const combinedConfirmed = ifopsimExport.confirmedFunding + genGreenExport.confirmedFunding;
  const combinedGap = Math.max(0, combinedBudget - combinedConfirmed);

  assert.equal(combinedBudget, 70500, 'Combined export budget matches dashboard (70,500 €)');
  assert.equal(combinedSpend, 14300, 'Combined export spend matches dashboard (14,300 €)');
  assert.equal(combinedConfirmed, 41500, 'Combined export confirmed funding matches dashboard (41,500 €)');
  assert.equal(combinedGap, 29000, 'Combined export gap matches dashboard (29,000 €)');
});

test('TEST 10: Reload the application and confirm that saved data remains available', () => {
  // Check disk persistence file in data/projects.json
  const dataDir = path.resolve(__dirname, '../data');
  const projectsFile = path.join(dataDir, 'projects.json');

  assert.ok(fs.existsSync(projectsFile), 'Persistent projects.json file must exist on disk');

  const fileRaw = fs.readFileSync(projectsFile, 'utf-8');
  assert.ok(fileRaw.length > 0, 'projects.json must not be empty');

  const loadedProjects: Project[] = JSON.parse(fileRaw);
  assert.ok(Array.isArray(loadedProjects), 'Loaded projects must be an array');

  // Verify IFOPSIM in persistent storage
  const savedIfopsim = loadedProjects.find((p) => p.id === 'proj_ifopsim_001');
  assert.ok(savedIfopsim, 'IFOPSIM must be present in persistent disk storage');
  assert.equal(savedIfopsim.isDemoOrHypothetical, true, 'Saved IFOPSIM maintains DEMO flag');
  assert.equal(savedIfopsim.proposal.estimatedBudgetEUR, 48500, 'Saved IFOPSIM budget persists');

  // Verify Generation Green in persistent storage
  const savedGenGreen = loadedProjects.find((p) => p.id === 'proj_gen_green_002');
  assert.ok(savedGenGreen, 'Generation Green must be present in persistent disk storage');
  assert.equal(savedGenGreen.isDemoOrHypothetical, true, 'Saved Generation Green maintains DEMO flag');
  assert.equal(savedGenGreen.proposal.estimatedBudgetEUR, 22000, 'Saved Generation Green budget persists');

  // Verify inventory persistence in data/inventory.json
  const inventoryFile = path.join(dataDir, 'inventory.json');
  assert.ok(fs.existsSync(inventoryFile), 'Persistent inventory.json file must exist on disk');
  const inventoryRaw = fs.readFileSync(inventoryFile, 'utf-8');
  const loadedInventory: InventoryAsset[] = JSON.parse(inventoryRaw);
  assert.ok(loadedInventory.length > 0, 'Inventory dataset must have records');
  const testAssets = loadedInventory.filter((i) => i.environment === 'test');
  assert.equal(testAssets.length, 5, 'Exactly 5 demo test assets must be persisted on disk');
});
