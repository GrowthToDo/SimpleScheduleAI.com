import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

const rules = await import('../lib/rules.mjs');
const { score, rank } = await import('../lib/score.mjs');
const { THRESHOLDS, PRESETS, DEFAULT_MONEY_PAGES } = await import('../lib/config.mjs');
const { windows } = await import('../lib/dates.mjs');

const today = '2026-11-10';
const W = windows(today); // cur 2026-10-11..2026-11-07, prev 2026-09-13..2026-10-10
const cfg = { thresholds: THRESHOLDS, moneyPages: DEFAULT_MONEY_PAGES, brands: ['simplescheduleai', 'm7'], today };
const CUR_DAY = '2026-10-20';
const PREV_DAY = '2026-09-20';

const gscData = (over = {}) => ({
  siteDaily: [],
  pageDaily: [],
  qpCur: [],
  qpPrev: [],
  qp90: [],
  queryCur: [],
  queryPrev: [],
  countries: [],
  devices: [],
  index: [],
  windows: { cur: W.cur, prev: W.prev, d90: W.d90 },
  ...over,
});
const withGsc = (over) => ({ gsc: gscData(over), bing: null, ga4: null, clarity: null, local: null });
const localData = (over = {}) => ({
  verdicts: [],
  due: [],
  aeo: [],
  registry: [],
  plan: { file: null, error: null, posts: [], improve: [] },
  openWork: [],
  competitors: { sitemap: [], watch: [], lastRun: null },
  edits: [],
  livePages: [],
  inbound: {},
  ...over,
});
const qp = (query, page, impressions, position, clicks = 0) => ({ query, page, clicks, impressions, position });
const pd = (page, date, clicks, impressions, position) => ({ page, date, clicks, impressions, position });
const types = (opps) => opps.map((o) => o.type);

// ---------------------------------------------------------------- near-page-one

test('near-page-one fires at the gate, not under it, and never for a brand query', () => {
  const snaps = withGsc({
    qpCur: [
      qp('nurse shift swap rules', '/blog/a', 40, 12),
      qp('too few impressions', '/blog/a', 29, 12),
      qp('already top ten', '/blog/a', 80, 7.9),
      qp('too far down', '/blog/a', 80, 20.5),
      qp('simplescheduleai pricing', '/pricing', 50, 12),
    ],
  });
  const out = rules.detectNearPageOne(snaps, cfg);
  assert.equal(out.length, 1);
  const o = out[0];
  assert.equal(o.type, 'near-page-one');
  assert.equal(o.page, '/blog/a');
  assert.equal(o.query, 'nurse shift swap rules');
  assert.equal(o.isPageEdit, true);
  assert.equal(o.source, 'gsc');
  assert.deepEqual(o.range, W.cur);
  assert.match(o.measured, /11 October to 7 November/);
  assert.match(o.measured, /40/);
  assert.equal(o.test, 'Judged by the 28-day before and after verdict.');
  assert.equal(o.signals.distance, (21 - 12) / 13);
});

// ---------------------------------------------------------------- low-click-rate

test('low-click-rate uses page numbers, fires under half the expected rate, and respects every gate', () => {
  const snaps = withGsc({
    pageDaily: [
      pd('/blog/low', CUR_DAY, 3, 300, 5), // 1.0% vs expected 5% -> fires
      pd('/blog/healthy', CUR_DAY, 8, 300, 5), // 2.7% >= 2.5% -> no
      pd('/blog/thin', CUR_DAY, 0, 199, 5), // under 200 impressions -> no
      pd('/blog/deep', CUR_DAY, 0, 400, 16), // position over 15 -> no
      pd('/blog/old', PREV_DAY, 0, 900, 4), // outside the current window -> no
    ],
    // query level clicks are suppressed and must never drive this rule
    qpCur: [qp('whatever', '/blog/healthy', 300, 5, 0)],
  });
  const out = rules.detectLowClickRate(snaps, cfg);
  assert.deepEqual(
    out.map((o) => o.page),
    ['/blog/low']
  );
  const o = out[0];
  assert.equal(o.query, '');
  assert.equal(o.isPageEdit, true);
  assert.ok(Math.abs(o.signals.distance - (1 - 0.01 / 0.05)) < 1e-9);
  assert.match(o.measured, /1\.0%/);
});

