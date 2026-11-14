import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

process.env.SEO_DESK_DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-'));

const store = await import('../lib/store.mjs');
const { McpError } = await import('../lib/mcp-client.mjs');
const refresh = await import('../lib/refresh.mjs');
const { createServer } = await import('../server.mjs');

const { refreshAll, sourceStatus, ensureFresh, startSchedule, shouldRunDaily, refreshProgress } = refresh;

// Each test gets its own empty data directory.
function freshDir() {
  process.env.SEO_DESK_DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-'));
  return process.env.SEO_DESK_DATA;
}

const hoursAgo = (h) => new Date(Date.now() - h * 3600000).toISOString();

const snap = (source, extra = {}) => ({
  source,
  ok: true,
  status: 'fresh',
  pulledAt: new Date().toISOString(),
  through: '2026-11-07',
  error: null,
  data: { marker: source },
  ...extra,
});

// Fake pullers that record their calls and never touch the network.
function fakePullers(overrides = {}) {
  const calls = [];
  let active = 0;
  let maxActive = 0;
  const make = (source) => async (args) => {
    calls.push({ source, args });
    active++;
    maxActive = Math.max(maxActive, active);
    await new Promise((r) => setImmediate(r));
    active--;
    return snap(source);
  };
  const pullers = {};
  for (const s of refresh.ORDER) pullers[s] = overrides[s] ?? make(s);
  return { pullers, calls, maxActive: () => maxActive };
}

test('a failing puller keeps its old data and the others stay fresh', async () => {
  freshDir();
  const old = snap('gsc', { pulledAt: '2026-11-09T06:00:00.000Z', through: '2026-11-06', data: { rows: [1, 2, 3] } });
  store.writeJson('snap/gsc.json', old);
  const { pullers, calls, maxActive } = fakePullers({
    gsc: async () => {
      const e = new Error('GSC fell over\n    at somewhere (file.js:1:1)');
      throw e;
    },
  });

  const run = await refreshAll({ pullers });

  assert.deepEqual(run.results, {
    local: 'fresh',
    gsc: 'failed',
    bing: 'fresh',
    ga4: 'fresh',
    clarity: 'fresh',
    index: 'fresh',
  });
  const kept = store.readJson('snap/gsc.json');
  assert.equal(kept.ok, false);
  assert.equal(kept.status, 'failed');
  assert.deepEqual(kept.data, { rows: [1, 2, 3] });
  assert.equal(kept.pulledAt, old.pulledAt);
  assert.equal(kept.through, '2026-11-06');
  assert.equal(kept.error, 'GSC fell over.');
  assert.match(kept.failedAt, /^\d{4}-\d{2}-\d{2}T/);
  for (const s of ['local', 'bing', 'ga4', 'clarity', 'index'])
    assert.equal(store.readJson(`snap/${s}.json`).status, 'fresh');
  // Local first, then the rest in order, one at a time, index checks last.
  assert.deepEqual(Object.keys(run.results), ['local', 'gsc', 'bing', 'ga4', 'clarity', 'index']);
  assert.deepEqual(
    calls.map((c) => c.source),
    ['local', 'bing', 'ga4', 'clarity', 'index']
  );
  assert.equal(maxActive(), 1);
});

test('a puller that returns ok:false is treated like a throw', async () => {
  freshDir();
  const old = snap('clarity', {
    pulledAt: '2026-11-09T06:00:00.000Z',
    through: '2026-11-08',
    data: { days: { x: 1 } },
  });
  store.writeJson('snap/clarity.json', old);
  const { pullers } = fakePullers({
    clarity: async () => ({
      source: 'clarity',
      ok: false,
      status: 'failed',
      pulledAt: new Date().toISOString(),
      through: '2026-11-09',
      error: 'Every Clarity question failed.\n  at stack line',
      data: { days: {} },
    }),
    ga4: async () => ({ ...snap('ga4'), ok: false, status: 'needs-sign-in', error: 'sign in again' }),
  });
  const run = await refreshAll({ pullers });
  assert.equal(run.results.clarity, 'failed');
  assert.equal(run.results.ga4, 'needs-sign-in');
  assert.equal(run.results.bing, 'fresh');
  const kept = store.readJson('snap/clarity.json');
  assert.equal(kept.ok, false);
  assert.equal(kept.status, 'failed');
  assert.equal(kept.error, 'Every Clarity question failed.');
  assert.deepEqual(kept.data, { days: { x: 1 } });
  assert.equal(kept.pulledAt, old.pulledAt);
  assert.equal(kept.through, '2026-11-08');
  assert.ok(kept.failedAt);
  assert.equal(store.readJson('snap/ga4.json').status, 'needs-sign-in');
  assert.equal(sourceStatus().find((r) => r.source === 'clarity').status, 'failed');
});

