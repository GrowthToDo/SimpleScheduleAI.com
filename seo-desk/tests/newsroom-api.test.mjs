import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';

// Package 8 (2026-11-16): the Newsroom routes, the Hold, Drop and Pick buttons, and This week. Every
// headline, outlet, page and address here is invented; nothing touches the network or DNS.

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-p8api-'));
const DATA = path.join(root, 'data');
const REPO = path.join(root, 'repo');
fs.mkdirSync(path.join(REPO, 'docs/seo'), { recursive: true });
fs.writeFileSync(path.join(REPO, 'docs/seo/brand-terms.json'), JSON.stringify(['examplebrand']));
process.env.SEO_DESK_DATA = DATA;
process.env.SEO_DESK_REPO = REPO;
process.env.SEO_DESK_TODAY = '2026-11-16';

const { createServer } = await import('../server.mjs');
const { makeNewsroomRoutes } = await import('../lib/api/ext/newsroom.mjs');
const { fetchPublicPage } = await import('../lib/sources/page-fetch.mjs');
const { invalidate } = await import('../lib/api/model.mjs');
const { PICK_LIMIT, PICK_WHY, PASTED_MAX } = await import('../lib/api/newsroom-model.mjs');
const { parseTopicLog, PAID_LABEL } = await import('../lib/news.mjs');

const write = (rel, value) => {
  const file = path.join(DATA, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value));
};

const it = (title, publisher, date, n, extra = {}) => ({
  title,
  link: `https://${publisher.toLowerCase().replace(/\W+/g, '')}.example/story-${n}`,
  date,
  publisher,
  description: '',
  feed: 'test',
  google: false,
  ...extra,
});

const ITEMS = [
  it('Pine county rural hospital nurse staffing review begins', 'Ledger', '2026-11-15', 1),
  it('Rural hospital nurse staffing review begins in Pine county', 'Courier', '2026-11-14', 2),
  it('Mesa valley clinic grant draws Texas hospital praise', 'Ledger', '2026-11-13', 3),
  it('Harbor county hospital to close maternity unit', 'Gazette', '2026-11-12', 4),
  it('Quarry nurses union signs new contract', 'Courier', '2026-11-11', 5),
  it('Oakdale nurses union vote set for Friday', 'Gazette', '2026-11-10', 6),
  it('Juniper nurses union files complaint', 'Herald', '2026-11-09', 7),
  it('Chef opens restaurant downtown', 'Herald', '2026-11-15', 8),
  it('Fund adds rural hospital nurse staffing shares', 'Wire Desk', '2026-11-14', 9, {
    link: 'https://www.globenewswire.example/x',
    description: 'This is a paid advertisement.',
  }),
];

const LOG = `### Detection pass 2026-11-06 (founder-supplied link)

- **DROPPED - Juniper nurses union complaint** (Herald, 2026-11-09). Score 0: Relevance 2 x Hook 0. No nurse schedule angle in it.
`;

function seed() {
  fs.rmSync(DATA, { recursive: true, force: true });
  write('snap/news.json', {
    source: 'news',
    ok: true,
    status: 'fresh',
    pulledAt: new Date().toISOString(),
    through: '2026-11-16',
    error: null,
    data: {
      feeds: [
        { name: 'Ledger feed', ok: true, items: 2 },
        { name: 'Broken feed', ok: false, items: 0, error: 'It answered 500.' },
      ],
      items: ITEMS,
      from: '2026-11-02',
      to: '2026-11-16',
      warnings: ['Broken feed did not answer: It answered 500.'],
    },
  });
  write('snap/local.json', {
    source: 'local',
    ok: true,
    status: 'fresh',
    pulledAt: new Date().toISOString(),
    through: '2026-11-16',
    data: {
      registry: [],
      livePages: [{ page: '/blog/night-shift-coverage' }, { page: '/articles/mesa-valley-clinic-grant' }],
      plan: {
        file: 'docs/seo/next-15-blogs-2026-11.md',
        posts: [{ n: 1, done: false, title: 'Winter census planning', keyword: 'winter census planning' }],
        improve: [
          {
            page: '/blog/night-shift-coverage',
            done: false,
            doneDate: null,
            judgeFrom: null,
            search: 'night shift coverage',
            todo: 'Add a coverage table',
          },
        ],
      },
      content: [
        {
          page: '/articles/mesa-valley-clinic-grant',
          kind: 'article',
          title: 'What the Mesa valley clinic grant pays for',
          publishDate: '2026-11-09',
        },
      ],
      newsroomLog: parseTopicLog(LOG),
      edits: [],
      contentEdits: [],
      openWork: [],
      due: [],
      verdicts: [],
    },
  });
  invalidate();
}

