import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Everything here is synthetic: invented incidents in the real shape of Google's Search Status
// feed, a temp data folder, injected fetches. No network and no server is started.

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-notes-'));
const DATA = path.join(root, 'data');
const REPO = path.join(root, 'repo');
fs.mkdirSync(path.join(DATA, 'snap'), { recursive: true });
fs.mkdirSync(path.join(DATA, 'state'), { recursive: true });
fs.mkdirSync(path.join(REPO, 'docs/seo'), { recursive: true });
process.env.SEO_DESK_DATA = DATA;
process.env.SEO_DESK_REPO = REPO;
process.env.SEO_DESK_TODAY = '2026-11-10';

const { parseIncidents, fetchGoogleUpdates, classifyIncident, refreshGoogleUpdates, staleUpdatesNote, MAX_FEED_BYTES } =
  await import('../lib/google-updates.mjs');
const { pullLocal } = await import('../lib/sources/local.mjs');
const { buildModel, invalidate, loadSettings, saveSettings } = await import('../lib/api/model.mjs');
const { addAnnotation, updateAnnotation, deleteAnnotation, annotationsView, restoreAnnotation } = await import(
  '../lib/api/actions.mjs'
);
const work = await import('../lib/api/work.mjs');
const { routes } = await import('../lib/api/ext/notes.mjs');
const { writeJson } = await import('../lib/store.mjs');

after(() => fs.rmSync(root, { recursive: true, force: true }));

// ---------------------------------------------------------------- fixtures

const incident = (over) => ({
  id: 'AAAA1111',
  number: '1111',
  begin: '2026-05-21T15:40:00+00:00',
  created: '2026-05-21T15:41:00+00:00',
  modified: '2026-06-02T12:40:00+00:00',
  end: '2026-06-02T12:40:00+00:00',
  external_desc: 'May 2026 core update',
  updates: [
    { when: '2026-05-21T15:41:00+00:00', text: 'Released the May 2026 core update.', status: 'SERVICE_INFORMATION' },
  ],
  most_recent_update: { when: '2026-06-02T12:40:00+00:00', text: 'The rollout was complete.', status: 'AVAILABLE' },
  status_impact: 'SERVICE_INFORMATION',
  service_name: 'Ranking',
  ...over,
});

const FEED = [
  incident({
    id: 'N1',
    begin: '2026-11-08T18:06:00+00:00',
    end: undefined,
    external_desc: 'November 2026 core update',
  }),
  incident({
    id: 'S1',
    begin: '2026-09-24T16:15:00+00:00',
    end: '2026-10-08T08:00:00+00:00',
    external_desc: 'September 2026 spam update',
  }),
  incident({
    id: 'D1',
    begin: '2026-02-05T17:00:00+00:00',
    end: '2026-02-27T10:00:00+00:00',
    external_desc: 'February 2026 Discover update',
    updates: [{ text: 'Released the February 2026 Discover update.' }],
  }),
  incident({
    id: 'V1',
    begin: '2026-02-25T03:55:00+00:00',
    end: '2026-02-25T04:10:00+00:00',
    external_desc: 'Serving was experiencing an issue',
    service_name: 'Serving',
    updates: [{ text: 'We fixed the issue with serving search results.' }],
    most_recent_update: { text: 'We fixed the issue with serving search results.' },
  }),
  { id: 'BROKEN', external_desc: 'Missing its start date' },
  null,
];

const reply =
  (body, over = {}) =>
  async () => ({
    ok: true,
    status: 200,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
    ...over,
  });

// ---------------------------------------------------------------- the feed parser

test('parseIncidents: keeps the incidents it can read, marks ranking updates, skips the rest', () => {
  const list = parseIncidents(FEED);
  assert.deepEqual(
    list.map((u) => [u.id, u.title, u.start, u.end, u.kind]),
    [
      ['D1', 'February 2026 Discover update', '2026-02-05', '2026-02-27', 'other'],
      ['V1', 'Serving was experiencing an issue', '2026-02-25', '2026-02-25', 'other'],
      ['S1', 'September 2026 spam update', '2026-09-24', '2026-10-08', 'ranking'],
      ['N1', 'November 2026 core update', '2026-11-08', null, 'ranking'],
    ],
    'oldest first; a rollout still going has no end; the broken entries are skipped'
  );
});

