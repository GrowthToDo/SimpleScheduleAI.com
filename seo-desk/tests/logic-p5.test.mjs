import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Package 5 (2026-11-15): the week's priorities are the real top things to do this week, and nothing
// moot is shown as a worry. Every page, phrase and number here is invented.

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-p5-'));
const DATA = path.join(root, 'data');
const REPO = path.join(root, 'repo');
fs.mkdirSync(path.join(REPO, 'docs/seo'), { recursive: true });
fs.writeFileSync(path.join(REPO, 'docs/seo/brand-terms.json'), JSON.stringify(['examplebrand']));
process.env.SEO_DESK_DATA = DATA;
process.env.SEO_DESK_REPO = REPO;
process.env.SEO_DESK_TODAY = '2026-11-18';

const week = await import('../lib/week.mjs');
const rules = await import('../lib/rules.mjs');
const { THRESHOLDS, DEFAULT_MONEY_PAGES } = await import('../lib/config.mjs');
const { addDays } = await import('../lib/dates.mjs');
const { buildModel, invalidate } = await import('../lib/api/model.mjs');
const { weekView } = await import('../lib/api/work.mjs');
const { decayView, gapsView } = await import('../lib/api/ext/insights.mjs');
const { itemAction } = await import('../lib/api/actions.mjs');
const { writeJson } = await import('../lib/store.mjs');
const { cardLines } = await import('../static/views/print-week.js');

const TODAY = '2026-11-18'; // a Wednesday; the week began Monday 16 November
const noDash = (v) => assert.equal(/[–—]/.test(JSON.stringify(v)), false, 'no em or en dash');

// ---------------------------------------------------------------- part 1: the five

const opp = (id, total, over = {}) => ({
  id,
  type: 'near-page-one',
  page: `/blog/${id}`,
  query: `${id} phrase`,
  title: `Title ${id}`,
  measured: `From 1 to 28 October, /blog/${id} showed up 80 times. More words follow.`,
  action: `Action ${id}`,
  test: `Test ${id}`,
  isPageEdit: true,
  score: { total, parts: [] },
  ...over,
});
const plan = {
  file: 'docs/seo/plan.md',
  error: null,
  posts: [
    { n: 1, done: true, title: 'Written post', keyword: 'written phrase' },
    { n: 2, done: false, title: 'Next post', keyword: 'next post phrase' },
  ],
  improve: [],
};
const broken = (kind, n) => ({ id: `${kind}:${n}`, kind, title: `${kind} ${n}`, measured: 'm', fix: 'f' });
const dueReady = [{ date: '2026-10-01', slug: 'some-post', url: '/blog/some-post', kind: 'edit' }];

