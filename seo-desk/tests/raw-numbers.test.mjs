// The raw numbers: the Search Console end date and windows, real per-search counts, and keyword
// matching. Every search phrase, page and number here is invented.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-raw-'));
const DATA = path.join(root, 'data');
const REPO = path.join(root, 'repo');
fs.mkdirSync(path.join(REPO, 'docs/seo'), { recursive: true });
process.env.SEO_DESK_DATA = DATA;
process.env.SEO_DESK_REPO = REPO;
process.env.SEO_DESK_TODAY = '2026-11-14';

const { pullGsc, capSnapshot, gscEnd } = await import('../lib/sources/gsc.mjs');
const { addDays, daysBetween } = await import('../lib/dates.mjs');
const { buildModel, invalidate } = await import('../lib/api/model.mjs');
const { windowsFor, queriesTable } = await import('../lib/api/search.mjs');
const { overviewView } = await import('../lib/api/ext/overview.mjs');
const { storedExplore, resolveRange } = await import('../lib/explore.mjs');
const { pct, sumRange } = await import('../lib/api/fmt.mjs');

test.after(() => fs.rmSync(root, { recursive: true, force: true }));

// ---------------------------------------------------------------- helpers

const dates = (from, to) => {
  const out = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
};
// A daily figure that changes from day to day, so a window moved by one day sums differently.
const dayImp = (d) => 100 + (Number(d.slice(8, 10)) % 5) * 7;
const dayClicks = (d) => 1 + (Number(d.slice(8, 10)) % 3);

function writeSnap(source, snap) {
  fs.mkdirSync(path.join(DATA, 'snap'), { recursive: true });
  fs.writeFileSync(path.join(DATA, 'snap', `${source}.json`), JSON.stringify(snap));
  invalidate();
}

// A fake Search Console session: daily rows for every asked day except the days in `missing`
// (Search Console has not finished them), and the same few rows for every other report.
function fakeSession({ missing = [] } = {}) {
  const calls = [];
  return {
    calls,
    async call(tool, args) {
      calls.push(args);
      const days = dates(args.start_date, args.end_date).filter((d) => !missing.includes(d));
      if (args.dimensions === 'date')
        return {
          rows: days.map((date) => ({ date, clicks: dayClicks(date), impressions: dayImp(date), position: 9 })),
        };
      if (args.dimensions === 'page,date')
        return {
          rows: days.map((date) => ({
            page: 'https://simplescheduleai.com/blog/x',
            date,
            clicks: 1,
            impressions: 20,
            position: 8,
          })),
        };
      if (args.dimensions === 'country') return { rows: [{ country: 'usa', clicks: 2, impressions: 50, position: 9 }] };
      if (args.dimensions === 'device')
        return { rows: [{ device: 'MOBILE', clicks: 2, impressions: 50, position: 9 }] };
      if (args.dimensions === 'query')
        return { rows: [{ query: 'made up search', clicks: 1, impressions: 40, position: 7 }] };
      return {
        rows: [
          {
            query: 'made up search',
            page: 'https://simplescheduleai.com/blog/x',
            clicks: 1,
            impressions: 40,
            position: 7,
          },
        ],
      };
    },
    close() {},
  };
}

// ---------------------------------------------------------------- A1: the end date

