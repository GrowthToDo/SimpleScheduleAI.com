import { test } from 'node:test';
import assert from 'node:assert/strict';

// Package 9: the extra clicks a month each opportunity could bring, from the site's own click rates.
// Every search, page and number here is invented.

const U = await import('../lib/upside.mjs');
const { score, rank, SIGNAL_ORDER, LABEL } = await import('../lib/score.mjs');
const { PRESETS } = await import('../lib/config.mjs');
const rules = await import('../lib/rules.mjs');

const RANGE = { start: '2026-10-01', end: '2026-10-28' }; // the card window, 28 days
const D90 = { start: '2026-07-31', end: '2026-10-28' }; // 90 days
const q = (query, impressions, clicks, position) => ({ query, impressions, clicks, position });

// The 90-day rows the pooled rates read (brand and under-20-view searches left out):
//   positions 1 to 3   alpha (5 x 200 views, 10 clicks) and bravo (3 x 300 views, 8 clicks): 74 / 1,900
//   positions 4 to 5   charlie (5 x 400, 6) and delta (3 x 200, 2; 4.6 rounds to 5): 36 / 2,600
//   positions 3 to 5   bravo, charlie and delta: 60 / 3,500 = 1.714%
//   positions 6 to 10  echo (5 x 500, 1): 5 / 2,500, under 20 clicks, so no rate
//   positions 11 to 20 foxtrot (3 x 300, 0): 0 / 900, no rate
//   all searches       115 / 7,900 = 1.456%
const ROWS_90 = [
  ...[0, 1, 2, 3, 4].map((i) => q(`alpha widget ${i}`, 200, 10, 1.2)),
  ...[0, 1, 2].map((i) => q(`bravo widget ${i}`, 300, 8, 3.1)),
  ...[0, 1, 2, 3, 4].map((i) => q(`charlie widget ${i}`, 400, 6, 4.2)),
  ...[0, 1, 2].map((i) => q(`delta widget ${i}`, 200, 2, 4.6)),
  ...[0, 1, 2, 3, 4].map((i) => q(`echo widget ${i}`, 500, 1, 8.4)),
  ...[0, 1, 2].map((i) => q(`foxtrot widget ${i}`, 300, 0, 15)),
  q('mike widget', 19, 5, 6), // under 20 views: never counted
  q('acme widget', 900, 500, 1), // brand
];

// The 28-day rows the cards' own numbers come from.
const ROWS_CUR = [
  q('hotel widget plan', 2000, 10, 12),
  q('india widget', 12, 0, 11),
  q('kilo widget', 100, 20, 11),
  q('how do widgets work at night', 300, 0, 25),
  q('november widget plan', 500, 0, 12),
];

// Pages over the 90 days: 22 clicks from 2,000 views counted (1.1%); a 10-view page and one outside
// the 90 days are left out.
function gscWith({ query90 = ROWS_90, pageDaily = null } = {}) {
  return {
    windows: { cur: RANGE, prev: { start: '2026-09-03', end: '2026-09-30' }, d90: D90 },
    queryCur: ROWS_CUR,
    query90,
    qpCur: [],
    pageDaily: pageDaily ?? [
      { date: '2026-08-05', page: '/blog/one', clicks: 10, impressions: 1000, position: 30 },
      { date: '2026-10-05', page: '/blog/two', clicks: 12, impressions: 1000, position: 30 },
      { date: '2026-10-05', page: '/blog/tiny', clicks: 5, impressions: 10, position: 30 },
      { date: '2026-07-01', page: '/blog/old', clicks: 900, impressions: 1000, position: 9 },
    ],
  };
}
const BRANDS = ['acme'];

