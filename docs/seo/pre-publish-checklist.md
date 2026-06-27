# Pre-Publish Checklist — SimpleScheduleAI Blog & Pages

Run this before publishing any new page or blog post.

**Mechanical items are enforced by `npm run check-blog src/data/post/<slug>.md` (`scripts/check-blog.mjs`), not by hand or by a review agent.** Run it and fix every HARD FAILURE first. It deterministically checks dashes, the full AI-tone list, both pillars + `/how-it-works`, canonical-matches-slug, TOC anchor/heading integrity, merged-heading + stray `?`, no-`CAH`-in-headings, stray MDX, image-pool membership + no-duplication, dark-mode table variants, Sources numbered + not-in-TOC, date sanity, Key-Takeaways-before-TOC, no-TL;DR, and the retired-pilot ban. The human/agent pass then handles ONLY the JUDGMENT items a script cannot see (excerpt-is-a-distinct-hook, title-overclaim, anecdote-as-real, KT/excerpt framing matches body, structural AI-tells, reviewer-quote accuracy, worked-math honesty, image relevance/tone). If a rule can be verified by a script, it belongs in the script, not in a manual re-read.

## Part 0 Reconciliation (read first — overrides any conflicting item below)

This checklist predates Google's AI optimization guidance. See the skill's PART 0. Where an item below conflicts with this block, this block wins.

- **Guidelines, NOT publish gates** (quality heuristics; never block a publish on these): title 50-60 chars, meta/excerpt length, "every H2 is a question", the 40-70-word answer capsule, 120-180-word sections, one-stat-per-150-200-words. Google does not treat these as ranking or AI-citation levers. The full "Critical Access Hospitals" title is intentionally allowed to exceed 60.
- **Superseded mechanics** (keep the writing, drop the reasoning): any "for maximum ChatGPT citation probability", "AI citation penalty", "schema stacking", or rich-result framing. Write answer-first, well-structured, sourced prose because it is good for readers and extraction, not for a citation multiplier.
- **Schema:** the Astro layout auto-generates the only supported types (Article/BlogPosting, BreadcrumbList, FAQPage). Do NOT hand-add or stack JSON-LD. FAQ and HowTo rich results were restricted/removed by Google in 2023 — never chase them; schema only needs to be error-free, it is not a publish gate.
- **llms.txt:** optional-harmless, never a gate or a lever.
- **Hard gates that DO block publish:** no em-dashes/en-dashes; no AI-tone phrases; both pillar links + `/how-it-works`; every stat hyperlinked to a primary source; all competitor-content + comparison-table integrity rules; image load/relevance/uniqueness/no-quotes; dark-mode table variants; Key Takeaways/excerpt match body; no inline `<svg>`; no leaked tags; `npm run build` passes; robots allows AI crawlers; no PHI/HIPAA issues.
- **After publishing:** deploy + `npm run indexnow` feeds Bing/IndexNow (ChatGPT Search and Copilot lean on Bing), plus GSC request-indexing and the monthly AI-citation log.

## Recurring defects (verify each by hand — these repeatedly slip past mechanical and agent passes)

Found again and again across posts. A generic checklist pass misses them; check each explicitly and quote the offending text.

