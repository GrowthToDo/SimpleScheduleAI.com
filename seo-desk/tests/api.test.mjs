import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { EventEmitter } from 'node:events';

// Everything here is synthetic: invented pages, invented searches, a temp data folder and a
// temp "repo" for the notes file. No network, and no script is ever really started.

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-api-'));
const FULL = path.join(root, 'full');
const EMPTY = path.join(root, 'empty');
const REPO = path.join(root, 'repo');
const EMPTY_REPO = path.join(root, 'empty-repo');
for (const d of [FULL, EMPTY, REPO, EMPTY_REPO]) fs.mkdirSync(d, { recursive: true });
fs.mkdirSync(path.join(REPO, 'docs/seo'), { recursive: true });
fs.writeFileSync(path.join(REPO, 'docs/seo/brand-terms.json'), JSON.stringify(['simplescheduleai']));
fs.writeFileSync(
  path.join(REPO, 'docs/seo/change-log-notes.jsonl'),
  `${JSON.stringify({ date: '2026-11-01', slug: 'alpha-guide', text: 'IndexNow resubmit after review.', source: 'manual' })}\n`
);

process.env.SEO_DESK_DATA = FULL;
process.env.SEO_DESK_REPO = REPO;
process.env.SEO_DESK_TODAY = '2026-11-10';

const { createServer } = await import('../server.mjs');
const { makeRoutes } = await import('../lib/api.mjs');
const { createJobs } = await import('../lib/jobs.mjs');
const { buildModel, invalidate } = await import('../lib/api/model.mjs');
const { toCsv, parseCsv } = await import('../lib/api/csv.mjs');
const { addDays, mondayOf } = await import('../lib/dates.mjs');
const { refreshAll } = await import('../lib/refresh.mjs');
const { deliberateEdits, frozenPages } = await import('../lib/lifecycle.mjs');

// ---------------------------------------------------------------- fixtures

const THROUGH = '2026-11-07';
const CUR = { start: '2026-10-11', end: '2026-11-07' };
const PREV = { start: '2026-09-13', end: '2026-10-10' };
const dates = (from, to) => {
  const out = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
};

const PAGES = {
  '/blog/alpha-guide': { prev: 50, cur: 30, pos: 8, clicks: 1 },
  '/blog/beta-notes': { prev: 20, cur: 20, pos: 12, clicks: 1 },
  '/blog/gamma-tips': { prev: 15, cur: 15, pos: 14, clicks: 0 },
  '/pricing': { prev: 10, cur: 10, pos: 9, clicks: 0 },
  '/critical-access-hospital-scheduling': { prev: 12, cur: 12, pos: 7, clicks: 1 },
  '/blog/delta-new': { prev: 8, cur: 8, pos: 20, clicks: 0 },
  '/blog/epsilon-old': { prev: 6, cur: 6, pos: 25, clicks: 0 },
};

function pageDaily() {
  const rows = [];
  for (const date of dates('2026-07-15', THROUGH)) {
    for (const [page, p] of Object.entries(PAGES)) {
      const inCur = date >= CUR.start;
      rows.push({ date, page, clicks: p.clicks, impressions: inCur ? p.cur : p.prev, position: p.pos });
    }
  }
  return rows;
}

const qp = (query, page, impressions, position, clicks = 1) => ({ query, page, clicks, impressions, position });
const QP_CUR = [
  qp('alpha target phrase', '/blog/alpha-guide', 60, 6),
  qp('beta target phrase', '/blog/gamma-tips', 70, 14),
  qp('gamma target phrase', '/blog/gamma-tips', 40, 3),
  qp('pricing target phrase', '/pricing', 50, 12),
  qp('shared topic phrase', '/blog/alpha-guide', 40, 11),
  qp('shared topic phrase', '/blog/beta-notes', 40, 12),
  qp('orphan search phrase', '/blog/epsilon-old', 90, 31),
  qp('dosing, timing and cost', '/blog/alpha-guide', 35, 9),
  qp('simplescheduleai login', '/', 30, 1),
];
const QP_PREV = [
  qp('alpha target phrase', '/blog/alpha-guide', 55, 8),
  qp('beta target phrase', '/blog/gamma-tips', 60, 16),
  qp('pricing target phrase', '/pricing', 45, 10),
  qp('shared topic phrase', '/blog/alpha-guide', 30, 11),
  qp('old search phrase', '/blog/beta-notes', 40, 9),
];
const byQuery = (rows) => {
  const m = new Map();
  for (const r of rows) {
    const a = m.get(r.query) ?? { query: r.query, clicks: 0, impressions: 0, w: 0 };
    a.clicks += r.clicks;
    a.impressions += r.impressions;
    a.w += r.position * r.impressions;
    m.set(r.query, a);
  }
  return [...m.values()].map((a) => ({
    query: a.query,
    clicks: a.clicks,
    impressions: a.impressions,
    position: a.w / a.impressions,
  }));
};

const REGISTRY = [
  { slug: 'alpha-guide', type: 'post', url: '/blog/alpha-guide', primaryKeyword: 'alpha target phrase', pillar: null },
  { slug: 'beta-notes', type: 'post', url: '/blog/beta-notes', primaryKeyword: 'beta target phrase', pillar: null },
  { slug: 'gamma-tips', type: 'post', url: '/blog/gamma-tips', primaryKeyword: 'gamma target phrase', pillar: null },
  { slug: 'delta-new', type: 'post', url: '/blog/delta-new', primaryKeyword: 'delta target phrase', pillar: null },
  { slug: 'pricing', type: 'money', url: '/pricing', primaryKeyword: 'pricing target phrase', pillar: null },
];

function gscData(overrides = {}) {
  const siteDaily = dates('2026-08-01', THROUGH).map((date) => ({
    date,
    clicks: 4,
    impressions: date >= CUR.start ? 130 : 100,
    position: 9,
  }));
  return {
    siteDaily,
    pageDaily: pageDaily(),
    qpCur: QP_CUR,
    qpPrev: QP_PREV,
    qp90: QP_CUR,
    queryCur: byQuery(QP_CUR),
    queryPrev: byQuery(QP_PREV),
    countries: [{ country: 'usa', clicks: 40, impressions: 1000 }],
    devices: [{ device: 'DESKTOP', clicks: 30, impressions: 800 }],
    index: [
      { page: '/', verdict: 'indexed', reason: '', lastCrawl: '2026-11-09' },
      { page: '/blog/alpha-guide', verdict: 'indexed', reason: '', lastCrawl: '2026-11-08' },
      { page: '/blog/delta-new', verdict: 'not-indexed', reason: 'Discovered, currently not indexed', lastCrawl: null },
    ],
    windows: { cur: CUR, prev: PREV, d90: { start: '2026-08-10', end: THROUGH } },
    ...overrides,
  };
}

const LIVE = [
  { page: '/', lastmod: '2026-10-01' },
  { page: '/pricing', lastmod: '2026-10-01' },
  { page: '/critical-access-hospital-scheduling', lastmod: '2026-10-01' },
  { page: '/blog/alpha-guide', lastmod: '2026-10-20' },
  { page: '/blog/beta-notes', lastmod: '2026-10-02' },
  { page: '/blog/gamma-tips', lastmod: '2026-10-02' },
  { page: '/blog/delta-new', lastmod: '2026-09-01' },
  { page: '/blog/epsilon-old', lastmod: '2026-08-01' },
];

const VERDICT = {
  judgedOn: '2026-11-01',
  slug: 'beta-notes',
  url: '/blog/beta-notes',
  changeDate: '2026-10-02',
  kind: 'edit',
  commits: [{ hash: 'a1', subject: 'seo: fixture edit' }],
  overlapping: false,
  before: { clicks: 1, impressions: 456, ctr: 0.002, position: 19.8 },
  after: { clicks: 0, impressions: 428, ctr: 0, position: 23.6 },
  posDelta: -3.8,
  impPct: -0.0614,
  siteImpPct: -0.0159,
  relImpPct: -0.0455,
  ctrRel: null,
  signals: ['ranking-down'],
  dropType: 'lost-rankings',
  verdict: 'worse',
  clicksTooSmall: true,
};
const BATCH = {
  ...VERDICT,
  slug: 'batch:b1',
  url: null,
  kind: 'batch',
  pages: ['alpha-guide', 'gamma-tips'],
  verdict: 'better',
  signals: ['impressions-up'],
  dropType: null,
};

function localData(overrides = {}) {
  return {
    verdicts: [VERDICT, BATCH],
    due: [
      {
        date: '2026-10-05',
        slug: 'gamma-tips',
        url: '/blog/gamma-tips',
        kind: 'edit',
        commits: [{ hash: 'b2', subject: 'content: fixture publish' }],
        notes: [],
        overlapping: false,
      },
    ],
    aeo: [
      {
        date: '2026-10-01',
        engines: ['chat_gpt', 'google'],
        rows: [
          {
            kind: 'own-mention',
            platform: 'google',
            question: 'fixture question',
            citedUrls: ['https://simplescheduleai.com/pricing'],
          },
          {
            keyword: 'alpha target phrase',
            platform: 'chat_gpt',
            ourPresent: false,
            ourRank: null,
            topSources: [['rival.example', 4]],
            competitors: [['rival.example', 4]],
          },
        ],
      },
      {
        date: '2026-11-01',
        engines: ['chat_gpt', 'google'],
        rows: [
          {
            kind: 'own-mention',
            platform: 'google',
            question: 'fixture question',
            citedUrls: ['https://simplescheduleai.com/pricing'],
          },
          { kind: 'own-mention', platform: 'google', question: 'another question', citedUrls: [] },
          {
            keyword: 'alpha target phrase',
            platform: 'chat_gpt',
            ourPresent: true,
            ourRank: 3,
            topSources: [['rival.example', 4]],
            competitors: [],
          },
          {
            keyword: 'beta target phrase',
            platform: 'chat_gpt',
            ourPresent: false,
            ourRank: null,
            topSources: [['rival.example', 6]],
            competitors: [['rival.example', 6]],
          },
        ],
      },
    ],
    registry: REGISTRY,
    plan: {
      file: 'docs/seo/next-15-blogs-2026-11.md',
      error: null,
      posts: [
        { n: 1, done: false, title: 'Fixture post title', keyword: 'fixture keyword' },
        { n: 2, done: false, title: 'Second fixture post', keyword: 'second keyword' },
      ],
      improve: [
        {
          page: '/critical-access-hospital-scheduling',
          done: false,
          doneDate: null,
          judgeFrom: null,
          search: 'fixture search',
          todo: 'Tighten the intro.',
        },
      ],
    },
    openWork: [
      { section: 'Blocked on the founder', text: 'Forward the virtual number.', blockedOnFounder: true },
      { section: 'Backlinks', text: 'Submit to a directory.', blockedOnFounder: false },
    ],
    competitors: {
      sitemap: [
        {
          host: 'rival.example',
          fetchedAt: '2026-11-01',
          added: ['https://rival.example/new'],
          removed: [],
          status: 'diff',
          addedCount: 1,
          removedCount: 0,
        },
      ],
      watch: [
        { url: 'https://rival.example/pricing', fetchedAt: '2026-11-01', changes: ['prices added: "$6"'] },
        { url: 'https://rival.example/', fetchedAt: '2026-11-01', changes: ['h2s added: "A new post"'] },
        { url: 'https://rival.example/about', fetchedAt: '2026-11-01', changes: ['h2s added: "A new post"'] },
        { url: 'quiet.example__pricing', fetchedAt: '2026-11-01', changes: ['unreachable (HTTP 404)'] },
      ],
      snapshots: [
        { key: 'rival.example__pricing', url: 'https://rival.example/pricing', fetchedAt: '2026-11-01' },
        { key: 'rival.example__home', url: 'https://rival.example/', fetchedAt: '2026-11-01' },
        { key: 'rival.example__about', url: 'https://rival.example/about', fetchedAt: '2026-11-01' },
        { key: 'quiet.example__home', url: 'https://quiet.example/', fetchedAt: '2026-11-01' },
      ],
      dossierLogDates: ['2026-11-03', '2026-10-20'],
      lastRun: '2026-11-01',
    },
    edits: [
      { page: '/blog/alpha-guide', date: '2026-11-03', kind: 'edit', subject: 'chore: fixture sweep' },
      { page: '/blog/delta-new', date: '2026-10-20', kind: 'publish', subject: 'content: publish delta' },
    ],
    livePages: LIVE,
    inbound: {
      '/blog/alpha-guide': ['/blog/beta-notes', '/blog/gamma-tips', '/pricing'],
      '/blog/beta-notes': ['/blog/alpha-guide', '/blog/gamma-tips'],
      '/blog/gamma-tips': ['/blog/alpha-guide', '/blog/beta-notes'],
      '/blog/delta-new': ['/blog/alpha-guide'],
      '/blog/epsilon-old': ['/blog/alpha-guide', '/blog/beta-notes'],
    },
    warnings: [],
    ...overrides,
  };
}

function bingData() {
  return {
    siteDaily: dates('2026-08-01', THROUGH).map((date) => ({
      date,
      clicks: 0,
      impressions: date >= CUR.start ? 30 : 20,
    })),
    queries: [
      { query: 'alpha target phrase', clicks: 0, impressions: 30, position: 5 },
      { query: 'bing only phrase', clicks: 0, impressions: 25, position: 7 },
    ],
    pages: [{ page: '/blog/alpha-guide', clicks: 1, impressions: 50 }],
    crawlIssues: [{ url: 'https://simplescheduleai.com/blog/delta-new', issue: 'Blocked by robots.txt' }],
    links: { total: 12, history: [{ date: '2026-11-10', total: 12 }] },
  };
}

