import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-compchg-'));
process.env.SEO_DESK_DATA = tmp;

const cc = await import('../lib/competitor-changes.mjs');
const { parseWatchLog } = await import('../lib/sources/local.mjs');
const week = await import('../lib/week.mjs');

const TODAY = '2026-11-14';
const HEADING = 'Part 9: The shape of things';
const OLD_HEADING = 'A note on staffing ratios';
const rowsFor = (host, paths, changes, extra = {}) =>
  paths.map((p) => ({ url: `https://www.${host}${p}`, fetchedAt: '2026-11-10', changes, ...extra }));

// ---------------------------------------------------------------- classifyChange

test('classifyChange: every raw change string gets a kind and one plain sentence, never the raw wording', () => {
  const cases = [
    [`h2s added: "${HEADING}"`, 'headings', `New heading: "${HEADING}"`],
    [`h2s removed: "${OLD_HEADING}"`, 'headings', `Heading removed: "${OLD_HEADING}"`],
    [`h2s added: "One", "Two"`, 'headings', 'New headings: "One", "Two"'],
    [`ctas added: "Book a tour"`, 'cta', 'New button: "Book a tour"'],
    [`ctas removed: "Book a tour"`, 'cta', 'Button removed: "Book a tour"'],
    [`prices added: "$12"`, 'price', 'A price appeared: "$12"'],
    [`prices removed: "$12"`, 'price', 'A price went away: "$12"'],
    [`title: "Old title" -> "New title"`, 'title', 'The page title changed: was "Old title", now "New title"'],
    [
      `description: "(none)" -> "A new line"`,
      'description',
      'The description shown in search results changed: was empty, now "A new line"',
    ],
    [`h1: "Old" -> "New"`, 'h1', 'The headline at the top of the page changed: was "Old", now "New"'],
    [
      'body text changed with no heading/CTA/price move (-1 words)',
      'body',
      'The page text changed slightly (1 word fewer)',
    ],
    [
      'body text changed with no heading/CTA/price move (+0 words)',
      'body',
      'The page text changed slightly (same length)',
    ],
    ['body text changed with no heading/CTA/price move (-55 words)', 'body', 'The page text changed (55 words fewer)'],
    ['unreachable (HTTP 404)', 'unreachable', 'The page did not answer (404)'],
    ['unreachable (fetch failed)', 'unreachable', 'The page did not answer (the request failed)'],
    ['something the log never said before', 'other', 'something the log never said before'],
  ];
  for (const [raw, kind, text] of cases) {
    const c = cc.classifyChange(raw);
    assert.equal(c.kind, kind, raw);
    assert.equal(c.plain, text, raw);
    assert.ok(cc.KINDS.includes(c.kind), `${c.kind} is a known kind`);
    assert.equal(/h2s|ctas|HTTP/i.test(c.plain), false, `${raw} reads in plain words`);
  }
  assert.equal(cc.classifyChange('unreachable (HTTP 404)').status, 404);
  assert.equal(cc.classifyChange('baseline stored — h1 "Hello"').kind, 'baseline');
});

test('classifyChange: a dash in a heading from the data never reaches the screen', () => {
  const c = cc.classifyChange('h2s added: "Smarter — Faster"');
  assert.equal(/[–—]/.test(c.plain), false);
});

// ---------------------------------------------------------------- isSentinel

test('isSentinel: a page the desk has no snapshot for has never answered', () => {
  const snaps = new Set(['https://www.rival.example/']);
  assert.equal(cc.isSentinel('https://www.rival.example/pricing', snaps), true);
  assert.equal(cc.isSentinel('https://www.rival.example/', snaps), false);
  assert.equal(cc.isSentinel('https://www.rival.example/', { 'https://www.rival.example/': true }), false);
  assert.equal(cc.isSentinel('rival.example__pricing'), true, 'the log label has no snapshot behind it');
  assert.equal(cc.isSentinel('https://www.rival.example/'), false);
});

// ---------------------------------------------------------------- groupChanges

test('groupChanges: one heading change on five pages is one event listing five pages', () => {
  const pages = ['/', '/product', '/about', '/team', '/blog'];
  const rows = rowsFor('northwind.example', pages, [`h2s added: "${HEADING}"`, `h2s removed: "${OLD_HEADING}"`]);
  const [g] = cc.groupChanges(rows);
  assert.equal(g.host, 'northwind.example');
  assert.equal(g.checkedOn, '2026-11-10');
  assert.equal(g.events.length, 2, 'one event per distinct heading, not ten');
  const added = g.events.find((e) => e.plain === `New heading: "${HEADING}"`);
  assert.equal(added.pages.length, 5);
  assert.equal(added.onText, 'on 5 pages');
  assert.equal(added.material, false);
  assert.deepEqual(cc.countChanges(g), { events: 2, pages: 5, material: 0 });
  assert.equal(cc.countText(cc.countChanges(g)), '2 changes on 5 pages');
});