- [ ] **Excerpt is a DISTINCT hook, not a restatement.** Quote the excerpt's first sentence, the intro's first sentence, and each Key Takeaway bullet, then compare. The excerpt must not open on the same clause as the intro and must not restate any single KT bullet near-verbatim. ("Excerpt matches body" means consistent claims, NOT duplicated text.) Three different jobs: excerpt = hook, intro = definition or scenario, KTs = scannable bullets.
- [ ] **Title does not overclaim or contradict the body.** No flat absolute the body walks back (e.g. a "(Most X Are Not Y)" parenthetical when the body softens to "does not advertise Y, confirm with the vendor"). No competitor "is not compliant" assertion in the title.
- [ ] **No "CAH" abbreviation in any title, H1, H2/H3, table header, or figcaption.** Body prose may use CAH; every visible heading and column header spells out "Critical Access Hospital(s)".
- [ ] **No observational/volume language unless cited.** Remove: "Based on what we see", "most managers/users/reviewers", "consistently", "studies show", "many facilities". Reframe as a principle or cite a primary source.
- [ ] **No anecdote presented as a real event.** Any opening scenario is framed illustratively ("Consider a common scenario...") and stays conditional ("can", "may"); never narrate a specific case as fact.
- [ ] **No phrase, metaphor, claim, or CTA repeated 3+ times** across sections (the same "3 a.m. phone tree", "lands on the manager's desk", vendor-walkthrough test, "one tool/workflow"). Vary or cut.
- [ ] **No stray MDX in a `.md` file.** Grep `^import `, `astro:assets`, and `<Image` — these belong only in `.mdx`; in `.md` they render as literal text.
- [ ] **`## Sources` is a NUMBERED list** (`1.`, `2.`), above the bio and below the FAQ, never bulleted. Compliance posts: every penalty, deadline, percentage, dollar figure, or "N periods" claim is hyperlinked to a primary source (CMS, eCFR, Federal Register, HHS, DOL, BLS, NSI) or explicitly estimate-framed.
- [ ] **CFR sections correct:** CAH staffing/on-duty/supervision = **§485.631**; provision of services / RN nursing-care assignment = **§485.635**. Never cite §485.635 for the staffing-on-duty rule.
- [ ] **Date sanity:** `publishDate` is not a placeholder (2099) and not an unintended future date; `updateDate` is not earlier than `publishDate`. Set the real publish date at go-live.
- [ ] **Image needs a human eyeball.** An agent cannot see it: confirm the ID is in `scripts/image-pool.json`, unused by other posts, no YAML quotes, AND a person checks the rendered image for relevance and tone before publish. The pool description does not guarantee a good visual, and the pool is nearly exhausted. **Topic-match the image to the post's subject:** a laptop/phone/app screen on a compliance, regulatory, or clinical-topic post (e.g. a PBJ/CMS post) reads as off-topic even though it is a valid, unused pool image. Prefer an institutional/facility/paperwork image for compliance topics; match the pool entry's `topics` to the post's subject.
- [ ] **No heading glued to its body, no stray trailing `?`.** Recurred across 6+ posts from copy-paste. Grep `^#{2,6} .+\?.` — a heading whose `?` is followed by more text on the SAME line (`## What Should You Do This Week?Pick one...`) is collapsed: the H2/H3 must sit alone on its line, then a blank line, then the paragraph. Separately grep `[.?!][?]$` — no line ends in `.?` / `?? ` (a body sentence with a question mark glued on, e.g. `...how-it-works).?`). A question heading SHOULD end in `?`; a body line never should.
- [ ] **Every EXTERNAL source link resolves (200) — not just the featured image.** Run `npm run check-links <PATH>` (or curl each external URL) before publish. Government pages move silently: a CMS PDF on `/files/document/...` 404s once CMS reshelves it under `/downloads/...`, and a dead citation guts the post's authority. The offline `check-blog` gate cannot see this (no network); `check-links` is the network pass. 403/429/timeouts are usually bot-blocks, not dead links — verify those by hand, do not assume broken.
- [ ] **Each body section adds NEW information; no concept re-explained across 3+ body sections.** A definition, a one-question test, an exemption: state each once in the body. Key Takeaways, FAQ, "Our Take", and "What to Do This Week" are the ONLY places a core point may recap. If the body re-derives the same idea section after section, dedup — this also keeps the post inside its post-type word range. (Extends the "no phrase repeated 3+ times" rule to whole concepts, not just phrasings.)
- [ ] **Definition before application (explainer/definitional posts).** The "What is X?" H2 comes BEFORE the sections that apply X (who-owes-it, how-it-works-for-you), so a cold reader gets the definition first. Lead with the verdict only when the post is deliberately answer-first — and even then, define the core term early (in the intro or first section), never bury it four H2s down.
- [ ] **"managed service" is never a SELF-label (now gated — verify the reword reads naturally).** `check-blog` WARNs on "SimpleScheduleAI is a managed service" and "our managed ... service". The self-label is "AI-native nurse scheduling service"; category/comparison/title use ("managed service vs software") is fine. When you fix a flagged self-label, confirm the new sentence still reads well.
- [ ] **Excerpt has no run-on sentence (now gated).** `check-blog` WARNs on any excerpt sentence over 40 words. Keep the excerpt to 1-3 short sentences; split anything long. (Pairs with the distinct-hook rule above.)