test('a first-ever failure still writes a failed snapshot', async () => {
  freshDir();
  const { pullers } = fakePullers({
    bing: async () => {
      throw new Error('no route to host');
    },
  });
  await refreshAll({ pullers });
  const b = store.readJson('snap/bing.json');
  assert.equal(b.status, 'failed');
  assert.equal(b.pulledAt, null);
  assert.deepEqual(b.data, {});
});

test('a needs-sign-in McpError gives that status', async () => {
  freshDir();
  const { pullers } = fakePullers({
    ga4: async () => {
      throw new McpError('OAuth sign in required');
    },
  });
  const run = await refreshAll({ pullers });
  assert.equal(run.results.ga4, 'needs-sign-in');
  assert.equal(store.readJson('snap/ga4.json').status, 'needs-sign-in');
  assert.equal(store.readJson('snap/ga4.json').ok, false);
  assert.equal(run.results.clarity, 'fresh');
});

test('two overlapping refreshAll calls run each puller once', async () => {
  freshDir();
  const { pullers, calls } = fakePullers();
  const a = refreshAll({ pullers });
  assert.equal(refreshProgress().running, true);
  const b = refreshAll({ pullers });
  assert.equal(a, b);
  await a;
  assert.equal(calls.length, 6);
  assert.equal(refreshProgress().running, false);
  // After it finishes, a new call starts a new run.
  await refreshAll({ pullers });
  assert.equal(calls.length, 12);
});

test('refreshAll reports which source is running', async () => {
  freshDir();
  let release;
  const gate = new Promise((r) => (release = r));
  const { pullers } = fakePullers({
    gsc: async () => {
      await gate;
      return snap('gsc');
    },
  });
  const p = refreshAll({ pullers });
  await new Promise((r) => setTimeout(r, 20));
  const mid = refreshProgress();
  assert.equal(mid.running, true);
  assert.equal(mid.current, 'gsc');
  assert.equal(mid.completed.local, 'fresh');
  release();
  await p;
  const done = refreshProgress();
  assert.equal(done.current, null);
  assert.equal(done.last.results.gsc, 'fresh');
});

test('Search Console gets the live pages from the local snapshot', async () => {
  freshDir();
  const live = [{ page: '/a', lastmod: '2026-11-01' }];
  const { pullers, calls } = fakePullers({
    local: async () => snap('local', { data: { livePages: live } }),
  });
  await refreshAll({ pullers });
  const gscCall = calls.find((c) => c.source === 'gsc');
  assert.deepEqual(gscCall.args.livePages, live);
  assert.match(gscCall.args.today, /^\d{4}-\d{2}-\d{2}$/);
});

test('only limits and orders the sources; a map without a source skips it', async () => {
  freshDir();
  const { pullers, calls } = fakePullers();
  await refreshAll({ only: ['clarity', 'bing'], pullers });
  assert.deepEqual(
    calls.map((c) => c.source),
    ['bing', 'clarity']
  );
  const partial = { local: pullers.local };
  const run = await refreshAll({ pullers: partial });
  assert.deepEqual(Object.keys(run.results), ['local']);
});

test('after a timeout the source is stopped and the run goes on with the next one', async () => {
  freshDir();
  let signal = null;
  let closed = 0;
  const { pullers, calls } = fakePullers({
    gsc: ({ signal: sig }) => {
      signal = sig;
      // What a real puller does with its session: the abort closes it.
      sig.addEventListener('abort', () => (closed += 1));
      return new Promise(() => {});
    },
  });
  const run = await refreshAll({ pullers, timeoutMs: 30 });
  assert.deepEqual(run.results, {
    local: 'fresh',
    gsc: 'failed',
    bing: 'fresh',
    ga4: 'fresh',
    clarity: 'fresh',
    index: 'fresh',
  });
  assert.equal(signal.aborted, true, 'the timed out source is told to stop');
  assert.equal(closed, 1, 'its session is closed');
  assert.match(store.readJson('snap/gsc.json').error, /timed out/);
  assert.deepEqual(
    calls.map((c) => c.source),
    ['local', 'bing', 'ga4', 'clarity', 'index']
  );
  assert.equal(store.readJson('state/refresh.json').lastFullRunAt, run.startedAt, 'every source was tried');
});

test('each source has its own time limit: index checks get 15 minutes, the others 10', () => {
  assert.equal(refresh.SOURCE_TIMEOUT_MS.index, 15 * 60 * 1000);
  assert.equal(refresh.PULL_TIMEOUT_MS, 10 * 60 * 1000);
  assert.deepEqual(refresh.ORDER, ['local', 'gsc', 'bing', 'ga4', 'clarity', 'index']);
});

