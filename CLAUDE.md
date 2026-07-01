# SimpleScheduleAI — Claude Project Instructions

## Product Context

**SimpleScheduleAI**: AI nurse scheduling managed service for Critical Access Hospitals (CAHs, ≤25 beds), Texas. Audience: CAH Administrators/CEOs & Nurse Managers/DONs.

Founder Pradeep. Frame suggestions: hospital ops perspective, not generic tech.

## Key File Locations

| What                     | Where                                        |
| ------------------------ | -------------------------------------------- |
| Pages                    | `src/pages/`                                 |
| Blog posts               | `src/data/post/`                             |
| SEO/AEO skill            | `.claude/skills/seo-aeo-simplescheduleai.md` |
| Competitor review skill  | `.claude/skills/competitor-reviews.md`       |
| Dev reference skill      | `.claude/skills/project-dev.md`              |
| Programmatic video skill | `.claude/skills/programmatic-brand-video.md` |
| Blog post template       | `docs/seo/blog-post-template.mdx`            |
| Pre-publish checklist    | `docs/seo/pre-publish-checklist.md`          |
| **Competitor dossier**   | **`docs/seo/competitor-dossier.md`**         |

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
- **Checklist execution:** Every checklist item must be verified mechanically — no mental checks, no assumptions. If an item requires external data (web search, file read, live fetch), run that lookup. If blocked or uncertain, ask before skipping or guessing.

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

Use this pipeline for every blog post — both writing new posts from scratch and editing existing drafts. Running all three phases in sequence catches errors that a single-agent pass misses.

### Phase 1 — Research agent (always first, read-only)

Spawn a `general-purpose` agent with read-only instructions. It must return a research brief before any writing starts.

The research agent must:

1. Read `docs/seo/competitor-dossier.md` — extract any verbatim quotes, ratings, and product data relevant to this post's competitors
2. Read `docs/seo/pre-publish-checklist.md` — note every item that requires external data (quotes, ratings, source links, product page verifications)
3. Identify all required internal links: which pillar pages, related posts, and external sources (CMS, HRSA, Texas DSHS, ANA) the post must link to
4. For each competitor mentioned: confirm dossier data is <60 days old or flag that a live fetch is needed
5. Return a structured brief: competitors covered + quotes available, internal links required, sources needed, any checklist items that are blocked

The main agent reads this brief before spawning the writing agent. Do not skip Phase 1 — writing without the brief produces posts that fail competitor data and source citation checks.

### Phase 2 — Writing agent (draft production)

Spawn a `general-purpose` agent with the research brief attached. It must:

1. Load `.claude/skills/seo-aeo-simplescheduleai.md` before writing
2. Read `docs/seo/blog-post-template.mdx` for structure
3. **For posts with competitor content:** load `.claude/skills/competitor-reviews.md` — it will direct to the dossier first, then live fetch only if needed
4. Write the complete post following all SEO/AEO skill rules
5. Embed all internal links and source citations from the research brief
6. Obey the mechanical guardrails while writing (the `check-blog` gate enforces them, so authoring them in saves a fix round): no em-dashes or en-dashes; no AI-tone phrases; question-form H2s; the 2-CTA pattern (`See pricing`/`See how it works` plus `Book a call with our team`), never `/pilot`; both pillar links plus `/how-it-works`; no `CAH` inside any heading or table header; dark-mode variants on every table; Key Takeaways before the Table of Contents; TOC anchor text that exactly matches the heading; for explainer/definitional posts, define the core term BEFORE the sections that apply it (do not bury "What is X?" four H2s down); each body section adds new information, so a concept is stated once in the body (Key Takeaways, FAQ, "Our Take", and "What to Do This Week" are the only recaps); a tight excerpt (1-3 short sentences, none over 40 words); the SSAI self-label is "AI-native nurse scheduling service", never "managed service"; every external source URL must resolve (verify with `check-links`)
7. Return the full draft as output — no partial drafts

**For editing existing drafts** (not new posts): the writing agent reads the existing file and applies only the changes needed. It does not rewrite sections that are already correct.

### Phase 2.5 — Mechanical gate (deterministic, runs BEFORE human review)

