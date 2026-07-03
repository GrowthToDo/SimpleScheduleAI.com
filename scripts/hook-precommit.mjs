#!/usr/bin/env node
import path from 'node:path';
import fs from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from './lib/publish-shared.mjs';
import { loadManifest, saveManifest } from './lib/manifest.mjs';

const CONTENT_RE = /^src\/data\/(post|article)\/[^/]+\.mdx?$/;

export function detectDraftFlips(nameStatus, readStaged, readHead) {
  const flips = [];
  for (const { status, path: p } of nameStatus) {
    const norm = p.replace(/\\/g, '/');
    if (!CONTENT_RE.test(norm)) continue;
    if (status === 'D') continue;
    const staged = parseFrontmatter(readStaged(norm)).data;
    if (staged.draft !== false) continue;
    const headText = readHead(norm);
    if (headText === undefined) {
      flips.push({ path: norm, slug: slugOf(norm) });
      continue;
    } // new file
    const head = parseFrontmatter(headText).data;
    if (head.draft === true) flips.push({ path: norm, slug: slugOf(norm) });
  }
  return flips;
}

const slugOf = (p) => path.basename(p).replace(/\.mdx?$/, '');

function main() {
  const root = process.cwd();
  const ns = execFileSync('git', ['diff', '--cached', '--name-status'], { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((l) => {
      const [status, ...rest] = l.split('\t');
      return { status: status[0], path: rest[rest.length - 1] };
    });
  const readStaged = (p) => execFileSync('git', ['show', `:${p}`], { encoding: 'utf8' });
  const readHead = (p) => {
    const r = spawnSync('git', ['show', `HEAD:${p}`], { encoding: 'utf8' });
    return r.status === 0 ? r.stdout : undefined;
  };
  const flips = detectDraftFlips(ns, readStaged, readHead);
  if (flips.length === 0) process.exit(0);

  let blocked = false;
  for (const { path: p, slug } of flips) {
    console.log(`\npre-commit publish gate: ${slug}`);
    const r = spawnSync('node', [path.join(root, 'scripts', 'publish-gate.mjs'), p], { stdio: 'inherit' });
    if (r.status !== 0) blocked = true;
  }
  if (!blocked) process.exit(0);

  if (process.env.PUBLISH_OVERRIDE === '1') {
    for (const { slug } of flips) {
      const m = loadManifest(slug, root);
      m.overrides.push({
        override: true,
        at: new Date().toISOString(),
        reason: process.env.PUBLISH_OVERRIDE_REASON || 'unspecified',
      });
      saveManifest(m, root);
      execFileSync('git', ['add', path.join('.publish', `${slug}.json`)]);
    }
    console.log('\nPUBLISH_OVERRIDE=1 — committing anyway; override recorded in manifest.');
    process.exit(0);
  }
  console.log('\nCommit BLOCKED: publish manifest not green. Fix the rows above,');
  console.log('or record verdicts: node scripts/publish-gate.mjs <slug> --set <field>=<value>');
  console.log('Emergency bypass: PUBLISH_OVERRIDE=1 PUBLISH_OVERRIDE_REASON="why" git commit ...');
  process.exit(1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
