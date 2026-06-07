# Design: Blog pipeline upgrades (from Ryan Law / Ahrefs AI-content video)

Date: 2026-06-07. Status: PLAN (no execution). Source: Ahrefs Podcast, Ryan Law, "How to automate blog writing with AI from keyword to published" (youtu.be/iVZrVeESnFQ). Transcript pulled free via `youtube-transcript-api`.

## Goal

Upgrade our existing 3-agent blog pipeline (Research → Write → Review) with the genuinely-applicable techniques from Ryan's 23-skill Ahrefs pipeline, filtered for a tiny CAH niche. Keep our hard gates (no em-dash, no AI-tone, no fabricated stats, verbatim competitor quotes, AEO).

## Upgrades (priority-ordered)

### Tier 1 — do first (highest ROI)

1. **Save every step's output to disk.** Persist each phase to `.tmp/pipeline/<slug>/` (brief.md, outline.md, draft.md, review.md). On a review failure, re-run only the failing sub-step instead of regenerating the whole post. Directly attacks per-post rework. (Ryan's single most-emphasized operational tip.)
2. **Examples beat instructions for voice.** Add an `examples/` folder of 3-5 best published posts (full text). Writing agent anchors voice on these, not only on the rule lists in the SEO/AEO skill. Rules catch violations; examples set the target. Attacks voice inconsistency.
3. **Update-existing-content pipeline (gated).** New `update-pipeline` skill for the 100+ existing posts: (a) re-verify dated competitor quotes against the dossier 60-day rule; (b) SERP topic-gap fill. HARD GATE: every proposed stat routes through dossier / primary-source verification — never auto-accept an AI-proposed number (ties to feedback_no_fabricated_stats). Highest value given quote/stat decay.

### Tier 2 — incremental

4. **Front-loaded founder context trigger.** Pradeep supplies 2-5 sentences of angle / ops hot-take before research runs. Keeps niche posts from reading generic; matches the CLAUDE.md "hospital ops perspective" mandate.
5. **Own-content reference step.** Research agent greps `src/data/post/` for what we've already said on the topic → reusable framing + internal links beyond the two mandatory pillars.
6. **Explicit MECE outline rules.** Add to the outline step: front-load each section (BLUFF), cover the topic exhaustively, keep sections mutually exclusive (no overlap). Cheap; kills padding/repetition.
7. **Dedicated product-placement step on the OUTLINE.** Discrete sub-step reads the outline and inserts signposts for where SimpleScheduleAI / `/how-it-works` fits contextually (Ryan: doing it inside drafting was "hit and miss"). Must respect the no-overclaim rule (e.g. the 8-and-80 memory).
8. **SERP gap-finding (information gain) in research.** Research sub-step fetches top-ranking pages, extracts headers, lists what's missing. Achievable in our thin CAH SERPs (DataForSEO / Ahrefs MCP).

## Mapping to current assets

- 3-agent pipeline definition: `CLAUDE.md` (Blog Writing Pipeline section).
- Voice rules / product context: `.claude/skills/seo-aeo-simplescheduleai.md`.
- Mechanical gate: `scripts/check-blog.mjs`.
- Checklist: `docs/seo/pre-publish-checklist.md`.
- Template: `docs/seo/blog-post-template.mdx`.
- Dossier (quote decay): `docs/seo/competitor-dossier.md`.
- Update targets: `src/data/post/` (100+ posts).

Most upgrades refine *inside* our existing 3 phases (split the Writing phase into ordered sub-skills with saved artifacts); they do not replace the 3-agent structure.

## Explicitly resist (Ahrefs-scale or unsafe for us)

- "Let it cook 8 minutes, auto-accept stats" autonomy — Ryan only trusts it after months of refinement and hand-picks what publishes; he calls it "over-engineered," for "boring topics." Our moat is verified data → stay artifact-saving + human-gated.
- 23-skill sprawl as an end in itself; per-author repo forks (single author); headless screenshot automation.

## Out of scope / next steps

This is the plan only. Each Tier-1 item would become its own small implementation task on a separate go-ahead. No pipeline/skill files edited yet.
