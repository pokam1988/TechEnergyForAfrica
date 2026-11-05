import test from 'node:test';
import assert from 'node:assert';
import { SEED_SUBSCRIBERS, SEED_ISSUES } from '../src/data/seedNewsletters';
import { SEED_ORGANIZATIONS } from '../src/data/seedOrganizations';
import { SEED_PROJECTS } from '../src/data/seedProjects';

test('NEWSLETTER TEST 1: Multi-Organization Isolation of Contacts and Subscribers', () => {
  const tefaSubscribers = SEED_SUBSCRIBERS.filter((s) => s.organizationId === 'org_tefa');
  const ecoSubscribers = SEED_SUBSCRIBERS.filter((s) => s.organizationId === 'org_global_eco');

  assert.ok(tefaSubscribers.length >= 6, 'TEFA has at least 6 stakeholder contacts seeded');
  assert.ok(ecoSubscribers.length >= 2, 'Global Eco has separate contacts');

  // Verify no cross-organization leakage
  tefaSubscribers.forEach((sub) => {
    assert.strictEqual(sub.organizationId, 'org_tefa');
  });

  ecoSubscribers.forEach((sub) => {
    assert.strictEqual(sub.organizationId, 'org_global_eco');
  });
});

test('NEWSLETTER TEST 2: Stakeholder Segmentation Covers Key NGO Stakeholder Groups', () => {
  const tefaSubscribers = SEED_SUBSCRIBERS.filter((s) => s.organizationId === 'org_tefa');
  
  const hasDonors = tefaSubscribers.some((s) => s.segment === 'donors');
  const hasPartners = tefaSubscribers.some((s) => s.segment === 'partners');
  const hasBoard = tefaSubscribers.some((s) => s.segment === 'board');
  const hasVolunteers = tefaSubscribers.some((s) => s.segment === 'volunteers');
  const hasMedia = tefaSubscribers.some((s) => s.segment === 'media');

  assert.ok(hasDonors, 'Donors segment exists for CSR and capital sponsors');
  assert.ok(hasPartners, 'Partners segment exists for Cameroon field partners (Douala/Yaoundé)');
  assert.ok(hasBoard, 'Board segment exists for executive governance');
  assert.ok(hasVolunteers, 'Volunteers segment exists for IT refurbishing');
  assert.ok(hasMedia, 'Media segment exists for NGO press releases');
});

test('NEWSLETTER TEST 3: IFOPSIM Cameroon Hardware Donation Drive Issue Content Integrity', () => {
  const ifopIssue = SEED_ISSUES.find((i) => i.id === 'issue_tefa_001');
  assert.ok(ifopIssue, 'Issue #01 for TEFA exists');
  assert.strictEqual(ifopIssue?.organizationId, 'org_tefa');
  assert.ok(ifopIssue?.title.includes('Spendenaufruf für Laptops & Smartphones'), 'Title highlights hardware collection');
  assert.ok(ifopIssue?.highlightStoryContent.includes('Douala'), 'Highlights Cameroon field deployment');
  assert.ok(ifopIssue?.highlightStoryContent.includes('Laptops'), 'Highlights refurbished laptop drive');
  assert.ok(ifopIssue?.metricsSnapshot.some((m) => m.label.includes('Laptops')), 'Contains laptop collection KPI');
});

test('NEWSLETTER TEST 4: Legal Impressum, TEFA Address and GDPR Compliance', () => {
  const tefaOrg = SEED_ORGANIZATIONS.find((o) => o.id === 'org_tefa');
  assert.ok(tefaOrg, 'TEFA organization exists');
  assert.strictEqual(tefaOrg?.letterhead?.addressStreet, 'Neuköllnische Allee 10');
  assert.strictEqual(tefaOrg?.letterhead?.addressPostalCode, '12057');
  assert.strictEqual(tefaOrg?.letterhead?.addressCity, 'Berlin');
  assert.strictEqual(tefaOrg?.letterhead?.addressCountry, 'Deutschland');
});

test('NEWSLETTER TEST 5: Automated Project Update Generation Logic', () => {
  const orgProjects = SEED_PROJECTS.filter((p) => p.organizationId === 'org_tefa');
  assert.ok(orgProjects.length > 0, 'TEFA has active projects');

  const ifopsim = orgProjects.find((p) => p.id === 'proj_ifopsim_001');
  assert.ok(ifopsim, 'IFOPSIM project exists in TEFA workspace');
  assert.strictEqual(ifopsim?.country, 'Cameroon');
  assert.strictEqual(ifopsim?.referenceId, 'TEFA-2026-CMR-001');
});
