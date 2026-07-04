import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter, contentHash, verdictHash, resolvePost, scanInboundLinks } from '../lib/publish-shared.mjs';

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

test('verdictHash ignores draft/publishDate/updateDate flips in frontmatter', () => {
  const a = '---\ndraft: true\npublishDate: 2026-06-01T00:00:00Z\ntitle: T\n---\nBody text.\n';
  const b = '---\ndraft: false\npublishDate: 2026-07-04T00:00:00Z\ntitle: T\n---\nBody text.\n';
  assert.equal(verdictHash(a), verdictHash(b));
  assert.notEqual(contentHash(a), contentHash(b));
});

test('verdictHash still changes when body or other frontmatter changes', () => {
  const a = '---\ndraft: true\ntitle: T\n---\nBody text.\n';
  const b = '---\ndraft: true\ntitle: T\n---\nEdited body.\n';
  const c = '---\ndraft: true\ntitle: Other\n---\nBody text.\n';
  assert.notEqual(verdictHash(a), verdictHash(b));
  assert.notEqual(verdictHash(a), verdictHash(c));
});

test('verdictHash does not touch draft/publishDate/updateDate mentions in the body', () => {
  const a = '---\ndraft: true\ntitle: T\n---\nWe removed the draft: true flag from publishDate: fields.\n';
  const b = '---\ndraft: false\ntitle: T\n---\nWe removed the draft: true flag from publishDate: fields.\n';
  assert.equal(verdictHash(a), verdictHash(b));
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
