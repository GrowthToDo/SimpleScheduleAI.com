// The page shell: the route table, old addresses, the sidebar and its counts, the theme choice.
// Pure functions only; the shell modules start nothing under node.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const app = await import('../static/app.js');
const nav = await import('../static/views/nav.js');
const theme = await import('../static/theme.js');

const EVERY_ROUTE = [
  'week',
  'performance',
  'queries',
  'pages',
  'keyword-map',
  'cannibalization',
  'runner-up',
  'secondary-keywords',
  'content-gaps',
  'decay',
  'links',
  'opportunities',
  'audit',
  'ai',
  'visitors',
  'results',
  'keywords',
  'competitors',
  'settings',
];

// Routes with no sidebar entry: the week's plan as a page to print.
const OFF_SIDEBAR = ['print/week'];
// Routes drawn above the sidebar groups: the Ask page (nav.js ASK_ENTRY).
const ABOVE_GROUPS = ['ask'];

test('the route table holds every page, and nothing else', () => {
  assert.deepEqual(Object.keys(app.ROUTES).sort(), [...EVERY_ROUTE, ...OFF_SIDEBAR, ...ABOVE_GROUPS].sort());
  assert.equal(nav.entryFor('ask').label, 'Ask');
});

test('every route has a view module on disk that exports render', async () => {
  const files = new Set(await readdir(new URL('../static/views/', import.meta.url)));
  for (const [route, mod] of Object.entries(app.ROUTES)) {
    assert.ok(files.has(`${mod}.js`), `${route} -> views/${mod}.js is missing`);
    const text = await readFile(new URL(`../static/views/${mod}.js`, import.meta.url), 'utf8');
    assert.match(text, /export (async )?(function render|const render)/, `views/${mod}.js has no render`);
  }
});

test('the existing pages keep their modules', () => {
  assert.equal(app.ROUTES.performance, 'overview');
  assert.equal(app.ROUTES.queries, 'search');
  assert.equal(app.ROUTES.pages, 'pages');
  assert.equal(app.ROUTES.audit, 'health');
  assert.equal(app.ROUTES.week, 'week');
});

test('the sidebar lists every route once, in five groups, in the order of the design', () => {
  assert.deepEqual(
    nav.NAV.map((g) => g.group),
    ['Plan', 'Search', 'Insights', 'Health and AI', 'Workspace']
  );
  assert.deepEqual(
    nav.NAV_ENTRIES.map((e) => e.route),
    EVERY_ROUTE
  );
  assert.deepEqual(
    nav.NAV.find((g) => g.group === 'Insights').items.map((e) => e.label),
    [
      'Keyword map',
      'Cannibalization',
      'Runner-up keywords',
      'Secondary keywords',
      'Content gaps',
      'Decay',
      'Internal links',
      'All opportunities',
    ]
  );
  for (const e of nav.NAV_ENTRIES) assert.ok(e.explain && !/[\u2013\u2014]/.test(e.explain + e.label), e.route);
});

test('every count key from /api/nav has a sidebar entry', () => {
  const keys = [
    'keywordMap',
    'cannibalization',
    'runnerUp',
    'secondaryKeywords',
    'contentGaps',
    'decay',
    'internalLinks',
    'opportunities',
    'auditToFix',
    'worries',
  ];
  assert.deepEqual(
    nav.NAV_ENTRIES.filter((e) => e.count)
      .map((e) => e.count)
      .sort(),
    [...keys].sort()
  );
});

test('old addresses go to their new page and keep their parameters', () => {
  assert.deepEqual(app.resolveRoute('search', ''), { name: 'performance', query: '', moved: true });
  assert.deepEqual(app.resolveRoute('health', ''), { name: 'audit', query: '', moved: true });
  assert.deepEqual(app.resolveRoute('health', 'x=1'), { name: 'audit', query: 'x=1', moved: true });
  assert.deepEqual(app.resolveRoute('search', 'range=90'), { name: 'performance', query: 'range=90', moved: true });
  // The Search page's lists now live under Queries, so a link to one of them lands there.
  assert.deepEqual(app.resolveRoute('search', 'tab=queries&range=90'), {
    name: 'queries',
    query: 'tab=queries&range=90',
    moved: true,
  });
  assert.deepEqual(app.resolveRoute('search', 'tab=targets'), { name: 'queries', query: 'tab=targets', moved: true });
  assert.deepEqual(app.resolveRoute('search', 'q=nurse&qmode=exact'), {
    name: 'queries',
    query: 'q=nurse&qmode=exact',
    moved: true,
  });
  // The Pages list lives only on Pages: an old link to the Search page's Pages tab lands there.
  assert.deepEqual(app.resolveRoute('search', 'tab=pages&pagefilter=blog'), {
    name: 'pages',
    query: 'tab=pages&pagefilter=blog',
    moved: true,
  });
  assert.deepEqual(app.resolveRoute('queries', 'tab=pages'), { name: 'pages', query: 'tab=pages', moved: true });
  assert.equal(app.OLD_ROUTES.search, 'performance');
  assert.equal(app.OLD_ROUTES.health, 'audit');
});

