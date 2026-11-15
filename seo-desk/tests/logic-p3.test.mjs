import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// The logic audit of 2026-11-14, package 3: the weekly plan, the worries, the 28 day freeze and the
// verdicts. Every page, commit, phrase and number here is invented.

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-p3-'));
const DATA = path.join(root, 'data');
const REPO = path.join(root, 'repo');
fs.mkdirSync(path.join(REPO, 'docs/seo'), { recursive: true });
fs.mkdirSync(path.join(REPO, 'src/data/article'), { recursive: true });
fs.writeFileSync(path.join(REPO, 'src/data/article/sample-brief.md'), '---\ntitle: x\n---\n');
process.env.SEO_DESK_DATA = DATA;
process.env.SEO_DESK_REPO = REPO;
process.env.SEO_DESK_TODAY = '2026-11-14';

const life = await import('../lib/lifecycle.mjs');
const week = await import('../lib/week.mjs');
const local = await import('../lib/sources/local.mjs');
const lessons = await import('../lib/lessons.mjs');
const { buildModel, invalidate, eligibilityOf, GIT_UNREAD } = await import('../lib/api/model.mjs');
const work = await import('../lib/api/work.mjs');
const { buildDeskBrief } = await import('../lib/ask.mjs');
const { recentBox, editRefusal, postAction } = await import('../static/views/post-action.js');
const { writeJson } = await import('../lib/store.mjs');
const { windowsFor } = await import('../../scripts/lib/change-log-core.mjs');
const { addDays } = await import('../lib/dates.mjs');

const TODAY = '2026-11-14'; // a Saturday; the week runs 9 to 15 November

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

// ---------------------------------------------------------------- C3: edits found in git

const NUMSTAT = [
  '@@aaaa111|2026-11-09|content: rewrite the sample guide',
  '',
  '149\t150\tsrc/data/post/sample-guide.md',
  '2\t1\tsrc/data/post/other-guide.md',
  '@@bbbb222|2026-11-08|chore: rename and retire',
  '',
  '0\t0\tsrc/data/post/{old-name => new-name}.md',
  '0\t40\tsrc/data/post/retired.md',
  ' delete mode 100644 src/data/post/retired.md',
  '@@cccc333|2026-11-07|content: publish a new post',
  '',
  '120\t0\tsrc/data/post/brand-new.md',
  '30\t2\tsrc/data/post/draft-flip.md',
  '-\t-\tsrc/assets/picture.png',
  ' create mode 100644 src/data/post/brand-new.md',
].join('\n');

const DRAFTS = [
  '@@cccc333',
  'diff --git a/src/data/post/draft-flip.md b/src/data/post/draft-flip.md',
  '--- a/src/data/post/draft-flip.md',
  '+++ b/src/data/post/draft-flip.md',
  '@@ -4 +4 @@ title',
  '-draft: true',
  '+draft: false',
  '@@aaaa111',
  '+++ b/src/data/post/sample-guide.md',
  '-draft: false',
  '+draft: false',
].join('\n');

test('C3: git content edits keep real edits, and leave out renames, deletes and the commit that published a page', () => {
  const rows = local.parseContentEdits(NUMSTAT);
  assert.deepEqual(
    rows.map((r) => [r.page, r.date, r.lines]),
    [
      ['/blog/sample-guide', '2026-11-09', 299],
      ['/blog/other-guide', '2026-11-09', 3],
      ['/blog/draft-flip', '2026-11-07', 32],
    ]
  );
  const published = local.parsePublishCommits(DRAFTS);
  assert.ok(published.has('cccc333|src/data/post/draft-flip.md'), 'a draft flipped live is the publish');
  assert.ok(!published.has('aaaa111|src/data/post/sample-guide.md'), 'a moved draft line is not a publish');

  const calls = [];
  const git = (args) => {
    calls.push(args);
    return args.includes('-p') ? DRAFTS : NUMSTAT;
  };
  const edits = local.readContentEdits({ repoRoot: REPO, today: TODAY, git });
  assert.deepEqual(
    edits.map((e) => e.page),
    ['/blog/sample-guide', '/blog/other-guide'],
    'the publishing commit is left out'
  );
  assert.equal(calls.length, 2, 'two git calls for the whole window, not one per page');
  assert.ok(calls.every((a) => a.includes('--since=2026-10-10')));
});

