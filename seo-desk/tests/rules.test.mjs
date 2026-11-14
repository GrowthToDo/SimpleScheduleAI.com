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

// The query-only rows a real pull would carry for these query and page rows when each search showed
// one page per result (the views of its pages added up). A test that needs the real count to differ
// passes queryCur itself; queryCur: null is a snapshot without the query-only pull.
const realFrom = (rows) => {
  const m = new Map();
  for (const r of rows ?? []) {
    const a = m.get(r.query) ?? { query: r.query, clicks: 0, impressions: 0, posW: 0 };
    a.clicks += r.clicks || 0;
    a.impressions += r.impressions || 0;
    a.posW += (r.position || 0) * (r.impressions || 0);
    m.set(r.query, a);
  }
  return [...m.values()].map((a) => ({
    query: a.query,
    clicks: a.clicks,
    impressions: a.impressions,
    position: a.impressions ? a.posW / a.impressions : 0,
  }));
};
const gscData = (over = {}) => {
  const data = {
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
  };
  if (!('queryCur' in over)) data.queryCur = realFrom(data.qpCur);
  return data;
};
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
      qp('float pool medics', '/blog/a', 60, 9),
      qp('float pool medics', '/blog/b', 40, 11),
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
  assert.equal(out[0].query, 'float pool medics');
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
      qp('ward rota app', '/blog/a', 50, 30), // short and not a question
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

// ---------------------------------------------------------------- engine-gap (retired)

