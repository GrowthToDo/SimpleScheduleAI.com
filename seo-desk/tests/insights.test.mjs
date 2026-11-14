import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Phase 3, task 1: the standard insight names, /api/nav, /api/overview, the insight lists, the
// keyword map table and the source retries. Everything is synthetic (invented pages and searches,
// a temp data folder, a temp "repo" for the posts) and the route handlers are called directly, so
// there is no network and no server.

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-insights-'));
const REPO = path.join(root, 'repo');
fs.mkdirSync(path.join(REPO, 'docs/seo'), { recursive: true });
fs.mkdirSync(path.join(REPO, 'src/data/post'), { recursive: true });
fs.writeFileSync(path.join(REPO, 'docs/seo/brand-terms.json'), JSON.stringify(['simplescheduleai']));
const post = (slug, body) =>
  fs.writeFileSync(path.join(REPO, 'src/data/post', `${slug}.md`), `---\ntitle: ${slug}\ndraft: false\n---\n${body}\n`);
post('alpha-guide', 'Our float pool staffing policy is simple and short.');
post('beta-notes', 'A note about the float pool staffing policy and how it works.');
post('gamma-tips', 'Nothing about that here, only tips.');
post('epsilon-old', 'An old post.');

process.env.SEO_DESK_REPO = REPO;
process.env.SEO_DESK_TODAY = '2026-11-10';
const FULL = path.join(root, 'full');
const EMPTY = path.join(root, 'empty');
const SMALL = path.join(root, 'small');
for (const d of [FULL, EMPTY, SMALL]) fs.mkdirSync(d, { recursive: true });
process.env.SEO_DESK_DATA = FULL;

const store = await import('../lib/store.mjs');
const { buildModel, invalidate, decorateOpp, loadSettings, TYPE_LABEL } = await import('../lib/api/model.mjs');
const { weekView, weekModel, opportunitiesList } = await import('../lib/api/work.mjs');
const { targetsView, searchView } = await import('../lib/api/search.mjs');
const { changeSettings } = await import('../lib/api/actions.mjs');
const { addDays } = await import('../lib/dates.mjs');
const I = await import('../lib/insights.mjs');
const { routes: overviewRoutes } = await import('../lib/api/ext/overview.mjs');
const { routes: insightRoutes } = await import('../lib/api/ext/insights.mjs');
const { routes: targetRoutes } = await import('../lib/api/ext/targets.mjs');
const { routes: topicRoutes } = await import('../lib/api/ext/topics.mjs');
const { navCounts } = await import('../lib/api/ext/overview.mjs');
const { opportunitiesView } = await import('../lib/api/work.mjs');
const { itemAction } = await import('../lib/api/actions.mjs');
const { settingsView } = await import('../lib/api/panels.mjs');
const { spanText } = await import('../lib/text.mjs');
const refresh = await import('../lib/refresh.mjs');

const use = (dir) => {
  process.env.SEO_DESK_DATA = dir;
  invalidate();
};

// ---------------------------------------------------------------- calling a route

const ROUTES = [...overviewRoutes, ...insightRoutes, ...targetRoutes, ...topicRoutes];
function find(method, pathname) {
  for (const r of ROUTES) {
    if (r.method !== method) continue;
    const names = [];
    const re = new RegExp(
      `^${r.path
        .split('/')
        .map((p) => {
          if (!p.startsWith(':')) return p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          names.push(p.slice(1));
          return '([^/]+)';
        })
        .join('/')}$`
    );
    const m = re.exec(pathname);
    if (m) return { route: r, params: Object.fromEntries(names.map((n, i) => [n, decodeURIComponent(m[i + 1])])) };
  }
  return null;
}

async function call(method, url, body, raw) {
  const u = new URL(`http://127.0.0.1${url}`);
  const hit = find(method, u.pathname);
  assert.ok(hit, `no route for ${method} ${u.pathname}`);
  const sent = { status: 200, headers: {}, data: null };
  const ctx = {
    url: u,
    params: hit.params,
    body: async () => body ?? {},
    rawBody: async () => raw ?? '',
    res: {
      writeHead(status, headers) {
        sent.status = status;
        sent.headers = headers;
      },
      end(data) {
        sent.data = data;
      },
    },
  };
  try {
    const out = await hit.route.handler(ctx);
    return sent.data !== null
      ? { status: sent.status, headers: sent.headers, text: sent.data.toString('utf8') }
      : { status: 200, json: out };
  } catch (e) {
    return { status: e.status ?? 500, error: e.message, extra: e.extra ?? null };
  }
}
const get = (url) => call('GET', url);
const post_ = (url, body) => call('POST', url, body);

// ---------------------------------------------------------------- fixtures

const THROUGH = '2026-11-07';
const CUR = { start: '2026-10-11', end: '2026-11-07' };
const PREV = { start: '2026-09-13', end: '2026-10-10' };
const dates = (from, to) => {
  const out = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
};
// Per day views in the earlier and the later 28 days.
const PAGES = {
  '/blog/alpha-guide': { prev: 50, cur: 30, pos: 8 },
  '/blog/beta-notes': { prev: 20, cur: 20, pos: 12 },
  '/blog/gamma-tips': { prev: 15, cur: 30, pos: 14 },
  '/pricing': { prev: 10, cur: 10, pos: 9 },
  '/blog/delta-new': { prev: 8, cur: 4, pos: 20 },
  '/blog/epsilon-old': { prev: 6, cur: 6, pos: 25 },
};
function pageDaily() {
  const rows = [];
  for (const date of dates('2026-07-15', THROUGH)) {
    for (const [page, p] of Object.entries(PAGES)) {
      rows.push({ date, page, clicks: 0, impressions: date >= CUR.start ? p.cur : p.prev, position: p.pos });
    }
  }
  // A page with a handful of views in the earlier period only: far too small to call a drop.
  for (const date of dates('2026-09-20', '2026-09-29'))
    rows.push({ date, page: '/blog/zeta-tiny', clicks: 0, impressions: 1, position: 30 });
  return rows;
}

// Clicks on the search rows are deliberately large: the whole-site click rate must never read them.
const qp = (query, page, impressions, position, clicks = 50) => ({ query, page, clicks, impressions, position });
const QP_CUR = [
  qp('alpha target phrase', '/blog/alpha-guide', 60, 6),
  qp('beta target phrase', '/blog/gamma-tips', 70, 14),
  qp('gamma target phrase', '/blog/gamma-tips', 40, 3),
  qp('pricing target phrase', '/pricing', 50, 12),
  qp('shared topic phrase', '/blog/alpha-guide', 40, 11),
  qp('shared topic phrase', '/blog/beta-notes', 40, 12),
  qp('float pool staffing policy', '/blog/epsilon-old', 50, 31),
  qp('float pool staffing rules', '/blog/epsilon-old', 40, 28),
  qp('how long is a nurse shift', '/blog/delta-new', 45, 33),
  qp('on-call pay rules', '/blog/epsilon-old', 35, 40),
  qp('simplescheduleai login', '/', 30, 1),
];
const queryRow = (query, impressions, position, clicks = 50) => ({ query, clicks, impressions, position });
const QUERY_CUR = [
  queryRow('alpha target phrase', 60, 6),
  queryRow('beta target phrase', 70, 14),
  queryRow('gamma target phrase', 40, 3),
  queryRow('pricing target phrase', 50, 12),
  queryRow('shared topic phrase', 80, 11.5),
  queryRow('orphan search phrase', 90, 31),
  queryRow('tiny search', 1, 40),
  queryRow('simplescheduleai login', 30, 1),
];
const QUERY_PREV = [
  queryRow('alpha target phrase', 100, 8),
  queryRow('beta target phrase', 60, 16),
  queryRow('pricing target phrase', 45, 10),
  queryRow('shared topic phrase', 80, 11),
  queryRow('orphan search phrase', 30, 33),
  queryRow('old search phrase', 40, 9),
  queryRow('tiny search', 5, 40),
];

const REGISTRY = [
  { slug: 'alpha-guide', type: 'post', url: '/blog/alpha-guide', primaryKeyword: 'alpha target phrase' },
  { slug: 'beta-notes', type: 'post', url: '/blog/beta-notes', primaryKeyword: 'beta target phrase' },
  { slug: 'gamma-tips', type: 'post', url: '/blog/gamma-tips', primaryKeyword: 'gamma target phrase' },
  { slug: 'delta-new', type: 'post', url: '/blog/delta-new', primaryKeyword: 'delta target phrase' },
  { slug: 'pricing', type: 'money', url: '/pricing', primaryKeyword: 'pricing target phrase' },
];
const LIVE = [
  '/',
  '/pricing',
  '/blog/alpha-guide',
  '/blog/beta-notes',
  '/blog/gamma-tips',
  '/blog/delta-new',
  '/blog/epsilon-old',
].map((page) => ({ page, lastmod: '2026-10-01' }));

function gscData({ perDay = 130, prevPerDay = 100 } = {}) {
  return {
    siteDaily: dates('2026-08-01', THROUGH).map((date) => ({
      date,
      clicks: 4,
      impressions: date >= CUR.start ? perDay : prevPerDay,
      position: 9,
    })),
    pageDaily: pageDaily(),
    qpCur: QP_CUR,
    qpPrev: [],
    qp90: QP_CUR,
    queryCur: QUERY_CUR,
    queryPrev: QUERY_PREV,
    countries: [{ country: 'usa', clicks: 40, impressions: 1000 }],
    devices: [{ device: 'DESKTOP', clicks: 30, impressions: 800 }],
    windows: { cur: CUR, prev: PREV, d90: { start: '2026-08-10', end: THROUGH } },
  };
}
const localData = () => ({
  registry: REGISTRY,
  livePages: LIVE,
  inbound: {},
  edits: [],
  verdicts: [],
  due: [],
  aeo: [],
  plan: null,
  openWork: [],
  warnings: [],
});
const writeSnap = (dir, source, data) => {
  fs.mkdirSync(path.join(dir, 'snap'), { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'snap', `${source}.json`),
    JSON.stringify({
      source,
      ok: true,
      status: 'fresh',
      pulledAt: new Date().toISOString(),
      through: source === 'local' ? '2026-11-10' : THROUGH,
      error: null,
      data,
    })
  );
};
writeSnap(FULL, 'gsc', gscData());
writeSnap(FULL, 'local', localData());
// Under 500 views in the 28 days: 10 a day is 280.
writeSnap(SMALL, 'gsc', gscData({ perDay: 10, prevPerDay: 10 }));
writeSnap(SMALL, 'local', localData());

const OLD_LABELS = ['Two pages competing', 'Near page one', 'Searched but not served', 'Slipping page'];

// ================================================================ standard names

test('every opportunity type has a standard term and a plain one-sentence explanation', () => {
  const types = [
    'near-page-one',
    'low-click-rate',
    'competing-pages',
    'slipping',
    'wrong-page',
    'unserved',
    'question',
    'needs-links',
    'ai-gap',
    'engine-gap',
    'not-indexed',
  ];
  for (const t of types) {
    assert.ok(I.TERMS[t]?.term, `${t} has a term`);
    assert.match(I.TERMS[t].explain, /^[A-Z].*\.$/, `${t} explains itself in one sentence`);
    assert.equal(TYPE_LABEL[t], I.TERMS[t].term, `typeLabel for ${t} is the term`);
  }
  assert.deepEqual(I.TERMS['competing-pages'], {
    term: 'Cannibalization',
    explain: 'Two of your pages are competing for the same search.',
  });
  assert.deepEqual(I.TERMS['near-page-one'], {
    term: 'Runner-up keywords',
    explain: 'Searches where you sit just off page one.',
  });
  assert.deepEqual(I.TERMS.unserved, {
    term: 'Content gaps',
    explain: 'Searches you already appear for that no page is written for.',
  });
  assert.deepEqual(I.TERMS.slipping, { term: 'Decay', explain: 'Pages that are being shown less than before.' });
  assert.equal(I.TERMS['needs-links'].term, 'Internal links');
  assert.equal(I.TERMS['low-click-rate'].term, 'Low click rate');
  assert.equal(I.TERMS['wrong-page'].term, 'Wrong page ranking');
  assert.equal(I.TERMS.question.term, 'Unanswered questions');
  assert.equal(I.TERMS['not-indexed'].term, 'Not indexed');
  assert.equal(I.TERMS['engine-gap'].term, 'Google and Bing differ');
  for (const t of types) {
    const text = `${I.TERMS[t].term} ${I.TERMS[t].explain}`;
    assert.doesNotMatch(text, /[–—]/, `${t}: no em or en dash`);
    assert.doesNotMatch(text, /\b(CTR|SERP)\b/, `${t}: no jargon`);
    for (const old of OLD_LABELS) assert.ok(!text.includes(old), `${t}: no old label`);
  }
  // An engine gap still says which way round it is (the label), and explains it per item.
  assert.equal(I.termOf('engine-gap', 'bing').term, 'Google and Bing differ');
  assert.match(I.termOf('engine-gap', 'bing').explain, /Bing/);
  assert.match(I.termOf('engine-gap', 'gsc').explain, /Google/);
});

