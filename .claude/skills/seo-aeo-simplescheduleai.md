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

## PART 1 — CONCEPTS (UNDERSTAND BEFORE ACTING)

### 1.1 SEO vs AEO/GEO in 2026

**SEO** = making pages discoverable and rankable in Google's blue-link results.
Governed by crawlability, E-E-A-T, helpful content, Core Web Vitals, and
on-page signals.

**AEO/GEO** (Answer Engine / Generative Engine Optimization) = making content
the source that AI systems (Google AI Overviews, Perplexity, ChatGPT, Claude,
Gemini) choose to cite when generating synthesized answers. GEO targets
retrieval-augmented generation (RAG) pipelines, not keyword rankings.

AI engines favor:

- Content crawlable by Googlebot and all AI crawlers (see Part 2.1)
- Concise, extractable answer blocks (40–70 words under a question-style heading)
- Accurate, complete JSON-LD (auto-injected: Article + BreadcrumbList + conditional FAQPage; never hand-add or stack).
- Strong entity signals (Organization, Product, Author with sameAs links)
- Fresh, well-sourced, clearly attributed facts
- Brand mentions across multiple authoritative platforms

**YMYL consideration**: Healthcare staffing affects patient safety, nurse
well-being, and hospital finances. This puts SimpleScheduleAI near YMYL
(Your Money or Your Life) territory. Every page must show real expertise,
real authors, and credible sources.

### 1.2 Why AI Citation Position Is Everything

In traditional SEO, position #1 captured ~30% of clicks. In AI search,
concentration is far more extreme:

| AI Citation Position | Share of User Clicks |
| -------------------- | -------------------- |
| 1st cited source     | 43%                  |
| 2nd cited source     | 28%                  |
| 3rd cited source     | 15%                  |
| 4th+ cited sources   | < 5% each            |

AI-referred sessions are growing rapidly, and ChatGPT drives the large majority
of AI referral traffic. Being cited 3rd is nearly worthless. Every content
decision must optimize for being the FIRST cited source, not just appearing
somewhere. (Treat any specific growth or share figure as directional unless you
can hyperlink a primary source.)

### 1.3 AI Ranking Factor Weights (2026)

| Ranking Factor                       | Weight | What it means for SimpleScheduleAI                                                                                                                                                           |
| ------------------------------------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entity Recognition & Knowledge Graph | 20%    | Build Crunchbase, LinkedIn, G2, Capterra profiles. Brand mentions correlate more strongly with AI visibility than backlinks.                                                                 |
| Schema Markup Completeness           | 18%    | Complete, accurate JSON-LD on every page, auto-injected by the Astro layout (Article + BreadcrumbList + conditional FAQPage). Do not stack or hand-add; do not chase FAQ/HowTo rich results. |
| Content Structure & Answerability    | 17%    | Question-format headings + 40–70 word answer blocks (Content Capsule Technique).                                                                                                             |
| E-E-A-T Signals                      | 15%    | Author credentials, external citations, verifiable claims. Healthcare = high bar.                                                                                                            |
| Content Freshness & Update Frequency | 12%    | Fresher content tends to be cited more often in AI engines. Publish ≥2 pieces/week.                                                                                                          |
| Semantic Depth & Comprehensiveness   | 10%    | Anticipate follow-up questions. Cover adjacent topics (compliance, burnout, callouts).                                                                                                       |
| User Engagement Signals              | 5%     | CTR and dwell time on traditional search indirectly inform AI confidence.                                                                                                                    |
| Backlink Profile                     | 3%     | Still foundational, but semantic relevance now outweighs raw volume.                                                                                                                         |

### 1.4 Per-Engine Optimization (Enhanced — 2026 Research)

Each AI engine has a distinct retrieval architecture. Optimize for all four:

| Engine                            | Favors                                                                                                           | Citation Style                                 | Key Action                                                                                   |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **ChatGPT** (87% of AI referrals) | 120–180 word sections, balanced pros/cons, follow-up Q coverage, encyclopedic depth                              | Footnote superscripts at end                   | Long-form pillar content; never one-sided; always acknowledge tradeoffs                      |
| **Perplexity**                    | Factual density, explicit source-backed claims with hyperlinks, recency, structured pages                        | Numbered inline [n], research-paper style      | Every stat/claim must hyperlink to a primary source; vague claims = ignored                  |
| **Gemini**                        | Standard Google SEO signals, Core Web Vitals, localized signals, technical SEO                                   | Inherited Google ranking                       | Traditional SEO cannot be skipped; Gemini inherits Google's ranking system                   |
| **Claude**                        | Multi-source verified content, objective analysis, balanced perspectives, explicit acknowledgment of limitations | Cited when asked; handles 5,000+ word passages | Include "not right for" section in product pages; counter-intuitive honesty = citation boost |

**Copilot** (Microsoft): Favors diversity of source types and methodology depth.
**Google AI Overviews**: Only 11% of domains are cited by both ChatGPT and Google AI Overviews for the same query — track separately.

---

## PART 2 — TECHNICAL SEO CHECKLIST

### 2.1 Robots & Crawlability (Full AI Crawler List — 2026)

```
# Correct robots.txt for SimpleScheduleAI
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

# OpenAI
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

# Anthropic
User-agent: ClaudeBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: Claude-SearchBot
Allow: /

# Perplexity
User-agent: PerplexityBot
Allow: /

# Google AI training
User-agent: Google-Extended
Allow: /

# Apple AI
User-agent: Applebot-Extended
Allow: /

# Common Crawl (feeds most LLM training data)
User-agent: CCBot
Allow: /

# ByteDance / TikTok
User-agent: Bytespider
Allow: /

User-agent: TikTokSpider
Allow: /

# Cohere
User-agent: cohere-ai
Allow: /

# AI2 (Allen Institute)
User-agent: AI2Bot
Allow: /

Sitemap: https://simplescheduleai.com/sitemap-index.xml
```

**NEVER** add `Disallow: /` for AI crawlers. Blocking ANY of these removes
SimpleScheduleAI from LLM training data and citation pools. GPTBot traffic
grew from 5% to 30% of bot traffic between May 2024 and May 2025.

### 2.2 XML Sitemap

Include ALL indexable marketing pages and blog posts. Exclude: thank-you pages,
admin pages, duplicate/parameterized URLs.

Update the sitemap and resubmit to Google Search Console whenever a new page
is published.

### 2.3 URL Structure Rules

| ✅ DO                                  | ❌ DON'T                   |
| -------------------------------------- | -------------------------- |
| `/nurse-scheduling-software`           | `/page?id=12`              |
| `/critical-access-hospital-scheduling` | `/p1`                      |
| `/blog/nurse-callout-coverage-tips`    | `/blog/post-3`             |
| `/roi-calculator`                      | `/calculator.php?type=roi` |

Rules: lowercase, hyphens (not underscores), keyword-bearing, under 60 chars. No numbers in slugs — use keywords/phrases only (e.g., `healthcare-scheduling-crisis` not `1-healthcare-scheduling-crisis`).

### 2.4 Core Web Vitals Targets

