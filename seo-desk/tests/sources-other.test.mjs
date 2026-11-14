import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const fx = (name) => JSON.parse(fs.readFileSync(path.join(HERE, 'fixtures', name), 'utf8'));

process.env.SEO_DESK_DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-other-'));

const { parsePlan, findPlanFile } = await import('../lib/sources/plan-parser.mjs');
const { normGa4, isoDate, toLanding, toEvents, toOutcomes, toBreakdown, isInterestEvent, pullGa4 } = await import(
  '../lib/sources/ga4.mjs'
);
const { buildDay, pullClarity, QUESTIONS } = await import('../lib/sources/clarity.mjs');
const {
  parseOpenWork,
  parseSitemap,
  parseSitemapIndex,
  parseGitEdits,
  parseSitemapDiff,
  parseWatchLog,
  countInbound,
  fetchLivePages,
  pullLocal,
} = await import('../lib/sources/local.mjs');
const { readJson } = await import('../lib/store.mjs');
const { McpError } = await import('../lib/mcp-client.mjs');

// ---------------------------------------------------------------- plan parser

const PLAN = `# Next 15 blogs: November 2026 plan

## The 15

| #   | Done | Working title | Primary keyword | Why this one (demand) | Watch out for |
| --- | ---- | ------------- | --------------- | --------------------- | ------------- |
| 1   | [ ]  | Safe Harbor Example: What a DON Does | safe harbor example | 1,000 searches/mo | Rule text |
| 2   | [x]  | Low Census Example: Who Goes Home | low census example | 1,600/mo | Service framing only |

## Improve these live pages instead of writing new ones

| Done | Live page | Search to win | What to do |
| ---- | --------- | ------------- | ---------- |
| [x]  | \`/blog/example-ranking\` | 210 impressions at 9.1 | Already live: the title shipped 2026-11-01 (1a2b3c4d). Judge from 2026-12-01; no edits before then |
| [ ]  | \`/blog/example-hours\` | cluster of 640/mo | Add a section; a new page would split the post |
| [ ]  | \`/example-hub\` | "example staffing rules" | Done 2026-11-09 (04d9bbad): section added |
| [ ]  | \`/blog/example-judged\` | some search | Done 2026-11-02 (aaaaaaaa): retitled. Judge from 2026-12-05 |
| [ ]  | \`/blog/example-rooted/\` | a search | Already live: no change needed |
`;

test('parsePlan reads The 15 rows with done from the box', () => {
  const plan = parsePlan(PLAN, 'docs/seo/next-15-blogs-2026-11.md');
  assert.equal(plan.error, null);
  assert.equal(plan.file, 'docs/seo/next-15-blogs-2026-11.md');
  assert.equal(plan.posts.length, 2);
  assert.deepEqual(plan.posts[0], {
    n: 1,
    done: false,
    title: 'Safe Harbor Example: What a DON Does',
    keyword: 'safe harbor example',
  });
  assert.equal(plan.posts[1].done, true);
});

test('parsePlan improve rows: ticked row with Judge from, Done date without one, Already live', () => {
  const { improve } = parsePlan(PLAN, 'f');
  assert.equal(improve.length, 5);
  const by = Object.fromEntries(improve.map((r) => [r.page, r]));
  assert.equal(by['/blog/example-ranking'].done, true);
  assert.equal(by['/blog/example-ranking'].judgeFrom, '2026-12-01');
  assert.equal(by['/blog/example-hours'].done, false);
  assert.equal(by['/blog/example-hours'].judgeFrom, null);
  assert.equal(by['/blog/example-hours'].doneDate, null);
  assert.equal(by['/example-hub'].done, true);
  assert.equal(by['/example-hub'].doneDate, '2026-11-09');
  assert.equal(by['/example-hub'].judgeFrom, '2026-12-09');
  assert.equal(by['/blog/example-judged'].judgeFrom, '2026-12-05'); // explicit date wins
  assert.equal(by['/blog/example-judged'].doneDate, '2026-11-02');
  assert.equal(by['/blog/example-rooted'].done, true); // Already live, trailing slash dropped
  assert.equal(by['/blog/example-rooted'].judgeFrom, null);
  assert.equal(by['/blog/example-hours'].search, 'cluster of 640/mo');
});