test('K1: no rule raises a Google and Bing card, even on data that used to raise both kinds', () => {
  const snaps = withGsc({
    qpCur: [qp('shared', '/pricing', 100, 9)],
    pageDaily: [pd('/pricing', CUR_DAY, 0, 250, 12), pd('/blog/a', CUR_DAY, 0, 400, 30)],
  });
  snaps.bing = {
    siteDaily: [],
    queries: [{ query: 'bing only', clicks: 0, impressions: 90, position: 5 }],
    pages: [{ page: '/blog/on-bing', clicks: 0, impressions: 3 }],
    crawlIssues: [],
    links: { total: 0, history: [] },
  };
  assert.equal(rules.detectEngineGap, undefined);
  assert.ok(!rules.RULE_TYPES.includes('engine-gap'));
  assert.ok(!rules.detectAll(snaps, cfg).some((o) => o.type === 'engine-gap'));
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
      qp('float pool medics', '/blog/a', 60, 9),
      qp('float pool medics', '/blog/b', 40, 11),
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
    qp('float pool medics', topPage, 60, 9),
    qp('float pool medics', otherPage, 40, 11),
  ];
  const first = rules.detectCompetingPages(withGsc({ qpCur: rows('/blog/a', '/blog/b') }), cfg)[0];
  const swapped = rules.detectCompetingPages(withGsc({ qpCur: rows('/blog/b', '/blog/a') }), cfg)[0];
  assert.notEqual(first.page, swapped.page);
  assert.equal(first.id, swapped.id);
  const want = crypto.createHash('sha1').update('competing-pages||float pool medics').digest('hex').slice(0, 12);
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

// ================================================================ the audit of 14 November (package 2)

test('B2: a split needs its real searches over the minimum, never the sum of page rows', () => {
  // Two pages each shown 20 times: the page rows add up to 40, but the search was made 26 times.
  const qpCur = [qp('float pool medics', '/blog/a', 20, 6), qp('float pool medics', '/blog/b', 20, 7)];
  const out = rules.detectCompetingPages(
    withGsc({ qpCur, queryCur: [{ query: 'float pool medics', clicks: 0, impressions: 26, position: 6 }] }),
    cfg
  );
  assert.deepEqual(out, []);
  // Without the query-only pull nothing that depends on the minimum is listed.
  assert.deepEqual(rules.detectCompetingPages(withGsc({ qpCur, queryCur: null }), cfg), []);
  assert.equal(rules.splitSearches(withGsc({ qpCur, queryCur: null }), cfg), null);
});

test('B3: pages shown together (views 1.3 times the searches or more) are not cannibalization', () => {
  const qpCur = [qp('night shift rota ideas', '/blog/a', 60, 4), qp('night shift rota ideas', '/blog/b', 50, 6)];
  const together = withGsc({
    qpCur,
    queryCur: [{ query: 'night shift rota ideas', impressions: 60, clicks: 0, position: 4 }],
  });
  assert.deepEqual(rules.detectCompetingPages(together, cfg), []);
  const [s] = rules.splitSearches(together, cfg);
  assert.equal(s.kind, 'together');
  assert.equal(s.impressions, 60);
  assert.equal(s.pageViews, 110);
  assert.ok(s.ratio >= 1.3);
  // Just under 1.3 is a split.
  const split = withGsc({
    qpCur,
    queryCur: [{ query: 'night shift rota ideas', impressions: 85, clicks: 0, position: 4 }],
  });
  assert.equal(rules.splitSearches(split, cfg)[0].kind, 'split');
  assert.equal(rules.detectCompetingPages(split, cfg).length, 1);
});

test('B3: a split where no page ranks better than position 20 is not cannibalization', () => {
  const qpCur = [qp('rota for a tiny ward', '/blog/a', 30, 24), qp('rota for a tiny ward', '/blog/b', 25, 31)];
  const snaps = withGsc({ qpCur });
  assert.deepEqual(rules.detectCompetingPages(snaps, cfg), []);
  assert.equal(rules.splitSearches(snaps, cfg)[0].kind, 'no-rank');
});

test('M4: the best place for the no-rank test is taken over pages with 10 or more views for the search', () => {
  // Two counted pages sit at 26 and 37; a third page with 2 views sits at 16. Nothing that counts ranks.
  const qpCur = [
    qp('rota for a made up ward', '/blog/a', 30, 26.4),
    qp('rota for a made up ward', '/blog/b', 25, 37.5),
    qp('rota for a made up ward', '/blog/c', 2, 16),
  ];
  const snaps = withGsc({
    qpCur,
    queryCur: [{ query: 'rota for a made up ward', impressions: 50, clicks: 0, position: 30 }],
  });
  const [s] = rules.splitSearches(snaps, cfg);
  assert.equal(s.kind, 'no-rank');
  assert.equal(s.bestPosition, 26.4);
  assert.deepEqual(rules.detectCompetingPages(snaps, cfg), []);
});

test('W3 and W1: only pages with 10 or more views for the search count as competing', () => {
  const qpCur = [
    qp('shift bidding rules', '/blog/a', 30, 6),
    qp('shift bidding rules', '/blog/b', 20, 8),
    qp('shift bidding rules', '/blog/c', 2, 9),
    qp('shift bidding rules', '/blog/d', 1, 9),
  ];
  const [o] = rules.detectCompetingPages(withGsc({ qpCur }), cfg);
  assert.match(o.title, /^2 of our pages compete/);
  assert.deepEqual(
    o.evidence.map((p) => p.page),
    ['/blog/a', '/blog/b']
  );
  assert.match(o.measured, /showed our site 53 times/);
  // One page over 10 views and one under is not a split at all.
  const lone = [
    qp('lone page search', '/blog/a', 30, 6),
    qp('lone page search', '/blog/b', 9, 8),
    qp('lone page search', '/blog/c', 9, 8),
  ];
  assert.deepEqual(rules.detectCompetingPages(withGsc({ qpCur: lone }), cfg), []);
});

test('B9: the wrong page ranks only with 10 or more views, and never says "1 times"', () => {
  const registry = [{ slug: 'a', type: 'post', url: '/blog/a', primaryKeyword: 'kw thin mismatch', pillar: null }];
  const thin = withGsc({ qpCur: [qp('kw thin mismatch', '/blog/b', 1, 6)] });
  thin.local = localData({ registry });
  assert.deepEqual(rules.detectWrongPage(thin, cfg), []);
  const nine = withGsc({ qpCur: [qp('kw thin mismatch', '/blog/b', 9, 6)] });
  nine.local = localData({ registry });
  assert.deepEqual(rules.detectWrongPage(nine, cfg), []);
  const ten = withGsc({ qpCur: [qp('kw thin mismatch', '/blog/b', 10, 6)] });
  ten.local = localData({ registry });
  const [o] = rules.detectWrongPage(ten, cfg);
  assert.match(o.measured, /10 times/);
});

test('B2 and B8: an unserved card counts real searches and names the best placed page with 10 views', () => {
  // The page rows add up to 34; the search was made 17 times, under the minimum of 30.
  const doubled = withGsc({
    qpCur: [qp('cross cover rules', '/blog/a', 17, 40), qp('cross cover rules', '/blog/b', 17, 45)],
    queryCur: [{ query: 'cross cover rules', impressions: 17, clicks: 0, position: 42 }],
  });
  assert.deepEqual(rules.detectUnserved(doubled, cfg), []);
  // The busiest page sits at 62; a page with 2 views sits at 28; the best placed page with 10 views is at 35.
  const snaps = withGsc({
    qpCur: [
      qp('rural ward cover', '/blog/busy', 40, 62),
      qp('rural ward cover', '/blog/tiny', 2, 28),
      qp('rural ward cover', '/blog/placed', 12, 35),
    ],
  });
  const [o] = rules.detectUnserved(snaps, cfg);
  assert.match(o.measured, /showed our site 54 times/);
  assert.match(o.measured, /\/blog\/placed, at position 35\.0/);
  assert.doesNotMatch(o.measured, /\/blog\/busy/);
});

test('B5: a content gap needs no live page at position 20 or better; a page that is not live does not count', () => {
  const rows = [qp('weekend cover plan', '/blog/old', 30, 5), qp('weekend cover plan', '/blog/live', 30, 33)];
  const snaps = withGsc({ qpCur: rows });
  snaps.local = localData({ livePages: [{ page: '/blog/live' }] });
  const [o] = rules.detectUnserved(snaps, cfg);
  assert.equal(o.query, 'weekend cover plan');
  snaps.local = localData({ livePages: [{ page: '/blog/live' }, { page: '/blog/old' }] });
  assert.deepEqual(rules.detectUnserved(snaps, cfg), []);
});

test('B2: a question card needs 10 real searches, and says how often the search showed our site', () => {
  const q = 'how do small wards plan nurse cover at night';
  const doubled = withGsc({
    qpCur: [qp(q, '/blog/a', 5, 30), qp(q, '/blog/b', 5, 32)],
    queryCur: [{ query: q, impressions: 9, clicks: 0, position: 31 }],
  });
  assert.deepEqual(rules.detectQuestion(doubled, cfg), []);
  const ok = withGsc({
    qpCur: [qp(q, '/blog/a', 6, 30), qp(q, '/blog/b', 6, 32)],
    queryCur: [{ query: q, impressions: 11, clicks: 0, position: 31 }],
  });
  const [o] = rules.detectQuestion(ok, cfg);
  assert.match(o.measured, /showed our site 11 times/);
  assert.deepEqual(rules.detectQuestion(withGsc({ qpCur: ok.gsc.qpCur, queryCur: null }), cfg), []);
});

test('B14: a runner-up at position 10 or better is low on page one; 11 to 20 is close to page one', () => {
  const out = rules.detectNearPageOne(
    withGsc({ qpCur: [qp('on page one already', '/blog/a', 40, 9.4), qp('just off page one', '/blog/a', 40, 12)] }),
    cfg
  );
  const by = Object.fromEntries(out.map((o) => [o.query, o]));
  assert.match(by['on page one already'].title, /is low on page one/);
  assert.doesNotMatch(by['on page one already'].title, /close to page one/);
  assert.match(by['just off page one'].title, /is close to page one/);
  // S12: an average of 10.2 is page two, never "low on page one".
  const [two] = rules.detectNearPageOne(withGsc({ qpCur: [qp('a made up ten', '/blog/a', 40, 10.2)] }), cfg);
  assert.match(two.title, /is close to page one/);
  assert.doesNotMatch(two.measured, /low on it/);
});