| Metric | Target  | Fix                                               |
| ------ | ------- | ------------------------------------------------- |
| LCP    | < 2.5s  | Compress hero image, preload fonts, use WebP/AVIF |
| INP    | < 200ms | Reduce JS bundle, defer non-critical scripts      |
| CLS    | < 0.1   | Set explicit width/height on all images           |

**Critical rule**: H1, value proposition text, and CTA must be in server-rendered
HTML — NOT injected by JavaScript. AI crawlers and Googlebot may not execute JS.

### 2.5 Meta Tags Template

```html
<!-- TITLE: 50-60 chars -->
<title>Nurse Scheduling Software for Critical Access Hospitals | SimpleScheduleAI</title>

<!-- META DESCRIPTION: 140-160 chars -->
<meta
  name="description"
  content="AI-powered nurse scheduling for critical access hospitals. Reduce overtime, handle callouts instantly, stay Texas-compliant. Built for CAH nurse managers."
/>

<link rel="canonical" href="https://simplescheduleai.com/nurse-scheduling-software" />

<meta property="og:type" content="website" />
<meta property="og:title" content="Nurse Scheduling Software for Critical Access Hospitals | SimpleScheduleAI" />
<meta property="og:description" content="AI-powered nurse scheduling built for 25-bed critical access hospitals." />
<meta property="og:image" content="https://simplescheduleai.com/images/og-nurse-scheduling.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```

**DO NOT** write the same title/description on multiple pages. Every page must
have unique meta tags.

### 2.6 HTML Heading Hierarchy

```
H1 → One per page. Contains primary keyword. States the outcome.
  H2 → Major sections. Question-format for AEO.
    H3 → Subsections. Supporting detail or secondary questions.
```

Never skip levels or use headings for visual styling.

### 2.6.1 AEO Capsule Structure (no nested sub-questions under a question H2)

If a sub-section under an H2 is itself a standalone answer block (a sub-question + its own paragraph, or a profile of a distinct entity), **promote it to its own H2**. Do not nest it as H3.

The rule:

- **H2 = one AEO capsule = one extractable answer.** Each H2 section is what an AI engine (AI Overviews, ChatGPT, Perplexity) lifts as a citation. Length target: 100-200 words of self-contained answer.
- **H3 only for true sub-detail within a single answer** — supporting bullets, examples, brief sub-points that do not stand alone.
- **A "What are the N best X" question H2 followed by N H3 product profiles is the wrong shape.** Each platform profile is a standalone answer block. Promote each to H2. Keep the parent question H2 with its intro paragraph as a list-overview capsule.
- **A "How do X and Y compare head-to-head?" H2 with H3 sub-questions for each comparison dimension is the wrong shape.** Each sub-question (implementation speed, cost, callout coverage, etc.) is a standalone answer. Promote each to H2. Rewrite the title as self-contained (e.g., "How Does Implementation Speed Compare?" only works when nested under the parent; promoted, write "How Long Does Each Model Take to Implement?" so the comparison subject is explicit).
- **Use H3 sparingly**: only for "supporting detail under a single answer" patterns (e.g., a numbered list with labels, a side-note breakout). Never for items a reader could land on directly from a SERP.

When promoting H3 → H2, also:

- Update the TOC: flatten the indentation; the promoted siblings appear at the top level alongside the former parent H2.
- Rewrite any title that depended on the parent for context to be self-contained.
- Scan the surrounding prose for back-references ("the questions above", "as discussed below") that the promotion breaks.
- Anchor slugs are auto-generated from heading text; if the title text changes, every TOC entry pointing at it must change too.

Implementation example: aladtec-vs-managed-service post — six comparison sub-questions ("How Does Implementation Speed Compare?" etc.) were nested as H3 under a parent "How Does Head-to-Head Compare?" H2. Promoted all six to H2 and rewrote each with explicit "Each Model" / "Two Models" subject. Capsule pass jumped from 0% to 58%.

---

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

### 3.2.1 SimpleScheduleAI Capability Claims (compliance-adjacent)

Every sentence that attributes a capability to SimpleScheduleAI (advantage bullets, comparison-table SSAI cells, "How SimpleScheduleAI works" sections, CTAs, FAQ answers about SSAI, SVG diagram labels of SSAI features) must match shipped reality. Compliance-adjacent claims especially: a CAH administrator may rely on them.

**Current rule: no FLSA 8-and-80 claim as an SSAI feature.** The scheduler tracks generic FLSA overtime thresholds; the 8-and-80 (80-hour/14-day) calculation method is not yet shipped.

- USE: "FLSA overtime thresholds", "FLSA overtime threshold tracking", "tracks each nurse's running hours against the applicable FLSA threshold"
- DO NOT WRITE (when attributed to SSAI): "FLSA 8-and-80 rule built in", "applies the 8-and-80 rule by default", "8-and-80 handled automatically", "Texas FLSA 8-and-80 compliance built in"
- KEEP UNTOUCHED: generic educational descriptions of the rule (with DOL source), "ask your vendor whether they support 8-and-80" evaluation questions, competitor-confirm / competitor-gap lines ("X does not document 8-and-80 — confirm with vendor"), and the dedicated educational posts on FLSA/Texas overtime

When 8-and-80 ships, this rule reverses. Update this section and revert the softened lines (commit eeefa9f softened the pattern across 19 posts; the same diff in reverse restores them).

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

## PART 4 — AEO CONTENT PATTERNS

### 4.1 The Content Capsule Technique (Primary AEO Method)

This is the single highest-impact AEO writing pattern. Apply to EVERY H2 and H3.

**The formula:**

```
[H2/H3 — phrased as a conversational question matching search intent]
[40–70 word direct, declarative answer — the "capsule"]
[Deeper explanation: 120–180 words for ChatGPT citation boost]
```

**The capsule (40–70 word block) must:**

- Start IMMEDIATELY under the question heading — zero preamble
- Be a direct, declarative answer in plain language
- Be self-contained — make sense if extracted and read in isolation
- Not begin with "I", the company name, or "This article..."
- Contain at least one verifiable, specific fact

**WRONG (traditional):**

```
H2: Modern Staffing Solutions
[Long introductory paragraph that takes 3 sentences to get to the point...]
```

**CORRECT (Content Capsule):**

```
H2: How does scheduling software reduce nurse burnout?
[Nurse scheduling software reduces burnout by distributing shift loads
equitably across staff, preventing any single nurse from repeatedly
drawing overnight or weekend assignments. Algorithms flag fatigue risk
before publishing the schedule. Optimized scheduling reduces reported
burnout symptoms by up to 23% within six months of implementation.]
[Deeper explanation: 120–180 words follows...]
```

### 4.2 Question Heading Templates

**Homepage / Product page:**

```
H2: What is AI-assisted nurse scheduling?
H2: How does SimpleScheduleAI work for critical access hospitals?
H2: How much time can nurse managers save per week?
H2: How does SimpleScheduleAI handle last-minute callouts?
H2: Is SimpleScheduleAI compliant with Texas nurse staffing regulations?
```

**Blog posts / Educational content:**

```
H2: What are the staffing requirements for critical access hospitals?
H2: How do small hospitals handle nurse callouts without agency staff?
H2: What causes nurse burnout in 25-bed hospitals — and how do you prevent it?
H2: What is the true cost of nurse overtime in a critical access hospital?
```

