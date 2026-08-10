<!-- Split out of seo-aeo-simplescheduleai.md on 2026-08-10 for progressive disclosure.
     Content is VERBATIM from the original; the router skill says when to load this file.
     Mechanical rules restated here are ENFORCED by scripts/check-blog.mjs — the gate is
     the authority, this file explains the intent. -->

# Technical SEO (crawlers, sitemap, URLs, CWV, meta, HIPAA, llms.txt)

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

---

## PART 14 — llms.txt FILE

Place at `https://simplescheduleai.com/llms.txt`. Plain Markdown only.
Update whenever: new feature added, pricing changes, new key page published.

Current file: `public/llms.txt` in the project root.

**Claude Code instruction**: After any product or page changes, update `public/llms.txt`.

---