test('P1: the five run broken things (two at most), the next post, the page edit, a ready verdict, then tasks', () => {
  const ranked = [
    opp('edit-best', 90),
    opp('gap', 95, { type: 'unserved', isPageEdit: false, page: null }),
    opp('ask-ai', 85, { type: 'ai-gap', isPageEdit: false }),
    opp('links', 40, { type: 'needs-links', isPageEdit: false }),
    opp('idx-a', 30, { type: 'not-indexed', isPageEdit: false, inbound: 4, adviceGroup: 'not-indexed-linked' }),
    opp('idx-b', 20, { type: 'not-indexed', isPageEdit: false, inbound: 1, adviceGroup: 'not-indexed' }),
  ];
  const cards = week.proposeTop5({
    plan,
    ranked,
    due: dueReady,
    worries: [
      broken('source-failed', 'gsc'),
      broken('dropped-from-index', '/blog/x'),
      broken('crawl-issue', '/blog/y'),
      { ...broken('slipping-page', '/blog/z'), oppId: 'zz', isPageEdit: true, page: '/blog/z' },
    ],
    openWork: [
      { section: 'Open after the last session', text: 'Set up alerts for the rival names.', blockedOnFounder: false },
    ],
    frozen: new Map(),
    items: {},
    today: TODAY,
    size: 5,
    through: '2026-11-15',
  });
  assert.deepEqual(
    cards.map((c) => c.id),
    ['source-failed:gsc', 'dropped-from-index:/blog/x', 'plan-post-2', 'opp:edit-best', 'verdict-due']
  );
  for (const c of cards) {
    assert.ok(typeof c.why === 'string' && c.why.length > 10, `${c.id} says why it is here`);
    noDash(c);
  }
  assert.match(cards[0].why, /broken/);
  assert.match(cards[2].why, /next post in your plan/);
  assert.match(
    cards[3].why,
    /^It is this week's big page change: the best big page edit that can go in now\. From 1 to 28 October/
  );
  // The 3 or 5 setting is a ceiling: with room, the tasks come next, never a "write a post" idea.
  const more = week.proposeTop5({
    plan: null,
    ranked,
    due: [],
    worries: [],
    openWork: [
      { section: 'Open after the last session', text: 'Set up alerts for the rival names.', blockedOnFounder: false },
    ],
    frozen: new Map(),
    items: {},
    today: TODAY,
    size: 5,
  });
  assert.deepEqual(
    more.map((c) => c.id),
    ['opp:edit-best', more[1].id, 'opp:links', more[3].id]
  );
  assert.match(more[1].id, /^ask-to-index:/);
  assert.match(more[1].action, /\/blog\/idx-a/);
  assert.doesNotMatch(more[1].action, /idx-b/, 'only a page with 3 or more links is asked to be indexed');
  assert.equal(more[3].source, 'open-work');
  assert.ok(!more.some((c) => c.oppId === 'gap' || c.oppId === 'ask-ai'), 'no write-a-post idea, no AI card');
});

test("P1: when the week's big change is used there is no big card, only the editStatus line", () => {
  const frozen = new Map([['/blog/edited', { since: '2026-11-16', until: '2026-12-14', why: 'w' }]]);
  const cards = week.proposeTop5({
    plan,
    ranked: [opp('edit-best', 90)],
    frozen,
    today: TODAY,
    size: 5,
  });
  assert.deepEqual(
    cards.map((c) => c.id),
    ['plan-post-2']
  );
  assert.equal(cards.filter((c) => c.slot === 'page-edit').length, 0);
  assert.equal(
    week.editStatusOf(frozen, TODAY),
    "This week's big change is used (/blog/edited, 16 November); the small one is still open."
  );
  assert.equal(week.editStatusOf(new Map(), TODAY), null);
});

test('P1: a verdict card only when a change is ready to judge now', () => {
  const pending = [{ page: '/blog/p', judgeFrom: '2026-11-25' }];
  const none = week.proposeTop5({ plan: null, due: [], pending, today: TODAY });
  assert.equal(none.length, 0);
  const notCovered = week.proposeTop5({ plan: null, due: dueReady, through: '2026-10-20', today: TODAY });
  assert.equal(notCovered.length, 0, 'Search Console does not cover the 28 days after yet');
  const ready = week.proposeTop5({ plan: null, due: dueReady, through: '2026-11-15', today: TODAY });
  assert.deepEqual(
    ready.map((c) => c.id),
    ['verdict-due']
  );
});

test('P1: a slipping page is the page edit only when it is a real worry', () => {
  const ranked = [opp('slip', 99, { type: 'slipping' }), opp('runner', 50)];
  const notWorry = week.proposeTop5({ plan: null, ranked, today: TODAY });
  assert.deepEqual(
    notWorry.map((c) => c.id),
    ['opp:runner']
  );
  const worry = {
    id: 'slipping-page:/blog/slip',
    kind: 'slipping-page',
    page: '/blog/slip',
    oppId: 'slip',
    isPageEdit: true,
    title: 'Slip',
    measured: 'It fell week by week.',
    fix: 'Strengthen it.',
  };
  const real = week.proposeTop5({ plan: null, ranked, worries: [worry], today: TODAY });
  assert.deepEqual(
    real.map((c) => c.id),
    ['opp:slip']
  );
  assert.match(
    real[0].why,
    /^It is this week's big page change: the best big page edit that can go in now\. It fell week by week\./
  );
});

