import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Everything here is synthetic: invented pages, invented searches, a temp data folder. The Search
// Console call is injected, so there is no network and no server is ever started.

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-explore-'));
const DATA = path.join(root, 'data');
const REPO = path.join(root, 'repo');
fs.mkdirSync(path.join(DATA, 'snap'), { recursive: true });
fs.mkdirSync(REPO, { recursive: true });
process.env.SEO_DESK_DATA = DATA;
process.env.SEO_DESK_REPO = REPO;
process.env.SEO_DESK_TODAY = '2026-11-10';

const ex = await import('../lib/explore.mjs');
const { makeRoutes, liveSession } = await import('../lib/api/ext/explore.mjs');
const { invalidate } = await import('../lib/api/model.mjs');
const { addDays } = await import('../lib/dates.mjs');
const { resolveRange, buildFilters, filterChips, explore, assemble, distribution, searchDetail, storedExplore } = ex;

after(() => fs.rmSync(root, { recursive: true, force: true }));

const cacheDir = path.join(DATA, 'cache/explore');
const cacheFiles = () => (fs.existsSync(cacheDir) ? fs.readdirSync(cacheDir).filter((f) => f.endsWith('.json')) : []);
const clearCache = () => fs.rmSync(cacheDir, { recursive: true, force: true });
const status = (fn) => {
  try {
    fn();
  } catch (e) {
    return e;
  }
  return null;
};

// ---------------------------------------------------------------- ranges

const TODAY = '2026-11-11'; // data runs to 2026-11-08

test('resolveRange: the day ranges end three days back and compare with the same number of days before', () => {
  const r7 = resolveRange('7', TODAY);
  assert.deepEqual(
    { s: r7.start, e: r7.end, ps: r7.prevStart, pe: r7.prevEnd, l: r7.label },
    { s: '2026-11-02', e: '2026-11-08', ps: '2026-10-26', pe: '2026-11-01', l: 'Last 7 days' }
  );
  const r14 = resolveRange(14, TODAY);
  assert.deepEqual(
    [r14.start, r14.end, r14.prevStart, r14.prevEnd],
    ['2026-10-26', '2026-11-08', '2026-10-12', '2026-10-25']
  );
  const r28 = resolveRange('28', TODAY);
  assert.deepEqual(
    [r28.start, r28.end, r28.prevStart, r28.prevEnd],
    ['2026-10-12', '2026-11-08', '2026-09-14', '2026-10-11']
  );
  const r90 = resolveRange('90', TODAY);
  assert.deepEqual([r90.start, r90.end], ['2026-08-11', '2026-11-08']);
  assert.equal(r90.prevEnd, '2026-08-10');
  assert.equal(r90.label, 'Last 90 days');
  const r480 = resolveRange('480', TODAY);
  assert.equal(r480.end, '2026-11-08');
  assert.equal(r480.start, addDays('2026-11-08', -479));
  assert.equal(r480.label, 'Last 16 months');
  assert.equal(r480.prevAvailable, false, 'the period before 16 months is past what Search Console keeps');
  assert.equal(r28.prevAvailable, true);
});

test('resolveRange: this month, last month, last quarter', () => {
  const tm = resolveRange('this-month', TODAY);
  assert.deepEqual(
    [tm.start, tm.end, tm.prevStart, tm.prevEnd, tm.label],
    ['2026-11-01', '2026-11-08', '2026-10-24', '2026-10-31', 'This month']
  );
  const lm = resolveRange('last-month', TODAY);
  assert.deepEqual(
    [lm.start, lm.end, lm.prevStart, lm.prevEnd],
    ['2026-10-01', '2026-10-31', '2026-08-31', '2026-09-30']
  );
  const lq = resolveRange('last-quarter', TODAY);
  assert.deepEqual([lq.start, lq.end], ['2026-07-01', '2026-09-30']);
  assert.equal(lq.prevEnd, '2026-06-30');
  assert.equal(lq.label, 'Last quarter');
});

test('resolveRange: calendar ranges are held to three days back and handle the turn of the year', () => {
  // Early in the month the last month has not finished being reported.
  assert.equal(resolveRange('last-month', '2026-11-02').end, '2026-10-30');
  assert.equal(resolveRange('last-quarter', '2026-10-02').end, '2026-09-29');
  const jan = resolveRange('last-quarter', '2027-01-20');
  assert.deepEqual([jan.start, jan.end], ['2026-10-01', '2026-12-31']);
  const janMonth = resolveRange('last-month', '2027-01-20');
  assert.deepEqual([janMonth.start, janMonth.end], ['2026-12-01', '2026-12-31']);
  // This month before any day has been reported is a plain 400.
  const e = status(() => resolveRange('this-month', '2026-11-02'));
  assert.equal(e.status, 400);
  assert.match(e.message, /no finished Search Console days yet/);
});

