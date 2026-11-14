import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Phase 3, task 6: the lessons ledger. Synthetic verdicts and a temp data folder; the route handlers
// are called directly, so there is no network and no server.

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-lessons-'));
const REPO = path.join(root, 'repo');
fs.mkdirSync(path.join(REPO, 'docs/seo'), { recursive: true });
process.env.SEO_DESK_REPO = REPO;
process.env.SEO_DESK_TODAY = '2026-11-10';
process.env.SEO_DESK_DATA = path.join(root, 'data');

const store = await import('../lib/store.mjs');
const { invalidate } = await import('../lib/api/model.mjs');
const L = await import('../lib/lessons.mjs');
const { routes, settleSavedLessons } = await import('../lib/api/ext/lessons.mjs');

function find(method, pathname) {
  for (const r of routes) {
    if (r.method !== method) continue;
    const names = [];
    const re = new RegExp(
      `^${r.path
        .split('/')
        .map((p) => {
          if (!p.startsWith(':')) return p;
          names.push(p.slice(1));
          return '([^/]+)';
        })
        .join('/')}$`
    );
    const m = re.exec(pathname);
    if (m) return { route: r, params: Object.fromEntries(names.map((n, i) => [n, decodeURIComponent(m[i + 1])])) };
  }
  return null;
}
async function call(method, url, body) {
  const u = new URL(`http://127.0.0.1${url}`);
  const hit = find(method, u.pathname);
  assert.ok(hit, `no route for ${method} ${u.pathname}`);
  const ctx = { url: u, params: hit.params, body: async () => body ?? {}, res: {} };
  try {
    return { status: 200, json: await hit.route.handler(ctx) };
  } catch (e) {
    return { status: e.status ?? 500, error: e.message };
  }
}

// ---------------------------------------------------------------- fixtures

const verdict = (slug, changeDate, word) => ({
  slug,
  url: `/blog/${slug}`,
  changeDate,
  judgedOn: '2026-11-05',
  verdict: word,
  before: { impressions: 100, position: 9, clicks: 5, ctr: 0.05 },
  after: { impressions: 140, position: 7, clicks: 9, ctr: 0.064 },
});
const VERDICTS = [
  verdict('alpha', '2026-09-01', 'better'),
  verdict('beta', '2026-09-02', 'better'),
  verdict('gamma', '2026-09-03', 'better'),
  verdict('delta', '2026-09-04', 'worse'),
  verdict('epsilon', '2026-09-05', 'insufficient-data'),
  verdict('zeta', '2026-09-06', 'mixed'),
  verdict('f1', '2026-09-11', 'flat'),
  verdict('f2', '2026-09-12', 'flat'),
  verdict('f3', '2026-09-13', 'flat'),
  verdict('m1', '2026-09-14', 'mixed'),
  verdict('m2', '2026-09-15', 'mixed'),
  verdict('m3', '2026-09-16', 'mixed'),
  verdict('w1', '2026-09-21', 'worse'),
  verdict('w2', '2026-09-22', 'worse'),
  verdict('w3', '2026-09-23', 'worse'),
];
fs.mkdirSync(path.join(root, 'data/snap'), { recursive: true });
fs.writeFileSync(
  path.join(root, 'data/snap/local.json'),
  JSON.stringify({
    source: 'local',
    ok: true,
    status: 'fresh',
    pulledAt: new Date().toISOString(),
    through: '2026-11-10',
    error: null,
    data: { registry: [], livePages: [], inbound: {}, edits: [], verdicts: VERDICTS, due: [], warnings: [] },
  })
);
invalidate();

const get = (url) => call('GET', url);
const post = (url, body) => call('POST', url, body);
const put = (url, body) => call('PUT', url, body);
const del = (url) => call('DELETE', url);
const reset = () => {
  store.writeJson('state/lessons.json', []);
  invalidate();
};

// ================================================================ the status rule

test('a lesson needs three linked verdicts that read the same way to be proven', () => {
  assert.equal(L.statusFromReadings([]), 'trial');
  assert.equal(L.statusFromReadings(['better']), 'trial');
  assert.equal(L.statusFromReadings(['better', 'better']), 'trial');
  assert.equal(L.statusFromReadings(['better', 'better', 'better']), 'proven');
  assert.equal(L.statusFromReadings(['worse', 'worse', 'worse', 'worse']), 'proven');
});