test('pullGsc ends every window on the newest day Search Console really returned', async () => {
  // Today minus 3 is 11 November; Search Console has not finished that day.
  const s = fakeSession({ missing: ['2026-11-11'] });
  const snap = await pullGsc({ today: '2026-11-14', session: s });
  assert.equal(snap.through, '2026-11-10');
  const w = snap.data.windows;
  assert.deepEqual(w.cur, { start: '2026-10-14', end: '2026-11-10' });
  assert.deepEqual(w.prev, { start: '2026-09-16', end: '2026-10-13' });
  assert.equal(w.d90.end, '2026-11-10');
  assert.equal(daysBetween(w.cur.start, w.cur.end), daysBetween(w.prev.start, w.prev.end));
  // The daily pull asks up to today minus 3; every report after it asks for the corrected windows.
  assert.equal(s.calls[0].dimensions, 'date');
  assert.equal(s.calls[0].end_date, '2026-11-11');
  for (const c of s.calls.slice(1)) assert.ok(c.end_date <= '2026-11-10', `${c.dimensions} ends ${c.end_date}`);
  const qCalls = s.calls.filter((c) => c.dimensions === 'query');
  assert.deepEqual(
    qCalls.map((c) => [c.start_date, c.end_date]),
    [
      ['2026-10-14', '2026-11-10'],
      ['2026-09-16', '2026-10-13'],
      ['2026-08-13', '2026-11-10'],
    ]
  );
  assert.equal(snap.data.query90.length, 1);

  // The overview built on it: a full 7 days, and the change is the full-day one.
  writeSnap('gsc', snap);
  const model = buildModel();
  const v = overviewView(model, 7);
  assert.deepEqual([v.range.start, v.range.end], ['2026-11-04', '2026-11-10']);
  assert.equal(v.series.length, 7);
  const imp = v.tiles.find((t) => t.key === 'impressions');
  const sum = (from, to) => dates(from, to).reduce((a, d) => a + dayImp(d), 0);
  assert.equal(imp.value, sum('2026-11-04', '2026-11-10'));
  assert.equal(imp.change, pct(sum('2026-11-04', '2026-11-10'), sum('2026-10-28', '2026-11-03')));
});

test('pullGsc keeps today minus 3 when that day has data', async () => {
  const snap = await pullGsc({ today: '2026-11-14', session: fakeSession() });
  assert.equal(snap.through, '2026-11-11');
  assert.equal(snap.data.windows.cur.end, '2026-11-11');
});

// An older snapshot on disk: `through` and the stored windows say 11 November, but no daily row has it.
function oldSnapshot() {
  const siteDaily = dates('2026-06-01', '2026-11-10').map((date) => ({
    date,
    clicks: dayClicks(date),
    impressions: dayImp(date),
    position: 9,
  }));
  const pageDaily = dates('2026-07-15', '2026-11-10').map((date) => ({
    date,
    page: '/blog/x',
    clicks: 1,
    impressions: 20,
    position: 8,
  }));
  const q = [{ query: 'made up search', clicks: 1, impressions: 40, position: 7 }];
  return {
    source: 'gsc',
    ok: true,
    status: 'fresh',
    pulledAt: '2026-11-14T00:30:00.000Z',
    through: '2026-11-11',
    error: null,
    data: {
      siteDaily,
      pageDaily,
      qpCur: [{ ...q[0], page: '/blog/x' }],
      qpPrev: [],
      qp90: [{ ...q[0], page: '/blog/x' }],
      queryCur: q,
      queryPrev: q,
      countries: [],
      devices: [],
      windows: {
        cur: { start: '2026-10-15', end: '2026-11-11' },
        prev: { start: '2026-09-17', end: '2026-10-14' },
        d90: { start: '2026-08-14', end: '2026-11-11' },
      },
    },
  };
}

test('an older snapshot whose last day is missing: every window ends on the newest daily row', () => {
  const old = oldSnapshot();
  assert.equal(gscEnd(old.data, old.through), '2026-11-10');
  const capped = capSnapshot(old);
  assert.equal(capped.through, '2026-11-10');
  assert.deepEqual(capped.data.windows.cur, { start: '2026-10-15', end: '2026-11-10' });
  assert.deepEqual(capped.data.windows.prev, old.data.windows.prev);
  assert.equal(capped.data.windows.d90.end, '2026-11-10');
  // A snapshot whose last day is there is left alone.
  const whole = { ...old, through: '2026-11-10' };
  assert.equal(capSnapshot(whole), whole);

  writeSnap('gsc', old);
  const model = buildModel();
  assert.equal(model.snapObjs.gsc.through, '2026-11-10');
  assert.equal(model.range.end, '2026-11-10');
  const w7 = windowsFor(model, 7);
  assert.deepEqual(w7.cur, { start: '2026-11-04', end: '2026-11-10' });
  assert.deepEqual(w7.prev, { start: '2026-10-28', end: '2026-11-03' });
  // windowsFor also caps a model built by hand from the raw snapshot.
  const hand = { snapObjs: { gsc: old }, data: { gsc: old.data }, range: old.data.windows.cur };
  assert.equal(windowsFor(hand, 28).cur.end, '2026-11-10');

  // The stored searches were pulled up to 11 November. The label now stops on the 10th, which is
  // harmless only because the 11th has no rows: the daily totals agree either way.
  const t = queriesTable(model, 28);
  assert.equal(t.range.end, '2026-11-10');
  assert.equal(
    old.data.siteDaily.some((r) => r.date === '2026-11-11'),
    false
  );
  assert.equal(
    sumRange(old.data.siteDaily, '2026-10-15', '2026-11-10', 'impressions'),
    sumRange(old.data.siteDaily, '2026-10-15', '2026-11-11', 'impressions')
  );

  const v = overviewView(model, 7);
  assert.equal(v.series.length, 7);
  assert.equal(v.through, '2026-11-10');
});