test('resolveRange: custom range accepts good input and refuses bad input in plain words', () => {
  const ok = resolveRange({ range: 'custom', start: '2026-10-01', end: '2026-10-20' }, TODAY);
  assert.deepEqual(
    [ok.start, ok.end, ok.prevStart, ok.prevEnd],
    ['2026-10-01', '2026-10-20', '2026-09-11', '2026-09-30']
  );
  assert.equal(ok.label, '1 October to 20 October');
  assert.equal(resolveRange({ range: 'custom', start: '2026-11-08', end: '2026-11-08' }, TODAY).label, '8 November');
  const bads = [
    [{ range: 'custom' }, /year-month-day/],
    [{ range: 'custom', start: '2026-10-01' }, /year-month-day/],
    [{ range: 'custom', start: '10/01/2026', end: '2026-10-20' }, /year-month-day/],
    [{ range: 'custom', start: '2026-02-30', end: '2026-10-20' }, /year-month-day/],
    [{ range: 'custom', start: '2026-10-20', end: '2026-10-01' }, /on or before the end date/],
    [{ range: 'custom', start: '2026-10-01', end: '2026-11-09' }, /8 November/],
    [{ range: 'custom', start: '2025-01-01', end: '2026-10-01' }, /longer than 480 days/],
    ['nonsense', /Pick a range/],
  ];
  for (const [spec, re] of bads) {
    const e = status(() => resolveRange(spec, TODAY));
    assert.equal(e?.status, 400, JSON.stringify(spec));
    assert.match(e.message, re, JSON.stringify(spec));
    assert.doesNotMatch(e.message, /[–—]/);
  }
  // The longest range allowed is 480 days.
  assert.doesNotThrow(() =>
    resolveRange({ range: 'custom', start: addDays('2026-11-08', -479), end: '2026-11-08' }, TODAY)
  );
});

// ---------------------------------------------------------------- filters

test('buildFilters: every mode maps to the Search Console operator', () => {
  assert.deepEqual(buildFilters({}), []);
  assert.deepEqual(buildFilters({ q: ' shift swap ' }), [
    { dimension: 'query', operator: 'contains', expression: 'shift swap' },
  ]);
  assert.deepEqual(buildFilters({ q: 'a', qmode: 'exact' }), [
    { dimension: 'query', operator: 'equals', expression: 'a' },
  ]);
  assert.deepEqual(buildFilters({ q: 'a', qmode: 'excludes' }), [
    { dimension: 'query', operator: 'notContains', expression: 'a' },
  ]);
  assert.deepEqual(buildFilters({ page: '12-hour', pmode: 'contains' }), [
    { dimension: 'page', operator: 'contains', expression: '12-hour' },
  ]);
  assert.deepEqual(buildFilters({ page: '/blog/x', pmode: 'excludes' }), [
    { dimension: 'page', operator: 'notContains', expression: '/blog/x' },
  ]);
  // An exact page is a whole address.
  assert.deepEqual(buildFilters({ page: '/pricing', pmode: 'exact' }), [
    { dimension: 'page', operator: 'equals', expression: 'https://simplescheduleai.com/pricing' },
  ]);
  assert.deepEqual(
    buildFilters({ page: 'https://simplescheduleai.com/pricing', pmode: 'exact' })[0].expression,
    'https://simplescheduleai.com/pricing'
  );
  assert.deepEqual(buildFilters({ country: 'USA' }), [{ dimension: 'country', operator: 'equals', expression: 'usa' }]);
  assert.deepEqual(buildFilters({ device: 'mobile' }), [
    { dimension: 'device', operator: 'equals', expression: 'MOBILE' },
  ]);
  const all = buildFilters({ q: 'a', page: 'b', country: 'can', device: 'TABLET' });
  assert.deepEqual(
    all.map((f) => f.dimension),
    ['query', 'page', 'country', 'device']
  );
  // Blank values are ignored.
  assert.deepEqual(buildFilters({ q: '  ', page: '', country: '', device: '' }), []);
});

test('buildFilters: invalid input is a 400 in plain words', () => {
  const bads = [
    [{ q: 'a', qmode: 'starts' }, /search filter must be "contains"/],
    [{ page: 'a', pmode: 'nope' }, /page filter must be/],
    [{ q: 'x'.repeat(201) }, /too long/],
    [{ page: 'pricing', pmode: 'exact' }, /full address or a path that starts with a slash/],
    [{ country: 'us' }, /three-letter code/],
    [{ country: 'usa1' }, /three-letter code/],
    [{ device: 'watch' }, /device filter must be/],
  ];
  for (const [p, re] of bads) {
    const e = status(() => buildFilters(p));
    assert.equal(e?.status, 400, JSON.stringify(p));
    assert.match(e.message, re);
  }
});

test('filterChips: plain text with the names that go when a chip is removed', () => {
  const chips = filterChips({ q: 'shift', qmode: 'excludes', page: '12-hour', country: 'usa', device: 'MOBILE' });
  assert.deepEqual(
    chips.map((c) => c.text),
    ['Search does not contain "shift"', 'Page contains "12-hour"', 'Country is United States', 'Device is Phone']
  );
  assert.deepEqual(chips[0].params, ['q', 'qmode']);
  assert.deepEqual(chips[3].params, ['device']);
});

// ---------------------------------------------------------------- the fake Search Console

// Flat named rows, like the real tool. Dimension combinations the test cares about are listed by
// start date; anything else answers with the tool's "no data" sentence.
function fakeCall(table, log = []) {
  return async (tool, args) => {
    log.push({ tool, args });
    const rows = table[`${args.dimensions}|${args.start_date}`];
    if (rows === 'throw')
      throw Object.assign(new Error('boom stderr: Traceback (most recent call last) ...'), { kind: 'failed' });
    if (!rows)
      return `No search analytics data found for ${args.site_url} with the specified parameters.\n\nParameters used:\n- Date range`;
    return { rows };
  };
}

