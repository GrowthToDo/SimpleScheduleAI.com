import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  diagnoseWindows,
  foldPageRows,
  foldQueryPageRows,
  isBrand,
  isQuestion,
  lostQueries,
  nearPageOne,
  pageMovement,
  questions,
  splitQueries,
  targetKeywords,
  unservedDemand,
  buildDiagnosis,
  SPLIT_NOTE,
} from '../lib/gsc-diagnose-core.mjs';
import { parseLine, splitLines, isResponse, unwrapToolResult, rowsOf } from '../lib/gsc-mcp.mjs';

const S = 'https://simplescheduleai.com';
const qp = (query, page, impressions, position, clicks = 0) => ({
  query,
  page: `${S}${page}`,
  clicks,
  impressions,
  ctr: impressions ? clicks / impressions : 0,
  position,
});
const pg = (page, impressions, position, clicks = 0) => ({
  page: `${S}${page}`,
  clicks,
  impressions,
  ctr: impressions ? clicks / impressions : 0,
  position,
});

test('windows: current ends today-3, previous is the 28 days before', () => {
  const w = diagnoseWindows('2026-10-30');
  assert.deepEqual(w.cur, { start: '2026-09-30', end: '2026-10-27' });
  assert.deepEqual(w.prev, { start: '2026-09-02', end: '2026-09-29' });
});

test('fold: page#heading and trailing slash fold into the base page', () => {
  const rows = foldPageRows([
    pg('/blog/a', 100, 5, 10),
    pg('/blog/a/', 100, 15, 0),
    { ...pg('/blog/a', 50, 10), page: `${S}/blog/a#section` },
  ]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].page, `${S}/blog/a`);
  assert.equal(rows[0].impressions, 250);
  assert.equal(rows[0].clicks, 10);
  assert.equal(rows[0].position, 10); // (500 + 1500 + 500) / 250
});

test('fold: query,page rows fold on query + base page, keys shape accepted', () => {
  const rows = foldQueryPageRows([
    qp('q', '/a', 10, 4),
    { ...qp('q', '/a', 10, 6), page: `${S}/a#x` },
    { keys: ['q', `${S}/a/`], clicks: 0, impressions: 20, position: 5 },
  ]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].impressions, 40);
});

test('a: only pages with 50+ prev impressions are judged; control and verdicts', () => {
  const prev = [];
  const cur = [];
  for (let i = 0; i < 6; i++) {
    prev.push(pg(`/p${i}`, 100, 8));
    cur.push(pg(`/p${i}`, 100, 8)); // control = 0%
  }
  prev.push(pg('/small', 49, 8)); // under 50: excluded
  prev.push(pg('/down', 200, 5));
  cur.push(pg('/down', 50, 9));
  prev.push(pg('/up', 200, 12));
  cur.push(pg('/up', 400, 6));
  const r = pageMovement(prev, cur);
  assert.equal(r.control.pages, 8);
  assert.equal(r.judged, 8);
  assert.equal(r.worse[0].page, `${S}/down`);
  assert.equal(r.worse[0].verdict, 'worse');
  assert.equal(r.better[0].page, `${S}/up`);
  assert.ok(!r.worse.concat(r.better).some((i) => i.page.endsWith('/small')));
});

test('a: worse list is sorted most negative first, and a page absent from cur is lost-demand', () => {
  const prev = [];
  const cur = [];
  for (let i = 0; i < 6; i++) {
    prev.push(pg(`/p${i}`, 100, 8));
    cur.push(pg(`/p${i}`, 100, 8));
  }
  prev.push(pg('/gone', 100, 8)); // absent in cur
  prev.push(pg('/dip', 100, 8));
  cur.push(pg('/dip', 60, 8));
  const r = pageMovement(prev, cur);
  assert.deepEqual(
    r.worse.map((i) => i.page.replace(S, '')),
    ['/gone', '/dip']
  );
  assert.equal(r.worse[0].dropType, 'lost-demand');
});

test('b: lost = 20+ prev impressions and 0 or absent in cur, grouped by page', () => {
  const prev = [
    qp('gone', '/a', 25, 6),
    qp('split gone', '/a', 12, 6),
    qp('split gone', '/b', 12, 9), // 24 total across pages
    qp('too small', '/a', 19, 6),
    qp('still here', '/a', 50, 6),
    qp('zero now', '/b', 40, 3),
  ];
  const cur = [qp('still here', '/a', 40, 7), qp('zero now', '/b', 0, 0)];
  const r = lostQueries(prev, cur);
  assert.equal(r.queryCount, 3); // gone, split gone, zero now
  const a = r.groups.find((g) => g.page === `${S}/a`);
  assert.deepEqual(
    a.queries.map((q) => q.query),
    ['gone', 'split gone']
  );
  assert.equal(a.queries[0].position, 6);
  assert.ok(!r.groups.flatMap((g) => g.queries).some((q) => q.query === 'too small'));
});

