import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const fx = (name) => JSON.parse(fs.readFileSync(path.join(HERE, 'fixtures', name), 'utf8'));

process.env.SEO_DESK_DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-search-'));

const { normGscRows, normIndex, pullGsc } = await import('../lib/sources/gsc.mjs');
const { pullIndex, INDEX_PER_RUN, pickPages } = await import('../lib/sources/index.mjs');
const { parseBingDate, normBingDaily, normBingQueries, normBingPages, normBingLinkTotal, pullBing } = await import(
  '../lib/sources/bing.mjs'
);
const { readJson } = await import('../lib/store.mjs');
const { McpError } = await import('../lib/mcp-client.mjs');

test('normGscRows folds trailing slash and #heading into one page and weights position', () => {
  const rows = normGscRows(fx('gsc-rows.json').qpFlat, ['query', 'page']);
  const x = rows.find((r) => r.query === 'example query one' && r.page === '/blog/x');
  assert.equal(x.clicks, 3);
  assert.equal(x.impressions, 500);
  // (4*100 + 8*300 + 12*100) / 500 = 8
  assert.equal(x.position, 8);
  assert.equal(rows.find((r) => r.page === '/').page, '/');
  assert.equal(rows.length, 3);
});

test('normGscRows reads keys[] rows and folds per date', () => {
  const rows = normGscRows(fx('gsc-rows.json').pageDateKeys, 'page,date');
  const d1 = rows.find((r) => r.page === '/pricing' && r.date === '2026-10-01');
  assert.equal(d1.clicks, 2);
  assert.equal(d1.impressions, 40);
  assert.equal(d1.position, 6); // (3*10 + 7*30) / 40 = 6.0
  assert.equal(rows.length, 2);
});

test('normIndex maps verdicts', () => {
  const f = fx('gsc-inspect.json');
  assert.deepEqual(normIndex(f.indexed), { page: '/pricing', verdict: 'indexed', reason: '', lastCrawl: '2026-11-09' });
  assert.deepEqual(normIndex(f.crawled), {
    page: '/blog/x',
    verdict: 'not-indexed',
    reason: 'Crawled - currently not indexed',
    lastCrawl: '2026-10-20',
  });
  const unk = normIndex(f.unknownToGoogle);
  assert.equal(unk.verdict, 'not-indexed');
  assert.equal(unk.lastCrawl, null);
  const err = normIndex(f.errored);
  assert.equal(err.verdict, 'unknown');
  assert.match(err.reason, /Quota/);
  assert.equal(normIndex(f.bare).verdict, 'unknown');
});

test('parseBingDate handles /Date(ms)/ and ISO', () => {
  assert.equal(parseBingDate('/Date(1730419200000)/'), '2024-11-01');
  assert.equal(parseBingDate('/Date(1730419200000-0700)/'), '2024-11-01');
  assert.equal(parseBingDate('2026-04-13T00:00:00Z'), '2026-04-13');
  assert.equal(parseBingDate('2026-04-13'), '2026-04-13');
  assert.equal(parseBingDate('nonsense'), null);
  assert.equal(parseBingDate(undefined), null);
});

test('Bing normalisers: daily, impression-weighted position, pages, links', () => {
  const f = fx('bing-rows.json');
  const daily = normBingDaily(f.daily);
  assert.deepEqual(
    daily,
    [
      { date: '2026-10-01', clicks: 1, impressions: 20 },
      { date: '2024-11-02', clicks: 0, impressions: 15 },
    ].sort((a, b) => a.date.localeCompare(b.date))
  );

  const q = normBingQueries(f.queries);
  const one = q.find((r) => r.query === 'example query one');
  assert.equal(one.clicks, 1);
  assert.equal(one.impressions, 40);
  assert.equal(one.position, 8.5); // (4*10 + 10*30) / 40
  assert.equal(q.find((r) => r.query === 'example query two').position, 0); // no usable position

  assert.deepEqual(normBingPages(f.pages), [{ page: '/blog/x', clicks: 3, impressions: 20 }]);
  assert.equal(normBingLinkTotal(f.links), 5);
  assert.equal(normBingLinkTotal({ Links: [] }), 0);
});

