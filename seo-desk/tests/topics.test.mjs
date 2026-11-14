import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Everything here is synthetic: invented searches, invented pages, a temp data folder and a temp
// "repo". No network, no real server.

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-topics-'));
const DATA = path.join(root, 'data');
const REPO = path.join(root, 'repo');
fs.mkdirSync(path.join(DATA, 'snap'), { recursive: true });
fs.mkdirSync(path.join(DATA, 'state'), { recursive: true });
process.env.SEO_DESK_DATA = DATA;
process.env.SEO_DESK_REPO = REPO;
process.env.SEO_DESK_TODAY = '2026-11-10';

const { tokens, topicsOf, groupTopics, keywordMap, BRAND_LABEL } = await import('../lib/topics.mjs');
const { linkSuggestions, loadPosts, suggestionKey } = await import('../lib/links.mjs');
const { routes } = await import('../lib/api/ext/topics.mjs');
const { invalidate } = await import('../lib/api/model.mjs');

const row = (query, page, impressions, position = 8, clicks = 0) => ({ query, page, impressions, position, clicks });

after(() => fs.rmSync(root, { recursive: true, force: true }));

// ---------------------------------------------------------------- tokens

test('tokens: lower case, punctuation gone, stop words and one-letter words dropped, plurals trimmed', () => {
  assert.deepEqual(tokens('How to Schedule Nurses, in a Hospital?'), ['schedule', 'nurse', 'hospital']);
  assert.deepEqual(tokens('12-hour shifts!'), ['12', 'hour', 'shift']);
  assert.deepEqual(tokens('x y z'), []);
  assert.deepEqual(tokens('Nurse nurses NURSE'), ['nurse']); // repeated words count once
  assert.deepEqual(tokens('boxes and classes'), ['box', 'class']);
  assert.deepEqual(tokens('status analysis'), ['status', 'analysis']); // not plurals
  assert.deepEqual(tokens(''), []);
  assert.deepEqual(tokens(null), []);
});

// ---------------------------------------------------------------- topicsOf

const NURSE = [
  row('nurse scheduling software', '/pricing', 400, 6),
  row('best nurse scheduling software', '/blog/best', 150, 9),
  row('nurse scheduling software texas', '/blog/best', 60, 12),
  row('hospital shift pay rules', '/blog/pay', 90, 14),
  row('shift pay rules for nurses', '/blog/pay', 40, 11),
];

test('topicsOf: searches that share two words group together; the busiest search seeds and names the topic', () => {
  const topics = topicsOf(NURSE, { brands: [] });
  assert.equal(topics.length, 2);
  const [a, b] = topics;
  assert.equal(a.label, 'nurse scheduling software');
  assert.deepEqual(
    a.queries.map((x) => x.query),
    ['nurse scheduling software', 'best nurse scheduling software', 'nurse scheduling software texas']
  );
  assert.equal(a.impressions, 610);
  assert.equal(b.label, 'hospital shift pay rules');
  assert.equal(b.impressions, 130);
  assert.equal(a.id.length, 12);
  assert.match(a.id, /^[0-9a-f]{12}$/);
});

test('topicsOf: sharing only one word is not enough', () => {
  const topics = topicsOf([row('nurse scheduling software', '/a', 100), row('nurse salary texas', '/b', 90)], {
    brands: [],
  });
  assert.equal(topics.length, 2);
});

test('topicsOf: every search lands in exactly one topic', () => {
  const rows = [
    ...NURSE,
    row('shift pay rules nurse scheduling', '/blog/pay', 20),
    row('nurse scheduling rules', '/blog/pay', 15),
    row('simplescheduleai login', '/', 70),
  ];
  const topics = topicsOf(rows, { brands: ['simplescheduleai'] });
  const seen = topics.flatMap((t) => t.queries.map((x) => x.query));
  assert.equal(seen.length, new Set(seen).size);
  assert.equal(seen.length, rows.length - 0); // nothing dropped: every row has two usable words or is a brand
});

test('topicsOf: a search with two pages is one search in the topic, with views added and the main page named', () => {
  const [t] = topicsOf(
    [row('nurse scheduling software', '/a', 300, 5), row('nurse scheduling software', '/b', 100, 15)],
    { brands: [] }
  );
  assert.equal(t.queries.length, 1);
  assert.equal(t.queries[0].impressions, 400);
  assert.equal(t.queries[0].page, '/a');
  assert.equal(t.queries[0].position, 7.5); // weighted by views
  assert.deepEqual(t.pages, [
    { page: '/a', impressions: 300, share: 0.75 },
    { page: '/b', impressions: 100, share: 0.25 },
  ]);
});