test('clickRates: pooled 90-day rates by band, brand and under-20-view searches left out', () => {
  const r = U.clickRates(gscWith(), { brands: BRANDS, range: RANGE });
  assert.equal(r.available, true);
  assert.equal(r.window, '90-day');
  assert.deepEqual([r.range.start, r.range.end, r.days], [D90.start, D90.end, 90]);
  assert.deepEqual([r.cardRange.start, r.cardDays], [RANGE.start, 28]);
  assert.equal(r.searches, 24);
  const band = (from) => r.bands.find((b) => b.from === from);
  assert.deepEqual([band(1).clicks, band(1).impressions, band(1).searches], [74, 1900, 8]);
  assert.equal(band(1).rate, 74 / 1900);
  assert.deepEqual([band(4).clicks, band(4).impressions], [36, 2600]);
  assert.equal(band(6).clicks, 5);
  assert.equal(band(6).rate, null, 'under 20 clicks gives no rate');
  assert.equal(band(11).rate, null);
  assert.deepEqual([r.top5.clicks, r.top5.impressions], [60, 3500]);
  assert.equal(r.top5.rate, 60 / 3500);
  assert.deepEqual([r.site.clicks, r.site.impressions], [115, 7900]);
  assert.deepEqual([r.pages.clicks, r.pages.impressions, r.pages.pages], [22, 2000, 2]);
  assert.equal(r.pages.rate, 0.011);
  assert.match(r.text, /90-day/);
  assert.match(r.text, /positions 6 to 10: not enough clicks yet \(5 clicks from 2,500 views\)/);
  assert.doesNotMatch(r.text, /[–—]/);
  assert.equal(U.bandAt(r, 3.4).from, 1);
  assert.equal(U.bandAt(r, 4.6).from, 4);
  assert.equal(U.bandAt(r, 25), null);
});

test('clickRates: without the 90-day pull it pools the 28-day rows and says so', () => {
  const gsc = gscWith();
  delete gsc.query90;
  gsc.queryCur = ROWS_90;
  const r = U.clickRates(gsc, { brands: BRANDS, range: RANGE });
  assert.equal(r.window, '28-day');
  assert.deepEqual([r.range.start, r.range.end, r.days], [RANGE.start, RANGE.end, 28]);
  assert.equal(r.top5.clicks, 60);
  assert.match(r.text, /28-day/);
});

test('clickRates: no query-only pull is not available, and says so', () => {
  const r = U.clickRates({ windows: { cur: RANGE } }, { brands: [], range: RANGE });
  assert.equal(r.available, false);
  assert.match(r.text, /not enough data/i);
});

const rates = (opts) => U.clickRates(gscWith(opts), { brands: BRANDS, range: RANGE });
const real = new Map(ROWS_CUR.map((r) => [r.query.toLowerCase(), r]));
const ctx = (opts) => ({ rates: rates(opts), real });

test('runner-up: 28-day views x (pooled 90-day rate at positions 3 to 5 minus its own), if it reaches the top 5', () => {
  const opp = { type: 'near-page-one', query: 'Hotel widget plan', page: '/blog/a', range: RANGE, evidence: [] };
  const u = U.upsideOf(opp, ctx());
  // 2,000 x (60/3,500 - 0.5%) = 24.29 in 28 days, x 30/28 = 26.02, about 26.
  assert.equal(u.state, 'estimate');
  assert.equal(u.clicks, 26);
  assert.equal(
    u.text,
    'About 26 extra clicks a month if the page reaches the top 5 (an estimate from your own 90-day click rate at positions 3 to 5, 1.7%, 31 July to 28 October).'
  );
  assert.match(u.how, /2,000/);
  assert.match(u.how, /60 clicks from 3,500 views/);
  assert.doesNotMatch(u.text + u.how, /[–—]/);
});

test('a band under 20 clicks says not enough clicks yet to estimate, with its totals', () => {
  const thin = ROWS_90.filter((r) => !/bravo|charlie|delta/.test(r.query));
  const u = U.upsideOf({ type: 'near-page-one', query: 'hotel widget plan', range: RANGE }, ctx({ query90: thin }));
  assert.equal(u.state, 'not-enough');
  assert.equal(u.clicks, null);
  assert.equal(u.short, 'Not enough clicks');
  assert.match(u.text, /^Not enough clicks yet to estimate: /);
  assert.match(u.text, /positions 3 to 5/);
});

