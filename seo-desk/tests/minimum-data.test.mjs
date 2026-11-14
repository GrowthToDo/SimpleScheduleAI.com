import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// The anti-goal "a percentage built on tiny numbers": every change and every share the pages show
// comes from the server, which sends null under the minimum. Everything here is synthetic:
// invented pages, invented searches, a temp data folder. No network, no real server.

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-minimum-'));
const DATA = path.join(root, 'data');
const REPO = path.join(root, 'repo');
fs.mkdirSync(path.join(DATA, 'snap'), { recursive: true });
fs.mkdirSync(path.join(DATA, 'state'), { recursive: true });
fs.mkdirSync(path.join(REPO, 'docs/seo'), { recursive: true });
process.env.SEO_DESK_DATA = DATA;
process.env.SEO_DESK_REPO = REPO;
process.env.SEO_DESK_TODAY = '2026-11-10';

const { assemble, explore, searchDetail, resolveRange, SHARE_MIN_VIEWS } = await import('../lib/explore.mjs');
const { topicsOf, COMPETING_MIN_VIEWS, COMPETING_PAGE_MIN } = await import('../lib/topics.mjs');
const { makeRoutes: exploreRoutes } = await import('../lib/api/ext/explore.mjs');
const { routes: topicRoutes } = await import('../lib/api/ext/topics.mjs');
const { makeRoutes: coreRoutes } = await import('../lib/api.mjs');
const { invalidate } = await import('../lib/api/model.mjs');
const { THRESHOLDS } = await import('../lib/config.mjs');
const { addDays } = await import('../lib/dates.mjs');

after(() => fs.rmSync(root, { recursive: true, force: true }));

const MIN = THRESHOLDS.PCT_MIN_BASE;
const row = (query, page, impressions, position = 8, clicks = 0) => ({ query, page, impressions, position, clicks });

// ---------------------------------------------------------------- the explorer rows

test('assemble: every row carries a change, null when the earlier number is under the minimum', () => {
  const cur = [
    { query: 'grew from little', clicks: 0, impressions: 12, position: 9 },
    { query: 'grew from enough', clicks: 0, impressions: 120, position: 9 },
    { query: 'brand new', clicks: 0, impressions: 50, position: 9 },
  ];
  const prev = [
    { query: 'grew from little', clicks: 0, impressions: 1, position: 9 },
    { query: 'grew from enough', clicks: 0, impressions: 80, position: 9 },
    { query: 'gone small', clicks: 0, impressions: 4, position: 9 },
    { query: 'gone big', clicks: 0, impressions: 40, position: 9 },
  ];
  const out = assemble({ dim: 'query', cur, prev, comparable: true, truncated: false, limit: 100, ctrMin: 200 });
  const by = Object.fromEntries(out.rows.map((r) => [r.key, r]));
  assert.equal(by['grew from little'].change, null, '1 to 12 is never +1,100%');
  assert.equal(by['grew from enough'].change, 50);
  assert.equal(by['brand new'].change, null);
  assert.equal(by['gone small'].change, null);
  assert.equal(by['gone big'].change, -100);
  for (const r of out.rows) assert.ok('change' in r);

  const none = assemble({ dim: 'query', cur, prev: [], comparable: false, truncated: false, limit: 100, ctrMin: 200 });
  assert.ok(none.rows.every((r) => r.change === null));
});

test('explore: a cached answer saved before the change field existed still gets a gated change', async () => {
  const range = resolveRange('14', '2026-11-11');
  let calls = 0;
  const call = async (_tool, args) => {
    calls += 1;
    return args.start_date === range.start
      ? { rows: [{ query: 'tiny base', clicks: 0, impressions: 30, position: 4 }] }
      : { rows: [{ query: 'tiny base', clicks: 0, impressions: 2, position: 4 }] };
  };
  const first = await explore({ dim: 'query', range, filters: [], limit: 50 }, { call, now: 1000 });
  assert.equal(first.rows[0].change, null);
  // Strip the field from the cache file, as an entry written by the older code would be.
  const dir = path.join(DATA, 'cache/explore');
  for (const f of fs.readdirSync(dir)) {
    const e = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    for (const r of e.result.rows) delete r.change;
    fs.writeFileSync(path.join(dir, f), JSON.stringify(e));
  }
  const again = await explore({ dim: 'query', range, filters: [], limit: 50 }, { call, now: 2000 });
  assert.equal(again.cached, true);
  assert.equal(calls, 2);
  assert.ok('change' in again.rows[0]);
  assert.equal(again.rows[0].change, null);
});