test('topicsOf: ids are the same on a second run and when the input arrives in another order', () => {
  const one = topicsOf(NURSE, { brands: [] });
  const two = topicsOf([...NURSE].reverse(), { brands: [] });
  assert.deepEqual(
    one.map((t) => t.id),
    two.map((t) => t.id)
  );
  assert.deepEqual(one, two);
});

test('topicsOf: Review Focus 4, one-word searches do not collapse into a topic of everything', () => {
  const rows = [
    row('scheduling', '/a', 500),
    row('nurse', '/a', 200),
    row('staffing', '/a', 29), // too small to be its own topic
    row('payroll', '/b', 30), // exactly 30 views: its own topic
  ];
  const topics = topicsOf(rows, { brands: [] });
  assert.deepEqual(topics.map((t) => t.label).sort(), ['nurse', 'payroll', 'scheduling']);
  assert.ok(topics.every((t) => t.queries.length === 1));
});

test('topicsOf: a core of fixed words stops one common word chaining searches into one big topic', () => {
  const rows = [];
  for (let i = 0; i < 60; i++) rows.push(row(`nurse topic${i} word${i}`, '/a', 100 - i));
  for (let i = 0; i < 60; i++) rows.push(row(`nurse topic${i} thing${i}`, '/a', 40 - (i % 30)));
  const topics = topicsOf(rows, { brands: [] });
  const biggest = Math.max(...topics.map((t) => t.queries.length));
  assert.ok(biggest <= 3, `largest topic has ${biggest} searches`);
  assert.ok(topics.length >= 50);
});

test('topicsOf: Review Focus 4, searches in other languages group and never throw', () => {
  const rows = [
    row('horario enfermería turnos', '/es', 80),
    row('horarios de enfermería turnos hospital', '/es', 30),
    row('护士 排班 软件', '/zh', 50),
    row('护士排班软件', '/zh', 20),
    row('🙂 !!! ???', '/x', 99),
    row('   ', '/x', 99),
    row('', '/x', 99),
  ];
  const topics = topicsOf(rows, { brands: [] });
  const spanish = topics.find((t) => t.label === 'horario enfermería turnos');
  assert.ok(spanish);
  assert.equal(spanish.queries.length, 2);
  assert.ok(topics.length >= 3);
});

test('topicsOf: Review Focus 4, brand searches stay together and apart from everything else', () => {
  const rows = [
    row('simplescheduleai pricing', '/pricing', 40),
    row('m7 health reviews', '/b', 25),
    row('nurse scheduling software', '/pricing', 400),
    row('simplescheduleai nurse scheduling software', '/pricing', 30),
  ];
  const topics = topicsOf(rows, { brands: ['simplescheduleai', 'm7 health'] });
  const brand = topics.filter((t) => t.label === BRAND_LABEL);
  assert.equal(BRAND_LABEL, 'Searches for a brand name');
  assert.equal(brand.length, 1);
  assert.equal(brand[0].queries.length, 3);
  assert.equal(brand[0].impressions, 95);
  const other = topics.find((t) => t.label === 'nurse scheduling software');
  assert.equal(other.queries.length, 1);
  assert.equal(brand[0].targeted, false);
});

test('topicsOf: two pages that each hold a fifth of the views are competing', () => {
  const mk = (a, b) =>
    topicsOf([row('nurse scheduling software', '/a', a), row('best nurse scheduling software', '/b', b)], {
      brands: [],
    })[0];
  assert.equal(mk(50, 50).competing, true);
  assert.equal(mk(80, 20).competing, true); // exactly 20 percent
  assert.equal(mk(81, 19).competing, false);
  assert.equal(mk(100, 0).competing, false);
});

test('topicsOf: a registry or adopted keyword marks the topic targeted and names its page', () => {
  const targets = [
    { keyword: 'Nurse Scheduling Software Texas', page: '/pricing' },
    { keyword: 'payroll', page: '/blog/payroll' }, // matches nothing
  ];
  const topics = topicsOf(NURSE, { brands: [], targets });
  assert.equal(topics[0].targeted, true);
  assert.equal(topics[0].targetPage, '/pricing');
  assert.equal(topics[1].targeted, false);
  assert.equal(topics[1].targetPage, null);
  // an exact one-word keyword marks the topic that has that search
  const one = topicsOf([row('payroll', '/b', 60)], { brands: [], targets });
  assert.equal(one[0].targeted, true);
  assert.equal(one[0].targetPage, '/blog/payroll');
});

