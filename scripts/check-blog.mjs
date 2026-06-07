#!/usr/bin/env node
/**
 * Pre-publish mechanical checks for blog posts.
 *
 * Runs every greppable rule from docs/seo/pre-publish-checklist.md plus the
 * conventions we've established post-checklist (Sources not in TOC, no
 * §62.002 cite, no DSHS, no 8-and-80 SSAI attribution). Works on drafts and
 * live posts equally — frontmatter draft: status is reported but does not
 * affect rule application.
 *
 * Usage:
 *   npm run check-blog src/data/post/<slug>.md   — check one file
 *   npm run check-blog -- --all                  — check every .md in src/data/post/
 *   npm run check-blog -- --live                 — check only draft: false posts
 *   npm run check-blog -- --draft                — check only draft: true posts
 *
 * Exit codes:
 *   0  every checked file passes every hard gate
 *   1  one or more files failed a hard gate
 *   2  invalid arguments / file not found
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, basename } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = resolve(__dirname, '../src/data/post');

const COLOR = process.stdout.isTTY
  ? { red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', dim: '\x1b[90m', bold: '\x1b[1m', reset: '\x1b[0m' }
  : { red: '', green: '', yellow: '', dim: '', bold: '', reset: '' };

const PASS = `${COLOR.green}✓${COLOR.reset}`;
const FAIL = `${COLOR.red}✗${COLOR.reset}`;
const WARN = `${COLOR.yellow}⚠${COLOR.reset}`;

// AI-tone phrases that must not appear in our voice. Per checklist, verbatim
// Capterra/G2 reviewer quotes are exempted. We detect blockquote regions and
// skip them. Our paraphrasing must still avoid the phrase.
const AI_TONE_PHRASES = [
  'delve',
  'dive into',
  "it's worth noting",
  'in conclusion',
  'robust',
  'leverage',
  'game-changing',
  'seamless',
  'comprehensive solution',
  'transformative',
  'at the end of the day',
  'unlock',
  'harness',
  'navigating',
  'streamline',
];

// Anything in this list is forbidden anywhere (including blockquotes — these
// are formatting characters, not vocabulary, so the reviewer-quote exemption
// does not apply).
const FORBIDDEN_DASHES = [
  { char: '—', name: 'em-dash' },
  { char: '–', name: 'en-dash' },
];

function readFile(path) {
  try {
    return readFileSync(path, 'utf8').split(/\r?\n/);
  } catch (err) {
    console.error(`${FAIL} cannot read ${path}: ${err.message}`);
    process.exit(2);
  }
}

function extractFrontmatter(lines) {
  if (lines[0] !== '---') return null;
  const end = lines.indexOf('---', 1);
  if (end === -1) return null;
  const fm = {};
  for (let i = 1; i < end; i++) {
    const m = lines[i].match(/^(\w+):\s*(.*)$/);
    if (m) fm[m[1]] = m[2];
  }
  fm._end = end;
  return fm;
}

function inBlockquote(line) {
  return /^\s*>/.test(line);
}

function tocRange(lines) {
  const start = lines.findIndex((l) => /^##\s+Table of Contents/.test(l));
  if (start === -1) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s/.test(lines[i])) {
      end = i;
      break;
    }
  }
  return { start, end };
}

function check(file) {
  const path = resolve(file);
  const lines = readFile(path);
  const fm = extractFrontmatter(lines);
  const body = lines.slice(fm ? fm._end + 1 : 0);
  const bodyOffset = fm ? fm._end + 1 : 0;
  const failures = [];
  const warnings = [];

  const fail = (rule, lineNo, snippet) => failures.push({ rule, lineNo, snippet });
  const warn = (rule, lineNo, snippet) => warnings.push({ rule, lineNo, snippet });

  // --- HARD GATES ---

  // 1. No em-dashes or en-dashes anywhere (including frontmatter and blockquotes).
  lines.forEach((line, i) => {
    for (const d of FORBIDDEN_DASHES) {
      if (line.includes(d.char)) fail(`No ${d.name}s`, i + 1, line.trim().slice(0, 100));
    }
  });

  // 2. No AI-tone phrases in our voice (blockquotes exempt — verbatim quotes
  //    can contain the word, our paraphrasing cannot).
  body.forEach((line, i) => {
    if (inBlockquote(line)) return;
    const lower = line.toLowerCase();
    for (const phrase of AI_TONE_PHRASES) {
      if (lower.includes(phrase)) {
        // Skip URLs (e.g. "navigating" appears in some URL slugs).
        const stripped = lower.replace(/https?:\/\/\S+/g, '');
        if (stripped.includes(phrase)) {
          fail(`AI-tone "${phrase}"`, bodyOffset + i + 1, line.trim().slice(0, 100));
          break;
        }
      }
    }
  });

  // 3. No inline <svg> in .md files (must be Tailwind div / table).
  lines.forEach((line, i) => {
    if (/<svg[\s>]/i.test(line)) fail('No inline <svg> in .md', i + 1, line.trim().slice(0, 100));
  });

  // 4. No blank lines inside raw HTML <div> blocks (Astro parser bug — exits
  //    HTML mode on a blank line and escapes subsequent tags to &lt;div).
  let inHtmlDiv = 0;
  let divStart = -1;
  lines.forEach((line, i) => {
    const opens = (line.match(/<div(\s|>)/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    if (inHtmlDiv > 0 && line.trim() === '') {
      fail('Blank line inside <div> block (Astro escapes subsequent tags)', i + 1, `(block opened at line ${divStart + 1})`);
    }
    if (inHtmlDiv === 0 && opens > 0) divStart = i;
    inHtmlDiv += opens - closes;
    if (inHtmlDiv < 0) inHtmlDiv = 0;
  });

  // 5. ## Sources (or ## A Note on Sources) NOT listed in TOC.
  //    Supporting section, not navigational. Established Schedule360 commit
  //    146a266, codified in checklist commit acdd575.
  const toc = tocRange(lines);
  if (toc) {
    for (let i = toc.start + 1; i < toc.end; i++) {
      if (/\[Sources?\]\(#sources?\)|\[A Note on Sources\]\(#a-note-on-sources\)/i.test(lines[i])) {
        fail('Sources entry in TOC (supporting section, not navigational)', i + 1, lines[i].trim());
      }
    }
  }

  // 6. No links to known draft posts. Dynamically scan draft slugs at runtime.
  const draftSlugs = readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({ slug: basename(f, '.md'), path: resolve(POSTS_DIR, f) }))
    .filter(({ path: p }) => {
      try {
        return readFileSync(p, 'utf8').includes('draft: true');
      } catch {
        return false;
      }
    })
    .map(({ slug }) => slug);
  const selfSlug = basename(path, '.md');
  body.forEach((line, i) => {
    for (const slug of draftSlugs) {
      if (slug === selfSlug) continue;
      const re = new RegExp(`\\(/blog/${slug}\\)`);
      if (re.test(line)) fail(`Link to draft post /blog/${slug}`, bodyOffset + i + 1, line.trim().slice(0, 120));
    }
  });

  // 7. No DSHS for Texas hospital licensing (licensing moved to HHSC Jan 2025).
  body.forEach((line, i) => {
    if (/\bDSHS\b/.test(line)) fail('DSHS — Texas hospital licensing is HHSC since Jan 2025', bodyOffset + i + 1, line.trim().slice(0, 100));
  });

  // 8. No Texas Labor Code §62.002 cite (wrong section — that is state
  //    minimum wage, not overtime).
  body.forEach((line, i) => {
    if (/§?\s*62\.002/.test(line) && /Texas Labor Code/i.test(line)) {
      fail('Texas Labor Code §62.002 — wrong section (use FLSA Fact Sheet #54)', bodyOffset + i + 1, line.trim().slice(0, 120));
    }
  });

  // 9. No FLSA 8-and-80 attributed to SimpleScheduleAI as a built-in feature.
  //    Educational mentions of the rule are fine.
  body.forEach((line, i) => {
    if (inBlockquote(line)) return;
    if (/8-and-80/.test(line)) {
      const ctx = line.toLowerCase();
      // Only flag when the SSAI verb directly governs 8-and-80 within the same
      // sentence (short gap, no period), so educational/"confirm with us" mentions
      // in the same paragraph-line are not false-flagged.
      const ssaiAttrib = /(simplescheduleai|ssai|the service|our (service|scheduler))\s+(builds?|tracks?|applies|enforces?|handles?|has?|includes?|covers?|uses?)[^.]{0,60}8-and-80/i.test(line);
      const featurePhrasing = /8-and-80[^.]{0,40}(built in|built-in|by default|automatic|applied automatically)/i.test(line);
      if (ssaiAttrib || featurePhrasing) {
        fail('FLSA 8-and-80 attributed to SimpleScheduleAI as a feature (not yet shipped)', bodyOffset + i + 1, line.trim().slice(0, 120));
      }
    }
  });

  // 10. Frontmatter: image URL must not be quoted, canonical must be present,
  //     author must be Pradeep Pandey.
  if (fm) {
    if (fm.image && (fm.image.startsWith("'") || fm.image.startsWith('"'))) {
      fail("Frontmatter image: must not be quoted", 0, `image: ${fm.image.slice(0, 80)}`);
    }
    if (!fm.image) fail('Frontmatter image: missing', 0, '');
    if (fm.author && !/Pradeep Pandey/.test(fm.author)) {
      warn(`Frontmatter author: not Pradeep Pandey (${fm.author})`, 0, '');
    }
  }

  // 11. Required internal hub links: both pillars + /how-it-works.
  const bodyText = body.join('\n');
  const required = [
    { path: '/nurse-scheduling-software', label: 'pillar 1 (nurse scheduling software)' },
    { path: '/critical-access-hospital-scheduling', label: 'pillar 2 (critical access hospital scheduling)' },
    { path: '/how-it-works', label: '/how-it-works' },
    { path: '/pilot', label: '/pilot CTA' },
  ];
  for (const r of required) {
    if (!bodyText.includes(`(${r.path})`)) fail(`Required link missing: ${r.label}`, 0, '');
  }

  // 12. CTA pattern: Apply for a Pilot Spot + Book a call (cal.com URL).
  if (!bodyText.includes('Apply for a Pilot Spot')) fail('CTA missing: "Apply for a Pilot Spot"', 0, '');
  if (!bodyText.includes('Book a call with our team') && !bodyText.includes('Book a call')) {
    warn('Secondary CTA "Book a call with our team" not found', 0, '');
  }
  if (!bodyText.includes('cal.com/gautham-8bdvdx')) warn('cal.com booking URL not found in body', 0, '');

  // 13. Author bio canonical italic-linked format (not the older block format).
  if (/\*\*Written by Pradeep Pandey\*\*/.test(bodyText)) {
    fail('Old "**Written by Pradeep Pandey**" bio format — use italic-linked', 0, '');
  }
  if (!/_\[Pradeep Pandey\]\(\/about\/pradeep-pandey\)/.test(bodyText)) {
    fail('Italic-linked author bio not found at end', 0, '');
  }

  // 14. "built for Critical Access Hospitals" in bio (canonical phrasing).
  if (/_\[Pradeep Pandey\]/.test(bodyText) && !/built for Critical Access Hospitals/.test(bodyText)) {
    warn('Author bio missing canonical "built for Critical Access Hospitals" phrasing', 0, '');
  }

  // --- SOFT WARNINGS ---

  // No volume language near vendor names ("consistently", "widely", etc.).
  // Heuristic only — flag the line, human verifies.
  const volumeWords = ['consistently', 'widely', 'many reviewers', 'most users', 'multiple reviewers'];
  body.forEach((line, i) => {
    if (inBlockquote(line)) return;
    const lower = line.toLowerCase();
    for (const w of volumeWords) {
      if (lower.includes(w)) {
        warn(`Volume language "${w}" — verify not near competitor name`, bodyOffset + i + 1, line.trim().slice(0, 100));
        break;
      }
    }
  });

  // "Not right for" / honest-limitation disclaimer present somewhere.
  if (!/not (the )?right (fit|for)|honest limitation|outside Texas/i.test(bodyText)) {
    warn('"Not right for" / honest-limitation disclaimer not found', 0, '');
  }

  // Founder credibility surfaces in body or bio.
  if (!/Apollo Hospitals|IIM Trichy|30\+ nurse manager interviews|Deputy General Manager/.test(bodyText)) {
    warn('Founder credibility signal (Apollo / IIM Trichy / interviews) not found', 0, '');
  }

  return { file: path, draft: fm?.draft === 'true', failures, warnings };
}

