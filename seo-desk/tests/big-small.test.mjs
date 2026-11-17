import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// One big and one small live page change a week (founder, 2026-11-17). Every page, phrase and number
// here is invented.

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-bigsmall-'));
process.env.SEO_DESK_DATA = path.join(root, 'data');
process.env.SEO_DESK_REPO = path.join(root, 'repo');
fs.mkdirSync(path.join(root, 'repo/docs/seo'), { recursive: true });

const { parsePlan, planRowSize } = await import('../lib/sources/plan-parser.mjs');
const life = await import('../lib/lifecycle.mjs');
const week = await import('../lib/week.mjs');
const { buildModel, invalidate } = await import('../lib/api/model.mjs');
const { settingsView } = await import('../lib/api/panels.mjs');
const { doneConfirmText, sizePicked } = await import('../static/views/card.js');

const noDash = (v) => assert.equal(/[–—]/.test(JSON.stringify(v)), false, 'no em or en dash');

// ---------------------------------------------------------------- the size of an edit

test('the plan parser reads BIG and SMALL from the start of "What to do"; an untagged row is big', () => {
  const md = [
    '| Done | Live page | Search to win | What to do |',
    '| ---- | --------- | ------------- | ---------- |',
    '| [ ]  | `/blog/alpha-guide` | "invented phrase one" 40 at 12 | BIG: Add a section on rota swaps |',
    '| [ ]  | `/blog/beta-notes` | "invented phrase two" 30 at 9 | SMALL: new title and meta description |',
    '| [ ]  | `/blog/gamma-tips` | "invented phrase three" | Strengthen |',
    '| [x]  | `/blog/delta-page` | "invented phrase four" | small: Done 2026-11-02: retitled |',
  ].join('\n');
  const plan = parsePlan(md, 'docs/seo/next-9-blogs-2026-11.md');
  assert.deepEqual(
    plan.improve.map((r) => [r.page, r.size, r.todo]),
    [
      ['/blog/alpha-guide', 'big', 'Add a section on rota swaps'],
      ['/blog/beta-notes', 'small', 'new title and meta description'],
      ['/blog/gamma-tips', 'big', 'Strengthen'],
      ['/blog/delta-page', 'small', 'Done 2026-11-02: retitled'],
    ]
  );
  // The tag comes off the text, so a done row tagged SMALL still reads its date.
  assert.equal(plan.improve[3].doneDate, '2026-11-02');
  // A row from an older snapshot (the tag still in its text, no size field) reads the same.
  assert.equal(planRowSize({ todo: 'SMALL: one plain line near the top' }), 'small');
  assert.equal(planRowSize({ todo: 'Add a section' }), 'big');
  assert.equal(planRowSize(null), 'big');
});

test('an opportunity is small when its fix is a title or description, big otherwise, unless a size is set', () => {
  assert.equal(life.editSizeOf({ type: 'low-click-rate' }), 'small');
  assert.equal(life.editSizeOf({ type: 'near-page-one' }), 'big');
  assert.equal(life.editSizeOf({ type: 'slipping' }), 'big');
  assert.equal(life.editSizeOf({}), 'big');
  assert.equal(life.editSizeOf({ type: 'low-click-rate', size: 'big' }), 'big', "the founder's pick wins");
  assert.equal(life.editSizeOf({ type: 'near-page-one', size: 'small' }), 'small');
  assert.equal(life.editSizeOf({ size: 'huge' }), 'big', 'an unknown size is not a size');
});

test('a Done page edit stores its size; every recorded edit carries one', () => {
  const done = life.transition(null, 'done', {
    today: '2026-11-24',
    page: '/blog/alpha-guide',
    isPageEdit: true,
    size: 'small',
  });
  assert.equal(done.size, 'small');
  const notEdit = life.transition(null, 'done', { today: '2026-11-24', isPageEdit: false, size: 'small' });
  assert.equal('size' in notEdit, false, 'a Done that edits no page records no size');
  const plan = {
    file: 'p.md',
    improve: [
      { page: '/blog/row-small', done: false, size: 'small', todo: 'x' },
      { page: '/blog/row-done', done: true, doneDate: '2026-11-20', size: 'small', todo: 'x' },
    ],
  };
  const edits = life.deliberateEdits({
    items: {
      'opp-a': { status: 'done', doneAt: '2026-11-24', page: '/blog/a', isPageEdit: true, size: 'small' },
      'opp-b': { status: 'done', doneAt: '2026-11-24', page: '/blog/b', isPageEdit: true },
      'opp-c': {
        status: 'done',
        doneAt: '2026-11-24',
        page: '/blog/c',
        isPageEdit: true,
        meta: { type: 'low-click-rate' },
      },
      'plan-improve-/blog/row-small': {
        status: 'done',
        doneAt: '2026-11-24',
        page: '/blog/row-small',
        isPageEdit: true,
      },
    },
    plan,
    edits: [
      { page: '/blog/note-big', date: '2026-11-23', kind: 'manual', subject: 'Edit: new section' },
      { page: '/blog/note-small', date: '2026-11-23', kind: 'manual', subject: 'Edit: new title', size: 'small' },
    ],
  });
  const size = Object.fromEntries(edits.map((e) => [e.page, e.size]));
  assert.deepEqual(size, {
    '/blog/a': 'small',
    '/blog/b': 'big',
    '/blog/c': 'small',
    '/blog/row-small': 'small',
    '/blog/row-done': 'small',
    '/blog/note-big': 'big',
    '/blog/note-small': 'small',
  });
});

