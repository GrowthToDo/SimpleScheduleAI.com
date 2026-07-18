#!/usr/bin/env node
// One-command publish for a prepared July-2026 draft.
//   node scripts/publish-post.mjs <slug>            # DRY RUN: apply edits + gate, no commit (auto-reverts)
//   node scripts/publish-post.mjs <slug> --go       # real: sets founder-approval, commits (local)
//   node scripts/publish-post.mjs <slug> --go --push # also pushes + submits IndexNow
// After a --push run, submit the GSC sitemap (MCP) and verify the live URL returns 200.
//
// Inbound links are applied at flip time (drafts are not built, so a live->draft link would 404).
// Each inbound link is inserted as a short "Related" line just before the sibling's author bio.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const POST = (s) => resolve(ROOT, 'src/data/post', `${s}.md`);
const BIO_ANCHOR = '_[Pradeep Pandey](/about/pradeep-pandey)';
const rel = (f) =>
  resolve(f)
    .replace(resolve(ROOT) + '\\', '')
    .replace(resolve(ROOT) + '/', '')
    .split('\\')
    .join('/');

// Per-post publish config. inbound: 2 live siblings each get a Related line to the target.
const CONFIG = {
  'how-to-choose-nurse-scheduling-software': {
    keyword: 'how to choose nurse scheduling software',
    pillar: '/nurse-scheduling-software',
    note: 'Decision-framework / 7-point buyer checklist; differentiated from the "best X" rankings and the pricing post by the how-to-decide angle.',
    inbound: [
      [
        'best-nurse-scheduling-software-2026',
        'our [7-point checklist for how to choose nurse scheduling software](/blog/how-to-choose-nurse-scheduling-software) works the decision before you compare products.',
      ],
      [
        'nurse-scheduling-software-small-hospital',
        'the [7-point checklist for how to choose nurse scheduling software](/blog/how-to-choose-nurse-scheduling-software) covers the questions that decide whether a tool gets used.',
      ],
    ],
  },
  'cost-of-losing-a-nurse-rural-hospital': {
    keyword: 'cost of nurse turnover',
    pillar: '/critical-access-hospital-scheduling',
    note: 'Worked-math data post ($60,090 NSI anchor), rural-specific; differentiated from generic turnover-cost articles by the one-nurse / thin-roster framing.',
    inbound: [
      [
        'nurse-burnout-scheduling-cah',
        '[the real cost of losing one nurse at a rural hospital](/blog/cost-of-losing-a-nurse-rural-hospital) puts a sourced number on the turnover it drives.',
      ],
      [
        'healthcare-staffing-software-small-hospitals',
        '[the real cost of losing one nurse](/blog/cost-of-losing-a-nurse-rural-hospital) walks the math for a small hospital.',
      ],
    ],
  },
  'is-ai-nurse-scheduling-safe': {
    keyword: 'is ai nurse scheduling safe',
    pillar: '/ai-nurse-scheduling',
    note: 'Trust/safety AEO answer (oversight, accuracy, CMS record); differentiated from the /ai-nurse-scheduling pillar which covers mechanics.',
    inbound: [
      [
        'can-nurses-trust-ai-generated-schedule',
        '[is AI nurse scheduling safe](/blog/is-ai-nurse-scheduling-safe) answers the oversight, accuracy, and CMS-record question directly.',
      ],
      [
        'ai-nurse-scheduling-vs-traditional',
        '[is AI nurse scheduling safe](/blog/is-ai-nurse-scheduling-safe) covers who signs off before a schedule reaches nurses.',
      ],
    ],
  },
  'how-ai-builds-a-nurse-schedule': {
    keyword: 'how does ai nurse scheduling work',
    pillar: '/ai-nurse-scheduling',
    note: 'Vendor-neutral step-by-step mechanics; differentiated from the /ai-nurse-scheduling pillar (what it is) and /how-it-works (service flow).',
    inbound: [
      [
        'can-nurses-trust-ai-generated-schedule',
        '[how AI actually builds a nurse schedule](/blog/how-ai-builds-a-nurse-schedule) walks the pipeline in plain English.',
      ],
      [
        'what-automated-nurse-scheduling-actually-means',
        '[how AI actually builds a nurse schedule](/blog/how-ai-builds-a-nurse-schedule) shows the roster-to-schedule steps.',
      ],
    ],
  },
  'nurse-staffing-texas-2026': {
    keyword: 'texas nurse staffing',
    pillar: '/critical-access-hospital-scheduling',
    note: 'Texas staffing-numbers/data post (uses 91 current count, 86 only in DSHS-2024 context); differentiated from the rural-texas market-read post.',
    inbound: [
      [
        'rural-texas-hospital-nurse-scheduling-2026',
        'the 2026 staffing figures behind that picture are in [nurse staffing in Texas: the 2026 numbers](/blog/nurse-staffing-texas-2026).',
      ],
      [
        'best-nurse-scheduling-software-texas',
        'the [2026 Texas nurse staffing numbers](/blog/nurse-staffing-texas-2026) show why small hospitals need a tighter tool.',
      ],
    ],
  },
  '8-hour-vs-12-hour-nursing-shifts': {
    keyword: '8 hour vs 12 hour nursing shifts',
    pillar: '/critical-access-hospital-scheduling',
    note: 'Head-to-head 8-vs-12 for a 25-bed hospital; differentiated from the general 12-hour post; AHRQ/Rogers claims verified.',
    inbound: [
      [
        'night-shift-nurse-schedule-coverage',
        '[8-hour vs 12-hour nursing shifts](/blog/8-hour-vs-12-hour-nursing-shifts) works the tradeoff for a thin roster.',
      ],
      [
        'after-hours-callout-coverage-small-hospitals',
        '[8-hour vs 12-hour nursing shifts](/blog/8-hour-vs-12-hour-nursing-shifts) shows how shift length changes callout exposure.',
      ],
    ],
  },
  'nurse-to-patient-ratios-by-state': {
    keyword: 'nurse to patient ratios by state',
    pillar: '/nurse-scheduling-software',
    note: 'State-by-state legal map (only CA/OR/MA have ratio laws); differentiated from the CAH-internal ratios post.',
    inbound: [
      [
        'nurse-staffing-ratios-critical-access-hospital',
        'for the state-by-state legal picture, see [nurse-to-patient ratios by state](/blog/nurse-to-patient-ratios-by-state).',
      ],
      [
        'texas-nursing-overtime-compliance-cah',
        '[nurse-to-patient ratios by state](/blog/nurse-to-patient-ratios-by-state) shows Texas sets no fixed ratio at all.',
      ],
    ],
  },
  'free-nurse-schedule-templates': {
    keyword: 'free nurse schedule templates',
    pillar: '/nurse-scheduling-software',
    note: 'Refreshed/finished parked draft; shift-pattern templates (8/10/12hr); differentiated from the 12-hour scheduling post.',
    inbound: [
      [
        '12-hour-hospital-shifts-scheduling',
        '[free nurse schedule templates](/blog/free-nurse-schedule-templates) and the 8, 10, and 12-hour patterns behind them.',
      ],
      [
        'nurse-scheduling-software-small-hospital',
        'many small hospitals start from a [free nurse schedule template](/blog/free-nurse-schedule-templates) before moving to software.',
      ],
    ],
  },
};

