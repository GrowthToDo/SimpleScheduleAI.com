#!/usr/bin/env node
/**
 * Pre-publish mechanical checks for blog posts.
 *
 * The single authoritative MECHANICAL pre-publish linter for blog posts.
 * Every HARD FAIL here is a true, unambiguous, deterministic defect. Anything
 * fuzzy or context-dependent is a WARN, so the gate passes cleanly on
 * already-compliant posts. Trust over coverage.
 *
 * Per docs/seo/GOVERNANCE.md this script (with check-links/publish-gate/smoke)
 * is the single authoritative home of every mechanical rule — the checklist is
 * judgment-only and points here. A new greppable rule gets added HERE (with a
 * test), never to a doc. Works on drafts and live posts equally — frontmatter
 * draft: status is reported but does not affect rule application.
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
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, basename } from 'node:path';
import { checkFacts } from './lib/facts-rules.mjs';
import { checkPositioning } from './lib/positioning-rules.mjs';
import { overusedFamily } from './lib/image-pool.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = resolve(__dirname, '../src/data/post');
const IMAGE_POOL_PATH = resolve(__dirname, 'image-pool.json');

const COLOR = process.stdout.isTTY
  ? { red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', dim: '\x1b[90m', bold: '\x1b[1m', reset: '\x1b[0m' }
  : { red: '', green: '', yellow: '', dim: '', bold: '', reset: '' };

const PASS = `${COLOR.green}✓${COLOR.reset}`;
const FAIL = `${COLOR.red}✗${COLOR.reset}`;
const WARN = `${COLOR.yellow}⚠${COLOR.reset}`;

// AI-tone phrases that must not appear in our voice. Per checklist, verbatim
// Capterra/G2 reviewer quotes are exempted. We detect blockquote regions and
// skip them. Our paraphrasing must still avoid the phrase. This is the FULL
// checklist list.
const AI_TONE_PHRASES = [
  'delve',
  'dive into',
  "it's worth noting",
  'in conclusion',
  'in summary',
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
  'serves as',
  'stands as',
  'marks a',
  'represents a',
];

// Anything in this list is forbidden anywhere (including blockquotes — these
// are formatting characters, not vocabulary, so the reviewer-quote exemption
// does not apply).
const FORBIDDEN_DASHES = [
  { char: '—', name: 'em-dash' },
  { char: '–', name: 'en-dash' },
];

// Retired free-pilot language. The free pilot is RETIRED; any of these in the
// body is a hard failure (the offer is now flat paid pricing + book-a-call).
const RETIRED_PILOT_STRINGS = [
  '/pilot',
  'Apply for a Pilot Spot',
  'Claim a Pilot Spot',
  'free pilot',
  '60-day pilot',
  'Get a Free Schedule Review',
];

// Canonical booking host fragment for the secondary CTA.
const BOOKING_URL_FRAGMENT = 'cal.com/gautham-8bdvdx';

// Sources-section brand -> expected domain map. Keys are lowercase and
// word-boundary matched against the label text (before the first comma or
// bracket) on a numbered Sources line. If the label mentions a brand but the
// link's URL host does not end with the mapped domain, that is a hard fail.
const SOURCE_BRAND_DOMAINS = {
  findlaw: 'findlaw.com',
  cornell: 'cornell.edu',
  ecfr: 'ecfr.gov',
  cms: 'cms.gov',
  cdc: 'cdc.gov',
  niosh: 'cdc.gov',
  ahrq: 'ahrq.gov',
  jama: 'jamanetwork.com',
  'nsi nursing': 'nsinursingsolutions.com',
  'american nurses association': 'nursingworld.org',
  aonl: 'aonl.org',
  rhihub: 'ruralhealthinfo.org',
  'rural health information hub': 'ruralhealthinfo.org',
  dol: 'dol.gov',
  bls: 'bls.gov',
  'texas legislature': 'statutes.capitol.texas.gov',
  hrsa: 'hrsa.gov',
  pubmed: 'nih.gov',
  'national nurses united': 'nationalnursesunited.org',
};

function readFile(path) {
  try {
    return readFileSync(path, 'utf8').split(/\r?\n/);
  } catch (err) {
    console.error(`${FAIL} cannot read ${path}: ${err.message}`);
    process.exit(2);
  }
}

/**
 * Parse YAML-ish frontmatter. Captures top-level `key: value` pairs AND one
 * level of nested keys (e.g. `metadata:` followed by an indented `canonical:`),
 * exposing the deepest nested leaf on `fm` directly (so `fm.canonical` resolves
 * even though canonical is nested under `metadata:`). Top-level keys win over
 * nested keys of the same name.
 */
function extractFrontmatter(lines) {
  if (lines[0] !== '---') return null;
  const end = lines.indexOf('---', 1);
  if (end === -1) return null;
  const fm = {};
  const nested = {};
  let currentParent = null;
  let parentIndent = 0;
  for (let i = 1; i < end; i++) {
    const raw = lines[i];
    if (raw.trim() === '') continue;
    const indentMatch = raw.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1].length : 0;
    const kv = raw.match(/^(\s*)([\w-]+):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[2];
    const value = kv[3];
    if (indent === 0) {
      // Top-level key.
      currentParent = value === '' ? key : null;
      parentIndent = indent;
      if (value !== '') fm[key] = value;
    } else if (currentParent && indent > parentIndent) {
      // One level of nesting under the most recent parent-with-no-value.
      if (value !== '') nested[key] = value;
    }
  }
  // Merge nested leaves without clobbering top-level keys of the same name.
  for (const [k, v] of Object.entries(nested)) {
    if (!(k in fm)) fm[k] = v;
  }
  fm._end = end;
  return fm;
}

