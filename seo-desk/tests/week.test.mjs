import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-week-'));
process.env.SEO_DESK_DATA = tmp;

const life = await import('../lib/lifecycle.mjs');
const { judgePage } = await import('../lib/verdicts.mjs');
const week = await import('../lib/week.mjs');
const { brief } = await import('../lib/brief.mjs');
const { longDate, plain } = await import('../lib/text.mjs');
const { addDays } = await import('../lib/dates.mjs');

const TODAY = '2026-11-10';

// ---------------------------------------------------------------- transitions

const fresh = () => life.transition(null, 'note', { today: TODAY, text: 'seed' });

test('every legal transition', () => {
  const base = {
    status: 'new',
    since: '2026-11-01',
    snoozeUntil: null,
    reason: null,
    doneAt: null,
    notes: [],
    pinnedWeek: null,
  };
  const started = life.transition(base, 'start', { today: TODAY });
  assert.equal(started.status, 'in-progress');
  assert.equal(started.since, TODAY);

  const done = life.transition(started, 'done', { today: TODAY });
  assert.equal(done.status, 'done');
  assert.equal(done.doneAt, TODAY);

  const snoozed = life.transition(base, 'snooze', { today: TODAY, until: '2026-11-20' });
  assert.equal(snoozed.status, 'snoozed');
  assert.equal(snoozed.snoozeUntil, '2026-11-20');

  const defaultSnooze = life.transition(base, 'snooze', { today: TODAY });
  assert.equal(defaultSnooze.snoozeUntil, '2026-11-17');

  const ignored = life.transition(base, 'ignore', { today: TODAY, reason: 'not our audience' });
  assert.equal(ignored.status, 'ignored');
  assert.equal(ignored.reason, 'not our audience');

  const reopened = life.transition(ignored, 'reopen', { today: TODAY });
  assert.equal(reopened.status, 'new');
  assert.equal(reopened.reason, null);

  const noted = life.transition(ignored, 'note', { today: TODAY, text: 'maybe later' });
  assert.equal(noted.status, 'ignored');
  assert.deepEqual(noted.notes, [{ at: TODAY, text: 'maybe later' }]);

  const pinned = life.transition(base, 'pin', { today: TODAY });
  assert.equal(pinned.pinnedWeek, '2026-11-09');
  assert.equal(life.transition(pinned, 'unpin', { today: TODAY }).pinnedWeek, null);
  assert.equal(base.status, 'new', 'input is never mutated');
});

test('transition rejects what the rules forbid', () => {
  const ignored = life.transition(fresh(), 'ignore', { today: TODAY, reason: 'no' });
  for (const action of ['start', 'done', 'snooze', 'ignore', 'pin', 'unpin']) {
    assert.throws(
      () => life.transition(ignored, action, { today: TODAY, until: '2026-12-01', reason: 'x' }),
      /conflict/,
      action
    );
  }
  assert.throws(() => life.transition(fresh(), 'snooze', { today: TODAY, until: '2026-11-10' }), /future/);
  assert.throws(() => life.transition(fresh(), 'snooze', { today: TODAY, until: '2026-11-01' }), /future/);
  assert.throws(() => life.transition(fresh(), 'ignore', { today: TODAY }), /reason/);
  assert.throws(() => life.transition(fresh(), 'ignore', { today: TODAY, reason: '  ' }), /reason/);
  assert.throws(() => life.transition(fresh(), 'dance', { today: TODAY }), /unknown action/);
});

test('marking done twice keeps the first date so the freeze is not extended', () => {
  const d1 = life.transition(fresh(), 'done', { today: '2026-11-01' });
  const d2 = life.transition(d1, 'done', { today: '2026-11-05' });
  assert.equal(d2.doneAt, '2026-11-01');
});

// ---------------------------------------------------------------- reconcile

test('reconcile: new ids, snooze expiry, came back, ignored stays ignored', () => {
  const items = {
    a: { status: 'snoozed', since: '2026-11-01', snoozeUntil: '2026-11-10', notes: [], pinnedWeek: null },
    b: { status: 'snoozed', since: '2026-11-01', snoozeUntil: '2026-11-11', notes: [], pinnedWeek: null },
    c: {
      status: 'done',
      since: '2026-09-01',
      doneAt: '2026-09-01',
      notes: [{ at: '2026-09-01', text: 'kept' }],
      pinnedWeek: null,
    },
    d: { status: 'done', since: '2026-11-01', doneAt: '2026-11-01', notes: [], pinnedWeek: null },
    e: { status: 'ignored', since: '2026-09-01', reason: 'no', notes: [], pinnedWeek: null },
  };
  const out = life.reconcile(items, ['a', 'b', 'c', 'd', 'e', 'f'], TODAY);
  assert.equal(out.a.status, 'new', 'snooze date reached');
  assert.equal(out.a.snoozeUntil, null);
  assert.equal(out.b.status, 'snoozed', 'snooze date not reached');
  assert.equal(out.c.status, 'came-back', 'done 70 days ago and detected again');
  assert.deepEqual(out.c.notes, [{ at: '2026-09-01', text: 'kept' }], 'notes survive');
  assert.equal(out.d.status, 'done', 'detected again inside 30 days is not a comeback');
  assert.equal(out.e.status, 'ignored');
  assert.equal(out.f.status, 'new');
  assert.equal(out.f.since, TODAY);
  assert.equal(items.a.status, 'snoozed', 'input is never mutated');
});

test('reconcile: a done item that is not detected stays done; an undetected snooze still expires', () => {
  const items = {
    c: { status: 'done', doneAt: '2026-08-01', since: '2026-08-01', notes: [] },
    a: { status: 'snoozed', snoozeUntil: '2026-11-09', since: '2026-11-01', notes: [] },
  };
  const out = life.reconcile(items, [], TODAY);
  assert.equal(out.c.status, 'done');
  assert.equal(out.a.status, 'new');
});

