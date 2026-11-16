import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Package 8c (2026-11-16): Newsroom picks that survive the founder's own checks. Every headline,
// outlet, address, page and number here is invented; hosts end in .example.

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-p8c-'));
process.env.SEO_DESK_DATA = path.join(root, 'data');
process.env.SEO_DESK_REPO = path.join(root, 'repo');
process.env.SEO_DESK_TODAY = '2026-11-16';

const f = await import('../lib/news-filters.mjs');
const news = await import('../lib/news.mjs');

const TODAY = '2026-11-16';
let n = 0;
const item = (title, extra = {}) => ({
  title,
  link: `https://outlet${++n}.example/story-${n}`,
  date: '2026-11-14',
  publisher: `Outlet ${n}`,
  description: '',
  ...extra,
});

// ---------------------------------------------------------------- rule 1: the subject key

test('subject: a place, a main entity and a topic noun; national when no state is named', () => {
  const s = f.subjectOf('Texas Medicaid backlog climbs to 412,118 applications');
  assert.equal(s.place, 'Texas');
  assert.equal(s.entity, 'Medicaid');
  assert.equal(s.topic, 'backlog');
  assert.equal(s.key, 'Texas|Medicaid|backlog');
  assert.equal(s.query, 'texas medicaid backlog hospital');
  const e = f.subjectOf('Could Texas expand Medicaid next session?');
  assert.equal(e.key, 'Texas|Medicaid|expansion');
  const nat = f.subjectOf('Federal rural health fund awards second round');
  assert.equal(nat.place, 'national');
  assert.equal(nat.entity, 'Rural Health Transformation');
  assert.equal(nat.topic, 'award');
  // A specific rule beats the program it sits in.
  assert.equal(f.subjectOf('Section 80123 trims Medicaid back coverage').entity, 'section 80123');
  // No topic noun: no key, so it never joins stories on its own.
  assert.equal(f.subjectOf('Texas Medicaid explained').key, null);
  // A named hospital and a named union are entities.
  assert.equal(f.subjectOf('Pinecrest Valley Hospital nurses set strike date').entity, 'Pinecrest Valley Hospital');
  assert.equal(f.subjectOf('Nurses union in Ohio calls a strike').entity, 'nurses union');
});

test('grouping: stories sharing place, entity and topic within 14 days are one card, apart from another topic', () => {
  const items = [
    item('Texas Medicaid backlog climbs to 412,118 applications', { date: '2026-11-15' }),
    item('Lawmakers press the state on its Medicaid backlog in Texas', { date: '2026-11-11' }),
    item('Kim Doe joins Texas Democrats calling for action on Medicaid backlog', { date: '2026-11-13' }),
    item('Could Texas expand Medicaid next session?', { date: '2026-11-14' }),
    item('Texas governor-elect wants to expand Medicaid', { date: '2026-11-12' }),
    // The same subject a month earlier is a different story.
    item('In October Texas lawmakers held a long hearing about the Medicaid backlog and county offices in summer', {
      date: '2026-10-10',
    }),
  ];
  const groups = news.groupStories(items);
  const titles = groups.map((g) => g.map((it) => it.title).sort());
  const backlog = titles.find((g) => g.some((t) => t.includes('412,118')));
  assert.equal(backlog.length, 3, JSON.stringify(titles));
  const expand = titles.find((g) => g.some((t) => t.includes('governor-elect')));
  assert.equal(expand.length, 2);
  assert.ok(!backlog.some((t) => t.includes('expand')));
  assert.ok(titles.some((g) => g.length === 1 && g[0].includes('In October')));
  // A named hospital is its own place: a headline that names the state and one that does not join.
  const named = news.groupStories([
    item('Pinecrest Valley hospital nurses plan a strike', { date: '2026-11-10' }),
    item('Ohio: Pinecrest Valley Hospital strike set for Monday', { date: '2026-11-12' }),
  ]);
  assert.equal(named.length, 1);
});

