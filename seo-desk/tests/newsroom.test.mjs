import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Package 8 (2026-11-16): the Newsroom page. Every headline, outlet, address and number here is
// invented; hosts end in .example so nothing could be a real site.

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-p8-'));
process.env.SEO_DESK_DATA = path.join(root, 'data');
process.env.SEO_DESK_REPO = path.join(root, 'repo');
process.env.SEO_DESK_TODAY = '2026-11-16';

const news = await import('../lib/news.mjs');

const item = (title, extra = {}) => ({
  title,
  link: `https://outlet.example/${encodeURIComponent(title).slice(0, 40)}`,
  date: '2026-11-14',
  publisher: 'Outlet One',
  description: '',
  feed: 'test',
  ...extra,
});

// ---------------------------------------------------------------- reading feeds

test('feeds: RSS items give title, link, date, publisher and a plain description', () => {
  const xml = `<?xml version="1.0"?><rss><channel><title>Trade Weekly</title>
    <item><title><![CDATA[Valley nurses &amp; the night shift &#124; 2026]]></title>
      <link>https://trade.example/valley-nurses</link>
      <pubDate>Fri, 13 Nov 2026 23:38:49 +0000</pubDate>
      <description><![CDATA[<p>A <b>small</b> hospital&nbsp;story.</p>]]></description></item>
    <item><title><a href="/x" hreflang="en">Linked title text</a></title>
      <link>https://trade.example/linked</link><pubDate>Nov 14, 2026 7:00pm</pubDate></item>
  </channel></rss>`;
  const items = news.parseFeed(xml, { name: 'Trade Weekly' });
  assert.equal(items.length, 2);
  assert.deepEqual(
    { ...items[0], description: items[0].description },
    {
      title: 'Valley nurses & the night shift | 2026',
      link: 'https://trade.example/valley-nurses',
      date: '2026-11-13',
      publisher: 'Trade Weekly',
      description: 'A small hospital story.',
    }
  );
  assert.equal(items[1].title, 'Linked title text');
  assert.equal(items[1].date, '2026-11-14');
});

test('feeds: Atom entries are read too, and a news search title is split into title and publisher', () => {
  const atom = `<feed><title>Atom Desk</title><entry><title>Rural clinic opens</title>
    <link rel="alternate" href="https://atom.example/clinic"/><updated>2026-11-10T08:00:00Z</updated>
    <summary>Short &lt;i&gt;summary&lt;/i&gt;</summary></entry></feed>`;
  const [e] = news.parseFeed(atom, { name: 'Atom Desk' });
  assert.equal(e.link, 'https://atom.example/clinic');
  assert.equal(e.date, '2026-11-10');
  assert.equal(e.description, 'Short summary');

  const gn = `<rss><channel><item><title>County hospital cuts beds - The Valley Ledger</title>
    <link>https://news.google.com/rss/articles/abc?oc=5</link><pubDate>Thu, 12 Nov 2026 08:00:00 GMT</pubDate>
    <description>&lt;a href="x"&gt;County hospital cuts beds&lt;/a&gt;</description>
    <source url="https://ledger.example">The Valley Ledger</source></item></channel></rss>`;
  const [g] = news.parseFeed(gn, { name: 'Google News', google: true });
  assert.equal(g.title, 'County hospital cuts beds');
  assert.equal(g.publisher, 'The Valley Ledger');
  assert.equal(g.link, 'https://news.google.com/rss/articles/abc?oc=5', 'the redirect address is kept as given');
  assert.deepEqual(news.splitGoogleTitle('A - B story - Ledger'), { title: 'A - B story', publisher: 'Ledger' });
});

test('feeds: only https links are kept, and an item with no title or link is dropped', () => {
  const xml = `<rss><channel><item><title>Plain http</title><link>http://old.example/a</link></item>
    <item><title></title><link>https://x.example/b</link></item>
    <item><title>Script link</title><link>javascript:alert(1)</link></item></channel></rss>`;
  assert.deepEqual(news.parseFeed(xml, { name: 'X' }), []);
});

// ---------------------------------------------------------------- tiers and labels

test('tiers: the relevance gradient, with the words that put a story there', () => {
  const t1 = news.tierOf('Valley hospital faces nurse staffing gap as rural hospital closes ward');
  assert.equal(t1.tier, 1);
  assert.deepEqual(t1.words, ['nurse staffing', 'rural hospital']);
  assert.equal(news.tierText(t1), 'Tier 1: nurse staffing, rural hospital');
  assert.equal(news.tierOf('New rule from the Centers for Medicare on swing beds').tier, 1);
  assert.equal(news.tierOf('Conditions of Participation update for small facilities').tier, 1);
  assert.equal(news.tierOf('Nurses union reaches contract deal').tier, 1);
  assert.equal(news.tierOf('Texas lawmakers debate hospital funding').tier, 1);
  const t2 = news.tierOf('City hospital to close its maternity unit');
  assert.equal(t2.tier, 2);
  assert.deepEqual(t2.words, ['hospital closure']);
  assert.equal(news.tierOf('Hospitals test AI tools for discharge notes').tier, 2);
  assert.equal(news.tierOf('Celebrity chef opens a new restaurant').tier, 3);
});

test('labels: a press release wire or a paid advertisement is not citable as a peg', () => {
  assert.equal(news.isPaid(item('A', { link: 'https://www.globenewswire.com/news/1' })), true);
  assert.equal(news.isPaid(item('A', { publisher: 'PR Newswire' })), true);
  assert.equal(news.isPaid(item('A', { description: 'This is a paid advertisement for a fund.' })), true);
  assert.equal(news.isPaid(item('A', { link: 'https://markets.financialcontent.example/x' })), true);
  assert.equal(news.isPaid(item('A')), false);
  assert.equal(news.PAID_LABEL, 'Press release or paid placement: not citable as a peg, use its primary sources');
});

// ---------------------------------------------------------------- one story, many outlets

