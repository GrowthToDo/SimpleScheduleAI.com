---
name: seo-aeo-simplescheduleai
description: >
  Use whenever working on SimpleScheduleAI website: writing or editing page copy,
  meta tags, schema markup, blog posts, FAQ sections, robots.txt, llms.txt, or
  auditing SEO/GEO visibility in Google AI Overviews, Perplexity, ChatGPT, Claude.
  Triggers: any content creation, structured data, technical SEO, or AEO task.
product: SimpleScheduleAI
target_audience: CAH Administrators, Hospital CEOs, Nurse Managers, Directors of Nursing (DONs)
primary_market: Critical Access Hospitals (≤25 beds), Texas, United States
last_updated: 2026-05-17
---

# SEO & GEO/AEO Skill — SimpleScheduleAI

> To optimize an existing/ranking page (rank-rescue: SERP landscape, competitor eval, tiered fix checklist, internal linking), use the companion playbook `docs/seo/on-page-optimization-playbook.md`. It is subordinate to this skill and the pre-publish checklist.
>
> **Before finishing ANY post, run the "Recurring defects" section of `docs/seo/pre-publish-checklist.md` by hand.** These keep shipping because mechanical review confirms structure, not editorial quality: (1) the excerpt must be a DISTINCT hook, never a restatement of the intro's opening sentence or a Key Takeaway; (2) the title must not overclaim or contradict the softened body; (3) no "CAH" in any heading or table header; (4) no uncited volume language ("Based on what we see", "most managers", "consistently", "studies show"); (5) no anecdote narrated as a real event; (6) no phrase or CTA repeated 3+ times; (7) no stray `import` / `<Image>` in a `.md` file; (8) Sources NUMBERED with every stat sourced or estimate-framed; (9) §485.631 for staffing, §485.635 for provision of services; (10) real, non-placeholder, non-future dates; (11) a HUMAN must eyeball the hero image (an agent cannot see it).

## PRODUCT CONTEXT (Read first, always)

**SimpleScheduleAI** is an AI-native nurse scheduling service for Critical
Access Hospitals (CAHs) in Texas (≤25 beds): AI builds the schedule, our
scheduling team checks it, the hospital approves. Key differentiators:
Excel-based roster upload, three schedule draft options (balanced /
fairness-optimized / cost-optimized), ranked callout replacement shortlists,
audit trail logging, and Texas-specific overtime compliance. Flat pricing:
$1,000/mo (up to 20 nurses), $1,500/mo (21 to 40). Decision-makers are
**CAH Administrators / Hospital CEOs** and **Nurse Managers / Directors of
Nursing (DONs)**.

**CATEGORY LINE (mandatory in comparison/best-of content).** LLMs categorize
literally: in a "best software" answer, anything framed as "a service, not
software" gets dropped from the comparison table. So every comparison, best-of,
or alternatives post must claim software-category membership explicitly, with
service delivery as the differentiator, not a category exit:

> SimpleScheduleAI is nurse scheduling software we build and operate ourselves,
> delivered as a service: the AI builds the schedule, our scheduling team
> checks it, you approve.