test('runner-up: under 20 views of its own is not enough data; a search the pull lacks too', () => {
  const thin = U.upsideOf({ type: 'near-page-one', query: 'india widget', range: RANGE }, ctx());
  assert.equal(thin.state, 'not-enough');
  assert.match(thin.text, /^Not enough data/);
  const missing = U.upsideOf({ type: 'near-page-one', query: 'juliet widget', range: RANGE }, ctx());
  assert.equal(missing.state, 'not-enough');
});

test('a rate already at or above the pooled rate gives no estimate and no negative sum', () => {
  const u = U.upsideOf({ type: 'near-page-one', query: 'kilo widget', range: RANGE }, ctx());
  assert.equal(u.state, 'zero');
  assert.equal(u.clicks, null);
  assert.match(u.text, /^No click estimate/);
  assert.equal(u.how, null, 'no negative sum is shown');
  const kept = U.upsideOf(
    {
      type: 'slipping',
      dropKind: 'lost-rankings',
      range: { start: '2026-09-03', end: '2026-10-28' },
      evidence: [{ prev: { clicks: 5, impressions: 300 }, cur: { clicks: 6, impressions: 100 } }],
    },
    ctx()
  );
  assert.equal(kept.text, 'No click estimate: the page did not lose clicks.');
});

test('low click rate: top 5 reads its band, below that the pooled page rate', () => {
  const top = U.upsideOf(
    {
      type: 'low-click-rate',
      page: '/blog/b',
      range: RANGE,
      evidence: [{ page: '/blog/b', clicks: 2, impressions: 1000, ctr: 0.002, position: 4.2 }],
    },
    ctx()
  );
  // 1,000 x (36/2,600 - 0.2%) = 11.85, x 30/28 = 12.69, about 13.
  assert.equal(top.clicks, 13);
  assert.match(
    top.text,
    /^About 13 extra clicks a month if this works \(an estimate from your own 90-day click rate at positions 4 to 5, 1\.4%, 31 July to 28 October\)\.$/
  );
  const lower = U.upsideOf(
    {
      type: 'low-click-rate',
      page: '/blog/c',
      range: RANGE,
      evidence: [{ page: '/blog/c', clicks: 0, impressions: 700, ctr: 0, position: 9.6 }],
    },
    ctx()
  );
  // 700 x 1.1% = 7.7, x 30/28 = 8.25, about 8.
  assert.equal(lower.clicks, 8);
  assert.match(lower.text, /your own 90-day page click rate, 1\.1%/);
  assert.match(lower.how, /22 clicks from 2,000 views/);
});

test('question: 28-day views x (pooled 90-day rate across all searches minus its own)', () => {
  const u = U.upsideOf(
    { type: 'question', query: 'how do widgets work at night', page: '/blog/d', range: RANGE },
    ctx()
  );
  // 300 x 115/7,900 = 4.37, x 30/28 = 4.68, about 5.
  assert.equal(u.clicks, 5);
  assert.match(u.text, /across all your searches, 1\.5%/);
});

test('decay: lost rankings is the clicks lost; lost demand and the others have none', () => {
  const range = { start: '2026-09-03', end: '2026-10-28' };
  const ev = [{ page: '/blog/e', prev: { clicks: 40, impressions: 900 }, cur: { clicks: 12, impressions: 500 } }];
  const lost = U.upsideOf({ type: 'slipping', dropKind: 'lost-rankings', range, evidence: ev }, ctx());
  // 28 clicks lost in 28 days, x 30/28 = 30.
  assert.equal(lost.clicks, 30);
  assert.match(lost.text, /3 September to 28 October/);
  const demand = U.upsideOf({ type: 'slipping', dropKind: 'lost-demand', range, evidence: ev }, ctx());
  assert.equal(demand.state, 'none');
  assert.match(demand.text, /nothing to fix/);
  const unclear = U.upsideOf({ type: 'slipping', dropKind: 'unclear', range, evidence: ev }, ctx());
  assert.equal(unclear.state, 'none');
});

test('every other kind says there is no click estimate for it', () => {
  for (const type of ['competing-pages', 'needs-links', 'not-indexed', 'ai-gap', 'wrong-page', 'unserved']) {
    const u = U.upsideOf({ type, range: RANGE }, ctx());
    assert.equal(u.state, 'none', type);
    assert.equal(u.text, 'No click estimate for this kind.');
  }
  assert.equal(U.NO_ESTIMATE.text, 'No click estimate for this kind.');
});