// ---------------------------------------------------------------- rule 2: reporting, not reprints

test('reprints: a description that names the original, the same headline and the same first sentence collapse', () => {
  const desc =
    'This story was originally published by Plains Health Desk. Officials missed a date to announce the money.';
  const items = [
    item('Plains fund misses its date', { publisher: 'Plains Health Desk', date: '2026-11-10' }),
    item('Rural fund misses a key date', { publisher: 'Town Paper A', description: desc, date: '2026-11-11' }),
    item('Rural fund misses a key date', { publisher: 'Town Paper B', description: desc, date: '2026-11-12' }),
    item('Fund deadline missed, states wait', { publisher: 'Town Paper C', description: desc, date: '2026-11-13' }),
    item('Same headline everywhere today', { publisher: 'Wire Copy One', date: '2026-11-12' }),
    item('Same headline everywhere today', { publisher: 'Wire Copy Two', date: '2026-11-13' }),
    item('A reporter on the ground files her own story', { publisher: 'Valley Times', date: '2026-11-14' }),
  ];
  const r = f.reportsOf(items);
  assert.equal(r.reports, 3);
  assert.equal(r.reprints, 4);
  assert.equal(r.source, 'Plains Health Desk');
  assert.equal(r.text, '3 reports, 4 reprints, most of Plains Health Desk');
  assert.equal(f.syndicatedFrom(desc), 'Plains Health Desk');
  assert.equal(f.reportsOf([items[0]]).text, '1 report');
});

test('reprints: the card counts reports, Rising uses reports only, and the story is dated by its main fact', () => {
  const desc = 'Originally published by Plains Health Desk. A new count of 9,412 pending files.';
  const items = [
    item('Utah benefit backlog reaches 9,412 files', { publisher: 'Plains Health Desk', date: '2026-11-03' }),
    ...Array.from({ length: 9 }, (_, i) =>
      item('Utah benefit backlog reaches 9,412 files', {
        publisher: `Town Paper ${i}`,
        description: desc,
        date: '2026-11-15',
      })
    ),
  ];
  const card = news.storyCard(items, { today: TODAY });
  assert.equal(card.outlets.length, 10);
  assert.equal(card.reports.reports, 1);
  assert.equal(card.reports.reprints, 9);
  assert.equal(card.score.rising, 1, 'one report, not ten outlets');
  assert.equal(card.factDate, '2026-11-03', 'the first appearance of 9,412, not the latest reprint');
  assert.equal(card.score.freshness, 2, 'its main fact is 13 days old');
});

// ---------------------------------------------------------------- rule 4: freshness

test('freshness: a new main fact scores high, a dated change ahead stays high, a spike with no fact decays', () => {
  const fresh = news.storyCard(
    [
      item('Ohio count shows 3,118 nurses left in a year', { date: '2026-11-14' }),
      item('Ohio count shows 3,118 nurses left', { date: '2026-11-14' }),
      item('3,118 nurses left Ohio hospitals in one year', { date: '2026-11-15' }),
    ],
    { today: TODAY }
  );
  assert.equal(fresh.score.freshness, 5);
  assert.match(fresh.score.freshnessWhy, /Its main fact \(3,118\) first ran on 14 November/);
  assert.equal(f.showFact('$15m'), '$15 million');
  const ahead = news.storyCard(
    [item('Medicaid back coverage shrinks on January 1, 2027 for new applicants', { date: '2026-10-20' })],
    { today: TODAY }
  );
  assert.equal(ahead.score.freshness, 4, 'the change date is still ahead');
  assert.match(ahead.score.freshnessWhy, /1 January 2027/);
  assert.equal(f.upcomingDateIn('Rule takes effect Jan. 1, 2027', TODAY), '2027-01-01');
  assert.equal(f.upcomingDateIn('Strike began Nov. 12, 2026', TODAY), null);
  const spikeNew = news.storyCard([item('Viral nurse video sparks debate', { date: '2026-11-15' })], { today: TODAY });
  const spikeOld = news.storyCard([item('Viral nurse video sparks debate', { date: '2026-11-11' })], { today: TODAY });
  assert.ok(spikeNew.score.freshness > spikeOld.score.freshness);
  assert.equal(spikeOld.score.freshness, 1);
  // One report of a new fact is weaker than three.
  const single = news.storyCard([item('Ohio count shows 3,118 nurses left', { date: '2026-11-14' })], { today: TODAY });
  assert.equal(single.score.freshness, 3);
  // A lead with no number of its own is dated by the fact its reports carry.
  const led = f.freshnessOf({
    lead: 'Lawmakers in Utah press the state on its benefit backlog',
    items: [
      item('Lawmakers in Utah press the state on its benefit backlog', { date: '2026-11-08' }),
      item('Utah benefit backlog reaches 9,412 files', { date: '2026-11-14' }),
    ],
    reports: 2,
    today: TODAY,
    firstDate: '2026-11-08',
    latestDate: '2026-11-14',
  });
  assert.equal(led.factDate, '2026-11-14');
  assert.equal(led.freshness, 4);
  assert.equal(fresh.score.product, fresh.score.relevance * fresh.score.freshness);
});

