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
- [ ] **Author bio uses canonical italic-linked format** at end of post: `_[Pradeep Pandey](/about/pradeep-pandey) is the co-founder of SimpleScheduleAI, a managed nurse scheduling service built for Critical Access Hospitals in Texas. He serves as Deputy General Manager of Operations at Apollo Hospitals and holds an MBA from IIM Trichy._` followed on next line by `[LinkedIn →](https://www.linkedin.com/in/pradeep-pandeyji/)`. Never use the older `**Written by Pradeep Pandey**` block format.
- [ ] **"What to Do This Week" CTA section present** (5 numbered concrete actions) before the FAQ section. Required on BOFU, comparison, and operational guide posts. Optional on glossary/definition posts.
- [ ] **CTA copy uses standardized 2-CTA pattern**: primary = `Apply for a Pilot Spot` → `/pilot`, secondary = `Book a call with our team` → canonical Calendly URL. Never use ad-hoc variants like "Claim a Pilot Spot", "View the Pilot", "Get a Free Schedule Review", or "Book a call" (the "with our team" framing pre-explains the booking page and prevents name-mismatch confusion).
- [ ] **Founder role consistent**: post bio says "co-founder" only if `/about` page reflects both founders or the cal.com booking team is framed as "our team". Otherwise use "founder" until co-founder is publicly named on the site.
- [ ] **"Texas" geographic framing**: posts that describe the SimpleScheduleAI service include the phrase "Texas Critical Access Hospitals" at least once in the body. Posts that are pure operational guides (not service descriptions) can omit Texas if topic-agnostic.

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
- [ ] **No blank lines inside raw HTML blocks in `.md` files.** Astro's markdown parser exits HTML mode on encountering a blank line; subsequent `<div>` tags are then escaped to `&lt;div` and rendered as visible text on the live site. This bit us once in `ai-nurse-scheduling-vs-traditional.md` (commit 016f7ba). Verify with `grep "&lt;div" dist/blog/<slug>/index.html` post-build — zero matches required before publish.
- [ ] **Every data visualization (bar chart, ranked list with labels like "Most common", frequency table) cites a primary source** — if the frequency/ranking data was not derived from a named survey, research dataset, or cited reviewer analysis, the visual must be removed and replaced with sourced text. "Inferred from product review themes" is not a source.
- [ ] Minimum visual elements: 3 for BOFU/how-to | 2 for vs-service MOFU | 1 for MOFU/TOFU | 0 for Glossary
- [ ] Author bio present at end of every post (not optional): `_Pradeep Pandey is the founder of SimpleScheduleAI..._`
- [ ] H2 headings never use "CAH" abbreviation — always "Critical Access Hospital" in headings
- [ ] **TOC uses bulleted list format** (`-` markers), never numbered (`1.`, `2.`) markers. Numbered TOC creates ordering implication and breaks visual consistency with other posts.
- [ ] **Numbered Sources section present at end of BOFU/comparison posts** — sits above the author bio, below FAQ. Each inline stat carries a numbered footnote (`[1]`, `[2]`, etc.) referenced in the Sources list. Format: `[1] Author/Organization, "Study Title", Date. [Link]`. Replaces or supplements the existing "A Note on Sources" prose paragraph. Optional on glossary/definition posts.
- [ ] **Byline includes reading time and role** — auto-rendered by layout in format: `By Pradeep Pandey · Co-Founder · X min read · Updated [Month] [Year]`. Reading time = word count / 220 wpm rounded to nearest minute.

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
- [ ] **Pricing line is consistent across all posts** — always write `**Cost:** Pricing not listed on website. Contact for a quote.` for the SimpleScheduleAI row/profile (or, once a pricing band is decided, the canonical pricing line). Never invent ad-hoc phrasings like "Contact for current rates", "uses flat-fee pricing", or "starts at $X" inline. If a pricing band is published, all posts use the same band wording verbatim.

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