test('the low click rate card compares with the site own pooled rate, never an industry figure', () => {
  const pages = [
    { date: '2026-10-05', page: '/blog/four', clicks: 2, impressions: 1000, position: 4.2 },
    { date: '2026-10-05', page: '/blog/twelve', clicks: 0, impressions: 500, position: 12 },
  ];
  const snaps = { gsc: gscWith({ pageDaily: pages }) };
  const cards = rules.detectLowClickRate(snaps, { brands: BRANDS, today: '2026-11-02' });
  const four = cards.find((c) => c.page === '/blog/four');
  const twelve = cards.find((c) => c.page === '/blog/twelve');
  assert.ok(four && twelve);
  for (const c of cards) assert.doesNotMatch(c.measured, /usually|2\.5%|7\.0%/);
  assert.match(
    four.measured,
    /Your own searches at positions 4 to 5 got a click rate of 1\.4% over the 90 days from 31 July to 28 October \(36 clicks from 2,600 views\)\./
  );
  assert.match(twelve.measured, /positions 11 to 20 had too few clicks over the 90 days from 31 July to 28 October/);
});

test('the Upside signal: log scale, 1,000 a month at the top, null with its own reason otherwise', () => {
  assert.equal(SIGNAL_ORDER.at(-1), 'upside');
  assert.equal(LABEL.upside, 'Upside');
  assert.equal(U.upsideSignal({ state: 'estimate', clicks: 999 }), 1);
  assert.ok(Math.abs(U.upsideSignal({ state: 'estimate', clicks: 9 }) - 1 / 3) < 1e-9);
  assert.equal(U.upsideSignal({ state: 'none', clicks: null }), null);
  const opp = (clicks) => {
    const upside = U.estimate(clicks, 'x');
    return {
      id: `o${clicks}`,
      signals: {
        demand: 0.5,
        distance: 0.5,
        importance: 0.5,
        confidence: 0.5,
        effort: 0.5,
        ai: 0.5,
        outcome: null,
        upside: U.upsideSignal(upside),
      },
      upside,
    };
  };
  // With every other signal equal, about 280 a month ranks above about 4 under Balanced.
  const ranked = rank([opp(4), opp(280)], PRESETS.balanced);
  assert.equal(ranked[0].id, 'o280');
  assert.ok(ranked[0].score.total - ranked[1].score.total >= 10);
  const none = score(
    { signals: { upside: null }, signalNull: { upside: 'no click estimate for this kind' } },
    PRESETS.balanced
  );
  assert.match(
    none.parts.find((p) => p.signal === 'upside').why,
    /^Upside: no click estimate for this kind, so it adds 0 points\.$/
  );
});

test('every preset gives Upside the same share, taken evenly from the other seven', () => {
  for (const [name, p] of Object.entries(PRESETS)) {
    assert.equal(p.upside, 0.21, name);
    const sum = Object.values(p).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - 1) < 1e-9, `${name} sums to ${sum}`);
  }
  assert.equal(PRESETS.balanced.demand, 0.17);
  assert.equal(PRESETS.balanced.outcome, 0.02);
});

// ---------------------------------------------------------------- through the model and the routes