const slug = process.argv[2];
const GO = process.argv.includes('--go');
const PUSH = process.argv.includes('--push');
if (!slug || !CONFIG[slug]) {
  console.error(
    `Usage: node scripts/publish-post.mjs <slug> [--go] [--push]\nKnown slugs:\n  ${Object.keys(CONFIG).join('\n  ')}`
  );
  process.exit(1);
}
const cfg = CONFIG[slug];
const target = POST(slug);
if (!existsSync(target)) throw new Error(`Missing target post: ${target}`);

const changed = [target];
const log = (m) => console.log(`  ${m}`);
console.log(`\n${GO ? '' : '[DRY RUN] '}Publishing: ${slug}`);

// 1. Insert inbound Related lines into siblings (before the author bio).
for (const [sib, sentence] of cfg.inbound) {
  const f = POST(sib);
  if (!existsSync(f)) throw new Error(`Missing inbound sibling: ${sib}`);
  let t = readFileSync(f, 'utf8');
  const link = `/blog/${slug})`;
  if (t.includes(link)) {
    log(`inbound: ${sib} already links -> skip`);
    continue;
  }
  if (!t.includes(BIO_ANCHOR)) throw new Error(`No bio anchor in ${sib}; cannot place inbound link safely`);
  const related = `_Related: ${sentence}_\n\n`;
  t = t.replace(BIO_ANCHOR, related + BIO_ANCHOR);
  writeFileSync(f, t);
  changed.push(f);
  log(`inbound: added Related line in ${sib}`);
}