test('every opportunity and every card carries term and explain, and no payload carries an old label', async () => {
  use(FULL);
  const model = buildModel();
  assert.ok(model.opps.length > 5);
  for (const o of model.opps) {
    const d = decorateOpp(model, o);
    assert.ok(d.term && d.explain, `${o.type} carries term and explain`);
    if (o.type !== 'engine-gap') assert.equal(d.typeLabel, d.term);
  }
  const w = weekView(model);
  assert.ok(w.top5.length > 0);
  for (const c of w.top5) assert.ok(c.term && c.explain, `card ${c.id} carries term and explain`);
  const payloads = [
    JSON.stringify(w),
    JSON.stringify((await get('/api/insights/cannibalization')).json),
    JSON.stringify((await get('/api/insights/runner-up')).json),
    JSON.stringify((await get('/api/insights/content-gaps')).json),
    JSON.stringify((await get('/api/insights/decay')).json),
  ];
  for (const text of payloads) {
    for (const old of OLD_LABELS) {
      // The opportunity's own measured text may say "page one"; the labels are what is checked.
      assert.ok(!new RegExp(`"(?:typeLabel|term|label)":"${old}"`).test(text), `no ${old} label`);
    }
  }
});

// ================================================================ /api/nav

test('/api/nav gives null counts (never 0) on an empty data folder', async () => {
  use(EMPTY);
  const r = await get('/api/nav');
  assert.equal(r.status, 200);
  assert.deepEqual(Object.keys(r.json.counts).sort(), [
    'auditOpen',
    'auditScore',
    'auditToFix',
    'cannibalization',
    'contentGaps',
    'decay',
    'internalLinks',
    'keywordMap',
    'opportunities',
    'runnerUp',
    'secondaryKeywords',
    'worries',
  ]);
  for (const [k, v] of Object.entries(r.json.counts)) assert.equal(v, null, `${k} is null, not 0`);
  assert.ok(Array.isArray(r.json.sources));
  assert.ok(r.json.sources.every((s) => 'retryAt' in s));
});

test('/api/nav counts follow the data: a missing source is null, a present one is a number', async () => {
  use(FULL);
  const c = (await get('/api/nav')).json.counts;
  for (const k of [
    'keywordMap',
    'cannibalization',
    'runnerUp',
    'contentGaps',
    'decay',
    'secondaryKeywords',
    'opportunities',
    'worries',
  ]) {
    assert.equal(typeof c[k], 'number', k);
  }
  assert.equal(c.cannibalization, (await get('/api/insights/cannibalization')).json.items.length);
  assert.equal(c.contentGaps, (await get('/api/insights/content-gaps')).json.count);
  assert.equal(c.runnerUp, (await get('/api/insights/runner-up')).json.count);
  assert.equal(c.decay, (await get('/api/insights/decay')).json.count);
  assert.equal(c.keywordMap, (await get('/api/keyword-map/table')).json.counters.all);
  assert.equal(c.secondaryKeywords, (await get('/api/insights/secondary-keywords')).json.count);
  assert.equal(c.auditScore, null, 'no audit has run');
  // Search Console never pulled, the local source present: the Search Console counts stay null.
  const onlyLocal = path.join(root, 'only-local');
  fs.mkdirSync(path.join(onlyLocal, 'snap'), { recursive: true });
  writeSnap(onlyLocal, 'local', localData());
  use(onlyLocal);
  const n = (await get('/api/nav')).json.counts;
  assert.equal(n.cannibalization, null);
  assert.equal(n.contentGaps, null);
  assert.equal(n.runnerUp, null);
  assert.equal(n.decay, null);
  assert.equal(n.secondaryKeywords, null);
});

// ================================================================ /api/overview

test('overview: tiles, series, top lists, and the click rate from the site totals', async () => {
  use(FULL);
  const r = (await get('/api/overview')).json;
  assert.deepEqual(
    r.tiles.map((t) => t.key),
    ['clicks', 'impressions', 'clickRate', 'targetPosition']
  );
  const t = Object.fromEntries(r.tiles.map((x) => [x.key, x]));
  assert.equal(t.impressions.value, 28 * 130);
  assert.equal(t.impressions.change, 30);
  assert.equal(t.clicks.value, 28 * 4);
  // Whole-site clicks over impressions, from the site totals: 112 / 3640. The search rows carry 50
  // clicks each and must not be read.
  assert.equal(t.clickRate.value, 0.031);
  assert.ok(!r.tiles.some((x) => x.value === 50 * QP_CUR.length));
  const like = targetsView(buildModel()).likeForLike;
  assert.equal(t.targetPosition.value, like.mean);
  assert.equal(
    t.targetPosition.note,
    'Site-wide average position misleads while new posts publish weekly, so this is the average for the keywords you target that have data in both periods.'
  );
  assert.ok(!r.tiles.some((x) => /average position/i.test(x.label)));
  assert.equal(r.series.length, 28);
  assert.deepEqual(Object.keys(r.series[0]).sort(), ['clicks', 'date', 'impressions']);
  assert.ok(r.topQueries.length <= 10 && r.topQueries.length > 0);
  assert.deepEqual(Object.keys(r.topQueries[0]).slice(0, 4), ['query', 'clicks', 'impressions', 'position']);
  assert.ok(r.topPages.length <= 10 && r.topPages.length > 0);
  for (const k of ['page', 'clicks', 'impressions', 'position', 'clickRate']) assert.ok(k in r.topPages[0], k);
  assert.ok(Array.isArray(r.markers) && Array.isArray(r.countries) && Array.isArray(r.devices));
});

test('overview: the click rate is null under 500 impressions, and the range is checked', async () => {
  use(SMALL);
  const r = (await get('/api/overview?range=28')).json;
  const rate = r.tiles.find((x) => x.key === 'clickRate');
  assert.equal(rate.value, null);
  assert.match(rate.note, /500/);
  assert.equal(r.tiles.find((x) => x.key === 'impressions').value, 280);
  for (const days of [7, 28, 90, 480]) assert.equal((await get(`/api/overview?range=${days}`)).status, 200, `${days}`);
  assert.equal((await get('/api/overview?range=14')).status, 400);
  // A shorter range has its own totals and its own series.
  use(FULL);
  const seven = (await get('/api/overview?range=7')).json;
  assert.equal(seven.series.length, 7);
  assert.equal(seven.tiles.find((x) => x.key === 'impressions').value, 7 * 130);
});

// ================================================================ cannibalization

test('cannibalization lists a split search with shares, a hypothesis and a test, and stores a choice', async () => {
  use(FULL);
  const r = (await get('/api/insights/cannibalization')).json;
  assert.equal(r.term, 'Cannibalization');
  assert.equal(r.explain, 'Two of your pages are competing for the same search.');
  assert.equal(r.items.length, r.count);
  const it = r.items.find((x) => x.query === 'shared topic phrase');
  assert.ok(it, 'the shared search is listed');
  assert.equal(it.impressions, 80);
  assert.equal(it.shouldWin, '/blog/alpha-guide');
  assert.equal(it.pages.length, 2);
  assert.deepEqual(Object.keys(it.pages[0]).sort(), [
    'frozenUntil',
    'frozenUntilText',
    'impressions',
    'page',
    'position',
    'share',
  ]);
  assert.equal(it.pages[0].share, 0.5);
  assert.equal(it.choice, null);
  assert.match(it.recommendation, /^Hypothesis:/);
  assert.match(it.recommendation, /\bmay\b/);
  assert.doesNotMatch(it.recommendation, /\bwill\b/);
  assert.ok(it.test.length > 20);
  assert.equal(it.state.status, 'new');
  assert.ok('eligible' in it.eligibility);
  assert.ok(it.term && it.explain);

  const bad = await post_(`/api/insights/cannibalization/${it.id}/choice`, { choice: 'merge' });
  assert.equal(bad.status, 400);
  assert.equal((await post_('/api/insights/cannibalization/nope/choice', { choice: 'consolidate' })).status, 404);

  const ok = await post_(`/api/insights/cannibalization/${it.id}/choice`, { choice: 'consolidate' });
  assert.equal(ok.status, 200);
  const saved = store.readJson('state/insight-choices.json', null);
  assert.ok(JSON.stringify(saved).includes('consolidate'), 'stored in state/insight-choices.json');
  const again = (await get('/api/insights/cannibalization')).json.items.find((x) => x.id === it.id);
  assert.equal(again.choice, 'consolidate');
  assert.match(again.recommendation, /^Hypothesis:/);
  assert.notEqual(again.recommendation, it.recommendation, 'the recommendation follows the choice');

  await post_(`/api/insights/cannibalization/${it.id}/choice`, { choice: 'differentiate' });
  assert.equal(
    (await get('/api/insights/cannibalization')).json.items.find((x) => x.id === it.id).choice,
    'differentiate'
  );
  await post_(`/api/insights/cannibalization/${it.id}/choice`, { choice: null });
  assert.equal((await get('/api/insights/cannibalization')).json.items.find((x) => x.id === it.id).choice, null);
});

// ================================================================ runner-up and decay

test('runner-up keywords: the searches just off page one, each with its term', async () => {
  use(FULL);
  const r = (await get('/api/insights/runner-up')).json;
  assert.equal(r.term, 'Runner-up keywords');
  assert.equal(r.explain, 'Searches where you sit just off page one.');
  assert.equal(r.count, r.items.length);
  assert.ok(r.count >= 3);
  assert.ok(r.items.every((x) => x.type === 'near-page-one' && x.term === 'Runner-up keywords' && x.query && x.page));
});

test('decay: growing and decaying pages and searches with gated change and both views', async () => {
  use(FULL);
  const r = (await get('/api/insights/decay')).json;
  assert.equal(r.term, 'Decay');
  assert.equal(r.explain, 'Pages that are being shown less than before.');
  const alpha = r.pages.decaying.find((x) => x.page === '/blog/alpha-guide');
  assert.ok(alpha);
  assert.equal(alpha.impressions, 30 * 28);
  assert.equal(alpha.prevImpressions, 50 * 28);
  assert.equal(alpha.change, -40);
  assert.equal(r.pages.growing.find((x) => x.page === '/blog/gamma-tips').change, 100);
  assert.ok(!r.pages.decaying.some((x) => x.page === '/blog/zeta-tiny'), 'a drop from a handful of views is not shown');
  assert.ok(!r.pages.decaying.some((x) => x.page === '/blog/beta-notes'), 'a steady page is in neither list');
  assert.ok(r.pages.decaying.every((x) => x.change !== null && x.change <= -20));
  const q = r.queries;
  assert.equal(q.decaying.find((x) => x.query === 'alpha target phrase').change, -40);
  assert.equal(q.decaying.find((x) => x.query === 'old search phrase').impressions, 0);
  assert.equal(q.growing.find((x) => x.query === 'orphan search phrase').change, 200);
  assert.ok(!q.decaying.concat(q.growing).some((x) => x.query === 'tiny search'));
  assert.ok(!q.decaying.concat(q.growing).some((x) => /login/.test(x.query)), 'brand searches are left out');
  assert.equal(r.count, r.items.length);
  assert.ok(r.items.some((x) => x.type === 'slipping' && x.page === '/blog/alpha-guide'));
});

// ================================================================ content gaps

test('content gap titles are plain words, with no dash and no jargon', () => {
  assert.equal(I.gapTitle('float pool staffing policy'), 'Float pool staffing policy');
  assert.equal(I.gapTitle('on-call pay rules'), 'On call pay rules');
  assert.equal(I.gapTitle('how long is a nurse shift'), 'How long is a nurse shift');
  assert.equal(I.gapTitle('how long is a nurse shift?'), 'How long is a nurse shift?', 'a question stays a question');
  assert.equal(I.gapTitle('nurse ratio law?'), 'Nurse ratio law', 'a stray question mark on a statement goes');
  assert.equal(I.gapTitle('  Overtime   rules — hospitals '), 'Overtime rules hospitals');
});

test('priority by impressions terciles, ties share a band', () => {
  assert.deepEqual(I.priorityBands([90, 45, 35]), ['high', 'medium', 'low']);
  assert.deepEqual(I.priorityBands([10]), ['high']);
  assert.deepEqual(I.priorityBands([10, 5]), ['high', 'medium']);
  assert.deepEqual(I.priorityBands([30, 30, 30]), ['high', 'high', 'high']);
  assert.deepEqual(I.priorityBands([60, 50, 40, 30, 20, 10]), ['high', 'high', 'medium', 'medium', 'low', 'low']);
});

test('content gaps: searches grouped by topic, a working title, link sources, priority and state', async () => {
  use(FULL);
  const r = (await get('/api/insights/content-gaps')).json;
  assert.equal(r.term, 'Content gaps');
  assert.equal(r.explain, 'Searches you already appear for that no page is written for.');
  assert.equal(r.count, 3);
  const gap = r.items.find((x) => x.title === 'Float pool staffing policy');
  assert.ok(gap, 'a title built from the lead search');
  assert.equal(gap.impressions, 90);
  assert.deepEqual(
    gap.searches.map((s) => s.query),
    ['float pool staffing policy', 'float pool staffing rules']
  );
  assert.deepEqual(Object.keys(gap.searches[0]).sort(), ['impressions', 'position', 'query']);
  assert.equal(gap.why, 'You already appear 90 times for these searches with no page written for them.');
  // The pages that say the words first, then the page Google already shows for these searches.
  assert.deepEqual(
    gap.linkFrom.map((x) => x.page),
    ['/blog/alpha-guide', '/blog/beta-notes', '/blog/epsilon-old']
  );
  assert.deepEqual(
    gap.linkFrom.map((x) => x.reason),
    ['mentions', 'mentions', 'shown']
  );
  assert.ok(gap.linkFrom.every((x) => x.frozenUntil === null && x.frozenUntilText === null));
  assert.equal(gap.priority, 'high');
  assert.equal(gap.state.status, 'new');
  assert.ok(gap.id && gap.topic);
  assert.deepEqual(
    r.items.map((x) => x.priority),
    ['high', 'medium', 'low']
  );
  for (const g of r.items) {
    assert.doesNotMatch(g.title, /[-–—]/, 'no dash in a title');
    assert.doesNotMatch(g.title, /\b(CTR|SERP|KD)\b/i);
    assert.match(g.title, /^[A-Z]/);
  }
});