// ---------------------------------------------------------------- rule 3: the hard filters

const page = (p, title, body, publishDate = '2026-08-01', kind = 'article') => ({
  page: p,
  kind,
  title,
  publishDate,
  facts: f.pageFacts(`---\ntitle: '${title}'\n---\n\n${body}`),
});

const PAGES = [
  page(
    '/articles/plains-losses',
    'Plains rural hospitals in the red',
    [
      '- Texas has 61 rural hospitals vulnerable to closure, the most of any state.',
      '- 38.4% of rural hospitals are operating in the red.',
      '',
      'Texas got the biggest Rural Health Transformation award and the lowest amount per rural resident, about $58.',
      '',
      'A claims backlog took months to clear. [Source](https://news.example/texas-medicaid-claims)',
    ].join('\n')
  ),
  page('/blog/night-shift', 'Night shift coverage', 'Section 99001 of the made-up act is on this page.'),
];
const NO_HOLD = () => ({ eligible: true, from: null });
// Each filter a to d is tested on its own, so the card counts as two reports (filter e has its own tests).
const cardOf = (title, extra = {}) => {
  const c = news.storyCard([item(title, extra)], { today: TODAY });
  return { ...c, reports: { reports: 2, reprints: 0, source: null, text: '2 reports' }, ...extra.card };
};
const check = (c, opts = {}) => f.hardFilters(c, { pages: PAGES, dossier: null, holdOf: NO_HOLD, ...opts });

test('filter a: a payment rule a Critical Access Hospital is exempt from fails, unless it names them', () => {
  const r = check(cardOf('CMS posts final outpatient payment rule and OPPS update'));
  assert.equal(r.passed, false);
  assert.equal(r.group, 'filtered');
  assert.deepEqual(r.reasons[0], {
    filter: 'a',
    name: 'Applies to a Critical Access Hospital',
    text: 'Critical Access Hospitals are paid on cost and are exempt from OPPS and IPPS, so this does not reach our reader.',
    covered: false,
  });
  assert.equal(check(cardOf('Nursing home staffing rule repealed')).reasons[0].filter, 'a');
  assert.equal(check(cardOf('OPPS rule spares critical access hospitals')).passed, true);
});

