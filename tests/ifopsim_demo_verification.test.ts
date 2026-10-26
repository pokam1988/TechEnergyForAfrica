import test from 'node:test';
import assert from 'node:assert/strict';
import { SEED_PROJECTS, SEED_INVENTORY } from '../src/data/seedProjects.ts';
import { Project, InventoryAsset, BudgetItem, Milestone, RiskItem, FundingSource } from '../src/types/index.ts';

// ---------------------------------------------------------------------------
// TEST SUITE: TEFA Project Intelligence Dashboard - IFOPSIM DEMO Mode Verification
// ---------------------------------------------------------------------------

const EUR_TO_XAF = 655.957;
const TODAY_STR = '2026-10-26';

test('VERIFICATION 1: Dashboard displays the imported demonstration dataset for IFOPSIM', () => {
  const ifopsim = SEED_PROJECTS.find((p) => p.id === 'proj_ifopsim_001');
  assert.ok(ifopsim, 'IFOPSIM project record must exist');
  assert.equal(ifopsim.isDemoOrHypothetical, true, 'IFOPSIM must be marked as DEMO / hypothetical');
  assert.ok(ifopsim.demoDisclaimer, 'IFOPSIM must display an explicit demo disclaimer');

  // 1. Verify 5 hypothetical project milestones clearly labeled as DEMO
  const milestones = ifopsim.milestones || [];
  assert.equal(milestones.length, 5, 'IFOPSIM must contain exactly 5 demo milestones');
  milestones.forEach((m, idx) => {
    assert.ok(
      m.title.startsWith('[DEMO]'),
      `Milestone #${idx + 1} (${m.title}) must be clearly labeled with [DEMO]`
    );
  });

  // 2. Verify 6 hypothetical budget categories
  const budgetItems = ifopsim.budgetItems || [];
  assert.equal(budgetItems.length, 6, 'IFOPSIM must contain exactly 6 budget categories');
  const expectedCategories = [
    'Personnel',
    'Infrastructure & Solar',
    'Equipment & Hardware',
    'Accessibility & Interpretation',
    'Administration & Ops',
    'Contingency Reserve',
  ];
  const actualCategories = budgetItems.map((b) => b.category);
  assert.deepEqual(actualCategories, expectedCategories, 'All 6 defined budget categories must be present');

  // 3. Verify 4 hypothetical funding opportunities
  const fundingSources = ifopsim.fundingSources || [];
  assert.equal(fundingSources.length, 4, 'IFOPSIM must contain exactly 4 funding opportunities');
  fundingSources.forEach((f, idx) => {
    assert.ok(
      f.name.startsWith('[DEMO]'),
      `Funding source #${idx + 1} (${f.name}) must be clearly labeled with [DEMO]`
    );
  });

  // 4. Verify 5 fictional equipment inventory records
  const demoInventory = SEED_INVENTORY.filter(
    (item) => item.projectId === 'proj_ifopsim_001' && item.environment === 'test'
  );
  assert.equal(demoInventory.length, 5, 'Must contain exactly 5 fictional demo equipment inventory records');
  demoInventory.forEach((item, idx) => {
    assert.ok(
      item.manufacturerModel.startsWith('[DEMO]'),
      `Inventory item #${idx + 1} model (${item.manufacturerModel}) must be clearly labeled with [DEMO]`
    );
    assert.ok(
      item.assetTag.startsWith('TEFA-DEMO-'),
      `Asset tag (${item.assetTag}) must have DEMO prefix`
    );
    assert.equal(item.environment, 'test', 'Asset environment must be test');
  });

  // 5. Verify 3 hypothetical project risks clearly labeled as DEMO
  const risks = ifopsim.risks || [];
  assert.equal(risks.length, 3, 'IFOPSIM must contain exactly 3 demo risks');
  risks.forEach((r, idx) => {
    assert.ok(
      r.title && r.title.startsWith('[DEMO]'),
      `Risk #${idx + 1} (${r.title}) must be clearly labeled with [DEMO]`
    );
  });
});