test('P1: the technical audit gives one broken card for critical and high, and setup tasks of medium or more', () => {
  const audit = {
    startedAt: '2026-11-17T06:00:00.000Z',
    issues: [
      { id: 'status-not-200', name: 'Page does not open normally', severity: 'critical', setup: false, pages: 2 },
      { id: 'meta-missing', name: 'No description', severity: 'high', setup: false, pages: 5 },
      { id: 'header-missing', name: 'A server header is missing', severity: 'medium', setup: true, pages: 1 },
      { id: 'tiny-thing', name: 'A tidy-up', severity: 'low', setup: true, pages: 1 },
    ],
  };
  const cards = week.proposeTop5({ plan: null, audit, today: TODAY });
  assert.equal(cards.length, 2);
  assert.equal(cards[0].slot, 'broken');
  assert.match(cards[0].title, /2 technical audit findings/);
  assert.match(cards[0].measured, /Page does not open normally/);
  assert.equal(cards[1].source, 'audit');
  assert.match(cards[1].title, /A server header is missing/);
  assert.doesNotMatch(JSON.stringify(cards), /A tidy-up/);
});

test('P1: open work rows that are held, settled, scheduled for later, notes or about posts are not tasks this week', () => {
  const rows = [
    { section: 'Positioning', text: 'P1 stays held until the interviews settle it.', blockedOnFounder: false },
    { section: 'Positioning', text: 'The copy calls are settled (founder, 2026-08-21).', blockedOnFounder: false },
    { section: 'Scheduled, do not run early', text: '2026-12-01: Monthly audit.', blockedOnFounder: false },
    {
      section: 'Open after the last session',
      text: 'Standardise the posts? Most open on prose.',
      blockedOnFounder: false,
    },
    { section: 'Housekeeping', text: 'A stray empty file sits in the repo root.', blockedOnFounder: false },
    { section: 'Strategy files with known gaps', text: 'A ladder was never walked.', blockedOnFounder: false },
    { section: 'Content pipeline', text: 'Finish the invented draft.', blockedOnFounder: false },
    {
      section: 'Open after the last session',
      text: 'The 12 drafts: three are better than new.',
      blockedOnFounder: false,
    },
    {
      section: 'Open after the last session',
      text: 'A claim is unsupported until five are profiled.',
      blockedOnFounder: false,
    },
    { section: 'Open after the last session', text: 'Submit the site to two directories.', blockedOnFounder: false },
  ];
  assert.deepEqual(
    rows.map((r) => week.isOpenWorkTask(r, TODAY)),
    [false, false, false, false, false, false, false, false, false, true]
  );
  assert.equal(
    week.isOpenWorkTask({ section: 'Scheduled, do not run early', text: '2026-11-19: Read the crawl report.' }, TODAY),
    true,
    'a scheduled row dated inside this week is due'
  );
});

// ---------------------------------------------------------------- part 2: gaps

const cfg = (over = {}) => ({
  thresholds: THRESHOLDS,
  moneyPages: DEFAULT_MONEY_PAGES,
  brands: ['examplebrand'],
  today: TODAY,
  ...over,
});
const W = { cur: { start: '2026-10-18', end: '2026-11-14' }, prev: { start: '2026-09-20', end: '2026-10-17' } };
const qp = (query, page, impressions, position) => ({ query, page, clicks: 0, impressions, position });
const realOf = (rows) => {
  const m = new Map();
  for (const r of rows) m.set(r.query, (m.get(r.query) ?? 0) + r.impressions);
  return [...m].map(([query, impressions]) => ({ query, impressions, clicks: 0, position: 30 }));
};
const gscWith = (qpCur, extra = {}) => ({
  siteDaily: [],
  pageDaily: [],
  qpCur,
  qpPrev: [],
  queryCur: realOf(qpCur),
  queryPrev: [],
  windows: W,
  ...extra,
});

