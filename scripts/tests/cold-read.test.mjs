import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreColdRead, validateColdRead, INTENT_WEIGHTS, COMPREHENSION_BUDGET } from '../lib/cold-read.mjs';

const section = (heading, over = {}) => ({
  heading,
  rereadCount: 0,
  answeredItsQuestion: true,
  quitHere: false,
  ...over,
});

const base = (over = {}) => ({
  icp: 'DON at a 25-bed rural hospital, reading once on a phone',
  intent: 'act',
  sections: [section('A'), section('B'), section('C'), section('D')],
  undefinedTerms: [],
  mondayActions: ['pull the overtime report'],
  blockedActions: [],
  ...over,
});

test('a post with no friction scores 100 on every part', () => {
  const s = scoreColdRead(base());
  assert.deepEqual(s.parts, { comprehension: 100, headings: 100, actionability: 100, attention: 100 });
  assert.equal(s.overall, 100);
});

test('rereads and undefined terms only reduce comprehension', () => {
  const s = scoreColdRead(
    base({
      sections: [section('A', { rereadCount: 3 }), section('B'), section('C'), section('D')],
      undefinedTerms: ['obligate', 'supplanting', 'fringe'],
    })
  );
  // 6 friction points against a budget of 6 * 4 sections = 24 -> 75% clean
  assert.equal(s.parts.comprehension, 75);
  assert.equal(s.parts.headings, 100);
  assert.equal(s.parts.attention, 100);
});

test('comprehension floors at 0 rather than going negative', () => {
  const s = scoreColdRead(
    base({
      sections: [section('A', { rereadCount: 100 })],
      undefinedTerms: Array.from({ length: 50 }, (_, i) => `term${i}`),
    })
  );
  assert.equal(s.parts.comprehension, 0);
});

test('a heading that does not answer its own question costs the headings score', () => {
  const s = scoreColdRead(
    base({ sections: [section('A'), section('B', { answeredItsQuestion: false }), section('C'), section('D')] })
  );
  assert.equal(s.parts.headings, 75);
});

test('actionability is acted over acted-plus-blocked', () => {
  const s = scoreColdRead(base({ mondayActions: ['a', 'b'], blockedActions: ['c', 'd', 'e', 'f'] }));
  assert.equal(s.parts.actionability, 33.3);
});

test('a post the reader cannot act on at all scores zero actionability, not NaN', () => {
  const s = scoreColdRead(base({ mondayActions: [], blockedActions: [] }));
  assert.equal(s.parts.actionability, 0);
  assert.ok(Number.isFinite(s.overall));
});

test('quit points reduce attention', () => {
  const s = scoreColdRead(
    base({ sections: [section('A'), section('B', { quitHere: true }), section('C'), section('D')] })
  );
  assert.equal(s.parts.attention, 75);
});

test('intent changes the overall for identical observations', () => {
  const obs = base({
    sections: [section('A', { rereadCount: 6 }), section('B'), section('C'), section('D')],
    mondayActions: ['a'],
    blockedActions: ['b', 'c'],
  });
  const act = scoreColdRead({ ...obs, intent: 'act' });
  const trust = scoreColdRead({ ...obs, intent: 'trust' });
  assert.notEqual(act.overall, trust.overall);
  // 'act' weights actionability hardest, and actionability is the weak part here
  assert.ok(act.overall < trust.overall);
});

test('every intent has weights summing to 1', () => {
  for (const [intent, w] of Object.entries(INTENT_WEIGHTS)) {
    const sum = Object.values(w).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - 1) < 1e-9, `${intent} weights sum to ${sum}`);
  }
});

test('counts are reported alongside the scores', () => {
  const s = scoreColdRead(
    base({
      sections: [section('A', { rereadCount: 2, quitHere: true }), section('B', { answeredItsQuestion: false })],
      undefinedTerms: ['obligate'],
      mondayActions: ['a'],
      blockedActions: ['b'],
    })
  );
  assert.deepEqual(s.counts, {
    sections: 2,
    rereads: 2,
    undefinedTerms: 1,
    headingsAnswered: 1,
    mondayActions: 1,
    blockedActions: 1,
    quitPoints: 1,
  });
});

test('a realistic dense-draft shape scores poorly across the board', () => {
  // Shaped after the 2026-09-21 cold read of the RHTP draft before revision:
  // many rereads, heavy undefined jargon, two usable actions against three the
  // post asked for but did not equip, and four places the reader disengaged.
  const s = scoreColdRead({
    icp: 'DON at a 25-bed rural hospital, reading once on a phone',
    intent: 'act',
    sections: [
      section('How much money', { rereadCount: 2, answeredItsQuestion: false }),
      section('Can it pay nurse salaries', { rereadCount: 3 }),
      section('When is it due', { rereadCount: 3 }),
      section('Float pools', { rereadCount: 2 }),
      section('Did any state', { rereadCount: 2, quitHere: true }),
      section('Texas', { rereadCount: 1, answeredItsQuestion: false }),
      section('STAT', { rereadCount: 1, answeredItsQuestion: false, quitHere: true }),
      section('What we do not know', { rereadCount: 2 }),
      section('What to do', { rereadCount: 1, answeredItsQuestion: false }),
    ],
    undefinedTerms: ['obligate', 'supplanting', 'budget period', 'allotment', 'rescoring', 'fringe', 'initiative'],
    mondayActions: ['check contracts for non-competes', 'pull overtime by nurse'],
    blockedActions: ['ask the state office', 'ask who writes the report', 'read funding notices'],
  });
  assert.ok(s.parts.comprehension < 70, `comprehension was ${s.parts.comprehension}`);
  assert.ok(s.parts.headings < 60, `headings was ${s.parts.headings}`);
  assert.ok(s.parts.actionability < 50, `actionability was ${s.parts.actionability}`);
  assert.ok(s.overall < 70, `overall was ${s.overall}`);
});

test('validation rejects a missing intent, bad sections, and non-array lists', () => {
  assert.equal(validateColdRead(null).ok, false);
  assert.equal(validateColdRead(base({ intent: 'vibes' })).ok, false);
  assert.equal(validateColdRead(base({ sections: [] })).ok, false);
  assert.equal(validateColdRead(base({ undefinedTerms: 'obligate' })).ok, false);
  assert.equal(validateColdRead(base({ sections: [{ heading: 'A' }] })).ok, false);
  assert.equal(validateColdRead(base({ sections: [section('A', { rereadCount: -1 })] })).ok, false);
  assert.equal(validateColdRead(base()).ok, true);
});

test('scoreColdRead refuses to score an invalid record rather than guessing', () => {
  assert.throws(() => scoreColdRead(base({ intent: 'vibes' })), /invalid cold-read record/);
});

test('COMPREHENSION_BUDGET is exported so the doc and the code cannot drift', () => {
  assert.equal(typeof COMPREHENSION_BUDGET, 'number');
  assert.ok(COMPREHENSION_BUDGET > 0);
});
