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
  const rows = [
    ...rowsFor(
      'rival.example',
      ['/plans'],
      [
        'prices added: "$9"',
        'ctas added: "Try it free"',
        'title: "A" -> "B"',
        'description: "C" -> "D"',
        'h1: "E" -> "F"',
      ]
    ),
    ...rowsFor(
      'rival.example',
      ['/'],
      [
        'h2s added: "G"',
        'body text changed with no heading/CTA/price move (+2 words)',
        'something the log never said before',
      ]
    ),
  ];
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
    other: false,
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

const LOG = [
  '| 2026-01-01 | Rival Example before the heading, not in the log |',
  '## Maintenance Log',
  '',
  '| Date | Action |',
  '| --- | --- |',
  '| 2026-11-03 | **Later** note about an unrelated vendor, Plainco Staffing |',
  '| 2026-11-01 | Monthly check. **Rival Example homepage headline moved.** Northwind-Health sentinels still 404 |',
  '| 2026-10-20 | older note about rival.example |',
  'some prose that is not a row',
].join('\n');

test('the dossier maintenance log is read as rows with their text', () => {
  const rows = cc.parseDossierLog(LOG);
  assert.deepEqual(
    rows.map((r) => r.date),
    ['2026-11-03', '2026-11-01', '2026-10-20']
  );
  assert.match(rows[1].text, /Rival Example homepage headline moved/);
  assert.deepEqual(cc.parseDossierLog('nothing here'), []);
});

test('a dossier note counts for a host only when a row on or after the check names that host', () => {
  const rows = cc.parseDossierLog(LOG);
  // The row dated 1 November names the company in words ("Rival Example"), matched on the label with
  // punctuation and spaces ignored.
  assert.equal(cc.dossierNoteFor('rival.example', rows, '2026-11-01'), '2026-11-01');
  // "Northwind-Health" matches the label northwind, case and hyphens ignored.
  assert.equal(cc.dossierNoteFor('northwind.example', rows, '2026-11-01'), '2026-11-01');
  // The 3 November row is about Plainco only: an unrelated later row does not mark other hosts.
  assert.equal(cc.dossierNoteFor('plainco.example', rows, '2026-11-01'), '2026-11-03');
  assert.equal(cc.dossierNoteFor('elsewhere.example', rows, '2026-11-01'), null);
  assert.equal(cc.dossierNoteFor('rival.example', rows, '2026-11-02'), null, 'the older row is before the check');
  assert.equal(cc.dossierNoteFor('rival.example', rows, null), null);
  // "In-House Health" in a row matches the label inhouse from inhouse.health.
  const inhouse = [{ date: '2026-11-01', text: ' In-House Health published a post' }];
  assert.equal(cc.dossierNoteFor('inhouse.health', inhouse, '2026-11-01'), '2026-11-01');
  assert.deepEqual(cc.hostLabels('www.smartlinx.com'), ['smartlinxcom', 'smartlinx']);
  assert.deepEqual(cc.hostLabels('a.io'), [], 'a label under four letters is too loose');
});

test('a material change the dossier already notes for that host is no worry; an unrelated row changes nothing', () => {
  const rows = [
    ...rowsFor('rival.example', ['/'], ['title: "A" -> "B"'], { fetchedAt: '2026-11-01' }),
    ...rowsFor('northwind.example', ['/'], ['title: "C" -> "D"'], { fetchedAt: '2026-11-01' }),
  ];
  const hosts = cc.groupChanges(rows);
  const log = cc.parseDossierLog(LOG);
  // Both hosts are named in the 1 November row, so neither raises a worry.
  assert.deepEqual(cc.competitorWorries(hosts, { today: TODAY, dossierLog: log }), []);
  // Only a row about Rival Example exists: Northwind is still a worry, and is not hidden by it.
  const onlyRival = [{ date: '2026-11-03', text: ' Rival Example moved' }];
  const out = cc.competitorWorries(hosts, { today: TODAY, dossierLog: onlyRival });
  assert.deepEqual(
    out.map((w) => w.competitor.host),
    ['northwind.example']
  );
  // An unrelated later row marks no one.
  const unrelated = [{ date: '2026-11-12', text: ' Plainco Staffing refreshed' }];
  assert.equal(cc.competitorWorries(hosts, { today: TODAY, dossierLog: unrelated }).length, 2);
  // A row older than the check does not count.
  const old = [{ date: '2026-10-01', text: ' Rival Example and Northwind moved' }];
  assert.equal(cc.competitorWorries(hosts, { today: TODAY, dossierLog: old }).length, 2);
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
    '- other.example__pricing: unreachable (HTTP 404)',
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
  assert.equal(by['other.example__pricing'].hasSnapshot, false);
  assert.equal(by['rival.example__pricing'].answeredBefore, false, 'only ever unreachable before');
  assert.equal(by['rival.example__pricing'].unreachableLastCheck, true);
  assert.equal(by['rival.example__home'].answeredBefore, true);
  assert.equal(by['rival.example__home'].unreachableLastCheck, false);
  assert.equal(by['other.example__pricing'].url, 'other.example__pricing');
  assert.deepEqual(by['rival.example__home'].changes, ['h1: "Hello" -> "Hi"']);
  // End to end: the pricing page that started answering is an event, the unanswering stranger a sentinel.
  const [a, b] = cc.groupChanges(rows);
  assert.equal(a.host, 'other.example');
  assert.equal(a.sentinels.length, 1);
  assert.deepEqual(b.events.map((e) => e.kind).sort(), ['h1', 'pricing-page-appeared']);
});