test('P2: a search a live page already gets 10 views for is that page item, not a gap', () => {
  const snaps = {
    gsc: gscWith([
      qp('quilted ward rota guide', '/blog/rota-basics', 14, 31),
      qp('quilted ward rota guide', '/blog/other', 20, 48),
      qp('velvet roster planning', '/blog/elsewhere', 6, 40),
      qp('velvet roster planning', '/blog/not-live', 30, 44),
    ]),
    local: {
      livePages: [{ page: '/blog/rota-basics' }, { page: '/blog/other' }, { page: '/blog/elsewhere' }],
      plan: { posts: [] },
      registry: [],
    },
  };
  const split = rules.unservedSplit(snaps, cfg());
  assert.deepEqual(
    split.pages.map((o) => [o.type, o.page, o.query]),
    [['strengthen-page', '/blog/rota-basics', 'quilted ward rota guide']]
  );
  const [p] = split.pages;
  assert.equal(p.isPageEdit, true);
  assert.match(p.measured, /Google already shows \/blog\/rota-basics for this search, at position 31\.0\./);
  assert.match(p.measured, /A new post would compete with it\. If the search matters, strengthen that page\./);
  assert.deepEqual(
    split.gaps.map((o) => o.query),
    ['velvet roster planning']
  );
  assert.match(split.gaps[0].action, /^Consider adding a post on "velvet roster planning" to the plan\./);
  assert.deepEqual(
    rules.detectStrengthenPage(snaps, cfg()).map((o) => o.page),
    ['/blog/rota-basics']
  );
  assert.deepEqual(
    rules.detectUnserved(snaps, cfg()).map((o) => o.query),
    ['velvet roster planning']
  );
  noDash(split);
});

test('P2: a search the plan will cover is dropped and counted; a targeted one is its page job', () => {
  // Each search shows four pages 8 times each, so no page has the 10 views that would make it the page's job.
  const four = (query, position) => ['a', 'b', 'c', 'd'].map((x) => qp(query, `/blog/far-${x}`, 8, position));
  const rows = [
    ...four('amber shift handover checklist', 50),
    ...four('cobalt float pool budget', 52),
    ...four('lilac night cover tips', 55),
  ];
  const snaps = {
    gsc: gscWith(rows),
    local: {
      livePages: [...['a', 'b', 'c', 'd'].map((x) => ({ page: `/blog/far-${x}` })), { page: '/blog/float-pool-costs' }],
      plan: {
        posts: [
          { n: 4, done: false, title: 'Handovers', keyword: 'shift handover checklist' },
          { n: 1, done: true, title: 'Old', keyword: 'lilac night cover tips' },
        ],
      },
      registry: [],
    },
  };
  const c = cfg({ targets: [{ keyword: 'float pool budget planning', page: '/blog/float-pool-costs' }] });
  const split = rules.unservedSplit(snaps, c);
  assert.deepEqual(
    split.planned.map((x) => x.query),
    ['amber shift handover checklist']
  );
  assert.deepEqual(
    split.pages.map((o) => [o.page, o.query]),
    [['/blog/float-pool-costs', 'cobalt float pool budget']]
  );
  assert.match(split.pages[0].measured, /does not rank yet for it/);
  assert.deepEqual(
    split.gaps.map((o) => o.query),
    ['lilac night cover tips'],
    'a written post does not cover a search'
  );
});

// ---------------------------------------------------------------- part 3: the spike check

// Four weeks of daily rows from `start`, each week's views spread over its 7 days (the remainder on day 1).
const weeksOfRows = (page, start, weeks, position = 8) => {
  const out = [];
  weeks.forEach((total, w) => {
    for (let d = 0; d < 7; d++) {
      const base = Math.floor(total / 7);
      const imp = base + (d === 0 ? total - base * 7 : 0);
      out.push({ page, date: addDays(start, w * 7 + d), clicks: 0, impressions: imp, position });
    }
  });
  return out;
};
const steady = (n) =>
  Array.from({ length: n }, (_, i) => [
    ...weeksOfRows(`/blog/steady-${i}`, W.prev.start, [100, 100, 100, 100]),
    ...weeksOfRows(`/blog/steady-${i}`, W.cur.start, [100, 100, 100, 100]),
  ]).flat();

