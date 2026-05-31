# Pre-Publish Checklist — SimpleScheduleAI Blog & Pages

Run this before publishing any new page or blog post.

## Part 0 Reconciliation (read first — overrides any conflicting item below)

This checklist predates Google's AI optimization guidance. See the skill's PART 0. Where an item below conflicts with this block, this block wins.

- **Guidelines, NOT publish gates** (quality heuristics; never block a publish on these): title 50-60 chars, meta/excerpt length, "every H2 is a question", the 40-70-word answer capsule, 120-180-word sections, one-stat-per-150-200-words. Google does not treat these as ranking or AI-citation levers. The full "Critical Access Hospitals" title is intentionally allowed to exceed 60.
- **Superseded mechanics** (keep the writing, drop the reasoning): any "for maximum ChatGPT citation probability", "AI citation penalty", "schema stacking", or rich-result framing. Write answer-first, well-structured, sourced prose because it is good for readers and extraction, not for a citation multiplier.
- **Schema:** the Astro layout auto-generates the only supported types (Article/BlogPosting, BreadcrumbList, FAQPage). Do NOT hand-add or stack JSON-LD. FAQ and HowTo rich results were restricted/removed by Google in 2023 — never chase them; schema only needs to be error-free, it is not a publish gate.
- **llms.txt:** optional-harmless, never a gate or a lever.
- **Hard gates that DO block publish:** no em-dashes/en-dashes; no AI-tone phrases; both pillar links + `/how-it-works`; every stat hyperlinked to a primary source; all competitor-content + comparison-table integrity rules; image load/relevance/uniqueness/no-quotes; dark-mode table variants; Key Takeaways/excerpt match body; no inline `<svg>`; no leaked tags; `npm run build` passes; robots allows AI crawlers; no PHI/HIPAA issues.
- **After publishing:** deploy + `npm run indexnow` feeds Bing/IndexNow (ChatGPT Search and Copilot lean on Bing), plus GSC request-indexing and the monthly AI-citation log.

## Content

- [ ] Unique title tag (50–60 chars) containing primary keyword
- [ ] Unique, useful meta description/excerpt (length is NOT a ranking factor; guideline only, never block publish on it — see Part 0 Reconciliation)
- [ ] One H1 per page containing primary keyword
- [ ] **Title/H1 never uses "CAH" abbreviation** — always spell out "Critical Access Hospital(s)" for SEO
- [ ] **Title/H1 audience matches content audience** — if the post is specifically about CAHs (mentions CMS §485.635, 25-bed scale, CAH designation), the title must say "Critical Access Hospital(s)", not "Small Hospitals" or "Small Hospital"
- [ ] **Internal hub links: both pillar pages linked** — every post must link to `/nurse-scheduling-software` AND `/critical-access-hospital-scheduling` with keyword anchor text, plus `/how-it-works` in any section that describes the SimpleScheduleAI service
- [ ] Primary keyword appears in first 100 words of body text
- [ ] All H2/H3 headings phrased as questions
- [ ] Every H2/H3 has a 40–70 word direct answer capsule immediately below it
- [ ] Sections are substantive (about 120–180 words is a thoroughness heuristic, NOT a citation lever — see Part 0 Reconciliation)
- [ ] One stat or data point per 150–200 words
- [ ] Every stat/regulatory claim hyperlinks to a primary source (CMS, HRSA, Texas DSHS, ANA)
- [ ] FAQ section present (product/landing/blog pages) — minimum 3 Q&As
- [ ] Author byline with real name, credentials, and LinkedIn link (NOT "SimpleScheduleAI Team")
- [ ] Internal link to pillar page (`/how-it-works` or `/critical-access-hospital-scheduling`) with keyword anchor text
- [ ] CTA at end linking to `/pilot` or `/how-it-works`

## Structure and Format

