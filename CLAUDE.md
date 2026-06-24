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
6. Return the full draft as output — no partial drafts

**For editing existing drafts** (not new posts): the writing agent reads the existing file and applies only the changes needed. It does not rewrite sections that are already correct.

### Phase 3 — Review agent (mechanical checklist)

Spawn a `feature-dev:code-reviewer` agent with the draft and the checklist path. It must check every item in `docs/seo/pre-publish-checklist.md` mechanically — no assumptions, no skipped items.

Mandatory checks the review agent must run:

- Em-dashes (`—`) and en-dashes (`–`) anywhere in the file including frontmatter, table cells, blockquotes, CTA cards
- AI-tone phrases (full list in the checklist)
- No inline `<svg>` in `.md` files — all visuals must be Tailwind `<div>` or `<table>` elements
- Every `<table>` has `dark:` variants on all `bg-*`, `text-*`, and `border-*` classes
- Blockquote format: `> "Quote."` → blank `>` line → `> Name, Role, Date, Source` (missing blank line = C&D violation)
- Key Takeaways language matches body exactly — if body says "not documented on product page", KTs cannot say "no X" or "lacks X"
- Excerpt language matches body (same rule as KTs)
- TOC anchor text matches H2/H3 heading text exactly, including trailing `?`
- No heading ends with `?` only — headings must be complete questions, not nominalized phrases ("What a Healthcare Scheduling App Is" is wrong)
- Both pillar pages linked: `/nurse-scheduling-software` AND `/critical-access-hospital-scheduling`
- `/how-it-works` linked from any section describing the SimpleScheduleAI service
- Every stat/regulatory claim has a hyperlink to a primary source
- Image URL verified (no broken link, no placeholder, ID exists in `scripts/image-pool.json`)
- Image ID not duplicated across other posts
- Featured image YAML uses no quotes: `image: https://...` not `image: 'https://...'`
- Canonical URL matches slug: `https://simplescheduleai.com/blog/[slug]`
- No volume language near competitor names ("consistently", "many reviewers", "most users")
- All reviewer quotes verbatim with name, role, date, source — no anonymous quotes

The review agent returns a pass/fail list with file line numbers for every failure. The main agent applies only the specific fixes flagged — it does not re-run the writing agent.

### Pipeline summary

```
Main agent
  └─ spawn Research agent (read-only) → research brief
  └─ spawn Writing agent (brief + skills) → full draft
  └─ spawn Review agent (draft + checklist) → pass/fail list
  └─ apply fixes directly
  └─ run Prettier, commit, push
```

Skipping any phase is not permitted. A post that bypasses Phase 1 will miss competitor data. A post that bypasses Phase 3 will miss formatting and dark-mode violations that only show up on the live site.