const spikeDaily = () => [
  ...steady(6),
  // One busy week: 8, 121, 28 and 3 views, then 9 in all. Without the busy week the earlier period is 47.
  ...weeksOfRows('/blog/one-busy-week', W.prev.start, [8, 121, 28, 3]),
  ...weeksOfRows('/blog/one-busy-week', W.cur.start, [3, 2, 2, 2]),
  // A steady fall.
  ...weeksOfRows('/blog/steady-fall', W.prev.start, [122, 185, 153, 143], 7),
  ...weeksOfRows('/blog/steady-fall', W.cur.start, [91, 84, 47, 64], 9.5),
  // A busy week, but even without it the page fell far enough.
  ...weeksOfRows('/blog/busy-and-falling', W.prev.start, [100, 400, 100, 100]),
  ...weeksOfRows('/blog/busy-and-falling', W.cur.start, [10, 10, 10, 10]),
];

test('P3: a page whose earlier period had one busy week is not decaying; a steady fall is, with its weeks', () => {
  const snaps = { gsc: gscWith([], { pageDaily: spikeDaily() }), local: null };
  const out = rules.detectSlipping(snaps, cfg());
  assert.deepEqual(out.map((o) => o.page).sort(), ['/blog/busy-and-falling', '/blog/steady-fall']);
  const fall = out.find((o) => o.page === '/blog/steady-fall');
  assert.match(fall.title, /lost 53%/, 'the percentage shown stays the plain one');
  assert.match(fall.measured, /122, 185, 153 and 143 times in the earlier weeks, and 91, 84, 47 and 64 in the latest/);
  const busy = rules.busyWeekPages(snaps, cfg());
  assert.deepEqual(
    busy.map((b) => b.page),
    ['/blog/one-busy-week']
  );
  assert.equal(busy[0].prev, 160);
  assert.equal(busy[0].adjusted, 47);
  assert.equal(busy[0].cur, 9);
  assert.deepEqual(busy[0].week, { start: addDays(W.prev.start, 7), end: addDays(W.prev.start, 13), views: 121 });
});

const snap = (source, data, extra = {}) =>
  writeJson(`snap/${source}.json`, {
    source,
    ok: true,
    status: 'fresh',
    pulledAt: '2026-11-17T06:00:00.000Z',
    through: '2026-11-14',
    error: null,
    data,
    ...extra,
  });

function modelFixture({ local = {}, items = {}, qpCur = [] } = {}) {
  fs.rmSync(DATA, { recursive: true, force: true });
  snap('gsc', gscWith(qpCur, { pageDaily: spikeDaily() }));
  snap('local', {
    livePages: [
      { page: '/blog/one-busy-week' },
      { page: '/blog/steady-fall' },
      { page: '/blog/busy-and-falling' },
      ...Array.from({ length: 6 }, (_, i) => ({ page: `/blog/steady-${i}` })),
    ],
    registry: [],
    plan: { file: null, error: null, posts: [], improve: [] },
    openWork: [],
    edits: [],
    contentEdits: [],
    verdicts: [],
    due: [],
    googleUpdates: [
      {
        kind: 'ranking',
        start: addDays(W.prev.start, 8),
        end: addDays(W.prev.start, 20),
        title: 'Invented core update',
      },
    ],
    ...local,
  });
  writeJson('state/items.json', items);
  invalidate();
  return buildModel();
}

test('P3: the Decay page folds a one busy week page under its own group, with the update as a caution', () => {
  const m = modelFixture();
  const d = decayView(m);
  assert.deepEqual(d.items.map((o) => o.page).sort(), ['/blog/busy-and-falling', '/blog/steady-fall']);
  assert.equal(d.count, 2);
  assert.deepEqual(
    d.busyWeek.map((b) => b.page),
    ['/blog/one-busy-week']
  );
  const b = d.busyWeek[0];
  assert.match(b.text, /121 of the 160 times/);
  assert.match(b.text, /47/);
  assert.match(b.text, /9 times/);
  assert.match(b.caution, /Invented core update/);
  assert.match(b.caution, /does not show the update caused it/);
  assert.ok(d.busyWeekNote);
  noDash(d.busyWeek);
  const w = weekView(m);
  assert.ok(![...w.worries, ...w.watching].some((x) => x.page === '/blog/one-busy-week'), 'never a worry');
});