const R = resolveRange('28', TODAY); // cur 2026-10-12..2026-11-08, prev 2026-09-14..2026-10-11
const QCUR = [
  { query: 'shift swap rules', clicks: 4, impressions: 120, position: 8.2 },
  { query: 'nurse ratio', clicks: 0, impressions: 60, position: 14.4 },
  { query: 'brand new search', clicks: 0, impressions: 30, position: 22 },
  { query: 'steady search', clicks: 1, impressions: 50, position: 5 },
];
const QPREV = [
  { query: 'shift swap rules', clicks: 1, impressions: 80, position: 9 },
  { query: 'nurse ratio', clicks: 0, impressions: 100, position: 11 },
  { query: 'steady search', clicks: 1, impressions: 48, position: 5 },
  { query: 'vanished search', clicks: 0, impressions: 40, position: 30 },
];
const PCUR = [
  { page: 'https://simplescheduleai.com/blog/twelve-hour/', clicks: 6, impressions: 400, position: 7 },
  { page: 'https://simplescheduleai.com/blog/twelve-hour#faq', clicks: 2, impressions: 100, position: 9 },
  { page: 'https://simplescheduleai.com/pricing', clicks: 1, impressions: 50, position: 6 },
];
const PPREV = [{ page: 'https://simplescheduleai.com/blog/twelve-hour', clicks: 2, impressions: 250, position: 8 }];

test('explore: two pulls, movement, folded pages, gone searches, no click rate for searches', async () => {
  clearCache();
  const log = [];
  const call = fakeCall({ [`query|${R.start}`]: QCUR, [`query|${R.prevStart}`]: QPREV }, log);
  const out = await explore(
    { dim: 'query', range: R, filters: [], limit: 1000 },
    { call, now: Date.parse('2026-11-11T09:00:00Z') }
  );

  assert.equal(log.length, 2);
  assert.deepEqual(
    log.map((l) => [l.args.start_date, l.args.end_date]).sort(),
    [
      [R.prevStart, R.prevEnd],
      [R.start, R.end],
    ].sort()
  );
  const a = log[0].args;
  assert.equal(a.site_url, 'https://simplescheduleai.com/');
  assert.equal(a.dimensions, 'query');
  assert.equal(a.search_type, 'WEB');
  assert.equal(a.data_state, 'final');
  assert.ok(!('filters' in a), 'no filters argument when there are no filters');
  assert.ok(a.row_limit <= 25000);

  const by = Object.fromEntries(out.rows.map((r) => [r.key, r]));
  assert.equal(by['shift swap rules'].movement, 'growing');
  assert.deepEqual(by['shift swap rules'].prev, { clicks: 1, impressions: 80, position: 9 });
  assert.equal(by['nurse ratio'].movement, 'slipping');
  assert.equal(by['brand new search'].movement, 'new');
  assert.equal(by['brand new search'].prev, null);
  assert.equal(by['steady search'].movement, 'steady');
  assert.equal(by['vanished search'].movement, 'gone');
  assert.equal(by['vanished search'].impressions, 0);
  assert.equal(by['vanished search'].position, null);
  assert.equal(out.rows[0].key, 'shift swap rules', 'sorted by impressions');
  for (const r of out.rows) assert.ok(!('ctr' in r), 'no click rate on a search row');
  assert.deepEqual(out.totals, {
    count: 4,
    clicks: 5,
    impressions: 260,
    prev: { count: 4, clicks: 2, impressions: 268 },
  });
  assert.equal(out.comparable, true);
  assert.equal(out.cached, false);
  assert.equal(out.fetchedAt, '2026-11-11T09:00:00.000Z');
  assert.deepEqual(out.range, R);
  assert.deepEqual(out.filters, []);
});

test('explore: page rows fold the address and give a click rate only above the gate', async () => {
  clearCache();
  const call = fakeCall({ [`page|${R.start}`]: PCUR, [`page|${R.prevStart}`]: PPREV });
  const out = await explore({ dim: 'page', range: R, filters: [], limit: 1000 }, { call, ctrMin: 200, now: 1 });
  const by = Object.fromEntries(out.rows.map((r) => [r.key, r]));
  assert.deepEqual(Object.keys(by).sort(), ['/blog/twelve-hour', '/pricing']);
  assert.equal(by['/blog/twelve-hour'].impressions, 500, 'the trailing slash and the heading fold into one page');
  assert.equal(by['/blog/twelve-hour'].clicks, 8);
  assert.equal(by['/blog/twelve-hour'].ctr, 0.016);
  assert.equal(by['/blog/twelve-hour'].movement, 'growing');
  assert.equal(by['/pricing'].ctr, null, 'under the minimum impressions there is no click rate');
  // The gate is the effective one passed in: lowering it shows the rate.
  clearCache();
  const low = await explore({ dim: 'page', range: R, filters: [], limit: 1000 }, { call, ctrMin: 20, now: 1 });
  assert.equal(low.rows.find((r) => r.key === '/pricing').ctr, 0.02);
});

test('explore: filters are sent as a JSON string; a filter that matches nothing is an empty list, not an error', async () => {
  clearCache();
  const log = [];
  const filters = buildFilters({ page: '12-hour', country: 'usa' });
  const out = await explore({ dim: 'page', range: R, filters }, { call: fakeCall({}, log), now: 1 });
  assert.equal(typeof log[0].args.filters, 'string');
  assert.deepEqual(JSON.parse(log[0].args.filters), filters);
  assert.deepEqual(out.rows, []);
  // The earlier pull ran and returned nothing, which is not the same as not being pulled.
  assert.deepEqual(out.totals, { count: 0, clicks: 0, impressions: 0, prev: { count: 0, clicks: 0, impressions: 0 } });
  assert.equal(out.comparable, true);
});

