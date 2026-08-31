#!/usr/bin/env node
// Adds the missing `imageCredit` line to posts using an AI-generated pool image.
//
// WHY: the founder asked "Have you stopped writing AI illustration below the
// images?" The answer was yes, by drift rather than decision: 8 pool-image posts
// carried `imageCredit: 'AI-generated illustration'` and 13 did not, including
// every recent publish. The template renders the field (src/utils/blog.ts,
// articles.ts, config.ts), so the label was simply missing on those pages.
//
// Node, not PowerShell: Get-Content -Raw misreads UTF-8 as ANSI on this machine
// and corrupts prose on the read. See the powershell-encoding-trap rule, which
// this session proved twice.
//
// Inserts immediately after the `image:` line so frontmatter order stays stable.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIRS = ['src/data/post', 'src/data/article'];
const CREDIT = "imageCredit: 'AI-generated illustration'";

const dryRun = process.argv.includes('--dry-run');
let changed = 0;
const report = [];

for (const dir of DIRS) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) continue;
  for (const name of fs.readdirSync(full).filter((f) => f.endsWith('.md'))) {
    const p = path.join(full, name);
    const before = fs.readFileSync(p, 'utf8');

    const usesPool = /^image:\s*'?~\/assets\/images\/pool\//m.test(before);
    const hasCredit = /^imageCredit:/m.test(before);
    if (!usesPool || hasCredit) continue;

    const after = before.replace(/^(image:\s*'?~\/assets\/images\/pool\/[^\r\n]*)$/m, `$1\n${CREDIT}`);
    if (after === before) {
      report.push(`  SKIPPED (no insertion point) ${name}`);
      continue;
    }
    changed++;
    report.push(`  ${name}`);
    if (!dryRun) fs.writeFileSync(p, after, 'utf8');
  }
}

console.log(dryRun ? 'DRY RUN, nothing written\n' : 'Added imageCredit\n');
report.forEach((r) => console.log(r));
console.log(`\n${changed} file(s) ${dryRun ? 'would change' : 'changed'}.`);