test('a one-line change that only waits for its verdict does not hide a real drop: the page stays a worry', () => {
  const m = modelFixture({
    local: {
      edits: [{ page: '/blog/steady-fall', date: '2026-11-03', kind: 'edit', subject: 'fix: a count' }],
      contentEdits: [
        { page: '/blog/steady-fall', date: '2026-11-03', commit: 'abc', lines: 2, subject: 'fix: a count' },
      ],
    },
  });
  const w = weekView(m);
  // Two changed lines are not an edit that holds a page (15 lines or more is), so the drop is shown.
  assert.ok(
    w.worries.some((x) => x.page === '/blog/steady-fall'),
    'it needs a look'
  );
  assert.ok(!w.watching.some((x) => x.page === '/blog/steady-fall'));
});

test('P3: a slipping page with a real edit found in git is watched until its 28 days are over', () => {
  const m = modelFixture({
    local: {
      contentEdits: [
        { page: '/blog/steady-fall', date: '2026-11-03', commit: 'abc', lines: 40, subject: 'content: a rewrite' },
      ],
    },
  });
  const w = weekView(m);
  assert.ok(!w.worries.some((x) => x.page === '/blog/steady-fall'));
  const watched = w.watching.find((x) => x.page === '/blog/steady-fall');
  assert.ok(watched, 'it is watched');
  assert.match(watched.watch, /Edited on 3 November, so it is too early to judge\. Look again on 1 December\./);
  // Part 4: its main button is Leave it, until the look-again date.
  assert.deepEqual(watched.leaveIt, { until: '2026-12-01', untilText: '1 December' });
});

test('P3: a slipping page the plan already has an open improvement for is watched, not a worry', () => {
  const m = modelFixture({
    local: {
      plan: {
        file: 'docs/seo/plan.md',
        error: null,
        posts: [],
        improve: [{ page: '/blog/steady-fall', done: false, search: 's', todo: 'Add an invented section.' }],
      },
    },
  });
  const w = weekView(m);
  assert.ok(!w.worries.some((x) => x.page === '/blog/steady-fall'));
  const watched = w.watching.find((x) => x.page === '/blog/steady-fall');
  assert.match(watched.watch, /Your plan already lists a change for this page \(Add an invented section\)/);
  // The plan row is the week's page edit, so the page is worked on once, through the plan.
  assert.deepEqual(
    w.top5.filter((c) => c.isPageEdit).map((c) => c.id),
    ['plan-improve-/blog/steady-fall']
  );
});

// ---------------------------------------------------------------- part 4: Leave it

test('P4: Leave it snoozes a watched card until its date and records no page edit and no freeze', () => {
  const m0 = modelFixture({
    local: {
      contentEdits: [
        { page: '/blog/steady-fall', date: '2026-11-03', commit: 'abc', lines: 40, subject: 'content: a rewrite' },
      ],
    },
  });
  const watched = weekView(m0).watching.find((x) => x.page === '/blog/steady-fall');
  const r = itemAction(watched.id, { action: 'snooze', until: watched.leaveIt.until });
  assert.equal(r.item.status, 'snoozed');
  assert.equal(r.freeze, undefined);
  const m1 = buildModel();
  assert.equal(m1.frozen.has('/blog/steady-fall'), false, 'no freeze');
  const w = weekView(m1);
  assert.equal(w.editStatus, null, "this week's page edit is still unused");
  assert.ok(![...w.worries, ...w.watching].some((x) => x.page === '/blog/steady-fall'), 'it leaves until the date');
});

test('P4: a lost demand Decay item offers Leave it for 28 days', () => {
  // /blog/busy-and-falling held its place while its views fell: lost demand. /blog/steady-fall lost place.
  const d = decayView(modelFixture({}));
  const byPage = new Map(d.items.map((o) => [o.page, o]));
  assert.equal(byPage.get('/blog/busy-and-falling').dropKind, 'lost-demand');
  assert.deepEqual(byPage.get('/blog/busy-and-falling').leaveIt, { until: '2026-12-16', untilText: '16 December' });
  assert.equal(byPage.get('/blog/steady-fall').leaveIt ?? null, null);
});