const fakeGsc = ({ failInspectAfter } = {}) => {
  const f = fx('gsc-rows.json');
  const calls = [];
  let inspected = 0;
  return {
    calls,
    closed: false,
    async call(tool, args) {
      calls.push({ tool, args });
      if (tool === 'batch_url_inspection') {
        const urls = args.urls.split('\n');
        if (failInspectAfter !== undefined && inspected >= failInspectAfter)
          throw new McpError('Quota exceeded for quota metric');
        inspected += urls.length;
        return {
          results: urls.map((url) => ({
            url,
            verdict: 'PASS',
            coverage_state: 'Submitted and indexed',
            last_crawled: '2026-11-09 01:00',
          })),
        };
      }
      const rows =
        args.dimensions === 'date'
          ? f.siteDaily
          : args.dimensions === 'page,date'
            ? f.pageDateKeys
            : args.dimensions === 'country'
              ? f.countries
              : args.dimensions === 'device'
                ? f.devices
                : args.dimensions === 'query'
                  ? f.qpFlat.map((r) => ({
                      query: r.query,
                      clicks: r.clicks,
                      impressions: r.impressions,
                      position: r.position,
                    }))
                  : f.qpFlat;
      return { rows };
    },
    close() {
      this.closed = true;
    },
  };
};

test('pullGsc builds the snapshot and merges history, and never inspects pages', async () => {
  const s = fakeGsc();
  const live = [{ page: '/pricing', lastmod: '2026-10-01' }];
  const snap = await pullGsc({ today: '2026-11-10', livePages: live, session: s });
  assert.equal(snap.source, 'gsc');
  assert.equal(snap.ok, true);
  assert.equal(snap.status, 'fresh');
  assert.equal(snap.through, '2026-11-07');
  assert.equal(snap.error, null);
  assert.equal('index' in snap.data, false, 'index checks are their own source now');
  assert.equal(snap.data.windows.cur.end, '2026-11-07');
  assert.deepEqual(Object.keys(snap.data.windows), ['cur', 'prev', 'd90']);
  assert.deepEqual(snap.data.countries[0], { country: 'usa', clicks: 4, impressions: 150 });
  assert.deepEqual(snap.data.devices[0], { device: 'DESKTOP', clicks: 3, impressions: 100 });
  assert.equal(snap.data.qpCur.length, 3);
  assert.equal(snap.data.queryCur.length, 2);
  assert.equal(s.calls.filter((c) => c.tool === 'batch_url_inspection').length, 0);
  assert.equal(s.closed, false); // a session passed in is the caller's to close
  const first = s.calls[0].args;
  assert.equal(first.site_url, 'https://simplescheduleai.com/');
  assert.equal(first.search_type, 'WEB');
  assert.equal(first.data_state, 'final');
  assert.equal(s.calls.find((c) => c.args.dimensions === 'page,date').args.row_limit, 25000);
  // Both query pulls ask for 5000 rows (1000 was reached live, which made the search count a floor).
  const queryPulls = s.calls.filter((c) => c.args.dimensions === 'query');
  assert.equal(queryPulls.length, 2);
  assert.deepEqual(
    queryPulls.map((c) => c.args.row_limit),
    [5000, 5000]
  );
  assert.equal(readJson('history/gsc-site.json', []).length, 2);
  assert.equal(readJson('history/gsc-page.json', []).length, 2);
});

test('pullGsc lets an McpError propagate so the refresh engine can classify it', async () => {
  const s = fakeGsc();
  s.call = async () => {
    throw new McpError('401 unauthorized');
  };
  await assert.rejects(pullGsc({ today: '2026-11-10', session: s }), (e) => e.kind === 'needs-sign-in');
});

const fakeBing = (over = {}) => {
  const f = fx('bing-rows.json');
  const calls = [];
  return {
    calls,
    async call(tool, args) {
      calls.push({ tool, args });
      if (over[tool]) return over[tool](args);
      const all = {
        get_rank_and_traffic_stats: f.daily,
        get_query_stats: f.queries,
        get_page_stats: f.pages,
        get_crawl_issues: [],
      }[tool];
      if (tool === 'get_link_counts') return f.links;
      return args.offset ? [] : all;
    },
    close() {},
  };
};