test('grouping: the same story from several outlets is one card; a different place is not', () => {
  const a = item('Ridgeview nurses vote to end strike at Lakeshore hospital', { publisher: 'One' });
  const b = item('Lakeshore hospital strike ends as Ridgeview nurses vote', { publisher: 'Two', date: '2026-11-15' });
  const c = item('Nurses strike at Harbor hospital enters second week', { publisher: 'Three' });
  const groups = news.groupStories([a, b, c]);
  assert.equal(groups.length, 2);
  assert.equal(groups.find((g) => g.length === 2).length, 2);
  // Shared words only from the domain (nurse, hospital, strike) never join two stories.
  assert.equal(news.sameStory(news.storyWords(c.title), news.storyWords('Nurses strike at Oakdale hospital')), false);
  assert.equal(news.SAME_STORY.minShared, 2);
});

test('grouping: one outlet is counted once, and a feed copy of the same link is dropped', () => {
  const a = item('Mesa County hospital adds night nurses for winter', { publisher: 'One' });
  const dup = { ...a };
  const again = item('Mesa County hospital adds night nurses for the winter', {
    publisher: 'One',
    link: 'https://one.example/2',
  });
  const [card] = news.storyCards([a, dup, again], { today: '2026-11-16' });
  assert.equal(card.outlets.length, 1);
});

test('scores: relevance from the tier and its words, rising from outlets and how recent, both drafts', () => {
  const today = '2026-11-16';
  const s = news.draftScore(
    { tier: 1, words: ['nurse staffing', 'rural hospital'] },
    ['A', 'B', 'C'],
    '2026-11-15',
    today
  );
  assert.equal(s.relevance, 4);
  assert.equal(s.rising, 3);
  assert.equal(s.product, 12);
  assert.match(s.risingWhy, /3 outlets ran it, the latest on 15 November/);
  assert.equal(news.draftScore({ tier: 2, words: ['AI in healthcare'] }, ['A'], '2026-11-02', today).rising, 1);
  assert.equal(news.draftScore({ tier: 1, words: ['a', 'b', 'c', 'd'] }, ['A'], today, today).relevance, 5);
  const one = news.draftScore({ tier: 2, words: ['hospital closure'] }, ['A'], today, today);
  assert.equal(one.relevance, 2);
  assert.equal(news.TO_CHECK.length, 2);
  assert.deepEqual(
    news.TO_CHECK.map((t) => t.name),
    ['Can we be first', 'Citable hook']
  );
});

test('cards: tier 3 is never a card; cards sort by relevance times rising, newest first on ties', () => {
  const today = '2026-11-16';
  const cards = news.storyCards(
    [
      item('Chef opens restaurant downtown'),
      item('City hospital to close maternity unit', { date: '2026-11-15' }),
      item('Quarry valley rural hospital nurse staffing plan', { date: '2026-11-10' }),
      item('Pine county rural hospital nurse staffing review', { date: '2026-11-15' }),
    ],
    { today }
  );
  assert.deepEqual(
    cards.map((c) => c.title),
    [
      'Pine county rural hospital nurse staffing review',
      'Quarry valley rural hospital nurse staffing plan',
      'City hospital to close maternity unit',
    ]
  );
  assert.ok(cards.every((c) => /^news:[0-9a-f]{12}$/.test(c.id)));
  assert.equal(cards[0].tierText, 'Tier 1: nurse staffing, rural hospital');
});

test('cards: items older than 14 days are left out', () => {
  const cards = news.storyCards([item('Rural hospital nurse staffing plan', { date: '2026-11-01' })], {
    today: '2026-11-16',
  });
  assert.equal(cards.length, 0);
  assert.equal(news.NEWS_DAYS, 14);
});

// ---------------------------------------------------------------- the topic log

const LOG = `# Plan

## Topic queue (held, with reasons)

### HELD - Ridgeview Clinic certification, a peg for a survey piece

- **Held on:** 2026-09-18, founder. **Reconsider:** later.
- **Peg:** Ridgeview Clinic got a certification.
  Source: https://ledger.example/2026/09/ridgeview-certified/

### Detection pass 2026-10-07 (founder-supplied links)

Dropped, with reasons:

- **Harbor Medical data breach** (Gazette 2026-09-28): score 0. Breach was old data theft with no outage.
- Also noted: something else.

### Detection pass 2026-11-06 (founder-supplied link)

- **DROPPED - Gadget Weekly "rural clinics hire security staff"** (Gadget Weekly, November 2026). Score 0:
  Relevance 2 x Rising 1 x First 2 x Hook 0. The piece is about IT staff, not nurses.
- **WRITING - State grant to Mesa valley clinics** (release 2026-11-05). Score 60.

### PARKED - Valley nurse housing

- **Parked on:** 2026-10-24, founder. Score 27.
`;

test('log: held, parked, dropped and writing entries with their dates and reasons', () => {
  const log = news.parseTopicLog(LOG);
  const byTitle = (t) => log.find((e) => e.title.includes(t));
  const held = byTitle('Ridgeview Clinic');
  assert.equal(held.status, 'HELD');
  assert.equal(held.date, '2026-09-18');
  assert.deepEqual(held.links, ['https://ledger.example/2026/09/ridgeview-certified/']);
  const breach = byTitle('Harbor Medical');
  assert.equal(breach.status, 'DROPPED');
  assert.equal(breach.date, '2026-10-07');
  assert.equal(breach.reason, 'Breach was old data theft with no outage.');
  const gadget = byTitle('Gadget Weekly');
  assert.equal(gadget.status, 'DROPPED');
  assert.equal(gadget.date, '2026-11-06');
  assert.equal(gadget.reason, 'The piece is about IT staff, not nurses.');
  assert.equal(byTitle('Mesa valley').status, 'WRITING');
  assert.equal(byTitle('Valley nurse housing').status, 'PARKED');
  assert.equal(byTitle('Valley nurse housing').date, '2026-10-24');
  assert.equal(log.length, 5, 'a bullet with no status and no score 0 is not an entry');
});

// ---------------------------------------------------------------- what we already have

