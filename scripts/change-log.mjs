#!/usr/bin/env node
// Content change log with 28-day judging.
//
// WHY THIS EXISTS (2026-10-30): we edit live posts and articles constantly
// (re-timings, rewrites, fixes) and never learn which edits helped. Without a
// record of WHAT changed WHEN, a ranking move can only be explained by a story
// built from partial data. This derives the change record from git (the only
// source that cannot be forgotten), waits 28 days plus the 2-day GSC lag, then
// compares the page's GSC performance in the 28 days before the change against
// the 28 days after, and writes a verdict you can audit. The change day itself
// is excluded from both windows.
//
// Verdicts are signals, not proof: an overlapping edit to the same slug inside
// the window is flagged, and pages with under 10 clicks either side are flagged
// clicksTooSmall because CTR on a handful of clicks is noise.
//
// GSC is reachable only through the local MCP server. `due` prints the pulls each
// date needs; `judge` takes them as input (--from, --daily) or fetches them itself
// through scripts/lib/gsc-mcp.mjs (--pull).
//
// WHAT COUNTS AS A CHANGE: a commit touching src/data/post/*.md|mdx or
// src/data/article/*.md (added or modified, renames use the new path), where the
// file at that commit is live (draft: false or no draft key). kind is 'publish'
// when the file did not exist in the parent commit or the parent had draft: true,
// else 'edit'. Same slug + same date collapses to one entry. Free-text notes in
// docs/seo/change-log-notes.jsonl attach to the matching slug+date, or become a
// 'manual' entry:
//   {"date":"YYYY-MM-DD","slug":"...","text":"...","source":"manual"}
//
// USAGE
//   npm run change-log [-- --since YYYY-MM-DD]
//       List changes (default: last 90 days).
//
//   npm run change-log -- due [--today YYYY-MM-DD] [--json out.json]
//       Edit/manual entries old enough to judge (changeDate + 28 + 2 days) and
//       not yet in docs/seo/change-log-verdicts.jsonl, grouped by change date,
//       with the two GSC pulls each date needs.
//
//   npm run change-log -- judge --from pulls.json [--today YYYY-MM-DD]
//       pulls.json = {windows:[{changeDate, before, after}]}; before/after are
//       the GSC page-dimension rows (whole MCP response, {rows:[...]}, or a bare
//       array). Appends one verdict per due entry to change-log-verdicts.jsonl.
//
//   npm run change-log -- judge --pull [--dry-run] [--since YYYY-MM-DD]
//       Pulls the before and after windows (page dimension, rowLimit 1000, final)
//       for each due change date itself, then judges exactly as --from does.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { pullRows } from './lib/gsc-mcp.mjs';
import {
  SITE,
  addDays,
  aggregate,
  attachNotes,
  classify,
  collapse,
  controlFor,
  dailySpan,
  detectKind,
  dueEntries,
  extractRows,
  flagOverlaps,
  groupByDate,
  isLive,
  metricsFor,
  parseGitLog,
  rowsForWindow,
  slugOf,
  urlOf,
  windowsFor,
  WINDOW_DAYS,
} from './lib/change-log-core.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const VERDICTS = path.join(ROOT, 'docs/seo/change-log-verdicts.jsonl');
const JUDGING_STARTED = '2026-10-01';
const NOTES = path.join(ROOT, 'docs/seo/change-log-notes.jsonl');

const args = process.argv.slice(2);
const valueOf = (f) => {
  const i = args.indexOf(f);
  return i >= 0 ? args[i + 1] : null;
};
const command = args[0] && !args[0].startsWith('--') ? args[0] : 'list';
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function dateArg(flag, fallback) {
  const v = valueOf(flag);
  if (v === null) return fallback;
  if (!DATE.test(v)) {
    console.error(`${flag} needs YYYY-MM-DD, got "${v}".`);
    process.exit(2);
  }
  return v;
}

const today = dateArg('--today', new Date().toISOString().slice(0, 10));

function readJsonl(file) {
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, 'utf8')
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l));
}

