import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

// Rule 13b, added 2026-11-17 with the founder-questions step (publish-pipeline
// phase 1). A draft marks missing founder input as [ADD: ...] and an unsourced
// claim as [NEED SOURCE: ...]. A live file with either one fails; a draft only
// warns. The fixtures are invented and fail other hard gates (no bio, no hub
// links), so the tests read the marker lines and their symbol, not the exit code.
function runGate(frontmatter, body) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cbm-'));
  const rel = path.join('src', 'data', 'post');
  fs.mkdirSync(path.join(dir, rel), { recursive: true });
  const p = path.join(dir, rel, 'fixture.md');
  fs.writeFileSync(p, `---\n${frontmatter}title: F\n---\n\n${body}\n`);
  try {
    try {
      const out = execFileSync('node', [path.resolve('scripts/check-blog.mjs'), p], { encoding: 'utf8' });
      return { code: 0, out };
    } catch (e) {
      return { code: e.status, out: String(e.stdout) + String(e.stderr) };
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const ADD_LINE = 'The weekend rotation was built this way because [ADD: why the founder chose a four-week cycle].';
const SOURCE_LINE = 'Most small hospitals post the schedule two weeks ahead [NEED SOURCE: two-week posting norm].';

test('a live file with an [ADD: ...] marker fails and names the line', () => {
  const r = runGate('draft: false\n', ADD_LINE);
  assert.equal(r.code, 1);
  assert.match(
    r.out,
    /✗ Unfilled \[ADD\] marker in a live file: fill it with the founder's answer or cut the sentence\n\s+L6: \[ADD: why the founder chose a four-week cycle\]/
  );
});

test('a live file with a [NEED SOURCE: ...] marker fails and names the line', () => {
  const r = runGate('draft: false\n', `A first paragraph.\n\n${SOURCE_LINE}`);
  assert.match(
    r.out,
    /✗ Unfilled \[NEED SOURCE\] marker in a live file: add a source for the claim or cut the sentence\n\s+L8: \[NEED SOURCE: two-week posting norm\]/
  );
});

test('a file with no draft key is treated as live, as the pre-commit hook does', () => {
  const r = runGate('', ADD_LINE);
  assert.match(r.out, /✗ Unfilled \[ADD\] marker in a live file/);
});

test('a draft with markers only warns, once per marker, each with its line', () => {
  const r = runGate('draft: true\n', `${ADD_LINE}\n\n${SOURCE_LINE} [ADD: a second answer]`);
  assert.doesNotMatch(r.out, /✗ Unfilled/);
  assert.match(r.out, /⚠ Unfilled \[ADD\] marker in a draft: [^\n]* before publishing\n\s+L6: /);
  assert.match(r.out, /⚠ Unfilled \[NEED SOURCE\] marker in a draft: [^\n]*\n\s+L8: /);
  assert.equal((r.out.match(/⚠ Unfilled/g) || []).length, 3);
});

test('a marker in the excerpt is caught too', () => {
  const r = runGate("draft: false\nexcerpt: 'Night shifts [ADD: the rule the founder uses]'\n", 'Body text.');
  assert.match(r.out, /✗ Unfilled \[ADD\] marker in a live file[^\n]*\n\s+L3: /);
});

test('lookalikes do not trip the rule', () => {
  const r = runGate(
    'draft: false\n',
    'See the [ADDENDUM](https://example.com/a) and the [Add a column] note. A [NEED SOURCES list] is fine.'
  );
  assert.doesNotMatch(r.out, /Unfilled \[/);
});