- [ ] Key Takeaways (5–6 bullets, ~100 words) placed **BEFORE** the Table of Contents — never after
- [ ] **Key Takeaways re-read AFTER all body edits are complete** — KT language must match the body framing exactly. If body says "not documented on product page," KTs cannot say "no X" or "lacks X." Re-check KTs last, not first.
- [ ] **Excerpt re-read AFTER all body edits** — same rule: no "lacks X" or "no X" in excerpt if body uses "not documented" framing
- [ ] No TL;DR section present — Key Takeaways replaces TL;DR (TL;DR is an AI-tell pattern)
- [ ] No em-dashes (`—`) anywhere — prose, excerpts, table cells, TOC, blockquotes, CTA cards
- [ ] No AI-tone phrases: "delve into", "dive into", "it's worth noting", "in conclusion", "robust", "leverage", "game-changing", "seamless", "comprehensive solution", "transformative", "at the end of the day", "unlock", "harness", "navigating", "streamline"
- [ ] TOC anchor text exactly matches H2/H3 heading text, including trailing `?` on question headings
- [ ] Every H2 has a 40–70 word direct answer capsule immediately below it — no preamble before capsule
- [ ] Every H2 expansion section is 120–180 words (shorter = AI citation penalty)
- [ ] One stat or data point per 150–200 words of body text
- [ ] Word count matches post type: BOFU 3,000–5,000 | vs-service MOFU 1,500–2,500 | MOFU 1,500–2,500 | TOFU narrative 1,000–1,500 | Glossary 600–1,000
- [ ] No inline `<svg>` in `.md` files — all visuals are Tailwind `<div>` bar charts or `<table>` with `dark:` variants
- [ ] **Every data visualization (bar chart, ranked list with labels like "Most common", frequency table) cites a primary source** — if the frequency/ranking data was not derived from a named survey, research dataset, or cited reviewer analysis, the visual must be removed and replaced with sourced text. "Inferred from product review themes" is not a source.
- [ ] Minimum visual elements: 3 for BOFU/how-to | 2 for vs-service MOFU | 1 for MOFU/TOFU | 0 for Glossary
- [ ] Author bio present at end of every post (not optional): `_Pradeep Pandey is the founder of SimpleScheduleAI..._`
- [ ] H2 headings never use "CAH" abbreviation — always "Critical Access Hospital" in headings

## Images

- [ ] Featured image is **verified to load** — open the Unsplash URL in a browser and confirm it returns an actual photo, not a 404
- [ ] Featured image is **relevant to the post topic** — no generic stock photos that could belong to any post (no beaches, hotel rooms, concerts, dev laptops, circuit boards, or abstract tech imagery for nurse scheduling content)
- [ ] Featured image ID is **unique** — not duplicated in any other live post or draft (run the duplicate check script before publishing)
- [ ] Image URL uses **no quotes** in YAML frontmatter: `image: https://...` not `image: 'https://...'`
- [ ] All images have descriptive alt text (not empty, not keyword-stuffed)
- [ ] All images are WebP or AVIF format
- [ ] Hero/featured image is compressed (< 200KB ideally)
- [ ] Any raw HTML `<table>` inside the post has `dark:` Tailwind variants on every bg, text, and border class (table is readable in dark mode — test the post in dark mode before publishing)
- [ ] Table of Contents anchor text matches the H2/H3 heading text exactly (including trailing `?` on question headings)

## Competitor Content

- [ ] **Loaded `.claude/skills/competitor-reviews.md`** and fetched live G2/Capterra quotes via WebSearch before writing any competitor section — no static review snapshot exists; quotes must be fetched fresh
- [ ] **G2 and Capterra star ratings and review counts fetched for every competitor** — this is separate from and in addition to verbatim quotes. Fetch ratings even when no usable quotes are found. Add ratings to comparison table and to each alternative profile.
- [ ] All reviewer quotes are dated within 30 days of today. **If no quotes within 30 days are found, use the most recent available quotes with their actual date** — do not skip quotes entirely. Older quotes are valid supporting evidence; add a note in "A Note on Sources" with the quote date.
- [ ] No specific capability/feature claims without a verified current product page, dated within 30 days
- [ ] No volume language near a competitor name: "consistently", "widely", "many reviewers", "most users", "multiple reviewers"
- [ ] No feature-absence assertions ("No X", "lacks Y", "not built-in") without both a verbatim attributed reviewer quote AND verification against the live product page within 30 days
- [ ] Competitor names appear in neutral context only — no embedded qualitative framing
- [ ] Reviewer quotes are verbatim from G2/Capterra with: reviewer name, role, date, source — no paraphrasing
- [ ] Key Limitations sections in alternatives posts use blockquote format: `**Bold Title.** Intro sentence.` then `> "Verbatim quote."` then `> Name, Role, Date, Source`
- [ ] When no hospital-context reviewer quote exists within 30 days, use the most recent available quote with its actual date. When absolutely no usable quote exists on any platform, use neutral framing ("Verify with vendor" / "Not documented on product page") and document this in "A Note on Sources" — never volume language as a substitute

