import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

function runGate(sourcesLine) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cbs-'));
  const rel = path.join('src', 'data', 'post');
  fs.mkdirSync(path.join(dir, rel), { recursive: true });
  const p = path.join(dir, rel, 'fixture.md');
  const body = `## Sources\n\n${sourcesLine}\n`;
  fs.writeFileSync(p, `---\ndraft: true\ntitle: F\n---\n${body}\n`);
  try {
    try {
      execFileSync('node', [path.resolve('scripts/check-blog.mjs'), p], { encoding: 'utf8' });
      return { code: 0 };
    } catch (e) {
      return { code: e.status, out: String(e.stdout) + String(e.stderr) };
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test('Sources label/URL mismatch hard-fails check-blog', () => {
  const r = runGate('1. FindLaw, [Texas overtime law](https://texas.gov/some-page)');
  assert.equal(r.code, 1);
  assert.match(r.out, /Sources label\/URL mismatch/);
  assert.match(r.out, /findlaw/i);
});

test('Sources label/URL matching domain passes the rule', () => {
  const r = runGate(
    '1. Texas Legislature Online, [Texas Health and Safety Code](https://statutes.capitol.texas.gov/Docs/HS/htm/HS.257.htm)'
  );
  if (r.out) assert.doesNotMatch(r.out, /Sources label\/URL mismatch/);
});