test('c: split needs 2+ pages, 30+ impressions, top share below 0.70', () => {
  const rows = [
    qp('even', '/a', 20, 5),
    qp('even', '/b', 20, 7),
    qp('exactly seventy', '/a', 70, 5),
    qp('exactly seventy', '/b', 30, 7), // share 0.70: NOT split
    qp('just under', '/a', 69, 5),
    qp('just under', '/b', 31, 7), // 0.69: split
    qp('one page', '/a', 200, 3),
    qp('too small', '/a', 15, 5),
    qp('too small', '/b', 14, 5), // total 29
  ];
  const r = splitQueries(rows);
  assert.deepEqual(r.map((x) => x.query).sort(), ['even', 'just under']);
  const even = r.find((x) => x.query === 'even');
  assert.equal(even.pages[0].share, 0.5);
  assert.equal(even.pages[1].position, 7);
  assert.match(SPLIT_NOTE, /take turns/);
});

test('d: question regex and 6-word rule', () => {
  assert.equal(isQuestion('what is a float pool'), true);
  assert.equal(isQuestion('How many nurses'), true);
  assert.equal(isQuestion('can nurses refuse overtime'), true);
  assert.equal(isQuestion('whatever nurse scheduling'), false); // "whatever" is not "what"
  assert.equal(isQuestion('isolation unit staffing'), false); // "is" must be a whole word
  assert.equal(isQuestion('nurse scheduling software for small hospitals'), true); // 6 words
  assert.equal(isQuestion('nurse scheduling software cost'), false);
});

test('d: grouped by top page, weak when best position is above 15', () => {
  const rows = [
    qp('how do you build a nurse schedule', '/a', 20, 18),
    qp('how do you build a nurse schedule', '/b', 5, 12),
    qp('what is a float pool', '/a', 12, 9),
    qp('what is x', '/a', 9, 3), // under 10 impressions
    qp('nurse scheduling', '/a', 500, 3), // not a question
  ];
  const r = questions(rows);
  assert.equal(r.count, 2);
  assert.equal(r.groups.length, 1);
  assert.equal(r.groups[0].page, `${S}/a`);
  const byQ = Object.fromEntries(r.groups[0].queries.map((q) => [q.query, q]));
  assert.equal(byQ['how do you build a nurse schedule'].bestPosition, 12);
  assert.equal(byQ['how do you build a nurse schedule'].weak, false);
  assert.equal(byQ['what is a float pool'].weak, false);
  const weak = questions([qp('what is a ghost shift', '/a', 20, 16)]);
  assert.equal(weak.groups[0].queries[0].weak, true);
});

test('e: brand match is by word boundary (tcp does not match tcpip)', () => {
  const brands = ['tcp', 'm7', 'smart square', 'in-house health'];
  assert.equal(isBrand('tcp scheduling login', brands), true);
  assert.equal(isBrand('tcpip nurse schedule', brands), false);
  assert.equal(isBrand('m7 health', brands), true);
  assert.equal(isBrand('m70 scheduling', brands), false);
  assert.equal(isBrand('is smart square good', brands), true);
  assert.equal(isBrand('in-house health reviews', brands), true);
  assert.equal(isBrand('Smart Square', brands), true);
});

test('e: near page one is position 8-20 inclusive, 30+ impressions, non-brand', () => {
  const brands = ['tcp'];
  const rows = [
    qp('ok low edge', '/a', 30, 8),
    qp('ok high edge', '/a', 30, 20),
    qp('too high', '/a', 100, 7.9),
    qp('too low', '/a', 100, 20.1),
    qp('few impressions', '/a', 29, 10),
    qp('tcp login', '/a', 100, 10),
    qp('tcpip schedule', '/a', 100, 10),
  ];
  assert.deepEqual(
    nearPageOne(rows, brands)
      .map((r) => r.query)
      .sort(),
    ['ok high edge', 'ok low edge', 'tcpip schedule']
  );
});