test('the stored explorer caps its end at the newest daily row', () => {
  const old = oldSnapshot();
  const pages = storedExplore(old.data, { through: old.through, dim: 'page', days: 7 });
  assert.deepEqual([pages.range.start, pages.range.end], ['2026-11-04', '2026-11-10']);
  assert.deepEqual([pages.range.prevStart, pages.range.prevEnd], ['2026-10-28', '2026-11-03']);
  const queries = storedExplore(old.data, { through: old.through, dim: 'query', days: 28 });
  assert.equal(queries.range.end, '2026-11-10');
});

test('live explorer ranges end on the stored end date, not today minus 3', () => {
  const r = resolveRange('7', '2026-11-14', { through: '2026-11-10' });
  assert.deepEqual([r.start, r.end, r.prevStart, r.prevEnd], ['2026-11-04', '2026-11-10', '2026-10-28', '2026-11-03']);
  assert.equal(resolveRange('this-month', '2026-11-14', { through: '2026-11-10' }).end, '2026-11-10');
  assert.throws(
    () =>
      resolveRange({ range: 'custom', start: '2026-11-01', end: '2026-11-11' }, '2026-11-14', {
        through: '2026-11-10',
      }),
    /on or before/
  );
  // With no stored end date, today minus 3 stands.
  assert.equal(resolveRange('7', '2026-11-14').end, '2026-11-11');
});

// ---------------------------------------------------------------- A2 and B2: real per-search counts

const { realQueryCounts } = await import('../lib/query-counts.mjs');
const { normGscRows } = await import('../lib/sources/gsc.mjs');
const { discovered } = await import('../lib/targets.mjs');

// One search that showed two pages: the query and page rows add to 55, the search was shown 35 times.
const TWO_PAGES = [
  { query: 'made up search', page: '/blog/a', clicks: 2, impressions: 30, position: 4 },
  { query: 'made up search', page: '/blog/b', clicks: 1, impressions: 25, position: 9 },
  { query: 'other made up search', page: '/blog/b', clicks: 0, impressions: 22, position: 12 },
];
const REAL = [
  { query: 'made up search', clicks: 3, impressions: 35, position: 5 },
  { query: 'other made up search', clicks: 0, impressions: 22, position: 12 },
];

test('realQueryCounts gives the query-only counts by search, and null when that pull is missing', () => {
  const gsc = { queryCur: REAL, queryPrev: [], query90: [{ ...REAL[0], query: ' Made Up Search ' }] };
  const cur = realQueryCounts(gsc, 'cur');
  assert.equal(cur.size, 2);
  assert.deepEqual(cur.get('made up search'), { query: 'made up search', impressions: 35, clicks: 3, position: 5 });
  assert.equal(realQueryCounts(gsc, 'prev').size, 0);
  assert.equal(realQueryCounts(gsc, 'd90').get('made up search').impressions, 35);
  assert.equal(realQueryCounts({ queryCur: REAL }, 'd90'), null);
  assert.equal(realQueryCounts(null, 'cur'), null);
  assert.throws(() => realQueryCounts(gsc, 'week'), /cur, prev or d90/);
});

