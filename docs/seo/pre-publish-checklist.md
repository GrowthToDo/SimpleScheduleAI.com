# Pre-Publish Checklist — Judgment Items Only

Run this before publishing any new page or blog post. **This doc is the judgment-item catalog
ONLY** (see [GOVERNANCE.md](./GOVERNANCE.md) for the authority map). Mechanical rules live in
scripts; process order lives in `.claude/skills/publish-pipeline.md`; canonical facts live in
[facts-dossier.md](./facts-dossier.md). Conflict rule: **scripts > dossier > skill > checklist.**
If a rule here can be verified by a script, move it into `scripts/check-blog.mjs` (with a test)
and delete it here.

## Enforced by scripts (do not hand-check)

Run these; fix every HARD FAILURE; a human never re-verifies a green row by hand.

- `npm run check-blog src/data/post/<slug>.md` — offline gate. HARD-FAILS: em/en-dashes; the full
  AI-tone phrase list; inline `<svg>`; blank line inside `<div>` blocks; retired `/pilot` CTA
  strings; the CTA pattern (one primary button + Book-a-call text link, exactly one CTA box);
  italic-linked author bio format; both pillar links + `/how-it-works`; canonical-matches-slug;
  TOC anchor/heading integrity + broken jump links; merged heading + stray glued `?`; no "CAH" in
  headings, table headers, or figcaptions; stray MDX (`import`, `astro:assets`) in `.md`;
  image-pool membership + exact-ID duplication + unquoted image URL; dark-mode variants on every
  table class; Sources numbered + not listed in TOC; date sanity (placeholder 2099,
  updateDate >= publishDate); Key-Takeaways-before-TOC; no TL;DR; links-to-drafts; one "Our Take"
  max; facts drift via `scripts/lib/facts-rules.mjs` (CFR pin-cites §485.631 vs §485.635,
  DSHS-vs-HHSC, §62.002, no 8-and-80 attributed to SimpleScheduleAI).
- `check-blog` WARNs (advisory — a human judges each flagged line, never ignores them silently):
  word count vs post-type range; `/ai-nurse-scheduling` third hub; in-body `.webp`; standard
  table classes; volume language near competitor names; excerpt run-on (>40-word sentence);
  "managed service" self-label; front-loaded link/reference; over-used image family (3+ live
  posts in the same visual family); internal-link orphan (corpus `--all`/`--live` runs).
- `npm run check-links src/data/post/<slug>.md` — network pass. Every external source URL and the
  featured image must resolve. 403/429/timeouts are usually bot-blocks, not dead links — verify
  those by hand before declaring broken; see the geo-block rule in the seo-aeo skill's
  "Hard-won rules" for hosts that must be swapped to a global mirror.
- `npm run publish-gate <slug>` — manifest gate: fills `checkBlog`, `checkLinks`, `inboundLinks`
  (>= 2 LIVE sibling posts), `image`, `prettier`, `dateSanity`, `factsDossier`, and the recorded
  verdict fields. The pre-commit hook re-runs it on the draft flip.
- `npm run smoke` — route smoke test after any routing/template change.

## Quality heuristics (guidelines, never publish gates)

These predate Google's AI-optimization guidance and stay as thoroughness heuristics only — never
block a publish on them, and never cite "AI citation probability" as their reason:

- Title tag ~50-60 chars with primary keyword (the full "Critical Access Hospitals" title is
  intentionally allowed to exceed 60); unique, useful excerpt (length is not a ranking factor).
- One H1 containing the primary keyword; primary keyword in the first 100 words.
- H2/H3 headings phrased as questions, each with a 40-70 word direct answer capsule immediately
  below (no preamble); sections ~120-180 words; roughly one stat per 150-200 words.
- Schema: the Astro layout auto-generates the only supported types (Article/BlogPosting,
  BreadcrumbList, FAQPage). Do NOT hand-add or stack JSON-LD; FAQ/HowTo rich results were
  restricted/removed by Google in 2023. Error-free if spot-checked; not a gate.