test('the first index run starts from the old Search Console table and rotates the index copy', async () => {
  freshDir();
  store.writeJson(
    'snap/gsc.json',
    snap('gsc', { pulledAt: '2026-11-09T06:00:00.000Z', data: { index: [{ page: '/a', verdict: 'indexed' }] } })
  );
  const { pullers } = fakePullers({
    index: async ({ prev }) => {
      assert.equal(prev, null);
      return snap('index', {
        pulledAt: new Date(Date.now() + 60000).toISOString(),
        data: { pages: [{ page: '/a', verdict: 'not-indexed', checkedAt: 'x' }] },
      });
    },
  });
  // A new Search Console pull without the field keeps the old table until an index snapshot exists.
  pullers.gsc = async () => snap('gsc', { data: { siteDaily: [] } });
  await refreshAll({ only: ['gsc'], pullers });
  assert.deepEqual(store.readJson('snap/gsc.json').data.index, [{ page: '/a', verdict: 'indexed' }]);
  const carriedAt = store.readJson('snap/gsc.json').pulledAt;
  await refreshAll({ only: ['index'], pullers });
  assert.deepEqual(store.readJson('state/index-prev.json'), {
    pulledAt: carriedAt,
    index: [{ page: '/a', verdict: 'indexed' }],
  });
  await refreshAll({ only: ['gsc'], pullers });
  assert.equal('index' in store.readJson('snap/gsc.json').data, false, 'dropped once the index snapshot exists');
});

test('only a full run sets the daily marker; a partial run keeps the old one', async () => {
  freshDir();
  const { pullers } = fakePullers();
  await refreshAll({ only: ['local'], pullers });
  let state = store.readJson('state/refresh.json');
  assert.equal(state.full, false);
  assert.equal(state.lastFullRunAt, null);

  const full = await refreshAll({ pullers });
  state = store.readJson('state/refresh.json');
  assert.equal(state.full, true);
  assert.equal(state.lastFullRunAt, full.startedAt);

  await refreshAll({ only: ['bing'], pullers });
  state = store.readJson('state/refresh.json');
  assert.equal(state.full, false);
  assert.equal(state.lastFullRunAt, full.startedAt, 'partial run leaves the full-run marker alone');
  assert.notEqual(state.startedAt, full.startedAt);
});

test('every completed full refresh, by hand or by the schedule, offers the weekly audit its turn; a partial one does not', async () => {
  freshDir();
  const { pullers } = fakePullers();
  const seen = [];
  const afterFull = (r) => seen.push(r);
  await refreshAll({ only: ['local'], pullers, afterFull });
  assert.equal(seen.length, 0, 'a partial run (a page load) starts nothing');
  const full = await refreshAll({ pullers, afterFull }); // "Refresh now" sends no list
  assert.equal(seen.length, 1);
  assert.equal(seen[0].startedAt, full.startedAt);
  // A full run cut short by a source the map does not have is still "every source tried".
  const src = fs.readFileSync(new URL('../lib/refresh.mjs', import.meta.url), 'utf8');
  const schedule = src.slice(src.indexOf('export function startSchedule'));
  assert.doesNotMatch(schedule, /maybeRunWeeklyAudit/, 'the schedule no longer owns the weekly audit');
});

test('a partial run today does not stop the daily full run', async () => {
  freshDir();
  const atHour = (h) => {
    const d = new Date();
    d.setHours(h, 5, 0, 0);
    return d;
  };
  const { pullers, calls } = fakePullers();
  await refreshAll({ only: ['local'], pullers }); // what ensureFresh does on a page load
  calls.length = 0;
  const stop = startSchedule({ pullers, intervalMs: 1000, now: () => atHour(6) });
  await refreshAll({ pullers: {} }); // join the run the schedule started
  stop();
  assert.deepEqual(
    calls.map((c) => c.source),
    ['local', 'gsc', 'bing', 'ga4', 'clarity', 'index']
  );
});

test('sourceStatus on an empty data dir lists seven sources as never', () => {
  freshDir();
  const rows = sourceStatus();
  assert.deepEqual(
    rows.map((r) => r.source),
    ['local', 'gsc', 'bing', 'ga4', 'clarity', 'index', 'dfs']
  );
  for (const r of rows) {
    assert.equal(r.status, 'never');
    assert.equal(r.pulledAt, null);
    assert.equal(r.ageHours, null);
  }
});

