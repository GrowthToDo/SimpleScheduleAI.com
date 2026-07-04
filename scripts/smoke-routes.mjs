#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listPosts } from './lib/publish-shared.mjs';

const KEY_ROUTES = [
  '',
  'how-it-works',
  'pricing',
  'nurse-scheduling-software',
  'critical-access-hospital-scheduling',
  'ai-nurse-scheduling',
  'articles',
];

export function smokeRoutes(root = process.cwd(), dist = path.join(root, 'dist')) {
  const problems = [];
  const live = listPosts(root).filter((p) => p.data.draft === false);

  for (const p of live) {
    const base = p.collection === 'article' ? 'articles' : 'blog';
    const page = path.join(dist, base, p.slug, 'index.html');
    if (!fs.existsSync(page)) problems.push(`missing page: ${base}/${p.slug}/index.html`);
  }

  for (const dbl of [path.join(dist, 'blog', 'blog'), path.join(dist, 'articles', 'articles')]) {
    if (fs.existsSync(dbl))
      problems.push(`double-prefix directory exists: ${path.relative(dist, dbl).replace(/\\/g, '/')}`);
  }

  const sitemapText = fs
    .readdirSync(dist)
    .filter((f) => /^sitemap.*\.xml$/.test(f))
    .map((f) => fs.readFileSync(path.join(dist, f), 'utf8'))
    .join('\n');
  for (const p of live) {
    const base = p.collection === 'article' ? 'articles' : 'blog';
    const url = `https://simplescheduleai.com/${base}/${p.slug}`;
    const n = (sitemapText.match(new RegExp(`<loc>${url}</loc>`, 'g')) || []).length;
    if (n !== 1) problems.push(`sitemap has ${n} entries for ${url} (want 1)`);
  }

  for (const p of live) {
    const base = p.collection === 'article' ? 'articles' : 'blog';
    const page = path.join(dist, base, p.slug, 'index.html');
    if (fs.existsSync(page) && fs.readFileSync(page, 'utf8').includes('&lt;div')) {
      problems.push(`escaped &lt;div leakage in ${base}/${p.slug}`);
    }
  }

  for (const r of KEY_ROUTES) {
    if (!fs.existsSync(path.join(dist, r, 'index.html'))) problems.push(`missing key route: /${r}`);
  }

  return { ok: problems.length === 0, problems };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const { ok, problems } = smokeRoutes();
  for (const p of problems) console.log(`SMOKE FAIL: ${p}`);
  console.log(ok ? 'smoke-routes: all pass' : `smoke-routes: ${problems.length} problem(s)`);
  process.exit(ok ? 0 : 1);
}
