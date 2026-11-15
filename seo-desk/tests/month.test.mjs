import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Package 7 (2026-11-15): the Monthly report and the date ranges it needs. Every page, phrase and
// number here is invented.

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-p7-'));
const DATA = path.join(root, 'data');
const REPO = path.join(root, 'repo');
fs.mkdirSync(path.join(REPO, 'docs/seo'), { recursive: true });
fs.writeFileSync(path.join(REPO, 'docs/seo/brand-terms.json'), JSON.stringify(['examplebrand']));
process.env.SEO_DESK_DATA = DATA;
process.env.SEO_DESK_REPO = REPO;
process.env.SEO_DESK_TODAY = '2026-11-15';

const month = await import('../lib/month.mjs');
const { addDays } = await import('../lib/dates.mjs');

const days = (start, end) => {
  const out = [];
  for (let d = start; d <= end; d = addDays(d, 1)) out.push(d);
  return out;
};

// ---------------------------------------------------------------- the months

test('months: complete months the daily rows cover, newest first, the current month marked so far', () => {
  const site = days('2026-04-08', '2026-11-12').map((date) => ({ date, clicks: 1, impressions: 10 }));
  const list = month.monthsAvailable(site, '2026-11-12');
  assert.deepEqual(
    list.map((m) => [m.month, m.soFar]),
    [
      ['2026-11', true],
      ['2026-10', false],
      ['2026-09', false],
      ['2026-08', false],
      ['2026-07', false],
      ['2026-06', false],
      ['2026-05', false],
    ]
  );
  assert.equal(list[0].label, 'November 2026 so far');
  assert.equal(list[0].end, '2026-11-12');
  assert.equal(list[1].label, 'October 2026');
  assert.equal(list[1].days, 31);
  // April starts on the 8th in the rows, so it is not a month the desk can report.
  assert.ok(!list.some((m) => m.month === '2026-04'));
  assert.equal(month.defaultMonth(list), '2026-10');
});

test('months: a month counts only when Search Console has data for its last day', () => {
  const site = days('2026-09-01', '2026-10-31').map((date) => ({ date, clicks: 1, impressions: 10 }));
  // Data runs through 31 October: October is complete, not "so far".
  const list = month.monthsAvailable(site, '2026-10-31');
  assert.deepEqual(
    list.map((m) => [m.month, m.soFar]),
    [
      ['2026-10', false],
      ['2026-09', false],
    ]
  );
  // A day short: October is the month so far and September is the default.
  const short = month.monthsAvailable(site.slice(0, -1), '2026-10-30');
  assert.equal(short[0].soFar, true);
  assert.equal(month.defaultMonth(short), '2026-09');
});

