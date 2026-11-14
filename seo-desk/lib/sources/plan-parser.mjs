// Parses the monthly blog plan (docs/seo/next-<N>-blogs-<YYYY-MM>.md) into the Plan shape.
//
// Two tables matter: "The 15" (rows start with a number and a [ ]/[x] box) and the
// "Improve these live pages" table (rows start with a [ ]/[x] box and a backticked
// page path). Anything else in the file is ignored, and a file with neither table
// gives an error string instead of throwing.

import fs from 'node:fs';
import path from 'node:path';
import { addDays } from '../dates.mjs';

const PLAN_FILE_RE = /^next-(\d+)-blogs-(\d{4})-(\d{2})\.md$/;
const DATE_RE = '(\\d{4}-\\d{2}-\\d{2})';

// Cells of one markdown table row. An escaped pipe stays inside its cell.
function cellsOf(line) {
  const t = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return t.split(/(?<!\\)\|/).map((c) => c.replace(/\\\|/g, '|').trim());
}

const isRow = (line) => line.trim().startsWith('|');
const boxOf = (cell) => /^\[\s*([xX ])\s*\]$/.exec(cell.trim());

// Plain text from a cell: markdown emphasis and backticks removed.
const plain = (s) => s.replace(/[*_`]/g, '').trim();

// Path inside the first backticks of a cell, without a query or trailing slash.
function pageFrom(cell) {
  const m = /`([^`]+)`/.exec(cell);
  if (!m || !m[1].startsWith('/')) return null;
  const p = m[1].split(/[?#]/)[0].replace(/\/$/, '');
  return p || '/';
}

function parseImproveRow(cells) {
  const box = boxOf(cells[0] ?? '');
  const page = pageFrom(cells[1] ?? '');
  if (!box || !page) return null;
  const search = plain(cells[2] ?? '');
  const todo = plain(cells.slice(3).join(' | '));
  const doneMatch = new RegExp(`^Done\\s+${DATE_RE}`, 'i').exec(todo);
  const alreadyLive = /^Already live/i.test(todo);
  const doneDate = doneMatch ? doneMatch[1] : null;
  const explicit = new RegExp(`Judge from\\s+${DATE_RE}`, 'i').exec(todo);
  const ticked = box[1].toLowerCase() === 'x';
  const done = ticked || Boolean(doneDate) || alreadyLive;
  const judgeFrom = explicit ? explicit[1] : doneDate ? addDays(doneDate, 30) : null;
  return { page, done, doneDate, judgeFrom, search, todo };
}

function parsePostRow(cells) {
  if (!/^\d+$/.test(cells[0] ?? '')) return null;
  const box = boxOf(cells[1] ?? '');
  if (!box) return null;
  return {
    n: Number(cells[0]),
    done: box[1].toLowerCase() === 'x',
    title: plain(cells[2] ?? ''),
    keyword: plain(cells[3] ?? ''),
  };
}

// {file, error, posts, improve}. Never throws.
export function parsePlan(markdown, file = null) {
  const posts = [];
  const improve = [];
  for (const line of String(typeof markdown === 'string' ? markdown : '').split(/\r?\n/)) {
    if (!isRow(line)) continue;
    const cells = cellsOf(line);
    const post = parsePostRow(cells);
    if (post) {
      posts.push(post);
      continue;
    }
    const imp = parseImproveRow(cells);
    if (imp) improve.push(imp);
  }
  const error =
    posts.length || improve.length
      ? null
      : 'No plan tables found: expected "The 15" and "Improve these live pages" rows.';
  return { file, error, posts, improve };
}

// Absolute path of the latest docs/seo/next-<N>-blogs-<YYYY-MM>.md (latest month, then
// highest N), or null when there is none.
export function findPlanFile(repoRoot) {
  const dir = path.join(repoRoot, 'docs', 'seo');
  let names;
  try {
    names = fs.readdirSync(dir);
  } catch {
    return null;
  }
  const found = names
    .map((name) => ({ name, m: PLAN_FILE_RE.exec(name) }))
    .filter((x) => x.m)
    .map((x) => ({ name: x.name, ym: `${x.m[2]}-${x.m[3]}`, n: Number(x.m[1]) }))
    .sort((a, b) => b.ym.localeCompare(a.ym) || b.n - a.n);
  return found.length ? path.join(dir, found[0].name) : null;
}
