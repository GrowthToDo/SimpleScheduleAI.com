import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';

// Synthetic data only: invented pages and invented search phrases, a temp data folder and a
// temp "repo". No network, no server is listening, and the handlers are called directly.

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-targets-'));
const DATA = path.join(root, 'data');
const REPO = path.join(root, 'repo');
fs.mkdirSync(path.join(DATA, 'snap'), { recursive: true });
fs.mkdirSync(path.join(REPO, 'docs/seo'), { recursive: true });
fs.writeFileSync(path.join(REPO, 'docs/seo/brand-terms.json'), JSON.stringify(['examplecare']));
process.env.SEO_DESK_DATA = DATA;
process.env.SEO_DESK_REPO = REPO;
process.env.SEO_DESK_TODAY = '2026-11-10';

const T = await import('../lib/targets.mjs');
const { routes } = await import('../lib/api/ext/targets.mjs');
const { buildModel, invalidate, loadSettings } = await import('../lib/api/model.mjs');
const { changeSettings } = await import('../lib/api/actions.mjs');
const { visitorsView, settingsView } = await import('../lib/api/panels.mjs');
const { score, rank, SIGNAL_ORDER } = await import('../lib/score.mjs');
const { PRESETS } = await import('../lib/config.mjs');
const store = await import('../lib/store.mjs');
// Loaded with the other imports: a top-level await between tests lets the runner reach the `after`
// hook that deletes the temp folder before the real server tests are even registered.
const { createServer } = await import('../server.mjs');
const net = await import('node:net');
const http = await import('node:http');

after(() => fs.rmSync(root, { recursive: true, force: true }));

const qp = (query, page, impressions, position = 8, clicks = 0) => ({ query, page, clicks, impressions, position });

// ---------------------------------------------------------------- pure functions

test('allTargets: the registry wins on a duplicate keyword and carries priorities', () => {
  const registry = [
    { slug: 'a', url: '/blog/a', primaryKeyword: 'Alpha Phrase ', pillar: '/x' },
    { slug: 'b', url: '/blog/b', primaryKeyword: 'beta phrase' },
    { slug: 'c', url: '/blog/c' },
  ];
  const state = {
    adopted: [
      {
        keyword: 'alpha phrase',
        page: '/blog/other',
        priority: 'low',
        intentGroup: 'g',
        source: 'import',
        addedOn: '2026-11-01',
      },
      {
        keyword: 'gamma phrase',
        page: '/blog/g',
        priority: 'high',
        intentGroup: 'grp',
        source: 'discovered',
        addedOn: '2026-11-02',
      },
    ],
    ignored: [],
    priorities: { 'beta phrase': 'low' },
  };
  const all = T.allTargets({ registry, state });
  assert.deepEqual(
    all.map((t) => [t.keyword, t.origin]),
    [
      ['Alpha Phrase', 'registry'],
      ['beta phrase', 'registry'],
      ['gamma phrase', 'adopted'],
    ]
  );
  assert.equal(all[0].page, '/blog/a');
  assert.equal(all[0].priority, null);
  assert.equal(all[1].priority, 'low');
  assert.equal(all[2].priority, 'high');
  assert.equal(all[2].intentGroup, 'grp');
});

test('discovered: only unclaimed, non-brand, non-ignored searches with enough impressions', () => {
  const qpCur = [
    qp('new phrase one', '/blog/a', 30, 9),
    qp('new phrase one', '/blog/b', 10, 12),
    qp('tiny phrase', '/blog/a', 19),
    qp('Taken Phrase', '/blog/a', 90),
    qp('skipped phrase', '/blog/a', 80),
    qp('examplecare login', '/', 70),
    qp('second phrase', '/blog/c', 55, 4),
  ];
  const rows = T.discovered({
    qpCur,
    targets: [{ keyword: ' taken phrase' }],
    ignored: ['Skipped Phrase'],
    brands: ['examplecare'],
  });
  assert.deepEqual(
    rows.map((r) => r.query),
    ['second phrase', 'new phrase one']
  );
  const one = rows.find((r) => r.query === 'new phrase one');
  assert.equal(one.impressions, 40);
  assert.equal(one.rankingPage, '/blog/a');
  assert.equal(typeof one.position, 'number');
  assert.equal(T.discovered({ qpCur, targets: [], ignored: [], brands: [], minImpressions: 85 }).length, 1);
});