function snapWith(dataOver = {}) {
  const old = oldSnapshot();
  return { ...old, through: '2026-11-10', data: { ...old.data, ...dataOver } };
}

test('the 90-day and 16-month search lists use the query-only pull, never a sum of page rows', () => {
  writeSnap('gsc', snapWith({ qp90: TWO_PAGES, query90: REAL }));
  const model = buildModel();
  for (const days of [90, 480]) {
    const t = queriesTable(model, days);
    const row = t.rows.find((r) => r.query === 'made up search');
    assert.equal(row.impressions, 35);
    assert.equal(row.clicks, 3);
    assert.equal(row.topPage, '/blog/a');
    assert.equal(t.summed, false);
  }
  const ov = overviewView(model, 90);
  assert.equal(ov.topQueries.find((r) => r.query === 'made up search').impressions, 35);
  const ex = storedExplore(model.data.gsc, { through: '2026-11-10', dim: 'query', days: 90 });
  assert.equal(ex.totals.impressions, 57);
  assert.equal(ex.rows.find((r) => r.key === 'made up search').impressions, 35);
});

test('an older snapshot with no query-only 90-day pull says its counts are summed across pages', () => {
  writeSnap('gsc', snapWith({ qp90: TWO_PAGES, query90: undefined }));
  const model = buildModel();
  const t = queriesTable(model, 90);
  assert.equal(t.summed, true);
  assert.equal(t.rows.find((r) => r.query === 'made up search').impressions, 55);
  assert.match(overviewView(model, 90).queriesNote, /added up across pages/);
  // The stored explorer gives no answer, so the route pulls the real counts live instead.
  assert.equal(storedExplore(model.data.gsc, { through: '2026-11-10', dim: 'query', days: 90 }), null);
});

test('normGscRows: address variants of one page for the same search take the largest count, not the sum', () => {
  const rows = normGscRows(
    [
      {
        query: 'made up search',
        page: 'https://simplescheduleai.com/blog/x/',
        clicks: 2,
        impressions: 100,
        position: 4,
      },
      {
        query: 'made up search',
        page: 'https://simplescheduleai.com/blog/x#part',
        clicks: 1,
        impressions: 300,
        position: 8,
      },
      {
        query: 'made up search',
        page: 'https://simplescheduleai.com/blog/x',
        clicks: 0,
        impressions: 120,
        position: 12,
      },
      { query: 'made up search', page: 'https://simplescheduleai.com/blog/y', clicks: 1, impressions: 10, position: 6 },
    ],
    'query,page'
  );
  const x = rows.find((r) => r.page === '/blog/x');
  assert.deepEqual(x, { query: 'made up search', page: '/blog/x', clicks: 3, impressions: 300, position: 8 });
  assert.equal(rows.length, 2);
  // Without a search in the rows (pages by day), the variants still add up as before.
  const daily = normGscRows(
    [
      { keys: ['https://simplescheduleai.com/blog/x/', '2026-11-01'], clicks: 1, impressions: 10, position: 3 },
      { keys: ['https://simplescheduleai.com/blog/x', '2026-11-01'], clicks: 1, impressions: 30, position: 7 },
    ],
    'page,date'
  );
  assert.equal(daily[0].impressions, 40);
});

test('discovered searches carry the real count, the same unit as targeted rows', () => {
  const found = discovered({ qpCur: TWO_PAGES, queryCur: REAL, targets: [], minImpressions: 20 });
  const row = found.find((d) => d.query === 'made up search');
  assert.equal(row.impressions, 35);
  assert.equal(row.position, 5);
  assert.equal(row.rankingPage, '/blog/a');
  // 22 real views: listed; a search whose page rows add past 20 but whose real count is under it is not.
  const under = discovered({
    qpCur: [
      { query: 'thin made up search', page: '/blog/a', clicks: 0, impressions: 12, position: 30 },
      { query: 'thin made up search', page: '/blog/b', clicks: 0, impressions: 11, position: 31 },
    ],
    queryCur: [{ query: 'thin made up search', clicks: 0, impressions: 14, position: 30 }],
    minImpressions: 20,
  });
  assert.equal(under.length, 0);
});

