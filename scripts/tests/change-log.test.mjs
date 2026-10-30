import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  aggregate,
  dailySpan,
  rowsForWindow,
  attachNotes,
  classify,
  controlFor,
  siteTotals,
  collapse,
  detectKind,
  dueEntries,
  extractRows,
  flagOverlaps,
  groupByDate,
  isDueDate,
  isLive,
  metricsFor,
  parseGitLog,
  windowsFor,
} from '../lib/change-log-core.mjs';

const m = (clicks, impressions, position) => ({
  clicks,
  impressions,
  ctr: impressions ? clicks / impressions : 0,
  position,
});

test('window math excludes the change day', () => {
  const w = windowsFor('2026-10-19');
  assert.deepEqual(w.before, { start: '2026-09-21', end: '2026-10-18' });
  assert.deepEqual(w.after, { start: '2026-10-20', end: '2026-11-16' });
});

test('due exactly 28 + 2 days after the change', () => {
  assert.equal(isDueDate('2026-10-19', '2026-11-18'), true);
  assert.equal(isDueDate('2026-10-19', '2026-11-17'), false);
});

test('classify: insufficient data on both sides', () => {
  const r = classify(m(1, 40, 10), m(2, 49, 5));
  assert.equal(r.verdict, 'insufficient-data');
  assert.deepEqual(r.signals, []);
  assert.equal(r.dropType, null);
});

test('classify: lost-rankings', () => {
  const r = classify(m(20, 400, 8), m(10, 400, 11));
  assert.equal(r.posDelta, -3);
  assert.ok(r.signals.includes('ranking-down'));
  assert.equal(r.dropType, 'lost-rankings');
  assert.equal(r.verdict, 'worse');
});

test('classify: lost-demand with stable position', () => {
  const r = classify(m(20, 500, 8), m(12, 300, 8));
  assert.equal(r.impPct, -0.4);
  assert.deepEqual(r.signals, ['impressions-down']);
  assert.equal(r.dropType, 'lost-demand');
  assert.equal(r.verdict, 'worse');
});

test('classify: lost-ctr-same-position', () => {
  const r = classify(m(50, 500, 8), m(30, 500, 8.4));
  assert.deepEqual(r.signals, ['ctr-down-same-position']);
  assert.equal(r.dropType, 'lost-ctr-same-position');
  assert.equal(r.verdict, 'worse');
});

test('classify: better via ranking-up', () => {
  const r = classify(m(10, 300, 12), m(14, 300, 9));
  assert.equal(r.posDelta, 3);
  assert.deepEqual(r.signals, ['ranking-up']);
  assert.equal(r.dropType, null);
  assert.equal(r.verdict, 'better');
});

test('classify: flat', () => {
  const r = classify(m(20, 400, 8), m(21, 410, 8.2));
  assert.deepEqual(r.signals, []);
  assert.equal(r.verdict, 'flat');
});

test('classify: clicksTooSmall needs under 10 clicks on both sides', () => {
  assert.equal(classify(m(3, 200, 8), m(4, 200, 8)).clicksTooSmall, true);
  assert.equal(classify(m(3, 200, 8), m(10, 200, 8)).clicksTooSmall, false);
});

test('classify: ranking-down beats impressions-down for dropType', () => {
  const r = classify(m(20, 500, 8), m(8, 250, 12));
  assert.ok(r.signals.includes('ranking-down'));
  assert.ok(r.signals.includes('impressions-down'));
  assert.equal(r.dropType, 'lost-rankings');
});

test('classify: zero impressions on one side gives null deltas, not a crash', () => {
  const r = classify(m(0, 0, 0), m(5, 80, 9));
  assert.equal(r.posDelta, null);
  assert.equal(r.impPct, null);
  assert.equal(r.verdict, 'flat');
});

test('collapse merges same slug and same date into one entry', () => {
  const entries = collapse([
    { date: '2026-10-19', slug: 'a', url: '/blog/a', kind: 'edit', hash: 'h1', subject: 'first' },
    { date: '2026-10-19', slug: 'a', url: '/blog/a', kind: 'edit', hash: 'h2', subject: 'second' },
    { date: '2026-10-19', slug: 'a', url: '/blog/a', kind: 'edit', hash: 'h2', subject: 'second' },
    { date: '2026-10-20', slug: 'a', url: '/blog/a', kind: 'edit', hash: 'h3', subject: 'next day' },
    { date: '2026-10-19', slug: 'b', url: '/blog/b', kind: 'edit', hash: 'h1', subject: 'first' },
  ]);
  assert.equal(entries.length, 3);
  assert.deepEqual(entries[0].commits, [
    { hash: 'h1', subject: 'first' },
    { hash: 'h2', subject: 'second' },
  ]);
});

test('detectKind: publish vs edit', () => {
  assert.equal(detectKind({ existsInParent: false, parentDraft: false }), 'publish');
  assert.equal(detectKind({ existsInParent: true, parentDraft: true }), 'publish');
  assert.equal(detectKind({ existsInParent: true, parentDraft: false }), 'edit');
});