test('three flat or three mixed verdicts prove nothing; only three better or three worse do', () => {
  assert.equal(L.statusFromReadings(['flat', 'flat', 'flat']), 'trial');
  assert.equal(L.statusFromReadings(['mixed', 'mixed', 'mixed', 'mixed']), 'trial');
  assert.equal(L.statusFromReadings(['better', 'better', 'better']), 'proven');
  assert.equal(L.statusFromReadings(['worse', 'worse', 'worse']), 'proven');
  assert.equal(L.provenDirectionOf(['better', 'better', 'better']), 'helps');
  assert.equal(L.provenDirectionOf(['worse', 'worse', 'worse']), 'hurts');
  assert.equal(L.provenDirectionOf(['flat', 'flat', 'flat']), null);
  assert.equal(L.provenDirectionOf(['better', 'better']), null);
  assert.equal(L.provenDirectionOf(['better', 'worse', 'worse']), null);
  assert.match(L.statusNote({ manual: false }, ['flat', 'flat', 'flat']), /nothing for or against/);
});

test('linked verdicts that split drop the lesson, and verdicts that say nothing yet are not counted', () => {
  assert.equal(L.statusFromReadings(['better', 'worse']), 'dropped');
  assert.equal(L.statusFromReadings(['better', 'better', 'better', 'worse']), 'dropped');
  assert.equal(L.statusFromReadings(['better', 'mixed']), 'dropped');
  assert.equal(L.statusFromReadings(['better', 'better', 'too-early', 'insufficient-data']), 'trial');
  assert.equal(L.statusFromReadings(['better', null, 'better', 'better']), 'proven', 'an unknown verdict is skipped');
});

// ================================================================ the routes

test('an empty ledger lists nothing and says what the limits are', async () => {
  reset();
  const r = (await get('/api/lessons')).json;
  assert.equal(r.term, 'Lessons');
  assert.deepEqual(r.items, []);
  assert.deepEqual(r.counts, { trial: 0, proven: 0, dropped: 0, all: 0 });
  assert.deepEqual(r.limits, { max: 200, maxText: 300 });
  for (const k of ['through', 'range', 'sources', 'empty']) assert.ok(k in r, `envelope key ${k}`);
});

test('a lesson goes trial to proven on the third agreeing verdict, and to dropped on a split', async () => {
  reset();
  const made = await post('/api/lessons', { text: '  A clearer\n title  helps ', verdictId: 'alpha|2026-09-01' });
  assert.equal(made.status, 200);
  const lesson = made.json.lesson;
  assert.equal(lesson.text, 'A clearer title helps');
  assert.equal(lesson.status, 'trial');
  assert.deepEqual(lesson.verdictIds, ['alpha|2026-09-01']);
  assert.equal(lesson.createdOn, '2026-11-10');
  assert.equal(lesson.verdicts[0].verdict, 'better');
  assert.equal(lesson.verdicts[0].page, '/blog/alpha');

  const second = await put(`/api/lessons/${lesson.id}`, { addVerdictId: 'beta|2026-09-02' });
  assert.equal(second.json.lesson.status, 'trial');
  const third = await put(`/api/lessons/${lesson.id}`, { addVerdictId: 'gamma|2026-09-03' });
  assert.equal(third.json.lesson.status, 'proven');
  assert.match(third.json.lesson.statusNote, /3 linked results read the same way/);
  // Linking the same verdict again changes nothing.
  const again = await put(`/api/lessons/${lesson.id}`, { addVerdictId: 'gamma|2026-09-03' });
  assert.equal(again.json.lesson.verdictIds.length, 3);

  const split = await put(`/api/lessons/${lesson.id}`, { addVerdictId: 'delta|2026-09-04' });
  assert.equal(split.json.lesson.status, 'dropped');
  const back = await put(`/api/lessons/${lesson.id}`, { removeVerdictId: 'delta|2026-09-04' });
  assert.equal(back.json.lesson.status, 'proven', 'taking the odd one out brings it back');

  const list = (await get('/api/lessons')).json;
  assert.equal(list.counts.proven, 1);
  assert.equal(list.counts.all, 1);
});