// ---------------------------------------------------------------- B4: matching a search to a target

const T = await import('../lib/targets.mjs');
const { targetRows } = await import('../lib/api/ext/targets.mjs');

test('matchKey folds an article, a year, hyphens, word order and word endings, and keeps digits', () => {
  const same = (a, b) => assert.equal(T.matchKey(a), T.matchKey(b), `${a} | ${b}`);
  const differ = (a, b) => assert.notEqual(T.matchKey(a), T.matchKey(b), `${a} | ${b}`);
  same('the made-up ward rota', 'made up ward rota');
  same('made up ward rota 2026', 'made up ward rota');
  same('an invented rota', 'invented rota');
  same('rota for weekends', 'weekends rota for');
  same('invented rota schedule', 'invented rota scheduling');
  same('invented rota schedules', 'invented rota scheduling');
  same('invented nurse rota', 'invented nurses rota');
  same('Invented, Rota!', 'invented rota');
  differ('8 hour rota blocks', '12 hour rota blocks');
  differ('rota 2019', 'rota');
  assert.match(T.matchKey('8 hour rota blocks'), /\b8\b/);
  assert.equal(T.matchKey('the a an'), '');
});

const VARIANT_QP = [
  { query: 'made up ward rota', page: '/blog/a', clicks: 2, impressions: 41, position: 8 },
  { query: 'made up ward rota 2026', page: '/blog/a', clicks: 0, impressions: 22, position: 11 },
];
const VARIANT_Q = [
  { query: 'made up ward rota', clicks: 2, impressions: 41, position: 8 },
  { query: 'made up ward rota 2026', clicks: 0, impressions: 22, position: 11 },
];

test('a target written with "the" matches the search Google returns without it', () => {
  const target = { keyword: 'the made up ward rota', page: '/blog/a' };
  assert.equal(T.labelTarget(target, VARIANT_QP), 'right page');
  // Its other forms are the target's own, so they are not offered as new searches.
  assert.deepEqual(T.discovered({ qpCur: VARIANT_QP, queryCur: VARIANT_Q, targets: [target], minImpressions: 20 }), []);
  const model = {
    data: { gsc: { qpCur: VARIANT_QP, queryCur: VARIANT_Q } },
    targetState: T.emptyState(),
    targets: [{ ...target, origin: 'registry', priority: null, intentGroup: null }],
  };
  const row = targetRows(model).rows[0];
  assert.equal(row.impressions, 41);
  assert.equal(row.position, 8);
  assert.equal(row.rankingPage, '/blog/a');
});

test('an exact match wins over a folded one', () => {
  const qp = [
    { query: 'invented rota', page: '/blog/a', clicks: 0, impressions: 12, position: 9 },
    { query: 'invented rotas', page: '/blog/b', clicks: 0, impressions: 80, position: 5 },
  ];
  const q = [
    { query: 'invented rota', clicks: 0, impressions: 12, position: 9 },
    { query: 'invented rotas', clicks: 0, impressions: 80, position: 5 },
  ];
  const model = {
    data: { gsc: { qpCur: qp, queryCur: q } },
    targetState: T.emptyState(),
    targets: [{ keyword: 'invented rota', page: '/blog/a', origin: 'registry', priority: null, intentGroup: null }],
  };
  const row = targetRows(model).rows[0];
  assert.equal(row.impressions, 12);
  assert.equal(row.rankingPage, '/blog/a');
  assert.equal(T.labelTarget({ keyword: 'invented rota', page: '/blog/a' }, qp), 'right page');
  // 8 hour shifts is never 12 hour shifts.
  assert.equal(
    T.labelTarget({ keyword: '8 hour made up shifts', page: '/blog/a' }, [
      { query: '12 hour made up shifts', page: '/blog/a', clicks: 0, impressions: 40, position: 5 },
    ]),
    'not returned'
  );
});

test('a priority set on a target reaches an opportunity about another form of its search', () => {
  const [o] = T.applySignals(
    [{ id: 'x', page: '/blog/z', query: 'made up ward rota 2026', signals: { importance: 0.4 }, signalNotes: {} }],
    { targets: [{ keyword: 'the made up ward rota', page: '/blog/a', priority: 'low' }] }
  );
  assert.equal(o.signals.importance, 0.2);
});