test('explore: an earlier period that returned nothing makes the rows new; one never pulled gives no movement', async () => {
  clearCache();
  const out = await explore({ dim: 'query', range: R }, { call: fakeCall({ [`query|${R.start}`]: QCUR }), now: 1 });
  assert.equal(out.comparable, true);
  assert.ok(out.rows.every((r) => r.movement === 'new' && r.prev === null));
  assert.deepEqual(out.totals.prev, { count: 0, clicks: 0, impressions: 0 });
  const d = distribution(out.rows, { comparable: out.comparable });
  assert.ok(d.every((b) => b.prevCount === 0));
});

test('explore: a period before that Search Console no longer keeps is not pulled', async () => {
  clearCache();
  const log = [];
  const long = resolveRange('480', TODAY);
  const out = await explore(
    { dim: 'query', range: long },
    { call: fakeCall({ [`query|${long.start}`]: QCUR }, log), now: 1 }
  );
  assert.equal(log.length, 1);
  assert.equal(out.comparable, false);
  assert.ok(out.rows.every((r) => r.movement === null && r.prev === null));
});

test('explore: a cut list does not call missing searches gone', () => {
  const cur = [{ query: 'a', clicks: 0, impressions: 10, position: 3 }];
  const prev = [
    { query: 'a', clicks: 0, impressions: 10, position: 3 },
    { query: 'b', clicks: 0, impressions: 5, position: 3 },
  ];
  const cut = assemble({ dim: 'query', cur, prev, comparable: true, truncated: true, limit: 1, ctrMin: 200 });
  assert.deepEqual(
    cut.rows.map((r) => r.key),
    ['a']
  );
  assert.equal(cut.truncated, true);
  const whole = assemble({ dim: 'query', cur, prev, comparable: true, truncated: false, limit: 10, ctrMin: 200 });
  assert.deepEqual(
    whole.rows.map((r) => [r.key, r.movement]),
    [
      ['a', 'steady'],
      ['b', 'gone'],
    ]
  );
});

test('explore: refuses a bad list, limit or range', async () => {
  const call = fakeCall({});
  for (const p of [
    { dim: 'country', range: R },
    { dim: 'query', range: R, limit: 0 },
    { dim: 'query', range: R, limit: 25001 },
    { dim: 'query' },
  ]) {
    const e = await explore(p, { call }).catch((x) => x);
    assert.equal(e.status, 400, JSON.stringify(p));
  }
});

test('explore: the cache serves for 12 hours and misses after, and entries over 7 days old are removed', async () => {
  clearCache();
  const log = [];
  const call = fakeCall({ [`query|${R.start}`]: QCUR, [`query|${R.prevStart}`]: QPREV }, log);
  const t0 = Date.parse('2026-11-11T09:00:00Z');
  const first = await explore({ dim: 'query', range: R }, { call, now: t0 });
  assert.equal(first.cached, false);
  assert.equal(log.length, 2);
  assert.equal(cacheFiles().length, 1);
  assert.match(cacheFiles()[0], /^[0-9a-f]{40}\.json$/, 'named by the sha1 of the request');

  const again = await explore({ dim: 'query', range: R }, { call, now: t0 + 11.9 * 3600e3 });
  assert.equal(again.cached, true);
  assert.equal(again.fetchedAt, first.fetchedAt, 'a cached answer keeps the time it was fetched');
  assert.equal(log.length, 2, 'no new pull inside 12 hours');
  assert.deepEqual(again.rows, first.rows);

  const stale = await explore({ dim: 'query', range: R }, { call, now: t0 + 12.1 * 3600e3 });
  assert.equal(stale.cached, false);
  assert.equal(log.length, 4, 'a miss after 12 hours pulls again');

  // A different request is a different entry.
  await explore({ dim: 'query', range: R, filters: buildFilters({ q: 'x' }) }, { call, now: t0 });
  assert.equal(cacheFiles().length, 2);

  // Writing a new entry removes ones whose file is older than 7 days (by file time, not content).
  const stamp = (f, ageMs, body) => {
    fs.writeFileSync(f, body);
    const when = new Date(t0 - ageMs);
    fs.utimesSync(f, when, when);
  };
  const old = path.join(cacheDir, 'old.json');
  stamp(old, 8 * 86400e3, JSON.stringify({ fetchedAt: new Date(t0).toISOString(), result: {} }));
  const fresh = path.join(cacheDir, 'fresh.json');
  stamp(fresh, 6 * 86400e3, '{not even json, never opened');
  await explore({ dim: 'page', range: R }, { call, now: t0 });
  assert.ok(!fs.existsSync(old), 'older than 7 days is removed');
  assert.ok(fs.existsSync(fresh), 'newer than 7 days stays, and its content is never read');
});

test('explore: the cache keeps at most the newest 200 entries and the one just written', async () => {
  clearCache();
  fs.mkdirSync(cacheDir, { recursive: true });
  const t0 = Date.parse('2026-11-11T09:00:00Z');
  for (let i = 0; i < 205; i++) {
    const f = path.join(cacheDir, `e${String(i).padStart(3, '0')}.json`);
    fs.writeFileSync(f, '{}');
    const when = new Date(t0 - (1000 - i) * 1000); // e204 is the newest
    fs.utimesSync(f, when, when);
  }
  const call = fakeCall({ [`query|${R.start}`]: QCUR, [`query|${R.prevStart}`]: QPREV });
  await explore({ dim: 'query', range: R }, { call, now: t0 });
  const left = cacheFiles();
  assert.equal(left.length, ex.MAX_ENTRIES);
  assert.ok(
    left.some((f) => /^[0-9a-f]{40}\.json$/.test(f)),
    'the new entry stays'
  );
  assert.ok(!left.includes('e000.json') && !left.includes('e005.json'), 'the oldest go first');
  assert.ok(left.includes('e204.json'), 'the newest stay');
});