test('C3: a failed git read is reported, and the desk falls back to the freeze alone', async () => {
  const out = await local.pullLocal({
    today: TODAY,
    repoRoot: REPO,
    fetchImpl: async () => {
      throw new Error('offline');
    },
    git: () => {
      throw new Error('git: command not found');
    },
  });
  assert.equal(out.data.contentEdits, null);
  assert.match(out.data.contentEditsError, /git could not be read/);
  assert.ok(out.data.warnings.some((w) => /^contentEdits: /.test(w)));

  snap('local', { ...out.data, livePages: [{ page: '/blog/sample-guide' }] });
  invalidate();
  const model = buildModel();
  assert.ok(model.warnings.includes(GIT_UNREAD));
  assert.equal(eligibilityOf(model, { isPageEdit: true, page: '/blog/sample-guide' }).eligible, true);
});

test('C3: a git edit of 15 lines or more the freeze does not know holds the page, a smaller one only touches it', () => {
  const contentEdits = [
    { page: '/blog/sample-guide', date: '2026-11-09', commit: 'aaaa111', lines: 299 },
    { page: '/blog/other-guide', date: '2026-11-09', commit: 'aaaa111', lines: 3 },
    { page: '/blog/known-guide', date: '2026-11-02', commit: 'dddd444', lines: 50 },
    { page: '/blog/old-guide', date: '2026-10-15', commit: 'eeee555', lines: 80 },
  ];
  const frozen = new Map([['/blog/known-guide', { since: '2026-11-03', until: '2026-12-01' }]]);
  const recent = life.recentEdits({ contentEdits, frozen, today: TODAY });
  assert.deepEqual([...recent.keys()].sort(), ['/blog/other-guide', '/blog/sample-guide']);

  const held = life.eligibility({ isPageEdit: true, page: '/blog/sample-guide' }, frozen, TODAY, { recent });
  assert.equal(held.eligible, false);
  assert.equal(held.from, '2026-12-07');
  assert.equal(
    life.eligibilityText(held),
    'Edited 9 November (found in git, 299 lines). Leave it until 7 December unless that edit was minor'
  );
  const touched = life.withEligibilityText(
    life.eligibility({ isPageEdit: true, page: '/blog/other-guide' }, frozen, TODAY, { recent })
  );
  assert.equal(touched.eligible, true);
  assert.equal(touched.text, 'Eligible now');
  assert.equal(touched.touchedText, 'Also touched on 9 November (3 lines)');
  // Without `recent` the function is the freeze alone, as before.
  assert.deepEqual(life.eligibility({ isPageEdit: true, page: '/blog/sample-guide' }, frozen, TODAY), {
    eligible: true,
    from: null,
  });
});

test('C2: once this week\'s page edit is made, every other page edit says "Next page edit from" the next Monday', () => {
  const frozen = new Map([['/blog/edited-guide', { since: '2026-11-10', until: '2026-12-08' }]]);
  const e = life.eligibility({ isPageEdit: true, page: '/blog/free-guide' }, frozen, TODAY, { week: true });
  assert.equal(e.eligible, false);
  assert.equal(life.eligibilityText(e), 'Next page edit from 16 November');
  assert.deepEqual(e.weekEdit, { page: '/blog/edited-guide', date: '2026-11-10' });
  // The edited page itself says it is frozen; a card that edits no page is never held back.
  assert.equal(
    life.eligibilityText(
      life.eligibility({ isPageEdit: true, page: '/blog/edited-guide' }, frozen, TODAY, { week: true })
    ),
    'Eligible from 8 December'
  );
  assert.equal(life.eligibility({ isPageEdit: false }, frozen, TODAY, { week: true }).eligible, true);
});

// ---------------------------------------------------------------- the five

const opp = (id, extra) => ({ id, title: id, measured: 'm', action: 'a', test: 't', score: { total: 50 }, ...extra });