// ---------------------------------------------------------------- freeze rule

const opp = (id, page, isPageEdit = true, extra = {}) => ({ id, page, isPageEdit, title: `Opp ${id}`, ...extra });
const emptyPlan = { file: null, error: null, posts: [], improve: [] };

test('a page marked done on 2026-11-09 is frozen until 2026-12-07 and its opportunity is not eligible', () => {
  const items = { o1: { status: 'done', since: '2026-11-09', doneAt: '2026-11-09', notes: [] } };
  const opps = [opp('o1', '/blog/x'), opp('o2', '/blog/x'), opp('o3', '/blog/y'), opp('o4', '/blog/x', false)];
  const frozen = life.frozenPages({ items, opps, plan: emptyPlan, edits: [], today: TODAY });
  assert.equal(frozen.get('/blog/x').until, '2026-12-07');
  assert.equal(frozen.get('/blog/x').since, '2026-11-09');
  assert.equal(frozen.has('/blog/y'), false);
  assert.deepEqual(life.eligibility(opps[1], frozen, TODAY), { eligible: false, from: '2026-12-07' });
  assert.deepEqual(life.eligibility(opps[2], frozen, TODAY), { eligible: true, from: null });
  assert.deepEqual(
    life.eligibility(opps[3], frozen, TODAY),
    { eligible: true, from: null },
    'non page edits are always eligible'
  );
  const later = life.frozenPages({ items, opps, plan: emptyPlan, edits: [], today: '2026-12-07' });
  assert.equal(later.has('/blog/x'), false, 'free again on the 28th day');
});

test('a done page edit stays frozen even when the opportunity is no longer detected', () => {
  const items = { gone: life.transition(null, 'done', { today: '2026-11-09', page: '/blog/z', isPageEdit: true }) };
  const frozen = life.frozenPages({ items, opps: [], plan: emptyPlan, edits: [], today: TODAY });
  assert.equal(frozen.get('/blog/z').until, '2026-12-07');
});

test('a done item whose opportunity is not a page edit freezes nothing', () => {
  const items = { o1: { status: 'done', doneAt: '2026-11-09', since: '2026-11-09', notes: [] } };
  const frozen = life.frozenPages({
    items,
    opps: [opp('o1', '/blog/x', false)],
    plan: emptyPlan,
    edits: [],
    today: TODAY,
  });
  assert.equal(frozen.size, 0);
});

test('plan rows freeze from doneDate plus 28 or judgeFrom minus 2; unticked rows do not', () => {
  const plan = {
    ...emptyPlan,
    improve: [
      { page: '/a', done: true, doneDate: '2026-11-09', judgeFrom: '2026-12-09', search: '', todo: '' },
      { page: '/b', done: true, doneDate: null, judgeFrom: '2026-12-01', search: '', todo: '' },
      { page: '/c', done: false, doneDate: null, judgeFrom: null, search: '', todo: '' },
      { page: '/d', done: true, doneDate: null, judgeFrom: null, search: '', todo: '' },
    ],
  };
  const frozen = life.frozenPages({ items: {}, opps: [], plan, edits: [], today: TODAY });
  assert.equal(frozen.get('/a').until, '2026-12-07');
  assert.equal(frozen.get('/b').until, '2026-11-29');
  assert.equal(frozen.has('/c'), false);
  assert.equal(frozen.has('/d'), false, 'ticked with no date and no day it was first seen: nothing to count from');
});

test('routine git edits do not freeze but are reported by touchedOn; only an Edit: note freezes', () => {
  const edits = [
    { page: '/blog/p', date: '2026-11-08', kind: 'edit', subject: 'add inbound link' },
    { page: '/blog/p', date: '2026-11-02', kind: 'publish', subject: 'publish' },
    { page: '/blog/p', date: '2026-11-08', kind: 'edit', subject: 'second commit same day' },
    { page: '/blog/q', date: '2026-11-01', kind: 'manual', subject: 'Edit: title shipped' },
    {
      page: '/blog/r',
      date: '2026-11-01',
      kind: 'manual',
      subject: 'IndexNow (144 URLs, HTTP 200) + GSC sitemap resubmit',
    },
    { page: '/blog/t', date: '2026-11-01', kind: 'manual', subject: '  edit: lower case and padded' },
    {
      page: '/blog/u',
      date: '2026-11-01',
      kind: 'manual',
      subject: 'Founder requested indexing in GSC. Edit: not first',
    },
  ];
  const frozen = life.frozenPages({ items: {}, opps: [], plan: emptyPlan, edits, today: TODAY });
  assert.equal(frozen.has('/blog/p'), false);
  assert.equal(frozen.get('/blog/q').until, '2026-11-29');
  assert.equal(frozen.has('/blog/r'), false, 'IndexNow and indexing notes never freeze');
  assert.equal(frozen.get('/blog/t').until, '2026-11-29', 'prefix is case insensitive and trimmed');
  assert.equal(frozen.has('/blog/u'), false, 'the prefix must start the note');
  assert.deepEqual(life.touchedOn('/blog/p', edits), ['2026-11-02', '2026-11-08']);
  assert.deepEqual(life.touchedOn('/blog/q', edits), []);
});

test('the latest freeze wins when several sources name one page', () => {
  const plan = {
    ...emptyPlan,
    improve: [{ page: '/a', done: true, doneDate: '2026-11-01', judgeFrom: null, search: '', todo: '' }],
  };
  const edits = [{ page: '/a', date: '2026-11-05', kind: 'manual', subject: 'Edit: x' }];
  const frozen = life.frozenPages({ items: {}, opps: [], plan, edits, today: TODAY });
  assert.equal(frozen.get('/a').until, '2026-12-03');
});