const HAVE = {
  content: [
    {
      page: '/articles/mesa-valley-clinic-grant',
      kind: 'article',
      title: 'What the Mesa valley clinic grant pays for',
      publishDate: '2026-11-09',
    },
    { page: '/blog/night-shift-coverage', kind: 'post', title: 'Night shift coverage math', publishDate: '2026-05-01' },
  ],
  registry: [{ url: '/blog/night-shift-coverage', primaryKeyword: 'night shift coverage winter' }],
  log: news.parseTopicLog(LOG),
  plan: { posts: [{ n: 7, done: false, title: 'Winter census planning', keyword: 'winter census planning' }] },
};

test('have: an article with three shared words covers the story, and the words are shown', () => {
  const card = { title: 'State grant to Mesa valley clinic draws praise', description: '', outlets: [] };
  const lines = news.matchHave(card, HAVE);
  const art = lines.find((l) => l.kind === 'article');
  assert.equal(art.covered, true);
  assert.equal(art.text, 'Covered by /articles/mesa-valley-clinic-grant (published 9 November)');
  assert.deepEqual(art.words, ['clinic', 'grant', 'mesa', 'valley']);
  const log = lines.find((l) => l.kind === 'log');
  assert.equal(log.text, 'Writing since 6 November: State grant to Mesa valley clinics');
  assert.equal(log.decided, true);
});

test('have: a blog post is only ever close, a plan row names its number, and two words are close', () => {
  const card = { title: 'Winter census and night shift coverage strain county clinics', description: '', outlets: [] };
  const lines = news.matchHave(card, HAVE);
  const blog = lines.find((l) => l.kind === 'post');
  assert.equal(blog.text, 'Close to /blog/night-shift-coverage');
  assert.equal(blog.covered, false);
  const plan = lines.find((l) => l.kind === 'plan');
  assert.equal(plan.text, 'In your post plan as #7: Winter census planning');
  assert.deepEqual(news.HAVE_MATCH, { strong: 3, close: 2 });
});

test('have: a story whose outlet link is in the log is matched exactly, with the reason', () => {
  const card = {
    title: 'Something unrelated in wording',
    description: '',
    outlets: [{ url: 'https://ledger.example/2026/09/ridgeview-certified' }],
  };
  const [line] = news.matchHave(card, HAVE);
  assert.equal(line.kind, 'log');
  assert.equal(line.exact, true);
  assert.equal(line.text, 'Held since 18 September: Ridgeview Clinic certification, a peg for a survey piece');
  assert.equal(line.decided, true);
  const dropped = news.matchHave({ title: 'Harbor Medical data breach widens', description: '', outlets: [] }, HAVE);
  assert.equal(
    dropped.find((l) => l.kind === 'log').text,
    'Dropped on 7 October: Breach was old data theft with no outage.'
  );
});

test('have: nothing matches on domain words alone', () => {
  const card = { title: 'Rural hospital nurse staffing shortage worsens', description: '', outlets: [] };
  assert.deepEqual(news.matchHave(card, HAVE), []);
});

// ---------------------------------------------------------------- the brief

test('brief: skill first, the story and outlets, the draft score, what we have, then the steps', () => {
  const card = {
    title: 'State grant to Mesa valley clinic',
    outlets: [{ name: 'One', url: 'https://one.example/a', date: '2026-11-14' }],
    firstDate: '2026-11-14',
    latestDate: '2026-11-14',
    tierText: 'Tier 1: Texas health policy',
    score: { relevance: 3, rising: 1, relevanceWhy: 'x', risingWhy: '1 outlet ran it, the latest on 14 November.' },
    paid: true,
    have: [{ text: 'Covered by /articles/a (published 9 November)', words: ['grant', 'mesa'] }],
  };
  const b = news.newsBrief(card);
  const at = (s) => b.indexOf(s);
  assert.ok(at('Load .claude/skills/trendjacking-articles.md') >= 0);
  assert.ok(at('Load .claude/skills/trendjacking-articles.md') < at('State grant to Mesa valley clinic'));
  assert.ok(at('https://one.example/a') > 0);
  assert.ok(at('Can we be first: to check') > at('Relevance 3 of 5'));
  assert.ok(at('Covered by /articles/a') > at('Citable hook: to check'));
  assert.ok(at(news.PAID_LABEL) > 0);
  assert.ok(at('docs/seo/articles-trendjacking-plan.md') > at('Covered by'));
  assert.match(b, /Write a draft only after the founder says go/);
  assert.doesNotMatch(b, /[–—]/);
});

// ---------------------------------------------------------------- the news source

const src = await import('../lib/sources/news.mjs');

const rss = (title, date, link) =>
  `<rss><channel><title>Feed</title><item><title>${title}</title><link>${link}</link><pubDate>${date}</pubDate></item></channel></rss>`;

test('source: every seed is a 14 day US English news search, and the trade feeds are one list', () => {
  assert.equal(src.SEEDS.length, 14);
  assert.equal(
    src.googleNewsUrl('nurse staffing'),
    'https://news.google.com/rss/search?q=nurse+staffing+when:14d&hl=en-US&gl=US&ceid=US:en'
  );
  assert.ok(src.FEEDS.every((f) => f.url.startsWith('https://')));
  assert.equal(src.FEEDS.filter((f) => !f.google).length, src.TRADE_FEEDS.length);
});

