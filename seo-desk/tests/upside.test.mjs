import { test } from 'node:test';
import assert from 'node:assert/strict';

// Package 9: the extra clicks a month each opportunity could bring, from the site's own click rates.
// Every search, page and number here is invented.

const U = await import('../lib/upside.mjs');
const { score, rank, SIGNAL_ORDER, LABEL } = await import('../lib/score.mjs');
const { PRESETS } = await import('../lib/config.mjs');

const RANGE = { start: '2026-10-01', end: '2026-10-28' }; // 28 days
const q = (query, impressions, clicks, position) => ({ query, impressions, clicks, position });

// Twenty-four searches of 100 views or more: five at each of positions 1, 4 and 8, and three at 3 and 5
// (so 3 and 5 pool), plus three at 15. One brand search that must be left out.
function gscWith(extra = []) {
  const rows = [
    ...[0, 1, 2, 3, 4].map((i) => q(`alpha widget ${i}`, 100, 30 + i, 1.2)),
    ...[0, 1, 2].map((i) => q(`bravo widget ${i}`, 200, 2 + 2 * i, 3.1)), // 1%, 2%, 3%
    ...[0, 1, 2, 3, 4].map((i) => q(`charlie widget ${i}`, 100, 4 + i, 4.2)), // 4..8%, median 6%
    ...[0, 1, 2].map((i) => q(`delta widget ${i}`, 100, 10 + i, 4.6)), // rounds to 5: 10, 11, 12%
    ...[0, 1, 2, 3, 4].map((i) => q(`echo widget ${i}`, 100, i, 8.4)), // 0..4%, median 2%
    ...[0, 1, 2].map((i) => q(`foxtrot widget ${i}`, 100, 0, 15)),
    q('acme widget', 900, 500, 1), // brand
    ...extra,
  ];
  return {
    windows: { cur: RANGE, prev: { start: '2026-09-03', end: '2026-09-30' } },
    queryCur: rows,
    qpCur: [],
    pageDaily: [
      { date: '2026-10-05', page: '/blog/one', clicks: 2, impressions: 200, position: 6 },
      { date: '2026-10-05', page: '/blog/two', clicks: 4, impressions: 200, position: 7 },
      { date: '2026-10-05', page: '/blog/three', clicks: 6, impressions: 200, position: 9 },
      { date: '2026-09-05', page: '/blog/old', clicks: 90, impressions: 200, position: 9 }, // outside the window
    ],
  };
}
const BRANDS = ['acme'];

test('clickRates: own medians by rounded position, brand left out, pools under five searches', () => {
  const r = U.clickRates(gscWith(), { brands: BRANDS, range: RANGE });
  assert.equal(r.available, true);
  assert.equal(r.minImpressions, 100, '24 searches have 100 views or more, so the gate stays at 100');
  assert.equal(r.searches, 24);
  const at = (p) => r.positions.find((x) => x.position === p);
  assert.equal(at(4).n, 5);
  assert.equal(at(4).median, 0.06);
  assert.equal(at(8).median, 0.02);
  // Positions 3 to 5 together: 1, 2, 3, 4..8, 10, 11, 12 (11 searches), median 6%.
  assert.equal(r.top5.n, 11);
  assert.equal(r.top5.median, 0.06);
  // Under five at position 3, so position 3 reads the pool of 1 to 3 (5 + 3 searches).
  const m3 = U.medianAt(r, 3.1);
  assert.equal(m3.n, 8);
  assert.match(m3.label, /positions 1 to 3/);
  const m4 = U.medianAt(r, 4.2);
  assert.equal(m4.n, 5);
  assert.match(m4.label, /position 4/);
  // The site median over every counted search.
  assert.equal(r.site.n, 24);
  // Pages: three in the window, median 2%.
  assert.equal(r.pages.n, 3);
  assert.equal(r.pages.median, 0.02);
  assert.equal(r.days, 28);
  assert.ok(r.bands.some((b) => b.from === 6 && b.to === 10 && b.n === 5));
});

test('clickRates: the gate falls back to 20 views when fewer than 20 searches reach 100', () => {
  const gsc = {
    windows: { cur: RANGE },
    queryCur: [
      ...Array.from({ length: 5 }, (_, i) => q(`golf widget ${i}`, 150, 3, 6)),
      ...Array.from({ length: 25 }, (_, i) => q(`lima widget ${i}`, 30, 0, 18)),
      q('mike widget', 19, 5, 6), // under 20 views: never counted
    ],
    pageDaily: [],
  };
  const r = U.clickRates(gsc, { brands: [], range: RANGE });
  assert.equal(r.minImpressions, 20);
  assert.equal(r.searches, 30);
  assert.equal(r.pages.n, 0);
});

