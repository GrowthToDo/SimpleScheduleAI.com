# GEO Analysis: /critical-access-hospital-scheduling

**URL:** https://simplescheduleai.com/critical-access-hospital-scheduling
**Date:** 2026-06-01
**Skill:** claude-seo v2.0.0 — `/seo geo`
**Purpose:** v2 smoke test on a CAH pillar page

---

## GEO Readiness Score: 65/100

| Dimension | Weight | Score | Notes |
|---|---:|---:|---|
| Citability (passages) | 25 | 15 | 3 sections over 200-word cap; no "What is X" definition in first 60 words |
| Structural Readability | 20 | 14 | Clean H1→H2 hierarchy, 4 of 6 topical H2s are questions, no comparison tables |
| Multi-Modal | 15 | 10 | Images present (Astro Image component); no charts/calculators/video |
| Authority & Brand | 20 | 8 | 8 SimpleScheduleAI mentions ✓, but NO author byline, NO dates, NO JSON-LD, NO hyperlinked sources |
| Technical Accessibility | 20 | 18 | SSR/static Astro ✓, robots allows 10 of 11 AI crawlers, `/llms.txt` present and well-formed |

## Platform Breakdown

| Platform | Estimated Citation Likelihood | Why |
|---|---|---|
| Google AI Overviews | Moderate | Topic + entity match are strong; missing schema + dates hurt the trust layer Google checks |
| ChatGPT (web search via Bing) | Low-Moderate | Wikipedia/Reddit presence not established; SimpleScheduleAI is not a known entity to ChatGPT yet |
| Perplexity | Low | Perplexity leans on Reddit + community sources; no community signal for this brand |
| Bing Copilot | Moderate | Bing index access exists; IndexNow already wired per existing CI |

## AI Crawler Access Status — strong ✓

10 of 11 audited crawlers explicitly allowed in `/robots.txt`: GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot, CCBot, Bytespider, cohere-ai, Applebot-Extended, Google-Extended. Only `anthropic-ai` is not mentioned (training crawler; ClaudeBot is the search-relevant one and is allowed). Only `/admin/` and `/api/` are universally disallowed. **No changes needed here.**

## llms.txt Status — present ✓

`/llms.txt` returns a structured overview of SimpleScheduleAI: launch year, target market (Texas CAHs ≤25 beds), core offering, key capabilities (Excel upload, three AI options, callout coverage, Texas compliance, audit logging), target users, and contact. Per the v2 evidence file (`seo-geo/references/llmstxt-evidence.md`), `/llms.txt` is **not currently a citation lever** for major AI search systems, but its presence is harmless and signals intent. No change needed.

## Passage-Level Citability

Optimal AEO citation length is **134-167 words** of self-contained answer. Current section lengths:

| H2 | Words | Status |
|---|---:|---|
| What Makes Critical Access Hospital Scheduling Different? | 287 | Over (split into 2) |
| What Are the Core Scheduling Challenges at Critical Access Hospitals? | 156 | In range ✓ |
| What Are the Texas Compliance Requirements for CAH Nurse Scheduling? | 124 | Slightly short |
| How Does SimpleScheduleAI Handle Critical Access Hospital Scheduling? | 198 | Over (borderline) |
| Worked Example: Staffing Math for a 25-Bed CAH on 12-Hour Shifts | 274 | Over (split into 2) |
| Manual Phone Tree vs Automated Callout: What the Time Difference Costs | 196 | Over (borderline) |

## Brand Mention Analysis

- **On-page:** 8 mentions of SimpleScheduleAI ✓
- **Wikipedia:** Not present (Wikipedia is the highest-weight ChatGPT citation source; getting an article qualifies as a high-effort/high-impact win)
- **Reddit:** Likely zero presence based on brand age
- **YouTube:** No company channel content surfaced
- **LinkedIn:** Company page exists and is logged in `backlinks-tracker.md`

