#!/usr/bin/env node
// One GSC pull, written to a file.
//
//   npm run gsc-pull -- --dims page[,query] --start YYYY-MM-DD --end YYYY-MM-DD --out <file>
//                       [--row-limit N] [--data-state final|all]
//
// Writes {rows:[...]} JSON to --out and prints only the row count and the path.
// Goes through the local GSC MCP server (scripts/lib/gsc-mcp.mjs).

import fs from 'node:fs';
import path from 'node:path';
import { pullRows } from './lib/gsc-mcp.mjs';

const args = process.argv.slice(2);
const valueOf = (f) => {
  const i = args.indexOf(f);
  return i >= 0 ? args[i + 1] : null;
};
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const dims = valueOf('--dims');
const start = valueOf('--start');
const end = valueOf('--end');
const out = valueOf('--out');
const rowLimit = Number(valueOf('--row-limit') ?? 1000);
const dataState = valueOf('--data-state') ?? 'final';

if (!dims || !DATE.test(start || '') || !DATE.test(end || '') || !out) {
  console.error(
    'Usage: npm run gsc-pull -- --dims page[,query] --start YYYY-MM-DD --end YYYY-MM-DD --out <file> [--row-limit N] [--data-state final|all]'
  );
  process.exit(2);
}
if (!Number.isInteger(rowLimit) || rowLimit < 1 || rowLimit > 25000) {
  console.error('--row-limit must be an integer from 1 to 25000.');
  process.exit(2);
}
if (!['final', 'all'].includes(dataState)) {
  console.error('--data-state must be final or all.');
  process.exit(2);
}

try {
  const rows = await pullRows({ dimensions: dims, start, end, rowLimit, dataState });
  const file = path.resolve(out);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify({ rows }) + '\n', 'utf8');
  console.log(`${rows.length} rows -> ${out}`);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