test('low-click-rate at position 15 compares with the position 15 expected rate', () => {
  const snaps = withGsc({ pageDaily: [pd('/blog/edge', CUR_DAY, 0, 250, 15)] });
  assert.equal(rules.detectLowClickRate(snaps, cfg).length, 1);
});

// ---------------------------------------------------------------- competing-pages

test('competing-pages fires for a split query and skips lopsided, thin and brand ones', () => {
  const snaps = withGsc({
    qpCur: [
      qp('float pool nurses', '/blog/a', 60, 9),
      qp('float pool nurses', '/blog/b', 40, 11),
      qp('lopsided', '/blog/a', 75, 9),
      qp('lopsided', '/blog/b', 25, 11),
      qp('thin split', '/blog/a', 15, 9),
      qp('thin split', '/blog/b', 14, 11),
      qp('m7 reviews', '/blog/a', 60, 9),
      qp('m7 reviews', '/blog/b', 40, 11),
    ],
  });
  const out = rules.detectCompetingPages(snaps, cfg);
  assert.equal(out.length, 1);
  assert.equal(out[0].type, 'competing-pages');
  assert.equal(out[0].query, 'float pool nurses');
  assert.equal(out[0].page, '/blog/a');
  assert.equal(out[0].isPageEdit, true);
  assert.equal(out[0].evidence.length, 2);
  assert.match(out[0].measured, /\/blog\/b/);
});

// ---------------------------------------------------------------- slipping

const steadyPages = (n, prev, cur) =>
  Array.from({ length: n }, (_, i) => [
    pd(`/blog/steady-${i}`, PREV_DAY, 0, prev, 8),
    pd(`/blog/steady-${i}`, CUR_DAY, 0, cur, 8),
  ]).flat();

test('slipping fires on a drop of 30 percent or more that also trails the median page by 30 points', () => {
  const snaps = withGsc({
    pageDaily: [
      ...steadyPages(6, 100, 100),
      pd('/blog/slip', PREV_DAY, 0, 100, 8),
      pd('/blog/slip', CUR_DAY, 0, 69, 8), // -31% -> fires
      pd('/blog/almost', PREV_DAY, 0, 100, 8),
      pd('/blog/almost', CUR_DAY, 0, 71, 8), // -29% -> no
      pd('/blog/small', PREV_DAY, 0, 49, 8),
      pd('/blog/small', CUR_DAY, 0, 0, 8), // prev under 50 -> no
    ],
  });
  const out = rules.detectSlipping(snaps, cfg);
  assert.deepEqual(
    out.map((o) => o.page),
    ['/blog/slip']
  );
  assert.equal(out[0].isPageEdit, true);
  assert.ok(Math.abs(out[0].signals.distance - 0.31) < 1e-9);
  assert.match(out[0].measured, /31%/);
});

test('slipping stays quiet when every page fell about the same (the whole site moved)', () => {
  const snaps = withGsc({
    pageDaily: [
      ...steadyPages(6, 100, 65),
      pd('/blog/slip', PREV_DAY, 0, 100, 8),
      pd('/blog/slip', CUR_DAY, 0, 60, 8), // -40% but only 5 points behind the median of -35%
    ],
  });
  assert.equal(rules.detectSlipping(snaps, cfg).length, 0);
});

// ---------------------------------------------------------------- wrong-page

test('wrong-page fires when another page takes the registry keyword', () => {
  const snaps = withGsc({
    qpCur: [qp('kw mismatch', '/blog/b', 50, 6), qp('kw mismatch', '/blog/a', 5, 14), qp('kw fine', '/blog/c', 30, 6)],
  });
  snaps.local = localData({
    registry: [
      { slug: 'a', type: 'post', url: '/blog/a', primaryKeyword: 'kw mismatch', pillar: null },
      { slug: 'c', type: 'post', url: '/blog/c', primaryKeyword: 'kw fine', pillar: null },
      { slug: 'd', type: 'post', url: '/blog/d', primaryKeyword: 'kw unseen', pillar: null },
    ],
  });
  const out = rules.detectWrongPage(snaps, cfg);
  assert.equal(out.length, 1);
  assert.equal(out[0].type, 'wrong-page');
  assert.equal(out[0].page, '/blog/a');
  assert.equal(out[0].query, 'kw mismatch');
  assert.equal(out[0].isPageEdit, true);
  assert.match(out[0].measured, /\/blog\/b/);
});