test('topicsOf: a long seed does not absorb a search that shares only two of its words', () => {
  const rows = [
    row('alpha beta gamma delta epsilon', '/a', 100),
    row('alpha beta zeta eta theta iota', '/b', 50), // shares 2 of its own 6 words
    row('alpha beta gamma delta', '/a', 40), // a close variant: shares 4 of 4
  ];
  const topics = topicsOf(rows, { brands: [] });
  assert.equal(topics.length, 2);
  assert.deepEqual(
    topics.find((t) => t.label === 'alpha beta gamma delta epsilon').queries.map((x) => x.query),
    ['alpha beta gamma delta epsilon', 'alpha beta gamma delta']
  );
});

test('topicsOf: a short search does not join a long topic it only touches (shared words under half the core)', () => {
  const topics = topicsOf(
    [row('aa1 bb1 cc1 dd1 ee1 ff1', '/a', 100), row('aa1 bb1', '/b', 50), row('aa1 bb1 cc1 dd1 ee1', '/b', 20)],
    { brands: [] }
  );
  assert.equal(topics.length, 2);
  assert.equal(topics[0].queries.length, 2); // the five word variant joins (5 of 6), the two word one does not
});

test('topicsOf: a keyword that loosely overlaps a long core does not mark the topic targeted', () => {
  const rows = [row('alpha beta gamma delta epsilon', '/a', 100)];
  const loose = topicsOf(rows, { brands: [], targets: [{ keyword: 'alpha beta zeta eta theta iota', page: '/x' }] });
  assert.equal(loose[0].targeted, false);
  const close = topicsOf(rows, { brands: [], targets: [{ keyword: 'alpha beta gamma delta zeta', page: '/x' }] });
  assert.equal(close[0].targeted, true);
});

test('groupTopics: counts the rare one-word searches it leaves out', () => {
  const { topics, ungrouped } = groupTopics(
    [row('payroll', '/a', 10), row('staffing', '/a', 5), row('scheduling', '/a', 30), row('nurse pay rules', '/a', 50)],
    { brands: [] }
  );
  assert.equal(topics.length, 2);
  assert.deepEqual(ungrouped, { searches: 2, impressions: 15 });
});

test('topicsOf: empty and junk input give no topics and no error', () => {
  assert.deepEqual(topicsOf([], { brands: [] }), []);
  assert.deepEqual(topicsOf(undefined), []);
  assert.deepEqual(topicsOf([{ page: '/a', impressions: 4 }, null], {}), []);
});

// ---------------------------------------------------------------- keywordMap

test('keywordMap: searches by page, busiest first, positions weighted', () => {
  const map = keywordMap([
    row('a b', '/p1', 10, 4),
    row('c d', '/p1', 30, 8),
    row('a b', '/p2', 5, 20),
    row('c d', '/p1', 10, 12),
  ]);
  assert.deepEqual(
    map.map((m) => [m.page, m.impressions]),
    [
      ['/p1', 50],
      ['/p2', 5],
    ]
  );
  assert.deepEqual(map[0].queries, [
    { query: 'c d', impressions: 40, position: 9 },
    { query: 'a b', impressions: 10, position: 4 },
  ]);
});

// ---------------------------------------------------------------- linkSuggestions

const TARGET = '/blog/target';
const posts = [
  { page: '/blog/a', text: 'We cover Nurse Scheduling Software in this guide. It helps small hospitals.' },
  { page: '/blog/b', text: 'Our [nurse scheduling software](/blog/target) page explains the details.' },
  { page: '/blog/c', text: 'Read <a href="/blog/target">the target</a>. Nurse scheduling software is also here.' },
  { page: '/blog/d', text: 'Try https://simplescheduleai.com/blog/target/ now. More nurse scheduling software talk.' },
  { page: TARGET, text: 'This page is about nurse scheduling software itself.' },
  { page: '/blog/e', text: 'Nothing relevant here at all.' },
  { page: '/blog/f', text: 'A nurse scheduling software tool, then another nurse scheduling software tool.' },
  { page: '/blog/g', text: 'See [nurse scheduling software](/pricing) for cost.' }, // phrase already inside a link elsewhere
];

test('linkSuggestions: pages that mention the keyword and do not link yet, anchor as written', () => {
  const out = linkSuggestions({
    targetPage: TARGET,
    keyword: 'nurse scheduling software',
    posts,
    inbound: {},
    impressions: { '/blog/a': 10, '/blog/f': 50 },
  });
  assert.deepEqual(
    out.map((s) => s.from),
    ['/blog/f', '/blog/a']
  ); // ranked by the from page's views
  assert.ok(out.every((s) => s.to === TARGET));
  assert.equal(out[1].anchor, 'Nurse Scheduling Software'); // original case kept
  assert.equal(out[0].anchor, 'nurse scheduling software');
  assert.ok(out[1].context.includes('We cover Nurse Scheduling Software in this guide.'));
  assert.ok(!out[1].context.includes('It helps'));
});