test('explore: a failing pull throws one plain sentence and caches nothing', async () => {
  clearCache();
  const call = fakeCall({ [`query|${R.start}`]: 'throw', [`query|${R.prevStart}`]: QPREV });
  const e = await explore({ dim: 'query', range: R }, { call, now: 1 }).catch((x) => x);
  assert.equal(e.status, 502);
  assert.equal(e.message, 'Search Console could not be reached just now, so this view could not be loaded.');
  assert.doesNotMatch(e.message, /stderr|Traceback|boom/);
  assert.equal(cacheFiles().length, 0);

  const slow = await explore(
    { dim: 'query', range: R },
    {
      call: async () => {
        throw new Error('google-search-console tools/call timed out after 60000ms.');
      },
    }
  ).catch((x) => x);
  assert.match(slow.message, /took too long to answer/);

  const signIn = await explore(
    { dim: 'query', range: R },
    {
      call: async () => {
        throw Object.assign(new Error('401 unauthorized'), { kind: 'needs-sign-in' });
      },
    }
  ).catch((x) => x);
  assert.match(signIn.message, /sign in again/);

  const odd = await explore({ dim: 'query', range: R }, { call: async () => ({ something: 'else' }) }).catch((x) => x);
  assert.match(odd.message, /could not read/);
  for (const m of [e.message, slow.message, signIn.message, odd.message]) {
    assert.doesNotMatch(m, /[–—]/);
    assert.equal(m.split(/[.!?] /).length, 1, 'one sentence');
  }
});

// ---------------------------------------------------------------- distribution

test('distribution: buckets at the edges', () => {
  const row = (key, position, prevPosition) => ({
    key,
    impressions: 10,
    position,
    prev: prevPosition === undefined ? null : { impressions: 10, position: prevPosition },
  });
  const rows = [
    row('a', 1),
    row('b', 3.0),
    row('c', 3.01, 3.0),
    row('d', 10, 10.01),
    row('e', 10.01, 20),
    row('f', 20, 20.5),
    row('g', 20.01, 50),
    row('h', 50, 50.01),
    row('i', 50.01, 80),
    row('j', 90),
  ];
  const d = distribution(rows);
  assert.deepEqual(
    d.map((b) => b.bucket),
    ['1 to 3', '4 to 10', '11 to 20', '21 to 50', '51 and beyond']
  );
  assert.deepEqual(
    d.map((b) => b.count),
    [2, 2, 2, 2, 2]
  );
  // Earlier places: c 3.0, d 10.01, e 20, f 20.5, g 50, h 50.01, i 80.
  assert.deepEqual(
    d.map((b) => b.prevCount),
    [1, 0, 2, 2, 2]
  );
});

test('distribution: a search counts once at its weighted place, gone searches count before, empty rows are skipped', () => {
  const rows = [
    { key: 'Same search', impressions: 100, position: 2, prev: null },
    { key: 'same search ', impressions: 100, position: 12, prev: null }, // merges to place 7
    { key: 'gone one', impressions: 0, position: null, prev: { impressions: 30, position: 4 } },
    { key: 'no place', impressions: 5, position: null, prev: null },
    { key: 'no views', impressions: 0, position: 3, prev: null },
  ];
  const d = distribution(rows);
  assert.deepEqual(
    d.map((b) => b.count),
    [0, 1, 0, 0, 0]
  );
  assert.deepEqual(
    d.map((b) => b.prevCount),
    [0, 1, 0, 0, 0]
  );
  // No earlier period at all: the earlier counts are null, not zero.
  const none = distribution([{ key: 'a', impressions: 5, position: 2, prev: null }]);
  assert.ok(none.every((b) => b.prevCount === null));
  assert.deepEqual(
    distribution([]).map((b) => b.count),
    [0, 0, 0, 0, 0]
  );
  assert.deepEqual(
    distribution(undefined).map((b) => b.count),
    [0, 0, 0, 0, 0]
  );
});

// ---------------------------------------------------------------- one search

test('searchDetail: two pulls held to the exact search, ordered by date, with each page share', async () => {
  clearCache();
  const log = [];
  const call = fakeCall(
    {
      [`date|${R.start}`]: [
        { date: '2026-10-14', clicks: 1, impressions: 10, position: 8 },
        { date: '2026-10-13', clicks: 0, impressions: 20, position: 9 },
      ],
      [`page|${R.start}`]: [
        { page: 'https://simplescheduleai.com/blog/a/', clicks: 1, impressions: 24, position: 8.5 },
        { page: 'https://simplescheduleai.com/blog/b', clicks: 0, impressions: 6, position: 12 },
      ],
    },
    log
  );
  const out = await searchDetail('  Shift Swap Rules ', R, { call, now: 5 });
  assert.equal(log.length, 2);
  assert.deepEqual(log.map((l) => l.args.dimensions).sort(), ['date', 'page']);
  for (const l of log) {
    assert.deepEqual(JSON.parse(l.args.filters), [
      { dimension: 'query', operator: 'equals', expression: 'shift swap rules' },
    ]);
    assert.equal(l.args.start_date, R.start);
  }
  assert.equal(out.query, 'Shift Swap Rules');
  assert.deepEqual(
    out.series.map((s) => s.date),
    ['2026-10-13', '2026-10-14']
  );
  assert.deepEqual(out.series[1], { date: '2026-10-14', impressions: 10, clicks: 1, position: 8 });
  assert.deepEqual(out.pages, [
    { page: '/blog/a', impressions: 24, clicks: 1, position: 8.5, share: 0.8 },
    { page: '/blog/b', impressions: 6, clicks: 0, position: 12, share: 0.2 },
  ]);
  const again = await searchDetail('shift swap rules', R, { call, now: 6 });
  assert.equal(again.cached, true);
  assert.equal(log.length, 2);

  for (const bad of ['', '   ']) assert.equal((await searchDetail(bad, R, { call }).catch((e) => e)).status, 400);
  const failing = await searchDetail('x', R, { call: fakeCall({ [`date|${R.start}`]: 'throw' }), now: 7 }).catch(
    (e) => e
  );
  assert.equal(failing.status, 502);
});