test('groupChanges: a list change shown as several headings on one page splits per heading and merges across pages', () => {
  const rows = [
    ...rowsFor('northwind.example', ['/', '/product'], [`h2s added: "${HEADING}"`]),
    ...rowsFor('northwind.example', ['/news'], [`h2s added: "${HEADING}", "Another post"`]),
  ];
  const [g] = cc.groupChanges(rows);
  assert.equal(g.events.length, 2);
  assert.equal(g.events.find((e) => e.plain.includes(HEADING)).pages.length, 3);
});

test('groupChanges: a never-answered pricing address at 404 is a sentinel, not an event', () => {
  const rows = [
    {
      url: 'rival.example__pricing',
      key: 'rival.example__pricing',
      fetchedAt: '2026-11-10',
      changes: ['unreachable (HTTP 404)'],
    },
  ];
  const [g] = cc.groupChanges(rows);
  assert.equal(g.events.length, 0);
  assert.deepEqual(g.sentinels, [{ url: null, state: 'still-missing', plain: 'Still no pricing page' }]);
  assert.deepEqual(cc.countChanges(g), { events: 0, pages: 0, material: 0 });
  assert.deepEqual(cc.competitorWorries([g], { today: TODAY }), []);
});

test('groupChanges: a sentinel that starts answering is the pricing-page-appeared event, and it is material', () => {
  const rows = [
    {
      url: 'https://www.rival.example/pricing',
      key: 'rival.example__pricing',
      fetchedAt: '2026-11-10',
      changes: ['baseline stored — h1 "Plans"'],
      previouslyUnreachable: true,
      hasSnapshot: true,
    },
  ];
  const [g] = cc.groupChanges(rows);
  assert.equal(g.events.length, 1);
  assert.equal(g.events[0].kind, 'pricing-page-appeared');
  assert.equal(g.events[0].material, true);
  assert.equal(g.sentinels[0].state, 'appeared');
  assert.equal(g.sentinels[0].plain, 'A pricing page has appeared');
  const [w] = cc.competitorWorries([g], { today: TODAY });
  assert.equal(w.title, 'rival.example has published a pricing page');
});

test('groupChanges: a first look at an ordinary page is not a change', () => {
  const rows = [
    {
      url: 'https://www.rival.example/',
      fetchedAt: '2026-11-10',
      changes: ['baseline stored — h1 "Hello"'],
      previouslyUnreachable: false,
    },
  ];
  assert.deepEqual(cc.groupChanges(rows)[0].events, []);
});

test('groupChanges: a page that used to answer and now gives an error is material, a failed request is not', () => {
  const rows = [
    ...rowsFor('rival.example', ['/'], ['unreachable (HTTP 404)']),
    ...rowsFor('other.example', ['/'], ['unreachable (fetch failed)']),
  ];
  const snaps = new Set(rows.map((r) => r.url));
  const [a, b] = cc.groupChanges(rows, snaps);
  assert.equal(a.host, 'other.example');
  assert.equal(a.events[0].material, false, 'a network failure says nothing about the page');
  assert.equal(b.events[0].material, true);
  assert.equal(b.events[0].kind, 'unreachable');
  assert.deepEqual(b.sentinels, []);
});

test('groupChanges: material kinds and non-material kinds', () => {
  const rows = rowsFor(
    'rival.example',
    ['/'],
    [
      'prices added: "$9"',
      'ctas added: "Try it free"',
      'title: "A" -> "B"',
      'description: "C" -> "D"',
      'h1: "E" -> "F"',
      'h2s added: "G"',
      'body text changed with no heading/CTA/price move (+2 words)',
    ]
  );
  const [g] = cc.groupChanges(rows);
  const byKind = Object.fromEntries(g.events.map((e) => [e.kind, e.material]));
  assert.deepEqual(byKind, {
    price: true,
    cta: true,
    title: true,
    description: true,
    h1: true,
    headings: false,
    body: false,
  });
});

// ---------------------------------------------------------------- the worry