### 4.3 FAQ Section Template

Add to every high-intent page (homepage, product, pricing).
Mark with FAQPage schema (see Part 5.4).

**Mandatory FAQs for SimpleScheduleAI pages:**

1. How does SimpleScheduleAI handle last-minute nurse callouts?
2. Is SimpleScheduleAI compliant with Texas and federal nurse staffing regulations?
3. What does implementation look like for a 25-bed hospital?
4. How long does it take to get started?
5. What happens if a nurse declines a shift offered through the system?
6. How is our patient and staff data protected?
7. Can SimpleScheduleAI replace our existing scheduling spreadsheets?
8. What's the ROI for a critical access hospital using SimpleScheduleAI?

### 4.4 Comparison Tables for AEO

AI engines extract clearly structured comparison tables reliably.

```html
<table>
  <caption>
    Nurse Scheduling Options for Critical Access Hospitals
  </caption>
  <thead>
    <tr>
      <th>Method</th>
      <th>Time Cost</th>
      <th>Overtime Risk</th>
      <th>Callout Coverage</th>
      <th>Compliance</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Manual Spreadsheets</td>
      <td>8–12 hrs/week</td>
      <td>High</td>
      <td>Manual calls</td>
      <td>None</td>
    </tr>
    <tr>
      <td>Staffing Agency</td>
      <td>Low setup, high cost</td>
      <td>Very High</td>
      <td>24–48 hrs</td>
      <td>None</td>
    </tr>
    <tr>
      <td><strong>SimpleScheduleAI</strong></td>
      <td>1–2 hrs/week</td>
      <td>Low</td>
      <td>Instant ranked list</td>
      <td>Audit trail + TX</td>
    </tr>
  </tbody>
</table>
```

### 4.5 Source-Backed Claims Mandate

Content with unsupported claims is routinely discarded during AI generation.
Source-backed content is far more likely to be cited than unsupported content.

**RULE: Every statistic, regulatory reference, or operational claim must
hyperlink to a primary source.**

| ❌ WRONG                                         | ✅ RIGHT                                                                                                |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| "Nurse scheduling software improves efficiency"  | "Optimized nurse allocation reduces agency staffing reliance by 12% within six months [link to source]" |
| "Overtime is a major problem in small hospitals" | "CAHs spend 18–22% of labor budgets on overtime [link to HRSA rural workforce data]"                    |

**Approved primary sources:**

- CMS (cms.gov) — CAH regulations
- HRSA (hrsa.gov) — rural health workforce data
- Texas DSHS (dshs.texas.gov) — Texas nursing regulations
- American Nurses Association (nursingworld.org) — staffing standards
- AONL (aonl.org) — nursing leadership research
- Flex Monitoring Team (flexmonitoring.org) — CAH-specific data

### 4.6 ROI Data Points

Embed these throughout copy, tables, and schema:

- 12–18% operational efficiency improvement in Year 1
- 12% reduction in agency staffing reliance within 6 months
- 15–28% reduction in administrative work for nurse managers
- Up to 30% reduction in overtime costs through predictive scheduling
- Up to 25% reduction in appointment no-show rates via automated reminders

Every number is EITHER hyperlinked to a primary source ("Research shows [metric] [link]") OR framed as a transparent, labeled illustrative assumption ("at a $50/hr loaded rate, [math] - an illustrative figure, not a customer result"). SSAI is pre-launch; never attribute metrics to customers or a cohort.

### 4.7 Multimodal Content Strategy

Optional: a short explainer video embedded in a written post can add a useful
format for some readers. Treat it as a nice-to-have, not a citation lever, and
make no quantified claim about its effect.

**Content repurposing pipeline per pillar topic:**

1. Long-form written article (Content Capsule format) — word count by type:
   - BOFU comparison/best-of: 3,000–5,000 words
   - How-to / tutorial: 2,000–3,000 words
   - Problem-aware / MOFU: 1,500–2,500 words
   - Glossary (what-is-X): 600–1,000 words
2. Short YouTube explainer (3–5 min) on same topic — embed in article
3. FAQ array from article — add FAQPage schema
4. LinkedIn post summarizing key insight — links to full article

**Minimum content velocity:** 2 comprehensive pieces per week.

### 4.8 GEO Citability Scoring (2026 Research Data)

| Content Layer     | Target Word Count                                                                 | Citation Impact                                 |
| ----------------- | --------------------------------------------------------------------------------- | ----------------------------------------------- |
| Key Takeaways     | 5–6 bullets, ~100 words total                                                     | Fastest AI extraction point — placed before TOC |
| Per-Section Depth | 120–180 words                                                                     | +70% ChatGPT citations                          |
| FAQ Answers       | 50–60 words                                                                       | Self-contained, quotable                        |
| Full Article      | BOFU: 3,000–5,000 / How-to: 2,000–3,000 / MOFU: 1,500–2,500 / Glossary: 600–1,000 | Claude handles 5,000+                           |
| Fact Frequency    | 1 stat per 150–200 words                                                          | Critical for Perplexity                         |

**Note on TL;DR:** Do not use a separate TL;DR section. Key Takeaways serves both purposes; a TL;DR is redundant and adds AI-tell patterns. Key Takeaways must be placed BEFORE the TOC, not after it.

**Schema rule**: Do not stack or hand-add JSON-LD. The Astro layout auto-injects
Article + BreadcrumbList + conditional FAQPage. Keep on-page facts accurate and
let the layout handle structured data; do not chase FAQ/HowTo rich results.

**Content freshness**: stale content tends to be cited less in AI engines.
Update time-sensitive content every week or two and refresh the `dateModified`
field in your Article/BlogPosting schema.

**Evidence density rule**: Replace marketing language with specific data points
and third-party validation. AI systems are trust verification engines — vague
promotional content is discarded.

---

## PART 5 — STRUCTURED DATA (JSON-LD SCHEMA)

SUPERSEDED: schema is auto-injected (Article + BreadcrumbList + conditional FAQPage). Never hand-add or stack JSON-LD. This library is background only.

Implement ALL of these on the appropriate pages. Place JSON-LD in `<head>`.
Validate at: https://search.google.com/test/rich-results

### 5.1 Organization Schema (Global — every page)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "SimpleScheduleAI",
  "url": "https://simplescheduleai.com",
  "logo": "https://simplescheduleai.com/images/logo.png",
  "description": "AI-native nurse scheduling service for critical access hospitals in Texas.",
  "foundingDate": "2024",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "email": "hello@simplescheduleai.com"
  },
  "sameAs": ["https://www.linkedin.com/company/simplescheduleai", "https://twitter.com/simplescheduleai"]
}
```

### 5.2 SoftwareApplication Schema (How It Works / Product page)

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "SimpleScheduleAI",
  "applicationCategory": "BusinessApplication",
  "applicationSubCategory": "Healthcare Scheduling Software",
  "operatingSystem": "Web",
  "url": "https://simplescheduleai.com",
  "description": "AI-powered nurse scheduling software for critical access hospitals.",
  "audience": {
    "@type": "Audience",
    "audienceType": "Nurse Managers, Directors of Nursing, CAH Administrators"
  },
  "featureList": [
    "AI-generated nurse schedules",
    "Three draft options: balanced, fairness-optimized, cost-optimized",
    "Real-time callout replacement shortlist",
    "Excel roster upload",
    "Texas overtime compliance tracking",
    "Audit trail logging"
  ]
}
```

