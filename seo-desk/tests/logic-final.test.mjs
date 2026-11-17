import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// The final fix wave of the 2026-11-14 logic audit: where the four packages meet. Every page, commit,
// phrase and number here is invented.

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-final-'));
const DATA = path.join(root, 'data');
const REPO = path.join(root, 'repo');
fs.mkdirSync(path.join(REPO, 'docs/seo'), { recursive: true });
process.env.SEO_DESK_DATA = DATA;
process.env.SEO_DESK_REPO = REPO;
process.env.SEO_DESK_TODAY = '2026-11-14';

const week = await import('../lib/week.mjs');
const changes = await import('../lib/changes.mjs');
const { buildModel, invalidate } = await import('../lib/api/model.mjs');
const work = await import('../lib/api/work.mjs');
const { writeJson } = await import('../lib/store.mjs');
const { addDays } = await import('../lib/dates.mjs');
const { buildDeskBrief } = await import('../lib/ask.mjs');

const TODAY = '2026-11-14';

function snap(source, data, extra = {}) {
  writeJson(`snap/${source}.json`, {
    source,
    ok: true,
    status: 'fresh',
    pulledAt: '2026-11-14T06:00:00.000Z',
    through: '2026-11-13',
    error: null,
    data,
    ...extra,
  });
}

const verdictRow = (extra = {}) => ({
  slug: 'sample-guide',
  url: '/blog/sample-guide',
  changeDate: '2026-10-02',
  judgedOn: '2026-11-01',
  verdict: 'worse',
  before: { impressions: 133, position: 15 },
  after: { impressions: 27, position: 18.2 },
  siteImpPct: -0.016,
  ...extra,
});

// ---------------------------------------------------------------- M1: one reading per change

// One commit: its batch row overlaps another change, two page rows can be read (one better, one
// worse), one page row overlaps too. A second commit is one overlapping page.
const M1_ROWS = [
  verdictRow({ slug: 'lone-guide', url: '/blog/lone-guide', commits: [{ hash: 'k0' }], overlapping: true }),
  verdictRow({ slug: 'up-guide', url: '/blog/up-guide', commits: [{ hash: 'k1' }], verdict: 'better' }),
  verdictRow({ slug: 'down-guide', url: '/blog/down-guide', commits: [{ hash: 'k1' }], verdict: 'worse' }),
  verdictRow({ slug: 'tangled-guide', url: '/blog/tangled-guide', commits: [{ hash: 'k1' }], overlapping: true }),
  verdictRow({
    slug: 'batch:k1',
    url: null,
    kind: 'batch',
    pages: ['/blog/up-guide', '/blog/down-guide', '/blog/tangled-guide'],
    commits: [{ hash: 'k1' }],
    verdict: 'better',
    overlapping: true,
  }),
];

test('M1: an overlapping batch is read from its page rows no other change overlaps', () => {
  const { changes: list } = changes.readChanges(M1_ROWS);
  assert.deepEqual(
    list.map((c) => c.word),
    ['unreadable', 'mixed']
  );
  assert.deepEqual(list[1].used, [1, 2], 'the two readable page rows, not the batch or the overlapped page');
  // All the readable pages agree: the change reads their word.
  const worse = changes.readChanges(M1_ROWS.map((r) => (r.slug === 'up-guide' ? { ...r, verdict: 'worse' } : r)));
  assert.equal(worse.changes[1].word, 'worse');
  // A batch no other change overlaps is the change's reading.
  const clean = changes.readChanges(M1_ROWS.map((r) => (r.kind === 'batch' ? { ...r, overlapping: false } : r)));
  assert.equal(clean.changes[1].word, 'better');
  assert.deepEqual(clean.changes[1].used, [4]);
});