// ---------------------------------------------------------------- A3 to A12

const { movementOf, pageRows } = await import('../lib/api/search.mjs');
const { makeRoutes } = await import('../lib/api/ext/explore.mjs');

test('A8 and A12: new and gone need 20 views in the bigger period; nothing in either period has no word', () => {
  assert.equal(movementOf(25, 0), 'new');
  assert.equal(movementOf(5, 0), null);
  assert.equal(movementOf(0, 25), 'gone');
  assert.equal(movementOf(0, 3), null);
  assert.equal(movementOf(0, 0), null);
  assert.equal(movementOf(40, 30), 'growing');
  assert.equal(movementOf(20, 30), 'slipping');
  assert.equal(movementOf(31, 30), 'steady');
  // Under 20 views before, a change cannot be judged, so no word either.
  assert.equal(movementOf(300, 10), null);
  assert.equal(movementOf(5, 0, false), null);
});

test('A12: a live page Google never showed in either period has no movement word', () => {
  writeSnap('gsc', snapWith({}));
  writeSnap('local', {
    source: 'local',
    ok: true,
    status: 'fresh',
    pulledAt: '2026-11-14T00:30:00.000Z',
    through: '2026-11-14',
    error: null,
    data: { livePages: [{ page: '/blog/x' }, { page: '/blog/quiet' }], registry: [] },
  });
  const rows = pageRows(buildModel());
  assert.equal(rows.find((r) => r.page === '/blog/quiet').movement, null);
  assert.equal(rows.find((r) => r.page === '/blog/x').movement, 'steady');
  fs.rmSync(path.join(DATA, 'snap', 'local.json'));
  invalidate();
});

test('A4: the click rate change subtracts the unrounded rates, then rounds', () => {
  // This week 749 clicks from 100,000 (0.749%), the week before 651 from 100,000 (0.651%). Both
  // round to 0.7%, but the change is +0.1 points, not 0.
  const siteDaily = dates('2026-10-01', '2026-11-10').map((date) => ({
    date,
    clicks: date === '2026-11-10' ? 749 : date === '2026-11-03' ? 651 : 0,
    impressions: date === '2026-11-10' || date === '2026-11-03' ? 100000 : 0,
    position: 9,
  }));
  writeSnap('gsc', snapWith({ siteDaily }));
  const tile = overviewView(buildModel(), 7).tiles.find((t) => t.key === 'clickRate');
  assert.equal(tile.valueText, '0.7%');
  assert.equal(tile.change, 0.1);
});

// A fake Search Console server for the live routes: the search's days and its pages.
function fakeOpen(calls = []) {
  return async () => ({
    async call(tool, args) {
      calls.push(args);
      if (args.dimensions === 'date')
        return {
          rows: [
            { date: '2026-11-08', clicks: 1, impressions: 30, position: 4 },
            { date: '2026-11-09', clicks: 0, impressions: 10, position: 8 },
          ],
        };
      return {
        rows: [
          { page: 'https://simplescheduleai.com/blog/a', clicks: 1, impressions: 30, position: 4 },
          { page: 'https://simplescheduleai.com/blog/b', clicks: 0, impressions: 25, position: 9 },
        ],
      };
    },
    close() {},
  });
}
const routeOf = (rs, p) => (query) => rs.find((r) => r.path === p).handler({ url: new URL(`http://x${p}?${query}`) });

test('A5: the search detail returns its own totals from its dated pull, not a sum of its page rows', async () => {
  writeSnap('gsc', snapWith({}));
  const calls = [];
  const detail = routeOf(makeRoutes({ open: fakeOpen(calls) }), '/api/search-detail');
  const d = await detail('query=made%20up%20search&range=7');
  assert.deepEqual(d.totals, { impressions: 40, clicks: 1, position: 5 });
  // The live range ends on the stored end date.
  assert.equal(d.range.end, '2026-11-10');
  assert.ok(calls.every((c) => c.end_date === '2026-11-10'));
});