test('f: unserved = 30+ impressions and best position across pages above 20', () => {
  const rows = [
    qp('nobody ranks', '/a', 30, 45),
    qp('nobody ranks', '/b', 10, 25),
    qp('one page ranks', '/a', 50, 40),
    qp('one page ranks', '/b', 5, 12), // best position 12: served
    qp('small', '/a', 29, 50),
    qp('edge', '/a', 40, 20), // best position exactly 20: not above 20
  ];
  assert.deepEqual(
    unservedDemand(rows).map((q) => q.query),
    ['nobody ranks']
  );
});

test('g: target keyword vs ranking page: ok, mismatch, not found', () => {
  const registry = [
    { slug: 'a', url: '/blog/a', primaryKeyword: 'Float Pool Nurse' },
    { slug: 'b', url: '/blog/b', primaryKeyword: 'night shift pay' },
    { slug: 'c', url: '/blog/c', primaryKeyword: 'never searched' },
    { slug: 'd', url: '/blog/d' }, // no keyword: skipped
  ];
  const rows = [
    qp('float pool nurse', '/blog/a', 80, 5),
    qp('float pool nurse', '/blog/z', 20, 9),
    qp('night shift pay', '/blog/other', 60, 6),
    qp('night shift pay', '/blog/b', 10, 14),
  ];
  const r = targetKeywords(registry, rows);
  assert.equal(r.length, 3);
  assert.equal(r[0].status, 'ok');
  assert.equal(r[1].status, 'mismatch');
  assert.equal(r[1].topPage, `${S}/blog/other`);
  assert.equal(r[2].status, 'not-found');
});

test('report: builds all sections from raw rows with folding applied', () => {
  const pageRows = [pg('/blog/a', 100, 5), { ...pg('/blog/a', 60, 5), page: `${S}/blog/a#h` }];
  const res = buildDiagnosis({
    today: '2026-10-30',
    windows: diagnoseWindows('2026-10-30'),
    pulls: { pageCur: 2, pagePrev: 2, qpCur: 1, qpPrev: 1 },
    pageCur: pageRows,
    pagePrev: pageRows,
    qpCur: [qp('what is a float pool', '/blog/a', 40, 9)],
    qpPrev: [qp('lost one', '/blog/a', 30, 4)],
    brands: ['tcp'],
    registry: [{ url: '/blog/a', primaryKeyword: 'what is a float pool' }],
  });
  for (const h of ['## a.', '## b.', '## c.', '## d.', '## e.', '## f.', '## g.'])
    assert.ok(res.markdown.includes(h), h);
  assert.match(res.markdown, /privacy-suppressed/);
  assert.equal(res.counts.b, 1);
  assert.equal(res.counts.d, 1);
  assert.equal(res.counts.e, 1);
  assert.equal(res.counts.g, 1);
});

// ---- gsc-mcp pure parsing (no spawning)

test('mcp: splitLines keeps the unfinished tail', () => {
  const r = splitLines('{"a":1}\r\n{"b":2}\n{"c"');
  assert.deepEqual(r.lines, ['{"a":1}', '{"b":2}']);
  assert.equal(r.rest, '{"c"');
});

test('mcp: parseLine ignores non-JSON noise, isResponse ignores notifications', () => {
  assert.equal(parseLine('INFO starting server'), null);
  assert.equal(parseLine('{not json'), null);
  assert.equal(parseLine('42'), null);
  const note = parseLine('{"jsonrpc":"2.0","method":"notifications/message","params":{}}');
  assert.equal(isResponse(note), false);
  const res = parseLine('{"jsonrpc":"2.0","id":1,"result":{"ok":true}}');
  assert.equal(isResponse(res), true);
  assert.equal(isResponse(parseLine('{"jsonrpc":"2.0","id":2,"error":{"message":"x"}}')), true);
});

test('mcp: unwrapToolResult parses text, parses a nested result string, throws on isError', () => {
  const plain = unwrapToolResult({ content: [{ type: 'text', text: '{"rows":[{"page":"/a"}]}' }] });
  assert.equal(rowsOf(plain).length, 1);
  const nested = unwrapToolResult({ content: [{ type: 'text', text: JSON.stringify({ result: '{"rows":[1,2]}' }) }] });
  assert.deepEqual(rowsOf(nested), [1, 2]);
  assert.deepEqual(rowsOf(unwrapToolResult({ content: [{ text: '[{"a":1}]' }] })), [{ a: 1 }]);
  assert.throws(() => unwrapToolResult({ isError: true, content: [{ text: 'boom' }] }), /boom/);
  assert.throws(() => unwrapToolResult({ content: [] }), /no content/);
  assert.throws(() => unwrapToolResult({ content: [{ text: 'not json' }] }), /not JSON/);
  assert.equal(rowsOf({ nope: 1 }), null);
});