test('M1: the Did it work tile, its list and the week read a change the same way', () => {
  writeJson('state/items.json', {});
  snap('gsc', { pageDaily: [], siteDaily: [] });
  snap('local', { livePages: [], verdicts: M1_ROWS, due: [], edits: [] });
  invalidate();
  const model = buildModel();
  const r = work.resultsView(model);
  assert.equal(r.verdictCounts.changes, 2);
  assert.equal(r.verdictCounts.text, '1 mixed, 1 cannot be read');
  assert.equal(r.verdictCounts.byWord.unreadable, 1);
  const batch = r.verdicts.find((v) => v.batch);
  assert.equal(batch.changeVerdict, 'mixed');
  assert.equal(
    batch.changeNote,
    'This change reads as Mixed, from its 2 pages that no other edit overlaps (1 better, 1 worse).'
  );
  const down = r.verdicts.find((v) => v.slug === 'down-guide');
  assert.equal(down.changeVerdict, 'mixed');
  assert.equal(r.verdicts.find((v) => v.slug === 'lone-guide').changeNote, null, 'a change of one row needs no note');

  // A mixed change is no "reads worse" worry, though one of its pages read worse.
  const list = week.worries({ snaps: { local: { data: { verdicts: M1_ROWS } } }, today: TODAY });
  assert.equal(list.filter((w) => w.kind === 'verdict-worse').length, 0);

  // When the readable pages all read worse, each one is a worry, and the overlapped page is not.
  const allWorse = M1_ROWS.map((x) => (x.slug === 'up-guide' ? { ...x, verdict: 'worse' } : x));
  const worse = week.worries({ snaps: { local: { data: { verdicts: allWorse } } }, today: TODAY });
  assert.deepEqual(
    worse
      .filter((w) => w.kind === 'verdict-worse')
      .map((w) => w.page)
      .sort(),
    ['/blog/down-guide', '/blog/up-guide']
  );
});

// ---------------------------------------------------------------- M2 and K4: Decay

// Daily page rows for an old snapshot: the stored windows end on 11 November, the daily rows on 10
// November. /blog/fading-guide loses half its views at the same place (lost demand); five other
// pages hold steady, so the middle page stays flat.
function decaySnapshot() {
  const pageDaily = [];
  const siteDaily = [];
  for (let d = '2026-08-20'; d <= '2026-11-10'; d = addDays(d, 1)) {
    const late = d >= '2026-10-14';
    pageDaily.push({ page: '/blog/fading-guide', date: d, impressions: late ? 10 : 20, clicks: 0, position: 6 });
    for (const p of ['a', 'b', 'c', 'd', 'e'])
      pageDaily.push({ page: `/blog/steady-${p}`, date: d, impressions: 10, clicks: 0, position: 8 });
    siteDaily.push({ date: d, impressions: 70, clicks: 0 });
  }
  return {
    pageDaily,
    siteDaily,
    windows: {
      cur: { start: '2026-10-15', end: '2026-11-11' },
      prev: { start: '2026-09-17', end: '2026-10-14' },
      d90: { start: '2026-08-14', end: '2026-11-11' },
    },
  };
}

test('M2, K4: one Decay card says the kind-of-drop recommendation and test everywhere, over two equal periods', () => {
  writeJson('state/items.json', {});
  snap('gsc', decaySnapshot(), { through: '2026-11-11' });
  snap('local', { livePages: [], verdicts: [], due: [], edits: [] });
  invalidate();
  const model = buildModel();
  const opp = model.opps.find((o) => o.type === 'slipping');
  assert.ok(opp, 'the fading page is a Decay card');
  assert.equal(opp.dropKind, 'lost-demand');
  const action =
    'Fewer people may be searching for this, so there may be nothing to fix. Leave it and check again later.';
  assert.equal(opp.action, action);
  assert.match(opp.test, /^Look at the page again after the next 28 days/);
  // Two periods of 28 days each, ending on the last day the daily rows hold: 280 before, 280 after
  // the cut would be 270 if the latest period were one day short.
  assert.equal(opp.evidence[0].prev.impressions, 28 * 20);
  assert.equal(opp.evidence[0].cur.impressions, 28 * 10);
  assert.match(opp.measured, /14 October to 10 November/);
  assert.ok(!/11 November/.test(opp.measured));
  assert.equal(opp.title, '/blog/fading-guide lost 50% of its search views');

  const card = work.opportunitiesList(model, { status: 'open' }).items.find((o) => o.id === opp.id);
  assert.equal(card.action, action);
  assert.match(card.brief, /Recommendation \(a hypothesis\): Fewer people may be searching/);
  assert.ok(!/stale/.test(JSON.stringify(card)));
  // Lost demand means there may be nothing to fix, so the page is watched and is not a worry.
  const view = work.weekView(model);
  assert.ok(!view.worries.some((x) => x.kind === 'slipping-page' && x.oppId === opp.id));
  const w = view.watching.find((x) => x.kind === 'slipping-page');
  assert.equal(w.fix, action);
  assert.match(w.watch, /fewer people may be searching for this\. There may be nothing to fix\./);
  const digest = buildDeskBrief(model, 'Which pages are slipping, and why?').text;
  assert.ok(digest.includes(action));
  assert.ok(!/gone stale/.test(digest));
});

