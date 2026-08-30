#!/usr/bin/env node
// Target-keyword position tracker.
//
// WHY THIS EXISTS (2026-08-30): the founder asked why site-wide average
// position went 12.7 -> 13.2 in a week. It had not got worse. Impressions rose
// 27% and clicks 58% in the same window; average position is impression-
// weighted, so every new deep-ranking query Google finds for us drags the mean
// down. One page (best-nurse-scheduling-software-critical-access-hospitals)
// fell 20 -> 44.9 purely because Google started matching it to a brand-new
// "clinical ladder software" cluster at positions 35-61, which is nursing
// career progression, not scheduling.
//
// While we publish weekly, site-wide average position will keep drifting worse
// FOR GOOD REASONS. It cannot answer "are our targets moving?". This does: it
// tracks position for the primary keywords in keyword-registry.json and
// nothing else, so the number only moves when something we actually target
// moves.
//
// GSC is reachable only through the MCP server, not from node, so this script
// does not fetch. It takes the pull as input.
//
// USAGE
//   npm run target-positions -- --keywords
//       Print the exact keyword list to pull from GSC.
//
//   npm run target-positions -- --record <rows.json> [--label 2026-09-01]
//       Ingest a GSC `query`-dimension pull (the `rows` array, or the whole
//       tool response) and append a snapshot to docs/seo/target-positions.jsonl.
//
//   npm run target-positions
//       Report the newest snapshot against the previous one.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REGISTRY = path.join(ROOT, 'docs/seo/keyword-registry.json');
const HISTORY = path.join(ROOT, 'docs/seo/target-positions.jsonl');

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const valueOf = (f) => {
  const i = args.indexOf(f);
  return i >= 0 ? args[i + 1] : null;
};

const registry = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
const targets = registry
  .filter((e) => e.primaryKeyword)
  .map((e) => ({ keyword: e.primaryKeyword.toLowerCase().trim(), url: e.url, slug: e.slug }));

if (has('--keywords')) {
  console.log(`${targets.length} target keywords from keyword-registry.json:\n`);
  for (const t of targets) console.log(`  ${t.keyword}`);
  console.log(
    `\nPull GSC with dimensions=query for the period, row_limit 500, then:\n  npm run target-positions -- --record <rows.json>`
  );
  process.exit(0);
}