test('sourceStatus reads snapshots, goes stale past STALE_HOURS, and reads dfs from the aeo trend', () => {
  freshDir();
  store.writeJson('snap/gsc.json', snap('gsc', { pulledAt: hoursAgo(1) }));
  store.writeJson('snap/bing.json', snap('bing', { pulledAt: hoursAgo(13) }));
  store.writeJson('snap/ga4.json', snap('ga4', { ok: false, status: 'failed', error: 'down', failedAt: hoursAgo(1) }));
  store.writeJson('snap/clarity.json', snap('clarity', { ok: false, status: 'needs-sign-in', error: 'sign in' }));
  const recent = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
  store.writeJson('snap/local.json', snap('local', { data: { aeo: [{ date: '2026-01-01' }, { date: recent }] } }));

  const by = Object.fromEntries(sourceStatus().map((r) => [r.source, r]));
  assert.equal(by.gsc.status, 'fresh');
  assert.ok(by.gsc.ageHours >= 1 && by.gsc.ageHours < 1.2);
  assert.equal(by.gsc.through, '2026-11-07');
  assert.equal(by.bing.status, 'stale');
  assert.equal(by.ga4.status, 'failed');
  assert.equal(by.ga4.error, 'down.');
  store.writeJson(
    'snap/ga4.json',
    snap('ga4', {
      ok: false,
      status: 'failed',
      error: 'timed out. stderr: Traceback (most recent call last):',
      failedAt: hoursAgo(1),
    })
  );
  assert.equal(sourceStatus().find((r) => r.source === 'ga4').error, 'timed out.');
  assert.equal(by.clarity.status, 'needs-sign-in');
  assert.equal(by.dfs.status, 'fresh');
  assert.equal(by.dfs.through, recent);

  const old = Date.now() + 60 * 86400000;
  assert.equal(sourceStatus({ now: old }).find((r) => r.source === 'dfs').status, 'stale');
});

test('ensureFresh starts a background refresh of stale sources only', async () => {
  freshDir();
  const { pullers, calls } = fakePullers();
  // Everything fresh, local a little old: only local is redone.
  for (const s of refresh.ORDER) store.writeJson(`snap/${s}.json`, snap(s, { pulledAt: hoursAgo(0.5) }));
  assert.deepEqual(ensureFresh({ pullers }), ['local']);
  await refreshAll({ pullers }); // joins the run ensureFresh started
  assert.deepEqual(
    calls.map((c) => c.source),
    ['local']
  );

  // A stale source and a never-pulled one are added; a recent failure is left alone.
  calls.length = 0;
  store.writeJson('snap/local.json', snap('local')); // just now
  store.writeJson('snap/gsc.json', snap('gsc', { pulledAt: hoursAgo(20) }));
  fs.rmSync(path.join(process.env.SEO_DESK_DATA, 'snap/bing.json'));
  store.writeJson('snap/ga4.json', snap('ga4', { ok: false, status: 'failed', failedAt: hoursAgo(1) }));
  store.writeJson('snap/clarity.json', snap('clarity', { ok: false, status: 'failed', failedAt: hoursAgo(30) }));
  const started = ensureFresh({ pullers });
  assert.deepEqual(started, ['gsc', 'bing', 'clarity']);
  assert.deepEqual(ensureFresh({ pullers }), []); // a run is going; nothing new
  await refreshAll({ pullers });
  assert.deepEqual(
    calls.map((c) => c.source),
    ['gsc', 'bing', 'clarity']
  );
});

test('a failed local pull is retried only after a short back-off', () => {
  freshDir();
  const { pullers } = fakePullers();
  const failedLocal = (minsAgo) =>
    store.writeJson(
      'snap/local.json',
      snap('local', { ok: false, status: 'failed', failedAt: new Date(Date.now() - minsAgo * 60000).toISOString() })
    );
  for (const s of ['gsc', 'bing', 'ga4', 'clarity', 'index']) store.writeJson(`snap/${s}.json`, snap(s));
  failedLocal(1);
  assert.deepEqual(ensureFresh({ pullers }), []);
  failedLocal(15);
  assert.deepEqual(ensureFresh({ pullers }), ['local']);
});

test('shouldRunDaily runs at the first check at or after the daily hour when no full run happened today', () => {
  const at = (h, d = 10) => new Date(2026, 10, d, h, 15);
  assert.equal(shouldRunDaily(at(6), null), true);
  assert.equal(shouldRunDaily(at(7), null), true, 'asleep at 6, awake at 7: still runs');
  assert.equal(shouldRunDaily(at(23), at(6, 9).toISOString()), true);
  assert.equal(shouldRunDaily(at(5), null), false, 'not before the daily hour');
  assert.equal(shouldRunDaily(at(6), at(6).toISOString()), false);
  assert.equal(shouldRunDaily(at(9), at(6).toISOString()), false, 'once a day');
});

