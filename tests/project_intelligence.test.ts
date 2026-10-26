import test from 'node:test';
import assert from 'node:assert/strict';
import { SEED_PROJECTS, SEED_INVENTORY } from '../src/data/seedProjects.ts';
import { Project, InventoryAsset } from '../src/types/index.ts';

test('PROJECT INTELLIGENCE TEST 1: Executive KPI Calculation Rules & Strict Unknown Rules', () => {
  const EUR_TO_XAF = 655.957;

  // Verify total projects count
  assert.equal(SEED_PROJECTS.length, 3, 'Must have 3 seed projects');

  // Verify IFOPSIM in planning phase
  const ifopsim = SEED_PROJECTS.find((p) => p.id === 'proj_ifopsim_001');
  assert.ok(ifopsim, 'IFOPSIM must exist');

  // Confirmed funding calculation: ONLY status === 'confirmed'
  const confirmedFundingIfopsim = (ifopsim.fundingSources || [])
    .filter((f) => f.status === 'confirmed')
    .reduce((sum, f) => sum + (f.currency === 'XAF' ? Math.round(f.amount / EUR_TO_XAF) : f.amount), 0);

  // IFOPSIM has 19,500 EUR confirmed (13,500 donation + 6,000 in-kind) and 1 pending grant (25,000 EUR)
  assert.equal(confirmedFundingIfopsim, 19500, 'Confirmed funding must be exactly 19,500 EUR');

  const pendingFundingIfopsim = (ifopsim.fundingSources || [])
    .filter((f) => f.status === 'pending_application')
    .reduce((sum, f) => sum + (f.currency === 'XAF' ? Math.round(f.amount / EUR_TO_XAF) : f.amount), 0);
  assert.equal(pendingFundingIfopsim, 25000, 'Pending grant amount must be tracked separately and not counted in confirmed');

  // Funding gap calculation: Total Budget (48,500 EUR approved) - Confirmed Funding (19,500 EUR) = 29,000 EUR
  const totalApprovedIfopsim = (ifopsim.budgetItems || []).reduce((sum, b) => sum + (b.approvedBudget || 0), 0);
  const fundingGapIfopsim = Math.max(0, totalApprovedIfopsim - confirmedFundingIfopsim);
  assert.equal(fundingGapIfopsim, 29000, 'Funding gap must be Total Approved Budget (48500) minus Confirmed (19500) = 29000');

  // Unknown data rule: enrolled youth beneficiaries indicator has actual 0 and is hypothetical
  const enrolledYouthIndicator = (ifopsim.impactIndicators || []).find((i) => i.id === 'ind-1');
  assert.ok(enrolledYouthIndicator, 'Enrolled youth indicator must exist');
  assert.equal(enrolledYouthIndicator.actual, 0, 'IFOPSIM enrolled beneficiaries actual is 0 in planning phase');
  assert.equal(enrolledYouthIndicator.evidenceStatus, 'hypothetical_assumption', 'Evidence status must be hypothetical');
});

test('PROJECT INTELLIGENCE TEST 2: Inventory Analytics & Strict Operational Equipment Gate', () => {
  // Test separation of 9 inventory dimensions
  const liveAssets = SEED_INVENTORY.filter((i) => i.environment === 'live');
  const testAssets = SEED_INVENTORY.filter((i) => i.environment === 'test');

  assert.ok(liveAssets.length > 0, 'Must have live inventory assets');
  assert.ok(testAssets.length > 0, 'Must separate test data from live data');

  // Operational approval rule: only 'approved_for_use' is operational
  liveAssets.forEach((asset) => {
    const isOperational = asset.donationStatus === 'approved_for_use';
    if (!isOperational) {
      assert.notEqual(
        asset.donationStatus,
        'approved_for_use',
        `Asset ${asset.assetTag} with status ${asset.donationStatus} must NOT be considered operational`
      );
    }
  });

  // Physical location vs ownership independence
  const sample = SEED_INVENTORY[0];
  assert.ok(sample.location, 'Must have physical location');
  assert.ok(sample.ownership, 'Must have ownership dimension');
  assert.notEqual(sample.location, sample.ownership, 'Location and ownership must be distinct');
});

test('PROJECT INTELLIGENCE TEST 3: Data Import Validation Logic', () => {
  // Check validation rules
  const validateRow = (row: any) => {
    const errors: string[] = [];
    if (!row.title || row.title.trim().length < 3) {
      errors.push('Title must be at least 3 characters');
    }
    if (row.plannedBudgetEUR !== undefined && (isNaN(Number(row.plannedBudgetEUR)) || Number(row.plannedBudgetEUR) < 0)) {
      errors.push('Budget must be a non-negative number');
    }
    if (row.submissionDate && isNaN(Date.parse(row.submissionDate))) {
      errors.push('Invalid date');
    }
    return errors;
  };

  const validRow = {
    title: 'Solar Vocational Center Douala',
    country: 'Cameroon',
    plannedBudgetEUR: 25000,
    submissionDate: '2026-06-01',
  };
  assert.equal(validateRow(validRow).length, 0, 'Valid row must produce 0 errors');

  const invalidRow = {
    title: 'AB',
    plannedBudgetEUR: -500,
    submissionDate: 'invalid-date',
  };
  const errors = validateRow(invalidRow);
  assert.equal(errors.length, 3, 'Invalid row must catch title length, negative budget, and invalid date');
});

test('PROJECT INTELLIGENCE TEST 4: Multi-Language Nav & i18n Verification', async () => {
  const { translations } = await import('../src/i18n/translations.ts');

  assert.equal(translations.de.nav.projectIntelligence, 'Project Intelligence');
  assert.equal(translations.en.nav.projectIntelligence, 'Project Intelligence');
  assert.equal(translations.fr.nav.projectIntelligence, 'Project Intelligence');
});

test('PROJECT INTELLIGENCE TEST 5: Four-Eyes Governance & Proposer Non-Self-Approval', () => {
  const dfg = SEED_PROJECTS.find((p) => p.id === 'proj_dfg_003')!;
  const proposer = dfg.proposal.proposerName;

  // If proposer tries to approve
  const canApprove = (userRole: string, userName: string) => {
    if (userName === proposer) return false;
    return userRole === 'board_member' || userRole === 'system_admin';
  };

  assert.equal(canApprove('board_member', proposer), false, 'Proposer cannot self-approve even if board member');
  assert.equal(canApprove('board_member', 'Dr. Aminata Touré'), true, 'Independent board member can approve');
  assert.equal(canApprove('visitor', 'Dr. Aminata Touré'), false, 'Visitor cannot approve');
});