test('worries: a price change and a title change raise a worry that says plainly what happened', () => {
  const rows = [
    ...rowsFor('rival.example', ['/'], ['title: "Old name" -> "New name"']),
    ...rowsFor('rival.example', ['/plans'], ['prices added: "$12"']),
  ];
  const out = cc.competitorWorries(cc.groupChanges(rows), { today: TODAY });
  assert.equal(out.length, 1, 'one worry per competitor');
  const w = out[0];
  assert.equal(w.kind, 'competitor-change');
  assert.equal(w.title, 'rival.example made 2 changes worth reading');
  assert.match(w.measured, /The competitor check on 10 November found this\./);
  assert.match(w.measured, /rival\.example changed the page title on its home page: was "Old name", now "New name"\./);
  assert.match(w.measured, /rival\.example now shows a price on its \/plans page: "\$12"\./);
  assert.equal(
    w.fix,
    'Read the changed pages. If it changes a claim on one of our comparison pages, note it in the competitor dossier.'
  );
  assert.deepEqual(
    w.competitor.pages.map((p) => p.url),
    ['https://www.rival.example/', 'https://www.rival.example/plans']
  );
  assert.equal(/[–—]/.test(JSON.stringify(w)), false);
});

test('worries: one headline change reads as the founder would say it', () => {
  const rows = rowsFor('rival.example', ['/'], ['h1: "Old headline" -> "New headline"']);
  const [w] = cc.competitorWorries(cc.groupChanges(rows), { today: TODAY });
  assert.equal(w.title, 'rival.example changed the headline on its home page');
  assert.match(w.measured, /was "Old headline", now "New headline"/);
  assert.match(w.fix, /^Read the changed page\. /);
});

test('worries: headings only and text only raise nothing', () => {
  const rows = [
    ...rowsFor('rival.example', ['/', '/product'], [`h2s added: "${HEADING}"`]),
    ...rowsFor('plain.example', ['/'], ['body text changed with no heading/CTA/price move (-4 words)']),
  ];
  assert.deepEqual(cc.competitorWorries(cc.groupChanges(rows), { today: TODAY }), []);
});

test('worries: marking Seen removes the worry, and a new material event brings it back', () => {
  const first = cc.groupChanges(rowsFor('rival.example', ['/'], ['title: "A" -> "B"']));
  const [w1] = cc.competitorWorries(first, { today: TODAY });
  assert.ok(w1);
  const seen = { [w1.id]: { status: 'done', doneAt: TODAY } };
  assert.deepEqual(cc.competitorWorries(first, { items: seen, today: TODAY }), []);
  // The same events with one more page showing them: still seen.
  const morePages = cc.groupChanges(rowsFor('rival.example', ['/', '/about'], ['title: "A" -> "B"']));
  assert.deepEqual(cc.competitorWorries(morePages, { items: seen, today: TODAY }), []);
  // A new non-material event: still seen.
  const quiet = cc.groupChanges([
    ...rowsFor('rival.example', ['/'], ['title: "A" -> "B"']),
    ...rowsFor('rival.example', ['/blog'], [`h2s added: "${HEADING}"`]),
  ]);
  assert.deepEqual(cc.competitorWorries(quiet, { items: seen, today: TODAY }), []);
  // A new material event: back, as a different card id on the same host.
  const next = cc.groupChanges([
    ...rowsFor('rival.example', ['/'], ['title: "A" -> "B"']),
    ...rowsFor('rival.example', ['/'], ['prices added: "$5"']),
  ]);
  const back = cc.competitorWorries(next, { items: seen, today: TODAY });
  assert.equal(back.length, 1);
  assert.notEqual(back[0].id, w1.id);
  assert.match(back[0].id, /^competitor-change:rival\.example:[0-9a-f]{10}$/);
});

test('worries: a check older than 14 days says so and tells him to check again', () => {
  const rows = rowsFor('rival.example', ['/'], ['title: "A" -> "B"']);
  const g = cc.groupChanges(rows);
  const [fresh] = cc.competitorWorries(g, { today: '2026-11-24' });
  assert.equal(/days old/.test(fresh.measured), false, 'exactly 14 days is not yet stale');
  const [old] = cc.competitorWorries(g, { today: '2026-11-26' });
  assert.match(old.measured, /This check is 16 days old\. Press Check competitors now for the current state\.$/);
});

test('worries: links come only from addresses the watch holds, and only over https', () => {
  const rows = [
    { url: 'http://insecure.example/', fetchedAt: '2026-11-10', changes: ['title: "A" -> "B"'] },
    { url: 'https://www.safe.example/x', fetchedAt: '2026-11-10', changes: ['title: "A" -> "B"'] },
    { url: 'javascript:alert(1)', fetchedAt: '2026-11-10', changes: ['title: "A" -> "B"'] },
  ];
  const out = cc.competitorWorries(cc.groupChanges(rows), { today: TODAY });
  const links = out.flatMap((w) => w.competitor.pages.map((p) => p.url));
  assert.deepEqual(links, ['https://www.safe.example/x']);
  assert.equal(cc.safeHttps('https://a.example/p?q=1#x'), 'https://a.example/p?q=1#x');
  assert.equal(cc.safeHttps('data:text/html,hi'), null);
});

