# Model-Agnostic Publish System — Design Spec

Date: 2026-07-03
Status: Approved (Approach A, founder-selected)
Deadline context: Fable access ends after 2026-07-07. All systems below must make Opus/Sonnet-only execution first-pass correct.

## Problem

Quality today depends on the driving model remembering to execute every pipeline step. Prose checklists (CLAUDE.md, pre-publish-checklist.md) are advisory; steps get skipped under pace, and gaps ship. Evidence from the week of 2026-06-30 alone, each reaching the founder despite the pipeline:

- NNU fact sheet dated by a secondary republication (Jun 3) instead of the primary source (May 26)
- A JAMA statistic hyperlinked to NNU instead of the JAMA research letter
- 42 CFR 485.635(d)(1) clause misattributed to 485.631 in a FAQ
- "A registered nurse must be on duty" overstating 485.631(a)(5) (reg permits RN, CNS, or LPN) in two places while the FAQ said it correctly
- getStaticPaths emitting /articles/articles/<slug> — a 404 shipped to production on the first live article
- A hero image with wrong tone (patient being handled) on a live post
- A missing /simulator internal link (43/44 posts have it)

Each is a class, not a one-off. The fix is structural: the repo tracks pipeline state and blocks incomplete publishes; verified facts live in a dossier, not in model recall.

## Goals

1. A blog/article publish cannot reach a commit with any required step unexecuted.
2. Recurring facts (stats, regulations, product truths) have one canonical, verified wording that agents must use.
3. The pipeline executes identically regardless of which model drives (Opus, Sonnet, or any future model).
4. A half-finished publish is resumable from persisted state, not from conversation memory.
5. Route-level regressions (the /articles/articles class) are caught by CI before deploy.
6. Corpus debt is inventoried completely and the top risk tier fixed while Fable is available.

## Non-Goals

- Headless/cron full automation of the pipeline (rejected as Approach C: brittle, overkill for 1-2 posts/day).
- Auto-publishing. The founder go-ahead stays a human step, recorded in the manifest ("Publish only on explicit instruction" rule unchanged).
- Replacing human image eyeball. It stays human; the manifest only records that it happened.

## Component 1 — Publish manifest + gate runner

`scripts/publish-gate.mjs <slug-or-path>` with a sidecar manifest at `.publish/<slug>.json` (directory committed to git).

Manifest fields, two kinds:

**Mechanical (auto-filled by re-running, never trusted from cache):**

- `checkBlog`: 0 hard failures (`scripts/check-blog.mjs`)
- `checkLinks`: 0 hard-broken external links (`scripts/check-links.mjs`; 403/429/999 = bot-block pass; the canonical self-URL 404 is expected pre-deploy and ignored)
- `inboundLinks`: >= 2 inbound links from LIVE sibling posts (corpus scan)
- `image`: ID present in `scripts/image-pool.json`, unique across `src/data`, URL returns HTTP 200 image/\*
- `prettier`: file formatted (`--check`)
- `dateSanity`: publishDate == today-or-past, not placeholder; updateDate >= publishDate
- `factsDossier`: no known-drift pattern deviates from dossier wording (see Component 3)

Each mechanical field stores `{status, checkedAt, contentHash}`. If the post's content hash changes, all mechanical fields flip to STALE and must re-run. Green = fresh pass only.

**Recorded (judgment/human, set via CLI):**

- `proofread`: `--set proofread=READY --by feature-dev:code-reviewer` — the post-type-matrix proofread agent's verdict
- `factCheck`: `--set factcheck=PASS --by <agent>` — fact-check agent verdict (required when the post introduces facts not already in the dossier)
- `imageEyeball`: `--set image-eyeball=OK` — human confirmed rendered image relevance/tone
- `founderApproval`: `--set founder-approval=YES` — explicit go-ahead
- `indexNow` / `gscSitemap`: post-publish submissions (recorded after push; not commit-blocking)

Recorded fields also carry `{setAt, setBy, contentHash}`; a content change after a verdict flips it STALE (a post edited after proofread needs re-proofread or explicit re-confirm).

CLI surface:

- `publish-gate <slug>` — run all mechanical checks, update manifest, print status table
- `publish-gate <slug> --status` — print without re-running (marks stale)
- `publish-gate <slug> --set <field>=<value> [--by <who>]`
- Exit code: 0 only when every commit-blocking field is green and fresh

`--status` output is deliberately the orchestrator's to-do list: any model resumes a half-finished publish by reading the table, not by re-deriving state from conversation.

## Component 2 — Pre-commit hook

Plain `.git/hooks/pre-commit` installed by a committed `scripts/install-hooks.mjs` (run via `npm run setup-hooks`; documented in docs/SETUP.md; no husky dependency).

