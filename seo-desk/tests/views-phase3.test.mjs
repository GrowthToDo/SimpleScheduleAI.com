import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// The pure parts of the phase 3 pages: insight priorities, the decay drop chip, the runner-up
// table rows, briefs, the keyword map filters, the audit's four severities and quick wins, the AI
// visibility keyword line, the print view's card lines and the lesson labels. These modules import
// nothing from the browser at load time. Every page, phrase and number below is invented.

const insight = await import('../static/views/insight.js');
const km = await import('../static/views/keyword-map.js');
const audit = await import('../static/views/audit.js');
const ai = await import('../static/views/ai.js');
const print = await import('../static/views/print-week.js');
const results = await import('../static/views/results.js');
const postAct = await import('../static/views/post-action.js');

// ---------------------------------------------------------------- insight pages

test('stripHypothesis drops the leading label the card already shows', () => {
  assert.equal(insight.stripHypothesis('Hypothesis: folding /a into /b may help.'), 'Folding /a into /b may help.');
  assert.equal(insight.stripHypothesis('Add a section.'), 'Add a section.');
  assert.equal(insight.stripHypothesis(null), '');
});

test('dropKindText names each kind, and an unclear drop says so honestly', () => {
  assert.equal(insight.dropKindText('lost-rankings'), 'Lost rankings');
  assert.equal(insight.dropKindText('lost-demand'), 'Lost demand');
  assert.equal(insight.dropKindText('lost-clicks'), 'Lost clicks at the same position');
  assert.equal(insight.dropKindText('unclear'), 'Kind of drop: not clear from the numbers');
  assert.equal(insight.dropKindText(undefined), 'Kind of drop: not clear from the numbers');
});

test('runnerUpRows takes place and times shown from the matching evidence row; pageTwoCount', () => {
  const rows = insight.runnerUpRows([
    {
      id: 'a',
      query: 'rota for small wards',
      page: '/blog/invented-a',
      evidence: [
        { query: 'other words', page: '/blog/invented-a', position: 3, impressions: 9 },
        { query: 'rota for small wards', page: '/blog/invented-a', position: 12.4, impressions: 140 },
      ],
    },
    { id: 'b', query: 'shift swap rules', page: '/blog/invented-b', evidence: [{ position: 8.2, impressions: 60 }] },
    { id: 'c', query: 'no evidence here', page: null },
  ]);
  assert.deepEqual(
    rows.map((r) => [r.id, r.position, r.impressions]),
    [
      ['a', 12.4, 140],
      ['b', 8.2, 60],
      ['c', null, null],
    ]
  );
  assert.equal(insight.pageTwoCount(rows), 1);
  assert.equal(insight.pageTwoCount([{ position: 10 }, { position: 20 }, { position: 21 }]), 1);
});

// ---------------------------------------------------------------- keyword map

const kmRows = [
  { keyword: 'a', mappedTo: '/x', status: 'live', flags: ['runner-up'], source: ['file', 'search-console'] },
  { keyword: 'b', mappedTo: null, status: 'pending', flags: [], source: ['search-console'] },
  { keyword: 'c', mappedTo: null, status: 'pending', flags: ['cannibalized', 'wrong-page'], source: ['import'] },
  { keyword: 'd', mappedTo: '/y', status: 'live', flags: [], source: [] },
];

test('keyword map filters: each chip key picks its rows; an unknown key shows all', () => {
  const count = (k) =>
    km
      .filterRows(kmRows, k)
      .map((r) => r.keyword)
      .join('');
  assert.equal(count('all'), 'abcd');
  assert.equal(count('mapped'), 'ad');
  assert.equal(count('unmapped'), 'bc');
  assert.equal(count('opportunities'), 'ac');
  assert.equal(count('runner-up'), 'a');
  assert.equal(count('cannibalized'), 'c');
  assert.equal(count('nonsense'), 'abcd');
  assert.deepEqual(
    km.KM_FILTERS.map((f) => f.counter),
    ['all', 'mapped', 'unmapped', 'opportunities', 'runnerUp', 'cannibalized']
  );
});

test('keyword map source tags and status words', () => {
  assert.deepEqual(km.sourceTags(kmRows[0]), ['Keyword file', 'Search Console']);
  assert.deepEqual(km.sourceTags(kmRows[2]), ['Imported']);
  assert.deepEqual(km.sourceTags({}), []);
  assert.equal(km.statusText(kmRows[0]), 'Live');
  assert.equal(km.statusText(kmRows[1]), 'Pending');
});