test('the model carries the estimate to every list, the week, the Monthly report, the CSV and the Ask digest', async () => {
  const fs = await import('node:fs');
  const os = await import('node:os');
  const path = await import('node:path');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-upside-'));
  const REPO = path.join(root, 'repo');
  fs.mkdirSync(path.join(REPO, 'docs/seo'), { recursive: true });
  fs.writeFileSync(path.join(REPO, 'docs/seo/brand-terms.json'), JSON.stringify(BRANDS));
  process.env.SEO_DESK_DATA = path.join(root, 'data');
  process.env.SEO_DESK_REPO = REPO;
  process.env.SEO_DESK_TODAY = '2026-11-02';
  const { writeJson } = await import('../lib/store.mjs');
  const { buildModel, invalidate } = await import('../lib/api/model.mjs');
  const work = await import('../lib/api/work.mjs');
  const { csvFor } = await import('../lib/api/csv.mjs');
  const { monthView } = await import('../lib/api/ext/month.mjs');
  const { buildDeskBrief, SECTIONS } = await import('../lib/ask.mjs');
  const { settingsView } = await import('../lib/api/panels.mjs');
  const { SORTS } = await import('../static/views/opportunities.js');
  const { runnerUpRows } = await import('../static/views/insight.js');

  const gsc = gscWith({
    pageDaily: [
      { date: '2026-08-05', page: '/blog/one', clicks: 10, impressions: 1000, position: 30 },
      { date: '2026-10-05', page: '/blog/two', clicks: 12, impressions: 1000, position: 30 },
      { date: '2026-10-05', page: '/blog/four', clicks: 2, impressions: 1000, position: 4.2 },
      { date: '2026-10-06', page: '/blog/november', clicks: 0, impressions: 500, position: 12 },
    ],
  });
  const days = Array.from({ length: 28 }, (_, i) => `2026-10-${String(i + 1).padStart(2, '0')}`);
  gsc.qpCur = [{ query: 'november widget plan', page: '/blog/november', impressions: 500, clicks: 0, position: 12 }];
  gsc.siteDaily = days.map((date) => ({ date, clicks: 1, impressions: 40 }));
  writeJson('snap/gsc.json', {
    source: 'gsc',
    ok: true,
    status: 'fresh',
    pulledAt: '2026-11-02T06:00:00.000Z',
    through: '2026-10-28',
    error: null,
    data: gsc,
  });
  invalidate();
  const model = buildModel();
  const near = model.opps.find((o) => o.type === 'near-page-one');
  assert.ok(near, 'the runner-up search is found');
  // 500 x (60/3,500 - 0%) = 8.57 in 28 days, x 30/28 = 9.
  assert.equal(near.upside.clicks, 9);
  assert.ok(near.signals.upside > 0);
  assert.ok(near.score.parts.find((p) => p.signal === 'upside').points > 0);
  const low = model.opps.find((o) => o.type === 'low-click-rate' && o.page === '/blog/november');
  assert.ok(low, 'the page with no clicks is found');
  // 500 x the pooled 90-day page rate (24/3,500) = 3.43, x 30/28 = 4.
  assert.equal(low.upside.clicks, 4);
  assert.equal(model.clickRates.searches, 24);

  const view = work.opportunitiesView(model, { status: 'open' });
  assert.equal(view.clickRates.window, '90-day');
  for (const o of view.items) assert.ok(o.upside?.text, `${o.type} has a click estimate line`);
  const csv = csvFor(model, 'opportunities', { status: 'open' });
  assert.match(csv.split('\r\n')[0], /,score,extra_clicks_a_month_estimate,/);
  assert.match(csv, /,9,/);

  const top5 = work.weekView(model).top5;
  for (const c of top5) assert.ok(c.upside?.text, c.id);

  const ranking = work.upsideRanking(model, 5);
  assert.deepEqual(
    ranking.items.map((i) => i.clicks),
    [13, 9, 4] // the first: /blog/four, 1,000 x (36/2,600 - 0.2%) = 11.85, x 30/28 = 13
  );
  assert.match(ranking.note, /hypothesis/);
  assert.equal(monthView(model, '2026-10', null).upside.items[0].clicks, 13);
  assert.equal(settingsView(model).signals.at(-1).label, 'Upside');
  assert.ok(settingsView(model).clickRates.text);

  const section = SECTIONS.find(([title]) => /Most extra clicks/.test(title));
  const brief = buildDeskBrief(model, 'Which change could bring the most clicks?', { sections: [section] });
  assert.match(brief.text, /About 9 extra clicks a month if the page reaches the top 5/);

  // All opportunities sorts by the server's estimate; the Runner-up table carries it for its column.
  const sorted = [...view.items].sort(SORTS.find((s) => s.key === 'upside').fn);
  assert.equal(sorted[0].upside.clicks, 13);
  assert.equal(runnerUpRows([decorateLike(near)])[0].upside, 9);
});

const decorateLike = (o) => ({ ...o, evidence: o.evidence ?? [] });