test('startSchedule runs the refresh once in the daily hour', async () => {
  // Today's date on the real clock, so the once-a-day memory (written with the real time) lines up.
  const atHour = (h) => {
    const d = new Date();
    d.setHours(h, 5, 0, 0);
    return d;
  };
  freshDir();
  const { pullers, calls } = fakePullers();
  const stop = startSchedule({ pullers, intervalMs: 10, now: () => atHour(6) });
  await new Promise((r) => setTimeout(r, 120));
  await refreshAll({ pullers: {} }); // wait for any run still going (no sources to pull)
  stop();
  assert.equal(calls.length, 6, 'ran once, not on every tick');
  assert.ok(store.readJson('state/refresh.json').startedAt);

  const { pullers: other, calls: otherCalls } = fakePullers();
  const stop2 = startSchedule({ pullers: other, intervalMs: 10, now: () => atHour(9) });
  await new Promise((r) => setTimeout(r, 50));
  stop2();
  assert.equal(otherCalls.length, 0, 'already ran today');
});

// ------------------------------------------------------------------ server

function request(port, { method = 'GET', pathname = '/', headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { host: '127.0.0.1', port, method, path: pathname, headers: { Host: `127.0.0.1:${port}`, ...headers } },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          let json = null;
          try {
            json = JSON.parse(text);
          } catch {
            // not JSON
          }
          resolve({ status: res.statusCode, headers: res.headers, text, json });
        });
      }
    );
    req.on('error', reject);
    if (body !== undefined) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function withServer(opts, fn) {
  const server = createServer({ autoRefresh: false, ...opts });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  try {
    await fn(server.address().port);
  } finally {
    await new Promise((r) => server.close(r));
  }
}

test('server refuses a foreign Host and a foreign Origin', async () => {
  const dir = freshDir();
  await withServer({ dataDir: dir, pullers: fakePullers().pullers }, async (port) => {
    const evil = await request(port, { pathname: '/api/sources', headers: { Host: 'evil.test' } });
    assert.equal(evil.status, 403);
    const evilPort = await request(port, { pathname: '/api/sources', headers: { Host: '127.0.0.1:1' } });
    assert.equal(evilPort.status, 403);
    const local = await request(port, { pathname: '/api/sources', headers: { Host: `localhost:${port}` } });
    assert.equal(local.status, 200);
    const cross = await request(port, {
      method: 'POST',
      pathname: '/api/refresh',
      headers: { Origin: 'http://evil.test', 'Content-Type': 'application/json' },
      body: {},
    });
    assert.equal(cross.status, 403);
  });
});

test('GET /api/sources on an empty data dir lists the sources as never', async () => {
  const dir = freshDir();
  await withServer({ dataDir: dir }, async (port) => {
    const res = await request(port, { pathname: '/api/sources' });
    assert.equal(res.status, 200);
    assert.ok(res.json.length >= 5);
    assert.ok(res.json.every((r) => r.status === 'never'));
  });
});

test('POST /api/refresh returns at once and GET /api/refresh shows progress', async () => {
  const dir = freshDir();
  const { pullers, calls } = fakePullers();
  await withServer({ dataDir: dir, pullers }, async (port) => {
    const started = await request(port, {
      method: 'POST',
      pathname: '/api/refresh',
      headers: { 'Content-Type': 'application/json' },
      body: { only: ['local', 'bing'] },
    });
    assert.equal(started.status, 200);
    assert.deepEqual(started.json, { running: true });
    let state;
    for (let i = 0; i < 100; i++) {
      state = (await request(port, { pathname: '/api/refresh' })).json;
      if (!state.running) break;
      await new Promise((r) => setTimeout(r, 10));
    }
    assert.equal(state.running, false);
    assert.deepEqual(state.last.results, { local: 'fresh', bing: 'fresh' });
    assert.deepEqual(
      calls.map((c) => c.source),
      ['local', 'bing']
    );

    const bad = await request(port, {
      method: 'POST',
      pathname: '/api/refresh',
      headers: { 'Content-Type': 'application/json' },
      body: { only: ['nope'] },
    });
    assert.equal(bad.status, 400);
    const broken = await request(port, { method: 'POST', pathname: '/api/refresh', body: '{not json' });
    assert.equal(broken.status, 400);
  });
});

