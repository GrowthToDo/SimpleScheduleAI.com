import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Package 6 (2026-11-15): the desk says one thing. One function decides each fact, and every page,
// tile, sentence and the Ask digest read it. Every page, phrase and number here is invented.

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-p6-'));
const DATA = path.join(root, 'data');
const REPO = path.join(root, 'repo');
fs.mkdirSync(path.join(REPO, 'docs/seo'), { recursive: true });
fs.writeFileSync(path.join(REPO, 'docs/seo/brand-terms.json'), JSON.stringify(['examplebrand']));
process.env.SEO_DESK_DATA = DATA;
process.env.SEO_DESK_REPO = REPO;
process.env.SEO_DESK_TODAY = '2026-11-18';

const week = await import('../lib/week.mjs');
const { addDays } = await import('../lib/dates.mjs');
const { buildModel, invalidate, pageEdits, editNoteIn } = await import('../lib/api/model.mjs');
const work = await import('../lib/api/work.mjs');
const search = await import('../lib/api/search.mjs');
const insights = await import('../lib/api/ext/insights.mjs');
const { buildDeskBrief } = await import('../lib/ask.mjs');
const { writeJson } = await import('../lib/store.mjs');

const TODAY = '2026-11-18'; // a Wednesday; the week began Monday 16 November
const noDash = (v) => assert.equal(/[–—]/.test(JSON.stringify(v)), false, 'no em or en dash');

// ---------------------------------------------------------------- fixtures

const W = { cur: { start: '2026-10-18', end: '2026-11-14' }, prev: { start: '2026-09-20', end: '2026-10-17' } };
const weeksOfRows = (page, start, weeks, position = 8) => {
  const out = [];
  weeks.forEach((total, w) => {
    for (let d = 0; d < 7; d++) {
      const base = Math.floor(total / 7);
      out.push({
        page,
        date: addDays(start, w * 7 + d),
        clicks: 0,
        impressions: base + (d === 0 ? total - base * 7 : 0),
        position,
      });
    }
  });
  return out;
};
const steady = (n) =>
  Array.from({ length: n }, (_, i) => [
    ...weeksOfRows(`/blog/steady-${i}`, W.prev.start, [100, 100, 100, 100]),
    ...weeksOfRows(`/blog/steady-${i}`, W.cur.start, [100, 100, 100, 100]),
  ]).flat();
const pageDaily = () => [
  ...steady(6),
  // Lost its place: a page that needs a look.
  ...weeksOfRows('/blog/steady-fall', W.prev.start, [122, 185, 153, 143], 7),
  ...weeksOfRows('/blog/steady-fall', W.cur.start, [91, 84, 47, 64], 9.5),
  // Held its place while its views fell: lost demand, best left alone.
  ...weeksOfRows('/blog/quiet-fall', W.prev.start, [200, 200, 200, 200]),
  ...weeksOfRows('/blog/quiet-fall', W.cur.start, [40, 40, 40, 40]),
];

const snap = (source, data) =>
  writeJson(`snap/${source}.json`, {
    source,
    ok: true,
    status: 'fresh',
    pulledAt: '2026-11-17T06:00:00.000Z',
    through: '2026-11-14',
    error: null,
    data,
  });

function modelFixture({ local = {}, items = {} } = {}) {
  fs.rmSync(DATA, { recursive: true, force: true });
  snap('gsc', {
    siteDaily: [],
    pageDaily: pageDaily(),
    qpCur: [],
    qpPrev: [],
    queryCur: [],
    queryPrev: [],
    windows: W,
  });
  snap('local', {
    livePages: [
      { page: '/blog/steady-fall' },
      { page: '/blog/quiet-fall' },
      ...Array.from({ length: 6 }, (_, i) => ({ page: `/blog/steady-${i}` })),
    ],
    registry: [],
    plan: { file: null, error: null, posts: [], improve: [] },
    openWork: [],
    edits: [],
    contentEdits: [],
    verdicts: [],
    due: [],
    googleUpdates: [],
    ...local,
  });
  writeJson('state/items.json', items);
  invalidate();
  return buildModel();
}

// ---------------------------------------------------------------- B1: verdicts say one thing

