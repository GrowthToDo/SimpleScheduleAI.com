#!/usr/bin/env node
// One-off normalizer for the action heading and its TOC anchor.
//
// WHY: the founder flagged "What Should You Do This Week?" as ungrammatical for
// a heading, and the corpus turned out to be three-way inconsistent: 63 files on
// the house form "## What to Do This Week", 27 on "What Should You Do This
// Week?", 14 on "What to Do This Week?". A check-blog rule cannot be a hard
// failure while 41 files violate it, so this normalizes them first.
//
// Node, deliberately, not PowerShell: Get-Content -Raw misreads UTF-8 as ANSI on
// this machine and corrupts prose on the READ. See the powershell-encoding-trap
// rule. Node reads and writes UTF-8 natively.
//
// Also rewrites the matching TOC anchor, because changing the heading without
// the anchor breaks the in-page link and check-blog fails on the mismatch.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIRS = ['src/data/post', 'src/data/article'];

const CANON = 'What to Do This Week';
const CANON_ANCHOR = 'what-to-do-this-week';

const VARIANTS = [
  {
    heading: /^## What Should You Do This Week\?$/gm,
    anchor: 'what-should-you-do-this-week',
    label: 'What Should You Do This Week?',
  },
  { heading: /^## What to Do This Week\?$/gm, anchor: 'what-to-do-this-week', label: 'What to Do This Week?' },
];

const dryRun = process.argv.includes('--dry-run');
let changed = 0;
const report = [];

for (const dir of DIRS) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) continue;
  for (const name of fs.readdirSync(full).filter((f) => f.endsWith('.md'))) {
    const p = path.join(full, name);
    const before = fs.readFileSync(p, 'utf8');
    let after = before;
    const hits = [];

    for (const v of VARIANTS) {
      if (v.heading.test(after)) {
        hits.push(v.label);
        after = after.replace(v.heading, `## ${CANON}`);
        // TOC line: [<any label>](#<that variant's anchor>)
        const tocRe = new RegExp(`\\[([^\\]]*[Ww]eek[^\\]]*)\\]\\(#${v.anchor}\\)`, 'g');
        after = after.replace(tocRe, `[${CANON}](#${CANON_ANCHOR})`);
      }
      v.heading.lastIndex = 0;
    }

    if (after !== before) {
      changed++;
      report.push(`  ${name}  <- ${hits.join(', ')}`);
      if (!dryRun) fs.writeFileSync(p, after, 'utf8');
    }
  }
}

console.log(dryRun ? 'DRY RUN, nothing written\n' : 'Normalized\n');
report.forEach((r) => console.log(r));
console.log(`\n${changed} file(s) ${dryRun ? 'would change' : 'changed'}.`);