// ---------------------------------------------------------------- the week's two slots

const TODAY = '2026-11-25'; // a Wednesday; the week began Monday 23 November

test('editThisWeek gives the big and the small slot; a git edit of 15 lines or more uses the big one', () => {
  const frozen = new Map([
    ['/blog/old', { since: '2026-11-16', until: '2026-12-14', size: 'big' }],
    ['/blog/small-one', { since: '2026-11-24', until: '2026-12-22', size: 'small' }],
  ]);
  const none = life.editThisWeek(new Map(), TODAY);
  assert.deepEqual(none, { big: null, small: null });
  const w = life.editThisWeek(frozen, TODAY);
  assert.equal(w.big, null, 'last week does not count');
  assert.equal(w.small.page, '/blog/small-one');
  // Git: a big commit this week that no Done recorded uses the big slot; a small one uses none.
  const recent = life.recentEdits({
    contentEdits: [
      { page: '/blog/git-big', date: '2026-11-23', commit: 'c1', lines: 40 },
      { page: '/blog/git-small', date: '2026-11-24', commit: 'c2', lines: 3 },
    ],
    today: TODAY,
  });
  const g = life.editThisWeek(frozen, TODAY, { recent });
  assert.deepEqual(g.big, {
    page: '/blog/git-big',
    since: '2026-11-23',
    until: '2026-12-21',
    size: 'big',
    found: 'git',
  });
  assert.equal(g.small.page, '/blog/small-one');
  // A git commit the desk did record (a Done on that day or later) is not counted twice.
  const known = new Map([...frozen, ['/blog/git-big', { since: '2026-11-23', until: '2026-12-21', size: 'small' }]]);
  const k = life.editThisWeek(known, TODAY, { recent });
  assert.equal(k.big, null);
});

test('eligibility holds a page back only when the slot of its own size is used', () => {
  const frozen = new Map([['/blog/small-one', { since: '2026-11-24', until: '2026-12-22', size: 'small' }]]);
  const big = life.eligibility({ isPageEdit: true, page: '/blog/other', size: 'big' }, frozen, TODAY, { week: true });
  assert.equal(big.eligible, true, 'the big slot is free');
  const small = life.eligibility({ isPageEdit: true, page: '/blog/other', type: 'low-click-rate' }, frozen, TODAY, {
    week: true,
  });
  assert.equal(small.eligible, false);
  assert.deepEqual(small.weekEdit, { page: '/blog/small-one', date: '2026-11-24', size: 'small' });
  assert.equal(life.editWhenText(small), 'Next small page change from 30 November');
  // The edited page itself is frozen for its 28 days, whatever the size.
  assert.equal(
    life.editWhenText(life.eligibility({ isPageEdit: true, page: '/blog/small-one' }, frozen, TODAY, { week: true })),
    'Leave it until 22 December'
  );
});

test('editStatus says which slots are used', () => {
  const big = new Map([['/blog/big-one', { since: '2026-11-23', until: '2026-12-21', size: 'big' }]]);
  const small = new Map([['/blog/small-one', { since: '2026-11-24', until: '2026-12-22', size: 'small' }]]);
  const both = new Map([...big, ...small]);
  assert.equal(week.editStatusOf(new Map(), TODAY), null);
  assert.equal(
    week.editStatusOf(big, TODAY),
    "This week's big change is used (/blog/big-one, 23 November); the small one is still open."
  );
  assert.equal(
    week.editStatusOf(small, TODAY),
    "This week's small change is used (/blog/small-one, 24 November); the big one is still open."
  );
  assert.equal(
    week.editStatusOf(both, TODAY),
    "This week's big change (/blog/big-one, 23 November) and small change (/blog/small-one, 24 November) are both used. The next ones can go in from 30 November."
  );
  const recent = life.recentEdits({
    contentEdits: [{ page: '/blog/git-big', date: '2026-11-23', commit: 'c1', lines: 40 }],
    today: TODAY,
  });
  assert.equal(
    week.editStatusOf(small, TODAY, { recent }),
    "This week's big change (/blog/git-big, 23 November, found in git) and small change (/blog/small-one, 24 November) are both used. The next ones can go in from 30 November."
  );
  noDash(week.editStatusOf(both, TODAY));
});