// ---------------------------------------------------------------- the week reply

test('P1: the week reply carries editStatus and why, and never the old "edit is done" card', () => {
  modelFixture({
    local: {
      plan: {
        file: 'docs/seo/plan.md',
        error: null,
        posts: [{ n: 3, done: false, title: 'An invented post', keyword: 'invented post phrase' }],
        improve: [
          { page: '/blog/steady-0', done: true, doneDate: '2026-11-16', judgeFrom: null, search: 's', todo: 't' },
        ],
      },
    },
  });
  writeJson('state/weeks.json', {
    '2026-11-16': { weekOf: '2026-11-16', locked: false, top5: ['page-edit-done-2026-11-16', 'plan-post-3'] },
  });
  invalidate();
  const w = weekView(buildModel());
  assert.equal(
    w.editStatus,
    "This week's big change is used (/blog/steady-0, 16 November); the small one is still open."
  );
  assert.deepEqual(
    w.top5.map((c) => c.id),
    ['plan-post-3'],
    'a saved id for the old card is ignored without error'
  );
  assert.ok(w.top5.every((c) => c.why));
  assert.equal(cardLines(w.top5[0]).why, w.top5[0].why);
  writeJson('state/weeks.json', {});
  invalidate();
});

test('P2: the Content gaps page says how many searches planned posts already cover', () => {
  const m = modelFixture({
    qpCur: [0, 1, 2, 3].map((i) => qp('amber shift handover checklist', `/blog/steady-${i}`, 8, 50)),
    local: {
      plan: {
        file: null,
        error: null,
        posts: [{ n: 4, done: false, title: 'H', keyword: 'shift handover checklist' }],
        improve: [],
      },
    },
  });
  const g = gapsView(m);
  assert.equal(g.count, 0);
  assert.equal(g.covered, 1);
  assert.equal(g.coveredNote, '1 search is already covered by a planned post.');
});

// ---------------------------------------------------------------- nothing moot in the five

test('a verdict card needs a change that can be read; otherwise the week says so in one line', () => {
  const through = '2026-11-16';
  const overlapped = [
    { date: '2026-10-01', commits: [{ hash: 'a1' }], overlapping: true },
    { date: '2026-10-02', commits: [{ hash: 'a2' }], overlapping: true },
  ];
  const none = week.proposeTop5({ plan: null, due: overlapped, today: TODAY, through });
  assert.ok(!none.some((c) => c.id === 'verdict-due'), 'nothing to learn, so no card');
  assert.match(
    week.verdictStatusOf(overlapped, through),
    /^2 due changes overlap other edits and cannot be read, so there is nothing to learn from them\. To clear them, open Did it work, press Judge now, then Save these verdicts\.$/
  );
  const readable = [...overlapped, { date: '2026-10-03', commits: [{ hash: 'a3' }], overlapping: false }];
  assert.ok(week.proposeTop5({ plan: null, due: readable, today: TODAY, through }).some((c) => c.id === 'verdict-due'));
  assert.equal(week.verdictStatusOf(readable, through), null);
  assert.equal(week.verdictStatusOf([], through), null);
});