## Content

- [ ] Unique title tag (50–60 chars) containing primary keyword
- [ ] Unique, useful meta description/excerpt (length is NOT a ranking factor; guideline only, never block publish on it — see Part 0 Reconciliation)
- [ ] One H1 per page containing primary keyword
- [ ] **Title/H1 never uses "CAH" abbreviation** — always spell out "Critical Access Hospital(s)" for SEO
- [ ] **Title/H1 audience matches content audience** — if the post is specifically about CAHs (mentions CMS §485.635, 25-bed scale, CAH designation), the title must say "Critical Access Hospital(s)", not "Small Hospitals" or "Small Hospital"
- [ ] **Internal hub links: both pillar pages linked** — every post must link to `/nurse-scheduling-software` AND `/critical-access-hospital-scheduling` with keyword anchor text, plus `/how-it-works` in any section that describes the SimpleScheduleAI service, plus `/ai-nurse-scheduling` (third topical hub) wherever the post discusses AI scheduling, which is most posts
- [ ] Primary keyword appears in first 100 words of body text
- [ ] **Hyperlinks/references front-loaded (soft):** at least one hyperlink or source reference (an internal link OR an external citation) appears in the first 2 sections (intro + first 2 content sections), so LLMs get the link/reference signal early. The gate WARNs only when a post has links but none early. Not every post fits — do not force-fit.
- [ ] All H2/H3 headings phrased as questions
- [ ] Every H2/H3 has a 40–70 word direct answer capsule immediately below it
- [ ] Sections are substantive (about 120–180 words is a thoroughness heuristic, NOT a citation lever — see Part 0 Reconciliation)
- [ ] One stat or data point per 150–200 words
- [ ] Every stat/regulatory claim hyperlinks to a primary source. Canonical URLs: CMS §485.635 → eCFR (not cms.gov), FLSA → DOL Fact Sheet #54, Texas hospital licensing → HHSC (not DSHS — licensing transferred Jan 2025), Texas Payday Law → TWC, plus HRSA, ANA, AONL, Flex Monitoring Team where applicable.
- [ ] **Worked math is honest and labeled (P0).** When you give a savings or cost figure, do the arithmetic for the reader AND state the assumption, labeled illustrative: "at a $50/hr loaded rate, 8 hrs/week of manual scheduling is about $400/week, roughly $20,800/year - an illustrative figure at the stated rate, not a customer result." Never present a number as a customer outcome (SSAI is pre-launch). Either hyperlink a primary source or label it illustrative.
- [ ] FAQ section present (product/landing/blog pages) — minimum 3 Q&As
- [ ] **FAQ grouping (BOFU/comparison/long posts) (P1):** cluster the FAQ into 2-4 themed groups (e.g., Basics, Compliance, Pricing, vs-competitors), with 2-4 Q&As each. Short glossary/definition posts keep a flat 3-5 Q&A list (do not force groups).
- [ ] Author byline with real name, credentials, and LinkedIn link (NOT "SimpleScheduleAI Team")
- [ ] Internal link to pillar page (`/how-it-works` or `/critical-access-hospital-scheduling`) with keyword anchor text
- [ ] CTA at end linking to `/how-it-works` or `/pricing`
- [ ] **Author bio uses canonical italic-linked format** at end of post: `_[Pradeep Pandey](/about/pradeep-pandey) is the co-founder of SimpleScheduleAI, an AI-native nurse scheduling service built for Critical Access Hospitals in Texas. He serves as Deputy General Manager of Operations at Apollo Hospitals and holds an MBA from IIM Trichy._` followed on next line by `[LinkedIn →](https://www.linkedin.com/in/pradeep-pandeyji/)`. Never use the older `**Written by Pradeep Pandey**` block format.
- [ ] **"What to Do This Week" CTA section present** (5 numbered concrete actions) before the FAQ section. Required on BOFU, comparison, and operational guide posts. Optional on glossary/definition posts.
- [ ] **Standalone "How to Evaluate a [Vendor/Category]" section (comparison/buyer posts) (P1):** a dedicated H2 with 5-7 explained, numbered criteria. Write it to be independently citable (LLMs reference it even when not recommending us), so keep it self-contained, not buried in a product pitch.
- [ ] **Use-case cheat sheet (comparison/buyer posts) (P1):** a scannable list or table mapping scenario -> recommended fit -> one-line why, organized by hospital profile or bed-size. Format for extraction; do not bury it inside card components.
- [ ] **CTA box uses the standardized structure**: ONE primary filled button (`See pricing →` → `/pricing`, or `See how it works →` → `/how-it-works`) with `Book a call with our team →` as a small text link directly BELOW the button (never two side-by-side buttons, never a `flex flex-col sm:flex-row` button row). One CTA box per post, placed after the "What to Do This Week" steps. The free pilot is RETIRED: never link `/pilot` or use "Apply for a Pilot Spot", "Claim a Pilot Spot", "free pilot", or "Get a Free Schedule Review". The "with our team" framing pre-explains the booking page and prevents name-mismatch confusion.
- [ ] **Founder role consistent**: post bio says "co-founder" only if `/about` page reflects both founders or the cal.com booking team is framed as "our team". Otherwise use "founder" until co-founder is publicly named on the site.
- [ ] **"Texas" geographic framing**: posts that describe the SimpleScheduleAI service include the phrase "Texas Critical Access Hospitals" at least once in the body. Posts that are pure operational guides (not service descriptions) can omit Texas if topic-agnostic.

