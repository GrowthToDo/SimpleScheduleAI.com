import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkFacts } from '../lib/facts-rules.mjs';

const ok = (s) => assert.equal(checkFacts(s).length, 0, s);
const bad = (s, id) => {
  const v = checkFacts(s);
  assert.equal(v.length, 1, s);
  assert.equal(v[0].id, id);
};

test('RN-on-duty wording must include CNS/LPN', () => {
  bad('a registered nurse must be on duty whenever there is an inpatient', 'cfr-631-on-duty');
  ok(
    'a registered nurse, clinical nurse specialist, or licensed practical nurse must be on duty whenever there is an inpatient'
  );
});

test('485.631 must not carry the provide-or-supervise clause', () => {
  bad(
    'Under 42 CFR 485.631, a registered nurse must provide or supervise the nursing care of each patient.',
    'cfr-631-scope'
  );
  ok('Under 42 CFR 485.635, a registered nurse must provide or supervise the nursing care of each patient.');
  bad('Under 42 CFR 485.631, a registered nurse must provide or assign the nursing care.', 'cfr-631-scope');
  bad('Under 42 CFR 485.631, an RN must provide (or supervise) the nursing care.', 'cfr-631-scope');
});

test('stale NSI figure is flagged', () => {
  bad('replacement cost of $52,350 per RN', 'nsi-2024-figure');
  bad('avg cost per RN departure $52K (NSI 2024)', 'nsi-2024-figure');
  ok('replacement cost of $61,110 per RN');
  ok('avg cost per RN departure $61K (NSI 2025)');
});

test('stale NSI turnover rate is flagged', () => {
  bad('puts registered nurse turnover at 18.4% nationally', 'nsi-2024-turnover');
  ok('puts registered nurse turnover at 16.4% nationally');
});

test('NNU secondary date flagged', () => {
  bad('the NNU fact sheet published June 3, 2026 argues', 'nnu-date');
  ok('the NNU fact sheet published May 26, 2026 argues');
});

test('JAMA 65% needs the nonretired qualifier', () => {
  bad('adequate staffing was cited by about 65 percent of respondents', 'jama-65-qualifier');
  ok('adequate staffing was named by about 65 percent of the nonretired nurses surveyed');
});

test('facts-ok comment suppresses', () => {
  ok('the old $52,350 figure was superseded <!-- facts-ok -->');
});

test('California-only ratio claim is stale (Oregon also mandates broad ratios)', () => {
  bad('California is the only state with mandated ratios', 'ca-only-ratio-state');
  bad('California is the only state with comprehensive mandated ratios', 'ca-only-ratio-state');
  bad('California remains the only state with a mandated nurse staffing ratio', 'ca-only-ratio-state');
  ok('California and Oregon are the only states with broad mandated ratios across unit types');
});