test('linkSuggestions: pages that already link (markdown, href, full address) and the page itself are left out', () => {
  const froms = linkSuggestions({ targetPage: TARGET, keyword: 'nurse scheduling software', posts, inbound: {} }).map(
    (s) => s.from
  );
  for (const gone of ['/blog/b', '/blog/c', '/blog/d', TARGET, '/blog/e', '/blog/g'])
    assert.ok(!froms.includes(gone), gone);
});

test('linkSuggestions: the inbound table also rules a page out', () => {
  const froms = linkSuggestions({
    targetPage: TARGET,
    keyword: 'nurse scheduling software',
    posts,
    inbound: { [TARGET]: ['/blog/a'] },
  }).map((s) => s.from);
  assert.ok(!froms.includes('/blog/a'));
  assert.ok(froms.includes('/blog/f'));
});

test('linkSuggestions: the two-or-more-word core of a keyword counts, with plural forms', () => {
  const out = linkSuggestions({
    targetPage: TARGET,
    keyword: 'how to schedule nurses',
    posts: [
      { page: '/blog/x', text: 'You can Schedule Nurses with a rota.' },
      { page: '/blog/y', text: 'Schedule one nurse.' },
    ],
    inbound: {},
  });
  assert.deepEqual(
    out.map((s) => [s.from, s.anchor]),
    [['/blog/x', 'Schedule Nurses']]
  );
});

test('linkSuggestions: a hyphen counts as a space in the phrase', () => {
  const out = linkSuggestions({
    targetPage: TARGET,
    keyword: '12 hour nurse schedule',
    posts: [{ page: '/blog/x', text: 'The 12-hour nurse schedule is common.' }],
    inbound: {},
  });
  assert.equal(out[0].anchor, '12-hour nurse schedule');
});

test('linkSuggestions: text inside code or inside a link to another page is not offered', () => {
  const out = linkSuggestions({
    targetPage: TARGET,
    keyword: 'nurse scheduling software',
    posts: [
      { page: '/blog/x', text: 'Use `nurse scheduling software` here.\n\n```\nnurse scheduling software\n```' },
      { page: '/blog/y', text: 'A <a href="/pricing">nurse scheduling software</a> link.' },
    ],
    inbound: {},
  });
  assert.deepEqual(out, []);
});

test('linkSuggestions: context is cut to 160 characters around the phrase', () => {
  const long = `${'word '.repeat(60)}nurse scheduling software${' more'.repeat(60)}.`;
  const [s] = linkSuggestions({
    targetPage: TARGET,
    keyword: 'nurse scheduling software',
    posts: [{ page: '/blog/x', text: long }],
    inbound: {},
  });
  assert.ok(s.context.length <= 160, String(s.context.length));
  assert.ok(s.context.includes('nurse scheduling software'));
});

test('linkSuggestions: markdown marks are removed from the context and em dashes become commas', () => {
  const [s] = linkSuggestions({
    targetPage: TARGET,
    keyword: 'nurse scheduling software',
    posts: [
      {
        page: '/blog/x',
        text: 'See **our guide** and [a link](/other) on nurse scheduling software — it is short.',
      },
    ],
    inbound: {},
  });
  assert.equal(s.context, 'See our guide and a link on nurse scheduling software, it is short.');
});

test('linkSuggestions: max caps the list; no keyword or no target gives nothing', () => {
  const many = Array.from({ length: 9 }, (_, i) => ({ page: `/blog/p${i}`, text: 'nurse scheduling software.' }));
  assert.equal(linkSuggestions({ targetPage: TARGET, keyword: 'nurse scheduling software', posts: many }).length, 5);
  assert.equal(
    linkSuggestions({ targetPage: TARGET, keyword: 'nurse scheduling software', posts: many, max: 2 }).length,
    2
  );
  assert.deepEqual(linkSuggestions({ targetPage: TARGET, keyword: '', posts: many }), []);
  assert.deepEqual(linkSuggestions({ targetPage: '', keyword: 'x y', posts: many }), []);
});

test('linkSuggestions: the raw text of a page decides whether it already links (pages stored without tags)', () => {
  const out = linkSuggestions({
    targetPage: TARGET,
    keyword: 'nurse scheduling software',
    posts: [{ page: '/blog/x', text: 'Nurse scheduling software here.', raw: '<a href="/blog/target">x</a>' }],
    inbound: {},
  });
  assert.deepEqual(out, []);
});