// ================================================================ keyword map table

test('keyword map table: counters add up and the flags come from the opportunities', async () => {
  use(FULL);
  const r = (await get('/api/keyword-map/table')).json;
  const { counters, rows } = r;
  assert.equal(counters.all, rows.length);
  assert.equal(counters.mapped + counters.unmapped, counters.all);
  assert.equal(counters.mapped, rows.filter((x) => x.kind === 'targeted').length);
  assert.equal(counters.unmapped, rows.filter((x) => x.kind === 'discovered').length);
  assert.equal(counters.runnerUp, rows.filter((x) => x.flags.includes('runner-up')).length);
  assert.equal(counters.cannibalized, rows.filter((x) => x.flags.includes('cannibalized')).length);
  assert.equal(counters.opportunities, rows.filter((x) => x.flags.length).length);
  assert.ok(counters.mapped === 5 && counters.unmapped >= 3);
  const by = (k) => rows.find((x) => x.keyword === k);
  assert.deepEqual(Object.keys(by('alpha target phrase')).sort(), [
    'clusterConflict',
    'flags',
    'impressions',
    'keyword',
    'kind',
    'mappedTo',
    'origin',
    'position',
    'rankingPage',
    'source',
    'status',
    'volume',
  ]);
  assert.equal(by('alpha target phrase').mappedTo, '/blog/alpha-guide');
  assert.equal(by('alpha target phrase').origin, 'registry');
  assert.deepEqual(by('alpha target phrase').flags, []);
  assert.ok(by('beta target phrase').flags.includes('runner-up'));
  assert.ok(by('beta target phrase').flags.includes('wrong-page'));
  assert.equal(by('shared topic phrase').kind, 'discovered');
  assert.equal(by('shared topic phrase').status, 'pending');
  assert.equal(by('alpha target phrase').status, 'live');
  assert.equal(by('shared topic phrase').mappedTo, null);
  assert.equal(by('shared topic phrase').origin, 'discovered');
  assert.ok(by('shared topic phrase').flags.includes('cannibalized'));
  assert.equal(by('delta target phrase').impressions, 0);
  assert.equal(by('delta target phrase').position, null);
  assert.ok(!rows.some((x) => /login/.test(x.keyword)), 'brand searches are not discovered');
});

test('keyword map CSV has a header and one row per keyword', async () => {
  use(FULL);
  const table = (await get('/api/keyword-map/table')).json;
  const r = await get('/api/export/keyword-map.csv');
  assert.equal(r.status, 200);
  assert.match(r.headers['Content-Type'], /text\/csv/);
  assert.match(r.headers['Content-Disposition'], /seo-desk-keyword-map-2026-11-10\.csv/);
  const lines = r.text.trim().split('\r\n');
  assert.equal(lines.length, table.rows.length + 1);
  assert.match(lines[0], /^keyword,status,mapped_to_page,origin,position,impressions,ranking_page,flags(,|$)/);
});

// ================================================================ retries and wake

const T0 = new Date(2026, 10, 12, 9, 0, 0); // 12 November 2026, 09:00 local
const at = (minutes) => new Date(T0.getTime() + minutes * 60000);
const dayOf = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const freshDir = () => {
  process.env.SEO_DESK_DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-retry-'));
  invalidate();
  return process.env.SEO_DESK_DATA;
};
const okSnap = (source) => ({
  source,
  ok: true,
  status: 'fresh',
  pulledAt: new Date().toISOString(),
  through: '2026-11-07',
  error: null,
  data: {},
});
function pullers({ failing = [] } = {}) {
  const calls = [];
  const map = {};
  for (const s of refresh.ORDER) {
    map[s] = async () => {
      calls.push(s);
      if (failing.includes(s)) throw new Error(`${s} fell over`);
      return okSnap(s);
    };
  }
  return { map, calls };
}
// Waits for whatever run is going (starting nothing itself), and never lets the weekly audit start.
const settle = async () => {
  for (let i = 0; i < 400 && refresh.refreshRunning(); i++) await new Promise((r) => setTimeout(r, 5));
};
const refreshAll = (opts) => refresh.refreshAll({ afterFull: () => {}, ...opts });

test('a failed pull is retried 20 minutes later, three times a day at most', async () => {
  freshDir();
  const { map, calls } = pullers({ failing: ['gsc'] });
  await refreshAll({ pullers: map, now: () => at(0) });
  let s = store.readJson('state/refresh.json');
  assert.deepEqual(s.retries.gsc, { day: dayOf(T0), count: 0, nextAt: at(20).toISOString() });
  assert.equal(s.retries.bing, undefined, 'only failed sources are retried');
  const row = (when) => refresh.sourceStatus({ now: when.getTime() }).find((x) => x.source === 'gsc');
  assert.equal(row(at(1)).retryAt, at(20).toISOString());
  assert.equal(refresh.sourceStatus().find((x) => x.source === 'bing').retryAt, null);

  calls.length = 0;
  assert.deepEqual(refresh.retryFailed({ pullers: map, now: () => at(19) }), [], 'not due yet');
  for (const [n, minute] of [
    [1, 20],
    [2, 45],
    [3, 70],
  ]) {
    assert.deepEqual(refresh.retryFailed({ pullers: map, now: () => at(minute) }), ['gsc'], `retry ${n}`);
    await settle();
    s = store.readJson('state/refresh.json');
    assert.equal(s.retries.gsc.count, n);
  }
  assert.equal(s.retries.gsc.nextAt, null, 'three retries used, nothing more today');
  assert.equal(refresh.sourceStatus().find((x) => x.source === 'gsc').retryAt, null);
  assert.deepEqual(calls, ['gsc', 'gsc', 'gsc']);
  assert.deepEqual(refresh.retryFailed({ pullers: map, now: () => at(200) }), []);
  // A new day starts the count again: a pull that fails then is retried again.
  const tomorrow = at(24 * 60);
  assert.deepEqual(refresh.retryFailed({ pullers: map, now: () => tomorrow }), []);
  await refreshAll({ only: ['gsc'], pullers: map, now: () => tomorrow });
  assert.deepEqual(store.readJson('state/refresh.json').retries.gsc, {
    day: dayOf(tomorrow),
    count: 0,
    nextAt: new Date(tomorrow.getTime() + 20 * 60000).toISOString(),
  });
});

test('a good pull clears the retry, and a run keeps the other sources entries', async () => {
  freshDir();
  const bad = pullers({ failing: ['gsc', 'bing'] });
  await refreshAll({ pullers: bad.map, now: () => at(0) });
  assert.ok(store.readJson('state/refresh.json').retries.gsc);
  const good = pullers({ failing: ['bing'] });
  await refreshAll({ only: ['gsc'], pullers: good.map, now: () => at(5) });
  const s = store.readJson('state/refresh.json');
  assert.equal(s.retries.gsc, undefined, 'recovered');
  assert.ok(s.retries.bing, 'untouched by a run that did not pull it');
});

test('no retry starts while a run is in progress, and none on a paused desk', async () => {
  freshDir();
  const failing = pullers({ failing: ['gsc'] });
  await refreshAll({ pullers: failing.map, now: () => at(0) });
  // A slow run: local waits on a gate.
  let release;
  const gate = new Promise((r) => (release = r));
  const slow = { ...failing.map, local: async () => (await gate, okSnap('local')) };
  const running = refreshAll({ only: ['local'], pullers: slow, now: () => at(21) });
  assert.equal(refresh.refreshRunning(), true);
  assert.deepEqual(refresh.retryFailed({ pullers: failing.map, now: () => at(30) }), [], 'a run is going');
  release();
  await running;

  store.writeJson('state/settings.json', { paused: true });
  assert.deepEqual(refresh.retryFailed({ pullers: failing.map, now: () => at(40) }), [], 'paused');
  assert.equal(refresh.sourceStatus().find((x) => x.source === 'gsc').retryAt, null, 'no promise of a retry');
  store.writeJson('state/settings.json', { paused: false });
  assert.deepEqual(refresh.retryFailed({ pullers: failing.map, now: () => at(40) }), ['gsc']);
  await settle();
});

test('the schedule tick runs a due retry, and a tick that fires more than 20 minutes late counts as a wake', async () => {
  const day = freshDir();
  // The morning run is done for today, so only the wake check and the retries can start anything.
  store.writeJson('state/refresh.json', { lastFullRunAt: T0.toISOString() });
  const idle = pullers();
  let clock = at(0);
  const tick = refresh.makeTick({ pullers: idle.map, intervalMs: 10 * 60000, now: () => clock });

  clock = at(10); // on time
  tick();
  await settle();
  assert.equal(idle.calls.length, 0, 'an on-time tick with nothing due starts nothing');

  clock = at(10 + 31); // 31 minutes after the last tick: 21 minutes past the 10 it should be
  tick();
  await settle();
  assert.deepEqual(
    idle.calls.slice().sort(),
    [...refresh.ORDER].sort(),
    'a wake brings never-pulled sources up to date'
  );

  // Exactly 20 minutes late is not a wake (the rule is more than 20).
  fs.rmSync(path.join(day, 'snap'), { recursive: true, force: true });
  idle.calls.length = 0;
  clock = at(41 + 10 + 20);
  tick();
  await settle();
  assert.equal(idle.calls.length, 0);

  // A due retry runs from the tick.
  const failing = pullers({ failing: ['gsc'] });
  await refreshAll({ pullers: failing.map, now: () => at(100) });
  failing.calls.length = 0;
  clock = at(100);
  const tick2 = refresh.makeTick({ pullers: failing.map, intervalMs: 10 * 60000, now: () => clock });
  clock = at(100 + 20);
  tick2();
  await settle();
  assert.deepEqual(failing.calls, ['gsc']);
});

test('wokeUp is true only when more than 20 minutes late', () => {
  const m = 60000;
  assert.equal(refresh.wokeUp(0, 10 * m, 10 * m), false);
  assert.equal(refresh.wokeUp(0, 30 * m, 10 * m), false);
  assert.equal(refresh.wokeUp(0, 30 * m + 1, 10 * m), true);
});

// ================================================================ fix round 1

const NOTES = path.join(REPO, 'docs/seo/change-log-notes.jsonl');
// A deliberate edit dated 5 November freezes alpha-guide until 3 December (the lifecycle rule).
function freezeAlpha() {
  fs.writeFileSync(
    NOTES,
    `${JSON.stringify({ date: '2026-11-05', slug: 'alpha-guide', text: 'Edit: changed the intro.', source: 'manual' })}\n`
  );
  invalidate();
}
const unfreeze = () => {
  fs.rmSync(NOTES, { force: true });
  invalidate();
};

test('a frozen page in linkFrom says so, with the date from the lifecycle freeze, and goes last', async () => {
  use(FULL);
  freezeAlpha();
  try {
    const gap = (await get('/api/insights/content-gaps')).json.items.find(
      (x) => x.title === 'Float pool staffing policy'
    );
    assert.deepEqual(
      gap.linkFrom.map((x) => x.page),
      ['/blog/beta-notes', '/blog/epsilon-old', '/blog/alpha-guide'],
      'the frozen page is last'
    );
    const alpha = gap.linkFrom.find((x) => x.page === '/blog/alpha-guide');
    assert.equal(alpha.frozenUntil, buildModel().frozen.get('/blog/alpha-guide').until);
    assert.equal(alpha.frozenUntil, '2026-12-03');
    assert.equal(alpha.frozenUntilText, '3 December');
    assert.equal(gap.linkFrom.find((x) => x.page === '/blog/beta-notes').frozenUntil, null);
  } finally {
    unfreeze();
  }
});

