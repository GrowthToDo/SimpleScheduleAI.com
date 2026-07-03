import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectDraftFlips } from '../hook-precommit.mjs';

const show = (staged) => (p) => staged[p] ?? '';
const diffOld = (olds) => (p) => olds[p]; // undefined = new file

test('flip true->false detected', () => {
  const flips = detectDraftFlips(
    [{ status: 'M', path: 'src/data/post/a.md' }],
    show({ 'src/data/post/a.md': '---\ndraft: false\n---\nx' }),
    diffOld({ 'src/data/post/a.md': '---\ndraft: true\n---\nx' })
  );
  assert.deepEqual(
    flips.map((f) => f.slug),
    ['a']
  );
});

test('new file with draft:false detected', () => {
  const flips = detectDraftFlips(
    [{ status: 'A', path: 'src/data/article/b.md' }],
    show({ 'src/data/article/b.md': '---\ndraft: false\n---\nx' }),
    diffOld({})
  );
  assert.deepEqual(
    flips.map((f) => f.slug),
    ['b']
  );
});

test('already-live edit and unrelated files ignored', () => {
  const flips = detectDraftFlips(
    [
      { status: 'M', path: 'src/data/post/live.md' },
      { status: 'M', path: 'scripts/check-blog.mjs' },
    ],
    show({ 'src/data/post/live.md': '---\ndraft: false\n---\nedited' }),
    diffOld({ 'src/data/post/live.md': '---\ndraft: false\n---\nx' })
  );
  assert.equal(flips.length, 0);
});
