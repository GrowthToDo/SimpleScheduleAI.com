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

test('SSAI claim must say the 40-hour weekly FLSA overtime threshold, not "applicable"', () => {
  const id = 'flsa-applicable-threshold-ssai';
  bad(
    'For Texas hospitals, the same draft tracks each running total against the applicable FLSA overtime thresholds.',
    id
  );
  bad('We track overtime risk against the applicable FLSA threshold in real time.', id);
  bad('SimpleScheduleAI checks hours against the applicable FLSA overtime threshold before assigning.', id);
  bad(
    'Each draft is checked against the applicable [FLSA overtime thresholds](https://www.dol.gov/agencies/whd/fact-sheets/54-healthcare-overtime) before posting.',
    id
  );
  bad('The system also watches each running total against the applicable FLSA overtime thresholds.', id);
  ok(
    'For Texas hospitals, the same draft tracks each running total against the 40-hour weekly FLSA overtime threshold.'
  );
  // generic/educational use stays legal
  ok('Free tools do not track each running total against the applicable FLSA overtime threshold.');
  // sentence-scoped: SSAI in one sentence, generic phrase in the next
  ok('SimpleScheduleAI builds the draft. Some tools track the applicable FLSA overtime threshold; many do not.');
  // link-target dots must not split the sentence early
  bad(
    'Our scheduler cites [DOL](https://www.dol.gov/agencies/whd) and tracks the applicable FLSA overtime thresholds.',
    id
  );
  // "applicable overtime threshold(s)" without FLSA
  bad('The AI tracks each running total against applicable overtime thresholds.', id);
  // linked form: applicable [FLSA](url) overtime thresholds
  bad(
    'Our AI checks every draft against the applicable [FLSA](https://www.dol.gov/agencies/whd/flsa) overtime thresholds.',
    id
  );
  // subject "the AI" alone
  bad('The AI flags any shift past the applicable FLSA overtime threshold before posting.', id);
  // generic lines with the new phrase shapes still pass
  ok('Most generic apps do not warn before a shift crosses the applicable overtime threshold.');
  ok('Ask the vendor how it handles the applicable [FLSA](https://www.dol.gov/agencies/whd/flsa) overtime thresholds.');
});

test('California-only ratio claim is stale (Oregon also mandates broad ratios)', () => {
  bad('California is the only state with mandated ratios', 'ca-only-ratio-state');
  bad('California is the only state with comprehensive mandated ratios', 'ca-only-ratio-state');
  bad('California remains the only state with a mandated nurse staffing ratio', 'ca-only-ratio-state');
  ok('California and Oregon are the only states with broad mandated ratios across unit types');
});