test('the skip link target is not a route: the router leaves an in-page anchor alone', () => {
  assert.equal(Object.hasOwn(app.ROUTES, 'view'), false);
  assert.equal(app.isRouteHash('#view'), false);
  assert.equal(app.isRouteHash('#/week'), true);
  assert.equal(app.isRouteHash('#/'), true);
  assert.equal(app.isRouteHash(''), true);
});

test('current addresses resolve to themselves; unknown ones go to This week', () => {
  assert.deepEqual(app.resolveRoute('pages', 'page=%2Fblog%2Fx'), {
    name: 'pages',
    query: 'page=%2Fblog%2Fx',
    moved: false,
  });
  assert.deepEqual(app.resolveRoute('queries', ''), { name: 'queries', query: '', moved: false });
  assert.deepEqual(app.resolveRoute('nope', 'a=1'), { name: 'week', query: '', moved: true });
  assert.deepEqual(app.resolveRoute('', ''), { name: 'week', query: '', moved: false });
});

test('parseHashText splits a hash into a route and its query', () => {
  assert.deepEqual(app.parseHashText('#/search?tab=queries'), { name: 'search', query: 'tab=queries' });
  assert.deepEqual(app.parseHashText('#/pages'), { name: 'pages', query: '' });
  assert.deepEqual(app.parseHashText(''), { name: '', query: '' });
});

test('a count the server could not make yet shows as a dash, a number with commas otherwise', () => {
  assert.equal(nav.countText(null), '-');
  assert.equal(nav.countText(undefined), '-');
  assert.equal(nav.countText(0), '0');
  assert.equal(nav.countText(1234), '1,234');
});

test('a count slot: nothing before /api/nav answers, a dash with a reason after', () => {
  const e = nav.entryFor('secondary-keywords');
  // Not loaded yet: the slot is empty, not a dash.
  assert.deepEqual(nav.countView(e, null), { text: '', title: '', tone: '', label: '' });
  // The server does not send the key at all.
  assert.deepEqual(nav.countView(e, { runnerUp: 4 }), {
    text: '-',
    title: 'Not available yet.',
    tone: '',
    label: 'Not available yet.',
  });
  // The key is there but its source was never pulled.
  const never = nav.countView(nav.entryFor('decay'), { decay: null });
  assert.equal(never.text, '-');
  assert.match(never.label, /Search Console has not been pulled/);
  // A number: the words for screen readers say what it counts.
  const some = nav.countView(nav.entryFor('decay'), { decay: 16 });
  assert.deepEqual(some, { text: '16', title: '16 pages', tone: 'warn', label: '16 pages' });
});

test('the Technical audit entry shows the open critical and high issues, a tick when none, never the score', () => {
  const audit = nav.entryFor('audit');
  assert.equal(audit.count, 'auditToFix');
  const two = nav.countView(audit, { auditToFix: 2, auditOpen: 2, auditScore: 71 });
  assert.equal(two.text, '2 to fix');
  assert.equal(two.tone, 'danger');
  assert.equal(two.label, '2 critical or high issues to fix.');
  const none = nav.countView(audit, { auditToFix: 0, auditOpen: 4, auditScore: 93 });
  assert.equal(none.text, nav.TICK);
  assert.equal(none.tone, '');
  assert.equal(none.label, 'Nothing critical or high to fix. 4 lower priority issues are on the page.');
  assert.equal(nav.countView(audit, { auditToFix: null }).text, '-');
  for (const v of [two, none]) assert.doesNotMatch(v.text + v.label, /93|71|score/i);
});

test('the insight quick links row lists the six insights in the founder reference order', () => {
  assert.deepEqual(nav.INSIGHT_LINKS, [
    'decay',
    'cannibalization',
    'runner-up',
    'secondary-keywords',
    'links',
    'content-gaps',
  ]);
  for (const r of nav.INSIGHT_LINKS) assert.ok(nav.entryFor(r), r);
  // Built with a stand-in for h: the current page is marked, counts show, a missing count is a dash.
  const h = (tag, attrs, ...kids) => ({ tag, attrs, kids: kids.flat(Infinity).filter((k) => k != null) });
  const row = nav.insightLinks(h, 'decay', { decay: 7 });
  const links = row.kids;
  assert.equal(links.length, 6);
  assert.equal(links[0].attrs['aria-current'], 'page');
  assert.equal(links[1].attrs['aria-current'], null);
  // Each link: label, then the count slot (visible number hidden from screen readers, then words).
  const [badge, words] = links[0].kids[1].kids;
  assert.equal(badge.kids[0], '7');
  assert.equal(badge.attrs['aria-hidden'], 'true');
  assert.equal(words.attrs.class, 'sr-only');
  assert.equal(words.kids[0], ', 7 pages');
  assert.equal(links[3].kids[1].kids[0].kids[0], '-');
  assert.equal(links[3].kids[1].kids[1].kids[0], ', Not available yet.');
  // Before the counts arrive the slot shows nothing.
  const empty = nav.insightLinks(h, 'decay', null).kids[0].kids[1].kids;
  assert.equal(empty[0].kids[0], '');
  assert.equal(empty[0].attrs.hidden, true);
});