// ---------------------------------------------------------------- the proposal

const row = (page, size, extra = {}) => ({
  page,
  done: false,
  size,
  search: `invented search for ${page}`,
  todo: `Do ${page}`,
  ...extra,
});
const opp = (id, extra = {}) => ({
  id,
  type: 'near-page-one',
  page: `/blog/${id}`,
  title: `Title ${id}`,
  measured: `The page ${id} showed up 50 times.`,
  action: 'a',
  test: 't',
  isPageEdit: true,
  score: { total: 50 },
  ...extra,
});
const edits = (cards) => cards.filter((c) => c.isPageEdit).map((c) => [c.size, c.page]);

test('the proposal offers the best big and the best small page change, each saying which slot it fills', () => {
  const plan = { posts: [], improve: [row('/blog/row-big', 'big'), row('/blog/row-small', 'small')] };
  const cards = week.proposeTop5({ plan, ranked: [opp('opp-a')], today: TODAY, size: 5 });
  assert.deepEqual(edits(cards), [
    ['big', '/blog/row-big'],
    ['small', '/blog/row-small'],
  ]);
  assert.equal(
    cards[0].why,
    "It is this week's big page change: the first open big page improvement in your plan, and its page can be edited now."
  );
  assert.equal(
    cards[1].why,
    "It is this week's small page change: the first open small page improvement in your plan, and its page can be edited now."
  );
  noDash(cards);
  // With no small plan row, the small change is the best small opportunity (a title or description fix).
  const noSmallRow = week.proposeTop5({
    plan: { posts: [], improve: [row('/blog/row-big', 'big')] },
    ranked: [opp('opp-a'), opp('opp-ctr', { type: 'low-click-rate', measured: 'Shown 300 times, clicked twice.' })],
    today: TODAY,
    size: 5,
  });
  assert.deepEqual(edits(noSmallRow), [
    ['big', '/blog/row-big'],
    ['small', '/blog/opp-ctr'],
  ]);
  assert.match(
    noSmallRow[1].why,
    /^It is this week's small page change: the best small page edit that can go in now\. Shown 300 times/
  );
  // With no plan rows at all, the big one is the best big opportunity.
  const noRows = week.proposeTop5({
    plan: null,
    ranked: [opp('opp-a'), opp('opp-ctr', { type: 'low-click-rate' })],
    today: TODAY,
  });
  assert.deepEqual(edits(noRows), [
    ['big', '/blog/opp-a'],
    ['small', '/blog/opp-ctr'],
  ]);
});

test('the proposal skips a page edited within 28 days, never offers one page twice, and never two competing pages', () => {
  // The first big row was edited in git 20 days ago: the next big row is offered.
  const recent = life.recentEdits({
    contentEdits: [{ page: '/blog/row-held', date: '2026-11-05', commit: 'c1', lines: 30 }],
    today: TODAY,
  });
  const frozen = new Map([['/blog/row-frozen', { since: '2026-11-10', until: '2026-12-08', size: 'small' }]]);
  const plan = {
    posts: [],
    improve: [
      row('/blog/row-held', 'big'),
      row('/blog/row-big', 'big'),
      row('/blog/row-frozen', 'small'),
      row('/blog/row-big', 'small'),
      row('/blog/rival-of-big', 'small'),
      row('/blog/row-small', 'small'),
    ],
  };
  const competing = new Map([
    ['/blog/row-big', new Set(['/blog/rival-of-big'])],
    ['/blog/rival-of-big', new Set(['/blog/row-big'])],
  ]);
  const cards = week.proposeTop5({ plan, frozen, recent, competing, today: TODAY, size: 5 });
  assert.deepEqual(edits(cards), [
    ['big', '/blog/row-big'],
    ['small', '/blog/row-small'],
  ]);
});

