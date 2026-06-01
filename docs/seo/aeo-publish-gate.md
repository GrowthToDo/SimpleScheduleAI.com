# AEO Publish Gate + Drift Monitoring

How we use the `claude-seo` plugin (AgriciDaniel/claude-seo, v2+) on top of our existing publish pipeline. This doc is the cheat sheet; the canonical writing rules still live in `.claude/skills/seo-aeo-simplescheduleai.md` and `docs/seo/pre-publish-checklist.md`.

## What we adopted from claude-seo v2

Only three sub-skills. Everything else stays subordinate to our project-specific rules.

| Sub-skill                                       | When we run it                                                       | Why                                                                                                                                   |
| ----------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `/seo geo <url>`                                | Post-build, pre-push, on every new or significantly-edited blog post | Question-based AI citability scoring. Targets the actual AEO goal (AI Overview / ChatGPT / Perplexity pickup).                        |
| `/seo drift baseline / compare / history <url>` | Baseline once on the top URLs. Compare weekly.                       | Catches silent regressions (meta/canonical/schema/title) Netlify rebuilds can introduce. Snapshot lives in SQLite locally.            |
| `/seo content humanize`                         | Second-opinion on long-form drafts before merging                    | Reinforces our em-dash + no-AI-tone hard rule. Their list is broader; ours stays stricter. They flag, we still gate on our own rules. |

## What we are NOT adopting (yet)

- **`/seo audit <url>` as a publish gate** — too broad, generic E-E-A-T scoring not tuned for CAH MOFU content. Run quarterly as a sanity check, not per post.
- **Profound MCP extension** — $99-$399/mo enterprise pricing; SimpleScheduleAI brand has limited LLM citation surface today, so the value is months away. Re-evaluate at 12-18 months once we accumulate LLM mentions. In the meantime, DataForSEO `ai_opt_llm_ment_*` tools (already wired, free tier covers our scale) serve the same job.
- **Ahrefs / SE Ranking MCP extensions** — paid, redundant with DataForSEO which we already use for SERP + backlinks.
- **Bing Webmaster MCP from claude-seo** — we already have a Bing Webmaster MCP wired separately.
- **`/seo content humanize` as authority** — their phrase list is broader, but our em-dash + AI-tone rule is stricter and project-specific. Use claude-seo as a second pair of eyes only.

## Publish pipeline with the AEO gate added

Existing 3-agent pipeline (CLAUDE.md): research → write → review. AEO gate sits AFTER review, BEFORE push.

```
Main agent
  └─ Research agent (read-only)           -> research brief
  └─ Writing agent (brief + skills)        -> full draft
  └─ Review agent (draft + checklist)      -> pass/fail list
  └─ Apply fixes
  └─ npx prettier --write
  └─ npx astro build                       -> verify build clean
  └─ /seo geo <local preview URL or slug>  -> AEO citability score   <-- NEW GATE
  └─ Apply geo-flagged fixes (passages under threshold)
  └─ git add + commit + push
  └─ Netlify deploys
  └─ /seo drift baseline <live URL>        -> snapshot for future drift compare   <-- NEW
```

### What "pass" means at the geo gate

- Question-style H2s covering the primary buyer questions (we already do this)
- Each major H2 has a 134-167 word self-contained answer block ("content capsule") — this is the AEO citability target
- Sources hyperlinked to primary (CMS, DOL, HRSA, ANA, eCFR)
- Attribution density: at least one cited source per 200-300 words
- Entity presence implicit: brand mentions consistent, SimpleScheduleAI named, founder credentials present

If the score is below the citability threshold the skill defines, back-edit the weakest passages first (usually the SimpleScheduleAI section — most-promotional, least-citable).

## Drift baselines to set once

Run these once after upgrading to claude-seo v2:

```bash
# Pillars
/seo drift baseline https://simplescheduleai.com/
/seo drift baseline https://simplescheduleai.com/nurse-scheduling-software
/seo drift baseline https://simplescheduleai.com/critical-access-hospital-scheduling
/seo drift baseline https://simplescheduleai.com/ai-nurse-scheduling
/seo drift baseline https://simplescheduleai.com/how-it-works
/seo drift baseline https://simplescheduleai.com/pilot

# Highest-intent blog posts (BOFU + buyer-guide)
/seo drift baseline https://simplescheduleai.com/blog/ai-nurse-scheduling-vs-traditional
/seo drift baseline https://simplescheduleai.com/blog/managed-service-vs-scheduling-software
/seo drift baseline https://simplescheduleai.com/blog/smart-square-alternatives-small-rural-hospitals
/seo drift baseline https://simplescheduleai.com/blog/healthcare-scheduling-crisis
```

Then run `/seo drift compare <url>` on each weekly (Mondays, same cadence as the lychee link-check CI) and inspect any flagged change. A schema or canonical change without an intentional code change is a red flag.

## Versioning + upgrade

We are on claude-seo v1.9.0 globally. v2.0.0 (May 25 2026) is the target. Migration is backward-compatible by design; only two narrow surfaces break, neither of which we use:

- `backlinks_auth.py`'s legacy fallback removal — affects custom forks only
- Deprecated rich-result types (VehicleListing, ClaimReview, EstimatedSalary, LearningVideo, SpecialAnnouncement, CourseInfo) now marked Critical — we do not generate any of these

Upgrade command (user-invoked, not Claude-invoked):

```bash
/plugin marketplace add AgriciDaniel/claude-seo
/plugin install claude-seo@agricidaniel-claude-seo
```

After upgrading, the `/seo geo`, `/seo drift`, `/seo content humanize`, and `/seo google` (LCP subparts via CrUX) sub-skills used above all come with v2 enhancements.