// ---------------------------------------------------------------- stored pulls

test('storedExplore: serves the unfiltered views from the stored pulls and nothing else', () => {
  const gsc = {
    windows: {
      cur: { start: '2026-10-12', end: '2026-11-08' },
      prev: { start: '2026-09-14', end: '2026-10-11' },
      d90: { start: '2026-08-11', end: '2026-11-08' },
    },
    queryCur: QCUR,
    queryPrev: QPREV,
    qp90: [
      { query: 'x', page: '/a', clicks: 1, impressions: 100, position: 4 },
      { query: 'x', page: '/b', clicks: 0, impressions: 100, position: 8 },
    ],
    pageDaily: [
      { page: '/a', date: '2026-10-05', clicks: 0, impressions: 10, position: 5 },
      { page: '/a', date: '2026-11-07', clicks: 2, impressions: 300, position: 4 },
      { page: '/a', date: '2026-11-01', clicks: 1, impressions: 100, position: 8 },
    ],
  };
  const q28 = storedExplore(gsc, { dim: 'query', days: 28, through: '2026-11-08', ctrMin: 200 });
  assert.equal(q28.rows.find((r) => r.key === 'vanished search').movement, 'gone');
  assert.equal(q28.range.start, '2026-10-12');
  assert.equal(q28.range.label, 'Last 28 days');
  assert.equal(q28.cached, false);

  const q90 = storedExplore(gsc, { dim: 'query', days: 90, through: '2026-11-08' });
  assert.equal(q90.rows.length, 1);
  assert.equal(q90.rows[0].position, 6, 'weighted over its pages');
  assert.equal(q90.comparable, false);
  assert.ok(q90.rows[0].prev === null && q90.rows[0].movement === null);

  const p7 = storedExplore(gsc, { dim: 'page', days: 7, through: '2026-11-08', ctrMin: 200 });
  assert.equal(p7.rows[0].key, '/a');
  assert.equal(p7.rows[0].impressions, 300);
  assert.equal(p7.rows[0].ctr, 0.007);
  assert.equal(p7.comparable, true, 'the page history reaches back to the earlier week');

  assert.equal(storedExplore(gsc, { dim: 'query', days: 7, through: '2026-11-08' }), null, 'no stored 7 day searches');
  assert.equal(storedExplore(gsc, { dim: 'query', days: 480, through: '2026-11-08' }), null);
  assert.equal(storedExplore(null, { dim: 'query', days: 28 }), null);
});

// ---------------------------------------------------------------- the live session

test('liveSession: opens on the first call only, shares one session, closes it always', async () => {
  let opened = 0;
  let closed = 0;
  const s = liveSession({
    open: async () => {
      opened += 1;
      return { call: async (tool, args) => ({ tool, args }), close: () => (closed += 1) };
    },
  });
  await s.close();
  assert.equal(opened, 0, 'closing before any call opens nothing');
  const [a, b] = await Promise.all([s.call('t', 1), s.call('t', 2)]);
  assert.equal(opened, 1);
  assert.equal(a.args, 1);
  assert.equal(b.args, 2);
  await s.close();
  assert.equal(closed, 1);
});

test('liveSession: stops after the time limit with a message that reads as slow', async () => {
  let closed = 0;
  const s = liveSession({
    totalMs: 20,
    open: async (_key, { signal }) => {
      const session = { close: () => (closed += 1) };
      session.call = () =>
        new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('session closed'))));
      return session;
    },
  });
  const e = await s.call('t', {}).catch((x) => x);
  assert.match(e.message, /timed out after/);
  await s.close();
  assert.equal(closed, 1);
});

// ---------------------------------------------------------------- the routes

const gscSnap = {
  source: 'gsc',
  ok: true,
  status: 'fresh',
  pulledAt: '2026-11-09T07:00:00.000Z',
  through: '2026-11-08',
  error: null,
  data: {
    siteDaily: [],
    pageDaily: [],
    qpCur: [],
    qpPrev: [],
    qp90: [],
    queryCur: QCUR,
    queryPrev: QPREV,
    countries: [
      { country: 'can', clicks: 2, impressions: 100 },
      { country: 'usa', clicks: 20, impressions: 900 },
      { country: 'zzz', clicks: 0, impressions: 1 },
    ],
    devices: [
      { device: 'MOBILE', clicks: 5, impressions: 500 },
      { device: 'DESKTOP', clicks: 7, impressions: 600 },
    ],
    windows: {
      cur: { start: '2026-10-12', end: '2026-11-08' },
      prev: { start: '2026-09-14', end: '2026-10-11' },
      d90: { start: '2026-08-11', end: '2026-11-08' },
    },
  },
};