test('a used slot has no card; a plan row marked done this week stays in its own slot, shown done', () => {
  const plan = {
    posts: [],
    improve: [row('/blog/row-big', 'big'), row('/blog/row-small', 'small'), row('/blog/row-small-2', 'small')],
  };
  const items = {
    'plan-improve-/blog/row-small': {
      status: 'done',
      doneAt: '2026-11-24',
      page: '/blog/row-small',
      isPageEdit: true,
      size: 'small',
    },
  };
  const frozen = life.frozenPages({ items, plan, today: TODAY });
  const cards = week.proposeTop5({ plan, items, frozen, today: TODAY, size: 5 });
  assert.deepEqual(edits(cards), [
    ['big', '/blog/row-big'],
    ['small', '/blog/row-small'],
  ]);
  assert.equal(cards[1].id, 'plan-improve-/blog/row-small', 'the done row holds the small slot');
  // A small change made outside the plan (an edit note): no small card at all, the big one stays.
  const noted = new Map([['/blog/elsewhere', { since: '2026-11-23', until: '2026-12-21', size: 'small' }]]);
  const after = week.proposeTop5({ plan, frozen: noted, today: TODAY, size: 5 });
  assert.deepEqual(edits(after), [['big', '/blog/row-big']]);
});

test("a small change on a page that competes with this week's big change is not offered", () => {
  const plan = { posts: [], improve: [row('/blog/rival', 'small'), row('/blog/row-small', 'small')] };
  const frozen = new Map([['/blog/big-done', { since: '2026-11-23', until: '2026-12-21', size: 'big' }]]);
  const competing = new Map([
    ['/blog/big-done', new Set(['/blog/rival'])],
    ['/blog/rival', new Set(['/blog/big-done'])],
  ]);
  const cards = week.proposeTop5({ plan, frozen, competing, today: TODAY, size: 5 });
  assert.deepEqual(edits(cards), [['small', '/blog/row-small']]);
});

test('four weeks of the plan: each Monday proposes one big and one small, then Done uses them', () => {
  // The first big row was edited in git on 30 October (held until 27 November).
  const recent0 = [{ page: '/blog/twelve', date: '2026-10-30', commit: 'c0', lines: 30 }];
  const plan = {
    file: 'p.md',
    posts: [],
    improve: [
      row('/blog/twelve', 'big'),
      row('/blog/template', 'small'),
      row('/blog/by-region', 'big'),
      row('/blog/ratios-small', 'big'),
      row('/blog/app-guide', 'small'),
      row('/blog/eight-hour', 'small'),
    ],
  };
  let items = {};
  const got = [];
  for (const monday of ['2026-11-23', '2026-11-30', '2026-12-07']) {
    const frozen = life.frozenPages({ items, plan, today: monday });
    const recent = life.recentEdits({ contentEdits: recent0, frozen, today: monday });
    const cards = week.proposeTop5({ plan, items, frozen, recent, today: monday, size: 5 });
    const pair = edits(cards);
    got.push([monday, ...pair.map(([s, p]) => `${s} ${p}`)]);
    for (const c of cards.filter((x) => x.isPageEdit)) {
      items = {
        ...items,
        [c.id]: life.transition(items[c.id], 'done', { today: monday, page: c.page, isPageEdit: true, size: c.size }),
      };
    }
    const after = life.frozenPages({ items, plan, today: monday });
    assert.match(
      week.editStatusOf(after, monday),
      /^This week's big change \(.+\) and small change \(.+\) are both used\./
    );
  }
  assert.deepEqual(got, [
    ['2026-11-23', 'big /blog/by-region', 'small /blog/template'],
    ['2026-11-30', 'big /blog/twelve', 'small /blog/app-guide'],
    ['2026-12-07', 'big /blog/ratios-small', 'small /blog/eight-hour'],
  ]);
});

// ---------------------------------------------------------------- the words a person reads

test('the Settings reply carries the rule in one sentence, and the Done confirm names the slot', () => {
  invalidate();
  const s = settingsView(buildModel());
  assert.equal(s.editRule, life.EDIT_RULE_TEXT);
  assert.match(s.editRule, /one big page change \(a new or rewritten section\) and one small one/);
  assert.match(s.editRule, /on different pages/);
  assert.match(s.editRule, /28 days/);
  noDash(s.editRule);
  const box = doneConfirmText(['/blog/alpha-guide'], {
    frozenUntil: '22 December',
    verdictAbout: '24 December',
    size: 'small',
  });
  assert.match(box.body, /It uses this week's small page change\./);
  assert.equal(sizePicked({ size: 'small' }), 'small');
  assert.equal(sizePicked({ size: 'small', sizePick: 'big' }), 'big', "the founder's pick wins");
  assert.equal(sizePicked({}), 'big');
});