test('pullBing builds the snapshot and merges history', async () => {
  const s = fakeBing();
  // The fixture rows are dated early October, inside the 28 days that end on 17 October.
  const snap = await pullBing({ today: '2026-10-20', session: s });
  assert.equal(snap.source, 'bing');
  assert.equal(snap.ok, true);
  assert.equal(snap.through, snap.data.siteDaily.at(-1).date);
  assert.equal(snap.data.links.total, 5);
  assert.deepEqual(snap.data.links.history, [{ date: '2026-10-20', total: 5 }]);
  assert.equal(snap.data.queries.length, 2);
  assert.equal(snap.data.pages.length, 1);
  assert.deepEqual(snap.data.crawlIssues, []);
  assert.equal(readJson('history/bing-site.json', []).length, 2);
  assert.equal(readJson('history/bing-links.json', []).length, 1);
  // each list tool is asked for the next page until it comes back empty
  assert.equal(s.calls.filter((c) => c.tool === 'get_query_stats').length, 2);
});

test('pullBing fails loudly when the client hands back one row object instead of a list', async () => {
  const s = fakeBing({
    get_rank_and_traffic_stats: () => ({ Clicks: 1, Date: '2026-10-01T00:00:00Z', Impressions: 2 }),
  });
  await assert.rejects(pullBing({ today: '2026-11-10', session: s }), /rows array/);
});

// ---------------------------------------------------------------- index checks

const live = (n, prefix = 'p') =>
  Array.from({ length: n }, (_, i) => ({ page: `/blog/${prefix}${i}`, lastmod: '2026-10-01' }));
const prevIndex = (rows) => ({ source: 'index', ok: true, data: { pages: rows } });

test('index checks: at most 40 pages a run, never checked first, then the oldest checked', async () => {
  assert.equal(INDEX_PER_RUN, 40);
  const pages = live(100);
  // p0..p59 were checked on different days; p60..p99 never.
  const prev = prevIndex(
    pages.slice(0, 60).map((p, i) => ({
      page: p.page,
      verdict: 'indexed',
      reason: '',
      lastCrawl: null,
      checkedAt: `2026-11-${String(1 + (i % 9)).padStart(2, '0')}T06:00:00.000Z`,
    }))
  );
  const s = fakeGsc();
  const snap = await pullIndex({ today: '2026-11-10', livePages: pages, prev, session: s });
  assert.equal(snap.source, 'index');
  assert.equal(snap.ok, true);
  const asked = s.calls.flatMap((c) => c.args.urls.split('\n'));
  assert.equal(asked.length, 40);
  assert.ok(
    asked.every((u) => Number(u.match(/p(\d+)$/)[1]) >= 60),
    'never checked pages go first'
  );
  assert.ok(
    s.calls.every((c) => c.args.urls.split('\n').length <= 10),
    'small batches'
  );
  assert.equal(snap.data.pages.length, 100, 'every live page has a row, old results carried forward');
  assert.equal(snap.data.checkedThisRun, 40);
  assert.equal(snap.data.checked, 100);
  assert.equal(snap.data.live, 100);
  const carried = snap.data.pages.find((r) => r.page === '/blog/p0');
  assert.equal(carried.checkedAt, '2026-11-01T06:00:00.000Z');

  // The next run takes the oldest checked ones.
  const order = pickPages(
    pages.map((p) => p.page),
    snap.data.pages,
    40
  );
  const firstDay = snap.data.pages.filter((r) => r.checkedAt?.startsWith('2026-11-01')).map((r) => r.page);
  assert.ok(firstDay.every((p) => order.includes(p)));
});

test('index checks: pages no longer live are dropped, and never checked ones say so', async () => {
  const prev = prevIndex([
    { page: '/blog/gone', verdict: 'indexed', reason: '', lastCrawl: null, checkedAt: '2026-11-01T00:00:00Z' },
  ]);
  const snap = await pullIndex({ today: '2026-11-10', livePages: live(50), prev, session: fakeGsc(), cap: 40 });
  assert.equal(
    snap.data.pages.some((r) => r.page === '/blog/gone'),
    false
  );
  const never = snap.data.pages.filter((r) => !r.checkedAt);
  assert.equal(never.length, 10);
  assert.equal(never[0].verdict, 'unknown');
  assert.match(never[0].reason, /Not checked yet/);
});