function ga4Data() {
  const channelsDaily = dates('2026-08-10', THROUGH).flatMap((date) => [
    { date, channel: 'Organic Search', sessions: 5 },
    { date, channel: 'Direct', sessions: 2 },
  ]);
  return {
    channelsDaily,
    landing: [{ page: '/blog/alpha-guide', sessions: 80, prevSessions: 60, engagedSessions: 30 }],
    events: [
      { name: 'template_download', count: 12, prevCount: 8 },
      { name: 'contact_form_submit', count: 3, prevCount: 2 },
    ],
    ai: [
      { date: '2026-10-20', source: 'chatgpt.com', sessions: 2 },
      { date: '2026-10-25', source: 'gemini.google.com', sessions: 1 },
    ],
  };
}

const clarityData = () => ({
  days: {
    '2026-11-06': {
      sessions: 40,
      rage: [{ page: '/pricing', count: 3 }],
      dead: [],
      quickBack: [{ page: '/blog/alpha-guide', count: 2 }],
      scroll: [{ page: '/pricing', depth: 60 }],
      jsErrors: [{ message: 'TypeError in fixture', count: 2 }],
    },
  },
});

const snapshot = (source, data, extra = {}) => ({
  source,
  ok: true,
  status: 'fresh',
  pulledAt: new Date().toISOString(),
  through: source === 'local' ? '2026-11-10' : THROUGH,
  error: null,
  data,
  ...extra,
});

function writeSnap(dir, source, data, extra) {
  fs.mkdirSync(path.join(dir, 'snap'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'snap', `${source}.json`), JSON.stringify(snapshot(source, data, extra)));
}

function writeAll(dir, { gsc = gscData(), local = localData() } = {}) {
  writeSnap(dir, 'gsc', gsc);
  writeSnap(dir, 'bing', bingData());
  writeSnap(dir, 'ga4', ga4Data());
  writeSnap(dir, 'clarity', clarityData());
  writeSnap(dir, 'local', local);
}

function reset(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(REPO, 'docs/seo/change-log-notes.jsonl'),
    `${JSON.stringify({ date: '2026-11-01', slug: 'alpha-guide', text: 'IndexNow resubmit after review.', source: 'manual' })}\n`
  );
  invalidate();
}

// ---------------------------------------------------------------- server

function fakeSpawn() {
  const calls = [];
  const children = [];
  const spawn = (cmd, args, opts) => {
    const c = new EventEmitter();
    c.stdout = new EventEmitter();
    c.stderr = new EventEmitter();
    c.kill = () => {
      c.killed = true;
    };
    calls.push({ cmd, args, opts });
    children.push(c);
    return c;
  };
  return { spawn, calls, children };
}

const spawner = fakeSpawn();
const afterJobs = [];
let server;
let port;

before(async () => {
  const jobs = createJobs({
    spawn: spawner.spawn,
    repoRoot: '/fake/repo',
    afterJob: (key, ok) => afterJobs.push([key, ok]),
  });
  server = createServer({ routes: makeRoutes({ jobs }), autoRefresh: false, staticDir: root });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  port = server.address().port;
});

after(async () => {
  await new Promise((r) => server.close(r));
  fs.rmSync(root, { recursive: true, force: true });
});

