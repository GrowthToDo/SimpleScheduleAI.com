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