Behavior:

- Inspects the staged diff. Fires ONLY when a file under `src/data/post/` or `src/data/article/` flips `draft: true -> false` or is added new with `draft: false`.
- For each such slug, runs `publish-gate <slug>` (fresh mechanical run + recorded-field check). Any non-green blocks the commit with the status table printed.
- All other commits (code, docs, image pool, edits to already-live posts) pass untouched.
- Escape hatch: `PUBLISH_OVERRIDE=1 git commit ...` allows the commit but writes `{override: true, at, reason: $PUBLISH_OVERRIDE_REASON}` into the manifest — visible forever, never silent.

## Component 3 — Facts dossier

`docs/seo/facts-dossier.md`, maintained exactly like the competitor dossier (verify -> use -> log).

Sections:

1. **External facts** — one entry per recurring stat/regulation: approved exact wording, year/edition, canonical URL, verified date, and a "wrong versions" list. Initial population (Fable verifies each against the primary source live):
   - 42 CFR 485.631(a)(5): "A registered nurse, clinical nurse specialist, or licensed practical nurse is on duty whenever the CAH has one or more inpatients." Wrong: "a registered nurse must be on duty" (RN-only overstates).
   - 42 CFR 485.635(d): RN provides-or-supervises nursing care of each patient. Wrong: attributing this clause to 485.631.
   - NSI 2025: $61,110 per staff RN replacement; 16.4% national RN turnover (CY2024 data). Note: the NSI PDF URL is a rolling filename now serving the 2026 edition; the citation label stays "2025 report".
   - NNU fact sheet: ~1.15M licensed RNs not working as nurses; primary source dated May 26, 2026 (BLS release May 15, 2026). Wrong: June 3, 2026 (secondary republication).
   - JAMA Network Open (Feb 9, 2026), Lasater/McHugh/Muir: adequate staffing named by 65% of nonretired RNs who left hospital jobs; direct URL jamanetwork.com/journals/jamanetworkopen/fullarticle/2844818. Wrong: citing NNU for this stat; wrong: "65% of respondents" without the nonretired qualifier.
   - RHIhub: 63.1% of primary care HPSAs are rural (HRSA State of the Primary Care Workforce 2025).
   - FLSA: DOL Fact Sheet #54; 8-and-80 is an educational topic only, never an SSAI feature.
   - (Grow with each new recurring fact; every new externally-sourced stat used in a post gets an entry at publish time.)
2. **Product truths** — canonical pricing line, self-label ("AI-native nurse scheduling service"), NOT-shipped list (8-and-80 calculation, credential tracking), no-customers/no-pilots, retired free pilot.
3. **Maintenance log** — same convention as competitor dossier; entries re-verified when >60 days old at use time.

Enforcement: `check-blog.mjs` gains a `facts` rule — a small pattern table (regex -> dossier anchor) flags any known-drift topic whose wording deviates: `485\.63[15]`, `\$61,?110|\$52,?350`, `1\.15\s*million`, `16\.4%`, `8.and.80`, `63\.1%`. Deviation = hard failure pointing at the dossier entry.

Writing-agent rule (in the pipeline skill): any fact with a dossier entry MUST use dossier wording; a fact not in the dossier must be verified against a primary source and added in the same session.

## Component 4 — Pipeline skill + model roles

New `.claude/skills/publish-pipeline.md` becomes the single operational spec. CLAUDE.md's pipeline section shrinks to a pointer + the phase diagram.

Contents:

- Phase list where every phase names the manifest field it must turn green, in order: research brief -> draft (skills + dossier) -> `publish-gate` mechanical pass -> inbound links wired -> proofread agent (post-type reference matrix, verdict recorded) -> fact-check agent when new facts introduced (verdict recorded) -> human image eyeball (recorded) -> founder approval (recorded) -> commit (hook verifies) -> push -> IndexNow + GSC (recorded)
- Post-type proofread reference matrix (moved from checklist prose into the skill, checklist keeps a pointer)
- Model-role mapping, explicit: Opus = orchestrator, drafting, judgment review; Sonnet = research fan-out, fact-check verification, mechanical fix rounds; effort guidance per phase. Wording is model-agnostic ("the strongest available model drafts; cheaper models fan out") so the mapping survives future lineups.
- Resume protocol: on any session start touching a publish, first command is `publish-gate <slug> --status`.

## Component 5 — Code/design safety

`scripts/smoke-routes.mjs`, run after `npm run build` (wired into `actions.yaml` CI and available as `npm run smoke`):