test('a cannibalization item is eligible only when every page the action edits is free', async () => {
  use(FULL);
  const free = (await get('/api/insights/cannibalization')).json.items.find((x) => x.query === 'shared topic phrase');
  assert.deepEqual(free.eligibility, { eligible: true, from: null, page: null, text: 'Eligible now' });
  assert.ok(free.pages.every((p) => p.frozenUntil === null));

  freezeAlpha(); // alpha-guide is the page that should win
  try {
    const it = (await get('/api/insights/cannibalization')).json.items.find((x) => x.query === 'shared topic phrase');
    assert.equal(it.shouldWin, '/blog/alpha-guide');
    assert.equal(it.eligibility.eligible, false);
    assert.equal(it.eligibility.from, '2026-12-03');
    assert.equal(it.eligibility.page, '/blog/alpha-guide');
    assert.match(it.eligibility.text, /^Eligible from 3 December/);
    assert.equal(it.pages.find((p) => p.page === '/blog/alpha-guide').frozenUntil, '2026-12-03');
    assert.equal(it.pages.find((p) => p.page === '/blog/beta-notes').frozenUntil, null);
  } finally {
    unfreeze();
  }
  // The other page frozen instead. With no choice made, Done edits only the page that should win, so
  // the item stays eligible; once "consolidate" folds the other page in, that page is edited too, so it
  // is not eligible, and the page named is that one.
  fs.writeFileSync(
    NOTES,
    `${JSON.stringify({ date: '2026-11-08', slug: 'beta-notes', text: 'Edit: new heading.', source: 'manual' })}\n`
  );
  invalidate();
  try {
    let it = (await get('/api/insights/cannibalization')).json.items.find((x) => x.query === 'shared topic phrase');
    assert.deepEqual(it.editPages, ['/blog/alpha-guide']);
    assert.equal(it.eligibility.eligible, true);
    await post_(`/api/insights/cannibalization/${it.id}/choice`, { choice: 'consolidate' });
    it = (await get('/api/insights/cannibalization')).json.items.find((x) => x.query === 'shared topic phrase');
    assert.deepEqual(it.editPages, ['/blog/alpha-guide', '/blog/beta-notes']);
    assert.equal(it.eligibility.eligible, false);
    assert.equal(it.eligibility.page, '/blog/beta-notes');
    assert.equal(it.eligibility.from, '2026-12-06');
  } finally {
    const it = (await get('/api/insights/cannibalization')).json.items.find((x) => x.query === 'shared topic phrase');
    await post_(`/api/insights/cannibalization/${it.id}/choice`, { choice: null });
    unfreeze();
  }
});

test('the overview click rate note describes the site total figure and never says Google hides clicks', async () => {
  use(FULL);
  const rate = (await get('/api/overview')).json.tiles.find((x) => x.key === 'clickRate');
  assert.equal(rate.note, 'Clicks divided by times shown, for the whole site.');
});