// ---------------------------------------------------------------- unserved

test('unserved fires for demand with no page in the top 20, unless the registry already targets it', () => {
  const snaps = withGsc({
    qpCur: [
      qp('rural hospital float rules', '/blog/a', 30, 25),
      qp('exactly twenty', '/blog/a', 60, 20),
      qp('too thin', '/blog/a', 29, 40),
      qp('targeted keyword', '/blog/a', 50, 30),
      qp('simplescheduleai login', '/', 50, 30),
    ],
  });
  snaps.local = localData({
    registry: [{ slug: 't', type: 'post', url: '/blog/t', primaryKeyword: 'Targeted Keyword', pillar: null }],
  });
  const out = rules.detectUnserved(snaps, cfg);
  assert.equal(out.length, 1);
  assert.equal(out[0].type, 'unserved');
  assert.equal(out[0].query, 'rural hospital float rules');
  assert.equal(out[0].isPageEdit, false);
  assert.equal(out[0].page, null);
  assert.equal(out[0].signals.importance, 0.3);
});

// ---------------------------------------------------------------- question

test('question fires for a long weakly answered question and skips the rest', () => {
  const snaps = withGsc({
    qpCur: [
      qp('how do critical access hospitals schedule night nurses', '/blog/a', 10, 18),
      qp('how do critical access hospitals fund nurses', '/blog/a', 10, 15), // not above 15
      qp('how do critical access hospitals pay nurses', '/blog/a', 9, 30), // under 10 impressions
      qp('nurse schedule app', '/blog/a', 50, 30), // short and not a question
      qp('what is simplescheduleai', '/', 40, 30), // brand
    ],
  });
  const out = rules.detectQuestion(snaps, cfg);
  assert.equal(out.length, 1);
  assert.equal(out[0].type, 'question');
  assert.equal(out[0].page, '/blog/a');
  assert.equal(out[0].isPageEdit, true);
});

// ---------------------------------------------------------------- needs-links

const livePagesOf = (...pages) => pages.map((page) => ({ page, lastmod: null }));

test('needs-links applies only to posts and articles, counts page links, and skips pages reached by a shared component', () => {
  const snaps = {
    gsc: null,
    local: localData({
      livePages: livePagesOf(
        '/',
        '/about',
        '/blog',
        '/articles',
        '/privacy',
        '/terms',
        '/pricing',
        '/blog/none',
        '/blog/one',
        '/blog/two',
        '/blog/tpl',
        '/blog/nav',
        '/blog/uncounted',
        '/articles/story'
      ),
      inbound: {
        '/': [],
        '/about': [],
        '/blog': ['src/pages/[...blog]/index.astro'],
        '/articles': [],
        '/privacy': [],
        '/pricing': [],
        '/blog/none': [],
        '/blog/one': ['/blog/x'],
        '/blog/two': ['/blog/x', '/blog/y'],
        '/blog/tpl': ['src/pages/[...blog]/index.astro', '/blog/x'], // a listing template is not an inbound link
        '/blog/nav': ['src/components/widgets/Footer.astro'], // site-wide navigation passes
        '/articles/story': ['src/pages/articles/[...slug].astro'],
        // '/blog/uncounted' is not a key: never counted, so no verdict
      },
    }),
  };
  const out = rules.detectNeedsLinks(snaps, cfg);
  assert.deepEqual(out.map((o) => o.page).sort(), ['/articles/story', '/blog/none', '/blog/one', '/blog/tpl']);
  assert.equal(out[0].isPageEdit, false);
  assert.equal(out[0].signals.demand, null);
  assert.equal(out.find((o) => o.page === '/blog/tpl').evidence[0].inboundPages.length, 1);
});

test('needs-links emits nothing when the inbound map is empty (the count failed)', () => {
  const snaps = { local: localData({ livePages: livePagesOf('/blog/a', '/blog/b'), inbound: {} }) };
  assert.deepEqual(rules.detectNeedsLinks(snaps, cfg), []);
  assert.deepEqual(rules.detectNeedsLinks({ local: localData({ livePages: livePagesOf('/blog/a') }) }, cfg).length, 0);
});

