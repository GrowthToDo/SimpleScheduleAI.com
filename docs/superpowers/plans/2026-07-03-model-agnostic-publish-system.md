# Model-Agnostic Publish System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the manifest-enforced publish pipeline (gate runner, pre-commit block, facts dossier + rule, smoke-routes CI, pipeline skill) so blog/article publishes are first-pass correct regardless of driving model.

**Architecture:** A per-post JSON manifest under `.publish/` records every required pipeline step; `scripts/publish-gate.mjs` auto-fills mechanical checks by re-running them (content-hash staleness) and records judgment/human verdicts via `--set`. A git pre-commit hook blocks any `draft: false` flip whose manifest is not green. A facts dossier holds canonical wording for recurring stats/regs, enforced by a shared facts-rules module wired into `check-blog.mjs`. `scripts/smoke-routes.mjs` asserts built route shapes in CI.

**Tech Stack:** Node.js (>=18) ESM `.mjs`, zero new npm dependencies, `node --test` for tests, plain `.git/hooks` (no husky).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-03-model-agnostic-publish-system-design.md` — follow it on any ambiguity.
- Zero new npm dependencies. Node built-ins only (`node:fs`, `node:path`, `node:crypto`, `node:child_process`, `node:test`, global `fetch`).
- All new scripts are ESM `.mjs`, single-responsibility, in `scripts/` (shared code in `scripts/lib/`), matching the existing `check-blog.mjs` / `check-links.mjs` style: plain console output, exit code 0 = pass / 1 = fail.
- Never break the existing `npm run check-blog` / `check-links` contracts (same CLI args, same output style, same exit semantics).
- Windows dev environment: always build paths with `path.join`/`fileURLToPath`; hook file itself is a `sh` script (Git for Windows runs hooks under sh).
- Commit after every task with the message given in the task. Run `npx prettier --write` on any created/modified `.md`/`.json` file before its commit (never repo-wide).
- Manifest directory `.publish/` is committed to git.
- Commit-blocking manifest fields: all mechanical fields + `proofread`, `factCheck`, `imageEyeball`, `founderApproval`. Non-blocking: `indexNow`, `gscSitemap`.
- Founder go-ahead and image eyeball remain human actions; the system only records them.

## File Structure

```
scripts/
  lib/
    publish-shared.mjs      # frontmatter parse, content hash, post resolution, inbound-link scan
    facts-rules.mjs         # facts pattern table + checker (shared by check-blog + publish-gate)
    manifest.mjs            # manifest load/save/staleness/green logic
  publish-gate.mjs          # CLI: mechanical runner, --status, --set
  hook-precommit.mjs        # staged-diff analysis + gate invocation (called by the sh hook)
  install-hooks.mjs         # writes .git/hooks/pre-commit
  smoke-routes.mjs          # post-build route assertions
  tests/
    fixtures/               # tiny fixture posts + fake dist tree
    publish-shared.test.mjs
    facts-rules.test.mjs
    manifest.test.mjs
    publish-gate.test.mjs
    hook-precommit.test.mjs
    smoke-routes.test.mjs
  check-blog.mjs            # MODIFY: add facts rule
docs/seo/facts-dossier.md   # CREATE
.claude/skills/publish-pipeline.md  # CREATE
CLAUDE.md                   # MODIFY: pipeline section -> pointer
docs/seo/pre-publish-checklist.md   # MODIFY: proofread matrix -> pointer to skill
.github/workflows/actions.yaml      # MODIFY: smoke + script tests
package.json                # MODIFY: new scripts
docs/SETUP.md               # MODIFY: setup-hooks step
```

---

### Task 1: Shared post utilities (`publish-shared.mjs`)

**Files:**

- Create: `scripts/lib/publish-shared.mjs`
- Create: `scripts/tests/publish-shared.test.mjs`
- Create: `scripts/tests/fixtures/post-live.md`, `scripts/tests/fixtures/post-draft.md`

**Interfaces:**

- Produces: `parseFrontmatter(text) -> {data: object, body: string}`; `contentHash(text) -> string` (sha256 hex); `resolvePost(slugOrPath, root) -> {slug, collection: 'post'|'article', filePath}` (throws if not found); `scanInboundLinks(slug, collection, root) -> {count: number, sources: string[]}` (only counts links from `draft: false` sibling posts); `listPosts(root) -> [{filePath, slug, collection, data, body}]`.

- [ ] **Step 1: Write fixtures**

`scripts/tests/fixtures/post-live.md`:

```markdown
---
draft: false
publishDate: 2026-07-01T00:00:00Z
updateDate: 2026-07-01T00:00:00Z
title: 'Live Fixture'
image: https://images.unsplash.com/photo-1111111111111-aaaaaaaaaaaa?w=100
---

Body links to [target](/blog/target-slug) and [other](/blog/other-slug).
```

`scripts/tests/fixtures/post-draft.md`:

```markdown
---
draft: true
publishDate: 2026-07-01T00:00:00Z
title: 'Draft Fixture'
---

Also links to [target](/blog/target-slug).
```

- [ ] **Step 2: Write the failing tests**

`scripts/tests/publish-shared.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter, contentHash, resolvePost, scanInboundLinks } from '../lib/publish-shared.mjs';

const FIX = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');

test('parseFrontmatter extracts data and body', () => {
  const text = fs.readFileSync(path.join(FIX, 'post-live.md'), 'utf8');
  const { data, body } = parseFrontmatter(text);
  assert.equal(data.draft, false);
  assert.equal(data.title, 'Live Fixture');
  assert.ok(data.image.startsWith('https://images.unsplash.com/'));
  assert.ok(body.includes('/blog/target-slug'));
});

test('contentHash is stable and changes with content', () => {
  assert.equal(contentHash('abc'), contentHash('abc'));
  assert.notEqual(contentHash('abc'), contentHash('abd'));
  assert.match(contentHash('abc'), /^[0-9a-f]{64}$/);
});

function makeRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ps-'));
  fs.mkdirSync(path.join(root, 'src', 'data', 'post'), { recursive: true });
  fs.mkdirSync(path.join(root, 'src', 'data', 'article'), { recursive: true });
  fs.copyFileSync(path.join(FIX, 'post-live.md'), path.join(root, 'src', 'data', 'post', 'live-one.md'));
  fs.copyFileSync(path.join(FIX, 'post-draft.md'), path.join(root, 'src', 'data', 'post', 'draft-one.md'));
  fs.writeFileSync(path.join(root, 'src', 'data', 'post', 'target-slug.md'), '---\ndraft: false\ntitle: T\n---\nbody');
  return root;
}

test('resolvePost finds post by slug and by path', () => {
  const root = makeRepo();
  const bySlug = resolvePost('target-slug', root);
  assert.equal(bySlug.collection, 'post');
  assert.ok(bySlug.filePath.endsWith('target-slug.md'));
  const byPath = resolvePost('src/data/post/target-slug.md', root);
  assert.equal(byPath.slug, 'target-slug');
  assert.throws(() => resolvePost('nope', root));
});