function report(results) {
  let totalFails = 0;
  let totalWarns = 0;
  for (const r of results) {
    const status = r.failures.length === 0 ? PASS : FAIL;
    const draftTag = r.draft ? `${COLOR.dim}(draft)${COLOR.reset}` : `${COLOR.bold}(live)${COLOR.reset}`;
    console.log(`\n${status} ${basename(r.file)} ${draftTag}`);
    if (r.failures.length === 0 && r.warnings.length === 0) {
      console.log(`  ${COLOR.dim}all checks pass${COLOR.reset}`);
    }
    for (const f of r.failures) {
      console.log(`  ${FAIL} ${f.rule}`);
      if (f.lineNo > 0) console.log(`    ${COLOR.dim}L${f.lineNo}:${COLOR.reset} ${f.snippet}`);
      else if (f.snippet) console.log(`    ${COLOR.dim}${f.snippet}${COLOR.reset}`);
      totalFails++;
    }
    for (const w of r.warnings) {
      console.log(`  ${WARN} ${w.rule}`);
      if (w.lineNo > 0) console.log(`    ${COLOR.dim}L${w.lineNo}:${COLOR.reset} ${w.snippet}`);
      totalWarns++;
    }
  }
  console.log(
    `\n${COLOR.bold}Summary:${COLOR.reset} ${results.length} file(s) checked, ${totalFails} failure(s), ${totalWarns} warning(s)`
  );
  return totalFails;
}

function collectFiles(args) {
  const flags = new Set(args.filter((a) => a.startsWith('--')));
  const paths = args.filter((a) => !a.startsWith('--'));
  if (flags.has('--all') || flags.has('--live') || flags.has('--draft')) {
    const all = readdirSync(POSTS_DIR)
      .filter((f) => f.endsWith('.md'))
      .map((f) => resolve(POSTS_DIR, f));
    if (flags.has('--live')) {
      return all.filter((p) => !readFileSync(p, 'utf8').includes('draft: true'));
    }
    if (flags.has('--draft')) {
      return all.filter((p) => readFileSync(p, 'utf8').includes('draft: true'));
    }
    return all;
  }
  if (paths.length === 0) {
    console.error('Usage:');
    console.error('  npm run check-blog src/data/post/<slug>.md');
    console.error('  npm run check-blog -- --all     check every post');
    console.error('  npm run check-blog -- --live    check only live posts');
    console.error('  npm run check-blog -- --draft   check only drafts');
    process.exit(2);
  }
  return paths.map((p) => resolve(p));
}

const args = process.argv.slice(2);
const files = collectFiles(args);
const results = files.map(check);
const fails = report(results);
process.exit(fails > 0 ? 1 : 0);