test('parsePlan on markdown with no tables returns an error, not a throw', () => {
  for (const input of ['# Just text\n\nNothing here.', '', null, undefined, 42]) {
    const plan = parsePlan(input, 'x.md');
    assert.match(plan.error, /No plan tables/);
    assert.deepEqual(plan.posts, []);
    assert.deepEqual(plan.improve, []);
  }
});

test('findPlanFile picks the latest month and returns null when there is none', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-plan-'));
  assert.equal(findPlanFile(root), null);
  const dir = path.join(root, 'docs', 'seo');
  fs.mkdirSync(dir, { recursive: true });
  assert.equal(findPlanFile(root), null);
  for (const n of ['next-15-blogs-2026-11.md', 'next-15-blogs-2026-12.md', 'next-15-blogs-2026-10.md', 'next-steps.md'])
    fs.writeFileSync(path.join(dir, n), '');
  assert.equal(findPlanFile(root), path.join(dir, 'next-15-blogs-2026-12.md'));
});

// ---------------------------------------------------------------- GA4

test('normGa4 flattens a report and tolerates junk', () => {
  const rows = normGa4(fx('ga4-reports.json').channels);
  assert.equal(rows.length, 3);
  assert.deepEqual(rows[0], { dims: ['20261102', 'Organic Search'], metrics: [23] });
  assert.deepEqual(normGa4(fx('ga4-reports.json').empty), []);
  assert.deepEqual(normGa4(null), []);
  assert.deepEqual(normGa4({}), []);
  assert.equal(isoDate('20261102'), '2026-11-02');
});

test('toLanding joins windows by page, folds slashes and drops (not set)', () => {
  const f = fx('ga4-reports.json');
  const landing = toLanding(f.landingCur, f.landingPrev);
  const post = landing.find((r) => r.page === '/blog/example-post');
  assert.deepEqual(post, { page: '/blog/example-post', sessions: 50, prevSessions: 40, engagedSessions: 8 });
  assert.equal(landing.find((r) => r.page === '/').sessions, 30);
  assert.equal(landing.find((r) => r.page === '/blog/old-page').sessions, 0);
  assert.equal(landing.find((r) => r.page === '/blog/old-page').prevSessions, 11);
  assert.ok(!landing.some((r) => r.page === '(not set)'));
});

test('toEvents keeps only the events the desk cares about', () => {
  const f = fx('ga4-reports.json');
  const events = toEvents(f.eventsCur, f.eventsPrev);
  assert.deepEqual(events.map((e) => e.name).sort(), ['roi_calculator_used', 'template_download']);
  assert.ok(!events.some((e) => e.name === 'form_start'), 'starting a form is not a completed action');
  assert.deepEqual(
    events.find((e) => e.name === 'template_download'),
    { name: 'template_download', count: 4, prevCount: 0 }
  );
  assert.equal(events.find((e) => e.name === 'roi_calculator_used').count, 0);
});

test('isInterestEvent keeps completed actions and drops starts and other events', () => {
  for (const name of ['template_download', 'roi_calculator_used', 'generate_lead', 'contact_submit', 'form_submit'])
    assert.equal(isInterestEvent(name), true, name);
  for (const name of ['form_start', 'calculator_start', 'FORM_START', 'scroll', 'page_view', '', null])
    assert.equal(isInterestEvent(name), false, String(name));
});

test('toOutcomes counts interest events per landing page, folds query strings and ignores other events', () => {
  const f = fx('ga4-reports.json');
  const out = toOutcomes(f.outcomeEvents, f.landingCur);
  assert.deepEqual(
    out.find((r) => r.page === '/blog/example-post'),
    { page: '/blog/example-post', events: 2, sessions: 50 }
  );
  assert.deepEqual(
    out.find((r) => r.page === '/'),
    { page: '/', events: 1, sessions: 30 },
    'scroll is not an interest event'
  );
  assert.ok(!out.some((r) => r.page === '(not set)'));
  assert.equal(out[0].page, '/blog/example-post', 'most events first');
  // form_start on the example post (3) is not counted; its template download (2) is.
  assert.deepEqual(toOutcomes(null, null), []);
  // A page with events but no visits in the landing report still appears, with 0 sessions.
  const alone = toOutcomes(f.outcomeEvents, f.empty);
  assert.equal(alone.find((r) => r.page === '/').sessions, 0);
});