test('months: a complete month is compared per day with the whole month before, and says so', () => {
  const w = month.monthWindows('2026-10', '2026-11-12');
  assert.equal(w.soFar, false);
  assert.deepEqual([w.cur.start, w.cur.end, w.cur.days], ['2026-10-01', '2026-10-31', 31]);
  assert.deepEqual([w.prev.start, w.prev.end, w.prev.days], ['2026-09-01', '2026-09-30', 30]);
  assert.match(w.compareText, /per day, against September's 30 days/);
  assert.equal(w.againstText, "per day, against September's 30 days");
});

test('months: the month so far is compared with the same number of days at the start of the month before', () => {
  const w = month.monthWindows('2026-11', '2026-11-12');
  assert.equal(w.soFar, true);
  assert.deepEqual([w.cur.start, w.cur.end, w.cur.days], ['2026-11-01', '2026-11-12', 12]);
  assert.deepEqual([w.prev.start, w.prev.end, w.prev.days], ['2026-10-01', '2026-10-12', 12]);
  assert.match(w.compareText, /1 November to 12 November/);
  assert.match(w.compareText, /1 October to 12 October/);
  // 31 days so far in March meet all of February's 28, and the days are named.
  const m = month.monthWindows('2027-03', '2027-03-31');
  assert.equal(m.soFar, false);
  const so = month.monthWindows('2027-03', '2027-03-30');
  assert.deepEqual([so.prev.start, so.prev.end, so.prev.days], ['2027-02-01', '2027-02-28', 28]);
  assert.match(so.compareText, /28 days/);
  // January's month before is December of the year before.
  assert.equal(month.monthWindows('2027-01', '2027-02-10').prev.start, '2026-12-01');
});

test('months: changes are per-day averages, with the 20 base on the earlier total', () => {
  // 310 in 31 days against 300 in 30 days is the same 10 a day: no change, not +3.3%.
  assert.equal(month.perDayChange(310, 31, 300, 30), 0);
  assert.equal(month.perDayChange(620, 31, 300, 30), 100);
  // Under 20 in the earlier period: no percentage, whatever the days.
  assert.equal(month.perDayChange(50, 31, 19, 30), null);
  assert.equal(month.perDayChange(50, 31, 0, 30), null);
});

test('months: coverage and page rows from the stored daily rows', () => {
  const rows = days('2026-08-01', '2026-10-31').map((date) => ({
    page: '/blog/a',
    date,
    clicks: 1,
    impressions: 4,
    position: 5,
  }));
  assert.equal(month.coversRange(rows, '2026-09-01', '2026-09-30'), true);
  assert.equal(month.coversRange(rows, '2026-07-01', '2026-07-31'), false);
  assert.equal(month.coversRange(rows, '2026-11-01', '2026-11-12'), false);
  const p = month.pagesFromDaily(rows, '2026-09-01', '2026-09-30');
  assert.deepEqual(p, [{ page: '/blog/a', clicks: 30, impressions: 120, position: 5 }]);
});

// ---------------------------------------------------------------- the cache

const fakeCall = (log) => async (tool, args) => {
  log.push(args);
  return { rows: [{ keys: [`made up search ${args.start_date}`], clicks: 2, impressions: 40, position: 7 }] };
};

test('cache: a finished month is pulled once and kept for good; a range still running is kept for the day', async () => {
  fs.rmSync(path.join(DATA, 'cache'), { recursive: true, force: true });
  const log = [];
  const call = fakeCall(log);
  const newest = '2026-11-12';
  const t0 = Date.parse('2026-11-15T09:00:00');
  const oct = await month.periodRows(
    { dim: 'query', start: '2026-10-01', end: '2026-10-31' },
    { call, now: t0, newest }
  );
  assert.equal(oct.cached, false);
  assert.equal(oct.finished, true);
  assert.equal(oct.rows[0].query, 'made up search 2026-10-01');
  assert.equal(log.length, 1);
  assert.equal(log[0].dimensions, 'query');
  assert.equal(log[0].row_limit, 25000);
  // Opened again, a month later: no pull.
  const again = await month.periodRows(
    { dim: 'query', start: '2026-10-01', end: '2026-10-31' },
    { call, now: t0 + 40 * 86400000, newest }
  );
  assert.equal(again.cached, true);
  assert.equal(log.length, 1);

  // November so far ends on the newest day: kept for the day it was pulled on.
  const nov = { dim: 'query', start: '2026-11-01', end: '2026-11-12' };
  assert.equal((await month.periodRows(nov, { call, now: t0, newest })).finished, false);
  assert.equal((await month.periodRows(nov, { call, now: t0 + 3600000, newest })).cached, true);
  assert.equal(log.length, 2);
  await month.periodRows(nov, { call, now: t0 + 86400000, newest });
  assert.equal(log.length, 3, 'pulled again the next day');

  // The Ask digest asks the cache only: never a pull.
  assert.equal(
    await month.periodRows(
      { dim: 'query', start: '2026-06-01', end: '2026-06-30' },
      { call, now: t0, newest, cacheOnly: true }
    ),
    null
  );
  assert.equal(log.length, 3);
});

test('cache: a failed pull caches nothing and throws one plain sentence', async () => {
  fs.rmSync(path.join(DATA, 'cache'), { recursive: true, force: true });
  const call = async () => {
    throw Object.assign(new Error('boom stderr: Traceback (most recent call last)'), { kind: 'failed' });
  };
  await assert.rejects(
    month.periodRows({ dim: 'page', start: '2026-06-01', end: '2026-06-30' }, { call, newest: '2026-11-12' }),
    (e) => e.status === 502 && /could not be reached/.test(e.message) && !/Traceback/.test(e.message)
  );
  assert.equal(fs.existsSync(path.join(DATA, 'cache/periods')), false);
});

test('cache: a finished range is one that ends before the newest data day, or a whole month that has data', () => {
  assert.equal(month.isFinished({ start: '2026-10-01', end: '2026-10-31' }, '2026-10-31'), true);
  assert.equal(month.isFinished({ start: '2026-10-05', end: '2026-10-31' }, '2026-10-31'), false);
  assert.equal(month.isFinished({ start: '2026-10-05', end: '2026-10-30' }, '2026-10-31'), true);
  assert.equal(month.isFinished({ start: '2026-11-01', end: '2026-11-12' }, '2026-11-12'), false);
});

// ---------------------------------------------------------------- the report

const { invalidate } = await import('../lib/api/model.mjs');
const { writeJson } = await import('../lib/store.mjs');
const { makeMonthRoutes, monthView, lastMonthBrief } = await import('../lib/api/ext/month.mjs');
const { makeLock } = await import('../lib/api/ext/explore.mjs');

const SITE = 'https://simplescheduleai.com';
const perDayRows = (start, end, fn) => days(start, end).map((date) => ({ date, ...fn(date) }));
// Site totals from 1 May: September 90 a day and 3 clicks, October 100 a day and 4 clicks.
const siteDaily = perDayRows('2026-05-01', '2026-11-12', (d) =>
  d.startsWith('2026-10')
    ? { clicks: 4, impressions: 100 }
    : d.startsWith('2026-09')
      ? { clicks: 3, impressions: 90 }
      : { clicks: 2, impressions: 50 }
);
// Page rows from 1 August only: an earlier month needs a pull by page.
const pageDaily = [
  ...perDayRows('2026-08-01', '2026-11-12', (d) => ({
    page: '/blog/alpha',
    clicks: 1,
    impressions: d.startsWith('2026-10') ? 50 : 20,
    position: 6,
  })),
  ...perDayRows('2026-08-01', '2026-11-12', (d) => ({
    page: '/blog/beta',
    clicks: 0,
    impressions: d.startsWith('2026-10') ? 10 : 30,
    position: 9,
  })),
];
const q = (query, impressions, position, clicks = 1) => ({ keys: [query], clicks, impressions, position });
const PULLS = {
  'query|2026-10-01': [
    q('alpha rota', 400, 5),
    q('beta rota', 120, 9),
    q('gamma rota', 90, 12),
    q('delta rota', 30, 20),
    q('made up other', 900, 30, 0),
  ],
  'query|2026-09-01': [
    q('alpha rota', 200, 8),
    q('beta rota', 130, 9.4),
    q('gamma rota', 100, 10),
    q('made up other', 600, 31, 0),
  ],
  'query|2026-07-01': [q('alpha rota', 50, 15)],
  'query|2026-06-01': [q('alpha rota', 40, 18)],
  'page|2026-07-01': [{ keys: [`${SITE}/blog/alpha`], clicks: 9, impressions: 300, position: 11 }],
  'page|2026-06-01': [{ keys: [`${SITE}/blog/alpha`], clicks: 5, impressions: 200, position: 12 }],
  'query|2026-11-01': [q('alpha rota', 150, 4)],
  'query|2026-10-01|2026-10-12': [q('alpha rota', 140, 5)],
};

function writeFixture() {
  fs.rmSync(DATA, { recursive: true, force: true });
  const snap = (source, data, extra = {}) =>
    writeJson(`snap/${source}.json`, {
      source,
      ok: true,
      status: 'fresh',
      pulledAt: '2026-11-15T00:30:00.000Z',
      through: '2026-11-12',
      error: null,
      data,
      ...extra,
    });
  snap('gsc', {
    siteDaily,
    pageDaily,
    queryCur: [],
    queryPrev: [],
    qpCur: [],
    qpPrev: [],
    query90: [],
    windows: {
      cur: { start: '2026-10-16', end: '2026-11-12' },
      prev: { start: '2026-09-18', end: '2026-10-15' },
      d90: { start: '2026-08-15', end: '2026-11-12' },
    },
  });
  snap('bing', { siteDaily: perDayRows('2026-08-01', '2026-11-12', () => ({ clicks: 1, impressions: 30 })) });
  // GA4 visits start mid October: it cannot answer for October, and must say so rather than show 0.
  snap('ga4', {
    channelsDaily: perDayRows('2026-10-15', '2026-11-12', () => ({ channel: 'Organic Search', sessions: 5 })),
  });
  snap('local', {
    registry: [
      { slug: 'alpha', url: '/blog/alpha', primaryKeyword: 'alpha rota' },
      { slug: 'beta', url: '/blog/beta', primaryKeyword: 'beta rota' },
      { slug: 'gamma', url: '/blog/gamma', primaryKeyword: 'gamma rota' },
      { slug: 'delta', url: '/blog/delta', primaryKeyword: 'delta rota' },
    ],
    livePages: [{ page: '/blog/alpha' }, { page: '/blog/beta' }],
    edits: [
      { page: '/blog/fresh-post', date: '2026-10-14', kind: 'publish', subject: 'add post' },
      { page: '/blog/older-post', date: '2026-09-02', kind: 'publish', subject: 'add post' },
      { page: '/blog/alpha', date: '2026-08-01', kind: 'edit', subject: 'fix a count' },
    ],
    contentEdits: [],
    plan: { file: 'plan.md', posts: [], improve: [{ page: '/blog/alpha', done: true, doneDate: '2026-10-20' }] },
    verdicts: [
      {
        slug: 'alpha',
        url: '/blog/alpha',
        changeDate: '2026-09-05',
        judgedOn: '2026-10-07',
        verdict: 'better',
        commits: [{ hash: 'c1' }],
        before: { impressions: 100 },
        after: { impressions: 160 },
      },
      {
        slug: 'beta',
        url: '/blog/beta',
        changeDate: '2026-09-06',
        judgedOn: '2026-10-08',
        verdict: 'worse',
        overlapping: true,
        commits: [{ hash: 'c2' }],
        before: { impressions: 100 },
        after: { impressions: 60 },
      },
      {
        slug: 'gamma',
        url: '/blog/gamma',
        changeDate: '2026-10-01',
        judgedOn: '2026-11-01',
        verdict: 'worse',
        commits: [{ hash: 'c3' }],
        before: { impressions: 100 },
        after: { impressions: 60 },
      },
    ],
    aeo: [
      {
        date: '2026-10-01',
        engines: ['chat_gpt'],
        rows: [{ kind: 'own-mention', platform: 'chat_gpt', question: 'made up question', citedUrls: [] }],
      },
      { date: '2026-11-01', engines: ['chat_gpt'], rows: [] },
    ],
  });
  invalidate();
}

function liveFake(log) {
  return async () => ({
    call: async (tool, args) => {
      log.push(`${args.dimensions}|${args.start_date}|${args.end_date}`);
      const rows =
        PULLS[`${args.dimensions}|${args.start_date}|${args.end_date}`] ??
        PULLS[`${args.dimensions}|${args.start_date}`];
      if (rows === undefined) return 'No search analytics data found for the site.';
      return { rows };
    },
    close() {},
  });
}

const routesWith = (open) => {
  const rs = makeMonthRoutes({ open, lock: makeLock(), now: Date.parse('2026-11-15T09:00:00') });
  return async (p, query = '') => {
    const route = rs.find((r) => r.path === p);
    let sent = null;
    const ctx = {
      url: new URL(`http://x${p}?${query}`),
      res: { writeHead: (status, headers) => (sent = { status, headers }), end: (b) => (sent.body = String(b)) },
    };
    const out = await route.handler(ctx);
    return sent ?? out;
  };
};

const listFiles = (dir) =>
  fs.existsSync(dir)
    ? fs
        .readdirSync(dir, { recursive: true })
        .filter((f) => fs.statSync(path.join(dir, f)).isFile())
        .sort()
    : [];

test('report: October against September, per day, totals as totals; the searches are pulled once and kept', async () => {
  writeFixture();
  const log = [];
  const get = routesWith(liveFake(log));
  const before = listFiles(DATA);
  const v = await get('/api/month');
  assert.equal(v.month, '2026-10');
  assert.equal(v.label, 'October 2026');
  assert.equal(v.months[0].label, 'November 2026 so far');
  assert.deepEqual(
    [v.cur.start, v.cur.end, v.prev.start, v.prev.end],
    ['2026-10-01', '2026-10-31', '2026-09-01', '2026-09-30']
  );
  const [clicks, imps, rate, pos] = v.tiles;
  assert.equal(clicks.value, 124);
  assert.equal(imps.value, 3100);
  assert.equal(imps.prevValue, 2700);
  // 100 a day against 90 a day, not 3100 against 2700 (+14.8%).
  assert.equal(imps.change, 11.1);
  assert.equal(clicks.change, 33.3);
  assert.equal(imps.against, "per day, against September's 30 days");
  assert.match(imps.note, /100 a day, against 90 a day/);
  assert.equal(rate.valueText, '4%');
  assert.equal(rate.change, 0.7);
  // Like for like over alpha, beta and gamma (delta has no September place).
  assert.equal(pos.value, 8.7);
  assert.equal(pos.prevValue, 9.1);
  assert.equal(pos.change, 0.4);
  assert.match(v.compareText, /per day, against September's 30 days/);
  // Two pulls (October and September searches); the page rows are stored for both months.
  assert.equal(v.pulls, 2);
  assert.deepEqual(log, ['query|2026-10-01|2026-10-31', 'query|2026-09-01|2026-09-30']);
  // The only files written are the two cache entries.
  const added = listFiles(DATA).filter((f) => !before.includes(f));
  assert.equal(added.length, 2);
  assert.ok(added.every((f) => f.startsWith(`cache${path.sep}periods${path.sep}f-`)));
  // The second open pulls nothing.
  const again = await get('/api/month', 'm=2026-10');
  assert.equal(again.pulls, 0);
  assert.equal(log.length, 2);
  assert.equal(again.tiles[3].value, 8.7);
});

test('report: the series, top pages and searches, the target keywords and the plain sentences', async () => {
  writeFixture();
  const v = await routesWith(liveFake([]))('/api/month', 'm=2026-10');
  assert.equal(v.series.length, 31);
  assert.equal(v.series[0].date, '2026-10-01');
  assert.equal(v.topPages[0].page, '/blog/alpha');
  assert.equal(v.topPages[0].impressions, 1550);
  // 50 a day against 20 a day.
  assert.equal(v.topPages[0].change, 150);
  assert.equal(v.topSearches[0].query, 'made up other');
  assert.match(v.topSearchesNote, /floor/);
  const t = v.targets;
  assert.deepEqual([t.improved, t.held, t.slipped, t.noData, t.total], [1, 1, 1, 1, 4]);
  assert.deepEqual(
    t.rows.map((r) => [r.keyword, r.change, r.move]),
    [
      ['alpha rota', 3, 'improved'],
      ['gamma rota', -2, 'slipped'],
      ['beta rota', 0.4, 'held'],
    ]
  );
  assert.match(t.note, /1 target keyword has no place in one of the two months/);
  assert.ok(v.summary.length >= 3 && v.summary.length <= 5);
  for (const s of v.summary) assert.match(s, /\d/, `every sentence carries its numbers: ${s}`);
  assert.match(v.summary[0], /3,100 times in 1 October to 31 October/);
  assert.match(v.summary[1], /\/blog\/alpha rose most, from 600 to 1,550/);
  assert.match(v.summary[1], /\/blog\/beta fell most/);
  assert.match(v.summary[2], /1 improved, 1 held and 1 slipped/);
  assert.match(v.summary.at(-1), /1 post was published and 1 deliberate page edit was recorded/);
  assert.equal(/because|due to|caused|thanks to/i.test(v.summary.join(' ')), false, 'never a cause');
  assert.equal(/[–—]/.test(JSON.stringify(v)), false, 'no em or en dash');
});

test('report: what was done in the month comes from the desk records; other sources never show a zero they do not hold', async () => {
  writeFixture();
  const v = await routesWith(liveFake([]))('/api/month', 'm=2026-10');
  assert.deepEqual(
    v.done.posts.map((p) => p.page),
    ['/blog/fresh-post']
  );
  assert.deepEqual(
    v.done.edits.map((e) => [e.page, e.date]),
    [['/blog/alpha', '2026-10-20']]
  );
  // The readable change reads Better; the overlapped one is counted, not read.
  assert.deepEqual(
    v.done.verdicts.map((x) => [x.pages, x.reads]),
    [[['/blog/alpha'], 'Better']]
  );
  assert.equal(v.done.verdictsUnreadable, 1);
  assert.equal(v.done.auditText, 'No audit ran in this month.');
  assert.match(v.done.editsNote, /35 days/);
  assert.deepEqual([v.other.bing.clicks, v.other.bing.impressions], [31, 930]);
  assert.equal(v.other.ga4, null);
  assert.match(v.other.ga4Text, /no GA4 visits by channel for all of October 2026/);
  assert.deepEqual(
    v.other.ai.map((a) => a.date),
    ['2026-10-01']
  );
  assert.match(v.other.ai[0].text, /named in 1 answer/);
  assert.match(v.footer.join(' '), /Search Console data runs through 12 November 2026/);
  assert.match(v.footer.join(' '), /Searches for 1 October to 31 October: pulled on 15 November and kept/);
});

test('report: November so far is compared with the same days at the start of October', async () => {
  writeFixture();
  const log = [];
  const v = await routesWith(liveFake(log))('/api/month', 'm=2026-11');
  assert.equal(v.soFar, true);
  assert.equal(v.label, 'November 2026 so far');
  assert.deepEqual(
    [v.cur.start, v.cur.end, v.prev.start, v.prev.end],
    ['2026-11-01', '2026-11-12', '2026-10-01', '2026-10-12']
  );
  assert.match(
    v.compareText,
    /1 November to 12 November \(12 days\) against the same days at the start of October, 1 October to 12 October/
  );
  assert.deepEqual(log, ['query|2026-11-01|2026-11-12', 'query|2026-10-01|2026-10-12']);
  // Kept for the day only.
  assert.ok(listFiles(path.join(DATA, 'cache/periods')).some((f) => f.startsWith('d-')));
});

test('report: a month older than the stored page rows pulls its page rows, and a month with nothing before it compares nothing', async () => {
  writeFixture();
  const log = [];
  const get = routesWith(liveFake(log));
  const jul = await get('/api/month', 'm=2026-07');
  assert.deepEqual(log.sort(), [
    'page|2026-06-01|2026-06-30',
    'page|2026-07-01|2026-07-31',
    'query|2026-06-01|2026-06-30',
    'query|2026-07-01|2026-07-31',
  ]);
  assert.equal(jul.topPages[0].impressions, 300);
  // 300 in 31 days against 200 in 30 days, per day.
  assert.equal(jul.topPages[0].change, 45.2);
  const may = await get('/api/month', 'm=2026-05');
  assert.equal(may.comparable, false);
  assert.equal(may.tiles[1].change, null);
  assert.match(may.tiles[1].note, /no daily numbers for the month before/);
});

test('report: a failed pull keeps the stored numbers, says why, and caches nothing', async () => {
  writeFixture();
  const get = routesWith(async () => ({
    call: async () => {
      throw Object.assign(new Error('boom'), { kind: 'failed' });
    },
    close() {},
  }));
  const v = await get('/api/month', 'm=2026-10');
  assert.match(v.searchError, /could not be reached/);
  assert.equal(v.tiles[1].value, 3100);
  assert.equal(v.tiles[3].value, null);
  assert.equal(v.topSearches, null);
  assert.equal(v.topPages[0].page, '/blog/alpha');
  assert.equal(v.targets.available, false);
  assert.equal(fs.existsSync(path.join(DATA, 'cache/periods')), false);
});

test('report: the month in the address is checked; a month the desk cannot report falls back with a note', async () => {
  writeFixture();
  const get = routesWith(liveFake([]));
  await assert.rejects(get('/api/month', 'm=2026-13'), (e) => e.status === 400);
  await assert.rejects(get('/api/month', 'm=../etc'), (e) => e.status === 400);
  const v = await get('/api/month', 'm=2025-01');
  assert.equal(v.month, '2026-10');
  assert.match(v.pickNote, /no complete numbers for January 2025/);
});

test('report: the CSV holds pages, searches and target keywords, each row with the month and its dates', async () => {
  writeFixture();
  const sent = await routesWith(liveFake([]))('/api/month.csv', 'm=2026-10');
  assert.match(sent.headers['Content-Disposition'], /seo-desk-month-2026-10\.csv/);
  const lines = sent.body.trim().split('\r\n');
  assert.match(lines[0], /^section,month,date_range,compared_with/);
  const body = lines.slice(1);
  assert.ok(body.some((l) => l.startsWith('Pages,')));
  assert.ok(body.some((l) => l.startsWith('Searches,')));
  assert.ok(body.some((l) => l.startsWith('Target keywords,')));
  for (const l of body) assert.match(l, /,October 2026,1 October to 31 October,1 September to 30 September,/);
});

test('targets for any dates: last month is October against September, from query-only pulls', async () => {
  writeFixture();
  const log = [];
  const v = await routesWith(liveFake(log))('/api/targets/range', 'range=last-month');
  assert.deepEqual(
    [v.range.start, v.range.end, v.prevRange.start, v.prevRange.end],
    ['2026-10-01', '2026-10-31', '2026-09-01', '2026-09-30']
  );
  assert.deepEqual(log, ['query|2026-10-01|2026-10-31', 'query|2026-09-01|2026-09-30']);
  assert.equal(v.likeForLike.mean, 8.7);
  assert.deepEqual(v.moves, { improved: 1, held: 1, slipped: 1, noData: 1 });
  assert.ok(v.rows.every((r) => r.alignment === null && r.rankingPage === null));
});

test('ask: the last complete month reads the cache only; target counts appear once the report was opened', async () => {
  writeFixture();
  const first = await lastMonthBrief((await import('../lib/api/model.mjs')).buildModel());
  assert.equal(first.month, 'October 2026');
  assert.equal(first.tiles[1].value, 3100);
  assert.match(String(first.targetKeywords), /first opened/);
  assert.equal(fs.existsSync(path.join(DATA, 'cache/periods')), false);
  await routesWith(liveFake([]))('/api/month', 'm=2026-10');
  const second = await lastMonthBrief((await import('../lib/api/model.mjs')).buildModel());
  assert.deepEqual(second.targetKeywords, { improved: 1, held: 1, slipped: 1, noData: 1 });
});

test('report view: with no searches pulled the page still has its stored numbers', async () => {
  writeFixture();
  const { buildModel } = await import('../lib/api/model.mjs');
  const v = monthView(buildModel(), '2026-10', null);
  assert.equal(v.tiles[0].value, 124);
  assert.equal(v.topPages, null);
  assert.equal(v.targets.available, false);
  assert.match(v.tiles[3].note, /not been pulled yet/);
});

// ---------------------------------------------------------------- the page

test('page: the change line says per day and against what; the plain text copy carries every section', async () => {
  const page = await import('../static/views/month.js');
  const { fmt } = await import('../static/app.js');
  assert.equal(
    page.tileChangeText({ change: 11.1, changeKind: 'percent', against: "per day, against September's 30 days" }, fmt),
    "+11.1% per day, against September's 30 days"
  );
  assert.equal(
    page.tileChangeText({ change: 0.4, changeKind: 'positions', against: 'against 1 September to 30 September' }, fmt),
    '0.4 places better against 1 September to 30 September'
  );
  assert.equal(page.tileChangeText({ change: null, changeKind: 'percent' }, fmt), 'not enough data yet');
  writeFixture();
  const v = await routesWith(liveFake([]))('/api/month', 'm=2026-10');
  const text = page.monthText(v, fmt);
  for (const s of [
    'SEO report: October 2026',
    'In numbers',
    'What changed, in plain words',
    'Top pages',
    'Top searches',
    'Target keywords',
    'What was done in the month',
    'Other sources',
    'Search Console data runs through',
  ])
    assert.ok(text.includes(s), s);
  assert.match(text, /Google impressions: 3,100 \(\+11\.1% per day, against September's 30 days\)/);
  assert.match(text, /no GA4 visits by channel/);
  assert.equal(/[–—]/.test(text), false);
});

// ---------------------------------------------------------------- Performance gets the date bar (A2)

test('performance: last month is October against September per day; every block says which dates it shows', async () => {
  writeFixture();
  const { overviewView } = await import('../lib/api/ext/overview.mjs');
  const { buildModel } = await import('../lib/api/model.mjs');
  const v = overviewView(buildModel(), { range: 'last-month' });
  assert.deepEqual([v.range.start, v.range.end], ['2026-10-01', '2026-10-31']);
  const imps = v.tiles.find((t) => t.key === 'impressions');
  assert.equal(imps.value, 3100);
  // Per day (100 against 90), not totals (3100 against 2700 would be +14.8%).
  assert.equal(imps.change, 11.1);
  assert.equal(imps.against, "per day, against September's 30 days");
  assert.match(v.compareText, /per day, against September's 30 days/);
  assert.equal(v.series.length, 31);
  // Top pages follow the dates, per day.
  assert.equal(v.topPages[0].page, '/blog/alpha');
  assert.equal(v.topPages[0].impressions, 1550);
  assert.deepEqual([v.pagesRange.start, v.pagesRange.end], ['2026-10-01', '2026-10-31']);
  // The target tile, the searches list, countries and devices each say their own dates.
  const pos = v.tiles.find((t) => t.key === 'targetPosition');
  assert.match(pos.rangeLine, /16 October to 12 November, the target keywords' own 28 days/);
  assert.match(pos.rangeLine, /Monthly report/);
  assert.match(v.queriesNote, /latest 28 and 90 days only/);
  assert.match(v.breakdownNote, /16 October to 12 November, the latest 28 days/);
  // The same length compares totals, as before.
  const d28 = overviewView(buildModel(), 28);
  assert.equal(d28.tiles.find((t) => t.key === 'impressions').against, null);
  assert.equal(d28.tiles.find((t) => t.key === 'targetPosition').rangeLine, null);
  const d90 = overviewView(buildModel(), 90);
  assert.match(d90.tiles.find((t) => t.key === 'targetPosition').rangeLine, /own 28 days\.$/);
  // Last quarter is July to September against April to June.
  const lq = overviewView(buildModel(), { range: 'last-quarter' });
  assert.deepEqual([lq.range.start, lq.range.end], ['2026-07-01', '2026-09-30']);
  assert.match(lq.compareText, /per day/);
});

// ---------------------------------------------------------------- the target keywords follow the dates (A3)

test('queries: the target keywords CSV names its dates in every row and in the file name', async () => {
  const page = await import('../static/views/search.js');
  const range = { start: '2026-10-01', end: '2026-10-31', text: '1 October to 31 October' };
  const prevRange = { start: '2026-09-01', end: '2026-09-30', text: '1 September to 30 September' };
  const c = page.targetsCsv(
    [
      { keyword: 'alpha rota', page: '/blog/alpha', position: 5, prevPosition: 8, change: 3, impressions: 400 },
      { keyword: 'delta rota', page: '/blog/delta', position: 20, prevPosition: null, change: null, impressions: 30 },
    ],
    { range, prevRange }
  );
  assert.equal(c.name, 'seo-desk-target-keywords-2026-10-01-to-2026-10-31.csv');
  assert.deepEqual(c.header.slice(-2), ['Dates', 'Compared with']);
  for (const row of c.body) assert.deepEqual(row.slice(-2), ['1 October to 31 October', '1 September to 30 September']);
  const { fmt } = await import('../static/app.js');
  assert.match(
    page.likeSummary({ enough: true, mean: 8.7, prevMean: 9.1, n: 3, targetsTotal: 4, prevRange }, fmt, { range }),
    /8\.7 for 1 October to 31 October, over 3 keywords of 4, against 9\.1 for 1 September to 30 September/
  );
});
