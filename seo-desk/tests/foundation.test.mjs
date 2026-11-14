import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-'));
process.env.SEO_DESK_DATA = tmp;

const { classifyError, SERVER_KEYS, McpError, unwrapToolResult } = await import('../lib/mcp-client.mjs');
const store = await import('../lib/store.mjs');
const dates = await import('../lib/dates.mjs');
const config = await import('../lib/config.mjs');

test('classifyError separates sign-in problems from failures', () => {
  assert.equal(classifyError('invalid_grant'), 'needs-sign-in');
  assert.equal(classifyError('Token has expired'), 'needs-sign-in');
  assert.equal(classifyError('HTTP 401 Unauthorized'), 'needs-sign-in');
  assert.equal(classifyError('timeout'), 'failed');
  assert.equal(classifyError('port 14010 in use'), 'failed');
});

test('McpError carries its kind', () => {
  const e = new McpError('boom');
  assert.equal(e.kind, 'failed');
  assert.equal(new McpError('oauth needed').kind, 'needs-sign-in');
  assert.equal(e instanceof Error, true);
});

test('SERVER_KEYS names the five servers', () => {
  assert.deepEqual(SERVER_KEYS, {
    gsc: 'google-search-console',
    bing: 'bing-webmaster',
    ga4: 'google-analytics',
    clarity: 'microsoft-clarity',
    dfs: 'dataforseo',
  });
});

test('windows(2026-11-10) matches the 28-day reporting windows', () => {
  const w = dates.windows('2026-11-10');
  assert.deepEqual(w.cur, { start: '2026-10-11', end: '2026-11-07' });
  assert.deepEqual(w.prev, { start: '2026-09-13', end: '2026-10-10' });
  for (const k of ['cur', 'prev', 'd90', 'd120', 'd480']) assert.ok(w[k], k);
  assert.equal(w.d90.end, '2026-11-07');
  assert.equal(w.d120.end, '2026-11-07');
  assert.equal(w.d480.end, '2026-11-07');
  assert.equal(dates.daysBetween(w.d90.start, w.d90.end), 89);
  assert.equal(dates.daysBetween(w.d120.start, w.d120.end), 119);
  assert.equal(dates.daysBetween(w.d480.start, w.d480.end), 479);
});

test('date helpers', () => {
  assert.equal(dates.addDays('2026-11-10', -10), '2026-10-31');
  assert.equal(dates.addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(dates.daysBetween('2026-11-01', '2026-11-10'), 9);
  assert.equal(dates.mondayOf('2026-11-10'), '2026-11-09');
  assert.equal(dates.mondayOf('2026-11-09'), '2026-11-09');
  assert.equal(dates.mondayOf('2026-11-15'), '2026-11-09');
  assert.match(dates.todayIso(), /^\d{4}-\d{2}-\d{2}$/);
});

test('todayIso is the local calendar date, whatever the zone', () => {
  // Built from local parts, so these hold in any time zone. Just after midnight and just before it.
  assert.equal(dates.todayIso(new Date(2026, 10, 11, 0, 30)), '2026-11-11');
  assert.equal(dates.todayIso(new Date(2026, 10, 11, 23, 59)), '2026-11-11');
  assert.equal(dates.todayIso(new Date(2026, 0, 1, 0, 5)), '2026-01-01');
  // Windows still end three days before that date, on plain date strings.
  assert.equal(dates.windows(dates.todayIso(new Date(2026, 10, 11, 0, 30))).cur.end, '2026-11-08');
  const now = new Date();
  const p = (n) => String(n).padStart(2, '0');
  assert.equal(dates.todayIso(), `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`);
});

test('pctChange guards small bases', () => {
  assert.equal(dates.pctChange(30, 10, 20), null);
  assert.equal(dates.pctChange(150, 100), 50);
  assert.equal(dates.pctChange(50, 100), -50);
  assert.equal(dates.pctChange(5, 0), null);
});

test('config exposes the contract values', () => {
  assert.equal(config.SITE, 'https://simplescheduleai.com');
  assert.equal(config.GA4_PROPERTY, '528589584');
  assert.equal(config.PORT, 8766);
  assert.equal(config.STALE_HOURS, 12);
  assert.equal(config.DAILY_HOUR, 6);
  assert.equal(config.THRESHOLDS.LOW_CTR_MIN_IMP, 200);
  assert.equal(config.THRESHOLDS.SLIP_MIN_PREV_IMP, 50);
  assert.equal(config.THRESHOLDS.SLIP_DROP, 0.3);
  assert.equal(config.THRESHOLDS.NEEDS_LINKS_MIN, 2);
  assert.equal(config.THRESHOLDS.PCT_MIN_BASE, 20);
  assert.equal(config.THRESHOLDS.NEAR_MIN_IMP, 30);
  assert.equal(config.THRESHOLDS.QUESTION_MIN_WORDS, 6);
  assert.deepEqual(Object.keys(config.PRESETS), [
    'balanced',
    'money-pages-first',
    'findability-first',
    'ai-citations-first',
    'interest-signals-first',
  ]);
  for (const [name, p] of Object.entries(config.PRESETS)) {
    const sum = Object.values(p).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - 1) < 1e-9, `${name} sums to ${sum}`);
  }
  assert.equal(config.DEFAULT_MONEY_PAGES.length, 6);
  assert.equal(config.EXPECTED_CTR[1], 0.28);
  assert.equal(config.EXPECTED_CTR[10], 0.018);
  assert.equal(config.EXPECTED_CTR[20], 0.01);
  assert.equal(Object.keys(config.EXPECTED_CTR).length, 20);
});