test('L1: the five never offer a page git shows edited lately, and C4: never the same task twice', () => {
  const recent = life.recentEdits({
    contentEdits: [{ page: '/blog/sample-guide', date: '2026-11-01', commit: 'f1', lines: 30 }],
    today: '2026-11-16',
  });
  const plan = {
    posts: [],
    improve: [{ page: '/blog/sample-guide', done: false, search: 's', todo: 'Improve it' }],
  };
  const ranked = [
    opp('edit-a', { type: 'slipping', page: '/blog/sample-guide', isPageEdit: true }),
    opp('edit-b', { type: 'near-page-one', page: '/blog/free-guide', isPageEdit: true }),
    opp('gap-1', { type: 'needs-links', page: '/pricing', action: 'Link to /pricing from two pages.' }),
    opp('same-1', { type: 'unserved', page: '/hub', action: 'Work the search into /hub.' }),
    opp('same-2', { type: 'unserved', page: '/hub', action: 'Work the search into /hub.' }),
    opp('other', { type: 'needs-links', page: '/blog/linked', action: 'Add two links.' }),
  ];
  const cards = week.proposeTop5({ plan, ranked, frozen: new Map(), recent, today: '2026-11-16', size: 5 });
  const edit = cards.find((c) => c.isPageEdit);
  assert.equal(edit.page, '/blog/free-guide', 'the plan row and the opportunity on the edited page are skipped');
  // Package 5: the tasks are one card for the best page that needs links (never a second one), and a
  // "write a post" idea (the unserved items) is never proposed.
  const others = cards.filter((c) => c.slot === 'other').map((c) => c.oppId);
  assert.deepEqual(others, ['gap-1']);
  const keys = cards.map((c) => `${c.page}|${c.action}`);
  assert.equal(new Set(keys).size, keys.length);
});

