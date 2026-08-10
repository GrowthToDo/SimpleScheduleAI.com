<!-- Split out of seo-aeo-simplescheduleai.md on 2026-08-10 for progressive disclosure.
     Content is VERBATIM from the original; the router skill says when to load this file.
     Mechanical rules restated here are ENFORCED by scripts/check-blog.mjs — the gate is
     the authority, this file explains the intent. -->

# AEO content patterns (capsule technique + 2026 standards)

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