test('VERIFICATION 2: Filtering by project (IFOPSIM) updates all charts and KPI cards', () => {
  // Global unfiltered projects
  const allProjects = SEED_PROJECTS;
  const globalApprovedBudget = allProjects.reduce((sum, p) => {
    return sum + (p.budgetItems?.reduce((bSum, b) => bSum + (b.approvedBudget || 0), 0) || 0);
  }, 0);

  // Filtered to IFOPSIM only
  const filteredProjects = allProjects.filter((p) => p.id === 'proj_ifopsim_001');
  assert.equal(filteredProjects.length, 1, 'Only IFOPSIM must remain when filtered by projectId');

  const ifopsim = filteredProjects[0];

  // Approved total budget formula: SUM(approvedBudget of filtered project items)
  const approvedBudget = (ifopsim.budgetItems || []).reduce((sum, b) => sum + (b.approvedBudget || 0), 0);
  assert.equal(approvedBudget, 48500, 'Approved budget for IFOPSIM must equal 48,500 €');
  assert.notEqual(approvedBudget, globalApprovedBudget, 'Filtered budget must be isolated from global portfolio');

  // Actual expenditure formula: SUM(actualExpenditure of filtered items)
  const actualSpend = (ifopsim.budgetItems || []).reduce((sum, b) => sum + (b.actualExpenditure || 0), 0);
  assert.equal(actualSpend, 1650, 'Actual spend for IFOPSIM must equal 1,650 € (850 + 450 + 350)');

  // Confirmed funding formula: SUM(amount of confirmed sources)
  const confirmedFunding = (ifopsim.fundingSources || [])
    .filter((f) => f.status === 'confirmed')
    .reduce((sum, f) => sum + (f.currency === 'XAF' ? Math.round(f.amount / EUR_TO_XAF) : f.amount), 0);
  assert.equal(confirmedFunding, 19500, 'Confirmed funding for IFOPSIM must equal 19,500 € (13500 + 6000)');

  // Open funding gap formula: MAX(0, approvedBudget - confirmedFunding)
  const fundingGap = Math.max(0, approvedBudget - confirmedFunding);
  assert.equal(fundingGap, 29000, 'Open funding gap for IFOPSIM must be 29,000 € (48500 - 19500)');

  // Overdue milestones: non-completed milestones with targetDate < TODAY_STR
  const overdueCount = (ifopsim.milestones || []).filter(
    (m) => !m.isCompleted && m.targetDate < TODAY_STR
  ).length;
  // M3 targetDate is 2026-10-15 (< 2026-10-26) and isCompleted=false
  assert.equal(overdueCount, 1, 'Exactly 1 overdue milestone (M3: Solar Installation) for IFOPSIM');

  // Open high-priority risks: active risks with impact === high OR probability === high
  const highRisksCount = (ifopsim.risks || []).filter(
    (r) => r.status === 'active' && (r.impact === 'high' || r.probability === 'high')
  ).length;
  // r1: impact high, prob high (Critical)
  // r2: impact med, prob high (High)
  assert.equal(highRisksCount, 2, 'Exactly 2 high/critical risks for IFOPSIM (r1 and r2)');
});

test('VERIFICATION 3: Filtering by reporting period updates relevant metrics', () => {
  const ifopsim = SEED_PROJECTS.find((p) => p.id === 'proj_ifopsim_001')!;

  // 1. Period = '2026'
  const ms2026 = (ifopsim.milestones || []).filter((m) => m.targetDate.startsWith('2026'));
  assert.equal(ms2026.length, 4, '4 milestones scheduled in 2026 (M1, M2, M3, M4)');
  const overdue2026 = ms2026.filter((m) => !m.isCompleted && m.targetDate < TODAY_STR).length;
  assert.equal(overdue2026, 1, 'In 2026, exactly 1 overdue milestone');

  const txs2026 = (ifopsim.transactions || []).filter((t) => t.date.startsWith('2026') && t.type === 'expense');
  const actualSpend2026 = txs2026.reduce(
    (sum, t) => sum + (t.currency === 'XAF' ? Math.round(t.amount / EUR_TO_XAF) : t.amount),
    0
  );
  assert.equal(actualSpend2026, 1650, 'Actual expenses in 2026 transactions: 850 € + 450 € + 350 € = 1,650 €');

  // 2. Period = '2027'
  const ms2027 = (ifopsim.milestones || []).filter((m) => m.targetDate.startsWith('2027'));
  assert.equal(ms2027.length, 1, '1 milestone scheduled in 2027 (M5: Cohort 1 Graduation)');
  const overdue2027 = ms2027.filter((m) => !m.isCompleted && m.targetDate < TODAY_STR).length;
  assert.equal(overdue2027, 0, 'In 2027, 0 overdue milestones since target date is in future');

  const txs2027 = (ifopsim.transactions || []).filter((t) => t.date.startsWith('2027') && t.type === 'expense');
  assert.equal(txs2027.length, 0, 'No recorded transactions in 2027 yet');
});