// ---------------------------------------------------------------- sentinels are pricing addresses only

test('a non-pricing page that failed before its first snapshot is an ordinary event, never a pricing sentinel', () => {
  const rows = [
    {
      url: 'rival.example__products',
      key: 'rival.example__products',
      fetchedAt: '2026-11-10',
      changes: ['unreachable (HTTP 404)'],
    },
  ];
  const [g] = cc.groupChanges(rows);
  assert.deepEqual(g.sentinels, []);
  assert.equal(g.events.length, 1);
  assert.equal(g.events[0].kind, 'unreachable');
  assert.equal(g.events[0].plain, 'The page did not answer and the desk has no earlier copy of it');
  assert.equal(g.events[0].material, false, 'with no earlier copy it cannot be said to have stopped answering');
  assert.deepEqual(cc.competitorWorries([g], { today: TODAY }), []);
  assert.equal(JSON.stringify(g).includes('pricing page'), false);
});

test('a pricing address that an earlier check shows answering is not a sentinel', () => {
  const rows = [
    {
      url: 'rival.example__pricing',
      key: 'rival.example__pricing',
      fetchedAt: '2026-11-10',
      changes: ['unreachable (HTTP 404)'],
      answeredBefore: true,
    },
  ];
  const [g] = cc.groupChanges(rows);
  assert.deepEqual(g.sentinels, []);
  assert.equal(g.events[0].kind, 'unreachable');
  assert.equal(g.events[0].plain, 'The page did not answer (404)');
  assert.equal(g.events[0].material, true, 'a pricing page that used to answer and now gives an error');
});

// ---------------------------------------------------------------- a list cannot raise a false alarm

test('a price or button inside new text on a page with a changed list is not material, unless it is a pricing or product page', () => {
  const changes = ['h2s added: "Part 4: What it costs"', 'prices added: "$ 270"', 'ctas added: "Get started"'];
  const [g] = cc.groupChanges(rowsFor('rival.example', ['/', '/blog'], changes));
  const soft = g.events.filter((e) => e.kind === 'price' || e.kind === 'cta');
  assert.deepEqual(soft.map((e) => e.plain).sort(), [
    'A button label appears in new text on this page',
    'A price figure appears in new text on this page',
  ]);
  assert.equal(
    soft.every((e) => e.material === false),
    true
  );
  assert.equal(
    soft.every((e) => e.pages.length === 2),
    true,
    'kept on the page, merged across pages'
  );
  assert.deepEqual(cc.competitorWorries([g], { today: TODAY }), []);
  assert.equal(cc.summaryLine(g.events).includes('Nothing on price'), false, 'it does not claim there was no price');
  // The same text on a pricing or product page is a real signal.
  for (const path of ['/pricing', '/plans/team', '/product']) {
    const [p] = cc.groupChanges(rowsFor('rival.example', [path], changes));
    assert.equal(p.events.find((e) => e.kind === 'price').material, true, path);
    assert.equal(p.events.find((e) => e.kind === 'price').plain, 'A price appeared: "$ 270"');
  }
  // Without a list change on the page, a price is material anywhere.
  const [alone] = cc.groupChanges(rowsFor('rival.example', ['/'], ['prices added: "$9"']));
  assert.equal(alone.events[0].material, true);
});

// ---------------------------------------------------------------- a failed request is a blip until it repeats

