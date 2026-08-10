<!-- Split out of seo-aeo-simplescheduleai.md on 2026-08-10 for progressive disclosure.
     Content is VERBATIM from the original; the router skill says when to load this file.
     Mechanical rules restated here are ENFORCED by scripts/check-blog.mjs — the gate is
     the authority, this file explains the intent. -->

# Keyword strategy, content strategy, programmatic patterns, competitor comparisons

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