- Every live (draft:false) post emits exactly `dist/blog/<slug>/index.html`; every live article emits exactly `dist/articles/<slug>/index.html`; zero double-prefix paths (`blog/blog/`, `articles/articles/`)
- Sitemap contains each live URL exactly once
- Zero `&lt;div` (escaped-HTML leakage) in emitted blog/article HTML
- Key static routes exist: `/`, `/how-it-works`, `/pricing`, `/nurse-scheduling-software`, `/critical-access-hospital-scheduling`, `/ai-nurse-scheduling`, `/articles`

Design/visual rules (checklist + pipeline skill, judgment stays human):

- Hero must topic-match the post's subject class (staffing post -> staff/team imagery; compliance -> institutional/paperwork; never clinical-procedure or patient-distress imagery)
- `imageEyeball` manifest field is the enforcement: a human looked at the rendered image

## Component 5b — Site-health gate (beyond blog publishing)

Founder directive (2026-07-03): the system must cover website handling broadly, not only the blog pipeline. `smoke-routes` therefore grows into a site-health gate with these additional deterministic checks (same script, same CI wiring):

- **Redirect integrity:** every `netlify.toml` redirect `to` target (internal, non-splat) resolves to an emitted page in `dist/` (or is the 404 catch-all). A redirect landing on a missing page is a silent equity leak.
- **Page meta assertions:** every emitted HTML page has exactly one `<title>`, exactly one `<link rel="canonical">`, a `<meta name="description">`, and exactly one `<h1>`. Catches template regressions on ANY page (pricing, pillars, articles), not just posts.
- **Nav integrity:** every internal `href` in the emitted header/footer nav resolves to an emitted page.
- **robots.txt:** still allows AI crawlers (no accidental `Disallow: /` or agent blocks).

Non-mechanical site aspects stay in their existing homes and are NOT duplicated here: SEO drift monitoring (`/seo drift baseline|compare` skill, weekly), performance (CWV via the seo skills), design judgment (human eyeball + frontend-design skill), dependency/security (out of scope for this system). The coverage principle stands: if a site-handling rule can be made deterministic, it belongs in the site-health gate; if it needs judgment, it gets a recorded manifest-style step or a named skill.

## Component 6 — Fable burn-down plan (by 2026-07-07)

- Day 1: Components 1-3 built; Fable live-verifies every dossier fact against primary sources.
- Day 2: Components 4-5; risk-ranked corpus audit — every live post/page audited against the full current ruleset (facts, CFR, pilot refs, self-labels, orphans, images, structure), output = ranked defect inventory.
- Day 3: fix top tier (factual/regulatory/capability claims that could mislead an ICP reader); write `docs/seo/corpus-backlog.md` with the remainder, each entry sized and tagged for Sonnet-later.
- Day 4: buffer; dry-run the full pipeline (manifest, hook, dossier rule, smoke test) on the next real post end-to-end.

## Error-class coverage map

| This week's error            | Structural control                                             |
| ---------------------------- | -------------------------------------------------------------- |
| NNU secondary-source date    | Facts dossier entry + facts rule                               |
| JAMA stat linked to NNU      | Facts dossier entry (canonical URL per stat)                   |
| CFR 485.631 vs 485.635 mixup | Dossier clause map + check-blog facts rule                     |
| RN-only overstating the reg  | Dossier approved wording + facts rule                          |
| /articles/articles 404       | smoke-routes in CI                                             |
| Skipped checklist steps      | Manifest + pre-commit block                                    |
| Wrong-tone hero image        | imageEyeball manifest field + topic-match rule                 |
| Missing /simulator link      | check-blog WARN exists; pipeline skill lists it in draft phase |
| Half-done session resume     | Manifest --status as to-do list                                |

## Testing

- publish-gate: unit-style run against a fixture post in each state (draft, missing inbound, stale verdict, all-green); assert exit codes.
- Hook: staged-diff simulation — flip a fixture draft:false with red manifest (expect block), with green manifest (expect pass), unrelated commit (expect pass), override path writes the override record.
- smoke-routes: run against current `dist/` (must pass), then against a synthetic double-prefix fixture (must fail).
- facts rule: seed a post with each wrong-version pattern; expect hard failure naming the dossier anchor.
- Dry-run: one real post through the entire flow before the 7th.

## Risks

- Hook friction on legitimate commits -> scoped trigger (only draft-flips) + visible override.
- `.publish/` sidecars add repo noise -> one small JSON per published post; acceptable, greppable, and they double as an audit log.
- Facts-rule false positives (e.g. a post legitimately quoting the wrong-version phrasing to debunk it) -> per-line opt-out comment `<!-- facts-ok -->`, same pattern as lint suppressions, visible in review.
- Dossier staleness -> 60-day re-verify convention + maintenance log, same as competitor dossier (already proven).