// ---------------------------------------------------------------- one search's page shares

test('searchDetail: page shares are null when the search has under 30 views, cached or not', async () => {
  assert.equal(SHARE_MIN_VIEWS, 30);
  const range = resolveRange('28', '2026-11-11');
  const call = async (_tool, args) =>
    args.dimensions === 'page'
      ? {
          rows: [
            { page: 'https://simplescheduleai.com/blog/one', clicks: 0, impressions: 20, position: 5 },
            { page: 'https://simplescheduleai.com/blog/two', clicks: 0, impressions: 9, position: 9 },
          ],
        }
      : { rows: [] };
  const out = await searchDetail('rare invented search', range, { call, now: 10 });
  assert.ok(out.pages.every((p) => p.share === null));
  assert.equal(out.pages[0].impressions, 20, 'the counts are still there');

  const dir = path.join(DATA, 'cache/explore');
  for (const f of fs.readdirSync(dir)) {
    const e = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (!e.result.pages) continue;
    e.result.pages = e.result.pages.map((p) => ({ ...p, share: 0.69 }));
    fs.writeFileSync(path.join(dir, f), JSON.stringify(e));
  }
  const cached = await searchDetail('rare invented search', range, { call, now: 11 });
  assert.equal(cached.cached, true);
  assert.ok(
    cached.pages.every((p) => p.share === null),
    'an old cached share is gated again'
  );
});

// ---------------------------------------------------------------- topics

test('topicsOf: "pages compete" needs 30 views in the topic and 10 on each competing page; shares need 30', () => {
  assert.equal(COMPETING_MIN_VIEWS, 30);
  assert.equal(COMPETING_PAGE_MIN, 10);
  const mk = (a, b) =>
    topicsOf([row('invented rota phrase', '/a', a), row('best invented rota phrase', '/b', b)], { brands: [] })[0];
  assert.equal(mk(15, 14).competing, false, '29 views is too few');
  assert.ok(
    mk(15, 14).pages.every((p) => p.share === null),
    'no share under 30 views'
  );
  assert.equal(mk(20, 10).competing, true, '30 views, each page 10 or more');
  assert.equal(mk(20, 10).pages[0].share, 0.667);
  assert.equal(mk(40, 9).competing, false, 'a page under 10 views does not compete');
  assert.equal(mk(50, 50).competing, true);
});

// ---------------------------------------------------------------- every route

const THROUGH = '2026-11-07';
const dates = (from, to) => {
  const out = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
};

// One page with plenty of views, one that grows from almost nothing, one that disappears from
// almost nothing, one that disappears from a real number.
function pageDaily() {
  const rows = [];
  for (const date of dates('2026-08-01', THROUGH)) {
    const cur = date >= '2026-10-11';
    rows.push({ date, page: '/blog/busy-invented', clicks: 1, impressions: cur ? 30 : 20, position: 8 });
    if (cur && date === '2026-11-01')
      rows.push({ date, page: '/blog/tiny-invented', clicks: 0, impressions: 12, position: 30 });
    if (!cur && date === '2026-10-01')
      rows.push({ date, page: '/blog/tiny-invented', clicks: 0, impressions: 1, position: 30 });
    if (!cur && date === '2026-10-02')
      rows.push({ date, page: '/blog/gone-small', clicks: 0, impressions: 3, position: 40 });
    if (!cur && date === '2026-10-03')
      rows.push({ date, page: '/blog/gone-big', clicks: 0, impressions: 60, position: 40 });
  }
  return rows;
}