test('A10: the stored Pages explorer gives the site total for the same dates beside the page impressions', async () => {
  writeSnap('gsc', snapWith({}));
  const explore = routeOf(makeRoutes({ open: fakeOpen() }), '/api/explore');
  const r = await explore('dim=page&range=7');
  assert.equal(r.source, 'stored');
  assert.equal(r.totals.impressions, 140);
  const site = dates('2026-11-04', '2026-11-10').reduce((a, d) => a + dayImp(d), 0);
  assert.deepEqual(r.siteTotals, {
    impressions: site,
    clicks: dates('2026-11-04', '2026-11-10').reduce((a, d) => a + dayClicks(d), 0),
  });
  // With a filter the site total is not for the same rows, so none is given.
  const f = await explore('dim=page&range=7&country=usa');
  assert.equal(f.siteTotals, null);
  // Searches have no site total beside them.
  assert.equal((await explore('dim=query&range=28')).siteTotals, null);
});

// ---------------------------------------------------------------- the pages' own helpers

const drawer = await import('../static/views/search-drawer.js');
const overviewPage = await import('../static/views/overview.js');
const pagesPage = await import('../static/views/pages.js');

test('A5 and A6: the search drawer prints the list row with the list dates, else the pull totals with its dates', () => {
  const listRange = { start: '2026-10-14', end: '2026-11-10', text: '14 October to 10 November' };
  const detail = {
    range: { start: '2026-11-04', end: '2026-11-10', text: '4 to 10 November' },
    totals: { impressions: 40, clicks: 1, position: 5 },
    pages: [{ impressions: 30 }, { impressions: 25 }],
  };
  const row = { impressions: 35, clicks: 3, position: 5.5 };
  assert.deepEqual(drawer.drawerNumbers({ own: row, rowRange: listRange, detail }), {
    impressions: 35,
    clicks: 3,
    position: 5.5,
    rangeText: '14 October to 10 November',
  });
  // No list dates (a keyword row, or a filtered list): every number is the pull's, under its dates.
  assert.deepEqual(drawer.drawerNumbers({ own: row, rowRange: null, detail }), {
    impressions: 40,
    clicks: 1,
    position: 5,
    rangeText: '4 to 10 November',
  });
  assert.equal(drawer.drawerNumbers({ own: null, rowRange: null, detail: null }), null);
});

test('A3: the target position tile prints its own dates when the range is not 28 days', () => {
  const t = {
    key: 'targetPosition',
    range: { start: '2026-10-14', end: '2026-11-10', text: '14 October to 10 November' },
  };
  assert.match(overviewPage.tileRangeLine(t, 7), /14 October to 10 November/);
  assert.match(overviewPage.tileRangeLine(t, 90), /14 October to 10 November/);
  assert.equal(overviewPage.tileRangeLine(t, 28), null);
  assert.equal(overviewPage.tileRangeLine({ ...t, key: 'clicks' }, 7), null);
});

test('A9 and A10: the Pages tiles count the list shown and name its period; the summary says page impressions', () => {
  const items = [{ movement: 'growing' }, { movement: 'slipping' }, { movement: 'slipping' }, { movement: null }];
  const range = { start: '2026-11-04', end: '2026-11-10', text: '4 to 10 November' };
  const tiles = pagesPage.movementTiles(items, range);
  assert.equal(tiles.growing.value, 1);
  assert.equal(tiles.decaying.value, 2);
  assert.match(tiles.growing.sub, /4 to 10 November/);
  assert.match(tiles.decaying.sub, /4 to 10 November/);
  const text = pagesPage.summaryText({
    totals: { count: 2, impressions: 140, clicks: 3 },
    rows: [],
    range,
    siteTotals: { impressions: 700, clicks: 9 },
  });
  assert.match(text, /140 page impressions/);
  assert.match(text, /700 times/);
  assert.doesNotMatch(text, /[–—]/);
  assert.doesNotMatch(
    pagesPage.summaryText({ totals: { count: 2, impressions: 140, clicks: 3 }, rows: [], range }),
    /site/
  );
});
