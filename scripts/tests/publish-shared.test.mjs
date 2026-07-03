import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter, contentHash, resolvePost, scanInboundLinks } from '../lib/publish-shared.mjs';

const FIX = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');

test('parseFrontmatter extracts data and body', () => {
  const text = fs.readFileSync(path.join(FIX, 'post-live.md'), 'utf8');
  const { data, body } = parseFrontmatter(text);
  assert.equal(data.draft, false);
  assert.equal(data.title, 'Live Fixture');
  assert.ok(data.image.startsWith('https://images.unsplash.com/'));
  assert.ok(body.includes('/blog/target-slug'));
});

test('contentHash is stable and changes with content', () => {
  assert.equal(contentHash('abc'), contentHash('abc'));
  assert.notEqual(contentHash('abc'), contentHash('abd'));
  assert.match(contentHash('abc'), /^[0-9a-f]{64}$/);
});

function makeRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ps-'));
  fs.mkdirSync(path.join(root, 'src', 'data', 'post'), { recursive: true });
  fs.mkdirSync(path.join(root, 'src', 'data', 'article'), { recursive: true });
  fs.copyFileSync(path.join(FIX, 'post-live.md'), path.join(root, 'src', 'data', 'post', 'live-one.md'));
  fs.copyFileSync(path.join(FIX, 'post-draft.md'), path.join(root, 'src', 'data', 'post', 'draft-one.md'));
  fs.writeFileSync(path.join(root, 'src', 'data', 'post', 'target-slug.md'), '---\ndraft: false\ntitle: T\n---\nbody');
  return root;
}

test('resolvePost finds post by slug and by path', () => {
  const root = makeRepo();
  const bySlug = resolvePost('target-slug', root);
  assert.equal(bySlug.collection, 'post');
  assert.ok(bySlug.filePath.endsWith('target-slug.md'));
  const byPath = resolvePost('src/data/post/target-slug.md', root);
  assert.equal(byPath.slug, 'target-slug');
  assert.throws(() => resolvePost('nope', root));
});

test('scanInboundLinks counts only live siblings', () => {
  const root = makeRepo();
  const r = scanInboundLinks('target-slug', 'post', root);
  assert.equal(r.count, 1); // live-one counts, draft-one does not
  assert.ok(r.sources[0].includes('live-one'));
});