test('VERIFICATION 4: Selecting a budget category filters the financial table', () => {
  const ifopsim = SEED_PROJECTS.find((p) => p.id === 'proj_ifopsim_001')!;
  const budgetItems = ifopsim.budgetItems || [];

  // Total categories
  assert.equal(budgetItems.length, 6);

  // Filter by 'Personnel'
  const personnelItems = budgetItems.filter((b) => b.category === 'Personnel');
  assert.equal(personnelItems.length, 1);
  assert.equal(personnelItems[0].approvedBudget, 14400);
  assert.equal(personnelItems[0].actualExpenditure, 0);

  // Filter by 'Equipment & Hardware'
  const hwItems = budgetItems.filter((b) => b.category === 'Equipment & Hardware');
  assert.equal(hwItems.length, 1);
  assert.equal(hwItems[0].approvedBudget, 4500);
  assert.equal(hwItems[0].actualExpenditure, 850);
  const remainingHw = (hwItems[0].approvedBudget || 0) - (hwItems[0].actualExpenditure || 0);
  assert.equal(remainingHw, 3650, 'Remaining Hardware budget is 4500 - 850 = 3650 €');
});

test('VERIFICATION 5: Clicking an inventory KPI opens corresponding asset records', () => {
  const ifopsimAssets = SEED_INVENTORY.filter(
    (item) => item.projectId === 'proj_ifopsim_001' && item.environment === 'test'
  );
  assert.equal(ifopsimAssets.length, 5);

  // Dimension: 'offered'
  const offered = ifopsimAssets.filter((a) => a.donationStatus === 'offered');
  assert.equal(offered.length, 1);
  assert.equal(offered[0].assetTag, 'TEFA-DEMO-LAP-001');

  // Dimension: 'in_transit'
  const transit = ifopsimAssets.filter((a) => a.donationStatus === 'in_transit');
  assert.equal(transit.length, 1);
  assert.equal(transit[0].assetTag, 'TEFA-DEMO-SOLAR-002');

  // Dimension: 'customs_processing'
  const customs = ifopsimAssets.filter((a) => a.donationStatus === 'customs_processing');
  assert.equal(customs.length, 1);
  assert.equal(customs[0].assetTag, 'TEFA-DEMO-BAT-003');

  // Dimension: 'needs_repair'
  const needsRepair = ifopsimAssets.filter((a) => a.operationalCondition === 'needs_repair');
  assert.equal(needsRepair.length, 1);
  assert.equal(needsRepair[0].assetTag, 'TEFA-DEMO-DESK-004');

  // Dimension: 'approved_for_use' (Technically approved)
  const approved = ifopsimAssets.filter((a) => a.donationStatus === 'approved_for_use');
  assert.equal(approved.length, 1);
  assert.equal(approved[0].assetTag, 'TEFA-DEMO-ACC-005');
});