// Strip surrounding single/double quotes from a frontmatter scalar.
function unquote(v) {
  if (!v) return v;
  const t = v.trim();
  if ((t.startsWith("'") && t.endsWith("'")) || (t.startsWith('"') && t.endsWith('"'))) {
    return t.slice(1, -1);
  }
  return t;
}

// Extract excerpt text, handling single-line and YAML folded (`>`/`|`) blocks.
// The frontmatter parser does not capture folded continuation lines, so read
// them straight from the raw lines between `excerpt:` and the next top-level key.
function getExcerptText(lines, fmEnd) {
  const idx = lines.findIndex((l, i) => i < fmEnd && /^excerpt:/.test(l));
  if (idx === -1) return '';
  const inline = (lines[idx].match(/^excerpt:\s*(.*)$/)?.[1] || '').trim();
  if (inline && !/^[>|][-+]?$/.test(inline)) return unquote(inline);
  const parts = [];
  for (let i = idx + 1; i < fmEnd; i++) {
    if (/^\S/.test(lines[i])) break;
    if (lines[i].trim()) parts.push(lines[i].trim());
  }
  return parts.join(' ');
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

/**
 * GitHub-style heading slug, matching Astro's auto-generated heading IDs:
 * lowercase; drop any character that is not alphanumeric, space, or hyphen
 * (so `?`, `.`, `:`, `&`, parentheses are removed); trim; spaces -> hyphens;
 * collapse runs of hyphens. Markdown link syntax inside the heading is reduced
 * to its visible text first.
 */
function slugify(text) {
  return stripInlineMarkup(text)
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Reduce inline markdown/HTML in a heading or TOC label to plain visible text:
// [text](url) -> text, drop emphasis markers, strip stray tags.
function stripInlineMarkup(text) {
  return text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // [text](url) -> text
    .replace(/[*_`]+/g, '') // emphasis / code markers
    .replace(/<[^>]+>/g, '') // stray inline HTML
    .trim();
}

// Collect markdown ATX headings (level 2..6) from the body with their plain text.
function collectHeadings(lines, fromOffset) {
  const headings = [];
  lines.forEach((line, i) => {
    const m = line.match(/^(#{2,6})\s+(.*)$/);
    if (m) {
      const text = stripInlineMarkup(m[2]);
      headings.push({ level: m[1].length, text, raw: m[2].trim(), slug: slugify(m[2]), lineNo: fromOffset + i + 1 });
    }
  });
  return headings;
}

// Color-utility detector. Returns true only for genuine Tailwind COLOR
// utilities (bg-/text-/border- followed by a palette color + shade, or a
// named color). Layout utilities like text-left, text-xs, border-b,
// border-collapse, border-2 are NOT colors and return false — this is what
// keeps the dark-mode table check from false-positiving.
const NAMED_COLORS = new Set(['white', 'black', 'transparent', 'current', 'inherit']);
function colorPrefixOf(cls) {
  // cls is a bare utility token, possibly with a variant prefix already stripped.
  const m = cls.match(/^(bg|text|border)-(.+)$/);
  if (!m) return null;
  const prefix = m[1];
  const rest = m[2];
  // Named color, e.g. bg-white, text-black.
  if (NAMED_COLORS.has(rest)) return prefix;
  // Palette color + numeric shade, e.g. slate-100, blue-700, red-500.
  // Also tolerate an opacity suffix (blue-700/50) and arbitrary values.
  if (/^[a-z]+-\d{2,3}(\/\d{1,3})?$/.test(rest)) return prefix;
  if (/^\[#?[0-9a-fA-F]{3,8}\]$/.test(rest)) return prefix; // arbitrary hex value
  // Everything else (left, center, xs, sm, lg, b, b-2, t, collapse, 2, x, y...)
  // is a layout/size/style utility, not a color.
  return null;
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

  const selfSlug = basename(path, '.md');
  const bodyText = body.join('\n');

  // --- HARD GATES ---

  // 1. No em-dashes or en-dashes anywhere (including frontmatter and blockquotes).
  lines.forEach((line, i) => {
    for (const d of FORBIDDEN_DASHES) {
      if (line.includes(d.char)) fail(`No ${d.name}s`, i + 1, line.trim().slice(0, 100));
    }
  });

  // 2. No AI-tone phrases in our voice (blockquotes exempt — verbatim quotes
  //    can contain the word, our paraphrasing cannot). The canonical italic
  //    author-bio line is also exempt: its exact wording ("He serves as Deputy
  //    General Manager of Operations at Apollo Hospitals") is mandated verbatim
  //    by the checklist, so "serves as" there is required, not AI-slop.
  body.forEach((line, i) => {
    if (inBlockquote(line)) return;
    if (/_\[Pradeep Pandey\]\(\/about\/pradeep-pandey\)/.test(line)) return;
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
      fail(
        'Blank line inside <div> block (Astro escapes subsequent tags)',
        i + 1,
        `(block opened at line ${divStart + 1})`
      );
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
  const allPostFiles = readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));
  const draftSlugs = allPostFiles
    .map((f) => ({ slug: basename(f, '.md'), path: resolve(POSTS_DIR, f) }))
    .filter(({ path: p }) => {
      try {
        return readFileSync(p, 'utf8').includes('draft: true');
      } catch {
        return false;
      }
    })
    .map(({ slug }) => slug);
  body.forEach((line, i) => {
    for (const slug of draftSlugs) {
      if (slug === selfSlug) continue;
      const re = new RegExp(`\\(/blog/${slug}\\)`);
      if (re.test(line)) fail(`Link to draft post /blog/${slug}`, bodyOffset + i + 1, line.trim().slice(0, 120));
    }
  });

  // 7. No DSHS for Texas hospital LICENSING (licensing moved to HHSC Jan 2025).
  //    DSHS remains a valid source for health statistics (e.g. the Texas Center
  //    for Nursing Workforce Studies / Hospital Nurse Staffing Study), so only
  //    flag DSHS when it co-occurs with licensing language on the same line.
  body.forEach((line, i) => {
    if (/\bDSHS\b/.test(line) && /licens/i.test(line))
      fail('DSHS — Texas hospital licensing is HHSC since Jan 2025', bodyOffset + i + 1, line.trim().slice(0, 100));
  });

  // 8. No Texas Labor Code §62.002 cite (wrong section — that is state
  //    minimum wage, not overtime).
  body.forEach((line, i) => {
    if (/§?\s*62\.002/.test(line) && /Texas Labor Code/i.test(line)) {
      fail(
        'Texas Labor Code §62.002 — wrong section (use FLSA Fact Sheet #54)',
        bodyOffset + i + 1,
        line.trim().slice(0, 120)
      );
    }
  });

  // 9. No FLSA 8-and-80 attributed to SimpleScheduleAI as a built-in feature.
  //    Educational mentions of the rule are fine.
  body.forEach((line, i) => {
    if (inBlockquote(line)) return;
    if (/8-and-80/.test(line)) {
      // Only flag when the SSAI verb directly governs 8-and-80 within the same
      // sentence (short gap, no period), so educational/"confirm with us" mentions
      // in the same paragraph-line are not false-flagged.
      const ssaiAttrib =
        /(simplescheduleai|ssai|the service|our (service|scheduler))\s+(builds?|tracks?|applies|enforces?|handles?|has?|includes?|covers?|uses?)[^.]{0,60}8-and-80/i.test(
          line
        );
      const featurePhrasing = /8-and-80[^.]{0,40}(built in|built-in|by default|automatic|applied automatically)/i.test(
        line
      );
      if (ssaiAttrib || featurePhrasing) {
        fail(
          'FLSA 8-and-80 attributed to SimpleScheduleAI as a feature (not yet shipped)',
          bodyOffset + i + 1,
          line.trim().slice(0, 120)
        );
      }
    }
  });

  // 9b. Facts drift: known stats/regs must match docs/seo/facts-dossier.md wording.
  for (const v of checkFacts(bodyText)) {
    fail(`Facts drift [${v.id}]: ${v.message} -> docs/seo/${v.anchor}`, bodyOffset + v.line, v.text);
  }

  // 10. Frontmatter: image present and (for remote URLs) not quoted; author
  //     canonical name. The checklist no-quotes rule targets remote `https://`
  //     featured images. A quoted local `~/assets...` path is defensible YAML
  //     (a bare leading `~` is significant in YAML), so it is a WARN, not a
  //     hard fail — only quoted REMOTE URLs hard-fail.
  if (fm) {
    if (fm.image && (fm.image.startsWith("'") || fm.image.startsWith('"'))) {
      const inner = unquote(fm.image);
      if (/^https?:\/\//i.test(inner)) {
        fail('Frontmatter image: remote URL must not be quoted', 0, `image: ${fm.image.slice(0, 80)}`);
      } else {
        warn(
          'Frontmatter image: local-asset path is quoted (acceptable, but unquoted preferred)',
          0,
          `image: ${fm.image.slice(0, 80)}`
        );
      }
    }
    if (!fm.image) fail('Frontmatter image: missing', 0, '');
    if (fm.author && !/Pradeep Pandey/.test(fm.author)) {
      warn(`Frontmatter author: not Pradeep Pandey (${fm.author})`, 0, '');
    }
  }

  // 11. Required internal hub links: both pillars + /how-it-works (HARD).
  //     /ai-nurse-scheduling is a WARN-only third hub (handled below).
  const requiredHubs = [
    { path: '/nurse-scheduling-software', label: 'pillar 1 (nurse scheduling software)' },
    { path: '/critical-access-hospital-scheduling', label: 'pillar 2 (critical access hospital scheduling)' },
    { path: '/how-it-works', label: '/how-it-works' },
  ];
  for (const r of requiredHubs) {
    if (!bodyText.includes(`(${r.path})`)) fail(`Required link missing: ${r.label}`, 0, '');
  }

  // 12a. Retired free-pilot language must not appear in the body (INVERTED from
  //      the old "require /pilot" rule — the free pilot is retired).
  RETIRED_PILOT_STRINGS.forEach((needle) => {
    body.forEach((line, i) => {
      if (line.includes(needle)) {
        fail(
          `Retired free-pilot reference "${needle}" (pilot is retired)`,
          bodyOffset + i + 1,
          line.trim().slice(0, 120)
        );
      }
    });
  });

  // 12b. CTA requirement: a primary CTA (See pricing -> /pricing OR See how it
  //      works -> /how-it-works) AND a secondary "Book a call with our team"
  //      with the canonical cal.com URL.
  const hasPricingCTA = /See pricing/i.test(bodyText) && /href=["']\/pricing/i.test(bodyText);
  const hasHowItWorksCTA = /See how it works/i.test(bodyText) && /href=["']\/how-it-works/i.test(bodyText);
  if (!hasPricingCTA && !hasHowItWorksCTA) {
    fail('Primary CTA missing: "See pricing" -> /pricing OR "See how it works" -> /how-it-works', 0, '');
  }
  const hasBookCall = /Book a call with our team/i.test(bodyText);
  const hasBookingUrl = bodyText.includes(BOOKING_URL_FRAGMENT);
  if (!hasBookCall || !hasBookingUrl) {
    const missing = [];
    if (!hasBookCall) missing.push('"Book a call with our team" text');
    if (!hasBookingUrl) missing.push(`${BOOKING_URL_FRAGMENT} URL`);
    fail(`Secondary CTA missing: ${missing.join(' + ')}`, 0, '');
  }

  // 12c. CTA structure: one primary button + a "Book a call" text link below it.
  //      The deprecated two-button row (flex flex-col sm:flex-row) is banned, and
  //      there must be exactly ONE CTA box per post (one canonical booking link).
  body.forEach((line, i) => {
    if (line.includes('flex flex-col sm:flex-row')) {
      fail(
        'Two-button CTA row (flex flex-col sm:flex-row): use one primary button + a "Book a call with our team" text link below it',
        bodyOffset + i + 1,
        line.trim().slice(0, 120)
      );
    }
  });
  // Count actual CTA BOXES by the canonical box background, not booking links
  // (a post may legitimately have an inline cal.com link in a "What to Do" step
  // without that being a second CTA box).
  const ctaBoxCount = (bodyText.match(/bg-blue-50 dark:bg-slate-800/g) || []).length;
  if (ctaBoxCount > 1) {
    fail(`More than one CTA box (${ctaBoxCount}): exactly one CTA box per post, after "What to Do This Week"`, 0, '');
  }

  // 13. Author bio canonical italic-linked format (not the older block format).
  if (/\*\*Written by Pradeep Pandey\*\*/.test(bodyText)) {
    fail('Old "**Written by Pradeep Pandey**" bio format — use italic-linked', 0, '');
  }
  if (!/_\[Pradeep Pandey\]\(\/about\/pradeep-pandey\)/.test(bodyText)) {
    fail('Italic-linked author bio not found at end', 0, '');
  }

  // A. Canonical matches slug.
  if (fm && fm.canonical) {
    const canon = unquote(fm.canonical);
    // Newsroom pieces live in src/data/article and canonicalize under /articles/;
    // blog posts under /blog/. Pick the section from the file path.
    const section = /[\\/]article[\\/]/.test(path) ? 'articles' : 'blog';
    const expected = `https://simplescheduleai.com/${section}/${selfSlug}`;
    if (canon !== expected) {
      fail(`Canonical does not match slug (expected ${expected}, got ${canon})`, 0, '');
    }
  } else if (fm) {
    warn('Canonical URL absent from frontmatter (expected under metadata:)', 0, '');
  }

  // B. Merged heading / stray glued `?`.
  body.forEach((line, i) => {
    const isHeading = /^#{1,6}\s/.test(line);
    // Heading with text after the `?` on the same line.
    if (/^#{2,6}\s.*\?.+$/.test(line)) {
      fail(
        'Merged heading: text after `?` on the same line (heading must sit alone)',
        bodyOffset + i + 1,
        line.trim().slice(0, 120)
      );
    }
    // A body sentence then a glued `?` (e.g. "...how-it-works).?"). Headings
    // legitimately end in `?`, so skip them. Also skip lowercase abbreviation
    // dots (a.m.? / p.m.? / e.g.? / i.e.?) — that `.` is not a sentence end.
    if (!isHeading && /[.?!]\?\s*$/.test(line) && !/\b([ap]\.m|e\.g|i\.e)\.\?\s*$/i.test(line)) {
      fail('Stray glued `?` after sentence punctuation', bodyOffset + i + 1, line.trim().slice(0, 120));
    }
  });

  // C. No "CAH" in headings / table headers / figcaptions (body prose is fine).
  body.forEach((line, i) => {
    if (/^#{1,6}\s/.test(line) && /\bCAH\b/.test(line)) {
      fail(
        '"CAH" abbreviation in a heading (spell out Critical Access Hospital)',
        bodyOffset + i + 1,
        line.trim().slice(0, 120)
      );
    }
    if (/<th\b[^>]*>[^<]*\bCAH\b/i.test(line)) {
      fail('"CAH" abbreviation in a table header <th>', bodyOffset + i + 1, line.trim().slice(0, 120));
    }
    if (/<figcaption\b[^>]*>[^<]*\bCAH\b/i.test(line)) {
      fail('"CAH" abbreviation in a <figcaption>', bodyOffset + i + 1, line.trim().slice(0, 120));
    }
  });

  // D. No stray MDX in a .md file.
  body.forEach((line, i) => {
    if (/^import\s/.test(line)) {
      fail('Stray MDX `import` in a .md file (renders as literal text)', bodyOffset + i + 1, line.trim().slice(0, 120));
    }
    if (line.includes('astro:assets')) {
      fail('Stray MDX `astro:assets` reference in a .md file', bodyOffset + i + 1, line.trim().slice(0, 120));
    }
    if (/<Image[\s/>]/.test(line)) {
      fail(
        'Stray MDX `<Image>` component in a .md file (use <img> or markdown image)',
        bodyOffset + i + 1,
        line.trim().slice(0, 120)
      );
    }
  });

  // E. TOC integrity — broken jump links + visible-text mismatch.
  if (toc) {
    const headings = collectHeadings(body, bodyOffset).filter((h) => h.level === 2 || h.level === 3);
    const headingBySlug = new Map();
    for (const h of headings) {
      if (!headingBySlug.has(h.slug)) headingBySlug.set(h.slug, h);
    }
    for (let i = toc.start + 1; i < toc.end; i++) {
      const line = lines[i];
      // Skip entries the existing rules already handle (Sources/FAQ exclusion).
      if (/\[Sources?\]|\[A Note on Sources\]|\[Frequently Asked Questions\]|\[FAQ\]/i.test(line)) continue;
      const linkRe = /\[([^\]]+)\]\(#([^)]+)\)/g;
      let m;
      while ((m = linkRe.exec(line)) !== null) {
        const visible = stripInlineMarkup(m[1]);
        const anchor = m[2].trim().toLowerCase();
        const target = headingBySlug.get(anchor);
        if (!target) {
          fail(`TOC broken jump link: #${anchor} matches no H2/H3 slug`, i + 1, line.trim().slice(0, 120));
        } else if (visible !== target.text) {
          fail(
            `TOC text mismatch: link reads "${visible}" but heading is "${target.text}"`,
            i + 1,
            line.trim().slice(0, 140)
          );
        }
      }
    }
  }

  // F. Sources numbered, not bulleted.
  const sourcesStart = body.findIndex((l) => /^##\s+(A Note on Sources|Sources)\b/i.test(l));
  if (sourcesStart !== -1) {
    let sourcesEnd = body.length;
    for (let i = sourcesStart + 1; i < body.length; i++) {
      if (/^##\s/.test(body[i])) {
        sourcesEnd = i;
        break;
      }
    }
    for (let i = sourcesStart + 1; i < sourcesEnd; i++) {
      // A reference list item rendered as a bullet (markdown `- ` or `* `).
      if (/^\s*[-*]\s+\S/.test(body[i])) {
        fail('Sources entry is bulleted (must be a numbered list)', bodyOffset + i + 1, body[i].trim().slice(0, 120));
      }
      // Sources label/URL domain mismatch: the label names a known brand but
      // the link host does not belong to that brand's domain.
      const srcMatch = body[i].match(/^\d+\.\s+([^,[]+),?\s*\[.*\]\((https?:[^)]+)\)/);
      if (srcMatch) {
        const label = srcMatch[1].trim().toLowerCase();
        const url = srcMatch[2];
        let host = '';
        try {
          host = new URL(url).host.toLowerCase();
        } catch {
          /* unparseable URL; skip domain check */
        }
        if (host) {
          for (const [brand, domain] of Object.entries(SOURCE_BRAND_DOMAINS)) {
            const brandRe = new RegExp(`\\b${brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            if (brandRe.test(label) && !host.endsWith(domain)) {
              fail(
                `Sources label/URL mismatch: label mentions "${brand}" but URL host is ${host}`,
                bodyOffset + i + 1,
                body[i].trim().slice(0, 140)
              );
            }
          }
        }
      }
    }
  }

  // G. Date sanity.
  if (fm) {
    const pub = unquote(fm.publishDate || '');
    const upd = unquote(fm.updateDate || '');
    if (/^2099/.test(pub)) {
      fail('publishDate year is 2099 (placeholder date)', 0, `publishDate: ${pub}`);
    }
    if (pub && upd) {
      const pubD = new Date(pub);
      const updD = new Date(upd);
      if (!isNaN(pubD) && !isNaN(updD) && updD < pubD) {
        fail(`updateDate (${upd}) is earlier than publishDate (${pub})`, 0, '');
      }
    }
  }

  // H. Key Takeaways present and before TOC.
  const ktIdx = body.findIndex((l) => /^##\s+Key Takeaways\b/i.test(l));
  const tocIdxInBody = body.findIndex((l) => /^##\s+Table of Contents\b/i.test(l));
  if (ktIdx === -1) {
    fail('## Key Takeaways heading missing', 0, '');
  } else if (tocIdxInBody !== -1 && ktIdx > tocIdxInBody) {
    fail('## Key Takeaways appears AFTER ## Table of Contents (must be before)', bodyOffset + ktIdx + 1, '');
  }

  // I. No TL;DR.
  body.forEach((line, i) => {
    if (/^#+\s*TL;DR/i.test(line)) {
      fail('TL;DR heading present (Key Takeaways replaces TL;DR)', bodyOffset + i + 1, line.trim().slice(0, 100));
    } else if (/\*\*TL;DR/i.test(line)) {
      fail('**TL;DR label present (Key Takeaways replaces TL;DR)', bodyOffset + i + 1, line.trim().slice(0, 100));
    }
  });

  // J. Image-pool cross-reference (Unsplash featured images only).
  if (fm && fm.image) {
    const imgVal = unquote(fm.image);
    const photoMatch = imgVal.match(/photo-([a-zA-Z0-9_-]+)/);
    const isUnsplash = /images\.unsplash\.com/.test(imgVal) || photoMatch;
    if (isUnsplash && photoMatch) {
      const id = photoMatch[1];
      let pool;
      try {
        pool = JSON.parse(readFileSync(IMAGE_POOL_PATH, 'utf8'));
      } catch (err) {
        warn(`Cannot read image pool for cross-ref: ${err.message}`, 0, '');
        pool = null;
      }
      if (Array.isArray(pool)) {
        const inPool = pool.some((p) => p && p.id === id);
        if (!inPool) {
          fail(`Featured image id "${id}" not found in scripts/image-pool.json`, 0, '');
        }
        // Duplicate use across other posts + family usage by live siblings.
        const dupes = [];
        const siblingImages = [];
        for (const f of allPostFiles) {
          if (basename(f, '.md') === selfSlug) continue;
          try {
            const raw = readFileSync(resolve(POSTS_DIR, f), 'utf8');
            const otherFm = extractFrontmatter(raw.split(/\r?\n/));
            const otherImg = otherFm && otherFm.image ? unquote(otherFm.image) : '';
            const otherMatch = otherImg.match(/photo-([a-zA-Z0-9_-]+)/);
            if (otherMatch && otherMatch[1] === id) dupes.push(basename(f, '.md'));
            if (otherMatch) {
              siblingImages.push({
                slug: basename(f, '.md'),
                imageId: otherMatch[1],
                live: !raw.includes('draft: true'),
              });
            }
          } catch {
            /* ignore unreadable sibling */
          }
        }
        if (dupes.length > 0) {
          fail(`Featured image id "${id}" duplicated in: ${dupes.join(', ')}`, 0, '');
        }
        // Visually near-duplicate heroes pass the exact-ID check; the family
        // field catches them. WARN (human judges) when the chosen image's
        // family is already the hero family of 3+ LIVE posts.
        const over = overusedFamily(pool, id, siblingImages, 3);
        if (over) {
          warn(
            `Image family "${over.family}" already used by ${over.count} live posts (${over.slugs.slice(0, 6).join(', ')}${over.slugs.length > 6 ? ', ...' : ''}) — pick a different visual family`,
            0,
            ''
          );
        }
      }
    } else {
      warn(
        `Featured image is not an Unsplash /photo- URL — skipped image-pool cross-ref (${imgVal.slice(0, 70)})`,
        0,
        ''
      );
    }
  }

  // K. Dark-mode variants on tables. For each <table>...</table> region, if any
  //    non-dark COLOR utility of a given prefix (bg-/text-/border-) appears, a
  //    matching dark: utility of the same prefix must appear somewhere in that
  //    same region. Layout/size/style utilities (text-left, border-b, etc.) are
  //    ignored via colorPrefixOf, which only matches real color tokens.
  const tableRegions = [];
  {
    const tableOpenRe = /<table\b/gi;
    let searchFrom = 0;
    while (true) {
      const openIdx = bodyText.indexOf('<table', searchFrom);
      if (openIdx === -1) break;
      // Confirm it's a tag boundary (<table or <table ...>).
      const after = bodyText[openIdx + 6];
      if (after !== undefined && !/[\s>]/.test(after)) {
        searchFrom = openIdx + 6;
        continue;
      }
      const closeIdx = bodyText.indexOf('</table>', openIdx);
      const end = closeIdx === -1 ? bodyText.length : closeIdx + '</table>'.length;
      tableRegions.push(bodyText.slice(openIdx, end));
      searchFrom = end;
    }
    void tableOpenRe;
  }
  for (let t = 0; t < tableRegions.length; t++) {
    const region = tableRegions[t];
    const classAttrRe = /class\s*=\s*["']([^"']*)["']/gi;
    const nonDark = { bg: new Set(), text: new Set(), border: new Set() };
    const darkPrefixes = new Set();
    let cm;
    while ((cm = classAttrRe.exec(region)) !== null) {
      const tokens = cm[1].split(/\s+/).filter(Boolean);
      for (const tok of tokens) {
        if (tok.startsWith('dark:')) {
          const inner = tok.slice('dark:'.length);
          const p = colorPrefixOf(inner);
          if (p) darkPrefixes.add(p);
          continue;
        }
        // Skip any other variant-prefixed utility (sm:, hover:, etc.) for the
        // "needs a dark variant" accounting — only bare color utilities require
        // a dark counterpart.
        if (tok.includes(':')) continue;
        const p = colorPrefixOf(tok);
        if (p) nonDark[p].add(tok);
      }
    }
    for (const prefix of ['bg', 'text', 'border']) {
      if (nonDark[prefix].size > 0 && !darkPrefixes.has(prefix)) {
        // Demoted from fail to warn 2026-07-21: site is light:only (founder
        // decision), so dark: variants are unreachable. Kept as a warn so the
        // signal survives if dark mode is ever re-enabled.
        warn(
          `Table has no dark: variant for ${prefix}-* colors (table #${t + 1}) — fine while the site is light:only`,
          0,
          ''
        );
      }
    }
  }

  // L. "Our Take" callout placement: one per post, immediately before the
  //    "What to Do This Week" section (no H2 heading may separate them).
  const ourTakeIdxs = [];
  body.forEach((l, i) => {
    if (/>\s*Our Take\s*</.test(l)) ourTakeIdxs.push(i);
  });
  const whatToDoIdx = body.findIndex((l) => /^##\s+What\b.*\bDo This Week/i.test(l));
  if (ourTakeIdxs.length > 1) {
    fail(`More than one "Our Take" callout (${ourTakeIdxs.length}): one per post`, bodyOffset + ourTakeIdxs[1] + 1, '');
  }
  if (ourTakeIdxs.length >= 1 && whatToDoIdx !== -1) {
    const otIdx = ourTakeIdxs[0];
    if (otIdx > whatToDoIdx) {
      fail(
        '"Our Take" callout is after "What to Do This Week" (must sit immediately before it)',
        bodyOffset + otIdx + 1,
        ''
      );
    } else {
      let h2Between = false;
      for (let j = otIdx + 1; j < whatToDoIdx; j++) {
        if (/^##\s/.test(body[j])) {
          h2Between = true;
          break;
        }
      }
      if (h2Between) {
        fail(
          '"Our Take" callout is not in the section immediately before "What to Do This Week" (an H2 heading separates them)',
          bodyOffset + otIdx + 1,
          ''
        );
      }
    }
  }

  // --- SOFT WARNINGS ---

  // /ai-nurse-scheduling third hub — required only where the post discusses AI
  // scheduling. WARN only.
  const discussesAI = /\bAI\b/.test(bodyText) || /artificial intelligence/i.test(bodyText);
  if (discussesAI && !bodyText.includes('(/ai-nurse-scheduling)')) {
    warn('Third hub /ai-nurse-scheduling not linked (post discusses AI scheduling)', 0, '');
  }

  // In-body images whose src is neither .webp nor an Unsplash URL.
  body.forEach((line, i) => {
    // HTML <img src="...">
    const htmlImg = line.match(/<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/i);
    // Markdown ![alt](src)
    const mdImg = line.match(/!\[[^\]]*\]\(([^)]+)\)/);
    const src = htmlImg ? htmlImg[1] : mdImg ? mdImg[1] : null;
    if (src) {
      const isWebp = /\.webp(\?|$)/i.test(src);
      const isUnsplash = /images\.unsplash\.com|\/photo-/.test(src);
      if (!isWebp && !isUnsplash) {
        warn(`In-body image src is neither .webp nor Unsplash (${src.slice(0, 70)})`, bodyOffset + i + 1, '');
      }
    }
  });

  // <table> missing the standard layout classes table-fixed / break-words / align-top.
  for (let t = 0; t < tableRegions.length; t++) {
    const region = tableRegions[t];
    const missingStd = ['table-fixed', 'break-words', 'align-top'].filter(
      (c) => !new RegExp(`\\b${c}\\b`).test(region)
    );
    if (missingStd.length > 0) {
      warn(`Table #${t + 1} missing standard class(es): ${missingStd.join(', ')}`, 0, '');
    }
  }

  // Word count vs the DECLARED post type. The funnel type is not inferable from
  // the file, so it is declared in frontmatter (postType). We WARN only when the
  // count is outside that type's range, so a TOFU at 5000 words is flagged while
  // a BOFU at 5000 is not. If postType is absent, skip (dormant until the field
  // is added); an unknown value is flagged so typos surface.
  const WORD_RANGES = {
    glossary: [600, 1600], // definitional + CoP/requirements references run 1000-1600 in this corpus; 600-1000 false-warned on every glossary post
    tofu: [1000, 1500],
    mofu: [1500, 2500],
    comparison: [1500, 4500], // single-competitor comparisons run deep (full profile + limitations + verdict)
    howto: [2000, 3000],
    bofu: [3000, 5500], // comprehensive 10-tool buyer guides with verbatim quotes earn the headroom
  };
  const wordCount = bodyText
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`|]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  const postType = fm && fm.postType ? unquote(fm.postType).toLowerCase() : null;
  if (postType && WORD_RANGES[postType]) {
    const [lo, hi] = WORD_RANGES[postType];
    if (wordCount < lo || wordCount > hi) {
      warn(`Body word count ${wordCount} is outside the ${postType} range (${lo}-${hi})`, 0, '');
    }
  } else if (postType) {
    warn(`Unknown postType "${postType}" (use glossary|tofu|mofu|comparison|howto|bofu)`, 0, '');
  }

  // Hyperlinks and references (internal links AND external source citations)
  // should appear EARLY — ideally within the first 2 content sections — so an
  // LLM sees the link/reference signal up front. Soft heuristic (not every post
  // fits); WARN only when the post HAS hyperlinks but NONE land in the early
  // zone (intro + Key Takeaways + first 2 content sections). TOC #-anchors and
  // the boilerplate author-bio /about link are excluded.
  {
    const contentH2 = [];
    body.forEach((l, i) => {
      if (/^##\s/.test(l) && !/^##\s+(Key Takeaways|Table of Contents)\b/i.test(l)) contentH2.push(i);
    });
    const earlyEnd = contentH2.length >= 3 ? contentH2[2] : body.length;
    let earlyLinks = 0;
    let totalLinks = 0;
    body.forEach((line, i) => {
      const re = /\]\(((?!#)[^)]+)\)/g; // any markdown link whose href is not a #anchor
      let m;
      while ((m = re.exec(line)) !== null) {
        if (m[1].includes('/about/pradeep-pandey')) continue;
        totalLinks++;
        if (i < earlyEnd) earlyLinks++;
      }
    });
    if (totalLinks > 0 && earlyLinks === 0) {
      warn(
        `No hyperlink/reference in the first 2 sections (${totalLinks} link(s) total, all later). Front-load a link or source reference early for LLM signal.`,
        0,
        ''
      );
    }
  }

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

  // Author bio references Critical Access Hospitals (any phrasing). Checks the
  // bio line itself, so valid variants like "built for Texas Critical Access
  // Hospitals" pass; only a bio with no CAH reference at all warns.
  const bioLine = body.find((l) => /_\[Pradeep Pandey\]\(\/about\/pradeep-pandey\)/.test(l));
  if (bioLine && !/Critical Access Hospital/.test(bioLine)) {
    warn('Author bio does not reference Critical Access Hospitals', 0, '');
  }

  // Excerpt readability: a meta-description sentence over 40 words reads as a
  // run-on and gets truncated in SERPs. Flag the longest offending sentence.
  const excerptText = fm ? getExcerptText(lines, fm._end) : '';
  if (excerptText) {
    for (const s of excerptText.split(/(?<=[.!?])\s+/)) {
      const wc = s.split(/\s+/).filter(Boolean).length;
      if (wc > 40) {
        warn(
          `Excerpt has a ${wc}-word sentence (>40) — split it; long run-ons read poorly and get truncated as a meta description`,
          0,
          s.slice(0, 90)
        );
        break;
      }
    }
  }

  // "managed service" as a SELF-label is banned (SSAI self-label = "AI-native
  // nurse scheduling service"). Category/comparison/model-description uses are
  // fine, so match only the two clearest self-label shapes to avoid false hits.
  const managedSelfLabel = [
    /SimpleScheduleAI\b[^.\n]{0,40}\bis an?\b[^.\n]{0,15}managed[- ]service/i,
    /\bour\s+managed[- ][\w\s]{0,30}?service\b/i,
  ];
  for (const re of managedSelfLabel) {
    const m = bodyText.match(re);
    if (m) {
      warn(
        `Possible "managed service" SELF-label ("${m[0].trim().slice(0, 48)}") — use "AI-native nurse scheduling service"; category/comparison use is fine`,
        0,
        ''
      );
      break;
    }
  }

  // Positioning-registry drift (docs/seo/positioning-registry.md): product-mode
  // phrase leaks into service-mode content, triad wording drift, novel
  // we-do-X-for-you constructions, and retired "live demo" wording. All
  // WARN-severity — judgment-adjacent phrasing, not deterministic defects.
  for (const v of checkPositioning(bodyText)) {
    warn(`Positioning drift [${v.id}]: ${v.message} -> docs/seo/${v.anchor}`, bodyOffset + v.line, v.text);
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

// Count, for each post in the set, how many OTHER posts in the set link to it
// via a /blog/<slug> internal link (distinct source posts; self-links ignored).
function computeInboundCounts(files) {
  const inbound = new Map();
  const linkRe = /\/blog\/([a-z0-9-]+)/g;
  const perFile = files.map((f) => {
    const slug = basename(f, '.md');
    const text = readFileSync(f, 'utf8');
    const targets = new Set();
    let m;
    while ((m = linkRe.exec(text)) !== null) {
      if (m[1] !== slug) targets.add(m[1]);
    }
    return { slug, targets };
  });
  for (const { slug } of perFile) inbound.set(slug, 0);
  for (const { targets } of perFile) {
    for (const t of targets) {
      if (inbound.has(t)) inbound.set(t, inbound.get(t) + 1);
    }
  }
  return inbound;
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

// Corpus-level orphan check: a per-file gate cannot see inbound links, so this
// runs only when checking the whole set (--all/--live/--draft, >3 files). A
// live post with <2 inbound internal links from sibling posts is an orphan:
// crawlers get a weak or absent path to it, which strands it in GSC's
// "Crawled/Discovered - currently not indexed" limbo. WARN, never fail.
if (files.length > 3) {
  const inbound = computeInboundCounts(files);
  for (const r of results) {
    if (r.draft) continue;
    const n = inbound.get(basename(r.file, '.md')) || 0;
    if (n < 2) {
      r.warnings.push({
        rule: `Internal-link orphan: ${n} inbound internal link(s) from sibling posts (need >=2). Link this post from >=2 related posts so crawlers and readers can reach it.`,
        lineNo: 0,
        snippet: '',
      });
    }
  }
}

const fails = report(results);
process.exit(fails > 0 ? 1 : 0);