test('classifyIncident: recognises the kinds of ranking update by title or first message', () => {
  const kind = (external_desc, text = '') =>
    classifyIncident({ external_desc, updates: [{ text }], most_recent_update: { text: 'Done.' } });
  assert.equal(kind('March 2026 core update'), 'ranking');
  assert.equal(kind('August 2026 spam update'), 'ranking');
  assert.equal(kind('Helpful content update'), 'ranking');
  assert.equal(kind('Product reviews update'), 'ranking');
  assert.equal(kind('Page experience update'), 'ranking');
  assert.equal(kind('Ranking issue', 'Released the new spam update.'), 'other', 'only the title counts');
  assert.equal(kind('Crawling was slow'), 'other');
  assert.equal(kind('Search Console reports delayed'), 'other');
  assert.equal(kind('February 2026 Discover update'), 'other', 'Discover is not Search ranking');
  assert.equal(kind(''), 'other');
});

test('parseIncidents: a changed shape is an error, never a silently empty list', () => {
  assert.throws(() => parseIncidents({ error: 'gone' }), /shape/i);
  assert.throws(() => parseIncidents('text'), /shape/i);
  assert.throws(() => parseIncidents([{ name: 'a', when: 'b' }, { name: 'c' }]), /shape/i);
  assert.deepEqual(parseIncidents([]), [], 'a feed that really lists nothing is an empty list');
  assert.deepEqual(parseIncidents({ incidents: FEED }).length, 4, 'a list inside an incidents key is read too');
});

test('parseIncidents: tolerates missing fields and odd dates', () => {
  const [u] = parseIncidents([
    { id: 'X', begin: '2026-03-01', external_desc: 'March 2026 core update' },
    { begin: 'garbage', external_desc: 'x' },
  ]);
  assert.deepEqual(u, { id: 'X', title: 'March 2026 core update', start: '2026-03-01', end: null, kind: 'ranking' });
});

// ---------------------------------------------------------------- the fetch

test('fetchGoogleUpdates: reads the feed with a time limit', async () => {
  let seen;
  const out = await fetchGoogleUpdates(async (url, opts) => {
    seen = [url, Boolean(opts?.signal)];
    return reply(FEED)();
  });
  assert.deepEqual(seen, ['https://status.search.google.com/incidents.json', true]);
  assert.equal(out.warning, null);
  assert.equal(out.updates.length, 4);
});

test('fetchGoogleUpdates: any failure keeps the previous list and says so in one line', async () => {
  const previous = parseIncidents(FEED);
  const truncated = JSON.stringify(FEED).slice(0, 300);
  const cases = {
    'network down': async () => {
      throw new Error('offline');
    },
    'not 200': reply('nope', { ok: false, status: 503 }),
    'truncated json': reply(truncated),
    'changed shape': reply({ error: 'moved' }),
    'renamed fields': reply([{ name: 'a', when: 'b' }]),
  };
  for (const [label, fetchImpl] of Object.entries(cases)) {
    const out = await fetchGoogleUpdates(fetchImpl, previous);
    assert.deepEqual(out.updates, previous, `${label}: the old list stays`);
    assert.match(out.warning, /^googleUpdates: /, label);
    assert.ok(!out.warning.includes('\n'), `${label}: one line`);
  }
  const first = await fetchGoogleUpdates(cases['changed shape']);
  assert.deepEqual(first.updates, [], 'with nothing before, the list is empty');
});

test('pullLocal stores the updates, and keeps the last list when the feed fails', async () => {
  const repo = fs.mkdtempSync(path.join(root, 'pull-'));
  fs.mkdirSync(path.join(repo, 'docs/seo'), { recursive: true });
  const offlineExcept = (feedFn) => async (url) => {
    if (url.includes('status.search.google.com')) return feedFn();
    throw new Error('offline');
  };
  const ok = await pullLocal({ today: '2026-11-10', repoRoot: repo, fetchImpl: offlineExcept(reply(FEED)) });
  assert.equal(ok.data.googleUpdates.length, 4);
  assert.ok(!ok.data.warnings.some((w) => w.startsWith('googleUpdates')));
  writeJson('snap/local.json', ok);
  const failed = await pullLocal({
    today: '2026-11-11',
    repoRoot: repo,
    fetchImpl: offlineExcept(reply('{"cut off')),
    now: Date.now() + 25 * 3600000,
  });
  assert.deepEqual(failed.data.googleUpdates, ok.data.googleUpdates);
  assert.equal(failed.data.warnings.filter((w) => w.startsWith('googleUpdates')).length, 1);
  fs.rmSync(path.join(DATA, 'snap/local.json'), { force: true });
});