test('toBreakdown joins both windows by name, biggest first', () => {
  const f = fx('ga4-reports.json');
  assert.deepEqual(toBreakdown(f.sourceCur, f.sourcePrev), [
    { name: 'google / organic', sessions: 60, prevSessions: 50 },
    { name: '(direct) / (none)', sessions: 20, prevSessions: 0 },
    { name: 'linkedin.com / referral', sessions: 4, prevSessions: 0 },
    { name: 'bing / organic', sessions: 0, prevSessions: 7 },
  ]);
  assert.deepEqual(toBreakdown(null, null), []);
});

test('pullGa4 sends run_report for the fixed property and builds the snapshot', async () => {
  const f = fx('ga4-reports.json');
  const calls = [];
  const queue = [
    f.channels,
    f.landingCur,
    f.landingPrev,
    f.eventsCur,
    f.eventsPrev,
    f.ai,
    f.outcomeEvents,
    f.sourceCur,
    f.sourcePrev,
    f.countryCur,
    f.countryPrev,
    f.deviceCur,
    f.devicePrev,
  ];
  const session = {
    call: async (tool, args) => {
      calls.push({ tool, args });
      return queue.shift();
    },
    close: () => assert.fail('must not close a session it was handed'),
  };
  const snap = await pullGa4({ today: '2026-11-10', session });
  assert.equal(snap.source, 'ga4');
  assert.equal(snap.ok, true);
  assert.equal(snap.through, '2026-11-07');
  assert.ok(calls.every((c) => c.tool === 'run_report' && c.args.property_id === '528589584'));
  assert.deepEqual(calls[0].args.dimensions, ['date', 'sessionDefaultChannelGroup']);
  assert.deepEqual(calls[0].args.date_ranges, [{ start_date: '2026-08-10', end_date: '2026-11-07' }]);
  assert.deepEqual(calls[1].args.date_ranges, [{ start_date: '2026-10-11', end_date: '2026-11-07' }]);
  assert.deepEqual(calls[2].args.date_ranges, [{ start_date: '2026-09-13', end_date: '2026-10-10' }]);
  assert.equal(calls[5].args.dimension_filter.filter.string_filter.value, 'AI Assistant');
  assert.deepEqual(snap.data.channelsDaily[0], { date: '2026-11-02', channel: 'Organic Search', sessions: 23 });
  assert.deepEqual(snap.data.ai[1], { date: '2026-11-05', source: 'perplexity.ai', sessions: 1 });
  assert.equal(snap.data.landing.find((r) => r.page === '/').engagedSessions, 12);
  // The interest events per landing page, then sessions by source, country and device.
  assert.equal(calls.length, 13);
  assert.deepEqual(calls[6].args.dimensions, ['landingPage', 'eventName']);
  assert.deepEqual(calls[6].args.date_ranges, [{ start_date: '2026-10-11', end_date: '2026-11-07' }]);
  assert.equal(calls[6].args.dimension_filter.filter.field_name, 'eventName');
  assert.equal(calls[6].args.dimension_filter.filter.string_filter.match_type, 'PARTIAL_REGEXP');
  assert.deepEqual(calls[7].args.dimensions, ['sessionSourceMedium']);
  assert.deepEqual(calls[8].args.date_ranges, [{ start_date: '2026-09-13', end_date: '2026-10-10' }]);
  assert.deepEqual(calls[9].args.dimensions, ['country']);
  assert.deepEqual(calls[11].args.dimensions, ['deviceCategory']);
  assert.deepEqual(snap.data.outcomes[0], { page: '/blog/example-post', events: 2, sessions: 50 });
  assert.deepEqual(snap.data.sourceMedium[0], { name: 'google / organic', sessions: 60, prevSessions: 50 });
  assert.equal(snap.data.countries[0].name, 'United States');
  assert.deepEqual(snap.data.devices[1], { name: 'mobile', sessions: 29, prevSessions: 22 });
});

