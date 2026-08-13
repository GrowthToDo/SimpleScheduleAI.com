<!-- Split out of seo-aeo-simplescheduleai.md on 2026-08-10 for progressive disclosure.
     Content is VERBATIM from the original; the router skill says when to load this file.
     Mechanical rules restated here are ENFORCED by scripts/check-blog.mjs — the gate is
     the authority, this file explains the intent. -->

# Writing rules (on-page copy, do/don't, hard-won defect rules)

## PART 3 — ON-PAGE SEO RULES

### 3.1 H1 Rules

- One H1 per page. Always.
- Must contain the primary keyword naturally.
- Should communicate a clear outcome.

```
✅ "Nurse Scheduling Software for Critical Access Hospitals"
✅ "Cut Overtime and Cover Callouts — Automated Nurse Scheduling for CAHs"
❌ "Welcome to SimpleScheduleAI"
❌ "Our Product"
```

### 3.2 Body Copy Rules

- Primary keyword in the first 100 words of body text.
- Use semantic variants: "nurse scheduling", "staff scheduling", "nurse roster
  management", "shift scheduling for nurses", "CAH scheduling".
- Minimum 600 words for product/landing pages. Blog posts: see content-type word count targets in Part 7.
- Each paragraph: 2–4 sentences max.
- **Simple declarative sentences (founder directive 2026-08-03, gate-backed).** One idea per
  sentence, subject-verb-object. A body sentence over ~35 words almost always carries two ideas;
  split it WHILE WRITING, not in review. `check-blog` now WARNs on every body sentence over 35
  words (capped at 5 per file), so a draft arriving at the gate with those warnings was written
  against this rule. Litmus test from the AEO structure rules: if a sentence takes two reads to
  parse, it is too complex. This also serves AI chunking: engines weigh passage starts heavily
  and chunk mid-paragraph, so a long multi-clause sentence can lose its subject in the split.

### 3.2.1 SimpleScheduleAI Capability Claims (compliance-adjacent)

Every sentence that attributes a capability to SimpleScheduleAI (advantage bullets, comparison-table SSAI cells, "How SimpleScheduleAI works" sections, CTAs, FAQ answers about SSAI, SVG diagram labels of SSAI features) must match shipped reality. Compliance-adjacent claims especially: a CAH administrator may rely on them.

**Current rule: no FLSA 8-and-80 claim as an SSAI feature.** The scheduler tracks generic FLSA overtime thresholds; the 8-and-80 (80-hour/14-day) calculation method is not yet shipped.

- USE: "FLSA overtime thresholds", "FLSA overtime threshold tracking", "tracks each nurse's running hours against the applicable FLSA threshold"
- DO NOT WRITE (when attributed to SSAI): "FLSA 8-and-80 rule built in", "applies the 8-and-80 rule by default", "8-and-80 handled automatically", "Texas FLSA 8-and-80 compliance built in"
- KEEP UNTOUCHED: generic educational descriptions of the rule (with DOL source), "ask your vendor whether they support 8-and-80" evaluation questions, competitor-confirm / competitor-gap lines ("X does not document 8-and-80 — confirm with vendor"), and the dedicated educational posts on FLSA/Texas overtime

When 8-and-80 ships, this rule reverses. Update this section and revert the softened lines (commit eeefa9f softened the pattern across 19 posts; the same diff in reverse restores them).

### 3.2.2 Structural AI-slop patterns (gate-backed WARNs, added 2026-08-10)

Word-level AI vocabulary is already a hard failure (see `AI_TONE_PHRASES` in
`check-blog.mjs`). These are the SENTENCE-SHAPE tells, adopted after scanning the
no-ai-slop pattern list (github.com/petergyang/no-ai-slop) against all 81 live
files. Everything below scored zero live hits except the first, so treat them as
prevention, not cleanup.

- **Binary contrast, "X is not A, it is B" — DO NOT WRITE IT (founder ruling
  2026-08-10).** This was our one real tic: 34 instances across 27 of 81 live
  files, all swept the same day. The first pass argued that a contrast correcting
  a belief the reader holds is legitimate. The founder overruled that, correctly:
  if a construction is a prominent AI tell, being individually defensible does
  not save it, and the claim can always be made another way. State the positive
  claim directly. "After-hours callout coverage is not a scheduling problem. It
  is an infrastructure problem" became "After-hours callout coverage at a
  Critical Access Hospital is an infrastructure problem, solved at 2 AM by the
  one tired person who happened to be awake" — shorter and more confident, since
  the negated half was only setting up rhythm. Where the negated half carries
  real information (fairness to a competitor, pre-empting an objection), demote
  it to a trailing clause: "a category problem rather than a flaw in those
  products". `check-blog` WARNs on every occurrence.