test('labelTarget: right page, ranks elsewhere, not returned, partial evidence', () => {
  const qpCur = [
    qp('alpha phrase', '/blog/a', 40),
    qp('alpha phrase', '/blog/b', 10),
    qp('beta phrase', '/blog/b', 30),
    qp('thin phrase', '/blog/c', 9),
  ];
  const label = (keyword, page) => T.labelTarget({ keyword, page }, qpCur);
  assert.equal(label('Alpha Phrase', '/blog/a/'), 'right page');
  assert.equal(label('alpha phrase', 'https://simplescheduleai.com/blog/a'), 'right page');
  assert.equal(label('beta phrase', '/blog/a'), 'ranks elsewhere');
  assert.equal(label('missing phrase', '/blog/a'), 'not returned');
  assert.equal(label('thin phrase', '/blog/c'), 'partial evidence');
  assert.equal(
    label('thin phrase', '/blog/other'),
    'partial evidence',
    'under 10 impressions never counts as elsewhere'
  );
  assert.equal(T.labelTarget({ keyword: 'x', page: '/a' }, []), 'not returned');
});

test('intentConflicts: the same group on different pages', () => {
  const targets = [
    { keyword: 'k1', page: '/blog/a', intentGroup: 'Rota' },
    { keyword: 'k2', page: '/blog/b/', intentGroup: ' rota ' },
    { keyword: 'k3', page: '/blog/a', intentGroup: 'solo' },
    { keyword: 'k4', page: '/blog/a', intentGroup: 'same' },
    { keyword: 'k5', page: '/blog/a', intentGroup: 'same' },
    { keyword: 'k6', page: '/blog/z', intentGroup: null },
    { keyword: 'k7', page: '/blog/y', intentGroup: '' },
  ];
  assert.deepEqual(T.intentConflicts(targets), [
    { intentGroup: 'Rota', keywords: ['k1', 'k2'], pages: ['/blog/a', '/blog/b'] },
  ]);
});

test('parseKeywordCsv: header names in any case, a byte-order mark, quotes, ignored difficulty', () => {
  const good =
    '\uFEFFSearch Volume,KEYWORD,Current URL,Priority,KD,Difficulty\r\n' +
    '"1,200","nurse rota, simple",https://simplescheduleai.com/blog/a/,HIGH,33,hard\r\n' +
    '90,plain phrase,/blog/b,medium,12,easy\r\n' +
    '5,third phrase,,whenever,1,x\r\n';
  const out = T.parseKeywordCsv(good);
  assert.deepEqual(out.skipped, []);
  assert.deepEqual(out.rows, [
    { keyword: 'nurse rota, simple', page: '/blog/a', priority: 'high', volume: 1200 },
    { keyword: 'plain phrase', page: '/blog/b', priority: 'medium', volume: 90 },
    { keyword: 'third phrase', page: null, priority: null, volume: 5 },
  ]);
  const q = T.parseKeywordCsv('Query,Page\nsome phrase,/p\n');
  assert.deepEqual(q.rows, [{ keyword: 'some phrase', page: '/p', priority: null, volume: null }]);
  const s = T.parseKeywordCsv('search,url\nanother phrase,/p\n');
  assert.equal(s.rows[0].keyword, 'another phrase');
});

test('parseKeywordCsv: skips blanks and repeats with a plain reason, and says when no column fits', () => {
  const out = T.parseKeywordCsv('keyword,page\nfirst,/a\n,/b\nFIRST,/c\nlast,/d\n');
  assert.deepEqual(
    out.rows.map((r) => r.keyword),
    ['first', 'last']
  );
  assert.equal(out.skipped.length, 2);
  assert.equal(out.skipped[0].line, 3);
  assert.match(out.skipped[0].why, /no keyword/i);
  assert.equal(out.skipped[1].line, 4);
  assert.match(out.skipped[1].why, /already/i);
  const none = T.parseKeywordCsv('thing,place\na,b\n');
  assert.deepEqual(none.rows, []);
  assert.equal(none.skipped.length, 1);
  assert.match(none.skipped[0].why, /keyword/);
  assert.deepEqual(T.parseKeywordCsv(''), { rows: [], skipped: [{ line: 1, why: 'The file is empty.' }] });
});

test('parseKeywordCsv reads at most 5,000 rows', () => {
  const lines = ['keyword,page'];
  for (let i = 0; i < 5003; i++) lines.push(`phrase number ${i},/p`);
  const out = T.parseKeywordCsv(lines.join('\n'));
  assert.equal(out.rows.length, 5000);
  assert.equal(out.skipped.length, 1);
  assert.match(out.skipped[0].why, /5,000/);
});

test('outcomeSignal is null under 30 sessions and min(1, events / 5) above', () => {
  const outcomes = [
    { page: '/a', events: 3, sessions: 29 },
    { page: '/b', events: 3, sessions: 30 },
    { page: '/c', events: 12, sessions: 100 },
    { page: '/d', events: 0, sessions: 80 },
  ];
  assert.equal(T.outcomeSignal('/a', outcomes), null);
  assert.equal(T.outcomeSignal('/b', outcomes), 0.6);
  assert.equal(T.outcomeSignal('/c/', outcomes), 1);
  assert.equal(T.outcomeSignal('/d', outcomes), 0);
  assert.equal(T.outcomeSignal('/unknown', outcomes), null);
  assert.equal(T.outcomeSignal(null, outcomes), null);
  assert.equal(T.outcomeSignal('/a', null), null);
});