test('pullGa4 rejects a response without a rows array', async () => {
  const session = { call: async () => ({ error: 'nope' }) };
  await assert.rejects(() => pullGa4({ today: '2026-11-10', session }), McpError);
});

// ---------------------------------------------------------------- Clarity

test('buildDay normalises the six answers and keeps empty answers as empty lists', () => {
  const day = buildDay(fx('clarity-answers.json'));
  assert.equal(day.sessions, 37);
  assert.deepEqual(day.rage, [
    { page: '/pricing', count: 9 },
    { page: '/blog/a', count: 3 },
  ]);
  assert.deepEqual(day.dead, []);
  assert.deepEqual(day.quickBack, []);
  assert.deepEqual(day.scroll, [
    { page: '/contact', depth: 48.25 },
    { page: '/', depth: 7.9 },
  ]);
  assert.deepEqual(day.jsErrors[0], { message: 'Invented error: y is undefined', count: 5 });
});

test('buildDay leaves a missing or errored answer null', () => {
  const a = fx('clarity-answers.json');
  const day = buildDay({
    ...a,
    rage: null,
    scroll: { query: 'q', data: [], dataErrorType: 2 },
    jsErrors: 'rate limited',
  });
  assert.equal(day.rage, null);
  assert.equal(day.scroll, null);
  assert.equal(day.jsErrors, null);
  assert.equal(day.sessions, 37);
});

test('pullClarity asks six questions once, survives a failed one, stores history and then skips', async () => {
  const a = fx('clarity-answers.json');
  const asked = [];
  const session = {
    call: async (tool, args) => {
      asked.push(args.query);
      assert.equal(tool, 'query-analytics-dashboard');
      const key = QUESTIONS.find(([, q]) => q === args.query)[0];
      if (key === 'dead') throw new McpError('Too many requests');
      return a[key];
    },
    close: () => assert.fail('must not close a session it was handed'),
  };
  const snap = await pullClarity({ today: '2026-10-06', session });
  assert.equal(asked.length, 6);
  assert.ok(asked.every((q) => /last 1 day/.test(q)));
  assert.equal(snap.ok, true);
  assert.equal(snap.through, '2026-10-05');
  assert.equal(snap.data.days['2026-10-05'].sessions, 37);
  assert.equal(snap.data.days['2026-10-05'].dead, null);
  assert.deepEqual(readJson('history/clarity.json').days['2026-10-05'].rage[0], { page: '/pricing', count: 9 });

  const again = await pullClarity({ today: '2026-10-06', session });
  assert.equal(asked.length, 6, 'second pull must not ask anything');
  assert.equal(again.data.days['2026-10-05'].sessions, 37);
});

test('pullClarity does not store a day where every question failed, and asks again next time', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-clarity-empty-'));
  const prev = process.env.SEO_DESK_DATA;
  process.env.SEO_DESK_DATA = dir;
  try {
    let n = 0;
    const failing = {
      call: async () => {
        n++;
        throw new McpError('Too many requests');
      },
    };
    const snap = await pullClarity({ today: '2026-10-06', session: failing });
    assert.equal(n, 6);
    assert.equal(snap.ok, false);
    assert.equal(snap.status, 'failed');
    assert.equal(readJson('history/clarity.json', { days: {} }).days['2026-10-05'], undefined);

    n = 0;
    await pullClarity({ today: '2026-10-06', session: failing });
    assert.equal(n, 6, 'an all-null day must be asked again');

    const a = fx('clarity-answers.json');
    const working = { call: async (tool, args) => a[QUESTIONS.find(([, q]) => q === args.query)[0]] };
    const good = await pullClarity({ today: '2026-10-06', session: working });
    assert.equal(good.ok, true);
    assert.equal(good.data.days['2026-10-05'].sessions, 37);
  } finally {
    process.env.SEO_DESK_DATA = prev;
  }
});

test('pullClarity stops on a sign-in error', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-clarity-'));
  const prev = process.env.SEO_DESK_DATA;
  process.env.SEO_DESK_DATA = dir;
  try {
    let n = 0;
    const session = {
      call: async () => {
        n++;
        throw new McpError('401 Unauthorized');
      },
    };
    await assert.rejects(() => pullClarity({ today: '2026-10-06', session }), /Unauthorized/);
    assert.equal(n, 1);
  } finally {
    process.env.SEO_DESK_DATA = prev;
  }
});