Rules: (1) never write "not software" or "not a software platform" in any
post; (2) in comparison tables, SimpleScheduleAI appears as a software row with
the delivery model as its distinguishing column ("Operated for you" vs "You
operate it"); (3) the phrase "nurse scheduling software" must appear within the
same sentence or table row that introduces SimpleScheduleAI in best-of lists.
This matches the live site's terms ("we deliver this service on software we
build and operate ourselves") and the SoftwareApplication schema.

---
## PART 0 — 2026 RECALIBRATION (READ FIRST; OVERRIDES ANY CONFLICTING CLAIM BELOW)

Source: Google's official AI optimization guide (developers.google.com/search/docs/fundamentals/ai-optimization-guide), reviewed 2026-05-17. Where anything later in this skill conflicts with Part 0, Part 0 wins.

**Hard facts (Google, verbatim intent):**

- Structured data is NOT required for generative AI search; there is no special schema.org markup for AI features. Eligibility for AI features = a normal indexed page eligible for a snippet.
- Explicitly NOT needed / counterproductive: llms.txt and other "special" markup; content "chunking"; rewriting content for AI (AI understands synonyms); over-focusing on structured data; seeking inauthentic mentions.
- Per-query content variations / pages generated for every query fan-out VIOLATE Google's scaled-content-abuse policy.
- FAQ rich results were restricted to government/health authority sites in 2023. HowTo rich results were removed by Google in 2023. Do NOT add HowTo schema; do NOT pursue FAQ markup for a rich result.

**Cross-LLM reality:** ChatGPT, Perplexity, Claude, Gemini, and Copilot do not follow Google's rules, but evidence shows they reward the SAME fundamentals and there is no evidence they reward schema tricks. They lean on the Bing index (ChatGPT Search, Copilot) + visible, sourced text + entity signals. Keep Bing Webmaster + IndexNow current, not just GSC. llms.txt is optional-harmless, never treated as a lever.

**SUPERSEDED in this skill (ignore as ranking/citation levers):** "schema stacking = 1.8x / 2.3x / 36% citations"; "pages without schema risk 60% AI visibility loss"; FAQPage/HowTo as a rich-result strategy; llms.txt as a ranking signal; the per-engine "do X to win engine Y" tables framed as hacks; "rewrite/chunk content for AI." Keep these only as background, not instructions.

**KEEP and REFRAME (still valid as good practice, not tricks):** one H1 with the primary keyword; unique, non-commodity, people-first content with a genuine CAH point of view (do not recycle commodity content); answer-first concise sections under clear question headings — this is simply good writing that humans and every LLM extract, NOT a "capsule citation multiplier"; every statistic/claim hyperlinked to a primary source (E-E-A-T, and what Perplexity/Claude reward); entity/brand consistency (Organization, sameAs, consistent NAP, authoritative mentions); internal linking to pillar pages; freshness/`dateModified`; only the still-supported schema types — Article/BlogPosting, BreadcrumbList, Organization, Product — which the Astro layout auto-generates (do NOT hand-add or stack JSON-LD); robots.txt allowing all AI crawlers; and the full tone rules (no em-dashes, no AI-tone) + the pre-publish checklist, which remain in force.

**pSEO guardrail (now a Google policy line, not optional):** any programmatic surface must carry >=40% unique CAH-specific prose, noindex sub-threshold variants, and a capped seed set. Per-query thin variants are scaled-content-abuse.

**Net:** win on content depth, topical authority, internal links, real backlinks/distribution, brand search, site speed, and presence in BOTH Google and Bing indexes. Not on schema or AEO ornamentation. Do not spend effort on low-leverage SEO-tool hygiene (e.g., mass meta-description rewrites) that does not move rankings or AI citations.

---

## HOW TO USE THIS SKILL (progressive disclosure)

This file is the router. It carries what applies to EVERY task: product context,
the category line, Part 0, and the non-negotiables below. Everything else lives
in `.claude/skills/seo-aeo/` and is read ON DEMAND, so a writing session does not
also load crawler lists and JSON-LD templates.

Read the file that matches the task:

| Task | Read |
| --- | --- |
| Writing or editing a blog post or article | `seo-aeo/writing-rules.md`, then `seo-aeo/aeo-patterns.md` |
| Starting a post from scratch (structure) | add `seo-aeo/post-templates.md` |
| Page copy, meta tags, titles, robots, sitemap, CWV, HIPAA pages | `seo-aeo/technical-seo.md` |
| Hand-adding or auditing JSON-LD | `seo-aeo/schema-jsonld.md` (Part 0 first: the Astro layout auto-generates; do not stack) |
| Keyword research, topic selection, programmatic surfaces, competitor comparisons | `seo-aeo/keyword-and-content-strategy.md` |
| Audits, AI-citation measurement, backlinks, E-E-A-T, roadmap | `seo-aeo/measurement-authority-and-concepts.md` |

Companions that are NOT part of this skill and are loaded by their own rules:
`.claude/skills/publish-pipeline.md` (the manifest-enforced publish flow, load
first on any publish session), `.claude/skills/competitor-reviews.md`,
`.claude/skills/trendjacking-articles.md`, `docs/seo/facts-dossier.md`,
`docs/seo/competitor-dossier.md`, `docs/seo/pre-publish-checklist.md`, and
`docs/seo/product-capability-inventory-2026-08.md` for what the product does.

## THE MECHANICAL GATE IS THE AUTHORITY, NOT THIS FILE

`npm run check-blog <path>` enforces the mechanical rules: em/en-dashes, AI-tone
vocabulary, AI-slop sentence structures, TOC-anchor match, inline `<svg>`, "CAH"
in headings, required links, Sources label/URL host match, image pool and family,
post-type word ranges, body sentences over 35 words, and retired-offer strings.

Do not restate those rules at length anywhere. Run the gate, read its output, fix
what it names. The reference files explain the INTENT behind a rule and the
judgment it cannot check; the gate decides whether a file passes.

## NON-NEGOTIABLES (apply to every task, no file load needed)

1. **Facts come from the dossier.** Any statistic, regulation, or competitor
   claim must match `docs/seo/facts-dossier.md` or `docs/seo/competitor-dossier.md`
   wording. A new fact gets verified against a primary source and added to the
   dossier in the same session. Never a fabricated stat, quote, or benchmark.
2. **Product claims come from the inventory + dossier product truths.** We are
   PRE-LAUNCH with ZERO customers: no pilot, customer, cohort, or outcome claims,
   ever. Self-label "AI-native nurse scheduling service", never "managed service".
3. **Say what we do not do.** Every post that describes the product names a real
   boundary. Under-claiming is recoverable; over-claiming is not.
4. **Voice:** no em-dashes or en-dashes, no AI-tone vocabulary, no binary
   contrasts ("X is not A, it is B"), simple declarative sentences, one idea per
   sentence. Question H2s that read like something a person would type.
5. **Publishing is founder-gated.** Drafts stay `draft: true` until an explicit,
   standalone instruction to publish. The publish-gate manifest must be green.