// ---------------------------------------------------------------- audit

test('audit: four severities in order, worst first', () => {
  assert.deepEqual(
    audit.SEVERITIES.map((s) => s.key),
    ['critical', 'high', 'medium', 'low']
  );
  const groups = audit.bySeverity([
    { id: 'a', severity: 'low' },
    { id: 'b', severity: 'high' },
    { id: 'c', severity: 'critical' },
  ]);
  assert.deepEqual(
    groups.map((g) => g.key),
    ['critical', 'high', 'low']
  );
});

test('audit countsText reads the four levels, zeros left out', () => {
  assert.equal(audit.countsText({ critical: 1, high: 2, medium: 0, low: 9 }), '1 critical, 2 high, 9 low');
  assert.equal(audit.countsText({ critical: 0, high: 0, medium: 0, low: 0 }), 'nothing found');
});

test('audit filterIssues: by severity, and Show quick wins keeps quick wins only', () => {
  const issues = [
    { id: 'a', severity: 'low', effort: 'quick win' },
    { id: 'b', severity: 'high', effort: 'larger job' },
    { id: 'c', severity: 'high', effort: 'quick win' },
    { id: 'd', severity: 'medium', effort: null },
  ];
  const ids = (opts) => audit.filterIssues(issues, opts).map((i) => i.id);
  assert.deepEqual(ids({}), ['a', 'b', 'c', 'd']);
  assert.deepEqual(ids({ severity: 'high' }), ['b', 'c']);
  assert.deepEqual(ids({ quick: true }), ['a', 'c']);
  assert.deepEqual(ids({ severity: 'high', quick: true }), ['c']);
});

// ---------------------------------------------------------------- AI visibility

test('AI keyword line: "N of M" only when there are enough keyword checks', () => {
  assert.equal(
    ai.keywordShare({ keywordChecked: 4, keywordNamed: 1, keywordEnough: true }),
    'named in 1 of 4 keyword checks'
  );
  assert.equal(ai.keywordShare({ keywordChecked: 2, keywordNamed: null, keywordEnough: false }), 'not enough data yet');
  assert.equal(ai.keywordShare({ keywordChecked: 0, keywordNamed: null, keywordEnough: false }), 'not enough data yet');
});

// ---------------------------------------------------------------- print view

test('print view: each card gives its evidence, recommendation and test, from any of the three shapes', () => {
  assert.deepEqual(print.cardLines({ measured: 'Shown 40 times.', action: 'Add a heading.', test: 'In 28 days.' }), {
    evidence: 'Shown 40 times.',
    recommendation: 'Add a heading.',
    test: 'In 28 days.',
  });
  assert.deepEqual(print.cardLines({ measured: 'Fell 30%.', fix: 'Look at the title.' }), {
    evidence: 'Fell 30%.',
    recommendation: 'Look at the title.',
    test: null,
  });
});

test('print view: with no range text the heading builds it from the start and end dates', () => {
  const head = print.planHeading(
    { weekLabel: 'Week of 9 November', range: { start: '2026-10-13', end: '2026-11-09' }, through: '2026-11-09' },
    { rangeText: (r) => `${r.start} to ${r.end}` }
  );
  assert.equal(head.range, 'Numbers cover 2026-10-13 to 2026-11-09.');
  assert.equal(print.planHeading({ weekLabel: 'Week of 9 November', range: null }).range, null);
  assert.equal(print.PRINT_TITLE, "This week's plan");
});

test('print view: the plan heading names the week, the range and the data date', () => {
  const head = print.planHeading({
    weekLabel: 'Week of 9 November',
    range: { text: '13 October to 9 November' },
    through: '2026-11-09',
    planSize: 3,
  });
  assert.equal(head.title, 'SEO plan: Week of 9 November');
  assert.equal(head.range, 'Numbers cover 13 October to 9 November.');
  assert.equal(head.through, '2026-11-09');
});

// ---------------------------------------------------------------- lessons

test('lesson status words', () => {
  assert.equal(results.lessonWord('trial'), 'Trial');
  assert.equal(results.lessonWord('proven'), 'Proven');
  assert.equal(results.lessonWord('dropped'), 'Dropped');
});