test('source: a failed feed is named in warnings, the rest still count, old items are left out', async () => {
  const feeds = [
    { name: 'Good', url: 'https://good.example/feed', google: false },
    { name: 'Broken', url: 'https://broken.example/feed', google: false },
    { name: 'Search: x', url: 'https://search.example/rss', google: true },
  ];
  const asked = [];
  const fetchImpl = async (url, opts) => {
    asked.push([url, opts.method, opts.headers['user-agent']]);
    if (url.includes('broken')) return new Response('nope', { status: 500 });
    if (url.includes('search'))
      return new Response(
        rss(
          'Mesa hospital adds nurses - The Ledger',
          'Sun, 15 Nov 2026 08:00:00 GMT',
          'https://news.google.com/rss/articles/zz'
        )
      );
    return new Response(
      `<rss><channel><item><title>Fresh one</title><link>https://good.example/a</link><pubDate>Sat, 14 Nov 2026 08:00:00 GMT</pubDate></item>
       <item><title>Old one</title><link>https://good.example/b</link><pubDate>Sun, 25 Oct 2026 08:00:00 GMT</pubDate></item></channel></rss>`
    );
  };
  const snap = await src.pullNews({ today: '2026-11-16', fetchImpl, feeds });
  assert.equal(asked.length, 3, 'one request per feed');
  assert.ok(asked.every(([, m, ua]) => m === 'GET' && /Mozilla/.test(ua)));
  assert.equal(snap.ok, true);
  assert.equal(snap.source, 'news');
  assert.deepEqual(
    snap.data.items.map((i) => [i.title, i.publisher, i.google]),
    [
      ['Fresh one', 'Good', false],
      ['Mesa hospital adds nurses', 'The Ledger', true],
    ]
  );
  assert.equal(snap.data.warnings.length, 1);
  assert.match(snap.data.warnings[0], /^Broken did not answer: it answered 500\.$/);
  assert.deepEqual(
    snap.data.feeds.map((f) => [f.name, f.ok, f.items]),
    [
      ['Good', true, 1],
      ['Broken', false, 0],
      ['Search: x', true, 1],
    ]
  );
});

test('source: a feed over 2 MB or one that is not a feed fails; no feed answering fails the source', async () => {
  const big = 'x'.repeat(64);
  const feeds = [
    { name: 'Huge', url: 'https://huge.example/feed' },
    { name: 'Page', url: 'https://page.example/feed' },
  ];
  const fetchImpl = async (url) =>
    url.includes('huge') ? new Response(`<rss>${big}</rss>`) : new Response('<html><body>hello</body></html>');
  const snap = await src.pullNews({ today: '2026-11-16', fetchImpl, feeds, maxBytes: 32 });
  assert.equal(snap.ok, false);
  assert.equal(snap.status, 'failed');
  assert.match(snap.data.warnings[0], /larger than/);
  assert.match(snap.data.warnings[1], /did not send a feed/);
  assert.match(snap.error, /None of the 2 news feeds answered/);
});

test('source: a feed that never answers is stopped at its time limit', async () => {
  const fetchImpl = (url, { signal }) =>
    new Promise((_, reject) => signal.addEventListener('abort', () => reject(new Error('aborted'))));
  const r = await src.readFeed({ name: 'Slow', url: 'https://slow.example/feed' }, { fetchImpl, timeoutMs: 20 });
  assert.equal(r.ok, false);
  assert.match(r.error, /no answer in 0 seconds|no answer in/);
  assert.equal(src.FEED_TIMEOUT_MS, 20000);
  assert.equal(src.FEED_MAX_BYTES, 2 * 1024 * 1024);
});

// ---------------------------------------------------------------- the repo's own posts and the log

const local = await import('../lib/sources/local.mjs');

test('local: live posts and articles with their titles and dates; drafts and future dates left out', () => {
  const repo = path.join(root, 'content-repo');
  const write = (rel, fm) => {
    fs.mkdirSync(path.dirname(path.join(repo, rel)), { recursive: true });
    fs.writeFileSync(path.join(repo, rel), `---\n${fm}\n---\n\nBody text.\n`);
  };
  write(
    'src/data/article/mesa-grant.md',
    "draft: false\npublishDate: 2026-11-09T00:00:00Z\ntitle: 'Mesa''s grant, explained'"
  );
  write('src/data/post/night-shift.md', 'draft: false\npublishDate: 2026-05-01T00:00:00Z\ntitle: "Night shift math"');
  write('src/data/post/draft-one.md', 'draft: true\npublishDate: 2026-11-01T00:00:00Z\ntitle: Draft');
  write('src/data/post/later.md', 'draft: false\npublishDate: 2026-12-01T00:00:00Z\ntitle: Later');
  assert.deepEqual(local.readContent(repo, '2026-11-16'), [
    { page: '/articles/mesa-grant', kind: 'article', title: "Mesa's grant, explained", publishDate: '2026-11-09' },
    { page: '/blog/night-shift', kind: 'post', title: 'Night shift math', publishDate: '2026-05-01' },
  ]);
  assert.deepEqual(local.parseFrontMatter('no front matter'), { title: null, publishDate: null, draft: false });
});

// ---------------------------------------------------------------- paste a link: the guards

const pf = await import('../lib/sources/page-fetch.mjs');

const PAGE = `<html><head><title>Ignored tag title</title>
  <meta property="og:title" content="Mesa valley clinic adds rural hospital nurse staffing &amp; beds">
  <meta content="The Valley Ledger" property="og:site_name">
  <meta property="article:published_time" content="2026-11-13T09:00:00-06:00">
  <meta name="description" content="A county clinic story."></head><body></body></html>`;

const lookupTo = (address) => {
  const asked = [];
  const fn = async (host) => {
    asked.push(host);
    return [{ address, family: address.includes(':') ? 6 : 4 }];
  };
  fn.asked = asked;
  return fn;
};

test('paste: public, private, link-local and special addresses are told apart', () => {
  for (const ip of ['93.184.216.34', '8.8.8.8', '2606:4700::1111']) assert.equal(pf.isPublicAddress(ip), true, ip);
  for (const ip of [
    '127.0.0.1',
    '10.1.2.3',
    '172.20.0.1',
    '192.168.1.10',
    '169.254.169.254',
    '100.64.0.1',
    '0.0.0.0',
    '224.0.0.1',
    '::1',
    '::',
    'fe80::1',
    'fd00::1',
    '::ffff:127.0.0.1',
    '::ffff:10.0.0.1',
    'not an ip',
  ])
    assert.equal(pf.isPublicAddress(ip), false, ip);
});

