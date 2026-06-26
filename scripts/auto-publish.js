#!/usr/bin/env node
/**
 * auto-publish.js
 *
 * Finds blog posts due for publishing today (publishDate === today, draft: true),
 * runs pre-publish checks, and (only with --publish) flips draft:false + commits + pushes.
 *
 * The authoritative MECHANICAL gate is scripts/check-blog.mjs. This script delegates every
 * grep-able rule (dashes, AI-tone, canonical, links, dark-mode tables, image-pool, TOC, etc.)
 * to it (single source of truth) and adds only what check-blog cannot do: image actually
 * loads (HEAD), image is on-topic (Claude vision), prettier, plus a couple of niche static
 * checks (duplicate brand headings, invalid Tailwind slate shades).
 *
 * Usage:
 *   node scripts/auto-publish.js                     — check only; report what WOULD publish (safe default, no git ops)
 *   node scripts/auto-publish.js --publish           — flip draft, commit, and push posts that pass every check
 *   node scripts/auto-publish.js --check-file <path> — run all checks on one file, no publish
 *
 * Publishing requires the explicit --publish flag (publish-only-on-explicit-instruction rule);
 * a bare run, --dry-run, or a cron invocation never commits or pushes.
 *
 * Results are appended to PUBLISHING-LOG.md in the project root.
 *
 * Image relevance: ID in image-pool.json → approved; else ANTHROPIC_API_KEY → Claude vision;
 * else blocked with instructions to add the ID to image-pool.json.
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, basename, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const POSTS_DIR = join(ROOT, 'src', 'data', 'post');
const LOG_FILE = join(ROOT, 'PUBLISHING-LOG.md');
const IMAGE_POOL_FILE = join(__dirname, 'image-pool.json');
const CHECK_BLOG = join(__dirname, 'check-blog.mjs');

// Publishing is opt-in. A bare run (or --dry-run, or cron) only checks and reports.
const PUBLISH = process.argv.includes('--publish');
const CHECK_FILE_INDEX = process.argv.indexOf('--check-file');
const CHECK_FILE = CHECK_FILE_INDEX >= 0 ? process.argv[CHECK_FILE_INDEX + 1] : null;

// ─── helpers ────────────────────────────────────────────────────────────────

function todayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const fm = match[1];

  const get = (key) => {
    const re = new RegExp(`^${key}:\\s*['"]?([^'"\\r\\n]+?)['"]?\\s*$`, 'm');
    const m = fm.match(re);
    return m ? m[1].trim() : null;
  };

  const canonicalMatch = fm.match(/canonical:\s*['"]?([^'"\r\n]+?)['"]?\s*$/m);

  const tagsMatch = fm.match(/^tags:\s*\n((?:\s+-\s+.+\n?)*)/m);
  const tags = tagsMatch
    ? tagsMatch[1]
        .split('\n')
        .map((l) => l.replace(/^\s*-\s*/, '').trim())
        .filter(Boolean)
    : [];

  return {
    draft: get('draft') === 'true',
    publishDate: get('publishDate'),
    title: get('title'),
    image: get('image'),
    canonical: canonicalMatch ? canonicalMatch[1].trim() : null,
    tags,
  };
}

function appendLog(text) {
  let existing = '';
  try {
    existing = readFileSync(LOG_FILE, 'utf8');
  } catch {
    // file doesn't exist yet
  }
  writeFileSync(LOG_FILE, existing + `\n${text}\n`, 'utf8');
  console.log(text);
}

function run(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8' });
}