function routeSet(open) {
  const rs = makeRoutes({ open });
  const find = (p) => rs.find((r) => r.path === p);
  return async (p, query = '') => {
    const ctx = { url: new URL(`http://x${p}?${query}`) };
    return find(p).handler(ctx);
  };
}

before(() => {
  fs.writeFileSync(path.join(DATA, 'snap/gsc.json'), JSON.stringify(gscSnap));
  invalidate();
});

test('routes: GET /api/explore serves the unfiltered 28 day searches from the stored pull, with no live call', async () => {
  clearCache();
  let opened = 0;
  const get = routeSet(async () => {
    opened += 1;
    throw new Error('must not open');
  });
  const out = await get('/api/explore', 'dim=query&range=28');
  assert.equal(opened, 0);
  assert.equal(out.source, 'stored');
  assert.equal(out.dim, 'query');
  assert.equal(out.rows.find((r) => r.key === 'vanished search').movement, 'gone');
  assert.deepEqual(out.chips, []);
  assert.equal(out.range.text, '12 October to 8 November');
  assert.equal(out.fetchedOn, '9 November');
  assert.ok(out.rows.every((r) => !('ctr' in r) && typeof r.brand === 'boolean'));
  assert.ok(Array.isArray(out.sources) && 'through' in out);
});

test('routes: a filtered view pulls live once, caches it, and always closes the session', async () => {
  clearCache();
  let opened = 0;
  let closed = 0;
  const log = [];
  const live = fakeCall(
    {
      [`page|${resolveRange('14', '2026-11-10').start}`]: PCUR,
      [`page|${resolveRange('14', '2026-11-10').prevStart}`]: PPREV,
    },
    log
  );
  const get = routeSet(async () => {
    opened += 1;
    return { call: live, close: () => (closed += 1) };
  });
  const q = 'dim=page&range=14&page=12-hour&pmode=contains';
  const first = await get('/api/explore', q);
  assert.equal(first.source, 'live');
  assert.equal(opened, 1);
  assert.equal(closed, 1);
  assert.equal(first.rows[0].key, '/blog/twelve-hour');
  assert.deepEqual(
    first.chips.map((c) => c.text),
    ['Page contains "12-hour"']
  );
  assert.deepEqual(JSON.parse(log[0].args.filters), [
    { dimension: 'page', operator: 'contains', expression: '12-hour' },
  ]);
  const second = await get('/api/explore', q);
  assert.equal(second.source, 'cache');
  assert.equal(second.cached, true);
  assert.equal(opened, 1, 'a cached view opens no server');
});

test('routes: Review Focus 1, a failed or slow live pull is a plain 502 and the stored view still works', async () => {
  clearCache();
  let closed = 0;
  const get = routeSet(async () => ({
    call: async () => {
      throw new Error('google-search-console tools/call timed out after 60000ms.');
    },
    close: () => (closed += 1),
  }));
  const e = await get('/api/explore', 'dim=query&range=28&q=shift').catch((x) => x);
  assert.equal(e.status, 502);
  assert.equal(e.message, 'Search Console took too long to answer, so this view could not be loaded.');
  assert.equal(closed, 1, 'the session is closed after a failure');
  assert.equal(cacheFiles().length, 0);
  // The unfiltered view the page was showing is still there to keep.
  const kept = await get('/api/explore', 'dim=query&range=28');
  assert.equal(kept.source, 'stored');
  assert.ok(kept.rows.length > 0);

  // A server that will not start at all gets the same plain treatment.
  const down = routeSet(async () => {
    throw new Error('Could not start google-search-console: ENOENT');
  });
  const e2 = await down('/api/explore', 'range=custom&start=2026-10-01&end=2026-10-20').catch((x) => x);
  assert.equal(e2.status, 502);
  assert.match(e2.message, /could not be reached/);
});

test('routes: bad input is a 400 before anything is pulled', async () => {
  let opened = 0;
  const get = routeSet(async () => {
    opened += 1;
    throw new Error('no');
  });
  for (const query of [
    'dim=country',
    'range=1000',
    'range=custom&start=2026-10-01',
    'q=a&qmode=starts',
    'country=us',
    'device=watch',
  ]) {
    const e = await get('/api/explore', query).catch((x) => x);
    assert.equal(e.status, 400, query);
  }
  assert.equal((await get('/api/search-detail', '').catch((x) => x)).status, 400);
  assert.equal((await get('/api/distribution', 'range=nope').catch((x) => x)).status, 400);
  assert.equal(opened, 0);
});

test('routes: GET /api/distribution uses the stored pull for 28 days and counts the earlier period', async () => {
  const get = routeSet(async () => {
    throw new Error('must not open');
  });
  const out = await get('/api/distribution', 'range=28');
  assert.equal(out.source, 'stored');
  assert.deepEqual(
    out.buckets.map((b) => b.bucket),
    ['1 to 3', '4 to 10', '11 to 20', '21 to 50', '51 and beyond']
  );
  // Now: 8.2, 14.4, 22, 5 -> 4 to 10: 2, 11 to 20: 1, 21 to 50: 1. Before: 9, 11, 5, 30.
  assert.deepEqual(
    out.buckets.map((b) => b.count),
    [0, 2, 1, 1, 0]
  );
  assert.deepEqual(
    out.buckets.map((b) => b.prevCount),
    [0, 2, 1, 1, 0]
  );
  assert.equal(out.searches, 4);
  assert.match(out.note, /counted once/);
});