test('paste: only https, the normal port, no credentials, no local names', async () => {
  const lookup = lookupTo('93.184.216.34');
  const no = async (u, re) =>
    assert.rejects(pf.checkTarget(u, { lookup }), (e) => e.status === 400 && re.test(e.message));
  await no('http://news.example/a', /Only https/);
  await no('ftp://news.example/a', /Only https/);
  await no('not a url', /not an address/);
  await no('https://news.example:8443/a', /normal https port/);
  await no('https://user:pw@news.example/a', /user name or password/);
  await no('https://localhost/a', /private network/);
  await no('https://desk.localhost/a', /private network/);
  await no('https://intranet/a', /private network/);
  await no('https://127.0.0.1/a', /private network/);
  await no('https://[::1]/a', /private network/);
  assert.deepEqual(lookup.asked, [], 'no lookup is made for an address refused on its face');
  const ok = await pf.checkTarget('https://news.example/a', { lookup });
  assert.equal(ok.address, '93.184.216.34');
});

test('paste: a name that resolves to a private address is refused after the lookup, before any request', async () => {
  let requests = 0;
  const fetchImpl = async () => {
    requests++;
    return { status: 200, headers: { 'content-type': 'text/html' }, body: PAGE };
  };
  for (const ip of ['10.0.0.5', '169.254.169.254', '::1']) {
    await assert.rejects(
      pf.fetchPublicPage('https://sneaky.example/a', { fetchImpl, lookup: lookupTo(ip) }),
      (e) => e.status === 400 && e.message === pf.NOT_PUBLIC
    );
  }
  // One public and one private answer is still refused.
  const mixed = async () => [
    { address: '93.184.216.34', family: 4 },
    { address: '192.168.0.2', family: 4 },
  ];
  await assert.rejects(pf.fetchPublicPage('https://mixed.example/a', { fetchImpl, lookup: mixed }), /private network/);
  assert.equal(requests, 0);
});