function loadImagePool() {
  try {
    return JSON.parse(readFileSync(IMAGE_POOL_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function extractUnsplashPhotoId(url) {
  if (!url) return null;
  const m = url.match(/photo-([a-zA-Z0-9-]+)/);
  return m ? m[1] : null;
}

// ─── checks ─────────────────────────────────────────────────────────────────

// Authoritative mechanical gate. Every grep-able rule (dashes, AI-tone, canonical,
// pillar links, TOC integrity, merged headings, CAH-in-headings, image-pool membership
// + dedupe, dark-mode tables, date sanity, Key-Takeaways-before-TOC, retired-pilot ban,
// and the rest) lives in check-blog.mjs. We run it and surface its hard failures here so
// there is a single source of truth, not a divergent second rule set.
function runCheckBlog(filePath) {
  try {
    execSync(`node "${CHECK_BLOG}" "${filePath}"`, { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' });
    return [];
  } catch (err) {
    const out = `${err.stdout || ''}${err.stderr || ''}`.trim();
    return [`  check-blog.mjs hard failures:\n${out}`];
  }
}

async function checkImageUrl(fm) {
  if (!fm.image) return ['  Image URL missing from frontmatter'];
  if (fm.image.includes('placeholder') || fm.image === '') {
    return ['  Image URL appears to be a placeholder'];
  }
  // Local / relative assets (e.g. ~/assets/...) are bundled and validated at build time, not fetchable.
  if (!/^https?:\/\//i.test(fm.image)) return [];
  try {
    const res = await fetch(fm.image, { method: 'HEAD', signal: AbortSignal.timeout(8000) });
    if (res.status !== 200) {
      return [`  Image URL returned HTTP ${res.status}: ${fm.image}`];
    }
    return [];
  } catch (err) {
    return [`  Image URL fetch failed: ${err.message}`];
  }
}

async function checkImageRelevanceAuto(fm, pool) {
  const photoId = extractUnsplashPhotoId(fm.image);
  if (!photoId) return [];

  // 1. Pool check — pre-verified healthcare images always pass
  const poolEntry = pool.find((p) => p.id === photoId);
  if (poolEntry) {
    console.log(`  Image in verified pool: "${poolEntry.description}"`);
    return [];
  }

  // 2. Claude vision check if API key is available
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    try {
      const prompt = `This image will appear at the top of a healthcare blog post titled: "${fm.title || ''}". Post tags: ${(fm.tags || []).join(', ')}. The blog targets nurse managers and administrators at small hospitals (Critical Access Hospitals). Is this image relevant and appropriate for that context? Reply only YES or NO.`;
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 10,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'image', source: { type: 'url', url: fm.image } },
                { type: 'text', text: prompt },
              ],
            },
          ],
        }),
        signal: AbortSignal.timeout(20000),
      });
      if (res.ok) {
        const data = await res.json();
        const answer = data.content?.[0]?.text?.trim().toUpperCase() || '';
        if (answer.startsWith('NO')) {
          return [
            `  Image failed relevance check (Claude vision: "${answer}"). The image at ${fm.image} does not appear relevant to this post's topic. Replace it with an ID from scripts/image-pool.json or add the current ID there after visual verification.`,
          ];
        }
        console.log(`  Image passed Claude vision check (${answer})`);
        return [];
      }
    } catch (err) {
      console.log(`  Claude vision check skipped: ${err.message}`);
    }
  }

  // 3. No pool entry, no API key — block with instructions
  return [
    `  Image ID "${photoId}" is not in scripts/image-pool.json. Either:`,
    `    a) Replace the image URL with one from image-pool.json, OR`,
    `    b) Visually verify the image is healthcare-relevant, then add the ID to image-pool.json`,
    `    c) Set ANTHROPIC_API_KEY env var to enable automatic vision checking`,
  ];
}