test('a page Google was already asked to index in the last 28 days is a line, not a task', () => {
  const opp = (page) => ({
    id: `ni-${page}`,
    type: 'not-indexed',
    adviceGroup: 'not-indexed-linked',
    inbound: 8,
    page,
    isPageEdit: false,
    score: 50,
    title: `${page} is not on Google`,
    measured: 'Search Console says it is not indexed.',
    action: 'Ask Google to index it.',
  });
  const ranked = [opp('/blog/asked'), opp('/blog/long-ago')];
  const requests = new Map([
    ['/blog/asked', '2026-11-01'],
    ['/blog/long-ago', '2026-09-01'],
  ]);
  const cards = week.proposeTop5({ plan: null, ranked, today: TODAY, indexRequests: requests });
  const ask = cards.find((c) => /^ask-to-index:/.test(c.id));
  assert.ok(ask, 'the page asked about long ago is asked about again');
  assert.equal(ask.page, '/blog/long-ago');
  assert.ok(!ask.measured.includes('/blog/asked'));
  assert.deepEqual(week.indexRequestLines(['/blog/asked', '/blog/long-ago', '/blog/never'], requests, TODAY), [
    'You asked Google to index /blog/asked on 1 November. It is still not indexed. Nothing to do until 29 November.',
  ]);
  // With both asked lately there is no card at all.
  const both = new Map([
    ['/blog/asked', '2026-11-01'],
    ['/blog/long-ago', '2026-11-10'],
  ]);
  assert.ok(
    !week
      .proposeTop5({ plan: null, ranked, today: TODAY, indexRequests: both })
      .some((c) => /^ask-to-index:/.test(c.id))
  );
});

test('a failed index check reads plainly: what stopped, that search numbers are fine, nothing to do, no hypothesis', () => {
  const [w] = week.worries({
    sources: [
      {
        source: 'index',
        status: 'failed',
        error:
          'Search Console stopped answering after 0 pages: google-search-console tools/call timed out after 180000ms.',
      },
    ],
    today: TODAY,
  });
  assert.equal(w.title, 'The "Is each page on Google?" check did not run');
  assert.match(w.measured, /too slow to answer/);
  assert.match(w.measured, /search numbers from Search Console are not affected/);
  assert.ok(!/180000ms|tools\/call/.test(w.measured), 'no technical error text');
  assert.match(w.fix, /^Nothing to do yourself\./);
  const card = week.worryCard(w, new Map(), TODAY);
  assert.equal(card.hypothesis, false);
  assert.match(card.test, /dot at the top of the page turns green/);
});

test('a card done this week stays in the week, shown done; one done last week does not', () => {
  const plan = {
    posts: [
      { n: 1, done: true, title: 'An invented first post', keyword: 'invented one' },
      { n: 2, done: false, title: 'An invented second post', keyword: 'invented two' },
    ],
    improve: [],
  };
  // Done on Monday of this week (TODAY is Wednesday 18 November; the week began on 16 November).
  const thisWeek = { 'plan-post-1': { status: 'done', doneAt: '2026-11-16' } };
  const a = week.proposeTop5({ plan, items: thisWeek, today: TODAY });
  const posts = a.filter((c) => c.slot === 'new-post');
  assert.equal(posts.length, 1, 'one post a week');
  assert.equal(posts[0].id, 'plan-post-1', 'the done post holds its place');
  // Done last week: this week proposes the next post.
  const lastWeek = { 'plan-post-1': { status: 'done', doneAt: '2026-11-11' } };
  const b = week.proposeTop5({ plan, items: lastWeek, today: TODAY });
  assert.equal(b.find((c) => c.slot === 'new-post').id, 'plan-post-2');
});

test('an open-work row marked DONE in the file is not offered as a task', () => {
  const openWork = [
    {
      section: 'Open after the last session',
      text: 'Set up alerts for the rival names. DONE (founder confirmed).',
      blockedOnFounder: false,
    },
    {
      section: 'Open after the last session',
      text: 'Submit the site to two more directories.',
      blockedOnFounder: false,
    },
  ];
  const cards = week.proposeTop5({ plan: null, openWork, today: TODAY, size: 5 });
  const titles = cards.map((c) => c.title);
  assert.ok(!titles.some((t) => /alerts for the rival/.test(t)), 'the finished row is gone');
  assert.ok(
    titles.some((t) => /two more directories/.test(t)),
    'the open row stays'
  );
});

test('a "waiting on you" row marked DONE in the file leaves that list', () => {
  const rows = [
    {
      section: 'Blocked on the founder',
      text: 'Request indexing for a page. DONE: the page is indexed.',
      blockedOnFounder: true,
    },
    { section: 'Blocked on the founder', text: 'Fix the analytics filter.', blockedOnFounder: true },
  ];
  const list = week.blockedOnYou(rows);
  assert.equal(list.length, 1);
  assert.match(list[0].title, /analytics filter/);
});