test('paste: the request goes to the checked address; one redirect is checked the same way, two are refused', async () => {
  const calls = [];
  const fetchImpl = async (href, opts) => {
    calls.push([href, opts.address]);
    if (href === 'https://short.example/x')
      return { status: 301, headers: { location: 'https://news.example/story' }, body: '' };
    if (href === 'https://loop.example/x')
      return { status: 302, headers: { location: 'https://loop2.example/y' }, body: '' };
    if (href === 'https://loop2.example/y')
      return { status: 302, headers: { location: 'https://news.example/z' }, body: '' };
    if (href === 'https://inside.example/x')
      return { status: 302, headers: { location: 'https://127.0.0.1/admin' }, body: '' };
    return { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' }, body: PAGE };
  };
  const lookup = lookupTo('93.184.216.34');
  const page = await pf.fetchPublicPage('https://short.example/x', { fetchImpl, lookup });
  assert.equal(page.url, 'https://news.example/story');
  assert.deepEqual(calls, [
    ['https://short.example/x', '93.184.216.34'],
    ['https://news.example/story', '93.184.216.34'],
  ]);
  await assert.rejects(pf.fetchPublicPage('https://loop.example/x', { fetchImpl, lookup }), /more than one redirect/);
  await assert.rejects(pf.fetchPublicPage('https://inside.example/x', { fetchImpl, lookup }), /private network/);
  const pdf = async () => ({ status: 200, headers: { 'content-type': 'application/pdf' }, body: '%PDF' });
  await assert.rejects(pf.fetchPublicPage('https://news.example/a.pdf', { fetchImpl: pdf, lookup }), /not a web page/);
  const gone = async () => ({ status: 404, headers: {}, body: '' });
  await assert.rejects(pf.fetchPublicPage('https://news.example/gone', { fetchImpl: gone, lookup }), /answered 404/);
  assert.equal(pf.PAGE_TIMEOUT_MS, 20000);
  assert.equal(pf.PAGE_MAX_BYTES, 2 * 1024 * 1024);
});

test('paste: the title, publisher and date come from the page', () => {
  const p = pf.readPage(PAGE, 'https://www.ledger.example/story');
  assert.deepEqual(p, {
    title: 'Mesa valley clinic adds rural hospital nurse staffing & beds',
    publisher: 'The Valley Ledger',
    date: '2026-11-13',
    description: 'A county clinic story.',
  });
  const suffixed = pf.readPage(
    '<meta property="og:title" content="Clinic adds beds | The Valley Ledger"><meta property="og:site_name" content="The Valley Ledger">',
    'https://ledger.example/a'
  );
  assert.equal(suffixed.title, 'Clinic adds beds', "the site's own name at the end of a title is the publisher");
  const bare = pf.readPage('<title>Only a title</title>', 'https://www.ledger.example/story');
  assert.deepEqual(bare, { title: 'Only a title', publisher: 'ledger.example', date: null, description: '' });
});

// ---------------------------------------------------------------- the page's pure parts

const viewMod = await import('../static/views/newsroom.js');

test('page: the tab comes from the address, links must be https, and text never goes in as HTML', async () => {
  assert.equal(viewMod.tabOf(new URLSearchParams('tab=held')), 'held');
  assert.equal(viewMod.tabOf(new URLSearchParams('tab=nope')), 'fresh');
  assert.equal(viewMod.tabOf(new URLSearchParams('')), 'fresh');
  assert.equal(viewMod.safeHref('https://one.example/a'), 'https://one.example/a');
  assert.equal(viewMod.safeHref('javascript:alert(1)'), null);
  assert.equal(viewMod.safeHref('http://one.example/a'), null);
  const src = fs.readFileSync(new URL('../static/views/newsroom.js', import.meta.url), 'utf8');
  assert.doesNotMatch(src, /innerHTML|outerHTML|insertAdjacentHTML|DOMParser/);
  assert.doesNotMatch(src, /[–—]/);
});

test('page: Copy brief for Claude is the main button on a story not yet acted on', () => {
  const c = (tab, status = 'new', tier = 1) => ({ tab, tier, state: { status } });
  assert.deepEqual(viewMod.actionsFor(c('fresh')), ['brief', 'pick', 'hold', 'drop']);
  assert.deepEqual(viewMod.actionsFor(c('covered')), ['brief', 'pick', 'hold', 'drop']);
  assert.deepEqual(viewMod.actionsFor(c('held', 'snoozed')), ['reopen', 'brief']);
  assert.deepEqual(viewMod.actionsFor(c('dropped', 'ignored')), ['reopen', 'brief']);
  assert.deepEqual(viewMod.actionsFor(c('picked')), ['brief', 'published', 'unpick']);
  assert.deepEqual(viewMod.actionsFor(c('picked', 'done')), ['reopen', 'brief']);
  assert.deepEqual(viewMod.actionsFor(c('fresh', 'new', 3)), ['brief', 'hold', 'drop']);
});

test('page: the draft score reads as four lines, two of them to check', () => {
  const lines = viewMod.scoreLines({
    tierText: 'Tier 1: nurse staffing',
    score: {
      relevance: 3,
      rising: 2,
      risingWhy: '2 outlets ran it, the latest on 15 November.',
      toCheck: news.TO_CHECK,
    },
  });
  assert.equal(lines.length, 4);
  assert.equal(lines[0], 'Relevance 3 of 5: Tier 1: nurse staffing.');
  assert.equal(lines[1], 'Rising 2 of 5: 2 outlets ran it, the latest on 15 November.');
  assert.match(lines[2], /^Can we be first: to check\. /);
  assert.match(lines[3], /^Citable hook: to check\. /);
  const fmt = { date: (d) => `D(${d})`, ago: () => '2 hours ago' };
  assert.equal(
    viewMod.feedsLine(
      { readAt: '2026-11-16T06:00:00Z', text: '17 of 18 feeds answered.', failed: [{ name: 'Broken' }] },
      fmt
    ),
    'Feeds read D(2026-11-16), 2 hours ago. 17 of 18 feeds answered. Did not answer: Broken.'
  );
});

test('log: a pass whose dropped list sits under the next HELD heading, a two-line bold title, a WRITING note', () => {
  const md = `### Detection pass 2026-10-07 (links)

### HELD - Pine valley nurse resignations

- **Held on:** 2026-10-07, founder.
- **Guardrails:** stay neutral.

Dropped, with reasons:

- **Harbor clinic data breach** (Journal 2026-09-28):
  score 0. Breach was old data theft with no outage.

### Detection pass 2026-11-06 (link)

- **DROPPED - Gadget Weekly "rural clinics can excel at security
  recruitment"** (Gadget Weekly, November 2026). Score 0: Relevance 2 x Hook 0. The piece is about IT
  staff (a $3.9M average cost, October 2025). Another sentence.
- **WRITING (founder go 2026-11-06) - \`/articles/mesa-valley-clinic-grant\`.** The research said so.

### DROPPED - Market report on clinic software

- **Dropped on:** 2026-09-18. **Reason:** citable-hook score 0, an automatic fail. More text.
`;
  const log = news.parseTopicLog(md);
  assert.deepEqual(
    log.map((e) => [e.status, e.date, e.title]),
    [
      ['HELD', '2026-10-07', 'Pine valley nurse resignations'],
      ['DROPPED', '2026-10-07', 'Harbor clinic data breach'],
      ['DROPPED', '2026-11-06', 'Gadget Weekly "rural clinics can excel at security recruitment"'],
      ['WRITING', '2026-11-06', '/articles/mesa-valley-clinic-grant.'],
      ['DROPPED', '2026-09-18', 'Market report on clinic software'],
    ]
  );
  assert.equal(log[4].reason, 'Citable-hook score 0, an automatic fail.');
  assert.equal(log[1].reason, 'Breach was old data theft with no outage.');
  assert.equal(log[2].reason, 'The piece is about IT staff (a $3.9M average cost, October 2025).');
});

test('real-data fixes: one press release among real outlets is marked on its line, not on the story', () => {
  const today = '2026-11-16';
  const real = item('Lakeshore nurses reach tentative contract deal averting strike', { publisher: 'Gazette' });
  const wire = item('Lakeshore nurses reach tentative contract deal averting strike today', {
    publisher: 'PR Newswire',
    link: 'https://www.prnewswire.example/a',
  });
  const [card] = news.storyCards([real, wire], { today });
  assert.equal(card.outlets.length, 2);
  assert.equal(card.paid, false);
  assert.equal(card.outlets.find((o) => o.name === 'PR Newswire').paid, true);
  assert.equal(card.outlets.find((o) => o.name === 'Gazette').paid, undefined);
  const [alone] = news.storyCards([wire], { today });
  assert.equal(alone.paid, true);
  assert.match(news.newsBrief({ ...card, have: [] }), /PR Newswire.*press release or paid placement/);
});

test('real-data fixes: numbers and everyday words never match, words show as written, four lines at most', () => {
  const have = {
    content: [
      {
        page: '/articles/state-medicaid-expansion-date',
        kind: 'article',
        title: 'When could the state expand Medicaid? 2027 at the earliest',
        publishDate: '2026-11-09',
      },
      ...['a', 'b', 'c', 'd', 'e'].map((x) => ({
        page: `/blog/texas-medicaid-${x}`,
        kind: 'post',
        title: `Texas Medicaid notes ${x}`,
        publishDate: '2026-05-01',
      })),
    ],
  };
  const beds = news.matchHave({ title: 'Allen clinic adding 25 beds in expansion by late 2027', outlets: [] }, have);
  assert.ok(!beds.some((x) => x.covered), 'a year and an everyday word do not make a story covered');
  const tx = news.matchHave({ title: 'Texas Medicaid backlog grows', outlets: [] }, have);
  assert.ok(
    tx.every((x) => x.words.includes('texas')),
    'shown as written, not folded'
  );
  assert.equal(tx.length, news.HAVE_MAX);
  assert.equal(news.HAVE_MAX, 4);
  // A short log title sharing two words is not a decision about this story.
  const log = news.parseTopicLog(
    '### Detection pass 2026-10-24\n\n- **WRITING - CMS: $8M to rural Mesa providers** go.\n'
  );
  const two = news.matchHave({ title: 'CMS finalizes provider enrollment changes', outlets: [] }, { log });
  assert.deepEqual(two, []);
});

// ---------------------------------------------------------------- package 8b: headlines that match

const P8B = {
  content: [
    {
      page: '/articles/texas-medicaid-expansion-earliest-date',
      kind: 'article',
      title: 'When could Texas expand Medicaid? Not before 2028',
      publishDate: '2026-11-09',
    },
    {
      page: '/articles/texas-medicaid-freeze-small-hospitals',
      kind: 'article',
      title: 'What the Texas Medicaid freeze means for small hospitals',
      publishDate: '2026-09-18',
    },
    {
      page: '/articles/rural-health-transformation-deadline-nurse-pay',
      kind: 'article',
      title: 'The Rural Health Transformation deadline and nurse pay',
      publishDate: '2026-09-21',
    },
    {
      page: '/articles/valley-rural-health-transformation-signed-contracts',
      kind: 'article',
      title: 'Valley signs its first Rural Health Transformation contracts',
      publishDate: '2026-10-24',
    },
  ],
};

test('8b fold: expand, expands, expanding and expansion meet; award and awards; transformation', () => {
  assert.equal(news.fold('expansion'), news.fold('expand'));
  assert.equal(news.fold('expanding'), news.fold('expands'));
  assert.equal(news.fold('awards'), news.fold('award'));
  assert.equal(news.fold('transformation'), news.fold('transform'));
  assert.equal(news.fold('texas'), news.fold('Texas'));
});

test('8b topics: phrases from our titles and addresses, the aliases, and a site-wide theme left out', () => {
  const topics = news.buildTopics(P8B);
  assert.ok(topics.has('expand medicaid'));
  assert.ok(topics.has('health rural transform'));
  assert.equal(topics.get('health rural transform').groups, true);
  assert.equal(topics.get('medicaid texa').groups, false, 'Texas and Medicaid alone never join stories');
  assert.deepEqual(news.topicsIn('Trump admin unveils $10B in second-year rural health awards', topics), [
    'health rural transform',
  ]);
  const many = news.buildTopics({
    content: ['a', 'b', 'c', 'd', 'e'].map((x) => ({
      page: `/blog/winter-census-${x}`,
      kind: 'post',
      title: 'Winter census',
    })),
  });
  assert.ok(!many.has('census winter'), 'a phrase on five pages is a theme, not a topic');
  assert.equal(news.TOPIC_MAX_PAGES, 4);
  assert.equal(news.TOPIC_GROUP_DAYS, 10);
});

test('8b grouping: one event under different headlines is one card, within 10 days', () => {
  const topics = news.buildTopics(P8B);
  const today = '2026-11-16';
  const items = [
    item('Hill State to receive $202 million in second-year Rural Health Transformation Program funding', {
      publisher: 'A',
      date: '2026-11-14',
    }),
    item('Admin unveils $10B in second-year rural health awards', { publisher: 'B', date: '2026-11-13' }),
    item('Rural health awards: $70 per resident in Valley, $6,390 in Island', { publisher: 'C', date: '2026-11-12' }),
    item('Medicaid expansion in Texas back in focus', { publisher: 'D', date: '2026-11-11' }),
    item('Could Texas Medicaid expansion finally happen after the election?', { publisher: 'E', date: '2026-11-10' }),
    item('Will Texas lawmakers expand Medicaid? Advocates are hopeful', { publisher: 'F', date: '2026-11-09' }),
    item('Texas Medicaid backlog surges, leaving families waiting', { publisher: 'G', date: '2026-11-12' }),
  ];
  const cards = news.storyCards(items, { today, topics });
  const of = (t) => cards.find((c) => c.outlets.some((o) => o.title.startsWith(t)));
  assert.equal(of('Hill State').id, of('Admin unveils').id);
  assert.equal(of('Hill State').id, of('Rural health awards').id);
  assert.equal(of('Hill State').outlets.length, 3, 'every outlet is kept');
  assert.equal(of('Medicaid expansion').id, of('Could Texas').id);
  assert.equal(of('Medicaid expansion').id, of('Will Texas').id);
  assert.notEqual(of('Texas Medicaid backlog').id, of('Medicaid expansion').id, 'a broad topic never joins stories');
  // Too far apart in time: two cards.
  const apart = news.storyCards(
    [
      item('Admin unveils second-year rural health awards', { publisher: 'B', date: '2026-11-15' }),
      item('Hill State gets Rural Health Transformation money', { publisher: 'A', date: '2026-11-03' }),
    ],
    { today, topics }
  );
  assert.equal(apart.length, 2);
});

test('8b have: a shared topic is close; the topic and another word from a recent piece covers it', () => {
  const topics = news.buildTopics(P8B);
  const today = '2026-11-16';
  const have = { ...P8B, topics, today };
  const exp = news.matchHave(
    { title: 'Will Texas lawmakers expand Medicaid? Advocates are hopeful', outlets: [] },
    have
  );
  const line = exp.find((x) => x.page === '/articles/texas-medicaid-expansion-earliest-date');
  assert.equal(line.covered, true, 'expand + Medicaid is the topic, Texas the second word, 9 November is recent');
  assert.equal(line.text, 'Covered by /articles/texas-medicaid-expansion-earliest-date (published 9 November)');
  assert.deepEqual(line.words, ['expand', 'medicaid', 'texas']);
  const rh = news.matchHave({ title: 'Admin unveils $10B in second-year rural health awards', outlets: [] }, have);
  const first = rh.find((x) => x.page === '/articles/valley-rural-health-transformation-signed-contracts');
  assert.equal(
    first.text,
    'Close to /articles/valley-rural-health-transformation-signed-contracts (published 24 October)'
  );
  assert.equal(first.covered, false);
  // An older piece never covers: 21 September is more than 60 days before 25 November.
  const later = news.matchHave(
    { title: 'Hill State Rural Health Transformation deadline for nurse pay', outlets: [] },
    { ...have, today: '2026-11-25' }
  );
  const old = later.find((x) => x.page === '/articles/rural-health-transformation-deadline-nurse-pay');
  assert.equal(old.covered, false);
  assert.equal(news.COVERED_DAYS, 60);
});

test('8b grouping: a topic of nurse words (a union, a strike) never joins stories at different hospitals', () => {
  const topics = news.buildTopics({
    log: news.parseTopicLog(
      '### Detection pass 2026-11-06\n\n- **DROPPED - Juniper nurses union complaint** (x). Score 0: no.\n'
    ),
  });
  const cards = news.storyCards(
    [
      item('Quarry nurses union signs a deal', { publisher: 'A', date: '2026-11-11' }),
      item('Oakdale nurses union vote set for Friday', { publisher: 'B', date: '2026-11-10' }),
    ],
    { today: '2026-11-16', topics }
  );
  assert.equal(cards.length, 2);
});

test('8b feeds: a news search title loses its publisher even when the name has a dash in it', () => {
  const gn = `<rss><channel><item><title>Valley strike averted - Ledger News - Ledger News - Breaking News, Video</title>
    <link>https://news.google.com/rss/articles/q</link><pubDate>Thu, 12 Nov 2026 08:00:00 GMT</pubDate>
    <source url="https://ledger.example">Ledger News - Breaking News, Video</source></item></channel></rss>`;
  const [g] = news.parseFeed(gn, { name: 'Google News', google: true });
  assert.equal(g.title, 'Valley strike averted');
  assert.equal(g.publisher, 'Ledger News - Breaking News, Video');
});

// ---------------------------------------------------------------- package 8b: the topic question

const na = await import('../lib/newsroom-ask.mjs');

test('ask topic: the method is read from the skill (score, write, one-line test), with a fallback', () => {
  const repo = path.join(root, 'skill-repo');
  fs.mkdirSync(path.join(repo, '.claude/skills'), { recursive: true });
  fs.writeFileSync(
    path.join(repo, '.claude/skills/trendjacking-articles.md'),
    '# T\n\n## Step 1 - Detect\n\nscan\n\n## Step 2 - Score and pick\n\nRelevance x Rising.\n\n## Step 3 - Write\n\nOne citable hook.\n\n## Step 4 - Gate\n\ngate\n\n## The one-line test before you ship\n\nRising? Hook?\n'
  );
  const m = na.readMethod(repo);
  assert.match(m, /Step 2 - Score and pick/);
  assert.match(m, /One citable hook/);
  assert.match(m, /The one-line test/);
  assert.doesNotMatch(m, /Step 1|Step 4/);
  assert.match(na.readMethod(path.join(root, 'nowhere')), /Can we be first/);
});

test('ask topic: the answer splits into its topics, each with a brief built on the matching card', () => {
  const text =
    'Topic 1: Mesa valley clinic grant draws praise\n- Outlets: One\n- Possible citable hook (to verify): x\n\nTopic 2: Something the data does not have\n- Outlets: none\n\nWould drop: the chef story, Tier 3.';
  const topics = na.parseTopics(text);
  assert.deepEqual(
    topics.map((t) => [t.n, t.title]),
    [
      [1, 'Mesa valley clinic grant draws praise'],
      [2, 'Something the data does not have'],
    ]
  );
  assert.doesNotMatch(topics[1].text, /Would drop/);
  const card = {
    id: 'news:aaaaaaaaaaaa',
    title: 'State grant to Mesa valley clinic draws praise',
    outlets: [{ name: 'One', url: 'https://one.example/a', date: '2026-11-14' }],
    firstDate: '2026-11-14',
    latestDate: '2026-11-14',
    tierText: 'Tier 1: Texas health policy',
    score: { relevance: 3, rising: 1, risingWhy: '1 outlet ran it.' },
    have: [],
  };
  const out = na.topicsWithBriefs(topics, [card]);
  assert.equal(out[0].cardId, card.id);
  assert.match(out[0].brief, /https:\/\/one\.example\/a/);
  assert.match(out[0].brief, /Claude's reasoning \(these are hypotheses until the live checks are done/);
  assert.equal(out[1].cardId, null);
  assert.match(out[1].brief, /Load \.claude\/skills\/trendjacking-articles\.md/);
});

test('8b page: when Claude was asked, how long it took, and the would-drop line', () => {
  const fmt = { date: (d) => `D(${d})`, ago: () => '3 minutes ago' };
  assert.equal(
    viewMod.askedLine({ date: '2026-11-16', at: '2026-11-16T06:30:00Z', tookMs: 41200 }, fmt),
    'Asked D(2026-11-16), 3 minutes ago. Claude took 41 seconds.'
  );
  assert.equal(viewMod.askedLine(null, fmt), null);
  assert.equal(viewMod.dropLine('Topic 1: x\n\nWould drop: the chef story.'), 'Would drop: the chef story.');
  assert.equal(viewMod.dropLine('no line'), null);
});

test('a grouped story leads with its Texas headline when it has one', () => {
  const topics = news.buildTopics(P8B);
  const items = [
    item('Hill State to receive $202 million in second-year Rural Health Transformation Program funding', {
      publisher: 'A',
      date: '2026-11-14',
    }),
    item('Admin unveils $10B in second-year rural health awards', { publisher: 'B', date: '2026-11-13' }),
    item('Rural health awards: $70 per resident in Texas, $6,390 in Island', { publisher: 'C', date: '2026-11-12' }),
  ];
  const [card] = news.storyCards(items, { today: '2026-11-16', topics });
  assert.equal(card.outlets.length, 3);
  assert.match(card.title, /Texas/);
  // A single story keeps its own headline whatever it says.
  const [one] = news.storyCards(
    [item('Hill State rural hospital cuts nurse staffing', { publisher: 'A', date: '2026-11-14' })],
    {
      today: '2026-11-16',
      topics,
    }
  );
  assert.equal(one.title, 'Hill State rural hospital cuts nurse staffing');
});