test('unreachable (fetch failed) on a page that used to answer is material only on two checks in a row', () => {
  const once = rowsFor('rival.example', ['/'], ['unreachable (fetch failed)']);
  const [a] = cc.groupChanges(once);
  assert.equal(a.events[0].material, false);
  assert.equal(a.events[0].plain, 'The page did not answer (the request failed)');
  const twice = rowsFor('rival.example', ['/'], ['unreachable (fetch failed)'], { unreachableLastCheck: true });
  const [b] = cc.groupChanges(twice);
  assert.equal(b.events[0].material, true);
  assert.equal(b.events[0].plain, 'The page did not answer (the request failed) on two checks in a row');
  const [w] = cc.competitorWorries([b], { today: TODAY });
  assert.match(w.title, /stopped answering on its home page/);
  // An HTTP error is material on the first check, as before.
  assert.equal(
    cc.groupChanges(rowsFor('rival.example', ['/'], ['unreachable (HTTP 500)']))[0].events[0].material,
    true
  );
});

// ---------------------------------------------------------------- the host summary line

test('the host summary line is built from the kinds of event', () => {
  const sum = (changes, path = '/') =>
    cc.summaryLine(cc.groupChanges(rowsFor('rival.example', [path], changes))[0].events);
  assert.equal(
    sum([`h2s added: "G"`, 'body text changed with no heading/CTA/price move (+2 words)']),
    'Only heading changes and small text changes. Nothing on price, title, description, headline or buttons.'
  );
  assert.equal(
    sum(['unreachable (fetch failed)']),
    'Only a page that did not answer. Nothing on price, title, description, headline or buttons.'
  );
  assert.equal(
    sum(['something odd']),
    'Only changes the desk does not recognise. Nothing on price, title, description, headline or buttons.'
  );
  assert.equal(
    sum([`h2s added: "G"`, 'prices added: "$9"']),
    'Only heading changes and a price figure in new text. Nothing on the title, description or headline.'
  );
  assert.equal(sum(['title: "A" -> "B"']), 'One change worth reading.');
  assert.equal(sum(['title: "A" -> "B"', 'h1: "C" -> "D"']), '2 changes worth reading.');
  assert.equal(cc.summaryLine([]), 'Nothing changed on the pages we watch.');
  const text = sum(['unreachable (fetch failed)']);
  assert.equal(/headings or small text/i.test(text), false);
});

// ---------------------------------------------------------------- what Seen remembers

test('Seen covers the pages of a page that stopped answering, so a second page going away brings the card back', () => {
  const one = cc.groupChanges(rowsFor('rival.example', ['/a'], ['unreachable (HTTP 404)']));
  const two = cc.groupChanges(rowsFor('rival.example', ['/a', '/b'], ['unreachable (HTTP 404)']));
  const [w1] = cc.competitorWorries(one, { today: TODAY });
  const [w2] = cc.competitorWorries(two, { today: TODAY });
  assert.notEqual(w1.id, w2.id);
  const seen = { [w1.id]: { status: 'done' } };
  assert.equal(cc.competitorWorries(one, { items: seen, today: TODAY }).length, 0);
  assert.equal(cc.competitorWorries(two, { items: seen, today: TODAY }).length, 1);
  // Other kinds keep ignoring pages: a title change on one more page is still the same event set.
  const t1 = cc.groupChanges(rowsFor('rival.example', ['/a'], ['title: "A" -> "B"']));
  const t2 = cc.groupChanges(rowsFor('rival.example', ['/a', '/b'], ['title: "A" -> "B"']));
  assert.equal(cc.competitorItemId('rival.example', t1[0].events), cc.competitorItemId('rival.example', t2[0].events));
});

// ---------------------------------------------------------------- one list of links

test('pageLinks is the one place that picks the pages to open', () => {
  const events = [
    { pages: ['https://a.example/x', 'http://a.example/insecure', 'a.example__pricing'] },
    { pages: ['https://a.example/x', 'https://a.example/'] },
  ];
  assert.deepEqual(cc.pageLinks(events), [
    { url: 'https://a.example/x', label: '/x' },
    { url: 'https://a.example/', label: 'home page' },
  ]);
});

test('the printed plan leaves "(a hypothesis)" off a competitor card and any card that says it is not one', async () => {
  const print = await import('../static/views/print-week.js');
  assert.equal(print.isHypothesis({ measured: 'x', action: 'y' }), true);
  assert.equal(print.isHypothesis({ hypothesis: false }), false);
  assert.equal(print.isHypothesis({ competitor: { host: 'rival.example' } }), false);
});