function checkPrettier(filePath) {
  try {
    execSync(`npx prettier --check "${filePath}"`, { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' });
    return [];
  } catch {
    return ['  Prettier check failed — run: npx prettier --write on this file'];
  }
}

const HUB_PAGES = [
  '/critical-access-hospital-scheduling',
  '/nurse-scheduling-software',
  '/how-it-works',
  '/ai-nurse-scheduling',
  '/roi',
  '/pricing',
];

function checkInternalLinks(content, fm) {
  const warnings = [];
  const body = content.replace(/^---[\s\S]*?---/, '');
  const linkedHubs = HUB_PAGES.filter((hub) => body.includes(hub));
  if (linkedHubs.length === 0) {
    warnings.push(`  No internal links to hub pages found. Add at least one link to: ${HUB_PAGES.join(', ')}`);
  }
  return warnings;
}

function checkBrokenInternalBlogLinks(content, currentSlug) {
  const failures = [];
  const body = content.replace(/^---[\s\S]*?---/, '');
  const blogLinkRegex = /\]\(\/blog\/([a-z0-9-]+?)(?:#[^)]*)?\)/g;
  const seen = new Set();
  let match;
  while ((match = blogLinkRegex.exec(body)) !== null) {
    const slug = match[1];
    if (slug === currentSlug || seen.has(slug)) continue;
    seen.add(slug);
    const targetPath = join(POSTS_DIR, `${slug}.md`);
    try {
      const targetContent = readFileSync(targetPath, 'utf8');
      const targetFm = parseFrontmatter(targetContent);
      if (!targetFm) {
        failures.push(`  Broken /blog/${slug} link: target file has no frontmatter`);
        continue;
      }
      if (targetFm.draft) {
        failures.push(
          `  Broken /blog/${slug} link: target post is still draft (publishDate ${targetFm.publishDate || 'unknown'}). Remove the link or wait until the target is live.`
        );
      }
    } catch {
      failures.push(`  Broken /blog/${slug} link: no file at src/data/post/${slug}.md`);
    }
  }
  return failures;
}

function checkDuplicateBrandHeadings(content) {
  const failures = [];
  const h3s = (content.match(/^###\s+(.+)$/gm) || []).map((line) => line.replace(/^###\s+/, '').trim());
  const counts = {};
  for (const h3 of h3s) {
    const key = h3
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .trim();
    if (!key) continue;
    if (key.startsWith('scenario ')) continue;
    counts[key] = (counts[key] || 0) + 1;
  }
  for (const [key, count] of Object.entries(counts)) {
    if (count > 1) {
      failures.push(
        `  Duplicate H3 heading "${key}" appears ${count} times. Each brand or topic should have one full profile, not two.`
      );
    }
  }
  return failures;
}

const VALID_SLATE_SCALE = new Set(['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']);
const TAILWIND_INVALID_PATTERN = /(?:^|[\s"'])(?:dark:)?(?:bg|text|border)-slate-(\d+)/g;

function checkInvalidTailwindSlate(content) {
  const failures = [];
  let match;
  while ((match = TAILWIND_INVALID_PATTERN.exec(content)) !== null) {
    const shade = match[1];
    if (!VALID_SLATE_SCALE.has(shade)) {
      failures.push(
        `  Invalid Tailwind class "slate-${shade}" found. Slate scale only includes ${[...VALID_SLATE_SCALE].join(', ')}. Use the nearest valid shade (e.g. slate-700 instead of slate-750).`
      );
    }
  }
  return [...new Set(failures)];
}

// ─── publish action ──────────────────────────────────────────────────────────

function publishPost(filePath, title, today) {
  let content = readFileSync(filePath, 'utf8');

  content = content.replace(/^draft: true$/m, 'draft: false');
  content = content.replace(/^updateDate: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/m, `updateDate: ${today}T00:00:00Z`);

  writeFileSync(filePath, content, 'utf8');
  execSync(`npx prettier --write "${filePath}"`, { cwd: ROOT, encoding: 'utf8' });

  run(`git add "${filePath}"`);
  const commitMsg = `Publish: ${title} — ${today}`;
  run(
    `git commit -m "${commitMsg}\n\nAuto-published by scripts/auto-publish.js\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"`
  );
  run('git push');
}

// ─── main ────────────────────────────────────────────────────────────────────

async function runChecks(filePath, fm, content, slug, pool) {
  const failures = [];
  const warnings = [];

  // Authoritative mechanical gate (single source of truth).
  failures.push(...runCheckBlog(filePath));

  // Supplementary checks check-blog cannot do (network / vision / format / niche static).
  failures.push(...(await checkImageUrl(fm))); // image actually loads (HEAD request)
  failures.push(...(await checkImageRelevanceAuto(fm, pool))); // image is on-topic (Claude vision)
  failures.push(...checkPrettier(filePath));
  failures.push(...checkBrokenInternalBlogLinks(content, slug)); // /blog link target missing on disk
  failures.push(...checkDuplicateBrandHeadings(content));
  failures.push(...checkInvalidTailwindSlate(content));

  warnings.push(...checkInternalLinks(content, fm));
  return { failures, warnings };
}

async function main() {
  const today = todayString();
  const pool = loadImagePool();

  if (CHECK_FILE) {
    const filePath = CHECK_FILE.startsWith('/') || /^[A-Za-z]:/.test(CHECK_FILE) ? CHECK_FILE : join(ROOT, CHECK_FILE);
    const content = readFileSync(filePath, 'utf8');
    const fm = parseFrontmatter(content);
    if (!fm) {
      console.error(`No frontmatter found in ${filePath}`);
      process.exit(1);
    }
    const slug = basename(filePath, '.md');
    console.log(`Checking: ${slug}`);
    const { failures, warnings } = await runChecks(filePath, fm, content, slug, pool);
    if (warnings.length > 0) console.log(`WARNINGS:\n${warnings.join('\n')}`);
    if (failures.length > 0) {
      console.log(`FAILURES:\n${failures.join('\n')}`);
      process.exit(1);
    }
    console.log('All checks passed.');
    return;
  }

  const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));

  const due = [];
  for (const filename of files) {
    const filePath = join(POSTS_DIR, filename);
    const content = readFileSync(filePath, 'utf8');
    const fm = parseFrontmatter(content);
    if (!fm) continue;
    if (!fm.draft) continue;
    if (!fm.publishDate) continue;
    if (fm.publishDate.slice(0, 10) === today) {
      due.push({ filename, filePath, fm, content });
    }
  }

  if (due.length === 0) {
    appendLog(`## ${today}\nNo posts scheduled today.`);
    return;
  }

  appendLog(`## ${today}\n${due.length} post(s) due for publishing.`);

  for (const { filename, filePath, fm, content } of due) {
    const slug = basename(filename, '.md');
    console.log(`\nChecking: ${slug}`);
    const { failures, warnings } = await runChecks(filePath, fm, content, slug, pool);

    if (warnings.length > 0) {
      console.log(`  WARNINGS (non-blocking):\n${warnings.join('\n')}`);
    }

    if (failures.length > 0) {
      const failureText = [
        `### BLOCKED: ${slug}`,
        `Title: ${fm.title || '(unknown)'}`,
        `Check failures:`,
        ...failures,
        `Fix these issues before re-running.`,
      ].join('\n');
      appendLog(failureText);
    } else if (!PUBLISH) {
      appendLog(
        `### CHECK ONLY — would publish: ${slug}\nTitle: ${fm.title || '(unknown)'}\nAll checks passed. Re-run with --publish to flip draft, commit, and push.`
      );
    } else {
      try {
        publishPost(filePath, fm.title || slug, today);
        appendLog(
          [
            `### PUBLISHED: ${slug}`,
            `Title: ${fm.title || '(unknown)'}`,
            `Live at: https://simplescheduleai.com/blog/${slug}`,
            warnings.length > 0 ? `Warnings (non-blocking): ${warnings.length}` : '',
            '',
            `Next steps (manual):`,
            `- Submit URL to GSC: URL Inspection → Request Indexing`,
            `- Run npm run indexnow`,
            `- Post excerpt on LinkedIn`,
          ]
            .filter(Boolean)
            .join('\n')
        );
      } catch (err) {
        appendLog(`### ERROR publishing ${slug}\n${err.message}\nFile was modified — check git status.`);
      }
    }
  }
}

main().catch((err) => {
  console.error('auto-publish.js crashed:', err);
  process.exit(0);
});
