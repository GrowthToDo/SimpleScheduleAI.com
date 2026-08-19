# SimpleScheduleAI — Competitor Review Dossier

Verified quotes, ratings, and product notes for competitors covered across all blog posts.
Use this file before fetching any live review data — only go online if a competitor is missing
from this dossier or the verification date is older than 60 days.

**Dossier last updated:** 2026-08-14
**Maintained by:** Pradeep Pandey / Claude (update each time new quotes are verified live)

---

## How to Use This File

1. Check the competitor section below before any web search for reviews.
2. If the quote you need exists here and the verification date is <60 days old, use it directly.
3. If a competitor is missing, or you need more quotes, fetch live data from Capterra/G2, verify
   verbatim, and add the new quotes here with today's date before publishing.
4. Never paraphrase quotes from this file — use verbatim text only.

### Read the WHOLE vendor section before adding to it (added 2026-08-14)

A propagation audit on 2026-08-14 tested the theory that verifications get
written into the maintenance log but never reach the vendor sections. **The
theory was wrong.** Every log entry checked had in fact landed in its section.

What the audit found instead was a duplicate that I had created the day before:
the ShiftWizard G2 figures were already recorded in that section from
2026-08-09, sitting further down between two reviewer quotes, and I added a
second copy near the ratings because I read only the top of the section before
editing. Both copies were accurate, which is exactly what makes this kind of
duplicate dangerous: nothing contradicts, so nothing flags, and the two entries
drift apart on the next update.

Two rules follow:

1. **Read the entire vendor section before adding anything to it.** These
   sections are long and facts are not always where you would file them. A
   figure can sit below the quotes rather than beside the ratings.
2. **Put verified figures with the ratings block**, not in the quote list, so
   the next person finds them where they expect to. The ShiftWizard section is
   now the model: one consolidated G2 block directly under the ratings.

Related trap: the topic docs (`next-15-topics-2026-08.md` and the like) carry
their own founder to-do lists, and those go stale. On 2026-08-14 that list still
showed five quote verifications as outstanding when the maintenance log recorded
all five as complete on 2026-08-09, which caused a full re-verification pass
that was not needed. **The maintenance log is the authority on what has been
verified. A to-do list in a topic doc is not.**

### Refreshing a stale row: use Playwright, not WebFetch (settled 2026-08-13)

Capterra returns 403 to WebFetch and to curl. That block is why five quote
verifications had been parked as manual founder to-dos, and why three vendor
sections (TCP 2026-05-12, symplr 2026-05-17, SmartLinx 2026-04-30) drifted past
the 60-day window without anyone re-checking them.

The Playwright MCP browser loads Capterra review pages normally, with no
challenge page, and `browser_find` reads review body text directly. The method
for any stale row:

1. `browser_navigate` to `https://www.capterra.com/p/<ID>/<Name>/reviews/`
2. `browser_find` the quote text
3. Confirm it verbatim against the row, then stamp today's date on that row

Two findings from the first run of this method, both worth knowing:

- **A product ID in this file was wrong.** The Aladtec row's URL pointed at
  `p/210972`, which resolves to DelyvaX, an unrelated delivery-management
  product. The page-verified ID (248403) was already sitting two lines above it
  in the ratings line. Verify that a review page's title actually names the
  competitor before trusting anything you read on it.
- **Our quotes are sometimes excerpts of longer sentences.** That is fine, and
  the row should say so, because the next person to re-verify will otherwise
  read the mismatch as a misquote.

Do not re-park Capterra work as a manual founder task.

---

## Aladtec (TCP Scheduling)

**Product:** Self-serve scheduling platform. Public safety, EMS, fire, law enforcement, and small
healthcare. Parent company: TCP Software (acquired Aladtec 2021).

**Ratings (verified 2026-07-15):**

- G2: 4.5/5 (94 reviews) — search-indicated (G2 blocks automated fetch)
- Capterra: 4.6/5 (17 reviews; small sample) — page-verified, Product ID 248403

**Capterra URL (verified 2026-08-13):** https://www.capterra.com/p/248403/Aladtec/reviews/ — WRONG ID CORRECTED. The old URL in this row used p/210972, which resolves to an unrelated product (DelyvaX, a delivery-management tool). Product ID 248403 is the page-verified Aladtec listing and its reviews path loads. Never cite p/210972.

**Important caveat:** Capterra reviewers skew heavily toward fire, EMS, and law enforcement.
The most recent hospital-nursing context reviews are several years old (most recent: Oct 2020).
Always note this when citing for hospital audiences.

### Verified Reviewer Quotes

**Positive:**

> "Their customer support team is better than any other support team I have ever had to deal with."
>
> Jody S., Security Management, August 14, 2025, Capterra

**Negative — Click-Heavy Workflow:**

> "When editing the schedule there are a lot of clicks involved."
>
> Amanda F., Nurse Manager, Hospital & Health Care, October 13, 2020, Capterra

**Negative — Setup Complexity:**

> "It was a bit complicated to figure out from the administrator side."
>
> Jeanne C., Administrative Coordinator, May 7, 2019, Capterra

---

## AMiON (Amion)

**Product:** Physician/clinician on-call and daily-work scheduling platform (stylized "Amion"; legacy name "OnCall"). Enterprise / health-system oriented. Not a nurse-scheduling product and not positioned for small or rural facilities.

**Ownership:** Historically developed by Spiral Software (founder Stuart Karon). Acquired by Doximity, Inc. (announced Feb 8, 2022; ~$53.5M cash plus up to $24M earnout). Now marketed under Doximity Hospital Solutions.

**Ratings (verified 2026-06-06):**

- G2: No dedicated Amion product listing found (2026-06-06)
- Capterra: 5.0/5 (1 review) — Product ID 9064 (URL slug is legacy "OnCall")
- Apple App Store: 4.4/5 (~5.6K ratings), app id481079171

**Capterra URL (verified 2026-06-06):** https://www.capterra.com/p/9064/OnCall/
**App Store URL:** https://apps.apple.com/us/app/amion-clinician-scheduling/id481079171

**Important caveat:** Quote inventory is very thin (1 Capterra review). Amion is enterprise physician on-call scheduling, a different category from AI nurse scheduling for CAHs. No CAH/rural/≤25-bed reference customers documented; named references are large systems (MedStar, NYU Langone, Northwell, Northwestern Medicine, UC Health). No CMS §485.635 audit trail, FLSA tracking, or credential enforcement documented on the product page (frame as "not documented on product page", never "lacks"). KLAS tracks Amion but scores are gated/proprietary, not quotable. No volume language permitted given the tiny verified sample.

### Verified Reviewer Quotes

**Capterra (only review on record; both lines are from the same single reviewer):**

> "I liked how easy it was navigate to facility schedule and sort dayshift and nightshift."
>
> Christopher G., ER Tech, Hospital & Health Care, November 14, 2024, Capterra

> "Generally it was a great app that was easy to use. Just needs to be more friendly on cell phone."
>
> Christopher G., ER Tech, Hospital & Health Care, November 14, 2024, Capterra

**Apple App Store (review TITLES below are confirmed verbatim; review BODIES came back truncated and MUST be re-verified before any body text is quoted):**

> "Convience without bells and whistles"
>
> Dr. Bubbala, App Store reviewer, June 28, 2020, Apple App Store

Other App Store review titles safe to quote with attribution (bodies NOT yet verified, do not quote body text without re-fetching): "Horrible for large multi-assigned groups" (Eddie3486t1, Nov 3 2020); "Terrible design." (Ldm234, Jan 7 2025); "Horrible Update" (mlhartzell, Apr 21 2021).

**Vendor positioning (verbatim, Doximity Hospital Solutions page, verified 2026-06-06):**

- "Powerful, Simple Enterprise Scheduling"
- "the trusted source of truth for physician on-call scheduling across entire health systems"
- "An oncall and daily work physician scheduling software"
- "the very first digital on-call scheduling platform"
- Vendor scale claim (not a review): "used by over 350 health systems, 11,000 departments, and 200,000 providers and counting"

**Pricing:** Not published; "Contact vendor" with a free trial available (Capterra). Quote-based enterprise model.

---

## CronShift

**Product:** Healthcare-focused workforce management and scheduling platform. Self-described (cronshift.com, verified 2026-06-12): "The first all-in-one workforce management platform transforming how healthcare teams work," focused on "solving the staffing crisis, optimizing labor costs, and simplifying operations." Positioning tagline in Google SERP: "the only platform purpose-built for healthcare facilities to manage complex staff rosters, emergency shift fulfillment, and compliance."

**Ratings (verified 2026-06-12):**

- G2: No listing found
- Capterra: No listing found
- No third-party reviews found on any aggregator via Google SERP pass

**No verified reviewer quotes in dossier.** Zero independent reviews exist as of 2026-06-12. Per pre-publish checklist, all blog content must use neutral product-page framing only, no quote substitution, no volume language. Site metrics ("10+ Happy users," "100+ Healthcare Providers," "4+ Partner Facilities") are vendor claims; attribute as vendor claims if cited. Note the internal tension in the vendor's own numbers (10+ users vs 100+ providers) — do not repeat without the "vendor claim" frame.

**Key features (from cronshift.com, verified 2026-06-12):** Executive dashboard with real-time staffing/attendance insight, PPD/PRD-based forecasting, mobile app for shift requests/swaps/time-off, CMS compliance reporting (Daily Nurse Staffing Sheets, PBJ reports), cross-facility staff pooling, partner agency integration, open shift parameter rules, multi-facility management, HR/payroll integrations. "Built by nurses, for nurses."

**Pricing:** Not published.

**CAH/rural fit:** No documented focus on Critical Access Hospitals, small hospitals, or rural facilities anywhere on the site. Feature set (PBJ reports, cross-facility pooling, agency integration) points to long-term care and multi-facility operators more than ≤25-bed CAHs. No founding info, no named customers, no attributed testimonials published.

**AI-visibility note (2026-06-12):** ChatGPT web-search answers for "best nurse scheduling software for critical access hospitals" recommend CronShift (alongside M7 Health, QGenda, symplr Smart Square) as "best emerging healthcare-focused scheduling platform," citing cronshift.com directly. AI visibility outruns its review footprint; treat as an active AEO competitor despite zero reviews.

---

## Deputy

**Product:** General workforce scheduling platform. Retail, hospitality, food service, healthcare
segment. Healthcare page: deputy.com/industry/healthcare.

**Ratings (verified 2026-07-15):**

- G2: 4.6/5 (666 reviews) — search-indicated (G2 blocks automated fetch)
- Capterra: 4.6/5 (773 reviews) — page-verified, Product ID 167811

**Capterra URL (verified 2026-05-15):** https://www.capterra.com/p/167811/Deputy/reviews/

**Important caveat:** Healthcare page does not document HIPAA, BAA, CMS §485.635 audit-trail,
FLSA 8-and-80 tracking, or credential constraints. Verify current tier capabilities with vendor
before citing compliance capabilities.

### Verified Reviewer Quotes

**Positive (hospital nurse):**

> "Deputy makes scheduling very easy and organised. It's simple to use, and I like how I can see my shifts clearly and get updates quickly."
>
> Portia A., Nurse, Hospital & Health Care, April 8, 2026, Capterra _(verified 2026-05-15)_

**Negative — App Performance (same reviewer as above):**

> "Sometimes the app can be a bit slow or glitchy, especially when trying to load shifts. Also, some features are not very clear at first."
>
> Portia A., Nurse, Hospital & Health Care, April 8, 2026, Capterra _(verified 2026-05-15)_

**Negative — Billing / 12-Month Lock-In (Trustpilot):**