### 5.3 WebSite Schema (Homepage only)

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "SimpleScheduleAI",
  "url": "https://simplescheduleai.com"
}
```

### 5.4 FAQPage Schema (FAQ sections on product/home pages)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does SimpleScheduleAI handle last-minute nurse callouts?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "When a nurse calls out, SimpleScheduleAI instantly generates a ranked replacement shortlist from available, qualified staff — factoring in overtime rules, fairness, and Texas compliance. The nurse manager receives the list and can notify replacements directly, reducing coverage time from hours to minutes."
      }
    }
  ]
}
```

### 5.5 BlogPosting Schema (Every blog post)

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Post title",
  "description": "Post excerpt",
  "url": "https://simplescheduleai.com/blog/post-slug",
  "datePublished": "2026-03-01T00:00:00Z",
  "dateModified": "2026-03-15T00:00:00Z",
  "author": {
    "@type": "Person",
    "name": "Author Name",
    "jobTitle": "Co-founder, SimpleScheduleAI"
  },
  "publisher": {
    "@type": "Organization",
    "name": "SimpleScheduleAI",
    "logo": { "@type": "ImageObject", "url": "https://simplescheduleai.com/images/logo.png" }
  },
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://simplescheduleai.com/blog/post-slug" },
  "image": "https://simplescheduleai.com/images/blog/post-image.png",
  "keywords": ["nurse scheduling", "critical access hospital", "CAH staffing"]
}
```

**CRITICAL**: Keep `dateModified` current. Stale dates = AI citation penalty.

### 5.6 BreadcrumbList Schema (All inner pages)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://simplescheduleai.com" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://simplescheduleai.com/blog" },
    { "@type": "ListItem", "position": 3, "name": "Post Title", "item": "https://simplescheduleai.com/blog/post-slug" }
  ]
}
```

### 5.7 HowTo Schema (DO NOT IMPLEMENT - reference only)

Google removed HowTo rich results in 2023. Never add HowTo schema. Kept here for reference only.

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Set Up Automated Nurse Scheduling for a Critical Access Hospital",
  "description": "Step-by-step guide to implementing AI-assisted nurse scheduling at a 25-bed CAH.",
  "totalTime": "PT1W",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Upload nurse roster",
      "text": "Export roster to Excel and upload to SimpleScheduleAI."
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Configure shift rules",
      "text": "Set shift structure, Texas overtime rules, and facility constraints."
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Review three AI-generated drafts",
      "text": "Choose from balanced, fairness-optimized, or cost-optimized schedule."
    },
    {
      "@type": "HowToStep",
      "position": 4,
      "name": "Publish and distribute",
      "text": "Approve and publish; audit trail logged automatically."
    }
  ]
}
```

---

## PART 6 — KEYWORD STRATEGY

### 6.1 Keyword Tiers

**Tier 1 — High Intent, Low Volume (Priority: Highest)**

```
nurse scheduling software critical access hospital
CAH nurse scheduling software
nurse scheduling software small hospital Texas
automated nurse scheduling critical access
AI nurse scheduling software
```

**Tier 2 — Problem-Aware, Mid Funnel (Priority: High)**

```
nurse callout coverage hospital
how to reduce nurse overtime hospital
nurse scheduling burnout prevention
critical access hospital staffing challenges
nurse scheduling compliance Texas
```

**Tier 3 — Awareness / Top of Funnel (Priority: Medium)**

```
what is a critical access hospital
nurse staffing ratios Texas
how to build a nurse schedule
nurse scheduling best practices
rural hospital staffing solutions
```

**Question keywords (AEO — write FAQ and blog content around these):**

```
how do critical access hospitals manage nurse scheduling?
what software do small hospitals use for nurse scheduling?
how do nurse managers handle last-minute callouts?
what causes nurse burnout in small hospitals?
how much does nurse overtime cost a small hospital?
what are Texas staffing requirements for critical access hospitals?
can AI help with hospital nurse scheduling?
```

### 6.2 Keyword-to-Page Mapping

| Target Keyword                                     | Target Page                                             |
| -------------------------------------------------- | ------------------------------------------------------- |
| nurse scheduling software critical access hospital | `/critical-access-hospital-scheduling` (Pillar)         |
| AI nurse scheduling software                       | `/nurse-scheduling-software`                            |
| nurse callout coverage                             | `/blog/nurse-callout-coverage-tips`                     |
| reduce nurse overtime hospital                     | `/blog/reduce-nurse-overtime-critical-access-hospitals` |
| nurse scheduling compliance Texas                  | `/blog/texas-nurse-staffing-compliance`                 |
| SimpleScheduleAI                                   | `/` (Homepage)                                          |
| nurse scheduling ROI                               | `/roi`                                                  |
| nurse scheduling software                          | `/nurse-scheduling-software` (Hub)                      |
| best nurse scheduling software                     | `/nurse-scheduling-software` (Hub)                      |
| healthcare scheduling software                     | `/nurse-scheduling-software` (Hub)                      |
| medical scheduling software                        | `/nurse-scheduling-software` (Hub)                      |
| AI nurse scheduling                                | `/ai-nurse-scheduling` (Hub)                            |
| healthcare staff scheduling software               | `/critical-access-hospital-scheduling` (Hub)            |
| hospital scheduling                                | `/critical-access-hospital-scheduling` (Hub)            |
| free nurse scheduling tools                        | `/tools` (Tools index)                                  |
| nurse schedule generator free                      | `/tools/nurse-schedule-generator`                       |
| nursing overtime calculator                        | `/tools/overtime-calculator`                            |
| hospital shift schedule template                   | `/tools/shift-schedule-builder`                         |

---

## PART 7 — CONTENT STRATEGY

### 7.1 Mandatory Site Pages

| Page                                                     | Primary Keyword                                | Priority            |
| -------------------------------------------------------- | ---------------------------------------------- | ------------------- |
| Homepage `/`                                             | simplescheduleai, nurse scheduling AI          | Must-have           |
| Pillar `/critical-access-hospital-scheduling`            | nurse scheduling for critical access hospitals | Must-have           |
| Product `/nurse-scheduling-software`                     | AI nurse scheduling software                   | Must-have           |
| How It Works `/how-it-works`                             | how does AI nurse scheduling work              | Must-have           |
| ROI Calculator `/roi`                                    | nurse scheduling ROI                           | Must-have           |
| Pricing `/pricing`                                       | Flat pricing + book a call                     | Must-have           |
| About `/about`                                           | SimpleScheduleAI team, founders                | Must-have (E-E-A-T) |
| Blog Index `/blog`                                       | nurse scheduling tips                          | High                |
| Texas Compliance `/blog/texas-nurse-staffing-compliance` | Texas nurse staffing regulations               | High                |

### 7.2 Blog Topic Cluster Plan

**Pillar:** "Nurse Scheduling Software for Critical Access Hospitals"

Cluster articles (in order of priority):

1. How Critical Access Hospitals Can Reduce Nurse Overtime [Awareness]
2. The True Cost of Manual Nurse Scheduling in a 25-Bed Hospital [Awareness]
3. How to Handle Last-Minute Nurse Callouts Without Agency Staff [Awareness]
4. Nurse Scheduling Compliance in Texas: What CAH Administrators Need to Know [Awareness]
5. Spreadsheet vs Software: Nurse Scheduling Options for Small Hospitals [Consideration]
6. How AI-Assisted Scheduling Reduces Nurse Manager Burnout [Consideration]
7. ROI of Automated Nurse Scheduling for Critical Access Hospitals [Consideration]
8. SimpleScheduleAI Onboarding: What to Expect in Your First 30 Days [Decision]
9. Case Study: How [Hospital Name] Cut Overtime by X% [Decision]
10. Nurse Self-Scheduling: Pros, Cons, and When It Works in CAHs [Awareness]

### 7.3 Blog Post Structure Template

Word count by type: BOFU 3,000–5,000 / How-to 2,000–3,000 / MOFU 1,500–2,500 / Glossary 600–1,000.

**TONE RULES — strictly enforced:**

- No em-dashes (—). Use commas, colons, or rewrite the sentence.
- No AI-generated phrases: "delve into", "dive into", "it's worth noting", "in conclusion", "robust", "leverage", "game-changing", "seamless", "comprehensive solution", "transformative", "at the end of the day", "unlock", "harness".
- No `---` horizontal rules between sections — these are AI-tell patterns and visually cluttered.
- Write like a hospital operations veteran talking to a peer. Direct, plain, specific.
- No unverified claims framed as facts. Link every stat to a primary source.

**SLUG RULES:**

- Lowercase, hyphens only, keywords/phrases only.
- No numbers in slugs (e.g., `healthcare-scheduling-crisis` not `1-healthcare-scheduling-crisis`).

**For BOFU comparison posts ("Best X" posts), use this structure:**

```markdown
## Key Takeaways