test('warning and danger tints only above zero, only on the counts that carry one', () => {
  const cannib = nav.entryFor('cannibalization');
  const decay = nav.entryFor('decay');
  const week = nav.entryFor('week');
  const runner = nav.entryFor('runner-up');
  assert.equal(nav.countTone(cannib, 3), 'warn');
  assert.equal(nav.countTone(decay, 1), 'warn');
  assert.equal(nav.countTone(week, 2), 'danger');
  assert.equal(nav.countTone(cannib, 0), '');
  assert.equal(nav.countTone(week, null), '');
  assert.equal(nav.countTone(runner, 40), '');
});

test('the hover text of a count says why it is a dash', () => {
  assert.match(nav.countTitle(nav.entryFor('decay'), null), /Search Console has not been pulled/);
  assert.match(nav.countTitle(nav.entryFor('audit'), null), /No technical audit/);
  assert.equal(
    nav.countTitle(nav.entryFor('audit'), 2, { auditToFix: 2, auditOpen: 5 }),
    '2 critical or high issues to fix. 3 lower priority issues are on the page.'
  );
  assert.equal(nav.countTitle(nav.entryFor('cannibalization'), 1), '1 search');
  assert.equal(nav.countTitle(nav.entryFor('performance'), 5), '');
});

test('the theme is dark unless light was saved; a broken storage still gives dark', () => {
  const store = (v) => ({ getItem: () => v, setItem: () => {} });
  assert.equal(theme.readTheme(store(null)), 'dark');
  assert.equal(theme.readTheme(store('light')), 'light');
  assert.equal(theme.readTheme(store('purple')), 'dark');
  const broken = {
    getItem: () => {
      throw new Error('blocked');
    },
    setItem: () => {
      throw new Error('blocked');
    },
  };
  assert.equal(theme.readTheme(broken), 'dark');
  assert.equal(theme.saveTheme(broken, 'light'), false);
  let saved = null;
  assert.equal(theme.saveTheme({ setItem: (k, v) => (saved = [k, v]) }, 'light'), true);
  assert.deepEqual(saved, [theme.THEME_KEY, 'light']);
});

test('no colour literal in any view or component style outside the two theme blocks', async () => {
  const dir = new URL('../static/', import.meta.url);
  const views = (await readdir(new URL('views/', dir))).filter((f) => f.endsWith('.js')).map((f) => `views/${f}`);
  const literal = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/;
  for (const f of [...views, 'chart.js', 'app.js', 'theme.js']) {
    const lines = (await readFile(new URL(f, dir), 'utf8')).split('\n');
    lines.forEach((line, i) => {
      if (/^\s*\/\//.test(line)) return;
      assert.ok(!literal.test(line), `${f}:${i + 1} has a colour literal: ${line.trim()}`);
    });
  }
  const css = await readFile(new URL('app.css', dir), 'utf8');
  const outside = css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/:root\s*\{[^}]*\}/, '')
    .replace(/:root\[data-theme='light'\]\s*\{[^}]*\}/, '');
  assert.ok(!literal.test(outside), `app.css has a colour literal outside the theme blocks: ${literal.exec(outside)}`);
});

// ------------------------------------------------------------------ the Performance page

const overview = await import('../static/views/overview.js');

test('Performance tiles say their change in the right unit, or not enough data yet', () => {
  const { changeLine } = overview;
  assert.equal(changeLine({ change: 105.8, changeKind: 'percent' }, 28), '+105.8% on the 28 days before');
  assert.equal(changeLine({ change: -3, changeKind: 'percent' }, 7), '-3% on the 7 days before');
  assert.equal(changeLine({ change: 0.1, changeKind: 'points' }, 28), '+0.1 points on the 28 days before');
  assert.equal(changeLine({ change: -1, changeKind: 'points' }, 90), '-1 point on the 90 days before');
  assert.equal(changeLine({ change: 1.7, changeKind: 'positions' }, 28), '1.7 places better');
  assert.equal(changeLine({ change: null, changeKind: 'percent' }, 480), 'not enough data yet');
});

test('the chart keeps only edit and Google update markers, one per day and kind', () => {
  const marks = overview.chartMarkers([
    { date: '2026-10-15', kind: 'edit', label: 'a' },
    { date: '2026-10-15', kind: 'edit', label: 'b' },
    { date: '2026-10-15', kind: 'publish', label: 'Published /x' },
    { date: '2026-10-20', kind: 'google-update', label: 'November core update' },
    { date: '2026-10-21', kind: 'note', label: 'n' },
  ]);
  assert.deepEqual(
    marks.map((m) => [m.date, m.kind]),
    [
      ['2026-10-15', 'edit'],
      ['2026-10-20', 'google-update'],
    ]
  );
  assert.equal(marks[0].label, '2 page edits: a; b');
  assert.equal(marks[1].label, 'Google update: November core update');
});

// The range a series covers is the server's now (/api/overview sends range, short, coverageNote and
// pagesRange); the page no longer works it out. See tests/insights.test.mjs.
test('the Performance page takes its covered range from the server', () => {
  assert.equal(overview.seriesCoverage, undefined);
});
