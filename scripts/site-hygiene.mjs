#!/usr/bin/env node
/**
 * Site-wide hygiene audit for the built static site. OFFLINE — reads dist/ only,
 * no network calls. Run `npm run build` first (or reuse an existing dist/).
 *
 * Crawls every dist/**\/index.html (and dist/*.html), extracts <title>, meta
 * description, canonical, robots, and internal links, then reports:
 *
 *   FAIL (exit 1):
 *     - broken internal link (href has no matching file in dist/)
 *     - duplicate <title> across two+ pages
 *     - missing or empty <title> or meta description
 *
 *   WARN (exit 0, informational):
 *     - duplicate meta description across two+ pages
 *     - orphan page (indexable, zero inbound internal links)
 *     - unlisted (noindex) page with zero inbound internal links — likely intentional
 *     - title > 60 chars / description > 160 chars (count + 5 worst examples)
 *
 * Usage: npm run site-hygiene
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = resolve(__dirname, '../dist');

// ---------------------------------------------------------------------------
// dist/ crawl
// ---------------------------------------------------------------------------

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

function toRoute(distPath) {
  // dist/foo/index.html -> /foo ; dist/foo.html -> /foo ; dist/index.html -> /
  let rel = '/' + distPath.slice(DIST_DIR.length + 1).replace(/\\/g, '/');
  if (rel.endsWith('/index.html')) {
    rel = rel.slice(0, -'index.html'.length);
    if (rel.length > 1 && rel.endsWith('/')) rel = rel.slice(0, -1);
    if (rel === '') rel = '/';
  } else if (rel.endsWith('.html')) {
    rel = rel.slice(0, -'.html'.length);
  }
  return rel;
}

const allFiles = walk(DIST_DIR);
const htmlFiles = allFiles.filter((f) => extname(f) === '.html');

// ---------------------------------------------------------------------------
// Per-page extraction
// ---------------------------------------------------------------------------

function extractTag(html, re) {
  const m = re.exec(html);
  return m ? m[0] : null;
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'");
}

function extractAttr(tagHtml, attr) {
  const re = new RegExp(`${attr}\\s*=\\s*"([^"]*)"`, 'i');
  const m = re.exec(tagHtml);
  return m ? m[1] : null;
}

function findMetaContent(html, nameOrProperty, value) {
  // Meta tags can have attributes in either order: content="x" name="y" or name="y" content="x".
  const re = new RegExp(`<meta\\s+[^>]*${nameOrProperty}\\s*=\\s*"${value}"[^>]*>`, 'i');
  const tag = extractTag(html, re);
  return tag ? extractAttr(tag, 'content') : null;
}

function findCanonical(html) {
  const re = /<link\s+[^>]*rel\s*=\s*"canonical"[^>]*>/i;
  const tag = extractTag(html, re);
  return tag ? extractAttr(tag, 'href') : null;
}

function findRobots(html) {
  return findMetaContent(html, 'name', 'robots');
}

function findTitle(html) {
  const m = /<title>([\s\S]*?)<\/title>/i.exec(html);
  return m ? decodeEntities(m[1].trim()) : null;
}

function findDescription(html) {
  const d = findMetaContent(html, 'name', 'description');
  return d !== null ? decodeEntities(d.trim()) : null;
}

function extractInternalLinks(html) {
  const links = new Set();
  const re = /\shref\s*=\s*"([^"]+)"/gi;
  let m;
  while ((m = re.exec(html))) {
    let href = m[1];
    if (!href.startsWith('/')) continue; // ignore mailto:, tel:, http(s) externals, relative, #anchors-only
    if (href.startsWith('//')) continue; // protocol-relative external
    href = href.split('#')[0].split('?')[0];
    if (href === '') continue;
    links.add(href);
  }
  return [...links];
}

// Asset prefixes/extensions that are checked for existence directly (not treated as pages).
const ASSET_PREFIXES = ['/_astro/', '/images/', '/videos/', '/favicons/'];
const ASSET_EXTENSIONS = new Set([
  '.xml',
  '.txt',
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.gif',
  '.webp',
  '.ico',
  '.pdf',
  '.webmanifest',
  '.css',
  '.js',
  '.json',
]);

function isAssetHref(href) {
  if (ASSET_PREFIXES.some((p) => href.startsWith(p))) return true;
  const ext = extname(href.split('/').pop() || '');
  return ASSET_EXTENSIONS.has(ext);
}

function assetExists(href) {
  const full = join(DIST_DIR, href.slice(1));
  return existsSync(full) && statSync(full).isFile();
}

// Build the set of valid page routes (normalizing trailing slash).
const pages = [];
for (const file of htmlFiles) {
  const route = toRoute(file);
  const html = readFileSync(file, 'utf8');
  pages.push({
    file,
    route,
    html,
    title: findTitle(html),
    description: findDescription(html),
    canonical: findCanonical(html),
    robots: findRobots(html),
    links: extractInternalLinks(html),
  });
}

function normalizeRoute(route) {
  if (route.length > 1 && route.endsWith('/')) return route.slice(0, -1);
  return route === '' ? '/' : route;
}

const validRoutes = new Set(pages.map((p) => normalizeRoute(p.route)));

function pageHrefResolves(href) {
  const norm = normalizeRoute(href);
  return validRoutes.has(norm);
}

// ---------------------------------------------------------------------------
// Findings
// ---------------------------------------------------------------------------

const fails = { brokenLinks: [], duplicateTitles: [], missingMeta: [] };
const info = { noindexMeta: [] };
const warns = {
  duplicateDescriptions: [],
  orphans: [],
  unlistedNoInbound: [],
  longTitles: [],
  longDescriptions: [],
};

// --- broken internal links ---
for (const page of pages) {
  for (const href of page.links) {
    let ok;
    if (isAssetHref(href)) {
      ok = assetExists(href);
    } else {
      ok = pageHrefResolves(href);
    }
    if (!ok) {
      fails.brokenLinks.push({ from: page.route, href });
    }
  }
}

// noindex pages are invisible to search: their title/description issues are
// cosmetic, not SEO defects. Bucket them as info instead of FAILs.
const isNoindexPage = (page) => page.robots && /noindex/i.test(page.robots);

// --- missing/empty title or description ---
for (const page of pages) {
  const problems = [];
  if (!page.title || page.title.length === 0) problems.push('missing/empty <title>');
  if (page.description === null || page.description.length === 0) problems.push('missing/empty meta description');
  if (!problems.length) continue;
  if (isNoindexPage(page)) info.noindexMeta.push({ route: page.route, problems });
  else fails.missingMeta.push({ route: page.route, problems });
}

// --- duplicate titles ---
{
  const byTitle = new Map();
  for (const page of pages) {
    if (!page.title || isNoindexPage(page)) continue;
    if (!byTitle.has(page.title)) byTitle.set(page.title, []);
    byTitle.get(page.title).push(page.route);
  }
  for (const [title, routes] of byTitle) {
    if (routes.length > 1) fails.duplicateTitles.push({ title, routes });
  }
}

// --- duplicate descriptions ---
{
  const byDesc = new Map();
  for (const page of pages) {
    if (!page.description) continue;
    if (!byDesc.has(page.description)) byDesc.set(page.description, []);
    byDesc.get(page.description).push(page.route);
  }
  for (const [description, routes] of byDesc) {
    if (routes.length > 1) warns.duplicateDescriptions.push({ description, routes });
  }
}

// --- title / description length ---
{
  const titleOffenders = pages
    .filter((p) => p.title && p.title.length > 60)
    .map((p) => ({ route: p.route, length: p.title.length, value: p.title }))
    .sort((a, b) => b.length - a.length);
  const descOffenders = pages
    .filter((p) => p.description && p.description.length > 160)
    .map((p) => ({ route: p.route, length: p.description.length, value: p.description }))
    .sort((a, b) => b.length - a.length);
  warns.longTitles = titleOffenders;
  warns.longDescriptions = descOffenders;
}

// --- orphan pages / unlisted-noindex pages with no inbound links ---
{
  // Count inbound links per route from every page (including self, filtered out at check time).
  const inbound = new Map();
  for (const page of pages) {
    for (const href of page.links) {
      if (isAssetHref(href)) continue;
      const norm = normalizeRoute(href);
      if (!validRoutes.has(norm)) continue;
      if (!inbound.has(norm)) inbound.set(norm, new Set());
      inbound.get(norm).add(page.route);
    }
  }

  const isPaginatedArchive = (route) => /\/\d+$/.test(route);

  for (const page of pages) {
    const route = normalizeRoute(page.route);
    if (route === '/') continue; // homepage
    if (route === '/404') continue; // 404 page
    if (isPaginatedArchive(route)) continue; // paginated archive pages (e.g. /blog/2, /category/x/2)

    const inboundSet = inbound.get(route) || new Set();
    const hasInbound = [...inboundSet].some((from) => normalizeRoute(from) !== route);
    if (hasInbound) continue;

    const isNoindex = page.robots && /noindex/i.test(page.robots);
    if (isNoindex) {
      warns.unlistedNoInbound.push(route);
    } else {
      warns.orphans.push(route);
    }
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const line = (s = '') => console.log(s);

line('='.repeat(72));
line('SITE HYGIENE AUDIT');
line('='.repeat(72));
line(`Pages scanned: ${pages.length}`);
line();

line('--- SUMMARY ---');
line(`FAIL: broken internal links       ${fails.brokenLinks.length}`);
line(`FAIL: duplicate titles            ${fails.duplicateTitles.length} title(s) shared`);
line(`FAIL: missing/empty title or desc ${fails.missingMeta.length} page(s)`);
line(`WARN: duplicate descriptions      ${warns.duplicateDescriptions.length} description(s) shared`);
line(`WARN: orphan pages                ${warns.orphans.length}`);
line(`WARN: unlisted (noindex) orphans  ${warns.unlistedNoInbound.length}`);
line(`WARN: titles > 60 chars           ${warns.longTitles.length}`);
line(`WARN: descriptions > 160 chars    ${warns.longDescriptions.length}`);
line(`INFO: noindex pages w/ meta gaps  ${info.noindexMeta.length} (cosmetic, not SEO)`);
line();

if (info.noindexMeta.length) {
  line('--- INFO: noindex pages with title/description gaps (cosmetic) ---');
  for (const { route, problems } of info.noindexMeta) line(`  ${route}: ${problems.join(', ')}`);
  line();
}

if (fails.brokenLinks.length) {
  line('--- FAIL: broken internal links ---');
  for (const { from, href } of fails.brokenLinks) {
    line(`  ${from}  ->  ${href}`);
  }
  line();
}

if (fails.duplicateTitles.length) {
  line('--- FAIL: duplicate <title> ---');
  for (const { title, routes } of fails.duplicateTitles) {
    line(`  "${title}"`);
    for (const r of routes) line(`    - ${r}`);
  }
  line();
}

if (fails.missingMeta.length) {
  line('--- FAIL: missing/empty title or description ---');
  for (const { route, problems } of fails.missingMeta) {
    line(`  ${route}: ${problems.join(', ')}`);
  }
  line();
}

if (warns.duplicateDescriptions.length) {
  line('--- WARN: duplicate meta description ---');
  for (const { description, routes } of warns.duplicateDescriptions) {
    line(`  "${description.slice(0, 90)}${description.length > 90 ? '...' : ''}"`);
    for (const r of routes) line(`    - ${r}`);
  }
  line();
}

if (warns.orphans.length) {
  line('--- WARN: orphan pages (indexable, zero inbound internal links) ---');
  for (const r of warns.orphans) line(`  ${r}`);
  line();
}

if (warns.unlistedNoInbound.length) {
  line('--- WARN: unlisted (noindex) pages with no inbound links — likely intentional ---');
  for (const r of warns.unlistedNoInbound) line(`  ${r}`);
  line();
}

if (warns.longTitles.length) {
  line(`--- WARN: titles > 60 chars (${warns.longTitles.length} total, showing 5 worst) ---`);
  for (const { route, length, value } of warns.longTitles.slice(0, 5)) {
    line(`  [${length}] ${route}: "${value}"`);
  }
  line();
}

if (warns.longDescriptions.length) {
  line(`--- WARN: descriptions > 160 chars (${warns.longDescriptions.length} total, showing 5 worst) ---`);
  for (const { route, length, value } of warns.longDescriptions.slice(0, 5)) {
    line(`  [${length}] ${route}: "${value.slice(0, 100)}${value.length > 100 ? '...' : ''}"`);
  }
  line();
}

const failCount = fails.brokenLinks.length + fails.duplicateTitles.length + fails.missingMeta.length;
line('='.repeat(72));
line(failCount > 0 ? `RESULT: FAIL (${failCount} failing check group(s))` : 'RESULT: PASS');
line('='.repeat(72));

process.exit(failCount > 0 ? 1 : 0);