const QCUR = [
  row('busy invented search', '/blog/busy-invented', 400, 6),
  row('tiny invented search', '/blog/tiny-invented', 12, 20),
  row('shared invented words', '/blog/busy-invented', 15, 9),
  row('more shared invented words', '/blog/tiny-invented', 14, 9),
];
const QPREV = [
  row('busy invented search', '/blog/busy-invented', 300, 7),
  row('tiny invented search', '/blog/tiny-invented', 1, 20),
  row('small gone invented search', '/blog/busy-invented', 3, 30),
];
const byQuery = (rows) =>
  rows.map(({ query, clicks, impressions, position }) => ({ query, clicks, impressions, position }));

before(() => {
  const snap = (source, data) => ({
    source,
    ok: true,
    status: 'fresh',
    pulledAt: '2026-11-09T07:00:00.000Z',
    through: source === 'local' ? '2026-11-10' : THROUGH,
    error: null,
    data,
  });
  fs.writeFileSync(
    path.join(DATA, 'snap/gsc.json'),
    JSON.stringify(
      snap('gsc', {
        siteDaily: dates('2026-08-01', THROUGH).map((date) => ({ date, clicks: 1, impressions: 50, position: 9 })),
        pageDaily: pageDaily(),
        qpCur: QCUR,
        qpPrev: QPREV,
        qp90: QCUR,
        queryCur: byQuery(QCUR),
        queryPrev: byQuery(QPREV),
        countries: [],
        devices: [],
        windows: {
          cur: { start: '2026-10-11', end: THROUGH },
          prev: { start: '2026-09-13', end: '2026-10-10' },
          d90: { start: '2026-08-10', end: THROUGH },
        },
      })
    )
  );
  fs.writeFileSync(
    path.join(DATA, 'snap/local.json'),
    JSON.stringify(
      snap('local', {
        livePages: ['/blog/busy-invented', '/blog/tiny-invented', '/blog/gone-small', '/blog/gone-big'].map((page) => ({
          page,
          lastmod: '2026-10-01',
        })),
        registry: [],
        edits: [],
        inbound: {},
        verdicts: [
          {
            judgedOn: '2026-11-01',
            slug: 'tiny-invented',
            url: '/blog/tiny-invented',
            changeDate: '2026-10-02',
            kind: 'edit',
            before: { clicks: 0, impressions: 2, position: 30 },
            after: { clicks: 0, impressions: 13, position: 25 },
            siteImpPct: 0.01,
            verdict: 'insufficient-data',
          },
          {
            judgedOn: '2026-11-01',
            slug: 'busy-invented',
            url: '/blog/busy-invented',
            changeDate: '2026-10-02',
            kind: 'edit',
            before: { clicks: 4, impressions: 400, position: 9 },
            after: { clicks: 6, impressions: 500, position: 8 },
            siteImpPct: 0.01,
            verdict: 'better',
          },
        ],
      })
    )
  );
  fs.writeFileSync(
    path.join(DATA, 'snap/ga4.json'),
    JSON.stringify(
      snap('ga4', {
        channelsDaily: [
          { date: '2026-11-01', channel: 'Organic Search', sessions: 9 },
          { date: '2026-10-01', channel: 'Organic Search', sessions: 2 },
        ],
        landing: [],
        events: [],
      })
    )
  );
  invalidate();
});

const ctxOf = (p, query = '') => ({ url: new URL(`http://x${p}?${query}`), params: {} });
const handlerOf = (list, p) => list.find((r) => r.method === 'GET' && r.path === p).handler;

test('GET /api/search and /api/pages: no change on a page or search that grew from or fell from almost nothing', async () => {
  const core = coreRoutes({ jobs: { list: () => [], running: () => [] } });
  const search = await handlerOf(core, '/api/search')(ctxOf('/api/search', 'range=28'));
  const page = Object.fromEntries(search.pages.map((r) => [r.page, r]));
  assert.equal(page['/blog/tiny-invented'].change, null, 'grew from 1 view');
  assert.equal(page['/blog/gone-small'].change, null, 'fell from 3 views');
  assert.equal(page['/blog/gone-big'].change, -100);
  assert.equal(page['/blog/busy-invented'].change, 50);
  const q = Object.fromEntries(search.queries.map((r) => [r.query, r]));
  assert.equal(q['tiny invented search'].change, null);
  assert.equal(q['small gone invented search'].change, null, 'a search gone from 3 views is not -100%');
  assert.equal(q['busy invented search'].change, 33.3);

  const pages = await handlerOf(core, '/api/pages')(ctxOf('/api/pages'));
  assert.equal(pages.items.find((r) => r.page === '/blog/tiny-invented').change, null);
});