function call(method, url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body === undefined ? null : typeof body === 'string' ? body : JSON.stringify(body);
    const req = http.request(
      {
        host: '127.0.0.1',
        port,
        method,
        path: url,
        headers: { ...(payload ? { 'content-length': Buffer.byteLength(payload) } : {}), ...headers },
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          let json = null;
          try {
            json = JSON.parse(text);
          } catch {
            // not JSON (CSV)
          }
          resolve({ status: res.statusCode, headers: res.headers, text, json });
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}
const get = (url) => call('GET', url);
const post = (url, body = {}) => call('POST', url, body, { 'content-type': 'application/json' });
const useFull = () => {
  process.env.SEO_DESK_DATA = FULL;
  process.env.SEO_DESK_REPO = REPO;
  reset(FULL);
  writeAll(FULL);
};

const ENVELOPE = ['through', 'range', 'sources', 'empty'];
const GET_ROUTES = {
  '/api/week': [
    'weekOf',
    'sinceLastVisit',
    'top5',
    'opportunities',
    'worries',
    'waiting',
    'blockedOnYou',
    'locked',
    'pastWeeks',
  ],
  '/api/opportunities': ['counts', 'items'],
  '/api/competing': ['items'],
  '/api/results': ['verdicts', 'pending', 'frozen', 'moneyPageVerdicts', 'annotations'],
  '/api/search': ['tiles', 'series', 'markers', 'pages', 'queries', 'targets', 'likeForLike', 'countries', 'devices'],
  '/api/pages': ['items'],
  '/api/page?path=/blog/alpha-guide': ['queries', 'series', 'markers', 'opportunities', 'verdicts', 'inboundFrom'],
  '/api/ai': ['trend', 'moneyKeywords', 'visitsFromAi', 'imports'],
  '/api/visitors': ['channels', 'landing', 'interestSignals', 'clarity'],
  '/api/health': ['index', 'issues', 'bingCrawlIssues', 'siteCheck'],
  '/api/competitors': ['sitemap', 'watch', 'daysSinceCheck', 'linksPulse'],
  '/api/settings': ['preset', 'weights', 'moneyPages', 'thresholds', 'presets'],
  '/api/annotations': ['items'],
  '/api/jobs': ['jobs', 'running'],
};

// ---------------------------------------------------------------- routes

test('every GET route answers 200 with the listed top level keys', async () => {
  useFull();
  for (const [url, keys] of Object.entries(GET_ROUTES)) {
    const r = await get(url);
    assert.equal(r.status, 200, url);
    for (const k of [...ENVELOPE, ...keys]) assert.ok(k in r.json, `${url} is missing ${k}`);
    assert.equal(r.json.empty, false, url);
  }
  for (const list of ['opportunities', 'competing', 'pages', 'queries', 'targets', 'verdicts', 'health']) {
    const r = await get(`/api/export/${list}.csv`);
    assert.equal(r.status, 200, list);
    assert.match(r.headers['content-type'], /text\/csv/);
    assert.ok(r.text.split('\r\n').length >= 2, `${list} has a header and rows`);
  }
  assert.equal((await get('/api/export/nothing.csv')).status, 404);
  const backup = await get('/api/backup');
  assert.equal(backup.status, 200);
  assert.ok('state' in backup.json && 'history' in backup.json);
});

test('with no data at all every GET route answers 200 with empty true and empty lists', async () => {
  process.env.SEO_DESK_DATA = EMPTY;
  process.env.SEO_DESK_REPO = EMPTY_REPO;
  reset(EMPTY);
  for (const [url, keys] of Object.entries(GET_ROUTES)) {
    const r = await get(url);
    assert.equal(r.status, 200, url);
    for (const k of [...ENVELOPE, ...keys]) assert.ok(k in r.json, `${url} is missing ${k}`);
    assert.equal(r.json.empty, true, `${url} should say empty`);
    for (const k of ['items', 'top5', 'verdicts', 'tiles', 'trend', 'index']) {
      if (Array.isArray(r.json[k])) assert.ok(r.json[k].length === 0 || k === 'tiles', `${url}.${k}`);
    }
  }
  assert.equal((await get('/api/export/health.csv')).status, 200);
  assert.equal((await get('/api/backup')).status, 200);
});

test('GET replies carry no em or en dashes and every date range is spelled out', async () => {
  useFull();
  for (const url of Object.keys(GET_ROUTES)) {
    const r = await get(url);
    assert.ok(!/[–—]/.test(r.text), `${url} has a dash`);
  }
  const week = (await get('/api/week')).json;
  assert.match(week.range.text, /^\d{1,2} \w+ to \d{1,2} \w+$/);
  assert.equal(week.weekLabel, 'Week of 9 November');
});

test('the week: the five follow the recipe, and every card carries a brief and links', async () => {
  useFull();
  const w = (await get('/api/week')).json;
  assert.equal(w.top5.length, 5);
  assert.equal(w.top5[0].slot, 'new-post');
  assert.equal(w.top5[0].title, 'Fixture post title');
  assert.equal(w.top5[1].slot, 'page-edit');
  assert.equal(w.top5[1].page, '/critical-access-hospital-scheduling');
  assert.equal(w.top5[2].slot, 'verdict');
  assert.equal(w.top5.filter((c) => c.isPageEdit).length, 1, 'one live page edit a week');
  for (const c of [...w.top5, ...w.opportunities]) {
    assert.ok(c.brief.startsWith('Task for the SimpleScheduleAI website:'), c.id);
    assert.ok(c.links.searchConsole.includes('resource_id=https%3A%2F%2Fsimplescheduleai.com%2F'), c.id);
    assert.ok('live' in c.links);
  }
  const edit = w.top5[1];
  assert.equal(edit.links.live, 'https://simplescheduleai.com/critical-access-hospital-scheduling');
  assert.ok(edit.links.searchConsole.includes('&page=!'));
  assert.equal(w.opportunities.length, 10);
  assert.ok(w.opportunities.every((o) => o.eligibility && 'text' in o.eligibility));
  assert.equal(w.blockedOnYou.length, 1);
  assert.ok(w.waiting.every((x) => x.dateText));
  assert.deepEqual(w.pastWeeks, []);
  assert.match(w.standingLine, /not sales/);
});

test('the week plan: choose, reorder, lock, refuse changes while locked, unlock', async () => {
  useFull();
  const w = (await get('/api/week')).json;
  const ids = w.top5.map((c) => c.id);
  const reversed = [...ids].reverse();
  const chosen = await post('/api/week/top5', { ids: reversed });
  assert.equal(chosen.status, 200);
  assert.deepEqual(
    chosen.json.top5.map((c) => c.id),
    reversed
  );
  assert.equal(chosen.json.top5Source, 'chosen');
  assert.equal((await post('/api/week/top5', { ids: ['nope'] })).status, 400);
  assert.equal((await post('/api/week/top5', { ids: [...ids, ...ids] })).status, 400);

  const locked = await post('/api/week/lock');
  assert.equal(locked.json.locked, true);
  assert.equal(locked.json.top5Source, 'locked');
  assert.deepEqual(
    locked.json.top5.map((c) => c.id),
    reversed
  );
  assert.equal((await post('/api/week/top5', { ids })).status, 409);

  const unlocked = await post('/api/week/unlock');
  assert.equal(unlocked.json.locked, false);
  assert.equal((await post('/api/week/unlock')).status, 409);
  assert.equal((await post('/api/week/top5', { ids })).status, 200);
});

test('past weeks stay viewable with what got done', async () => {
  useFull();
  fs.mkdirSync(path.join(FULL, 'state'), { recursive: true });
  fs.writeFileSync(
    path.join(FULL, 'state/weeks.json'),
    JSON.stringify({
      '2026-11-02': {
        weekOf: '2026-11-02',
        locked: true,
        lockedAt: '2026-11-02T08:00:00.000Z',
        cards: [
          { id: 'plan-post-1', title: 'Old post' },
          { id: 'verdict-due', title: 'Old verdict' },
        ],
        top5: ['plan-post-1', 'verdict-due'],
      },
    })
  );
  fs.writeFileSync(
    path.join(FULL, 'state/items.json'),
    JSON.stringify({
      'plan-post-1': { status: 'done', since: '2026-11-04', doneAt: '2026-11-04', notes: [], pinnedWeek: null },
    })
  );
  invalidate();
  const w = (await get('/api/week')).json;
  assert.equal(w.pastWeeks.length, 1);
  assert.equal(w.pastWeeks[0].weekLabel, 'Week of 2 November');
  assert.equal(w.pastWeeks[0].doneCount, 1);
  assert.equal(w.pastWeeks[0].cards.length, 2);
});

test('opportunities: counts by type and status, filters, and every item has what the card needs', async () => {
  useFull();
  const all = (await get('/api/opportunities')).json;
  assert.ok(all.items.length >= 8);
  const types = new Set(all.items.map((o) => o.type));
  for (const t of [
    'near-page-one',
    'competing-pages',
    'wrong-page',
    'unserved',
    'slipping',
    'low-click-rate',
    'needs-links',
    'not-indexed',
    'engine-gap',
    'ai-gap',
  ]) {
    assert.ok(types.has(t), `fixture should produce ${t}`);
  }
  for (const o of all.items) {
    for (const k of [
      'id',
      'type',
      'typeLabel',
      'title',
      'measured',
      'action',
      'test',
      'score',
      'status',
      'eligibility',
      'touchedOn',
      'brief',
      'links',
      'range',
    ]) {
      assert.ok(k in o, `${o.type} lacks ${k}`);
    }
    assert.equal(o.score.parts.length, 7);
    assert.ok(o.range.text.includes(' to ') || o.range.start === o.range.end);
  }
  assert.equal(all.counts.byStatus.new, all.items.length);
  assert.equal(all.counts.byType['near-page-one'], all.items.filter((o) => o.type === 'near-page-one').length);
  const only = (await get('/api/opportunities?type=unserved')).json;
  assert.ok(only.items.length >= 1 && only.items.every((o) => o.type === 'unserved'));
  assert.equal(
    only.counts.byType['near-page-one'],
    all.counts.byType['near-page-one'],
    'type counts ignore the type filter'
  );
  const pageOnly = (await get('/api/opportunities?page=/pricing')).json;
  assert.ok(pageOnly.items.length >= 1 && pageOnly.items.every((o) => o.page === '/pricing'));
  assert.equal((await get('/api/opportunities?status=ignored')).json.items.length, 0);
  // The slipping page was touched by a routine edit on 3 November; the card says so but it does not freeze.
  const slip = all.items.find((o) => o.type === 'slipping');
  assert.deepEqual(slip.touchedOn, ['2026-11-03']);
  assert.equal(slip.eligibility.eligible, true);
  // Unserved and Bing only items have no page.
  assert.equal(all.items.find((o) => o.type === 'unserved').page, null);
});

test('an item action persists across a simulated refresh, and the freeze holds', async () => {
  useFull();
  const list = (await get('/api/opportunities')).json.items;
  const low = list.find((o) => o.type === 'low-click-rate');
  const near = list.find((o) => o.type === 'near-page-one' && o.page !== low.page);
  assert.ok(low.isPageEdit && near);

  assert.equal((await post(`/api/item/${low.id}`, { action: 'ignore' })).status, 400, 'ignoring needs a reason');
  const ignored = await post(`/api/item/${near.id}`, { action: 'ignore', reason: 'not our audience' });
  assert.equal(ignored.status, 200);
  assert.equal(ignored.json.item.status, 'ignored');
  assert.equal((await post(`/api/item/${near.id}`, { action: 'start' })).status, 409, 'ignored stays ignored');
  assert.equal((await post('/api/item/no-such-id', { action: 'start' })).status, 404);
  assert.equal((await post(`/api/item/${near.id}`, { action: 'dance' })).status, 400);
  assert.equal((await post(`/api/item/${near.id}`, { action: 'note', text: '   ' })).status, 400);
  assert.equal((await post(`/api/item/${near.id}`, { action: 'note', text: 'keep an eye on it' })).status, 200);
  assert.equal(
    (await post(`/api/item/${low.id}`, { action: 'snooze', until: '2026-11-01' })).status,
    400,
    'a past date'
  );
  assert.equal((await post(`/api/item/${low.id}`, { action: 'snooze', until: 'soon' })).status, 400, 'not a date');

  const done = await post(`/api/item/${low.id}`, { action: 'done' });
  assert.equal(done.status, 200);
  assert.equal(done.json.freeze.page, '/pricing');
  assert.equal(done.json.freeze.until, '2026-12-08');

  // A refresh: new snapshot files with a new pulled-at time.
  writeAll(FULL);
  invalidate();
  const after = (await get('/api/opportunities')).json;
  assert.equal(after.items.find((o) => o.id === near.id).status, 'ignored');
  assert.deepEqual(
    after.items.find((o) => o.id === near.id).item.notes.map((n) => n.text),
    ['keep an eye on it']
  );
  assert.equal(after.items.find((o) => o.id === low.id).status, 'done');
  assert.equal((await get('/api/opportunities?status=ignored')).json.items.length, 1);

  const results = (await get('/api/results')).json;
  const frozen = results.frozen.find((f) => f.page === '/pricing');
  assert.ok(frozen);
  assert.equal(frozen.until, '2026-12-08');
  assert.equal(frozen.untilText, '8 December');
  const pricingEdits = after.items.filter((o) => o.page === '/pricing' && o.isPageEdit && o.id !== low.id);
  assert.ok(pricingEdits.every((o) => !o.eligibility.eligible && o.eligibility.from === '2026-12-08'));
  assert.equal((await get('/api/pages')).json.items.find((p) => p.page === '/pricing').frozenUntil, '2026-12-08');

  // Once the rules stop finding a finished item, it is still listed under Done.
  writeAll(FULL, {
    gsc: gscData({
      pageDaily: pageDaily().filter((r) => r.page !== '/pricing'),
      qpCur: QP_CUR.filter((r) => r.page !== '/pricing'),
    }),
  });
  invalidate();
  const gone = (await get('/api/opportunities?status=done')).json.items.find((o) => o.id === low.id);
  assert.ok(gone && gone.detected === false);
});

test('a plan card marked done reminds the founder to tick the plan row', async () => {
  useFull();
  const w = (await get('/api/week')).json;
  const card = w.top5.find((c) => c.slot === 'new-post');
  const r = await post(`/api/item/${encodeURIComponent(card.id)}`, { action: 'done' });
  assert.equal(r.status, 200);
  assert.match(r.json.reminder, /next-15-blogs-2026-11\.md/);
  const improve = w.top5.find((c) => c.slot === 'page-edit');
  const d = await post(`/api/item/${encodeURIComponent(improve.id)}`, { action: 'done' });
  assert.equal(d.json.freeze.page, '/critical-access-hospital-scheduling');
  const next = (await get('/api/week')).json;
  assert.ok(!next.top5.some((c) => c.id === improve.id), 'a finished card leaves the proposal');
});

test('pinning an item survives a refresh', async () => {
  useFull();
  const o = (await get('/api/opportunities?type=unserved')).json.items[0];
  const r = await post(`/api/item/${o.id}`, { action: 'pin' });
  assert.equal(r.json.item.pinnedWeek, '2026-11-09');
  writeAll(FULL);
  invalidate();
  assert.equal((await get('/api/opportunities?type=unserved')).json.items[0].item.pinnedWeek, '2026-11-09');
});

// ---------------------------------------------------------------- search

test('like for like mean uses only keywords present in both periods', async () => {
  useFull();
  const s = (await get('/api/search')).json;
  const like = s.likeForLike;
  // alpha 6 (was 8), beta 14 (was 16), pricing 12 (was 10). gamma has no earlier data and is left out.
  assert.equal(like.n, 3);
  assert.equal(like.mean, 10.7);
  assert.equal(like.prevMean, 11.3);
  assert.equal(like.targetsTotal, 5);
  assert.equal(like.enough, true);
  const tile = s.tiles.find((t) => t.key === 'targetPosition');
  assert.equal(tile.value, 10.7);
  // Positive means better everywhere: 11.3 to 10.7 is 0.6 places better, like alpha's 8 to 6 is 2 better.
  assert.equal(tile.change, 0.6);
  assert.equal(s.targets.find((t) => t.keyword === 'alpha target phrase').change, 2);
  assert.match(tile.note, /3 of 5/);
  const gamma = s.targets.find((t) => t.keyword === 'gamma target phrase');
  assert.equal(gamma.position, 3);
  assert.equal(gamma.prevPosition, null);
  assert.equal(gamma.change, null);
  assert.deepEqual(Object.fromEntries(s.targets.map((t) => [t.keyword.split(' ')[0], t.alignment])), {
    alpha: 'right page',
    beta: 'wrong page',
    gamma: 'right page',
    delta: 'no data yet',
    pricing: 'right page',
  });
  assert.equal(s.targets.find((t) => t.keyword === 'beta target phrase').rankingPage, '/blog/gamma-tips');
});

test('below the minimum, the like for like number says not enough data yet', async () => {
  useFull();
  writeAll(FULL, {
    gsc: gscData({
      queryPrev: byQuery(QP_PREV.filter((r) => r.query === 'alpha target phrase')),
      qpPrev: QP_PREV.filter((r) => r.query === 'alpha target phrase'),
    }),
  });
  invalidate();
  const s = (await get('/api/search')).json;
  assert.equal(s.likeForLike.mean, null);
  assert.equal(s.likeForLike.enough, false);
  const tile = s.tiles.find((t) => t.key === 'targetPosition');
  assert.equal(tile.value, null);
  assert.match(tile.note, /Not enough data yet/);
});

test('search: six tiles with their date range, ranges, series, movement and page level click rate only', async () => {
  useFull();
  const s = (await get('/api/search?range=28&metric=clicks')).json;
  assert.deepEqual(
    s.tiles.map((t) => t.key),
    ['impressions', 'clicks', 'targetPosition', 'searches', 'bing', 'indexed']
  );
  assert.ok(s.tiles.every((t) => t.range && t.range.text));
  const imp = s.tiles.find((t) => t.key === 'impressions');
  assert.equal(imp.value, 130 * 28);
  assert.equal(imp.change, 30);
  assert.equal(imp.range.text, '11 October to 7 November');
  assert.equal(s.tiles.find((t) => t.key === 'indexed').value, 2);
  assert.equal(s.series.length, 28);
  assert.equal(s.series[0].value, 4);
  assert.ok(s.markers.some((m) => m.kind === 'publish' || m.kind === 'note' || m.kind === 'edit'));
  // 7 days: same shape, shorter series. 480 days: no earlier period to compare with.
  const week = (await get('/api/search?range=7')).json;
  assert.equal(week.series.length, 7);
  const long = (await get('/api/search?range=480')).json;
  assert.equal(long.tiles.find((t) => t.key === 'impressions').change, null);
  assert.match(long.tiles.find((t) => t.key === 'impressions').note, /Not enough history/);
  assert.equal((await get('/api/search?range=13')).status, 400);
  assert.equal((await get('/api/search?metric=cheese')).status, 400);
  // A number with no daily history has no chart and says so.
  const pos = (await get('/api/search?metric=targetPosition')).json;
  assert.deepEqual(pos.series, []);
  assert.ok(pos.seriesNote);

  const moves = new Set(['growing', 'slipping', 'new', 'gone', 'steady']);
  const alpha = s.pages.find((p) => p.page === '/blog/alpha-guide');
  assert.equal(alpha.movement, 'slipping');
  assert.equal(alpha.change, -40);
  assert.ok(s.pages.every((p) => p.movement === null || moves.has(p.movement)));
  assert.ok(s.queries.every((q) => q.movement === null || moves.has(q.movement)));
  assert.equal(s.queries.find((q) => q.query === 'orphan search phrase').movement, 'new');
  assert.equal(s.queries.find((q) => q.query === 'old search phrase').movement, 'gone');
  // Click rate belongs to pages, and only above 200 impressions; searches carry no rate at all.
  assert.ok(s.queries.every((q) => !('ctr' in q)));
  assert.equal(alpha.ctr, Math.round((28 / 840) * 1000) / 1000);
  assert.equal(s.pages.find((p) => p.page === '/blog/delta-new').ctr, 0, 'delta has 224 impressions');
  assert.equal(s.pages.find((p) => p.page === '/blog/epsilon-old').ctr, null, 'epsilon has 168 impressions');
  assert.equal(s.brandSplit.brand.impressions, 30);
  assert.ok(s.queries.find((q) => q.query === 'simplescheduleai login').brand);
  assert.equal(s.queries.find((q) => q.query === 'alpha target phrase').bingImpressions, 30);
  assert.ok(!('averagePosition' in s) && !s.tiles.some((t) => /average/i.test(t.label)));
});

test('pages list and one page', async () => {
  useFull();
  const list = (await get('/api/pages')).json.items;
  assert.equal(list.length, 8);
  const alpha = list.find((p) => p.page === '/blog/alpha-guide');
  assert.equal(alpha.keyword, 'alpha target phrase');
  assert.equal(alpha.position, 6);
  assert.equal(alpha.impressions, 840);
  assert.equal(alpha.queryCount, 3);
  assert.equal(alpha.inbound, 3);
  assert.equal(alpha.index, 'indexed');
  assert.equal(alpha.bingImpressions, 50);
  assert.equal(alpha.lastEdit, null, 'a routine edit is not a deliberate one');
  assert.equal(list.find((p) => p.page === '/blog/delta-new').index, 'not-indexed');
  assert.equal(list.find((p) => p.page === '/blog/delta-new').inbound, 1);

  const one = (await get('/api/page?path=/blog/alpha-guide')).json;
  assert.equal(one.page, '/blog/alpha-guide');
  const q = one.queries.find((x) => x.query === 'alpha target phrase');
  assert.deepEqual([q.position, q.prevPosition, q.bingImpressions], [6, 8, 30]);
  assert.ok(one.series.length >= 100);
  assert.ok(one.opportunities.some((o) => o.type === 'slipping'));
  assert.ok(one.verdicts.some((v) => v.batch));
  assert.deepEqual(one.inboundFrom, ['/blog/beta-notes', '/blog/gamma-tips', '/pricing']);
  assert.equal((await get('/api/page?path=/blog/not-here')).status, 404);
  assert.equal((await get('/api/page')).status, 400);
});

test('two pages competing: each search with its pages, shares and the registry page', async () => {
  useFull();
  const c = (await get('/api/competing')).json.items;
  const shared = c.find((x) => x.query === 'shared topic phrase');
  assert.ok(shared);
  assert.equal(shared.pages.length, 2);
  assert.deepEqual(
    shared.pages.map((p) => p.share),
    [0.5, 0.5]
  );
  assert.equal(shared.registryPage, null);
  assert.match(shared.note, /A split is fine/);
  assert.ok(shared.oppId);
  assert.ok(!c.some((x) => x.query === 'simplescheduleai login'));
});

// ---------------------------------------------------------------- results

test('Did it work: verdicts in plain words, pending, due, frozen and the timeline', async () => {
  useFull();
  const r = (await get('/api/results')).json;
  assert.equal(r.verdicts.length, 2);
  const worse = r.verdicts.find((v) => v.verdict === 'worse');
  assert.equal(worse.verdictText, 'Worse');
  assert.match(worse.summary, /^Worse\. In the 28 days before the 2 October change/);
  assert.match(worse.summary, /456 times at an average place of 19\.8/);
  const batch = r.verdicts.find((v) => v.batch);
  assert.deepEqual(batch.pages, ['/blog/alpha-guide', '/blog/gamma-tips']);
  assert.equal(r.due.length, 1);
  assert.equal(r.due[0].page, '/blog/gamma-tips');
  // Both the 3 November edit and the 1 November note on the same page are waiting their 30 days.
  assert.deepEqual(
    r.pending.map((p) => [p.page, p.changeDate, p.judgeFrom]),
    [
      ['/blog/alpha-guide', '2026-11-01', '2026-12-01'],
      ['/blog/alpha-guide', '2026-11-03', '2026-12-03'],
    ]
  );
  assert.ok(r.timeline.some((e) => e.kind === 'publish'));
  assert.ok(r.timeline.some((e) => e.kind === 'note' && /IndexNow/.test(e.label)));
  assert.deepEqual(r.frozen, [], 'an IndexNow note does not freeze a page');
});

test('annotations: add, edit, archive, then delete for good only when archived', async () => {
  useFull();
  const a = await post('/api/annotations', { date: '2026-11-05', text: 'Changed the site header' });
  assert.equal(a.status, 200);
  const id = a.json.id;
  assert.equal((await post('/api/annotations', { date: 'tomorrow', text: 'x' })).status, 400);
  assert.equal((await post('/api/annotations', { date: '2026-11-05', text: '  ' })).status, 400);
  assert.equal((await get('/api/annotations')).json.items.length, 1);
  const put = await call(
    'PUT',
    `/api/annotations/${id}`,
    { text: 'Changed the header and footer' },
    { 'content-type': 'application/json' }
  );
  assert.equal(put.json.text, 'Changed the header and footer');
  assert.ok(
    (await get('/api/results')).json.timeline.some(
      (e) => e.kind === 'annotation' && e.label === 'Changed the header and footer'
    )
  );
  assert.ok((await get('/api/search')).json.markers.some((e) => e.kind === 'annotation'));
  const archived = await call('DELETE', `/api/annotations/${id}`);
  assert.equal(archived.json.archived, true);
  assert.equal((await get('/api/annotations')).json.items.length, 0);
  assert.equal((await get('/api/annotations?archived=1')).json.items.length, 1);
  const gone = await call('DELETE', `/api/annotations/${id}`);
  assert.equal(gone.json.deleted, true);
  assert.equal((await get('/api/annotations?archived=1')).json.items.length, 0);
  assert.equal((await call('DELETE', `/api/annotations/${id}`)).status, 404);
  assert.equal(
    (await call('PUT', '/api/annotations/zzzz', { text: 'x' }, { 'content-type': 'application/json' })).status,
    404
  );
});

test('a manual edit note freezes the page, needs a confirm, and writes one line', async () => {
  useFull();
  const file = path.join(REPO, 'docs/seo/change-log-notes.jsonl');
  const before = fs.readFileSync(file, 'utf8');
  assert.equal((await post('/api/edit-note', { page: '/pricing', text: 'Rewrote the intro' })).status, 400);
  assert.equal(fs.readFileSync(file, 'utf8'), before, 'nothing written without the confirm');
  assert.equal((await post('/api/edit-note', { page: 'pricing', text: 'x', confirm: true })).status, 400);
  assert.equal((await post('/api/edit-note', { page: '/pricing', text: ' ', confirm: true })).status, 400);

  const r = await post('/api/edit-note', { page: '/pricing', text: 'Rewrote the intro', confirm: true });
  assert.equal(r.status, 200);
  assert.equal(r.json.wrote, 'docs/seo/change-log-notes.jsonl');
  const lines = fs.readFileSync(file, 'utf8').trim().split('\n').map(JSON.parse);
  assert.equal(lines.length, 2);
  assert.deepEqual(lines[1], {
    date: '2026-11-10',
    slug: '/pricing',
    text: 'Edit: Rewrote the intro',
    source: 'manual',
  });
  // A second page edit in the same week is the founder's call: it needs the override.
  assert.equal(
    (await post('/api/edit-note', { page: '/blog/beta-notes', text: 'Added a section', confirm: true })).status,
    409
  );
  const blog = await post('/api/edit-note', {
    page: '/blog/beta-notes',
    text: 'Added a section',
    confirm: true,
    override: true,
  });
  assert.equal(JSON.parse(fs.readFileSync(file, 'utf8').trim().split('\n')[2]).slug, 'beta-notes');
  assert.equal(blog.status, 200);

  const results = (await get('/api/results')).json;
  assert.equal(results.frozen.find((f) => f.page === '/pricing').until, '2026-12-08');
  assert.ok(results.frozen.find((f) => f.page === '/blog/beta-notes'));
  assert.equal((await get('/api/pages')).json.items.find((p) => p.page === '/pricing').lastEdit, '2026-11-10');
  const jobs = (await get('/api/jobs')).json.jobs.find((j) => j.key === 'edit-note');
  assert.deepEqual(jobs.writes, ['docs/seo/change-log-notes.jsonl']);
  assert.equal(jobs.runnable, false);
});

test('money pages are judged from the desk own pulls, and say too early when it is', async () => {
  useFull();
  await post('/api/edit-note', {
    page: '/critical-access-hospital-scheduling',
    text: 'Rewrote the page',
    confirm: true,
  });
  // An older edit, long enough ago to judge.
  fs.appendFileSync(
    path.join(REPO, 'docs/seo/change-log-notes.jsonl'),
    `${JSON.stringify({ date: '2026-09-25', slug: '/pricing', text: 'Edit: new title', source: 'manual' })}\n`
  );
  invalidate();
  const money = (await get('/api/results')).json.moneyPageVerdicts;
  const early = money.find((m) => m.page === '/critical-access-hospital-scheduling');
  assert.equal(early.status, 'too-early');
  assert.equal(early.judgeFromText, '10 December');
  const judged = money.find((m) => m.page === '/pricing');
  assert.equal(judged.status, 'judged');
  assert.ok(['better', 'worse', 'mixed', 'flat', 'insufficient-data'].includes(judged.verdict));
  assert.match(judged.summary, /In the 28 days before the 25 September change/);
});

// ---------------------------------------------------------------- panels

test('AI answers: trend counts are a floor, money keywords show who is cited', async () => {
  useFull();
  const a = (await get('/api/ai')).json;
  assert.deepEqual(
    a.trend.map((t) => [t.date, t.total]),
    [
      ['2026-10-01', 1],
      ['2026-11-01', 3],
    ]
  );
  assert.match(a.atLeastNote, /floor/);
  const alpha = a.moneyKeywords.find((k) => k.keyword === 'alpha target phrase');
  assert.equal(alpha.cited, true);
  assert.equal(alpha.platforms[0].rank, 3);
  const beta = a.moneyKeywords.find((k) => k.keyword === 'beta target phrase');
  assert.equal(beta.cited, false);
  assert.deepEqual(beta.platforms[0].competitors, [{ domain: 'rival.example', count: 6 }]);
  assert.equal(a.visitsFromAi.total, 3);
  assert.equal(a.check.cost, 'about $0.62');
  assert.equal(a.latestCheck.daysAgo, 9);
});

test('Generative AI import: stored as a dated snapshot and shown as a trend', async () => {
  useFull();
  const csv = 'Query,Clicks,Impressions,CTR\r\n"nurse scheduling, help",4,"1,200",0.3%\r\nsecond,6,300,2%\r\n';
  const r = await call('POST', '/api/ai/import', csv, { 'content-type': 'text/csv' });
  assert.equal(r.status, 200);
  assert.equal(r.json.rowCount, 2);
  assert.deepEqual(r.json.totals, { Clicks: 10, Impressions: 1500 });
  const a = (await get('/api/ai')).json;
  assert.equal(a.imports.count, 1);
  assert.equal(a.imports.latest.rows[0].Query, 'nurse scheduling, help');
  assert.equal(a.imports.trend[0].date, '2026-11-10');
  assert.equal((await call('POST', '/api/ai/import', 'only a header\r\n', {})).status, 400);
  assert.equal((await call('POST', '/api/ai/import', '', {})).status, 400);
  // A second import the same day replaces the first.
  await call('POST', '/api/ai/import', csv.replace('second,6', 'second,7'), {});
  assert.equal((await get('/api/ai')).json.imports.count, 1);
});

test('visitors: channels, landing pages, interest signals and Clarity', async () => {
  useFull();
  const v = (await get('/api/visitors')).json;
  assert.equal(v.channels.total, 28 * 7);
  assert.equal(v.channels.rows[0].channel, 'Organic Search');
  assert.equal(v.channels.rows[0].change, 0);
  assert.equal(v.interestSignals[0].label, 'Template downloads');
  assert.equal(v.interestSignals[0].change, null, 'a jump from 8 to 12 is too small for a percentage');
  assert.match(v.standingLine, /not sales/);
  assert.match(v.internalTrafficNote, /not filtered/);
  assert.equal(v.clarity.available, true);
  assert.deepEqual(v.clarity.rage, [{ page: '/pricing', count: 3, links: v.clarity.rage[0].links }]);
  assert.equal(v.clarity.jsErrors[0].count, 2);
  fs.rmSync(path.join(FULL, 'snap/clarity.json'));
  invalidate();
  assert.equal((await get('/api/visitors')).json.clarity.available, false);
});

test('site health: index table, what changed since the last refresh, issues sorted by clicks', async () => {
  useFull();
  let h = (await get('/api/health')).json;
  assert.equal(h.indexSummary.notIndexed, 1);
  assert.ok(
    h.index.every((r) => r.changedSinceLast === null),
    'nothing to compare with on the first look'
  );
  assert.equal(h.comparedWith, null);
  assert.deepEqual(
    h.bingCrawlIssues.map((c) => c.page),
    ['/blog/delta-new']
  );
  assert.ok(h.issues.length >= 2);
  assert.ok(h.issues.every((i, n, all) => n === 0 || all[n - 1].clicks >= i.clicks));
  assert.equal(h.aiCrawlers.checked, false);

  // The next refresh: alpha drops off Google and delta gets in.
  const index = gscData().index.map((r) =>
    r.page === '/blog/alpha-guide'
      ? { ...r, verdict: 'not-indexed', reason: 'Crawled, currently not indexed' }
      : r.page === '/blog/delta-new'
        ? { ...r, verdict: 'indexed', reason: '' }
        : r
  );
  // Nothing so far has written the comparison copy: reading pages never does.
  assert.equal(fs.existsSync(path.join(FULL, 'state/index-prev.json')), false, 'a GET writes nothing');
  const firstPulledAt = JSON.parse(fs.readFileSync(path.join(FULL, 'snap/gsc.json'), 'utf8')).pulledAt;
  // The first index check starts from the table the Search Console snapshot used to carry.
  await refreshAll({
    only: ['index'],
    pullers: {
      index: async () =>
        snapshot(
          'index',
          { pages: index.map((r) => ({ ...r, checkedAt: '2026-11-10T06:00:00.000Z' })), live: 8, checked: 3 },
          { pulledAt: new Date(Date.now() + 60000).toISOString() }
        ),
    },
  });
  const kept = JSON.parse(fs.readFileSync(path.join(FULL, 'state/index-prev.json'), 'utf8'));
  assert.equal(kept.pulledAt, firstPulledAt, 'the outgoing snapshot is what is kept');
  assert.equal(kept.index.find((r) => r.page === '/blog/alpha-guide').verdict, 'indexed');
  h = (await get('/api/health')).json;
  assert.equal(h.comparedWith, 'the previous refresh');
  assert.deepEqual(h.newSinceLast, ['/blog/alpha-guide']);
  assert.deepEqual(h.fixedSinceLast, ['/blog/delta-new']);
  assert.equal(h.index.find((r) => r.page === '/blog/alpha-guide').changedSinceLast, 'new-problem');
  const w = (await get('/api/week')).json;
  assert.ok(w.worries.some((x) => x.kind === 'dropped-from-index' && x.page === '/blog/alpha-guide'));
});

test('the index copy is saved by the index checks, and only for a good pull with rows', async () => {
  useFull();
  // Start from a desk that already has an index snapshot.
  writeSnap(FULL, 'index', { pages: [] });
  const file = path.join(FULL, 'state/index-prev.json');
  const later = (n) => new Date(Date.now() + n * 60000).toISOString();
  const idx = (rows, n) =>
    snapshot(
      'index',
      { pages: rows.map((r) => ({ ...r, checkedAt: later(n) })), live: rows.length, checked: rows.length },
      { pulledAt: later(n) }
    );
  const run = (puller) => refreshAll({ only: ['index'], pullers: { index: puller } });
  // A pull that throws keeps the old snapshot and writes no copy.
  await run(async () => {
    throw new Error('Search Console is down');
  });
  assert.equal(fs.existsSync(file), false);
  // A pull that says it failed, the same.
  await run(async () => ({ ok: false, status: 'failed', error: 'no' }));
  assert.equal(fs.existsSync(file), false);
  // A good pull with no rows saves nothing.
  await run(async () => idx([], 1));
  assert.equal(fs.existsSync(file), false);
  // The previous good snapshot had no rows, so there is still nothing to compare with.
  await run(async () => idx(gscData().index, 2));
  assert.equal(fs.existsSync(file), false);
  const outgoing = JSON.parse(fs.readFileSync(path.join(FULL, 'snap/index.json'), 'utf8')).pulledAt;
  await run(async () => idx(gscData().index, 3));
  const kept = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.equal(kept.index.length, 3);
  assert.deepEqual(Object.keys(kept.index[0]), ['page', 'verdict']);
  assert.equal(kept.pulledAt, outgoing, 'the outgoing snapshot time');
  // Reading every page leaves the copy exactly as the refresh left it.
  const before = fs.readFileSync(file, 'utf8');
  for (const url of Object.keys(GET_ROUTES)) await get(url);
  assert.equal(fs.readFileSync(file, 'utf8'), before);
});

test('index checks: the health page and the Pages on Google tile say how many of the live pages were checked, and when', async () => {
  useFull();
  writeSnap(FULL, 'index', {
    pages: [
      { page: '/', verdict: 'indexed', reason: '', lastCrawl: '2026-11-09', checkedAt: '2026-11-10T06:01:00.000Z' },
      {
        page: '/pricing',
        verdict: 'not-indexed',
        reason: 'Crawled',
        lastCrawl: null,
        checkedAt: '2026-11-08T06:01:00.000Z',
      },
      { page: '/blog/alpha-guide', verdict: 'unknown', reason: 'Not checked yet', lastCrawl: null, checkedAt: null },
    ],
    live: 8,
    checked: 2,
  });
  invalidate();
  const h = (await get('/api/health')).json;
  assert.equal(h.indexSummary.checked, 2);
  assert.equal(h.indexSummary.live, 8);
  assert.match(h.indexSummary.text, /2 of 8 live pages checked/);
  const pricing = h.index.find((r) => r.page === '/pricing');
  assert.equal(pricing.checkedAt, '2026-11-08T06:01:00.000Z');
  assert.equal(pricing.checkedOn, '2026-11-08');
  const tile = (await get('/api/search')).json.tiles.find((t) => t.key === 'indexed');
  assert.equal(tile.value, 1);
  assert.match(tile.note, /2 of 8 live pages checked/);
  const page = (await get('/api/pages')).json.items.find((r) => r.page === '/pricing');
  assert.equal(page.index, 'not-indexed');
  assert.equal(page.indexCheckedOn, '2026-11-08');
  // The rules read the new table: /pricing is the one not on Google now.
  const notIndexed = (await get('/api/opportunities?type=not-indexed')).json.items.map((o) => o.page);
  assert.ok(!notIndexed.includes('/blog/delta-new'));
  assert.ok((await get('/api/sources')).json.some((x) => x.source === 'index'));
});

test('competitors: days since the check, seen state and the links pulse', async () => {
  useFull();
  let c = (await get('/api/competitors')).json;
  assert.equal(c.daysSinceCheck, 9);
  assert.equal(c.stale, true);
  assert.equal(c.watch[0].host, 'rival.example');
  assert.equal(c.watch[0].seen, false);
  assert.equal(c.sitemap[0].daysSinceCheck, 9);
  assert.equal(c.linksPulse.total, 12);
  assert.match(c.reminder, /competitor-dossier\.md/);
  const w = (await get('/api/week')).json;
  const worry = w.worries.find((x) => x.kind === 'competitor-change');
  assert.ok(worry, 'the change is on the week page');
  const r = await post(`/api/item/${encodeURIComponent(worry.id)}`, { action: 'done' });
  assert.equal(r.status, 200);
  c = (await get('/api/competitors')).json;
  assert.equal(c.watch[0].seen, true);
  assert.ok(!(await get('/api/week')).json.worries.some((x) => x.kind === 'competitor-change'));
});

test('competitors: grouped events, sentinels, the dossier note, and Seen that remembers which events', async () => {
  useFull();
  const c = (await get('/api/competitors')).json;
  const rival = c.hosts.find((h) => h.host === 'rival.example');
  // The same new heading on two pages is one event; the price is its own; the counts say so.
  assert.deepEqual(rival.counts, { events: 2, pages: 3, material: 1 });
  assert.equal(rival.countText, '2 changes on 3 pages');
  const heading = rival.events.find((e) => e.kind === 'headings');
  assert.equal(heading.plain, 'New heading: "A new post"');
  assert.equal(heading.pages.length, 2);
  assert.equal(heading.material, false);
  assert.equal(rival.events.find((e) => e.kind === 'price').material, true);
  assert.equal(/h2s/.test(JSON.stringify(c.hosts)), false, 'never the raw wording');
  assert.equal(rival.loggedInDossier, true);
  assert.equal(rival.dossierLoggedOn, '2026-11-03');
  assert.equal(rival.dossierText, 'Already noted in the competitor dossier on 3 November.');
  assert.deepEqual(rival.pageLinks, [{ url: 'https://rival.example/pricing', label: '/pricing' }]);
  assert.match(rival.itemId, /^competitor-change:rival\.example:[0-9a-f]{10}$/);
  // A pricing address that never answered is a sentinel: no event, never counted.
  const quiet = c.hosts.find((h) => h.host === 'quiet.example');
  assert.deepEqual(quiet.counts, { events: 0, pages: 0, material: 0 });
  assert.deepEqual(quiet.sentinels, [{ url: null, state: 'still-missing', plain: 'Still no pricing page' }]);
  assert.equal(quiet.worry, false);
  assert.equal(c.totals.events, 2);
  assert.equal(c.worries, 1);

  // The card in the week: no test, no hypothesis, no eligibility, no Search Console, pages to open.
  const w = (await get('/api/week')).json;
  const worry = w.worries.find((x) => x.kind === 'competitor-change');
  assert.equal(worry.id, rival.itemId);
  assert.equal(worry.test, undefined);
  assert.equal(worry.hypothesis, false);
  assert.deepEqual(worry.links, { live: null, searchConsole: null });
  assert.match(worry.brief, /Read docs\/seo\/competitor-dossier\.md first/);
  assert.deepEqual(worry.competitor.pages, [{ url: 'https://rival.example/pricing', label: '/pricing' }]);
  const chosen = (await post('/api/week/top5', { ids: [worry.id] })).json;
  const card = chosen.top5[0];
  assert.equal(card.test, undefined);
  assert.equal(card.eligibility, null);
  assert.equal(card.hypothesis, false);
  assert.equal(card.links.searchConsole, null);
  assert.equal(card.typeLabel, 'Competitor change');

  // Seen hides it, and the Competitors page says so.
  assert.equal((await post(`/api/item/${encodeURIComponent(worry.id)}`, { action: 'done' })).status, 200);
  const after = (await get('/api/competitors')).json.hosts.find((h) => h.host === 'rival.example');
  assert.equal(after.seen, true);
  assert.equal(after.worry, false);
  assert.ok(!(await get('/api/week')).json.worries.some((x) => x.kind === 'competitor-change'));
  // Undo it: the card is back.
  assert.equal((await post(`/api/item/${encodeURIComponent(worry.id)}`, { action: 'reopen' })).status, 200);
  assert.ok((await get('/api/week')).json.worries.some((x) => x.kind === 'competitor-change'));
});

test('settings: preset and weights change the ranking, thresholds change what is found', async () => {
  useFull();
  const before = (await get('/api/opportunities')).json.items;
  const s0 = (await get('/api/settings')).json;
  assert.equal(s0.preset, 'balanced');
  assert.ok(s0.thresholds.every((t) => t.label && 'default' in t));
  const set = await post('/api/settings', { preset: 'ai-citations-first' });
  assert.equal(set.status, 200);
  const after = (await get('/api/opportunities')).json.items;
  assert.notDeepEqual(
    before.map((o) => o.score.total),
    after.map((o) => o.score.total)
  );
  assert.equal((await get('/api/settings')).json.preset, 'ai-citations-first');
  const custom = await post('/api/settings', {
    weights: { demand: 1, distance: 0, importance: 0, confidence: 0, effort: 0, ai: 0, outcome: 0 },
  });
  assert.equal(custom.json.preset, 'custom');
  assert.equal(custom.json.weights.demand, 1);

  assert.equal((await post('/api/settings', { preset: 'cheese' })).status, 400);
  assert.equal((await post('/api/settings', { weights: { demand: 2 } })).status, 400);
  assert.equal((await post('/api/settings', { weights: { luck: 0.5 } })).status, 400);
  assert.equal(
    (
      await post('/api/settings', {
        weights: { demand: 0, distance: 0, importance: 0, confidence: 0, effort: 0, ai: 0, outcome: 0 },
      })
    ).status,
    400
  );
  assert.equal((await post('/api/settings', { moneyPages: ['pricing'] })).status, 400);
  assert.equal((await post('/api/settings', { thresholds: { MADE_UP: 3 } })).status, 400);
  assert.equal((await post('/api/settings', { thresholds: { LOW_CTR_MIN_IMP: -1 } })).status, 400);
  const shared = await post('/api/settings', { thresholds: { NEAR_MIN_IMP: 5000 } });
  assert.equal(shared.status, 400);
  assert.match(shared.json.error, /shared with the monthly diagnose script/);

  const count = (items) => items.filter((o) => o.type === 'low-click-rate').length;
  assert.ok(count(after) >= 1);
  await post('/api/settings', { thresholds: { LOW_CTR_MIN_IMP: 5000 } });
  const high = (await get('/api/opportunities')).json.items;
  assert.equal(count(high), 0);
  const shown = (await get('/api/settings')).json.thresholds;
  assert.equal(shown.find((t) => t.key === 'LOW_CTR_MIN_IMP').overridden, true);
  assert.equal(shown.find((t) => t.key === 'LOW_CTR_MIN_IMP').adjustable, true);
  assert.equal(shown.find((t) => t.key === 'NEAR_MIN_IMP').adjustable, false);
  await post('/api/settings', { thresholds: { LOW_CTR_MIN_IMP: null }, moneyPages: ['/pricing'] });
  assert.ok(count((await get('/api/opportunities')).json.items) >= 1);
  assert.deepEqual((await get('/api/settings')).json.moneyPages, ['/pricing']);
});

test('since you last looked: compares with the copy saved at the last visit', async () => {
  useFull();
  const first = (await get('/api/week')).json;
  assert.match(first.sinceLastVisit[0], /first visit/);
  assert.equal(first.lastVisit, null);
  const v = await post('/api/visit');
  assert.equal(v.status, 200);
  assert.match(
    (await get('/api/week')).json.sinceLastVisit[0],
    /Nothing has changed since you last looked on 10 November/
  );

  // New data: impressions double, a verdict arrives, a new page is found.
  const siteDaily = gscData().siteDaily.map((r) =>
    r.date >= CUR.start ? { ...r, impressions: r.impressions * 2 } : r
  );
  const extra = [...QP_CUR, qp('brand new phrase here', '/blog/beta-notes', 60, 10)];
  writeAll(FULL, {
    gsc: gscData({ siteDaily, qpCur: extra, qp90: extra, queryCur: byQuery(extra) }),
    local: localData({
      verdicts: [VERDICT, BATCH, { ...VERDICT, slug: 'gamma-tips', url: '/blog/gamma-tips', verdict: 'better' }],
    }),
  });
  invalidate();
  const s = (await get('/api/week')).json.sinceLastVisit;
  assert.ok(s.length <= 3);
  assert.match(s[0], /1 new verdict is in on Did it work/);
  assert.ok(
    s.some((x) => /impressions for the last 28 days rose 100%/.test(x)),
    s.join(' | ')
  );
  assert.ok(s.some((x) => /new opportunit/.test(x)) || s.length === 2);
});

// ---------------------------------------------------------------- jobs

test('jobs: nothing starts without confirm:true, and the confirm text names the files', async () => {
  useFull();
  const spawned = spawner.calls.length;
  const r = await post('/api/jobs/judge', {});
  assert.equal(r.status, 400);
  assert.match(r.json.error, /docs\/seo\/change-log-verdicts\.jsonl/);
  const cites = await post('/api/jobs/citations', { confirm: false });
  assert.equal(cites.status, 400);
  assert.match(cites.json.error, /about \$0\.62/);
  assert.equal((await post('/api/jobs/nothing', { confirm: true })).status, 404);
  assert.equal((await post('/api/jobs/edit-note', { confirm: true })).status, 400);
  assert.equal(spawner.calls.length, spawned, 'no script was started');
  const list = (await get('/api/jobs')).json.jobs;
  assert.deepEqual(
    list.map((j) => j.key),
    [
      'judge-preview',
      'judge',
      'citations',
      'competitors',
      'keyword-check',
      'site-check',
      'index-all',
      'audit',
      'edit-note',
    ]
  );
  const indexAll = list.find((j) => j.key === 'index-all');
  assert.equal(indexAll.label, 'Check every page on Google now');
  assert.deepEqual(indexAll.writes, []);
  assert.equal(indexAll.cost, null);
  const judge = list.find((j) => j.key === 'judge');
  assert.deepEqual(judge.writes, ['docs/seo/change-log-verdicts.jsonl']);
  assert.equal(list.find((j) => j.key === 'judge-preview').writes.length, 0);
  assert.equal(list.find((j) => j.key === 'citations').cost, 'about $0.62');
  assert.deepEqual(list.find((j) => j.key === 'competitors').writes, [
    'docs/seo/sitemap-snapshots/',
    'docs/seo/competitor-snapshots/',
  ]);
});

test('jobs: one at a time, spawned without a shell from the repo root, progress and the output tail', async () => {
  useFull();
  const base = spawner.calls.length;
  const started = await post('/api/jobs/competitors', { confirm: true });
  assert.deepEqual(started.json, { started: true, key: 'competitors' });
  assert.equal(spawner.calls.length, base + 1);
  const c = spawner.calls[base];
  assert.equal(c.cmd, process.execPath);
  assert.deepEqual(c.args, ['scripts/competitor-sitemap-diff.mjs']);
  assert.equal(c.opts.cwd, '/fake/repo');
  assert.equal(c.opts.shell, false);

  assert.equal((await post('/api/jobs/keyword-check', { confirm: true })).status, 409, 'one at a time');
  spawner.children[base].stdout.emit('data', 'first line\nsecond ');
  spawner.children[base].stderr.emit('data', 'half\n');
  let j = (await get('/api/jobs')).json;
  assert.equal(j.running, 'competitors');
  const running = j.jobs.find((x) => x.key === 'competitors');
  assert.equal(running.running, true);
  assert.equal(running.progress.step, 1);
  assert.equal(running.progress.of, 2);
  assert.deepEqual(running.progress.tail, ['first line', 'second half']);

  spawner.children[base].emit('close', 0);
  assert.equal(spawner.calls.length, base + 2, 'the second command starts after the first');
  assert.deepEqual(spawner.calls[base + 1].args, ['scripts/competitor-page-watch.mjs']);
  spawner.children[base + 1].stdout.emit('data', 'done\n');
  spawner.children[base + 1].emit('close', 0);
  await new Promise((r) => setImmediate(r));
  j = (await get('/api/jobs')).json;
  assert.equal(j.running, null);
  const last = j.jobs.find((x) => x.key === 'competitors').last;
  assert.equal(last.ok, true);
  assert.equal(last.exitCode, 0);
  assert.deepEqual(last.tail.slice(-1), ['done']);
  assert.deepEqual(afterJobs.at(-1), ['competitors', true], 'the local source is refreshed afterwards');
  assert.equal(JSON.parse(fs.readFileSync(path.join(FULL, 'state/jobs.json'), 'utf8')).last.competitors.ok, true);
});

test('jobs: a failing command stops the job and keeps the output tail to 80 lines', async () => {
  useFull();
  const base = spawner.calls.length;
  await post('/api/jobs/site-check', { confirm: true });
  assert.equal(spawner.calls[base].cmd, 'npm');
  assert.deepEqual(spawner.calls[base].args, ['run', 'build']);
  spawner.children[base].stdout.emit('data', Array.from({ length: 200 }, (_, i) => `line ${i}`).join('\n') + '\n');
  spawner.children[base].emit('close', 2);
  await new Promise((r) => setImmediate(r));
  assert.equal(spawner.calls.length, base + 1, 'the second command never starts');
  const last = (await get('/api/jobs')).json.jobs.find((x) => x.key === 'site-check').last;
  assert.equal(last.ok, false);
  assert.equal(last.exitCode, 2);
  assert.equal(last.tail.length, 80);
  assert.equal(last.tail.at(-1), 'It stopped with exit code 2.');
  assert.equal(last.summary, 'It did not finish cleanly.', 'the plain line above the details');
  assert.equal((await get('/api/jobs')).json.running, null);
  assert.deepEqual((await get('/api/health')).json.siteCheck.last.ok, false);
});

test('jobs: the 15 minute cap stops a job that never finishes', async () => {
  const sp = fakeSpawn();
  const jobs = createJobs({ spawn: sp.spawn, repoRoot: '/fake/repo', afterJob: () => {}, timeoutMs: 20 });
  useFull();
  jobs.start('keyword-check');
  await new Promise((r) => setTimeout(r, 80));
  assert.equal(sp.children[0].killed, true);
  // Asked to stop is not stopped: the slot stays taken until the child has really exited.
  assert.equal(jobs.runningKey(), 'keyword-check');
  assert.throws(() => jobs.start('judge-preview'), /still running/);
  sp.children[0].emit('close', null);
  assert.equal(jobs.runningKey(), null);
  const last = jobs.list().find((j) => j.key === 'keyword-check').last;
  assert.equal(last.ok, false);
  assert.match(last.tail.at(-1), /Stopped after 20 ms/);
});

test('jobs: a spawn that cannot start fails the job instead of crashing', async () => {
  const jobs = createJobs({
    spawn: () => {
      throw new Error('no such file');
    },
    repoRoot: '/fake/repo',
    afterJob: () => {},
  });
  useFull();
  jobs.start('judge-preview');
  assert.equal(jobs.runningKey(), null);
  assert.equal(jobs.list().find((j) => j.key === 'judge-preview').last.ok, false);
});

// ---------------------------------------------------------------- CSV

test('CSV: a header row, quoted commas, one row per item, and no formula can run', async () => {
  useFull();
  const q = await get('/api/export/queries.csv');
  const lines = q.text.split('\r\n');
  assert.equal(
    lines[0],
    'search,impressions,clicks,position,change_percent,movement,brand,top_page,bing_impressions,date_range'
  );
  const row = lines.find((l) => l.startsWith('"dosing, timing and cost"'));
  assert.ok(row, 'a comma in the text is quoted');
  assert.match(q.headers['content-disposition'], /seo-desk-queries-2026-11-10\.csv/);
  assert.equal(lines.filter(Boolean).length, 1 + (await get('/api/search')).json.queries.length);

  const t = await get('/api/export/targets.csv');
  assert.match(t.text.split('\r\n')[0], /^target_keyword,target_page,position/);
  assert.ok(t.text.includes('wrong page'));
  const o = await get('/api/export/opportunities.csv?type=unserved');
  assert.equal(
    o.text.trim().split('\r\n').length,
    1 + (await get('/api/opportunities?type=unserved')).json.items.length
  );

  assert.equal(toCsv([['a', (r) => r.a]], [{ a: 'say "hi", now' }]), 'a\r\n"say ""hi"", now"\r\n');
  assert.equal(
    toCsv([['a', (r) => r.a]], [{ a: '=SUM(A1)' }, { a: -3 }, { a: '@x' }, { a: null }]),
    "a\r\n'=SUM(A1)\r\n-3\r\n'@x\r\n\r\n"
  );
  assert.deepEqual(parseCsv('a,b\r\n"x, y","say ""hi"""\r\n1,2'), [
    ['a', 'b'],
    ['x, y', 'say "hi"'],
    ['1', '2'],
  ]);
});

// ---------------------------------------------------------------- safety

test('every method that changes something gets the host and origin checks', async () => {
  useFull();
  const json = { 'content-type': 'application/json' };
  for (const [method, url, body] of [
    ['POST', '/api/visit', {}],
    ['PUT', '/api/annotations/abc', { text: 'x' }],
    ['DELETE', '/api/annotations/abc', undefined],
  ]) {
    const foreign = await call(method, url, body, { ...json, origin: 'http://evil.test' });
    assert.equal(foreign.status, 403, `${method} with a foreign origin`);
    const site = await call(method, url, body, { ...json, 'sec-fetch-site': 'cross-site' });
    assert.equal(site.status, 403, `${method} from another site`);
    const host = await call(method, url, body, { ...json, host: 'evil.test' });
    assert.equal(host.status, 403, `${method} with a foreign host`);
  }
  assert.equal((await call('GET', '/api/week', undefined, { host: 'evil.test' })).status, 403);
});

test('ids that name object properties are not items, and not presets', async () => {
  useFull();
  for (const id of ['constructor', 'toString', '__proto__', 'hasOwnProperty']) {
    assert.equal((await post(`/api/item/${id}`, { action: 'start' })).status, 404, id);
  }
  assert.equal((await post('/api/settings', { preset: 'constructor' })).status, 400);
  assert.equal((await post('/api/settings', { preset: 'toString', weights: { demand: 1 } })).status, 400);
  assert.equal((await get('/api/settings')).json.preset, 'balanced');
});

test('a JSON body that is not an object is a 400 on every POST and PUT route', async () => {
  useFull();
  const routes = [
    ['POST', '/api/item/anything'],
    ['POST', '/api/week/top5'],
    ['POST', '/api/week/lock'],
    ['POST', '/api/week/unlock'],
    ['POST', '/api/annotations'],
    ['PUT', '/api/annotations/abc'],
    ['POST', '/api/settings'],
    ['POST', '/api/visit'],
    ['POST', '/api/edit-note'],
    ['POST', '/api/jobs/judge'],
  ];
  for (const [method, url] of routes) {
    for (const body of ['null', '[]', '"text"', '7']) {
      const r = await call(method, url, body, { 'content-type': 'application/json' });
      assert.equal(r.status, 400, `${method} ${url} with ${body}`);
      assert.match(r.json.error, /JSON object/);
    }
  }
  assert.equal(fs.existsSync(path.join(FULL, 'state/visit.json')), false, 'nothing was saved');
});

test('an edit note needs a known page, one line of at most 500 characters', async () => {
  useFull();
  const file = path.join(REPO, 'docs/seo/change-log-notes.jsonl');
  const before = fs.readFileSync(file, 'utf8');
  const unknown = await post('/api/edit-note', { page: '/blog/not-a-page', text: 'x', confirm: true });
  assert.equal(unknown.status, 400);
  assert.match(unknown.json.error, /not a live page or a page in your keyword file/);
  assert.equal((await post('/api/edit-note', { page: '/blog/..%2Fetc', text: 'x', confirm: true })).status, 400);
  const long = await post('/api/edit-note', { page: '/pricing', text: 'a'.repeat(501), confirm: true });
  assert.equal(long.status, 400);
  assert.match(long.json.error, /500 characters/);
  assert.equal(fs.readFileSync(file, 'utf8'), before, 'nothing written for a refused note');

  const ok = await post('/api/edit-note', {
    page: '/pricing/',
    text: `  Rewrote the intro.\n\nAdded a table\r\n\tand a link ${'b'.repeat(40)}  `,
    confirm: true,
  });
  assert.equal(ok.status, 200);
  const lines = fs.readFileSync(file, 'utf8').trim().split('\n');
  assert.equal(lines.length, 2, 'exactly one new line');
  const note = JSON.parse(lines[1]);
  assert.equal(note.slug, '/pricing');
  assert.equal(note.text, `Edit: Rewrote the intro. Added a table and a link ${'b'.repeat(40)}`);
  assert.ok(!/[\n\r\t]/.test(note.text));
  const edge = await post('/api/edit-note', { page: '/pricing', text: 'c'.repeat(500), confirm: true, override: true });
  assert.equal(edge.status, 200, '500 characters is allowed');
});

test('the page click rate gate and its note follow the click rate setting', async () => {
  useFull();
  let s = (await get('/api/search')).json;
  assert.equal(
    s.pages.find((p) => p.page === '/blog/epsilon-old').ctr,
    null,
    '168 impressions is under the default 200'
  );
  assert.match(s.notes[0], /above 200 impressions/);
  await post('/api/settings', { thresholds: { LOW_CTR_MIN_IMP: 100 } });
  s = (await get('/api/search')).json;
  assert.equal(s.pages.find((p) => p.page === '/blog/epsilon-old').ctr, 0, '168 is now over the gate');
  assert.match(s.notes[0], /above 100 impressions/);
  await post('/api/settings', { thresholds: { LOW_CTR_MIN_IMP: 1000 } });
  s = (await get('/api/search')).json;
  assert.equal(s.pages.find((p) => p.page === '/blog/alpha-guide').ctr, null, '840 is now under the gate');
  assert.match(s.notes[0], /above 1,000 impressions/);
});

test('search notes: the 7 day range says the Searches list is 28 days, brand clicks are a floor', async () => {
  useFull();
  const week = (await get('/api/search?range=7')).json;
  assert.ok(week.notes.some((n) => /Searches list covers the 28 day period 11 October to 7 November/.test(n)));
  assert.match(week.brandSplit.clicksNote, /floor/);
  assert.equal(week.brandSplit.brand.impressions, 30, 'the existing numbers are unchanged');
  const month = (await get('/api/search?range=28')).json;
  assert.ok(!month.notes.some((n) => /Searches list covers/.test(n)));
});

test('the freeze and the Pages list agree on a plan row that only has a judged from date', async () => {
  useFull();
  const plan = localData().plan;
  const row = { ...plan.improve[0], done: true, doneDate: null, judgeFrom: '2026-11-25' };
  writeAll(FULL, { local: localData({ plan: { ...plan, improve: [row] } }) });
  invalidate();
  const page = '/critical-access-hospital-scheduling';
  const frozen = (await get('/api/results')).json.frozen.find((f) => f.page === page);
  const listed = (await get('/api/pages')).json.items.find((p) => p.page === page);
  const detail = (await get(`/api/page?path=${page}`)).json;
  assert.equal(frozen.since, '2026-10-26', 'judged from 25 November, counted back 30 days');
  assert.equal(frozen.until, '2026-11-23');
  assert.equal(listed.lastEdit, frozen.since);
  assert.equal(listed.frozenUntil, frozen.until);
  assert.equal(detail.lastEdit, frozen.since);
  // And the one enumerator that both read gives the same date.
  const edits = deliberateEdits({ plan: { improve: [row] } });
  assert.deepEqual(
    edits.map((e) => [e.page, e.date]),
    [[page, '2026-10-26']]
  );
  assert.equal(frozenPages({ plan: { improve: [row] }, today: '2026-11-10' }).get(page).since, edits[0].date);
  // The same page marked done in the desk, with a manual note and a plan date, lists every date.
  const all = deliberateEdits({
    items: { x: { status: 'done', doneAt: '2026-11-02', page: '/pricing', isPageEdit: true } },
    plan: {
      improve: [
        { page: '/how-it-works', done: true, doneDate: '2026-10-30' },
        { page: '/open', done: false, judgeFrom: '2026-11-25' },
      ],
    },
    edits: [
      { page: '/about', date: '2026-11-04', kind: 'manual', subject: ' edit: new intro' },
      { page: '/about', date: '2026-11-05', kind: 'manual', subject: 'IndexNow resubmit' },
      { page: '/blog/x', date: '2026-11-06', kind: 'edit', subject: 'chore: sweep' },
    ],
  });
  assert.deepEqual(
    all.map((e) => [e.page, e.date]),
    [
      ['/pricing', '2026-11-02'],
      ['/how-it-works', '2026-10-30'],
      ['/about', '2026-11-04'],
    ]
  );
});

test('the desk day is the local calendar date', async () => {
  useFull();
  const saved = process.env.SEO_DESK_TODAY;
  delete process.env.SEO_DESK_TODAY;
  try {
    invalidate();
    const now = new Date();
    const p = (n) => String(n).padStart(2, '0');
    const local = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
    assert.equal(buildModel().today, local);
    const w = (await get('/api/week')).json;
    assert.equal(w.weekOf, mondayOf(local));
    // A Done made now is stamped with that local day.
    const o = (await get('/api/opportunities?type=unserved')).json.items[0];
    const done = await post(`/api/item/${o.id}`, { action: 'done' });
    assert.equal(done.json.item.doneAt, local);
    // The windows still end three days before it, on the Search Console dates in the snapshot.
    assert.equal(buildModel().range.end, THROUGH);
  } finally {
    process.env.SEO_DESK_TODAY = saved;
    invalidate();
  }
});

test('every worry carries a brief and a test, with or without an opportunity behind it', async () => {
  useFull();
  const w = (await get('/api/week')).json;
  assert.ok(w.worries.length >= 2);
  assert.ok(
    w.worries.some((x) => x.oppId),
    'one backed by an opportunity'
  );
  assert.ok(
    w.worries.some((x) => !x.oppId),
    'one with none'
  );
  for (const x of w.worries) {
    assert.match(x.brief, /^Task for the SimpleScheduleAI website:/, x.id);
    assert.ok(x.brief.includes(x.measured), x.id);
    if (x.kind === 'competitor-change') {
      // Reading a page is not a hypothesis, so there is no test line.
      assert.equal(x.test, undefined, x.id);
      assert.ok(!/[\u2013\u2014]/.test(x.brief));
      continue;
    }
    assert.match(x.test, /next daily refresh/, x.id);
    assert.ok(!/[\u2013\u2014]/.test(x.brief + x.test));
  }
});

test('top five cards carry a score and a plain type label', async () => {
  useFull();
  const w = (await get('/api/week')).json;
  const bySlot = Object.fromEntries(w.top5.map((c) => [c.slot, c]));
  assert.equal(bySlot['new-post'].typeLabel, 'New post');
  assert.equal(bySlot['new-post'].score, null);
  assert.equal(bySlot.verdict.typeLabel, 'Verdict');
  assert.equal(bySlot.verdict.score, null);
  assert.equal(bySlot['page-edit'].typeLabel, 'Live page improvement');
  const worry = w.top5.find((c) => c.slot === 'worry');
  assert.equal(worry.typeLabel, 'Bing crawl problem');
  assert.equal(worry.score, null);
  // A card made from an opportunity carries that opportunity's own score and label.
  const opp = w.opportunities[0];
  const ids = [`opp:${opp.id}`];
  const chosen = (await post('/api/week/top5', { ids })).json;
  assert.equal(chosen.top5[0].typeLabel, opp.typeLabel);
  assert.deepEqual(chosen.top5[0].score, opp.score);
  assert.equal(chosen.top5[0].score.parts.length, 7);
  for (const c of w.top5) assert.ok('score' in c && typeof c.typeLabel === 'string' && c.typeLabel, c.id);
});

test('the top five cannot hold more than one live page edit', async () => {
  useFull();
  const items = (await get('/api/opportunities')).json.items;
  const edits = items.filter((o) => o.isPageEdit);
  assert.ok(edits.length >= 2);
  const two = await post('/api/week/top5', { ids: [`opp:${edits[0].id}`, `opp:${edits[1].id}`] });
  assert.equal(two.status, 400);
  assert.match(two.json.error, /one live page edit a week/);
  // A page edit together with a plan post, an opportunity that is not an edit, and a worry is fine.
  const w = (await get('/api/week')).json;
  const other = items.find((o) => !o.isPageEdit);
  const ok = await post('/api/week/top5', {
    ids: [`opp:${edits[0].id}`, `opp:${other.id}`, w.top5[0].id, w.top5[3].id],
  });
  assert.equal(ok.status, 200);
  assert.equal((await post('/api/week/top5', { ids: [`opp:${other.id}`, `opp:${other.id}`] })).status, 400, 'twice');
  // The refusal saved nothing: the last good choice is still the plan.
  assert.equal((await get('/api/week')).json.top5.length, 4);
});

test('an engine gap says which way round it is, and its tab stays neutral', async () => {
  useFull();
  const r = (await get('/api/opportunities?type=engine-gap')).json;
  const label = (q) => r.items.find((o) => (o.query ?? '').includes(q)).typeLabel;
  assert.equal(label('bing only phrase'), 'On Bing, not on Google');
  assert.equal(label('pricing target phrase'), 'On Google, not on Bing');
  assert.equal(r.types.find((t) => t.type === 'engine-gap').label, 'Google and Bing differ');
  assert.ok(!r.types.some((t) => /Bing sees it/.test(t.label)));
  const csv = (await get('/api/export/opportunities.csv?type=engine-gap')).text;
  assert.ok(csv.includes('On Bing, not on Google') && csv.includes('On Google, not on Bing'));
  // Once marked, the direction survives the rules no longer finding the item.
  const bing = r.items.find((o) => o.typeLabel === 'On Bing, not on Google');
  await post(`/api/item/${bing.id}`, { action: 'ignore', reason: 'not now' });
  writeAll(FULL, { gsc: gscData({ queryCur: [], qpCur: [] }) });
  invalidate();
  const gone = (await get('/api/opportunities?status=ignored')).json.items.find((o) => o.id === bing.id);
  assert.equal(gone.typeLabel, 'On Bing, not on Google');
});

test('the model is built once and reused until a snapshot or a state file changes', async () => {
  useFull();
  const a = buildModel();
  assert.equal(buildModel(), a, 'same object while nothing changed');
  await get('/api/week');
  await get('/api/opportunities');
  assert.equal(buildModel(), a, 'routes do not rebuild it');
  writeAll(FULL);
  assert.notEqual(buildModel(), a, 'a new snapshot rebuilds it');
  const b = buildModel();
  await post('/api/visit');
  assert.notEqual(buildModel(), b, 'a state change rebuilds it');
});

// ---------------------------------------------------------------- final fix wave

const addNote = (note) =>
  fs.appendFileSync(
    path.join(REPO, 'docs/seo/change-log-notes.jsonl'),
    `${JSON.stringify({ source: 'manual', ...note })}\n`
  );

test('every id on the week page is accepted by the item route and by the five', async () => {
  useFull();
  const w = (await get('/api/week')).json;
  const ids = [...w.top5.map((c) => c.id), ...w.opportunities.map((o) => o.id), ...w.worries.map((x) => x.id)];
  assert.ok(
    w.worries.some((x) => x.kind === 'slipping-page'),
    'the fixture has a slipping worry'
  );
  for (const id of ids) {
    const r = await post(`/api/item/${encodeURIComponent(id)}`, { action: 'note', text: 'checked' });
    assert.equal(r.status, 200, `note on ${id}: ${r.json?.error}`);
    const t = await post('/api/week/top5', { ids: [id] });
    assert.equal(t.status, 200, `five with ${id}: ${t.json?.error}`);
  }
  // A slipping worry is the same card as its opportunity, so its state is read under that id.
  const slip = (await get('/api/week')).json.worries.find((x) => x.kind === 'slipping-page');
  assert.match(slip.id, /^opp:/);
  assert.ok(slip.state.notes.length >= 1 && slip.state.notes.every((n) => n.text === 'checked'));
});

test('a frozen page edit is refused by the five, with the date', async () => {
  useFull();
  addNote({ date: '2026-11-02', slug: '/pricing', text: 'Edit: new pricing table' });
  invalidate();
  const low = (await get('/api/opportunities?type=low-click-rate')).json.items.find((o) => o.page === '/pricing');
  const r = await post('/api/week/top5', { ids: [`opp:${low.id}`] });
  assert.equal(r.status, 400);
  assert.match(r.json.error, /2 November/);
  assert.match(r.json.error, /30 November/);
});

test('once a page edit is dated this week, the slot says so and no page edit can be chosen', async () => {
  useFull();
  addNote({ date: '2026-11-09', slug: '/pricing', text: 'Edit: new pricing table' });
  invalidate();
  const w = (await get('/api/week')).json;
  const slot = w.top5.find((c) => c.slot === 'page-edit');
  assert.equal(slot.title, "This week's page edit is done");
  assert.equal(slot.readOnly, true);
  assert.equal(w.top5.filter((c) => c.isPageEdit).length, 0);
  const edit = (await get('/api/opportunities')).json.items.find((o) => o.isPageEdit && o.page !== '/pricing');
  const r = await post('/api/week/top5', { ids: [`opp:${edit.id}`] });
  assert.equal(r.status, 400);
  assert.match(r.json.error, /9 November/);
});

test('Done on a frozen page needs an override, and the override restarts the 28 days', async () => {
  useFull();
  addNote({ date: '2026-11-02', slug: '/pricing', text: 'Edit: new pricing table' });
  invalidate();
  const low = (await get('/api/opportunities?type=low-click-rate')).json.items.find((o) => o.page === '/pricing');
  const refused = await post(`/api/item/${low.id}`, { action: 'done' });
  assert.equal(refused.status, 409);
  assert.match(refused.json.error, /2 November/);
  assert.match(refused.json.error, /30 November/);
  assert.match(refused.json.error, /restarts the 28 days/);
  assert.deepEqual(refused.json.frozen, {
    page: '/pricing',
    since: '2026-11-02',
    until: '2026-11-30',
    sinceText: '2 November',
    untilText: '30 November',
  });
  assert.equal((await get('/api/opportunities')).json.items.find((o) => o.id === low.id).status, 'new');
  const ok = await post(`/api/item/${low.id}`, { action: 'done', override: true });
  assert.equal(ok.status, 200);
  assert.equal(ok.json.freeze.until, '2026-12-08');
  const frozen = (await get('/api/results')).json.frozen.find((f) => f.page === '/pricing');
  assert.equal(frozen.until, '2026-12-08');
});

test('snooze and ignore on a done item are refused; reopen is allowed', async () => {
  useFull();
  const low = (await get('/api/opportunities?type=low-click-rate')).json.items[0];
  assert.equal((await post(`/api/item/${low.id}`, { action: 'done' })).status, 200);
  assert.equal((await post(`/api/item/${low.id}`, { action: 'snooze', until: '2026-12-01' })).status, 409);
  assert.equal((await post(`/api/item/${low.id}`, { action: 'ignore', reason: 'x' })).status, 409);
  assert.equal(
    (await get('/api/results')).json.frozen.some((f) => f.page === low.page),
    true,
    'still frozen'
  );
  assert.equal((await post(`/api/item/${low.id}`, { action: 'reopen' })).status, 200);
});

test('a plan card reminder asks for the Done date in the row, and a ticked row with no date freezes from first seen', async () => {
  useFull();
  const w = (await get('/api/week')).json;
  const card = w.top5.find((c) => c.slot === 'new-post');
  const r = await post(`/api/item/${encodeURIComponent(card.id)}`, { action: 'done' });
  assert.match(r.json.reminder, /write "Done YYYY-MM-DD" in the row's last cell and tick it/);

  reset(FULL);
  const plan = localData().plan;
  writeAll(FULL, {
    local: localData({
      plan: {
        ...plan,
        improve: [{ page: '/pricing', done: true, doneDate: null, judgeFrom: null, search: 's', todo: 'Did it' }],
      },
    }),
  });
  fs.mkdirSync(path.join(FULL, 'state'), { recursive: true });
  fs.writeFileSync(
    path.join(FULL, 'state/plan-ticks.json'),
    JSON.stringify({ 'docs/seo/next-15-blogs-2026-11.md|/pricing': '2026-11-02' })
  );
  invalidate();
  const frozen = (await get('/api/results')).json.frozen.find((f) => f.page === '/pricing');
  assert.equal(frozen.since, '2026-11-02');
  assert.equal(frozen.until, '2026-11-30');
});

test('the week counts open opportunities', async () => {
  useFull();
  const w = (await get('/api/week')).json;
  const all = (await get('/api/opportunities')).json;
  const open = all.items.filter((o) => ['new', 'in-progress', 'came-back'].includes(o.status)).length;
  assert.equal(w.counts.openOpportunities, open);
  assert.ok(open > 0);
});

test('manual notes are read once, and article verdicts and due edits point at /articles', async () => {
  useFull();
  const local = localData({
    livePages: [...LIVE, { page: '/articles/news-piece', lastmod: '2026-10-01' }],
    verdicts: [
      { ...VERDICT, slug: 'news-piece', url: undefined },
      { ...BATCH, pages: ['alpha-guide', 'news-piece'] },
    ],
    due: [{ date: '2026-10-05', slug: 'news-piece', kind: 'edit', commits: [], notes: [], overlapping: false }],
    edits: [
      ...localData().edits,
      { page: '/blog/alpha-guide', date: '2026-11-01', kind: 'manual', subject: 'IndexNow resubmit after review.' },
    ],
  });
  writeAll(FULL, { local });
  invalidate();
  assert.equal(buildModel().edits.filter((e) => e.kind === 'manual').length, 1);
  const res = (await get('/api/results')).json;
  assert.equal(res.verdicts.find((v) => v.slug === 'news-piece').page, '/articles/news-piece');
  assert.deepEqual(res.verdicts.find((v) => v.batch).pages, ['/blog/alpha-guide', '/articles/news-piece']);
  assert.equal(res.due[0].page, '/articles/news-piece');
});

// ---------------------------------------------------------------- jobs, site check, AI crawlers

const { parseHygiene } = await import('../lib/api/site-check.mjs');
const { runIndexAll } = await import('../lib/jobs.mjs');

const HYGIENE = [
  '> build output line',
  '========================================================================',
  'SITE HYGIENE AUDIT',
  '========================================================================',
  'Pages scanned: 12',
  '',
  '--- SUMMARY ---',
  'FAIL: broken internal links       1',
  '',
  '--- FAIL: broken internal links ---',
  '  /blog/alpha-guide  ->  /blog/missing',
  '',
  '--- FAIL: duplicate <title> ---',
  '  "Same title"',
  '    - /pricing',
  '    - /blog/beta-notes',
  '',
  '--- FAIL: missing/empty title or description ---',
  '  /blog/gamma-tips: missing/empty meta description',
  '',
  '--- WARN: orphan pages (indexable, zero inbound internal links) ---',
  '  /blog/epsilon-old',
  '',
  '--- WARN: titles > 60 chars (1 total, showing 5 worst) ---',
  '  [72] /blog/alpha-guide: "A very long title"',
  '',
  '--- WARN: something new the desk does not know ---',
  '  /x',
  '',
  'RESULT: FAIL (3 failing check group(s))',
];

test('parseHygiene turns the site check output into issues, and keeps what it cannot read', () => {
  const { issues, unparsed } = parseHygiene(HYGIENE);
  const by = (id) => issues.find((i) => i.id === id);
  assert.equal(by('site:broken-links').severity, 'fail');
  assert.deepEqual(by('site:broken-links').urls, [{ page: '/blog/alpha-guide', detail: 'links to /blog/missing' }]);
  assert.deepEqual(
    by('site:duplicate-titles').urls.map((u) => u.page),
    ['/pricing', '/blog/beta-notes']
  );
  assert.match(by('site:duplicate-titles').urls[0].detail, /Same title/);
  assert.equal(by('site:missing-meta').urls[0].page, '/blog/gamma-tips');
  assert.equal(by('site:orphans').severity, 'warn');
  assert.equal(by('site:long-titles').urls[0].detail, '72 characters');
  for (const i of issues) {
    for (const k of ['what', 'why', 'fix']) assert.ok(i[k] && !/[–—]/.test(i[k]), `${i.id} ${k}`);
  }
  assert.ok(unparsed.includes('--- WARN: something new the desk does not know ---'));
  assert.ok(unparsed.includes('  /x'));
  assert.ok(!unparsed.includes('Pages scanned: 12'), 'the known header lines are not unparsed');
});

test('site health: the last site check becomes issues sorted by clicks, with the raw output kept', async () => {
  useFull();
  fs.mkdirSync(path.join(FULL, 'state'), { recursive: true });
  fs.writeFileSync(
    path.join(FULL, 'state/jobs.json'),
    JSON.stringify({
      last: {
        'site-check': {
          at: '2026-11-09T10:00:00.000Z',
          ok: false,
          exitCode: 1,
          durationSec: 120,
          summary: 'It did not finish cleanly.',
          tail: HYGIENE.slice(-10),
          output: HYGIENE,
        },
      },
    })
  );
  invalidate();
  const h = (await get('/api/health')).json;
  assert.equal(h.siteCheck.issues, 5, 'five issues the desk could read');
  assert.deepEqual(h.siteCheck.output, HYGIENE);
  assert.ok(h.siteCheck.unparsed.includes('  /x'));
  const site = h.issues.filter((i) => i.source === 'site-check');
  assert.equal(site.length, 5);
  assert.ok(
    h.issues.every((i, n, all) => n === 0 || all[n - 1].clicks >= i.clicks),
    'most clicks first'
  );
  const broken = site.find((i) => i.id === 'site:broken-links');
  assert.equal(broken.urls[0].clicks, 28, 'alpha gets one click a day in the fixture');
});

test('site health: each AI crawler says Allowed, Blocked or Not checked yet', async () => {
  useFull();
  let h = (await get('/api/health')).json;
  assert.equal(h.aiCrawlers.checked, false);
  assert.ok(h.aiCrawlers.crawlers.every((c) => c.status === 'Not checked yet'));
  writeAll(FULL, {
    local: localData({
      robots: {
        ok: true,
        checkedAt: '2026-11-10T06:00:00.000Z',
        error: null,
        crawlers: [
          { agent: 'GPTBot', allowed: false },
          { agent: 'ClaudeBot', allowed: true },
        ],
      },
    }),
  });
  invalidate();
  h = (await get('/api/health')).json;
  assert.equal(h.aiCrawlers.checked, true);
  assert.equal(h.aiCrawlers.checkedOn, '2026-11-10');
  const st = Object.fromEntries(h.aiCrawlers.crawlers.map((c) => [c.agent, c.status]));
  assert.equal(st.GPTBot, 'Blocked');
  assert.equal(st.ClaudeBot, 'Allowed');
  assert.equal(st.CCBot, 'Not checked yet');
});

test('a warning on the health page is one plain line, with the raw text kept as details', async () => {
  useFull();
  const model = buildModel();
  model.warnings.push('The opportunity rules failed: TypeError: x is not a function\n    at y (z.js:1:1)');
  const h = (await import('../lib/api/panels.mjs')).healthView(model);
  const w = h.issues.find((i) => i.id.startsWith('warn:'));
  assert.equal(w.what, 'One of the desk checks did not finish.');
  assert.match(w.details[0], /TypeError/);
  model.warnings.length = 0;
});

test('the site check keeps the whole output of its last step, not only the tail', async () => {
  const sp = fakeSpawn();
  const jobs = createJobs({ spawn: sp.spawn, repoRoot: '/fake/repo', afterJob: () => {} });
  useFull();
  jobs.start('site-check');
  sp.children[0].stdout.emit('data', 'built\n');
  sp.children[0].emit('close', 0);
  sp.children[1].stdout.emit('data', Array.from({ length: 300 }, (_, i) => `hygiene ${i}`).join('\n') + '\n');
  sp.children[1].emit('close', 0);
  const last = jobs.list().find((j) => j.key === 'site-check').last;
  assert.equal(last.ok, true);
  assert.equal(last.output.length, 300);
  assert.equal(last.output[0], 'hygiene 0');
  assert.equal(last.tail.length, 80);
  assert.match(last.summary, /^Finished in/);
});

test('the index-all job runs the index checks again and again until every page has a fresh answer', async () => {
  useFull();
  const sp = fakeSpawn();
  const runs = [];
  const jobs = createJobs({
    spawn: sp.spawn,
    repoRoot: '/fake/repo',
    afterJob: () => {},
    indexAll: async ({ log }) => {
      runs.push('ran');
      log('Round 1: 40 of 100 pages checked since this started.');
      log('Every live page has a fresh answer.');
      return { ok: true, note: 'Every live page has a fresh answer.' };
    },
  });
  jobs.start('index-all');
  assert.equal(jobs.runningKey(), 'index-all');
  await new Promise((r) => setTimeout(r, 10));
  assert.equal(sp.calls.length, 0, 'no script is started');
  const last = jobs.list().find((j) => j.key === 'index-all').last;
  assert.equal(last.ok, true);
  assert.equal(last.summary, 'Every live page has a fresh answer.');
  assert.deepEqual(last.tail, [
    'Round 1: 40 of 100 pages checked since this started.',
    'Every live page has a fresh answer.',
  ]);

  // The loop itself: rounds until everything was checked after the start, then stops.
  let checkedRounds = 0;
  const pages = (n) =>
    Array.from({ length: 100 }, (_, i) => ({
      page: `/p${i}`,
      checkedAt: i < n ? new Date(Date.now() + 1000).toISOString() : null,
    }));
  const lines = [];
  const out = await runIndexAll({
    log: (l) => lines.push(l),
    signal: new AbortController().signal,
    refresh: async () => {
      checkedRounds += 1;
      return { results: { index: 'fresh' } };
    },
    readSnap: () => ({ error: null, data: { pages: pages(Math.min(100, checkedRounds * 40)) } }),
  });
  assert.equal(out.ok, true);
  assert.equal(checkedRounds, 3);
  assert.match(lines[0], /40 of 100/);

  // A quota stop ends the job with a plain reason.
  const stopped = await runIndexAll({
    log: () => {},
    signal: new AbortController().signal,
    refresh: async () => ({ results: { index: 'fresh' } }),
    readSnap: () => ({
      error: 'Search Console said its daily inspection quota is used up after 10 pages.',
      data: { pages: pages(0) },
    }),
  });
  assert.equal(stopped.ok, false);
  assert.match(stopped.note, /quota/);
});

// ---------------------------------------------------------------- the route table and chart markers

test('route table: no extension route copies a core route; the two export CSVs a core pattern also matches resolve to the extension', async () => {
  const { routes, extRoutes } = await import('../lib/api.mjs');
  const { coreRoutes } = await import('../server.mjs');
  const core = [...makeRoutes({ jobs: createJobs({ spawn: spawner.spawn, repoRoot: '/fake/repo' }) }), ...coreRoutes()];
  const ext = new Set(extRoutes);
  // The same order the server uses: extensions, then the api's own routes, then the server's.
  const table = [...routes, ...coreRoutes()];
  const asRe = (p) =>
    p instanceof RegExp
      ? p
      : new RegExp(`^${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\:[a-zA-Z]+|:[a-zA-Z]+/g, '[^/]+')}$`);
  const firstFor = (method, p) => table.find((r) => r.method === method && asRe(r.path).test(p));
  const shadowed = [];
  for (const r of extRoutes) {
    if (typeof r.path !== 'string') continue;
    for (const c of core) {
      if (c.method !== r.method) continue;
      if (typeof c.path === 'string' && c.path === r.path) shadowed.push(`${r.method} ${r.path} copies a core route`);
      if (c.path instanceof RegExp && !r.path.includes(':') && c.path.test(r.path)) shadowed.push(r.path);
    }
  }
  assert.deepEqual(shadowed.sort(), ['/api/export/audit.csv', '/api/export/topics.csv']);
  for (const p of ['/api/export/audit.csv', '/api/export/topics.csv'])
    assert.ok(ext.has(firstFor('GET', p)), `${p} must reach the extension, not the core export`);
  // Every other extension address reaches its own route first too.
  for (const r of extRoutes) {
    if (typeof r.path !== 'string' || r.path.includes(':')) continue;
    assert.equal(firstFor(r.method, r.path), r, `${r.method} ${r.path}`);
  }
});

test('chart markers: every kind the API can send has a label', async () => {
  const { MARKER_LABEL, markerText } = await import('../static/views/markers.js');
  // From the source: every kind timelineEvents and googleUpdateMarkers put on a marker.
  const src = fs.readFileSync(new URL('../lib/api/work.mjs', import.meta.url), 'utf8');
  const body = src.slice(
    src.indexOf('export function googleUpdateMarkers'),
    src.indexOf('// ---------------------------------------------------------------- deliberate edits')
  );
  const kinds = new Set([...body.matchAll(/kind: '([a-z-]+)'/g)].map((m) => m[1]));
  assert.ok(kinds.size >= 5, [...kinds].join(', '));
  for (const k of kinds) assert.ok(MARKER_LABEL[k], `no label for ${k}`);

  // And from a live reply holding one of each.
  useFull();
  writeSnap(
    FULL,
    'local',
    localData({ googleUpdates: [{ kind: 'ranking', title: 'Invented core update', start: '2026-10-20', end: null }] })
  );
  fs.mkdirSync(path.join(FULL, 'state'), { recursive: true });
  fs.writeFileSync(
    path.join(FULL, 'state/annotations.json'),
    JSON.stringify([{ id: 'a1', date: '2026-10-25', title: 'Invented note', text: 'Invented note' }])
  );
  invalidate();
  const r = (await get('/api/results')).json;
  const seen = new Set(r.timeline.map((m) => m.kind));
  for (const k of ['publish', 'edit', 'note', 'annotation', 'google-update']) assert.ok(seen.has(k), k);
  for (const m of r.timeline) {
    assert.ok(MARKER_LABEL[m.kind], m.kind);
    assert.doesNotMatch(markerText(m), /^: /);
  }
  assert.equal(
    markerText({ kind: 'google-update', label: 'Invented core update' }),
    'Google update: Invented core update'
  );
  const s = (await get('/api/search')).json;
  assert.ok(s.markers.some((m) => m.kind === 'google-update'));
});

// ---------------------------------------------------------------- one page edit a week, by any route

test('a second page edit marked done in the same week needs an override, and says when the first one was', async () => {
  useFull();
  const list = (await get('/api/opportunities')).json.items;
  const edits = list.filter((o) => o.isPageEdit && o.eligibility.eligible);
  const first = edits[0];
  const second = edits.find((o) => o.page !== first.page);
  assert.ok(first && second, 'two page edits on different pages');
  const notEdit = list.find((o) => !o.isPageEdit);

  assert.equal((await post(`/api/item/${first.id}`, { action: 'done' })).status, 200);
  const refused = await post(`/api/item/${second.id}`, { action: 'done' });
  assert.equal(refused.status, 409);
  assert.deepEqual(refused.json.secondThisWeek, {
    page: first.page,
    date: '2026-11-10',
    dateText: '10 November',
  });
  assert.match(refused.json.error, /You already made this week's page edit on 10 November/);
  assert.equal((await get('/api/opportunities')).json.items.find((o) => o.id === second.id).status, 'new');
  // Something that is not a page edit is never held back.
  if (notEdit) assert.equal((await post(`/api/item/${notEdit.id}`, { action: 'done' })).status, 200);
  const forced = await post(`/api/item/${second.id}`, { action: 'done', override: true });
  assert.equal(forced.status, 200);
  assert.equal(forced.json.item.status, 'done');
});

test('the edit note: a frozen page or a second edit this week needs an override; nothing is written without it', async () => {
  useFull();
  const notes = path.join(REPO, 'docs/seo/change-log-notes.jsonl');
  const lines = () => fs.readFileSync(notes, 'utf8').trim().split('\n').length;
  const start = lines();
  const ok = await post('/api/edit-note', { confirm: true, page: '/blog/beta-notes', text: 'Rewrote the intro.' });
  assert.equal(ok.status, 200);
  assert.equal(lines(), start + 1);

  // The same page again: it is frozen now.
  const frozen = await post('/api/edit-note', { confirm: true, page: '/blog/beta-notes', text: 'Another change.' });
  assert.equal(frozen.status, 409);
  assert.equal(frozen.json.frozen.page, '/blog/beta-notes');
  assert.equal(frozen.json.frozen.untilText, '8 December');
  assert.equal(lines(), start + 1, 'nothing written');

  // Another page in the same week: the rule is one a week.
  const second = await post('/api/edit-note', { confirm: true, page: '/blog/gamma-tips', text: 'New section.' });
  assert.equal(second.status, 409);
  assert.equal(second.json.secondThisWeek.page, '/blog/beta-notes');
  assert.equal(second.json.secondThisWeek.dateText, '10 November');
  assert.equal(lines(), start + 1, 'nothing written');

  const forced = await post('/api/edit-note', {
    confirm: true,
    page: '/blog/gamma-tips',
    text: 'New section.',
    override: true,
  });
  assert.equal(forced.status, 200);
  assert.equal(lines(), start + 2);
});

test('a locked five refreshes its page edit card when the week edit was dated by another route', async () => {
  useFull();
  const w = (await get('/api/week')).json;
  const card = w.top5.find((c) => c.slot === 'page-edit');
  assert.ok(card && card.eligibility.eligible);
  assert.equal((await post('/api/week/lock', {})).status, 200);
  // The week's one edit goes in through the edit note on another page.
  const other = LIVE.map((p) => p.page).find((p) => p !== card.page && p.startsWith('/blog/'));
  assert.equal((await post('/api/edit-note', { confirm: true, page: other, text: 'Changed the title.' })).status, 200);
  const after = (await get('/api/week')).json;
  assert.equal(after.locked, true);
  const same = after.top5.find((c) => c.id === card.id);
  assert.equal(same.eligibility.eligible, false);
  assert.match(same.eligibility.text, /This week's page edit is done/);
  assert.equal(same.weekEditDone.page, other);
  assert.equal(same.weekEditDone.dateText, '10 November');
});
