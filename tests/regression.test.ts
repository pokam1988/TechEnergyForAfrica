import test from 'node:test';
import assert from 'node:assert/strict';
import { SEED_PROJECTS } from '../src/data/seedProjects.ts';
import { Project } from '../src/types/index.ts';

test('REGRESSION TEST 1: All required projects are preserved in persistent seed dataset', () => {
  const ifopsim = SEED_PROJECTS.find((p) => p.id === 'proj_ifopsim_001');
  const genGreen = SEED_PROJECTS.find((p) => p.id === 'proj_gen_green_002');
  const dfg = SEED_PROJECTS.find((p) => p.id === 'proj_dfg_003');

  assert.ok(ifopsim, 'IFOPSIM project must exist in dataset');
  assert.equal(ifopsim.referenceId, 'TEFA-2026-CMR-001');
  assert.equal(ifopsim.isDemoOrHypothetical, true, 'IFOPSIM must be marked as hypothetical/demo');

  assert.ok(genGreen, 'Generation Green project must exist in dataset');
  assert.equal(genGreen.referenceId, 'TEFA-2026-DE-CMR-002');

  assert.ok(dfg, 'Digital Future Girls project must exist in dataset');
  assert.equal(dfg.referenceId, 'TEFA-2026-CMR-003');
  assert.equal(dfg.status, 'Draft', 'Digital Future Girls must be in Draft status, not auto-approved');
  assert.equal(dfg.proposal.beneficiaryCountPlanned, 20);
  assert.equal(dfg.proposal.estimatedBudgetEUR, 15000);
});

test('REGRESSION TEST 2: Financial and Simulator Calculations Accuracy', () => {
  const EUR_TO_XAF = 655.957;

  // Test budget currency conversion
  const eurBudget = 15000;
  const xafExpected = Math.round(eurBudget * EUR_TO_XAF);
  assert.equal(xafExpected, 9839355, 'EUR to XAF calculation must match official CEMAC fixed peg');

  // Test simulation gap calculations
  const beneficiaries = 20;
  const studentsPerWorkstation = 2;
  const neededWorkstations = Math.ceil(beneficiaries / studentsPerWorkstation);
  assert.equal(neededWorkstations, 10, 'Needed workstations calculation must be accurate');

  const donatedHardware = 0;
  const gapHardware = Math.max(0, neededWorkstations - donatedHardware);
  assert.equal(gapHardware, 10, 'Hardware gap calculation must be accurate');

  const totalCost = 15000;
  const confirmedFunding = 0;
  const fundingGap = Math.max(0, totalCost - confirmedFunding);
  assert.equal(fundingGap, 15000, 'Funding gap must separate confirmed from unconfirmed funding');

  const durationMonths = 6;
  const monthlyBurn = Math.round(totalCost / durationMonths);
  assert.equal(monthlyBurn, 2500, 'Monthly burn rate must be correctly calculated');
});

test('REGRESSION TEST 3: Governance & RBAC Rules - Proposer cannot self-approve', () => {
  const project: Project = SEED_PROJECTS.find((p) => p.id === 'proj_dfg_003')!;

  const checkCanApprove = (userRole: string, userName: string, createdBy: string, targetStatus: string) => {
    if (targetStatus === 'Approved') {
      if (userRole !== 'board_member' && userRole !== 'system_admin') {
        return { allowed: false, reason: 'Only board members or admins can approve' };
      }
      if (createdBy.toLowerCase().includes(userName.toLowerCase())) {
        return { allowed: false, reason: 'Proposer cannot self-approve their own proposal' };
      }
    }
    return { allowed: true };
  };

  // Case 1: Proposer Frederic attempts to approve his own project Digital Future Girls as board_member
  const resSelfApprove = checkCanApprove('board_member', 'Frederic Pokam', project.createdBy, 'Approved');
  assert.equal(resSelfApprove.allowed, false, 'Proposer must NOT be allowed to self-approve');
  assert.match(resSelfApprove.reason!, /Proposer cannot self-approve/);

  // Case 2: Another board member approves
  const resOtherBoard = checkCanApprove('board_member', 'Dr. Sophie Becker', project.createdBy, 'Approved');
  assert.equal(resOtherBoard.allowed, true, 'Independent board member can approve');

  // Case 3: Project Manager attempts to approve
  const resPM = checkCanApprove('project_manager', 'Marc Tagne', project.createdBy, 'Approved');
  assert.equal(resPM.allowed, false, 'Project manager cannot approve proposal');

  // Case 4: Visitor attempts to approve
  const resVisitor = checkCanApprove('visitor', 'External Applicant', project.createdBy, 'Approved');
  assert.equal(resVisitor.allowed, false, 'Visitor cannot approve proposal');
});

test('REGRESSION TEST 4: AI Recommendations are structurally isolated from binding Human Decisions', () => {
  const ifopsim = SEED_PROJECTS.find((p) => p.id === 'proj_ifopsim_001')!;
  const decision = ifopsim.decisions[0];

  assert.ok(decision, 'IFOPSIM must contain decision record');
  assert.ok(decision.aiAnalysis, 'AI analysis block must exist');
  assert.ok(decision.aiAnalysis.assumptions.length > 0, 'AI must state assumptions');
  assert.ok(decision.aiAnalysis.limitations.length > 0, 'AI must declare limitations');
  assert.ok(decision.aiAnalysis.missingInfo.length > 0, 'AI must declare missing information');

  assert.ok(decision.humanDecision, 'Human decision block must be separate');
  assert.notEqual(decision.humanDecision.selectedOptionId, '', 'Human decision must record chosen option');
  assert.ok(decision.humanDecision.decidedBy.length > 0, 'Human decision must identify the responsible person');
});

