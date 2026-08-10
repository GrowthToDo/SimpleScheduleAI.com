<!-- Split out of seo-aeo-simplescheduleai.md on 2026-08-10 for progressive disclosure.
     Content is VERBATIM from the original; the router skill says when to load this file.
     Mechanical rules restated here are ENFORCED by scripts/check-blog.mjs — the gate is
     the authority, this file explains the intent. -->

# Concepts, E-E-A-T, off-page authority, measurement, roadmap, skill synergy

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