test('clickRates: no query-only pull is not available, and says so', () => {
  const r = U.clickRates({ windows: { cur: RANGE } }, { brands: [], range: RANGE });
  assert.equal(r.available, false);
  assert.match(r.text, /not enough data/i);
});

const rates = () => U.clickRates(gscWith([q('hotel widget plan', 400, 2, 12)]), { brands: BRANDS, range: RANGE });
const realOf = (gsc) => new Map(gsc.queryCur.map((r) => [r.query.toLowerCase(), r]));

test('runner-up: real views x (median at positions 3 to 5 minus its own rate), per month, if it reaches the top 5', () => {
  const gsc = gscWith([q('hotel widget plan', 400, 2, 12)]);
  const opp = { type: 'near-page-one', query: 'Hotel widget plan', page: '/blog/a', range: RANGE, evidence: [] };
  const u = U.upsideOf(opp, { rates: rates(), real: realOf(gsc) });
  // 400 x (0.06 - 0.005) = 22 clicks in 28 days, x 30/28 = 23.57, about 24.
  assert.equal(u.state, 'estimate');
  assert.equal(u.clicks, 24);
  assert.match(
    u.text,
    /^About 24 extra clicks a month if the page reaches the top 5 \(an estimate from your own click rates, 1 October to 28 October\)\.$/
  );
  assert.match(u.how, /400/);
  assert.doesNotMatch(u.text + u.how, /[–—]/);
});

test('runner-up: under 20 real views is not enough data; a search the pull lacks too', () => {
  const gsc = gscWith([q('india widget', 12, 0, 11)]);
  const ctx = { rates: rates(), real: realOf(gsc) };
  const thin = U.upsideOf({ type: 'near-page-one', query: 'india widget', range: RANGE }, ctx);
  assert.equal(thin.state, 'not-enough');
  assert.equal(thin.clicks, null);
  assert.match(thin.text, /^Not enough data/);
  const missing = U.upsideOf({ type: 'near-page-one', query: 'juliet widget', range: RANGE }, ctx);
  assert.equal(missing.state, 'not-enough');
});

test('a rate already at or above the median gives no estimate', () => {
  const gsc = gscWith([q('kilo widget', 100, 20, 11)]);
  const u = U.upsideOf(
    { type: 'near-page-one', query: 'kilo widget', range: RANGE },
    { rates: rates(), real: realOf(gsc) }
  );
  assert.equal(u.state, 'zero');
  assert.equal(u.clicks, null);
  assert.match(u.text, /^No click estimate/);
});

test('low click rate: top 5 reads the median at its position, below that the median page rate', () => {
  const ctx = { rates: rates(), real: new Map() };
  const top = U.upsideOf(
    {
      type: 'low-click-rate',
      page: '/blog/b',
      range: RANGE,
      evidence: [{ page: '/blog/b', clicks: 2, impressions: 280, ctr: 2 / 280, position: 4.2 }],
    },
    ctx
  );
  // 280 x (0.06 - 0.00714) = 14.8 in 28 days, x 30/28 = 15.86, about 16.
  assert.equal(top.clicks, 16);
  assert.match(top.text, /^About 16 extra clicks a month if this works/);
  const lower = U.upsideOf(
    {
      type: 'low-click-rate',
      page: '/blog/c',
      range: RANGE,
      evidence: [{ page: '/blog/c', clicks: 0, impressions: 700, ctr: 0, position: 9.6 }],
    },
    ctx
  );
  // 700 x 0.02 = 14, x 30/28 = 15.
  assert.equal(lower.clicks, 15);
  assert.match(lower.how, /median page/);
});

test('question: real views x (site median minus its own rate)', () => {
  const gsc = gscWith([q('how do widgets work at night', 300, 0, 25)]);
  const r = rates();
  const u = U.upsideOf(
    { type: 'question', query: 'how do widgets work at night', page: '/blog/d', range: RANGE },
    { rates: r, real: realOf(gsc) }
  );
  const want = Math.round(300 * r.site.median * (30 / 28));
  assert.equal(u.clicks, want);
});