test('index checks: a quota error keeps what was checked, and nothing checked is a failure', async () => {
  const snap = await pullIndex({
    today: '2026-11-10',
    livePages: live(30),
    session: fakeGsc({ failInspectAfter: 10 }),
  });
  assert.equal(snap.ok, true);
  assert.equal(snap.data.checkedThisRun, 10);
  assert.match(snap.error, /quota/i);
  const none = await pullIndex({ today: '2026-11-10', livePages: live(30), session: fakeGsc({ failInspectAfter: 0 }) });
  assert.equal(none.ok, false);
  assert.match(none.error, /quota/i);
});

test('index checks: the old Search Console index table seeds the first run', async () => {
  const seed = [{ page: '/blog/p0', verdict: 'not-indexed', reason: 'Crawled', lastCrawl: '2026-11-01' }];
  const snap = await pullIndex({
    today: '2026-11-10',
    livePages: live(45),
    seed,
    seedCheckedAt: '2026-11-09T06:00:00.000Z',
    session: fakeGsc(),
  });
  const p0 = snap.data.pages.find((r) => r.page === '/blog/p0');
  assert.equal(p0.verdict, 'not-indexed', 'seeded and checked last, so not in this run');
  assert.equal(p0.checkedAt, '2026-11-09T06:00:00.000Z');
});

test('index checks: an abort stops before the next batch and a sign-in error propagates', async () => {
  const ctrl = new AbortController();
  const s = fakeGsc();
  const call = s.call.bind(s);
  s.call = async (tool, args) => {
    const r = await call(tool, args);
    ctrl.abort();
    return r;
  };
  const snap = await pullIndex({ today: '2026-11-10', livePages: live(40), session: s, signal: ctrl.signal });
  assert.equal(s.calls.length, 1);
  assert.equal(snap.data.checkedThisRun, 10);
  const bad = fakeGsc();
  bad.call = async () => {
    throw new McpError('401 unauthorized');
  };
  await assert.rejects(
    pullIndex({ today: '2026-11-10', livePages: live(5), session: bad }),
    (e) => e.kind === 'needs-sign-in'
  );
});

// ---------------------------------------------------------------- Bing periods

test('Bing searches and pages count only the 28 day window, with its dates in the note', async () => {
  const day = (d) => `2026-${d}T00:00:00Z`;
  const q = (query, date, impressions) => ({
    Query: query,
    Date: day(date),
    Clicks: 0,
    Impressions: impressions,
    AvgImpressionPosition: 5,
  });
  const s = fakeBing({
    get_query_stats: (a) =>
      a.offset ? [] : [q('kept phrase', '10-20', 7), q('kept phrase', '08-01', 900), q('old phrase', '08-01', 50)],
    get_page_stats: (a) =>
      a.offset
        ? []
        : [
            q('https://simplescheduleai.com/blog/x', '10-20', 4),
            q('https://simplescheduleai.com/blog/x', '07-01', 400),
          ],
  });
  const snap = await pullBing({ today: '2026-11-10', session: s });
  assert.deepEqual(snap.data.windows.cur, { start: '2026-10-11', end: '2026-11-07' });
  assert.deepEqual(
    snap.data.queries.map((r) => [r.query, r.impressions]),
    [['kept phrase', 7]]
  );
  assert.deepEqual(snap.data.pages, [{ page: '/blog/x', clicks: 0, impressions: 4 }]);
  assert.match(snap.data.periodNote, /11 October to 7 November/);
});

test('Bing list paging stops when a page of results adds no new rows', async () => {
  let calls = 0;
  const row = { Query: 'same', Date: '2026-10-20T00:00:00Z', Clicks: 0, Impressions: 3 };
  const s = fakeBing({
    get_query_stats: () => {
      calls += 1;
      return [row];
    },
  });
  await pullBing({ today: '2026-11-10', session: s });
  assert.equal(calls, 2, 'the second page repeated the first, so paging stopped');
});
