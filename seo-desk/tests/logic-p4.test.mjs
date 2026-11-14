import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// The logic audit of 2026-11-14, package 4: index checks, technical audit, AI visibility, Visitors
// shares, source status and the Ask digest. Every page, phrase and number here is invented.

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-p4-'));
const DATA = path.join(root, 'data');
const REPO = path.join(root, 'repo');
fs.mkdirSync(path.join(REPO, 'docs/seo'), { recursive: true });
fs.writeFileSync(path.join(REPO, 'docs/seo/brand-terms.json'), JSON.stringify(['examplebrand']));
process.env.SEO_DESK_DATA = DATA;
process.env.SEO_DESK_REPO = REPO;
process.env.SEO_DESK_TODAY = '2026-11-10';

const { pullIndex, pagePathOf, oldestAnswerDay } = await import('../lib/sources/index.mjs');
const { runIndexAll } = await import('../lib/jobs.mjs');
const { healthView, notIndexedKind } = await import('../lib/api/panels.mjs');
const { buildModel, invalidate } = await import('../lib/api/model.mjs');
const { writeJson } = await import('../lib/store.mjs');

const SITE = 'https://simplescheduleai.com';

function fakeSession(coverage = () => 'Submitted and indexed') {
  const calls = [];
  return {
    calls,
    async call(tool, args) {
      calls.push({ tool, args });
      return {
        results: args.urls.split('\n').map((url) => ({
          url,
          verdict: 'PASS',
          coverage_state: coverage(url),
          last_crawled: '2026-11-09 01:00',
        })),
      };
    },
    close() {},
  };
}

function snap(source, data, extra = {}) {
  writeJson(`snap/${source}.json`, {
    source,
    ok: true,
    status: 'fresh',
    pulledAt: '2026-11-10T06:00:00.000Z',
    through: '2026-11-10',
    error: null,
    data,
    ...extra,
  });
}

// ---------------------------------------------------------------- N1: the home page is checked

test('N1: the home page path stays "/" and is asked about with the other pages', async () => {
  assert.equal(pagePathOf('/'), '/');
  assert.equal(pagePathOf(`${SITE}/`), '/');
  assert.equal(pagePathOf('/blog/sample-post/'), '/blog/sample-post');
  assert.equal(pagePathOf(''), '');
  const s = fakeSession();
  const out = await pullIndex({
    today: '2026-11-10',
    livePages: [{ page: '/' }, { page: '/blog/sample-post' }],
    session: s,
  });
  assert.deepEqual(
    out.data.pages.map((r) => r.page),
    ['/', '/blog/sample-post']
  );
  assert.equal(out.data.live, 2);
  const home = out.data.pages.find((r) => r.page === '/');
  assert.equal(home.verdict, 'indexed', 'the answer for the home address is matched to "/"');
  assert.ok(s.calls[0].args.urls.split('\n').includes(`${SITE}/`));
});

test('W2: data through is the day of the oldest answer, and a stopped run keeps its reason', async () => {
  assert.equal(oldestAnswerDay([{ checkedAt: '2026-11-08T01:00:00Z' }, { checkedAt: null }]), '2026-11-08');
  const prev = {
    data: {
      pages: [{ page: '/blog/old-one', verdict: 'indexed', reason: '', checkedAt: '2026-11-03T05:00:00.000Z' }],
    },
  };
  const live = Array.from({ length: 25 }, (_, i) => ({ page: `/blog/sample-${i}` })).concat({ page: '/blog/old-one' });
  const s = fakeSession();
  let n = 0;
  const call = s.call.bind(s);
  s.call = async (tool, args) => {
    n += 1;
    if (n > 1) throw new Error('timed out after 180000ms');
    return call(tool, args);
  };
  const out = await pullIndex({ today: '2026-11-10', livePages: live, prev, session: s });
  assert.equal(out.data.checkedThisRun, 10);
  assert.match(out.error, /stopped answering after 10 pages/);
  assert.equal(out.through, '2026-11-03', 'never "through today" while older answers are shown');
});