## Structure and Format

- [ ] Key Takeaways (5–6 bullets, ~100 words) placed **BEFORE** the Table of Contents — never after
- [ ] **Key Takeaways re-read AFTER all body edits are complete** — KT language must match the body framing exactly. If body says "not documented on product page," KTs cannot say "no X" or "lacks X." Re-check KTs last, not first.
- [ ] **Excerpt re-read AFTER all body edits** — same rule: no "lacks X" or "no X" in excerpt if body uses "not documented" framing
- [ ] No TL;DR section present — Key Takeaways replaces TL;DR (TL;DR is an AI-tell pattern)
- [ ] No em-dashes (`—`) anywhere — prose, excerpts, table cells, TOC, blockquotes, CTA cards
- [ ] No AI-tone phrases in our voice: "delve into", "dive into", "it's worth noting", "in conclusion", "in summary", "robust", "leverage", "game-changing", "seamless", "comprehensive solution", "transformative", "at the end of the day", "unlock", "harness", "navigating", "streamline", "serves as", "stands as", "marks a", "represents a". **Exception:** verbatim Capterra/G2 reviewer quotes are protected even if the reviewer used one of these words. Our paraphrasing of a reviewer must still avoid the phrase.
- [ ] **No structural AI-tells** (source: tropes.fyi catalog, adopted 2026-06-12). These are sentence/paragraph patterns, not words — grep can flag candidates but each requires a human-read judgment on the flagged line:
  - **Negative parallelism:** "It's not X, it's Y" / "This isn't about X. It's about Y." / "Not X. Not Y. Just Z." — zero instances in our voice
  - **Self-posed rhetorical question + answer:** "The result? A schedule that..." / "The problem? Nobody..." — zero instances
  - **Anaphora abuse:** 3+ consecutive sentences opening with the same word/phrase — rewrite
  - **Tricolon abuse:** more than one rule-of-three list-sentence ("X, Y, and Z.") per section — vary rhythm
  - **Vague attributions:** "experts say", "studies show", "many administrators report" without a named, linked source — already banned for stats; this extends the ban to ALL claims
  - **Dead metaphor repetition:** the same metaphor (fire drill, juggling, tug-of-war, etc.) used 3+ times in one post — keep once, cut the rest
  - **"Despite its challenges..." dismissal formula** in competitor Key Limitations sections — acknowledge-then-wave-away is banned; limitations stand on their own
  - **Signposted conclusions:** no "In conclusion/In summary/To wrap up" section openers anywhere (Key Takeaways carries the summary role, once)
  - **Invented concept labels:** no coined compound terms presented as established ("the coverage spiral", "the approval trap") unless the post explicitly owns the coinage
  - **NOT banned (deliberate AEO choices, keep):** bold-first bullets in Key Takeaways, question-form H2s with answer capsules, word-count floors by post type. AEO scannability wins these trade-offs (decision: Pradeep, 2026-06-12).