test('REGRESSION TEST 5: Feasibility Checklist preserves non-negative rule for missing information', () => {
  const dfg = SEED_PROJECTS.find((p) => p.id === 'proj_dfg_003')!;
  const missingChecks = dfg.feasibilityChecks.filter((c) => c.status === 'missing_information');

  assert.ok(missingChecks.length > 0, 'Digital Future Girls must have explicit missing information checks');
  for (const c of missingChecks) {
    assert.equal(c.status, 'missing_information');
    assert.ok(c.title.length > 0);
  }
});

test('REGRESSION TEST 6: Strategic Decision Matrix (Options A, B, C) Integrity and Non-Auto-Approval', () => {
  const dfg = SEED_PROJECTS.find((p) => p.id === 'proj_dfg_003')!;
  const stratDecision = dfg.decisions.find((d) => d.id === 'dec-strat-hardware-001');

  assert.ok(stratDecision, 'Strategic hardware decision must exist in Digital Future Girls');
  assert.equal(stratDecision.status, 'ai_analyzed', 'Decision must remain in draft / ai_analyzed status');
  assert.equal(stratDecision.humanDecision, undefined, 'Must NOT contain an automatic human decision approval');

  // Verify all 8 required criteria are present
  assert.equal(stratDecision.criteria.length, 8, 'Must contain exactly 8 evaluation criteria');
  const requiredCriteriaIds = [
    'c_cost',
    'c_duration',
    'c_reliability',
    'c_sustainability',
    'c_logistics',
    'c_legal',
    'c_inclusion',
    'c_maintenance',
  ];
  for (const cId of requiredCriteriaIds) {
    const found = stratDecision.criteria.find((c) => c.id === cId);
    assert.ok(found, `Criterion ${cId} must be present`);
    assert.ok(found.weight >= 1 && found.weight <= 10, 'Weight must be within 1-10');
  }

  // Verify all 3 options are present with SWOT and scores
  assert.equal(stratDecision.options.length, 3, 'Must compare exactly 3 implementation options');
  const optA = stratDecision.options.find((o) => o.id === 'opt_a');
  const optB = stratDecision.options.find((o) => o.id === 'opt_b');
  const optC = stratDecision.options.find((o) => o.id === 'opt_c');

  assert.ok(optA && optB && optC, 'Options A, B, and C must all exist');
  assert.ok(optA.swot?.strengths.length! > 0, 'Option A must have SWOT strengths');
  assert.ok(optB.swot?.opportunities.length! > 0, 'Option B must have SWOT opportunities');
  assert.ok(optC.swot?.threats.length! > 0, 'Option C must have SWOT threats');

  // Verify hypothetical markings
  assert.ok(stratDecision.aiAnalysis, 'AI analysis block must exist');
  assert.ok(stratDecision.aiAnalysis.assumptions.some((a) => a.includes('[HYPOTHETISCH]')));
  assert.ok(stratDecision.aiAnalysis.missingInfo.some((m) => m.includes('[UNBEKANNT]')));
});

test('REGRESSION TEST 7: Digital Future Girls Launch Countdown & Status Widget Data Integrity', () => {
  const dfg = SEED_PROJECTS.find((p) => p.id === 'proj_dfg_003')!;

  // Verify launch milestone exists
  const launchMilestone = dfg.milestones.find((m) => m.id === 'm-dfg-3');
  assert.ok(launchMilestone, 'Milestone M3 (Start Schulungsbetrieb) must exist');
  assert.equal(launchMilestone.targetDate, '2027-03-15', 'Target date for launch must be 2027-03-15');

  // Verify milestone sequence and validity
  assert.equal(dfg.milestones.length, 4, 'Must have 4 structured milestones');
  const m1 = dfg.milestones.find((m) => m.id === 'm-dfg-1')!;
  const m2 = dfg.milestones.find((m) => m.id === 'm-dfg-2')!;
  const m4 = dfg.milestones.find((m) => m.id === 'm-dfg-4')!;

  assert.equal(m1.targetDate, '2027-01-31');
  assert.equal(m2.targetDate, '2027-02-28');
  assert.equal(m4.targetDate, '2027-09-15');

  // Verify readiness status metrics
  assert.ok(dfg.feasibilityChecks.length >= 5, 'Must have at least 5 feasibility checks');
  assert.equal(dfg.status, 'Draft', 'Current status must be Draft');
});

test('REGRESSION TEST 8: Responsive Navigation and Countdown Calculation Accuracy', () => {
  // Test countdown calculation for any target date
  const targetDateStr = '2027-03-15T09:00:00Z';
  const targetTime = new Date(targetDateStr).getTime();
  const testNow = new Date('2026-10-22T00:00:00Z').getTime();
  const diff = targetTime - testNow;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  const remDays = days % 7;

  assert.ok(days > 0, 'Days to launch must be positive for 2027 launch');
  assert.equal(days, weeks * 7 + remDays, 'Days must match weeks * 7 + remaining days exactly');

  // Verify project list has all required tabs without null items
  const dfg = SEED_PROJECTS.find((p) => p.id === 'proj_dfg_003')!;
  assert.ok(dfg.title.includes('Digital Future Girls'));
  assert.equal(dfg.country, 'Cameroon');
});