test('server serves static files, JSON 404s, and blocks path tricks', async () => {
  const dir = freshDir();
  await withServer({ dataDir: dir }, async (port) => {
    const home = await request(port, { pathname: '/' });
    assert.equal(home.status, 200);
    assert.match(home.headers['content-type'], /text\/html/);
    assert.match(home.text, /SEO Desk/);

    const missing = await request(port, { pathname: '/nope.js' });
    assert.equal(missing.status, 404);
    assert.deepEqual(missing.json, { error: 'Not found.' });
    const api = await request(port, { pathname: '/api/nope' });
    assert.equal(api.status, 404);
    assert.ok(api.json.error);

    const up = await request(port, { pathname: '/../lib/store.mjs' });
    assert.equal(up.status, 404);
    const enc = await request(port, { pathname: '/..%2flib%2fstore.mjs' });
    assert.equal(enc.status, 404);
  });
});

test('extra routes are added to the table and fill path params', async () => {
  const dir = freshDir();
  const routes = [{ method: 'GET', path: '/api/echo/:word', handler: (ctx) => ({ word: ctx.params.word }) }];
  await withServer({ dataDir: dir, routes }, async (port) => {
    const res = await request(port, { pathname: '/api/echo/hello%20there' });
    assert.deepEqual(res.json, { word: 'hello there' });
  });
});

function rawRequest(port, text, { until } = {}) {
  return new Promise((resolve, reject) => {
    const sock = net.connect(port, '127.0.0.1', () => sock.write(text));
    let got = '';
    const done = () => {
      sock.destroy();
      resolve(got);
    };
    sock.on('data', (c) => {
      got += c.toString('latin1');
      if (until ? until.test(got) : got.includes('\r\n\r\n')) done();
    });
    sock.on('end', done);
    sock.on('error', (e) => (got ? done() : reject(e)));
    setTimeout(done, 3000).unref();
  });
}

test('a bad request address gets 400 and the server keeps running', async () => {
  const dir = freshDir();
  await withServer({ dataDir: dir }, async (port) => {
    const bad = await rawRequest(port, `GET // HTTP/1.1\r\nHost: 127.0.0.1:${port}\r\nConnection: close\r\n\r\n`);
    assert.match(bad, /^HTTP\/1\.1 400/);
    const after = await request(port, { pathname: '/api/sources' });
    assert.equal(after.status, 200);
  });
});

test('a bad % escape in a route param gets 400', async () => {
  const dir = freshDir();
  const routes = [{ method: 'GET', path: '/api/echo/:word', handler: (ctx) => ({ word: ctx.params.word }) }];
  await withServer({ dataDir: dir, routes }, async (port) => {
    const res = await request(port, { pathname: '/api/echo/%E0%A4%A' });
    assert.equal(res.status, 400);
    assert.ok(res.json.error);
    assert.equal((await request(port, { pathname: '/api/sources' })).status, 200);
  });
});

test('an oversized body gets a 413 reply before the connection closes', async () => {
  const dir = freshDir();
  await withServer({ dataDir: dir }, async (port) => {
    const head =
      `POST /api/refresh HTTP/1.1\r\nHost: 127.0.0.1:${port}\r\nContent-Type: application/json\r\n` +
      `Content-Length: 5000000\r\n\r\n`;
    // A declared length over the cap is refused before the body is read.
    const got = await rawRequest(port, head, { until: /^HTTP\/1\.1 \d{3}/ });
    assert.match(got, /^HTTP\/1\.1 413/);
    assert.equal((await request(port, { pathname: '/api/sources' })).status, 200);

    // A body with no declared length is refused once it grows past the cap.
    const chunkedHead =
      `POST /api/refresh HTTP/1.1\r\nHost: 127.0.0.1:${port}\r\nContent-Type: application/json\r\n` +
      `Transfer-Encoding: chunked\r\n\r\n${(1200000).toString(16)}\r\n`;
    const streamed = await rawRequest(port, `${chunkedHead}${'x'.repeat(1200000)}\r\n0\r\n\r\n`, {
      until: /^HTTP\/1\.1 \d{3}/,
    });
    assert.match(streamed, /^HTTP\/1\.1 413/);
    assert.equal((await request(port, { pathname: '/api/sources' })).status, 200);
  });
});