test('the founder can set the status by hand, and it stays until he hands it back', async () => {
  reset();
  const { lesson } = (await post('/api/lessons', { text: 'Shorter intros', verdictId: 'alpha|2026-09-01' })).json;
  const set = await put(`/api/lessons/${lesson.id}`, { status: 'proven' });
  assert.equal(set.json.lesson.status, 'proven');
  assert.equal(set.json.lesson.manual, true);
  assert.match(set.json.lesson.statusNote, /by hand/);
  // A verdict that disagrees does not move a status he chose.
  const kept = await put(`/api/lessons/${lesson.id}`, { addVerdictId: 'delta|2026-09-04' });
  assert.equal(kept.json.lesson.status, 'proven');
  const auto = await put(`/api/lessons/${lesson.id}`, { status: 'auto' });
  assert.equal(auto.json.lesson.status, 'dropped');
  assert.equal(auto.json.lesson.manual, false);
  assert.equal((await put(`/api/lessons/${lesson.id}`, { status: 'great' })).status, 400);
});

test('a verdict that says nothing yet does not count, and an unknown verdict id is refused', async () => {
  reset();
  const { lesson } = (await post('/api/lessons', { text: 'Ignore noise', verdictId: 'epsilon|2026-09-05' })).json;
  assert.equal(lesson.status, 'trial');
  assert.equal((await post('/api/lessons', { text: 'No such result', verdictId: 'nope|2026-01-01' })).status, 400);
  assert.equal((await put(`/api/lessons/${lesson.id}`, { addVerdictId: 'nope|2026-01-01' })).status, 400);
  assert.equal((await put(`/api/lessons/${lesson.id}`, {})).status, 400, 'nothing to change');
});

test('text is required, trimmed and at most 300 characters; at most 200 lessons', async () => {
  reset();
  assert.equal((await post('/api/lessons', { text: '   ' })).status, 400);
  assert.equal((await post('/api/lessons', {})).status, 400);
  assert.equal((await post('/api/lessons', { text: 'x'.repeat(301) })).status, 400);
  assert.equal((await post('/api/lessons', { text: 'x'.repeat(300) })).status, 200);
  const { lesson } = (await post('/api/lessons', { text: 'Edit me' })).json;
  assert.equal((await put(`/api/lessons/${lesson.id}`, { text: 'y'.repeat(301) })).status, 400);
  assert.equal((await put(`/api/lessons/${lesson.id}`, { text: ' New words ' })).json.lesson.text, 'New words');

  reset();
  const many = Array.from({ length: 200 }, (_, i) => ({
    id: `l${i}`,
    text: `Lesson ${i}`,
    status: 'trial',
    verdictIds: [],
    createdOn: '2026-11-01',
    updatedOn: '2026-11-01',
  }));
  store.writeJson('state/lessons.json', many);
  const full = await post('/api/lessons', { text: 'One too many' });
  assert.equal(full.status, 400);
  assert.match(full.error, /200/);
});

test('delete removes a lesson, and an unknown id is a 404', async () => {
  reset();
  const { lesson } = (await post('/api/lessons', { text: 'Gone soon' })).json;
  assert.equal((await del(`/api/lessons/${lesson.id}`)).json.ok, true);
  assert.equal((await get('/api/lessons')).json.items.length, 0);
  assert.equal((await del('/api/lessons/nope')).status, 404);
  assert.equal((await put('/api/lessons/nope', { text: 'x' })).status, 404);
});

test('the file keeps the lesson fields and nothing else the page did not ask for', async () => {
  reset();
  const { lesson } = (await post('/api/lessons', { text: 'Stored shape', verdictId: 'alpha|2026-09-01' })).json;
  const saved = store.readJson('state/lessons.json', []);
  assert.equal(saved.length, 1);
  assert.deepEqual(Object.keys(saved[0]).sort(), [
    'createdOn',
    'id',
    'manual',
    'status',
    'text',
    'updatedOn',
    'verdictIds',
  ]);
  assert.equal(saved[0].id, lesson.id);
  assert.equal(saved[0].status, 'trial');
});