// ---------------------------------------------------------------- local parsers

test('countInbound counts distinct linking files across the three link forms and skips self links', () => {
  const files = [
    { path: 'src/data/post/a.md', text: 'See [x](/blog/x) and [x again](/blog/x/) and [self](/blog/a).' },
    { path: 'src/data/post/b.md', text: '<a href="/blog/x">x</a> and <a href=\'/blog/y#top\'>y</a>' },
    {
      path: 'src/data/article/c.md',
      text: 'Read https://simplescheduleai.com/blog/x or https://www.simplescheduleai.com/blog/y?utm=1.',
    },
    { path: 'src/pages/index.astro', text: '[home](/) and [x](/blog/x "title")' },
    { path: 'src/data/post/x.md', text: '[me](/blog/x) [y](/blog/y) [home](/)' },
    {
      path: 'src/data/post/d.md',
      text: 'Ends a sentence with https://simplescheduleai.com/blog/z. And a list: https://simplescheduleai.com/blog/z, https://simplescheduleai.com/.',
    },
    {
      path: 'src/components/Nav.astro',
      text: '<a href="/pricing">Pricing</a> <a href="https://elsewhere.test/blog/x">ext</a>',
    },
  ];
  const inbound = countInbound(files, ['/blog/x', '/blog/y', '/blog/z', '/', '/pricing', '/blog/none']);
  assert.deepEqual(inbound['/blog/x'], ['/', '/articles/c', '/blog/a', '/blog/b']);
  assert.deepEqual(inbound['/blog/y'], ['/articles/c', '/blog/b', '/blog/x']);
  assert.deepEqual(inbound['/'], ['/blog/d', '/blog/x']);
  assert.deepEqual(inbound['/pricing'], ['src/components/Nav.astro']);
  assert.deepEqual(inbound['/blog/z'], ['/blog/d']);
  assert.deepEqual(inbound['/blog/none'], []);
});

test('countInbound accepts page paths as file paths', () => {
  const inbound = countInbound([{ path: '/blog/y', text: '[x](/blog/x)' }], [{ page: '/blog/x' }]);
  assert.deepEqual(inbound, { '/blog/x': ['/blog/y'] });
});

test('parseSitemap reads loc and lastmod; the index lists children', () => {
  const xml = `<?xml version="1.0"?><urlset>
    <url><loc>https://example.test/</loc></url>
    <url><loc>https://example.test/blog/x/</loc><lastmod>2026-11-02</lastmod></url>
    <url><loc>not a url</loc></url></urlset>`;
  assert.deepEqual(parseSitemap(xml), [
    { page: '/', lastmod: null },
    { page: '/blog/x', lastmod: '2026-11-02' },
  ]);
  assert.deepEqual(parseSitemap(''), []);
  assert.deepEqual(
    parseSitemapIndex('<sitemapindex><sitemap><loc>https://example.test/sitemap-0.xml</loc></sitemap></sitemapindex>'),
    ['https://example.test/sitemap-0.xml']
  );
});

test('fetchLivePages follows the index and fails loudly so the caller can keep the old list', async () => {
  const bodies = {
    'https://simplescheduleai.com/sitemap-index.xml':
      '<sitemapindex><sitemap><loc>https://simplescheduleai.com/sitemap-0.xml</loc></sitemap></sitemapindex>',
    'https://simplescheduleai.com/sitemap-0.xml':
      '<urlset><url><loc>https://simplescheduleai.com/b</loc></url><url><loc>https://simplescheduleai.com/a</loc></url></urlset>',
  };
  const ok = async (u) => ({ ok: true, text: async () => bodies[u] });
  assert.deepEqual(
    (await fetchLivePages(ok)).map((r) => r.page),
    ['/a', '/b']
  );
  await assert.rejects(() => fetchLivePages(async () => ({ ok: false, status: 503 })), /503/);
});