test('N1: "every page" in the index-all job is every page on the live list', async () => {
  const startedAfter = new Date(Date.now() + 1000).toISOString();
  // The rows leave out the home page; the live list has it, so the job is not done.
  const rows = [{ page: '/blog/sample-a', checkedAt: startedAfter }];
  const out = await runIndexAll({
    log: () => {},
    signal: new AbortController().signal,
    refresh: async () => ({ results: { index: 'fresh' } }),
    readSnap: () => ({ error: null, data: { pages: rows } }),
    readLive: () => ['/', '/blog/sample-a'],
    maxRounds: 2,
  });
  assert.equal(out.ok, false);
  const done = await runIndexAll({
    log: () => {},
    signal: new AbortController().signal,
    refresh: async () => ({ results: { index: 'fresh' } }),
    readSnap: () => ({ error: null, data: { pages: [...rows, { page: '/', checkedAt: startedAfter }] } }),
    readLive: () => ['/', '/blog/sample-a'],
    maxRounds: 2,
  });
  assert.equal(done.ok, true);
});

// ---------------------------------------------------------------- the Site health view

function healthFixture({ rows, prev = null, inbound = {}, indexExtra = {} }) {
  fs.rmSync(DATA, { recursive: true, force: true });
  snap('local', { livePages: rows.map((r) => ({ page: r.page })), inbound });
  snap(
    'index',
    { pages: rows, live: rows.length, checked: rows.filter((r) => r.checkedAt).length, checkedThisRun: 2, cap: 40 },
    indexExtra
  );
  if (prev) writeJson('state/index-prev.json', prev);
  invalidate();
  return healthView(buildModel());
}

const row = (page, verdict, checkedAt, reason = '') => ({ page, verdict, reason, lastCrawl: null, checkedAt });

test('index summary: every sentence says how many live pages have an answer and the oldest answer date', () => {
  const v = healthFixture({
    rows: [
      row('/', 'indexed', '2026-11-04T06:00:00.000Z'),
      row('/blog/sample-a', 'indexed', '2026-11-09T06:00:00.000Z'),
      row('/blog/sample-b', 'unknown', null, 'Not checked yet'),
    ],
    indexExtra: { error: 'Search Console stopped answering after 2 pages: timed out.' },
  });
  assert.equal(v.indexSummary.notChecked, 1);
  assert.equal(v.indexSummary.oldestCheckedOn, '2026-11-04');
  assert.match(
    v.indexSummary.answersText,
    /2 of 3 live pages have an answer from Search Console, the oldest from 4 November/
  );
  assert.match(v.indexSummary.text, /2 of 3 live pages/);
  assert.match(v.indexSummary.text, /stopped early/);
  assert.doesNotMatch(v.indexSummary.text, /every page is checked again every few days/);
});

test('W1: "nothing dropped" covers only the pages asked again since the compared refresh', () => {
  const v = healthFixture({
    rows: [
      row('/blog/sample-a', 'indexed', '2026-11-09T06:00:00.000Z'),
      row('/blog/sample-b', 'indexed', '2026-11-02T06:00:00.000Z'),
      row('/blog/sample-c', 'indexed', '2026-11-01T06:00:00.000Z'),
    ],
    prev: {
      pulledAt: '2026-11-08T06:00:00.000Z',
      index: ['/blog/sample-a', '/blog/sample-b', '/blog/sample-c'].map((page) => ({ page, verdict: 'indexed' })),
    },
  });
  assert.equal(v.comparedPages, 1);
  assert.match(v.comparedText, /1 of 3 live pages were asked again/);
});