Per the v2 skill: brand mentions correlate **3× more strongly with AI visibility than backlinks** (Ahrefs Dec 2025 study, 75k brands). Entity-presence work outranks classic link-building for this audience.

## Server-Side Rendering Check — pass ✓

Astro static build; no JS-hydration dependency for content. AI crawlers see the full content without executing JavaScript.

## Top 5 Highest-Impact Changes

Ranked by effort-to-impact ratio:

1. **Add author byline + publish + last-updated dates to the pillar page.** Lowest-effort, biggest E-E-A-T credibility lift. Current absence is the largest single signal weakness on the page. ~15 min.

2. **Hyperlink every regulatory claim** (CMS §485.635 → eCFR, FLSA → DOL, Texas DSHS → official). The fetch found 4× CMS mentions, 3× DSHS, 2× FLSA — all unlinked. Per source-backed claims mandate (skill 4.5), every regulatory reference must be a hyperlink. ~10 min.

3. **Add JSON-LD Article + Organization schema to the page.** The fetch found zero structured data. AstroWind blog posts auto-inject BlogPosting, but this pillar page does not have the same wiring. Add minimal Article + Organization JSON-LD in the layout. ~20 min.

4. **Add "What is critical access hospital scheduling?" definition in the first 60 words.** Opening currently jumps to operational framing. AI engines look for the `"X is..."` pattern in passage-1 to recognise the definition. Insert a one-line definitional lead before the existing intro. ~5 min.

5. **Split the 3 overweight sections** ("What Makes Different" 287w, "Worked Example" 274w, "How Does SimpleScheduleAI Handle…" 198w) into 100-200-word capsules per the codified capsule rule (`seo-aeo-simplescheduleai.md` §2.6.1). Each split adds an extractable answer block. ~45 min for the three.

## Schema Recommendations

The pillar page should embed at minimum:

- **Article** (headline, datePublished, dateModified, author { name, url, sameAs })
- **Organization** (sameAs to LinkedIn company page already in backlinks-tracker)
- **BreadcrumbList**
- Optional but worth it: **WebPage** + **WebSite** (already on homepage; if a per-layout pass is being added, do it here too)

Skip: FAQPage (restricted to government/healthcare-authority sites per skill 4.x notes), HowTo (retired Sep 2023). VideoObject if a hero video gets added later.

## Content Reformatting Suggestions

| Section | Current | Suggested |
|---|---|---|
| First 60 words after H1 | "How rural hospitals with 25 or fewer beds manage nurse shifts…" — contextual framing | Lead with: "Critical access hospital scheduling is the process by which Medicare-designated rural hospitals (≤25 inpatient beds) build, post, and maintain nursing rosters under CMS §485.635 staffing-record requirements and state overtime rules. …" |
| Texas Compliance Requirements section | Bulleted regulatory list, unlinked | Convert to a 3-column table: Rule \| Source \| What it requires. Every source cell is a hyperlink to the primary regulator. |
| Manual Phone Tree vs Automated Callout section | Prose comparison, 196w | Insert a side-by-side comparison table (Manual / Automated columns, rows for time, OT risk, fairness rotation, CMS log). |

---

## Quick Wins (≤30 min total)

1. Insert author byline + dates: `_Pradeep Pandey · Updated 2026-06-01_`
2. Hyperlink CMS §485.635 → `https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.635`
3. Hyperlink FLSA references → `https://www.dol.gov/agencies/whd/fact-sheets/54-healthcare-overtime`
4. Hyperlink Texas DSHS references → official Texas DSHS staffing page
5. Add the `"X is …"` definitional lead

## Smoke Test Verdict

claude-seo v2.0.0 `/seo geo` ran end-to-end against a live URL with no errors. The skill produced a structured analysis using the criteria documented in its SKILL.md (citability % weight, AI crawler check, llms.txt status, brand presence, multi-modal). The new v2 references file `seo-geo/references/llmstxt-evidence.md` is referenced correctly. Skill is operating as expected.
