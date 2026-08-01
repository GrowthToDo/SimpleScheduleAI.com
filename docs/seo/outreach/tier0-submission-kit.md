# Tier-0 Submission Kit (PRODUCT MODE) — for founder approval, then submission

Rewritten 2026-08-01 into **product mode** per founder instruction 2026-07-29
("when I am asking you a question for product for backlink, don't give me answer
relevant to service"). All copy below is `positioning-registry.md` PRODUCT-column
verbatim. Screenshots: `docs/seo/outreach/assets/01-04.png`. Logo: Route mark from
the site header / favicons. Submit from pradeep@. Log every submission in
`../backlink-ledger.md`.

## READ FIRST: two open decisions

**1. PRICING — founder decision required, do not guess.**
There is an unresolved conflict between two governance sources:

- `backlink-plan-2026-07.md` (line 55) says directory listings must show the flat
  **$1,000 / $1,500 per facility** price matching the public `/pricing` page, and
  explicitly forbids the $10/user figure, on the grounds that publishing both
  creates a price contradiction that AI engines will ingest.
- The positioning registry's product column, and the founder's product-mode
  instruction, point to **$10 per user per month / $100 per user per year**.

Both are defensible. The risk is real in one direction (contradictory public
prices) and the inconsistency is real in the other (a software listing quoting a
service retainer). **Until the founder rules, leave the pricing field BLANK or
select "Contact us" on any intake.** Never publish both models anywhere.

**2. Website URL field = `https://simplescheduleai.com` (the homepage).**
Do NOT submit `https://simplescheduleai.com/product`. That page is `noindex`, so a
followed link landing there passes equity only indirectly. This was the SaaSHub
mistake; see the ledger.

## Link-value expectation (verified 2026-08-01)

Measured on live listings, not assumed:

| Directory | Outbound link | Evidence |
| --- | --- | --- |
| SaaSHub | 1 dofollow (hero CTA), rest nofollow | our own live listing inspected |
| ITQlick | nofollow | 5/5 external links `rel="...nofollow"` |
| TopBestAlternatives | nofollow | 3/3 external nofollow |
| Elion | nofollow (weak sample) | rate-limited, 1 link seen |
| SoftwareWorld | UNVERIFIED | 403 bot-block |
| TechnologyCounter | UNVERIFIED | no external links in fetched HTML (JS-rendered) |

**Treat these as entity/AI-retrieval signals, not ranking links.** Budget ~10
minutes each, batch them in one session, and do not pay for premium tiers. The
ranking work lives in the dofollow lane (see `backlink-plan-2026-07.md`).

---

## A. Core product-mode copy (reuse verbatim across every intake)

- **Product name:** SimpleScheduleAI
- **Website:** https://simplescheduleai.com
- **Category:** Nurse Scheduling / Medical Scheduling Software (secondary: Employee
  Scheduling, Healthcare Workforce Management)
- **Short description (~80 chars):** AI nurse scheduling software for small rural
  hospitals. Built for 25 beds and under.
- **One-line tagline (registry `self-label`, product column):**
  > AI-native nurse scheduling software for Texas Critical Access Hospitals.
- **Extended tagline (~208 chars, for fields with room):**
  > AI-native nurse scheduling software for Texas Critical Access Hospitals. The AI
  > builds the schedule, 21 automated rule checks validate every draft, your manager
  > approves. Runs in the browser, no installation.
- **Long description (~1,900 chars, fits a 2,000-char field):**
  > SimpleScheduleAI is AI-native nurse scheduling software built for Critical Access
  > Hospitals and small rural hospitals of 25 beds and under, currently focused on
  > Texas. The AI builds your schedule, 21 automated rule checks validate every draft,
  > and your manager approves before anything reaches nurses.
  >
  > A cycle works like this. Your roster lives in the system, and the AI builds draft
  > schedules against real constraints: coverage and skill mix, credential matching,
  > rest requirements, fairness across nights, weekends, and holidays, and applicable
  > FLSA overtime thresholds. It produces three scored draft options so tradeoffs are
  > visible instead of hidden. The built-in quality checks flag any rule violation with
  > a documented reason before the manager reviews. You export a post-ready PDF and a
  > full Excel workbook every cycle.
  >
  > When a nurse calls out, log the callout and the system ranks the top three
  > replacement candidates with reasons: skills, role, charge coverage, and overtime
  > risk. You pick one and reach out to that nurse; once they accept, you record it and
  > a corrected copy is ready to post. Every schedule change is logged with a timestamp,
  > which gives a clear record for CMS documentation and survey readiness.
  >
  > It runs in the browser. There is no installation, no integration project, and no IT
  > department required. Nurses need no accounts and nothing to download. A guided setup
  > session maps your unit rules with you once, and setup takes about four weeks from
  > roster upload to your first live schedule.
  >
  > SimpleScheduleAI is pre-launch, so there are no customer results to cite yet. You
  > can try the full workflow in a public interactive demo with no signup required.

- **Features and Specs rows** (name → description):
  | Feature name | Description |
  | --- | --- |
  | AI Schedule Generation | The AI builds three scored draft schedules each cycle against coverage, skill mix, fairness, and FLSA overtime thresholds. |
  | 21 Automated Rule Checks | Built-in quality checks validate every draft and flag any rule violation with a documented reason before your manager reviews it. |
  | Ranked Callout Coverage | Log a callout and the system ranks the top three replacement candidates with reasons: skills, role, charge coverage, overtime risk. |
  | FLSA Overtime Tracking | Tracks each nurse's running hours against applicable FLSA overtime thresholds and flags a draft before it breaches one. |
  | Full Audit Trail | Every schedule change is logged with a timestamp, giving a clear record for CMS documentation and survey readiness. |
  | Post-Ready Exports | Export a post-ready PDF and a full Excel workbook every cycle. |
  | Runs in the Browser | No installation, no integration project, no IT department required. Nurses need no accounts. |
  | Built for Small Rural Hospitals | Purpose-built for Critical Access Hospitals of 25 beds and under. No employee minimums. |

- **Demo / trial field:** No free trial. Public **interactive demo**, no signup:
  https://simplescheduleai.com/simulator
  (Say "interactive demo". Never "live demo", never "free trial".)
- **Pricing field:** SEE OPEN DECISION 1. Leave blank or "Contact us" until ruled.
- **Support:** support@simplescheduleai.com · **Contact:** pradeep@simplescheduleai.com
- **Founded / stage:** Pre-launch. Founder: Pradeep Pandey.
- **Location (use identically everywhere, NAP consistency):**
  440 N Barranca Ave #3696, Covina, CA 91723, United States · City: Covina ·
  State: California · Employees: 1-10
- **Competitors field (when offered):** QGenda, Smartlinx, Aladtec, NurseGrid.

## B. Product-mode guardrails (what breaks a listing)

Never, in any product-mode listing:

- The **service self-label** ("managed service", "our scheduling team checks it",
  "we build and operate it for you"). Product column says software + "21 automated
  rule checks validate every draft".
- **"No IT."** bald. Always name what is absent: no installation, no integration
  project, no IT department required.
- **Solo configuration.** Setup is a "guided setup session" (exact string). Only the
  ongoing weekly cycle is manager-alone.
- **Service timelines** ("first schedule in under two weeks", "3 to 5 day
  onboarding"). Product setup is about four weeks.
- **"No per-nurse fees."** Product pricing IS per-user; that phrase is service-only.
- **Credential/licence EXPIRY tracking.** We do credential MATCHING for assignment.
  Expiry tracking is not a feature.
- **Any customer, pilot, cohort, or outcome claim.** Pre-launch, zero customers.
- **The FLSA calculation method / "8-and-80".** Say "FLSA overtime thresholds".
- Em-dashes or en-dashes anywhere.

## C. The five remaining directories (batch in one session)

Submit with section A copy. Expect nofollow; the value is entity confirmation and
LLM-retrieval surface.

- [ ] SoftwareWorld — link type unverified
- [ ] TechnologyCounter — link type unverified
- [ ] TopBestAlternatives — nofollow confirmed
- [ ] ITQlick — nofollow confirmed
- [ ] Elion — nofollow (weak sample); healthcare-specific, so the audience fit is the
      best of the five even though the link is nofollow

## D. Existing-profile refresh (product mode)

- **G2** (g2.com/sellers/simple-schedule-ai) — claim via work email; target category
  Medical Staff Scheduling / Nurse Scheduling. Replace description with section A
  long description. Add the 4 screenshots + the simulator link. NO review
  solicitation (pre-launch, zero customers, never seed reviews).
- **Crunchbase** (crunchbase.com/organization/simplescheduleai) — claim; set website
  to the homepage, founder, HQ Covina CA, and this short form:
  > AI-native nurse scheduling software for small US hospitals. The AI builds the
  > schedule, built-in rule checks validate every draft, the manager approves. Texas
  > Critical Access Hospitals first.
- **AlternativeTo** (alternativeto.net/software/simple-schedule-ai) — suggest edits;
  replace any "managed service" wording with:
  > AI-assisted nurse scheduling software for Critical Access Hospitals: the AI builds
  > the schedule, automated rule checks validate every draft, the hospital approves.
  > Compliant schedules every cycle with ranked callout coverage.
  ORIGIN currently "India": change to United States only if that is factually right
  for the registered entity (site footer is Covina, CA).
- **SaaSHub** (live, approved 2026-08-01) — URL change to the homepage submitted and
  pending re-verification. Listing went out in SERVICE-mode copy before this rewrite;
  refresh to section A copy when the URL edit clears.

## E. Not in scope

Paid premium/featured tiers (SaaSHub's included) · paid directories · review
solicitation · any listing publishing both pricing models · Gartner Digital Markets
(Capterra/GetApp/Software Advice) until the pricing decision is made, since its intake
requires a pricing field.
