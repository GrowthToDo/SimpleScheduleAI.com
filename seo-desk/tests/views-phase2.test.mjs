import { test } from 'node:test';
import assert from 'node:assert/strict';

// The pure parts of the phase 2 pages: the filter bar's address handling and the keyword CSV
// preview. The page modules import nothing from the browser at load time, so they run here as
// they are. Every search phrase and page below is invented.

const filters = await import('../static/views/filters.js');
const { previewKeywordCsv, bulkTargetItems } = await import('../static/views/keywords.js');
const { toCsv } = await import('../static/views/table.js');
const { imageFileName } = await import('../static/chart.js');

const P = (s) => new URLSearchParams(s);

// ---------------------------------------------------------------- filter state from the address

test('readFilters: defaults when the address says nothing', () => {
  assert.deepEqual(filters.readFilters(P('')), {
    range: '28',
    start: '',
    end: '',
    q: '',
    qmode: 'contains',
    pagefilter: '',
    pagemode: 'contains',
    country: '',
    device: '',
  });
});

test('readFilters: keeps known values, drops unknown range and modes', () => {
  const s = filters.readFilters(
    P('range=last-month&q=night%20shift&qmode=exact&pagefilter=/blog&pagemode=excludes&country=CAN&device=mobile')
  );
  assert.equal(s.range, 'last-month');
  assert.equal(s.q, 'night shift');
  assert.equal(s.qmode, 'exact');
  assert.equal(s.pagefilter, '/blog');
  assert.equal(s.pagemode, 'excludes');
  assert.equal(s.country, 'can');
  assert.equal(s.device, 'MOBILE');
  const bad = filters.readFilters(P('range=365&qmode=regex&device=watch'));
  assert.equal(bad.range, '28');
  assert.equal(bad.qmode, 'contains');
  assert.equal(bad.device, '');
});

test('readFilters: a custom range keeps its dates, any other range drops them', () => {
  const c = filters.readFilters(P('range=custom&start=2026-09-01&end=2026-09-30'));
  assert.equal(c.start, '2026-09-01');
  assert.equal(c.end, '2026-09-30');
  const d = filters.readFilters(P('range=7&start=2026-09-01&end=2026-09-30'));
  assert.equal(d.start, '');
  assert.equal(d.end, '');
  const junk = filters.readFilters(P('range=custom&start=yesterday&end=2026-09-30'));
  assert.equal(junk.start, '');
});

test('readFilters: an impossible or late custom date falls back to 28 days and says why', () => {
  const feb = filters.readFilters(P('range=custom&start=2026-02-01&end=2026-02-31'), { today: '2026-11-11' });
  assert.equal(feb.range, '28');
  assert.equal(feb.start, '');
  assert.equal(feb.problem, 'One of the dates does not exist on the calendar. Pick both dates again.');
  const late = filters.readFilters(P('range=custom&start=2026-11-01&end=2026-11-10'), { today: '2026-11-11' });
  assert.equal(late.range, '28');
  assert.match(late.problem, /runs to 8 November/);
  const fine = filters.readFilters(P('range=custom&start=2026-10-01&end=2026-10-31'), { today: '2026-11-11' });
  assert.equal(fine.range, 'custom');
  assert.equal(fine.problem, undefined);
  assert.equal(
    filters.checkCustom('2026-02-01', '2026-02-31', '2026-11-11'),
    'One of the dates does not exist on the calendar. Pick both dates again.'
  );
  const junk = filters.readFilters(P('range=custom&end=2026-09-30'));
  assert.equal(junk.problem, 'Pick both dates first.');
});

test('hasFilters and isExploring', () => {
  const base = filters.readFilters(P(''));
  assert.equal(filters.hasFilters(base), false);
  assert.equal(filters.hasFilters({ ...base, q: 'rota' }), true);
  assert.equal(filters.hasFilters({ ...base, country: 'usa' }), true);
  assert.equal(filters.hasFilters({ ...base, q: '   ' }), false);
  const stored = ['7', '28', '90', '480'];
  assert.equal(filters.isExploring(base, stored), false);
  assert.equal(filters.isExploring({ ...base, range: '14' }, stored), true);
  assert.equal(filters.isExploring({ ...base, range: 'custom' }, stored), true);
  assert.equal(filters.isExploring({ ...base, device: 'TABLET' }, stored), true);
});