const opp = (over = {}) => ({
  id: 'x',
  page: '/blog/a',
  query: 'alpha phrase',
  signals: { demand: 0.5, distance: 0.5, importance: 0.5, confidence: 0.5, effort: 0.5, ai: 0.5 },
  ...over,
});

test('applySignals: priority scales importance, strategic keywords set it to 1, outcome comes from visitors', () => {
  const targets = [
    { keyword: 'alpha phrase', page: '/blog/a', priority: 'low' },
    { keyword: 'beta phrase', page: '/blog/b', priority: 'medium' },
    { keyword: 'gamma phrase', page: '/blog/c', priority: 'high' },
    { keyword: 'delta phrase', page: '/blog/d', priority: null },
  ];
  const outcomes = [{ page: '/blog/a', events: 10, sessions: 50 }];
  const [a, b, c, d, e, f] = T.applySignals(
    [
      opp(),
      opp({ page: '/blog/b', query: 'beta phrase' }),
      opp({ page: '/blog/c', query: 'x' }),
      opp({ page: '/blog/d', query: 'y' }),
      opp({ page: '/blog/e', query: 'strategic search' }),
      opp({ page: null, query: null }),
    ],
    { targets, strategic: [' Strategic Search '], outcomes }
  );
  assert.equal(a.signals.importance, 0.25);
  assert.equal(b.signals.importance, 0.5, 'medium is neutral');
  assert.equal(c.signals.importance, 0.625, 'high counts a quarter more');
  assert.equal(d.signals.importance, 0.5, 'a target with no priority changes nothing');
  assert.equal(e.signals.importance, 1);
  assert.equal(a.signals.outcome, 1);
  assert.equal(b.signals.outcome, null);
  assert.equal(f.signals.outcome, null);
  assert.match(a.signalNotes.importance, /Low priority: counts half\./);
  assert.match(c.signalNotes.importance, /High priority: counts a quarter more\./);
  assert.match(a.signalNotes.outcome, /interest signals, not sales/);
  assert.match(e.signalNotes.importance, /strategic/i);
  // High never pushes importance above 1, and low halves a money page.
  const run = (importance, priority) =>
    T.applySignals([opp({ signals: { ...opp().signals, importance } })], {
      targets: [{ keyword: 'alpha phrase', page: '/blog/a', priority }],
      strategic: [],
      outcomes: [],
    })[0].signals.importance;
  assert.equal(run(1, 'high'), 1);
  assert.equal(run(0.9, 'high'), 1);
  assert.equal(run(1, 'low'), 0.5);
  assert.equal(run(0.7, 'medium'), 0.7);
  // The input is not changed.
  assert.equal(opp().signals.importance, 0.5);
});