- [ ] TOC anchor text exactly matches H2/H3 heading text, including trailing `?` on question headings
- [ ] **TOC links resolve to real heading slugs (mechanical, P0).** Astro auto-generates heading IDs via GitHub-style slugify, so every manual TOC/jump link `](#x)` must equal the slug of an actual H2/H3 (lowercase, spaces to hyphens, punctuation stripped). Grep the post's `](#` anchors against its headings before publish; a mismatch is a broken jump link. (A future auto-generated TOC component would remove this hand-maintenance: separate task.)
- [ ] **`## Sources` (or `## A Note on Sources`) is NOT listed in the TOC.** Sources is a supporting section, not a navigational one. Same applies to author bio and italic disclaimers. TOC lists the question-H2 spine + What to Do + FAQ, nothing else. Established on Schedule360 launch (commit 146a266) and re-confirmed on the no-IT-department post.
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
- [ ] **All in-body local images are WebP** (never commit PNG/JPG `<img>` into a post). Featured/Unsplash remote images are exempt (remote, already optimized). Convert with sharp at 1200px width / quality 80. Site-wide backfill was done 2026-06-06 (137 images, ~36.5 MB -> ~5.6 MB); the conversion pattern: for every `/images/**.(png|jpg)` referenced in `src/data/post`, generate a `.webp` sibling, swap all refs, then verify `grep -r "/images/.*\.png" src/data/post` returns zero and `dist` has no missing referenced images before commit. (Worth promoting to a permanent `scripts/` tool + a check-blog gate.)
- [ ] Hero/featured image is compressed (< 200KB ideally); converted in-body WebP should each be < ~100KB
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
- [ ] **Pricing line is consistent across all posts** — canonical SimpleScheduleAI pricing line (adopted 2026-06-12, matches the live /pricing page): `**Cost:** Flat monthly price by roster size: $1,000/month for up to 20 nurses, $1,500/month for 21 to 40 nurses. No per-nurse fees, no setup fees.` Use this verbatim in every SSAI row/profile. Comparison-table cell short form: `$1,000 to $1,500/mo flat`. Never invent ad-hoc phrasings like "Contact for current rates", "starts at $X", or the retired `Pricing not listed on website. Contact for a quote.` line. NOTE: live posts published before 2026-06-12 still carry the retired line; sweep them in the blog pricing pass before citing pricing consistency as done.

## Comparison Tables (when comparing competitor products)