test('the feed: titles are cut at 200 characters and a body over 1 MB is refused', async () => {
  const [u] = parseIncidents([{ id: 'L', begin: '2026-03-01', external_desc: `March core update ${'x'.repeat(400)}` }]);
  assert.equal(u.title.length, 200);
  assert.equal(MAX_FEED_BYTES, 1024 * 1024);
  const previous = parseIncidents(FEED);
  const big = await fetchGoogleUpdates(reply(`[${' '.repeat(MAX_FEED_BYTES)}]`), previous);
  assert.deepEqual(big.updates, previous);
  assert.match(big.warning, /larger than 1 MB/);
  const declared = await fetchGoogleUpdates(
    reply(FEED, {
      headers: { get: (h) => (h.toLowerCase() === 'content-length' ? String(2 * MAX_FEED_BYTES) : null) },
    }),
    previous
  );
  assert.match(declared.warning, /larger than 1 MB/);
});

test('refreshGoogleUpdates: the feed is asked at most once a day, and a good read is dated', async () => {
  const day = 86400000;
  const t0 = Date.parse('2026-11-08T07:00:00Z');
  let calls = 0;
  const ok = async () => {
    calls += 1;
    return reply(FEED)();
  };
  const down = async () => {
    calls += 1;
    throw new Error('offline');
  };
  const first = await refreshGoogleUpdates({ fetchImpl: ok, previous: {}, now: t0 });
  assert.equal(calls, 1);
  assert.equal(first.updates.length, 4);
  assert.equal(first.fetchedAt, '2026-11-08T07:00:00.000Z');
  assert.equal(first.triedAt, '2026-11-08T07:00:00.000Z');
  const soon = await refreshGoogleUpdates({ fetchImpl: ok, previous: first, now: t0 + 2 * 3600000 });
  assert.equal(calls, 1, 'two hours later: not asked again');
  assert.deepEqual(soon.updates, first.updates);
  assert.equal(soon.warning, null);
  const failed = await refreshGoogleUpdates({ fetchImpl: down, previous: first, now: t0 + day + 1000 });
  assert.equal(calls, 2);
  assert.deepEqual(failed.updates, first.updates, 'a failed read keeps the list');
  assert.equal(failed.fetchedAt, first.fetchedAt, 'and the date of the last good read');
  assert.equal(failed.triedAt, new Date(t0 + day + 1000).toISOString());
  assert.match(failed.warning, /^googleUpdates: /);
  await refreshGoogleUpdates({ fetchImpl: down, previous: failed, now: t0 + day + 3600000 });
  assert.equal(calls, 2, 'a failure is not retried on every page load either');
});

test('staleUpdatesNote: one plain line once the last good read is more than 3 days old', () => {
  assert.equal(staleUpdatesNote({ fetchedAt: '2026-11-08T07:00:00.000Z', triedAt: null }, '2026-11-11'), null);
  assert.equal(
    staleUpdatesNote({ fetchedAt: '2026-11-08T07:00:00.000Z', triedAt: '2026-11-12T07:00:00.000Z' }, '2026-11-12'),
    "Google's update list could not be refreshed since 8 November."
  );
  assert.equal(staleUpdatesNote({ fetchedAt: null, triedAt: null }, '2026-11-12'), null, 'never tried: nothing to say');
  assert.equal(
    staleUpdatesNote({ fetchedAt: null, triedAt: '2026-11-12T07:00:00.000Z' }, '2026-11-12'),
    "Google's update list could not be read yet."
  );
});

test('pullLocal keeps the feed dates in the snapshot and Did it work says when the list is old', async () => {
  const repo = fs.mkdtempSync(path.join(root, 'pull2-'));
  fs.mkdirSync(path.join(repo, 'docs/seo'), { recursive: true });
  let feedCalls = 0;
  const fetchImpl = async (url) => {
    if (url.includes('status.search.google.com')) {
      feedCalls += 1;
      return reply(FEED)();
    }
    throw new Error('offline');
  };
  const now = Date.parse('2026-11-05T07:00:00Z');
  const one = await pullLocal({ today: '2026-11-05', repoRoot: repo, fetchImpl, now });
  assert.equal(one.data.googleUpdatesFetchedAt, '2026-11-05T07:00:00.000Z');
  writeJson('snap/local.json', one);
  await pullLocal({ today: '2026-11-05', repoRoot: repo, fetchImpl, now: now + 60000 });
  assert.equal(feedCalls, 1, 'a page load two minutes later does not ask the feed again');
  invalidate();
  const r = work.resultsView(buildModel());
  assert.equal(r.googleUpdatesNote, "Google's update list could not be refreshed since 5 November.");
  fs.rmSync(path.join(DATA, 'snap/local.json'), { force: true });
  invalidate();
});