test('score: the new signal has a plain label, a meaning and a not enough data line', () => {
  assert.equal(SIGNAL_ORDER.at(-1), 'outcome');
  const withValue = score(opp({ signals: { ...opp().signals, outcome: 0.6 } }), PRESETS['interest-signals-first']);
  const part = withValue.parts.find((p) => p.signal === 'outcome');
  assert.match(part.why, /^Interest from visitors: 0\.60 out of 1 \(/);
  assert.match(part.why, /interest signal, not a sale/);
  const none = score(opp({ signals: { ...opp().signals, outcome: null } }), PRESETS.balanced);
  const nullPart = none.parts.find((p) => p.signal === 'outcome');
  assert.equal(nullPart.points, 0);
  assert.match(nullPart.why, /not enough data yet/);
  const noted = score(
    opp({ signalNotes: { importance: 'Set to the top because it is strategic.' } }),
    PRESETS.balanced
  );
  assert.match(noted.parts.find((p) => p.signal === 'importance').why, /strategic/);
  assert.equal(rank([opp()], PRESETS.balanced)[0].score.parts.length, 7);
});

test('every preset sums to 1 and gives the new signal a weight', () => {
  for (const [name, p] of Object.entries(PRESETS)) {
    const sum = Object.values(p).reduce((x, y) => x + y, 0);
    assert.ok(Math.abs(sum - 1) < 1e-9, `${name} sums to ${sum}`);
    assert.ok(p.outcome > 0, `${name} has an outcome weight`);
  }
  for (const name of ['balanced', 'money-pages-first', 'findability-first', 'ai-citations-first'])
    assert.equal(PRESETS[name].outcome, 0.05);
  assert.ok(PRESETS['interest-signals-first'].outcome > PRESETS.balanced.outcome);
});

// ---------------------------------------------------------------- routes

const snap = (source, data, through = '2026-11-07') => ({
  source,
  ok: true,
  status: 'fresh',
  pulledAt: '2026-11-10T06:00:00.000Z',
  through,
  error: null,
  data,
});
const CUR = { start: '2026-10-11', end: '2026-11-07' };
const PREV = { start: '2026-09-13', end: '2026-10-10' };

function seed() {
  fs.rmSync(path.join(DATA, 'state'), { recursive: true, force: true });
  store.writeJson(
    'snap/gsc.json',
    snap('gsc', {
      siteDaily: [],
      pageDaily: [],
      qpCur: [
        qp('alpha target', '/blog/alpha', 60, 6),
        qp('beta target', '/blog/gamma', 40, 14),
        qp('gamma target', '/blog/gamma', 5, 3),
        qp('fresh idea one', '/blog/alpha', 45, 9),
        qp('fresh idea two', '/blog/beta', 33, 15),
        qp('examplecare login', '/', 99, 1),
      ],
      qpPrev: [],
      qp90: [],
      queryCur: [
        { query: 'alpha target', clicks: 2, impressions: 61, position: 6.2 },
        { query: 'fresh idea one', clicks: 0, impressions: 47, position: 9.1 },
      ],
      queryPrev: [],
      windows: { cur: CUR, prev: PREV },
    })
  );
  store.writeJson(
    'snap/local.json',
    snap('local', {
      registry: [
        { slug: 'alpha', type: 'post', url: '/blog/alpha', primaryKeyword: 'alpha target', pillar: '/p' },
        { slug: 'beta', type: 'post', url: '/blog/beta', primaryKeyword: 'beta target', pillar: '/p' },
        { slug: 'gamma', type: 'post', url: '/blog/gamma', primaryKeyword: 'gamma target', pillar: '/p' },
      ],
      livePages: [
        { page: '/' },
        { page: '/blog/alpha' },
        { page: '/blog/beta' },
        { page: '/blog/gamma' },
        { page: '/pricing' },
      ],
      edits: [],
      plan: null,
    })
  );
  store.writeJson(
    'snap/ga4.json',
    snap('ga4', {
      channelsDaily: [],
      landing: [],
      events: [],
      ai: [],
      outcomes: [
        { page: '/blog/alpha', events: 7, sessions: 80 },
        { page: '/blog/beta', events: 2, sessions: 10 },
      ],
      sourceMedium: [
        { name: 'google / organic', sessions: 50, prevSessions: 40 },
        { name: '(direct) / (none)', sessions: 9, prevSessions: 12 },
      ],
      countries: [
        { name: 'United States', sessions: 55, prevSessions: 49 },
        { name: '(not set)', sessions: 4, prevSessions: 3 },
      ],
      devices: [
        { name: 'desktop', sessions: 40, prevSessions: 30 },
        { name: 'mobile', sessions: 19, prevSessions: 22 },
      ],
    })
  );
  invalidate();
}

async function call(method, urlPath, { body, raw } = {}) {
  const url = new URL(urlPath, 'http://127.0.0.1:8771');
  const route = routes.find(
    (r) => r.method === method && (r.path instanceof RegExp ? r.path.test(url.pathname) : r.path === url.pathname)
  );
  assert.ok(route, `no route for ${method} ${url.pathname}`);
  const ctx = {
    url,
    params: {},
    body: async () => body ?? {},
    rawBody: async () => raw ?? '',
    req: Readable.from(raw === undefined ? [] : [Buffer.from(raw, 'utf8')]),
    res: {
      headers: null,
      sent: null,
      writeHead(status, headers) {
        this.status = status;
        this.headers = headers;
      },
      end(data) {
        this.sent = data;
      },
    },
    json() {},
  };
  try {
    const value = await route.handler(ctx);
    return { status: 200, value, res: ctx.res };
  } catch (e) {
    return { status: e.status ?? 500, error: e.message, value: null, res: ctx.res };
  }
}

before(seed);

test('GET /api/targets lists the registry keywords with position, impressions, ranking page and a label', async () => {
  seed();
  const { value, status } = await call('GET', '/api/targets');
  assert.equal(status, 200);
  assert.equal(value.tab, 'targeted');
  assert.equal(value.rows.length, 3);
  const a = value.rows.find((r) => r.keyword === 'alpha target');
  assert.equal(a.origin, 'registry');
  assert.equal(a.label, 'right page');
  assert.equal(a.position, 6.2);
  assert.equal(a.impressions, 61);
  assert.equal(a.rankingPage, '/blog/alpha');
  assert.equal(value.rows.find((r) => r.keyword === 'beta target').label, 'ranks elsewhere');
  assert.equal(value.rows.find((r) => r.keyword === 'gamma target').label, 'partial evidence');
  assert.deepEqual(value.counts, { targeted: 3, discovered: 2, ignored: 0, secondary: 0 });
  assert.deepEqual(value.conflicts, []);
  assert.equal((await call('GET', '/api/targets?tab=nope')).status, 400);
});

test('discovered searches are listed, adopting one needs a live page, and it then moves to Targeted', async () => {
  seed();
  const d = (await call('GET', '/api/targets?tab=discovered')).value;
  assert.deepEqual(
    d.rows.map((r) => r.keyword),
    ['fresh idea one', 'fresh idea two']
  );
  assert.equal(d.rows[0].rankingPage, '/blog/alpha');

  const nonLive = await call('POST', '/api/targets/adopt', {
    body: { items: [{ keyword: 'fresh idea one', page: '/blog/not-published' }] },
  });
  assert.equal(nonLive.status, 400);
  assert.match(nonLive.error, /live page/);
  assert.equal((await call('POST', '/api/targets/adopt', { body: { items: [] } })).status, 400);
  assert.equal(
    (
      await call('POST', '/api/targets/adopt', {
        body: { items: [{ keyword: 'k', page: '/pricing', priority: 'urgent' }] },
      })
    ).status,
    400
  );
  assert.equal(
    (
      await call('POST', '/api/targets/adopt', {
        body: { items: Array.from({ length: 201 }, (_, i) => ({ keyword: `k${i}`, page: '/pricing' })) },
      })
    ).status,
    400
  );

  const ok = await call('POST', '/api/targets/adopt', {
    body: { items: [{ keyword: ' Fresh Idea One ', page: '/blog/alpha', priority: 'high', intentGroup: 'ideas' }] },
  });
  assert.equal(ok.status, 200);
  assert.equal(ok.value.adopted, 1);
  const st = store.readJson('state/targets.json');
  assert.equal(st.adopted[0].keyword, 'fresh idea one');
  assert.equal(st.adopted[0].source, 'discovered');
  assert.equal(st.adopted[0].addedOn, '2026-11-10');
  const t = (await call('GET', '/api/targets')).value;
  const row = t.rows.find((r) => r.keyword === 'fresh idea one');
  assert.equal(row.origin, 'adopted');
  assert.equal(row.priority, 'high');
  assert.equal(row.label, 'right page');
  assert.deepEqual(
    (await call('GET', '/api/targets?tab=discovered')).value.rows.map((r) => r.keyword),
    ['fresh idea two']
  );
  // Adopting the same keyword again adds nothing.
  const again = await call('POST', '/api/targets/adopt', {
    body: { items: [{ keyword: 'fresh idea one', page: '/blog/alpha' }] },
  });
  assert.equal(again.value.adopted, 0);
  assert.equal(again.value.skipped.length, 1);
});

test('an ignored keyword disappears from Discovered and comes back after restore', async () => {
  seed();
  const ign = await call('POST', '/api/targets/ignore', { body: { keywords: ['Fresh Idea Two'] } });
  assert.equal(ign.status, 200);
  assert.deepEqual(
    (await call('GET', '/api/targets?tab=discovered')).value.rows.map((r) => r.keyword),
    ['fresh idea one']
  );
  const ignored = (await call('GET', '/api/targets?tab=ignored')).value;
  assert.deepEqual(
    ignored.rows.map((r) => r.keyword),
    ['fresh idea two']
  );
  assert.equal(ignored.counts.ignored, 1);
  await call('POST', '/api/targets/restore', { body: { keywords: [' fresh idea two'] } });
  assert.deepEqual(
    (await call('GET', '/api/targets?tab=discovered')).value.rows.map((r) => r.keyword),
    ['fresh idea one', 'fresh idea two']
  );
  assert.equal((await call('POST', '/api/targets/ignore', { body: { keywords: 'nope' } })).status, 400);
});

test('PUT and DELETE: registry rows take a priority only and cannot be removed; adopted rows are fully editable', async () => {
  seed();
  assert.equal(
    (await call('PUT', '/api/targets', { body: { keyword: 'alpha target', page: '/pricing' } })).status,
    400
  );
  assert.equal(
    (await call('PUT', '/api/targets', { body: { keyword: 'alpha target', intentGroup: 'g' } })).status,
    400
  );
  assert.equal((await call('PUT', '/api/targets', { body: { keyword: 'alpha target', priority: 'low' } })).status, 200);
  assert.equal(store.readJson('state/targets.json').priorities['alpha target'], 'low');
  assert.equal((await call('PUT', '/api/targets', { body: { keyword: 'alpha target', priority: null } })).status, 200);
  assert.equal(store.readJson('state/targets.json').priorities['alpha target'], undefined);
  assert.equal(
    (await call('PUT', '/api/targets', { body: { keyword: 'alpha target', priority: 'sideways' } })).status,
    400
  );
  assert.equal((await call('DELETE', '/api/targets', { body: { keyword: 'alpha target' } })).status, 400);
  assert.equal(
    (await call('PUT', '/api/targets', { body: { keyword: 'never heard of it', priority: 'low' } })).status,
    404
  );

  await call('POST', '/api/targets/adopt', { body: { items: [{ keyword: 'mine one', page: '/pricing' }] } });
  const put = await call('PUT', '/api/targets', {
    body: { keyword: 'Mine One', page: '/blog/beta', priority: 'low', intentGroup: 'g1' },
  });
  assert.equal(put.status, 200);
  const row = store.readJson('state/targets.json').adopted[0];
  assert.deepEqual([row.page, row.priority, row.intentGroup], ['/blog/beta', 'low', 'g1']);
  assert.equal((await call('PUT', '/api/targets', { body: { keyword: 'mine one', page: '/nowhere' } })).status, 400);
  assert.equal((await call('DELETE', '/api/targets', { body: { keyword: 'mine one' } })).status, 200);
  assert.deepEqual(store.readJson('state/targets.json').adopted, []);
});

test('a conflict shows when the same group sits on different pages', async () => {
  seed();
  await call('POST', '/api/targets/adopt', {
    body: {
      items: [
        { keyword: 'rota one', page: '/pricing', intentGroup: 'rota' },
        { keyword: 'rota two', page: '/blog/beta', intentGroup: 'rota' },
      ],
    },
  });
  const v = (await call('GET', '/api/targets')).value;
  assert.equal(v.conflicts.length, 1);
  assert.deepEqual(v.conflicts[0].keywords, ['rota one', 'rota two']);
});

test('import reads a CSV, skips what cannot be used with a reason, and never touches a non-live page', async () => {
  seed();
  const csv =
    'Keyword,Current URL,Priority,Volume,KD\n' +
    'import one,/blog/alpha,high,300,40\n' +
    'import two,/blog/not-live,low,10,5\n' +
    'alpha target,/blog/alpha,,10,5\n' +
    'fresh idea one,,,60,3\n' +
    'no page anywhere,,,5,1\n';
  const r = await call('POST', '/api/targets/import', { raw: csv });
  assert.equal(r.status, 200);
  assert.equal(r.value.imported, 2, JSON.stringify(r.value));
  assert.equal(r.value.skipped.length, 3);
  const adopted = store.readJson('state/targets.json').adopted;
  assert.deepEqual(
    adopted.map((a) => [a.keyword, a.page, a.priority, a.source]),
    [
      ['import one', '/blog/alpha', 'high', 'import'],
      ['fresh idea one', '/blog/alpha', null, 'import'],
    ]
  );
});

test('a long reason is cut to 160 characters', async () => {
  seed();
  const longPage = `/blog/${'z'.repeat(400)}`;
  const r = await call('POST', '/api/targets/import', { raw: `keyword,page\nlong one,${longPage}\n` });
  assert.equal(r.value.imported, 0);
  assert.equal(r.value.skipped.length, 1);
  assert.ok(r.value.skipped[0].why.length <= 160);
  assert.match(r.value.skipped[0].why, /\.\.\.$/);
});

test('at most 2,000 added keywords and 5,000 ignored ones; past that is a plain 400', async () => {
  seed();
  const many = (n, prefix) =>
    Array.from({ length: n }, (_, i) => ({
      keyword: `${prefix} ${i}`,
      page: '/pricing',
      priority: null,
      intentGroup: null,
      source: 'import',
      addedOn: '2026-11-01',
    }));
  store.writeJson('state/targets.json', { adopted: many(1999, 'old'), ignored: [], priorities: {} });
  invalidate();
  const two = await call('POST', '/api/targets/adopt', {
    body: {
      items: [
        { keyword: 'new one', page: '/pricing' },
        { keyword: 'new two', page: '/pricing' },
      ],
    },
  });
  assert.equal(two.status, 400);
  assert.match(two.error, /2,000/);
  assert.equal(store.readJson('state/targets.json').adopted.length, 1999, 'nothing was saved');
  assert.equal(
    (await call('POST', '/api/targets/adopt', { body: { items: [{ keyword: 'new one', page: '/pricing' }] } })).status,
    200
  );
  const imp = await call('POST', '/api/targets/import', { raw: 'keyword,page\nimported one,/pricing\n' });
  assert.equal(imp.status, 400);
  assert.match(imp.error, /2,000/);

  store.writeJson('state/targets.json', {
    adopted: [],
    ignored: Array.from({ length: 4999 }, (_, i) => `ignored ${i}`),
    priorities: {},
  });
  invalidate();
  assert.equal(
    (await call('POST', '/api/targets/ignore', { body: { keywords: ['one more', 'and another'] } })).status,
    400
  );
  assert.equal((await call('POST', '/api/targets/ignore', { body: { keywords: ['one more'] } })).status, 200);
});

test('export gives one CSV of every target', async () => {
  seed();
  const r = await call('GET', '/api/export/targets-all.csv');
  assert.equal(r.res.status, 200);
  assert.match(r.res.headers['Content-Disposition'], /seo-desk-targets-all-2026-11-10\.csv/);
  const text = Buffer.from(r.res.sent).toString('utf8');
  const lines = text.trim().split('\r\n');
  assert.equal(lines.length, 4);
  assert.match(lines[0], /^Keyword,Page,/);
  assert.match(text, /alpha target/);
});

test('ranking uses the target priority, strategic keywords and visitor interest', () => {
  seed();
  store.writeJson('state/targets.json', {
    adopted: [],
    ignored: [],
    priorities: { 'alpha target': 'low' },
  });
  invalidate();
  const m = buildModel();
  assert.equal(m.targetState.priorities['alpha target'], 'low');
  assert.ok(m.opps.every((o) => o.score.parts.length === 7));
  const withPage = m.opps.filter((o) => o.page === '/blog/alpha');
  for (const o of withPage) {
    assert.equal(o.signals.outcome, 1, '7 events in 80 sessions');
  }
});

// ---------------------------------------------------------------- settings and visitors

test('settings accept the new keys, validate them, and show defaults', () => {
  seed();
  const d = settingsView(buildModel());
  assert.deepEqual([d.strategicKeywords, d.paused, d.weeklyAudit, d.showGoogleUpdates], [[], false, false, true]);
  assert.ok(d.presets.some((p) => p.key === 'interest-signals-first'));
  assert.ok(d.signals.some((s) => s.key === 'outcome' && s.label === 'Interest from visitors'));

  changeSettings({ strategicKeywords: ['  A  ', 'b'], paused: true, weeklyAudit: true, showGoogleUpdates: false });
  const s = loadSettings();
  assert.deepEqual(s.strategicKeywords, ['A', 'b']);
  assert.equal(s.paused, true);
  assert.equal(s.weeklyAudit, true);
  assert.equal(s.showGoogleUpdates, false);
  assert.equal(changeSettings({ paused: false }).paused, false);
  assert.deepEqual(loadSettings().strategicKeywords, ['A', 'b'], 'untouched keys stay');

  const fails = (body) =>
    assert.throws(
      () => changeSettings(body),
      (e) => e.status === 400
    );
  fails({ paused: 'yes' });
  fails({ weeklyAudit: 1 });
  fails({ showGoogleUpdates: null });
  fails({ strategicKeywords: 'one' });
  fails({ strategicKeywords: [1] });
  fails({ strategicKeywords: ['x'.repeat(121)] });
  fails({ strategicKeywords: Array.from({ length: 201 }, (_, i) => `k${i}`) });
  assert.equal(changeSettings({ strategicKeywords: [] }).strategicKeywords.length, 0);
  assert.equal(
    changeSettings({ strategicKeywords: Array.from({ length: 200 }, (_, i) => `k${i}`) }).strategicKeywords.length,
    200
  );
  changeSettings({ strategicKeywords: [] });
});

test('old saved custom weights without the new signal stay summing to 1', () => {
  seed();
  store.writeJson('state/settings.json', {
    preset: 'custom',
    weights: { demand: 0.3, distance: 0.2, importance: 0.2, confidence: 0.1, effort: 0.1, ai: 0.1 },
  });
  invalidate();
  const w = loadSettings().weights;
  assert.equal(w.outcome, 0);
  assert.ok(Math.abs(Object.values(w).reduce((a, b) => a + b, 0) - 1) < 1e-9);
  fs.rmSync(path.join(DATA, 'state/settings.json'));
  invalidate();
});

test('visitors returns the outcome, source, country and device panels', () => {
  seed();
  const v = visitorsView(buildModel());
  assert.deepEqual(v.outcomes.rows[0], {
    page: '/blog/alpha',
    events: 7,
    sessions: 80,
    signal: 1,
    links: v.outcomes.rows[0].links,
  });
  const beta = v.outcomes.rows.find((r) => r.page === '/blog/beta');
  assert.equal(beta.signal, null, 'under 30 sessions');
  assert.equal(v.outcomes.minSessions, 30);
  assert.match(v.outcomes.note, /interest signals, not sales/);
  assert.deepEqual(
    v.sourceMedium.rows.map((r) => r.name),
    ['google / organic', '(direct) / (none)']
  );
  assert.equal(v.sourceMedium.rows[0].label, 'google / organic');
  assert.equal(v.sourceMedium.rows[1].label, 'Direct');
  assert.equal(v.countries.rows[1].label, 'Not recorded');
  assert.equal(v.devices.rows[0].sessions, 40);
  assert.equal(v.devices.rows[0].change, 33.3);
  assert.equal(v.devices.rows[0].share, 0.678);
  assert.equal(v.devices.available, true);
});

test('visitors on an older snapshot says the new panels need the next refresh', () => {
  seed();
  const s = store.readJson('snap/ga4.json');
  for (const k of ['outcomes', 'sourceMedium', 'countries', 'devices']) delete s.data[k];
  store.writeJson('snap/ga4.json', s);
  invalidate();
  const v = visitorsView(buildModel());
  assert.deepEqual(v.outcomes.rows, []);
  assert.equal(v.devices.available, false);
});

// ---------------------------------------------------------------- through a real server

async function withServer(fn) {
  const server = createServer({ autoRefresh: false });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  try {
    await fn(port);
  } finally {
    await new Promise((r) => server.close(r));
  }
}

function send(port, method, pathname, { body, headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const data = body === undefined ? null : typeof body === 'string' ? body : JSON.stringify(body);
    const req = http.request(
      {
        host: '127.0.0.1',
        port,
        method,
        agent: false,
        path: pathname,
        headers: {
          // DELETE sends no length of its own, so say it.
          ...(data !== null ? { 'Content-Length': Buffer.byteLength(data) } : {}),
          ...(data !== null && typeof body !== 'string' ? { 'Content-Type': 'application/json' } : {}),
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
            // Not JSON (a CSV, say).
          }
          resolve({ status: res.statusCode, json, text });
        });
      }
    );
    req.on('error', reject);
    if (data !== null) req.write(data);
    req.end();
  });
}