function readSnapshots() {
  if (!fs.existsSync(HISTORY)) return [];
  return fs
    .readFileSync(HISTORY, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

if (has('--record')) {
  const src = valueOf('--record');
  if (!src) {
    console.error('--record needs a path to a JSON file containing the GSC rows.');
    process.exit(2);
  }
  let raw = JSON.parse(fs.readFileSync(path.resolve(src), 'utf8'));
  // Accept the whole MCP response, a {rows:[...]} object, or a bare array.
  if (typeof raw === 'string') raw = JSON.parse(raw);
  if (raw.result && typeof raw.result === 'string') raw = JSON.parse(raw.result);
  const rows = Array.isArray(raw) ? raw : raw.rows;
  if (!Array.isArray(rows)) {
    console.error('Could not find a rows array in that file.');
    process.exit(2);
  }

  const byQuery = new Map();
  for (const r of rows) {
    const q = (r.query || r.keys?.[0] || '').toLowerCase().trim();
    if (q) byQuery.set(q, r);
  }

  const label = valueOf('--label') || new Date().toISOString().slice(0, 10);
  const measured = [];
  for (const t of targets) {
    const hit = byQuery.get(t.keyword);
    if (hit) {
      measured.push({
        keyword: t.keyword,
        slug: t.slug,
        position: Number(hit.position.toFixed(1)),
        impressions: hit.impressions,
        clicks: hit.clicks,
      });
    }
  }

  const snapshot = {
    label,
    recorded: label,
    targetsTotal: targets.length,
    targetsWithData: measured.length,
    rows: measured,
  };
  fs.appendFileSync(HISTORY, JSON.stringify(snapshot) + '\n', 'utf8');
  console.log(`Recorded snapshot "${label}": ${measured.length} of ${targets.length} target keywords had GSC data.`);
  console.log(`Appended to ${path.relative(ROOT, HISTORY)}`);
  process.exit(0);
}

// Default: report newest vs previous.
const snaps = readSnapshots();
if (snaps.length === 0) {
  console.log('No snapshots yet. Run with --keywords, pull GSC, then --record <rows.json>.');
  process.exit(0);
}
const latest = snaps[snaps.length - 1];
const prev = snaps.length > 1 ? snaps[snaps.length - 2] : null;

console.log(`Target-keyword positions — ${latest.label}`);
console.log(`${latest.targetsWithData} of ${latest.targetsTotal} target keywords have GSC data.\n`);

if (!prev) {
  for (const r of [...latest.rows].sort((a, b) => a.position - b.position)) {
    console.log(`  ${String(r.position).padStart(5)}  ${r.keyword}  (${r.impressions} impr)`);
  }
  console.log('\nBaseline snapshot. Movement appears from the next recording onward.');
  process.exit(0);
}

const prevBy = new Map(prev.rows.map((r) => [r.keyword, r]));
const improved = [];
const worsened = [];
const entered = [];
const flat = [];

for (const r of latest.rows) {
  const p = prevBy.get(r.keyword);
  if (!p) {
    entered.push(r);
    continue;
  }
  const delta = Number((p.position - r.position).toFixed(1)); // positive = improved
  const row = { ...r, prev: p.position, delta };
  if (delta >= 1) improved.push(row);
  else if (delta <= -1) worsened.push(row);
  else flat.push(row);
}
const exited = prev.rows.filter((r) => !latest.rows.some((l) => l.keyword === r.keyword));

const line = (r) =>
  `  ${String(r.prev).padStart(5)} -> ${String(r.position).padStart(5)}  (${r.delta > 0 ? '+' : ''}${r.delta})  ${r.keyword}`;

console.log(`vs ${prev.label}\n`);
if (improved.length) {
  console.log(`IMPROVED (${improved.length})`);
  improved.sort((a, b) => b.delta - a.delta).forEach((r) => console.log(line(r)));
  console.log('');
}
if (worsened.length) {
  console.log(`WORSENED (${worsened.length})`);
  worsened.sort((a, b) => a.delta - b.delta).forEach((r) => console.log(line(r)));
  console.log('');
}
if (entered.length) {
  console.log(`NEWLY RANKING (${entered.length})`);
  entered.forEach((r) => console.log(`  ${String(r.position).padStart(5)}  ${r.keyword}`));
  console.log('');
}
if (exited.length) {
  console.log(`NO LONGER RETURNED (${exited.length}) — dropped out of the pull, not necessarily deranked`);
  exited.forEach((r) => console.log(`  was ${r.position}  ${r.keyword}`));
  console.log('');
}
console.log(`Unchanged within 1 position: ${flat.length}`);

const avgNow = latest.rows.reduce((s, r) => s + r.position, 0) / (latest.rows.length || 1);
const shared = latest.rows.filter((r) => prevBy.has(r.keyword));
const avgSharedNow = shared.reduce((s, r) => s + r.position, 0) / (shared.length || 1);
const avgSharedPrev = shared.reduce((s, r) => s + prevBy.get(r.keyword).position, 0) / (shared.length || 1);
console.log(`\nMean position across all target keywords: ${avgNow.toFixed(1)}`);
console.log(
  `Mean across the ${shared.length} present in BOTH snapshots: ${avgSharedPrev.toFixed(1)} -> ${avgSharedNow.toFixed(1)}`
);
console.log(
  `\nThe like-for-like figure is the one to read. A same-keyword-set mean cannot be\ndiluted by Google finding new queries for us, which is what moves the site-wide\naverage in GSC.`
);
