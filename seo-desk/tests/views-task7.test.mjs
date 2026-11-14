import { test } from 'node:test';
import assert from 'node:assert/strict';

// The pure parts of the phase 2 task 7 pages: the audit section's grouping and scores, the link
// suggestion sentence and Claude brief, the verdict care line, and the visitors breakdown gate.
// These modules import nothing from the browser at load time. Every page, phrase and update
// name below is invented.

const audit = await import('../static/views/audit.js');
const links = await import('../static/views/links.js');
const { careLine, spanText } = await import('../static/views/results.js');
const { breakdownState, WAITING } = await import('../static/views/visitors.js');

const dateText = (iso) => `day ${iso}`;

// ---------------------------------------------------------------- audit

test('bySeverity: worst first, empty groups left out, server order kept inside a group', () => {
  const issues = [
    { id: 'a', severity: 'low' },
    { id: 'b', severity: 'critical' },
    { id: 'c', severity: 'low' },
  ];
  const groups = audit.bySeverity(issues);
  assert.deepEqual(
    groups.map((g) => g.key),
    ['critical', 'low']
  );
  assert.deepEqual(
    groups[1].issues.map((i) => i.id),
    ['a', 'c']
  );
  assert.deepEqual(audit.bySeverity([]), []);
  assert.deepEqual(audit.bySeverity(undefined), []);
});

test('scoreBand: 90 and up good, 50 to 89 middling, under 50 poor, no number none', () => {
  assert.equal(audit.scoreBand(100), 'good');
  assert.equal(audit.scoreBand(90), 'good');
  assert.equal(audit.scoreBand(89), 'mid');
  assert.equal(audit.scoreBand(50), 'mid');
  assert.equal(audit.scoreBand(49), 'poor');
  assert.equal(audit.scoreBand(0), 'poor');
  assert.equal(audit.scoreBand(null), 'none');
});

test('countsText: plain counts, zeros left out, nothing found when clean', () => {
  assert.equal(audit.countsText({ critical: 2, high: 1, medium: 0, low: 3 }), '2 critical, 1 high, 3 low');
  assert.equal(audit.countsText({ critical: 0, high: 0, medium: 4, low: 0 }), '4 medium');
  assert.equal(audit.countsText({ critical: 0, high: 0, medium: 0, low: 0 }), 'nothing found');
  assert.equal(audit.countsText(undefined), 'nothing found');
});

test('auditLinks: the live page and its Search Console report, as the server builds them', () => {
  const l = audit.auditLinks('/blog/invented-post', 'https://example.test');
  assert.equal(l.live, 'https://example.test/blog/invented-post');
  assert.equal(
    l.searchConsole,
    'https://search.google.com/search-console/performance/search-analytics?resource_id=https%3A%2F%2Fexample.test%2F&page=!https%3A%2F%2Fexample.test%2Fblog%2Finvented-post'
  );
});

test('pageCount and the speed line', () => {
  assert.equal(audit.pageCount([{ pages: [1, 2] }, { pages: [3] }]), 3);
  assert.equal(audit.pageCount(null), 0);
  assert.equal(audit.SPEED_LINE, "Hints from the page's weight, not measured speed.");
});

// ---------------------------------------------------------------- link suggestions

const sugg = {
  to: '/blog/invented-target',
  from: '/blog/invented-source',
  anchor: 'rota planning for small wards',
  context: 'Most teams start rota planning for small wards on paper.',
  status: 'open',
};

test('suggestionText reads as one sentence', () => {
  assert.equal(
    links.suggestionText(sugg),
    "Link from /blog/invented-source to /blog/invented-target using the words 'rota planning for small wards'"
  );
});

test('briefFor names both pages, the words and the sentence, and never says a routine link cannot matter', () => {
  const brief = links.briefFor(sugg, 'rota planning');
  assert.match(brief, /Page to edit: \/blog\/invented-source/);
  assert.match(brief, /Link to: \/blog\/invented-target/);
  assert.match(brief, /Words to turn into the link: "rota planning for small wards"/);
  assert.match(brief, /The sentence they are in: "Most teams start rota planning for small wards on paper\."/);
  assert.match(brief, /Search it may help with: rota planning/);
  assert.doesNotMatch(brief, /does not count toward the one live page edit a week/);
  assert.doesNotMatch(brief, /do not freeze the page/);
  assert.doesNotMatch(brief, /being measured/, 'no warning when the page is free');
  assert.doesNotMatch(brief, /[–—]/, 'no en or em dashes');
  assert.doesNotMatch(links.briefFor(sugg, null), /Search it may help with/);
});