test('parseOpenWork flags founder-blocked rows and reads tables, bullets and numbered items', () => {
  const md = `# Open work

## 1. Blocked on the founder

| Item | Why it matters |
| --- | --- |
| **Run the interview chain** | Highest leverage item. |

## 2. Positioning

Still open:

1. **P11 stays held** until the interviews settle N9.
2. **P6's provenance** is graded OBSERVED
   where the dossier requires REPORTED.

## 4b. Open after a session

**Blocked on the founder:**

| Item | Why it matters |
| --- | --- |
| **Manual Request Indexing** for one page | Two minutes. |

**Other things:**

- A plain bullet with \`code\`.
`;
  const rows = parseOpenWork(md);
  assert.deepEqual(rows[0], {
    section: 'Blocked on the founder',
    text: 'Run the interview chain: Highest leverage item.',
    blockedOnFounder: true,
  });
  assert.equal(rows[1].section, 'Positioning');
  assert.equal(rows[1].blockedOnFounder, false);
  assert.match(rows[2].text, /P6's provenance is graded OBSERVED where the dossier requires REPORTED\./);
  const manual = rows.find((r) => r.text.startsWith('Manual Request Indexing'));
  assert.equal(manual.blockedOnFounder, true);
  assert.equal(manual.section, 'Open after a session');
  const bullet = rows.find((r) => r.text.startsWith('A plain bullet'));
  assert.equal(bullet.blockedOnFounder, false);
  assert.equal(bullet.text, 'A plain bullet with code.');
  assert.equal(rows.length, 5);
});

test('parseSitemapDiff and parseWatchLog read only the latest dated block and tolerate drift', () => {
  const diff = `# log

## 2026-10-01

- old.test: +1 / -0 since 2026-09-01
  - NEW: https://old.test/x

## 2026-11-01

- a.test: +2 / -1 since 2026-10-01
  - NEW: https://a.test/one
  - NEW: https://a.test/two
- b.test: unreachable (HTTP 403)
- c.test: baseline stored (12 URLs)
`;
  const sm = parseSitemapDiff(diff);
  assert.equal(sm.length, 3);
  assert.deepEqual(sm[0], {
    host: 'a.test',
    fetchedAt: '2026-11-01',
    added: ['https://a.test/one', 'https://a.test/two'],
    removed: [],
    status: 'diff',
    addedCount: 2,
    removedCount: 1,
  });
  assert.equal(sm[1].status, 'unreachable');
  assert.equal(sm[2].status, 'baseline');

  const watch = `# watch

## 2026-10-01

- old__home: 1 change(s) since 2026-09-01
  - old change

## 2026-11-01

- a.test__home: 2 change(s) since 2026-10-01
  - h2s added: "New"
  - h1: "A" -> "B"
- b.test__home: unreachable (HTTP 404)
- c.test__home: baseline stored: h1 "Hello"
some stray text
`;
  const w = parseWatchLog(watch, (key) => (key === 'a.test__home' ? 'https://a.test/' : null));
  assert.equal(w.length, 3);
  assert.deepEqual(w[0], {
    url: 'https://a.test/',
    key: 'a.test__home',
    fetchedAt: '2026-11-01',
    changes: ['h2s added: "New"', 'h1: "A" -> "B"'],
    hasSnapshot: true,
    previouslyUnreachable: false,
  });
  assert.equal(w[1].hasSnapshot, false, 'a page with no saved snapshot has never answered');
  assert.deepEqual(w[1].changes, ['unreachable (HTTP 404)']);
  assert.equal(w[1].url, 'b.test__home');
  assert.deepEqual(w[2].changes, ['baseline stored: h1 "Hello"', 'some stray text']);
  assert.deepEqual(parseSitemapDiff('no blocks'), []);
});

test('parseGitEdits maps content paths to pages and kinds', () => {
  const log = [
    '@@aaaa|2026-11-09|fix: retitle | with a pipe',
    'M\tsrc/data/post/example-post.md',
    'M\tsrc/pages/pricing.astro',
    'M\tsrc/pages/index.astro',
    'M\tsrc/pages/blog/[...page].astro',
    'D\tsrc/data/post/gone.md',
    '',
    '@@bbbb|2026-11-05|feat: new post',
    'A\tsrc/data/post/new-post.md',
    'R100\tsrc/data/article/old.md\tsrc/data/article/new.md',
    'M\tsrc/data/post/example-post.md',
    '',
  ].join('\n');
  const edits = parseGitEdits(log);
  assert.deepEqual(
    edits.map((e) => `${e.date} ${e.kind} ${e.page}`),
    [
      '2026-11-09 edit /blog/example-post',
      '2026-11-09 edit /pricing',
      '2026-11-09 edit /',
      '2026-11-05 publish /blog/new-post',
      '2026-11-05 edit /articles/new',
      '2026-11-05 edit /blog/example-post',
    ]
  );
  assert.equal(edits[0].subject, 'fix: retitle | with a pipe');
});

// ---------------------------------------------------------------- pullLocal

test('pullLocal reads a repo fixture and keeps going when the live fetch and git fail', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-repo-'));
  const seo = path.join(root, 'docs', 'seo');
  fs.mkdirSync(path.join(seo, 'competitor-snapshots'), { recursive: true });
  fs.mkdirSync(path.join(seo, 'sitemap-snapshots'), { recursive: true });
  fs.mkdirSync(path.join(root, 'src', 'data', 'post'), { recursive: true });
  fs.writeFileSync(
    path.join(seo, 'change-log-verdicts.jsonl'),
    '{"slug":"a","verdict":"better"}\nnot json\n{"slug":"b"}\n'
  );
  fs.writeFileSync(path.join(seo, 'aeo-trend.jsonl'), '{"date":"2026-07-18","rows":[]}\n');
  fs.writeFileSync(
    path.join(seo, 'keyword-registry.json'),
    JSON.stringify([{ slug: 'x', type: 'post', url: '/blog/x', primaryKeyword: 'kw', pillar: '/hub', extra: 1 }])
  );
  fs.writeFileSync(path.join(seo, 'next-15-blogs-2026-11.md'), PLAN);
  fs.writeFileSync(
    path.join(seo, 'OPEN-WORK.md'),
    '## 1. Blocked on the founder\n\n| Item | Why |\n| --- | --- |\n| **One** | Two |\n'
  );
  fs.writeFileSync(
    path.join(seo, 'change-log-notes.jsonl'),
    '{"date":"2026-11-01","slug":"x","text":"IndexNow sent","source":"manual"}\n'
  );
  fs.writeFileSync(
    path.join(seo, 'sitemap-snapshots', 'DIFFLOG.md'),
    '## 2026-11-01\n\n- a.test: +1 / -0 since 2026-10-01\n  - NEW: https://a.test/p\n'
  );
  fs.writeFileSync(
    path.join(seo, 'competitor-snapshots', 'WATCHLOG.md'),
    '## 2026-11-02\n\n- a.test__home: 1 change(s) since 2026-10-01\n  - h1 moved\n'
  );
  fs.writeFileSync(path.join(root, 'src', 'data', 'post', 'y.md'), 'Links to [x](/blog/x).');

  const snap = await pullLocal({
    today: '2026-11-10',
    repoRoot: root,
    fetchImpl: async () => {
      throw new Error('offline');
    },
  });
  assert.equal(snap.source, 'local');
  assert.equal(snap.ok, true);
  assert.equal(snap.status, 'fresh');
  assert.equal(snap.through, '2026-11-10');
  const d = snap.data;
  assert.deepEqual(
    d.verdicts.map((v) => v.slug),
    ['a', 'b']
  );
  assert.equal(d.aeo.length, 1);
  assert.deepEqual(d.registry, [{ slug: 'x', type: 'post', url: '/blog/x', primaryKeyword: 'kw', pillar: '/hub' }]);
  assert.equal(d.plan.posts.length, 2);
  assert.equal(d.plan.file, 'docs/seo/next-15-blogs-2026-11.md');
  assert.equal(d.openWork[0].blockedOnFounder, true);
  assert.equal(d.competitors.lastRun, '2026-11-02');
  assert.equal(d.competitors.sitemap[0].added[0], 'https://a.test/p');
  assert.equal(d.competitors.watch[0].changes[0], 'h1 moved');
  assert.deepEqual(
    d.edits.find((e) => e.kind === 'manual'),
    {
      page: '/blog/x',
      date: '2026-11-01',
      kind: 'manual',
      subject: 'IndexNow sent',
    }
  );
  assert.deepEqual(d.livePages, []);
  assert.deepEqual(d.inbound['/blog/x'], ['/blog/y']);
  assert.ok(d.warnings.some((w) => w.startsWith('livePages')));
  assert.ok(d.warnings.some((w) => w.startsWith('due')));
});