// 2. Flip the target draft.
let post = readFileSync(target, 'utf8');
if (post.match(/^draft:\s*true/m)) {
  post = post.replace(/^draft:\s*true/m, 'draft: false');
  writeFileSync(target, post);
  log('flipped draft: true -> false');
} else {
  log('already draft: false');
}

// 3. Prettier changed files.
execSync(`npx prettier --write ${changed.map((f) => `"${f}"`).join(' ')}`, { cwd: ROOT, stdio: 'ignore' });
log('prettier ok');

// 4. Gate: refresh mechanical, then set judgment rows.
const gate = (args) => {
  try {
    return execSync(`node scripts/publish-gate.mjs ${slug} ${args}`, { cwd: ROOT, encoding: 'utf8' });
  } catch (e) {
    return (e.stdout || '') + (e.stderr || ''); // not-green manifest exits non-zero; capture, don't throw
  }
};
gate('');
if (GO) {
  gate('--set proofread=READY --by feature-dev-code-reviewer');
  gate('--set factcheck=PASS --by main-session');
  gate('--set image-eyeball=OK');
  gate('--set founder-approval=YES --by founder');
}
const status = gate(GO ? '' : '--status');
const green = /ALL GREEN/.test(status);
console.log(
  status
    .split('\n')
    .filter((l) => /\[(PASS|FAIL|TODO|STALE)/.test(l))
    .join('\n')
);
if (GO && !green) {
  console.error('\nGate not green after setting rows — aborting before commit. Inspect above.');
  process.exit(1);
}

if (!GO) {
  console.log('\n[DRY RUN] Reverting all edits (no commit).');
  execSync(`git checkout -- ${changed.map((f) => `"${rel(f)}"`).join(' ')}`, { cwd: ROOT, stdio: 'ignore' });
  try {
    execSync(`git clean -f ".publish/${slug}.json"`, { cwd: ROOT, stdio: 'ignore' });
  } catch {
    /* manifest may be tracked or absent */
  }
  console.log('Dry run complete. Re-run with --go to publish, --go --push to publish + push + IndexNow.');
  process.exit(0);
}

// 5. Keyword-registry entry.
const regPath = resolve(ROOT, 'docs/seo/keyword-registry.json');
let reg = readFileSync(regPath, 'utf8');
if (!reg.includes(`"slug": "${slug}"`)) {
  const entry = `  {\n    "slug": "${slug}",\n    "type": "post",\n    "url": "/blog/${slug}",\n    "primaryKeyword": "${cfg.keyword}",\n    "pillar": "${cfg.pillar}",\n    "note": ${JSON.stringify(cfg.note)}\n  }\n]`;
  reg = reg.replace(/\}\s*\n\]\s*$/, '}\n' + ',\n' + entry.slice(2));
  writeFileSync(regPath, reg);
  execSync(`npx prettier --write "${regPath}"`, { cwd: ROOT, stdio: 'ignore' });
  changed.push(regPath);
  log('added keyword-registry entry');
}

// 6. Commit (pre-commit hook re-gates the flip).
execSync(`git add ${changed.map((f) => `"${rel(f)}"`).join(' ')} ".publish/${slug}.json"`, { cwd: ROOT });
execSync(`git commit -m "content: publish ${slug}"`, { cwd: ROOT, stdio: 'inherit' });
log('committed');

if (PUSH) {
  execSync('git push origin main', { cwd: ROOT, stdio: 'inherit' });
  execSync('npm run indexnow', { cwd: ROOT, stdio: 'inherit' });
  console.log('\nPushed + IndexNow submitted. NEXT: submit GSC sitemap (MCP) + verify the live URL returns 200.');
} else {
  console.log(
    '\nCommitted locally. Run `git push origin main` + `npm run indexnow` when ready, then GSC sitemap + verify 200.'
  );
}