test('writeJson then readJson round-trips inside SEO_DESK_DATA', () => {
  assert.equal(store.dataDir(), tmp);
  assert.deepEqual(store.readJson('snap/none.json', { x: 1 }), { x: 1 });
  store.writeJson('snap/a.json', { a: [1, 2, 3] });
  assert.deepEqual(store.readJson('snap/a.json', null), { a: [1, 2, 3] });
  assert.ok(fs.existsSync(path.join(tmp, 'snap', 'a.json')));
  assert.deepEqual(
    fs.readdirSync(path.join(tmp, 'snap')).filter((f) => f.includes('.tmp')),
    []
  );
});

test('readJson returns the fallback for a corrupt file', () => {
  fs.writeFileSync(path.join(tmp, 'bad.json'), '{not json');
  assert.deepEqual(store.readJson('bad.json', []), []);
});

test('mergeDaily upserts by key and sorts by date', () => {
  const key = (r) => `${r.date}|${r.page}`;
  store.mergeDaily(
    'history/m.json',
    [
      { date: '2026-11-02', page: '/a', clicks: 1 },
      { date: '2026-11-01', page: '/a', clicks: 2 },
    ],
    key
  );
  const merged = store.mergeDaily(
    'history/m.json',
    [
      { date: '2026-11-02', page: '/a', clicks: 9 },
      { date: '2026-11-03', page: '/a', clicks: 4 },
    ],
    key
  );
  assert.deepEqual(
    merged.map((r) => [r.date, r.clicks]),
    [
      ['2026-11-01', 2],
      ['2026-11-02', 9],
      ['2026-11-03', 4],
    ]
  );
  assert.deepEqual(store.readJson('history/m.json', []), merged);
});

test('unwrapToolResult returns structuredContent.result for list tools', () => {
  const rows = [{ q: 'a' }, { q: 'b' }, { q: 'c' }];
  const result = {
    content: [
      { type: 'text', text: JSON.stringify(rows[0]) },
      { type: 'text', text: JSON.stringify(rows[1]) },
      { type: 'text', text: 'Showing 3 of 9 rows. next_offset=3' },
    ],
    structuredContent: { result: rows },
  };
  assert.deepEqual(unwrapToolResult(result), rows);
});

test('unwrapToolResult still parses content[0] JSON and unwraps a result string', () => {
  assert.deepEqual(unwrapToolResult({ content: [{ type: 'text', text: '{"rows":[1,2]}' }] }), { rows: [1, 2] });
  assert.deepEqual(
    unwrapToolResult({ content: [{ type: 'text', text: JSON.stringify({ result: '[1,2]' }) }] }),
    [1, 2]
  );
  assert.equal(unwrapToolResult({ content: [{ type: 'text', text: 'plain words' }] }), 'plain words');
  assert.throws(() => unwrapToolResult({ isError: true, content: [{ type: 'text', text: 'bad' }] }), McpError);
});

// ---------------------------------------------------------------- final fix wave

const { openServer } = await import('../lib/mcp-client.mjs');
const { plainError } = await import('../lib/text.mjs');
const { EventEmitter } = await import('node:events');

// A fake MCP server process: answers initialize, never answers a tool call.
function fakeChild({ stderrText = '' } = {}) {
  const child = new EventEmitter();
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  child.killed = false;
  child.kill = () => {
    child.killed = true;
  };
  child.stdin = {
    on() {},
    end() {},
    write(line) {
      const msg = JSON.parse(line);
      if (msg.method === 'initialize') {
        setImmediate(() => {
          if (stderrText) child.stderr.emit('data', Buffer.from(stderrText));
          child.stdout.emit('data', Buffer.from(`${JSON.stringify({ jsonrpc: '2.0', id: msg.id, result: {} })}\n`));
        });
      }
      return true;
    },
  };
  return child;
}

test('an aborted signal closes the session and kills the server process', async () => {
  const child = fakeChild();
  const ctrl = new AbortController();
  const s = await openServer('google-search-console', {
    signal: ctrl.signal,
    spawn: () => child,
    entry: { command: 'fake' },
  });
  const pending = s.call('batch_url_inspection', {});
  ctrl.abort();
  await assert.rejects(pending, /session closed/);
  assert.equal(child.killed, true);
  await assert.rejects(
    openServer('google-search-console', { signal: ctrl.signal, spawn: () => fakeChild(), entry: { command: 'x' } }),
    /stopped before it started/
  );
});

test('a timeout whose stderr mentions a token is still a failure, not a sign-in', async () => {
  const child = fakeChild({ stderrText: 'Traceback (most recent call last):\n  File "x.py"\nrefresh token cached' });
  const s = await openServer('google-search-console', { timeoutMs: 20, spawn: () => child, entry: { command: 'f' } });
  const err = await s.call('get_sites', {}).catch((e) => e);
  assert.equal(err.kind, 'failed');
  assert.match(err.message, /timed out/);
  assert.equal(classifyError('401 unauthorized'), 'needs-sign-in');
  s.close();
  assert.equal(child.killed, true);
});

test('plainError leaves one plain sentence: no stack, no stderr tail', () => {
  assert.equal(
    plainError(
      new Error(
        'google-search-console tools/call timed out after 180000ms. stderr: Traceback (most recent call last):\n File'
      )
    ),
    'google-search-console tools/call timed out after 180000ms.'
  );
  assert.equal(plainError(new Error('Boom\n    at foo (/x/y.js:1:2)')), 'Boom.');
  assert.equal(plainError(''), 'Unknown error.');
  assert.ok(plainError('x'.repeat(500)).length <= 203);
});