// ---------------------------------------------------------------- AI crawlers (robots.txt)

const { robotsAllows, AI_CRAWLERS } = await import('../lib/robots.mjs');

test('robotsAllows: the agent group wins over *, the longest rule wins, Allow wins a tie', () => {
  const txt = [
    'User-agent: *',
    'Disallow: /private',
    '',
    'User-agent: GPTBot',
    'User-agent: CCBot',
    'Disallow: /',
    '',
    'User-agent: ClaudeBot',
    'Disallow: /blog',
    'Allow: /blog/open',
    '',
    'user-agent: perplexitybot # comment',
    'disallow:',
    '',
    'User-agent: Google-Extended',
    'Disallow: /*.pdf$',
  ].join('\n');
  assert.equal(robotsAllows(txt, 'GPTBot', '/'), false);
  assert.equal(robotsAllows(txt, 'CCBot', '/'), false, 'two agents can share one group');
  assert.equal(robotsAllows(txt, 'ChatGPT-User', '/'), true, 'falls back to *');
  assert.equal(robotsAllows(txt, 'ChatGPT-User', '/private/x'), false);
  assert.equal(robotsAllows(txt, 'ClaudeBot', '/'), true);
  assert.equal(robotsAllows(txt, 'ClaudeBot', '/blog/x'), false);
  assert.equal(robotsAllows(txt, 'ClaudeBot', '/blog/open'), true, 'the longer Allow wins');
  assert.equal(robotsAllows(txt, 'PerplexityBot', '/private'), true, 'an empty Disallow allows everything');
  assert.equal(robotsAllows(txt, 'Google-Extended', '/a.pdf'), false, '* and $ patterns');
  assert.equal(robotsAllows(txt, 'Google-Extended', '/a.pdf.html'), true);
  assert.equal(robotsAllows('', 'GPTBot', '/'), true, 'no file content allows everything');
  assert.equal(
    robotsAllows('User-agent: *\nDisallow: /x\nAllow: /x', 'OAI-SearchBot', '/x'),
    true,
    'a tie goes to Allow'
  );
  assert.deepEqual(AI_CRAWLERS, [
    'GPTBot',
    'ChatGPT-User',
    'OAI-SearchBot',
    'ClaudeBot',
    'PerplexityBot',
    'CCBot',
    'Google-Extended',
  ]);
});