test('W2, L5, W6: the verdict slot counts page changes and commits, reads the next date from the pending edits, and has no chips', () => {
  const due = [
    { slug: 'a', date: '2026-10-02', commits: [{ hash: 'c1' }], overlapping: true },
    { slug: 'b', date: '2026-10-02', commits: [{ hash: 'c1' }], overlapping: true },
    { slug: 'c', date: '2026-10-09', commits: [{ hash: 'c2' }], overlapping: false },
  ];
  const [v] = week.proposeTop5({ plan: null, due, today: TODAY }).filter((c) => c.slot === 'verdict');
  assert.equal(v.title, 'Check whether 3 past page changes worked');
  assert.match(v.measured, /^3 page changes from 2 commits, made 2 October to 9 October, have finished/);
  assert.match(v.measured, /2 of them overlap another change/);
  assert.equal(v.eligibility, null);
  assert.equal(v.hypothesis, false);

  const pending = [
    { page: '/blog/a-guide', judgeFrom: '2026-11-15' },
    { page: '/blog/b-guide', judgeFrom: '2026-11-15' },
    { page: '/blog/c-guide', judgeFrom: '2026-11-18' },
  ];
  const frozen = new Map([['/blog/d-guide', { since: '2026-11-01', until: '2026-11-29' }]]);
  // Package 5: with nothing ready to judge there is no verdict card (the Next verdict tile has the date),
  // and a used page edit is a line (editStatus), not a card.
  const next = week.proposeTop5({ plan: null, pending, frozen, today: TODAY }).filter((c) => c.slot === 'verdict');
  assert.deepEqual(next, []);
  const used = new Map([['/blog/e-guide', { since: '2026-11-10', until: '2026-12-08' }]]);
  assert.deepEqual(week.proposeTop5({ plan: null, frozen: used, today: TODAY }), []);
  assert.match(week.editStatusOf(used, TODAY), /^This week's page edit is used \(\/blog\/e-guide, 10 November\)\./);
});

test('the week page folds the verdicts of one day into one waiting row', () => {
  const list = work.foldVerdictDays([
    { kind: 'verdict', date: '2026-11-15', title: 'Verdict on /blog/a-guide' },
    { kind: 'verdict', date: '2026-11-15', title: 'Verdict on /blog/b-guide' },
    { kind: 'frozen', date: '2026-11-16', title: '/blog/c-guide can be edited again' },
    { kind: 'verdict', date: '2026-11-18', title: 'Verdict on /blog/c-guide' },
  ]);
  assert.deepEqual(
    list.map((w) => [w.date, w.title]),
    [
      ['2026-11-15', 'Verdicts on 2 page changes'],
      ['2026-11-16', '/blog/c-guide can be edited again'],
      ['2026-11-18', 'Verdict on /blog/c-guide'],
    ]
  );
  assert.deepEqual(list[0].pages, ['/blog/a-guide', '/blog/b-guide']);
});

test('U2: one page waiting on two verdicts lists both dates', () => {
  const list = week.waiting({
    verdictsDue: [
      { page: '/blog/a-guide', judgeFrom: '2026-11-19' },
      { page: '/blog/a-guide', judgeFrom: '2026-11-25' },
    ],
    today: TODAY,
  });
  assert.deepEqual(
    list.map((w) => w.date),
    ['2026-11-19', '2026-11-25']
  );
});

// ---------------------------------------------------------------- worries

const verdictRow = (extra) => ({
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

test('C6, W1, W6: an overlapping verdict is no worry; a clean one is an observation with its cautions and its next verdict date', () => {
  const snaps = {
    local: {
      data: {
        verdicts: [
          verdictRow({ overlapping: true }),
          verdictRow({ slug: 'clean-guide', url: '/blog/clean-guide', overlapping: false }),
        ],
      },
    },
  };
  const list = week.worries({
    snaps,
    cautionsOf: () => ['A typical page on the site moved -2% over the same dates.'],
    today: TODAY,
  });
  assert.deepEqual(
    list.map((w) => w.page),
    ['/blog/clean-guide']
  );
  const w = list[0];
  assert.equal(w.title, 'After the 2 October change /blog/clean-guide reads worse');
  assert.ok(!/made things worse/.test(w.title));
  assert.match(w.measured, /A typical page on the site moved -2%/);
  assert.match(w.fix, /do not show the change caused it/);
  assert.match(week.worryCard(w, new Map(), TODAY).test, /verdict on this page can be read/);
});

test('C3: a worry on a frozen or recently edited page never says to edit or undo now, and gives a date', () => {
  const recent = life.recentEdits({
    contentEdits: [{ page: '/blog/clean-guide', date: '2026-11-09', commit: 'g1', lines: 40 }],
    today: TODAY,
  });
  const frozen = new Map([['/blog/slip-guide', { since: '2026-11-01', until: '2026-11-29' }]]);
  const list = week.worries({
    snaps: { local: { data: { verdicts: [verdictRow({ slug: 'clean-guide', url: '/blog/clean-guide' })] } } },
    opps: [opp('slip', { type: 'slipping', page: '/blog/slip-guide', isPageEdit: true })],
    frozen,
    recent,
    today: TODAY,
  });
  const slip = list.find((w) => w.kind === 'slipping-page');
  assert.equal(
    slip.fix,
    'This page was edited on 1 November, so it is too early to judge. Leave it alone and look again on 29 November.'
  );
  assert.equal(slip.waitUntil, '2026-11-29');
  const verdict = list.find((w) => w.kind === 'verdict-worse');
  assert.match(verdict.fix, /^This page was edited on 9 November \(found in git\), so it is too early to judge/);
  assert.ok(!/undo|refresh|compare/i.test(slip.fix + verdict.fix));
  assert.match(verdict.test, /next verdict on this page can be read on 9 December/);
  // A worry that says to leave the page alone is not offered for the five.
  const cards = week.proposeTop5({ plan: null, worries: list, frozen, recent, today: TODAY });
  assert.ok(!cards.some((c) => c.slot === 'worry'));
});

test('B12, W3, W4, W5: a Decay worry uses the kind of drop and its recommendation, names updates and the last edit as cautions', () => {
  const decay = new Map([
    [
      'slip',
      {
        dropKindLabel: 'Lost demand (a hypothesis)',
        dropKindWhy: 'Views fell 42% while the place held (5.1 to 5.3), so demand may have dropped.',
        recommendation:
          'Hypothesis: fewer people may be searching for this, so there may be nothing to fix. Leave it and check again later.',
        updates: [{ label: 'A sample core update', date: '2026-11-10' }],
        lastEdit: '2026-10-26',
      },
    ],
  ]);
  const [w] = week.worries({
    opps: [
      opp('slip', {
        type: 'slipping',
        page: '/blog/slip-guide',
        isPageEdit: true,
        action: 'Refresh the sections that have gone stale.',
      }),
    ],
    decay,
    today: TODAY,
  });
  assert.equal(
    w.fix,
    'Fewer people may be searching for this, so there may be nothing to fix. Leave it and check again later.'
  );
  assert.ok(!/stale/.test(w.fix));
  assert.match(w.measured, /Kind of drop: Lost demand \(a hypothesis\)\./);
  assert.match(w.measured, /last edited on 26 October, inside these dates/);
  assert.match(w.measured, /A sample core update \(from 10 November\) fell inside these dates/);
  assert.match(w.measured, /does not show the update caused it/);
});

test('a Decay worry carries the Decay card test, not the generic one', () => {
  const decayTest = 'Compare how often the search itself was made in both periods.';
  const [fromDecay] = week.worries({
    opps: [opp('slip', { type: 'slipping', page: '/blog/slip-guide', isPageEdit: true, test: 'The card test.' })],
    decay: new Map([['slip', { recommendation: 'Hypothesis: leave it.', test: decayTest, updates: [] }]]),
    today: TODAY,
  });
  assert.equal(week.worryCard(fromDecay, new Map(), TODAY).test, decayTest);
  // With no Decay detail the opportunity card's own test is used.
  const [fromCard] = week.worries({
    opps: [opp('slip', { type: 'slipping', page: '/blog/slip-guide', isPageEdit: true, test: 'The card test.' })],
    today: TODAY,
  });
  assert.equal(week.worryCard(fromCard, new Map(), TODAY).test, 'The card test.');
});

test('B L2: a Decay worry marked done is cleared, and the next one moves up into the three', () => {
  const opps = ['s1', 's2', 's3', 's4'].map((id) =>
    opp(id, { type: 'slipping', page: `/blog/${id}`, isPageEdit: true })
  );
  const items = { s1: { status: 'done' }, s2: { status: 'ignored' } };
  const list = week.worries({ opps, items, today: TODAY });
  assert.deepEqual(
    list.map((w) => w.oppId),
    ['s3', 's4']
  );
});

// ---------------------------------------------------------------- L4 and L2

test('L4: a plan row ticked with no date takes the latest git edit of the page on or before the day the tick was seen', () => {
  const plan = {
    file: 'plan.md',
    improve: [{ page: '/blog/ticked-guide', done: true, doneDate: null, judgeFrom: null }],
  };
  const edits = [
    { page: '/blog/ticked-guide', date: '2026-11-01', kind: 'edit' },
    { page: '/blog/ticked-guide', date: '2026-11-03', kind: 'edit' },
    { page: '/blog/ticked-guide', date: '2026-11-12', kind: 'edit' },
    { page: '/blog/ticked-guide', date: '2026-11-04', kind: 'manual', subject: 'IndexNow sent' },
  ];
  const [d] = life.deliberateEdits({ plan, edits, planTicks: { 'plan.md|/blog/ticked-guide': '2026-11-05' } });
  assert.equal(d.date, '2026-11-03');
  assert.match(d.why, /latest git edit/);
  const [none] = life.deliberateEdits({ plan, edits: [], planTicks: { 'plan.md|/blog/ticked-guide': '2026-11-05' } });
  assert.equal(none.date, '2026-11-05', 'with no git edit, the day the tick was seen');
});

test('L2: an edit note on an article freezes that article, never an invented /blog/ page', () => {
  const live = new Set(['/articles/live-brief', '/blog/live-post']);
  assert.equal(local.pageOfNote('live-brief', { live }), '/articles/live-brief');
  assert.equal(local.pageOfNote('live-post', { live }), '/blog/live-post');
  assert.equal(local.pageOfNote('sample-brief', { live: new Set(), repoRoot: REPO }), '/articles/sample-brief');
  assert.equal(local.pageOfNote('nowhere', { live }), null);
  assert.deepEqual(
    local.notesToEdits([{ date: '2026-11-12', slug: 'live-brief', text: 'Edit: new section' }], { live }),
    [{ page: '/articles/live-brief', date: '2026-11-12', kind: 'manual', subject: 'Edit: new section' }]
  );
  const frozen = life.frozenPages({
    edits: local.notesToEdits([{ date: '2026-11-12', slug: 'live-brief', text: 'Edit: new section' }], { live }),
    today: TODAY,
  });
  assert.deepEqual([...frozen.keys()], ['/articles/live-brief']);
});

// ---------------------------------------------------------------- C7 and L3

test('C7: verdict rows that share a commit are one change', () => {
  const ids = work.changeIdsOf([
    { slug: 'a', commits: [{ hash: 'c1' }, { hash: 'c2' }] },
    { slug: 'b', commits: [{ hash: 'c3' }] },
    { slug: 'c', commits: [{ hash: 'c3' }] },
    { slug: 'batch:c3', commits: [{ hash: 'c3' }] },
    { slug: 'd', commits: [] },
  ]);
  assert.equal(ids[1], ids[2]);
  assert.equal(ids[2], ids[3]);
  assert.notEqual(ids[0], ids[1]);
  assert.equal(new Set(ids).size, 3);
});

test('L3: a lesson is proven only by three distinct changes that no other change overlaps', () => {
  const r = (verdict, change, overlapping = false) => ({ verdict, change, overlapping });
  // Three worse rows, two from one commit and one overlapping: one change counts.
  assert.equal(lessons.statusFromReadings([r('worse', 'c1'), r('worse', 'c1'), r('worse', 'c2', true)]), 'trial');
  assert.equal(lessons.statusFromReadings([r('worse', 'c1'), r('worse', 'c2'), r('worse', 'c3')]), 'proven');
  assert.equal(lessons.provenDirectionOf([r('worse', 'c1'), r('worse', 'c2'), r('worse', 'c3')]), 'hurts');
  // Plain words still count one change each.
  assert.equal(lessons.statusFromReadings(['better', 'better', 'better']), 'proven');
  assert.match(
    lessons.statusNote({ manual: false }, [r('worse', 'c1'), r('worse', 'c2', true)]),
    /overlaps another change, so it does not count/
  );
});

// ---------------------------------------------------------------- the model and the pages

function weekFixture() {
  writeJson('state/items.json', {});
  writeJson('state/weeks.json', {});
  // The 28 days before 2 October: one week holds most of the sample page's views.
  const { before } = windowsFor('2026-10-02');
  const pageDaily = [];
  for (let d = before.start; d <= before.end; d = addDays(d, 1))
    pageDaily.push({
      page: '/blog/p3',
      date: d,
      impressions: d <= addDays(before.start, 6) ? 20 : 1,
      clicks: 0,
      position: 9,
    });
  snap('gsc', { pageDaily, siteDaily: [] });
  snap('local', {
    livePages: [{ page: '/blog/sample-guide' }, { page: '/blog/free-guide' }, { page: '/pricing' }],
    plan: {
      file: 'plan.md',
      posts: [],
      improve: [
        { page: '/pricing', done: true, doneDate: '2026-11-10', judgeFrom: '2026-12-10', search: 's', todo: 't' },
      ],
    },
    verdicts: [
      verdictRow({ slug: 'p1', url: '/blog/p1', commits: [{ hash: 'c1' }], verdict: 'worse', overlapping: false }),
      verdictRow({ slug: 'p2', url: '/blog/p2', commits: [{ hash: 'c1' }], verdict: 'worse', overlapping: false }),
      verdictRow({
        slug: 'batch:c1',
        url: null,
        kind: 'batch',
        pages: ['p1', 'p2'],
        commits: [{ hash: 'c1' }],
        verdict: 'better',
        overlapping: true,
      }),
      verdictRow({ slug: 'p3', url: '/blog/p3', commits: [{ hash: 'c2' }], verdict: 'better', overlapping: false }),
    ],
    due: [
      {
        slug: 'sample-guide',
        url: '/blog/sample-guide',
        date: '2026-10-10',
        commits: [{ hash: 'c9' }],
        overlapping: true,
      },
    ],
    contentEdits: [{ page: '/blog/sample-guide', date: '2026-11-09', commit: 'aaaa111', lines: 299 }],
    edits: [],
    googleUpdates: [{ id: 'u1', title: 'A sample core update', start: '2026-11-12', end: null, kind: 'ranking' }],
  });
  invalidate();
  return buildModel();
}

test('C2, C3, C5: the week page agrees with the server on the freeze, the git edit, the week rule and the next verdict', () => {
  const model = weekFixture();
  // The plan row dated 10 November is this week's page edit.
  assert.equal(
    eligibilityOf(model, { isPageEdit: true, page: '/blog/free-guide' }).text,
    'Next page edit from 16 November'
  );
  const held = eligibilityOf(model, { isPageEdit: true, page: '/blog/sample-guide' });
  assert.equal(held.eligible, false);
  assert.match(held.text, /^Edited 9 November \(found in git, 299 lines\)\. Leave it until 7 December/);

  const v = work.weekView(model);
  assert.deepEqual(v.nextVerdict, {
    ready: true,
    date: TODAY,
    dateText: 'Ready now',
    note: '1 page change from 1 commit ready to judge',
  });
  const alone = v.leaveAlone.find((x) => x.page === '/blog/sample-guide');
  assert.ok(alone?.foundInGit);
  assert.equal(alone.until, '2026-12-07');
  assert.deepEqual(v.counts.worries, { total: v.worries.length, needLook: v.worries.length, waiting: 0 });
  // Package 5: the used week edit is one line, not a card.
  assert.equal(
    v.top5.some((c) => /^page-edit-done-/.test(c.id)),
    false
  );
  assert.match(v.editStatus, /^This week's page edit is used \(/);
});

test('C7, C6, L6, M1: Did it work counts distinct changes, reads an overlapped batch from its clean pages, and cautions money pages', () => {
  const model = weekFixture();
  const r = work.resultsView(model);
  assert.equal(r.verdictCounts.changes, 2, 'the batch commit and its pages are one change');
  assert.equal(r.verdictCounts.byWord.unreadable, 0, 'the overlapped batch is read from its two clean pages');
  assert.equal(r.verdictCounts.byWord.better, 1);
  assert.equal(r.verdictCounts.text, '1 better, 1 worse');
  const batch = r.verdicts.find((x) => x.batch);
  assert.equal(batch.readNote, 'Other edits landed in the same window, so this cannot be read.');
  assert.match(batch.summary, /^Other edits landed in the same window, so this cannot be read\./);
  const money = r.moneyPageVerdicts.find((m) => m.page === '/pricing');
  assert.ok(money, 'the money page edit has a verdict row');
  assert.deepEqual(money.nearUpdates, [{ label: 'A sample core update', date: '2026-11-12' }]);
});

test('W1: the cautions on a worse verdict name the control and a one week spike in the before window', () => {
  const model = weekFixture();
  const spike = work.beforeSpike(model, ['/blog/p3'], '2026-10-02');
  assert.equal(spike.shown, 140);
  assert.equal(spike.total, 161);
  const lines = work.verdictCautions(model, verdictRow({ slug: 'p3', url: '/blog/p3' }));
  assert.match(lines[0], /A typical page on the site moved -2% over the same dates\./);
  assert.match(
    lines.at(-1),
    /held 140 of the 161 times shown in the 28 days before, so the before number may be a one week spike/
  );
  assert.equal(work.beforeSpike(model, ['/blog/elsewhere'], '2026-10-02'), null);
});

test('the Ask digest carries the next verdict, the worry counts, the change counts, the split lists and the keyword statuses', () => {
  const model = weekFixture();
  const brief = buildDeskBrief(model, 'What should I work on this week?');
  assert.match(brief.text, /"nextVerdict":\{"ready":true/);
  assert.match(brief.text, /"worries":\{"total":/);
  assert.match(brief.text, /"judgedChanges":2/);
  assert.match(brief.text, /Keyword map counts/);
  assert.match(brief.text, /ranks = no page targets this search/);
  assert.match(brief.text, /"together":/);
  assert.match(brief.text, /"togetherNote":/);
});

test('C3: Done on a recently edited page asks the same second confirm a frozen page gets', async () => {
  const asked = [];
  const sent = [];
  const err = Object.assign(new Error('held'), {
    status: 409,
    data: { recentlyEdited: [{ page: '/blog/sample-guide', text: '/blog/sample-guide: Edited 9 November.' }] },
  });
  assert.deepEqual(editRefusal(err).recent.length, 1);
  const api = {
    post: async (p, body) => {
      sent.push(body);
      if (!body.override) throw err;
      return { ok: true };
    },
  };
  const res = await postAction({ api, confirmBox: async (b) => (asked.push(b), true) }, '/api/item/x', {
    action: 'done',
  });
  assert.deepEqual(res, { ok: true });
  assert.equal(asked[0].title, recentBox(err.data.recentlyEdited).title);
  assert.equal(sent[1].override, true);
});

test('the Worries tile says what its number means and how many pages are only watched', async () => {
  const { worryTileNote } = await import('../static/views/week.js');
  const fmt = { num: (n) => String(n) };
  assert.equal(worryTileNote(0, 0, fmt), 'nothing needs you this week');
  assert.equal(worryTileNote(1, 0, fmt), 'needs a look this week');
  assert.equal(worryTileNote(2, 1, fmt), 'need a look this week; 1 more is only being watched');
  assert.equal(worryTileNote(0, 3, fmt), 'nothing needs you this week; 3 more are only being watched');
});