test('a frozen page to edit gets a chip and the same warning in the row and in the brief', () => {
  const frozen = { ...sugg, fromFrozenUntil: '2026-12-07', fromFrozenUntilText: '7 December' };
  const line =
    'This page is being measured until 7 December. Adding the link now will blur that verdict; wait if you can.';
  assert.equal(links.frozenWarning(frozen), line);
  assert.equal(links.frozenWarning(sugg), null);
  assert.ok(links.briefFor(frozen, 'rota planning').includes(line));
  assert.equal(links.frozenChipText(frozen), 'Frozen until 7 December');
  assert.equal(links.frozenChipText(sugg), null);
});

test('the audit marks frozen pages and says whether a fix is the week page edit', () => {
  assert.equal(audit.frozenText({ frozenUntilText: '7 December' }), 'Frozen until 7 December');
  assert.equal(audit.frozenText({ frozenUntilText: null }), null);
  assert.match(audit.editLineText({ editsPage: true, pages: [] }), /counts as that week's one page edit/);
  assert.match(
    audit.editLineText({ editsPage: true, pages: [{ frozenUntilText: '7 December' }, { frozenUntilText: null }] }),
    /1 of these pages is frozen/
  );
  assert.match(audit.editLineText({ editsPage: false, pages: [] }), /does not count as the week's page edit/);
  assert.match(audit.editLineText({ editsPage: false, pages: [{ frozenUntilText: '7 December' }] }), /being measured/);
});

test('openCount counts suggestions not yet done across pages', () => {
  const pages = [
    { suggestions: [{ status: 'open' }, { status: 'done' }] },
    { suggestions: [{ status: 'open' }] },
    { suggestions: [] },
  ];
  assert.equal(links.openCount(pages), 2);
  assert.equal(links.openCount(undefined), 0);
});

// ---------------------------------------------------------------- verdict care line

test('careLine: one quiet sentence naming the update and its date, never a cause', () => {
  assert.equal(careLine([], dateText), null);
  assert.equal(careLine(undefined, dateText), null);
  const one = careLine([{ label: 'Invented spam update', date: '2026-09-24' }], dateText);
  assert.equal(
    one,
    "Google's Invented spam update (from day 2026-09-24) fell inside these dates, so read this verdict with care."
  );
  assert.doesNotMatch(one, /because|caused|due to/i);
  const two = careLine(
    [
      { label: 'Update A', date: '2026-08-18' },
      { label: 'Update B', date: '2026-09-24' },
    ],
    dateText
  );
  assert.match(two, /Update A \(from day 2026-08-18\) and Update B \(from day 2026-09-24\) fell inside/);
});

test('spanText: a range, a single day, and an update still rolling out', () => {
  assert.equal(spanText('2026-09-24', '2026-10-08', dateText), 'day 2026-09-24 to day 2026-10-08');
  assert.equal(spanText('2026-09-24', null, dateText), 'day 2026-09-24');
  assert.equal(spanText('2026-09-24', '2026-09-24', dateText), 'day 2026-09-24');
  assert.equal(spanText('2026-11-10', null, dateText, { open: true }), 'from day 2026-11-10, still rolling out');
});

// ---------------------------------------------------------------- visitors breakdowns

test('breakdownState: waiting before the pull, none without visits, shares only above the minimum', () => {
  assert.equal(WAITING, 'This fills in after the next refresh.');
  assert.deepEqual(breakdownState({ available: false, total: 0, rows: [] }), { state: 'waiting', enough: false });
  assert.deepEqual(breakdownState(undefined), { state: 'waiting', enough: false });
  assert.deepEqual(breakdownState({ available: true, total: 0, rows: [] }), { state: 'none', enough: false });
  const row = { name: 'invented / referral', label: 'invented / referral', sessions: 5 };
  assert.deepEqual(breakdownState({ available: true, total: 5, rows: [row] }), { state: 'ok', enough: false });
  assert.deepEqual(breakdownState({ available: true, total: 20, rows: [row] }), { state: 'ok', enough: true });
});

test('the second page edit confirm uses the rule in plain words', async () => {
  const { secondEditText } = await import('../static/views/card.js');
  assert.equal(
    secondEditText({ page: '/blog/invented', date: '2026-11-09', dateText: '9 November' }),
    "You already made this week's page edit on 9 November. The rule is one a week. Mark this one done anyway?"
  );
  assert.match(secondEditText({ dateText: '9 November' }, 'Log this one anyway?'), /Log this one anyway\?$/);
});