test('the worry card for a competitor has no test, no hypothesis flag and no Search Console link', () => {
  const [w] = cc.competitorWorries(cc.groupChanges(rowsFor('rival.example', ['/'], ['h1: "A" -> "B"'])), {
    today: TODAY,
  });
  const card = week.worryCard(w, new Map(), TODAY);
  assert.equal(card.slot, 'worry');
  assert.equal(card.test, undefined);
  assert.equal(card.hypothesis, false);
  assert.equal(card.eligibility, null);
  assert.equal(JSON.stringify(card).includes('search-console'), false);
  assert.deepEqual(card.competitor.pages, [{ url: 'https://www.rival.example/', label: 'home page' }]);
  const text = cc.competitorBrief(card);
  assert.match(text, /Read docs\/seo\/competitor-dossier\.md first/);
  assert.match(text, /log it in the maintenance log of docs\/seo\/competitor-dossier\.md/);
  assert.match(text, /https:\/\/www\.rival\.example\//);
  assert.equal(/hypothesis/i.test(text), false);
});

test('week.worries: seen state comes from the items passed in', () => {
  const snaps = {
    local: {
      data: {
        competitors: { watch: rowsFor('rival.example', ['/'], ['h1: "A" -> "B"']) },
      },
    },
  };
  const all = week.worries({ snaps, today: TODAY });
  const w = all.find((x) => x.kind === 'competitor-change');
  assert.ok(w);
  const after = week.worries({ snaps, today: TODAY, items: { [w.id]: { status: 'done' } } });
  assert.equal(
    after.some((x) => x.kind === 'competitor-change'),
    false
  );
});

// ---------------------------------------------------------------- the dossier's log

test('the dossier maintenance log is read from its table rows', () => {
  const md = [
    '| 2026-01-01 | not in the log, above the heading |',
    '## Maintenance Log',
    '',
    '| Date | Action |',
    '| --- | --- |',
    '| 2026-11-03 | **later** note |',
    '| 2026-11-01 | the check note |',
    '| 2026-10-20 | older |',
    'some prose that is not a row',
  ].join('\n');
  assert.deepEqual(cc.parseDossierLogDates(md), ['2026-11-03', '2026-11-01', '2026-10-20']);
  assert.equal(cc.dossierEntryAfter(['2026-11-03', '2026-11-01', '2026-10-20'], '2026-11-01'), '2026-11-01');
  assert.equal(cc.dossierEntryAfter(['2026-11-03', '2026-10-20'], '2026-11-01'), '2026-11-03');
  assert.equal(cc.dossierEntryAfter(['2026-10-20'], '2026-11-01'), null);
  assert.deepEqual(cc.parseDossierLogDates('nothing here'), []);
});

// ---------------------------------------------------------------- the log reader

test('parseWatchLog: rows say whether the page has a snapshot and whether it was missing before', () => {
  const md = [
    '## 2026-10-01',
    '',
    '- rival.example__pricing: unreachable (HTTP 404)',
    '- rival.example__home: baseline stored — h1 "Hello"',
    '',
    '## 2026-11-01',
    '',
    '- rival.example__pricing: baseline stored — h1 "Plans"',
    '- rival.example__home: 1 change(s) since 2026-10-01',
    '  - h1: "Hello" -> "Hi"',
    '- other.example__home: unreachable (HTTP 404)',
  ].join('\n');
  const known = {
    'rival.example__pricing': 'https://www.rival.example/pricing',
    'rival.example__home': 'https://www.rival.example/',
  };
  const rows = parseWatchLog(md, (k) => known[k] ?? null);
  const by = Object.fromEntries(rows.map((r) => [r.key, r]));
  assert.equal(by['rival.example__pricing'].previouslyUnreachable, true);
  assert.equal(by['rival.example__pricing'].hasSnapshot, true);
  assert.equal(by['rival.example__home'].previouslyUnreachable, false);
  assert.equal(by['other.example__home'].hasSnapshot, false);
  assert.equal(by['other.example__home'].url, 'other.example__home');
  assert.deepEqual(by['rival.example__home'].changes, ['h1: "Hello" -> "Hi"']);
  // End to end: the pricing page that started answering is an event, the unanswering stranger a sentinel.
  const [a, b] = cc.groupChanges(rows);
  assert.equal(a.host, 'other.example');
  assert.equal(a.sentinels.length, 1);
  assert.deepEqual(b.events.map((e) => e.kind).sort(), ['h1', 'pricing-page-appeared']);
});