// ---------------------------------------------------------------- after an action (E4)

// A fake api: each post returns the next answer in the list (an Error is thrown), and every call is kept.
function fakeApi(answers) {
  const calls = [];
  return {
    calls,
    post: async (path, body) => {
      calls.push({ path, body });
      const a = answers.shift();
      if (a instanceof Error) throw a;
      return a;
    },
  };
}
const refusal = (status, message, data) =>
  Object.assign(new Error(message), { status, data: { error: message, ...data } });
const asked = () => {
  const boxes = [];
  return { boxes, yes: async (b) => (boxes.push(b), true), no: async (b) => (boxes.push(b), false) };
};

test('postAction: a frozen page refusal asks once, naming every frozen page, then resends with override', async () => {
  const api = fakeApi([
    refusal(409, 'held', {
      frozen: { page: '/blog/invented-a', sinceText: '2 November', untilText: '30 November' },
      frozenPages: [
        { page: '/blog/invented-a', sinceText: '2 November', untilText: '30 November' },
        { page: '/blog/invented-b', sinceText: '3 November', untilText: '1 December' },
      ],
    }),
    { ok: true },
  ]);
  const c = asked();
  const res = await postAct.postAction({ api, confirmBox: c.yes }, '/api/item/x', { action: 'done' });
  assert.deepEqual(res, { ok: true });
  assert.equal(c.boxes.length, 1);
  assert.match(c.boxes[0].body, /\/blog\/invented-a was edited on 2 November/);
  assert.match(c.boxes[0].body, /\/blog\/invented-b was edited on 3 November/);
  assert.equal(c.boxes[0].title, 'These pages are still frozen');
  assert.deepEqual(api.calls[1], { path: '/api/item/x', body: { action: 'done', override: true } });
});

test('postAction: a second edit this week asks once; backing out sends nothing more', async () => {
  const w = { page: '/blog/invented-c', date: '2026-11-09', dateText: '9 November' };
  const api = fakeApi([refusal(409, 'held', { secondThisWeek: w })]);
  const c = asked();
  assert.equal(await postAct.postAction({ api, confirmBox: c.no }, '/p', { action: 'done', page: '/x' }), null);
  assert.equal(api.calls.length, 1);
  assert.match(c.boxes[0].body, /already made this week's page edit on 9 November/);
  // Both reasons: two questions, then the override keeps the rest of the body.
  const both = fakeApi([
    refusal(409, 'held', {
      frozen: { page: '/a', sinceText: '1 November', untilText: '29 November' },
      secondThisWeek: w,
    }),
    { ok: 1 },
  ]);
  const c2 = asked();
  await postAct.postAction({ api: both, confirmBox: c2.yes }, '/p', { action: 'done', page: '/a' });
  assert.equal(c2.boxes.length, 2);
  assert.deepEqual(both.calls[1].body, { action: 'done', page: '/a', override: true });
});

test('postAction: a 409 with no one-edit fields is a plain message, never the one-edit confirm', async () => {
  const msg = 'That item is finished or dismissed, so that action is not allowed. Press Reopen first.';
  const api = fakeApi([refusal(409, msg, {})]);
  const c = asked();
  await assert.rejects(postAct.postAction({ api, confirmBox: c.yes }, '/p', { action: 'done' }), new RegExp(msg));
  assert.equal(c.boxes.length, 0, 'no confirm');
  assert.equal(api.calls.length, 1, 'no override');
  // Any other action, or any other status, goes back as it came.
  const other = fakeApi([refusal(400, 'Bad date.', {})]);
  await assert.rejects(postAct.postAction({ api: other, confirmBox: c.yes }, '/p', { action: 'done' }), /Bad date/);
  const snooze = fakeApi([refusal(409, 'held', { frozen: { page: '/a', sinceText: 'x', untilText: 'y' } })]);
  await assert.rejects(postAct.postAction({ api: snooze, confirmBox: c.yes }, '/p', { action: 'snooze' }), /held/);
  assert.equal(c.boxes.length, 0);
});

test('post-action.js needs no browser: it imports nothing', () => {
  const src = fs.readFileSync(new URL('../static/views/post-action.js', import.meta.url), 'utf8');
  assert.doesNotMatch(src, /^\s*import\s/m);
  assert.doesNotMatch(src, /\bdocument\b|\bwindow\b/);
});