// ---------------------------------------------------------------- annotations

const reset = () => {
  writeJson('state/annotations.json', []);
  writeJson('state/settings.json', {});
  invalidate();
};

test('a new note has a title, a date, an optional end date, a category and a detail', () => {
  reset();
  const a = addAnnotation({
    title: 'Moved the pricing table',
    date: '2026-11-03',
    endDate: '2026-11-05',
    category: 'content',
    detail: 'Table now sits above the fold.',
  });
  assert.equal(a.title, 'Moved the pricing table');
  assert.equal(a.text, 'Moved the pricing table', 'text mirrors the title for older readers');
  assert.deepEqual(
    [a.date, a.endDate, a.category, a.detail],
    ['2026-11-03', '2026-11-05', 'content', 'Table now sits above the fold.']
  );
  assert.equal(a.archived, false);
  const plainNote = addAnnotation({ text: 'Quick note', date: '2026-11-04' });
  assert.deepEqual(
    [plainNote.title, plainNote.endDate, plainNote.category, plainNote.detail],
    ['Quick note', null, 'other', ''],
    'text still works as the title; the rest default'
  );
});

test('a note is checked: a title, real dates, an end date that is not before the start, a known category', () => {
  reset();
  const fails = (body, re) =>
    assert.throws(
      () => addAnnotation(body),
      (e) => e.status === 400 && re.test(e.message)
    );
  fails({ date: '2026-11-03', title: '  ' }, /text|title/i);
  fails({ date: 'soon', title: 'x' }, /date/i);
  fails({ date: '2026-11-03', endDate: 'later', title: 'x' }, /date/i);
  fails({ date: '2026-11-03', endDate: '2026-11-01', title: 'x' }, /before/i);
  fails({ date: '2026-11-03', title: 'x', category: 'banana' }, /category/i);
  fails({ date: '2026-11-03', title: 'x'.repeat(301) }, /300/);
  fails({ date: '2026-11-03', title: 'x', detail: 'y'.repeat(1001) }, /1000/);
  const a = addAnnotation({ date: '2026-11-03', endDate: '2026-11-05', title: 'x' });
  assert.throws(
    () => updateAnnotation(a.id, { date: '2026-11-09' }),
    (e) => e.status === 400 && /before/i.test(e.message)
  );
  const b = updateAnnotation(a.id, { endDate: null, category: 'technical', detail: 'More.' });
  assert.deepEqual([b.endDate, b.category, b.detail], [null, 'technical', 'More.']);
  assert.equal(updateAnnotation(a.id, { title: 'Renamed' }).text, 'Renamed');
});

test('archived notes are hidden by default; the archived list shows only them', () => {
  reset();
  const live = addAnnotation({ title: 'Stays', date: '2026-11-01' });
  const old = addAnnotation({ title: 'Goes', date: '2026-11-02' });
  deleteAnnotation(old.id);
  const model = buildModel();
  assert.deepEqual(
    annotationsView(model).items.map((x) => x.id),
    [live.id]
  );
  assert.deepEqual(
    annotationsView(model, { archived: true }).items.map((x) => x.id),
    [old.id]
  );
  assert.ok(annotationsView(model).categories.some((c) => c.key === 'content' && c.label));
});

test('delete archives a live note and removes an archived one for good, and says which', () => {
  reset();
  const a = addAnnotation({ title: 'One', date: '2026-11-01' });
  const first = deleteAnnotation(a.id);
  assert.equal(first.archived, true);
  assert.equal(first.deleted, undefined);
  assert.match(first.message, /archive/i);
  assert.equal(first.annotation.archived, true);
  const second = deleteAnnotation(a.id);
  assert.equal(second.deleted, true);
  assert.equal(second.id, a.id);
  assert.match(second.message, /for good/i);
  assert.throws(
    () => deleteAnnotation(a.id),
    (e) => e.status === 404
  );
});

test('restore brings an archived note back, and a note that is not archived is left alone', () => {
  reset();
  const a = addAnnotation({ title: 'Back again', date: '2026-11-01', category: 'links' });
  assert.equal(restoreAnnotation(a.id).restored, false, 'not archived yet: nothing to do');
  deleteAnnotation(a.id);
  const r = restoreAnnotation(a.id);
  assert.equal(r.restored, true);
  assert.equal(r.annotation.archived, false);
  assert.equal(r.annotation.archivedAt, null);
  assert.equal(r.annotation.category, 'links', 'nothing else changes');
  assert.equal(annotationsView(buildModel()).items.length, 1);
  assert.throws(
    () => restoreAnnotation('nope'),
    (e) => e.status === 404
  );
});