test('B1: one reading of the due changes: readable, unreadable, waiting for data and the next date one can be read', () => {
  const due = [
    { date: '2026-10-01', url: '/blog/aa', commits: [{ hash: 'c1' }], overlapping: true },
    { date: '2026-10-02', url: '/blog/bb', commits: [{ hash: 'c2' }], overlapping: true },
    // Finished its wait, but the data does not cover its 28 days after yet.
    { date: '2026-10-20', url: '/blog/cc', commits: [{ hash: 'c3' }], overlapping: true },
  ];
  const pending = [
    // Another edit of the same page landed 11 days later, so this one cannot be read either.
    { page: '/blog/dd', changeDate: '2026-10-25', judgeFrom: '2026-11-24' },
    { page: '/blog/ee', changeDate: '2026-10-27', judgeFrom: '2026-11-26' },
  ];
  const edits = [
    { page: '/blog/dd', date: '2026-10-25', kind: 'edit' },
    { page: '/blog/dd', date: '2026-11-05', kind: 'edit' },
    { page: '/blog/ee', date: '2026-10-27', kind: 'edit' },
    // A note on another day is not an overlap (change-log counts edits and publishes only).
    { page: '/blog/ee', date: '2026-11-01', kind: 'manual' },
  ];
  const s = week.verdictStateOf({ due, through: '2026-11-14', pending, edits, today: TODAY });
  assert.equal(s.readable, 0);
  assert.equal(s.unreadable, 2);
  assert.equal(s.waitingForData, 1);
  assert.equal(s.nextReadableDate, '2026-11-26');
  assert.deepEqual(s.next, { date: '2026-11-26', kind: 'pending', pages: ['/blog/ee'] });
  assert.equal(s.unreadableText, '2 due changes overlap other edits and cannot be read');
  assert.equal(
    s.judgeText,
    'It will mark those 2 as cannot be read and clear them from this list. Nothing is saved until you press Save these verdicts.'
  );
  assert.match(s.statusLine, /press Judge now, then Save these verdicts\.$/);
  // With one change that can be read, it is today, and Judge now says it will work that verdict out.
  const one = week.verdictStateOf({
    due: [...due, { date: '2026-10-03', url: '/blog/ff', commits: [{ hash: 'c4' }], overlapping: false }],
    through: '2026-11-14',
    today: TODAY,
  });
  assert.equal(one.readable, 1);
  assert.equal(one.nextReadableDate, TODAY);
  assert.equal(one.statusLine, null);
  assert.match(one.judgeText, /^It will work out a verdict for the 1 change that can be read and mark the 2 others/);
  noDash([s, one]);
});

test('B1: the week line, the Next verdict tile, Did it work and the Ask digest say the same about due changes', () => {
  const due = Array.from({ length: 3 }, (_, i) => ({
    date: `2026-10-0${i + 1}`,
    slug: `due-${i}`,
    url: `/blog/due-${i}`,
    kind: 'edit',
    commits: [{ hash: `h${i}` }],
    overlapping: true,
  }));
  const m = modelFixture({
    local: {
      due,
      // A clean change still inside its wait: the next date a verdict can be read.
      edits: [{ page: '/blog/steady-2', date: '2026-10-30', kind: 'edit', subject: 'content: an invented rewrite' }],
    },
  });
  const v = work.weekView(m);
  const r = work.resultsView(m);
  const line = '3 due changes overlap other edits and cannot be read';
  assert.ok(v.statusLines[0].startsWith(`${line}, so there is nothing to learn from them.`));
  assert.match(v.statusLines[0], /press Judge now, then Save these verdicts/);
  assert.equal(v.nextVerdict.ready, false, 'nothing can be read today, so the tile does not say Ready now');
  assert.equal(v.nextVerdict.date, '2026-11-29');
  assert.equal(v.nextVerdict.dateText, '29 November');
  assert.match(v.nextVerdict.note, new RegExp(`${line}$`));
  assert.equal(r.dueReady.readable, 0);
  assert.equal(r.dueReady.unreadable, 3);
  assert.equal(r.dueReady.unreadableText, line);
  assert.equal(
    r.dueReady.judgeText,
    'It will mark those 3 as cannot be read and clear them from this list. Nothing is saved until you press Save these verdicts.'
  );
  assert.ok(!v.top5.some((c) => c.id === 'verdict-due'), 'no verdict card when nothing can be read');
  const brief = buildDeskBrief(m, 'What should I do this week?').text;
  assert.match(brief, /"canBeRead":0/);
  assert.match(brief, /"dueButCannotBeRead":3/);
  assert.ok(brief.includes(line));
});

// ---------------------------------------------------------------- B2: edit dates have one source

