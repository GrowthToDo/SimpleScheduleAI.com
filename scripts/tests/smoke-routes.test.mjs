import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { smokeRoutes, checkRedirects, checkPageMeta, checkRobots } from '../smoke-routes.mjs';

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
  const pageHtml = (slug) =>
    `<html><head><title>T</title><link rel="canonical" href="https://simplescheduleai.com/${slug}"><meta name="description" content="d"></head><body><h1>H</h1></body></html>`;
  for (const k of KEY) fs.mkdirSync(path.join(dist, k), { recursive: true });
  for (const k of KEY) fs.writeFileSync(path.join(dist, k, 'index.html'), pageHtml(k));
  if (!missingPost) {
    fs.mkdirSync(path.join(dist, 'blog', 'p1'), { recursive: true });
    fs.writeFileSync(
      path.join(dist, 'blog', 'p1', 'index.html'),
      leak ? 'x &lt;div class="broken"' : pageHtml('blog/p1')
    );
  }
  fs.mkdirSync(path.join(dist, 'blog', 'p2'), { recursive: true });
  fs.writeFileSync(path.join(dist, 'blog', 'p2', 'index.html'), pageHtml('blog/p2'));
  const artDir = doublePrefix ? path.join(dist, 'articles', 'articles', 'a1') : path.join(dist, 'articles', 'a1');
  fs.mkdirSync(artDir, { recursive: true });
  fs.writeFileSync(path.join(artDir, 'index.html'), pageHtml('articles/a1'));
  fs.writeFileSync(
    path.join(dist, 'sitemap-0.xml'),
    `<urlset><url><loc>https://simplescheduleai.com/blog/p1</loc></url><url><loc>https://simplescheduleai.com/blog/p2</loc></url><url><loc>https://simplescheduleai.com/articles/a1</loc></url></urlset>`
  );
  fs.mkdirSync(path.join(root, 'public'), { recursive: true });
  fs.writeFileSync(path.join(root, 'public', 'robots.txt'), 'User-agent: *\nAllow: /\n');
  fs.writeFileSync(path.join(root, 'netlify.toml'), '');
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

test('redirect to a missing internal target fails', () => {
  const { root, dist } = makeSite();
  fs.writeFileSync(
    path.join(root, 'netlify.toml'),
    `
[[redirects]]
  from = "/old-page"
  to = "/nonexistent-target"
  status = 301
[[redirects]]
  from = "/other"
  to = "/pricing"
  status = 301
`
  );
  const probs = checkRedirects(root, dist);
  assert.ok(probs.some((p) => p.includes('/nonexistent-target')));
  assert.ok(!probs.some((p) => p.includes('/pricing')));
});

test('splat, external, and 404 redirect targets are ignored', () => {
  const { root, dist } = makeSite();
  fs.writeFileSync(
    path.join(root, 'netlify.toml'),
    `
[[redirects]]
  from = "https://www.x.com/*"
  to = "https://x.com/:splat"
  status = 301
[[redirects]]
  from = "/*"
  to = "/404"
  status = 404
`
  );
  assert.equal(checkRedirects(root, dist).length, 0);
});

test('page missing canonical or with two h1 fails meta check', () => {
  const { dist } = makeSite();
  fs.writeFileSync(
    path.join(dist, 'pricing', 'index.html'),
    '<html><head><title>P</title><meta name="description" content="d"></head><body><h1>A</h1><h1>B</h1></body></html>'
  );
  const probs = checkPageMeta(dist);
  assert.ok(probs.some((p) => p.includes('pricing') && p.includes('canonical')));
  assert.ok(probs.some((p) => p.includes('pricing') && p.includes('h1')));
});

test('robots blanket disallow fails', () => {
  const { root } = makeSite();
  fs.writeFileSync(path.join(root, 'public', 'robots.txt'), 'User-agent: *\nDisallow: /\n');
  assert.ok(checkRobots(root).length >= 1);
});