const route = (method, p) => routes.find((r) => r.method === method && r.path === p);
const ctxOf = (p, params = {}) => ({ url: new URL(`http://x${p}`), params, body: async () => ({}) });

test('the routes: the archived list and the restore action', async () => {
  reset();
  const a = addAnnotation({ title: 'Routed', date: '2026-11-01' });
  deleteAnnotation(a.id);
  const list = await route('GET', '/api/annotations/archived').handler(ctxOf('/api/annotations/archived'));
  assert.deepEqual(
    list.items.map((x) => x.id),
    [a.id]
  );
  const back = await route('POST', '/api/annotations/:id/restore').handler(
    ctxOf(`/api/annotations/${a.id}/restore`, { id: a.id })
  );
  assert.equal(back.restored, true);
  const none = await route('GET', '/api/annotations/archived').handler(ctxOf('/api/annotations/archived'));
  assert.deepEqual(none.items, []);
});

// ---------------------------------------------------------------- markers and the timeline

const UPDATES = [
  { id: 'a', title: 'March 2026 core update', start: '2026-03-27', end: '2026-04-08', kind: 'ranking' },
  { id: 'b', title: 'Serving was experiencing an issue', start: '2026-10-01', end: '2026-10-01', kind: 'other' },
  { id: 'c', title: 'September 2026 spam update', start: '2026-09-24', end: '2026-10-08', kind: 'ranking' },
  { id: 'd', title: 'November 2026 core update', start: '2026-11-08', end: null, kind: 'ranking' },
];

function seedLocal(extra = {}) {
  writeJson('snap/local.json', {
    source: 'local',
    ok: true,
    status: 'fresh',
    pulledAt: '2026-11-10T08:00:00.000Z',
    through: '2026-11-10',
    error: null,
    data: { verdicts: [], livePages: [], registry: [], edits: [], googleUpdates: UPDATES, ...extra },
  });
  invalidate();
}

test('googleUpdateMarkers: only ranking updates that touch the range, shaped for the charts', () => {
  reset();
  seedLocal();
  const model = buildModel();
  assert.deepEqual(work.googleUpdateMarkers(model, { start: '2026-10-01', end: '2026-10-31' }), [
    { date: '2026-09-24', endDate: '2026-10-08', label: 'September 2026 spam update', kind: 'google-update' },
  ]);
  assert.deepEqual(
    work.googleUpdateMarkers(model, { start: '2026-11-09', end: '2026-11-20' }).map((m) => [m.date, m.endDate]),
    [['2026-11-08', null]],
    'a rollout with no end date is still going, so it counts up to today'
  );
  assert.deepEqual(work.googleUpdateMarkers(model, { start: '2026-04-09', end: '2026-09-01' }), []);
  assert.equal(work.googleUpdateMarkers(model, { start: '2026-04-08', end: '2026-04-08' }).length, 1, 'edges count');
  assert.equal(work.googleUpdateMarkers(model, {}).length, 3, 'no range means all of them');
});

test('the toggle: turning off showGoogleUpdates removes the markers and the timeline entries', () => {
  reset();
  seedLocal();
  const range = { start: '2026-09-01', end: '2026-11-10' };
  assert.equal(loadSettings().showGoogleUpdates, true, 'on by default');
  assert.equal(work.timelineEvents(buildModel(), range).filter((e) => e.kind === 'google-update').length, 2);
  saveSettings({ ...loadSettings(), showGoogleUpdates: false });
  const model = buildModel();
  assert.deepEqual(work.googleUpdateMarkers(model, range), []);
  assert.equal(work.timelineEvents(model, range).filter((e) => e.kind === 'google-update').length, 0);
});

test('the timeline carries Google updates among the other events, also for one page, and no feed means none', () => {
  reset();
  seedLocal({ edits: [{ page: '/blog/a', date: '2026-10-02', kind: 'publish', subject: 'x' }] });
  addAnnotation({ title: 'Mine', date: '2026-10-03' });
  const model = buildModel();
  const onePage = work.timelineEvents(model, { page: '/blog/a', start: '2026-09-01' });
  assert.deepEqual(
    onePage.map((e) => e.kind),
    ['google-update', 'publish', 'annotation', 'google-update'],
    'sorted by date; site wide updates stay on a single page chart'
  );
  assert.equal(onePage.find((e) => e.kind === 'google-update').endDate, '2026-10-08');
  seedLocal({ googleUpdates: undefined });
  assert.equal(
    work.timelineEvents(buildModel(), { start: '2026-01-01' }).filter((e) => e.kind === 'google-update').length,
    0
  );
});

