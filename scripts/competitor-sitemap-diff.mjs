#!/usr/bin/env node
/**
 * competitor-sitemap-diff.mjs — monthly competitor content radar.
 *
 * Fetches each competitor's sitemap, diffs against the stored snapshot in
 * docs/seo/sitemap-snapshots/<host>.json, prints new/removed URLs, updates
 * the snapshot, and appends a dated summary to
 * docs/seo/sitemap-snapshots/DIFFLOG.md.
 *
 * First run per host stores a baseline (no diff). Fetch failures are
 * reported, never fatal: some competitors bot-block; their row just reads
 * "unreachable" for the month.
 *
 * Usage: npm run sitemap-diff            (all competitors)
 *        npm run sitemap-diff -- qgenda  (hosts matching a substring)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SNAP_DIR = join(ROOT, 'docs', 'seo', 'sitemap-snapshots');
const DIFFLOG = join(SNAP_DIR, 'DIFFLOG.md');

// Competitor sitemap entry points. Keep in sync with docs/seo/competitor-dossier.md.
const COMPETITORS = [
  'https://www.m7health.com/sitemap.xml',
  'https://www.youshift.com/sitemap.xml',
  'https://www.qgenda.com/sitemap.xml',
  'https://www.aladtec.com/sitemap.xml',
  'https://www.smartlinx.com/sitemap.xml',
  'https://www.onshift.com/sitemap.xml',
  'https://www.shiftwizard.com/sitemap.xml',
  'https://www.nursegrid.com/sitemap.xml',
];

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const MAX_CHILD_SITEMAPS = 4;
const MAX_URLS_PER_HOST = 5000;

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'user-agent': UA, accept: 'application/xml,text/xml,*/*' },
    signal: AbortSignal.timeout(20000),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1].trim());
}

async function collectUrls(sitemapUrl) {
  const xml = await fetchText(sitemapUrl);
  // Some hosts serve an HTML catch-all page at /sitemap.xml (e.g. shiftwizard.com,
  // a Webflow page on the HealthStream domain). Treat non-XML as unreachable.
  if (!/<urlset|<sitemapindex/i.test(xml)) throw new Error('not an XML sitemap');
  const locs = extractLocs(xml);
  // Sitemap index: child <loc>s point at further .xml sitemaps.
  const isIndex = /<sitemapindex/i.test(xml);
  if (!isIndex) return locs.slice(0, MAX_URLS_PER_HOST);
  const urls = [];
  for (const child of locs.slice(0, MAX_CHILD_SITEMAPS)) {
    try {
      const childXml = await fetchText(child);
      urls.push(...extractLocs(childXml));
    } catch (e) {
      console.warn(`  child sitemap failed: ${child} (${e.message})`);
    }
    if (urls.length >= MAX_URLS_PER_HOST) break;
  }
  return urls.slice(0, MAX_URLS_PER_HOST);
}

function snapPath(host) {
  return join(SNAP_DIR, `${host}.json`);
}

async function run() {
  const filter = process.argv[2]?.toLowerCase();
  mkdirSync(SNAP_DIR, { recursive: true });
  const today = new Date().toISOString().slice(0, 10);
  const logLines = [`\n## ${today}\n`];
  let anyDiff = false;

  for (const entry of COMPETITORS) {
    const host = new URL(entry).hostname.replace(/^www\./, '');
    if (filter && !host.includes(filter)) continue;
    process.stdout.write(`${host}: `);
    let urls;
    try {
      urls = [...new Set(await collectUrls(entry))].sort();
    } catch (e) {
      console.log(`unreachable (${e.message})`);
      logLines.push(`- ${host}: unreachable (${e.message})`);
      continue;
    }
    const p = snapPath(host);
    if (!existsSync(p)) {
      writeFileSync(p, JSON.stringify({ fetchedAt: today, urls }, null, 1));
      console.log(`baseline stored (${urls.length} URLs)`);
      logLines.push(`- ${host}: baseline stored (${urls.length} URLs)`);
      continue;
    }
    const prev = JSON.parse(readFileSync(p, 'utf8'));
    const prevSet = new Set(prev.urls);
    const curSet = new Set(urls);
    const added = urls.filter((u) => !prevSet.has(u));
    const removed = prev.urls.filter((u) => !curSet.has(u));
    writeFileSync(p, JSON.stringify({ fetchedAt: today, urls }, null, 1));
    console.log(`${added.length} new, ${removed.length} removed (since ${prev.fetchedAt})`);
    logLines.push(`- ${host}: +${added.length} / -${removed.length} since ${prev.fetchedAt}`);
    if (added.length) {
      anyDiff = true;
      for (const u of added.slice(0, 40)) {
        console.log(`  + ${u}`);
        logLines.push(`  - NEW: ${u}`);
      }
      if (added.length > 40) logLines.push(`  - ...and ${added.length - 40} more`);
    }
  }

  if (!existsSync(DIFFLOG)) {
    writeFileSync(
      DIFFLOG,
      '# Competitor sitemap diff log\n\nAppended by `npm run sitemap-diff`. New competitor URLs feed the trendjacking radar and the dossier maintenance log.\n'
    );
  }
  appendFileSync(DIFFLOG, logLines.join('\n') + '\n');
  console.log(`\nLogged to docs/seo/sitemap-snapshots/DIFFLOG.md${anyDiff ? ' — review new URLs above' : ''}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