test('pullLocal reads robots.txt for the AI crawlers, and keeps the last answer when the fetch fails', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-robots-'));
  fs.mkdirSync(path.join(root, 'docs', 'seo'), { recursive: true });
  const asked = [];
  const ok = await pullLocal({
    today: '2026-11-10',
    repoRoot: root,
    fetchImpl: async (url, opts) => {
      asked.push([url, Boolean(opts?.signal)]);
      if (url.endsWith('/robots.txt')) {
        return {
          ok: true,
          status: 200,
          text: async () => 'User-agent: GPTBot\nDisallow: /\n\nUser-agent: *\nAllow: /\n',
        };
      }
      throw new Error('offline');
    },
  });
  assert.ok(asked.some(([u, sig]) => u === 'https://simplescheduleai.com/robots.txt' && sig));
  const r = ok.data.robots;
  assert.equal(r.ok, true);
  assert.equal(r.crawlers.find((c) => c.agent === 'GPTBot').allowed, false);
  assert.equal(r.crawlers.find((c) => c.agent === 'ClaudeBot').allowed, true);
  assert.equal(r.crawlers.length, 7);

  // The next pull cannot reach the site: the last answer stays, with the error.
  const { writeJson } = await import('../lib/store.mjs');
  writeJson('snap/local.json', ok);
  const failed = await pullLocal({
    today: '2026-11-11',
    repoRoot: root,
    fetchImpl: async () => {
      throw new Error('offline');
    },
  });
  assert.deepEqual(failed.data.robots.crawlers, r.crawlers);
  assert.equal(failed.data.robots.checkedAt, r.checkedAt);
  assert.match(failed.data.robots.error, /offline/);
});