Mechanical, grep-able rules are not reviewed by hand or by an agent anymore. A confidence-filtered review agent is built to drop exactly the low-severity, high-frequency formatting defects the checklist treats as blockers, which is why those defects kept slipping through. They are now enforced by a script that never misses and (by design) never false-positives. After Phase 2, the main agent runs:

```
npm run check-blog src/data/post/<slug>.md
npm run check-links src/data/post/<slug>.md   # network pass — every external source URL must resolve (200)
```

`scripts/check-blog.mjs` is the single authoritative mechanical gate (offline/deterministic). It HARD-FAILS on every deterministic checklist rule: em/en-dashes, the full AI-tone list, inline `<svg>`, blank-line-in-`<div>`, the retired `/pilot` strings, the 2-CTA pattern, both pillars + `/how-it-works`, canonical-matches-slug, TOC anchor/heading integrity, merged-heading + stray `?`, no-`CAH`-in-headings, stray MDX, image-pool membership + no-duplication, dark-mode table variants, Sources numbered + not-in-TOC, date sanity, Key-Takeaways-before-TOC, no-TL;DR, links-to-drafts, DSHS/§62.002/8-and-80. Fix EVERY hard failure before review. Warnings are advisory and a human judges those: word count (post-type-aware ranges), `/ai-nurse-scheduling`, `.webp`, table classes, volume language, **excerpt run-on (>40-word sentence)**, **a likely "managed service" self-label**, and **an internal-link orphan** (a live post with <2 inbound links from sibling posts — flagged only in `--all`/`--live` corpus runs, since inbound links can only be counted across the whole set; orphans strand pages in GSC "crawled/discovered, not indexed"). `scripts/check-links.mjs` is the separate NETWORK pass — the offline gate cannot see a dead source link (that is how a 404'd CMS PDF shipped once). If you find a new mechanical rule, add it to the script, not to a human's to-do list.

### Phase 3 — Review agent (JUDGMENT ONLY)

Once `check-blog` is clean, spawn a `feature-dev:code-reviewer` agent for ONLY the items a script cannot judge. Do not ask it to re-check anything the gate already enforced.

- **ICP voice and framing**: the post speaks to the ICP (Critical Access Hospital Administrators/CEOs and Nurse Managers/DONs) from a hospital-operations perspective and in their language (coverage, callouts, overtime, scheduling time, compliance, small rural hospital constraints), not generic healthcare-tech copy. Value is framed in ICP terms (the nurse manager's hours, a CAH's staffing and budget realities, the Texas CAH context), and scenarios fit a 25-bed CAH, not a large health system
- **Excerpt is a distinct hook**, not a restatement of the intro or any Key Takeaway bullet
- **Key Takeaways and excerpt framing match the body** (if body says "not documented on product page," KT/excerpt cannot say "no X"/"lacks X")
- **Title does not overclaim or contradict the body**
- **No anecdote presented as a real event**; opening scenarios stay illustrative and conditional
- **No claim/metaphor/CTA repeated 3+ times**; structural AI-tells (negative parallelism, self-posed rhetorical question, anaphora/tricolon abuse, dead-metaphor repetition, "despite its challenges" dismissal, invented concept labels)
- **Worked-math is honest** (assumption stated and labeled illustrative; never a customer result)
- **Reviewer quotes are verbatim** with name, role, date, source; no volume language near competitor names
- **Image relevance and tone** (a human eyeballs the rendered image; an agent cannot see it)

The review agent returns a pass/fail list with line numbers. The main agent applies only the flagged fixes; it does not re-run the writing agent.

### Pipeline summary

```
Main agent
  └─ spawn Research agent (read-only) → research brief
  └─ spawn Writing agent (brief + skills + guardrails) → full draft
  └─ run `npm run check-blog <slug>` → fix EVERY hard failure (mechanical gate)
  └─ spawn Review agent (judgment-only) → pass/fail list
  └─ apply fixes directly
  └─ re-run `npm run check-blog` until clean, then Prettier, commit, push
```

Skipping a phase is not permitted. The mechanical gate is what makes a post pass the checklist on the first human read: it deterministically catches the formatting, structure, link, and image defects that a confidence-filtered review agent is designed to drop.