test('apiQuery: the explorer names, defaults left out, custom dates in', () => {
  const s = {
    ...filters.readFilters(P('')),
    range: 'custom',
    start: '2026-08-01',
    end: '2026-08-31',
    q: 'float pool',
    qmode: 'excludes',
    pagefilter: '/blog/x',
    pagemode: 'exact',
    country: 'gbr',
    device: 'DESKTOP',
  };
  const q = P(filters.apiQuery(s));
  assert.equal(q.get('range'), 'custom');
  assert.equal(q.get('start'), '2026-08-01');
  assert.equal(q.get('end'), '2026-08-31');
  assert.equal(q.get('q'), 'float pool');
  assert.equal(q.get('qmode'), 'excludes');
  assert.equal(q.get('page'), '/blog/x');
  assert.equal(q.get('pmode'), 'exact');
  assert.equal(q.get('country'), 'gbr');
  assert.equal(q.get('device'), 'DESKTOP');
  const plain = P(filters.apiQuery(filters.readFilters(P(''))));
  assert.equal(plain.toString(), 'range=28');
  const contains = P(filters.apiQuery({ ...filters.readFilters(P('')), q: 'x' }));
  assert.equal(contains.get('qmode'), null);
});

test('hashWith: replaces the filter part, keeps the rest of the address', () => {
  const s = { ...filters.readFilters(P('')), range: '7', q: 'call out' };
  const next = filters.hashWith('#/search?tab=queries&q=old&metric=clicks', 'search', s);
  const [route, query] = next.split('?');
  assert.equal(route, '#/search');
  const p = P(query);
  assert.equal(p.get('tab'), 'queries');
  assert.equal(p.get('metric'), 'clicks');
  assert.equal(p.get('range'), '7');
  assert.equal(p.get('q'), 'call out');
  assert.equal(p.get('qmode'), null);
  const cleared = filters.hashWith('#/search?range=7&q=x&country=usa', 'search', filters.readFilters(P('')));
  assert.equal(cleared, '#/search');
});

test('chipsOf: one removable chip per filter, in plain words', () => {
  const s = {
    ...filters.readFilters(P('')),
    q: 'night',
    qmode: 'excludes',
    pagefilter: '/blog',
    country: 'can',
    device: 'MOBILE',
  };
  const chips = filters.chipsOf(s, { countryName: (c) => (c === 'can' ? 'Canada' : c) });
  assert.deepEqual(
    chips.map((c) => c.text),
    ['Search does not contain "night"', 'Page contains "/blog"', 'Country: Canada', 'Device: Phone']
  );
  assert.deepEqual(chips[0].clear, { q: '', qmode: 'contains' });
  assert.deepEqual(filters.chipsOf(filters.readFilters(P(''))), []);
});

test('chipsOf: a dates chip for any range but the usual 28 days, removed back to 28 days', () => {
  const base = filters.readFilters(P(''));
  const custom = filters.chipsOf(
    { ...base, range: 'custom', start: '2026-10-01', end: '2026-10-31' },
    { today: '2026-11-11' }
  );
  assert.deepEqual(custom[0], {
    key: 'range',
    text: 'Dates: 1 October to 31 October',
    clear: { range: '28', start: '', end: '' },
  });
  const old = filters.chipsOf(
    { ...base, range: 'custom', start: '2025-12-01', end: '2026-01-31' },
    { today: '2026-11-11' }
  );
  assert.equal(old[0].text, 'Dates: 1 December 2025 to 31 January');
  assert.equal(filters.chipsOf({ ...base, range: 'last-month' })[0].text, 'Dates: last month');
  assert.equal(filters.chipsOf({ ...base, range: '480' })[0].text, 'Dates: 16 months');
  assert.equal(filters.chipsOf({ ...base, range: 'custom' }).length, 0);
});

test('checkCustom: plain sentences for every bad pair of dates', () => {
  const today = '2026-11-11';
  assert.equal(filters.checkCustom('2026-09-01', '2026-09-30', today), null);
  assert.equal(filters.checkCustom('', '2026-09-30', today), 'Pick both dates first.');
  assert.equal(
    filters.checkCustom('2026-10-01', '2026-09-30', today),
    'The first date must be on or before the second.'
  );
  assert.equal(
    filters.checkCustom('2026-11-01', '2026-11-10', today),
    'Search Console data runs to 8 November, so pick an end date on or before it.'
  );
  assert.equal(filters.checkCustom('2026-11-01', '2026-11-08', today), null);
  assert.equal(
    filters.checkCustom('2025-01-01', '2026-09-30', today),
    'Pick at most 16 months (480 days) between the two dates.'
  );
  for (const msg of [
    filters.checkCustom('', '', today),
    filters.checkCustom('2026-11-01', '2026-11-10', today),
    filters.checkCustom('2025-01-01', '2026-09-30', today),
  ]) {
    assert.doesNotMatch(msg, /[–—]/);
  }
});

test('RANGES: nine buttons with plain labels', () => {
  assert.deepEqual(
    filters.RANGES.map((r) => r.label),
    ['7 days', '14 days', '28 days', '90 days', '16 months', 'This month', 'Last month', 'Last quarter', 'Custom']
  );
});

// ---------------------------------------------------------------- the keyword CSV preview

