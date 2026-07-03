import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

function runGate(postBody) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cbf-'));
  const rel = path.join('src', 'data', 'post');
  fs.mkdirSync(path.join(dir, rel), { recursive: true });
  const p = path.join(dir, rel, 'fixture.md');
  fs.writeFileSync(p, `---\ndraft: true\ntitle: F\n---\n${postBody}\n`);
  try {
    execFileSync('node', [path.resolve('scripts/check-blog.mjs'), p], { encoding: 'utf8' });
    return { code: 0 };
  } catch (e) {
    return { code: e.status, out: String(e.stdout) + String(e.stderr) };
  }
}

test('facts drift hard-fails check-blog', () => {
  const r = runGate(
    'Under 42 CFR 485.631, a registered nurse must provide or supervise the nursing care of each patient.'
  );
  assert.equal(r.code, 1);
  assert.match(r.out, /Facts drift \[cfr-631-scope\]/);
});

test('approved wording passes the facts rule', () => {
  const r = runGate('Costs $61,110 per the 2025 NSI report.');
  // may fail other rules or pass; must NOT contain a facts-drift failure
  if (r.out) assert.doesNotMatch(r.out, /Facts drift/);
});