test('through a real server: PUT and DELETE /api/targets', async () => {
  seed();
  await withServer(async (port) => {
    assert.equal(
      (await send(port, 'POST', '/api/targets/adopt', { body: { items: [{ keyword: 'live one', page: '/pricing' }] } }))
        .status,
      200
    );
    const put = await send(port, 'PUT', '/api/targets', {
      body: { keyword: 'live one', page: '/blog/beta', priority: 'high', intentGroup: 'g' },
    });
    assert.equal(put.status, 200);
    assert.deepEqual(put.json, { keyword: 'live one', page: '/blog/beta', priority: 'high', intentGroup: 'g' });
    const reg = await send(port, 'PUT', '/api/targets', { body: { keyword: 'alpha target', page: '/pricing' } });
    assert.equal(reg.status, 400);
    assert.match(reg.json.error, /keyword file/);
    assert.equal(
      (await send(port, 'PUT', '/api/targets', { body: { keyword: 'alpha target', priority: 'low' } })).status,
      200
    );
    const list = (await send(port, 'GET', '/api/targets')).json.rows;
    assert.equal(list.find((r) => r.keyword === 'alpha target').priority, 'low');
    assert.equal(list.find((r) => r.keyword === 'live one').page, '/blog/beta');
    assert.equal((await send(port, 'DELETE', '/api/targets', { body: { keyword: 'alpha target' } })).status, 400);
    assert.equal((await send(port, 'DELETE', '/api/targets', { body: { keyword: 'nobody' } })).status, 404);
    const gone = await send(port, 'DELETE', '/api/targets', { body: { keyword: 'live one' } });
    assert.equal(gone.status, 200);
    assert.ok(!(await send(port, 'GET', '/api/targets')).json.rows.some((r) => r.keyword === 'live one'));
  });
});