test('decay: lost rankings is the clicks lost; lost demand and the others have none', () => {
  const range = { start: '2026-09-03', end: '2026-10-28' };
  const ev = [{ page: '/blog/e', prev: { clicks: 40, impressions: 900 }, cur: { clicks: 12, impressions: 500 } }];
  const ctx = { rates: rates(), real: new Map() };
  const lost = U.upsideOf({ type: 'slipping', dropKind: 'lost-rankings', range, evidence: ev }, ctx);
  // 28 clicks lost in 28 days, x 30/28 = 30.
  assert.equal(lost.clicks, 30);
  assert.match(lost.text, /3 September to 28 October/);
  const demand = U.upsideOf({ type: 'slipping', dropKind: 'lost-demand', range, evidence: ev }, ctx);
  assert.equal(demand.state, 'none');
  assert.match(demand.text, /nothing to fix/);
  const unclear = U.upsideOf({ type: 'slipping', dropKind: 'unclear', range, evidence: ev }, ctx);
  assert.equal(unclear.state, 'none');
});

test('every other kind says there is no click estimate for it', () => {
  for (const type of ['competing-pages', 'needs-links', 'not-indexed', 'ai-gap', 'wrong-page', 'unserved']) {
    const u = U.upsideOf({ type, range: RANGE }, { rates: rates(), real: new Map() });
    assert.equal(u.state, 'none', type);
    assert.equal(u.text, 'No click estimate for this kind.');
  }
  assert.equal(U.NO_ESTIMATE.text, 'No click estimate for this kind.');
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

  const gsc = gscWith([q('november widget plan', 500, 0, 12)]);
  const days = Array.from({ length: 28 }, (_, i) => `2026-10-${String(i + 1).padStart(2, '0')}`);
  gsc.qpCur = [{ query: 'november widget plan', page: '/blog/november', impressions: 500, clicks: 0, position: 12 }];
  gsc.siteDaily = days.map((date) => ({ date, clicks: 1, impressions: 40 }));
  gsc.pageDaily = [
    ...gsc.pageDaily,
    { date: '2026-10-06', page: '/blog/november', clicks: 0, impressions: 500, position: 12 },
  ];
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
  // 500 x (6% - 0%) = 30 in 28 days, x 30/28 = 32.
  assert.equal(near.upside.clicks, 32);
  assert.ok(near.signals.upside > 0);
  assert.ok(near.score.parts.find((p) => p.signal === 'upside').points > 0);
  const low = model.opps.find((o) => o.type === 'low-click-rate' && o.page === '/blog/november');
  assert.ok(low, 'the page with no clicks is found');
  // 500 x the median page rate (1%, 2%, 3% and 0%: 1.5%) = 7.5, x 30/28 = 8.
  assert.equal(low.upside.clicks, 8);
  assert.equal(model.clickRates.searches, 25);

  const view = work.opportunitiesView(model, { status: 'open' });
  assert.equal(view.clickRates.minImpressions, 100);
  for (const o of view.items) assert.ok(o.upside?.text, `${o.type} has a click estimate line`);
  const csv = csvFor(model, 'opportunities', { status: 'open' });
  assert.match(csv.split('\r\n')[0], /,score,extra_clicks_a_month_estimate,/);
  assert.match(csv, /,32,/);

  const top5 = work.weekView(model).top5;
  for (const c of top5) assert.ok(c.upside?.text, c.id);

  const ranking = work.upsideRanking(model, 5);
  assert.deepEqual(
    ranking.items.map((i) => i.clicks),
    [32, 8, 1] // the last: /blog/one, 200 x (1.5% - 1%) = 1, x 30/28 = 1
  );
  assert.match(ranking.note, /hypothesis/);
  assert.equal(monthView(model, '2026-10', null).upside.items[0].clicks, 32);
  assert.equal(settingsView(model).signals.at(-1).label, 'Upside');
  assert.ok(settingsView(model).clickRates.text);

  const section = SECTIONS.find(([title]) => /Most extra clicks/.test(title));
  const brief = buildDeskBrief(model, 'Which change could bring the most clicks?', { sections: [section] });
  assert.match(brief.text, /About 32 extra clicks a month if the page reaches the top 5/);

  // All opportunities sorts by the server's estimate; the Runner-up table carries it for its column.
  const sorted = [...view.items].sort(SORTS.find((s) => s.key === 'upside').fn);
  assert.equal(sorted[0].upside.clicks, 32);
  assert.equal(runnerUpRows([decorateLike(near)])[0].upside, 32);
});

const decorateLike = (o) => ({ ...o, evidence: o.evidence ?? [] });