- `public/llms.txt`: optional-harmless, never a gate or lever.

### Title and copy craft (added 2026-07-12; heuristics, not gates)

- Headline formula check: a strong title carries an action verb or specific outcome plus a
  timeframe or contrast; write FIVE title options before picking one (keep the rejects in the
  brief — the queue for A/B swaps if GSC CTR underperforms).
- Read-aloud test: read the excerpt and any new section opener aloud; if it sounds like a
  textbook, rewrite it. Same-length paragraphs in a row read as machine rhythm — vary them.
- So-what chain: for the piece's core claim, go three levels deep ("fast draft" -> "posted on
  time" -> "no Sunday night rebuild") and write from the bottom level, the one that is
  emotional or financial for a DON.
- Pain quantification: prefer arithmetic the reader can check ("2-3 callout events at 1-3
  hours each") over adjectives ("time-consuming") — only with dossier/interview-backed numbers.

## Recurring judgment defects (verify each by hand and quote the offending text)

These repeatedly slip past agent passes. Check each explicitly.

- [ ] **Excerpt is a DISTINCT hook, not a restatement.** Quote the excerpt's first sentence, the
      intro's first sentence, and each Key Takeaway bullet, then compare. The excerpt must not open
      on the same clause as the intro and must not restate any single KT bullet near-verbatim.
      Three different jobs: excerpt = hook, intro = definition or scenario, KTs = scannable
      bullets. The excerpt's first sentence must be a claim or tension the ICP feels — never
      search-behavior meta ("Searchers want a number..."); see the excerpt-hook rule in the
      seo-aeo skill's "Hard-won rules (2026-07)".
- [ ] **Title does not overclaim or contradict the body.** No flat absolute the body walks back
      (e.g. a "(Most X Are Not Y)" parenthetical when the body softens to "does not advertise Y,
      confirm with the vendor"). No competitor "is not compliant" assertion in the title.
- [ ] **Title/H1 audience matches content audience** — if the post is specifically about CAHs
      (CMS §485 references, 25-bed scale, CAH designation), the title says "Critical Access
      Hospital(s)", not "Small Hospitals".
- [ ] **No observational/volume language unless cited.** The gate WARNs on candidates
      ("consistently", "most managers", "studies show", "many facilities"); a human confirms each
      flagged line is either cited to a primary source or reframed as a principle. Zero volume
      language near a competitor name.
- [ ] **No anecdote presented as a real event.** Any opening scenario is framed illustratively
      ("Consider a common scenario...") and stays conditional ("can", "may"); never narrate a
      specific case as fact. SSAI is pre-launch: never cite pilot observations, cohorts, or
      customer results.
- [ ] **No phrase, metaphor, claim, or CTA repeated 3+ times** across sections. Vary or cut.
- [ ] **Each body section adds NEW information; no concept re-explained across 3+ body sections.**
      A definition, a one-question test, an exemption: state each once in the body. Key
      Takeaways, FAQ, "Our Take", and "What to Do This Week" are the ONLY places a core point may
      recap.
- [ ] **Definition before application (explainer/definitional posts).** The "What is X?" H2 comes
      BEFORE the sections that apply X. Lead with the verdict only when the post is deliberately
      answer-first — and even then, define the core term early, never four H2s down.
- [ ] **Date-qualified temporal claims.** Any legal/landscape claim that can change over time
      ("the only state that...", "no federal law requires...") is date-qualified or reframed as
      durable — see the temporal-claims rule in the seo-aeo skill's "Hard-won rules (2026-07)"
      and prefer facts-dossier wording.
- [ ] **Correction sweeps are whole-file.** When fixing any factual error, grep the WHOLE file for
      every instance of the claim (excerpt, Key Takeaways, body, tables, FAQ, Sources) — never
      fix only the reported line numbers. Update the source LABEL whenever its URL changes.
- [ ] **"managed service" self-label reword reads naturally.** The gate WARNs; the self-label is
      "AI-native nurse scheduling service" (category/comparison/title use of "managed service" is
      fine). After fixing a flagged line, confirm the sentence still reads well.

## Content judgment

- [ ] Every stat/regulatory claim hyperlinks to a primary source using **facts-dossier wording and
      URLs** where an entry exists. Canonical URL choices (eCFR/LII for CFR, DOL Fact Sheet #54,
      HHSC not DSHS, TWC for Texas Payday Law, HRSA, ANA, AONL, Flex Monitoring Team) live in the
      dossier — new facts get verified and ADDED there in the same session. Compliance posts:
      every penalty, deadline, percentage, dollar figure, or "N periods" claim is hyperlinked to a
      primary source or explicitly estimate-framed.
- [ ] **Worked math is honest and labeled (P0).** Do the arithmetic for the reader AND state the
      assumption, labeled illustrative: "at a $50/hr loaded rate ... an illustrative figure at the
      stated rate, not a customer result." Never present a number as a customer outcome.
- [ ] **Every data visualization cites a primary source** — if frequency/ranking data was not
      derived from a named survey or dataset, remove the visual and replace with sourced text.
      "Inferred from product review themes" is not a source.
- [ ] FAQ section present (minimum 3 Q&As). **BOFU/comparison/long posts:** cluster into 2-4
      themed groups (Basics, Compliance, Pricing, vs-competitors) with 2-4 Q&As each; short
      glossary posts keep a flat 3-5 list.
- [ ] **"What to Do This Week" section** (5 numbered concrete actions) before the FAQ — required
      on BOFU, comparison, and operational guides; optional on glossary posts. The single CTA box
      sits after it.
- [ ] **"How to Evaluate a [Vendor/Category]" section (comparison/buyer posts, P1):** dedicated H2
      with 5-7 explained, numbered criteria, self-contained and independently citable.
- [ ] **Use-case cheat sheet (comparison/buyer posts, P1):** scannable list/table mapping
      scenario -> recommended fit -> one-line why, by hospital profile or bed-size; formatted for
      extraction, not buried in cards.
- [ ] **Founder role consistent**: bio says "co-founder" only if `/about` reflects both founders
      or the booking team is framed as "our team"; otherwise "founder".
- [ ] **"Texas" geographic framing**: posts describing the SimpleScheduleAI service include
      "Texas Critical Access Hospitals" at least once; pure operational guides may omit it.
- [ ] **Pricing line is consistent** — canonical wording (matches live /pricing): `**Cost:** Flat
      monthly price by roster size: $1,000/month for up to 20 nurses, $1,500/month for 21 to 40
      nurses. No per-nurse fees, no setup fees.` Table short form: `$1,000 to $1,500/mo flat`.
      Never "Contact for current rates" or "starts at $X".
- [ ] **8-and-80 nuance on flagged lines**: the gate blocks SSAI-attributed 8-and-80 claims;
      educational descriptions, "ask the vendor" questions, and competitor lines stay untouched.
      When 8-and-80 ships, the rule reverses (see commit eeefa9f for the softening pattern).

## Structure judgment

- [ ] **Key Takeaways re-read AFTER all body edits** — KT language must match the body framing
      exactly. If body says "not documented on product page," KTs cannot say "no X"/"lacks X".
      Re-check KTs last, not first. Same rule for the excerpt.
- [ ] **No structural AI-tells** (tropes.fyi catalog, adopted 2026-06-12). Sentence/paragraph
      patterns a grep can only candidate-flag; each needs a human read:
  - **Negative parallelism:** "It's not X, it's Y" / "Not X. Not Y. Just Z." — zero instances
  - **Self-posed rhetorical question + answer:** "The result? A schedule that..." — zero instances
  - **Anaphora abuse:** 3+ consecutive sentences opening with the same word/phrase — rewrite
  - **Tricolon abuse:** more than one rule-of-three list-sentence per section — vary rhythm
  - **Vague attributions:** "experts say", "studies show" without a named, linked source — banned
    for ALL claims, not just stats
  - **Dead metaphor repetition:** the same metaphor used 3+ times in one post — keep once
  - **"Despite its challenges..." dismissal formula** in competitor Key Limitations — banned;
    limitations stand on their own
  - **Signposted conclusions:** no "In conclusion/In summary/To wrap up" openers anywhere
  - **Invented concept labels:** no coined compound terms presented as established ("the coverage
    spiral") unless the post explicitly owns the coinage
  - **NOT banned (deliberate AEO choices, keep):** bold-first KT bullets, question-form H2s with
    answer capsules, word-count floors by post type (decision: Pradeep, 2026-06-12)
- [ ] **TOC uses bulleted list format** (`-`), never numbered; TOC lists the question-H2 spine +
      What to Do + FAQ, nothing else (no Sources, bio, or disclaimers).
- [ ] Word count matches post type (gate WARNs; human decides whether the deviation is justified):
      BOFU 3,000-5,000 | vs-service MOFU 1,500-2,500 | MOFU 1,500-2,500 | TOFU narrative
      1,000-1,500 | Glossary 600-1,000.
- [ ] Minimum visual elements: 3 for BOFU/how-to | 2 for vs-service MOFU | 1 for MOFU/TOFU | 0 for
      Glossary. All visuals are Tailwind `<div>` bar charts or `<table>` (the no-`<svg>` and
      dark-variant rules are gated).
- [ ] **Numbered Sources section present on BOFU/comparison posts** (above bio, below FAQ), each
      inline stat carrying a numbered footnote referenced in the list. Optional on glossary posts.
- [ ] **AEO capsule structure (no nested sub-questions under a question H2).** If a sub-section is
      itself an extractable answer block (a sub-question, or a profile of a distinct entity like a
      competitor product), it MUST be its own H2, not an H3 child. Each H2 is one standalone
      100-200 word capsule. When promoting H3 to H2: flatten the TOC, rewrite the title to stand
      alone, update anchors. Full rule: seo-aeo skill §2.6.1.
- [ ] **Every question-H2 stands alone as a query a person or LLM would actually type** (founder
      default, 2026-07-20). Read each H2 out of context: is it a clear, self-contained question?
      Reject (a) clever/literary headings ("Does It Fit a Single-Unit, 25-Bed Reality...?"),
      (b) an ambiguous "It/This" whose antecedent lives only in the body, and (c) compound
      double-interrogatives ("How fast does it produce X, and how?"). Rewrite to natural query
      phrasing so answer engines can match and extract the capsule; then update the TOC anchor to
      match. Example fix: → "Was It Built for a Small Hospital, or Is It Enterprise Software Scaled
      Down?" and → "How Does It Find a Qualified Callout Replacement, and How Fast?".

## Images (human judgment — an agent cannot see the render)

- [ ] **A person eyeballs the rendered hero** for relevance and tone before publish. The pool
      description does not guarantee a good visual. **Topic-match the image:** staffing post ->
      staff/team imagery; compliance/regulatory -> institutional/paperwork (a laptop/app screen on
      a PBJ/CMS post reads off-topic); NEVER clinical-procedure or patient-distress imagery.
- [ ] **Pick a different image FAMILY than topically-adjacent posts** — visually near-duplicate
      heroes (three medical-supplies flat-lays across live posts) pass the exact-ID uniqueness
      gate. The gate now WARNs on over-used families; a human confirms the chosen family is not
      already the neighborhood default. See the image-family rule in the seo-aeo skill.
- [ ] All images have descriptive alt text (not empty, not keyword-stuffed).
- [ ] Hero/featured image compressed (< 200KB ideally); converted in-body WebP each < ~100KB.

## Competitor content (load `.claude/skills/competitor-reviews.md` first — dossier before fetch)

- [ ] G2 and Capterra star ratings + review counts fetched for every competitor (separate from
      quotes; fetch ratings even when no usable quotes exist).
- [ ] Reviewer quotes are verbatim from G2/Capterra with reviewer name, role, date, source — no
      paraphrasing. Prefer quotes within 30 days; otherwise use the most recent available with
      its actual date and note it in "A Note on Sources" — never skip quotes entirely, never
      substitute volume language.
- [ ] No capability/feature claims without a verified current product page (within 30 days). No
      feature-absence assertions ("No X", "lacks Y") without BOTH a verbatim attributed reviewer
      quote AND product-page verification — otherwise "Confirm with vendor" / "Not documented on
      product page".
- [ ] Competitor names appear in neutral context only — no embedded qualitative framing; no
      "as of/Verified [date]" on no-review competitors (M7, CronShift).
- [ ] Key Limitations use blockquote format: `**Bold Title.** Intro sentence.` then
      `> "Verbatim quote."` then `> Name, Role, Date, Source`.

## Comparison tables (judgment beyond the gated class checks)

- [ ] Fully visible on a standard viewport, no horizontal scrollbar: `table-fixed` with explicit
      per-column widths + `break-words` + `text-xs sm:text-sm` + `align-top` (gate WARNs on
      missing standard classes; human confirms the render).
- [ ] **Rating cells**: `G2: X.X/5 (N reviews)<br>Capterra: Y.Y/5 (M reviews)` — labeled, stacked.
      One-source vendors show only that source; fewer than 20 reviews appends `; small sample`;
      never "N/A"/placeholder cells.
- [ ] **Competitor capability cells** never assert absence as fact ("None", "No") — use the
      verified state or `Confirm with vendor` / `Not documented`.
- [ ] **SimpleScheduleAI rating cells** use Option C: `New service; no public rating yet`.
- [ ] **No editorial verdict columns** ("CAH Fit: Good/Low" with red/green) — factual descriptors
      only. Methodology footnote appears once, not per-row.

## x-alternatives posts (BOFU — structural spine, in addition to everything above)

- [ ] TOC includes numbered sub-items under the "What Are the N Best..." parent entry.
- [ ] Intro is statement-first or problem-first — no ratings in the opening paragraph.
- [ ] `## Why Hospitals Switch Away from [Tool]?` present with H3s grouped by complaint theme and
      verbatim attributed quotes.
- [ ] `## Quick Comparison` table has "Best For" as the second column.
- [ ] Alternatives use numbered H3s with SimpleScheduleAI listed **first**; every profile
      contains: intro, Best for, Key advantages, Key limitations, Verdict, Ratings, Cost.
- [ ] `## When to Stay with [Tool]?` present with 4 bullet conditions.
- [ ] `## How SimpleScheduleAI Compares to [Tool]` table present (8 rows minimum), with the
      SimpleScheduleAI header cell styled `font-semibold text-blue-700 dark:text-blue-400`.
- [ ] `## A Note on Sources` present before FAQ with verification dates.

## ICP voice and trust signals (soft rules; every new post should pass at least 6 of 9)

_The audience is a Texas CAH Nurse Manager / DON / Administrator who is time-pressed,
vendor-skeptical, and often reading at 8 PM on a phone._

- [ ] **First 100 words include a specific scenario or number**, not category framing
      (`A nurse calls out at 2:40 AM...` > `Nurse scheduling is the process of...`).
- [ ] **Contradiction-hook opener when applicable**: two opposing realities the ICP lives, then
      the promised resolution. Skip on glossary posts.
- [ ] **No vendor-speak**: "platform", "solution", "transformation", "empower" -> plain
      operational language ("tool", "service", "process change").
- [ ] **"Not right for" disclaimer present** — required on BOFU/comparison, optional on TOFU.
- [ ] **Every operational claim has a linked primary source OR an explicit evidence frame**
      ("an estimate at a $50/hr loaded rate").
- [ ] **Mobile scan check**: first 3 H2s each have a 1-sentence quick answer immediately under the
      heading.
- [ ] **Founder credibility surfaces at least once** (Apollo Hospitals role, IIM Trichy, 30+ nurse
      manager interviews).
- [ ] **"Our Take" callout** in BOFU posts — one per post (count is gated), 50-100 words,
      immediately before "What to Do This Week".
- [ ] **No second-person sales tone in the body** — first-person plural or third-person
      operational; direct second-person only in the opener and CTAs.
- [ ] **Pre-Key-Takeaways narrative opener on BOFU/comparison posts**: 2 short paragraphs between
      frontmatter and `## Key Takeaways` (contradiction hook, then what the guide covers). Skip on
      glossary posts.

## Technical spot-checks

- [ ] `npm run build` passes locally; after build, `grep "&lt;div" dist/blog/<slug>/index.html`
      returns zero matches (Astro blank-line escape bug).
- [ ] `public/robots.txt` still allows all AI crawlers; no PHI-capturing forms or HIPAA-violating
      tracking introduced.
- [ ] **AEO citability gate:** run `/seo geo <preview URL>` after build, before push; back-edit
      flagged passages (workflow: [aeo-publish-gate.md](./aeo-publish-gate.md)). Most-likely
      flagged: the "How SimpleScheduleAI helps" block.

## Pre-publish proofreading agent (final gate)

The operational flow — including the post-type reference matrix (which 3 canonical posts to diff
against) and the manifest fields each verdict must set — lives in
`.claude/skills/publish-pipeline.md`. This checklist is the judgment catalog that agent runs.

Spawn `feature-dev:code-reviewer` with: (1) run `npm run check-blog` and `npm run check-links`
and report output verbatim — every hard failure is a blocker regardless of instructions to be
lenient; (2) structurally diff the draft against the 3 same-type canonical posts per the
pipeline skill's reference matrix, flagging any deviation from established conventions EVEN IF
this checklist is silent on it; (3) run every judgment item in this checklist, grep-quoting the
offending text — no eyeballing. If a subagent trimmed/rewrote the post, ground-truth the change
via `git diff --stat` + word-count delta, never its self-report. Return a pass/fail table with
line numbers and a READY-TO-PUBLISH / NEEDS-FIXES verdict; the main agent applies fixes and
re-runs. Only the founder authorizes the `draft: false` flip, on explicit instruction.

## After publishing

- [ ] Submit URL to Google Search Console -> URL Inspection -> Request Indexing; after deploy run
      `npm run indexnow` (ChatGPT Search and Copilot lean on the Bing index).
- [ ] Query the target keyword in Perplexity and ChatGPT to baseline AI visibility; add to the
      AEO tracking spreadsheet (monthly cadence).
- [ ] **Weekly money-lane citation check** (adopted 2026-06-12): run the ChatGPT scraper on the 3
      money queries (best-for-CAH, managed-vs-software, no-IT-department); record cited domains in
      `docs/seo/aeo-tracking.md`; a newly-cited vendor goes into the dossier within the week.
- [ ] Post excerpt + link on LinkedIn company page; update AI Share of Voice tracking if this
      targets a monitored query.
- [ ] **Drift baseline (new pillars/guides only):** `/seo drift baseline <live URL>` so weekly
      drift-compare surfaces silent regressions.
- [ ] **Inbound links wired**: >= 2 natural in-prose keyword-anchor links from LIVE sibling posts
      (gated via `publish-gate` + corpus-mode WARN; the judgment part is that the anchors read
      naturally, not bolted-on "Related" lists).
- [ ] **Internal tool surfacing**: link `/roi` from pricing/ROI/time-cost sections; link
      `[interactive simulator](/simulator)` from AI-scheduling, callout, comparison, and buyer
      posts as a natural "watch it build a schedule live" invitation; skip only tightly-scoped
      glossary posts.