test('a done item cannot be snoozed or ignored, so its freeze stays; reopen still works', () => {
  const done = life.transition(fresh(), 'done', { today: '2026-11-09', page: '/blog/x', isPageEdit: true });
  assert.throws(() => life.transition(done, 'snooze', { today: TODAY, until: '2026-12-01' }), /conflict/);
  assert.throws(() => life.transition(done, 'ignore', { today: TODAY, reason: 'x' }), /conflict/);
  assert.equal(life.transition(done, 'reopen', { today: TODAY }).status, 'new');
  assert.equal(life.transition(done, 'note', { today: TODAY, text: 'kept' }).status, 'done');
});

test('a done item keeps the page it froze, even when the opportunity now names another page', () => {
  // Two pages competing: the top page changes from day to day, the freeze must not move with it.
  const items = {
    o1: life.transition(null, 'done', { today: '2026-11-09', page: '/blog/first', isPageEdit: true }),
  };
  const opps = [opp('o1', '/blog/second')];
  const frozen = life.frozenPages({ items, opps, plan: emptyPlan, edits: [], today: TODAY });
  assert.equal(frozen.get('/blog/first').until, '2026-12-07');
  assert.equal(frozen.has('/blog/second'), false);
});

test('a ticked plan row with no date freezes from the day the desk first saw it ticked', () => {
  const p = {
    ...emptyPlan,
    file: 'docs/seo/next-15-blogs-2026-11.md',
    improve: [
      { page: '/d', done: true, doneDate: null, judgeFrom: null, search: '', todo: '' },
      { page: '/e', done: true, doneDate: null, judgeFrom: null, search: '', todo: '' },
    ],
  };
  const planTicks = { 'docs/seo/next-15-blogs-2026-11.md|/d': '2026-11-08' };
  const frozen = life.frozenPages({
    items: {},
    opps: [],
    plan: p,
    edits: [],
    planTicks,
    planSeenOn: '2026-11-10',
    today: TODAY,
  });
  assert.equal(frozen.get('/d').until, '2026-12-06');
  assert.equal(frozen.get('/d').since, '2026-11-08');
  assert.match(frozen.get('/d').why, /first saw/);
  assert.equal(frozen.get('/e').since, '2026-11-10', 'no record yet: the day the plan was read');
});

// ---------------------------------------------------------------- judgePage

function daily(page, start, days, imp, pos, clicks = 0) {
  const rows = [];
  for (let i = 0; i < days; i += 1) {
    rows.push({ date: addDays(start, i), page, clicks, impressions: imp, position: pos });
  }
  return rows;
}
test('judgePage is too early before changeDate + 28 + 2 and judged from then', () => {
  const changeDate = '2026-10-01';
  const rows = [
    ...daily('/blog/target', '2026-09-03', 28, 10, 15, 1),
    ...daily('/blog/target', '2026-10-02', 28, 20, 8, 3),
    ...['/a', '/b', '/c', '/d', '/e'].flatMap((p) => [
      ...daily(p, '2026-09-03', 28, 5, 12),
      ...daily(p, '2026-10-02', 28, 5, 12),
    ]),
  ];
  const early = judgePage({ page: '/blog/target', changeDate, pageDaily: rows, today: '2026-10-30' });
  assert.equal(early.status, 'too-early');
  assert.equal(early.judgeFrom, '2026-10-31');
  assert.equal(early.verdict, null);

  const done = judgePage({ page: '/blog/target', changeDate, pageDaily: rows, today: '2026-10-31' });
  assert.equal(done.status, 'judged');
  assert.equal(done.before.impressions, 280);
  assert.equal(done.after.impressions, 560);
  assert.equal(done.verdict, 'better');
  assert.equal(done.control.pages, 6, 'the five steady pages and the target itself');
  assert.equal(done.clicksTooSmall, false, '28 and 84 clicks are enough to read');
});

test('judgePage reads the home page and an empty page without crashing', () => {
  const rows = [...daily('/', '2026-09-03', 28, 100, 3, 10), ...daily('/', '2026-10-02', 28, 100, 3, 10)];
  const home = judgePage({ page: '/', changeDate: '2026-10-01', pageDaily: rows, today: '2026-11-05' });
  assert.equal(home.status, 'judged');
  assert.equal(home.before.impressions, 2800);
  const none = judgePage({ page: '/nowhere', changeDate: '2026-10-01', pageDaily: rows, today: '2026-11-05' });
  assert.equal(none.verdict, 'insufficient-data');
});

// ---------------------------------------------------------------- proposeTop5

const postRows = [
  { n: 1, done: true, title: 'Done post', keyword: 'done kw' },
  { n: 2, done: false, title: 'Safe harbor nursing in Texas', keyword: 'safe harbor nursing' },
  { n: 3, done: false, title: 'Low census', keyword: 'low census' },
];
const improveRows = [
  { page: '/blog/frozen-row', done: false, doneDate: null, judgeFrom: null, search: 'a search', todo: 'Add a section' },
  {
    page: '/blog/open-row',
    done: false,
    doneDate: null,
    judgeFrom: null,
    search: 'another search',
    todo: 'Strengthen it',
  },
];
const plan = { file: 'docs/seo/next-15-blogs-2026-11.md', error: null, posts: postRows, improve: improveRows };

const rankedOpp = (id, total, over = {}) => ({
  id,
  type: 'near-page-one',
  page: `/blog/${id}`,
  query: id,
  title: `Title ${id}`,
  measured: `Measured ${id}`,
  action: `Action ${id}`,
  test: `Test ${id}`,
  isPageEdit: true,
  score: { total, parts: [] },
  ...over,
});

const frozenMap = new Map([['/blog/frozen-row', { until: '2026-12-01', since: '2026-11-03', why: 'Logged by hand' }]]);