## SimpleScheduleAI Capability Claims

_Compliance-adjacent capability claims attributed to SimpleScheduleAI must match shipped reality. A CAH administrator may rely on the claim._

- [ ] **No FLSA 8-and-80 claim as a SimpleScheduleAI feature.** The scheduler tracks generic FLSA overtime thresholds; the 8-and-80 (80-hour/14-day) calculation method is not yet shipped. Use "FLSA overtime thresholds" or "FLSA overtime threshold tracking" in SSAI-attributed copy. Do NOT write "FLSA 8-and-80 rule built in / applied by default / handled automatically" attributed to SimpleScheduleAI. Applies to advantage bullets, comparison-table SSAI cells, "How SSAI works" sections, CTAs, FAQ answers about SSAI, and SVG diagram labels.
- [ ] **Generic 8-and-80 mentions stay untouched.** Educational descriptions of the rule (with DOL source), "ask the vendor whether they support 8-and-80" evaluation questions, competitor-confirm / competitor-gap lines, and the dedicated educational posts on FLSA/Texas overtime are fine. The rule only fires when the sentence attributes the capability to SimpleScheduleAI. When 8-and-80 ships, this rule reverses; see commit eeefa9f for the softening pattern to reverse.

## Comparison Tables (when comparing competitor products)

- [ ] Table is fully visible on standard viewport with **no horizontal scrollbar**. Use `table-fixed` with explicit per-column `style="width:NN%"` rather than `overflow-x-auto` + `min-width`.
- [ ] Table includes `break-words` class so long product names ("SimpleScheduleAI", "NurseGrid Manager") wrap inside the cell rather than overflowing into adjacent columns.
- [ ] Table uses responsive font sizing: `text-xs sm:text-sm` (xs on mobile, sm on tablet+).
- [ ] Cells use `align-top` for clean alignment when content wraps.
- [ ] **Rating cells follow the standard format**: `G2: X.X/5 (N reviews)<br>Capterra: Y.Y/5 (M reviews)` — labeled, stacked on separate lines via `<br>`. Never use compressed slash-separated formats like `4.3/5 (97) / 4.6/5 (17)` — readers cannot tell which number is which source.
- [ ] **When only one source has data**, show only that source (e.g., `Capterra: 4.5/5 (6 reviews; small sample)`). Never use placeholder text like "Not pulled", "N/A", or "—" in a rating cell.
- [ ] **Small-sample disclosure**: when a vendor has fewer than 20 reviews on a source, append `; small sample` to the cell.
- [ ] **Competitor capability cells**: never assert feature absence as fact ("None", "No", "Not built-in"). Use either the verified state ("Configurable", "Manual export", "Automatic") or `Confirm with vendor` / `Not documented` when the public product page does not explicitly cover it.
- [ ] **SimpleScheduleAI in the table** uses Option C framing: `New service; in active pilot phase` for any rating cell. Never imply a rating we don't yet have.
- [ ] **No editorial verdict columns**: avoid columns like "CAH Fit" or "Compliance" that resolve to "Good / Medium / Low / None" cells with red/green coloring. Use factual descriptors instead (Customer Focus, Setup Time, Pricing, public ratings).
- [ ] **Methodology footnote** appears once below the table or in a single "A Note on Sources" section before FAQ, not repeated in each row.