test('filter b: a story whose program and measure one live page carries is an update, with the edit date', () => {
  const r = check(cardOf('Rural health awards: $91 per resident in Utah, $4,020 in Vermont'), {
    holdOf: (p) => (p === '/articles/plains-losses' ? { eligible: false, from: '2026-12-09' } : { eligible: true }),
  });
  const b = r.reasons.find((x) => x.filter === 'b');
  assert.ok(b, JSON.stringify(r));
  assert.equal(b.name, 'Not already covered');
  assert.equal(r.update.page, '/articles/plains-losses');
  assert.equal(r.update.text, 'Update an existing page: /articles/plains-losses. Can be edited from 9 December.');
  assert.match(b.text, /Rural Health Transformation and per resident/);
  // The same rule section on a page covers it too.
  const s = check(cardOf('What section 99001 changes for small hospitals'));
  assert.equal(s.reasons[0].filter, 'b');
  assert.match(s.reasons[0].text, /section 99001/);
  // A claims backlog on the page (and a link address that says medicaid) does not cover an
  // application backlog story.
  const back = check(cardOf('Texas Medicaid application backlog reaches 412,118'));
  assert.equal(back.passed, true, JSON.stringify(back.reasons));
  assert.equal(
    back.primary,
    'Primary source: to check (the statute, the Federal Register, state data or a published report).'
  );
  // A number the facts dossier already holds covers it, with no page to update.
  const dossier = f.pageFacts('The count was 412,118 in September.');
  const d = check(cardOf('Texas Medicaid application backlog reaches 412,118'), { dossier });
  assert.equal(d.group, 'filtered');
  assert.match(d.reasons[0].text, /facts dossier/);
});

test('filter c: another state and not Texas fails, unless our Texas figure for its measure is live', () => {
  const ok = check(cardOf('New data shows 27 Idaho rural hospitals face closure'));
  const c = ok.reasons.find((x) => x.filter === 'c');
  assert.ok(c.covered);
  assert.equal(ok.group, 'update');
  assert.match(c.text, /names Idaho, not Texas/);
  const no = check(cardOf('Idaho nurse licence fees rise'));
  assert.equal(no.group, 'filtered');
  assert.equal(no.reasons[0].filter, 'c');
  assert.equal(check(cardOf('Nurse licence fees rise across the country')).passed, true, 'national passes');
});

test('filter d: a deal whose terms are not public, and a story only paywalled outlets ran, fail', () => {
  const deal = check(cardOf("Lakeside nurses' union reach tentative deal, averting strike"));
  assert.equal(deal.reasons[0].filter, 'd');
  assert.equal(deal.reasons[0].name, 'A quotable primary source can exist');
  assert.equal(check(cardOf('Lakeside, Texas nurses ratify contract with 4.5% raises')).passed, true);
  const pay = check(cardOf('Nurse pay study lands', { publisher: f.PAYWALLED[0] }));
  assert.equal(pay.reasons[0].filter, 'd');
  assert.match(pay.reasons[0].text, /paywall/);
});

// ---------------------------------------------------------------- rule 5: repetition

test('repetition: pieces on the same place and entity in the last 45 days lower the score and are named', () => {
  const content = [
    {
      page: '/articles/texas-medicaid-calendar',
      kind: 'article',
      title: 'When could Texas expand Medicaid?',
      publishDate: '2026-11-09',
    },
    {
      page: '/articles/texas-medicaid-pause',
      kind: 'article',
      title: 'Texas Medicaid payments paused',
      publishDate: '2026-10-20',
    },
    {
      page: '/articles/texas-medicaid-old',
      kind: 'article',
      title: 'Texas Medicaid in spring',
      publishDate: '2026-08-01',
    },
    { page: '/articles/ohio-medicaid', kind: 'article', title: 'Ohio Medicaid cut', publishDate: '2026-11-01' },
  ];
  const r = f.repetitionOf({ place: 'Texas', entity: 'Medicaid' }, { content, today: TODAY });
  assert.equal(r.count, 2);
  assert.equal(r.penalty, 2 * f.REPEAT_PENALTY);
  assert.equal(
    r.text,
    'Third Texas Medicaid piece in six weeks: /articles/texas-medicaid-calendar (9 November), /articles/texas-medicaid-pause (20 October).'
  );
  assert.equal(f.repetitionOf({ place: 'Utah', entity: 'Medicaid' }, { content, today: TODAY }).count, 0);
});