test('proposeTop5 follows the recipe and never returns two page edit cards', () => {
  const ranked = [
    rankedOpp('edit1', 90),
    rankedOpp('edit2', 80),
    rankedOpp('link1', 70, { isPageEdit: false, type: 'needs-links' }),
    rankedOpp('link2', 60, { isPageEdit: false, type: 'ai-gap' }),
    rankedOpp('link3', 50, { isPageEdit: false, type: 'question' }),
  ];
  const due = [{ date: '2026-10-05', slug: 'some-post', url: '/blog/some-post', kind: 'edit' }];
  const worryList = [
    { id: 'crawl-issue:x', kind: 'crawl-issue', title: 'Bing cannot crawl a page', measured: 'm', fix: 'f' },
  ];
  const cards = week.proposeTop5({
    plan,
    ranked,
    due,
    worries: worryList,
    openWork: [{ section: 'Blocked on the founder', text: 'Run the interview chain', blockedOnFounder: true }],
    frozen: frozenMap,
    items: {},
    today: TODAY,
  });
  assert.equal(cards.length, 5);
  assert.deepEqual(
    cards.map((c) => c.slot),
    ['new-post', 'page-edit', 'verdict', 'worry', 'other']
  );
  assert.equal(cards[0].title, 'Safe harbor nursing in Texas');
  assert.equal(cards[0].source, 'plan');
  assert.equal(cards[1].page, '/blog/open-row', 'first unticked row that is not frozen');
  assert.equal(cards[1].isPageEdit, true);
  assert.equal(cards[2].source, 'verdict');
  assert.equal(cards[3].id, 'crawl-issue:x');
  assert.equal(cards[4].oppId, 'link1');
  assert.equal(cards.filter((c) => c.isPageEdit).length, 1);
  assert.equal(new Set(cards.map((c) => c.id)).size, cards.length, 'ids are unique');
  for (const c of cards) {
    assert.deepEqual(
      Object.keys(c).sort(),
      [
        'action',
        'eligibility',
        'id',
        'isPageEdit',
        'measured',
        'oppId',
        'page',
        'slot',
        'source',
        'test',
        'title',
      ].sort()
    );
    assert.equal(/[–—]/.test(JSON.stringify(c)), false);
  }
});

test('proposeTop5 ids are stable across calls', () => {
  const args = {
    plan,
    ranked: [rankedOpp('a', 50, { isPageEdit: false })],
    due: [],
    worries: [],
    openWork: [],
    frozen: frozenMap,
    items: {},
    today: TODAY,
  };
  assert.deepEqual(
    week.proposeTop5(args).map((c) => c.id),
    week.proposeTop5(args).map((c) => c.id)
  );
});

test('proposeTop5 still returns cards when the plan failed to load', () => {
  const ranked = [rankedOpp('edit1', 90), rankedOpp('edit2', 80), rankedOpp('link1', 70, { isPageEdit: false })];
  const cards = week.proposeTop5({
    plan: { file: null, error: 'No plan file found.', posts: [], improve: [] },
    ranked,
    due: [],
    worries: [],
    openWork: [],
    frozen: new Map(),
    items: {},
    today: TODAY,
  });
  assert.equal(cards.length >= 2, true);
  assert.equal(cards[0].slot, 'page-edit', 'no plan post, so the best eligible edit leads');
  assert.equal(cards[0].oppId, 'edit1');
  assert.equal(cards.filter((c) => c.isPageEdit).length, 1);
});

test('page edit fallback skips frozen pages and opportunities the founder ignored or snoozed', () => {
  const ranked = [rankedOpp('edit1', 90), rankedOpp('edit2', 80), rankedOpp('edit3', 70), rankedOpp('edit4', 60)];
  const frozen = new Map([['/blog/edit1', { until: '2026-12-01', since: '2026-11-03', why: 'x' }]]);
  const items = {
    edit2: { status: 'ignored', notes: [] },
    edit3: { status: 'snoozed', snoozeUntil: '2026-11-20', notes: [] },
  };
  const cards = week.proposeTop5({
    plan: { file: null, error: 'x', posts: [], improve: [] },
    ranked,
    due: [],
    worries: [],
    openWork: [],
    frozen,
    items,
    today: TODAY,
  });
  assert.equal(cards[0].oppId, 'edit4');
  assert.deepEqual(cards[0].eligibility, { eligible: true, from: null });
});

test('with nothing due, the verdict slot names the next verdict date from the frozen pages', () => {
  const frozen = new Map([['/a', { until: '2026-11-29', since: '2026-11-01', why: 'x' }]]);
  const cards = week.proposeTop5({
    plan: emptyPlan,
    ranked: [],
    due: [],
    worries: [],
    openWork: [],
    frozen,
    items: {},
    today: TODAY,
  });
  const v = cards.find((c) => c.slot === 'verdict');
  assert.ok(v);
  assert.match(v.title + v.measured, /1 December/);
});

test('a pinned opportunity goes ahead of better scored ones in the open slot', () => {
  const ranked = [rankedOpp('l1', 70, { isPageEdit: false }), rankedOpp('l2', 60, { isPageEdit: false })];
  const items = { l2: { status: 'new', pinnedWeek: '2026-11-09', notes: [] } };
  const cards = week.proposeTop5({
    plan: emptyPlan,
    ranked,
    due: [],
    worries: [],
    openWork: [],
    frozen: new Map(),
    items,
    today: TODAY,
  });
  assert.equal(cards[0].oppId, 'l2');
});

// ---------------------------------------------------------------- worries

const slipOpp = (id, page, extra = {}) => ({
  id,
  type: 'slipping',
  page,
  title: `${page} lost most of its search views`,
  measured: `${page} showed up 100 times, then 10 times.`,
  action: `Compare ${page} with the pages now ranking above it.`,
  isPageEdit: true,
  ...extra,
});