test('K4: on a snapshot whose search totals are a day short, the searches comparison waits for the next refresh', async () => {
  const { queriesTable, searchView, QUERY_WAIT_NOTE } = await import('../lib/api/search.mjs');
  const { decayView } = await import('../lib/api/ext/insights.mjs');
  writeJson('state/items.json', {});
  snap(
    'gsc',
    {
      ...decaySnapshot(),
      queryCur: [{ query: 'made up search', clicks: 0, impressions: 40, position: 7 }],
      queryPrev: [{ query: 'made up search', clicks: 0, impressions: 90, position: 7 }],
    },
    { through: '2026-11-11' }
  );
  invalidate();
  const model = buildModel();
  const q = queriesTable(model, 28);
  assert.equal(q.comparable, false);
  assert.equal(q.rows[0].change, null);
  assert.equal(q.rows[0].movement, null);
  assert.equal(q.waitNote, QUERY_WAIT_NOTE);
  const v = searchView(model, { days: 28, metric: 'impressions' });
  assert.ok(v.notes.includes(QUERY_WAIT_NOTE));
  assert.equal(v.tiles.find((t) => t.key === 'searches').change, null);
  const d = decayView(model);
  assert.equal(d.queriesNote, QUERY_WAIT_NOTE);
  assert.equal(d.queries.decaying.length, 0);
});

// ---------------------------------------------------------------- M3: links in page text

test('M3: Site health and the Not indexed card give one page the same advice, and every count says what it counts', async () => {
  const { healthView } = await import('../lib/api/panels.mjs');
  writeJson('state/items.json', {});
  snap('gsc', { pageDaily: [], siteDaily: [] });
  snap('index', {
    pages: [
      {
        page: '/blog/linked-guide',
        verdict: 'not-indexed',
        reason: 'URL is unknown to Google',
        checkedAt: '2026-11-13T06:00:00Z',
      },
      {
        page: '/blog/lonely-guide',
        verdict: 'not-indexed',
        reason: 'Crawled - currently not indexed',
        checkedAt: '2026-11-13T06:00:00Z',
      },
      {
        page: '/legal-note',
        verdict: 'not-indexed',
        reason: "Excluded by 'noindex' tag",
        checkedAt: '2026-11-13T06:00:00Z',
      },
    ],
  });
  snap('local', {
    livePages: [{ page: '/blog/linked-guide' }, { page: '/blog/lonely-guide' }, { page: '/legal-note' }],
    inbound: {
      '/blog/linked-guide': ['/blog/a', '/blog/b', '/blog/c', '/blog/c', 'src/components/Footer.astro'],
      '/blog/lonely-guide': ['/blog/a'],
      '/legal-note': [],
    },
    verdicts: [],
    due: [],
    edits: [],
  });
  invalidate();
  const model = buildModel();
  const cards = new Map(model.opps.filter((o) => o.type === 'not-indexed').map((o) => [o.page, o]));
  assert.equal(cards.size, 3);
  assert.match(cards.get('/blog/linked-guide').action, /^Ask Google to index \/blog\/linked-guide in Search Console/);
  assert.match(cards.get('/blog/lonely-guide').action, /^Link to \/blog\/lonely-guide from two related pages/);
  assert.match(cards.get('/legal-note').action, /noindex instruction\)\. Decide whether \/legal-note should be found/);
  assert.match(
    cards.get('/blog/linked-guide').measured,
    /3 pages link to it in their page text \(menu and footer links are not counted\)\./
  );

  const h = healthView(model);
  const groupOf = (page) => h.issues.find((i) => i.urls.some((u) => u.page === page))?.id;
  assert.equal(groupOf('/blog/linked-guide'), 'not-indexed-linked');
  assert.equal(groupOf('/blog/lonely-guide'), 'not-indexed');
  assert.equal(groupOf('/legal-note'), 'not-indexed-excluded');
  const lonely = h.issues.flatMap((i) => i.urls).find((u) => u.page === '/blog/lonely-guide');
  assert.equal(
    lonely.detail,
    'Crawled - currently not indexed. 1 page links to it in their page text (menu and footer links are not counted).'
  );
});