test('every response says nosniff, dotfiles are not served, cross-site posts are refused', async () => {
  const dir = freshDir();
  const staticDir = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-static-'));
  fs.writeFileSync(path.join(staticDir, 'index.html'), '<p>hi</p>');
  fs.writeFileSync(path.join(staticDir, '.secret'), 'nope');
  await withServer({ dataDir: dir, staticDir, pullers: fakePullers().pullers }, async (port) => {
    for (const p of ['/', '/api/sources', '/missing']) {
      const res = await request(port, { pathname: p });
      assert.equal(res.headers['x-content-type-options'], 'nosniff', p);
    }
    assert.equal((await request(port, { pathname: '/.secret' })).status, 404);
    assert.equal((await request(port, { pathname: '/%2esecret' })).status, 404);

    const post = (site) =>
      request(port, {
        method: 'POST',
        pathname: '/api/refresh',
        headers: { 'Content-Type': 'application/json', ...(site ? { 'Sec-Fetch-Site': site } : {}) },
        body: { only: ['local'] },
      });
    assert.equal((await post('cross-site')).status, 403);
    assert.equal((await post('same-site')).status, 403);
    assert.equal((await post('same-origin')).status, 200);
    await refreshAll({ pullers: {} }); // let the started run finish
    assert.equal((await post('none')).status, 200);
    assert.equal((await post()).status, 200);
    await refreshAll({ pullers: {} });
  });
});

test('the local pull records the day a plan row is first seen ticked with no date, and keeps it', async () => {
  freshDir();
  const { todayIso } = await import('../lib/dates.mjs');
  const plan = (done) => ({
    file: 'docs/seo/next-15-blogs-2026-11.md',
    error: null,
    posts: [],
    improve: [
      { page: '/a', done, doneDate: null, judgeFrom: null, search: '', todo: '' },
      { page: '/b', done: true, doneDate: '2026-11-01', judgeFrom: '2026-12-01', search: '', todo: '' },
    ],
  });
  let ticked = false;
  const { pullers } = fakePullers({ local: async () => snap('local', { data: { plan: plan(ticked) } }) });
  await refreshAll({ only: ['local'], pullers });
  assert.deepEqual(store.readJson('state/plan-ticks.json', {}), {}, 'nothing ticked yet');
  ticked = true;
  await refreshAll({ only: ['local'], pullers });
  const key = 'docs/seo/next-15-blogs-2026-11.md|/a';
  assert.deepEqual(store.readJson('state/plan-ticks.json'), { [key]: todayIso() }, 'dated rows are not recorded');
  store.writeJson('state/plan-ticks.json', { [key]: '2026-11-02' });
  await refreshAll({ only: ['local'], pullers });
  assert.equal(store.readJson('state/plan-ticks.json')[key], '2026-11-02', 'the first day is kept');

  // Ticked in a snapshot the desk already had, but never recorded: the day of that snapshot.
  freshDir();
  store.writeJson(
    'snap/local.json',
    snap('local', { pulledAt: '2026-11-03T12:00:00.000Z', data: { plan: plan(true) } })
  );
  await refreshAll({ only: ['local'], pullers });
  assert.equal(store.readJson('state/plan-ticks.json')[key], todayIso(new Date('2026-11-03T12:00:00.000Z')));
});