test('isLive: draft false or no draft key is live, draft true is not', () => {
  assert.equal(isLive('---\ntitle: x\ndraft: false\n---\nbody'), true);
  assert.equal(isLive('---\ntitle: x\n---\nbody'), true);
  assert.equal(isLive('---\ntitle: x\ndraft: true\n---\nbody'), false);
});

test('parseGitLog keeps A/M/R content files, drops D and other paths, oldest first', () => {
  const log = [
    '@@h2\t2026-10-20\tsecond',
    'M\tsrc/data/post/a.mdx',
    'D\tsrc/data/post/gone.md',
    'M\tsrc/pages/index.astro',
    'R087\tsrc/data/article/old.md\tsrc/data/article/new.md',
    '',
    '@@h1\t2026-10-19\tfirst\twith tab',
    'A\tsrc/data/post/a.mdx',
  ].join('\n');
  const commits = parseGitLog(log);
  assert.deepEqual(
    commits.map((c) => c.hash),
    ['h1', 'h2']
  );
  assert.equal(commits[0].subject, 'first\twith tab');
  assert.deepEqual(
    commits[1].files.map((f) => [f.status, f.path, f.oldPath]),
    [
      ['M', 'src/data/post/a.mdx', 'src/data/post/a.mdx'],
      ['R', 'src/data/article/new.md', 'src/data/article/old.md'],
    ]
  );
});

test('already-judged entries are excluded from due', () => {
  const entries = [
    { date: '2026-10-01', slug: 'a', kind: 'edit', commits: [], notes: [] },
    { date: '2026-10-01', slug: 'b', kind: 'edit', commits: [], notes: [] },
    { date: '2026-10-01', slug: 'c', kind: 'publish', commits: [], notes: [] },
    { date: '2026-10-01', slug: 'd', kind: 'manual', commits: [], notes: ['x'] },
  ];
  const due = dueEntries(entries, [{ slug: 'a', changeDate: '2026-10-01' }], '2026-11-30');
  assert.deepEqual(
    due.map((e) => e.slug),
    ['b', 'd']
  );
  assert.equal(groupByDate(due).length, 1);
});

test('notes attach to a matching entry or become manual entries', () => {
  const entries = [{ date: '2026-10-19', slug: 'a', url: '/blog/a', kind: 'edit', commits: [], notes: [] }];
  const out = attachNotes(
    entries,
    [
      { date: '2026-10-19', slug: 'a', text: 'matched' },
      { date: '2026-10-22', slug: 'a', text: 'orphan' },
    ],
    (s) => `/blog/${s}`
  );
  assert.deepEqual(out[0].notes, ['matched']);
  assert.equal(out[1].kind, 'manual');
  assert.equal(out[1].url, '/blog/a');
});

test('overlap flags another edit or publish of the same slug within 28 days', () => {
  const e = (date, slug, kind = 'edit') => ({ date, slug, kind, commits: [], notes: [] });
  const out = flagOverlaps([e('2026-10-01', 'a'), e('2026-10-29', 'a'), e('2026-12-01', 'a'), e('2026-10-01', 'b')]);
  assert.deepEqual(
    out.map((x) => x.overlapping),
    [true, true, false, false]
  );
});

test('row-shape parser accepts a whole MCP response, {rows}, and a bare array', () => {
  const rows = [{ keys: ['https://simplescheduleai.com/blog/a'], clicks: 1, impressions: 10, ctr: 0.1, position: 5 }];
  assert.deepEqual(extractRows(rows), rows);
  assert.deepEqual(extractRows({ rows }), rows);
  assert.deepEqual(extractRows({ result: JSON.stringify({ rows }) }), rows);
  assert.deepEqual(extractRows(JSON.stringify(rows)), rows);
  assert.equal(extractRows({ nope: 1 }), null);
});

test('metricsFor matches trailing slash, sums variants, and returns zeros when missing', () => {
  const rows = [
    { keys: ['https://simplescheduleai.com/blog/a'], clicks: 2, impressions: 100, position: 10 },
    { keys: ['https://simplescheduleai.com/blog/a/'], clicks: 2, impressions: 300, position: 6 },
    { keys: ['https://simplescheduleai.com/blog/other'], clicks: 9, impressions: 900, position: 1 },
  ];
  const got = metricsFor(rows, '/blog/a');
  assert.equal(got.clicks, 4);
  assert.equal(got.impressions, 400);
  assert.equal(got.position, 7);
  assert.equal(got.ctr, 0.01);
  assert.deepEqual(metricsFor(rows, '/blog/missing'), { clicks: 0, impressions: 0, ctr: 0, position: 0 });
});

// ---------------------------------------------------------------- site control + batches

const mm = (clicks, impressions, position) => ({
  clicks,
  impressions,
  ctr: impressions ? clicks / impressions : 0,
  position,
});