[5–6 specific, actionable bullets — placed BEFORE the TOC, not in TOC]

## Table of Contents

- [How to Evaluate [Category]](#how-to-evaluate)
- [Quick Comparison: All [N] Platforms](#quick-comparison)
- [The [N] Best Options, Reviewed](#the-n-best-options)
  - [1. Tool Name](#1-tool-name)
  - [2. Tool Name](#2-tool-name)
  - ...all tools nested as sub-items...
- [Which Is Right for Your Hospital?](#which-is-right)
- [What to Do This Week](#what-to-do-this-week)
- [Frequently Asked Questions](#frequently-asked-questions)

## How to Evaluate [Category]

[Framework section: 3 evaluative criteria your product wins — primes buyer judgment]

## Quick Comparison: All [N] Platforms

[Intro line: "Here is how all N platforms compare before we go deeper:"]

[HTML comparison table — wrap in <div class="not-prose overflow-x-auto"> to prevent column cutoff]
[Columns: Platform | Best For | [Key Criterion 1] | [Key Criterion 2] | Setup Time | Cost/Month]
[Add "Best For" as second column — this is missing from most tables and adds scannability]

## The [N] Best Options, Reviewed

### 1. [Tool Name](https://tool-url.com)

<img src="/images/blog/[post-slug]/[toolname].png" alt="[Tool Name] scheduling software interface" width="1200" height="630" loading="lazy" class="rounded-lg border border-slate-200 my-4" />

[2–3 paragraph description of the tool]

**Best for:** [one-line ideal use case]

**Key advantages:**

- [advantage 1]
- [advantage 2]
- [advantage 3]

**Key limitations:**

- [limitation 1]
- [limitation 2]

**Verdict:** [2-sentence wrap-up — when to choose this, when not to]

**Cost:** [Pricing or "Pricing not listed on website. Contact for a quote."]

[Repeat for all tools — NO --- between tools]

## Which Is Right for Your Hospital?

[By bed size: Under 25 / 25-75 / 75-200 / 200+]
[SVG decision tree diagram here]

## How SimpleScheduleAI Fits in This Landscape

[Natural product mention, 100–150 words. Acknowledge one limitation honestly.]

## What to Do This Week

1. [Concrete action step — references SimpleScheduleAI or a diagnostic task]
2. [Concrete action step]
3. [Concrete action step — references SimpleScheduleAI]
4. [Concrete action step]
5. [Concrete action step — references SimpleScheduleAI]

[Styled CTA card: not-prose div with blue background, headline, subtext, button]

## Frequently Asked Questions

[4–5 FAQs — must include competitor comparison queries, e.g.:]

- "Is [Competitor A] or [Competitor B] better for a small hospital?"
- "Does [Generic Tool] work for hospital nurse scheduling?"
- "How long does [Enterprise Tool] take to implement?"
- "What is the cheapest option for a 25-bed hospital?"
  [Add FAQPage JSON-LD schema for all questions]
```

**For non-BOFU posts (How-to, MOFU, Glossary), use this structure:**

```markdown
## Key Takeaways

[5 bullets — placed BEFORE TOC]

## Table of Contents

- [The Problem](#the-problem)
- ...section links (H2 only)...
- [How SimpleScheduleAI Helps](#how-simplescheduleai-helps)
- [Frequently Asked Questions](#frequently-asked-questions)

## The Problem: [State the pain point clearly]

[200–300 words. Real data/sources.]

[DIAGRAM 1: process or pain-point visual]

## [Question H2]

[40–70 word direct answer capsule]
[120–180 word deeper explanation]

## [Second Question H2]

[40–70 word capsule]
[120–180 word explanation]

[DIAGRAM 2: comparison or flow diagram]

## [Third Question H2]

[40–70 word capsule]
[120–180 word explanation]

## How SimpleScheduleAI Helps

[Natural product mention. Acknowledge one limitation honestly.]

[DIAGRAM 3: summary or decision diagram]

[Styled CTA card]

## Frequently Asked Questions

[3–5 FAQs with FAQPage schema]
```

**Diagram rules:**

- Minimum 3 SVG diagrams for BOFU/how-to, minimum 1 for MOFU/glossary.
- No blank lines inside SVG blocks — MDX parser ends HTML blocks at blank lines.
- All SVG comments use `<!-- comment -->` not `{/* */}` in .md files.
- Every SVG must have `role="img"` and `aria-label` attributes.

**Screenshot rules (BOFU comparison posts):**

- Create folder: `public/images/blog/[post-slug]/`
- One `.png` per tool reviewed, named `[toolname].png` (all lowercase, no spaces).
- Use `<img>` HTML tag (not markdown `![]()`) so class and loading attributes can be set.
- Place immediately after H3 tool heading, before any body text.
- Alt text format: "[Tool Name] nurse scheduling software interface"

### 7.4 Glossary Page Pattern ("What is X?")

Use for definitional posts at `/blog/what-is-[term]`. These are low competition and
have high GEO citation value because AI systems prioritize canonical definitions.

**Structure:**

- Length: 600–800 words
- H1: "What Is [Term]? A Guide for Hospital Administrators" (contains keyword)
- First paragraph: self-contained 40–70 word definition (AI extracts this directly)
- H2: "How [Term] Works in a Critical Access Hospital" — CAH-specific angle
- H2: "How [Term] Differs from [Related Term]" — contrast for clarity
- H2: "Why [Term] Matters for Nurse Managers" — operational relevance
- FAQ section: 3 questions with FAQPage schema
- CTA: link to the most relevant pillar hub page

**Schema:** FAQPage + BlogPosting (auto-applied). Add `DefinedTerm` if the post
is the canonical definition page for a term.

**Keyword tip:** These pages rank for long-tail "what is" queries AND get cited
in AI Overviews for definitional queries. Publish under `/blog/` not a separate
URL since they use the same BlogPosting schema pipeline.

### 7.5 BOFU Article Templates (High Conversion Priority)

**"Best X software" variations** — each needs a distinct audience angle and comparison set. Not thin rewrites.

Target titles (write all of these):

- Best nurse scheduling software (2026)
- Best healthcare staff scheduling software
- Best nurse scheduling software for small hospitals
- Best nurse scheduling software for critical access hospitals
- Best nurse scheduling software for rural hospitals
- Best scheduling software for 25-bed hospitals

**"How to" tutorials** — step-by-step content, featured snippet targets:

- How to schedule nurses for a 25-bed hospital
- How to reduce nurse overtime in a critical access hospital
- How to handle nurse callouts without an agency
- How to build a fair nurse rotation schedule

**Word count:** BOFU best-of posts: 3,000–5,000 words. How-to tutorials: 2,000–3,000 words.

**Differentiation rule:** Each "best X" variation must cover different pain points, different buyer persona, and a different subset of competitors in the comparison table. Do not recycle the same comparison across variations.

### 7.6 Interactive Tools Page Pattern

Use for tools at `/tools/[name]`. Ungated — SEO and link magnet, not lead capture.

**Page structure:**

1. H1 with primary keyword (e.g., "Free Nurse Schedule Generator for Hospitals")
2. 150-word explainer: what the tool does, who it's for, why it's free
3. The interactive tool itself (Astro island with `client:load`)
4. H2: "How to Use the [Tool Name]" — 400 words, step-by-step
5. 3–5 FAQ with FAQPage schema
6. CTA block → `/pricing` or `/how-it-works`

**Schema:** Auto-injected (Article + BreadcrumbList + conditional FAQPage). Do
not hand-add HowTo or stack JSON-LD.

**SEO target:** "[thing] generator free", "[thing] calculator", "free [tool type]"

**Link strategy:** Ungated tools attract backlinks from nurse manager blogs, HR
publications, and hospital association resource pages. Do not gate them.

**Internal links:** Each tool page links to its closest blog post (e.g., the
overtime calculator links to the Texas overtime compliance post).

### 7.6 Content Upgrade CTA Template

For blog posts that have a companion downloadable template, add this block
immediately after the third H2 section:

```html
<div class="my-8 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 p-6">
  <p class="font-semibold text-blue-900 dark:text-blue-100">Free template</p>
  <p class="mt-1 text-blue-800 dark:text-blue-200">[Template name] — [value prop].</p>
  <a href="/resources/[template-slug]" class="mt-3 inline-block font-medium text-blue-700 dark:text-blue-300 underline">
    Download free →
  </a>
</div>
```

Only add this block to posts that have a companion template. Do not add it to
posts without a template — it will look broken.

### 7.7 Buyer Stage Framework

Map every piece of content to a buyer stage before writing. This determines
the tone, CTA, and publish priority.

| Stage             | Searcher's mindset                            | Content goal           | CTA                                   |
| ----------------- | --------------------------------------------- | ---------------------- | ------------------------------------- |
| **Awareness**     | "I have a problem I'm starting to understand" | Educate, build trust   | "Learn how it works" → /how-it-works  |
| **Consideration** | "I'm evaluating solutions"                    | Differentiate, compare | "See the ROI" → /roi or /how-it-works |
| **Decision**      | "I'm ready to try something"                  | Remove friction        | "See pricing" → /pricing              |

**Publish order rule:** On a new domain, publish Awareness content first to
build topical breadth. Then Consideration. Then Decision. Never lead a new
site with Decision-only content — it has no topical authority to stand on.

**Signs a post is Awareness:** title contains "what is", "how to", "guide",
"best practices", "challenges", explainer language.

**Signs a post is Consideration:** title contains "vs", "alternatives",
"buyer's guide", "software for", "features", comparison language.

**Signs a post is Decision:** title contains "compliance", "implementation",
"how [specific software] handles", "ROI", "case study", onboarding or pricing content.

---

## 2026-06 standards additions (worked math, grouped FAQ, evaluation section, use-case cheat sheet)

Four patterns to apply on the post types noted. Keep them honest, scannable, and extractable.

### A. Worked math (honest)

Do the arithmetic for the reader using transparent, explicitly-labeled assumptions. Never present it as a customer result (SSAI is pre-launch, no customers).

- Format: "At a $50/hr loaded rate, 8 hours/week of manual scheduling is about $400/week, roughly $20,800/year. This is an illustrative figure at the stated rate, not a customer outcome."
- Always state the assumption (rate, hours, headcount) inline, and label the result illustrative.
- Use it in any pricing, ROI, or time-cost section. If a number is not arithmetic from a stated assumption, it must hyperlink to a primary source instead.

### B. Grouped FAQ

On BOFU, comparison, and long posts, cluster the FAQ into 2 to 4 themed groups, 2 to 4 Q&As each.

- Suggested groups: Basics, Compliance, Pricing, vs-competitors. Pick the groups that fit the post.
- Use an H3 per group under the "Frequently Asked Questions" H2, with the Q&As beneath each.
- Skip grouping on short glossary or definition posts. A flat 3 to 5 Q&A list is fine there.

### C. Standalone "How to Evaluate a [Vendor/Category]" section

Every comparison and buyer-guide post gets a dedicated H2 with 5 to 7 explained, numbered criteria.

- It is independently citable: LLMs reference it even when they are not recommending us. Make it self-contained.
- Each criterion is a short numbered item with one or two sentences explaining what to look for and why it matters to a CAH.
- This replaces the older "3 criteria your product wins" framing for comparison posts: write 5 to 7 honest criteria, not a stacked-deck shortlist.

### D. Use-case cheat sheet

A scannable list mapping "scenario -> recommended fit -> one-line why", organized by hospital profile or bed size.

- Format for extraction (a flat list or a simple table), not buried inside card components.
- Example rows: "Under 25 beds, no IT staff -> operated-for-you scheduling -> the team builds and checks the schedule, you approve"; "25 to 75 beds, has an IT lead -> self-serve software -> in-house owner can run a platform".
- One line per scenario. Keep the "why" concrete and specific to the profile.

---

## PART 8 — E-E-A-T IMPLEMENTATION

### 8.1 Mandatory E-E-A-T Elements

**Author byline on ALL blog posts** uses the canonical italic-linked format at the END of the post (never the old `**Written by**` block, which the pre-publish checklist bans):

```md
_[Pradeep Pandey](/about/pradeep-pandey) is the co-founder of SimpleScheduleAI, an AI-native nurse scheduling service built for Critical Access Hospitals in Texas. He serves as Deputy General Manager of Operations at Apollo Hospitals and holds an MBA from IIM Trichy._

[LinkedIn →](https://www.linkedin.com/in/pradeep-pandeyji/)
```

**Trust signals to add site-wide:**

- HIPAA data handling statement: "SimpleScheduleAI does not store patient data. Scheduling data is encrypted at rest (AES-256) and in transit (TLS 1.3)."
- Contact info in footer (email minimum)
- Privacy policy and terms of service pages
- SSL/HTTPS on all pages

### 8.2 Source Citation Rules

- Always link to primary source (CMS, Texas DSHS, ANA, HRSA, peer-reviewed studies)
- Format: "According to CMS guidelines for Critical Access Hospitals..."
- Do NOT make regulatory or safety claims without a source link
- If a stat is older than 2 years, find a newer source or note the date

---

## PART 9 — OFF-PAGE & AUTHORITY BUILDING

### 9.1 Priority Link Building Targets

**Tier 1:**

- National Rural Health Association (nrha.org)
- Texas Organization of Rural and Community Hospitals (torchnet.org)
- Flex Monitoring Team (flexmonitoring.org)
- AONL (aonl.org)

**Tier 2:**

- Becker's Hospital Review, HealthLeaders Media, Fierce Healthcare
- G2, Capterra, Software Advice listings

### 9.2 Entity Presence Checklist

- [ ] LinkedIn Company Page active
- [ ] Crunchbase listing with description and founders
- [ ] G2 listing (even with no reviews)
- [ ] Capterra listing
- [ ] AngelList / Wellfound profile
- [ ] ProductHunt launch

### 9.3 Brand & Entity Monitoring (GEO Signal — 2026)

**Brand mentions correlate more strongly with AI visibility than backlinks.**
AI knowledge graphs recognize entities by consistent appearance across sources.
Time-to-citation (speed at which content gets cited after publication) is an
emerging signal.

**Track SimpleScheduleAI mentions monthly across:**

- LinkedIn (posts, comments, company page)
- Reddit (r/nursing, r/healthcareit, r/hospitaladministration)
- Capterra, G2, Software Advice (reviews + mentions)
- Google AI Overviews (manual search for target queries)
- Perplexity (manual check for target queries)
- ChatGPT with browsing (manual check)

**AI Share of Voice** = % of AI-generated answers in niche that cite SimpleScheduleAI.
This is the primary KPI for GEO success — track monthly in the AEO tracking spreadsheet.

---

## PART 10 — AEO MEASUREMENT & TRACKING

### 10.1 Core Query Set to Monitor

**Check weekly:**

- "nurse scheduling software for critical access hospitals"
- "AI nurse scheduling software small hospital"
- "CAH nurse scheduling tool"

**Check monthly:**

- "how to reduce nurse overtime critical access hospital"
- "nurse callout coverage hospital software"
- "best nurse scheduling software 25 bed hospital"
- "Texas nurse staffing compliance software"

**Check quarterly:**

- "what is assisted nurse scheduling"
- "nurse scheduling burnout prevention"
- "hospital nurse schedule automation"

### 10.2 AEO Tracking Spreadsheet

| Date | Query | Engine | SimpleScheduleAI cited? | Position/context | Competing brands | Action taken |
| ---- | ----- | ------ | ----------------------- | ---------------- | ---------------- | ------------ |

Check: Google AI Overviews, Perplexity, ChatGPT with browsing, Claude.

### 10.3 Tools

| Tool                     | Purpose                              | Cost           |
| ------------------------ | ------------------------------------ | -------------- |
| Google Search Console    | Track impressions, clicks, positions | Free           |
| Google Rich Results Test | Validate schema markup               | Free           |
| Screaming Frog           | Technical crawl audits               | Free ≤500 URLs |
| PageSpeed Insights       | Core Web Vitals testing              | Free           |
| Perplexity.ai            | Manual AEO citation checks           | Free           |
| Ahrefs / Semrush         | Keyword tracking, backlinks          | Paid           |

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

## PART 12 — PHASE-BY-PHASE IMPLEMENTATION ROADMAP

### Phase 1: Technical Foundation ✅ COMPLETED

- [x] robots.txt — 14+ AI crawler allowlist
- [x] llms.txt — AI-readable site summary
- [x] SchemaOrg.astro — reusable JSON-LD component
- [x] Organization schema — global (every page)
- [x] WebSite + FAQPage schemas — homepage
- [x] Schema auto-injected by Astro layout: Article + BreadcrumbList + conditional FAQPage (never hand-add or stack; no HowTo)
- [x] BlogPosting + BreadcrumbList schemas — all blog posts
- [ ] Google Search Console setup + sitemap submission
- [ ] Core Web Vitals audit (PageSpeed Insights)

### Phase 2: Content & AEO — IN PROGRESS

See `docs/superpowers/plans/` for execution plans.

**Phase 2A (Hubs + Infrastructure):**

- [ ] Update SEO/GEO skill with evergreen patterns
- [ ] Create pillar page: `/nurse-scheduling-software`
- [ ] Create pillar page: `/critical-access-hospital-scheduling`
- [x] Create pillar page: `/ai-nurse-scheduling` (replaced retired `/healthcare-staff-scheduling`, now 301 to `/nurse-scheduling-software`)
- [ ] Create G2 + Capterra + Crunchbase profiles

**Phase 2B (Blog + Glossary):**

- [ ] 35 blog posts (hub spokes) — see Plan 2
- [ ] 8 glossary pages — see Plan 2
- [ ] 1 original data post — see Plan 2

**Phase 2C (Tools + Templates):**

- [ ] 4 interactive tools + tools index — see Plan 3
- [ ] 5 downloadable templates + landing pages — see Plan 4

### Phase 3: Programmatic SEO (after 20+ posts indexed)

- [ ] 5 location pages (`/nurse-scheduling-software/[state]`)
- [ ] 4 persona pages (`/nurse-scheduling-for/[audience]`)
- [ ] Competitor pages (`/vs/`, `/alternatives/`, `/compare/`)
- [ ] Best-of roundup (`/best-nurse-scheduling-software`)

---

## PART 13 — PROGRAMMATIC SEO PATTERNS

Deploy pSEO pages only after Phase 1 content (20+ posts) is indexed and domain
has initial authority. Thin pSEO from a new domain risks deindexing.

### 13.1 Location Page Pattern

URL: `/nurse-scheduling-software/[state]`

Every page MUST have genuinely unique content for that state. Never just swap
the state name in identical copy — Google will deindex thin location pages.

**Unique content per page must include:**

- State-specific CAH count (from HRSA Flex Program data)
- State nursing board overtime regulations (link to state health dept)
- Rural nursing workforce stats for that state
- Any state-specific grant programs or rural health initiatives

**Structure:**

- H1: "Nurse Scheduling Software for [State] Critical Access Hospitals"
- 150-word intro: why [state] CAHs face specific scheduling challenges
- H2: "[State] Critical Access Hospital Regulations" — unique regulatory content
- H2: "Nurse Scheduling Challenges in Rural [State]" — state-specific data
- H2: "How SimpleScheduleAI Helps [State] CAHs" — product section
- FAQ: 3–5 questions (FAQPage schema)
- CTA → /pricing

**Schema:** Article + FAQPage

### 13.2 Persona Page Pattern

URL: `/nurse-scheduling-for-[audience]`

Not a reskin of the homepage. Each page must address that audience's specific
pain points, language, and decision criteria.

| Audience slug             | Their primary pain point        | Different CTA angle           |
| ------------------------- | ------------------------------- | ----------------------------- |
| critical-access-hospitals | Compliance + overtime cost      | "Built specifically for CAHs" |
| small-hospitals           | Admin burden, no IT department  | "No IT required, 3-day setup" |
| rural-hospitals           | Coverage gaps, no agency access | "Fill gaps without agencies"  |
| nurse-managers            | Time spent on scheduling        | "Save 8 hours/week"           |

**Schema:** Article + FAQPage

### 13.3 Competitor Page Patterns

Four formats. All require competitor research first (sign up, document features,
fetch live G2/Capterra quotes via `.claude/skills/competitor-reviews.md`). Minimum competitor research before writing: load the skill and run WebSearch queries until you have 3–5 verbatim quotes per competitor with full attribution.

**Honesty rule:** Acknowledge competitor strengths explicitly. Biased comparisons
are penalized by AI citation systems and lose trust with evaluating buyers.
Include "best for" and "not best for" for BOTH products.

**Format A — You vs Competitor** (`/vs/[competitor]`):

- H1: "SimpleScheduleAI vs [Competitor]: Which Is Right for Your Hospital?"
- Answer capsule: 2-3 sentence honest summary of key differences
- Comparison table: Features, Pricing, Support, CAH-specific fit
- "Who SimpleScheduleAI is best for" section
- "Who [Competitor] is best for" section (be honest)
- CTA → /pricing

**Format B — Competitor Alternatives** (`/alternatives/[competitor]`):

- For searchers actively looking to leave a competitor
- List 4–6 real alternatives (you + others), not just yourself

**Format C — Competitor vs Competitor** (`/compare/[a]-vs-[b]`):

- Captures traffic for competitor queries where you're not directly involved
- Introduce SimpleScheduleAI as "the third option" toward the end

**Format D — Best-of Roundup** (`/best-nurse-scheduling-software`):

- List top 5–7 options with honest ratings
- You appear first but other tools are rated fairly
- Comparison table with feature matrix

### 13.4 Quality Rule

Every pSEO page must provide value that a user couldn't get by reading a
different page on the site. Ask before publishing:

- "Does this page have at least one section that is unique to this [state/audience/competitor]?"
- "Would a CAH administrator in [state] find something here they couldn't find on our other pages?"

If the answer is no, the page is not ready. Add unique content or don't publish.

---

## PART 14 — llms.txt FILE

Place at `https://simplescheduleai.com/llms.txt`. Plain Markdown only.
Update whenever: new feature added, pricing changes, new key page published.

Current file: `public/llms.txt` in the project root.

**Claude Code instruction**: After any product or page changes, update `public/llms.txt`.

---

## PART 14 — COMPETITOR COMPARISON STRATEGY

Bottom-of-funnel comparison searches have the highest conversion rates.
LLMs actively surface comparison content during evaluation mode.

**Target pages to build:**

| Competitor       | Target URL                                         | Priority |
| ---------------- | -------------------------------------------------- | -------- |
| NurseGrid        | `/alternatives/nursegrid-vs-simplescheduleai`      | High     |
| ShiftWizard      | `/alternatives/shiftwizard-vs-simplescheduleai`    | High     |
| Excel scheduling | `/alternatives/excel-vs-nurse-scheduling-software` | High     |
| Deputy           | `/alternatives/deputy-vs-simplescheduleai`         | Medium   |

**Tone rule for comparison pages**: Be factually honest. Acknowledge what the
competitor does well and where SimpleScheduleAI may NOT be the right fit.
This counter-intuitive balance dramatically increases AI citation likelihood.

---

## PART 15 — HIPAA-COMPLIANT TECHNICAL SEO

```
MANDATORY:
[ ] SSL/TLS on ALL pages (HTTPS everywhere)
[ ] No contact forms capturing PHI without BAA with form provider
[ ] Analytics: Use Plausible, Fathom, or PostHog (HIPAA-aligned)
    DO NOT use standard GA4 without careful HIPAA config
[ ] Any third-party tool that could receive session data must have BAA
[ ] Hosting provider must have BAA capability (Vercel, AWS, Azure)

STRONGLY RECOMMENDED:
[ ] Dedicated /security page with encryption details
[ ] Statement: "SimpleScheduleAI does not store patient data."
[ ] Privacy policy addressing healthcare data handling
[ ] Cookie consent banner
```

HIPAA compliance is an E-E-A-T and AI citation signal. AI engines cross-reference
company compliance status when evaluating healthcare content credibility.

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

## PART 16 — CLAUDE CODE SKILL SYNERGY

### 16.1 How This Skill Works with the Project

This skill is installed at `.claude/skills/seo-aeo-simplescheduleai.md` and is
automatically triggered by Claude Code when the task involves any of:

- Writing or editing page copy or blog content
- Adding or editing meta tags
- Implementing JSON-LD schema markup
- Creating FAQ sections
- Auditing technical SEO
- Writing comparison or alternative pages
- Updating robots.txt or llms.txt

**Separation of concerns:**

- **This skill** = SEO/AEO/GEO strategy, content rules, schema templates, checklists
- **CLAUDE.md** = Tech stack, deployment process, brand guidelines, file structure

This prevents generating SEO-compliant content that conflicts with engineering
constraints of the codebase.

### 16.2 Project Technical Context for SEO Work

```
Framework: Astro 5 (static output)
Blog posts: src/data/post/*.md or *.mdx
Schema injection: SchemaOrg.astro component (src/components/common/SchemaOrg.astro)
  — accepts: schema prop (object or array)
  — usage: <SchemaOrg slot="head" schema={[schema1, schema2]} />
Layout chain: PageLayout.astro → Layout.astro (head slot forwarded)
Organization schema: hardcoded in Layout.astro (runs on every page)
Sitemap: auto-generated by @astrojs/sitemap on build
robots.txt: public/robots.txt (static file)
llms.txt: public/llms.txt (static file — update manually when product changes)
Analytics: Google Analytics 4 (G-J2WK4QR3RC)
Hosting: Netlify (netlify.toml) or Vercel (vercel.json)
```

### 16.3 Slash Command Trigger

Invoke this skill explicitly in Claude Code with:

```
/seo-aeo-simplescheduleai
```

Or reference it by name when asking Claude Code to write blog posts, audit SEO,
add schema, or review page content.

### 16.4 Content Brand Voice

- **Tone**: Professional, empathetic, direct — like a trusted colleague who
  understands hospital operations
- **Audience**: Nurse managers and CAH administrators (not tech-savvy B2B buyers)
- **Avoid**: Jargon, vague claims, passive voice, generic AI-generated copy
- **Always**: Acknowledge tradeoffs; include what SimpleScheduleAI does NOT do
  (improves Claude/ChatGPT citation likelihood significantly)
- **Never**: Publish AI-generated content without expert review and real author
  attribution (Google penalizes low-quality AI content; YMYL risk)

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
