import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  loadManifest,
  saveManifest,
  setMechanical,
  setRecorded,
  manifestStatus,
  MECHANICAL_FIELDS,
  BLOCKING_RECORDED,
} from '../lib/manifest.mjs';

test('round-trip and skeleton', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-'));
  const m = loadManifest('my-post', root);
  assert.equal(m.schemaVersion, 1);
  saveManifest(m, root);
  assert.ok(fs.existsSync(path.join(root, '.publish', 'my-post.json')));
});

test('status: all green only when every blocking field is fresh PASS', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-'));
  const m = loadManifest('p', root);
  const h = 'hash1';
  for (const f of MECHANICAL_FIELDS) setMechanical(m, f, 'PASS', h);
  assert.equal(manifestStatus(m, h).green, false); // recorded still missing
  setRecorded(m, 'proofread', 'READY', 'code-reviewer', h);
  setRecorded(m, 'factCheck', 'NOT_REQUIRED', 'orchestrator', h);
  setRecorded(m, 'imageEyeball', 'OK', 'founder', h);
  setRecorded(m, 'founderApproval', 'YES', 'founder', h);
  assert.equal(manifestStatus(m, h).green, true);
  // content change -> stale -> not green
  assert.equal(manifestStatus(m, 'hash2').green, false);
  const stale = manifestStatus(m, 'hash2').rows.find((r) => r.field === 'proofread');
  assert.equal(stale.fresh, false);
});

test('non-blocking recorded fields do not affect green', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-'));
  const m = loadManifest('p', root);
  const h = 'h';
  for (const f of MECHANICAL_FIELDS) setMechanical(m, f, 'PASS', h);
  for (const f of BLOCKING_RECORDED)
    setRecorded(
      m,
      f,
      f === 'proofread' ? 'READY' : f === 'factCheck' ? 'PASS' : f === 'imageEyeball' ? 'OK' : 'YES',
      'x',
      h
    );
  assert.equal(manifestStatus(m, h).green, true); // indexNow/gscSitemap unset, still green
});

test('setters throw on unknown field names', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-'));
  const m = loadManifest('p', root);
  assert.throws(() => setMechanical(m, 'checkBlgo', 'PASS', 'h'), /Unknown mechanical field/);
  assert.throws(() => setRecorded(m, 'founderAproval', 'YES', 'x', 'h'), /Unknown recorded field/);
});

test('manifestStatus accepts a {mechanicalHash, verdictHash} object: mechanical and recorded fields are checked against their own hash', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-'));
  const m = loadManifest('p', root);
  const mHash = 'mech-hash-1';
  const vHash = 'verdict-hash-1';
  for (const f of MECHANICAL_FIELDS) setMechanical(m, f, 'PASS', mHash);
  setRecorded(m, 'proofread', 'READY', 'code-reviewer', vHash);
  setRecorded(m, 'factCheck', 'NOT_REQUIRED', 'orchestrator', vHash);
  setRecorded(m, 'imageEyeball', 'OK', 'founder', vHash);
  setRecorded(m, 'founderApproval', 'YES', 'founder', vHash);

  // Both hashes match their respective fields -> green.
  assert.equal(manifestStatus(m, { mechanicalHash: mHash, verdictHash: vHash }).green, true);

  // Mechanical hash changed (e.g. content edit) -> mechanical fields stale -> not green.
  assert.equal(manifestStatus(m, { mechanicalHash: 'mech-hash-2', verdictHash: vHash }).green, false);

  // Verdict hash changed (e.g. reviewed content actually changed) -> recorded fields stale -> not green.
  assert.equal(manifestStatus(m, { mechanicalHash: mHash, verdictHash: 'verdict-hash-2' }).green, false);
});
