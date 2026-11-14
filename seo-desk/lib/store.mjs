// JSON persistence under the data directory. Nothing here is ever committed.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DIR = path.resolve(HERE, '../data');

// Read on every call so tests can point SEO_DESK_DATA at a temp directory.
export function dataDir() {
  return process.env.SEO_DESK_DATA || DEFAULT_DIR;
}

const abs = (rel) => path.join(dataDir(), rel);

// Parsed JSON, or the fallback when the file is missing or unreadable.
export function readJson(rel, fallback) {
  try {
    return JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
  } catch {
    return fallback;
  }
}

// Write to a temp file in the same folder, then rename, so a crash never leaves
// half a file behind.
export function writeJson(rel, value) {
  const file = abs(rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2) + '\n');
  fs.renameSync(tmp, file);
}

// Upsert rows into a stored array by key, sorted by date. Returns the merged array.
export function mergeDaily(rel, rows, keyOf) {
  const byKey = new Map();
  for (const row of readJson(rel, [])) byKey.set(keyOf(row), row);
  for (const row of rows) byKey.set(keyOf(row), row);
  const merged = [...byKey.values()].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  writeJson(rel, merged);
  return merged;
}