test('B2: a page edits are deliberate (logged, or 15 lines or more in git) or small; "last edited" is said of a deliberate one only', () => {
  const m = modelFixture({
    local: {
      edits: [
        { page: '/blog/steady-fall', date: '2026-11-03', kind: 'edit', subject: 'fix: one link' },
        { page: '/blog/steady-0', date: '2026-10-28', kind: 'edit', subject: 'content: an invented rewrite' },
      ],
      contentEdits: [
        { page: '/blog/steady-fall', date: '2026-11-03', commit: 'aa1', lines: 1, subject: 'fix: one link' },
        { page: '/blog/steady-0', date: '2026-10-28', commit: 'bb1', lines: 40, subject: 'content: a rewrite' },
        { page: '/blog/steady-0', date: '2026-11-02', commit: 'bb2', lines: 3, subject: 'fix: a count' },
      ],
    },
  });
  const small = pageEdits(m, '/blog/steady-fall');
  assert.deepEqual(small.deliberate, []);
  assert.deepEqual(small.small, [{ date: '2026-11-03', lines: 1 }]);
  assert.equal(small.last, null);
  assert.equal(
    editNoteIn(small, '2026-10-18', '2026-11-14'),
    'The page had a small change on 3 November (1 line), inside these dates.'
  );
  const big = pageEdits(m, '/blog/steady-0');
  assert.equal(big.last, '2026-10-28');
  assert.equal(big.deliberate[0].kind, 'git');
  assert.equal(
    editNoteIn(big, '2026-10-18', '2026-11-14'),
    'The page was last edited on 28 October, and had a small change on 2 November (3 lines), inside these dates.'
  );

  // The worry and the page detail use the same words, and the same line on when it may be edited.
  const w = work.weekView(m);
  const worry = w.worries.find((x) => x.page === '/blog/steady-fall');
  assert.ok(worry, 'a one-line change does not hide the drop');
  assert.match(worry.measured, /The page had a small change on 3 November \(1 line\), inside these dates\./);
  assert.doesNotMatch(worry.measured, /last edited/);
  const detail = search.pageView(m, '/blog/steady-fall');
  assert.equal(detail.lastEdit, null);
  assert.equal(detail.smallChange, 'a small change on 3 November (1 line)');
  assert.equal(worry.editWhen, 'Can be edited now');
  assert.equal(detail.editWhen, worry.editWhen);
  const row = search.pageRows(m).find((r) => r.page === '/blog/steady-0');
  assert.equal(row.lastEdit, '2026-10-28', 'the Pages list calls the 40 line edit an edit');
  noDash([worry, detail]);
});

test('B2: the edit-when line and the chip read the same words: "Can be edited from" after the week edit, "Leave it until" when held', () => {
  const m = modelFixture({
    local: {
      plan: {
        file: 'docs/seo/plan.md',
        error: null,
        posts: [],
        improve: [{ page: '/blog/steady-1', done: true, doneDate: '2026-11-16', search: 's', todo: 't' }],
      },
    },
  });
  const w = work.weekView(m);
  const worry = w.worries.find((x) => x.page === '/blog/steady-fall');
  assert.equal(worry.editWhen, 'Can be edited from 23 November');
  assert.equal(worry.eligibility.text, worry.editWhen);
  const held = search.pageView(m, '/blog/steady-1');
  assert.equal(held.editWhen, 'Leave it until 14 December');
  assert.equal(held.eligibility.text, held.editWhen);
});

// ---------------------------------------------------------------- B3: pages to leave alone, one number

test('B3: the week, the Pages tile and Did it work show one count of the pages to leave alone, with what makes it up', () => {
  const m = modelFixture({
    local: {
      plan: {
        file: 'docs/seo/plan.md',
        error: null,
        posts: [],
        improve: [{ page: '/blog/steady-1', done: true, doneDate: '2026-11-10', search: 's', todo: 't' }],
      },
      contentEdits: [
        { page: '/blog/steady-3', date: '2026-11-01', commit: 'cc1', lines: 30, subject: 'content: a rewrite' },
        // Not a live page in the Pages list, but still a page to leave alone.
        { page: '/blog/not-listed', date: '2026-11-02', commit: 'cc2', lines: 25, subject: 'content: a rewrite' },
      ],
    },
  });
  const v = work.weekView(m);
  const r = work.resultsView(m);
  const p = search.pagesView(m);
  const want = { name: 'Pages to leave alone', count: 3, text: '1 with a logged edit, 2 found in git' };
  for (const s of [v.leaveAloneSummary, r.leaveAloneSummary, p.leaveAlone]) {
    assert.equal(s.name, want.name);
    assert.equal(s.count, want.count);
    assert.equal(s.text, want.text);
  }
  assert.equal(v.leaveAlone.length, 3);
  assert.equal(r.leaveAlone.length, 3);
  assert.deepEqual(p.leaveAlone.notListed, ['/blog/not-listed']);
  // The Pages filter reads the same set.
  assert.deepEqual(
    p.items
      .filter((x) => x.leaveAlone)
      .map((x) => x.page)
      .sort(),
    ['/blog/steady-1', '/blog/steady-3']
  );
});

