<!-- Split out of seo-aeo-simplescheduleai.md on 2026-08-10 for progressive disclosure.
     Content is VERBATIM from the original; the router skill says when to load this file.
     Mechanical rules restated here are ENFORCED by scripts/check-blog.mjs — the gate is
     the authority, this file explains the intent. -->

# Post templates (BOFU listicle, MOFU explainer, FAQ blocks)

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