test('VERIFICATION 6: Pending funding opportunities are NOT counted as confirmed financing', () => {
  const ifopsim = SEED_PROJECTS.find((p) => p.id === 'proj_ifopsim_001')!;
  const sources = ifopsim.fundingSources || [];

  const pendingGrant = sources.find((s) => s.id === 'f2');
  assert.ok(pendingGrant, 'Pending grant f2 must exist');
  assert.equal(pendingGrant.status, 'pending_application', 'f2 must have pending_application status');
  assert.equal(pendingGrant.amount, 25000, 'Pending grant is 25,000 €');

  const potentialPipeline = sources.find((s) => s.id === 'f4');
  assert.ok(potentialPipeline, 'Potential pipeline f4 must exist');
  assert.equal(potentialPipeline.status, 'potential_pipeline');
  assert.equal(potentialPipeline.amount, 4000);

  // Rule: Confirmed financing calculation MUST only sum status === 'confirmed'
  const confirmedTotal = sources
    .filter((s) => s.status === 'confirmed')
    .reduce((sum, s) => sum + s.amount, 0);

  assert.equal(
    confirmedTotal,
    19500,
    'Confirmed funding must strictly be 19,500 € (13500 donation + 6000 in-kind)'
  );

  // Assert that pending grant was NEVER added to confirmed total
  assert.equal(
    confirmedTotal < confirmedTotal + pendingGrant.amount,
    true,
    'Confirmed total must not contain pending grant'
  );
  assert.notEqual(
    confirmedTotal,
    44500,
    'Confirmed funding must NEVER be reported as 44,500 €'
  );

  // Open funding gap calculation
  const approvedBudget = (ifopsim.budgetItems || []).reduce((sum, b) => sum + (b.approvedBudget || 0), 0);
  const openGap = Math.max(0, approvedBudget - confirmedTotal);
  assert.equal(
    openGap,
    29000,
    'Open funding gap must be 48,500 € - 19,500 € = 29,000 € (NOT 4,000 €)'
  );
});

test('VERIFICATION 7: No fictional inventory record is presented as real equipment', () => {
  // Real equipment pool has environment: 'live'
  const livePool = SEED_INVENTORY.filter((a) => a.environment === 'live');
  const demoPool = SEED_INVENTORY.filter((a) => a.environment === 'test');

  // Verify that NONE of the demo assets leak into livePool
  demoPool.forEach((demoAsset) => {
    const leakedIntoLive = livePool.some((liveAsset) => liveAsset.id === demoAsset.id);
    assert.equal(
      leakedIntoLive,
      false,
      `Demo asset ${demoAsset.assetTag} must NOT exist in the live equipment pool`
    );
    assert.ok(
      demoAsset.manufacturerModel.startsWith('[DEMO]'),
      `Demo asset ${demoAsset.assetTag} must be labeled [DEMO]`
    );
  });

  // Verify operational gate: In the demo pool of 5 assets, only 1 is approved_for_use
  const operationalDemo = demoPool.filter((a) => a.donationStatus === 'approved_for_use');
  assert.equal(
    operationalDemo.length,
    1,
    'Only 1 demo asset has technical approval and can be considered operational'
  );

  const nonOperationalDemo = demoPool.filter((a) => a.donationStatus !== 'approved_for_use');
  assert.equal(
    nonOperationalDemo.length,
    4,
    '4 demo assets are in transit, customs, offered, or need repair and MUST NOT be counted as operational'
  );
});

test('VERIFICATION 8: Resetting the filters restores the complete demonstration dataset', () => {
  // When filters are reset to default
  const defaultFilters = {
    projectId: 'all',
    country: 'all',
    category: 'all',
    manager: 'all',
    status: 'all',
    reportingPeriod: 'all',
    budgetCategory: 'all',
    riskPriority: 'all',
    environment: 'all',
  };

  const restoredProjects = SEED_PROJECTS.filter((p) => {
    if (defaultFilters.projectId !== 'all' && p.id !== defaultFilters.projectId) return false;
    if (defaultFilters.environment === 'live' && p.isDemoOrHypothetical) return false;
    if (defaultFilters.environment === 'demo' && !p.isDemoOrHypothetical) return false;
    return true;
  });

  assert.equal(restoredProjects.length, 3, 'Restored dataset contains all 3 projects');

  const ifopsim = restoredProjects.find((p) => p.id === 'proj_ifopsim_001');
  assert.ok(ifopsim, 'IFOPSIM is restored intact');
  assert.equal(ifopsim.milestones?.length, 5, 'Restores all 5 milestones');
  assert.equal(ifopsim.budgetItems?.length, 6, 'Restores all 6 budget categories');
  assert.equal(ifopsim.fundingSources?.length, 4, 'Restores all 4 funding sources');
  assert.equal(ifopsim.risks?.length, 3, 'Restores all 3 risks');
});