## x-alternatives Posts (BOFU — run these in addition to all checks above)

_These apply whenever the filename matches the pattern `[tool]-alternatives.md`._

**Structure:**

- [ ] Key Takeaways (5-6 bullets) placed BEFORE the Table of Contents
- [ ] TOC includes numbered sub-items under the "What Are the N Best..." parent entry (one per alternative)
- [ ] Intro paragraph uses statement-first or problem-first framing — no ratings in the opening paragraph
- [ ] Two internal hub links present in the intro area: `/nurse-scheduling-software` and `/critical-access-hospital-scheduling`
- [ ] `## Why Hospitals Switch Away from [Tool]?` section present with H3s grouped by complaint theme
- [ ] Reviewer quotes in the "Why Switch" section are verbatim with attribution format: `> Name, Role, Date, Source` (no em-dash, no `_italic_` wrapper around attribution line)
- [ ] `## Quick Comparison: [Tool] vs. The Alternatives` table has "Best For" as the second column
- [ ] `## What Are the N Best [Tool] Alternatives for Hospital Scheduling?` uses numbered H3s (`### 1. SimpleScheduleAI`, `### 2. ...`)
- [ ] SimpleScheduleAI is listed **first** among the alternatives
- [ ] Every alternative profile contains: intro paragraph, Best for, Key advantages (bullets), Key limitations (bullets), Verdict, **Ratings** (G2 and/or Capterra with review count), Cost
- [ ] `## When to Stay with [Tool]?` section present with 4 bullet conditions
- [ ] `## How SimpleScheduleAI Compares to [Tool]` Tailwind comparison table present (8 rows minimum)
- [ ] `## What to Do This Week` section present with 5 numbered steps
- [ ] CTA card present after "What to Do This Week"
- [ ] `## A Note on Sources` section present before FAQ with verification dates
- [ ] FAQ section present (3-5 questions with FAQPage schema)
- [ ] Author bio present at end: `_Pradeep Pandey is the founder of SimpleScheduleAI..._`

**Comparison table (SimpleScheduleAI vs. [Tool]):**

- [ ] Table uses `class="w-full text-xs sm:text-sm border-collapse table-fixed break-words"`
- [ ] SimpleScheduleAI header cell uses `font-semibold text-blue-700 dark:text-blue-400`
- [ ] All cells have `align-top` on the `<tr>`
- [ ] All bg/text/border classes have `dark:` variants

## Schema & Technical

- [ ] FAQPage JSON-LD schema added for FAQ sections
- [ ] BlogPosting schema present on blog posts (datePublished + dateModified set)
- [ ] BreadcrumbList schema present on all inner pages
- [ ] `dateModified` in BlogPosting schema reflects today's actual publish/update date
- [ ] Canonical tag points to the correct final URL
- [ ] Page added to `public/sitemap.xml` (or will auto-generate on build)
- [ ] Auto-generated schema (Article/BlogPosting + BreadcrumbList) is error-free if spot-checked; do NOT hand-add/stack JSON-LD or chase FAQ/HowTo rich results (restricted/removed by Google 2023); not a publish gate (see Part 0 Reconciliation)

## AEO / GEO

- [ ] `public/llms.txt`: optional-harmless, not a gate or ranking lever (update only if trivially relevant — see Part 0 Reconciliation)
- [ ] `public/robots.txt` still allows all AI crawlers (no accidental blocks added)
- [ ] No PHI-capturing forms or HIPAA-violating tracking code introduced
- [ ] Build passes locally: `npm run build` completes without errors

## After Publishing

- [ ] Submit URL to Google Search Console → URL Inspection → Request Indexing
- [ ] After deploy, run `npm run indexnow` to feed Bing/IndexNow (ChatGPT Search and Copilot lean on the Bing index)
- [ ] Query the page's target keyword in Perplexity and ChatGPT to baseline AI visibility
- [ ] Add to AEO tracking spreadsheet (monthly check schedule)
- [ ] Post excerpt + link on LinkedIn company page
- [ ] Update AI Share of Voice tracking if this targets a monitored query