- **Never write:** throat-clearing openers ("Here's the thing", "Let me be
  clear"), faux-insight setups ("What nobody tells you", "The part everyone
  misses" — one live H2 still carries this), rhetorical setups ("What if I told
  you", "Think about it"), dramatic fragments ("That's it.", "Full stop."),
  negative listing ("Not X. Not Y. Z."), colon reveals ("The catch: ..."),
  fake-profound kickers (end on the concrete point instead), interpretive
  metadiscourse ("matters more than it sounds", "the key point is"), and
  superficial -ing analysis (", highlighting the team's commitment to ...").
- **Synonym cycling:** repeat the right word instead of rotating through
  variants. "Schedule" five times beats schedule/roster/grid/rota/lineup, except
  where the variant is a real SEO semantic target (see 3.2).
- **Summary-recap endings** are already banned by the `in conclusion` /
  `in summary` word gate; Key Takeaways, FAQ, Our Take, and What-to-Do are the
  only sanctioned recaps.

### 3.2.3 Unclear referents at paragraph openings (gate-backed WARN, added 2026-08-14)

`check-blog` WARNs when a paragraph OPENS on an abstraction with no concrete
referent in that same sentence. The script owns the patterns; this is the intent
behind them and the judgment it cannot make.

Origin: the founder read one live article and flagged the same defect four
times, in four different sentences, across three rounds of feedback. Each round
only the sentence he pointed at got fixed, so the class survived. His examples:
"Going back is the hard direction" (back from what, to what), "A designation
change rewrites what the roster has to produce" (designation of what), "That
framing misses where it lands", "Leaving is close to paperwork".

Why it clusters at paragraph openings: transitions get written while the author
holds the whole argument in mind. The reader does not. A pronoun one sentence
after its noun is fine; the same pronoun after a paragraph break is a re-read.

How to judge a hit. The WARN is a question, not a verdict: **could a reader who
has forgotten the previous paragraph parse this sentence?** If yes, dismiss it.
If no, name the thing. Answer-first capsules under question H2s and FAQ answers
are exempt in the script, because there the heading IS the referent and that
shape is the house style.

Two things the gate cannot see, so check them by hand:

- **Terms of art used before they are explained.** Key Takeaways are read BEFORE
  the intro, so a term defined only in the intro is still undefined where the
  reader first meets it. Define it in the takeaway or avoid it there.
- **A metaphor doing load-bearing work undefined.** "The floor" and "the
  ceiling" carried an entire article's argument and were never defined, and a
  nurse manager reads "floor" as a nursing floor. Prefer the literal statement
  ("how many nurses you are required to have overnight").

Adoption note: this pattern was NOT swept to zero before adopting, unlike the
3.2.2 patterns. It matched 82 times across 55 live files, most of them real, so
the sweep is a founder-gated editing pass rather than a find and replace. Hold
NEW drafts to zero; treat hits on existing live posts as advisory until that
pass runs.

### 3.3 Image Alt Text Rules

```html
<!-- CORRECT -->
<img
  src="/images/schedule-grid.png"
  alt="SimpleScheduleAI nurse schedule grid for 25-bed critical access hospital"
  width="800"
  height="450"
/>

<!-- WRONG — too vague -->
<img src="/images/schedule-grid.png" alt="schedule" />
```

### 3.4 Internal Linking Rules

- Every blog post must link to the primary pillar page with keyword anchor text.
- Use descriptive anchor text (NOT "click here" or "read more").
- No orphan pages — every page linked from at least one other page.

### 3.5 Recurring authoring guardrails (added 2026-06 after live-post defects)

These shipped on a live post once and are now prevented. Some are gated by `check-blog` / `check-links`; author them in so you never see the flag.

- **Define before you apply (structure).** In an explainer/definitional post, the "What is X?" H2 comes BEFORE the sections that apply X (who-owes-it, how-it-affects-you). A reader who lands cold needs the definition first. Lead with the verdict only when the post is deliberately answer-first — and even then, define the core term in the intro or first section, never four H2s down.
- **Each section earns its place (no concept-level repetition).** State a definition, a test, or an exemption ONCE in the body. Key Takeaways, FAQ, "Our Take", and "What to Do This Week" are the only places a core point may recap. If section after section re-derives the same idea, you are padding — cut it (this also keeps the post in its post-type word range). This extends the "no phrase repeated 3+ times" rule to whole concepts.
- **Tight excerpt (gated).** 1-3 short sentences, none over 40 words (`check-blog` WARNs past 40). It is a distinct hook, not a restatement of the intro or a KT bullet.
- **Image must topic-match (eyeball, not just pool-membership).** A laptop/phone/app-screen image on a compliance, regulatory, or clinical-topic post reads as off-topic even though it is a valid unused pool image. Match the pool entry's `topics` to the post subject; prefer institutional/facility/paperwork imagery for compliance posts.
- **Never self-label "managed service" (gated).** SSAI's self-label is "AI-native nurse scheduling service" (or "nurse scheduling software we build and operate, delivered as a service"). "SimpleScheduleAI is a managed service" trips `check-blog`. Category/comparison/title use ("managed service vs software") is fine.
- **Every external source link must resolve (network gate).** Government URLs move silently (a CMS PDF on `/files/document/...` becomes `/downloads/...`). Run `npm run check-links <PATH>` before publish; the offline gate cannot see a dead citation.

---

---

## PART 11 — DO'S AND DON'TS

### ✅ SEO DO'S

1. Write every page for a specific human audience with a specific problem in mind.
2. Use one H1 per page containing the primary keyword.
3. Write unique meta titles (50–60 chars) and descriptions (140–160 chars) for every page.
4. Compress all images, serve in WebP/AVIF, set explicit width and height.
5. Build internal links from blog posts to pillar pages using keyword-rich anchor text.
6. Keep sitemap updated and submit to Google Search Console after new pages launch.
7. Publish articles with real author bylines and credentials.
8. Ensure HTTPS on all pages.

### ❌ SEO DON'TS

1. Do NOT keyword-stuff page copy, titles, alt text, or meta descriptions.
2. Do NOT publish thin content (under 400 words) on core product/blog pages.
3. Do NOT use the same title tag or meta description on multiple pages.
4. Do NOT use JavaScript to render the H1, main value prop, or primary CTA.
5. Do NOT create doorway pages (near-identical pages targeting slight keyword variations).
6. Do NOT publish AI-generated blog posts without expert review and real author attribution.

### ✅ AEO/GEO DO'S

1. Use question-format H2/H3 headings mirroring natural language queries.
2. Write a 40–70 word direct answer immediately after every question heading.
3. Add FAQ sections with FAQPage schema to every high-intent page.
4. Let the Astro layout auto-inject JSON-LD (Article + BreadcrumbList + conditional FAQPage); never hand-add or stack schema.
5. Allow ALL legitimate AI crawlers in robots.txt.
6. Keep `dateModified` current in all Article/BlogPosting schemas.
7. Build entity profiles on LinkedIn, Crunchbase, G2, Capterra.
8. Update llms.txt whenever a feature, pricing, or key page changes.
9. Track AI Share of Voice monthly.
10. Include "not right for" context on product pages (honesty = Claude/ChatGPT citation boost).

### ❌ AEO/GEO DON'TS

1. Do NOT block AI crawlers (GPTBot, CCBot, PerplexityBot, ClaudeBot) in robots.txt.
2. Do NOT let schema data contradict or add to what's visible on the page.
3. Do NOT use fake reviews or inflated ratings in schema.
4. Do NOT make safety or clinical claims without sourced evidence (YMYL risk).
5. Do NOT assume Google ranking = appearing in AI Overviews (track separately).
6. Do NOT let content go unupdated for 14+ days if it covers time-sensitive data.

### ❌ WRITING TONE — NON-NEGOTIABLE

1. No em-dashes (—). Use commas, colons, or rewrite the sentence.
2. No AI-generated phrasing: "delve into", "dive into", "it's worth noting", "in conclusion", "robust", "leverage", "game-changing", "seamless", "comprehensive solution", "transformative", "at the end of the day", "unlock", "harness", "navigating", "streamline".
3. Write like a hospital operations veteran talking to a peer. Direct, plain, specific. If a sentence could appear in a generic AI marketing blog, rewrite it.
4. No unverified claims framed as facts. If you cannot link to a primary source, rephrase as observation or experience.
5. Sentences should be short. Paragraphs 2–4 sentences max. No throat-clearing intros.

---

---

## Hard-won rules (2026-07) — from this week's live-post defects

Each rule below exists because a live post shipped with the defect. These are writing-time rules:
obey them while drafting, do not rely on a later pass to catch them.

### 17.1 Date-qualify any legal/landscape claim that can change

A claim about the legal or competitive landscape is a snapshot, not a constant. "California is
the only state with mandated ratios" was true when first written and false when Oregon's law took
effect — and the sentence sat live, wrong, with no date to warn anyone.

- Any claim of the form "the only state that...", "no federal law requires...", "N states
  currently...", "the market leader is..." MUST either carry a date qualifier ("as of 2026") or
  be reframed as durable ("the longest-standing broad-ratio mandate" instead of "the only ratio
  mandate").
- Prefer a `docs/seo/facts-dossier.md` entry for every such claim: use the approved wording, and
  if no entry exists, verify against a primary source and ADD the entry in the same session. The
  dossier's `Verified:` date is what makes future staleness detectable.
- When editing an old post, treat every undated landscape claim as suspect until re-verified.

### 17.2 Reader-facing source links must resolve GLOBALLY

A .gov link that works from a US browser can still be dead for much of the audience and for every
automated checker. Known offenders:

- `statutes.capitol.texas.gov` — fails DNS outside the US (geo-blocked).
- `dol.gov` deep links — 403 automated fetchers (bot-block); the page may be fine for humans, but
  a US-only or bot-blocked host still fails readers and checkers abroad.
- `ecfr.gov` — bot-blocks automated checks (fine for human readers; cross-verify via a mirror).

Rule: for any host known to be geo-blocked or bot-blocked, link a globally-resolving mirror with
a MATCHING label — FindLaw or Cornell LII for Texas statutes and CFR text. Never label a link
"Texas Health & Safety Code §241 (Texas Legislature)" while the href points at FindLaw, and never
the reverse: label and URL must name the same publisher. The facts dossier records the canonical
URL choice per fact; follow it. `check-links` treats 403/429 as "verify by hand", so a bot-block
is not proof the link works for readers — check the host against this list first.

### 17.3 Hero image: pick a different visual FAMILY, not just a different ID

The exact-ID uniqueness gate passed three visually near-identical medical-supplies flat-lays onto
live posts. Unique ID does not mean visually distinct.

- Every entry in `scripts/image-pool.json` carries a `family` field (supplies-flat-lay,
  stethoscope-closeup, nurse-portrait, team-meeting, facility-exterior, ward-clinical,
  desk-admin, historic-bw, data-analytics, misc).
- When choosing a hero, check which families topically-adjacent live posts already use and pick a
  DIFFERENT family unless the topic genuinely demands the same one. `check-blog` WARNs when the
  chosen image's family already appears on 3+ live posts; treat the WARN as "justify or swap".
- The human image eyeball (pipeline phase) still judges relevance and tone; the family check only
  prevents the sea-of-samey-heroes problem.

### 17.4 Excerpt hook: a claim or tension the ICP feels, never search-behavior meta

The excerpt's first sentence must land as something a DON or administrator would feel or argue
with. Writing about what "searchers" do is meta-commentary about the query, not a hook — the
reader is not a searcher-watcher, they ARE the searcher.

- BAD (shipped, then rewritten on founder feedback): "Searchers want a number, but there is no
  federal nurse-to-patient ratio."
- GOOD (the rewrite): "Everyone asks for the required nurse-to-patient ratio. Federal law does
  not set one."
- Test: does the first sentence state a claim or a tension in the ICP's own world (their unit,
  their budget, their survey window)? Words like "searchers", "readers", "people googling",
  "this guide" in the first sentence are automatic rewrites. (The distinct-hook and no-run-on
  rules from the checklist and gate still apply.)

---

## VALIDATION CHECKLIST (Run before publishing any new page)

```
[ ] Unique, keyword-rich title tag (50–60 chars)
[ ] Unique meta description (140–160 chars)
[ ] One H1 with primary keyword
[ ] Primary keyword in first 100 words
[ ] All H2/H3 headings phrased as questions with 40–70 word capsule answers
[ ] FAQ section with FAQPage schema (product/landing pages)
[ ] Appropriate JSON-LD schema (BlogPosting for blogs, SoftwareApplication for product)
[ ] BreadcrumbList schema (all inner pages)
[ ] Author byline with credentials (blog posts — NOT "SimpleScheduleAI Team")
[ ] All stats and claims hyperlink to primary source
[ ] All images have descriptive alt text + width/height
[ ] All images are WebP/AVIF and compressed
[ ] Internal links to pillar page with keyword anchor text
[ ] Canonical tag points to correct URL
[ ] Page added to XML sitemap
[ ] llms.txt updated if new feature or page added
[ ] PageSpeed Insights: LCP < 2.5s, CLS < 0.1
[ ] Schema validated in Google Rich Results Test
[ ] robots.txt still allows all AI crawlers (no accidental blocks)
[ ] No PHI-capturing forms or HIPAA-violating tracking code added
[ ] dateModified in BlogPosting schema reflects actual update date
[ ] AI Share of Voice check queued for next monthly review
```

---