test('worries: dropped from index, slipping top three, failed source, crawl, competitor, registry, worse verdicts', () => {
  const opps = [
    slipOpp('s1', '/slip-a'),
    rankedOpp('x1', 99, { type: 'needs-links', isPageEdit: false }),
    slipOpp('s2', '/slip-b'),
    slipOpp('s3', '/slip-c'),
    slipOpp('s4', '/slip-d'),
  ];
  const snaps = {
    gsc: {
      through: '2026-11-07',
      data: {
        index: [
          { page: '/gone', verdict: 'not-indexed', reason: 'Crawled, currently not indexed' },
          { page: '/fine', verdict: 'indexed', reason: '' },
          { page: '/always-out', verdict: 'not-indexed', reason: 'x' },
        ],
      },
    },
    bing: { data: { crawlIssues: [{ url: 'https://simplescheduleai.com/blog/broken', issue: 'Blocked by robots' }] } },
    local: {
      data: {
        warnings: ['registry: Unexpected token in JSON'],
        registry: [{ slug: 'ghost', url: '/blog/ghost', primaryKeyword: 'ghost' }],
        livePages: [{ page: '/blog/real', lastmod: null }],
        competitors: {
          watch: [
            { url: 'https://www.rival.com/pricing', fetchedAt: '2026-11-01', changes: ['prices added: "$6"'] },
            { url: 'https://www.rival.com/product', fetchedAt: '2026-11-01', changes: ['ctas removed: "Book a demo"'] },
            { url: 'rival.com__pricing', fetchedAt: '2026-11-01', changes: ['unreachable (HTTP 404)'] },
            { url: 'https://www.old.com/', fetchedAt: '2026-08-01', changes: ['title: "Old" -> "Older"'] },
            { url: 'https://www.listy.com/', fetchedAt: '2026-11-01', changes: ['h2s added: "A new post"'] },
            { url: 'https://www.quiet.com/', fetchedAt: '2026-11-01', changes: [] },
          ],
        },
        verdicts: [
          {
            judgedOn: '2026-11-05',
            slug: 'bad-edit',
            url: '/blog/bad-edit',
            changeDate: '2026-10-01',
            verdict: 'worse',
            before: { impressions: 400, position: 8 },
            after: { impressions: 200, position: 14 },
          },
          {
            judgedOn: '2026-11-05',
            slug: 'batch:abc123',
            url: null,
            kind: 'batch',
            changeDate: '2026-10-08',
            pages: ['page-one', 'page-two', 'page-three', 'page-four', 'page-five'],
            verdict: 'worse',
            before: { impressions: 900, position: 9 },
            after: { impressions: 500, position: 12 },
          },
          {
            judgedOn: '2026-11-05',
            slug: 'ok-edit',
            url: '/blog/ok-edit',
            changeDate: '2026-10-01',
            verdict: 'better',
            before: {},
            after: {},
          },
          {
            judgedOn: '2026-08-05',
            slug: 'old-bad',
            url: '/blog/old-bad',
            changeDate: '2026-07-01',
            verdict: 'worse',
            before: {},
            after: {},
          },
        ],
      },
    },
  };
  const prevSnaps = {
    gsc: {
      data: {
        index: [
          { page: '/gone', verdict: 'indexed' },
          { page: '/always-out', verdict: 'not-indexed' },
        ],
      },
    },
  };
  const sources = [
    { source: 'gsc', status: 'fresh' },
    { source: 'ga4', status: 'failed', error: 'timeout' },
    { source: 'clarity', status: 'needs-sign-in', error: 'sign in' },
    { source: 'bing', status: 'stale' },
  ];
  const frozen = new Map([['/slip-a', { until: '2026-11-29', since: '2026-11-01', why: 'x' }]]);
  const out = week.worries({ snaps, prevSnaps, sources, frozen, opps, today: TODAY });
  const kinds = (k) => out.filter((w) => w.kind === k);

  assert.equal(kinds('dropped-from-index').length, 1);
  assert.match(kinds('dropped-from-index')[0].title, /\/gone/);
  assert.equal(kinds('slipping-page').length, 3, 'top three only');
  assert.match(kinds('slipping-page')[0].title, /slip-a/, 'ranked order is kept');
  assert.deepEqual(
    kinds('slipping-page').map((w) => w.oppId),
    ['s1', 's2', 's3'],
    'built from the opportunities, which are linked back by oppId'
  );
  assert.match(kinds('slipping-page')[1].measured, /showed up 100 times/, 'reuses the opportunity text');
  assert.match(kinds('slipping-page')[0].fix, /29 November/, 'a frozen page says when it can be touched');
  assert.equal(kinds('source-failed').length, 2);
  assert.equal(kinds('crawl-issue').length, 1);
  assert.deepEqual(
    kinds('competitor-change').map((w) => w.title),
    ['old.com changed the page title on its home page', 'rival.com made 2 changes worth reading'],
    'one per host with a material change; a list change, a sentinel at 404 and an empty row raise none'
  );
  assert.match(kinds('competitor-change')[1].measured, /now shows a price on its \/pricing page: "\$6"/);
  assert.match(kinds('competitor-change')[0].measured, /This check is 101 days old\./, 'an old check says so');
  assert.doesNotMatch(kinds('competitor-change')[1].measured, /days old/);
  assert.equal(kinds('registry-fail').length >= 2, true, 'a read warning and a registry page that is not live');
  assert.equal(kinds('verdict-worse').length, 2, 'one single page and one batch, recent only');
  const single = kinds('verdict-worse').find((w) => /bad-edit/.test(w.title));
  assert.equal(single.page, '/blog/bad-edit');
  assert.equal(single.isPageEdit, true);
  const batch = kinds('verdict-worse').find((w) => /5 pages/.test(w.title));
  assert.ok(batch, 'a batch is named by how many pages it covered');
  assert.equal(batch.page, null);
  assert.equal(batch.isPageEdit, false);
  assert.match(batch.measured, /page-one, page-two, page-three and 2 more/);
  assert.equal(/page-four|blog\/batch/.test(JSON.stringify(batch)), false, 'at most three pages, never a made up path');

  assert.equal(new Set(out.map((w) => w.id)).size, out.length, 'ids are unique');
  for (const w of out) {
    assert.ok(w.id && w.kind && w.title && w.measured && w.fix, `${w.kind} has every field`);
    assert.equal(/[–—]/.test(JSON.stringify(w)), false, 'no dashes');
  }
  assert.equal(out[0].kind, 'dropped-from-index', 'most serious first');
});