test('the open status list has one home', () => {
  assert.deepEqual(I.OPEN_STATUSES, ['new', 'in-progress', 'came-back']);
  const work = fs.readFileSync(new URL('../lib/api/work.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(work, /'in-progress', 'came-back'/);
  assert.match(work, /OPEN_STATUSES/);
});

test('marking a content gap done, ignored, snoozed or reopened applies to every search in it', async () => {
  use(FULL);
  const gaps = () => get('/api/insights/content-gaps').then((r) => r.json.items);
  const gap = (await gaps()).find((x) => x.title === 'Float pool staffing policy');
  assert.equal(gap.oppIds.length, 2);
  const statusOf = (id) => buildModel().items[id]?.status;

  assert.equal((await post_(`/api/insights/content-gaps/${gap.id}`, { action: 'explode' })).status, 400);
  assert.equal((await post_('/api/insights/content-gaps/nope', { action: 'done' })).status, 404);
  // Ignore needs a reason: refused, and nothing changed for either search.
  assert.equal((await post_(`/api/insights/content-gaps/${gap.id}`, { action: 'ignore' })).status, 400);
  assert.deepEqual(gap.oppIds.map(statusOf), ['new', 'new']);

  const done = await post_(`/api/insights/content-gaps/${gap.id}`, { action: 'done' });
  assert.equal(done.status, 200);
  assert.deepEqual([...done.json.applied].sort(), [...gap.oppIds].sort());
  assert.deepEqual(gap.oppIds.map(statusOf), ['done', 'done']);
  assert.ok(!(await gaps()).some((x) => x.id === gap.id), 'the finished gap leaves the list');
  assert.equal((await get('/api/insights/content-gaps')).json.count, 2);

  // A second Done changes nothing; Ignore on a finished gap is refused as the item action does.
  assert.equal((await post_(`/api/insights/content-gaps/${gap.id}`, { action: 'done' })).json.applied.length, 0);
  assert.equal((await post_(`/api/insights/content-gaps/${gap.oppIds[1]}`, { action: 'reopen' })).status, 200);
  assert.deepEqual(gap.oppIds.map(statusOf), ['new', 'new'], 'any search in the gap finds the whole gap');
  assert.ok((await gaps()).some((x) => x.title === 'Float pool staffing policy'));

  const ignored = await post_(`/api/insights/content-gaps/${gap.id}`, { action: 'ignore', reason: 'not now' });
  assert.equal(ignored.status, 200);
  assert.deepEqual(gap.oppIds.map(statusOf), ['ignored', 'ignored']);
  await post_(`/api/insights/content-gaps/${gap.id}`, { action: 'reopen' });
  const snoozed = await post_(`/api/insights/content-gaps/${gap.id}`, { action: 'snooze', until: '2026-12-01' });
  assert.equal(snoozed.status, 200);
  assert.deepEqual(gap.oppIds.map(statusOf), ['snoozed', 'snoozed']);
  assert.equal((await post_(`/api/insights/content-gaps/${gap.id}`, { action: 'snooze', until: 'soon' })).status, 400);
  await post_(`/api/insights/content-gaps/${gap.id}`, { action: 'reopen' });
  assert.deepEqual(gap.oppIds.map(statusOf), ['new', 'new']);
});

test('Clarity is never retried, and index checks get one retry a day', async () => {
  freshDir();
  const bad = pullers({ failing: ['clarity', 'index', 'bing'] });
  await refreshAll({ pullers: bad.map, now: () => at(0) });
  const book = store.readJson('state/refresh.json').retries;
  assert.equal(book.clarity, undefined, 'no retry is ever scheduled for Clarity');
  assert.ok(book.bing && book.index);
  const rows = refresh.sourceStatus({ now: at(1).getTime() });
  assert.equal(rows.find((x) => x.source === 'clarity').retryAt, null);
  assert.equal(rows.find((x) => x.source === 'clarity').status, 'failed');
  assert.deepEqual(refresh.retryFailed({ pullers: bad.map, now: () => at(25) }).sort(), ['bing', 'index']);
  await settle();
  let s = store.readJson('state/refresh.json');
  assert.equal(s.retries.index.count, 1);
  assert.equal(s.retries.index.nextAt, null, 'the one index retry is used');
  assert.equal(s.retries.bing.count, 1);
  assert.ok(s.retries.bing.nextAt, 'bing has more retries left');
  bad.calls.length = 0;
  assert.deepEqual(refresh.retryFailed({ pullers: bad.map, now: () => at(60) }), ['bing']);
  await settle();
  assert.ok(!bad.calls.includes('index') && !bad.calls.includes('clarity'));
  // A stale entry for Clarity (written by an older desk) is never due either.
  s = store.readJson('state/refresh.json');
  store.writeJson('state/refresh.json', {
    ...s,
    retries: { ...s.retries, clarity: { day: dayOf(T0), count: 0, nextAt: at(0).toISOString() } },
  });
  assert.ok(!refresh.dueRetries({ now: at(100), pullers: bad.map }).includes('clarity'));
});

test('a retry that starts before midnight and fails after it does not gain an extra retry', async () => {
  freshDir();
  const before = new Date(2026, 10, 12, 23, 50, 0);
  const after = new Date(2026, 10, 13, 0, 5, 0);
  store.writeJson('state/refresh.json', {
    retries: { gsc: { day: dayOf(before), count: 2, nextAt: new Date(2026, 10, 12, 23, 40, 0).toISOString() } },
  });
  store.writeJson('snap/gsc.json', { source: 'gsc', ok: false, status: 'failed', pulledAt: null, data: {} });
  let clock = before;
  const failing = {
    ...pullers().map,
    gsc: async () => {
      clock = after; // the pull takes 15 minutes and fails after midnight
      throw new Error('gsc fell over');
    },
  };
  assert.deepEqual(refresh.retryFailed({ pullers: failing, now: () => clock }), ['gsc']); // the third retry of the 12th
  await settle();
  const r = store.readJson('state/refresh.json').retries.gsc;
  assert.equal(r.day, dayOf(before), 'counted on the day it started');
  assert.equal(r.count, 3);
  assert.equal(r.nextAt, null, 'no fourth retry on the strength of the clock rolling over');
  assert.deepEqual(refresh.retryFailed({ pullers: failing, now: () => new Date(2026, 10, 13, 1, 0, 0) }), []);
});

// ================================================================ task 6: drop diagnosis

const P = (impressions, position, clicks = 0) => ({ impressions, position, clicks });

test('dropKind: lost rankings when the place is worse by 2 or more, and not at 1.99', () => {
  const hit = I.dropKindOf(P(500, 5, 25), P(300, 7, 15));
  assert.equal(hit.kind, 'lost-rankings');
  assert.match(hit.label, /hypothesis/i);
  assert.match(hit.recommendation, /strengthen/i);
  assert.match(hit.recommendation, /link/i);
  assert.notEqual(I.dropKindOf(P(500, 5, 25), P(300, 6.99, 15)).kind, 'lost-rankings');
  // A better place is never lost rankings.
  assert.notEqual(I.dropKindOf(P(500, 7, 25), P(300, 5, 15)).kind, 'lost-rankings');
});

test('dropKind: lost demand when the place holds within 1 and views fall 30 percent or more', () => {
  const hit = I.dropKindOf(P(500, 5, 25), P(350, 5.9, 18));
  assert.equal(hit.kind, 'lost-demand');
  assert.match(hit.recommendation, /fewer people/i);
  assert.match(hit.recommendation, /leave it/i);
  assert.equal(I.dropKindOf(P(500, 5, 25), P(351, 5.9, 18)).kind, 'unclear', 'views down 29.8 percent');
  assert.equal(I.dropKindOf(P(500, 5, 25), P(350, 6.1, 18)).kind, 'unclear', 'the place moved 1.1');
  assert.equal(I.dropKindOf(P(500, 5, 25), P(300, 4.2, 18)).kind, 'lost-demand', 'a place gained within 1 still holds');
});

test('dropKind: lost clicks when place and views hold within 15 percent and clicks fall 30 percent with 20 before', () => {
  const hit = I.dropKindOf(P(1000, 5, 40), P(900, 5.5, 28));
  assert.equal(hit.kind, 'lost-clicks');
  assert.match(hit.recommendation, /title/i);
  assert.match(hit.recommendation, /above you/i);
  assert.equal(I.dropKindOf(P(1000, 5, 40), P(900, 5.5, 29)).kind, 'unclear', 'clicks down 27.5 percent');
  assert.equal(I.dropKindOf(P(1000, 5, 19), P(900, 5.5, 9)).kind, 'unclear', 'under 20 clicks before');
  assert.equal(I.dropKindOf(P(1000, 5, 40), P(840, 5.5, 20)).kind, 'unclear', 'views down 16 percent');
  assert.equal(I.dropKindOf(P(1000, 5, 40), P(900, 5.8, 20)).kind, 'unclear', 'place moved 16 percent');
});

test('dropKind: unclear when the numbers point nowhere, and under 20 views before there is no diagnosis', () => {
  const none = I.dropKindOf(P(500, 5, 25), P(380, 5.5, 20));
  assert.equal(none.kind, 'unclear');
  assert.match(none.label, /hypothesis/i);
  assert.equal(I.dropKindOf(P(19, 5, 1), P(2, 12, 0)).kind, 'unclear', 'a handful of views is not diagnosed');
  assert.equal(I.dropKindOf(P(500, 5, 25), P(0, null, 0)).kind, 'unclear', 'a page that vanished has no place to read');
});

test('a dropKind never states a cause as certain, and never uses a dash or jargon', () => {
  for (const [b, a] of [
    [P(500, 5, 25), P(300, 8, 15)],
    [P(500, 5, 25), P(300, 5.2, 15)],
    [P(1000, 5, 40), P(900, 5.5, 20)],
    [P(500, 5, 25), P(380, 5.5, 20)],
  ]) {
    const d = I.dropKindOf(b, a);
    for (const text of [d.label, d.why, d.recommendation]) {
      assert.doesNotMatch(text, /[–—]/, text);
      assert.doesNotMatch(text, /\b(CTR|SERP)\b/);
      assert.doesNotMatch(text, /\b(because|caused by|due to|will)\b/i, text);
    }
    assert.match(`${d.why} ${d.recommendation}`, /\b(may|might|could)\b/i, 'it says may');
  }
});

const day = (end, n) => addDays(end, -n);
function lastTwo(prior, last) {
  // Daily rows for one page: 14 days of `prior` views each day, then 14 days of `last`.
  const rows = [];
  for (let i = 27; i >= 14; i--) rows.push({ date: day(THROUGH, i), impressions: prior });
  for (let i = 13; i >= 0; i--) rows.push({ date: day(THROUGH, i), impressions: last });
  return rows;
}
test('recentDrop: the last 14 days 30 percent below the 14 before, with 50 views in each half', () => {
  assert.equal(I.recentDropOf(lastTwo(10, 5), THROUGH), true, '70 against 140 is half');
  assert.equal(I.recentDropOf(lastTwo(10, 7), THROUGH), true, '98 against 140 is 30 percent down');
  assert.equal(I.recentDropOf(lastTwo(10, 7.1), THROUGH), false, '99.4 against 140 is 29 percent down');
  assert.equal(I.recentDropOf(lastTwo(4, 2), THROUGH), false, 'halves of 56 and 28 views are under 50');
  assert.equal(I.recentDropOf(lastTwo(3.5, 1), THROUGH), false, 'prior half is 49 views');
  assert.equal(I.recentDropOf(lastTwo(10, 3.5), THROUGH), false, 'the last half is 49 views');
  assert.equal(I.recentDropOf(lastTwo(10, 12), THROUGH), false, 'a rise is not a drop');
  assert.equal(I.recentDropOf([], THROUGH), false);
});

// Pages with the numbers each case needs. Two periods of 28 days; the second one is checked in halves.
const DROPS = path.join(root, 'drops');
fs.mkdirSync(DROPS, { recursive: true });
const SPEC = {
  '/blog/rank-loss': { prev: [50, 5], cur: [30, 8] },
  '/blog/demand-loss': { prev: [50, 5], cur: [30, 5.4] },
  '/blog/unclear-one': { prev: [50, 5], cur: [30, 6.9] },
  '/blog/fresh-drop': { prev: [40, 5], cur: [40, 5], late: 15 },
  '/blog/small-halves': { prev: [6, 5], cur: [3, 5], late: 1 },
  '/blog/steady-a': { prev: [20, 9], cur: [20, 9] },
  '/blog/steady-b': { prev: [20, 9], cur: [20, 9] },
  '/blog/steady-c': { prev: [20, 9], cur: [20, 9] },
  '/blog/steady-d': { prev: [20, 9], cur: [20, 9] },
  '/blog/steady-e': { prev: [20, 9], cur: [20, 9] },
  '/blog/steady-f': { prev: [20, 9], cur: [20, 9] },
};
function dropsDaily() {
  const rows = [];
  for (const date of dates('2026-09-13', THROUGH)) {
    for (const [page, s] of Object.entries(SPEC)) {
      const inCur = date >= CUR.start;
      const [base, pos] = inCur ? s.cur : s.prev;
      const lateStart = addDays(CUR.start, 14);
      const imp = inCur && s.late !== undefined && date >= lateStart ? s.late : base;
      rows.push({ date, page, clicks: Math.round(imp * 0.05), impressions: imp, position: pos });
    }
  }
  return rows;
}
writeSnap(DROPS, 'gsc', {
  ...gscData(),
  pageDaily: dropsDaily(),
  qpCur: [],
  qp90: [],
  queryCur: [],
  queryPrev: [],
});
writeSnap(DROPS, 'local', {
  ...localData(),
  registry: [],
  livePages: Object.keys(SPEC).map((page) => ({ page, lastmod: '2026-10-01' })),
});

test('decay: each decaying page carries a labelled hypothesis, a recommendation and recentDrop', async () => {
  use(DROPS);
  const r = (await get('/api/insights/decay')).json;
  const row = (page) => r.pages.decaying.find((x) => x.page === page);
  assert.equal(row('/blog/rank-loss').dropKind, 'lost-rankings');
  assert.equal(row('/blog/demand-loss').dropKind, 'lost-demand');
  assert.equal(row('/blog/unclear-one').dropKind, 'unclear');
  assert.equal(row('/blog/fresh-drop').dropKind, 'lost-demand');
  for (const x of r.pages.decaying) {
    assert.ok(['lost-rankings', 'lost-demand', 'lost-clicks', 'unclear'].includes(x.dropKind), x.page);
    assert.match(x.dropKindLabel, /hypothesis/i);
    assert.ok(x.dropKindWhy.length > 20 && x.recommendation.length > 20);
    assert.equal(typeof x.recentDrop, 'boolean');
    for (const text of [x.dropKindLabel, x.dropKindWhy, x.recommendation]) assert.doesNotMatch(text, /[–—]/);
  }
  assert.match(row('/blog/rank-loss').dropKindWhy, /5/);
  assert.match(row('/blog/rank-loss').dropKindWhy, /8/);
  // The same fields sit on the opportunity cards (items), page by page.
  const item = r.items.find((x) => x.page === '/blog/rank-loss');
  assert.ok(item, 'the slipping card exists');
  assert.equal(item.dropKind, 'lost-rankings');
  assert.equal(item.recommendation, row('/blog/rank-loss').recommendation);
  assert.equal(typeof item.recentDrop, 'boolean');
});

test('decay: recentDrop is true for a fresh fall and false when either half is under 50 views', async () => {
  use(DROPS);
  const r = (await get('/api/insights/decay')).json;
  const row = (page) => r.pages.decaying.find((x) => x.page === page);
  assert.equal(row('/blog/fresh-drop').recentDrop, true, '210 views against 560');
  assert.equal(row('/blog/small-halves').recentDrop, false, 'halves of 42 and 14 views');
  assert.equal(row('/blog/rank-loss').recentDrop, false, 'a flat second period');
});

// ================================================================ task 6: cannibalization

const clearChoice = async (id) => post_(`/api/insights/cannibalization/${id}/choice`, { choice: null });

test('cannibalization: atRisk is the weaker page of the split, with its views and clicks', async () => {
  use(FULL);
  const it = (await get('/api/insights/cannibalization')).json.items.find((x) => x.query === 'shared topic phrase');
  assert.deepEqual(it.atRisk, { page: '/blog/beta-notes', impressions: 40, clicks: 50 });
  assert.equal(typeof it.likelyFalseAlarm, 'boolean');
  assert.ok('falseAlarmReason' in it);
  assert.equal(it.likelyFalseAlarm, false);
  assert.equal(it.falseAlarmReason, null);
});

test('likelyFalseAlarm: a pillar and its own post (a brand search never reaches the split list)', () => {
  const none = I.falseAlarmOf({ pages: ['/pricing', '/blog/alpha-guide'], registry: [] });
  assert.equal(none.likelyFalseAlarm, false);
  const registry = [
    { url: '/ai-nurse-scheduling', type: 'pillar', pillar: null },
    { url: '/blog/alpha-guide', type: 'post', pillar: '/ai-nurse-scheduling' },
    { url: '/blog/beta-notes', type: 'post', pillar: '/ai-nurse-scheduling' },
  ];
  const pair = I.falseAlarmOf({
    query: 'nurse scheduling',
    pages: ['/blog/alpha-guide', '/ai-nurse-scheduling'],
    brands: [],
    registry,
  });
  assert.equal(pair.likelyFalseAlarm, true);
  assert.match(pair.falseAlarmReason, /pillar/i);
  // Two posts of the same pillar compete with each other: that is a real split.
  const siblings = I.falseAlarmOf({
    query: 'nurse scheduling',
    pages: ['/blog/alpha-guide', '/blog/beta-notes'],
    brands: [],
    registry,
  });
  assert.equal(siblings.likelyFalseAlarm, false);
  assert.equal(siblings.falseAlarmReason, null);
  for (const t of [pair.falseAlarmReason]) {
    assert.doesNotMatch(t, /[–—]/);
    assert.match(t, /\b(may|likely|probably)\b/i, 'it is a likely, not a certain');
  }
});

test('a pillar and its own post sharing a search is flagged on the route', async () => {
  const dir = path.join(root, 'pillar');
  fs.mkdirSync(dir, { recursive: true });
  writeSnap(dir, 'gsc', gscData());
  writeSnap(dir, 'local', {
    ...localData(),
    registry: REGISTRY.map((r) =>
      r.slug === 'beta-notes'
        ? { ...r, type: 'pillar' }
        : r.slug === 'alpha-guide'
          ? { ...r, pillar: '/blog/beta-notes' }
          : r
    ),
  });
  use(dir);
  const it = (await get('/api/insights/cannibalization')).json.items.find((x) => x.query === 'shared topic phrase');
  assert.equal(it.likelyFalseAlarm, true);
  assert.match(it.falseAlarmReason, /pillar/i);
  use(FULL);
});

test('leave alone: accepted as a choice, drops out of the list, the count and the weekly proposal', async () => {
  use(FULL);
  const list = async () => (await get('/api/insights/cannibalization')).json;
  const before = await list();
  const it = before.items.find((x) => x.query === 'shared topic phrase');
  assert.deepEqual(before.leftAlone ?? [], []);
  const navBefore = (await get('/api/nav')).json.counts.cannibalization;
  assert.equal(navBefore, before.count);
  // The opportunity is on offer for the week before, so leaving it alone has something to remove.
  const opp = buildModel().opps.find((o) => o.type === 'competing-pages' && o.query === 'shared topic phrase');
  assert.ok(opp, 'the split search is an opportunity');

  const ok = await post_(`/api/insights/cannibalization/${it.id}/choice`, { choice: 'leave-alone' });
  assert.equal(ok.status, 200);
  assert.equal(ok.json.choice, 'leave-alone');
  const after = await list();
  assert.ok(!after.items.some((x) => x.id === it.id), 'it leaves the list');
  assert.equal(after.count, before.count - 1);
  assert.equal(after.count, after.items.length);
  const kept = after.leftAlone.find((x) => x.id === it.id);
  assert.ok(kept, 'it is kept in leftAlone so it can be put back');
  assert.equal(kept.choice, 'leave-alone');
  assert.match(kept.recommendation, /^Hypothesis:/);
  assert.equal((await get('/api/nav')).json.counts.cannibalization, navBefore - 1);
  assert.ok(!weekModel(buildModel()).proposed.some((c) => c.oppId === opp.id), 'not in the weekly proposal');

  await clearChoice(it.id);
  const back = await list();
  assert.ok(back.items.some((x) => x.id === it.id));
  assert.equal(back.count, before.count);
  assert.deepEqual(back.leftAlone, []);
});

// ================================================================ task 6: the week

test('the week lists what to leave alone: frozen pages and searches marked leave alone', async () => {
  use(FULL);
  assert.deepEqual(weekView(buildModel()).leaveAlone, []);
  freezeAlpha();
  const it = (await get('/api/insights/cannibalization')).json.items.find((x) => x.query === 'shared topic phrase');
  await post_(`/api/insights/cannibalization/${it.id}/choice`, { choice: 'leave-alone' });
  try {
    const rows = weekView(buildModel()).leaveAlone;
    assert.deepEqual(Object.keys(rows[0]).sort(), ['page', 'reason', 'until']);
    const frozen = rows.find((r) => r.reason.startsWith('Edited on'));
    assert.deepEqual(frozen, {
      page: '/blog/alpha-guide',
      reason: 'Edited on 5 November, being measured until 3 December.',
      until: '2026-12-03',
    });
    const split = rows.filter((r) => /shared topic phrase/.test(r.reason));
    assert.deepEqual(split.map((r) => r.page).sort(), ['/blog/alpha-guide', '/blog/beta-notes']);
    assert.ok(split.every((r) => r.until === null && /leave alone/i.test(r.reason)));
    for (const r of rows) assert.doesNotMatch(r.reason, /[–—]/);
  } finally {
    unfreeze();
    await clearChoice(it.id);
  }
});

test('planSize 3 gives three cards in the recipe order and never two page edits; the default is 5', async () => {
  use(FULL);
  const five = weekView(buildModel());
  assert.equal(five.planSize, 5);
  assert.equal(five.top5.length, 5);
  const saved = changeSettings({ planSize: 3 });
  assert.equal(saved.planSize, 3);
  try {
    const three = weekView(buildModel());
    assert.equal(three.planSize, 3);
    assert.equal(three.top5.length, 3);
    assert.deepEqual(
      three.top5.map((c) => c.id),
      five.top5.slice(0, 3).map((c) => c.id),
      'the first three of the five, in the same order'
    );
    assert.ok(three.top5.filter((c) => c.isPageEdit).length <= 1, 'never two page edits');
    assert.equal(store.readJson('state/settings.json', {}).planSize, 3);
    // An unrelated change keeps it.
    changeSettings({ paused: false });
    assert.equal(weekView(buildModel()).planSize, 3);
  } finally {
    changeSettings({ planSize: 5 });
  }
  assert.equal(weekView(buildModel()).top5.length, 5);
  assert.throws(() => changeSettings({ planSize: 4 }), /3 or 5/);
  assert.throws(() => changeSettings({ planSize: '3' }), /3 or 5/);
});

test('proposeTop5 with a size fills that many slots and never two page edits', async () => {
  const { proposeTop5 } = await import('../lib/week.mjs');
  const opp = (id, isPageEdit, score) => ({
    id,
    type: 'near-page-one',
    page: `/p/${id}`,
    title: id,
    measured: 'm',
    action: 'a',
    isPageEdit,
    score,
  });
  const ranked = [
    opp('e1', true, 9),
    opp('e2', true, 8),
    opp('o1', false, 7),
    opp('o2', false, 6),
    opp('o3', false, 5),
  ];
  const args = { ranked, frozen: new Map(), items: {}, today: '2026-11-10', due: [], worries: [], openWork: [] };
  const full = proposeTop5(args);
  const three = proposeTop5({ ...args, size: 3 });
  assert.equal(three.length, 3);
  assert.deepEqual(
    three.map((c) => c.id),
    full.slice(0, 3).map((c) => c.id)
  );
  assert.ok(three.filter((c) => c.isPageEdit).length <= 1);
  assert.equal(proposeTop5({ ...args, size: 5 }).length, full.length);
});

// ================================================================ task 6: secondary keywords and the map

// A small site made for these rules: every search below is invented, and each one tests one condition.
const SEC = path.join(root, 'sec');
fs.mkdirSync(SEC, { recursive: true });
const SEC_REGISTRY = [
  { slug: 'alpha-guide', type: 'post', url: '/blog/alpha-guide', primaryKeyword: 'float pool coverage' },
  { slug: 'beta-notes', type: 'post', url: '/blog/beta-notes', primaryKeyword: 'overtime rules nurses' },
  { slug: 'gamma-tips', type: 'post', url: '/blog/gamma-tips', primaryKeyword: 'night shift differential pay' },
  { slug: 'pricing', type: 'money', url: '/pricing', primaryKeyword: 'pricing target phrase' },
  // a target whose page is not live (a draft): it must never create a conflict
  { slug: 'draft-swaps', type: 'post', url: '/blog/draft-swaps', primaryKeyword: 'night swap rota' },
];
const SEC_QP = [
  // alpha-guide: its own target is a small search, so the busiest search seeds the topic
  qp('float pool coverage', '/blog/alpha-guide', 20, 6, 3),
  qp('float pool staffing policy', '/blog/alpha-guide', 80, 9, 6),
  qp('float pool nurse pay', '/blog/alpha-guide', 60, 12, 4),
  qp('staffing policy rules', '/blog/alpha-guide', 45, 15, 2), // shares no word with the target; same topic
  qp('float pool cost', '/blog/alpha-guide', 35, 31, 0), // a fourth: over the limit of three, and past page two
  qp('float pool coverage cost', '/blog/alpha-guide', 34, 31, 0), // a more specific variant of the target
  qp('coverage float pool', '/blog/alpha-guide', 31, 33, 0), // the target's words in another order
  qp('float pool', '/blog/alpha-guide', 40, 25, 0), // a broader head term
  qp('night swap rota guide', '/blog/epsilon-old', 40, 30, 0), // a variant of a target on a page that is not live
  qp('float pool template', '/blog/alpha-guide', 29, 14, 1), // under 30 views
  qp('simplescheduleai float pool', '/blog/alpha-guide', 70, 3, 9), // a brand search
  qp('night shift differential pay', '/blog/alpha-guide', 90, 8, 5), // the target of another page
  qp('guitar chord charts', '/blog/alpha-guide', 50, 35, 0), // shares nothing with the page
  qp('guitar chord shapes', '/blog/alpha-guide', 40, 36, 0),
  // beta-notes
  qp('overtime rules nurses', '/blog/beta-notes', 100, 7, 8),
  qp('overtime pay rules', '/blog/beta-notes', 40, 11, 3),
  // gamma-tips
  qp('night shift differential pay', '/blog/gamma-tips', 70, 9, 5),
  qp('shift differential', '/blog/gamma-tips', 30, 14, 1), // exactly 30 views
  // a page with no target keyword of its own
  qp('weekend coverage pay', '/blog/epsilon-old', 60, 10, 2),
  // pricing
  qp('pricing target phrase', '/pricing', 50, 12, 2),
];
const SEC_LIVE = ['/', '/pricing', '/blog/alpha-guide', '/blog/beta-notes', '/blog/gamma-tips', '/blog/epsilon-old'];
writeSnap(SEC, 'gsc', {
  ...gscData(),
  pageDaily: [],
  qpCur: SEC_QP,
  qp90: SEC_QP,
  queryCur: [],
  queryPrev: [],
});
writeSnap(SEC, 'local', {
  ...localData(),
  registry: SEC_REGISTRY,
  livePages: SEC_LIVE.map((page) => ({ page, lastmod: '2026-10-01' })),
});
const useSec = () => {
  use(SEC);
  store.writeJson('state/items.json', {});
  store.writeJson('state/targets.json', { adopted: [], ignored: [], priorities: {} });
  unfreeze();
  invalidate();
};
const secItems = async () => (await get('/api/insights/secondary-keywords')).json;
const secOf = (r, query, page) => r.items.find((x) => x.query === query && (!page || x.page === page));

test('secondary keywords: the shape, the heading and one item per search a page shows for but does not target', async () => {
  useSec();
  const r = await secItems();
  assert.equal(r.term, 'Secondary keywords');
  assert.equal(r.explain, 'Searches a page already appears for but does not target.');
  assert.equal(r.count, r.items.length);
  const it = secOf(r, 'float pool staffing policy');
  assert.deepEqual(Object.keys(it).sort(), [
    'adopted',
    'brief',
    'eligibility',
    'evidence',
    'explain',
    'frozenUntil',
    'frozenUntilText',
    'id',
    'impressions',
    'page',
    'position',
    'priority',
    'query',
    'recommendation',
    'state',
    'targetKeyword',
    'term',
    'test',
  ]);
  assert.equal(it.page, '/blog/alpha-guide');
  assert.equal(it.impressions, 80);
  assert.equal(it.position, 9);
  assert.equal(it.targetKeyword, 'float pool coverage');
  assert.equal(
    it.evidence,
    '/blog/alpha-guide is already shown 80 times for "float pool staffing policy" at an average place of 9, but the page does not target it.'
  );
  assert.match(it.recommendation, /^Hypothesis:/);
  assert.match(it.recommendation, /\bmay\b/);
  assert.doesNotMatch(it.recommendation, /\bwill\b/);
  assert.ok(it.test.length > 20);
  assert.equal(it.state.status, 'new');
  assert.deepEqual(it.eligibility, { eligible: true, from: null, page: null, text: 'Eligible now' });
  assert.equal(it.frozenUntil, null);
  assert.equal(it.adopted, false);
  assert.ok(it.id);
  for (const x of r.items) for (const t of [x.evidence, x.recommendation, x.test]) assert.doesNotMatch(t, /[–—]/);
});

test('secondary keywords: under 30 views, a brand search, a search another page targets and the page own target are left out', async () => {
  useSec();
  const r = await secItems();
  const queries = r.items.map((x) => x.query);
  assert.ok(!queries.includes('float pool template'), 'under 30 views (29)');
  assert.ok(!queries.includes('simplescheduleai float pool'), 'a brand search');
  assert.ok(!queries.includes('night shift differential pay'), 'a target of another page');
  assert.ok(!queries.includes('float pool coverage'), 'the page own target');
  assert.ok(!queries.includes('overtime rules nurses'));
  assert.ok(queries.includes('shift differential'), 'exactly 30 views counts');
  assert.ok(queries.includes('staffing policy rules'), 'same topic as the target, with no word in common');
  assert.ok(queries.includes('overtime pay rules'), 'shares a word with the target');
  assert.ok(!queries.some((q) => /guitar/.test(q)), 'unrelated to the target');
  assert.ok(!queries.includes('weekend coverage pay'), 'a page with no target keyword has nothing to be secondary to');
});

test('secondary keywords: at most three a page, busiest first', async () => {
  useSec();
  const r = await secItems();
  const alpha = r.items.filter((x) => x.page === '/blog/alpha-guide');
  assert.deepEqual(
    alpha.map((x) => x.query),
    ['float pool staffing policy', 'float pool nurse pay', 'staffing policy rules']
  );
  assert.ok(!alpha.some((x) => x.query === 'float pool cost'), 'the fourth is cut');
  const impressions = r.items.map((x) => x.impressions);
  assert.deepEqual(
    impressions,
    [...impressions].sort((a, b) => b - a),
    'ranked by views'
  );
});

test('secondary keywords: adopting stores it in targets.json and never touches the like for like figure', async () => {
  useSec();
  const it = secOf(await secItems(), 'float pool staffing policy');
  const likeBefore = JSON.stringify(searchView(buildModel(), { days: 28 }).likeForLike);
  const tileBefore = JSON.stringify((await get('/api/overview')).json.tiles.find((t) => t.key === 'targetPosition'));
  const targetsBefore = buildModel().targets.length;

  const r = await post_(`/api/insights/secondary-keywords/${it.id}`, { action: 'adopt' });
  assert.equal(r.status, 200);
  assert.equal(r.json.ok, true);
  const saved = store.readJson('state/targets.json', {});
  assert.deepEqual(saved.secondary, [
    { keyword: 'float pool staffing policy', page: '/blog/alpha-guide', addedOn: '2026-11-10' },
  ]);
  assert.deepEqual(saved.adopted, [], 'it is not an adopted target');
  assert.equal(JSON.stringify(searchView(buildModel(), { days: 28 }).likeForLike), likeBefore);
  assert.equal(
    JSON.stringify((await get('/api/overview')).json.tiles.find((t) => t.key === 'targetPosition')),
    tileBefore
  );
  assert.equal(buildModel().targets.length, targetsBefore, 'the targets list is unchanged');
  assert.equal(secOf(await secItems(), 'float pool staffing policy').adopted, true);
  // Adopting twice keeps one entry; the item stays open until it is done or dismissed.
  await post_(`/api/insights/secondary-keywords/${it.id}`, { action: 'adopt' });
  assert.equal(store.readJson('state/targets.json', {}).secondary.length, 1);
  // The other targets state survives a keyword adopted the usual way.
  const keep = await post_('/api/targets/adopt', {
    items: [{ keyword: 'weekend coverage pay', page: '/blog/epsilon-old' }],
  });
  assert.equal(keep.status, 200);
  assert.equal(store.readJson('state/targets.json', {}).secondary.length, 1, 'the secondary list is kept');
});

test('secondary keywords: dismiss, reopen and the id check', async () => {
  useSec();
  const it = secOf(await secItems(), 'overtime pay rules');
  assert.equal((await post_(`/api/insights/secondary-keywords/${it.id}`, { action: 'explode' })).status, 400);
  assert.equal((await post_('/api/insights/secondary-keywords/nope', { action: 'adopt' })).status, 404);
  const before = (await secItems()).count;
  const gone = await post_(`/api/insights/secondary-keywords/${it.id}`, { action: 'dismiss' });
  assert.equal(gone.status, 200);
  assert.equal(buildModel().items[it.id].status, 'ignored');
  assert.equal((await secItems()).count, before - 1);
  assert.equal((await get('/api/nav')).json.counts.secondaryKeywords, before - 1);
  await post_(`/api/insights/secondary-keywords/${it.id}`, { action: 'reopen' });
  assert.equal((await secItems()).count, before);
});

test('secondary keywords: done is a page edit, so it freezes the page and a frozen page is not eligible', async () => {
  useSec();
  const r = await secItems();
  const a = secOf(r, 'float pool staffing policy');
  const done = await post_(`/api/insights/secondary-keywords/${a.id}`, { action: 'done' });
  assert.equal(done.status, 200);
  assert.equal(buildModel().frozen.get('/blog/alpha-guide').until, '2026-12-08', 'edited today, frozen 28 days');
  const after = await secItems();
  assert.ok(!secOf(after, 'float pool staffing policy'), 'a finished item leaves the list');
  // The page stays frozen, so its other items say when they become eligible.
  const other = secOf(after, 'float pool nurse pay');
  assert.equal(other.eligibility.eligible, false);
  assert.equal(other.eligibility.from, '2026-12-08');
  assert.equal(other.eligibility.page, '/blog/alpha-guide');
  assert.match(other.eligibility.text, /^Eligible from 8 December/);
  assert.equal(other.frozenUntil, '2026-12-08');
  assert.equal(other.frozenUntilText, '8 December');
  // A page that is not frozen is eligible.
  assert.equal(secOf(after, 'overtime pay rules').eligibility.eligible, true);
  // Another page edit this week needs an override: the rule is one a week.
  const second = secOf(after, 'overtime pay rules');
  const refused = await post_(`/api/insights/secondary-keywords/${second.id}`, { action: 'done' });
  assert.equal(refused.status, 409);
  assert.match(refused.error, /one a week/);
  assert.equal(
    (await post_(`/api/insights/secondary-keywords/${second.id}`, { action: 'done', override: true })).status,
    200
  );
  // Dismissing and adopting are not page edits, so they are never refused.
  const third = secOf(await secItems(), 'float pool nurse pay');
  assert.equal((await post_(`/api/insights/secondary-keywords/${third.id}`, { action: 'adopt' })).status, 200);
  assert.equal((await post_(`/api/insights/secondary-keywords/${third.id}`, { action: 'dismiss' })).status, 200);
});

test('secondary keywords: a frozen page from an edit note is not eligible either', async () => {
  useSec();
  freezeAlpha();
  try {
    const it = secOf(await secItems(), 'float pool staffing policy');
    assert.equal(it.eligibility.eligible, false);
    assert.equal(it.eligibility.from, '2026-12-03');
    assert.equal(it.frozenUntil, '2026-12-03');
  } finally {
    unfreeze();
  }
});

// ---------------------------------------------------------------- keyword map additions

test('keyword map: source, monthly searches, live or pending, and no difficulty anywhere', async () => {
  useSec();
  store.writeJson('state/targets.json', {
    adopted: [
      {
        keyword: 'weekend coverage pay',
        page: '/blog/epsilon-old',
        source: 'import',
        volume: 1900,
        addedOn: '2026-11-01',
      },
      { keyword: 'night nurse ratios', page: '/blog/not-live', source: 'discovered', addedOn: '2026-11-01' },
    ],
    ignored: [],
    priorities: {},
  });
  invalidate();
  const r = (await get('/api/keyword-map/table')).json;
  const by = (k) => r.rows.find((x) => x.keyword === k);
  assert.deepEqual(by('float pool coverage').source, ['file', 'search-console']);
  assert.equal(by('float pool coverage').volume, null, 'no import supplied a volume');
  assert.equal(by('float pool coverage').status, 'live');
  assert.deepEqual(by('weekend coverage pay').source, ['import', 'search-console']);
  assert.equal(by('weekend coverage pay').volume, 1900);
  assert.deepEqual(by('night nurse ratios').source, [], 'a keyword Search Console has not returned and no file gave');
  assert.equal(by('night nurse ratios').status, 'pending', 'its page is not live');
  assert.equal(by('float pool staffing policy').status, 'pending', 'unmapped is pending');
  assert.deepEqual(by('float pool staffing policy').source, ['search-console']);
  assert.equal(by('float pool staffing policy').volume, null);
  assert.equal(by('float pool staffing policy').kind, 'discovered');
  assert.ok(r.rows.every((x) => ['live', 'pending'].includes(x.status)));
  assert.ok(r.rows.every((x) => x.volume === null || typeof x.volume === 'number'));
  assert.equal(r.counters.live + r.counters.pending, r.counters.all);
  assert.doesNotMatch(JSON.stringify(r), /difficult/i, 'keyword difficulty is never sent');
  for (const row of r.rows) for (const k of Object.keys(row)) assert.doesNotMatch(k, /difficult|\bkd\b/i);
});

test('an import keeps the monthly searches and never stores a keyword difficulty', async () => {
  useSec();
  const csv =
    'Keyword,URL,Volume,Keyword Difficulty,Priority\n' +
    '"staffing policy rules",/blog/alpha-guide,"2,400",35,high\n' +
    'weekend shift swaps,/blog/beta-notes,880,12,\n' +
    'a keyword with no volume,/blog/gamma-tips,,48,\n';
  const r = await call('POST', '/api/targets/import', {}, csv);
  assert.equal(r.status, 200);
  assert.equal(r.json.imported, 3);
  const saved = store.readJson('state/targets.json', {});
  assert.doesNotMatch(JSON.stringify(saved), /difficult/i);
  const by = (k) => saved.adopted.find((a) => a.keyword === k);
  assert.equal(by('staffing policy rules').volume, 2400);
  assert.equal(by('weekend shift swaps').volume, 880);
  assert.equal(by('a keyword with no volume').volume, null);
  assert.equal(by('staffing policy rules').source, 'import');
  const table = (await get('/api/keyword-map/table')).json;
  assert.equal(table.rows.find((x) => x.keyword === 'staffing policy rules').volume, 2400);
  assert.deepEqual(table.rows.find((x) => x.keyword === 'staffing policy rules').source, ['import', 'search-console']);
  assert.doesNotMatch(JSON.stringify(table), /difficult/i);
});

test('cluster conflict: the same or a more specific variant of a live page target, labelled a hypothesis', async () => {
  useSec();
  const r = (await get('/api/keyword-map/table')).json;
  const by = (k) => r.rows.find((x) => x.keyword === k);
  const hint =
    'Hypothesis: this may already be covered by /blog/alpha-guide, so it may be better added there as a section than written as a new page.';
  const c = by('float pool coverage cost').clusterConflict;
  assert.deepEqual(c, {
    page: '/blog/alpha-guide',
    keyword: 'float pool coverage',
    recommendation: hint,
    test: 'Judged by the 28-day before and after verdict if you add the section.',
  });
  assert.equal(by('coverage float pool').clusterConflict.page, '/blog/alpha-guide', 'the same words in another order');
  assert.equal(by('float pool').clusterConflict, null, 'a broader head term is not absorbed');
  assert.equal(by('float pool staffing policy').clusterConflict, null, 'same topic, but not a variant of the target');
  assert.equal(by('staffing policy rules').clusterConflict, null);
  assert.equal(by('float pool cost').clusterConflict, null, 'it lacks a word of the target');
  assert.equal(by('guitar chord charts').clusterConflict, null, 'unrelated');
  assert.equal(by('night swap rota guide').clusterConflict, null, 'the target page is not live');
  assert.equal(by('overtime pay rules').clusterConflict, null);
  assert.equal(by('float pool coverage').clusterConflict, null, 'a mapped keyword has none');
  assert.equal(r.counters.clusterConflicts, 2);
  // The list the Cannibalization page shows as "Planned keyword may already be covered".
  const cann = (await get('/api/insights/cannibalization')).json;
  assert.equal(cann.clusterConflicts.length, 2);
  const one = cann.clusterConflicts.find((x) => x.keyword === 'float pool coverage cost');
  assert.equal(one.page, '/blog/alpha-guide');
  assert.equal(one.targetKeyword, 'float pool coverage');
  assert.equal(one.recommendation, hint);
  assert.equal(one.test, 'Judged by the 28-day before and after verdict if you add the section.');
  for (const x of cann.clusterConflicts) assert.doesNotMatch(JSON.stringify(x), /[–—]/);
});

test('content gaps leave out a conflict, keep a broader search and a search on a draft page target', async () => {
  useSec();
  const model = buildModel();
  const unserved = (q) => model.opps.some((o) => o.type === 'unserved' && o.query === q);
  for (const q of [
    'float pool coverage cost',
    'coverage float pool',
    'float pool',
    'night swap rota guide',
    'guitar chord charts',
  ])
    assert.ok(unserved(q), `${q} is a gap candidate for the rules`);
  const gaps = (await get('/api/insights/content-gaps')).json;
  const inGaps = (q) => gaps.items.some((g) => g.searches.some((s) => s.query === q));
  assert.equal(inGaps('float pool coverage cost'), false, 'a section of the existing page');
  assert.equal(inGaps('coverage float pool'), false);
  assert.equal(inGaps('float pool'), true, 'a broader search stays a content gap');
  assert.equal(inGaps('float pool cost'), true, 'it lacks a word of the target');
  assert.equal(inGaps('night swap rota guide'), true, 'the draft page covers nothing yet');
  assert.equal(inGaps('guitar chord charts'), true);
  assert.equal(gaps.count, gaps.items.length);
  assert.equal((await get('/api/nav')).json.counts.contentGaps, gaps.count);
  const guitar = gaps.items.find((g) => g.searches.some((s) => s.query === 'guitar chord charts'));
  assert.equal(
    (await post_(`/api/insights/content-gaps/${guitar.id}`, { action: 'ignore', reason: 'not ours' })).status,
    200
  );
  assert.equal((await post_(`/api/insights/content-gaps/${guitar.id}`, { action: 'reopen' })).status, 200);
});

test('the keyword map CSV keeps its columns and adds the new ones at the end', async () => {
  useSec();
  const r = await get('/api/export/keyword-map.csv');
  const head = r.text.split('\r\n')[0];
  assert.match(
    head,
    /^keyword,status,mapped_to_page,origin,position,impressions,ranking_page,flags,kind,source,monthly_searches,may_be_covered_by$/
  );
  const rows = r.text.trim().split('\r\n').slice(1);
  assert.ok(
    rows.some((l) => l.includes(',live,')) && rows.some((l) => l.includes(',pending,')),
    'status is live or pending'
  );
  assert.ok(
    rows.some((l) => l.includes(',targeted,')) && rows.some((l) => l.includes(',discovered,')),
    'kind is targeted or discovered'
  );
  assert.doesNotMatch(r.text, /difficult/i);
});

// ================================================================ fix round 1

test('leave alone leaks nowhere: not the week list, not Opportunities, not the sidebar count', async () => {
  use(FULL);
  const opp = buildModel().opps.find((o) => o.type === 'competing-pages' && o.query === 'shared topic phrase');
  const it = (await get('/api/insights/cannibalization')).json.items.find((x) => x.query === 'shared topic phrase');
  const listed = () => opportunitiesList(buildModel());
  const before = {
    week: weekView(buildModel()),
    list: listed(),
    nav: (await get('/api/nav')).json.counts.opportunities,
  };
  const inWeek = (w) => w.top5.some((c) => c.oppId === opp.id) || w.opportunities.some((o) => o.id === opp.id);
  assert.ok(inWeek(before.week), 'before: it is on the week page');
  assert.ok(
    before.list.items.some((o) => o.id === opp.id),
    'before: it is in Opportunities'
  );

  await post_(`/api/insights/cannibalization/${it.id}/choice`, { choice: 'leave-alone' });
  try {
    const w = weekView(buildModel());
    assert.equal(inWeek(w), false, 'not in the week five or the week opportunities');
    assert.equal(w.counts.openOpportunities, before.week.counts.openOpportunities - 1);
    const l = listed();
    assert.ok(!l.items.some((o) => o.id === opp.id), 'not in Opportunities');
    assert.equal(l.counts.byType['competing-pages'], before.list.counts.byType['competing-pages'] - 1);
    assert.equal((await get('/api/nav')).json.counts.opportunities, before.nav - 1);
    // Still reachable where it can be undone.
    assert.ok((await get('/api/insights/cannibalization')).json.leftAlone.some((x) => x.id === it.id));
  } finally {
    await clearChoice(it.id);
  }
  assert.equal((await get('/api/nav')).json.counts.opportunities, before.nav);
  assert.ok(
    listed().items.some((o) => o.id === opp.id),
    'back after the choice is cleared'
  );
});

test('planSize is loaded with the settings: default 5, saved 3, and a bad saved value reads 5', () => {
  use(FULL);
  store.writeJson('state/settings.json', {});
  invalidate();
  assert.equal(loadSettings().planSize, 5);
  assert.equal(buildModel().settings.planSize, 5);
  assert.equal(changeSettings({ planSize: 3 }).planSize, 3);
  assert.equal(loadSettings().planSize, 3);
  assert.equal(buildModel().settings.planSize, 3);
  changeSettings({ paused: false });
  assert.equal(loadSettings().planSize, 3, 'an unrelated change keeps it');
  store.writeJson('state/settings.json', { planSize: 4 });
  invalidate();
  assert.equal(loadSettings().planSize, 5);
  changeSettings({ planSize: 5 });
});

// ================================================================ final wave

test('a retry is counted in memory when the state file cannot be written, so it never comes round every tick', async (t) => {
  const dir = freshDir();
  store.writeJson('state/refresh.json', {
    retries: { gsc: { day: dayOf(T0), count: 0, nextAt: at(0).toISOString() } },
  });
  store.writeJson('snap/gsc.json', { source: 'gsc', ok: false, status: 'failed', pulledAt: null, data: {} });
  const failing = pullers({ failing: ['gsc'] });
  // The state folder becomes read only: every write of the retry book fails from here on.
  fs.chmodSync(path.join(dir, 'state'), 0o555);
  t.after(() => fs.chmodSync(path.join(dir, 'state'), 0o755));
  assert.deepEqual(refresh.retryFailed({ pullers: failing.map, now: () => at(1) }), ['gsc']);
  await settle();
  assert.equal(store.readJson('state/refresh.json').retries.gsc.count, 0, 'the file could not take the count');
  assert.deepEqual(
    refresh.retryFailed({ pullers: failing.map, now: () => at(11) }),
    [],
    'the next tick starts nothing'
  );
  assert.deepEqual(refresh.dueRetries({ now: at(15), pullers: failing.map }), []);
  // The book in memory still schedules the next try 20 minutes after the failed one.
  assert.deepEqual(refresh.dueRetries({ now: at(25), pullers: failing.map }), ['gsc']);
  const row = refresh.sourceStatus({ now: at(5).getTime() }).find((x) => x.source === 'gsc');
  assert.ok(row.retryAt > at(1).toISOString(), 'the source row shows the retry the book holds');
});

test('a full run is dated on the run clock, so the schedule never reruns it for a day the real clock disagrees on', async () => {
  freshDir();
  const idle = pullers();
  await refreshAll({ pullers: idle.map, now: () => at(0) });
  assert.equal(store.readJson('state/refresh.json').lastFullRunAt, at(0).toISOString());
});

// ---------------------------------------------------------------- the sidebar counts equal their pages

// alpha-guide says nothing about its own target; for these tests epsilon-old briefly does, so the
// Internal links page has suggestions to count. Restored afterwards.
const EPS = path.join(REPO, 'src/data/post', 'epsilon-old.md');
async function withLinkText(fn) {
  const before = fs.readFileSync(EPS, 'utf8');
  fs.writeFileSync(EPS, `${before}\nSee our alpha target phrase notes and the gamma target phrase list.\n`);
  invalidate();
  try {
    await fn();
  } finally {
    fs.writeFileSync(EPS, before);
    store.writeJson('state/link-suggestions.json', {});
    invalidate();
  }
}

test('Internal links: the sidebar counts the open link suggestions the page lists, and a Done lowers both', async () => {
  use(FULL);
  await withLinkText(async () => {
    const view = (await get('/api/link-suggestions')).json;
    const listed = view.pages.flatMap((p) => p.suggestions);
    assert.ok(listed.length >= 2, 'the fixture gives suggestions');
    assert.equal(view.open, listed.filter((x) => x.status !== 'done').length);
    assert.equal((await get('/api/nav')).json.counts.internalLinks, view.open, 'sidebar equals the page');
    const first = listed[0];
    assert.equal(
      (await post_('/api/link-suggestions', { to: first.to, from: first.from, status: 'done' })).status,
      200
    );
    const after = (await get('/api/link-suggestions')).json;
    assert.equal(after.open, view.open - 1);
    assert.equal((await get('/api/nav')).json.counts.internalLinks, after.open);
    await post_('/api/link-suggestions', { to: first.to, from: first.from, status: 'dismissed' });
    const gone = (await get('/api/link-suggestions')).json;
    assert.ok(!gone.pages.flatMap((p) => p.suggestions).some((x) => x.from === first.from && x.to === first.to));
    assert.equal((await get('/api/nav')).json.counts.internalLinks, gone.open, 'a dismissed one is not counted');
  });
});

test('Internal links cards carry the page titles from the posts, and null when the desk knows none', async () => {
  use(FULL);
  await withLinkText(async () => {
    const view = (await get('/api/link-suggestions')).json;
    const s = view.pages.flatMap((p) => p.suggestions).find((x) => x.from === '/blog/epsilon-old');
    assert.ok(s);
    assert.equal(s.fromTitle, 'epsilon-old', 'the front matter title');
    assert.ok('toTitle' in s);
    for (const p of view.pages) assert.ok('title' in p);
    assert.equal(view.pages.find((p) => p.page === '/pricing')?.title ?? null, null, 'no post file: no title');
  });
});

test('All opportunities: one definition of open, and each insight tab shows the sidebar number in its unit', async () => {
  use(FULL);
  const model = buildModel();
  const nav = navCounts(model);
  const open = opportunitiesView(model, { status: 'open' }, { insightCounts: nav });
  assert.equal(open.items.length, nav.opportunities, 'the Open view lists the sidebar count');
  assert.equal(open.counts.byStatus.open, nav.opportunities);
  assert.ok(open.items.every((o) => ['new', 'in-progress', 'came-back'].includes(o.status)));
  const tab = (type) => open.types.find((t) => t.type === type);
  for (const [type, key] of [
    ['unserved', 'contentGaps'],
    ['competing-pages', 'cannibalization'],
    ['near-page-one', 'runnerUp'],
    ['slipping', 'decay'],
  ]) {
    assert.equal(tab(type).insightCount, nav[key], `${type} tab = sidebar ${key}`);
    assert.equal(tab(type).openRows, open.counts.byType[type]);
  }
  // A content gap is several searches: the tab says so in plain words.
  const gaps = tab('unserved');
  assert.deepEqual(gaps.unit, ['gap', 'gaps']);
  assert.match(gaps.countNote, /^\d+ gaps? on the Content gaps page, listed here as \d+ search(es)?\.$/);
  assert.equal(tab('question').insightCount, null, 'a type with no page of its own');
  // F2: every type carries its plain sentence.
  for (const t of open.types) assert.ok(t.term && t.explain, `${t.type} explains itself`);
  assert.equal(tab('competing-pages').explain, 'Two of your pages are competing for the same search.');
});

test('content gaps: each card carries its recommendation, test and brief from the server, and why each link page is listed', async () => {
  use(FULL);
  const gap = (await get('/api/insights/content-gaps')).json.items.find(
    (x) => x.title === 'Float pool staffing policy'
  );
  assert.match(gap.recommendation, /^Hypothesis: .* may /);
  assert.ok(gap.test);
  assert.match(gap.brief, /^Task for the SimpleScheduleAI website: Write a new post: Float pool staffing policy/);
  assert.match(gap.brief, /Recommendation \(a hypothesis\): A new page/);
  assert.match(gap.brief, /publish-pipeline\.md/);
  assert.match(gap.brief, /draft: true/);
  assert.doesNotMatch(gap.brief, /Hypothesis:/);
  for (const l of gap.linkFrom) assert.ok(l.reasonText && /\.$/.test(l.reasonText));
});

test('priorities and briefs come from the server on every insight list', async () => {
  use(FULL);
  const can = (await get('/api/insights/cannibalization')).json;
  assert.ok(can.items.length && can.items.every((it) => ['high', 'medium', 'low'].includes(it.priority)));
  assert.ok(can.priorityNote);
  const it = can.items.find((x) => x.query === 'shared topic phrase');
  assert.match(it.measured, /^"shared topic phrase" was shown 80 times from .+, split across 2 of our pages\./);
  assert.match(it.brief, /Recommendation \(a hypothesis\): /);
  assert.match(it.brief, /Page: \/blog\/alpha-guide/);
  for (const c of can.clusterConflicts) assert.ok(['high', 'medium', 'low'].includes(c.priority));
  const decay = (await get('/api/insights/decay')).json;
  assert.ok(
    decay.items.every((o) => o.priority && o.brief.includes(o.recommendation.replace(/^Hypothesis: /, '').slice(1, 30)))
  );
  assert.match(decay.recentDropNote, /14 days .*30%.*50 views/);
  useSec();
  const sec = await secItems();
  assert.ok(sec.items.every((x) => x.priority && /^Task for the SimpleScheduleAI website: Work "/.test(x.brief)));
  for (const text of [JSON.stringify(can), JSON.stringify(decay), JSON.stringify(sec)])
    assert.doesNotMatch(text, /Suggested action|[–—]/);
});

test('decay sends the true totals behind lists that stop at 50, and says so', async () => {
  const big = path.join(root, 'decay-big');
  fs.mkdirSync(big, { recursive: true });
  const rows = pageDaily();
  for (let i = 0; i < 60; i++)
    for (const date of dates('2026-07-15', THROUGH))
      rows.push({ date, page: `/blog/invented-${i}`, clicks: 0, impressions: date >= CUR.start ? 2 : 10, position: 9 });
  writeSnap(big, 'gsc', { ...gscData(), pageDaily: rows });
  writeSnap(big, 'local', localData());
  use(big);
  const r = (await get('/api/insights/decay')).json;
  assert.equal(r.pages.decaying.length, 50);
  assert.ok(r.totals.pages.decaying > 50);
  assert.equal(r.shownMax, 50);
  assert.equal(r.shownText.pages.decaying, `Showing the first 50 of ${r.totals.pages.decaying} decaying pages.`);
  assert.equal(r.shownText.pages.growing, null);
  assert.equal(r.totals.pages.growing, r.pages.growing.length);
  use(FULL);
});

// ---------------------------------------------------------------- the one edit a week rule on a split

test('cannibalization Done checks and freezes every page the chosen action edits', async () => {
  use(FULL);
  const it = (await get('/api/insights/cannibalization')).json.items.find((x) => x.query === 'shared topic phrase');
  const choose = (choice) => post_(`/api/insights/cannibalization/${it.id}/choice`, { choice });
  const reset = () => {
    store.writeJson('state/items.json', {});
    invalidate();
  };
  fs.writeFileSync(
    NOTES,
    `${JSON.stringify({ date: '2026-11-08', slug: 'beta-notes', text: 'Edit: new heading.', source: 'manual' })}\n`
  );
  invalidate();
  try {
    // Consolidate edits both pages: the frozen one is named in the refusal.
    await choose('consolidate');
    let err = null;
    try {
      itemAction(it.id, { action: 'done' });
    } catch (e) {
      err = e;
    }
    assert.equal(err?.status, 409);
    assert.equal(err.extra.frozen.page, '/blog/beta-notes');
    assert.deepEqual(
      err.extra.frozenPages.map((f) => f.page),
      ['/blog/beta-notes']
    );
    assert.equal(err.extra.secondThisWeek, undefined, 'the edit note was last week');
    const out = itemAction(it.id, { action: 'done', override: true });
    assert.deepEqual(
      out.freezes.map((f) => f.page),
      ['/blog/alpha-guide', '/blog/beta-notes']
    );
    const frozen = buildModel().frozen;
    assert.equal(frozen.get('/blog/alpha-guide').since, '2026-11-10');
    assert.equal(frozen.get('/blog/beta-notes').since, '2026-11-10', 'the folded page is frozen too');
    reset();

    // Differentiate with no page named records no page edit: nothing is frozen, nothing is refused.
    await choose('differentiate');
    const none = itemAction(it.id, { action: 'done' });
    assert.equal(none.freeze, undefined);
    assert.equal(buildModel().frozen.has('/blog/alpha-guide'), false);
    itemAction(it.id, { action: 'reopen' });
    // Naming the page whose angle changed freezes that page only (after the usual checks).
    assert.throws(() => itemAction(it.id, { action: 'done', page: '/blog/gamma-tips' }), /not one of the pages/);
    const one = itemAction(it.id, { action: 'done', page: '/blog/alpha-guide', override: true });
    assert.deepEqual(
      one.freezes.map((f) => f.page),
      ['/blog/alpha-guide']
    );
    reset();

    // No choice: the page that should win, as before.
    await choose(null);
    const plainDone = itemAction(it.id, { action: 'done', override: true });
    assert.deepEqual(
      plainDone.freezes.map((f) => f.page),
      ['/blog/alpha-guide']
    );
  } finally {
    await choose(null);
    reset();
    unfreeze();
  }
});

test('secondary keywords: a Done refused by the rule carries the same fields as any page edit; a finished one says Reopen first', async () => {
  useSec();
  const r = await secItems();
  const it = r.items[0];
  fs.writeFileSync(
    NOTES,
    `${JSON.stringify({ date: '2026-11-09', slug: it.page.split('/').pop(), text: 'Edit: new intro.', source: 'manual' })}\n`
  );
  invalidate();
  try {
    const refused = await post_(`/api/insights/secondary-keywords/${it.id}`, { action: 'done' });
    assert.equal(refused.status, 409);
    assert.equal(refused.extra.frozen.page, it.page);
    assert.equal(refused.extra.secondThisWeek.page, it.page);
    await post_(`/api/insights/secondary-keywords/${it.id}`, { action: 'dismiss' });
    const finished = await post_(`/api/insights/secondary-keywords/${it.id}`, { action: 'done' });
    assert.equal(finished.status, 409);
    assert.equal(finished.extra, null, 'a plain refusal: no one-edit fields');
    assert.match(finished.error, /Reopen first/);
  } finally {
    await post_(`/api/insights/secondary-keywords/${it.id}`, { action: 'reopen' });
    unfreeze();
  }
});

test('secondary keywords: a done or dismissed one is listed under finished, newest first, and can be reopened', async () => {
  useSec();
  const r = await secItems();
  assert.deepEqual(r.finished, []);
  const [a, b] = r.items;
  try {
    assert.equal(
      (await post_(`/api/insights/secondary-keywords/${a.id}`, { action: 'done', override: true })).status,
      200
    );
    assert.equal((await post_(`/api/insights/secondary-keywords/${b.id}`, { action: 'dismiss' })).status, 200);
    const after = await secItems();
    assert.ok(!after.items.some((x) => x.id === a.id || x.id === b.id), 'out of the open list');
    assert.deepEqual(after.finished.map((x) => x.id).sort(), [a.id, b.id].sort());
    assert.equal(after.finished.find((x) => x.id === a.id).state.status, 'done');
    assert.equal(after.finished.find((x) => x.id === b.id).state.status, 'ignored');
    assert.equal(after.count, after.items.length);
    assert.equal((await post_(`/api/insights/secondary-keywords/${a.id}`, { action: 'reopen' })).status, 200);
    const back = await secItems();
    assert.ok(back.items.some((x) => x.id === a.id));
    assert.equal(buildModel().frozen.has(a.page), false, 'reopening ends the freeze');
  } finally {
    for (const x of [a, b]) await post_(`/api/insights/secondary-keywords/${x.id}`, { action: 'reopen' });
  }
});

test('secondary keywords can be removed on the Keywords page, which lists them', async () => {
  useSec();
  const it = (await secItems()).items[0];
  await post_(`/api/insights/secondary-keywords/${it.id}`, { action: 'adopt' });
  const listed = (await get('/api/targets')).json;
  assert.equal(listed.counts.secondary, 1);
  assert.equal(listed.secondary[0].page, it.page);
  const removed = await call('DELETE', '/api/targets/secondary', {
    keyword: listed.secondary[0].keyword,
    page: it.page,
  });
  assert.equal(removed.status, 200);
  assert.equal((await get('/api/targets')).json.counts.secondary, 0);
  assert.equal(
    (await call('DELETE', '/api/targets/secondary', { keyword: 'nothing here', page: it.page })).status,
    404
  );
  assert.equal((await call('DELETE', '/api/targets/secondary', { keyword: 'x' })).status, 400);
});

// ---------------------------------------------------------------- minor items

test('GET /api/settings carries planSize', () => {
  use(FULL);
  assert.equal(settingsView(buildModel()).planSize, buildModel().settings.planSize);
});

test('overview: a range longer than the history held says what it covers, for the numbers and for Top pages', async () => {
  use(FULL);
  const r = (await get('/api/overview?range=480')).json;
  assert.equal(r.short, true);
  assert.equal(r.range.start, '2026-08-01', 'the first day the desk holds');
  assert.equal(r.range.text, '1 August to 7 November');
  assert.match(r.coverageNote, /^Showing 1 August to 7 November: all the daily history the desk has so far\.$/);
  assert.equal(r.series[0].date, r.range.start);
  assert.equal(r.pagesRange.start, '2026-07-15');
  const d28 = (await get('/api/overview?range=28')).json;
  assert.equal(d28.short, false);
  assert.equal(d28.coverageNote, null);
  assert.deepEqual([d28.range.start, d28.range.end], [CUR.start, CUR.end]);
  assert.equal(spanText('2025-07-16', '2026-11-07'), '16 July 2025 to 7 November 2026');
  assert.equal(spanText('2026-08-01', '2026-11-07'), '1 August to 7 November');
});