- [ ] Table is fully visible on standard viewport with **no horizontal scrollbar**. Use `table-fixed` with explicit per-column `style="width:NN%"` rather than `overflow-x-auto` + `min-width`.
- [ ] Table includes `break-words` class so long product names ("SimpleScheduleAI", "NurseGrid Manager") wrap inside the cell rather than overflowing into adjacent columns.
- [ ] Table uses responsive font sizing: `text-xs sm:text-sm` (xs on mobile, sm on tablet+).
- [ ] Cells use `align-top` for clean alignment when content wraps.
- [ ] **Rating cells follow the standard format**: `G2: X.X/5 (N reviews)<br>Capterra: Y.Y/5 (M reviews)` — labeled, stacked on separate lines via `<br>`. Never use compressed slash-separated formats like `4.3/5 (97) / 4.6/5 (17)` — readers cannot tell which number is which source.
- [ ] **When only one source has data**, show only that source (e.g., `Capterra: 4.5/5 (6 reviews; small sample)`). Never use placeholder text like "Not pulled", "N/A", or "—" in a rating cell.
- [ ] **Small-sample disclosure**: when a vendor has fewer than 20 reviews on a source, append `; small sample` to the cell.
- [ ] **Competitor capability cells**: never assert feature absence as fact ("None", "No", "Not built-in"). Use either the verified state ("Configurable", "Manual export", "Automatic") or `Confirm with vendor` / `Not documented` when the public product page does not explicitly cover it.
- [ ] **SimpleScheduleAI in the table** uses Option C framing: `New service; no public rating yet` for any rating cell. Never imply a rating we don't yet have.
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
- [ ] **Every operational claim either has a hyperlinked primary source OR is explicitly framed as evidence-bound**: "from our nurse manager interviews" / "an estimate at a $50/hr loaded rate". Never let a number stand without a source or evidence frame.
- [ ] **Mobile scan check**: first 3 H2 sections each have a single 1-sentence quick-answer immediately under the H2, before the longer explanation. Lets time-pressed reader extract the answer in 10 seconds.
- [ ] **Founder credibility surfaces at least once in body OR bio**: "Deputy General Manager of Operations at Apollo Hospitals" / "MBA from IIM Trichy" / "30+ nurse manager interviews before writing a line of code".
- [ ] **"Our Take" or "Founder note" callout box** present in BOFU posts — 1 per post, placed immediately before the "What to Do This Week" section. 50-100 word editorial opinion clearly demarcated. Builds authority, signals position. Optional on MOFU/TOFU.
- [ ] **No second-person sales tone in the body** ("you'll love...", "you'll never go back to..."). First-person plural ("we built this for...") or third-person operational ("the nurse manager...") only. Direct second-person is fine in the opener and CTAs only.
- [ ] **Pre-Key-Takeaways narrative opener present on BOFU/comparison posts** (sellontube pattern). 2 short paragraphs between the frontmatter `---` close and the `## Key Takeaways` heading. Paragraph 1: contradiction-hook in 2-3 sentences ("Your X says Y. Your nurse manager actually deals with Z."). Paragraph 2: what the guide covers, framed as resolution. Skip on glossary/definition posts where direct definition is more useful. Pattern verified in commit d1b864c+follow-ups.

## Pre-Publish Proofreading Agent (Final Gate)

_Mandatory final gate before any post flips `draft: true` → `draft: false`. Catches violations of every rule in this checklist plus established conventions not yet codified here. This gate sits AFTER the Phase 3 Review agent in the 3-agent pipeline and BEFORE the human go-live decision. Run when the founder is about to authorize publish; the agent reports back, the main agent applies the flagged fixes, then the founder publishes._

### How to spawn it

```
Main agent: spawn feature-dev:code-reviewer subagent with this prompt:

"You are the Pre-Publish Proofreading Agent. The post at <PATH> is about to
go live. Run every check in docs/seo/pre-publish-checklist.md mechanically.
For each check, GREP/SCAN the file — no eyeballing, no assumptions.

Mandatory first step: run `npm run check-blog <PATH>` and report the output
verbatim. Treat every hard failure from the script as a publish blocker
regardless of whether the founder asked you to be lenient. Then run
`npm run check-links <PATH>` (network pass) and report any hard-broken (4xx)
external source link as a blocker — the offline gate cannot see dead links.

If a subagent trimmed or rewrote this post, do NOT trust its self-reported
cut size or "nothing removed" claim. Ground-truth the actual change:
`git diff --stat <PATH>`, a before/after body word count, and counts of
preserved blockquotes / tool names / links. Subagents have under-reported
their own cuts by ~7x; verify, then report the real delta.

Mandatory second step: structurally diff the draft against these three
canonical reference posts: schedule360-alternatives.md,
best-nurse-scheduling-software-2026.md, qgenda-alternatives.md. Flag any
deviation from the established convention (TOC entries, H2 sequence,
callout placement, Sources/FAQ/bio order, italic-linked author bio
format) EVEN IF this checklist is silent on it.

Mandatory third step: run every numbered check in Part 0 Reconciliation
+ every hard gate listed in this checklist + every BOFU x-alternatives
rule if the post matches `*-alternatives.md`.

Return format:
- Pass/fail table with one row per check
- For each FAIL: line number, verbatim violating text, one-line proposed fix
- Final verdict: READY-TO-PUBLISH or NEEDS-FIXES
- If NEEDS-FIXES, count fixes by tier: Blocker / Quality / Polish

Do not edit the file. The main agent applies fixes based on your report."
```