test('previewKeywordCsv: byte-order mark, quoted commas, blank rows, repeats and known targets', () => {
  const text =
    '\uFEFFKeyword,Current URL,Priority,Keyword Difficulty\r\n' +
    '"rota template, weekly",/blog/rota,High,12\r\n' +
    ',/blog/empty,,3\r\n' +
    '\r\n' +
    'Night Float Pool,,low,40\r\n' +
    'night float pool,/blog/again,,1\r\n' +
    'Existing Target,/blog/x,,9\r\n';
  const out = previewKeywordCsv(text, { targets: new Set(['existing target']) });
  assert.deepEqual(
    out.rows.map((r) => [r.keyword, r.page, r.priority]),
    [
      ['rota template, weekly', '/blog/rota', 'high'],
      ['Night Float Pool', null, 'low'],
    ]
  );
  assert.deepEqual(
    out.skipped.map((s) => [s.line, s.why]),
    [
      [3, 'There is no keyword on this row.'],
      [6, 'That keyword is already earlier in the file.'],
      [7, 'That keyword is already a target.'],
    ]
  );
});

test('previewKeywordCsv: no keyword column, an empty file, and a full address folded to a path', () => {
  assert.deepEqual(previewKeywordCsv('Page,Volume\n/blog/a,10\n').skipped, [
    { line: 1, why: 'No column is named keyword, query or search, so nothing can be read.' },
  ]);
  assert.deepEqual(previewKeywordCsv('').skipped, [{ line: 1, why: 'The file is empty.' }]);
  const out = previewKeywordCsv('query,url\nshift swap rules,https://simplescheduleai.com/blog/swap/\n');
  assert.equal(out.rows[0].page, '/blog/swap');
});

test('previewKeywordCsv: a page that is not live is skipped when the live pages are known', () => {
  const out = previewKeywordCsv('keyword,page\nrota rules,/blog/gone\nshift rules,/blog/here\nno page given,\n', {
    live: new Set(['/blog/here']),
  });
  assert.deepEqual(
    out.rows.map((r) => r.keyword),
    ['shift rules', 'no page given']
  );
  assert.deepEqual(out.skipped, [{ line: 2, why: '/blog/gone is not a live page on the site.' }]);
});

test('previewKeywordCsv: stops after 5,000 rows and says so', () => {
  const lines = ['keyword'];
  for (let i = 0; i < 5003; i++) lines.push(`invented search ${i}`);
  const out = previewKeywordCsv(lines.join('\n'));
  assert.equal(out.rows.length, 5000);
  assert.equal(out.skipped.length, 1);
  assert.match(out.skipped[0].why, /first 5,000 rows/);
});

test('bulkTargetItems: rows whose page is not live are set aside, the rest go', () => {
  const rows = [
    { keyword: 'rota rules', rankingPage: '/blog/rota' },
    { keyword: 'old search', rankingPage: '/blog/gone' },
    { keyword: 'no page yet', rankingPage: null },
  ];
  const live = new Set(['/blog/rota', '/blog/other']);
  const out = bulkTargetItems(rows, { page: null, priority: 'high', intentGroup: null }, live);
  assert.deepEqual(out.items, [{ keyword: 'rota rules', page: '/blog/rota', priority: 'high', intentGroup: null }]);
  assert.deepEqual(
    out.skipped.map((r) => r.keyword),
    ['old search', 'no page yet']
  );
  const one = bulkTargetItems(rows, { page: '/blog/other', priority: null, intentGroup: 'g' }, live);
  assert.equal(one.items.length, 3);
  assert.ok(one.items.every((i) => i.page === '/blog/other'));
  assert.equal(one.skipped.length, 0);
  // Live pages unknown: nothing is set aside here; the desk checks on save.
  assert.equal(bulkTargetItems(rows, { page: null }, new Set()).items.length, 2);
});

// ---------------------------------------------------------------- CSV out and the image name

test('toCsv: header first, quotes where needed, CRLF', () => {
  const csv = toCsv(
    ['Search', 'Times shown'],
    [
      ['plain', 3],
      ['has, comma', 10],
      ['has "quote"', null],
    ]
  );
  assert.equal(csv, 'Search,Times shown\r\nplain,3\r\n"has, comma",10\r\n"has ""quote""",\r\n');
});

test('toCsv: a cell that a spreadsheet would run as a formula is kept as text', () => {
  assert.equal(toCsv(['a'], [['=SUM(1)']]), "a\r\n'=SUM(1)\r\n");
});

test('imageFileName: a tidy file name from the chart title', () => {
  assert.equal(imageFileName('Times shown, each day'), 'times-shown-each-day.png');
  assert.equal(imageFileName(''), 'chart.png');
  assert.equal(imageFileName('"nurse rota" / 2026!'), 'nurse-rota-2026.png');
});