// ---------------------------------------------------------------- M5: a run made with older rules

test("M5: a run made before a check changed says so once at the top, and its findings do not claim the week's edit", async () => {
  const { view } = await import('../lib/api/ext/audit.mjs');
  invalidate();
  const model = buildModel();
  const issue = (id, group, severity) => ({ id, group, severity, pages: [{ page: '/blog/sample-guide', clicks: 0 }] });
  const run = {
    startedAt: '2026-11-14T10:00:00.000Z',
    pagesChecked: 3,
    issues: [
      issue('title-long', 'content', 'low'),
      issue('html-over-200kb', 'performance', 'low'),
      issue('heading-skip', 'content', 'low'),
    ],
  };
  const a = view(model, run).audit;
  assert.equal(a.olderRules, 2);
  assert.equal(a.olderRulesNote, 'This run used older rules for 2 checks. Run the audit again.');
  const title = a.issues.find((i) => i.id === 'title-long');
  assert.equal(title.olderRule, true);
  assert.equal(title.editsPage, false);
  assert.ok(!/one page edit|one of that week's page changes/.test(JSON.stringify(title)));
  assert.match(title.steps.at(-1), /Run the audit again before acting on it/);
  const heading = a.issues.find((i) => i.id === 'heading-skip');
  assert.equal(heading.olderRule, false);
  assert.match(heading.steps.at(-1), /This uses one of that week's page changes: /);
  // A run saved by today's rules says nothing, whatever its date.
  const fresh = view(model, { ...run, rulesVersion: 2 }).audit;
  assert.equal(fresh.olderRules, 0);
  assert.equal(fresh.olderRulesNote, null);
});

// ---------------------------------------------------------------- M6: the page's own target in other words

test("M6: a search with the page's own target words, joined or ordered differently, is not a secondary keyword", async () => {
  const { secondaryView } = await import('../lib/api/ext/insights.mjs');
  writeJson('state/items.json', {});
  writeJson('state/targets.json', { adopted: [], ignored: [], priorities: {} });
  const qp = (query, impressions, position) => ({
    query,
    page: '/blog/made-up-rota',
    impressions,
    clicks: 0,
    position,
  });
  const qpCur = [
    qp('made up rota rules', 20, 5),
    qp('rules for the made up rota', 50, 9),
    qp('made up rota pay rules', 40, 11),
  ];
  snap('gsc', {
    pageDaily: [],
    siteDaily: [],
    qpCur,
    queryCur: qpCur.map(({ query, impressions, clicks, position }) => ({ query, impressions, clicks, position })),
    queryPrev: [],
  });
  snap('local', {
    livePages: [{ page: '/blog/made-up-rota' }],
    registry: [{ slug: 'made-up-rota', type: 'post', url: '/blog/made-up-rota', primaryKeyword: 'made up rota rules' }],
    verdicts: [],
    due: [],
    edits: [],
  });
  invalidate();
  const items = secondaryView(buildModel()).items.map((x) => x.query);
  assert.deepEqual(items, ['made up rota pay rules']);
});

// ---------------------------------------------------------------- K2: one eligibility function

test('K2: every list asks the one eligibility function and prints its words', async () => {
  const { secondaryView } = await import('../lib/api/ext/insights.mjs');
  const { pageRows } = await import('../lib/api/search.mjs');
  const { view } = await import('../lib/api/ext/audit.mjs');
  const { pageHold, holdFields } = await import('../lib/api/model.mjs');
  writeJson('state/items.json', {});
  writeJson('state/targets.json', { adopted: [], ignored: [], priorities: {} });
  const qp = (query, impressions, position) => ({ query, page: '/blog/held-guide', impressions, clicks: 0, position });
  const qpCur = [qp('held guide rota', 20, 5), qp('held guide rota pay', 40, 11)];
  snap('gsc', {
    pageDaily: [],
    siteDaily: [],
    qpCur,
    queryCur: qpCur.map(({ query, impressions, clicks, position }) => ({ query, impressions, clicks, position })),
    queryPrev: [],
  });
  snap('local', {
    livePages: [{ page: '/blog/held-guide' }, { page: '/blog/free-guide' }],
    registry: [{ slug: 'held-guide', type: 'post', url: '/blog/held-guide', primaryKeyword: 'held guide rota' }],
    contentEdits: [{ page: '/blog/held-guide', date: '2026-11-09', commit: 'h1', lines: 40 }],
    verdicts: [],
    due: [],
    edits: [],
  });
  invalidate();
  const model = buildModel();
  const held = pageHold(model, '/blog/held-guide');
  assert.equal(held.eligible, false);
  assert.match(held.text, /^Edited 9 November \(found in git, 40 lines\)\. Leave it until 7 December/);
  const sec = secondaryView(model).items.find((x) => x.query === 'held guide rota pay');
  assert.equal(sec.eligibility.text, held.text, 'not "Eligible now" and not "out of its 28 days"');
  assert.equal(sec.holdText, held.text);
  assert.match(sec.brief, /Leave it until 7 December/);
  const row = pageRows(model).find((r) => r.page === '/blog/held-guide');
  assert.equal(row.frozenUntil, '2026-12-07');
  assert.equal(row.holdText, held.text);
  const a = view(model, {
    startedAt: '2026-11-13T00:00:00.000Z',
    rulesVersion: 2,
    issues: [
      { id: 'heading-skip', group: 'content', severity: 'low', pages: [{ page: '/blog/held-guide', clicks: 0 }] },
    ],
  }).audit;
  assert.equal(a.issues[0].pages[0].holdText, held.text);
  assert.deepEqual(holdFields(model, '/blog/free-guide'), { frozenUntil: null, frozenUntilText: null, holdText: null });
});

// ---------------------------------------------------------------- K3: what counts as recently edited

test('K3: a git edit holds a page only from 15 changed lines in one commit, and not within 2 days after it was published', async () => {
  const life = await import('../lib/lifecycle.mjs');
  assert.equal(life.RECENT_EDIT_MIN_LINES, 15);
  const contentEdits = [
    // Two small commits on one day add up to 18 lines, but no one commit reaches 15.
    { page: '/blog/split-guide', date: '2026-11-09', commit: 's1', lines: 9 },
    { page: '/blog/split-guide', date: '2026-11-09', commit: 's2', lines: 9 },
    { page: '/blog/one-guide', date: '2026-11-09', commit: 'o1', lines: 15 },
    // A fix two days after the publish commit is part of publishing it.
    { page: '/blog/new-guide', date: '2026-11-06', commit: 'n1', lines: 60 },
    { page: '/blog/new-guide', date: '2026-11-08', commit: 'n2', lines: 70 },
    { page: '/blog/later-guide', date: '2026-11-08', commit: 'l1', lines: 70 },
  ];
  const published = new Map([
    ['/blog/new-guide', ['2026-11-06']],
    ['/blog/later-guide', ['2026-11-05']],
  ]);
  const recent = life.recentEdits({ contentEdits, today: TODAY, published });
  assert.equal(recent.get('/blog/split-guide').edit, null);
  assert.deepEqual(recent.get('/blog/split-guide').touched, [{ date: '2026-11-09', lines: 18 }]);
  assert.equal(recent.get('/blog/one-guide').edit.date, '2026-11-09');
  assert.equal(recent.has('/blog/new-guide'), false);
  assert.equal(recent.get('/blog/later-guide').edit.date, '2026-11-08', 'three days after publish counts');
});

// ---------------------------------------------------------------- S8, S9, K5: counts missing, git unread

const route = async (file, path) => {
  const mod = await import(file);
  const r = mod.routes.find((x) => x.method === 'GET' && x.path === path.split('?')[0]);
  return r.handler({ url: new URL(`http://127.0.0.1${path}`) });
};

test('S8, S9: with the query-only pull emptied, every affected reply says so once, and counts are a dash, not 0', async () => {
  const { COUNTS_MISSING_NOTE } = await import('../lib/query-counts.mjs');
  const { navCounts } = await import('../lib/api/ext/overview.mjs');
  const { searchView } = await import('../lib/api/search.mjs');
  const { storedExplore } = await import('../lib/explore.mjs');
  writeJson('state/items.json', {});
  const qpCur = [
    { query: 'made up split search', page: '/blog/one-guide', impressions: 40, clicks: 0, position: 6 },
    { query: 'made up split search', page: '/blog/two-guide', impressions: 35, clicks: 0, position: 7 },
  ];
  const gsc = { pageDaily: [], siteDaily: [], qpCur, queryCur: [], queryPrev: [] };
  snap('gsc', gsc);
  // A local snapshot pulled before the desk read git: no contentEdits list at all.
  snap('local', {
    livePages: [{ page: '/blog/one-guide' }, { page: '/blog/two-guide' }],
    verdicts: [],
    due: [],
    edits: [],
  });
  invalidate();
  const model = buildModel();
  const nav = navCounts(model);
  assert.equal(nav.cannibalization, null);
  assert.equal(nav.contentGaps, null);
  const once = (w) => (w ?? []).filter((x) => x === COUNTS_MISSING_NOTE).length;
  assert.equal(once(work.opportunitiesView(model, {}).warnings), 1);
  const wk = work.weekView(model);
  assert.equal(once(wk.warnings), 1);
  assert.ok(wk.warnings.includes('Recent edits from git have not been read yet. Refresh to read them.'));
  const s = searchView(model, { days: 28, metric: 'impressions' });
  assert.equal(once(s.warnings), 1);
  assert.equal(s.brandSplit, null);
  assert.equal(storedExplore(gsc, { dim: 'query', days: 28, through: '2026-11-13' }), null, 'pulled live instead');
  for (const r of ['runner-up', 'secondary-keywords', 'cannibalization', 'content-gaps']) {
    const v = await route('../lib/api/ext/insights.mjs', `/api/insights/${r}`);
    assert.equal(once(v.warnings), 1, r);
    assert.ok(!/empty/i.test((v.warnings ?? []).join(' ')), `${r} says no "empty" sentence`);
  }
  const t = await route('../lib/api/ext/targets.mjs', '/api/targets?tab=targeted');
  assert.equal(once(t.warnings), 1);
});

test('K5: a target the query-only pull does not hold shows no number and a note, never page rows added up', async () => {
  writeJson('state/items.json', {});
  writeJson('state/targets.json', { adopted: [], ignored: [], priorities: {} });
  const qpCur = [
    { query: 'made up target one', page: '/blog/one-guide', impressions: 40, clicks: 0, position: 6 },
    { query: 'made up target one', page: '/blog/two-guide', impressions: 35, clicks: 0, position: 9 },
    { query: 'made up target two', page: '/blog/two-guide', impressions: 50, clicks: 0, position: 4 },
  ];
  snap('gsc', {
    pageDaily: [],
    siteDaily: [],
    qpCur,
    queryCur: [{ query: 'made up target two', impressions: 48, clicks: 0, position: 4 }],
    queryPrev: [],
  });
  snap('local', {
    livePages: [{ page: '/blog/one-guide' }, { page: '/blog/two-guide' }],
    registry: [
      { slug: 'one-guide', url: '/blog/one-guide', primaryKeyword: 'made up target one' },
      { slug: 'two-guide', url: '/blog/two-guide', primaryKeyword: 'made up target two' },
      { slug: 'three-guide', url: '/blog/three-guide', primaryKeyword: 'made up target three' },
    ],
    contentEdits: [],
    verdicts: [],
    due: [],
    edits: [],
  });
  invalidate();
  const t = await route('../lib/api/ext/targets.mjs', '/api/targets?tab=targeted');
  const by = (k) => t.rows.find((r) => r.keyword === k);
  assert.equal(by('made up target one').impressions, null, 'not 75');
  assert.equal(by('made up target one').position, null);
  assert.match(by('made up target one').noTotalNote, /only per page/);
  assert.equal(by('made up target two').impressions, 48);
  assert.equal(by('made up target three').impressions, 0, 'a search Google did not show at all');
  assert.ok(t.warnings.some((w) => /^1 keyword shows no times shown or place/.test(w)));
});

test('K4: the stored 28-day searches on a short snapshot are not compared, and say why', async () => {
  const { storedExplore } = await import('../lib/explore.mjs');
  const { QUERY_WAIT_NOTE } = await import('../lib/query-counts.mjs');
  const gsc = {
    ...decaySnapshot(),
    queryCur: [{ query: 'made up search', clicks: 0, impressions: 40, position: 7 }],
    queryPrev: [{ query: 'made up search', clicks: 0, impressions: 90, position: 7 }],
  };
  gsc.windows = { ...gsc.windows, cur: { start: '2026-10-15', end: '2026-11-10' } };
  const r = storedExplore(gsc, { dim: 'query', days: 28, through: '2026-11-10' });
  assert.equal(r.comparable, false);
  assert.equal(r.waitNote, QUERY_WAIT_NOTE);
});

// ---------------------------------------------------------------- S7: the five and a held page

test('S7: choosing a page git shows edited lately for the five is refused with 409, unless override', async () => {
  const { chooseTop5 } = await import('../lib/api/actions.mjs');
  writeJson('state/items.json', {});
  writeJson('state/weeks.json', {});
  const qpCur = [{ query: 'made up held search', page: '/blog/held-guide', impressions: 200, clicks: 1, position: 12 }];
  snap('gsc', {
    pageDaily: [],
    siteDaily: [],
    qpCur,
    queryCur: [{ query: 'made up held search', impressions: 200, clicks: 1, position: 12 }],
    queryPrev: [],
  });
  snap('local', {
    livePages: [{ page: '/blog/held-guide' }],
    contentEdits: [{ page: '/blog/held-guide', date: '2026-11-09', commit: 'h1', lines: 40 }],
    verdicts: [],
    due: [],
    edits: [],
  });
  invalidate();
  const opp = buildModel().opps.find((o) => o.isPageEdit && o.page === '/blog/held-guide');
  assert.ok(opp, 'a page edit card on the held page');
  let refused = null;
  try {
    chooseTop5([`opp:${opp.id}`]);
  } catch (e) {
    refused = e;
  }
  assert.equal(refused?.status, 409);
  assert.equal(refused.extra.recentlyEdited[0].page, '/blog/held-guide');
  assert.match(refused.message, /found in git, 40 lines/);
  const ok = chooseTop5([`opp:${opp.id}`], { override: true });
  assert.ok(ok.top5.some((c) => c.oppId === opp.id));
});

// ---------------------------------------------------------------- S10: ready only when the data covers the after window

test('S10: an edit is ready to judge only when Search Console covers its 28 days after; the rest wait for a date', () => {
  // Search Console runs through 10 November. The 12 October change needs data through 9 November (ready);
  // the 14 October change needs it through 11 November (waiting).
  const due = [
    { slug: 'early-guide', url: '/blog/early-guide', date: '2026-10-12', commits: [{ hash: 'e1' }] },
    { slug: 'late-guide', url: '/blog/late-guide', date: '2026-10-14', commits: [{ hash: 'l1' }] },
  ];
  const split = week.splitDue(due, '2026-11-10');
  assert.deepEqual(
    split.ready.map((d) => d.slug),
    ['early-guide']
  );
  assert.deepEqual(
    split.waiting.map((d) => d.slug),
    ['late-guide']
  );
  assert.equal(split.waitThrough, '2026-11-11');
  const [card] = week
    .proposeTop5({ plan: null, due, through: '2026-11-10', today: TODAY })
    .filter((c) => c.slot === 'verdict');
  assert.equal(card.title, 'Check whether one past page change worked');
  assert.match(card.measured, /^1 page change from 1 commit/);
  assert.match(card.measured, /1 more is waiting for Search Console data through 11 November\.$/);

  writeJson('state/items.json', {});
  snap(
    'gsc',
    { pageDaily: [], siteDaily: [{ date: '2026-11-10', impressions: 1, clicks: 0 }] },
    { through: '2026-11-10' }
  );
  snap('local', { livePages: [], verdicts: [], due, edits: [], contentEdits: [] });
  invalidate();
  const model = buildModel();
  const v = work.weekView(model).nextVerdict;
  assert.equal(v.ready, true);
  assert.equal(v.note, '1 page change from 1 commit can be read; 1 more waits for data through 11 November');
  const r = work.resultsView(model);
  assert.deepEqual(
    r.due.map((d) => d.dataReady),
    [true, false]
  );
  assert.equal(r.due[1].waitingText, 'Waiting for data through 11 November');
});

// ---------------------------------------------------------------- S11, S12

test('S11: the 90-day Queries CSV carries the added-up note in a column when the 90-day pull is missing', async () => {
  const { csvFor } = await import('../lib/api/csv.mjs');
  const { SUMMED_NOTE } = await import('../lib/api/search.mjs');
  const qp90 = [
    { query: 'made up ninety', page: '/blog/a', impressions: 30, clicks: 0, position: 8 },
    { query: 'made up ninety', page: '/blog/b', impressions: 20, clicks: 0, position: 9 },
  ];
  snap('gsc', { pageDaily: [], siteDaily: [], qpCur: [], qp90, queryCur: [], queryPrev: [] });
  invalidate();
  const lines = csvFor(buildModel(), 'queries', { range: '90' }).trim().split('\r\n');
  assert.match(lines[0], /,note$/);
  assert.ok(lines[1].endsWith(`,${SUMMED_NOTE}`) || lines[1].endsWith(`,"${SUMMED_NOTE}"`), lines[1]);
});

test('S12: pages shown together read "mostly" only from 1.6 times the searches', async () => {
  const { cannibalizationView } = await import('../lib/api/ext/insights.mjs').then((m) => ({
    cannibalizationView: m.routes.find((r) => r.path === '/api/insights/cannibalization').handler,
  }));
  const qp = (page, impressions) => ({ query: 'made up together search', page, impressions, clicks: 0, position: 5 });
  const qpCur = [qp('/blog/a-guide', 40), qp('/blog/b-guide', 30)];
  const real = (n) => [{ query: 'made up together search', impressions: n, clicks: 0, position: 5 }];
  snap('local', {
    livePages: [{ page: '/blog/a-guide' }, { page: '/blog/b-guide' }],
    verdicts: [],
    due: [],
    edits: [],
  });
  // 70 views over 50 searches is 1.4: often. Over 40 it is 1.75: mostly.
  for (const [n, word] of [
    [50, 'often'],
    [40, 'mostly'],
  ]) {
    snap('gsc', { pageDaily: [], siteDaily: [], qpCur, queryCur: real(n), queryPrev: [] });
    invalidate();
    const v = cannibalizationView({ url: new URL('http://127.0.0.1/api/insights/cannibalization') });
    assert.match(v.together[0].note, new RegExp(`So they ${word} appeared together`));
  }
});