function git(gitArgs) {
  return execFileSync('git', gitArgs, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
}

// File text at a commit, or null when it does not exist there.
function showAt(rev, file) {
  try {
    return git(['show', `${rev}:${file}`]);
  } catch {
    return null;
  }
}

function resolveUrl(slug) {
  for (const p of [`src/data/post/${slug}.mdx`, `src/data/post/${slug}.md`, `src/data/article/${slug}.md`]) {
    if (fs.existsSync(path.join(ROOT, p))) return urlOf(p);
  }
  return null;
}

// Entries since `since`. History is read 28 days earlier so overlap flags near the
// start of the range see the edits before it; those earlier entries are dropped.
function loadEntries(since) {
  const lookback = addDays(since, -WINDOW_DAYS);
  const log = git([
    'log',
    `--since=${lookback}`,
    '--no-merges',
    '--date=short',
    '--format=@@%H%x09%ad%x09%s',
    '--name-status',
    '--',
    'src/data/post',
    'src/data/article',
  ]);
  const candidates = [];
  for (const c of parseGitLog(log)) {
    for (const f of c.files) {
      const text = showAt(c.hash, f.path);
      if (text === null || !isLive(text)) continue;
      const parent = showAt(`${c.hash}^`, f.oldPath);
      candidates.push({
        date: c.date,
        slug: slugOf(f.path),
        url: urlOf(f.path),
        kind: detectKind({ existsInParent: parent !== null, parentDraft: parent !== null && !isLive(parent) }),
        hash: c.hash,
        subject: c.subject,
      });
    }
  }
  const notes = readJsonl(NOTES);
  const all = flagOverlaps(attachNotes(collapse(candidates), notes, resolveUrl));
  return all.filter((e) => e.date >= since);
}

const pad = (s, n) => String(s ?? '').padEnd(n);
const pct = (v) => (v === null ? '   n/a' : `${v >= 0 ? '+' : ''}${(v * 100).toFixed(0)}%`.padStart(6));
const trunc = (s, n) => (s.length > n ? `${s.slice(0, n - 3)}...` : s);

// ---------------------------------------------------------------- list

if (command === 'list') {
  const since = dateArg('--since', addDays(today, -90));
  const entries = loadEntries(since);
  console.log(`Content changes since ${since}: ${entries.length}\n`);
  console.log(
    `${pad('date', 11)}${pad('kind', 9)}${pad('slug', 58)}${pad('commits', 8)}${pad('notes', 6)}first subject`
  );
  for (const e of entries) {
    console.log(
      `${pad(e.date, 11)}${pad(e.kind, 9)}${pad(e.slug, 58)}${pad(e.commits.length, 8)}${pad(e.notes.length, 6)}${trunc(
        e.commits[0]?.subject ?? e.notes[0] ?? '',
        70
      )}`
    );
  }
  process.exit(0);
}

// ---------------------------------------------------------------- due

function loadDue() {
  // Judging started with October 2026 edits. Before that, 348 of 353 edits
  // overlapped another edit to the same page within 28 days (counted
  // 2026-10-30), so a backfill would mostly produce confounded verdicts.
  const since = dateArg('--since', [addDays(today, -90), JUDGING_STARTED].sort().pop());
  return dueEntries(loadEntries(since), readJsonl(VERDICTS), today);
}

if (command === 'due') {
  const due = loadDue();
  const out = valueOf('--json');
  if (out) {
    fs.writeFileSync(path.resolve(out), JSON.stringify(due, null, 2) + '\n', 'utf8');
    console.log(`Wrote ${due.length} due entries to ${out}`);
  }
  if (due.length === 0) {
    console.log(`Nothing due as of ${today} (an edit is due ${WINDOW_DAYS} + 2 days after the change date).`);
    process.exit(0);
  }
  console.log(`${due.length} entries due for judging as of ${today}, ${groupByDate(due).length} change dates.\n`);
  for (const [date, group] of groupByDate(due)) {
    const w = windowsFor(date);
    console.log(`${date}  (${group.length} ${group.length === 1 ? 'entry' : 'entries'})`);
    for (const e of group) console.log(`  ${e.kind.padEnd(7)} ${e.slug}${e.overlapping ? '  [overlapping]' : ''}`);
    console.log(`  pull 1 (before): ${w.before.start} .. ${w.before.end}`);
    console.log(`  pull 2 (after):  ${w.after.start} .. ${w.after.end}\n`);
  }
  const groups = groupByDate(due).map(([d]) => windowsFor(d));
  const spanStart = groups.map((w) => w.before.start).sort()[0];
  const spanEnd = groups
    .map((w) => w.after.end)
    .sort()
    .pop();
  console.log('ONE CALL covers every window above:');
  console.log(
    `  get_advanced_search_analytics  dimensions=page,date  start=${spanStart}  end=${spanEnd}  row_limit=25000  (final data)`
  );
  console.log('  Save the raw response to a file, then: npm run change-log -- judge --daily <file> [--dry-run]');
  console.log(
    'Or per window (dimension=page, row_limit=1000), saved as {windows:[{changeDate, before, after}]}: judge --from <file>'
  );
  process.exit(0);
}

// ---------------------------------------------------------------- judge

if (command === 'judge') {
  const from = valueOf('--from');
  const daily = valueOf('--daily');
  const doPull = args.includes('--pull');
  const dryRun = args.includes('--dry-run');
  if (!from && !daily && !doPull) {
    console.error('judge needs --pull, --daily <page,date pull> or --from <{windows:[{changeDate, before, after}]}>.');
    process.exit(2);
  }
  const pulls = new Map();
  if (daily) {
    const rows = extractRows(fs.readFileSync(path.resolve(daily), 'utf8'));
    if (!rows) {
      console.error('Could not find a rows array in the daily pull.');
      process.exit(2);
    }
    const span = dailySpan(rows);
    for (const [date] of groupByDate(loadDue())) {
      const w = windowsFor(date);
      if (!span.min || span.min > w.before.start || span.max < w.after.end) continue; // not covered: stays due
      const before = rowsForWindow(rows, w.before.start, w.before.end);
      const after = rowsForWindow(rows, w.after.start, w.after.end);
      pulls.set(date, { before, after, site: controlFor(before, after) });
    }
  }
  const input = from ? JSON.parse(fs.readFileSync(path.resolve(from), 'utf8')) : { windows: [] };
  if (!Array.isArray(input.windows)) {
    console.error('Could not find a windows array in that file.');
    process.exit(2);
  }
  for (const w of input.windows) {
    const before = extractRows(w.before);
    const after = extractRows(w.after);
    if (!before || !after) {
      console.error(`Window ${w.changeDate}: could not find a rows array in before/after.`);
      process.exit(2);
    }
    pulls.set(w.changeDate, { before, after, site: controlFor(before, after) });
  }

  const due = loadDue();
  if (doPull) {
    for (const [date] of groupByDate(due)) {
      if (pulls.has(date)) continue; // --from / --daily already supplied it
      const w = windowsFor(date);
      try {
        const before = await pullRows({ dimensions: 'page', start: w.before.start, end: w.before.end, rowLimit: 1000 });
        const after = await pullRows({ dimensions: 'page', start: w.after.start, end: w.after.end, rowLimit: 1000 });
        pulls.set(date, { before, after, site: controlFor(before, after) });
      } catch (e) {
        console.error(`Pull failed for change date ${date}: ${e.message}`);
        process.exit(1);
      }
    }
  }
  const verdicts = [];
  const missing = new Set();
  for (const e of due) {
    const pull = pulls.get(e.date);
    if (!pull) {
      missing.add(e.date);
      continue;
    }
    if (!e.url) {
      console.error(
        `Skipping ${e.slug} ${e.date}: no url (manual note for a slug with no file; add "url" to the note).`
      );
      continue;
    }
    const before = metricsFor(pull.before, e.url);
    const after = metricsFor(pull.after, e.url);
    verdicts.push({
      judgedOn: today,
      slug: e.slug,
      url: e.url,
      changeDate: e.date,
      kind: e.kind,
      commits: e.commits,
      overlapping: e.overlapping,
      before,
      after,
      ...classify(before, after, pull.site),
    });
  }

  // Batch edits: one commit touching 3+ pages is judged once, on the summed
  // pages. A one-sentence fix across 55 posts cannot be read page by page.
  const batches = new Map();
  for (const v of verdicts) {
    for (const c of v.commits) {
      const key = `${v.changeDate}|${c.hash}`;
      if (!batches.has(key)) batches.set(key, { changeDate: v.changeDate, commit: c, pages: [] });
      batches.get(key).pages.push(v);
    }
  }
  for (const b of batches.values()) {
    if (b.pages.length < 3) continue;
    const before = aggregate(b.pages.map((v) => v.before));
    const after = aggregate(b.pages.map((v) => v.after));
    verdicts.push({
      judgedOn: today,
      slug: `batch:${b.commit.hash.slice(0, 8)}`,
      url: null,
      changeDate: b.changeDate,
      kind: 'batch',
      commits: [b.commit],
      pages: b.pages.map((v) => v.slug),
      overlapping: b.pages.some((v) => v.overlapping),
      before,
      after,
      ...classify(before, after, pulls.get(b.changeDate).site),
    });
  }

  if (verdicts.length && !dryRun) {
    fs.appendFileSync(VERDICTS, verdicts.map((v) => JSON.stringify(v)).join('\n') + '\n', 'utf8');
  }
  console.log(
    `Judged ${verdicts.length} entries as of ${today}. ${dryRun ? 'DRY RUN: nothing written.' : `Appended to ${path.relative(ROOT, VERDICTS)}`}\n`
  );
  console.log(
    `${pad('changeDate', 11)}${pad('slug', 50)}${pad('verdict', 18)}${pad('dropType', 24)}${pad('posD', 7)}${pad(
      'imp',
      7
    )}${pad('vsSite', 8)}${pad('ctr', 7)}flags`
  );
  for (const v of verdicts) {
    const flags = [v.overlapping ? 'overlapping' : '', v.clicksTooSmall ? 'clicksTooSmall' : '']
      .filter(Boolean)
      .join(',');
    console.log(
      `${pad(v.changeDate, 11)}${pad(trunc(v.slug, 48), 50)}${pad(v.verdict, 18)}${pad(v.dropType ?? '-', 24)}${pad(
        v.posDelta ?? 'n/a',
        7
      )}${pct(v.impPct).padEnd(7)}${pct(v.relImpPct).padEnd(8)}${pct(v.ctrRel).padEnd(7)}${flags}${v.kind === 'batch' ? ` (${v.pages.length} pages)` : ''}`
    );
  }
  for (const d of missing) console.log(`\nNo pull supplied for change date ${d}; those entries stay due.`);
  console.log(`\nSite: ${SITE}. Verdicts are signals, not proof; check overlapping and clicksTooSmall before acting.`);
  process.exit(0);
}

console.error(`Unknown command "${command}". Use: list | due | judge`);
process.exit(2);
