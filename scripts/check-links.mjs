#!/usr/bin/env node
/**
 * Advisory external-link checker for blog posts. NETWORK — run before publish.
 *
 * The offline check-blog gate cannot verify that a source URL actually resolves,
 * so a dead citation (e.g. a moved CMS PDF) can ship undetected. This script
 * fetches every http(s) URL in a post and reports any that do not resolve.
 *
 * Usage:
 *   node scripts/check-links.mjs src/data/post/<slug>.md
 *   node scripts/check-links.mjs -- --live      every draft:false post
 *   node scripts/check-links.mjs -- --all       every post
 *
 * Exit code is 1 if any hard-broken link (4xx other than 403/429) is found.
 * 403/429/timeouts are reported but NOT counted as broken — those are usually
 * bot-blocks or rate limits on a live page, not a dead link. Verify by hand.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = resolve(__dirname, '../src/data/post');

function collectFiles(args) {
  const flags = new Set(args.filter((a) => a.startsWith('--')));
  const paths = args.filter((a) => !a.startsWith('--'));
  if (flags.has('--all') || flags.has('--live')) {
    const all = readdirSync(POSTS_DIR)
      .filter((f) => f.endsWith('.md'))
      .map((f) => resolve(POSTS_DIR, f));
    return flags.has('--live') ? all.filter((p) => !readFileSync(p, 'utf8').includes('draft: true')) : all;
  }
  if (paths.length === 0) {
    console.error('Usage: node scripts/check-links.mjs <file.md> | -- --live | -- --all');
    process.exit(2);
  }
  return paths.map((p) => resolve(p));
}

function extractUrls(text) {
  const urls = new Set();
  const re = /https?:\/\/[^\s)\]"'<>]+/g;
  let m;
  while ((m = re.exec(text))) {
    urls.add(m[0].replace(/[.,;]+$/, ''));
  }
  return [...urls];
}

async function statusOf(url) {
  const headers = { 'User-Agent': 'Mozilla/5.0 (SimpleScheduleAI link-check)' };
  try {
    let res = await fetch(url, { method: 'HEAD', redirect: 'follow', headers, signal: AbortSignal.timeout(20000) });
    // Some servers reject HEAD with 405/403/501 — retry GET before judging.
    if ([403, 405, 501].includes(res.status)) {
      res = await fetch(url, { method: 'GET', redirect: 'follow', headers, signal: AbortSignal.timeout(25000) });
    }
    return res.status;
  } catch (e) {
    return e.name === 'TimeoutError' ? 'TIMEOUT' : 'ERROR';
  }
}

const isOk = (s) => typeof s === 'number' && s >= 200 && s < 400;
// A "hard broken" link is a 4xx that is not a bot-block (403) or rate-limit (429).
const isHardBroken = (s) => typeof s === 'number' && s >= 400 && s < 500 && s !== 403 && s !== 429;

const files = collectFiles(process.argv.slice(2));
let hardBroken = 0;

for (const file of files) {
  const urls = extractUrls(readFileSync(file, 'utf8'));
  const results = await Promise.all(urls.map(async (u) => [u, await statusOf(u)]));
  const bad = results.filter(([, s]) => !isOk(s));
  if (bad.length === 0) {
    console.log(`✓ ${basename(file)} (${urls.length} links ok)`);
    continue;
  }
  console.log(`✗ ${basename(file)}`);
  for (const [u, s] of bad) {
    const tag = isHardBroken(s) ? 'BROKEN' : 'check';
    console.log(`  [${tag}] ${s}  ${u}`);
    if (isHardBroken(s)) hardBroken++;
  }
}

console.log(
  `\n${hardBroken} hard-broken link(s) (4xx excl. 403/429). 403/429/TIMEOUT shown as "check" — verify by hand.`
);
process.exit(hardBroken > 0 ? 1 : 0);