// ---------------------------------------------------------------- server

const PAGE = `<html><head><meta property="og:title" content="Valley county weighs nurse staffing ratios">
<meta property="og:site_name" content="The Valley Ledger"><meta property="article:published_time" content="2026-11-15T10:00:00Z"></head></html>`;
const lookups = [];
let answer = '93.184.216.34';
const lookup = async (host) => {
  lookups.push(host);
  return [{ address: answer, family: 4 }];
};
const requests = [];
const fetchImpl = async (href, opts) => {
  requests.push([href, opts.address]);
  return {
    status: 200,
    headers: { 'content-type': 'text/html' },
    body: PAGE.replace('ratios', `ratios ${href.slice(-2)}`),
  };
};

let server;
let port;
before(async () => {
  server = createServer({
    routes: makeNewsroomRoutes({ fetchPage: (u) => fetchPublicPage(u, { fetchImpl, lookup }) }),
    autoRefresh: false,
    staticDir: root,
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  port = server.address().port;
});
after(async () => {
  await new Promise((r) => server.close(r));
  fs.rmSync(root, { recursive: true, force: true });
});

function call(method, url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body === undefined ? null : JSON.stringify(body);
    const req = http.request(
      {
        host: '127.0.0.1',
        port,
        method,
        path: url,
        headers: {
          ...(payload ? { 'content-type': 'application/json', 'content-length': Buffer.byteLength(payload) } : {}),
          ...headers,
        },
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
            // not JSON
          }
          resolve({ status: res.statusCode, json });
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}
const get = (url) => call('GET', url);
const post = (url, body = {}) => call('POST', url, body);
const view = async () => (await get('/api/newsroom')).json;
const byTitle = (v, t) => v.cards.find((c) => c.title.includes(t));
const itemPost = (id, body) => post(`/api/item/${encodeURIComponent(id)}`, body);

// ---------------------------------------------------------------- the page

test('newsroom: one card per story, tabs with counts, and the sidebar count is the Fresh tab', async () => {
  seed();
  const v = await view();
  assert.equal(
    v.line,
    'News from the last 14 days that fits your Newsroom method, checked against what you have written and decided.'
  );
  assert.equal(v.feeds.answered, 1);
  assert.equal(v.feeds.total, 2);
  assert.deepEqual(v.feeds.failed, [{ name: 'Broken feed', error: 'It answered 500.' }]);
  assert.ok(!v.cards.some((c) => c.title.includes('Chef')), 'Tier 3 is never shown');
  const pine = byTitle(v, 'Pine county');
  assert.equal(pine.outlets.length, 2);
  assert.equal(pine.tab, 'fresh');
  assert.equal(pine.tierText, 'Tier 1: nurse staffing, rural hospital');
  assert.deepEqual(
    pine.score.toCheck.map((t) => t.name),
    ['Can we be first', 'Citable hook']
  );
  assert.ok(pine.brief.startsWith('Task for the SimpleScheduleAI website'));
  const counts = Object.fromEntries(v.tabs.map((t) => [t.key, t.count]));
  assert.deepEqual(
    v.tabs.map((t) => t.label),
    ['Fresh', 'Already covered or decided', 'Held', 'Dropped', 'Picked']
  );
  for (const t of v.tabs) assert.equal(t.count, v.cards.filter((c) => c.tab === t.key).length);
  const nav = (await get('/api/nav')).json.counts;
  assert.equal(nav.newsroom, counts.fresh);
});

test('newsroom: covered and decided stories sit on their own tab and say so at the top', async () => {
  seed();
  const v = await view();
  const mesa = byTitle(v, 'Mesa valley');
  assert.equal(mesa.tab, 'covered');
  assert.equal(mesa.topLine, 'Already covered: Covered by /articles/mesa-valley-clinic-grant (published 9 November).');
  assert.deepEqual(mesa.have[0].words, ['clinic', 'grant', 'mesa', 'valley']);
  const juniper = byTitle(v, 'Juniper');
  assert.equal(juniper.tab, 'covered');
  assert.equal(juniper.topLine, 'Already decided: Dropped on 6 November: No nurse schedule angle in it.');
  const fresh = v.cards.filter((c) => c.tab === 'fresh');
  const firstCovered = v.cards.findIndex((c) => c.tab === 'covered');
  assert.ok(v.cards.findIndex((c) => c.tab === 'fresh') < firstCovered, 'fresh cards sort first');
  assert.ok(fresh.every((c) => c.topLine === null));
  const paid = byTitle(v, 'Fund adds');
  assert.equal(paid.paid, true);
  assert.equal(paid.paidText, PAID_LABEL);
});

// ---------------------------------------------------------------- hold, drop, reopen

test('hold: Hold until a date moves the card to Held; Reopen brings it back', async () => {
  seed();
  const id = byTitle(await view(), 'Harbor county').id;
  const r = await itemPost(id, { action: 'snooze', until: '2026-11-23' });
  assert.equal(r.status, 200);
  let c = byTitle(await view(), 'Harbor county');
  assert.equal(c.tab, 'held');
  assert.equal(c.topLine, 'You held it until 23 November.');
  assert.equal((await itemPost(id, { action: 'reopen' })).status, 200);
  c = byTitle(await view(), 'Harbor county');
  assert.equal(c.tab, 'fresh');
});

test('drop: Drop needs a reason, then the card is on Dropped with it, and stays when it leaves the feed', async () => {
  seed();
  const id = byTitle(await view(), 'Quarry nurses').id;
  assert.equal((await itemPost(id, { action: 'ignore' })).status, 400);
  assert.equal((await itemPost(id, { action: 'ignore', reason: 'Not our state' })).status, 200);
  let c = byTitle(await view(), 'Quarry nurses');
  assert.equal(c.tab, 'dropped');
  assert.equal(c.topLine, 'You dropped it: Not our state.');
  // The story ages out of the feed: the card is kept from what the item saved.
  const snap = JSON.parse(fs.readFileSync(path.join(DATA, 'snap/news.json'), 'utf8'));
  snap.data.items = snap.data.items.filter((x) => !x.title.startsWith('Quarry'));
  write('snap/news.json', snap);
  invalidate();
  c = byTitle(await view(), 'Quarry nurses');
  assert.equal(c.tab, 'dropped');
  assert.equal(c.id, id);
  assert.equal(c.aged, true);
});

// ---------------------------------------------------------------- pick for this week

test('pick: a picked story is in This week after the new post and before the page edit, not a page edit', async () => {
  seed();
  const id = byTitle(await view(), 'Pine county').id;
  const before = (await get('/api/week')).json;
  assert.deepEqual(
    before.top5.map((c) => c.slot),
    ['new-post', 'page-edit']
  );
  const r = await post('/api/newsroom/pick', { id });
  assert.equal(r.status, 200, JSON.stringify(r.json));
  const week = (await get('/api/week')).json;
  assert.deepEqual(
    week.top5.map((c) => c.slot),
    ['new-post', 'newsroom', 'page-edit']
  );
  const card = week.top5[1];
  assert.equal(card.id, id);
  assert.equal(card.typeLabel, 'Newsroom piece');
  assert.equal(card.why, PICK_WHY);
  assert.equal(card.isPageEdit, false);
  assert.equal(card.eligibility, null);
  assert.match(card.brief, /trendjacking-articles\.md/);
  assert.match(card.test, /Press Done once the piece is published/);
  assert.equal(week.editStatus, before.editStatus, "the week's page edit is not used");
  assert.equal(byTitle(await view(), 'Pine county').tab, 'picked');
  // Done means the piece is published: it stays on the week, marked done, and freezes nothing.
  const done = await itemPost(id, { action: 'done' });
  assert.equal(done.status, 200);
  assert.equal(done.json.freezes, undefined);
  const after = (await get('/api/week')).json;
  assert.equal(after.top5.find((c) => c.id === id).state.status, 'done');
  assert.equal(byTitle(await view(), 'Pine county').topLine, 'You marked the piece published on 16 November.');
});

test('pick: at most two a week; the third is refused with that sentence, and Unpick frees a place', async () => {
  seed();
  const v = await view();
  const ids = ['Pine county', 'Harbor county', 'Quarry nurses'].map((t) => byTitle(v, t).id);
  assert.equal((await post('/api/newsroom/pick', { id: ids[0] })).status, 200);
  // The card's own Pin button is the same pick.
  assert.equal((await itemPost(ids[1], { action: 'pin' })).status, 200);
  const third = await post('/api/newsroom/pick', { id: ids[2] });
  assert.equal(third.status, 409);
  assert.equal(third.json.error, PICK_LIMIT);
  assert.equal((await view()).picks.count, 2);
  assert.equal((await post('/api/newsroom/unpick', { id: ids[0] })).status, 200);
  assert.equal((await post('/api/newsroom/pick', { id: ids[2] })).status, 200);
  const week = (await get('/api/week')).json;
  assert.ok(!week.top5.some((c) => c.id === ids[0]));
  assert.equal(week.top5.filter((c) => c.slot === 'newsroom').length, 2);
});

test('pick: in a week the founder chose, the pick goes in after the new post; unpick takes it out', async () => {
  seed();
  const id = byTitle(await view(), 'Harbor county').id;
  const week = (await get('/api/week')).json;
  const chosen = week.top5.map((c) => c.id);
  assert.equal((await post('/api/week/top5', { ids: chosen })).status, 200);
  assert.equal((await post('/api/newsroom/pick', { id })).status, 200);
  let w = (await get('/api/week')).json;
  assert.equal(w.top5Source, 'chosen');
  assert.deepEqual(
    w.top5.map((c) => c.id),
    [chosen[0], id, chosen[1]]
  );
  assert.equal((await itemPost(id, { action: 'unpin' })).status, 200);
  w = (await get('/api/week')).json;
  assert.deepEqual(
    w.top5.map((c) => c.id),
    chosen
  );
});

test('pick: a locked week, a dropped story and an unknown id are refused plainly', async () => {
  seed();
  const v = await view();
  assert.equal((await post('/api/week/lock', {})).status, 200);
  const locked = await post('/api/newsroom/pick', { id: byTitle(v, 'Pine county').id });
  assert.equal(locked.status, 409);
  assert.match(locked.json.error, /locked/);
  assert.equal((await post('/api/week/unlock', {})).status, 200);
  const q = byTitle(v, 'Quarry nurses').id;
  await itemPost(q, { action: 'ignore', reason: 'Not ours' });
  assert.match((await post('/api/newsroom/pick', { id: q })).json.error, /Reopen first/);
  assert.equal((await post('/api/newsroom/pick', { id: 'news:000000000000' })).status, 404);
  assert.equal((await post('/api/newsroom/pick', { id: 'opp:x' })).status, 400);
});

// ---------------------------------------------------------------- paste a link

test('paste: a public page becomes a card with the same tier, checks and labels', async () => {
  seed();
  answer = '93.184.216.34';
  requests.length = 0;
  const r = await post('/api/newsroom/paste', { url: 'https://valley.example/news/a1' });
  assert.equal(r.status, 200, JSON.stringify(r.json));
  assert.equal(r.json.card.pasted, true);
  assert.equal(r.json.card.tier, 1);
  assert.deepEqual(
    r.json.card.outlets.map((o) => [o.name, o.url, o.date]),
    [['The Valley Ledger', 'https://valley.example/news/a1', '2026-11-15']]
  );
  assert.deepEqual(requests, [['https://valley.example/news/a1', '93.184.216.34']]);
  const v = await view();
  assert.equal(v.cards.find((c) => c.id === r.json.card.id).tab, 'fresh');
});

test('paste: a link that is already in the feeds is the feed card, marked as pasted', async () => {
  seed();
  answer = '93.184.216.34';
  const id = byTitle(await view(), 'Harbor county').id;
  const link = ITEMS.find((x) => x.title.startsWith('Harbor county')).link;
  const r = await post('/api/newsroom/paste', { url: link });
  assert.equal(r.status, 200);
  assert.equal(r.json.card.id, id);
  assert.equal(r.json.card.pasted, true);
  assert.equal((await view()).cards.filter((c) => c.id === id).length, 1);
});

test('paste: a private address is refused after the lookup, and no request is made', async () => {
  seed();
  answer = '10.0.0.7';
  requests.length = 0;
  const r = await post('/api/newsroom/paste', { url: 'https://intranet-proxy.example/a' });
  assert.equal(r.status, 400);
  assert.match(r.json.error, /private network/);
  assert.equal(requests.length, 0);
  assert.equal((await post('/api/newsroom/paste', { url: 'http://valley.example/a' })).status, 400);
  answer = '93.184.216.34';
});

test('paste: a cross-site POST is refused before anything is fetched', async () => {
  seed();
  requests.length = 0;
  lookups.length = 0;
  const r = await call(
    'POST',
    '/api/newsroom/paste',
    { url: 'https://valley.example/a' },
    { 'sec-fetch-site': 'cross-site' }
  );
  assert.equal(r.status, 403);
  const o = await call(
    'POST',
    '/api/newsroom/paste',
    { url: 'https://valley.example/a' },
    { origin: 'http://evil.example' }
  );
  assert.equal(o.status, 403);
  const p = await call('POST', '/api/newsroom/pick', { id: 'news:000000000000' }, { 'sec-fetch-site': 'cross-site' });
  assert.equal(p.status, 403);
  assert.equal(requests.length, 0);
  assert.equal(lookups.length, 0);
});

test('paste: at most 50 pasted links are kept, newest first', async () => {
  seed();
  for (let i = 0; i < PASTED_MAX + 2; i++) {
    const n = String(i).padStart(2, '0');
    assert.equal((await post('/api/newsroom/paste', { url: `https://valley.example/news/p${n}` })).status, 200);
  }
  const kept = JSON.parse(fs.readFileSync(path.join(DATA, 'state/news-pasted.json'), 'utf8'));
  assert.equal(kept.length, PASTED_MAX);
  assert.equal(kept[0].url, `https://valley.example/news/p${PASTED_MAX + 1}`);
});

// ---------------------------------------------------------------- the Ask digest

test('ask: the digest carries the top five fresh stories with tier, outlets and what we have', async () => {
  seed();
  const { SECTIONS } = await import('../lib/ask.mjs');
  const { buildModel } = await import('../lib/api/model.mjs');
  const sec = SECTIONS.find(([title]) => title.startsWith('Newsroom'));
  assert.ok(sec, 'the digest has a Newsroom section');
  assert.equal(sec[1], '/api/newsroom');
  const d = sec[2](buildModel());
  const v = await view();
  const fresh = v.cards.filter((c) => c.tab === 'fresh');
  assert.equal(d.freshCount, fresh.length);
  assert.deepEqual(
    d.fresh.map((c) => c.title),
    fresh.slice(0, 5).map((c) => c.title)
  );
  const pine = d.fresh.find((c) => c.title.includes('Pine county'));
  assert.equal(pine.outlets, 2);
  assert.equal(pine.tierText, 'Tier 1: nurse staffing, rural hospital');
  assert.deepEqual(pine.toCheck, ['Can we be first', 'Citable hook']);
  assert.ok(Array.isArray(pine.have));
  assert.match(d.rule, /Never call a story rising beyond its outlet count and dates/);
});

test('a failed news pull is said on the Newsroom page and its dot, never as a broken card on This week', async () => {
  seed();
  const snap = JSON.parse(fs.readFileSync(path.join(DATA, 'snap/news.json'), 'utf8'));
  write('snap/news.json', { ...snap, ok: false, status: 'failed', error: 'None of the 18 news feeds answered.' });
  invalidate();
  const week = (await get('/api/week')).json;
  assert.ok(!week.worries.some((w) => w.id === 'source-failed:news'));
  assert.ok(!week.top5.some((c) => c.id === 'source-failed:news'));
  assert.equal(week.sources.find((s) => s.source === 'news').status, 'failed');
  assert.equal((await view()).feeds.status, 'failed');
});
