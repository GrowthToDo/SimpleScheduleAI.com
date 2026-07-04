# Corpus Backlog — Non-Facts Debt Audit (2026-07-04)

Risk-ranked audit of every LIVE post in `src/data/post` (48 files) + `src/data/article` (1 live article; `sample-newsroom-article.md` is a template, not counted). Scope excludes factual/regulatory-accuracy issues (separate workstream) and covers only the 8 defect classes below: stale pilot references, "managed service" self-labels, retired/ad-hoc pricing lines, CTA deviations, structural drift, image topic-mismatch, volume language near competitor names, and NSI year-label inconsistencies.

Method: grep-first across the confirmed-live file list (cross-checked against `draft:` frontmatter), plus `npm run check-blog -- --live` for structural WARNs. Every finding below was verified by direct file read, not taken from a subagent's self-report (two general-purpose subagents were spawned for this task but returned no usable findings after several turns; all data here was gathered directly).

## Per-class totals

| Class | Description | Live hits found |
|---|---|---|
| 1. Stale pilot references | "free pilot", "/pilot", "60-day pilot", etc. | **0** |
| 2. "managed service" self-labels | "SimpleScheduleAI is a managed ... service" pattern | **3** (all other ~35 "managed service" occurrences are legitimate category/comparison framing) |
| 3. Retired/ad-hoc pricing line | Non-canonical SimpleScheduleAI pricing phrasing | **1** |
| 4. CTA deviations | Two-button anti-pattern; Our Take/What-to-Do-This-Week gaps or missing | **4** (0 two-button hits; 1 missing "Our Take" on a BOFU-type post; 3 posts missing "What to Do This Week" outside the glossary exemption) |
| 5. Structural drift | Missing sections, bulleted Sources, old bio, TL;DR, missing `/simulator` | **6** (5 missing `/simulator`; 0 bulleted Sources; 0 old bio; 0 TL;DR) |
| 6. Image topic-mismatch / near-duplicate | Weak topic fit or clustered imagery | **1** clear mismatch candidate; 0 exact-duplicate image URLs in the live set |
| 7. Volume language near competitor names | "consistently"/"widely" etc. in the same sentence as a competitor name | **0** (all volume-language WARNs from `check-blog` are NOT competitor-adjacent on the same line; lower priority than expected) |
| 8. NSI year-label inconsistencies | Mismatched report year/figure for the NSI retention report | **2** |
| Sources label/URL mismatch (bonus, surfaced by check-blog) | "CMS" label pointing to an eCFR URL host | **4** (hard failures per `check-blog`) |

Total confirmed action items: **21** across classes, plus a noisy ~30-file "$-mentions but no `/roi` link" signal that needs human judgment, not a mechanical row (see Tier 3 note).

## Tier 1 — Misleads the ICP (fix soon)

Files: **4**

| File | Class | Line(s) | Finding | Fix | Size |
|---|---|---|---|---|---|
| `src/data/post/best-nurse-scheduling-software-2026.md` | 3. Ad-hoc pricing | L617 | `SimpleScheduleAI uses flat-fee pricing - contact for current rates.` — stale ad-hoc phrasing, not the canonical line, sits in a live FAQ answer an ICP reader or LLM may cite as current pricing | Replace with canonical: `SimpleScheduleAI uses flat monthly pricing: $1,000/month for up to 20 nurses, $1,500/month for 21 to 40 nurses. No per-nurse fees, no setup fees.` | S |
| `src/data/post/qgenda-alternatives.md` | 2. Self-label | L24 | `SimpleScheduleAI is a managed nursing-only alternative built for Texas Critical Access Hospitals...` — self-describes SSAI as "a managed [X]" in first person | Reword to "AI-native nurse scheduling service" framing per the standing self-label rule | S |
| `src/data/post/shiftwizard-alternatives.md` | 2. Self-label | L152 | `SimpleScheduleAI is a managed [nurse scheduling service](/how-it-works) built specifically for Critical Access Hospitals in Texas.` | Reword to "AI-native nurse scheduling service" | S |
| `src/data/post/shiftwizard-vs-managed-service.md` | 2. Self-label | L203 | `SimpleScheduleAI is a managed [nurse scheduling service](/how-it-works) for Critical Access Hospitals in Texas. We are not a self-serve scheduling platform...` | Reword to "AI-native nurse scheduling service"; keep the "not a self-serve platform" honest-limitation framing intact | S |

