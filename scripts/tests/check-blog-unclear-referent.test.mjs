import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

// The unclear-referent WARN exists because the founder flagged the same defect
// four times in four different sentences of one article, and each round only
// the sentence he pointed at got fixed. These fixtures are the four real shapes
// from that piece, plus the openers that must NOT trip it.
function runGate(body) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cbu-'));
  const rel = path.join('src', 'data', 'post');
  fs.mkdirSync(path.join(dir, rel), { recursive: true });
  const p = path.join(dir, rel, 'fixture.md');
  fs.writeFileSync(p, `---\ndraft: true\ntitle: F\n---\n\n${body}\n`);
  try {
    try {
      const out = execFileSync('node', [path.resolve('scripts/check-blog.mjs'), p], { encoding: 'utf8' });
      return { code: 0, out };
    } catch (e) {
      return { code: e.status, out: String(e.stdout) + String(e.stderr) };
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test('flags a paragraph opening on a bare pronoun subject', () => {
  const r = runGate('A nurse manager builds the schedule by hand.\n\nThis is different from the other change.');
  assert.match(r.out, /Unclear referent: paragraph opens on a bare pronoun subject/);
});

test('flags a paragraph opening on a demonstrative plus an abstract noun', () => {
  const r = runGate('A nurse manager builds the schedule by hand.\n\nThat framing misses where it lands.');
  assert.match(r.out, /Unclear referent: paragraph opens on a demonstrative plus an abstract noun/);
});

test('flags a paragraph opening on a bare gerund with no object', () => {
  const r = runGate('A nurse manager builds the schedule by hand.\n\nLeaving is close to paperwork.');
  assert.match(r.out, /Unclear referent: paragraph opens on a bare gerund with no object/);
});

test('flags "The switch" and "A designation change" style openers', () => {
  const r = runGate('A nurse manager builds the schedule by hand.\n\nThe switch rewrites what the roster produces.');
  assert.match(r.out, /Unclear referent/);
});

test('does NOT flag a paragraph that names its subject', () => {
  const r = runGate(
    'A nurse manager builds the schedule by hand.\n\nSwitching between the two categories rewrites the roster.'
  );
  assert.doesNotMatch(r.out, /Unclear referent/);
});

test('does NOT flag an answer-first capsule under a question heading', () => {
  // Answer-first capsules under question H2s are the house style: the heading
  // is the referent. Flagging them would penalise the style guide.
  const r = runGate('## Why Does This Matter?\n\nIt is the rule every schedule is built on.');
  assert.doesNotMatch(r.out, /Unclear referent/);
});

test('does NOT flag an FAQ answer under its bold question line', () => {
  const r = runGate('**Q: Can a hospital convert back?**\n\nIt is allowed, but it is much harder.');
  assert.doesNotMatch(r.out, /Unclear referent/);
});

test('does NOT flag list items or headings', () => {
  const r = runGate('## Key Takeaways\n\n- This is a bullet that restates the point\n- That change is a bullet too');
  assert.doesNotMatch(r.out, /Unclear referent/);
});

test('caps at 5 hits per file so a legacy post cannot flood its report', () => {
  const para = 'A nurse manager builds the schedule by hand.';
  const bad = 'This is another opener with no referent.';
  const body = Array.from({ length: 8 }, () => `${para}\n\n${bad}`).join('\n\n');
  const r = runGate(body);
  const hits = (r.out.match(/Unclear referent/g) || []).length;
  assert.equal(hits, 5);
});

// Sentence-level check (2d), added 2026-10-26 after the founder flagged a
// mid-paragraph partitive on a live article: "By October 23, one of them had a
// signed contract" should have named "those 28 applications".
const SENTENCE = /Unclear referent \(sentence\)/;
const LEAD = 'The state posted 28 new applications in its October 14 batch.';

test('sentence-level: the founder\'s real "one of them" sentence warns', () => {
  const r = runGate(`${LEAD} By October 23, one of them had a signed contract.`);
  assert.match(r.out, /Unclear referent \(sentence\): "one of them" with no noun after it/);
});

test('sentence-level: naming the thing ("one of those 28 applications") passes', () => {
  const r = runGate(`${LEAD} By October 23, one of those 28 applications had a signed contract.`);
  assert.doesNotMatch(r.out, SENTENCE);
});

test('sentence-level: a mid-paragraph "They wrote:" warns', () => {
  const r = runGate('Two nurses and a charge nurse filed the complaint in March. They wrote: the unit was short.');
  assert.match(r.out, /Unclear referent \(sentence\): sentence opens on a bare pronoun "They"/);
});

test('sentence-level: a mid-paragraph "The nurse wrote:" passes', () => {
  const r = runGate('Two nurses and a charge nurse filed the complaint in March. The nurse wrote: the unit was short.');
  assert.doesNotMatch(r.out, SENTENCE);
});

test('sentence-level: demonstrative plus a concrete noun passes', () => {
  const r = runGate(
    'A vendor can promise a one-hour response on a sales call. These support terms belong in the contract. This guide shows how.'
  );
  assert.doesNotMatch(r.out, SENTENCE);
});

test('sentence-level: a mid-paragraph "It" does not warn (it/its dropped from 2d)', () => {
  const r = runGate('When I Work is the most functional budget option. It handles shift scheduling.');
  assert.doesNotMatch(r.out, SENTENCE);
});

test('sentence-level: a sentence wrapped across source lines is read whole', () => {
  // Read line by line, the wrapped tail "them." looks like a sentence opening
  // on a bare pronoun. Joined, it is the object of "included".
  const r = runGate(
    'A 25-bed hospital could not tell whether the story included\nthem. The answer was in the state rules.\nThey were public.'
  );
  const hits = r.out.match(/Unclear referent \(sentence\)[^\n]*\n[^\n]*/g) || [];
  assert.equal(hits.length, 1);
  assert.match(hits[0], /"They"[\s\S]*L8:/);
});

test('sentence-level: blockquotes, the Sources section and "IT" do not warn', () => {
  const r = runGate(
    [
      'Small hospitals rarely have a full IT team. IT handles the badge readers.',
      '',
      '> One nurse said the roster was wrong. They wrote: nobody checked it.',
      '',
      '## Sources',
      '',
      '1. A report. One of them is a PDF.',
    ].join('\n')
  );
  assert.doesNotMatch(r.out, SENTENCE);
});

test('sentence-level: lists more than 25 hits with an "N more" summary', () => {
  const body = Array.from({ length: 30 }, () => 'Nurses filed two complaints. They wrote back.').join('\n\n');
  const r = runGate(body);
  assert.equal((r.out.match(/sentence opens on a bare pronoun "They"/g) || []).length, 25);
  assert.match(r.out, /Unclear referent \(sentence\): 5 more hit\(s\) not shown \(30 total\)/);
});