test('scanInboundLinks counts only live siblings', () => {
  const root = makeRepo();
  const r = scanInboundLinks('target-slug', 'post', root);
  assert.equal(r.count, 1); // live-one counts, draft-one does not
  assert.ok(r.sources[0].includes('live-one'));
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `node --test scripts/tests/publish-shared.test.mjs`
Expected: FAIL — `Cannot find module '../lib/publish-shared.mjs'`

- [ ] **Step 4: Implement `scripts/lib/publish-shared.mjs`**

```js
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

/** Minimal YAML-subset frontmatter parser (key: value lines; quoted strings; booleans; > folded excerpt kept raw). */
export function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: text };
  const data = {};
  let pendingKey = null;
  for (const rawLine of m[1].split(/\r?\n/)) {
    if (pendingKey !== null) {
      if (/^\s+\S/.test(rawLine)) {
        data[pendingKey] += (data[pendingKey] ? ' ' : '') + rawLine.trim();
        continue;
      }
      pendingKey = null;
    }
    const kv = rawLine.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    let val = kv[2].trim();
    if (val === '>' || val === '|') {
      data[key] = '';
      pendingKey = key;
      continue;
    }
    if (/^'.*'$/.test(val) || /^".*"$/.test(val)) val = val.slice(1, -1);
    if (val === 'true') val = true;
    else if (val === 'false') val = false;
    data[key] = val;
  }
  return { data, body: text.slice(m[0].length) };
}

export function contentHash(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

const COLLECTIONS = [
  { collection: 'post', dir: ['src', 'data', 'post'] },
  { collection: 'article', dir: ['src', 'data', 'article'] },
];

export function resolvePost(slugOrPath, root = process.cwd()) {
  const norm = slugOrPath.replace(/\\/g, '/');
  for (const { collection, dir } of COLLECTIONS) {
    const rel = dir.join('/');
    if (norm.includes(`${rel}/`)) {
      const filePath = path.resolve(root, norm);
      if (!fs.existsSync(filePath)) throw new Error(`Not found: ${slugOrPath}`);
      return { slug: path.basename(filePath).replace(/\.mdx?$/, ''), collection, filePath };
    }
  }
  for (const { collection, dir } of COLLECTIONS) {
    for (const ext of ['.md', '.mdx']) {
      const filePath = path.join(root, ...dir, slugOrPath + ext);
      if (fs.existsSync(filePath)) return { slug: slugOrPath, collection, filePath };
    }
  }
  throw new Error(`Not found in any collection: ${slugOrPath}`);
}

export function listPosts(root = process.cwd()) {
  const out = [];
  for (const { collection, dir } of COLLECTIONS) {
    const abs = path.join(root, ...dir);
    if (!fs.existsSync(abs)) continue;
    for (const f of fs.readdirSync(abs)) {
      if (!/\.mdx?$/.test(f)) continue;
      const filePath = path.join(abs, f);
      const { data, body } = parseFrontmatter(fs.readFileSync(filePath, 'utf8'));
      out.push({ filePath, slug: f.replace(/\.mdx?$/, ''), collection, data, body });
    }
  }
  return out;
}

/** Inbound links to /blog/<slug> or /articles/<slug> from LIVE sibling posts (draft !== true). */
export function scanInboundLinks(slug, collection, root = process.cwd()) {
  const urlPath = collection === 'article' ? `/articles/${slug}` : `/blog/${slug}`;
  const needle = new RegExp(`\\]\\(${urlPath.replace(/\//g, '\\/')}\\)`);
  const sources = [];
  for (const p of listPosts(root)) {
    if (p.slug === slug && p.collection === collection) continue;
    if (p.data.draft === true) continue;
    if (needle.test(p.body)) sources.push(path.relative(root, p.filePath));
  }
  return { count: sources.length, sources };
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test scripts/tests/publish-shared.test.mjs`
Expected: PASS (4 tests)

- [ ] **Step 6: Commit**

```bash
git add scripts/lib/publish-shared.mjs scripts/tests/publish-shared.test.mjs scripts/tests/fixtures/
git commit -m "feat(publish): shared post utilities (frontmatter, hash, resolve, inbound scan)"
```

---

### Task 2: Facts rules module

**Files:**

- Create: `scripts/lib/facts-rules.mjs`
- Create: `scripts/tests/facts-rules.test.mjs`

**Interfaces:**

- Produces: `FACTS_RULES` (array of `{id, trigger: RegExp, bad: RegExp|null, requires: RegExp|null, anchor: string, message: string}`) and `checkFacts(body) -> [{line, id, text, anchor, message}]`. A line violates when `trigger` matches AND (`bad` matches OR `requires` fails to match) AND the line does not contain `<!-- facts-ok -->`.

- [ ] **Step 1: Write the failing tests**

`scripts/tests/facts-rules.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkFacts } from '../lib/facts-rules.mjs';

const ok = (s) => assert.equal(checkFacts(s).length, 0, s);
const bad = (s, id) => {
  const v = checkFacts(s);
  assert.equal(v.length, 1, s);
  assert.equal(v[0].id, id);
};

test('RN-on-duty wording must include CNS/LPN', () => {
  bad('a registered nurse must be on duty whenever there is an inpatient', 'cfr-631-on-duty');
  ok(
    'a registered nurse, clinical nurse specialist, or licensed practical nurse must be on duty whenever there is an inpatient'
  );
});

test('485.631 must not carry the provide-or-supervise clause', () => {
  bad(
    'Under 42 CFR 485.631, a registered nurse must provide or supervise the nursing care of each patient.',
    'cfr-631-scope'
  );
  ok('Under 42 CFR 485.635, a registered nurse must provide or supervise the nursing care of each patient.');
});

test('stale NSI figure is flagged', () => {
  bad('replacement cost of $52,350 per RN', 'nsi-2024-figure');
  ok('replacement cost of $61,110 per RN');
});

test('NNU secondary date flagged', () => {
  bad('the NNU fact sheet published June 3, 2026 argues', 'nnu-date');
  ok('the NNU fact sheet published May 26, 2026 argues');
});

test('JAMA 65% needs the nonretired qualifier', () => {
  bad('adequate staffing was cited by about 65 percent of respondents', 'jama-65-qualifier');
  ok('adequate staffing was named by about 65 percent of the nonretired nurses surveyed');
});

test('facts-ok comment suppresses', () => {
  ok('the old $52,350 figure was superseded <!-- facts-ok -->');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test scripts/tests/facts-rules.test.mjs`
Expected: FAIL — module not found

- [ ] **Step 3: Implement `scripts/lib/facts-rules.mjs`**

```js
/**
 * Known-drift facts patterns. Each entry names the dossier anchor that holds
 * the approved wording. A line violates when `trigger` matches AND
 * (`bad` matches OR `requires` fails), unless the line has `<!-- facts-ok -->`.
 * Grow this table whenever a new recurring fact enters docs/seo/facts-dossier.md.
 */
export const FACTS_RULES = [
  {
    id: 'cfr-631-on-duty',
    trigger: /registered nurse[^.\n]{0,60}on duty/i,
    bad: null,
    requires: /clinical nurse specialist,? or licensed practical nurse/i,
    anchor: 'facts-dossier.md#42-cfr-485631a5',
    message: '485.631(a)(5) permits an RN, CNS, or LPN on duty — RN-only overstates the reg',
  },
  {
    id: 'cfr-631-scope',
    trigger: /485\.631/,
    bad: /provide (or supervise|\(or assign)/i,
    requires: null,
    anchor: 'facts-dossier.md#42-cfr-485635d',
    message: 'provide-or-supervise is 485.635(d), not 485.631',
  },
  {
    id: 'nsi-2024-figure',
    trigger: /\$52,?350/,
    bad: /\$52,?350/,
    requires: null,
    anchor: 'facts-dossier.md#nsi-2025',
    message: 'stale NSI figure; 2025 report = $61,110',
  },
  {
    id: 'nnu-date',
    trigger: /June 3,? 2026/i,
    bad: /June 3,? 2026/i,
    requires: null,
    anchor: 'facts-dossier.md#nnu-fact-sheet',
    message: 'NNU primary source is dated May 26, 2026 (June 3 is a republication)',
  },
  {
    id: 'jama-65-qualifier',
    trigger: /65\s?(percent|%)[^.\n]{0,40}(respondent|nurse)/i,
    bad: null,
    requires: /nonretired/i,
    anchor: 'facts-dossier.md#jama-network-open-feb-2026',
    message: 'the 65% is of the NONRETIRED subset; qualifier required',
  },
];

export function checkFacts(body) {
  const violations = [];
  const lines = body.split(/\r?\n/);
  lines.forEach((text, i) => {
    if (text.includes('<!-- facts-ok -->')) return;
    for (const r of FACTS_RULES) {
      if (!r.trigger.test(text)) continue;
      const isBad = r.bad ? r.bad.test(text) : false;
      const missing = r.requires ? !r.requires.test(text) : false;
      if (isBad || missing)
        violations.push({ line: i + 1, id: r.id, text: text.slice(0, 120), anchor: r.anchor, message: r.message });
    }
  });
  return violations;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test scripts/tests/facts-rules.test.mjs`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/facts-rules.mjs scripts/tests/facts-rules.test.mjs
git commit -m "feat(publish): facts-rules module (known-drift stat/reg wording checks)"
```

---

### Task 3: Facts dossier document

**Files:**

- Create: `docs/seo/facts-dossier.md`

**Interfaces:**

- Produces: the dossier file whose H2/H3 anchor slugs are referenced by `FACTS_RULES[].anchor` (`#42-cfr-485631a5`, `#42-cfr-485635d`, `#nsi-2025`, `#nnu-fact-sheet`, `#jama-network-open-feb-2026`).

- [ ] **Step 1: Write the dossier**

Create `docs/seo/facts-dossier.md` with exactly these sections (this content was verified against primary sources during the 2026-06-30 — 2026-07-03 sessions; re-verify each entry live during the Fable burn-down and update `Verified:` dates):

```markdown
# Facts Dossier — Canonical Stats, Regulations, and Product Truths

Rule (same as the competitor dossier): any fact with an entry here MUST be used with the approved wording below. A fact not in this dossier must be verified against a primary source before use, then ADDED here in the same session. Entries older than 60 days at time of use get re-verified. The mechanical enforcement lives in `scripts/lib/facts-rules.mjs` (wired into `check-blog`); when you add an entry with a drift risk, add a matching rule there.

## External facts

### 42 CFR 485.631(a)(5)

- Approved wording: "a registered nurse, clinical nurse specialist, or licensed practical nurse is on duty whenever the CAH has one or more inpatients"
- Wrong: "a registered nurse must be on duty" (RN-only overstates the reg)
- Section covers: Staffing and staff responsibilities. Pin-cite for the on-duty clause: (a)(5).
- URL: https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.631
- Verified: 2026-07-03 (via Cornell LII cross-check)

### 42 CFR 485.635(d)

- Approved wording: a registered nurse must "provide (or assign to other personnel) the nursing care of each patient" and "supervise and evaluate the nursing care for each patient"
- Wrong: attributing this clause to 485.631
- Section covers: Provision of services.
- URL: https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.635
- Verified: 2026-07-03

### NSI 2025

- Approved figures: average cost to replace one staff RN = $61,110; national RN turnover = 16.4% (2025 report, CY2024 data)
- Wrong: $52,350 (unverified prior-edition figure — do not assert)
- Note: the NSI PDF URL is a rolling filename and now serves the 2026 edition; keep the citation label "2025 NSI National Health Care Retention and RN Staffing Report".
- URL: https://www.nsinursingsolutions.com/Documents/Library/NSI_National_Health_Care_Retention_Report.pdf
- Verified: 2026-07-02

### NNU fact sheet

- Approved: "roughly 1.15 million registered nurses hold active licenses but are not working as nurses"; NNU primary source dated May 26, 2026 (BLS data released May 15, 2026); NNU President Jamie Brown, RN; quote verbatim: "The data is clear that the U.S. nursing profession has a retention crisis, not a nurse shortage."
- Wrong: dating the fact sheet June 3, 2026 (that is a WNY Labor Today republication)
- URL: https://www.nationalnursesunited.org/press/new-data-shows-there-is-a-nurse-retention-crisis-not-a-nurse-shortage
- Verified: 2026-07-01

### JAMA Network Open (Feb 2026)

- Approved: research letter "Organizational Factors to Reattract Nurses to Hospital Employment" (Lasater, McHugh, Muir; published online Feb 9, 2026; e2556570; DOI 10.1001/jamanetworkopen.2025.56570). Adequate staffing named by 65% OF THE NONRETIRED nurses surveyed who had left a hospital job (1,113 of the nonretired subset; overall pool 4,043).
- Wrong: citing NNU for this stat; wrong: "65% of respondents" without the nonretired qualifier.
- URL: https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2844818
- Verified: 2026-07-01

### RHIhub rural workforce

- Approved: "63.1% of primary care HPSAs are in rural areas" (HRSA, State of the Primary Care Workforce, 2025); rural provider supply below metro.
- URL: https://www.ruralhealthinfo.org/topics/health-care-workforce
- Verified: 2026-07-01

### FLSA overtime

- Approved framing: "FLSA overtime thresholds" via DOL Fact Sheet #54. The 8-and-80 system is educational content only.
- URL: https://www.dol.gov/agencies/whd/fact-sheets/54-flsa-hospitals
- Verified: 2026-07-03

## Product truths

- Self-label: "AI-native nurse scheduling service". Never "managed service" as a self-label (category/comparison use is fine).
- Pricing (canonical line, verbatim): **Cost:** Flat monthly price by roster size: $1,000/month for up to 20 nurses, $1,500/month for 21 to 40 nurses. No per-nurse fees, no setup fees.
- NOT shipped (never claim as SSAI features): FLSA 8-and-80 calculation method; credential/license-expiry tracking.
- No customers, no pilots: SSAI is pre-launch. Never cite pilot observations, cohorts, facilities, or results. The free 60-day pilot offer is RETIRED; CTA = /how-it-works or /pricing + book-a-call.
- CTA pattern: one primary button + "Book a call with our team" text link below. Never /pilot.

## Maintenance log

| Date       | Change                                                         | By     |
| ---------- | -------------------------------------------------------------- | ------ |
| 2026-07-03 | Initial population from 2026-06-30..07-03 verified fact-checks | Claude |
```

- [ ] **Step 2: Verify anchors match `FACTS_RULES`**

Run: `node -e "import('./scripts/lib/facts-rules.mjs').then(m => m.FACTS_RULES.forEach(r => console.log(r.anchor)))"`
Expected: each printed anchor's slug part exists as a heading in the dossier (`42-cfr-485631a5`, `42-cfr-485635d`, `nsi-2025`, `nnu-fact-sheet`, `jama-network-open-feb-2026`).

- [ ] **Step 3: Prettier + commit**

```bash
npx prettier --write docs/seo/facts-dossier.md
git add docs/seo/facts-dossier.md
git commit -m "docs(seo): facts dossier — canonical stats, CFR clauses, product truths"
```

---

### Task 4: Wire facts rule into check-blog

**Files:**

- Modify: `scripts/check-blog.mjs` (add one rule; find the section where hard-fail rules run per file — grep for an existing rule like the em-dash check to locate the pattern)
- Create: `scripts/tests/check-blog-facts.test.mjs`

**Interfaces:**

- Consumes: `checkFacts(body)` from `scripts/lib/facts-rules.mjs`.
- Produces: `check-blog` HARD-FAILS any post with facts violations, message format: `Facts drift [<id>]: <message> -> docs/seo/<anchor>` + the offending line. No change to existing rules, CLI, or output format.

- [ ] **Step 1: Write the failing test (CLI-level, fixture post)**

`scripts/tests/check-blog-facts.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

function runGate(postBody) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cbf-'));
  const rel = path.join('src', 'data', 'post');
  fs.mkdirSync(path.join(dir, rel), { recursive: true });
  const p = path.join(dir, rel, 'fixture.md');
  fs.writeFileSync(p, `---\ndraft: true\ntitle: F\n---\n${postBody}\n`);
  try {
    execFileSync('node', [path.resolve('scripts/check-blog.mjs'), p], { encoding: 'utf8' });
    return { code: 0 };
  } catch (e) {
    return { code: e.status, out: String(e.stdout) + String(e.stderr) };
  }
}

test('facts drift hard-fails check-blog', () => {
  const r = runGate(
    'Under 42 CFR 485.631, a registered nurse must provide or supervise the nursing care of each patient.'
  );
  assert.equal(r.code, 1);
  assert.match(r.out, /Facts drift \[cfr-631-scope\]/);
});

test('approved wording passes the facts rule', () => {
  const r = runGate('Costs $61,110 per the 2025 NSI report.');
  // may fail other rules or pass; must NOT contain a facts-drift failure
  if (r.out) assert.doesNotMatch(r.out, /Facts drift/);
});
```

Note: if `check-blog.mjs` refuses paths outside the repo, adapt `runGate` to write the fixture under `scripts/tests/fixtures/tmp/` inside the repo and delete after; assert the same expectations.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/tests/check-blog-facts.test.mjs`
Expected: FAIL — exit code 0 or missing "Facts drift" (rule not yet wired)

- [ ] **Step 3: Implement**

In `scripts/check-blog.mjs`: import at top:

```js
import { checkFacts } from './lib/facts-rules.mjs';
```

In the per-file hard-rules section (alongside the existing rules), add:

```js
// Facts drift: known stats/regs must match docs/seo/facts-dossier.md wording.
for (const v of checkFacts(body)) {
  fail(`Facts drift [${v.id}]: ${v.message} -> docs/seo/${v.anchor}`, v.line, v.text);
}
```

Adapt `fail(...)` to whatever the file's existing failure-reporting helper is (match its exact signature — read the neighboring rules).

- [ ] **Step 4: Run tests + full existing gate on a live post to prove no regression**

Run: `node --test scripts/tests/check-blog-facts.test.mjs`
Expected: PASS
Run: `npm run check-blog src/data/post/float-pool-nursing-small-hospitals.md`
Expected: 0 failures (live post already uses approved wording)

- [ ] **Step 5: Commit**

```bash
git add scripts/check-blog.mjs scripts/tests/check-blog-facts.test.mjs
git commit -m "feat(check-blog): hard-fail on facts drift vs facts dossier"
```

---

### Task 5: Manifest store (`manifest.mjs`)

**Files:**

- Create: `scripts/lib/manifest.mjs`
- Create: `scripts/tests/manifest.test.mjs`

**Interfaces:**

- Consumes: `contentHash` from `publish-shared.mjs`.
- Produces:
  - `MECHANICAL_FIELDS = ['checkBlog','checkLinks','inboundLinks','image','prettier','dateSanity','factsDossier']`
  - `RECORDED_FIELDS = ['proofread','factCheck','imageEyeball','founderApproval','indexNow','gscSitemap']`
  - `BLOCKING_RECORDED = ['proofread','factCheck','imageEyeball','founderApproval']`
  - `loadManifest(slug, root) -> manifest` (creates skeleton if missing)
  - `saveManifest(manifest, root)`
  - `setMechanical(manifest, field, status, hash)` (status `'PASS'|'FAIL'`)
  - `setRecorded(manifest, field, value, by, hash)`
  - `manifestStatus(manifest, currentHash) -> {green: boolean, rows: [{field, kind, status, fresh}]}` — a field is green only if PASS/accepted-value AND its stored hash equals `currentHash`; recorded accepted values: proofread `READY`, factCheck `PASS`/`NOT_REQUIRED`, imageEyeball `OK`, founderApproval `YES`.
  - Manifest path: `.publish/<slug>.json`; skeleton `{schemaVersion: 1, slug, collection, mechanical: {}, recorded: {}, overrides: []}`.

- [ ] **Step 1: Write the failing tests**

`scripts/tests/manifest.test.mjs`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test scripts/tests/manifest.test.mjs`
Expected: FAIL — module not found

- [ ] **Step 3: Implement `scripts/lib/manifest.mjs`**

```js
import fs from 'node:fs';
import path from 'node:path';

export const MECHANICAL_FIELDS = [
  'checkBlog',
  'checkLinks',
  'inboundLinks',
  'image',
  'prettier',
  'dateSanity',
  'factsDossier',
];
export const RECORDED_FIELDS = ['proofread', 'factCheck', 'imageEyeball', 'founderApproval', 'indexNow', 'gscSitemap'];
export const BLOCKING_RECORDED = ['proofread', 'factCheck', 'imageEyeball', 'founderApproval'];

const ACCEPTED = {
  proofread: ['READY'],
  factCheck: ['PASS', 'NOT_REQUIRED'],
  imageEyeball: ['OK'],
  founderApproval: ['YES'],
  indexNow: ['DONE'],
  gscSitemap: ['DONE'],
};

const manifestPath = (slug, root) => path.join(root, '.publish', `${slug}.json`);

export function loadManifest(slug, root = process.cwd(), collection = 'post') {
  const p = manifestPath(slug, root);
  if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  return { schemaVersion: 1, slug, collection, mechanical: {}, recorded: {}, overrides: [] };
}

export function saveManifest(manifest, root = process.cwd()) {
  const dir = path.join(root, '.publish');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(manifestPath(manifest.slug, root), JSON.stringify(manifest, null, 2) + '\n');
}

export function setMechanical(manifest, field, status, contentHash) {
  manifest.mechanical[field] = { status, checkedAt: new Date().toISOString(), contentHash };
}

export function setRecorded(manifest, field, value, by, contentHash) {
  manifest.recorded[field] = { value, setBy: by || 'unknown', setAt: new Date().toISOString(), contentHash };
}

export function manifestStatus(manifest, currentHash) {
  const rows = [];
  let green = true;
  for (const f of MECHANICAL_FIELDS) {
    const e = manifest.mechanical[f];
    const fresh = !!e && e.contentHash === currentHash;
    const pass = !!e && e.status === 'PASS' && fresh;
    rows.push({ field: f, kind: 'mechanical', status: e ? e.status : 'MISSING', fresh });
    if (!pass) green = false;
  }
  for (const f of RECORDED_FIELDS) {
    const e = manifest.recorded[f];
    const fresh = !!e && e.contentHash === currentHash;
    const ok = !!e && ACCEPTED[f].includes(e.value) && fresh;
    rows.push({ field: f, kind: 'recorded', status: e ? e.value : 'MISSING', fresh });
    if (BLOCKING_RECORDED.includes(f) && !ok) green = false;
  }
  return { green, rows };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test scripts/tests/manifest.test.mjs`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/manifest.mjs scripts/tests/manifest.test.mjs
git commit -m "feat(publish): manifest store with hash-staleness and green logic"
```

---

### Task 6: publish-gate CLI

**Files:**

- Create: `scripts/publish-gate.mjs`
- Create: `scripts/tests/publish-gate.test.mjs`

**Interfaces:**

- Consumes: everything from `publish-shared.mjs`, `manifest.mjs`, `facts-rules.mjs`.
- Produces: CLI `node scripts/publish-gate.mjs <slug|path> [--status] [--set field=value] [--by who] [--root dir] [--no-network]`; exported `runMechanical(slug, root, opts) -> manifest` and `printStatus(manifest, currentHash)`. Exit 0 only when green. `--no-network` marks `checkLinks` and the image HTTP probe as SKIPPED-PASS (used by tests and the hook's fast path is NOT this — hook uses full run).

- [ ] **Step 1: Write the failing tests**

`scripts/tests/publish-gate.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test scripts/tests/publish-gate.test.mjs`
Expected: FAIL — script not found

- [ ] **Step 3: Implement `scripts/publish-gate.mjs`**

```js
#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter, contentHash, resolvePost, scanInboundLinks } from './lib/publish-shared.mjs';
import { checkFacts } from './lib/facts-rules.mjs';
import {
  loadManifest,
  saveManifest,
  setMechanical,
  setRecorded,
  manifestStatus,
  RECORDED_FIELDS,
} from './lib/manifest.mjs';

const FIELD_ALIASES = {
  proofread: 'proofread',
  factcheck: 'factCheck',
  'fact-check': 'factCheck',
  'image-eyeball': 'imageEyeball',
  'founder-approval': 'founderApproval',
  indexnow: 'indexNow',
  'index-now': 'indexNow',
  'gsc-sitemap': 'gscSitemap',
  gscsitemap: 'gscSitemap',
};

function runTool(cmd, args, cwd) {
  try {
    execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: 'pipe' });
    return { ok: true, out: '' };
  } catch (e) {
    return { ok: false, out: String(e.stdout || '') + String(e.stderr || '') };
  }
}

async function imageCheck(data, root, network) {
  const url = String(data.image || '');
  const idMatch = url.match(/photo-([0-9]+-[0-9a-f]+)/);
  if (!idMatch) return { ok: false, why: 'no unsplash photo id in frontmatter image' };
  const id = idMatch[1];
  const pool = JSON.parse(fs.readFileSync(path.join(root, 'scripts', 'image-pool.json'), 'utf8'));
  if (!pool.some((p) => p.id === id)) return { ok: false, why: `image id ${id} not in image-pool.json` };
  let uses = 0;
  for (const dir of ['post', 'article']) {
    const abs = path.join(root, 'src', 'data', dir);
    if (!fs.existsSync(abs)) continue;
    for (const f of fs.readdirSync(abs)) {
      if (/\.mdx?$/.test(f) && fs.readFileSync(path.join(abs, f), 'utf8').includes(id)) uses++;
    }
  }
  if (uses > 1) return { ok: false, why: `image id ${id} used by ${uses} files (must be unique)` };
  if (!network) return { ok: true };
  const res = await fetch(url.split('&')[0], { method: 'GET' });
  const type = res.headers.get('content-type') || '';
  if (!res.ok || !type.startsWith('image/')) return { ok: false, why: `image URL returned ${res.status} ${type}` };
  return { ok: true };
}

function dateSanity(data) {
  const pub = new Date(String(data.publishDate));
  const upd = data.updateDate ? new Date(String(data.updateDate)) : pub;
  if (isNaN(pub)) return { ok: false, why: 'publishDate unparseable' };
  if (pub.getFullYear() >= 2099) return { ok: false, why: 'placeholder publishDate' };
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (pub > today) return { ok: false, why: 'publishDate in the future' };
  if (upd < pub) return { ok: false, why: 'updateDate earlier than publishDate' };
  return { ok: true };
}

function parseCheckLinksOutput(out, canonical) {
  // PASS if every [BROKEN] line is the canonical self-URL (expected pre-deploy).
  const broken = out.split(/\r?\n/).filter((l) => l.includes('[BROKEN]'));
  return broken.every((l) => canonical && l.includes(canonical));
}

export async function runMechanical(slugOrPath, root, { network = true, externalTools = true } = {}) {
  const { slug, collection, filePath } = resolvePost(slugOrPath, root);
  const text = fs.readFileSync(filePath, 'utf8');
  const { data, body } = parseFrontmatter(text);
  const hash = contentHash(text);
  const manifest = loadManifest(slug, root, collection);
  manifest.collection = collection;
  const rel = path.relative(root, filePath);

  if (externalTools) {
    const cb = runTool('node', [path.join(root, 'scripts', 'check-blog.mjs'), rel], root);
    setMechanical(manifest, 'checkBlog', cb.ok ? 'PASS' : 'FAIL', hash);
    const pr = runTool('npx', ['prettier', '--check', rel], root);
    setMechanical(manifest, 'prettier', pr.ok ? 'PASS' : 'FAIL', hash);
  } else {
    setMechanical(manifest, 'checkBlog', 'PASS', hash); // SKIPPED (test mode)
    setMechanical(manifest, 'prettier', 'PASS', hash); // SKIPPED (test mode)
  }

  if (network) {
    const cl = runTool('node', [path.join(root, 'scripts', 'check-links.mjs'), rel], root);
    const canonical =
      data.canonical || '' || `https://simplescheduleai.com/${collection === 'article' ? 'articles' : 'blog'}/${slug}`;
    setMechanical(manifest, 'checkLinks', cl.ok || parseCheckLinksOutput(cl.out, canonical) ? 'PASS' : 'FAIL', hash);
  } else {
    setMechanical(manifest, 'checkLinks', 'PASS', hash); // SKIPPED (no-network)
  }

  const inbound = scanInboundLinks(slug, collection, root);
  setMechanical(manifest, 'inboundLinks', inbound.count >= 2 ? 'PASS' : 'FAIL', hash);

  const img = await imageCheck(data, root, network);
  setMechanical(manifest, 'image', img.ok ? 'PASS' : 'FAIL', hash);
  if (!img.ok) console.log(`  image: ${img.why}`);

  const ds = dateSanity(data);
  setMechanical(manifest, 'dateSanity', ds.ok ? 'PASS' : 'FAIL', hash);
  if (!ds.ok) console.log(`  dateSanity: ${ds.why}`);

  const facts = checkFacts(body);
  setMechanical(manifest, 'factsDossier', facts.length === 0 ? 'PASS' : 'FAIL', hash);
  for (const v of facts) console.log(`  facts drift [${v.id}] L${v.line}: ${v.message}`);

  saveManifest(manifest, root);
  return { manifest, hash };
}

export function printStatus(manifest, currentHash) {
  const { green, rows } = manifestStatus(manifest, currentHash);
  console.log(`\nPublish manifest: ${manifest.slug} (${manifest.collection})`);
  for (const r of rows) {
    const freshness = r.status === 'MISSING' ? '' : r.fresh ? '' : '  <- STALE (post edited since)';
    const mark =
      r.status === 'PASS' || ['READY', 'NOT_REQUIRED', 'OK', 'YES', 'DONE'].includes(r.status)
        ? r.fresh
          ? 'PASS '
          : 'STALE'
        : r.status === 'MISSING'
          ? 'TODO '
          : 'FAIL ';
    console.log(`  [${mark}] ${r.field}${freshness}`);
  }
  console.log(green ? '\nALL GREEN — publishable.' : '\nNOT publishable — clear the non-green rows above.');
  return green;
}

async function main() {
  const args = process.argv.slice(2);
  const consumed = new Set();
  const flagValue = (name) => {
    const i = args.indexOf(name);
    if (i < 0) return null;
    consumed.add(i);
    consumed.add(i + 1);
    return args[i + 1];
  };
  const rootArg = flagValue('--root');
  const root = rootArg ? path.resolve(rootArg) : process.cwd();
  const setArgRaw = flagValue('--set');
  const byArg = flagValue('--by');
  const network = !args.includes('--no-network');
  const externalTools = !args.includes('--skip-external-tools');
  const target = args.find((a, i) => !a.startsWith('--') && !consumed.has(i));
  if (!target) {
    console.error('Usage: publish-gate <slug|path> [--status] [--set field=value] [--by who]');
    process.exit(2);
  }

  const { slug, collection, filePath } = resolvePost(target, root);
  const currentHash = contentHash(fs.readFileSync(filePath, 'utf8'));

  if (setArgRaw) {
    const [rawField, value] = setArgRaw.split('=');
    const field = FIELD_ALIASES[rawField.toLowerCase()];
    if (!field || !RECORDED_FIELDS.includes(field)) {
      console.error(`Unknown field: ${rawField}`);
      process.exit(2);
    }
    const manifest = loadManifest(slug, root, collection);
    setRecorded(manifest, field, value, byArg || 'unknown', currentHash);
    saveManifest(manifest, root);
    process.exit(printStatus(manifest, currentHash) ? 0 : 1);
  }

  if (args.includes('--status')) {
    const manifest = loadManifest(slug, root, collection);
    process.exit(printStatus(manifest, currentHash) ? 0 : 1);
  }

  const { manifest, hash } = await runMechanical(target, root, { network, externalTools });
  process.exit(printStatus(manifest, hash) ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => {
    console.error(e.message);
    process.exit(2);
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test scripts/tests/publish-gate.test.mjs`
Expected: PASS (4 tests)

- [ ] **Step 5: Manual smoke on a real live post**

Run: `node scripts/publish-gate.mjs float-pool-nursing-small-hospitals`
Expected: mechanical rows PASS (network on), recorded rows TODO, exit 1, table printed.

- [ ] **Step 6: Commit**

```bash
git add scripts/publish-gate.mjs scripts/tests/publish-gate.test.mjs
git commit -m "feat(publish): publish-gate CLI — mechanical runner, --status, --set, hash staleness"
```

---

### Task 7: Pre-commit hook + installer

**Files:**

- Create: `scripts/hook-precommit.mjs`
- Create: `scripts/install-hooks.mjs`
- Create: `scripts/tests/hook-precommit.test.mjs`

**Interfaces:**

- Consumes: `publish-gate.mjs` CLI (full run, network on).
- Produces: `detectDraftFlips(stagedNameStatus, showFn, diffFn) -> [{path, slug}]` exported from `hook-precommit.mjs` (pure, testable); hook main that exits 1 with the status table when any flipped slug's gate is not green; `PUBLISH_OVERRIDE=1` bypass that appends `{override: true, at, reason}` to the manifest's `overrides` array and allows the commit. `install-hooks.mjs` writes `.git/hooks/pre-commit` (sh script that runs `node scripts/hook-precommit.mjs`).

- [ ] **Step 1: Write the failing test for flip detection (pure function)**

`scripts/tests/hook-precommit.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectDraftFlips } from '../hook-precommit.mjs';

const show = (staged) => (p) => staged[p] ?? '';
const diffOld = (olds) => (p) => olds[p]; // undefined = new file

test('flip true->false detected', () => {
  const flips = detectDraftFlips(
    [{ status: 'M', path: 'src/data/post/a.md' }],
    show({ 'src/data/post/a.md': '---\ndraft: false\n---\nx' }),
    diffOld({ 'src/data/post/a.md': '---\ndraft: true\n---\nx' })
  );
  assert.deepEqual(
    flips.map((f) => f.slug),
    ['a']
  );
});

test('new file with draft:false detected', () => {
  const flips = detectDraftFlips(
    [{ status: 'A', path: 'src/data/article/b.md' }],
    show({ 'src/data/article/b.md': '---\ndraft: false\n---\nx' }),
    diffOld({})
  );
  assert.deepEqual(
    flips.map((f) => f.slug),
    ['b']
  );
});

test('already-live edit and unrelated files ignored', () => {
  const flips = detectDraftFlips(
    [
      { status: 'M', path: 'src/data/post/live.md' },
      { status: 'M', path: 'scripts/check-blog.mjs' },
    ],
    show({ 'src/data/post/live.md': '---\ndraft: false\n---\nedited' }),
    diffOld({ 'src/data/post/live.md': '---\ndraft: false\n---\nx' })
  );
  assert.equal(flips.length, 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/tests/hook-precommit.test.mjs`
Expected: FAIL — module not found

- [ ] **Step 3: Implement `scripts/hook-precommit.mjs`**

```js
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
```

- [ ] **Step 4: Implement `scripts/install-hooks.mjs`**

```js
#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const hookDir = path.join(process.cwd(), '.git', 'hooks');
if (!fs.existsSync(hookDir)) {
  console.error('Not a git repo (no .git/hooks)');
  process.exit(1);
}
const hook = `#!/bin/sh\n# Installed by scripts/install-hooks.mjs — publish manifest gate\nnode scripts/hook-precommit.mjs || exit 1\n`;
const target = path.join(hookDir, 'pre-commit');
fs.writeFileSync(target, hook, { mode: 0o755 });
console.log(`Installed ${target}`);
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test scripts/tests/hook-precommit.test.mjs`
Expected: PASS (3 tests)

- [ ] **Step 6: Install and live-verify the hook**

Run:

```bash
node scripts/install-hooks.mjs
# Unrelated commit must pass untouched:
git add docs/superpowers/plans/ && git commit -m "chore: verify hook passes unrelated commits" --allow-empty
```

Expected: install prints target; empty commit succeeds with no gate output.

- [ ] **Step 7: Commit**

```bash
git add scripts/hook-precommit.mjs scripts/install-hooks.mjs scripts/tests/hook-precommit.test.mjs
git commit -m "feat(publish): pre-commit hook blocks non-green draft flips + installer"
```

---

### Task 8: smoke-routes

**Files:**

- Create: `scripts/smoke-routes.mjs`
- Create: `scripts/tests/smoke-routes.test.mjs`

**Interfaces:**

- Consumes: `listPosts` from `publish-shared.mjs`.
- Produces: `smokeRoutes(root, distDir) -> {ok: boolean, problems: string[]}` + CLI (exit 1 with problems listed). Checks: (1) each live post has `dist/blog/<slug>/index.html`, each live article `dist/articles/<slug>/index.html`; (2) no `dist/blog/blog` or `dist/articles/articles` directory; (3) each live URL appears exactly once across sitemap XML files; (4) no `&lt;div` in emitted blog/article HTML; (5) key routes exist: `/`, `/how-it-works`, `/pricing`, `/nurse-scheduling-software`, `/critical-access-hospital-scheduling`, `/ai-nurse-scheduling`, `/articles`.

- [ ] **Step 1: Write the failing tests**

`scripts/tests/smoke-routes.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { smokeRoutes } from '../smoke-routes.mjs';

const KEY = [
  '',
  'how-it-works',
  'pricing',
  'nurse-scheduling-software',
  'critical-access-hospital-scheduling',
  'ai-nurse-scheduling',
  'articles',
];

function makeSite({ doublePrefix = false, missingPost = false, leak = false } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sm-'));
  fs.mkdirSync(path.join(root, 'src', 'data', 'post'), { recursive: true });
  fs.mkdirSync(path.join(root, 'src', 'data', 'article'), { recursive: true });
  fs.writeFileSync(path.join(root, 'src', 'data', 'post', 'p1.md'), '---\ndraft: false\ntitle: P\n---\nx');
  fs.writeFileSync(path.join(root, 'src', 'data', 'article', 'a1.md'), '---\ndraft: false\ntitle: A\n---\nx');
  const dist = path.join(root, 'dist');
  for (const k of KEY) fs.mkdirSync(path.join(dist, k), { recursive: true });
  for (const k of KEY) fs.writeFileSync(path.join(dist, k, 'index.html'), '<html></html>');
  if (!missingPost) {
    fs.mkdirSync(path.join(dist, 'blog', 'p1'), { recursive: true });
    fs.writeFileSync(path.join(dist, 'blog', 'p1', 'index.html'), leak ? 'x &lt;div class="broken"' : '<html></html>');
  }
  const artDir = doublePrefix ? path.join(dist, 'articles', 'articles', 'a1') : path.join(dist, 'articles', 'a1');
  fs.mkdirSync(artDir, { recursive: true });
  fs.writeFileSync(path.join(artDir, 'index.html'), '<html></html>');
  fs.writeFileSync(
    path.join(dist, 'sitemap-0.xml'),
    `<urlset><url><loc>https://simplescheduleai.com/blog/p1</loc></url><url><loc>https://simplescheduleai.com/articles/a1</loc></url></urlset>`
  );
  return { root, dist };
}

test('healthy site passes', () => {
  const { root, dist } = makeSite();
  assert.equal(smokeRoutes(root, dist).ok, true);
});

test('double-prefix articles fails', () => {
  const { root, dist } = makeSite({ doublePrefix: true });
  const r = smokeRoutes(root, dist);
  assert.equal(r.ok, false);
  assert.ok(r.problems.some((p) => p.includes('articles/articles')));
});

test('missing live post page fails', () => {
  const { root, dist } = makeSite({ missingPost: true });
  const r = smokeRoutes(root, dist);
  assert.ok(r.problems.some((p) => p.includes('blog/p1')));
});

test('escaped-div leakage fails', () => {
  const { root, dist } = makeSite({ leak: true });
  const r = smokeRoutes(root, dist);
  assert.ok(r.problems.some((p) => p.includes('&lt;div')));
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test scripts/tests/smoke-routes.test.mjs`
Expected: FAIL — module not found

- [ ] **Step 3: Implement `scripts/smoke-routes.mjs`**

```js
#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listPosts } from './lib/publish-shared.mjs';

const KEY_ROUTES = [
  '',
  'how-it-works',
  'pricing',
  'nurse-scheduling-software',
  'critical-access-hospital-scheduling',
  'ai-nurse-scheduling',
  'articles',
];

export function smokeRoutes(root = process.cwd(), dist = path.join(root, 'dist')) {
  const problems = [];
  const live = listPosts(root).filter((p) => p.data.draft === false);

  for (const p of live) {
    const base = p.collection === 'article' ? 'articles' : 'blog';
    const page = path.join(dist, base, p.slug, 'index.html');
    if (!fs.existsSync(page)) problems.push(`missing page: ${base}/${p.slug}/index.html`);
  }

  for (const dbl of [path.join(dist, 'blog', 'blog'), path.join(dist, 'articles', 'articles')]) {
    if (fs.existsSync(dbl))
      problems.push(`double-prefix directory exists: ${path.relative(dist, dbl).replace(/\\/g, '/')}`);
  }

  const sitemapText = fs
    .readdirSync(dist)
    .filter((f) => /^sitemap.*\.xml$/.test(f))
    .map((f) => fs.readFileSync(path.join(dist, f), 'utf8'))
    .join('\n');
  for (const p of live) {
    const base = p.collection === 'article' ? 'articles' : 'blog';
    const url = `https://simplescheduleai.com/${base}/${p.slug}`;
    const n = (sitemapText.match(new RegExp(`<loc>${url}</loc>`, 'g')) || []).length;
    if (n !== 1) problems.push(`sitemap has ${n} entries for ${url} (want 1)`);
  }

  for (const p of live) {
    const base = p.collection === 'article' ? 'articles' : 'blog';
    const page = path.join(dist, base, p.slug, 'index.html');
    if (fs.existsSync(page) && fs.readFileSync(page, 'utf8').includes('&lt;div')) {
      problems.push(`escaped &lt;div leakage in ${base}/${p.slug}`);
    }
  }

  for (const r of KEY_ROUTES) {
    if (!fs.existsSync(path.join(dist, r, 'index.html'))) problems.push(`missing key route: /${r}`);
  }

  return { ok: problems.length === 0, problems };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const { ok, problems } = smokeRoutes();
  for (const p of problems) console.log(`SMOKE FAIL: ${p}`);
  console.log(ok ? 'smoke-routes: all pass' : `smoke-routes: ${problems.length} problem(s)`);
  process.exit(ok ? 0 : 1);
}
```

- [ ] **Step 4: Run tests, then run against the real build**

Run: `node --test scripts/tests/smoke-routes.test.mjs`
Expected: PASS (4 tests)
Run: `npm run build` then `node scripts/smoke-routes.mjs`
Expected: `smoke-routes: all pass` (if it fails, the failure is real — investigate before proceeding)

- [ ] **Step 5: Commit**

```bash
git add scripts/smoke-routes.mjs scripts/tests/smoke-routes.test.mjs
git commit -m "feat(ci): smoke-routes — route shape, sitemap, escaped-div assertions"
```

---

### Task 9: npm scripts, CI, SETUP docs

**Files:**

- Modify: `package.json` (scripts block)
- Modify: `.github/workflows/actions.yaml`
- Modify: `docs/SETUP.md`

**Interfaces:**

- Consumes: all CLIs from Tasks 6-8.
- Produces: `npm run publish-gate`, `npm run smoke`, `npm run setup-hooks`, `npm run test:scripts`.

- [ ] **Step 1: Add scripts to `package.json`**

In the `"scripts"` object add (keep existing entries untouched):

```json
"publish-gate": "node scripts/publish-gate.mjs",
"smoke": "node scripts/smoke-routes.mjs",
"setup-hooks": "node scripts/install-hooks.mjs",
"test:scripts": "node --test scripts/tests/"
```

- [ ] **Step 2: Wire CI**

In `.github/workflows/actions.yaml`: in the `build` job after `- run: npm run build`, add:

```yaml
- run: npm run smoke
```

In the `check` job after `- run: npm run check`, add:

```yaml
- run: npm run test:scripts
```

- [ ] **Step 3: Document setup**

In `docs/SETUP.md`, add to the setup steps:

```markdown
## Publish gate hooks

After cloning, install the pre-commit publish gate (blocks committing a `draft: false` flip whose publish manifest is not green):

    npm run setup-hooks

Manifests live in `.publish/<slug>.json`. Check status: `npm run publish-gate <slug> -- --status`. Record verdicts: `npm run publish-gate <slug> -- --set proofread=READY --by <agent>`. Emergency bypass (recorded in the manifest, never silent): `PUBLISH_OVERRIDE=1 PUBLISH_OVERRIDE_REASON="why" git commit ...`
```

- [ ] **Step 4: Verify**

Run: `npm run test:scripts`
Expected: all suites pass.
Run: `npm run publish-gate float-pool-nursing-small-hospitals -- --status`
Expected: status table prints.

- [ ] **Step 5: Commit**

```bash
npx prettier --write package.json docs/SETUP.md
git add package.json .github/workflows/actions.yaml docs/SETUP.md
git commit -m "chore(publish): npm scripts, CI smoke + script tests, setup docs"
```

---

### Task 10: Pipeline skill + doc pointers

**Files:**

- Create: `.claude/skills/publish-pipeline.md`
- Modify: `CLAUDE.md` (Blog Writing Pipeline section)
- Modify: `docs/seo/pre-publish-checklist.md` (proofread-agent section)

**Interfaces:**

- Consumes: the manifest field names from Task 5 (exact: `checkBlog`, `checkLinks`, `inboundLinks`, `image`, `prettier`, `dateSanity`, `factsDossier`, `proofread`, `factCheck`, `imageEyeball`, `founderApproval`, `indexNow`, `gscSitemap`).
- Produces: the single operational spec any driving model follows.

- [ ] **Step 1: Write `.claude/skills/publish-pipeline.md`**

```markdown
---
name: publish-pipeline
description: Load before writing, editing, gating, or publishing ANY blog post (src/data/post) or Newsroom article (src/data/article). The manifest-enforced publish pipeline; every phase maps to a manifest field that publish-gate must show green before the draft flip can commit.
---

# Publish Pipeline (manifest-enforced)

State lives in `.publish/<slug>.json`, not in this conversation. FIRST command on any session touching a publish: `npm run publish-gate <slug> -- --status`. The table IS the to-do list; resume from the non-green rows.

## Model roles (post-Fable)

- Strongest available model (Opus): orchestration, drafting, judgment review, applying fixes.
- Cheaper models (Sonnet): research fan-out, fact verification, mechanical fix rounds.
- The pipeline is model-agnostic: no phase relies on a model remembering state — the manifest carries it.

## Phases -> manifest fields

1. **Research brief** (read-only agent; competitor dossier + facts dossier + checklist externals). No field; the brief feeds phase 2.
2. **Draft** (writing agent): load `.claude/skills/seo-aeo-simplescheduleai.md` (+ `trendjacking-articles.md` for /articles, `competitor-reviews.md` for competitor content). EVERY fact with a `docs/seo/facts-dossier.md` entry uses dossier wording; new facts get verified + ADDED to the dossier in the same session. Fields this phase must leave green after step 3: `factsDossier`.
3. **Mechanical gate**: `npm run publish-gate <slug>` — fills `checkBlog`, `checkLinks`, `inboundLinks`, `image`, `prettier`, `dateSanity`, `factsDossier`. Fix every FAIL and re-run; never hand-wave a red row.
4. **Inbound links**: wire >= 2 links from LIVE sibling posts (natural in-prose anchors); re-run the gate (`inboundLinks`).
5. **Proofread agent** (`feature-dev:code-reviewer`): diff against 3 canonical posts OF THE SAME post type — BOFU/comparison: schedule360-alternatives, best-nurse-scheduling-software-2026, qgenda-alternatives; MOFU explainer/operational: self-scheduling-problems-critical-access-hospital, after-hours-callout-coverage-small-hospitals, night-shift-nurse-schedule-coverage; TOFU/glossary: 3 live same-type posts (e.g. what-is-per-diem-nursing). Judgment items only (ICP voice, excerpt hook, title claim, repetition/AI-tells, worked-math honesty). On READY-TO-PUBLISH: `npm run publish-gate <slug> -- --set proofread=READY --by feature-dev:code-reviewer`. Any post edit AFTER the verdict stales it — re-run or re-confirm.
6. **Fact-check agent** (only when the post introduces facts NOT already in the dossier): verify each against primary sources; add them to the dossier; then `--set factcheck=PASS --by <agent>`. If every fact came from the dossier: `--set factcheck=NOT_REQUIRED`.
7. **Human image eyeball**: founder (or a human) looks at the rendered hero. Topic-match rule: staffing post -> staff/team imagery; compliance -> institutional/paperwork; NEVER clinical-procedure or patient-distress imagery. Then `--set image-eyeball=OK`.
8. **Founder approval**: ONLY on explicit instruction ("publish X"), never inferred: `--set founder-approval=YES --by founder`.
9. **Commit + push**: flip `draft: false`, prettier the changed files, commit. The pre-commit hook re-runs the gate and blocks if anything is red or stale. Push (deploy is Netlify-on-push).
10. **Post-publish**: submit IndexNow (Bing) + GSC sitemap; record `--set indexnow=DONE` and `--set gsc-sitemap=DONE` (non-blocking). Verify the live URL returns 200.

## Ground rules carried over

- Verify subagent output against the diff, never its self-report.
- Newsroom articles follow `trendjacking-articles.md` for detection/scoring; this pipeline governs their gate + publish identically.
- `npm run smoke` after any routing/template change; CI runs it on every push.
```

- [ ] **Step 2: Shrink CLAUDE.md's pipeline section**

In `CLAUDE.md`, replace the body of the "Blog Writing Pipeline (3-Agent Process)" section (keep the heading) with:

```markdown
The pipeline is manifest-enforced. Load `.claude/skills/publish-pipeline.md` before writing, gating, or publishing any post/article — it maps every phase to the `.publish/<slug>.json` manifest field that `npm run publish-gate` must show green. The pre-commit hook blocks a `draft: false` flip whose manifest is not green. First command on any publish session: `npm run publish-gate <slug> -- --status`.

Phase order (details in the skill): research brief -> draft (skills + facts dossier) -> mechanical gate -> inbound links -> proofread agent (post-type reference matrix) -> fact-check agent (new facts only) -> human image eyeball -> founder approval -> commit (hook verifies) -> push -> IndexNow/GSC.
```

Do not touch any other CLAUDE.md section.

- [ ] **Step 3: Point the checklist's proofread-agent section at the skill**

In `docs/seo/pre-publish-checklist.md`, in the "Pre-Publish Proofreading Agent (Final Gate)" section, add directly under the section heading:

```markdown
> The operational flow (including the post-type reference matrix and the manifest fields each verdict must set) now lives in `.claude/skills/publish-pipeline.md`. This section stays as the check catalog; the skill is the runbook.
```

- [ ] **Step 4: Verify + commit**

Run: `npm run publish-gate float-pool-nursing-small-hospitals -- --status` (still works)

```bash
npx prettier --write .claude/skills/publish-pipeline.md CLAUDE.md docs/seo/pre-publish-checklist.md
git add .claude/skills/publish-pipeline.md CLAUDE.md docs/seo/pre-publish-checklist.md
git commit -m "docs(pipeline): publish-pipeline skill; CLAUDE.md + checklist point at it"
```

---

### Task 11: End-to-end dry run (operational verification)

**Files:**

- No new files; exercises everything.

- [ ] **Step 1: Backfill manifests for the three most recent live posts**

Run for each of `nurse-burnout-scheduling-cah`, `float-pool-nursing-small-hospitals`, `nurse-shortage-or-retention-crisis-rural-hospitals`:

```bash
npm run publish-gate <slug>
npm run publish-gate <slug> -- --set proofread=READY --by backfill
npm run publish-gate <slug> -- --set factcheck=PASS --by backfill
npm run publish-gate <slug> -- --set image-eyeball=OK --by backfill
npm run publish-gate <slug> -- --set founder-approval=YES --by backfill
```

Expected: each ends `ALL GREEN`. Any mechanical FAIL on a live post is a real regression — fix it before proceeding.

- [ ] **Step 2: Prove the hook blocks**

```bash
# Pick any draft post, flip draft: false WITHOUT running the pipeline, stage it, try to commit.
```

Expected: commit BLOCKED with the status table (recorded fields TODO). Then revert the flip (`git checkout -- <file>`).

- [ ] **Step 3: Prove the override records**

Repeat the flip, commit with `PUBLISH_OVERRIDE=1 PUBLISH_OVERRIDE_REASON="dry-run test"`.
Expected: commit succeeds; `.publish/<slug>.json` contains the override entry. Then `git reset --soft HEAD~1` and revert the flip — do NOT leave the test publish in history that gets pushed.

- [ ] **Step 4: Commit backfilled manifests**

```bash
git add .publish/
git commit -m "chore(publish): backfill manifests for recent live posts + dry-run verified"
git push
```

---

## After this plan (operational, separate sessions before 2026-07-07)

1. **Dossier live-verification (Fable):** re-verify every facts-dossier entry against its primary source; update `Verified:` dates.
2. **Risk-ranked corpus audit (Fable):** every live post/page against the full ruleset (facts drift, CFR, stale pilot refs, self-labels, orphans, image topic-match, structure). Output: ranked defect inventory -> fix the top tier (factual/regulatory/capability claims); write `docs/seo/corpus-backlog.md` with the remainder (each entry sized + tagged for later Sonnet sessions).
3. **First real publish through the full pipeline** end-to-end with the hook armed.

```

```