// ---------------------------------------------------------------- verdict cards

const verdict = (slug, changeDate) => ({
  slug,
  url: `/blog/${slug}`,
  changeDate,
  verdict: 'better',
  judgedOn: '2026-11-09',
  before: { impressions: 100, position: 9 },
  after: { impressions: 120, position: 8 },
});

const NOTE = 'A Google ranking update fell inside this period, so read this verdict with care.';

test('nearUpdates: a ranking update inside the 28 days before or the 28 days after a change, the judge windows exactly', () => {
  reset();
  // Spam update 24 September to 8 October; core update from 8 November, still going. The windows
  // are the judge's own (windowsFor): the 28 days before the change and the 28 days after it.
  const rows = {};
  const dates = [
    '2026-08-26', // after window = 27 Aug to 23 Sep: one day short of the 24th
    '2026-08-27', // after window ends 24 Sep: touches the start
    '2026-11-05', // before 8 Oct end: before window 8 Oct to 4 Nov includes 8 Oct
    '2026-11-06', // before window 9 Oct to 5 Nov: past the end of the spam update
    '2026-11-30', // before window 2 to 29 Nov: the core update is still going, so it touches
    '2026-03-01', // march update (27 Mar) is inside the 28 day after window ending 29 Mar
  ];
  seedLocal({ verdicts: dates.map((d, i) => verdict(`p${i}`, d)) });
  for (const r of work.verdictRows(buildModel())) rows[r.changeDate] = r;
  const labels = (d) => rows[d].nearUpdates.map((u) => u.label);
  assert.deepEqual(labels('2026-08-26'), [], 'one day before the window reaches the update');
  assert.deepEqual(labels('2026-08-27'), ['September 2026 spam update'], 'the last day of the after window counts');
  assert.deepEqual(labels('2026-11-05'), ['September 2026 spam update', 'November 2026 core update']);
  assert.deepEqual(
    labels('2026-11-06'),
    ['November 2026 core update'],
    'the spam update ended before this before window'
  );
  assert.deepEqual(labels('2026-11-30'), ['November 2026 core update'], 'a rollout still going counts up to today');
  assert.deepEqual(labels('2026-03-01'), ['March 2026 core update']);
  assert.deepEqual(rows['2026-08-27'].nearUpdates[0], { label: 'September 2026 spam update', date: '2026-09-24' });
  assert.equal(rows['2026-08-27'].nearUpdatesNote, NOTE);
  assert.equal(rows['2026-08-26'].nearUpdatesNote, null);
  assert.ok(!NOTE.includes('—') && !NOTE.includes('–'));
});

test('nearUpdates: the change day itself belongs to neither window; other incidents never count; the toggle does not hide it', () => {
  reset();
  seedLocal({
    googleUpdates: [
      { id: 'x', title: 'A one day spam update', start: '2026-09-10', end: '2026-09-10', kind: 'ranking' },
      { id: 'y', title: 'Serving was experiencing an issue', start: '2026-09-12', end: '2026-09-12', kind: 'other' },
    ],
    verdicts: [verdict('on-day', '2026-09-10'), verdict('next-day', '2026-09-09')],
  });
  saveSettings({ ...loadSettings(), showGoogleUpdates: false });
  const rows = Object.fromEntries(work.verdictRows(buildModel()).map((r) => [r.slug, r]));
  assert.deepEqual(rows['on-day'].nearUpdates, []);
  assert.deepEqual(
    rows['next-day'].nearUpdates.map((u) => u.label),
    ['A one day spam update']
  );
  const results = work.resultsView(buildModel());
  assert.equal(
    results.verdicts.find((v) => v.slug === 'next-day').nearUpdates.length,
    1,
    'the results view carries it'
  );
});

test('nearUpdates is an empty list when no feed has been read yet', () => {
  reset();
  seedLocal({ googleUpdates: undefined, verdicts: [verdict('p', '2026-10-01')] });
  const [row] = work.verdictRows(buildModel());
  assert.deepEqual(row.nearUpdates, []);
  assert.equal(row.nearUpdatesNote, null);
});
