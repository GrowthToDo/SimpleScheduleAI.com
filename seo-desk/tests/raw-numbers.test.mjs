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
