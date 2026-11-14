import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// The final fix wave of the 2026-11-14 logic audit: where the four packages meet. Every page, commit,
// phrase and number here is invented.

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-final-'));
const DATA = path.join(root, 'data');
const REPO = path.join(root, 'repo');
fs.mkdirSync(path.join(REPO, 'docs/seo'), { recursive: true });
process.env.SEO_DESK_DATA = DATA;
process.env.SEO_DESK_REPO = REPO;
process.env.SEO_DESK_TODAY = '2026-11-14';

const week = await import('../lib/week.mjs');
const changes = await import('../lib/changes.mjs');
const { buildModel, invalidate } = await import('../lib/api/model.mjs');
const work = await import('../lib/api/work.mjs');
const { writeJson } = await import('../lib/store.mjs');

const TODAY = '2026-11-14';

function snap(source, data, extra = {}) {
  writeJson(`snap/${source}.json`, {
    source,
    ok: true,
    status: 'fresh',
    pulledAt: '2026-11-14T06:00:00.000Z',
    through: '2026-11-13',
    error: null,
    data,
    ...extra,
  });
}

const verdictRow = (extra = {}) => ({
  slug: 'sample-guide',
  url: '/blog/sample-guide',
  changeDate: '2026-10-02',
  judgedOn: '2026-11-01',
  verdict: 'worse',
  before: { impressions: 133, position: 15 },
  after: { impressions: 27, position: 18.2 },
  siteImpPct: -0.016,
  ...extra,
});

// ---------------------------------------------------------------- M1: one reading per change

// One commit: its batch row overlaps another change, two page rows can be read (one better, one
// worse), one page row overlaps too. A second commit is one overlapping page.
const M1_ROWS = [
  verdictRow({ slug: 'lone-guide', url: '/blog/lone-guide', commits: [{ hash: 'k0' }], overlapping: true }),
  verdictRow({ slug: 'up-guide', url: '/blog/up-guide', commits: [{ hash: 'k1' }], verdict: 'better' }),
  verdictRow({ slug: 'down-guide', url: '/blog/down-guide', commits: [{ hash: 'k1' }], verdict: 'worse' }),
  verdictRow({ slug: 'tangled-guide', url: '/blog/tangled-guide', commits: [{ hash: 'k1' }], overlapping: true }),
  verdictRow({
    slug: 'batch:k1',
    url: null,
    kind: 'batch',
    pages: ['/blog/up-guide', '/blog/down-guide', '/blog/tangled-guide'],
    commits: [{ hash: 'k1' }],
    verdict: 'better',
    overlapping: true,
  }),
];

test('M1: an overlapping batch is read from its page rows no other change overlaps', () => {
  const { changes: list } = changes.readChanges(M1_ROWS);
  assert.deepEqual(
    list.map((c) => c.word),
    ['unreadable', 'mixed']
  );
  assert.deepEqual(list[1].used, [1, 2], 'the two readable page rows, not the batch or the overlapped page');
  // All the readable pages agree: the change reads their word.
  const worse = changes.readChanges(M1_ROWS.map((r) => (r.slug === 'up-guide' ? { ...r, verdict: 'worse' } : r)));
  assert.equal(worse.changes[1].word, 'worse');
  // A batch no other change overlaps is the change's reading.
  const clean = changes.readChanges(M1_ROWS.map((r) => (r.kind === 'batch' ? { ...r, overlapping: false } : r)));
  assert.equal(clean.changes[1].word, 'better');
  assert.deepEqual(clean.changes[1].used, [4]);
});

test('M1: the Did it work tile, its list and the week read a change the same way', () => {
  writeJson('state/items.json', {});
  snap('gsc', { pageDaily: [], siteDaily: [] });
  snap('local', { livePages: [], verdicts: M1_ROWS, due: [], edits: [] });
  invalidate();
  const model = buildModel();
  const r = work.resultsView(model);
  assert.equal(r.verdictCounts.changes, 2);
  assert.equal(r.verdictCounts.text, '1 mixed, 1 cannot be read');
  assert.equal(r.verdictCounts.byWord.unreadable, 1);
  const batch = r.verdicts.find((v) => v.batch);
  assert.equal(batch.changeVerdict, 'mixed');
  assert.equal(
    batch.changeNote,
    'This change reads as Mixed, from its 2 pages that no other edit overlaps (1 better, 1 worse).'
  );
  const down = r.verdicts.find((v) => v.slug === 'down-guide');
  assert.equal(down.changeVerdict, 'mixed');
  assert.equal(r.verdicts.find((v) => v.slug === 'lone-guide').changeNote, null, 'a change of one row needs no note');

  // A mixed change is no "reads worse" worry, though one of its pages read worse.
  const list = week.worries({ snaps: { local: { data: { verdicts: M1_ROWS } } }, today: TODAY });
  assert.equal(list.filter((w) => w.kind === 'verdict-worse').length, 0);

  // When the readable pages all read worse, each one is a worry, and the overlapped page is not.
  const allWorse = M1_ROWS.map((x) => (x.slug === 'up-guide' ? { ...x, verdict: 'worse' } : x));
  const worse = week.worries({ snaps: { local: { data: { verdicts: allWorse } } }, today: TODAY });
  assert.deepEqual(
    worse
      .filter((w) => w.kind === 'verdict-worse')
      .map((w) => w.page)
      .sort(),
    ['/blog/down-guide', '/blog/up-guide']
  );
});
