#!/usr/bin/env node
// Diagnostic report from Google Search Console: page movement, lost queries, split
// queries, questions, near-page-one, unserved demand, and target keywords vs the
// ranking page. Rules live in scripts/lib/gsc-diagnose-core.mjs (named constants).
//
//   npm run gsc-diagnose -- --pull [--today YYYY-MM-DD]
//       Pulls page and query,page rows for the current and previous 28-day windows
//       through the local GSC MCP server and saves the four raw files to
//       docs/seo/diagnostics/raw/<today>/ (gitignored) so a run is reproducible.
//
//   npm run gsc-diagnose -- --from <dir> [--today YYYY-MM-DD]
//       Reads page-cur.json, page-prev.json, qp-cur.json, qp-prev.json from <dir>.
//
// Writes docs/seo/diagnostics/<today>.md (committed).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractRows } from './lib/change-log-core.mjs';
import { buildDiagnosis, diagnoseWindows } from './lib/gsc-diagnose-core.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'docs/seo/diagnostics');
const BRANDS = path.join(ROOT, 'docs/seo/brand-terms.json');
const REGISTRY = path.join(ROOT, 'docs/seo/keyword-registry.json');
const FILES = { pageCur: 'page-cur.json', pagePrev: 'page-prev.json', qpCur: 'qp-cur.json', qpPrev: 'qp-prev.json' };
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const args = process.argv.slice(2);
const valueOf = (f) => {
  const i = args.indexOf(f);
  return i >= 0 ? args[i + 1] : null;
};

const todayArg = valueOf('--today');
if (todayArg !== null && !DATE.test(todayArg)) {
  console.error(`--today needs YYYY-MM-DD, got "${todayArg}".`);
  process.exit(2);
}
const today = todayArg ?? new Date().toISOString().slice(0, 10);
const windows = diagnoseWindows(today);
const from = valueOf('--from');
const doPull = args.includes('--pull');

if (!doPull && !from) {
  console.error('Usage: npm run gsc-diagnose -- --pull | --from <dir> [--today YYYY-MM-DD]');
  process.exit(2);
}

const data = {};
if (doPull) {
  const { pullRows } = await import('./lib/gsc-mcp.mjs');
  const rawDir = path.join(OUT_DIR, 'raw', today);
  fs.mkdirSync(rawDir, { recursive: true });
  const jobs = [
    ['pageCur', 'page', windows.cur],
    ['pagePrev', 'page', windows.prev],
    ['qpCur', 'query,page', windows.cur],
    ['qpPrev', 'query,page', windows.prev],
  ];
  try {
    for (const [key, dimensions, w] of jobs) {
      data[key] = await pullRows({ dimensions, start: w.start, end: w.end, rowLimit: 5000 });
      fs.writeFileSync(path.join(rawDir, FILES[key]), JSON.stringify({ rows: data[key] }) + '\n', 'utf8');
    }
  } catch (e) {
    console.error(`Pull failed: ${e.message}`);
    process.exit(1);
  }
} else {
  for (const [key, file] of Object.entries(FILES)) {
    const p = path.resolve(from, file);
    if (!fs.existsSync(p)) {
      console.error(`Missing ${file} in ${from}.`);
      process.exit(2);
    }
    const rows = extractRows(fs.readFileSync(p, 'utf8'));
    if (!rows) {
      console.error(`Could not find a rows array in ${file}.`);
      process.exit(2);
    }
    data[key] = rows;
  }
}

const brands = JSON.parse(fs.readFileSync(BRANDS, 'utf8'));
const registry = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
const pulls = Object.fromEntries(Object.keys(FILES).map((k) => [k, data[k].length]));

const { markdown, counts, sections } = buildDiagnosis({
  today,
  windows,
  pulls,
  pageCur: data.pageCur,
  pagePrev: data.pagePrev,
  qpCur: data.qpCur,
  qpPrev: data.qpPrev,
  brands,
  registry,
});

fs.mkdirSync(OUT_DIR, { recursive: true });
const outFile = path.join(OUT_DIR, `${today}.md`);
fs.writeFileSync(outFile, markdown, 'utf8');

const ctl = sections.a.control;
console.log(
  `Rows: page cur ${pulls.pageCur}, page prev ${pulls.pagePrev}, qp cur ${pulls.qpCur}, qp prev ${pulls.qpPrev}`
);
console.log(`Control: ${ctl ? `${(ctl.impPct * 100).toFixed(1)}% over ${ctl.pages} pages` : 'none'}`);
console.log(
  `Items: a ${counts.a.listed} (worse/mixed ${counts.a.worseMixed}, better ${counts.a.better}, judged ${counts.a.judged}), b ${counts.b}, c ${counts.c}, d ${counts.d}, e ${counts.e}, f ${counts.f}, g ${counts.g} (mismatch ${counts.gMismatch}, not found ${counts.gNotFound})`
);
console.log(`Wrote ${path.relative(ROOT, outFile)}`);