test('worries is empty when nothing is wrong and tolerates missing snapshots', () => {
  assert.deepEqual(week.worries({ snaps: {}, prevSnaps: {}, sources: [], frozen: new Map(), today: TODAY }), []);
  assert.deepEqual(week.worries({ today: TODAY }), []);
});

// ---------------------------------------------------------------- waiting

test('waiting lists verdict dates and frozen pages, soonest first', () => {
  const frozen = new Map([
    ['/a', { until: '2026-12-07', since: '2026-11-09', why: 'x' }],
    ['/b', { until: '2026-11-29', since: '2026-11-01', why: 'x' }],
  ]);
  const out = week.waiting({
    verdictsDue: [{ page: '/c', date: '2026-11-20' }],
    frozen,
    plan: {
      ...emptyPlan,
      improve: [{ page: '/d', done: true, doneDate: null, judgeFrom: '2026-12-15', search: '', todo: '' }],
    },
    today: TODAY,
  });
  const dates = out.map((w) => w.date);
  assert.deepEqual(dates, [...dates].sort());
  assert.ok(out.some((w) => w.date === '2026-11-20' && /\/c/.test(w.title)));
  assert.ok(
    out.some((w) => w.date === '2026-12-01' && /\/b/.test(w.title)),
    'verdict for a frozen page is until + 2'
  );
  assert.ok(
    out.some((w) => w.date === '2026-11-29' && /\/b/.test(w.title)),
    'edit-again date'
  );
  assert.ok(
    out.some((w) => w.date === '2026-12-15' && /\/d/.test(w.title)),
    'plan judgeFrom not yet frozen'
  );
  for (const w of out) assert.equal(/[–—]/.test(w.title), false);
});

// ---------------------------------------------------------------- week persistence

test('lockWeek, getWeek, setTop5 and weeks persist in state/weeks.json', () => {
  assert.equal(week.getWeek('2026-11-09'), null);
  const cards = [
    { id: 'plan-post-2', slot: 'new-post', title: 'T' },
    { id: 'opp:x', slot: 'other', title: 'U' },
  ];
  week.lockWeek('2026-11-09', cards, { lockedAt: '2026-11-09T08:00:00.000Z' });
  const w = week.getWeek('2026-11-09');
  assert.equal(w.locked, true);
  assert.equal(w.lockedAt, '2026-11-09T08:00:00.000Z');
  assert.deepEqual(w.cards, cards);
  assert.deepEqual(w.top5, ['plan-post-2', 'opp:x']);

  week.setTop5('2026-11-09', ['opp:x', 'plan-post-2']);
  assert.deepEqual(week.getWeek('2026-11-09').top5, ['opp:x', 'plan-post-2']);
  assert.throws(() => week.setTop5('2026-11-09', ['1', '2', '3', '4', '5', '6']), /five/);

  week.lockWeek('2026-11-16', []);
  assert.deepEqual(
    week.weeks().map((x) => x.weekOf),
    ['2026-11-16', '2026-11-09']
  );
  assert.equal(fs.existsSync(path.join(tmp, 'state', 'weeks.json')), true);
});

test('loadItems and saveItems round trip through state/items.json', () => {
  assert.deepEqual(life.loadItems(), {});
  life.saveItems({ a: fresh() });
  assert.equal(life.loadItems().a.notes[0].text, 'seed');
  assert.equal(fs.existsSync(path.join(tmp, 'state', 'items.json')), true);
});

// ---------------------------------------------------------------- brief