- [ ] **Capsule structure rule (no nested sub-questions under a question H2).** If a sub-section is itself an extractable answer block (a sub-question with its own paragraph, or a profile of a distinct entity like a competitor product), it MUST be its own H2, not H3 nested under a question H2. Each H2 is one AEO capsule; each capsule should be a standalone answer 100-200 words. The classic offender: "What Are the N Best [Tool] Alternatives?" H2 with N platform reviews as H3 children. Each platform belongs at H2 level. Same for "Head-to-Head Compare?" H2 with H3 sub-dimensions. When promoting H3 to H2: flatten the TOC, rewrite the title so it stands alone (the original title only worked because the parent gave the comparison subject), and update any TOC anchors. Full rule: [.claude/skills/seo-aeo-simplescheduleai.md §2.6.1](../../.claude/skills/seo-aeo-simplescheduleai.md).
- [ ] `public/llms.txt`: optional-harmless, not a gate or ranking lever (update only if trivially relevant — see Part 0 Reconciliation)
- [ ] `public/robots.txt` still allows all AI crawlers (no accidental blocks added)
- [ ] No PHI-capturing forms or HIPAA-violating tracking code introduced
- [ ] Build passes locally: `npm run build` completes without errors
- [ ] **AEO citability gate (claude-seo v2+): run `/seo geo <preview or staging URL>` after build, before push.** Back-edit any passages flagged under the citability threshold. Workflow: [docs/seo/aeo-publish-gate.md](./aeo-publish-gate.md). Most-likely-flagged section: the "How SimpleScheduleAI helps" block — least-citable because most-promotional.

## ICP Voice and Trust Signals

_Apply on every post. The audience is a Texas CAH Nurse Manager / DON / Administrator who is time-pressed, vendor-skeptical, and often reading at 8 PM on a phone. Soft trust rules, not hard publish gates, but every new post should pass at least 6 of 9._

- [ ] **First 100 words include a specific scenario or number**, not category framing. Example: `A nurse calls out at 2:40 AM for a shift that starts at 6:45 AM...` > `Nurse scheduling is the process of...`
- [ ] **Contradiction-hook opener when applicable**: state two opposing realities the ICP lives, then promise the resolution. Pattern: `Your [X] says [A]. Your [Y] says [B]. Here is the [gap/answer/playbook].` Skip on glossary/definition posts where direct definition is more useful.
- [ ] **No vendor-speak**: avoid "platform", "solution", "transformation", "empower", "robust", "seamless". Use plain operational language ("tool", "service", "process change", "let the manager").
- [ ] **"Not right for" disclaimer present somewhere in the post** — builds trust by acknowledging what the service doesn't do. Required on every BOFU/comparison post. Optional on TOFU.
- [ ] **Every operational claim either has a hyperlinked primary source OR is explicitly framed as evidence-bound**: "from our pilot observations" / "based on 30+ nurse manager interviews". Never let a number stand without a source or evidence frame.
- [ ] **Mobile scan check**: first 3 H2 sections each have a single 1-sentence quick-answer immediately under the H2, before the longer explanation. Lets time-pressed reader extract the answer in 10 seconds.
- [ ] **Founder credibility surfaces at least once in body OR bio**: "Deputy General Manager of Operations at Apollo Hospitals" / "MBA from IIM Trichy" / "30+ nurse manager interviews before writing a line of code".
- [ ] **"Our Take" or "Founder note" callout box** present in BOFU posts — 1 per post, after a major analysis section. 50-100 word editorial opinion clearly demarcated. Builds authority, signals position. Optional on MOFU/TOFU.
- [ ] **No second-person sales tone in the body** ("you'll love...", "you'll never go back to..."). First-person plural ("we built this for...") or third-person operational ("the nurse manager...") only. Direct second-person is fine in the opener and CTAs only.

## After Publishing

- [ ] Submit URL to Google Search Console → URL Inspection → Request Indexing
- [ ] After deploy, run `npm run indexnow` to feed Bing/IndexNow (ChatGPT Search and Copilot lean on the Bing index)
- [ ] Query the page's target keyword in Perplexity and ChatGPT to baseline AI visibility
- [ ] Add to AEO tracking spreadsheet (monthly check schedule)
- [ ] Post excerpt + link on LinkedIn company page
- [ ] Update AI Share of Voice tracking if this targets a monitored query
- [ ] **Drift baseline (new pillars or guides only): run `/seo drift baseline <live URL>`** so weekly `/seo drift compare` will surface silent regressions (meta, canonical, schema, title). The Monday drift-compare run pairs with the lychee link-check CI scheduled on the same cadence.
- [ ] **Cross-post link symmetry check**: confirm the new post is linked from at least 2 sibling posts of similar tier (so it doesn't become an orphan). Update the 2 sibling posts to reference the new one in the body or in their "Related guides" list.
- [ ] **Internal tool surfacing**: if the post discusses pricing math, ROI, or weekly time cost, link to `/roi` from the relevant body section. Do not link `/simulator` while it is offline.