test('a second copy finds the port taken, says so in one line and exits cleanly', async () => {
  const { spawn } = await import('node:child_process');
  const { fileURLToPath } = await import('node:url');
  const blocker = net.createServer();
  await new Promise((r) => blocker.listen(0, '127.0.0.1', r));
  const port = blocker.address().port;
  const serverFile = fileURLToPath(new URL('../server.mjs', import.meta.url));
  const child = spawn(process.execPath, [serverFile, '--port', String(port), '--no-open', '--no-schedule'], {
    env: { ...process.env, SEO_DESK_DATA: freshDir() },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let out = '';
  child.stdout.on('data', (d) => (out += d));
  child.stderr.on('data', (d) => (out += d));
  const code = await new Promise((r) => child.on('exit', r));
  blocker.close();
  assert.equal(code, 0);
  assert.equal(out.trim().split('\n').length, 1);
  assert.match(out, /already in use/);
});

test('an unexpected error is logged in plain words and the process exits so launchd restarts it', async () => {
  const { fatal } = await import('../server.mjs');
  const lines = [];
  let exitCode = null;
  fatal(new Error('boom\n    at x (y.js:1:1)'), { log: (l) => lines.push(l), exit: (c) => (exitCode = c) });
  assert.equal(exitCode, 1);
  assert.equal(lines.length, 1);
  assert.match(lines[0], /boom\./);
  assert.doesNotMatch(lines[0], /y\.js/);
});

// ------------------------------------------------------------------ pause switch

test('a paused desk starts no refresh on a page load or on the morning schedule, but Refresh now works', async () => {
  const atHour = (h) => {
    const d = new Date();
    d.setHours(h, 5, 0, 0);
    return d;
  };
  freshDir();
  store.writeJson('state/settings.json', { paused: true });
  const { pullers, calls } = fakePullers();
  // Nothing has ever been pulled, so every source is due; a paused desk still starts nothing.
  assert.deepEqual(ensureFresh({ pullers }), []);
  const stop = startSchedule({ pullers, intervalMs: 10, now: () => atHour(7) });
  await new Promise((r) => setTimeout(r, 80));
  stop();
  assert.equal(calls.length, 0);
  assert.equal(refresh.isPaused(), true);

  // The same call from the Refresh now button runs.
  await refreshAll({ pullers });
  assert.equal(calls.length, 6);

  // Switched off again, the schedule starts its morning run as before.
  store.writeJson('state/settings.json', { paused: false });
  assert.equal(refresh.isPaused(), false);
  store.writeJson('state/refresh.json', {});
  const again = fakePullers();
  const stop2 = startSchedule({ pullers: again.pullers, intervalMs: 1000, now: () => atHour(7) });
  await refreshAll({ pullers: {} }); // join the run the schedule started
  stop2();
  assert.equal(again.calls.length, 6);
});

test('GET /api/sources carries paused on every row', async () => {
  const dir = freshDir();
  await withServer({ dataDir: dir }, async (port) => {
    const off = await request(port, { pathname: '/api/sources' });
    assert.ok(off.json.every((r) => r.paused === false));
    store.writeJson('state/settings.json', { paused: true });
    const on = await request(port, { pathname: '/api/sources' });
    assert.ok(on.json.length >= 5 && on.json.every((r) => r.paused === true));
  });
});

test('an api request from another site is refused, even a GET; same-origin and no header are answered', async () => {
  const dir = freshDir();
  await withServer({ dataDir: dir }, async (port) => {
    const cross = await request(port, { pathname: '/api/sources', headers: { 'Sec-Fetch-Site': 'cross-site' } });
    assert.equal(cross.status, 403);
    assert.match(cross.json.error, /made from the desk itself/);
    const sameSite = await request(port, { pathname: '/api/sources', headers: { 'Sec-Fetch-Site': 'same-site' } });
    assert.equal(sameSite.status, 403);
    const same = await request(port, { pathname: '/api/sources', headers: { 'Sec-Fetch-Site': 'same-origin' } });
    assert.equal(same.status, 200);
    const none = await request(port, { pathname: '/api/sources', headers: { 'Sec-Fetch-Site': 'none' } });
    assert.equal(none.status, 200);
    const absent = await request(port, { pathname: '/api/sources' });
    assert.equal(absent.status, 200);
    // Pages and static files are not api requests.
    const page = await request(port, { pathname: '/', headers: { 'Sec-Fetch-Site': 'cross-site' } });
    assert.notEqual(page.status, 403);
  });
});

test('a cross-site api request with a double-slash target is not answered (the check uses the parsed path)', async () => {
  const dir = freshDir();
  await withServer({ dataDir: dir }, async (port) => {
    const raw = (target, extra = '') =>
      new Promise((resolve, reject) => {
        const s = net.connect(port, '127.0.0.1', () => {
          s.write(`GET ${target} HTTP/1.1\r\nHost: 127.0.0.1:${port}\r\n${extra}Connection: close\r\n\r\n`);
        });
        let data = '';
        s.on('data', (d) => (data += d));
        s.on('end', () => resolve(Number(/^HTTP\/1\.1 (\d{3})/.exec(data)?.[1])));
        s.on('error', reject);
      });
    assert.equal(await raw('//x/api/sources', 'Sec-Fetch-Site: cross-site\r\n'), 403);
    assert.equal(await raw('/api/sources', 'Sec-Fetch-Site: cross-site\r\n'), 403);
    // The same target from the desk itself still routes.
    assert.equal(await raw('//x/api/sources', 'Sec-Fetch-Site: same-origin\r\n'), 200);
  });
});

test('every response forbids framing, so no other site can load the desk in a hidden frame', async () => {
  const dir = freshDir();
  const staticDir = path.join(dir, 'static');
  fs.mkdirSync(staticDir, { recursive: true });
  fs.writeFileSync(path.join(staticDir, 'index.html'), '<!doctype html><title>x</title>');
  await withServer({ dataDir: dir, staticDir }, async (port) => {
    const page = await request(port, { pathname: '/' });
    const api = await request(port, { pathname: '/api/sources' });
    const missing = await request(port, { pathname: '/api/no-such-route' });
    for (const [name, r] of [
      ['page', page],
      ['api', api],
      ['404', missing],
    ]) {
      assert.equal(r.headers['x-frame-options'], 'DENY', name);
      assert.equal(r.headers['content-security-policy'], "frame-ancestors 'none'", name);
    }
    assert.equal(page.status, 200);
    assert.equal(api.status, 200);
  });
});