test('linkSuggestions: each file is blanked to prose once while it is unchanged, and again after an edit', async () => {
  const { proseStats } = await import('../lib/links.mjs');
  const post = { page: '/blog/cache-one', text: 'Some text about best nurse scheduling software here.' };
  const before = proseStats.computed;
  for (let i = 0; i < 3; i++)
    linkSuggestions({ targetPage: TARGET, keyword: 'best nurse scheduling software', posts: [post] });
  linkSuggestions({ targetPage: '/blog/other', keyword: 'nurse scheduling', posts: [post] });
  assert.equal(proseStats.computed - before, 1, 'one blanking for four calls');
  // A changed file is a new entry from loadPosts; a changed text on the same object is read again too.
  post.text = 'Now it says shift swap rules instead.';
  assert.deepEqual(
    linkSuggestions({ targetPage: TARGET, keyword: 'best nurse scheduling software', posts: [post] }),
    []
  );
  assert.equal(proseStats.computed - before, 2);
});

test('suggestionKey joins the two pages', () => {
  assert.equal(suggestionKey('/a', '/b'), '/a|/b');
});

// ---------------------------------------------------------------- loadPosts

const LP = path.join(root, 'lp');
function write(rel, text, base = LP) {
  const file = path.join(base, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
  return file;
}

test('loadPosts: front matter stripped, drafts skipped, pages and articles read, route brackets skipped', () => {
  write('src/data/post/live-one.md', '---\ndraft: false\ntitle: "T"\n---\nBody of the live one.\n');
  write('src/data/post/draft-one.md', '---\ndraft: true\ntitle: "D"\n---\nBody of the draft.\n');
  write('src/data/post/live-two.mdx', '---\ntitle: "No draft key"\n---\nimport X from "x";\nBody two.\n');
  write('src/data/article/news-one.md', '---\ndraft: false\n---\nArticle body.\n');
  write(
    'src/pages/pricing.astro',
    '---\nconst a = 1;\n---\n<Layout><h1>Pricing</h1><p>Plain <strong>nurse scheduling</strong> price.</p><script>var z=1</script></Layout>'
  );
  write('src/pages/[...blog]/index.astro', '<p>Route page</p>');
  write('src/pages/about/index.astro', '<p>About us.</p>');
  const posts = loadPosts(LP);
  const by = Object.fromEntries(posts.map((p) => [p.page, p]));
  assert.deepEqual(Object.keys(by).sort(), [
    '/about',
    '/articles/news-one',
    '/blog/live-one',
    '/blog/live-two',
    '/pricing',
  ]);
  assert.ok(by['/blog/live-one'].text.includes('Body of the live one.'));
  assert.ok(!by['/blog/live-one'].text.includes('draft:'));
  assert.ok(by['/pricing'].text.includes('Plain'));
  assert.ok(!by['/pricing'].text.includes('const a'));
  assert.ok(!by['/pricing'].text.includes('var z'));
  assert.ok(!by['/pricing'].text.includes('<strong>'));
  assert.ok(by['/pricing'].raw.includes('<strong>'));
});

test('loadPosts: cached by file time, so an edit shows and an untouched file is not read again', () => {
  const file = write('src/data/post/cache-me.md', '---\ndraft: false\n---\nfirst text\n');
  const a = loadPosts(LP).find((p) => p.page === '/blog/cache-me');
  const b = loadPosts(LP).find((p) => p.page === '/blog/cache-me');
  assert.equal(a, b); // the same object: not read again
  fs.writeFileSync(file, '---\ndraft: false\n---\nsecond text, longer\n');
  const future = new Date(Date.now() + 5000);
  fs.utimesSync(file, future, future);
  const c = loadPosts(LP).find((p) => p.page === '/blog/cache-me');
  assert.ok(c.text.includes('second text'));
  // a draft flip removes it
  fs.writeFileSync(file, '---\ndraft: true\n---\nhidden\n');
  const later = new Date(Date.now() + 10000);
  fs.utimesSync(file, later, later);
  assert.equal(
    loadPosts(LP).find((p) => p.page === '/blog/cache-me'),
    undefined
  );
});

test('loadPosts: a missing repo gives an empty list', () => {
  assert.deepEqual(loadPosts(path.join(root, 'nowhere')), []);
});

// ---------------------------------------------------------------- routes

const route = (method, p) => routes.find((r) => r.method === method && r.path === p);
const ctxOf = (url, body = null) => {
  const res = {
    headers: null,
    sent: null,
    writeHead(s, h) {
      this.status = s;
      this.headers = h;
    },
    end(d) {
      this.sent = d;
    },
  };
  return { url: new URL(url, 'http://127.0.0.1'), body: async () => body, res };
};

function seedData() {
  const qpCur = [
    row('nurse scheduling software', '/pricing', 400, 6, 9),
    row('best nurse scheduling software', '/blog/best', 150, 9),
    row('nurse scheduling software texas', '/blog/best', 120, 12),
    row('hospital shift pay rules', '/blog/pay', 90, 14),
    row('simplescheduleai login', '/', 70, 1),
    row('payroll', '/blog/pay', 10, 20), // a rare one-word search
  ];
  const qp90 = [...qpCur, row('rural nurse staffing ratios', '/blog/ratios', 500, 15)];
  fs.writeFileSync(
    path.join(DATA, 'snap/gsc.json'),
    JSON.stringify({
      source: 'gsc',
      ok: true,
      status: 'fresh',
      pulledAt: '2026-11-09T06:00:00.000Z',
      through: '2026-11-07',
      error: null,
      data: {
        qpCur,
        qp90,
        qpPrev: [],
        queryCur: [],
        queryPrev: [],
        siteDaily: [],
        pageDaily: [],
        windows: {
          cur: { start: '2026-10-11', end: '2026-11-07' },
          prev: { start: '2026-09-13', end: '2026-10-10' },
          d90: { start: '2026-08-10', end: '2026-11-07' },
        },
      },
    })
  );
  fs.writeFileSync(
    path.join(DATA, 'snap/local.json'),
    JSON.stringify({
      source: 'local',
      ok: true,
      status: 'fresh',
      pulledAt: '2026-11-09T06:00:00.000Z',
      through: '2026-11-09',
      error: null,
      data: {
        registry: [
          {
            slug: 'best',
            type: 'post',
            url: '/blog/best',
            primaryKeyword: 'best nurse scheduling software',
            pillar: null,
          },
        ],
        livePages: ['/pricing', '/blog/best', '/blog/pay', '/blog/guide', '/blog/linked', '/', '/blog/ratios'].map(
          (p) => ({
            page: p,
            lastmod: null,
          })
        ),
        inbound: { '/blog/best': [], '/pricing': [] },
        verdicts: [],
        due: [],
        aeo: [],
        edits: [],
        openWork: [],
        plan: { posts: [], improve: [] },
        competitors: {},
        robots: {},
        warnings: [],
      },
    })
  );
  fs.mkdirSync(path.join(REPO, 'docs/seo'), { recursive: true });
  fs.writeFileSync(path.join(REPO, 'docs/seo/brand-terms.json'), JSON.stringify(['simplescheduleai']));
  write(
    'src/data/post/guide.md',
    '---\ndraft: false\n---\nA guide to best nurse scheduling software for small hospitals.\n',
    REPO
  );
  write(
    'src/data/post/linked.md',
    '---\ndraft: false\n---\nOur [best nurse scheduling software](/blog/best) pick. Best nurse scheduling software again.\n',
    REPO
  );
  write('src/data/post/hidden-draft.md', '---\ndraft: true\n---\nbest nurse scheduling software in a draft.\n', REPO);
  invalidate();
}

before(() => seedData());

test('GET /api/topics: topics from the 28 day pull, with the plain note and the targeted flag', async () => {
  fs.writeFileSync(
    path.join(DATA, 'state/targets.json'),
    JSON.stringify({
      adopted: [{ keyword: 'hospital shift pay rules', page: '/blog/pay', priority: 'high' }],
      ignored: [],
      priorities: {},
    })
  );
  const out = await route('GET', '/api/topics').handler(ctxOf('/api/topics'));
  assert.equal(out.empty, false);
  assert.equal(out.note, 'Topics are searches grouped by the words they share. The grouping is approximate.');
  assert.equal(out.days, 28);
  const labels = out.topics.map((t) => t.label);
  assert.ok(labels.includes('nurse scheduling software'));
  assert.ok(labels.includes(BRAND_LABEL));
  assert.ok(!labels.includes('rural nurse staffing ratios')); // only in the 90 day pull
  const nurse = out.topics.find((t) => t.label === 'nurse scheduling software');
  assert.equal(nurse.targeted, true); // registry keyword
  assert.equal(nurse.targetPage, '/blog/best');
  const pay = out.topics.find((t) => t.label === 'hospital shift pay rules');
  assert.equal(pay.targeted, true); // adopted keyword
  assert.equal(pay.targetPage, '/blog/pay');
  assert.equal(out.total, out.topics.length);
});

test('GET /api/topics?range=90 reads the 90 day pull; a bad range is a 400', async () => {
  const out = await route('GET', '/api/topics').handler(ctxOf('/api/topics?range=90'));
  assert.equal(out.days, 90);
  assert.ok(out.topics.flatMap((t) => t.queries).some((x) => x.query === 'rural nurse staffing ratios'));
  await assert.rejects(
    async () => route('GET', '/api/topics').handler(ctxOf('/api/topics?range=7')),
    (e) => e.status === 400
  );
});

test('GET /api/keyword-map: pages with their searches', async () => {
  const out = await route('GET', '/api/keyword-map').handler(ctxOf('/api/keyword-map'));
  assert.equal(out.pages[0].page, '/pricing');
  assert.equal(out.pages[0].queries[0].query, 'nurse scheduling software');
  assert.equal(out.total, out.pages.length);
});

test('GET /api/link-suggestions?page=: live pages that mention the page keyword, not the ones that link or the drafts', async () => {
  const out = await route('GET', '/api/link-suggestions').handler(ctxOf('/api/link-suggestions?page=/blog/best'));
  assert.equal(out.pages.length, 1);
  const p = out.pages[0];
  assert.equal(p.page, '/blog/best');
  assert.equal(p.keyword, 'best nurse scheduling software');
  assert.deepEqual(
    p.suggestions.map((s) => s.from),
    ['/blog/guide']
  );
  assert.equal(p.suggestions[0].status, 'open');
  assert.equal(p.suggestions[0].anchor, 'best nurse scheduling software');
});

test('POST /api/link-suggestions: done and dismissed are kept, open clears, a bad body is a 400', async () => {
  const post = route('POST', '/api/link-suggestions').handler;
  const get = async () =>
    (await route('GET', '/api/link-suggestions').handler(ctxOf('/api/link-suggestions?page=/blog/best'))).pages[0];
  const done = await post(ctxOf('/api/link-suggestions', { to: '/blog/best', from: '/blog/guide', status: 'done' }));
  assert.equal(done.ok, true);
  const saved = JSON.parse(fs.readFileSync(path.join(DATA, 'state/link-suggestions.json'), 'utf8'));
  assert.equal(saved['/blog/best|/blog/guide'].status, 'done');
  assert.match(saved['/blog/best|/blog/guide'].at, /^\d{4}-\d{2}-\d{2}/);
  assert.equal((await get()).suggestions[0].status, 'done');

  await post(ctxOf('/api/link-suggestions', { to: '/blog/best', from: '/blog/guide', status: 'dismissed' }));
  const p = await get();
  assert.deepEqual(p.suggestions, []); // dismissed ones are hidden
  assert.equal(p.dismissed, 1);

  await post(ctxOf('/api/link-suggestions', { to: '/blog/best', from: '/blog/guide', status: 'open' }));
  assert.equal((await get()).suggestions[0].status, 'open');
  const after = JSON.parse(fs.readFileSync(path.join(DATA, 'state/link-suggestions.json'), 'utf8'));
  assert.deepEqual(after, {});

  for (const bad of [
    { to: 'blog/best', from: '/blog/guide', status: 'done' },
    { to: '/blog/best', from: '', status: 'done' },
    { to: '/blog/best', from: '/blog/guide', status: 'later' },
    {},
  ])
    await assert.rejects(
      async () => post(ctxOf('/api/link-suggestions', bad)),
      (e) => e.status === 400
    );
});

test('GET /api/topics: the rare one-word searches are counted and the list can be cut or filtered', async () => {
  const h = route('GET', '/api/topics').handler;
  const all = await h(ctxOf('/api/topics'));
  assert.deepEqual(all.ungrouped, { searches: 1, impressions: 10 });
  assert.equal(all.ungroupedNote, '1 rare one-word search is not grouped.');
  assert.equal(all.shown, all.topics.length);
  const one = await h(ctxOf('/api/topics?limit=1'));
  assert.equal(one.topics.length, 1);
  assert.equal(one.total, all.total);
  assert.equal(one.topics[0].id, all.topics[0].id); // busiest first
  const lifted = await h(ctxOf('/api/topics?limit=1&all=1'));
  assert.equal(lifted.topics.length, all.total);
  const multi = await h(ctxOf('/api/topics?minSearches=2'));
  assert.ok(multi.topics.length >= 1 && multi.topics.every((t) => t.queries.length >= 2));
  assert.ok(multi.total < all.total);
  for (const bad of ['minSearches=0', 'minSearches=x', 'limit=0'])
    await assert.rejects(
      async () => h(ctxOf(`/api/topics?${bad}`)),
      (e) => e.status === 400
    );
});

test('POST /api/link-suggestions: unknown pages are a 400 and only the newest 2000 marks are kept', async () => {
  const post = route('POST', '/api/link-suggestions').handler;
  await assert.rejects(
    async () => post(ctxOf('/api/link-suggestions', { to: '/blog/best', from: '/blog/nowhere', status: 'done' })),
    (e) => e.status === 400
  );
  await assert.rejects(
    async () => post(ctxOf('/api/link-suggestions', { to: '/blog/nowhere', from: '/blog/guide', status: 'done' })),
    (e) => e.status === 400
  );
  const file = path.join(DATA, 'state/link-suggestions.json');
  const old = {};
  for (let i = 0; i < 2000; i++)
    old[`/x/${i}|/y/${i}`] = { status: 'done', at: new Date(Date.UTC(2026, 0, 1, 0, 0, i)).toISOString() };
  fs.writeFileSync(file, JSON.stringify(old));
  await post(ctxOf('/api/link-suggestions', { to: '/blog/best', from: '/blog/guide', status: 'dismissed' }));
  const saved = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.equal(Object.keys(saved).length, 2000);
  assert.ok(saved['/blog/best|/blog/guide']);
  assert.equal(saved['/x/0|/y/0'], undefined); // the oldest went
  assert.ok(saved['/x/1|/y/1']);
  fs.writeFileSync(file, '{}');
});

test('GET /api/link-suggestions with no page: every page that has a links or near page one item', async () => {
  const out = await route('GET', '/api/link-suggestions').handler(ctxOf('/api/link-suggestions'));
  assert.ok(Array.isArray(out.pages));
  assert.ok(out.pages.every((p) => p.suggestions.length <= 5));
  assert.equal(typeof out.total, 'number');
});

test('GET /api/link-suggestions: a frozen page to edit is marked with its date and listed last', async () => {
  // /blog/pay mentions the keyword and is busier than /blog/guide, but it was edited on purpose on
  // 9 November, so it is being measured until 7 December (the lifecycle freeze).
  write('src/data/post/pay.md', '---\ndraft: false\n---\nWhy best nurse scheduling software matters for pay.\n', REPO);
  fs.writeFileSync(
    path.join(DATA, 'state/items.json'),
    JSON.stringify({
      'low-click-rate:/blog/pay': {
        status: 'done',
        since: '2026-11-09',
        doneAt: '2026-11-09',
        page: '/blog/pay',
        isPageEdit: true,
      },
    })
  );
  invalidate();
  try {
    const out = await route('GET', '/api/link-suggestions').handler(ctxOf('/api/link-suggestions?page=/blog/best'));
    const s = out.pages[0].suggestions;
    assert.deepEqual(
      s.map((x) => x.from),
      ['/blog/guide', '/blog/pay']
    );
    assert.equal(s[0].fromFrozenUntil, null);
    assert.equal(s[1].fromFrozenUntil, '2026-12-07');
    assert.equal(s[1].fromFrozenUntilText, '7 December');
    const c = ctxOf('/api/export/link-suggestions.csv?page=/blog/best');
    await route('GET', '/api/export/link-suggestions.csv').handler(c);
    const lines = c.res.sent.toString('utf8').trim().split(/\r?\n/);
    assert.match(lines[0], /page_to_edit_frozen_until/);
    assert.ok(lines.some((l) => l.includes('/blog/pay') && l.includes('2026-12-07')));
  } finally {
    fs.rmSync(path.join(REPO, 'src/data/post/pay.md'), { force: true });
    fs.writeFileSync(path.join(DATA, 'state/items.json'), '{}');
    invalidate();
  }
});

test('GET /api/export/topics.csv and link-suggestions.csv send a file', async () => {
  const c = ctxOf('/api/export/topics.csv');
  await route('GET', '/api/export/topics.csv').handler(c);
  assert.equal(c.res.status, 200);
  assert.match(c.res.headers['Content-Type'], /text\/csv/);
  assert.match(c.res.headers['Content-Disposition'], /seo-desk-topics-2026-11-10\.csv/);
  const text = c.res.sent.toString('utf8');
  assert.ok(text.startsWith('topic,'));
  assert.ok(text.includes('nurse scheduling software'));
  const c2 = ctxOf('/api/export/link-suggestions.csv?page=/blog/best');
  await route('GET', '/api/export/link-suggestions.csv').handler(c2);
  assert.ok(c2.res.sent.toString('utf8').startsWith('page_to_link_to,'));
});

test('routes on an empty desk answer with empty:true, never an error', async () => {
  fs.rmSync(path.join(DATA, 'snap'), { recursive: true, force: true });
  invalidate();
  const t = await route('GET', '/api/topics').handler(ctxOf('/api/topics'));
  assert.equal(t.empty, true);
  assert.deepEqual(t.topics, []);
  const m = await route('GET', '/api/keyword-map').handler(ctxOf('/api/keyword-map'));
  assert.equal(m.empty, true);
  const l = await route('GET', '/api/link-suggestions').handler(ctxOf('/api/link-suggestions'));
  assert.equal(l.empty, true);
  assert.deepEqual(l.pages, []);
});