test('lesson text a person reads has no em or en dash in what the desk adds', async () => {
  reset();
  const { lesson } = (await post('/api/lessons', { text: 'Plain' })).json;
  assert.doesNotMatch(lesson.statusNote, /[–—]/);
  for (const v of ['trial', 'proven', 'dropped']) {
    const n = L.statusNote(
      { manual: false },
      v === 'dropped' ? ['better', 'worse'] : v === 'proven' ? ['better', 'better', 'better'] : ['better']
    );
    assert.doesNotMatch(n, /[–—]/);
  }
});

test('flat and mixed verdicts leave a lesson a trial; worse ones prove it hurts; better ones prove it helps', async () => {
  reset();
  const flat = (await post('/api/lessons', { text: 'No change', verdictId: 'f1|2026-09-11' })).json.lesson;
  await put(`/api/lessons/${flat.id}`, { addVerdictId: 'f2|2026-09-12' });
  const threeFlat = (await put(`/api/lessons/${flat.id}`, { addVerdictId: 'f3|2026-09-13' })).json.lesson;
  assert.equal(threeFlat.status, 'trial');
  assert.equal(threeFlat.provenDirection, null);
  const mixed = (await post('/api/lessons', { text: 'Mixed bag', verdictId: 'm1|2026-09-14' })).json.lesson;
  await put(`/api/lessons/${mixed.id}`, { addVerdictId: 'm2|2026-09-15' });
  assert.equal((await put(`/api/lessons/${mixed.id}`, { addVerdictId: 'm3|2026-09-16' })).json.lesson.status, 'trial');
  const hurt = (await post('/api/lessons', { text: 'Hurts', verdictId: 'w1|2026-09-21' })).json.lesson;
  await put(`/api/lessons/${hurt.id}`, { addVerdictId: 'w2|2026-09-22' });
  const proven = (await put(`/api/lessons/${hurt.id}`, { addVerdictId: 'w3|2026-09-23' })).json.lesson;
  assert.equal(proven.status, 'proven');
  assert.equal(proven.provenDirection, 'hurts');
  const help = (await post('/api/lessons', { text: 'Helps', verdictId: 'alpha|2026-09-01' })).json.lesson;
  await put(`/api/lessons/${help.id}`, { addVerdictId: 'beta|2026-09-02' });
  const good = (await put(`/api/lessons/${help.id}`, { addVerdictId: 'gamma|2026-09-03' })).json.lesson;
  assert.equal(good.provenDirection, 'helps');
});

test('reading the list never writes; a stale status is saved by the next write and after a refresh', async () => {
  reset();
  store.writeJson('state/lessons.json', [
    {
      id: 'stale001',
      text: 'Stale',
      status: 'trial',
      verdictIds: ['alpha|2026-09-01', 'beta|2026-09-02', 'gamma|2026-09-03'],
      createdOn: '2026-11-01',
      updatedOn: '2026-11-01',
      manual: false,
    },
    {
      id: 'hand0001',
      text: 'By hand',
      status: 'dropped',
      verdictIds: ['alpha|2026-09-01'],
      createdOn: '2026-11-01',
      updatedOn: '2026-11-01',
      manual: true,
    },
  ]);
  const file = path.join(process.env.SEO_DESK_DATA, 'state/lessons.json');
  const before = fs.readFileSync(file, 'utf8');
  const r = (await get('/api/lessons')).json;
  assert.equal(r.items.find((i) => i.id === 'stale001').status, 'proven', 'the page reads the derived status');
  assert.equal(fs.readFileSync(file, 'utf8'), before, 'a GET changes nothing on disk');
  // A write route saves every derived status that changed.
  await call('POST', '/api/lessons', { text: 'Another one' });
  let saved = store.readJson('state/lessons.json', []);
  assert.equal(saved.find((i) => i.id === 'stale001').status, 'proven', 'the file now agrees');
  assert.equal(saved.find((i) => i.id === 'hand0001').status, 'dropped', 'a hand set status is left alone');
  // So does a finished refresh.
  store.writeJson(
    'state/lessons.json',
    saved.map((l) => (l.id === 'stale001' ? { ...l, status: 'trial' } : l))
  );
  invalidate();
  settleSavedLessons();
  saved = store.readJson('state/lessons.json', []);
  assert.equal(saved.find((i) => i.id === 'stale001').status, 'proven', 'settled after a refresh');
});
