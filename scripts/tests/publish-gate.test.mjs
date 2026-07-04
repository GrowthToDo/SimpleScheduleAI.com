import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { parseCheckLinksOutput } from '../publish-gate.mjs';

const GATE = path.resolve('scripts/publish-gate.mjs');

function makeRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pg-'));
  fs.mkdirSync(path.join(root, 'src', 'data', 'post'), { recursive: true });
  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
  fs.writeFileSync(
    path.join(root, 'scripts', 'image-pool.json'),
    JSON.stringify([{ id: '1111111111111-aaaaaaaaaaaa', description: 'x', topics: [] }])
  );
  const post = `---\ndraft: false\npublishDate: 2026-07-01T00:00:00Z\nupdateDate: 2026-07-01T00:00:00Z\ntitle: 'T'\nimage: https://images.unsplash.com/photo-1111111111111-aaaaaaaaaaaa?w=100\n---\n\nBody with no facts drift.\n`;
  fs.writeFileSync(path.join(root, 'src', 'data', 'post', 'subject.md'), post);
  fs.writeFileSync(
    path.join(root, 'src', 'data', 'post', 'linker-a.md'),
    `---\ndraft: false\ntitle: A\n---\n[x](/blog/subject)`
  );
  fs.writeFileSync(
    path.join(root, 'src', 'data', 'post', 'linker-b.md'),
    `---\ndraft: false\ntitle: B\n---\n[x](/blog/subject)`
  );
  return root;
}

function gate(root, args) {
  try {
    const out = execFileSync('node', [GATE, ...args, '--root', root, '--no-network', '--skip-external-tools'], {
      encoding: 'utf8',
    });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status, out: String(e.stdout) };
  }
}

test('mechanical run fills manifest; not green without recorded fields', () => {
  const root = makeRepo();
  const r = gate(root, ['subject']);
  assert.equal(r.code, 1); // recorded fields missing
  const m = JSON.parse(fs.readFileSync(path.join(root, '.publish', 'subject.json'), 'utf8'));
  assert.equal(m.mechanical.inboundLinks.status, 'PASS');
  assert.equal(m.mechanical.dateSanity.status, 'PASS');
  assert.equal(m.mechanical.factsDossier.status, 'PASS');
});

test('--set records verdicts; full green exits 0', () => {
  const root = makeRepo();
  gate(root, ['subject']);
  gate(root, ['subject', '--set', 'proofread=READY', '--by', 'code-reviewer']);
  gate(root, ['subject', '--set', 'factcheck=NOT_REQUIRED']);
  gate(root, ['subject', '--set', 'image-eyeball=OK']);
  const r = gate(root, ['subject', '--set', 'founder-approval=YES']);
  assert.equal(r.code, 0);
  assert.match(r.out, /ALL GREEN/);
});

test('editing the post stales the manifest', () => {
  const root = makeRepo();
  gate(root, ['subject']);
  gate(root, ['subject', '--set', 'proofread=READY']);
  const p = path.join(root, 'src', 'data', 'post', 'subject.md');
  fs.appendFileSync(p, '\nEdited.\n');
  const r = gate(root, ['subject', '--status']);
  assert.equal(r.code, 1);
  assert.match(r.out, /STALE/);
});

test('insufficient inbound links fails', () => {
  const root = makeRepo();
  fs.rmSync(path.join(root, 'src', 'data', 'post', 'linker-b.md'));
  gate(root, ['subject']);
  const m = JSON.parse(fs.readFileSync(path.join(root, '.publish', 'subject.json'), 'utf8'));
  assert.equal(m.mechanical.inboundLinks.status, 'FAIL');
});

test('parseCheckLinksOutput: crash output (no BROKEN lines) is not a pass; canonical-only broken is', () => {
  assert.equal(parseCheckLinksOutput('TypeError: boom', 'https://x.com/blog/s'), false);
  assert.equal(parseCheckLinksOutput('  [BROKEN] 404  https://x.com/blog/s', 'https://x.com/blog/s'), true);
  assert.equal(parseCheckLinksOutput('  [BROKEN] 404  https://other.com/dead', 'https://x.com/blog/s'), false);
});

test('recorded verdicts survive a draft/date flip: proofread stays FRESH, mechanical fields go STALE', () => {
  const root = makeRepo();
  gate(root, ['subject']);
  gate(root, ['subject', '--set', 'proofread=READY', '--by', 'code-reviewer']);
  gate(root, ['subject', '--set', 'factcheck=NOT_REQUIRED']);
  gate(root, ['subject', '--set', 'image-eyeball=OK']);
  gate(root, ['subject', '--set', 'founder-approval=YES']);

  // Flip draft: false -> true and bump publishDate/updateDate — a process
  // action, not a reviewed-content edit.
  const p = path.join(root, 'src', 'data', 'post', 'subject.md');
  let text = fs.readFileSync(p, 'utf8');
  text = text.replace('draft: false', 'draft: true');
  text = text.replace(/publishDate: [^\n]+/, 'publishDate: 2026-08-01T00:00:00Z');
  text = text.replace(/updateDate: [^\n]+/, 'updateDate: 2026-08-01T00:00:00Z');
  fs.writeFileSync(p, text);

  const r = gate(root, ['subject', '--status']);
  assert.equal(r.code, 1); // dateSanity must re-run on a real date change -> mechanical fields stale -> not green
  assert.match(r.out, /\[PASS \] proofread/); // recorded verdict is FRESH (not STALE), no re-review needed
  assert.doesNotMatch(r.out.match(/proofread[^\n]*/)[0], /STALE/);
  // Mechanical fields ARE stale because contentHash changed (dateSanity must re-check the new dates).
  assert.match(r.out, /dateSanity.*STALE|checkBlog.*STALE/s);
});