test('brief has the page, evidence, action, test and the repo rules, with no dashes', () => {
  const card = {
    id: 'plan-improve-x',
    slot: 'page-edit',
    title: 'Improve /blog/nurse-staffing-models',
    measured: 'The plan notes: team nursing 720 a month; none on Google yet.',
    action: 'Add model name sections.',
    test: 'Judged by the 28 day before and after verdict, about 30 days after the edit.',
    page: '/blog/nurse-staffing-models',
    isPageEdit: true,
    source: 'plan',
    oppId: null,
    eligibility: { eligible: true, from: null },
  };
  const text = brief(card, { frozen: new Map() });
  assert.match(text, /\/blog\/nurse-staffing-models/);
  assert.match(text, /team nursing 720/);
  assert.match(text, /Add model name sections/);
  assert.match(text, /28 day before and after/);
  assert.match(text, /\.claude\/skills\/seo-aeo-simplescheduleai\.md/);
  assert.match(text, /npm run publish-gate nurse-staffing-models -- --status/);
  assert.match(text, /one live page edit a week/i);
  assert.match(text, /28 days/);
  assert.match(text, /write "Done YYYY-MM-DD" in the row's last cell and tick it/);
  assert.match(text, /npm run change-log/);
  assert.equal(/[–—]/.test(text), false);

  const noPlan = brief({ ...card, source: 'opportunity' }, { frozen: new Map() });
  assert.equal(/tick it/i.test(noPlan), false, 'only plan cards mention the plan file');

  const frozenText = brief(card, {
    frozen: new Map([['/blog/nurse-staffing-models', { until: '2026-12-07', since: '2026-11-09', why: 'x' }]]),
  });
  assert.match(frozenText, /7 December/);
  assert.equal(/[–—]/.test(frozenText), false);
});

test('brief for a site page leaves out the blog only rules, and a dashy source is cleaned', () => {
  const text = brief(
    {
      title: 'T — odd',
      measured: 'm – n',
      action: 'a',
      test: 't',
      page: '/critical-access-hospital-scheduling',
      isPageEdit: true,
      source: 'opportunity',
    },
    { frozen: new Map() }
  );
  assert.equal(/publish-gate/.test(text), false);
  assert.equal(/[–—]/.test(text), false);
});

test('longDate and plain', () => {
  assert.equal(longDate('2026-12-07'), '7 December');
  assert.equal(longDate('2026-11-09'), '9 November');
  assert.equal(plain('a — b and c–d'), 'a, b and c, d');
});

// ---------------------------------------------------------------- fix round 1

test('start on a done item conflicts; reopen is the way back and clears doneAt', () => {
  const done = life.transition(fresh(), 'done', { today: '2026-11-01' });
  assert.throws(() => life.transition(done, 'start', { today: TODAY }), /conflict/);
  const back = life.transition(done, 'reopen', { today: TODAY });
  assert.equal(back.status, 'new');
  assert.equal(back.doneAt, null);
  assert.equal(life.transition(back, 'start', { today: TODAY }).status, 'in-progress');
  const frozen = life.frozenPages({
    items: { o1: { ...life.transition(null, 'done', { today: '2026-11-09', page: '/p', isPageEdit: true }) } },
    opps: [],
    plan: emptyPlan,
    edits: [],
    today: TODAY,
  });
  assert.equal(frozen.has('/p'), true);
  const reopened = life.transition(
    life.transition(null, 'done', { today: '2026-11-09', page: '/p', isPageEdit: true }),
    'reopen',
    {
      today: TODAY,
    }
  );
  assert.equal(
    life.frozenPages({ items: { o1: reopened }, opps: [], plan: emptyPlan, edits: [], today: TODAY }).has('/p'),
    false
  );
});

const top = (over) =>
  week.proposeTop5({
    plan,
    ranked: [],
    due: [],
    worries: [],
    openWork: [],
    frozen: new Map(),
    items: {},
    today: TODAY,
    ...over,
  });

test('a pinned page edit that can be edited takes the page edit slot ahead of the plan row', () => {
  const ranked = [rankedOpp('edit1', 90), rankedOpp('edit2', 80)];
  const items = { edit2: { status: 'new', pinnedWeek: '2026-11-09', notes: [] } };
  const cards = top({ ranked, items });
  const edit = cards.find((c) => c.slot === 'page-edit');
  assert.equal(edit.oppId, 'edit2');
  assert.equal('note' in edit, false);
  assert.equal(cards.filter((c) => c.isPageEdit).length, 1);
  assert.equal(
    cards.some((c) => c.id === 'plan-improve-/blog/open-row'),
    false,
    'the plan row steps aside'
  );
});

test('a pinned page edit that is frozen leaves the plan row and says so on the card', () => {
  const ranked = [rankedOpp('edit1', 90), rankedOpp('edit2', 80)];
  const items = { edit2: { status: 'new', pinnedWeek: '2026-11-09', notes: [] } };
  const frozen = new Map([
    // Edited last week (a date this week would use up the week's page edit slot).
    ['/blog/edit2', { until: '2026-12-05', since: '2026-11-07', why: 'x' }],
    ['/blog/frozen-row', { until: '2026-12-01', since: '2026-11-03', why: 'x' }],
  ]);
  const cards = top({ ranked, items, frozen });
  const edit = cards.find((c) => c.slot === 'page-edit');
  assert.equal(edit.page, '/blog/open-row');
  assert.equal(edit.note, 'Pinned item is frozen until 5 December');
  assert.equal(cards.filter((c) => c.isPageEdit).length, 1);
  assert.equal(
    cards.filter((c) => c.slot !== 'page-edit').some((c) => 'note' in c),
    false
  );
});

test('a pinned page edit from last week is not pinned this week', () => {
  const ranked = [rankedOpp('edit1', 90), rankedOpp('edit2', 80)];
  const items = { edit2: { status: 'new', pinnedWeek: '2026-11-02', notes: [] } };
  const edit = top({ ranked, items }).find((c) => c.slot === 'page-edit');
  assert.equal(edit.page, '/blog/frozen-row', 'the plan row leads');
});

test('a page edit worry is skipped when a page edit card already exists', () => {
  const editWorry = {
    id: 'slipping-page:/blog/w',
    kind: 'slipping-page',
    page: '/blog/w',
    isPageEdit: true,
    title: 'W slips',
    measured: 'm',
    fix: 'refresh it',
  };
  const crawl = {
    id: 'crawl-issue:y',
    kind: 'crawl-issue',
    page: null,
    isPageEdit: false,
    title: 'Crawl',
    measured: 'm',
    fix: 'f',
  };
  const cards = top({ worries: [editWorry, crawl] });
  const w = cards.find((c) => c.slot === 'worry');
  assert.equal(w.id, 'crawl-issue:y');
  assert.equal(cards.filter((c) => c.isPageEdit).length, 1);
});

test('a page edit worry takes the worry slot when no page edit card exists, and is the same card as its opportunity', () => {
  const o = rankedOpp('slip1', 70, { type: 'slipping' });
  const w = {
    id: 'slipping-page:/blog/slip1',
    kind: 'slipping-page',
    page: '/blog/slip1',
    oppId: 'slip1',
    isPageEdit: true,
    title: 'T',
    measured: 'm',
    fix: 'refresh it',
  };
  const cards = top({ plan: emptyPlan, ranked: [o], worries: [w] });
  assert.equal(cards.filter((c) => c.oppId === 'slip1').length, 1, 'one card for the one thing');
  const card = cards.find((c) => c.oppId === 'slip1');
  assert.equal(card.id, 'opp:slip1');
  assert.equal(card.slot, 'page-edit', 'the page edit slot got it first, so the worry is not shown twice');
});

test('a worry linked to an ignored opportunity is not proposed', () => {
  const w = {
    id: 'slipping-page:/p',
    kind: 'slipping-page',
    page: '/p',
    oppId: 'gone',
    isPageEdit: true,
    title: 'T',
    measured: 'm',
    fix: 'f',
  };
  const items = { gone: { status: 'ignored', notes: [] } };
  const cards = top({ plan: { ...emptyPlan, posts: [], improve: [] }, worries: [w], items });
  assert.equal(
    cards.some((c) => c.slot === 'worry'),
    false
  );
});

test('when every plan improve row is done or frozen, the slot falls back to the best eligible page edit opportunity', () => {
  const allGone = {
    ...plan,
    improve: [
      { page: '/blog/done-row', done: true, doneDate: null, judgeFrom: null, search: 's', todo: 't' },
      { page: '/blog/frozen-row', done: false, doneDate: null, judgeFrom: null, search: 's', todo: 't' },
    ],
  };
  const ranked = [rankedOpp('edit1', 90), rankedOpp('edit2', 80)];
  const frozen = new Map([
    ['/blog/frozen-row', { until: '2026-12-01', since: '2026-11-03', why: 'x' }],
    ['/blog/edit1', { until: '2026-12-01', since: '2026-11-03', why: 'x' }],
  ]);
  const edit = top({ plan: allGone, ranked, frozen }).find((c) => c.slot === 'page-edit');
  assert.equal(edit.oppId, 'edit2');
  assert.equal(edit.source, 'opportunity');
});

test('blockedOnYou lists founder blocked open work, and the fifth card falls back to other open work only without opportunities', () => {
  const openWork = [
    {
      section: 'Blocked on the founder',
      text: 'Run the interview chain first. It blocks three things.',
      blockedOnFounder: true,
    },
    { section: 'Positioning', text: 'Ship the weekend mechanism.', blockedOnFounder: false },
  ];
  const list = week.blockedOnYou(openWork);
  assert.equal(list.length, 1);
  assert.deepEqual(Object.keys(list[0]).sort(), ['id', 'section', 'title']);
  assert.equal(list[0].title, 'Run the interview chain first.');
  assert.equal(list[0].section, 'Blocked on the founder');

  const none = top({ plan: emptyPlan, openWork });
  assert.deepEqual(
    none.filter((c) => c.source === 'open-work').map((c) => c.title),
    ['Ship the weekend mechanism.'],
    'a blocked row is shown under Waiting on you, not as a card'
  );
  const withOpp = top({ plan: emptyPlan, ranked: [rankedOpp('l1', 70, { isPageEdit: false })], openWork });
  assert.equal(withOpp.find((c) => c.slot === 'other').oppId, 'l1');
  assert.deepEqual(week.blockedOnYou([]), []);
});

// ---------------------------------------------------------------- final fix wave

test('once a page edit is dated inside this week, the slot says so and no other page edit is offered', () => {
  // Monday 9 November is inside the week of 9 November (today is the 10th).
  const frozen = new Map([['/blog/edited', { until: '2026-12-07', since: '2026-11-09', why: 'x' }]]);
  const worryList = [
    {
      id: 'slipping-page:/blog/w',
      kind: 'slipping-page',
      page: '/blog/w',
      oppId: 'w1',
      isPageEdit: true,
      title: 'Slipping',
      measured: 'm',
      fix: 'Refresh it',
    },
  ];
  const cards = top({ frozen, ranked: [rankedOpp('edit1', 90)], worries: worryList });
  const slot = cards.find((c) => c.slot === 'page-edit');
  assert.equal(slot.title, "This week's page edit is done");
  assert.equal(slot.readOnly, true);
  assert.equal(slot.isPageEdit, false);
  assert.equal(slot.page, '/blog/edited');
  assert.match(slot.measured, /9 November/);
  assert.match(slot.action, /16 November/, 'the next page edit can go in next Monday');
  assert.equal(cards.filter((c) => c.isPageEdit).length, 0, 'no page edit card at all');
  assert.equal(
    cards.some((c) => c.slot === 'worry'),
    false,
    'the page edit worry waits too'
  );
  assert.equal(/[–—]/.test(JSON.stringify(cards)), false);

  // Last week's edit does not use up this week's slot.
  const lastWeek = new Map([['/blog/edited', { until: '2026-12-05', since: '2026-11-07', why: 'x' }]]);
  assert.equal(top({ frozen: lastWeek }).find((c) => c.slot === 'page-edit').page, '/blog/frozen-row');
});

test('a worse verdict on an article points at /articles, and one change on one page reads in the singular', () => {
  const list = week.worries({
    snaps: {
      local: {
        data: {
          registry: [{ slug: 'news-piece', url: '/articles/news-piece', primaryKeyword: 'k' }],
          livePages: [{ page: '/articles/news-piece' }, { page: '/articles/other-news' }],
          verdicts: [
            { slug: 'news-piece', changeDate: '2026-10-01', judgedOn: '2026-11-05', verdict: 'worse' },
            { slug: 'other-news', changeDate: '2026-10-02', judgedOn: '2026-11-05', verdict: 'worse' },
          ],
          competitors: {
            watch: [{ url: 'https://rival.example/pricing', fetchedAt: '2026-11-08', changes: ['prices added: "$7"'] }],
          },
        },
      },
    },
    today: TODAY,
  });
  const pages = list.filter((w) => w.kind === 'verdict-worse').map((w) => w.page);
  assert.deepEqual(pages.sort(), ['/articles/news-piece', '/articles/other-news']);
  const comp = list.find((w) => w.kind === 'competitor-change');
  assert.match(comp.measured, /rival\.example now shows a price on its \/pricing page: "\$7"\./);
  assert.equal(comp.title, 'rival.example now shows a price on its /pricing page');
  assert.equal(/\b1 (pages|changes)\b/.test(JSON.stringify(list)), false);
});