> "You are charged around $57 in a way that presents exactly like a normal monthly subscription. There is no clear or prominent point where it is made obvious that you are entering a fixed 12 month commitment with a large cancellation liability. Only when you cancel do you find out you are expected to pay $572 for the remaining term for services that will not be used."
>
> "Paul", reviewer from Australia, 1-star review titled "Avoid Deputy !!!!", dated April 8, 2026, Trustpilot (uk.trustpilot.com/review/deputy.com; PAGE-VERIFIED via Playwright 2026-08-09). Dollar figures are the reviewer's (AUD context likely); quote them only inside this attributed quote, never as our own claim.

- Context stat (verified same day): Deputy's Trustpilot aggregate = 2.8/5 across 124 reviews, with 24% 1-star. Counts drift; re-verify if older than 60 days at use.

**Negative — Feature Consultation (CEO/DON):**

> "...the time clock system is an important part of any rostering system - and they have just issued a new feature where staff can clock in and out from home, without any consultation or ability to turn off this feature. While this may suit some businesses it does not suit mine and I am sure I am not alone."
>
> Julie B., CEO/DON, Hospital & Health Care, January 18, 2022, Capterra _(verified 2026-05-15)_

**Negative — PTO Requests:**

> "Setting up PTO and other time off requests is clunky and not easy to intuitively review."
>
> Jackie D., Practice Manager, Medical Practice, March 24, 2025, Capterra _(verified 2026-05-15)_

---

## EasyShifts

**Product:** Healthcare staff shift-scheduling software, RN-founded (2008), EasyShifts LLC, Appleton WI. SOC 2 Type II (via Thoropass). Domain: easyshifts.com (NOT easyshifts.io). Serves hospitals, nursing homes, assisted living, memory care, CCRCs.

**Ratings (verified 2026-06-06):**

- Capterra: 4.6/5 (60 reviews) — Product ID 228499 (canonical; an older ID 241775 also appears in search — do not cite without re-verifying)
- GetApp: 4.6/5 (60) — same Gartner review pool as Capterra; do not sum the counts
- G2: rating unconfirmed (page returned 403); seller page references ~30 reviews — do not cite a G2 rating until verified by direct load

**Capterra URL (verified 2026-06-06):** https://www.capterra.com/p/228499/EasyShifts/reviews/

**Important caveat:** Healthcare-built but documented focus is general hospital + senior living, NOT CAH-specific. Product pages do NOT document CMS §485.635, FLSA/8-and-80, or nurse credential/license tracking (frame as "not documented on product page"). No named CAH/rural reference customers. Reviewer quote dates verified against Capterra (ID 228499) on 2026-06-06 — quotes are publish-ready.

### Verified Reviewer Quotes (verbatim, Capterra ID 228499, dates verified 2026-06-06)

> "Staff can pick up and trade shifts without having to contact scheduler every time."
>
> Jenafer J., Office Schedule Coordinator, Hospital & Health Care, January 16, 2024, Capterra

> "It is frustrating not to be able to adjust shift times from the app"
>
> Johanna Y., Facility Manager, Hospital & Health Care, September 4, 2025, Capterra

> "The one area that could be looked at improving would be the mobile usability for updating/changing shift times or adding a new open shift."
>
> Cindee A., Executive Director, Hospital & Health Care, October 8, 2025, Capterra

_(Documented limitation theme: two reviewers independently flagged inability to edit shift times from the mobile app.)_

**Vendor positioning (verbatim, easyshifts.com, verified 2026-06-06):**

- "EasyShifts was originally started by an RN who was juggling schedules at three different hospitals in Wisconsin."
- "Designed For Nursing" / "created by an RN specifically for nurse scheduling"

**Pricing:** Official plans page lists "Contact us for Pricing"; third-party listings show ~$2.99–$3.99 per user/month (GetApp 2026-06-06); 90-day free trial, no credit card required. Cite pricing only with the conflict noted.

---

## Homebase

**Product:** General workforce scheduling platform. Retail, restaurant, service industry focus.
Free tier available for one location.

**Ratings (verified 2026-07-15):**

- G2: 4.6/5 (539 reviews) — _search-indicated: G2 403s automated page fetch; review count from G2's own listing title, rating from G2 search summary. Up from 4.4/5 (271) at the 2026-04-30 page check._
- Capterra: 4.6/5 (1,151 reviews) — _page-verified 2026-07-15 (was 1,147 on 2026-05-15; rating unchanged)._

**Capterra URL (verified 2026-07-15):** https://www.capterra.com/p/153076/Homebase/reviews/

**Important caveat:** Product page does not document HIPAA, BAA, CMS §485.635 audit-trail,
FLSA 8-and-80 tracking, or credential constraints. CAHs should verify compliance capabilities
directly with vendor.

### Verified Reviewer Quotes

**Negative — Mobile Scheduling (hospital user):**

> "I did not like that I could not do scheduling on the app"
>
> Amber B., Executive Director, Hospital & Health Care, March 26, 2025, Capterra _(verified 2026-05-15)_

**Negative — Multi-Location Tracking:**

> "Homebase did not allow us to track hours across multiple locations unless we paid extra for it. It was not able to limit number of people on a shift, to our knowledge."
>
> Angela P., Director, Mental Health Care, September 10, 2025, Capterra _(verified 2026-05-15)_

---

## In-House Health

**Product:** AI-driven nurse scheduling and workforce management platform. Predictive analytics, acuity-adjusted workload forecasting, and preference tracking. Can run as an automation layer on top of an existing scheduling system or as an end-to-end scheduling solution. Denver-based VC-funded startup (seed stage).

**Ratings (verified 2026-05-16):**

- G2: No G2 listing found (verified 2026-05-16)
- Capterra: No Capterra listing found (verified 2026-05-16)

**Capterra URL:** None. No Capterra product listing exists as of 2026-05-16.

**No verified reviewer quotes in dossier.** No G2, Capterra, or TrustRadius reviews exist for In-House Health as of 2026-05-16. The company has iOS and Android apps but no usable written third-party reviews surfaced. Per pre-publish checklist L66, all blog content must use neutral product-page framing only, no quote substitution, no volume language.

**Product positioning (from inhouse.health, verified 2026-05-16):**

- "purpose-built for nursing teams, integrating predictive analytics, workload adjustments and preference tracking to go beyond standard 'staffing grids' that do not vary"
- AI copilot "balances shifts weeks in advance, automatically adjusting for patient acuity, union rules and regulatory requirements"
- Published stat claims (exact phrasing): "reduces scheduling hours by over 50%" and "labor costs by 10%"; AI model helped nursing leaders "perfectly staff 87% of shifts while reducing the total number of shifts needed by up to 10%"
- AI algorithm "trained on millions of patient records"
- Delivers "scheduling and clinical insights to the management of more than 800 nurses"
- Funding: $4M seed led by NEA and TMV (May 2024); about $5.4M total raised to date

**CAH/rural fit:** No documented focus on Critical Access Hospitals or small/rural facilities. Positioning emphasizes "modern nursing teams," nurse managers "with growing spans and larger teams," union rules, and acuity-driven inpatient units, language oriented to larger acute-care environments, not ≤25-bed CAHs. No published CAH or rural reference customers. Verify any small-hospital fit directly with vendor.

**August 2026 update (page-verified 2026-08-10 via `npm run competitor-watch`):**