Note on scope: the check-blog `--live` pass also hard-fails 4 files for a **Sources label/URL mismatch** (label says "CMS" but the hyperlink host is `www.ecfr.gov`) — these are correct citations (CMS's own regulation, hosted on eCFR) just mislabeled for the script's matcher. Not an ICP-misleading issue, but worth a mechanical fix since `check-blog` treats it as a hard failure:
`best-nurse-scheduling-software-critical-access-hospitals.md` L602, `nurse-scheduling-software-pricing.md` L237, `nurse-scheduling-software-small-hospital.md` L229, `texas-nursing-overtime-compliance-cah.md` L289. Fix: reword the source label to `CMS Conditions of Participation via eCFR` or similar so label and host agree. Size: S (all 4, same fix pattern).

## Tier 2 — Trust / UX

Files: **7**

| File | Class | Line(s) | Finding | Fix | Size |
|---|---|---|---|---|---|
| `src/data/post/healthcare-scheduling-crisis.md` | 8. NSI year mismatch | L290 vs L53/L201/L303 | Infographic stat card says `avg cost per RN departure (NSI 2024)` at `$52K`, while the same post's prose and numbered Sources cite `NSI 2025` at `$61,110` (L53, L201, L303) — two different report years and figures inside one post | Update the L290 card to `$61,110` / `NSI 2025` to match the rest of the post, or clearly footnote why the figure differs | S |
| `src/data/post/healthcare-workforce-management-cah.md` | 8. NSI year mismatch | L255, L269 | Cites `2024 NSI National Health Care Retention Report` with a `$56,300` turnover-cost figure — differs from the `2025` report's `$61,110` figure used corpus-wide in ~10 other live posts | Verify which NSI report year is actually current/correct and align the figure and year label with the corpus-wide citation (2025 / $61,110), or confirm the 2024 figure is intentional and note why | M (needs a source-verification pass, not just a text swap) |
| `src/data/post/nurse-rostering-vs-scheduling-software.md` | 4. Missing "Our Take" | — | This is a comparison-style post (software-vs-model framing) with no "Our Take" callout anywhere in the file | Add a 50-100 word "Our Take" callout immediately before "What to Do This Week" per the standard pattern | M |
| `src/data/post/float-pool-nursing-small-hospitals.md` | 4/5. Missing "What to Do This Week" | — | Operational-guide post with no WTDT section | Add 5-numbered-step WTDT section before FAQ | M |
| `src/data/post/night-shift-nurse-schedule-coverage.md` | 4/5. Missing "What to Do This Week" | — | Operational-guide post with no WTDT section | Add WTDT section | M |
| `src/data/post/nurse-burnout-scheduling-cah.md` | 4/5. Missing "What to Do This Week" | — | Operational-guide post with no WTDT section | Add WTDT section | M |
| `src/data/post/nurse-staffing-ratios-critical-access-hospital.md` | 4/5. Missing "What to Do This Week" | — | Operational-guide post with no WTDT section | Add WTDT section | M |

`nurse-rostering-vs-scheduling-software.md` also lacks WTDT (already flagged above for missing "Our Take"; both gaps live in the same file — treat as one M-size fix). `nurse-shortage-or-retention-crisis-rural-hospitals.md` (the live Newsroom article) also lacks WTDT and "Our Take," but Newsroom/trendjacking pieces are a different post type per `.claude/skills/trendjacking-articles.md` and are not held to the blog BOFU spine — excluded from this tier, noted for awareness only.

`what-is-a-critical-access-hospital.md` and `what-is-per-diem-nursing.md` are glossary/definitional posts, where both "Our Take" and "What to Do This Week" are explicitly optional per the checklist — not counted as defects.

## Tier 3 — Polish

Files: **7** (+ noisy `/roi` signal, see note)

| File | Class | Line(s) | Finding | Fix | Size |
|---|---|---|---|---|---|
| `src/data/post/texas-nursing-overtime-compliance-cah.md` | 6. Image topic-mismatch | frontmatter `image:` | Uses a "wall covered in colorful sticky notes" (pool topics: planning/workflow/compliance/admin) for an FLSA/overtime legal-compliance post — technically tagged "compliance" but the actual photo (sticky-note brainstorming wall) reads as generic office-planning, not overtime/legal-compliance specific | Swap for a more institutional/paperwork/legal-document-style image if pool has a closer match; otherwise low priority, tag match is defensible | S |
| `src/data/post/float-pool-nursing-small-hospitals.md` | 5. Missing `/simulator` | — | No `/simulator` link; post covers AI scheduling/callout coverage territory where the checklist recommends linking it | Add one natural `[interactive simulator](/simulator)` mention | S |
| `src/data/post/night-shift-nurse-schedule-coverage.md` | 5. Missing `/simulator` | — | Same as above | Add `/simulator` link | S |
| `src/data/post/nurse-staffing-ratios-critical-access-hospital.md` | 5. Missing `/simulator` | — | Same as above | Add `/simulator` link | S |
| `src/data/post/what-is-a-critical-access-hospital.md` | 5. Missing `/simulator` | — | Glossary post — checklist explicitly allows skipping tightly-scoped glossary posts; low priority | Optional, skip unless doing a sweep | S |
| `src/data/article/nurse-shortage-or-retention-crisis-rural-hospitals.md` | 5. Missing `/simulator` | — | Newsroom article, different post type; optional | Optional | S |
| — | — | — | — | — | — |

`/roi` linking: ~32 live files mention a dollar figure 4+ times but have no `/roi` link. This raw grep signal is too noisy to list as individual backlog rows (most are single competitor-pricing citations or a one-off stat, not a genuine "pricing math / weekly time cost" section the checklist targets). Recommend a human pass filtering this list down to posts with an actual savings/ROI worked-math section before treating any single file as an action item. Candidates most likely to be genuine on a skim: `nursing-scheduling-software-ai.md`, `what-automated-nurse-scheduling-actually-means.md`, `m7-health-vs-simplescheduleai.md`, `nurse-rostering-vs-scheduling-software.md` (all carry substantial worked-math sections).

## Top 5 worst files (most defect classes hit)

1. **`healthcare-scheduling-crisis.md`** — NSI year/figure internal mismatch (Tier 2) + missing "Our Take" (expected-absent per no-BOFU-callout norm, not double counted) + 2832-word count outside TOFU range (check-blog WARN, not scored here) + author bio missing CAH reference (check-blog WARN).
2. **`shiftwizard-vs-managed-service.md`** — Self-label (Tier 1) + missing "Not right for" disclaimer (check-blog WARN) + author bio missing CAH reference + internal-link orphan (1 inbound, needs 2).
3. **`qgenda-alternatives.md`** — Self-label (Tier 1) + missing "Not right for" disclaimer + founder-credibility signal missing (check-blog WARNs).
4. **`nurse-rostering-vs-scheduling-software.md`** — Missing "Our Take" AND missing "What to Do This Week" (Tier 2, both structural gaps in one file) + no `/roi` despite heavy $ math.
5. **`healthcare-workforce-management-cah.md`** — NSI year/figure mismatch vs. corpus (Tier 2) + missing "Our Take" + 2850-word count outside MOFU range (check-blog WARN) + volume-language WARN (non-competitor-adjacent).

## Anything to fix TODAY rather than backlog

Recommend fixing today (all Tier 1, all Small, ~15 minutes total):

1. **`best-nurse-scheduling-software-2026.md` L617** — swap the stale ad-hoc pricing line for the canonical one. This is a live FAQ answer stating SSAI's own pricing incorrectly; highest ICP-misleading risk in the audit.
2. **The 3 "SimpleScheduleAI is a managed service" self-labels** (`qgenda-alternatives.md` L24, `shiftwizard-alternatives.md` L152, `shiftwizard-vs-managed-service.md` L203) — direct violations of the standing founder-set self-label rule (`AI-native nurse scheduling service`, never "managed service" as a self-description).

Everything else (Tier 2 structural gaps, Tier 3 polish, the eCFR source-label mismatches, the `/roi` noise) is fine to queue as backlog — none of it misrepresents SSAI's offer or pricing to a reader.
