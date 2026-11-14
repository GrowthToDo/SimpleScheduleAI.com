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
  const w = work.weekView(model).worries.find((x) => x.kind === 'slipping-page');
  assert.equal(w.fix, action);
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
  assert.ok(!/one page edit/.test(JSON.stringify(title)));
  assert.match(title.steps.at(-1), /Run the audit again before acting on it/);
  const heading = a.issues.find((i) => i.id === 'heading-skip');
  assert.equal(heading.olderRule, false);
  assert.match(heading.steps.at(-1), /This counts as that week's one page edit\./);
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