test('GET /api/explore: every row carries the server change, null under the minimum, for 7 days too', async () => {
  const get = (q) =>
    handlerOf(
      exploreRoutes({
        open: async () => {
          throw new Error('no live pull in this test');
        },
      }),
      '/api/explore'
    )(ctxOf('/api/explore', q));
  for (const q of ['dim=page&range=7', 'dim=page&range=28', 'dim=query&range=28']) {
    const out = await get(q);
    assert.equal(out.source, 'stored', q);
    assert.ok(out.rows.length > 0, q);
    for (const r of out.rows) {
      assert.ok('change' in r, `${q} ${r.key}`);
      if (r.change !== null) assert.ok(r.prev && r.prev.impressions >= MIN, `${q} ${r.key} change on a tiny base`);
    }
  }
  const p28 = await get('dim=page&range=28');
  assert.equal(p28.rows.find((r) => r.key === '/blog/tiny-invented').change, null);
});

test('GET /api/topics: no share and no "pages compete" on a topic under 30 views', async () => {
  const out = await handlerOf(topicRoutes, '/api/topics')(ctxOf('/api/topics', 'range=28'));
  assert.ok(out.topics.length > 0);
  for (const t of out.topics) {
    if (t.impressions < COMPETING_MIN_VIEWS) {
      assert.equal(t.competing, false, t.label);
      assert.ok(
        t.pages.every((p) => p.share === null),
        t.label
      );
    }
  }
  const small = out.topics.find((t) => t.label === 'shared invented words');
  assert.ok(small, 'the two small searches share a topic');
  assert.equal(small.pages.length, 2);
  assert.equal(small.competing, false);
});

test('GET /api/results and /api/visitors: verdict and visit changes come from the server, gated', async () => {
  const core = coreRoutes({ jobs: { list: () => [], running: () => [] } });
  const results = await handlerOf(core, '/api/results')(ctxOf('/api/results'));
  const by = Object.fromEntries(results.verdicts.map((v) => [v.page, v]));
  assert.equal(by['/blog/tiny-invented'].impChange, null, '2 to 13 views is not +550%');
  assert.equal(by['/blog/busy-invented'].impChange, 25);
  const visitors = await handlerOf(core, '/api/visitors')(ctxOf('/api/visitors'));
  assert.ok('change' in visitors.channels);
  assert.equal(visitors.channels.change, null, 'two visits before is too few for a percentage');
});

// ---------------------------------------------------------------- the pages themselves

test('the pages compute no percentage change of their own: they format the server value', () => {
  const dir = new URL('../static/views/', import.meta.url);
  // "(a - b) / b", the shape of a percentage change, in any form.
  const CHANGE = /\(\s*([\w.?]+)\s*-\s*([\w.?]+)\s*\)\s*\/\s*\2\b/;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.js')) continue;
    const text = fs.readFileSync(new URL(f, dir), 'utf8');
    assert.doesNotMatch(text, CHANGE, `${f} works out a percentage change itself`);
  }
});

test('shareText and shareWidth: the server share, or the plain count when there is none', async () => {
  const { shareText, shareWidth } = await import('../static/views/search-drawer.js');
  assert.equal(shareText({ share: 0.46, impressions: 46 }), '46% of times shown');
  assert.equal(shareText({ share: null, impressions: 12 }), 'shown 12 times');
  assert.equal(shareText({ share: null, impressions: 1 }), 'shown 1 time');
  assert.equal(shareWidth({ share: 0.46 }), '46%');
  assert.equal(shareWidth({ share: 0.001 }), '0.5%');
  assert.equal(shareWidth({ share: null }), null, 'no bar is drawn without a share');
});