test('W3 and suspicion 1: a well linked page gets "request indexing", and a page kept out by itself gets no link advice', () => {
  assert.equal(notIndexedKind("Excluded by 'noindex' tag"), 'excluded');
  assert.equal(notIndexedKind('Page with redirect'), 'excluded');
  assert.equal(notIndexedKind('URL is unknown to Google'), 'unknown');
  assert.equal(notIndexedKind('Crawled - currently not indexed'), 'waiting');
  const v = healthFixture({
    rows: [
      row('/blog/linked-well', 'not-indexed', '2026-11-09T06:00:00.000Z', 'URL is unknown to Google'),
      row('/blog/linked-thin', 'not-indexed', '2026-11-09T06:00:00.000Z', 'Crawled - currently not indexed'),
      row('/blog/hidden-on-purpose', 'not-indexed', '2026-11-09T06:00:00.000Z', "Excluded by 'noindex' tag"),
      row('/blog/moved-on', 'not-indexed', '2026-11-09T06:00:00.000Z', 'Page with redirect'),
    ],
    inbound: {
      '/blog/linked-well': ['/a', '/b', '/c', '/d'],
      '/blog/linked-thin': ['/a'],
      '/blog/hidden-on-purpose': [],
      '/blog/moved-on': ['/a', '/b', '/c'],
    },
  });
  const by = Object.fromEntries(v.issues.map((i) => [i.id, i]));
  assert.deepEqual(
    by['not-indexed-linked'].urls.map((u) => u.page),
    ['/blog/linked-well']
  );
  assert.match(by['not-indexed-linked'].fix, /Request indexing/);
  assert.match(by['not-indexed-linked'].fix, /guess worth testing/);
  assert.doesNotMatch(by['not-indexed-linked'].fix, /Link to each page/);
  assert.deepEqual(
    by['not-indexed'].urls.map((u) => u.page),
    ['/blog/linked-thin']
  );
  const kept = by['not-indexed-excluded'];
  assert.deepEqual(kept.urls.map((u) => u.page).sort(), ['/blog/hidden-on-purpose', '/blog/moved-on']);
  assert.doesNotMatch(`${kept.fix} ${kept.why}`, /Link to/);
  assert.match(kept.urls.find((u) => u.page === '/blog/hidden-on-purpose').detail, /noindex/);
});

// ---------------------------------------------------------------- the technical audit

const checks = await import('../lib/audit/checks.mjs');
const auditRun = await import('../lib/audit/run.mjs');
const auditExt = await import('../lib/api/ext/audit.mjs');
const nav = await import('../static/views/nav.js');

const ORIGIN = 'https://simplescheduleai.com';

// One fetched page with the given title, extra head and body.
function built(path, { title = `A page about ${path}`, head = '', body = '', bytes, redirects = [], finalUrl } = {}) {
  const html = `<!doctype html><html lang="en"><head><title>${title}</title><meta name="description" content="A description that is long enough to pass the length check for this sample page."><link rel="canonical" href="${ORIGIN}${path}">${head}</head><body><main><h1>Heading for ${path}</h1><a href="/">Home</a>${body}</main></body></html>`;
  return checks.buildPage(
    {
      url: `${ORIGIN}${path}`,
      status: 200,
      finalUrl: finalUrl ?? `${ORIGIN}${path}`,
      redirects,
      headers: { 'content-type': 'text/html', 'content-encoding': 'gzip' },
      html,
      ms: 1,
      bytes: bytes ?? Buffer.byteLength(html),
      error: null,
    },
    path
  );
}

function auditOf(pages, extra = {}) {
  const site = checks.buildSite({
    pages,
    sitemap: new Set(pages.map((p) => p.path)),
    httpHome: { status: 301, location: `${ORIGIN}/`, error: null },
    ...extra,
  });
  return { site, issues: checks.evaluate({ pages, site }) };
}
const issueOf = (issues, id) => issues.find((i) => i.id === id);

