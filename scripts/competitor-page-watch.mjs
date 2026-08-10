#!/usr/bin/env node
/**
 * competitor-page-watch.mjs — positioning, pricing and messaging radar.
 *
 * The sitemap radar (competitor-sitemap-diff.mjs) only sees URLs appear and
 * disappear. It cannot see a competitor rewrite its H1, change its category
 * label, add an ROI calculator to the nav, or publish a price. That happened:
 * on 2026-08-10 M7 Health had moved its homepage H1 from "nurse scheduling
 * and labor optimization for health systems" to "the AI-powered workforce
 * operations platform for healthcare" with ZERO sitemap movement.
 *
 * This script watches the pages themselves. For each watched URL it extracts
 * the fields that carry positioning — title, meta description, H1, H2 set,
 * CTA labels, any price-shaped string — plus a hash of the visible body text,
 * diffs them against docs/seo/competitor-snapshots/, and logs what moved.
 *
 * Fetch failures are reported, never fatal. Cloudflare-fronted hosts
 * (aladtec.com) and Webflow catch-alls (shiftwizard.com) will report
 * unreachable; that is a known, recorded gap, not a bug.
 *
 * Usage: npm run competitor-watch            (all watched pages)
 *        npm run competitor-watch -- m7      (hosts matching a substring)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SNAP_DIR = join(ROOT, 'docs', 'seo', 'competitor-snapshots');
const WATCHLOG = join(SNAP_DIR, 'WATCHLOG.md');

// Watched pages. Keep in sync with docs/seo/competitor-dossier.md.
// A 404 here is information too: YouShift ships no sitemap and no robots.txt,
// and several vendors have no pricing page at all (every funnel is a demo form).
//
// Priority (founder, 2026-08-10): In-House Health is the competitor to watch —
// they are the most active. They get the deepest page coverage below.
const WATCHLIST = [
  'https://www.inhouse.health/',
  'https://www.inhouse.health/product',
  'https://www.inhouse.health/skilled-nursing',
  'https://www.inhouse.health/about',
  'https://www.inhouse.health/pr-blog',
  'https://www.inhouse.health/case-studies/the-center-at-lowry',
  'https://www.m7health.com/',
  'https://www.m7health.com/platform',
  'https://www.m7health.com/implementation',
  'https://www.m7health.com/who-we-help',
  'https://www.m7health.com/roi-calculator',
  'https://www.m7health.com/blogs/critical-access-hospital-scheduling-software',
  // Pricing sentinels: these 404 today because every funnel is a demo form.
  // The day one of them returns a page, a competitor has published a price.
  'https://www.m7health.com/pricing',
  'https://www.inhouse.health/pricing',
  'https://www.youshift.com/',
  'https://www.qgenda.com/',
  'https://www.nursegrid.com/',
  'https://www.smartlinx.com/',
  'https://www.shiftwizard.com/',
  'https://www.aladtec.com/',
];

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const CTA_RE = /\b(request|book|schedule|get|start|try|see)\b.{0,24}\b(demo|trial|quote|pricing|started|tour)\b/i;
const PRICE_RE =
  /\$\s?\d[\d,]*(?:\.\d{2})?(?:\s*(?:\/|per\s+)\s*(?:user|nurse|employee|provider|clinician|seat|month|mo|year|yr))?/gi;

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml' },
    signal: AbortSignal.timeout(25000),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  if (!/<html/i.test(html)) throw new Error('not an HTML page');
  return html;
}

function strip(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ');
}

function text(fragment) {
  return fragment
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function all(html, re) {
  return [...html.matchAll(re)].map((m) => text(m[1])).filter(Boolean);
}

function extractSignals(html) {
  const clean = strip(html);
  const body = text(clean);
  const h2s = [...new Set(all(clean, /<h2[^>]*>([\s\S]*?)<\/h2>/gi))].slice(0, 30);
  const ctas = [
    ...new Set(
      [...all(clean, /<a[^>]*>([\s\S]*?)<\/a>/gi), ...all(clean, /<button[^>]*>([\s\S]*?)<\/button>/gi)]
        .filter((t) => t.length <= 40 && CTA_RE.test(t))
        .map((t) => t.replace(/\s+/g, ' '))
    ),
  ].slice(0, 12);
  const prices = [...new Set((body.match(PRICE_RE) || []).map((p) => p.replace(/\s+/g, ' ')))].slice(0, 15);
  return {
    title: text((clean.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || ''),
    description: text((clean.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i) || [])[1] || ''),
    h1: all(clean, /<h1[^>]*>([\s\S]*?)<\/h1>/gi)[0] || '',
    h2s,
    ctas,
    prices,
    words: body.split(' ').length,
    bodyHash: createHash('sha256').update(body).digest('hex').slice(0, 12),
  };
}

function slugFor(url) {
  const u = new URL(url);
  const host = u.hostname.replace(/^www\./, '');
  const path =
    u.pathname
      .replace(/\/+$/, '')
      .replace(/^\//, '')
      .replace(/[^a-z0-9]+/gi, '-') || 'home';
  return `${host}__${path}`;
}

function setDiff(before = [], after = []) {
  const b = new Set(before);
  const a = new Set(after);
  return {
    added: after.filter((x) => !b.has(x)),
    removed: before.filter((x) => !a.has(x)),
  };
}

function diffSignals(prev, cur) {
  const changes = [];
  for (const field of ['title', 'description', 'h1']) {
    if ((prev[field] || '') !== (cur[field] || '')) {
      changes.push(`${field}: "${prev[field] || '(none)'}" -> "${cur[field] || '(none)'}"`);
    }
  }
  for (const field of ['h2s', 'ctas', 'prices']) {
    const { added, removed } = setDiff(prev[field], cur[field]);
    if (added.length) changes.push(`${field} added: ${added.map((x) => `"${x}"`).join(', ')}`);
    if (removed.length) changes.push(`${field} removed: ${removed.map((x) => `"${x}"`).join(', ')}`);
  }
  if (!changes.length && prev.bodyHash !== cur.bodyHash) {
    const delta = cur.words - prev.words;
    changes.push(`body text changed with no heading/CTA/price move (${delta >= 0 ? '+' : ''}${delta} words)`);
  }
  return changes;
}

async function run() {
  const filter = process.argv[2]?.toLowerCase();
  mkdirSync(SNAP_DIR, { recursive: true });
  const today = new Date().toISOString().slice(0, 10);
  const logLines = [`\n## ${today}\n`];
  let moved = 0;

  for (const url of WATCHLIST) {
    if (filter && !url.toLowerCase().includes(filter)) continue;
    const slug = slugFor(url);
    process.stdout.write(`${slug}: `);
    let cur;
    try {
      cur = extractSignals(await fetchHtml(url));
    } catch (e) {
      console.log(`unreachable (${e.message})`);
      logLines.push(`- ${slug}: unreachable (${e.message})`);
      continue;
    }
    const p = join(SNAP_DIR, `${slug}.json`);
    if (!existsSync(p)) {
      writeFileSync(p, JSON.stringify({ url, fetchedAt: today, ...cur }, null, 1));
      console.log(`baseline stored (h1: "${cur.h1 || '(none)'}")`);
      logLines.push(`- ${slug}: baseline stored — h1 "${cur.h1 || '(none)'}"`);
      continue;
    }
    const prev = JSON.parse(readFileSync(p, 'utf8'));
    const changes = diffSignals(prev, cur);
    writeFileSync(p, JSON.stringify({ url, fetchedAt: today, ...cur }, null, 1));
    if (!changes.length) {
      console.log(`no change (since ${prev.fetchedAt})`);
      continue;
    }
    moved++;
    console.log(`${changes.length} change(s) since ${prev.fetchedAt}`);
    logLines.push(`- ${slug}: ${changes.length} change(s) since ${prev.fetchedAt}`);
    for (const c of changes) {
      console.log(`  * ${c}`);
      logLines.push(`  - ${c}`);
    }
  }

  if (!existsSync(WATCHLOG)) {
    writeFileSync(
      WATCHLOG,
      '# Competitor page watch log\n\nAppended by `npm run competitor-watch`. Positioning, pricing and CTA moves on watched competitor pages. Feeds the dossier maintenance log and the monthly SEO audit.\n'
    );
  }
  appendFileSync(WATCHLOG, logLines.join('\n') + '\n');
  console.log(`\nLogged to docs/seo/competitor-snapshots/WATCHLOG.md${moved ? ` — ${moved} page(s) moved` : ''}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
