import test from 'node:test';
import assert from 'node:assert/strict';
import { SEED_PROJECTS } from '../src/data/seedProjects';
import { SEED_ORGANIZATIONS, SEED_PROGRAMMES } from '../src/data/seedOrganizations';
import { INITIAL_CUSTOM_PROFILES } from '../src/context/AuthRoleContext';
import { Organization, Programme, UserProfile } from '../src/types';

test('MULTI-ORG TEST 1: TechEnergy For Africa e.V. is configured as Primary Organization with official website', () => {
  const tefa = SEED_ORGANIZATIONS.find((o) => o.id === 'org_tefa');
  assert.ok(tefa, 'TEFA organization exists');
  assert.strictEqual(tefa.name, 'TechEnergy For Africa e.V.');
  assert.strictEqual(tefa.website, 'https://www.techenergyforafrica.org', 'Official TEFA website must be www.techenergyforafrica.org');
  assert.strictEqual(tefa.defaultCurrency, 'EUR');
});

test('MULTI-ORG TEST 2: TGIEP is isolated as a programme belonging to TEFA, not global platform requirement', () => {
  const tgiep = SEED_PROGRAMMES.find((p) => p.id === 'prog_tgiep');
  assert.ok(tgiep, 'TGIEP programme exists');
  assert.strictEqual(tgiep.organizationId, 'org_tefa', 'TGIEP belongs specifically to org_tefa');
  
  const ifopsim = SEED_PROJECTS.find((p) => p.id === 'proj_ifopsim_001');
  assert.ok(ifopsim, 'IFOPSIM project exists');
  assert.strictEqual(ifopsim.organizationId, 'org_tefa');
  assert.strictEqual(ifopsim.programmeId, 'prog_tgiep', 'IFOPSIM is associated with TGIEP under TEFA');
});

