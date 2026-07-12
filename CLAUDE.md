# SimpleScheduleAI — Claude Project Instructions

## Product Context

**SimpleScheduleAI**: AI nurse scheduling managed service for Critical Access Hospitals (CAHs, ≤25 beds), Texas. Audience: CAH Administrators/CEOs & Nurse Managers/DONs.

Founder Pradeep. Frame suggestions: hospital ops perspective, not generic tech.

## Key File Locations

| What                         | Where                                        |
| ---------------------------- | -------------------------------------------- |
| Pages                        | `src/pages/`                                 |
| Blog posts                   | `src/data/post/`                             |
| SEO/AEO skill                | `.claude/skills/seo-aeo-simplescheduleai.md` |
| Competitor review skill      | `.claude/skills/competitor-reviews.md`       |
| Dev reference skill          | `.claude/skills/project-dev.md`              |
| Programmatic video skill     | `.claude/skills/programmatic-brand-video.md` |
| Blog post template           | `docs/seo/blog-post-template.mdx`            |
| Pre-publish checklist        | `docs/seo/pre-publish-checklist.md`          |
| **Governance authority map** | **`docs/seo/GOVERNANCE.md`**                 |
| Facts dossier                | `docs/seo/facts-dossier.md`                  |
| **Competitor dossier**       | **`docs/seo/competitor-dossier.md`**         |

## Competitor Data Rule

**Always read `docs/seo/competitor-dossier.md` before any live web fetch for competitor reviews, ratings, or product data.** The dossier contains pre-verified verbatim quotes with confirmed Capterra product IDs and verification dates.

- Quote in dossier + verification date <60 days old → use directly, no web fetch needed
- Quote in dossier + verification date >60 days old → fetch fresh, verify verbatim, update dossier
- Competitor not in dossier → fetch live, add new section to dossier, then use

After adding new verified data from a live fetch, always update the dossier maintenance log before closing the session.

## Rules

- **Blog posts:** Load `.claude/skills/seo-aeo-simplescheduleai.md` before writing/editing.
- **Newsroom / trendjacking articles:** Load `.claude/skills/trendjacking-articles.md` before writing, editing, re-timing, or QA-ing any `/articles` piece (`src/data/article/*`). It encodes the relevance gradient, the citable-hook rule, accuracy guardrails, and the draft-then-publish flow; it pairs with `docs/seo/articles-trendjacking-plan.md`.
- **Competitor content:** Load `.claude/skills/competitor-reviews.md` before Key Limitations, reviewer quotes, or feature comparisons. The skill will direct you to the dossier first.
- **Code/dev work:** Load `.claude/skills/project-dev.md` for tech stack, pages, schema, coding standards.
- **Launch/marketing video:** Load `.claude/skills/programmatic-brand-video.md` (a product-agnostic Remotion method, also installed globally) before creating, re-timing, re-formatting, or QA-ing a product video. SSAI's video project lives at `ssai-launch-video/` (separate from this repo); its specifics are in the skill's "Worked example" section.
- **Checklist execution:** Every checklist item must be verified with evidence — no mental checks, no assumptions. Mechanical rules are delegated to scripts (run the gate; never re-check a green row by hand); judgment items are verified by grep-quoting the text or running the required lookup (web search, file read, live fetch). If blocked or uncertain, ask before skipping or guessing. Doc authority and conflicts: `docs/seo/GOVERNANCE.md` (scripts > dossier > skill > checklist).

## Subagent Strategy

Default: delegate. Main agent = orchestrator. Real work = subagents.

ALWAYS delegate:

- Bash >20 lines output → execute agent
- Multi-file exploration → Explore agent
- MCP calls w/ large payloads → mcp-fetch agent
- Code review → matching review agent
- Build/test/lint → execute agent

Main agent only: read known files, edit, write, compose answer, spawn subagents.

**Verify subagent output before trusting it.** After any trim/edit subagent, ground-truth the actual change — `git diff --stat`, a before/after body word count, and counts of preserved blockquotes / tool names / links — instead of the agent's self-reported numbers. Trim agents have under-reported their own cuts by ~7x (claimed ~200 words removed, actually ~1500). A self-report is a hypothesis; the diff is the fact.

## Blog Writing Pipeline (3-Agent Process)

The pipeline is manifest-enforced. Load `.claude/skills/publish-pipeline.md` before writing, gating, or publishing any post/article — it maps every phase to the `.publish/<slug>.json` manifest field that `npm run publish-gate` must show green. The pre-commit hook blocks a `draft: false` flip whose manifest is not green. First command on any publish session: `npm run publish-gate <slug> -- --status`.

Phase order (details in the skill): research brief -> draft (skills + facts dossier) -> mechanical gate -> inbound links -> proofread agent (post-type reference matrix) -> fact-check agent (new facts only) -> human image eyeball -> founder approval -> commit (hook verifies) -> push -> IndexNow/GSC.

## Operating Model (permanent, model-agnostic)

Follow the **Model Tier Ladder** in the global `~/.claude/CLAUDE.md`: roles
resolve against whatever model tiers exist today — judgment calls go to
`judgment-child` (Fable) if it spawns, else `deep-reasoner` (Opus), else the
main session; mechanical work to `fast-worker` (Sonnet floor); claim-checking
to `verifier`. Generic agent contracts live in `~/.claude/agents/`. Escalate
up instead of grinding on calls above your tier; a failed judgment-child
spawn just means that tier is absent today.

Website-repo specifics on top of the ladder:

- The blog pipeline's own gates (publish-gate manifest, check-blog,
  pre-commit hook) outrank any agent's judgment — a green gate is required,
  never sufficient.
- Ground-truth every subagent edit yourself (git diff + word counts +
  preserved blockquote/link counts) — trim agents here have under-reported
  cuts by ~7x. A self-report is a hypothesis; the diff is the fact.
- The full reference implementation of this operating model (blocking verify
  gate, ground-truth script, project agent contracts) lives in the
  cah-scheduler repo's CLAUDE.md.