test('routes: GET /api/distribution for another range is one live pull of the searches', async () => {
  clearCache();
  const r = resolveRange('14', '2026-11-10');
  const get = routeSet(async () => ({
    call: fakeCall({ [`query|${r.start}`]: QCUR, [`query|${r.prevStart}`]: QPREV }),
    close() {},
  }));
  const out = await get('/api/distribution', 'range=14');
  assert.equal(out.source, 'live');
  assert.equal(out.searches, 4);
  assert.equal(
    out.buckets.reduce((s, b) => s + b.count, 0),
    4
  );
});

test('routes: GET /api/search-detail and GET /api/explore/options', async () => {
  clearCache();
  const r = resolveRange('28', '2026-11-10');
  let closed = 0;
  const get = routeSet(async () => ({
    call: fakeCall({
      [`date|${r.start}`]: [{ date: '2026-10-20', clicks: 1, impressions: 9, position: 7 }],
      [`page|${r.start}`]: [{ page: 'https://simplescheduleai.com/blog/a', clicks: 1, impressions: 9, position: 7 }],
    }),
    close: () => (closed += 1),
  }));
  const d = await get('/api/search-detail', 'query=Shift%20Swap&range=28');
  assert.equal(d.query, 'Shift Swap');
  assert.equal(d.series.length, 1);
  assert.equal(d.pages[0].share, null, '9 views is too few to split into shares');
  assert.equal(d.source, 'live');
  assert.equal(closed, 1);

  const o = await get('/api/explore/options');
  assert.deepEqual(
    o.countries.map((c) => [c.code, c.name]),
    [
      ['usa', 'United States'],
      ['can', 'Canada'],
      ['zzz', 'ZZZ'],
    ]
  );
  assert.deepEqual(
    o.devices.map((x) => [x.code, x.name]),
    [
      ['DESKTOP', 'Computer'],
      ['MOBILE', 'Phone'],
    ]
  );
  assert.ok(o.ranges.some((x) => x.value === 'last-quarter'));
  assert.deepEqual(
    o.modes.map((m) => m.value),
    ['contains', 'exact', 'excludes']
  );
});

// ---------------------------------------------------------------- one live session at a time

test('routes: only one live pull runs at a time; a second waits, then gets a plain 429; cached and stored views never wait', async () => {
  clearCache();
  let release;
  const gate = new Promise((r) => (release = r));
  let opened = 0;
  let closed = 0;
  const r14 = resolveRange('14', '2026-11-10');
  const table = { [`query|${r14.start}`]: QCUR, [`query|${r14.prevStart}`]: QPREV };
  const slow = async (tool, args) => {
    await gate;
    return fakeCall(table)(tool, args);
  };
  const rs = makeRoutes({
    waitMs: 40,
    open: async () => {
      opened += 1;
      return { call: slow, close: () => (closed += 1) };
    },
  });
  const run = (p, query) => rs.find((r) => r.path === p).handler({ url: new URL(`http://x${p}?${query}`) });

  const first = run('/api/explore', 'dim=query&range=14');
  await new Promise((r) => setTimeout(r, 10));
  assert.equal(opened, 1);

  // A stored view is answered at once while the live pull is running.
  const stored = await run('/api/explore', 'dim=query&range=28');
  assert.equal(stored.source, 'stored');

  // Another live request waits 40 ms and is refused in plain words.
  const second = await run('/api/search-detail', 'query=x&range=14').catch((e) => e);
  assert.equal(second.status, 429);
  assert.equal(second.message, 'Search Console is busy with another request. Try again in a moment.');
  assert.equal(opened, 1, 'the refused request never started a server');

  release();
  const done = await first;
  assert.equal(done.source, 'live');
  assert.equal(closed, 1);

  // The same request again is now a cache hit and opens nothing, even with the lock free.
  const cached = await run('/api/explore', 'dim=query&range=14');
  assert.equal(cached.source, 'cache');
  assert.equal(opened, 1);
});

test('routes: a second live request that waits less than the limit gets its turn', async () => {
  clearCache();
  const order = [];
  let release;
  const gate = new Promise((r) => (release = r));
  const r14 = resolveRange('14', '2026-11-10');
  const table = {
    [`query|${r14.start}`]: QCUR,
    [`query|${r14.prevStart}`]: QPREV,
    [`page|${r14.start}`]: PCUR,
    [`page|${r14.prevStart}`]: PPREV,
  };
  let n = 0;
  const rs = makeRoutes({
    waitMs: 2000,
    open: async () => {
      const id = (n += 1);
      order.push(`open${id}`);
      return {
        call: async (tool, args) => {
          if (id === 1) await gate;
          return fakeCall(table)(tool, args);
        },
        close: () => order.push(`close${id}`),
      };
    },
  });
  const run = (query) =>
    rs.find((r) => r.path === '/api/explore').handler({ url: new URL(`http://x/api/explore?${query}`) });
  const a = run('dim=query&range=14');
  await new Promise((r) => setTimeout(r, 10));
  const b = run('dim=page&range=14');
  await new Promise((r) => setTimeout(r, 10));
  assert.deepEqual(order, ['open1'], 'the second is waiting');
  release();
  const [ra, rb] = await Promise.all([a, b]);
  assert.equal(ra.source, 'live');
  assert.equal(rb.source, 'live');
  assert.deepEqual(order, ['open1', 'close1', 'open2', 'close2'], 'one session at a time');
});