test('siteTotals sums every row in a pull', () => {
  assert.deepEqual(
    siteTotals([
      { clicks: 2, impressions: 100 },
      { clicks: 3, impressions: 50 },
    ]),
    { clicks: 5, impressions: 150 }
  );
});

test('aggregate sums pages with impression-weighted position', () => {
  const a = aggregate([mm(10, 100, 5), mm(0, 300, 9)]);
  assert.equal(a.impressions, 400);
  assert.equal(a.clicks, 10);
  assert.equal(a.position, 8);
});

test('a page that only rode site-wide growth reads flat with the site control', () => {
  const site = { before: { impressions: 1000 }, after: { impressions: 1150 } }; // site +15%
  const r = classify(mm(20, 400, 8), mm(24, 480, 8), site); // page +20%, relative +5%
  assert.equal(r.verdict, 'flat');
  assert.equal(r.siteImpPct, 0.15);
  assert.equal(r.relImpPct, 0.05);
  const noControl = classify(mm(20, 400, 8), mm(24, 480, 8));
  assert.ok(noControl.signals.includes('impressions-up'));
});

test('a page beating the site by 20 points still reads impressions-up', () => {
  const site = { before: { impressions: 1000 }, after: { impressions: 1150 } };
  const r = classify(mm(20, 400, 8), mm(30, 540, 8), site); // page +35%, relative +20%
  assert.ok(r.signals.includes('impressions-up'));
});

test('a page shrinking while the site grows reads lost-demand', () => {
  const site = { before: { impressions: 1000 }, after: { impressions: 1150 } };
  const r = classify(mm(20, 400, 8), mm(20, 400, 8.2), site); // page flat, relative -15%... not enough
  assert.equal(r.dropType, null);
  const r2 = classify(mm(20, 400, 8), mm(18, 360, 8.2), site); // page -10%, relative -25%
  assert.equal(r2.dropType, 'lost-demand');
});

test('rowsForWindow slices a daily page,date pull into one window per page', () => {
  const daily = [
    { keys: ['https://simplescheduleai.com/blog/a', '2026-10-01'], clicks: 1, impressions: 100, position: 4 },
    { keys: ['https://simplescheduleai.com/blog/a', '2026-10-02'], clicks: 3, impressions: 300, position: 8 },
    { keys: ['https://simplescheduleai.com/blog/a', '2026-10-05'], clicks: 9, impressions: 900, position: 2 },
    { keys: ['https://simplescheduleai.com/blog/b', '2026-10-02'], clicks: 0, impressions: 50, position: 20 },
  ];
  const rows = rowsForWindow(daily, '2026-10-01', '2026-10-02');
  const a = rows.find((r) => r.keys[0].endsWith('/a'));
  assert.equal(a.impressions, 400);
  assert.equal(a.clicks, 4);
  assert.equal(a.position, 7);
  assert.equal(rows.length, 2);
  assert.deepEqual(dailySpan(daily), { min: '2026-10-01', max: '2026-10-05' });
});

test('metricsFor folds section-link rows (page#heading) into the page', () => {
  const rows = [
    { page: 'https://simplescheduleai.com/blog/a', clicks: 2, impressions: 100, position: 8 },
    { page: 'https://simplescheduleai.com/blog/a#some-heading', clicks: 0, impressions: 50, position: 6 },
    { page: 'https://simplescheduleai.com/blog/ab', clicks: 9, impressions: 900, position: 1 },
  ];
  const got = metricsFor(rows, '/blog/a');
  assert.equal(got.impressions, 150);
  assert.equal(got.clicks, 2);
});

test('controlFor uses the median page change, so one breakout page cannot move it', () => {
  const S = 'https://simplescheduleai.com/blog/';
  const pg = (p, i) => ({ page: S + p, impressions: i });
  const before = [pg('a', 100), pg('b', 100), pg('c', 100), pg('d', 100), pg('e', 1000), pg('tiny', 10)];
  const after = [pg('a', 110), pg('b', 110), pg('c', 110), pg('d', 110), pg('e', 5000), pg('tiny', 99)];
  const c = controlFor(before, after);
  assert.equal(c.pages, 5);
  assert.ok(Math.abs(c.impPct - 0.1) < 1e-9);
  const r = classify(
    { clicks: 1, impressions: 200, ctr: 0.005, position: 8 },
    { clicks: 1, impressions: 220, ctr: 0.0045, position: 8 },
    c
  );
  assert.equal(r.verdict, 'flat');
  assert.equal(controlFor(before.slice(0, 3), after.slice(0, 3)), null);
});

test('opposite signals give a mixed verdict, keeping the drop type', () => {
  // up 7.5 positions, but impressions 30 points behind the control
  const r = classify(
    { clicks: 0, impressions: 400, ctr: 0, position: 26 },
    { clicks: 0, impressions: 460, ctr: 0, position: 18.5 },
    { impPct: 0.45 }
  );
  assert.ok(r.signals.includes('ranking-up'));
  assert.equal(r.dropType, 'lost-demand');
  assert.equal(r.verdict, 'mixed');
});