- Homepage positioning rewritten. Verbatim: H1 "Restore Sustainability to Nursing"; subhead "AI-driven Scheduling and Management Platform for Modern Nursing Teams."; self-label "AI-driven Nurse Scheduling Platform"; CTA "Schedule a Demo".
- Homepage now leads with four vendor metrics (vendor claims, NOT independent data, attribute as such if ever cited): "$270K Cost savings per unit, per year", "5.5H Weekly time savings per user", "31% Improvement in shifts at budget", "4 Weeks to implement".
- Segment expansion: a dedicated `/skilled-nursing` page now sits alongside `/product`. Skilled nursing facilities are named as a customer type on the homepage.
- **Content operation is the largest of the modern cohort**: ~35 posts under `/blog-post/`, plus `/case-studies/the-center-at-lowry`. Topics that collide directly with ours: `great-clinical-scheduling-system` and `the-black-hole-of-clinical-scheduling` (vs our `what-is-clinical-scheduling`), `the-future-of-ai-agents-in-nurse-scheduling` and `ai-driven-predictive-nurse-scheduling` (vs our pillar), `combating-shortage-and-burnout-with-new-float-pool-models` (vs our float-pool post).
- **Most-cited modern rival in LLM answers**: cited by Perplexity on two of the four money prompts in the 2026-08-09 citation-shape autopsy.
- 92 referring domains (DataForSEO, 2026-08-10), 24% nofollow.
- No pricing published; `inhouse.health/pricing` 404s. Funding: still $4M seed led by NEA and TMV as the primary-sourced figure; a secondary aggregator (StartupHub) reports "$15M raised" — UNVERIFIED, do not cite. Founders: Sergey Vasilenko (former critical care nurse), Ari Brenner (ex-Stellar Health COO), Shachar Har Zvi (ex-Google).
- Ratings unchanged in kind: still no G2 or Capterra listing surfaced. Re-verify before any rating claim.
- **SEO footprint (DataForSEO, 2026-08-10): 42 ranked keywords, and the content library earns almost none of it.** Their top organic page is `/baa` — a Business Associate Agreement legal page — at position 6 for `baa definition` (260/mo) plus `baa abbreviation` / `what does baa stand for` / `baa law`. Best blog result across ~35 posts: `/blog-post/the-shift-dilemma` at position 29 for `how long are nursing shifts`. Homepage sits at position 50 for `healthcare staff scheduling software` (1,000/mo), 23 for `scheduling software for nurses`, 41 for `hospital staffing software`.
- **Content shape is weaker than ours, and they are cited anyway.** Two posts structure-verified 2026-08-10: 450-1,200 words, vague non-question H2s ("The Challenge", "The Vision", "Embracing the Future"), rhetorical-question openings rather than answer-first, no tables, no FAQ blocks, one sourced statistic between them, named authors (Ari Brenner; "Dr. Beth Meyers"). Their LLM citations therefore trace to entity attestation — Fierce Healthcare and Businesswire coverage, an HLTH panel, three podcast appearances (Nurse Converse, Nurse Rosa's Insights, The Beat), a named case study, a former-critical-care-nurse founder — not to page structure. Do not treat their content as a shape model.
- **They run their own interview series with external nurse leaders** ("Insightful Talks with…", "Tech Talks with…"), which is where their firsthand voice comes from.
- **Founder priority 2026-08-10: this is the competitor to track, ahead of M7**, because they are the most active.

**Secondary source pass (verified 2026-05-16):** App Store listing "In House Health" (iOS, id6748960919) and Google Play (inhouse.health) exist; the app is end-user nurse-facing (view and pick up shifts, set availability). App-store star rating and review count were not retrievable this pass and must be re-checked before any rating is cited; if cited it is end-user app feedback, not an enterprise product review. No independent third-party reviews on Software Advice, GetApp, Gartner Peer Insights, Reddit, or Product Hunt. One named customer quote exists only in vendor funding PR: James Kerridge, Associate Chief Nurse, Chicago VA Medical Center, in Fierce Healthcare's coverage of the $4M seed (May 2024). Usable ONLY with explicit "stated in Fierce Healthcare's coverage of In-House's funding announcement" framing, never as an independent review. Neutral product-page framing still required for all evaluative claims.

---

## M7 Health

**Product:** AI-driven nurse scheduling and labor-optimization platform for health systems. Automated shift assignment, staffing forecasting, skill-coverage optimization built on individual nurse preferences. Founded 2022 (Ilana Borkenstein, Eric Gruskin); name from the "M7" bone-marrow-transplant unit at Memorial Sloan Kettering.

**Ratings (re-verified 2026-08-19):**

- G2: No accessible G2 listing found (verified 2026-05-16; no G2 profile surfaced)
- Capterra: 0.0/5 (0 reviews); listing exists but unrated. **Re-verified live 2026-08-19 via Playwright**, product page renders "Overall rating / Based on 0 user reviews" with a "Write a review" prompt. Note: the `/reviews/` path 403s on first hit but redirects and loads on the product URL; the "Based on 311 Nurse Scheduling reviews" string on the same page is Capterra's category-wide AI summary, NOT M7's review count. Do not misread it.

**Capterra URL (verified 2026-05-16):** https://www.capterra.com/p/10037829/M7-Health/ _(Product ID 10037829 confirmed live; page explicitly states "Based on 0 user reviews", 0.0 across Ease of Use, Value for Money, and Customer Service.)_

**No verified reviewer quotes in dossier.** Capterra listing has 0 reviews; no G2 or TrustRadius reviews exist for M7 Health as of 2026-05-16. Per pre-publish checklist L66, all blog content must use neutral product-page framing only, no quote substitution, no volume language. Vendor-published metrics (NPS, percentage reductions) are M7 marketing claims, not independent reviews; attribute as vendor claims if cited.

**Product positioning (from m7health.com and public press, verified 2026-05-16):**

- "Nurse Scheduling and Labor Optimization for Health Systems"; "purpose-built nurse scheduling software for enterprise nursing & healthcare operations"
- "M7 helps health systems reduce premium labor costs, lower administrative burden, and stabilize nurse retention"
- "From local community hospitals to top-tier academic medical centers"
- Vendor stat claims (exact phrasing): "reduced administrative time spent on scheduling by more than 60%", "lowered premium labor spend by up to 40%", "average staff fairness scores above 94%"; "NPS score of 69, the highest in healthcare"; platform "used by 13,000 healthcare professionals across more than 60 hospitals"
- Enterprise deployments: Ochsner Health (system-wide across all 47 hospitals by end of 2025); ScionHealth (enterprise of Community and Specialty Hospitals)
- Funding: $10M Series A led by Threshold Ventures; about $17M total ($1.75M pre-seed led by 25m Health, $4M seed led by First Round)

**CAH/rural fit — SUPERSEDED 2026-08-19. The old reading below is STALE. Do not reuse it.**

~~Explicitly an enterprise and health-system product. Positioning, press, and reference customers (Ochsner 47-hospital system, ScionHealth multi-hospital enterprise) all point to large multi-facility systems and academic medical centers, not ≤25-bed Critical Access Hospitals. No documented CAH or standalone-rural reference customers.~~

**M7 HAS MOVED INTO THE CAH LANE.** Page-verified in a real browser 2026-08-19 at `m7health.com/blogs/critical-access-hospital-scheduling-software`, authored by co-founder Ilana Borkenstein: "Why Critical Access Hospitals Deserve Better Scheduling Software (And Finally Have It)". Verbatim from that page:

- **Positioning:** "M7 is the nurse-built scheduling platform that fits how small rural hospitals actually work — simple to adopt, low-lift to implement, and backed by hands-on support from day one."
- **Delivery:** "Our team handles the setup, trains staff directly, and stays close until scheduling feels effortless. Most critical access hospitals are live within a few weeks, with no IT burden."
- **Support model:** "Every nurse manager at every M7 facility has a dedicated account manager — a real person with a phone number and an email address."
- **Pricing FAQ:** "Is M7 affordable for small critical access hospitals? Yes. M7 is priced to be accessible for smaller facilities and is specifically designed not to require the IT investment or implementation overhead of enterprise scheduling systems."
- **Deployment evidence:** a named M7 employee (Marc Mansolillo, RN, customer activation) "has personally onboarded critical access hospitals across Utah, Mississippi, and Alabama". **No individually named CAH customer appears on the page** — the claim is by state, not by hospital.
- They cite the same "over 1,380 critical access hospitals" figure we use.

**Why this outranks a dossier line.** Their CAH page now claims the operational wedge we have treated as ours: hands-on setup, no IT burden, a named human per account, and pricing pitched as accessible to small facilities. **Any content asserting that M7 is enterprise-only, that M7 ignores CAHs, or that "you operate it" while "we operate it for you" is now FALSE and must not ship.** A draft of `m7-health-alternatives` built on exactly that premise was written 2026-08-19 and stopped by this check before review.

**Their content direction matters too.** Their 2026-07-28 post is "Your Hospital Bought Scheduling Software. Why Are Managers Still in Spreadsheets?", substantively the same argument as our Chief Healthcare Executive Viewpoint submission sent 2026-08-18.

**What remains honestly differentiating, and must still be verified per claim:** no independent third-party reviews (Capterra listing with 0 reviews; no G2 listing found), no published price, and a CAH deployment claim made by state rather than by named hospital.

**Secondary source pass (verified 2026-05-16):** No consumer app exists (enterprise web platform; customer subdomains e.g. ochsner.m7health.com, scion.m7health.com). No independent reviews on Software Advice, GetApp, Gartner Peer Insights, Reddit, Product Hunt, or LinkedIn. Two fully attributed named-customer statements exist on customer-owned newsrooms, usable ONLY as partnership-announcement PR with explicit framing, NEVER as product reviews:

> "Ochsner Health chose the M7 health workforce management platform because it seamlessly integrates with our existing systems while addressing one of the most critical challenges in healthcare, staffing and scheduling. M7's innovative approach, combining data-driven insights with a focus on human experience, made it the right choice for our organization."
>
> Amy Trainor, System Vice President and Chief Information Officer, Ochsner Health, Ochsner Health news release, approximately February 2026

> "We are proud to team up with M7 Health and begin implementing their platform across our enterprise of Community and Specialty Hospitals to deliver transparency and fairness in nurse scheduling."
>
> Rob Jay, CEO, ScionHealth, ScionHealth news release

These confirm M7's enterprise/multi-hospital deployment footprint (a factual CAH-differentiation point) but are partnership PR, not reviews. Neutral product-page framing still required for all evaluative claims.

**AI-visibility note (2026-06-12):** ChatGPT web-search answers for "best nurse scheduling software for critical access hospitals" now rank M7 Health FIRST ("best overall for most Critical Access Hospitals"), citing m7health.com and crediting M7 with "recently published guidance specifically addressing the needs of Critical Access Hospitals." M7 is actively claiming the CAH lane in AI answers despite its enterprise reference base (Ochsner 47 hospitals, ScionHealth). The CAH/rural-fit paragraph above remains accurate on documented customers; the marketing claim and the AI answer have moved ahead of the reference evidence. Most direct AEO competitor as of June 2026.

**August 2026 update (page-verified 2026-08-10 via `npm run competitor-watch`; SEO data via DataForSEO same day):**

- **Category label changed.** Homepage H1 is now, verbatim: "The AI-powered workforce operations platform for healthcare", subhead "Built for the realities of clinical staffing and scheduling". This replaces the May positioning ("Nurse Scheduling and Labor Optimization for Health Systems"). They have moved off nurse-specific language onto the same "workforce management" ground QGenda and symplr hold.
- **Two new objection-handling assets in the nav.** `/roi-calculator` ("Impact Calculator") sizes by bed count — its first question is verbatim "How many beds do you have?" — and surfaces $25,000 / $12,000 / $20,000 figures. `/implementation` ("A Hands-On Rollout That Actually Works") states "Most hospitals are fully live in a few weeks", a four-week week-by-week plan, "Your IT team's role is minimal—mostly coordination and sign-off", and "Pre-built integrations with most major systems" (still no named integration vendor).
- **Customer wall expanded down-market.** Named logos now include Palestine Regional, Ennis Regional, Cornerstone Round Rock, Georgetown, Carolina Pines, Logan Regional, Sage West, Vaughan, Andalusia, Bolivar Medical Center, Livingston, Bourbon Community, Clark Regional, Hillsboro, Beaver Valley, Milford Memorial, Parkview Regional, alongside Ochsner, Kindred, ScionHealth, Lifepoint, MVHS, St. Francis-Emory. **These arrive through Lifepoint/ScionHealth parent systems, not as independent hospitals, and their bed counts are UNVERIFIED — most are near-certainly above the 25-bed CAH ceiling. The standing line still holds: no named standalone CAH customer or case study exists.** What changed is that the rural-community-hospital claim now has a logo wall behind it where in May it had only copy.
- **SEO position is navigational, not editorial.** 79 ranked keywords / ~944 est. monthly organic visits, but 24 of their top 25 traffic keywords are branded and most carry a customer's name (`m7 health login`, `m7 ochsner`, `m7 ochsner login`, `ochweb`, `st francis m7 health`). This is Ochsner nurses finding the login page, not demand capture. Do not treat their traffic number as a content benchmark.
- **Backlink profile is a hiring-and-fundraising artifact.** 101 referring domains (90 main), of which 47 point at the bare homepage; sources are their ATS (breezy.hr), job boards, VC firms and data aggregators. Their best content page has ONE backlink. Two notable exceptions: ionl.org (Illinois Organization of Nurse Leaders) and scionhealth.com (customer newsroom).
- Content library is 13 blog posts + 7 resources, including `/blogs/healthcare-staff-scheduling-software` (the head term we retired) and case studies on ScionHealth Denver and ScionHealth community hospitals. Their CAH piece `/blogs/critical-access-hospital-scheduling-software` carries **no question H2s at all** — a structural AEO weakness on the exact page ChatGPT was citing in June.
- Still no published pricing; `m7health.com/pricing` 404s.

---

### Deep tech/GTM profile (verified 2026-07-06)

- **Scheduling mechanism: publicly undisclosed.** No solver/algorithm named anywhere (no OR-Tools/CP-SAT/MILP, no engineering blog, no patents, no GitHub). Platform copy: "auto-balance that builds a first-pass nurse schedule in seconds" (m7health.com/platform). Open SWE req asks candidates to "Apply AI/ML techniques to enhance scheduling intelligence" — forward-looking, not shipped. Turnover-risk feature self-describes as baseline-deviation signals (callout frequency vs own history, preference-submission stops, float/OT drift) — rule-based anomaly detection in AI language (blog 2026-06-11). Founders: RN+HBS (Borkenstein), BCG+HBS (Gruskin); founding engineer generalist full-stack — no OR/optimization pedigree found anywhere on team.
- **AI language is outcome-framed, never mechanism-framed:** "AI forecasts patient census and staffing demand based on historical patterns"; "AI automatically balances schedules around staff preferences and clinical requirements"; automated open-shift routing (m7health.com/platform, verified quotes). No "agentic/LLM/ML" terms in customer-facing copy. "Staffing Agent" name seen only in a LinkedIn paraphrase — UNCONFIRMED, do not cite.
- **Model:** manager-generated first pass + nurse preference/swap/pickup via phone. NO native app-store app found (iOS/Google Play searched — absent) → mobile web/PWA; no app-store rating signal exists.
- **Funding/scale:** $4M seed (First Round, 2024-09); $10M Series A (Threshold lead, 2025-07-15); "$17M total" secondary-source only. "15,000+ professionals across 60+ hospitals" (Series A PR) → "tens of thousands of daily users across 29 states," "100+ net new hospitals" (LinkedIn, undated). Team est. 30-60 (sources conflict). Hiring: AE, Implementation Eng, PM Integrations, SWE, CS — sales/CS scale-up.
- **Named customers are ALL multi-hospital systems** (Ochsner system-wide launch across 47 hospitals announced 2026-02-23; ScionHealth, Lifepoint, Cornerstone, MVHS, St. Francis-Emory). **No named standalone CAH customer or case study exists anywhere** — the CAH claim is content-led, not proof-led.
- **GTM:** no published pricing (all funnels → demo); "typical four-week process" onboarding; "most critical access hospitals are live within a few weeks," "no IT burden" (CAH blog); integrations described only generically ("payroll, timekeeping, ERP and EMR," "pre-built integrations with most major systems") — no vendor names confirmed (no UKG/Kronos/Epic named).
- **The ChatGPT-cited CAH piece:** "Why Critical Access Hospitals Deserve Better Scheduling Software (And Finally Have It)" — published 2026-04-01, author Borkenstein; positioning/authority piece with zero named CAH customers or case studies. Monthly blog cadence with a retention/turnover narrative arc Mar-Jun 2026.

## Microsoft 365 Copilot and Teams Shifts

Added 2026-08-12 for the `can-microsoft-copilot-generate-nurse-schedule` post. Microsoft is not a nurse-scheduling competitor in the usual sense; it is the incumbent software a CAH already pays for, which makes "can we just use what we have?" a live buying question. Claims about it get held to a higher bar than usual: it is the most recognisable brand we write about, and a false capability-absence claim is both unfair and instantly checkable.

**Microsoft 365 Copilot — page-verified 2026-08-12** (https://www.microsoft.com/en-us/microsoft-365/copilot):

- Headline, verbatim: **"AI built for work"**
- Description, verbatim: **"Turn data into insights in the apps you already know with Microsoft 365 Copilot."**
- **"Powered by Work IQ across your Microsoft apps."** Work IQ, verbatim: "a workplace intelligence layer that helps Copilot and agents know you, your job and your company, connecting data, context and tools to deliver intelligence built just for you and the flow of your work."
- **"productivity companion" and the word "companion" DO NOT APPEAR on this page.** A pre-publish review caught our draft attributing "productivity companion" to it as a quasi-quote. Never use that phrasing.
- **CRITICAL FRAMING RULE.** Because Copilot grounds on tenant data via Work IQ, "Copilot has no access to your roster / no data on your nurses" is FALSE as a blanket claim: if the roster sits in a SharePoint workbook, Copilot can read it. The defensible claim is about **enforcement, not access** — Copilot has no rule engine that blocks an assignment, no maintained running total tied to an FLSA threshold, and no obligation to refuse a non-compliant grid. Frame every limitation that way.

**Microsoft Teams Shifts — verified 2026-08-12** (microsoft.com/microsoft-teams/staff-scheduling-shift-management, support.microsoft.com Shifts articles):

- Shifts is the schedule-management app **included with Teams** ("If you have Teams, you have Shifts"), built mobile-first for frontline workforces.
- Verified capabilities: clock in and out, request time off, swap or offer a shift to a teammate, request to work an open shift, open-shift publishing by managers, location detection and digital tracking sheets on the time clock.
- **No healthcare-specific compliance, overtime-threshold, staffing-floor, or credential/licence checking claimed anywhere.** It is a horizontal frontline scheduling and time-tracking app.
- **Why this matters for us:** Shifts is the honest answer to "can we use what we already pay for?" and any post about Copilot that ignores Shifts looks like it dodged the real question. Treat Shifts as a genuine option for shift logistics, and locate the gap where it actually is: it does not enforce CAH staffing rules, does not track running hours against FLSA thresholds for a compliance purpose, and does not produce a survey-ready staffing record.

No third-party review quotes collected; not applicable in the usual sense (Microsoft has no nurse-scheduling product listing on Capterra/G2 to review). Neutral product-page framing, verbatim quotes only.

---

## NurseGrid

**Product:** Nurse-facing scheduling app with manager tier. Mobile schedule viewing, availability,
shift trades. Manager tier extends to unit-level oversight. Owned by HealthStream.

**Ratings (verified 2026-07-15):**

- G2: 4.6/5 (5 reviews; small sample) — search-indicated
- Capterra: 4.2/5 (13 reviews; small sample), Product ID 254829 — page-verified

**Capterra URL (verified 2026-08-14):** https://www.capterra.com/p/254829/NurseGrid/reviews/ — product ID 254829 CONFIRMED, listing name is "NurseGrid Manager". Live rating 4.2/5 across 13 reviews.

**Important caveat:** Manager-facing mobile app removed per multiple reviewers (June 2024).
Desktop login required for schedule edits. Not a primary scheduling system for CAHs with
active CMS obligations — missing FLSA tracking, CMS audit trail, credential enforcement.

### Verified Reviewer Quotes

**Positive:**

> "Ease of loading schedules and posting open shifts."
>
> Inpatient Director, Hospital & Health Care, June 17, 2024, Capterra

**Negative — Manager App Removed:**

> "It no longer has the manager app so I have to login to desktop to make changes."
>
> Chief Nursing Officer, Hospital & Health Care, June 13, 2024, Capterra _(re-verified live 2026-08-14. CORRECTED: our version ended at "desktop", cutting the sentence mid-clause without an ellipsis. The full sentence is restored above.)_

> "they took away the Manager App for your phone."
>
> Staffing Coordinator, Medical Practice, June 11, 2024, Capterra _(re-verified live 2026-08-14. Excerpt from a longer Cons field beginning "My only 2 cons are the BIGGEST they took away the Manager App for your phone so instead of the ease of changing the schedule being right there in the app at your fingertips after hours, you now have to use your browser to log in". Lowercase "they" is correct because the excerpt starts mid-sentence.)_

> "I really like it. It is easy to use. Please Bring back the mobile app" _(re-verified live 2026-08-14, still posted and verbatim, including the mid-sentence capital in "Bring")_
>
> Nika S., Inpatient Director, Hospital & Health Care, June 17, 2024, Capterra (5.0-star review titled "HRRMC- Inpatient"; same reviewer as the Android quote below, name PAGE-VERIFIED via Playwright 2026-08-09; capitalization "Bring" is the original)

**Negative — Android Compatibility:**

> "Does not work well with androids. The texting function doesn't work."
>
> Inpatient Director, Hospital & Health Care, June 17, 2024, Capterra

**Negative — Cost for Small Facilities:**

> "cost is too expensive for small centers. We are not renewing ours."
>
> Administrator, Hospital & Health Care, June 17, 2024, Capterra _(re-verified live 2026-08-14. EXTENDED: the second sentence was missing from our version and is the stronger half, since it reports an actual churn decision rather than a price opinion.)_

---

## QGenda

**Product:** Provider scheduling platform. Physician scheduling, on-call management,
credentialing, time tracking, analytics. Customer base skews toward physician group practices
and larger health systems.

**Ratings (verified 2026-07-15):**

- G2: 4.6/5 (164 reviews) — search-indicated
- Capterra: 4.2/5 (68 reviews) — page-verified, Product ID 90628

**Capterra URL (verified 2026-08-13):** https://www.capterra.com/p/90628/QGenda/reviews/ — the reviews path resolves; the host 403s automated checkers, so `check-links` reports it as "check" rather than broken. URL shape confirmed via search-result exact match, and the 4.2/68 rating plus the automation-hiccups theme were corroborated in the same pass.

### Verified Reviewer Quotes

**Positive:**

> "Qgenda is easy to use and does a great job at automating."
>
> Ari W., Administrator, Hospital & Health Care, May 7, 2024, Capterra

**Negative — Initial Setup:**

> "Doing the initial set up of new providers is a little complicated."
>
> Brandi D., Scheduling Coordinator, Hospital & Health Care, December 13, 2023, Capterra

> "The initial setup was time-consuming...collating...digitize documents."
>
> Roger S., Practice Administrator, May 3, 2024, Capterra

**Negative — Automation Configuration:**

> "automated scheduling and rules set up seem to have hiccups...I just stopped using the automation."
>
> Courtney D., Manager of Employee and Physician Relations, May 10, 2024, Capterra

**Negative — Customer Support:**

> "They outsourced customer service...you have generic people who respond."
>
> David S., President, Hospital & Health Care, May 7, 2024, Capterra

> "Also do not like how hard it is to find someone that can step in and help troubleshoot issues. I feel like I talk to 3 people before I get an actual answer"
>
> Wilmer R., Practice Administrator, Medical Practice, March 19, 2026, Capterra (3.0-star review titled "Year 3 with Qgenda"; PAGE-VERIFIED via Playwright 2026-08-09)

**Negative — Pricing / Hidden Costs:**

> "Its a good software but the price does not match all that is should and could do. There are other softwares that do the same for less."
>
> Wilmer R., Practice Administrator, Medical Practice, March 19, 2026, Capterra ("Its" and "all that is should" are the original phrasing, keep as written)

> "Cost. Seems there are hidden costs behind every door now."
>
> Wilmer R., Practice Administrator, Medical Practice, March 19, 2026, Capterra (Cons field of the same review)

---

## Schedule360

**Product:** Healthcare scheduling software. Broad target market across hospitals (nursing, ED, overflow), physician groups, pharmacies, urgent care, specialty clinics, call centers, and government agencies. Named enterprise customers include University of Michigan, Cleveland Clinic, Kaiser, and Target. Headquartered in Atlanta, GA. Homepage tagline: "Healthcare Scheduling Software Configured For Specialty Clinics."

**Ratings (verified 2026-06-03):**

- Capterra: 5.0/5 (1 review; non-healthcare, small sample)
- SelectHub: 100% user satisfaction (2 reviews; small sample)
- KLAS: Best In KLAS 2022 (Nurse and Staff Scheduling category)
- G2: no listing with usable review density found 2026-06-03

**Capterra URL:** https://www.capterra.com/p/129471/Staffing-Angel-RN/
**SelectHub URL:** https://www.selecthub.com/p/employee-scheduling-software/schedule360/
**Vendor URL:** https://schedule360.us/

**Important caveat:** Independent review density is very low compared with peers. The single Capterra review is from a restaurant attendant in Brazil (May 22, 2023, 5.0/5) and is NOT representative of hospital-nursing user experience. The KLAS 2022 recognition is the strongest independent signal. For CAH posts, frame review evidence honestly: cite KLAS + the small Capterra/SelectHub samples explicitly; do NOT invent or paraphrase hospital reviewer quotes — none exist within standard review platforms as of 2026-06-03.

### Verified Reviewer Quotes

**Only Capterra review on record (non-healthcare, retained for transparency, do NOT use in hospital-context posts as if it were a healthcare user):**

> "O Schedule360 auxílio bastante no controle dos funcionários"
>
> Kamilla S., Attendant, Restaurants, May 22, 2023, Capterra (translation: "Schedule360 helped greatly with employee management")

### SelectHub Analyst-Summarized Themes (NOT individual reviewer quotes)

Use these in posts only with the framing "SelectHub's aggregated analyst summary lists..." — never quote as if a named reviewer said it. Source: SelectHub Schedule360 page, verified 2026-06-03.

**Pros (aggregated):**

- Easy to use with intuitive interface
- Time-saving automated features (shift scheduling, time-off requests)
- Improved communication via notifications and messaging
- Mobile accessibility for schedule management

**Cons (aggregated):**

- Limited customization flexibility for unique business needs
- Steep learning curve for new users
- Mobile app performance issues (slow loading, crashes)
- Lack of seamless integration with payroll/time tracking systems
- Poor customer support responsiveness

### Product Page Compliance Coverage (verified 2026-06-03)

Schedule360 product page does NOT publicly cover:

- CMS §485.635 audit trail as a default
- FLSA overtime threshold tracking (40-hour or 8-and-80) specific to small hospitals
- Texas Labor Code provisions
- CAH-specific compliance defaults

Product page DOES cover:

- Rules-based self-scheduling
- Broadcast notifications (SMS, email, pager)
- Web and mobile access, reporting
- Free setup, free 24/7 support, free online training (vendor claim)

**Pricing:** Not disclosed on vendor page. SelectHub aggregated listing references $5/user/month starting tier (third-party data, vendor-unconfirmed).

**Note on QGenda relationship:** Schedule360 homepage shows "A QGenda Company" tagline (verified 2026-06-03). Treat as related but DISTINCT product per founder direction (user instruction 2026-06-03): "Q-Genda and Schedule 360 are different software, so please don't mix it up while writing the blog." In blog posts, write Schedule360 as standalone product; do NOT use the QGenda relationship as the framing angle.

---

## ScheduleAnywhere

**Product:** Online employee/shift scheduling software with a dedicated nurse/healthcare sub-page. Historically by Atlas Business Solutions (ABS, Fargo ND, since 1991); now acquired by and branded under TCP Software ("ScheduleAnywhere by TCP"). **As of 2026-06-06, scheduleanywhere.com redirects to TCP Humanity Schedule** (founder-confirmed), indicating the standalone ScheduleAnywhere brand is being folded into TCP's Humanity product line. Confirm which product is actually being sold before citing ScheduleAnywhere as a distinct option; when used in a post, note the redirect so readers are not evaluating a brand that is being merged away.

**Ratings (verified 2026-06-06):**

- Capterra: 4.6/5 (61 reviews) — Product ID 134921
- GetApp: 4.6/5 (61) — same Gartner pool as Capterra
- G2 ("ScheduleAnywhere by TCP"): 4.3/5 (13) — from search snippet only; live G2 page 403-blocked. Verify before citing a G2 figure.

**Capterra URL (verified 2026-06-06):** https://www.capterra.com/p/134921/ScheduleAnywhere/

**Important caveat:** Documents a healthcare focus and a vendor claim of skills/certification/credential tracking with expiration alerts (not independently verified as a hard scheduling-enforcement gate). NOT documented on the product/healthcare page: CMS, Conditions of Participation, §485.635, audit trail, FLSA, Critical Access Hospital, 25-bed, rural (frame as "not documented on product page"). No CAH reference customers; named references are large (Atrium Health Carolinas Simulation Center, a VA system).

### Verified Reviewer Quotes (Capterra, ID 134921; verbatim, with reviewer field labels)

> "How easy it was to view and edit shifts!" [Pros]
>
> Alyssa M., RN, Hospital & Health Care, November 26, 2024, Capterra

> "recently our facility blocked staff from viewing future information on the schedule...this has been a huge dissatifyer for staff because they can't view future trades, holiday/weekend assignments, details on who they can trade with or not." [Cons]
>
> Lisa T., RN, Hospital & Health Care, May 19, 2021, Capterra

> "I wish that staff could see explanations beyond the self scheduling dates." [Cons]
>
> Laurie V., RN, Hospital & Health Care, July 22, 2021, Capterra

**Pricing:** Basic plan from $25 per user/month (Capterra); free trial available.

---

## ScheduleForward

**Product:** AI-powered healthcare staff scheduling software, originated in / marketed primarily to emergency departments (physicians + nurses). Real, distinct product at scheduleforward.com. (Founder names are NOT confirmable — a prior pass guessed "Tom Smallwood / Scott Lowry" but re-verification 2026-06-06 found no source tying those names to ScheduleForward; do NOT cite them.)

**Important caveat (data limitation, re-checked 2026-06-06):** Vendor site still returns HTTP 502 on every direct fetch; all vendor wording is search-snippet only, NOT verbatim from a live page. The "$9/user/month" ED pricing is snippet-indicated only. The "1,000+ healthcare teams" claim is NOT confirmable. Confirm exact wording on a live page before quoting anything.

**Ratings (verified 2026-06-06):**

- NO listing on any third-party review platform. Capterra returns 404 (no product ID); no G2, Software Advice, GetApp, or TrustRadius listing.

**No verified reviewer quotes exist.** No independent third-party reviews on any platform. Vendor-site testimonials are not third-party reviews and lacked full attribution — unusable. Per checklist L66, neutral product-page framing only; no quote substitution, no volume language.

**CAH/rural fit:** No documented CAH or rural-hospital focus; positioning is emergency-department / general healthcare. No CMS §485.635, FLSA, or credential-tracking feature documented. No named reference customers (only an unverified "1,000+ healthcare teams" vendor claim).

**Pricing:** ED scheduling "starts at $9/user/month" (vendor claim, snippet-sourced; confirm on live page).

---

## Shiftable

**Product:** Generic AI shift-scheduling web app (shiftable.app, by "Plain Potato"). Markets to healthcare as one vertical among retail/food/hospitality — NOT a purpose-built nurse/CAH product.

**Important caveat (data limitation, re-checked 2026-06-06):** The site is LIVE again at www.shiftable.app/en (the earlier Vercel DEPLOYMENT_NOT_FOUND has cleared), and now positions explicitly as "AI Nurse Scheduling for Healthcare Facilities" per search snippets. Direct fetches still 404 to tooling (client-side render / bot-block), so positioning is snippet-sourced and pricing is UNCONFIRMABLE — do NOT carry the 2025-08-20 Wayback pricing ($29/mo) forward as current. Name-collision warning: distinct from Shiftboard, ShiftApp, ShiftMed, Shiftbase — the relevant one is specifically shiftable.app by Plain Potato (operator low-confidence).

**Ratings (verified 2026-06-06):**

- No third-party review-platform listing on Capterra, G2, GetApp, Software Advice, or TrustRadius. No ratings exist.

**No verified reviewer quotes exist.** Only vendor-published testimonials with placeholder employers ("Nurse Manager at Healthcare Facility") — fail attribution, unusable. Neutral product-page framing only.

**CAH/rural fit:** No mention of Critical Access Hospitals, ≤25-bed, rural, or Texas. No CMS §485.635, no FLSA/8-and-80, no credential/license tracking, no HIPAA claims. Generic rule-based rostering only; example workplaces "hospital, hotel."

**Pricing (2025-08-20 archive; re-verify):** $29/month or $290/year (the FAQ inconsistently says $250/year — flag both). No free version.

---

## ShiftWizard

**Product:** Hospital nurse scheduling platform. Designed specifically for hospital nursing.
Owned by HealthStream (acquired). Used by 500+ hospital facilities.

**Ratings (verified 2026-04-30; G2 line founder-verified 2026-08-14):**

- G2: 4.3/5 across 405 reviews — founder page-verified 2026-08-14 (previously recorded without a review count). Listed as "ShiftWizard by HealthStream". G2 blocks automated fetch, so this line is human-verified, not tool-verified.
- Capterra: 4.4/5 (723 reviews; 88%+ rated 4 stars or higher)

**G2 Pricing Insights (founder screenshot, PAGE-VERIFIED 2026-08-09, re-confirmed
2026-08-14):** Time to Implement = 3 months; Return on Investment = 3 months;
Average Discount = 8%. G2 labels these "Averages based on real user reviews."
Same page shows G2 rating 4.3/5 across 405 reviews (counts drift; re-verify
past 60 days).

**How to cite it, exactly.** These are G2's AVERAGES across its own reviewer
base. They are therefore:

- NOT a vendor claim, and must never be attributed to ShiftWizard or
  HealthStream as something they state.
- NOT a single reviewer's experience, so they must not be quoted as one.
- Correct form: "G2 lists ShiftWizard's average time to implement as 3 months,
  averaged from its own reviewers."

**Comparison guardrail.** Do not set 3 months against our "onboarding takes 3
to 5 business days" number. Those measure different things: G2 is timing a
hospital buying software, setting it up, and then running it itself, while our
figure times a service being configured for a hospital that runs nothing
afterwards. The honest contrast is against our OTHER canonical number, "first
schedule inside two weeks", and it should name the delivery model as the reason
for the gap rather than implying the same job is done fifteen times faster.
That exact overclaim was caught in review on 2026-08-14 before publish.

**Capterra URL (re-verified live 2026-08-14):** https://www.capterra.com/p/178376/ShiftWizard/reviews/ — ID 178376 and the 4.4/5 across 723 reviews both confirmed on the live page header.
_(Note: product ID 210972 seen in some older URLs is incorrect — live listing is 178376. 210972 in fact resolves to DelyvaX, an unrelated delivery-management product, so it is wrong rather than merely stale.)_
_(The Erika A. and Jacob G. app-performance quotes were NOT re-located on page 1 of 723 reviews in the 2026-08-14 pass. Not disproven, only unconfirmed; page deeper or filter by star rating before citing them.)_

### Verified Reviewer Quotes

**Positive:**

> "ShiftWizard was designed by nurses which is why it is fantastic to use."
>
> Jennifer C., Director of Emergency Services, July 15, 2024, Capterra

**Negative — App Performance:**

> "Can be slow and glitchy, making inputting schedule difficult and stressful."
>
> Erika A., Registered Nurse, July 9, 2024, Capterra

> "Everything is slow and difficult to use. The app does not work well. The website is slow and takes forever to click on any options. Everything about it is a negative experience."
>
> Jacob G., Registered Nurse, Hospital & Health Care, July 18, 2024, Capterra (1.0-star review titled "Terrible system"; PAGE-VERIFIED via Playwright 2026-08-09. Same review's Pros field, usable as a sarcasm quote: "Does the job in the most bare minimum way. If you're looking to manage time with as little convenience as possible. This is for you")

**Negative — Mobile Login / Messaging:**

> "I wish the messaging was better, and that I have to input my info every time I log in."
>
> Melissa R., LVN, Hospital & Health Care, July 26, 2024, Capterra _(verified verbatim 2026-05-15)_

**Negative — Shift Type Configuration:**

> "We do not like when we have to put in a new shift type that it comes across as a code."
>
> Amanda M., QA Process Improvement Manager, July 15, 2024, Capterra

**Negative — Shift Increment Limits:**

> "Not being able to sign up for 4 hour increment shifts."
>
> Michalina W., RN, August 13, 2024, Capterra

---

## ShiftWorx (shiftworx.io)

**CRITICAL disambiguation — two unrelated products share this name; never conflate them:**

1. **ShiftWorx (healthcare)** — shiftworx.io. Healthcare workforce-management/scheduling. This is the competitor. **No third-party review listing exists.**
2. **ShiftWorx (manufacturing)** — by FreePoint Technologies. A production-floor/MES analytics product. **ALL** Capterra/G2/GetApp/SoftwareAdvice/SourceForge listings under "ShiftWorx" belong to THIS product (Capterra p/188388, 4.4/5, 22 reviews). **Never borrow its rating or quotes for the healthcare product.**

**Product (healthcare):** Workforce-management/scheduling platform for post-acute and long-term care. Documented care settings: Skilled Nursing; Assisted Living & Memory Care; Behavioral Health & Detox; Outpatient & Rehabilitation. Ownership/founder not disclosed on the site.

**Ratings (verified 2026-06-06):**

- Healthcare ShiftWorx (shiftworx.io): No Capterra, G2, GetApp, SoftwareAdvice, TrustRadius, or app-store listing found. **No third-party reviews exist.**

**No verified reviewer quotes in dossier.** Per checklist L66, all blog content must use neutral product-page framing only: no quote substitution, no volume language. Do NOT use the FreePoint manufacturing rating/quotes.

**CAH/rural fit (vendor site, verified 2026-06-06):** The words "nurse," "hospital," and "critical access" do not appear on the homepage. Documented focus is post-acute/long-term care (SNF, assisted living, behavioral health, outpatient/rehab), not acute-care hospitals. No CMS §485.635, FLSA, or specific credentialing-standard framework cited; credentialing described generically. No reference customers named. Factual differentiation point: ShiftWorx does not document hospital or CAH focus.

**Pricing:** Not published; demo-request model ("Request a Demo").

**Vendor positioning (verbatim, shiftworx.io, verified 2026-06-06):**

- "Audit-proof. Budget-proof."
- "The all-in-one workforce management platform that helps healthcare facilities reduce labor spend, automate credentialing compliance, and integrate with existing systems."
- "Cut Labor Spend by 20%" and "100% credential compliance" (vendor claims, not verified outcomes)

_(Note: some vendor copy contains em-dashes; reproduce only inside quoted vendor claims, never in our own blog prose.)_

---

## SmartLinx

**Product:** Workforce management platform for mid-size healthcare. Documented focus: long-term
care, post-acute care, senior care, behavioral health. 50-200 bed range. Requires dedicated
scheduling administrator and IT support for implementation.

**Ratings (re-verified live 2026-08-14):**

- Capterra: 4.5/5 (6 reviews; very small sample — treat as directional only). Unchanged since 2026-04-30.

**Capterra URL (verified 2026-05-15):** https://www.capterra.com/p/154002/SmartLinx/reviews/
_(Note: product ID 88988 seen in older references returns 404 — live listing is 154002)_

**Important caveat:** Primary compliance coverage targets SNF/LTC regulatory requirements,
not CAH-specific CMS §485.635. Ask for hospital-acute reference customers specifically.

### Verified Reviewer Quotes

**Positive — Implementation Support:**

> "Implementation was a breeze with resources helping and project management and user training are all included. Customer Support is very responsive and always delivers resolution quickly."
>
> Carol G., Director of IT Services, Hospital & Health Care, March 22, 2021, Capterra _(re-verified live 2026-08-14, still posted and verbatim)_

**Negative — Implementation Complexity:**

> "Implementation was much more complex that expected and end result still was full of errors on first payroll. Some changes can only be made on the back end."
>
> Daniel C., CFO, Hospital & Health Care, March 16, 2021, Capterra _(re-verified live 2026-08-14, still posted and verbatim)_
>
> _Note: "that expected" is a typo in the original review (should be "than"). Use as written — do not silently correct without [sic]._

**Negative — CMS/PBJ Reporting:**

> "Not the best at calculating PBJ for CMS - had some issues that cost money and star ratings."
>
> Rebecca K., HR, Hospital & Health Care, September 27, 2019, Capterra _(re-verified live 2026-08-14, still posted and verbatim)_

---

## symplr Smart Square

**Product:** AI-driven nurse and staff scheduling platform for health systems. Predictive analytics, real-time staffing adjustments, patented open-shift management, nurse competency integration, and time/attendance via the companion symplr Workforce product. Formerly Avantas Smart Square; acquired by symplr from AMN Healthcare on July 2, 2025 for $75M ($65M at close plus a $10M note due end of 2026). Two-time Best in KLAS for Scheduling: Nurse and Staff (2025 and 2026).

**Ratings (verified 2026-05-17):**

- G2: Listed under the symplr seller profile; symplr brand aggregate 4.3/5 (356 reviews) across all symplr products. No standalone Smart Square G2 star rating and count retrievable this pass (G2 blocks automated fetch; flagged for manual re-check at g2.com/products/symplr-smart-square/reviews before any G2 figure is cited).
- Capterra (Smart Square): 4.6/5 (19 reviews)
- Capterra (symplr Workforce, separate listing): 4.1/5 (13 reviews)
- TrustRadius: No standalone listing surfaced (verified 2026-05-17)
- Gartner Peer Insights: symplr Workforce listing exists; no usable verbatim quotes retrieved this pass
- KLAS Research: Profile exists; KLAS comments are subscriber-gated and not citable verbatim

**Capterra URL, Smart Square (verified 2026-05-17):** https://www.capterra.com/p/275941/Smart-Square/reviews/

**Capterra URL, symplr Workforce (verified 2026-05-17):** https://www.capterra.com/p/241148/symplr-Workforce/reviews/

**Important caveat:** Smart Square Capterra reviews skew heavily to large health-system roles (System Administrator, Labor Management Analyst, Director of Labor Management, COO) and the bulk of the 19 reviews are dated November 2022. No CAH, rural, or 25-bed-or-fewer reference reviews exist. Product page does not document CMS §485.635 CAH audit-trail or single-CAH deployment fit. Verify any small or rural capability directly with vendor.

### Verified Reviewer Quotes

**Positive, Empowers Staff (hospital RN):**

> "SmartSquare stands out as an exceptional tool that empowers employees."
>
> Hanna N., RN, Hospital & Health Care, July 15, 2024, Capterra _(verified 2026-05-17)_

**Positive, Cross-Unit Visibility (hospital director):**

> "You can see staff on all units in real time so you are able to balance resources."
>
> Wanda C., Director, Hospital & Health Care, November 10, 2022, Capterra _(verified 2026-05-17)_

**Negative, Learning Curve (hospital system admin):**

> "Learning SS was a challenge being as though it is a robust software."
>
> Stephanie T., System Administrator, Hospital & Health Care, November 23, 2022, Capterra _(re-verified live 2026-08-13 via Playwright; the review is still posted and the full sentence reads "As an SAA, learning SS was a challenge being as though it is a robust software capable of almost anything." Our quote is an excerpt of it, capitalised at the excerpt boundary.)_

**Negative, symplr Workforce Reliability (hospital RN):**

> "Doesn't work when needed. Most of the nurses at the hospital put their schedule in."
>
> Elisabeth C., RN, Medical Practice, May 7, 2018, Capterra _(verified 2026-05-17; symplr Workforce listing, p/241148)_

**Product positioning (from symplr.com and acquisition press, verified 2026-05-17):**

- Positioned as "AI-driven workforce optimization for health systems"; symplr states it is "trusted in 9 of 10 U.S. hospitals and 400+ U.S. health plans"
- "cloud-based SaaS workforce management solution with AI-driven scheduling capabilities such as predictive analytics, real-time staffing adjustments, open-shift management and nurse competency integration" (acquisition press release, exact phrasing)
- Vendor stat claims (exact phrasing): "forecast patient volume up to 120 days in advance"; capabilities "reduce time spent on staffing and timecard-related tasks by about 50%" and "free up as much as 75% of payroll team capacity"; a secondary "96% accuracy" forecasting figure appears only in aggregated third-party coverage and must be re-verified on symplr.com before being cited verbatim
- Two-time Best in KLAS: Scheduling: Nurse and Staff (2025; 2026, announced Feb 4, 2026)
- Pricing: not publicly published; enterprise quote-based via symplr sales

**CAH/rural fit:** Explicitly enterprise and health-system oriented. Positioning ("across the enterprise," "9 of 10 U.S. hospitals," "health systems"), reviewer roles (Labor Management Analysts, System Administrators, Director of Labor Management, COO), and the symplr Operations Platform context all point to large multi-facility systems, not standalone 25-bed-or-fewer Critical Access Hospitals. No documented CAH, rural, or small-hospital reference customers. High brand search volume (~74k/mo) reflects enterprise market penetration, not small-rural suitability. Per checklist L66, evaluative claims about CAH fit must use neutral product-page framing; do not assert CAH unsuitability without a verbatim source, frame factually as enterprise/health-system positioned with no documented CAH references.

---

## TCP TimeClock+

**Product:** Time and attendance platform with scheduling features built in. Separate from
TCP Aladtec (same parent company, TCP Software, but distinct products). Has staff-facing
mobile app for clock-in/out and schedule viewing.

**Ratings (re-verified live 2026-08-14):**

- Capterra: 4.4/5 (271 reviews). Unchanged since 2026-05-12; the live page header reads "4.4 (271)" and the review list reads "Showing 1-25 of 271 Reviews".

**Capterra URL (verified 2026-08-14):** https://www.capterra.com/p/21548/TimeClock-Plus/reviews/ — product ID 21548 CONFIRMED. This row previously carried a `[verify-ID]` placeholder, so the URL was unusable. Note a live trap: a web search returned "226 reviews" for this product on the same day the page itself showed 271. Search snippets are not page verification.

**Important caveat:** Scheduling is secondary to time and attendance. Some hospital users
describe the scheduling features as basic. Do not conflate with TCP Aladtec (separate product).

### Verified Reviewer Quotes

**Negative — Scheduling Depth:**

> "The scheduling aspect leaves a bit to be desired."
>
> Karen L., Payroll, Hospital & Health Care, June 2025, Capterra _(NOT RE-LOCATED on refresh 2026-08-14: absent from pages 1 and 2 of the default "most helpful" sort across 271 reviews. The quote is not disproven, only unconfirmed. Re-locate it before citing, or use the Donna L. quote below, which is page-verified and makes the same point more strongly.)_

**Negative — Configuration Complexity:**

> "Because TCP is highly customizable, configuring features may be complicated and/or confusing."
>
> Donna L., April 2026, Capterra _(re-verified live 2026-08-14, still posted and verbatim)_
>
> _Excerpt note: the full Cons field continues "Many of the TCP features interact with each other, so knowing what changes need to be made or how those changes may affect associated features may be confusing to new administrators." Our quote is the opening sentence, which is fair, but the continuation is stronger evidence for the configuration-burden theme if a post needs it._

---

## UKG (formerly Kronos)

**Product:** Enterprise workforce management suite. Scheduling, time and attendance, HR, payroll,
analytics. UKG states it serves more than 3,500 healthcare organizations in the US
(ukg.com/industry-solutions/healthcare, verified 2026-07-01). Built for large facilities with
dedicated IT departments and HRIS staff. Capterra positions UKG Pro as "the Workforce Operating
Platform," built primarily for enterprises.

**Ratings (verified 2026-07-01):**

- Capterra (UKG Pro): 4.3/5 (726 reviews) — Product ID 480
- Capterra (UKG Ready): 4.2/5 (1,143 reviews) — Product ID 198579
- Capterra (Kronos Workforce Central): Product ID 212370 seen in SERP; reviews URL 404'd, rating not captured
- G2 (Kronos Workforce Central): 3.9/5 (733 reviews) — snippet only, page 403-blocked, verify before citing

**Capterra URL (verified 2026-07-01):** https://www.capterra.com/p/480/UKG-Pro/reviews/

**Important caveat:** Reviewers on the major platforms are predominantly HR, payroll, and
operations roles on the HCM/WFM suite, NOT self-identified frontline nurses. No independent
Critical Access Hospital / rural / ≤25-bed reviews of UKG were found on Capterra, G2, or nursing
community forums (allnurses/Reddit r/nursing) as of 2026-07-01. The nurse-community phrase
"Kronos is garbage" has NO attributable r/nursing source (an exact-phrase search surfaced only a
Glassdoor employee review, a Quora question, and a synth forum) — do NOT present it as sourced
nurse sentiment. Frame small-hospital fit as "verify with vendor"; no volume language.

**Product lifecycle fact (verified 2026-07-01):** Legacy Kronos Workforce Central is retiring.
On-premise Workforce Central end of life = March 31, 2027; Kronos Private Cloud hosting reached
end of life Dec 31, 2025; announced Oct 2022. Sources: Healthcare IT Leaders
(healthcareitleaders.com/blog/ukg-workforce-central-wfc-end-of-life/), RSM US. Supports a
"legacy/end-of-life, confirm which UKG product you are buying" framing.

### Verified Reviewer Quotes (verbatim, Capterra UKG Pro p/480, verified 2026-07-01)

_All four reviewers are administrative power users on UKG's own suite (HR / payroll / ops roles),
NOT nurses. Use them for the "even admin power-users report complexity" angle, never as nurse voices._

**Reporting / Complexity:**

> "The reporting could be more user friendly. There are many standard reports available for your use, however trying to build a custom report on your own is very complicated if not impossible."
>
> Felicia W., Payroll Consultant, Automotive, April 8, 2026, Capterra

> "Some areas of the platform can be complex for new users, and certain reports or customizations may require additional training or administrative expertise. System updates occasionally introduce workflow changes that require adjustment."
>
> Swaminathan S., HR Assistant, Hospitality, June 18, 2026, Capterra

**Usability / Support:**

> "The software was difficult to use and not user friendly. Users couldn't locate benefit enrollment and had issues adjusting tax setup and other info."
>
> Patricia K., Senior HR Generalist, Plastics, April 2, 2026, Capterra

**Mobile:**

> "The mobile app needs to be updated to include more features, for example, document acknowledgment. There are many end users who primarily use their mobile phones and will not use a computer; it is critical for the mobile app to provide all of the same options as the online version."
>
> Jessica J., Senior Director, People and Culture, Staffing and Recruiting, April 21, 2026, Capterra

_(UKG Ready hospital-industry reviewers who commented were mild and do not support a complexity
critique; one Hospital & Health Care reviewer, Mayted B., Mar 27 2026, noted "always having system
issues as in minor bugs here and there" — verbatim, typos preserved — usable only as a minor
"occasional bugs" note, not a complexity claim.)_

**Unverified (snippet-only, do NOT quote as exact):** allnurses thread "Electronic scheduling -
Need some advice (Kronos/Cerner)" (403-blocked, real nurse thread but wording unconfirmed);
G2 UKG snippets on "steeper learning curve"; TrustRadius "Kronos Workforce Ready - Arguably the
Worst Application You Could Choose" (403-blocked). A human must open these pages manually to
promote any quote to verified.

---

## When I Work

**Product:** Scheduling app for retail, hospitality, small business. Mobile shift pickup,
swap requests, availability. Transparent per-user pricing with free tier.

**Ratings (verified 2026-04-30):**

- Capterra: 4.5/5 (1,289 reviews)

**Important caveat:** Product page does not document HIPAA, BAA, CMS §485.635 audit-trail,
FLSA 8-and-80 tracking, or credential constraints. Verify with vendor for hospital use cases.

### Verified Reviewer Quotes

**Negative — Audit Capability:**

> "No Auditing capability to see if unauthorized changes were made, and does not work for complex workflows."
>
> Jonathan R., IT Admin, Hospital & Health Care, February 25, 2026, Capterra

**Negative — Time-Off Visibility:**

> "I don't like that when providers have time off requests, they cannot view shifts."
>
> Mallory S., Clinical Operations Manager, Hospital & Health Care, February 12, 2026, Capterra

---

## Competitors Not Yet in Dossier

The following appear in posts but have no verified quotes collected yet. Go online for these:

- **Connecteam** — mentioned in deputy-alternatives-healthcare.md
- **OnShift** — Capterra ID 122212, 3.9/5 (verified 2026-06-15). Positioning: multi-facility senior care. OWNERSHIP RESOLVED 2026-08-06: acquired by ShiftKey (strategic investment June 2022, FULL integration announced July 2023 per shiftkey.com/resources/news/shiftkey-fully-integrates-onshift; cross-checked Mergr/PitchBook). Approved wording: "OnShift (now part of ShiftKey)". NEVER "now part of Workday" (a pre-rewrite best-nurse-scheduling-app draft asserted this; it is wrong). FABRICATED quote, do not cite: "Our site has 4 employees and the system was overkill" (exists on no source).
- **Shiftboard** — Capterra product "ScheduleFlex" ID 81956, 4.4/5 (verified 2026-06-15). Markets to organizations of 25 to 100,000 employees. FABRICATED quote, do not cite: "Minimum 100 employees to be viable." The 100-employee figure traces only to a Connecteam author's account of a sales call (connecteam.com/reviews/shiftboard), not a documented policy or a customer review.
- **TCP Scheduling** (enterprise tier, separate from Aladtec and TimeClock+)
- **QGenda** — Capterra ID 90628, 4.2/5 (verified 2026-06-15). Positioning: large physician/provider groups. FABRICATED quote, do not cite: "Not designed for smaller practices" (third-party blog paraphrase only, not a real review).

_(ScheduleAnywhere, ScheduleForward, Shiftable, and EasyShifts were added as full sections on 2026-06-06.)_

---

## YouShift

**Product:** AI shift scheduling for physician/clinician groups (you-shift.com; YC W25, founded ~2024, Harvard-founder team, Spanish origin — "guardias médicas" on-call scheduling). Self-described (YC company page, verified 2026-07-06): "an intelligent scheduling engine that handles complex rules, compliance, and real-world operational constraints at scale"; job-posting copy: "leverages cutting-edge optimization algorithms and agentic AI to create shift schedules that respect both hospital needs and staff preferences" and "admins configure their group's rules once (coverage requirements, fairness constraints, physician contracts, time-off policies) and our engine generates optimized schedules in minutes." Buyers named: "CMOs, COOs, VPs of Workforce." Web + iOS (App Store id6754463641, tagline "Shift. Swap. Done.") + Android (com.youshift.app).

**Ratings (verified 2026-07-06):**

- G2: No listing found
- Capterra: No listing found
- Trustpilot / Product Hunt: No listing found
- App Store: "This app's overall rating was recently reset" — no visible rating

**No verified reviewer quotes in dossier.** Zero independent third-party reviews exist as of 2026-07-06. Neutral product-page framing only per checklist; no quote substitution.

**Scheduling mechanism:** Publicly undisclosed. No named solver (no OR-Tools/CP-SAT/LP anywhere in public materials), no engineering blog, no GitHub org, no founder papers. Marketing terms only: "optimization algorithms" + "agentic AI." Fairness: a staff "points system" for weighting preferences is consistently described across sources but was NOT verbatim-confirmed on you-shift.com (JS-rendered SPA, unfetchable) — treat as directional, not quotable. Staff can reportedly block dates without supervisor approval (El Español, 2024-11).

**Traction (their own figures):** "More than 1000 doctors across Europe and the US" (YC page); CSM job posting cites "10 client groups" (physician count in that posting reported inconsistently across research passes — 200+ vs 2,000+; unresolved, do not cite a number). ~$500K seed (Tracxn; Bain Capital Ventures involvement UNVERIFIED). Team ~10. No named hospital customers anywhere.

**Pricing:** Not published. Third-party "$49/mo" figure (shyft.ai) carries its own inaccuracy disclaimer — do not cite.

**CAH/rural/nurse fit:** None documented. Physician/resident groups are the demonstrated lane; no nurse-unit, CAH, or rural language found. Sales-led onboarding (CSM role, 60-day internal playbook), self-serve signup page exists but flow unverified.

**Playwright-rendered site pass (verified 2026-07-12; the SPA finally read):**

- Positioning now: "The Operating System for Healthcare Workforce" (homepage H1). Verbatim capability card: "AI Scheduling Agents: AI agents that configure rules, collect clinician availability, and generate schedules for you." FAQ verbatim: agents are "currently in early access and will be rolling out broadly in upcoming releases" — the agentic layer is being BUILT now, not mature.
- Engine FAQ verbatim: "Our optimization engine ingests your full set of operational rules, clinician preferences, productivity targets, and cost constraints — then generates compliant, balanced schedules in minutes." Still no solver named.
- Pricing FAQ verbatim: "Pricing is based on organizational size, number of clinicians, and deployment scope. We partner with enterprise clients..." — confirmed NOT published; the third-party "$49/mo" remains do-not-cite.
- Scale FAQ verbatim: serves "organizations managing hundreds to thousands of clinicians across multiple facilities" — explicitly enterprise; not the CAH lane.
- MANAGED-SERVICE CONVERGENCE: differentiator #3 verbatim: "A True Operational Partner... if needed, our team manages your scheduling end-to-end, removing the administrative burden from your organization." They now offer a service mode alongside software.
- Clinician app: preferences, time-off, swaps, "clock in and out, track hours and compensation" — time tracking shipped.
- The "points system" appears NOWHERE on the current rendered site — treat it as legacy (2024 Spanish press) unless re-confirmed; do not cite as current mechanism.
- Implementation FAQ: "Most teams are fully onboarded within weeks. Our implementation team handles rule configuration, data migration, and initial schedule generation."

**Caution:** youshift.vercel.app is a FAN-MADE clone ("YouShift Reimagined" by an independent developer) — never cite anything from it, including its testimonials.

---

## Maintenance Log

| Date       | Action                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-04-30 | Initial quotes sourced from Capterra/G2 for all published alternatives posts                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2026-05-15 | Verified verbatim: Melissa R. (ShiftWizard), Carol G. + Daniel C. (SmartLinx), Amber B. + Angela P. (Homebase), Portia A. + Julie B. + Jackie D. (Deputy). Corrected Capterra product IDs for ShiftWizard (178376), SmartLinx (154002), Homebase (153076), Deputy (167811).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-05-16 | Added In-House Health and M7 Health sections (VC-funded AI nurse-scheduling startups). In-House Health: no G2 listing, no Capterra listing, zero third-party reviews (verified 2026-05-16). M7 Health: Capterra listing confirmed (product ID 10037829) but 0.0/5 with 0 reviews, no accessible G2 listing, zero third-party reviews (verified 2026-05-16). Both: no usable verbatim quotes, neutral product-page framing required per checklist L66. Positioning and vendor stat claims captured verbatim from own sites and public press.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-05-16 | Secondary source pass (beyond G2/Capterra) for In-House Health + M7. Checked Software Advice, GetApp, Gartner Peer Insights, Apple App Store, Google Play, Reddit, LinkedIn, Product Hunt. In-House Health: iOS/Android apps exist (rating not retrievable, flagged for re-check); named PR quote (Kerridge, Chicago VA, via Fierce). M7: no consumer app; named partnership-PR quotes (Trainor/Ochsner, Jay/ScionHealth) on customer newsrooms. No independent third-party reviews found anywhere. Neutral product-page framing confirmed to stand for both.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2026-05-17 | Added symplr Smart Square section (formerly Avantas Smart Square; acquired by symplr from AMN Healthcare 2025-07-02, $75M). Verified verbatim: Hanna N., Wanda C., Stephanie T. (Smart Square, Capterra p/275941, 4.6/5, 19 reviews); Elisabeth C. (symplr Workforce, Capterra p/241148, 4.1/5, 13 reviews). G2 standalone Smart Square rating not retrievable (G2 blocks automated fetch); symplr brand aggregate 4.3/5 (356) noted, flagged for manual re-check. KLAS profile subscriber-gated. No CAH/rural reference customers; neutral product-page framing per checklist L66.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 2026-08-12 | Added Microsoft 365 Copilot + Teams Shifts section for the Copilot post. Page-verified Copilot's actual headline ("AI built for work") and Work IQ description; recorded that "productivity companion" appears NOWHERE on the page after a pre-publish review caught our draft attributing it as a quasi-quote. Recorded the CRITICAL framing rule: Copilot grounds on tenant data via Work IQ, so "no access to your roster" is false — limitations must be framed as ENFORCEMENT gaps, not access gaps. Added Teams Shifts (included with Teams; clock in/out, time off, swaps, open shifts; no healthcare compliance/overtime/credential claims) because it is the honest answer to "can we use what we already pay for". | Claude |
| 2026-08-19 | M7 Health Capterra listing re-verified live via Playwright: still `Based on 0 user reviews`. Ratings row date advanced from 2026-05-16. Used in the `m7-health-alternatives` comparison table, which now carries real ratings for ShiftWizard (4.3/405 G2, 4.4/723 Capterra) and Aladtec (4.5/94 G2, 4.6/17 Capterra) instead of yes/no. |
| 2026-08-10 | First full competitor-watch run (new `npm run competitor-watch`, 17 pages baselined). Added August update blocks to M7 Health and In-House Health. M7: homepage category label changed to "The AI-powered workforce operations platform for healthcare"; new `/roi-calculator` (bed-count sizing) and `/implementation` (four-week rollout, "IT team's role is minimal"); customer wall expanded to ~17 additional small rural/community hospitals via Lifepoint/ScionHealth (bed counts UNVERIFIED — the no-standalone-CAH-customer line still stands); SEO footprint is 24-of-25 branded/Ochsner navigational; 101 referring domains are job boards + VCs + aggregators with 47 on the bare homepage and one backlink on their best content page. In-House Health: homepage rewritten to "Restore Sustainability to Nursing" with four vendor metrics ($270K/unit/yr, 5.5H/user/wk, 31%, 4 weeks), `/skilled-nursing` segment page added, ~35-post content library + `/case-studies/the-center-at-lowry`, most-cited modern rival in the 2026-08-09 LLM autopsy; "$15M raised" secondary figure UNVERIFIED, do not cite. Neither publishes pricing (both `/pricing` URLs 404, now held as sentinels). Full analysis: `docs/seo/competitor-intel-2026-08.md`. | Claude |
| 2026-08-09 | ShiftWizard G2 Pricing Insights PAGE-VERIFIED via founder screenshot: Time to Implement 3 months, ROI 3 months, avg discount 8% (G2: averages from real user reviews); G2 rating 4.3/5, 405 reviews. Review-mining verification sweep now 5/5 COMPLETE — topics 1 and 2 of next-15 fully armed. | Founder + Claude |
| 2026-08-09 | PAGE-VERIFIED 4 of the 5 review-mining quote candidates via Playwright (real-browser pass beat the HTTP 403s): NurseGrid "Please Bring back the mobile app" = Nika S., Inpatient Director, Jun 17 2024 (same reviewer as the Android quote, name now known); QGenda pricing + hidden-costs + talk-to-3-people support quotes = Wilmer R., Practice Administrator, Mar 19 2026; ShiftWizard "website is slow and takes forever" = Jacob G., RN, Jul 18 2024, 1-star "Terrible system"; Deputy 12-month lock-in ($57/$572) = "Paul", AU, Trustpilot Apr 8 2026 + aggregate 2.8/5, 124 reviews, 24% 1-star. REMAINING: G2 ShiftWizard implementation-time field — G2 hard-blocks by device fingerprint; founder to open g2.com/products/shiftwizard/reviews manually. | Claude |
| 2026-08-06 | OnShift ownership RESOLVED for best-nurse-scheduling-app publish: ShiftKey acquired OnShift (2022 investment, full integration July 2023, shiftkey.com news + Mergr/PitchBook cross-check). Approved: "now part of ShiftKey"; the draft had claimed "now part of Workday" (wrong, removed). | Claude |
| 2026-07-15 | Re-verified 7 vendors' ratings for the best-per-diem-nurse-scheduling-software post (Capterra page-verified, G2 search-indicated). Aladtec Capterra 4.6/17 (ID 248403) / G2 4.5/94; NurseGrid Capterra 4.2/13 (ID 254829) / G2 4.6/5; SmartLinx Capterra 4.5/6 (ID 154002) / G2 3.8/11; QGenda Capterra 4.2/68 (ID 90628) / G2 4.6/164; OnShift Capterra 3.9/14 (ID 122212) / G2 4.5/40; Deputy Capterra 4.6/773 (ID 167811) / G2 4.6/666; UKG Pro Capterra 4.3/727 (ID 480) / G2 4.3/2,167. Existing sections (Aladtec, NurseGrid, QGenda, Deputy) updated inline; SmartLinx/OnShift/UKG used in-post with verbatim quotes from their Capterra pages (SmartLinx Daniel C.; UKG Swaminathan S.; OnShift ratings-only, no dossier quote) — full standalone sections for those three are a TODO. G2 counts approximate (403 on fetch); watch seller-aggregate vs product-page figures (Aladtec/UKG). |
| 2026-07-15 | Refreshed Homebase ratings (dossier had tipped to 61 days). Capterra page-verified 4.6/5, 1,151 reviews (was 1,147; rating unchanged) via live product-page fetch. G2 could not be page-verified (403 on all g2.com fetches); its public listing now shows 539 reviews (title-confirmed) and a 4.6/5 rating (search summary), up from the 2026-04-30 page reading of 4.4/5 (271) — flagged as search-indicated in the section. Bumped dossierVerifiedDate in competitors.json to 2026-07-15. The two Amber B. + Angela P. Capterra quotes carried forward from the 2026-05-15 verbatim check (Capterra reviews persist; not re-fetched from pagination). |
| 2026-06-06 | Added AMiON (Amion) and ShiftWorx (healthcare, shiftworx.io) sections from the 2026-06-05 DataForSEO LLM-citation gap pull. AMiON: Doximity-owned (acq. from Spiral Software 2022) enterprise physician on-call scheduling; Capterra ID 9064 (slug "OnCall"), 5.0/1 review; no G2; App Store id481079171, 4.4/~5.6K; 1 verbatim Capterra review (Christopher G.); App Store review bodies truncated, titles only confirmed. ShiftWorx: HARD name collision with FreePoint Technologies manufacturing product (which owns all directory listings incl. Capterra p/188388); healthcare shiftworx.io has ZERO third-party reviews, post-acute/LTC focus, no hospital/CAH language, neutral framing only. Research on ScheduleAnywhere, ScheduleForward, Shiftable, EasyShifts was attempted same day but interrupted by a session limit — still pending.                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2026-06-06 | Re-verification pass (Playwright/web). EasyShifts: confirmed exact Capterra dates for all 3 quotes (Jenafer J. 2024-01-16; Johanna Y. 2025-09-04; Cindee A. 2025-10-08, all Capterra ID 228499) — quotes now publish-ready; corrected Cindee A. source from GetApp to Capterra and expanded her con verbatim. ScheduleForward: site still 502 to direct fetch; removed unconfirmable founder names (Tom Smallwood/Scott Lowry); "$9/user/mo" and "1,000+ teams" flagged snippet-only/unconfirmable; still zero third-party listings. Shiftable: site is LIVE again (Vercel error cleared), now positions as "AI Nurse Scheduling for Healthcare Facilities"; pricing unconfirmable, do not use Wayback $29/mo; still zero third-party listings. Separately, CFR cites for the CMS-compliance blog post were Playwright-verified against eCFR: 30-min rule is §485.618(d) emergency-care practitioner (not §485.635); RN/CNS/LPN on duty is §485.631(a)(5).                                                                                                                                                                                                                                                                                                               |
| 2026-06-06 | Completed the remaining 4 from the LLM-citation gap pull. ScheduleAnywhere: now TCP-owned (acq. from Atlas Business Solutions), Capterra 4.6/61 (ID 134921), GetApp 4.6/61, G2 4.3/13 (snippet only, 403-blocked, verify); 3 verbatim RN reviewer quotes; healthcare focus + vendor credential-tracking claim, no CMS/FLSA/CAH docs; Basic from $25/user/mo. ScheduleForward: real ED-origin AI scheduler, vendor site 502 (snippet-sourced only), ZERO third-party listings/reviews anywhere, no CAH/CMS/FLSA docs, ED pricing "$9/user/mo" vendor claim — neutral framing only. Shiftable (shiftable.app by Plain Potato): generic horizontal AI scheduler, live site DOWN (Vercel), Wayback 2025-08-20 sourced, ZERO third-party reviews, vendor testimonials use placeholder employers, no CAH/CMS/FLSA/HIPAA, $29/mo — neutral framing only. EasyShifts (easyshifts.com, RN-founded 2008, SOC 2 Type II): Capterra 4.6/60 (ID 228499; older 241775 exists, do not cite), GetApp 4.6/60 same pool, G2 403/unconfirmed; verbatim quotes captured but DATES must be re-verified before publishing; general hospital + senior-living focus, no CAH/CMS/FLSA/credential docs; pricing conflict (official "Contact us" vs third-party ~$2.99–3.99/user/mo), 90-day trial. |
| 2026-06-12 | Added CronShift (cronshift.com, healthcare WFM platform): no G2, no Capterra, zero third-party reviews anywhere; site metrics are vendor claims; no CAH/rural docs; neutral product-page framing required. Added AI-visibility notes to M7 Health + CronShift: ChatGPT now ranks M7 FIRST for _best nurse scheduling software for critical access hospitals_ (citing recently published M7 CAH guidance) with CronShift also recommended and cited — the formerly open AEO lane (Jun 5 gap pull) is now contested. M7 = most direct AEO competitor.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 2026-07-01 | Rebuilt the UKG (Kronos) section with live-verified data (was ratings-untracked, zero quotes). Verified verbatim on Capterra UKG Pro (p/480, 4.3/5, 726 reviews): Felicia W. (reporting "very complicated if not impossible"), Swaminathan S. ("complex for new users"), Patricia K. ("difficult to use and not user friendly"), Jessica J. (mobile app missing features) — all HR/payroll/ops roles, NOT nurses; flagged for "admin power-user" framing only. Captured UKG Ready (p/198579, 4.2/5, 1,143) + minor "system issues/bugs" note (Mayted B., Hospital & Health Care). Recorded Kronos Workforce Central end-of-life (on-prem Mar 31 2027; KPC Dec 31 2025; Healthcare IT Leaders + RSM sources). KEY finding: "Kronos is garbage" has NO attributable r/nursing source; allnurses/G2/TrustRadius nurse threads all 403-blocked (snippet-only, unverified). No independent CAH reviews of UKG exist. Used to pivot kronos-nurse-scheduling-problems-small-hospitals.md from unsourced "what nurses say" sentiment to a factual "built for enterprises, not CAHs" angle (still draft:true).                                                                                                                                                                    |
| 2026-07-06 | Added YouShift (you-shift.com, YC W25 physician-group AI scheduler): no G2/Capterra/Trustpilot/Product Hunt listings, App Store rating reset — zero third-party reviews, neutral framing only. Solver undisclosed ("optimization algorithms + agentic AI" marketing only); points-based preference system directional-not-quotable (site is unfetchable SPA); "$49/mo" is an unreliable third-party figure, do not cite; physician not nurse focus, no CAH/rural docs; flagged fan-clone youshift.vercel.app as a citation trap. |
| 2026-07-06 | M7 Health deep tech/GTM pass: solver undisclosed everywhere (job req frames AI/ML as to-build; turnover feature = baseline-deviation rules); AI copy outcome-framed only; no native mobile app (store-searched, absent); $10M Series A 2025-07 (Threshold), Ochsner 47-hospital rollout 2026-02; ALL named customers are systems — zero named CAH customers/case studies; CAH authority post (2026-04-01, ChatGPT-cited) is proof-free positioning. Full profile appended to M7 section. |
| 2026-07-12 | YouShift Playwright site pass (SPA rendered): agents "early access" (verbatim), enterprise pricing unpublished (verbatim FAQ), "hundreds to thousands of clinicians" scale, NEW managed-service option ("our team manages your scheduling end-to-end"), time tracking shipped, points system ABSENT from current site (downgrade to legacy claim). Also fetched ARISE bibliography appendix — primary citations verified into facts-dossier. |
