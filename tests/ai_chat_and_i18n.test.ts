import test from 'node:test';
import assert from 'node:assert/strict';
import { translations } from '../src/i18n/translations.js';

test('AI CHAT & I18N TEST 1: All supported languages have complete dashboard, countdown, and chat translations', () => {
  const languages = ['de', 'en', 'fr'] as const;

  for (const lang of languages) {
    const t = translations[lang];
    assert.ok(t, `Language ${lang} must exist in translations`);
    assert.ok(t.dashboard, `Language ${lang} must have dashboard translations`);
    assert.ok(t.countdown, `Language ${lang} must have countdown translations`);
    assert.ok(t.chat, `Language ${lang} must have chat translations`);

    // Key dashboard strings
    assert.ok(t.dashboard.title, `Language ${lang} must have dashboard.title`);
    assert.ok(t.dashboard.kpiPlannedBudget, `Language ${lang} must have dashboard.kpiPlannedBudget`);
    assert.ok(t.dashboard.kpiConfirmedFunding, `Language ${lang} must have dashboard.kpiConfirmedFunding`);
    assert.ok(t.dashboard.kpiFundingGap, `Language ${lang} must have dashboard.kpiFundingGap`);
    assert.ok(t.dashboard.governanceTitle, `Language ${lang} must have dashboard.governanceTitle`);

    // Key chat strings
    assert.ok(t.chat.title, `Language ${lang} must have chat.title`);
    assert.ok(t.chat.badge, `Language ${lang} must have chat.badge`);
    assert.ok(t.chat.placeholder, `Language ${lang} must have chat.placeholder`);
    assert.ok(t.chat.send, `Language ${lang} must have chat.send`);
    assert.ok(t.chat.promptImproveProposal, `Language ${lang} must have chat.promptImproveProposal`);
    assert.ok(t.chat.promptCheckBudget, `Language ${lang} must have chat.promptCheckBudget`);
    assert.ok(t.chat.minimize, `Language ${lang} must have chat.minimize`);
    assert.ok(t.chat.maximize, `Language ${lang} must have chat.maximize`);

    // Key countdown strings
    assert.ok(t.countdown.title, `Language ${lang} must have countdown.title`);
    assert.ok(t.countdown.readinessTitle, `Language ${lang} must have countdown.readinessTitle`);
    assert.ok(t.countdown.overallScore, `Language ${lang} must have countdown.overallScore`);
  }
});

test('AI CHAT & I18N TEST 2: Governance approval prevents self-approval and provides localized alerts', () => {
  const de = translations.de.dashboard;
  const en = translations.en.dashboard;
  const fr = translations.fr.dashboard;

  assert.match(de.governanceSelfApproveError, /Governance-Regel.*Antragsteller/i);
  assert.match(en.governanceSelfApproveError, /Governance Rule.*proposer/i);
  assert.match(fr.governanceSelfApproveError, /Règle de gouvernance.*porteur de projet/i);
});

test('AI CHAT & I18N TEST 3: Multi-language status mappings exist for all lifecycle statuses', () => {
  const statuses = [
    'Draft',
    'Submitted',
    'Under Review',
    'Approved',
    'Fundraising',
    'Ready for Implementation',
    'In Progress',
    'Completed',
    'Closed',
    'Rejected',
  ] as const;

  for (const status of statuses) {
    assert.ok(translations.de.status[status], `German translation missing for status ${status}`);
    assert.ok(translations.en.status[status], `English translation missing for status ${status}`);
    assert.ok(translations.fr.status[status], `French translation missing for status ${status}`);
  }
});

test('AI CHAT & I18N TEST 4: Chat quick prompts are properly differentiated per language', () => {
  assert.notEqual(translations.de.chat.promptImproveProposal, translations.en.chat.promptImproveProposal);
  assert.notEqual(translations.de.chat.promptImproveProposal, translations.fr.chat.promptImproveProposal);
  assert.notEqual(translations.en.chat.promptImproveProposal, translations.fr.chat.promptImproveProposal);

  assert.ok(translations.de.chat.geminiActive.includes('Gemini'));
  assert.ok(translations.en.chat.chatgptReady.includes('ChatGPT'));
  assert.ok(translations.fr.chat.chatgptReady.includes('ChatGPT'));
});

test('AI CHAT & I18N TEST 5: Interactive In-App Navigation and Action Tokens Parsing', () => {
  const tokenRegex = /(\[\[(?:nav|action):[^|\]]+\|[^\]]+\]\])/g;

  const testText = "Um das Vorhaben zu prüfen, nutzen Sie [[nav:feasibility|Machbarkeitsanalyse]] oder öffnen Sie [[action:export|Projektdossier drucken]].";
  const matches = testText.match(tokenRegex);

  assert.ok(matches);
  assert.equal(matches.length, 2);
  assert.equal(matches[0], '[[nav:feasibility|Machbarkeitsanalyse]]');
  assert.equal(matches[1], '[[action:export|Projektdossier drucken]]');

  const match1 = matches[0].match(/^\[\[(nav|action):([^|\]]+)\|([^\]]+)\]\]$/);
  assert.ok(match1);
  assert.equal(match1[1], 'nav');
  assert.equal(match1[2], 'feasibility');
  assert.equal(match1[3], 'Machbarkeitsanalyse');

  const match2 = matches[1].match(/^\[\[(nav|action):([^|\]]+)\|([^\]]+)\]\]$/);
  assert.ok(match2);
  assert.equal(match2[1], 'action');
  assert.equal(match2[2], 'export');
  assert.equal(match2[3], 'Projektdossier drucken');

  // Verify all new guidance keys exist across de, en, fr
  const languages = ['de', 'en', 'fr'] as const;
  for (const lang of languages) {
    const c = translations[lang].chat;
    assert.ok(c.promptHowToUse, `Missing promptHowToUse in ${lang}`);
    assert.ok(c.promptHowToApprove, `Missing promptHowToApprove in ${lang}`);
    assert.ok(c.promptHowToSimulator, `Missing promptHowToSimulator in ${lang}`);
    assert.ok(c.promptHowToExport, `Missing promptHowToExport in ${lang}`);
  }
});