test('filter a: Medicare 340B payment cuts and residency slots do not reach a Critical Access Hospital', async () => {
  const f = await import('../lib/news-filters.mjs');
  const card = (title) => ({
    title,
    description: '',
    outlets: [
      { name: 'A', title },
      { name: 'B', title },
    ],
    reports: { reports: 2 },
  });
  const cut = f.hardFilters(card('Medicare cuts to 340B drug payments will hit safety-net hospitals'));
  assert.ok(cut.reasons.some((r) => r.filter === 'a' && /340B payment rate/.test(r.text)));
  const gme = f.hardFilters(card('CMS allocates 200 Medicare-funded residency slots to teaching hospitals'));
  assert.ok(gme.reasons.some((r) => r.filter === 'a' && /residency slots/.test(r.text)));
  const cah = f.hardFilters(card('Critical access hospitals and the 340B program after Medicare cuts'));
  assert.ok(!cah.reasons.some((r) => r.filter === 'a'), 'naming critical access lets it through');
});

test('filter e: one report and no dated change is not rising yet; a date ahead or a Texas rural story passes', async () => {
  const f = await import('../lib/news-filters.mjs');
  const one = (title) => ({ title, description: '', outlets: [{ name: 'A', title }], reports: { reports: 1 } });
  const today = '2026-11-16';
  const plain = f.hardFilters(one('A national startup raises money to open a nurse practitioner clinic network'), {
    today,
  });
  assert.deepEqual(
    plain.reasons.map((r) => r.filter),
    ['e']
  );
  assert.equal(plain.reasons[0].text, f.ONE_REPORT_REASON);
  const dated = f.hardFilters(one('New nurse staffing rule takes effect January 1, 2027'), { today });
  assert.ok(!dated.reasons.some((r) => r.filter === 'e'), 'a dated change ahead passes');
  const txRural = f.hardFilters(one('Texas rural hospital closes its labor and delivery unit'), { today });
  assert.ok(!txRural.reasons.some((r) => r.filter === 'e'), 'a Texas rural story passes on one report');
  const two = f.hardFilters({ ...one('A national startup raises money'), reports: { reports: 2 } }, { today });
  assert.ok(!two.reasons.some((r) => r.filter === 'e'));
});

test('a hospital building expansion in Texas is not Texas health policy', async () => {
  const news = await import('../lib/news.mjs');
  assert.notEqual(news.tierOf('Texas Health Allen adding 25 beds in third-floor expansion').tier, 1);
  assert.equal(news.tierOf('Texas lawmakers file Medicaid expansion bills').tier, 1);
});

test('filter c: no state and no federal signal is no Texas angle; filter a: school nurses do not reach a hospital', async () => {
  const f = await import('../lib/news-filters.mjs');
  const two = (title) => ({
    title,
    description: '',
    outlets: [
      { name: 'A', title },
      { name: 'B', title },
    ],
    reports: { reports: 2 },
  });
  const abroad = f.hardFilters(two('Island health workers seek better pay as nurse shortage looms'));
  assert.ok(abroad.reasons.some((r) => r.filter === 'c' && /names no US state/.test(r.text)));
  const federal = f.hardFilters(two('Federal report finds a national nurse shortage'));
  assert.ok(!federal.reasons.some((r) => r.filter === 'c'), 'a federal signal makes it national');
  const school = f.hardFilters(two('No nurse at your child’s school? A Texas bill would tell parents'));
  assert.ok(school.reasons.some((r) => r.filter === 'a' && /school nurses/.test(r.text)));
});

test('police and rural politics are not Texas health policy', async () => {
  const news = await import('../lib/news.mjs');
  assert.notEqual(news.tierOf('North Texas hospital worker accused; police say more victims possible').tier, 1);
  assert.notEqual(news.tierOf('Rural voters fuel election gains across Texas').tier, 1);
  assert.equal(news.tierOf('Texas lawmakers change hospital staffing policy').tier, 1);
});