test('through a real server: the import takes a normal file, refuses one over 2 MB and refuses a cross-site post', async () => {
  seed();
  await withServer(async (port) => {
    const ok = await send(port, 'POST', '/api/targets/import', {
      body: 'keyword,page\nreal import,/pricing\n',
      headers: { 'Content-Type': 'text/csv' },
    });
    assert.equal(ok.status, 200);
    assert.equal(ok.json.imported, 1);

    // A declared length over the cap is refused before any of the body is read.
    const got = await new Promise((resolve, reject) => {
      const sock = net.connect(port, '127.0.0.1', () =>
        sock.write(
          `POST /api/targets/import HTTP/1.1\r\nHost: 127.0.0.1:${port}\r\nContent-Type: text/csv\r\nContent-Length: ${2 * 1024 * 1024 + 1}\r\n\r\n`
        )
      );
      let text = '';
      sock.on('data', (d) => {
        text += d;
        if (/^HTTP\/1\.1 \d{3}/.test(text)) {
          sock.destroy();
          resolve(text);
        }
      });
      sock.on('error', reject);
      setTimeout(() => (sock.destroy(), resolve(text)), 3000).unref();
    });
    assert.match(got, /^HTTP\/1\.1 413/);

    const cross = await send(port, 'POST', '/api/targets/import', {
      body: 'keyword,page\nevil,/pricing\n',
      headers: { 'Content-Type': 'text/csv', Origin: 'http://evil.test' },
    });
    assert.equal(cross.status, 403);
    assert.ok(!store.readJson('state/targets.json').adopted.some((a) => a.keyword === 'evil'));
    // The server still answers afterwards.
    assert.equal((await send(port, 'GET', '/api/targets')).status, 200);
  });
});

test('through a real server: /api/sources rows say whether the desk is paused', async () => {
  seed();
  await withServer(async (port) => {
    assert.ok((await send(port, 'GET', '/api/sources')).json.every((r) => r.paused === false));
    store.writeJson('state/settings.json', { paused: true });
    assert.ok((await send(port, 'GET', '/api/sources')).json.every((r) => r.paused === true));
    fs.rmSync(path.join(DATA, 'state/settings.json'));
  });
});