// ---------------------------------------------------------------- ai-gap

test('ai-gap reads only the latest line and needs an absent keyword with a cited competitor', () => {
  const old = { date: '2026-10-01', engines: ['chat_gpt'], rows: [row('old keyword', false, [['rival.com', 2]])] };
  const latest = {
    date: '2026-11-01',
    engines: ['chat_gpt'],
    rows: [
      row('nurse scheduling software', false, [['rival.com', 2]]),
      row('we are present', true, [['rival.com', 2]]),
      row('nobody cited', false, []),
      { kind: 'own-mention', platform: 'chat_gpt', question: 'q', citedUrls: [] },
    ],
  };
  function row(keyword, ourPresent, competitors) {
    return { keyword, platform: 'chat_gpt', ourPresent, ourRank: null, topSources: [], competitors };
  }
  const snaps = { gsc: null, local: localData({ aeo: [old, latest] }) };
  const out = rules.detectAiGap(snaps, cfg);
  assert.equal(out.length, 1);
  assert.equal(out[0].type, 'ai-gap');
  assert.equal(out[0].query, 'nurse scheduling software');
  assert.equal(out[0].page, '/nurse-scheduling-software');
  assert.equal(out[0].isPageEdit, false);
  assert.equal(out[0].signals.ai, 1);
  assert.match(out[0].measured, /rival\.com/);
});

// ---------------------------------------------------------------- engine-gap

test('engine-gap fires both ways and respects the gates, brands and page importance', () => {
  const snaps = withGsc({
    qpCur: [
      qp('google only money', '/pricing', 30, 9),
      qp('google only blog', '/blog/a', 80, 9),
      qp('google thin', '/pricing', 29, 9),
      qp('shared', '/pricing', 100, 9),
    ],
  });
  snaps.bing = {
    siteDaily: [],
    queries: [
      { query: 'bing only', clicks: 0, impressions: 20, position: 5 },
      { query: 'bing thin', clicks: 0, impressions: 19, position: 5 },
      { query: 'm7 bing brand', clicks: 0, impressions: 90, position: 5 },
      { query: 'shared', clicks: 0, impressions: 50, position: 5 },
    ],
    pages: [],
    crawlIssues: [],
    links: { total: 0, history: [] },
  };
  snaps.local = localData({
    registry: [{ slug: 'a', type: 'post', url: '/blog/a', primaryKeyword: 'x', pillar: null }],
  });
  const out = rules.detectEngineGap(snaps, cfg);
  const byQuery = Object.fromEntries(out.map((o) => [o.query, o]));
  assert.deepEqual(Object.keys(byQuery).sort(), ['bing only', 'google only money']);
  assert.equal(byQuery['bing only'].page, null);
  assert.equal(byQuery['bing only'].source, 'bing');
  assert.equal(byQuery['google only money'].page, '/pricing');
  assert.equal(byQuery['google only money'].isPageEdit, false);
});

test('engine-gap does not flag every Bing query when the Search Console pull is empty', () => {
  const snaps = withGsc({});
  snaps.bing = {
    siteDaily: [],
    queries: [{ query: 'bing only', clicks: 0, impressions: 90, position: 5 }],
    pages: [],
    crawlIssues: [],
    links: { total: 0, history: [] },
  };
  assert.deepEqual(rules.detectEngineGap(snaps, cfg), []);
  assert.deepEqual(rules.detectEngineGap({ ...snaps, gsc: null }, cfg), []);
});

