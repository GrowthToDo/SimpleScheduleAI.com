#!/usr/bin/env node
/**
 * ICP cold-read scoring CLI.
 *
 *   npm run cold-read record <slug> --from <observations.json>
 *   npm run cold-read status <slug>
 *   npm run cold-read trend
 *
 * ADVISORY ONLY. Writes to manifest.scores, which manifestStatus() never reads,
 * so this can never block a commit. See docs/seo/content-scoring.md.
 */
import fs from 'node:fs';
import path from 'node:path';
import { loadManifest, saveManifest, setScore, getScore } from './lib/manifest.mjs';
import { resolvePost, listPosts, verdictHash, parseFrontmatter } from './lib/publish-shared.mjs';
import { scoreColdRead, validateColdRead, INTENTS } from './lib/cold-read.mjs';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const cmd = args[0];

function die(msg) {
  console.error(msg);
  process.exit(1);
}

function flag(name) {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args[i + 1];
}

function bar(n) {
  const filled = Math.round(n / 10);
  return '#'.repeat(filled) + '.'.repeat(10 - filled);
}

function loadPost(slug) {
  let found;
  try {
    found = resolvePost(slug, ROOT);
  } catch {
    found = null;
  }
  if (!found) die(`Not found in any collection: ${slug}`);
  const text = fs.readFileSync(found.filePath, 'utf8');
  return { ...found, text, fm: parseFrontmatter(text).data };
}

if (cmd === 'record') {
  const slug = args[1];
  const from = flag('from');
  if (!slug || !from) die('usage: cold-read record <slug> --from <observations.json>');
  if (!fs.existsSync(from)) die(`No such file: ${from}`);

  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(from, 'utf8'));
  } catch (e) {
    die(`Could not parse ${from}: ${e.message}`);
  }

  const { ok, errors } = validateColdRead(raw);
  if (!ok) die(`Invalid cold-read record:\n  - ${errors.join('\n  - ')}`);

  const post = loadPost(slug);
  const scored = scoreColdRead(raw);
  const manifest = loadManifest(slug, ROOT, post.collection);
  setScore(
    manifest,
    'coldRead',
    {
      ...scored,
      icp: raw.icp,
      publishDate: post.fm.publishDate || null,
      postType: post.fm.postType || null,
      observations: {
        undefinedTerms: raw.undefinedTerms,
        mondayActions: raw.mondayActions,
        blockedActions: raw.blockedActions,
        sections: raw.sections,
      },
    },
    verdictHash(post.text)
  );
  saveManifest(manifest, ROOT);

  console.log(`Cold read recorded: ${slug} (intent: ${scored.intent})`);
  for (const [k, v] of Object.entries(scored.parts)) {
    console.log(`  ${k.padEnd(14)} ${String(v).padStart(5)}  ${bar(v)}`);
  }
  console.log(`  ${'OVERALL'.padEnd(14)} ${String(scored.overall).padStart(5)}  ${bar(scored.overall)}`);
  console.log('\nADVISORY. This does not gate the commit.');
  process.exit(0);
}

if (cmd === 'status') {
  const slug = args[1];
  if (!slug) die('usage: cold-read status <slug>');
  const post = loadPost(slug);
  const manifest = loadManifest(slug, ROOT, post.collection);
  const s = getScore(manifest, 'coldRead');
  if (!s) die(`No cold read recorded for ${slug}.`);
  const stale = s.contentHash !== verdictHash(post.text);
  console.log(`Cold read: ${slug}${stale ? '  [STALE - post edited since]' : ''}`);
  console.log(`  intent: ${s.intent}   scored: ${s.scoredAt}`);
  for (const [k, v] of Object.entries(s.parts)) {
    console.log(`  ${k.padEnd(14)} ${String(v).padStart(5)}  ${bar(v)}`);
  }
  console.log(`  ${'OVERALL'.padEnd(14)} ${String(s.overall).padStart(5)}  ${bar(s.overall)}`);
  if (s.observations?.undefinedTerms?.length) {
    console.log(`\n  undefined terms (${s.observations.undefinedTerms.length}): ${s.observations.undefinedTerms.join(', ')}`);
  }
  if (s.observations?.blockedActions?.length) {
    console.log(`  asked for but not equipped: ${s.observations.blockedActions.length}`);
  }
  process.exit(0);
}

if (cmd === 'trend') {
  const rows = [];
  for (const p of listPosts(ROOT)) {
    const manifestFile = path.join(ROOT, '.publish', `${p.slug}.json`);
    if (!fs.existsSync(manifestFile)) continue;
    const s = getScore(JSON.parse(fs.readFileSync(manifestFile, 'utf8')), 'coldRead');
    if (!s) continue;
    rows.push({ slug: p.slug, ...s });
  }
  if (!rows.length) {
    console.log('No cold reads recorded yet. Score one with: npm run cold-read record <slug> --from <json>');
    process.exit(0);
  }
  rows.sort((a, b) => String(a.publishDate).localeCompare(String(b.publishDate)));
  console.log('ICP cold-read trend (oldest first). ADVISORY.\n');
  console.log(
    `${'date'.padEnd(12)}${'overall'.padStart(8)}${'compr'.padStart(7)}${'head'.padStart(6)}${'act'.padStart(6)}${'attn'.padStart(6)}  slug`
  );
  for (const r of rows) {
    const d = String(r.publishDate || '').slice(0, 10);
    console.log(
      `${d.padEnd(12)}${String(r.overall).padStart(8)}${String(r.parts.comprehension).padStart(7)}${String(r.parts.headings).padStart(6)}${String(r.parts.actionability).padStart(6)}${String(r.parts.attention).padStart(6)}  ${r.slug}`
    );
  }
  const mean = (k) => Math.round((rows.reduce((a, r) => a + (k === 'overall' ? r.overall : r.parts[k]), 0) / rows.length) * 10) / 10;
  console.log(
    `\nmean over ${rows.length} post(s): overall ${mean('overall')}, comprehension ${mean('comprehension')}, headings ${mean('headings')}, actionability ${mean('actionability')}, attention ${mean('attention')}`
  );
  if (rows.length < 7) {
    console.log(`\n${7 - rows.length} more scored post(s) before the calibration review (advisory until then).`);
  }
  process.exit(0);
}

console.log(`ICP cold-read scoring (ADVISORY).

  npm run cold-read record <slug> --from <observations.json>
  npm run cold-read status <slug>
  npm run cold-read trend

observations.json shape (the agent reports observations; this script does the arithmetic):
{
  "icp": "DON at a 25-bed rural hospital, reading once on a phone",
  "intent": ${JSON.stringify(INTENTS)},
  "sections": [{ "heading": "...", "rereadCount": 0, "answeredItsQuestion": true, "quitHere": false }],
  "undefinedTerms": ["obligate"],
  "mondayActions": ["..."],
  "blockedActions": ["..."]
}

See docs/seo/content-scoring.md`);
process.exit(cmd ? 1 : 0);
