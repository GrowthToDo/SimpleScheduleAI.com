import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { smokeRoutes } from '../smoke-routes.mjs';

const KEY = [
  '',
  'how-it-works',
  'pricing',
  'nurse-scheduling-software',
  'critical-access-hospital-scheduling',
  'ai-nurse-scheduling',
  'articles',
];

const roots = [];

function makeSite({ doublePrefix = false, missingPost = false, leak = false } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sm-'));
  roots.push(root);
  fs.mkdirSync(path.join(root, 'src', 'data', 'post'), { recursive: true });
  fs.mkdirSync(path.join(root, 'src', 'data', 'article'), { recursive: true });
  fs.writeFileSync(path.join(root, 'src', 'data', 'post', 'p1.md'), '---\ndraft: false\ntitle: P\n---\nx');
  fs.writeFileSync(path.join(root, 'src', 'data', 'post', 'p2.md'), '---\ntitle: P2\n---\nx');
  fs.writeFileSync(path.join(root, 'src', 'data', 'article', 'a1.md'), '---\ndraft: false\ntitle: A\n---\nx');
  const dist = path.join(root, 'dist');
  for (const k of KEY) fs.mkdirSync(path.join(dist, k), { recursive: true });
  for (const k of KEY) fs.writeFileSync(path.join(dist, k, 'index.html'), '<html></html>');
  if (!missingPost) {
    fs.mkdirSync(path.join(dist, 'blog', 'p1'), { recursive: true });
    fs.writeFileSync(path.join(dist, 'blog', 'p1', 'index.html'), leak ? 'x &lt;div class="broken"' : '<html></html>');
  }
  fs.mkdirSync(path.join(dist, 'blog', 'p2'), { recursive: true });
  fs.writeFileSync(path.join(dist, 'blog', 'p2', 'index.html'), '<html></html>');
  const artDir = doublePrefix ? path.join(dist, 'articles', 'articles', 'a1') : path.join(dist, 'articles', 'a1');
  fs.mkdirSync(artDir, { recursive: true });
  fs.writeFileSync(path.join(artDir, 'index.html'), '<html></html>');
  fs.writeFileSync(
    path.join(dist, 'sitemap-0.xml'),
    `<urlset><url><loc>https://simplescheduleai.com/blog/p1</loc></url><url><loc>https://simplescheduleai.com/blog/p2</loc></url><url><loc>https://simplescheduleai.com/articles/a1</loc></url></urlset>`
  );
  return { root, dist };
}

after(() => {
  for (const r of roots) fs.rmSync(r, { recursive: true, force: true });
});

test('healthy site passes', () => {
  const { root, dist } = makeSite();
  assert.equal(smokeRoutes(root, dist).ok, true);
});

test('double-prefix articles fails', () => {
  const { root, dist } = makeSite({ doublePrefix: true });
  const r = smokeRoutes(root, dist);
  assert.equal(r.ok, false);
  assert.ok(r.problems.some((p) => p.includes('articles/articles')));
});

test('missing live post page fails', () => {
  const { root, dist } = makeSite({ missingPost: true });
  const r = smokeRoutes(root, dist);
  assert.ok(r.problems.some((p) => p.includes('blog/p1')));
});

test('escaped-div leakage fails', () => {
  const { root, dist } = makeSite({ leak: true });
  const r = smokeRoutes(root, dist);
  assert.ok(r.problems.some((p) => p.includes('&lt;div')));
});

test('post without draft key is treated as live', () => {
  const { root, dist } = makeSite();
  fs.rmSync(path.join(dist, 'blog', 'p2'), { recursive: true, force: true });
  const r = smokeRoutes(root, dist);
  assert.ok(r.problems.some((p) => p.includes('blog/p2')));
});