// ---------------------------------------------------------------- B4: a card whose advice is to leave the page

test('B4: on Decay a lost demand card is Watching: no priority, no eligibility chip, after the cards that need a look', () => {
  const m = modelFixture();
  const d = insights.decayView(m);
  assert.deepEqual(
    d.items.map((o) => o.page),
    ['/blog/steady-fall', '/blog/quiet-fall'],
    'the card that needs a look comes first'
  );
  const quiet = d.items.find((o) => o.page === '/blog/quiet-fall');
  assert.equal(quiet.dropKind, 'lost-demand');
  assert.match(quiet.watch, /fewer people may be searching/);
  assert.equal(quiet.priority, null);
  assert.equal(quiet.eligibility, null);
  assert.ok(quiet.leaveIt, 'Leave it is offered');
  const fall = d.items.find((o) => o.page === '/blog/steady-fall');
  assert.equal(fall.watch, null);
  assert.ok(fall.priority);
  assert.equal(d.count, 2, 'the sidebar counts every card on the Decay list');
  assert.equal(d.lookCount, 1, 'Pages to look at counts only the ones that need a look');
  assert.equal(d.watchCount, 1);
  // The week files it the same way, under Watching, with no eligibility chip.
  const w = work.weekView(m);
  const watched = w.watching.find((x) => x.page === '/blog/quiet-fall');
  assert.equal(watched.watch, quiet.watch);
  assert.equal(watched.eligibility, null);
});

// ---------------------------------------------------------------- B5: "decaying" means one thing

test('B5: the Decay page tables say shown less and shown more, not decaying and growing', () => {
  const big = Array.from({ length: 60 }, (_, i) => [
    ...weeksOfRows(`/blog/less-${i}`, W.prev.start, [100, 100, 100, 100]),
    ...weeksOfRows(`/blog/less-${i}`, W.cur.start, [60, 60, 60, 60]),
  ]).flat();
  fs.rmSync(DATA, { recursive: true, force: true });
  snap('gsc', {
    siteDaily: [],
    pageDaily: [...pageDaily(), ...big],
    qpCur: [],
    qpPrev: [],
    queryCur: [],
    queryPrev: [],
    windows: W,
  });
  snap('local', {
    livePages: [],
    registry: [],
    plan: null,
    openWork: [],
    edits: [],
    contentEdits: [],
    verdicts: [],
    due: [],
  });
  invalidate();
  const d = insights.decayView(buildModel());
  assert.match(d.shownText.pages.decaying, /pages shown less\.$/);
  for (const v of [...Object.values(d.shownText.pages), ...Object.values(d.shownText.queries)])
    assert.doesNotMatch(v ?? '', /decaying|growing/);
});

// ---------------------------------------------------------------- C4: held pages are not pushed

const near = (id, page, total) => ({
  id,
  type: 'near-page-one',
  page,
  query: `${id} phrase`,
  title: `Title ${id}`,
  measured: 'm',
  action: 'a',
  test: 't',
  isPageEdit: true,
  score: { total, parts: [] },
});

test('C4: an item on a held page is marked held, never pushed, and comes after the ones that can be worked on', () => {
  const m = modelFixture({
    local: {
      contentEdits: [
        { page: '/blog/steady-3', date: '2026-11-01', commit: 'cc1', lines: 30, subject: 'content: a rewrite' },
      ],
    },
  });
  // Two invented runner-ups: the better scored one is on the page git shows edited lately.
  m.opps.unshift(near('held1', '/blog/steady-3', 90), near('free1', '/blog/steady-4', 50));
  m.oppById.set('held1', m.opps[0]);
  m.oppById.set('free1', m.opps[1]);
  m.memo.clear();
  const list = work.opportunitiesView(m, { status: 'open' });
  const ids = list.items.map((o) => o.id);
  assert.ok(ids.indexOf('free1') < ids.indexOf('held1'), 'the free item first');
  const held = list.items.find((o) => o.id === 'held1');
  assert.equal(held.held, true);
  assert.equal(held.heldKind, 'page');
  assert.equal(list.items.find((o) => o.id === 'free1').held, false);
  const heldIds = list.items.filter((o) => o.held).map((o) => o.id);
  assert.ok(heldIds.includes('held1'));
  assert.ok(list.items.filter((o) => o.held).every((o) => o.page === '/blog/steady-3'));
  assert.equal(list.held.page, heldIds.length);
  assert.equal(list.held.text, `${heldIds.length} more are on pages to leave alone and are hidden.`);
  const ru = insights.runnerUpView(m);
  assert.deepEqual(
    ru.items.map((o) => o.id),
    ['free1', 'held1']
  );
  const w = work.weekView(m);
  const top = w.opportunities.map((o) => o.id);
  assert.ok(top.indexOf('free1') < top.indexOf('held1'));
});

