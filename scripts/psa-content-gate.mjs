#!/usr/bin/env node
/**
 * Programmatic SEO anti-thin-content gate.
 *
 * Hard-fails the build (exit 1) if any entry in src/data/competitors.json
 * would produce a thin, stale, or unsourced /alternatives/<slug> page.
 * Wired into `npm run build` so a thin programmatic page cannot ship, which
 * is the core guardrail of the dormant pSEO system (see
 * C:/Users/Admin/.claude/plans/lexical-snuggling-liskov.md).
 *
 * Checks per competitor:
 *  1. status is 'draft' or 'live'
 *  2. unique cahAngle prose >= MIN_UNIQUE_WORDS
 *  3. unique cahAngle prose is >= MIN_UNIQUE_SHARE of total rendered text
 *  4. every verbatimQuotes item has text, name, role, date, source
 *  5. dossierVerifiedDate present and <= MAX_DOSSIER_AGE_DAYS old
 *  6. no comparisonRows competitor cell asserts an unsourced feature-absence
 *
 * An empty competitors array passes (the dormant system has no live pages).
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const MIN_UNIQUE_WORDS = 1200;
const MIN_UNIQUE_SHARE = 0.4;
const MAX_DOSSIER_AGE_DAYS = 60;

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, '../src/data/competitors.json');

const wordCount = (s) => (String(s).trim().match(/\S+/g) || []).length;

// Neutral framings that make a feature-absence statement allowed (sourced/hedged).
const ALLOWED_ABSENCE = [/not documented on the product page/i, /confirm with vendor/i];
// Bare feature-absence assertions that need the neutral framing above.
const ABSENCE_PATTERNS = [
  /\blacks\b/i,
  /\bcannot\b/i,
  /\bcan't\b/i,
  /\bdoes not\b/i,
  /\bdoesn't\b/i,
  /\bunable\b/i,
  /\bno support\b/i,
  /\bnot able\b/i,
  /\bmissing\b/i,
];

const errors = [];

let data;
try {
  data = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
} catch (e) {
  console.error(`[psa-gate] FAIL: cannot read/parse ${DATA_PATH}: ${e.message}`);
  process.exit(1);
}

const competitors = Array.isArray(data?.competitors) ? data.competitors : null;
if (!competitors) {
  console.error('[psa-gate] FAIL: competitors.json must have a "competitors" array.');
  process.exit(1);
}

if (competitors.length === 0) {
  console.log('[psa-gate] PASS: no competitor entries (dormant system, nothing to gate).');
  process.exit(0);
}

const now = Date.now();

for (const c of competitors) {
  const tag = `[${c?.slug ?? 'UNKNOWN'}]`;

  if (!c.slug || !c.name) {
    errors.push(`${tag} missing required slug/name.`);
    continue;
  }
  if (c.status !== 'draft' && c.status !== 'live') {
    errors.push(`${tag} status must be 'draft' or 'live' (got ${JSON.stringify(c.status)}).`);
  }

  // 2 + 3: unique prose volume and share
  const cahAngle = Array.isArray(c.cahAngle) ? c.cahAngle : [];
  const uniqueWords = cahAngle.reduce((n, p) => n + wordCount(p), 0);

  const supportingText = [
    c.positioning,
    c.category,
    ...(c.comparisonRows || []).flatMap((r) => [r.dimension, r.competitor, r.simplescheduleai]),
    ...(c.verbatimQuotes || []).flatMap((q) => [q.text, q.name, q.role, q.date, q.source]),
  ]
    .filter(Boolean)
    .join(' ');
  const supportingWords = wordCount(supportingText);
  const totalWords = uniqueWords + supportingWords;
  const share = totalWords === 0 ? 0 : uniqueWords / totalWords;

  if (uniqueWords < MIN_UNIQUE_WORDS) {
    errors.push(`${tag} thin: unique cahAngle prose is ${uniqueWords} words, need >= ${MIN_UNIQUE_WORDS}.`);
  }
  if (share < MIN_UNIQUE_SHARE) {
    errors.push(
      `${tag} unique prose share ${(share * 100).toFixed(1)}% < ${MIN_UNIQUE_SHARE * 100}% (boilerplate-dominated).`
    );
  }

  // 4: quote attribution completeness
  for (const [i, q] of (c.verbatimQuotes || []).entries()) {
    for (const field of ['text', 'name', 'role', 'date', 'source']) {
      if (!q?.[field] || String(q[field]).trim() === '') {
        errors.push(`${tag} verbatimQuotes[${i}] missing "${field}" (verbatim quotes need full attribution).`);
      }
    }
  }

  // 5: dossier freshness — a publish-time concern. A draft entry ships no
  //    /alternatives page, so its data is re-verified when it flips to 'live',
  //    not on every unrelated site build. Enforce freshness on live entries
  //    only; a stale draft must never block an unrelated deploy.
  if (c.status === 'live') {
    if (!c.dossierVerifiedDate) {
      errors.push(`${tag} missing dossierVerifiedDate.`);
    } else {
      const d = new Date(c.dossierVerifiedDate);
      if (Number.isNaN(d.getTime())) {
        errors.push(`${tag} dossierVerifiedDate is not a valid date: ${c.dossierVerifiedDate}.`);
      } else {
        const ageDays = (now - d.getTime()) / 86400000;
        if (ageDays > MAX_DOSSIER_AGE_DAYS) {
          errors.push(
            `${tag} dossier data is ${Math.round(ageDays)} days old (max ${MAX_DOSSIER_AGE_DAYS}). Re-verify before publish.`
          );
        }
      }
    }
  }

  // 6: no unsourced feature-absence in the competitor comparison cells
  for (const [i, row] of (c.comparisonRows || []).entries()) {
    const cell = String(row?.competitor ?? '');
    const hedged = ALLOWED_ABSENCE.some((re) => re.test(cell));
    if (!hedged && ABSENCE_PATTERNS.some((re) => re.test(cell))) {
      errors.push(
        `${tag} comparisonRows[${i}].competitor asserts an unsourced feature-absence: ${JSON.stringify(cell)}. ` +
          `Use neutral framing ("not documented on the product page; confirm with vendor").`
      );
    }
  }
}

if (errors.length > 0) {
  console.error(`[psa-gate] FAIL (${errors.length} issue(s)):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  `[psa-gate] PASS: ${competitors.length} competitor entr${competitors.length === 1 ? 'y' : 'ies'} cleared the content gate.`
);
process.exit(0);