test('engine-gap text names the dates Bing and Google cover, in plain long dates', () => {
  const snaps = withGsc({ qpCur: [qp('something else', '/blog/a', 5, 30)] });
  snaps.bing = {
    siteDaily: [],
    queries: [{ query: 'bing only', clicks: 0, impressions: 25, position: 5 }],
    pages: [],
    windows: { cur: { start: '2026-10-11', end: '2026-11-07' } },
    crawlIssues: [],
    links: { total: 0, history: [] },
  };
  const [o] = rules.detectEngineGap(snaps, cfg);
  assert.match(o.measured, /From 11 October to 7 November, Bing showed our site 25 times/);
  assert.match(o.measured, /over the same dates/);
  assert.equal(/\b(Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d/.test(o.measured), false);
  // An older Bing snapshot has no window: the text says the numbers run back further.
  delete snaps.bing.windows;
  const [old] = rules.detectEngineGap(snaps, cfg);
  assert.match(old.measured, /runs back further than 28 days/);
});

// ---------------------------------------------------------------- not-indexed

test('not-indexed counts the age from the publish date only; no publish row means older than 14 days', () => {
  const idx = (page, verdict = 'not-indexed') => ({ page, verdict, reason: '', lastCrawl: null });
  const snaps = withGsc({
    index: [
      idx('/blog/new-pub'),
      idx('/blog/old-pub'),
      idx('/blog/old-touched'),
      idx('/blog/no-dates'),
      idx('/blog/indexed', 'indexed'),
      idx('/blog/not-live'),
    ],
  });
  snaps.local = localData({
    livePages: [
      { page: '/blog/new-pub', lastmod: '2026-09-01' },
      { page: '/blog/old-pub', lastmod: '2026-11-09' },
      { page: '/blog/old-touched', lastmod: '2026-11-08' },
      { page: '/blog/no-dates', lastmod: null },
      { page: '/blog/indexed', lastmod: '2026-09-01' },
    ],
    edits: [
      { page: '/blog/new-pub', date: '2026-11-01', kind: 'publish', subject: 'publish' },
      { page: '/blog/old-pub', date: '2026-10-01', kind: 'publish', subject: 'publish' },
      // An old page touched recently is still old.
      { page: '/blog/old-touched', date: '2026-11-08', kind: 'edit', subject: 'sweep' },
    ],
  });
  const out = rules.detectNotIndexed(snaps, cfg);
  assert.deepEqual(out.map((o) => o.page).sort(), ['/blog/no-dates', '/blog/old-pub', '/blog/old-touched']);
  assert.equal(out[0].isPageEdit, false);
  const text = (p) => out.find((o) => o.page === p).measured;
  assert.match(text('/blog/old-pub'), /went live about 40 days ago \(published 1 October\)/);
  assert.match(text('/blog/old-touched'), /live for more than 14 days/);
  assert.match(text('/blog/no-dates'), /live for more than 14 days/);
});

test('not-indexed treats exactly 14 days after publishing as not yet old enough', () => {
  const snaps = withGsc({ index: [{ page: '/blog/x', verdict: 'not-indexed', reason: '', lastCrawl: null }] });
  const at = (date) =>
    localData({ livePages: [{ page: '/blog/x' }], edits: [{ page: '/blog/x', date, kind: 'publish' }] });
  snaps.local = at('2026-10-27'); // 14 days before today
  assert.equal(rules.detectNotIndexed(snaps, cfg).length, 0);
  snaps.local = at('2026-10-26');
  assert.equal(rules.detectNotIndexed(snaps, cfg).length, 1);
});

// ---------------------------------------------------------------- detectAll

function everythingSnaps() {
  const snaps = withGsc({
    qpCur: [
      qp('nurse shift swap rules', '/blog/a', 40, 12),
      qp('float pool nurses', '/blog/a', 60, 9),
      qp('float pool nurses', '/blog/b', 40, 11),
      qp('kw mismatch', '/blog/b', 50, 6),
      qp('rural hospital float rules', '/blog/a', 30, 25),
      qp('how do critical access hospitals schedule night nurses', '/blog/a', 10, 18),
      qp('google only money', '/pricing', 30, 9),
    ],
    pageDaily: [pd('/blog/low', CUR_DAY, 3, 300, 5)],
    index: [{ page: '/blog/old-mod', verdict: 'not-indexed', reason: '', lastCrawl: null }],
  });
  snaps.bing = {
    siteDaily: [],
    queries: [{ query: 'bing only', clicks: 0, impressions: 20, position: 5 }],
    pages: [],
    crawlIssues: [],
    links: { total: 0, history: [] },
  };
  snaps.local = localData({
    registry: [{ slug: 'a', type: 'post', url: '/blog/a2', primaryKeyword: 'kw mismatch', pillar: null }],
    livePages: [
      { page: '/blog/old-mod', lastmod: '2026-10-01' },
      { page: '/blog/lonely', lastmod: null },
    ],
    inbound: { '/blog/old-mod': ['/x', '/y'], '/blog/lonely': [] },
    aeo: [
      {
        date: '2026-11-01',
        engines: ['chat_gpt'],
        rows: [
          {
            keyword: 'nurse scheduling software',
            platform: 'chat_gpt',
            ourPresent: false,
            ourRank: null,
            topSources: [],
            competitors: [['rival.com', 1]],
          },
        ],
      },
    ],
  });
  return snaps;
}

test('detectAll emits every type with plain words, a date range and the right edit flag', () => {
  const out = rules.detectAll(everythingSnaps(), cfg);
  const got = new Set(types(out));
  const expectPageEdit = {
    'near-page-one': true,
    'low-click-rate': true,
    'competing-pages': true,
    'wrong-page': true,
    unserved: false,
    question: true,
    'needs-links': false,
    'ai-gap': false,
    'engine-gap': false,
    'not-indexed': false,
  };
  for (const [type, edit] of Object.entries(expectPageEdit)) {
    assert.ok(got.has(type), `missing ${type}`);
    for (const o of out.filter((x) => x.type === type)) assert.equal(o.isPageEdit, edit, type);
  }
  for (const o of out) {
    for (const key of ['title', 'measured', 'action', 'test']) {
      assert.equal(typeof o[key], 'string');
      assert.ok(o[key].length > 10, `${o.type} ${key}`);
      assert.doesNotMatch(o[key], /[–—]/, `${o.type} ${key} has a dash`);
      assert.doesNotMatch(o[key], /\bCTR\b|\bSERP\b/i, `${o.type} ${key} has jargon`);
    }
    assert.match(
      o.measured,
      /\b\d{1,2} (January|February|March|April|May|June|July|August|September|October|November|December)\b/,
      `${o.type} measured names its dates the desk way ("8 November")`
    );
    assert.ok(o.range.start && o.range.end);
    assert.deepEqual(Object.keys(o.signals).sort(), ['ai', 'confidence', 'demand', 'distance', 'effort', 'importance']);
    for (const v of Object.values(o.signals)) assert.ok(v === null || (v >= 0 && v <= 1), `${o.type} signal range`);
    if (o.isPageEdit) assert.equal(o.test, 'Judged by the 28-day before and after verdict.');
  }
});

test('ids are sha1(type|page|query) cut to 12 and stable across two runs', () => {
  const a = rules.detectAll(everythingSnaps(), cfg);
  const b = rules.detectAll(everythingSnaps(), cfg);
  assert.deepEqual(
    a.map((o) => o.id),
    b.map((o) => o.id)
  );
  assert.equal(new Set(a.map((o) => o.id)).size, a.length);
  const o = a[0];
  const want = crypto
    .createHash('sha1')
    .update(`${o.type}|${o.page ?? ''}|${o.query ?? ''}`)
    .digest('hex')
    .slice(0, 12);
  assert.equal(o.id, want);
});

test('competing-pages id is built from the type and the query only, so a swapped top page keeps it', () => {
  const rows = (topPage, otherPage) => [
    qp('float pool nurses', topPage, 60, 9),
    qp('float pool nurses', otherPage, 40, 11),
  ];
  const first = rules.detectCompetingPages(withGsc({ qpCur: rows('/blog/a', '/blog/b') }), cfg)[0];
  const swapped = rules.detectCompetingPages(withGsc({ qpCur: rows('/blog/b', '/blog/a') }), cfg)[0];
  assert.notEqual(first.page, swapped.page);
  assert.equal(first.id, swapped.id);
  const want = crypto.createHash('sha1').update('competing-pages||float pool nurses').digest('hex').slice(0, 12);
  assert.equal(first.id, want);
});

test('detectAll emits nothing, and does not throw, when sources are missing', () => {
  assert.deepEqual(rules.detectAll({}, cfg), []);
  assert.deepEqual(rules.detectAll({ gsc: null, bing: null, ga4: null, clarity: null, local: null }, cfg), []);
  assert.deepEqual(rules.detectAll(withGsc({}), cfg), []);
  const onlyLocal = {
    local: localData({ livePages: [{ page: '/blog/x', lastmod: null }], inbound: { '/blog/x': [] } }),
  };
  assert.deepEqual(types(rules.detectAll(onlyLocal, cfg)), ['needs-links']);
  const onlyBing = {
    bing: { siteDaily: [], queries: [{ query: 'q', clicks: 0, impressions: 50, position: 3 }], pages: [] },
  };
  assert.deepEqual(rules.detectAll(onlyBing, cfg), []);
});

// ---------------------------------------------------------------- score and rank

const nearRow = (page) => withGsc({ qpCur: [qp('shared question words here', page, 100, 12)] });

test('score parts add up to the total and a null signal adds zero with a plain reason', () => {
  const [opp] = rules.detectNearPageOne(nearRow('/blog/a'), cfg);
  const s = score(opp, PRESETS.balanced);
  assert.ok(s.total >= 0 && s.total <= 100);
  assert.deepEqual(
    s.parts.map((p) => p.signal),
    ['demand', 'distance', 'importance', 'confidence', 'effort', 'ai', 'outcome']
  );
  const sum = Number(s.parts.reduce((t, p) => t + p.points, 0).toFixed(1));
  assert.equal(s.total, sum);
  for (const p of s.parts) {
    assert.equal(typeof p.why, 'string');
    assert.ok(p.why.length > 5);
  }

  const withNull = { ...opp, signals: { ...opp.signals, confidence: null } };
  const s2 = score(withNull, PRESETS.balanced);
  const conf = s2.parts.find((p) => p.signal === 'confidence');
  assert.equal(conf.points, 0);
  assert.equal(conf.value, null);
  assert.match(conf.why, /not enough data/);
  assert.ok(s2.total < s.total);
});

test('score never exceeds 100 even with every signal at 1', () => {
  const full = { signals: { demand: 1, distance: 1, importance: 1, confidence: 1, effort: 1, ai: 1, outcome: 1 } };
  assert.equal(score(full, PRESETS.balanced).total, 100);
});

test('with money-pages-first an identical opportunity on /pricing outranks one on a blog post', () => {
  const [blog] = rules.detectNearPageOne(nearRow('/blog/a'), cfg);
  const [money] = rules.detectNearPageOne(nearRow('/pricing'), cfg);
  const ranked = rank([blog, money], PRESETS['money-pages-first']);
  assert.equal(ranked[0].page, '/pricing');
  assert.ok(ranked[0].score.total > ranked[1].score.total);
  assert.equal(typeof ranked[0].score.total, 'number');
});

test('rank orders by total and breaks ties by id so the order is stable', () => {
  const [a] = rules.detectNearPageOne(nearRow('/blog/a'), cfg);
  const b = { ...a, id: 'aaaaaaaaaaaa' };
  const c = { ...a, id: 'zzzzzzzzzzzz' };
  assert.deepEqual(
    rank([c, b], PRESETS.balanced).map((o) => o.id),
    ['aaaaaaaaaaaa', 'zzzzzzzzzzzz']
  );
  assert.deepEqual(
    rank([b, c], PRESETS.balanced).map((o) => o.id),
    ['aaaaaaaaaaaa', 'zzzzzzzzzzzz']
  );
});

test('importance is 1 for a money page, 0.7 for a pillar, 0.5 for a registry target and 0.3 otherwise', () => {
  const snaps = withGsc({
    qpCur: [
      qp('q one two three', '/pricing', 100, 12),
      qp('q one two three', '/pillar-page', 100, 12),
      qp('q one two three', '/blog/target', 100, 12),
      qp('q one two three', '/blog/other', 100, 12),
    ],
  });
  snaps.local = localData({
    registry: [
      { slug: 'p', type: 'pillar', url: '/pillar-page', primaryKeyword: null, pillar: null },
      { slug: 't', type: 'post', url: '/blog/target', primaryKeyword: 'x', pillar: '/pillar-page' },
    ],
  });
  const imp = Object.fromEntries(rules.detectNearPageOne(snaps, cfg).map((o) => [o.page, o.signals.importance]));
  assert.deepEqual(imp, { '/pricing': 1, '/pillar-page': 0.7, '/blog/target': 0.5, '/blog/other': 0.3 });
});