test("C4: once this week's page edit is used, page edits are held for the week, and the note says when they free up", () => {
  const m = modelFixture({
    local: {
      plan: {
        file: 'docs/seo/plan.md',
        error: null,
        posts: [],
        improve: [{ page: '/blog/steady-1', done: true, doneDate: '2026-11-16', search: 's', todo: 't' }],
      },
    },
  });
  m.opps.unshift(near('wk1', '/blog/steady-4', 50));
  m.oppById.set('wk1', m.opps[0]);
  m.memo.clear();
  const list = work.opportunitiesView(m, { status: 'open' });
  const it = list.items.find((o) => o.id === 'wk1');
  assert.equal(it.held, true);
  assert.equal(it.heldKind, 'week');
  // It stays in the list (only pages to leave alone are hidden) and the line says why it waits.
  assert.match(list.held.text, /in this list waits? for next week's page edit, from 23 November\.$/);
});

// ---------------------------------------------------------------- B7: the same label gives the same number

test('B7: the keyword map flags a runner-up target spelled another way, and Queries reads "right page" as Keywords does', () => {
  const qp = (query, page, impressions, position) => ({ query, page, clicks: 0, impressions, position });
  fs.rmSync(DATA, { recursive: true, force: true });
  const qpCur = [
    qp('ward rota problem', '/blog/the-ward-rota-problem', 60, 11.4),
    qp('lilac shift planner', '/blog/lilac-planner', 6, 4),
  ];
  snap('gsc', {
    siteDaily: [],
    pageDaily: [],
    qpCur,
    qpPrev: [],
    queryCur: [
      { query: 'ward rota problem', impressions: 60, clicks: 0, position: 11.4 },
      { query: 'lilac shift planner', impressions: 6, clicks: 0, position: 4 },
    ],
    queryPrev: [],
    windows: W,
  });
  snap('local', {
    livePages: [{ page: '/blog/the-ward-rota-problem' }, { page: '/blog/lilac-planner' }],
    registry: [
      { slug: 'the-ward-rota-problem', url: '/blog/the-ward-rota-problem', primaryKeyword: 'the ward rota problem' },
      { slug: 'lilac-planner', url: '/blog/lilac-planner', primaryKeyword: 'lilac shift planner' },
    ],
    plan: null,
    openWork: [],
    edits: [],
    contentEdits: [],
    verdicts: [],
    due: [],
  });
  writeJson('state/items.json', {});
  invalidate();
  const m = buildModel();
  const runnerUps = insights.runnerUpView(m).items.map((o) => o.query);
  const map = insights.keywordTable(m);
  assert.equal(map.counters.runnerUp, runnerUps.length, 'Runner-up on the map equals the Runner-up list');
  // Six views is too few to tell which page wins: Queries says so, as the Keywords page does.
  const lilac = search.targetsView(m).rows.find((r) => r.keyword === 'lilac shift planner');
  assert.equal(lilac.alignment, 'too few views');
});

// ---------------------------------------------------------------- B8 and D6: no "the five"

test('B8, D6: no text a person reads still says "the five" or describes the old fixed five', () => {
  const dir = new URL('../static/views/', import.meta.url);
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.js')) continue;
    const text = fs.readFileSync(new URL(f, dir), 'utf8');
    // Only the strings, not the comments.
    const strings = text.replace(/^\s*\/\/.*$/gm, '').match(/(['"`])(?:\\.|(?!\1)[^\\])*\1/g) ?? [];
    for (const s of strings) {
      assert.doesNotMatch(s, /\bthe five\b|week's five|full five/i, `${f}: ${s}`);
    }
  }
});