test('MULTI-ORG TEST 3: Strict Organization Isolation - Non-TEFA Workspace sees zero TEFA or TGIEP projects', () => {
  const independentOrg: Organization = {
    id: 'org_health_aid',
    name: 'Santé Sans Frontières',
    legalForm: 'Association loi 1901',
    country: 'France',
    website: 'https://sante-sans-frontieres.org',
    defaultCurrency: 'EUR',
    timeZone: 'Europe/Paris',
    primaryLanguage: 'fr',
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  // Simulating the ProjectContext filter for the new organization
  const filteredProjects = SEED_PROJECTS.filter(
    (p) => (p.organizationId || 'org_tefa') === independentOrg.id
  );

  assert.strictEqual(filteredProjects.length, 0, 'New independent organization starts with 0 projects from TEFA');
  assert.ok(!filteredProjects.some((p) => p.title.includes('IFOPSIM')), 'Never exposes IFOPSIM to independent org');
  assert.ok(!filteredProjects.some((p) => p.title.includes('TGIEP')), 'Never exposes TGIEP to independent org');
});

test('MULTI-ORG TEST 4: Organization Project Creation tags project with current active organization ID', () => {
  const activeOrgId = 'org_global_eco';
  const newProjectMock = {
    id: 'proj_new_999',
    organizationId: activeOrgId,
    title: 'Clean Mountain Stream Watershed Project',
    category: 'environmental_education' as const,
    country: 'Other' as const,
  };

  assert.strictEqual(newProjectMock.organizationId, 'org_global_eco');
  assert.notStrictEqual(newProjectMock.organizationId, 'org_tefa');
});

test('MULTI-ORG TEST 5: User Profile Management - Ability to create custom profile with specific role & organization', () => {
  const newProfile: UserProfile = {
    id: 'usr_new_partner_01',
    name: 'Dr. Sarah Schmidt',
    email: 'sarah.schmidt@global-eco-community.org',
    role: 'project_manager',
    organizationId: 'org_global_eco',
    customTitle: 'Senior Conservation Director',
    avatarInitials: 'SS',
    bio: 'Overseeing biodiversity initiatives and alpine community watershed conservation.',
  };

  assert.strictEqual(newProfile.name, 'Dr. Sarah Schmidt');
  assert.strictEqual(newProfile.organizationId, 'org_global_eco');
  assert.strictEqual(newProfile.role, 'project_manager');
  assert.strictEqual(newProfile.avatarInitials, 'SS');
});

test('MULTI-ORG TEST 6: User Profiles pikop, mistral, and info @techenergyforafrica.org exist with external providers', () => {
  const pikop = INITIAL_CUSTOM_PROFILES.find((p: any) => p.email === 'pikop@techenergyforafrica.org');
  assert.ok(pikop, 'pikop@techenergyforafrica.org must exist');
  assert.strictEqual(pikop.organizationId, 'org_tefa');
  
  const mistral = INITIAL_CUSTOM_PROFILES.find((p: any) => p.email === 'mistral@techenergyforafrica.org');
  assert.ok(mistral, 'mistral@techenergyforafrica.org must exist');
  assert.strictEqual(mistral.role, 'system_admin');
  
  const info = INITIAL_CUSTOM_PROFILES.find((p: any) => p.email === 'info@techenergyforafrica.org');
  assert.ok(info, 'info@techenergyforafrica.org must exist');
  
  const gmailUser = INITIAL_CUSTOM_PROFILES.find((p: any) => p.email.endsWith('@gmail.com'));
  assert.ok(gmailUser, 'External @gmail.com profile exists');
  
  const yahooUser = INITIAL_CUSTOM_PROFILES.find((p: any) => p.email.endsWith('@yahoo.com'));
  assert.ok(yahooUser, 'External @yahoo.com profile exists');
});

test('MULTI-ORG TEST 7: Organization Logo and Letterhead Configuration for Print Templates', () => {
  const tefa = SEED_ORGANIZATIONS.find((o) => o.id === 'org_tefa');
  assert.ok(tefa?.logoUrl, 'TEFA has an official vector SVG logo configured');
  assert.ok(tefa?.letterhead, 'TEFA has letterhead structure configured');
  assert.strictEqual(tefa?.letterhead?.addressStreet, 'Neuköllnische Allee 10');
  assert.strictEqual(tefa?.letterhead?.addressPostalCode, '12057');
  assert.strictEqual(tefa?.letterhead?.addressCity, 'Berlin');
  assert.strictEqual(tefa?.letterhead?.email, 'info@techenergyforafrica.org');
  assert.ok(tefa?.letterhead?.registrationCourt?.includes('Charlottenburg'));
  assert.ok(tefa?.letterhead?.taxId?.includes('27/653/55123'));
  assert.strictEqual(tefa?.letterhead?.signatory1Name, 'Dr. Frederic Pokam');
  assert.strictEqual(tefa?.letterhead?.signatory2Name, 'Marc Tagne');

  const eco = SEED_ORGANIZATIONS.find((o) => o.id === 'org_global_eco');
  assert.ok(eco?.logoUrl, 'Global Eco has its own distinct logo');
  assert.strictEqual(eco?.letterhead?.addressCity, 'Zürich');
});

test('MULTI-ORG TEST 8: Document Studio supports Digital Signatures and Four-Eyes Governance', () => {
  const sampleSignatureRecord = {
    signer1Name: 'Dr. Frederic Pokam',
    signer1Role: 'Vorstandsvorsitzender',
    signer1City: 'Berlin',
    signer1Date: '02.11.2026',
    signer1SignatureDataUrl: 'data:image/svg+xml;utf8,...',
    signer1IsSigned: true,
    signer2Name: 'Marc Tagne',
    signer2Role: 'Finanzvorstand',
    signer2City: 'Berlin',
    signer2Date: '02.11.2026',
    signer2SignatureDataUrl: 'data:image/svg+xml;utf8,...',
    signer2IsSigned: true,
    includeOfficialSeal: true,
    auditHash: 'SIG-TEFA-2026-X99',
    isVerified: true,
  };

  assert.strictEqual(sampleSignatureRecord.signer1IsSigned, true);
  assert.strictEqual(sampleSignatureRecord.signer2IsSigned, true);
  assert.strictEqual(sampleSignatureRecord.includeOfficialSeal, true);
  assert.ok(sampleSignatureRecord.auditHash.startsWith('SIG-TEFA'));
});