test('N3: titles long only because of the shared ending become one setup finding, and the counts add up', () => {
  const end = ' | Sample Brand Name';
  const pages = [
    built('/', { title: `Short home title${end}` }),
    built('/a', { title: `${'Fifty characters of a title about rotas and shifts'}${end}` }), // long only by the ending
    built('/b', { title: `${'A much longer title that runs well past sixty characters on its own'}${end}` }),
    built('/c', { title: `Another short one${end}` }),
    built('/d', { title: 'A page with no shared ending at all, and long enough to be flagged' }),
  ];
  assert.equal(checks.sharedTitleEnding(pages.map((p) => p.doc.title)), end);
  const { issues } = auditOf(pages);
  const pageLevel = issueOf(issues, 'title-long');
  const setup = issueOf(issues, 'title-template-long');
  assert.deepEqual(pageLevel.pages.map((p) => p.page).sort(), ['/b', '/d']);
  assert.deepEqual(
    setup.pages.map((p) => p.page),
    ['/a']
  );
  assert.equal(setup.severity, 'low');
  assert.equal(setup.editsPage, false);
  assert.equal(setup.siteWide, true, 'one finding, counted once');
  assert.match(setup.what, /Sample Brand Name/);
  assert.match(setup.steps.join(' '), /src\/config\.yaml/);
  assert.doesNotMatch(setup.steps.join(' '), /counts as that week's one page edit/);
  // Without the split, the same pages would all be long: the two counts add up to the old one.
  const long = pages.filter((p) => [...p.doc.title].length > 60).length;
  assert.equal(pageLevel.pages.length + setup.pages.length, long);
});

test('N3: page weight leaves out inline styles and scripts, and a heavy inline stylesheet is one setup finding', () => {
  const css = `<style>${'b{}'.repeat(45000)}</style>`; // 135 KB of inline stylesheet
  const script = `<script>${'var x=1;'.repeat(2000)}</script>`;
  const pages = ['/', '/a', '/b', '/c'].map((p) => built(p, { head: css, body: script }));
  for (const p of pages) assert.equal(p.doc.inlineStyleBytes, 135000);
  // A page over 200 KB in all, under it without the inline text.
  const heavy = built('/d', { head: `<style>${'c{}'.repeat(70000)}</style>` });
  assert.ok(heavy.bytes > 200 * 1024);
  const { issues } = auditOf([...pages, built('/e', { body: 'x'.repeat(210 * 1024) }), heavy]);
  assert.deepEqual(
    issueOf(issues, 'page-code-large').pages.map((p) => p.page),
    ['/e']
  );
  assert.match(issueOf(issues, 'page-code-large').why, /before compression/);
  const setup = issueOf(issues, 'inline-css-heavy');
  assert.equal(setup.editsPage, false);
  assert.match(setup.pages[0].detail, /The typical page carries 132 KB of inline stylesheet before compression/);
  assert.match(setup.fix, /build\.inlineStylesheets/);
  assert.match(setup.fix, /astro\.config\.ts/);
  assert.match(setup.why, /several times smaller/);
  assert.equal(checks.editsPageOf('inline-css-heavy'), false);
  assert.equal(checks.editsPageOf('title-template-long'), false);
});

test('L1: a sitemap address that redirects once is reported, and stays out of the shared title groups', () => {
  const moved = built('/old-name', {
    title: 'The title of the renamed page on rotas',
    redirects: [{ from: `${ORIGIN}/old-name`, to: `${ORIGIN}/new-name`, status: 301 }],
    finalUrl: `${ORIGIN}/new-name`,
  });
  const target = built('/new-name', { title: 'The title of the renamed page on rotas' });
  const { issues } = auditOf([built('/'), moved, target]);
  assert.deepEqual(
    issueOf(issues, 'sitemap-redirects').pages.map((p) => [p.page, p.detail]),
    [['/old-name', 'It moves on to /new-name.']]
  );
  assert.equal(issueOf(issues, 'title-duplicate'), undefined, 'the target is not a duplicate of its own old address');
});

test('L11 and L12: an http canonical is flagged, and an http address that does not answer is a low finding', () => {
  const page = built('/a');
  page.doc.canonical = 'http://simplescheduleai.com/a';
  const { issues } = auditOf([built('/'), page], { httpHome: { status: 0, location: null, error: 'It timed out.' } });
  assert.match(issueOf(issues, 'canonical-elsewhere').pages[0].detail, /plain http address/);
  const open = issueOf(issues, 'http-not-checked');
  assert.equal(open.severity, 'low');
  assert.equal(issueOf(issues, 'http-not-redirecting'), undefined);
  assert.equal(
    auditRun.checksRunOf({ complete: true, httpHome: { status: 0, error: 'x' } }).includes('http-not-redirecting'),
    false
  );
});

test('W4: an image without size attributes but with a class is not called a layout shift, and the text says may', () => {
  const pages = [
    built('/'),
    built('/a', { body: '<img src="/x.webp" alt="A chart" class="w-full h-auto">' }),
    built('/b', { body: '<img src="/y.webp" alt="A chart">' }),
  ];
  const { issues } = auditOf(pages);
  const i = issueOf(issues, 'img-no-size');
  assert.deepEqual(
    i.pages.map((p) => p.page),
    ['/b']
  );
  assert.match(i.why, /may jump around/);
});

test('W5: a score shows 100 only when nothing is open', () => {
  const low = { id: 'x', group: 'speed', severity: 'low', pages: [{ page: '/a' }] };
  assert.equal(checks.scoreOf([low], 200), 99);
  assert.equal(checks.scoreOf([low], 200, 'speed'), 99);
  assert.equal(checks.scoreOf([low], 200, 'links'), 100);
  assert.equal(checks.scoreOf([], 200), 100);
  assert.match(checks.GROUP_NOTE.structured, /not Google's rich results test/);
});

test('N2: only checks that ran in both audits say new or fixed; a new check has its own line', () => {
  const issue = (id, pages) => ({
    id,
    group: 'onpage',
    severity: 'low',
    what: 'W',
    why: 'Y',
    fix: 'F',
    pages: pages.map((page) => ({ page, detail: '', clicks: 0 })),
  });
  // An earlier run saved before checksRun: only the ids in its issues are known to have run.
  const prev = {
    startedAt: '2026-11-01T06:00:00.000Z',
    issues: [issue('title-long', ['/a', '/b']), issue('retired-check', ['/r'])],
  };
  const cur = {
    startedAt: '2026-11-08T06:00:00.000Z',
    checksRun: ['title-long', 'title-template-long', 'title-repeats-name', 'h1-missing'],
    issues: [
      issue('title-long', ['/c']),
      issue('title-template-long', ['/a']),
      issue('title-repeats-name', ['/a', '/x']),
    ],
  };
  const cmp = auditRun.compareAudits(prev, cur);
  assert.deepEqual(
    cmp.added.map((i) => [i.id, i.pages.map((p) => p.page)]),
    [['title-long', ['/c']]]
  );
  assert.deepEqual(
    cmp.fixed.map((i) => [i.id, i.pages.map((p) => p.page)]),
    [['title-long', ['/b']]],
    '/a moved to the template finding, and the retired check fixes nothing'
  );
  assert.deepEqual(cmp.byNewCheck.map((i) => i.id).sort(), ['title-repeats-name', 'title-template-long']);
});

test('N2 and W9: the audit route marks new-check pages without "New", the CSV says new-check, and clicks name their days', async () => {
  fs.rmSync(DATA, { recursive: true, force: true });
  const issue = (id, pages) => ({
    id,
    group: 'onpage',
    severity: 'low',
    what: 'W',
    why: 'Y',
    fix: 'F',
    pages: pages.map((page) => ({ page, detail: '', clicks: 2 })),
  });
  auditRun.saveAudit({
    startedAt: '2026-11-01T06:00:00.000Z',
    pagesChecked: 3,
    score: 99,
    issues: [issue('title-long', ['/a'])],
  });
  auditRun.saveAudit({
    startedAt: '2026-11-08T06:00:00.000Z',
    pagesChecked: 3,
    score: 98,
    checksRun: ['title-long', 'title-repeats-name'],
    clicksRange: { start: '2026-10-08', end: '2026-11-04' },
    issues: [issue('title-long', ['/a', '/b']), issue('title-repeats-name', ['/c'])],
  });
  invalidate();
  const v = auditExt.view(buildModel(), auditExt.latestRun());
  const rep = v.audit.issues.find((i) => i.id === 'title-repeats-name');
  assert.equal(rep.pages[0].isNew, false);
  assert.equal(rep.pages[0].newCheck, true);
  assert.deepEqual(
    v.comparison.byNewCheck.map((i) => i.id),
    ['title-repeats-name']
  );
  assert.deepEqual(
    v.comparison.added.map((i) => [i.id, i.pages.map((p) => p.page)]),
    [['title-long', ['/b']]]
  );
  assert.match(v.audit.clicksNote, /8 October to 4 November|8 Oct/);
  assert.doesNotMatch(v.audit.clicksNote, /before the audit ran/);
  const csv = auditExt.csvOf(buildModel(), auditExt.latestRun());
  assert.match(csv, /\/c,[^\r\n]*,new-check,/);
  assert.match(csv, /\/b,[^\r\n]*,new,/);
});

test('L3: the sidebar shows no tick for a stopped or old audit', () => {
  const entry = { count: 'auditToFix' };
  assert.equal(nav.countView(entry, { auditToFix: 0, auditOpen: 3 }).text, nav.TICK);
  const stopped = nav.countView(entry, { auditToFix: 0, auditOpen: 3, auditStoppedEarly: true });
  assert.equal(stopped.text, nav.DASH);
  assert.match(stopped.title, /stopped early/);
  const old = nav.countView(entry, { auditToFix: 0, auditOpen: 3, auditOld: true });
  assert.equal(old.text, nav.DASH);
  assert.match(old.title, /more than two weeks old/);
  assert.equal(nav.countView(entry, { auditToFix: 2, auditStoppedEarly: true }).text, '2 to fix');
  fs.rmSync(DATA, { recursive: true, force: true });
  auditRun.saveAudit({ startedAt: '2026-10-01T06:00:00.000Z', pagesChecked: 3, score: 99, issues: [] });
  const c = auditExt.latestAuditCounts('2026-11-10');
  assert.equal(c.old, true);
  assert.equal(c.stoppedEarly, false);
  assert.equal(c.at, '2026-10-01T06:00:00.000Z');
});

// ---------------------------------------------------------------- AI visibility

const { aiView, visitorsView } = await import('../lib/api/panels.mjs');
const { visibility } = await import('../lib/ai-visibility.mjs');
const aiPage = await import('../static/views/ai.js');

const own = (platform, question, lastResponseAt = '2026-10-20') => ({
  kind: 'own-mention',
  platform,
  question,
  citedUrls: [],
  lastResponseAt,
});
const kw = (keyword, ourPresent) => ({
  keyword,
  platform: 'chat_gpt',
  ourPresent,
  ourRank: ourPresent ? 2 : null,
  topSources: [['rival.example', 3]],
  competitors: [],
});

function aiFixture(aeo) {
  fs.rmSync(DATA, { recursive: true, force: true });
  snap('local', { livePages: [{ page: '/' }], aeo });
  invalidate();
  return aiView(buildModel());
}

test('L8 and L7: the trend counts only answers that name us, and an assistant the check asked is checked', () => {
  const v = aiFixture([
    {
      date: '2026-11-01',
      engines: ['chat_gpt', 'google'],
      rows: [own('chat_gpt', 'an invented question'), kw('sample phrase one', true)],
    },
  ]);
  assert.equal(v.trend[0].total, 1, 'a keyword hit is not an answer that names us');
  assert.deepEqual(
    v.platforms.map((p) => p.platform),
    ['chat_gpt', 'google']
  );
  assert.deepEqual(v.latestCheck.engines, ['chat_gpt', 'google']);
  const google = aiPage.assistants(v).find((a) => a.label === 'Google AI answers');
  assert.equal(google.checked, true, 'asked and listed nothing is not "not checked this time"');
  assert.equal(google.n, 0);
});

test('L6: when the newest check has no keyword rows, the last results with answers are shown with their date', () => {
  const keywords = ['sample phrase one', 'sample phrase two', 'sample phrase three'];
  const v = aiFixture([
    { date: '2026-10-01', engines: ['chat_gpt'], rows: keywords.map((k, i) => kw(k, i === 0)) },
    { date: '2026-11-01', engines: ['chat_gpt'], rows: [own('chat_gpt', 'an invented question')] },
  ]);
  assert.equal(v.moneyKeywords.length, 3);
  assert.equal(v.keywordCheck.date, '2026-10-01');
  assert.equal(v.keywordCheck.fromLatest, false);
  assert.match(v.keywordCheck.note, /keyword part of the last check, on 1 November, returned nothing/);
  assert.doesNotMatch(v.moneyCitations.text, /No money keyword has been checked yet/);
  assert.match(v.moneyCitations.text, /1 of the 3 money keywords checked at the check on 1 October/);
});

test('W8 and W7: keyword rows claim only "among the sources cited", answers carry their own dates, visits name both ranges', () => {
  const v = aiFixture([
    {
      date: '2026-11-01',
      engines: ['chat_gpt'],
      rows: [own('chat_gpt', 'a', '2026-09-12'), own('chat_gpt', 'b', '2026-10-30'), kw('sample phrase one', true)],
    },
  ]);
  assert.match(v.latestCheck.answersText, /stored AI answers dated 12 September to 30 October/);
  assert.ok(v.visitsFromAi.prevRange.start < v.visitsFromAi.range.start);
  const vis = visibility([{ date: '2026-11-01', rows: ['x', 'y', 'z'].map((k) => kw(`phrase ${k}`, true)) }], {
    today: '2026-11-10',
  });
  const row = vis.byAssistant[0];
  assert.equal(row.keywordNamed, undefined);
  assert.match(row.keywordText, /among the sources cited in at least 3 of 3/);
  assert.doesNotMatch(row.keywordText, /[Nn]amed us|linked to us/);
  assert.equal(aiPage.keywordShare(row), 'among the sources cited in 3 of 3 keyword checks');
});

// ---------------------------------------------------------------- jobs, Visitors, sources, site check

test('L5: a check script that exits 1 on its last step finished and found problems; a failed build did not finish', async () => {
  const { EventEmitter } = await import('node:events');
  const { createJobs } = await import('../lib/jobs.mjs');
  fs.rmSync(DATA, { recursive: true, force: true });
  const children = [];
  const spawn = () => {
    const c = new EventEmitter();
    c.stdout = new EventEmitter();
    c.stderr = new EventEmitter();
    c.kill = () => {};
    children.push(c);
    return c;
  };
  const jobs = createJobs({ spawn, repoRoot: REPO, afterJob: () => {} });
  jobs.start('keyword-check');
  children[0].emit('close', 1);
  const kwLast = jobs.list().find((j) => j.key === 'keyword-check').last;
  assert.equal(kwLast.ok, true);
  assert.equal(kwLast.problems, true);
  jobs.start('site-check');
  children[1].emit('close', 1); // the build failed
  const failed = jobs.list().find((j) => j.key === 'site-check').last;
  assert.equal(failed.ok, false);
  jobs.start('site-check');
  children[2].emit('close', 0);
  children[3].emit('close', 1); // the hygiene report found problems
  const found = jobs.list().find((j) => j.key === 'site-check').last;
  assert.equal(found.ok, true);
  assert.equal(found.problems, true);
});

test('A7 and A11: Visitors shares need 30 visits, and scroll depth says how many days it rests on', () => {
  fs.rmSync(DATA, { recursive: true, force: true });
  const day = (d) => `2026-11-${String(d).padStart(2, '0')}`;
  const channelsDaily = [];
  for (let d = 1; d <= 8; d++) channelsDaily.push({ date: day(d), channel: 'Organic Search', sessions: 3 });
  snap('ga4', {
    channelsDaily,
    sourceMedium: [
      { name: 'invented / referral', sessions: 20, prevSessions: 10 },
      { name: 'other / referral', sessions: 5, prevSessions: 5 },
    ],
    landing: [{ page: '/blog/sample-a', sessions: 25, prevSessions: 20, engagedSessions: 10 }],
  });
  snap('clarity', {
    days: {
      [day(1)]: { scroll: [{ page: '/blog/sample-a', depth: 40 }] },
      [day(2)]: { scroll: [{ page: '/blog/sample-a', depth: 60 }] },
    },
  });
  invalidate();
  const v = visitorsView(buildModel());
  assert.equal(v.channels.total, 24);
  assert.equal(v.channels.rows[0].share, null, '24 visits is under 30');
  assert.equal(v.sourceMedium.rows[0].share, null, '25 visits is under 30');
  assert.equal(v.landing[0].engagementRate, null);
  assert.deepEqual(v.clarity.scroll, [{ page: '/blog/sample-a', depth: 50, days: 2 }]);
  assert.match(v.clarity.scrollNote, /average of the daily figures/);
});

test('L10: a sitemap that cannot be read keeps the old list and says so on the source line', async () => {
  const { pullLocal } = await import('../lib/sources/local.mjs');
  fs.rmSync(DATA, { recursive: true, force: true });
  snap('local', { livePages: [{ page: '/blog/kept-page' }] }, { pulledAt: '2026-11-08T06:00:00.000Z' });
  const out = await pullLocal({
    today: '2026-11-10',
    repoRoot: REPO,
    fetchImpl: async () => {
      throw new Error('network down');
    },
  });
  assert.deepEqual(
    out.data.livePages.map((p) => p.page),
    ['/blog/kept-page']
  );
  assert.match(out.error, /sitemap could not be read/);
  assert.match(out.error, /8 November/);
});

test('L4: the site check counts long titles from the total line, not the five it lists', async () => {
  const { parseHygiene } = await import('../lib/api/site-check.mjs');
  const lines = [
    'SITE HYGIENE AUDIT',
    '--- WARN: titles > 60 chars (42 total, showing 5 worst) ---',
    ...[1, 2, 3, 4, 5].map((i) => `  [7${i}] /blog/sample-${i}: "An invented long title"`),
  ];
  const { issues } = parseHygiene(lines);
  assert.equal(issues[0].total, 42);
  assert.equal(issues[0].urls.length, 5);
  assert.match(issues[0].what, /^42 titles are longer than 60 characters \(the 5 longest are listed\)\.$/);
});