### What this gate prevents

Established October 2026 (commit 840d3f0) after a live post slipped a TOC
"Sources" entry past Phase 3 Review because the rule existed in
git history but not in this checklist. Encoding the agent here ensures
the gate runs on every publish regardless of who is driving the session,
and the agent has the full ruleset every time.

### Founder publish handshake

After this agent returns READY-TO-PUBLISH, the main agent reports the
verdict to the founder verbatim. Only the founder authorizes the
`draft: true` → `false` flip (per the standing "Publish only on explicit
instruction" rule). If the agent returns NEEDS-FIXES, the main agent
applies the fixes, re-runs the agent, and only proceeds to founder
handshake when the verdict is READY-TO-PUBLISH.

## After Publishing

- [ ] Submit URL to Google Search Console → URL Inspection → Request Indexing
- [ ] After deploy, run `npm run indexnow` to feed Bing/IndexNow (ChatGPT Search and Copilot lean on the Bing index)
- [ ] Query the page's target keyword in Perplexity and ChatGPT to baseline AI visibility
- [ ] Add to AEO tracking spreadsheet (monthly check schedule)
- [ ] **Weekly money-lane citation check (adopted 2026-06-12, replaces monthly for these 3):** every week, run the ChatGPT scraper (`ai_optimization_chat_gpt_scraper`, ~$0.05/query, log cost) on: (1) "best nurse scheduling software for critical access hospitals", (2) "managed nurse scheduling service vs scheduling software", (3) "nurse scheduling software for small hospital with no IT department". Record cited domains in `docs/seo/aeo-tracking.md`. Trigger: if a new vendor appears cited, add to dossier within the week (this is how M7 took lane 1 between Jun 5 and Jun 12 unnoticed). All other queries stay on the monthly cadence.
- [ ] Post excerpt + link on LinkedIn company page
- [ ] Update AI Share of Voice tracking if this targets a monitored query
- [ ] **Drift baseline (new pillars or guides only): run `/seo drift baseline <live URL>`** so weekly `/seo drift compare` will surface silent regressions (meta, canonical, schema, title). The Monday drift-compare run pairs with the lychee link-check CI scheduled on the same cadence.
- [ ] **Cross-post link symmetry check (now gated in corpus mode)**: every live post must be linked from at least 2 LIVE sibling posts (links from drafts do not count — they give no crawl path). `npm run check-blog -- --live` flags any live post with <2 inbound internal links ("Internal-link orphan" WARN). Wire the new post into 2-3 topically-relevant live posts with NATURAL in-prose keyword-anchor links (not a bolted-on "Related" list). Skipping this is how 11 posts became zero-inbound orphans and stranded in GSC "crawled/discovered, currently not indexed" (2026-06-27).
- [ ] **Internal tool surfacing**: if the post discusses pricing math, ROI, or weekly time cost, link to `/roi` from the relevant body section. `/simulator` is LIVE (the interactive demo: the AI builds a compliant schedule and ranks a per-diem callout shortlist) — link it (anchor `[interactive simulator](/simulator)`) from posts on AI scheduling, schedule building, callout coverage, comparisons, alternatives, and buyer guides, woven into the SimpleScheduleAI section as a natural "watch it build a schedule live" invitation. Skip only tightly-scoped glossary/definitional posts where it would feel forced. (43 of 44 live posts link it as of 2026-06-27.)
