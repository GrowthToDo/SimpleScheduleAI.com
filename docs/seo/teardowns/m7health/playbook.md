# M7 Health growth teardown

- **Subject:** M7 Health (m7health.com), nurse scheduling platform, acquired by Ascend Learning on 2026-09-21
- **Built:** 2026-11-17, for SimpleScheduleAI
- **Method:** Corey Haines' "reverse engineer marketing" approach, done by hand: a dated history of what the company did, set against one traffic curve, ending in plays to copy and plays to skip
- **Companion files:** `traffic.csv` (the monthly curve) and `moves.csv` (50 dated moves, each with its source)
- **Labels used throughout:** **Observed** (link or data row given), **Inferred** (the basis is stated), **Not found**, **Dossier** (verified earlier in `docs/seo/competitor-dossier.md`, under 60 days old, used as is with its date)

---

## Summary

1. **M7 grew by going live in hospitals, not by marketing.** Their search traffic stepped up four times since 2023. Today 99.5% of their estimated organic visits come from people searching the brand or a login phrase, and 41% come from searches that carry Ochsner's name (Observed, DataForSEO Labs ranked keywords, pulled 2026-11-17). Searches for "m7 ochsner login" went from nothing to 1,300 a month between Oct 2025 and Jun 2026 (Observed, Labs keyword history). The traffic curve is a record of nurses logging in. It does not show demand capture. Funding news sits next to one of the steps (the Series A in Jul 2025), so timing is a lead, not a cause.

2. **Their sales engine runs through parent health systems, and it ran with no account executive.** M7 says it "activated over 100 net new hospitals across 29 states, last year alone" (Observed, every Ashby job post, fetched 2026-11-17). In July 2026 they were still hiring "our first Account Executive" (Observed, Ashby, posted 2026-07-21), a seat first advertised on 2025-10-11 (Observed, archived Breezy board). The logos arrived through Ochsner (47 hospitals), Lifepoint and ScionHealth (Dossier). Inferred: the hospital count came from system-wide rollouts sold by the founders, not from one-hospital-at-a-time selling.

3. **Their content is a sales tool, not a traffic source.** Thirteen blog posts, two gated white papers built on original numbers (a survey of 258 nurses across 100+ hospitals, and an analysis of nearly 1.9 million nursing shifts), and gated case studies with hard figures (Observed, live /resources, 2026-11-17). Together the content pages earn about 4 estimated visits a month (Observed, ranked keywords). The research papers get pushed on LinkedIn with tagged campaign links (Observed, a "Q1 March 2026 White Paper" UTM URL archived 2026-04-04).

4. **They now claim our wedge, humans included.** Besides the CAH page (Dossier), M7 hired remote contract nurses in Sep 2025 to "review and approve nurse schedules" for hospital partners (Observed, archived "M7 Nurse Ambassador" post, captured 2025-09-28). They published "The People Behind the Product" on 2026-08-12 (Observed). A buyer can now hear "people check your schedule" from both of us.

5. **The weak spots are real and dated.** They have no independent reviews (Capterra 0, G2 two seller-invited reviews; Dossier, 2026-11-03). No price has ever been archived (Observed, zero /pricing URLs in Wayback). The CAH claim names states, not hospitals (Dossier, 2026-11-03). The blog has had no new post since 2026-09-09, the last one before the acquisition (Observed, live /blog index, 2026-11-17).

**The one play to start:** a short survey of Texas CAH nurse leaders, run through personal contacts, published ungated with its real n. It copies the one M7 asset that is both citable and a reason to talk to buyers, at a size one founder can carry. See "Plays" below.

---

## 1. The curve

Source for the whole curve: **DataForSEO Labs `historical_rank_overview`**, m7health.com, Google US, English, pulled 2026-11-17. "Visits" means DataForSEO's estimated organic traffic (etv). It is a model, not analytics. Brand demand comes from a separate source, **Labs `historical_keyword_data`** (monthly Google search volume, US), and is never added to the traffic numbers. Full monthly rows are in `traffic.csv`.

| Period | Est. organic visits/month (Labs, pulled 2026-11-17) | Ranked keywords | What it looks like |
| --- | --- | --- | --- |
| May to Oct 2023 | 0 to 14 | 2 to 5 | Site exists, ranks for almost nothing |
| Nov 2023 to Mar 2024 | 210 to 281 | 4 to 6 | First brand rankings |
| Apr to Dec 2024 | mean 661 | 8 to 28 | First plateau |
| Jan to May 2025 | 672 to 1,019 (Jan one-month spike) | 18 to 38 | Flat |
| Jun 2025 to Jan 2026 | mean 1,327, rising every month to 1,650 | 42 to 163 | Second plateau, about 2.0x the 2024 level |
| Feb to Jul 2026 | 999, 901, 2,022, 2,156, 733, 844 | 158 falling to 77 | Noisy; site relaunch; long tail lost |
| Aug to Nov 2026 | mean 1,719 (1,668 to 1,844) | 114 to 122 | Third plateau, about 1.3x the late-2025 level |

Means and ratios computed in code from `traffic.csv`.

**Brand demand ("m7 health", Labs historical_keyword_data, pulled 2026-11-17):** 14,520 searches in the 12 months to Sep 2026 against 7,990 in the 12 months before, up 81.7% (computed in code). Monthly peak 1,900 in Jan 2026. "m7 ochsner login" first shows volume in Oct 2025 (90) and peaks at 1,300 in Jun 2026.

### Inflection months

The rule: a step up that holds for two months or more. The code flags a month when that month and the next both run at least 1.3x the mean of the three months before (column `step_up_held_2mo` in `traffic.csv`).

| # | Month | Step | Moves within about two months | Other explanations to keep in view |
| --- | --- | --- | --- | --- |
| 1 | Nov 2023 | 14 to 274 | Homepage H1 rewrite captured 2023-11-29 (Observed) | First indexing of a young site. This is how a brand starts to rank, not a growth event |
| 2 | Apr 2024 | 281 to 542, held all 2024 | ScionHealth partnership announced 2024-02-22 (Observed); /product page first archived 2024-02-27 (Observed); brand searches peak at 590 the same month (Observed) | First enterprise customer's nurses starting to log in (Inferred from the brand-search jump) |
| 3 | Jun 2025 | 720 to 1,041, then up every month to 1,650 | Second site build about 2025-05-22 (Inferred from the Webflow site ID); Series A 2025-07-15 with Fierce Healthcare coverage (Observed); Operations Lead hire 2025-06-16; "live in over 50 hospitals, dozens more going live" by Sep 2025 (Observed) | **Funding and press** land in month two of the step. Ochsner login searches start in Oct 2025, so the later climb lines up with go-lives |
| 4 | Aug 2026 | 844 to 1,668, held through Nov | Workday partnership 2026-08-25; Ascend acquisition 2026-09-21 (both Observed). Neither explains August itself | The step is almost all login and brand searches (see section 3). Inferred: user growth at Ochsner (their case study says Ochsner is "doubling the number of users") |

**Not an inflection: the Apr and May 2026 spike.** The estimate jumped to about 2,000 for two months, then fell to 733 in June. The code flags April under the two-month rule, but the step reversed in month three, so this report does not count it. At the same time the ranked keyword count fell from 158 (Feb) to 84 (May), during the site relaunch first archived 2026-03-14 (Observed). Hypothesis: a few high-volume login rankings came and went while the relaunch cleared out the long tail. Test that settles it: pull Labs `historical_serps` or month-by-month ranked keywords for Feb to Jun 2026 (not run, to save budget).

**Seasonality.** Not established. The curve shows January bumps twice: the Jan 2025 one-month spike, and the brand-search peak in Jan 2026. One Hypothesis is new-year schedule cycles. Two points are not a pattern. The category term "nurse scheduling software" returned Labs volumes that cannot be right (27,100 in Jul 2024 against 390 a few months before and after), so no category seasonality line is drawn from it.

---

## 2. Timeline (condensed)

All 50 rows, each with its source link, are in `moves.csv`. These are the ones that matter.

| Date | Move | Label |
| --- | --- | --- |
| 2023-03-25 | First archived homepage: "The future of work for nursing is now.", 272 words, one demo CTA | Observed |
| 2024-02-22 | ScionHealth partnership (first named enterprise customer) | Observed |
| 2024-09-06 | $4M seed (First Round). H1 becomes "A modern way to manage your nursing workforce" | Observed |
| 2024-10 to 2024-12 | First real hiring wave: Head of Engineering, full-stack engineer, ops analytics, customer ops, account manager | Observed |
| ~2025-05-22 | Second site build (Webflow, agency-built) | Inferred |
| 2025-07-15 | $10M Series A (Threshold), Fierce Healthcare coverage | Observed |
| 2025-09-28 | "M7 Nurse Ambassador": contract nurses who review and approve schedules; "live in over 50 hospitals" | Observed |
| 2025-10 | Ochsner login searches begin | Inferred |
| 2025-10-11 | Account Executive seat first advertised | Observed |
| ~2026-02-20 | Third site build begins | Inferred |
| 2026-02-23 | Ochsner system-wide launch across 47 hospitals | Dossier |
| 2026-03-14 | New site live: "AI-powered workforce operations platform", stat row (35% / 60% / 30%), and /platform, /who-we-help, /implementation, /roi-calculator | Observed |
| 2026-03 | Q1 white paper pushed on LinkedIn with UTM tags | Observed |
| 2026-04-01 | CAH blog post by the co-founder | Dossier |
| 2026-04-18 | /blogs family first archived (7 posts) | Observed |
| 2026-07-14 to 07-15 | Case studies (ScionHealth, Oula). Integration and implementation hires, including a UKG/Kronos deployment strategist | Observed |
| 2026-07-21 | Moves to the Ashby ATS. "As our first Account Executive" | Observed |
| 2026-08-25 | Workday partnership (certified integration) | Observed |
| 2026-08-31 | Integrations job names UKG, Symplr, Workday, ADP | Observed |
| 2026-09-01 to 10-01 | Funding amounts removed from the homepage | Observed (watch log) |
| 2026-09-09 | Last blog post to date ("Three Ways to Send Fewer Shifts to an Agency") | Observed |
| 2026-09-21 | Acquired by Ascend Learning | Observed |
| 2026-11-06 | Operations Lead and Tech Lead, Platform posted under Ascend | Observed |
| Undated | Gated white papers (258-nurse AI survey; 1.9M-shift call-in analysis) and Ochsner "IS Project of the Year" case study | Observed (publish dates Not found) |

---

## 3. Search footprint now

Source: **DataForSEO Labs `ranked_keywords`**, m7health.com, US, top 100 of 109 by traffic, pulled 2026-11-17. Domain total about 1,802 estimated visits/month. Bucket shares computed in code.

| Bucket | Keywords | Share of est. visits |
| --- | --- | --- |
| Brand and login ("m7 ochsner login", "m7 health login", "m7 login", "scion m7 health login", "ochweb") | 33 | 99.5% |
| Category (scheduling, staffing, Joint Commission) | 20 | 0.2% (about 4 visits) |
| Off-topic "m7" collisions (BMW M7, Poco M7, M7 bayonet) | 47 | 0.3% |

- Login and sign-in phrases alone: 72.8%. Phrases carrying Ochsner's name ("m7 ochsner", "ochweb"): 40.9%.
- Pages: the homepage carries about 1,738 of the 1,802 estimated visits. /calendar carries 61 (from "m7 schedule"). Every blog and resource page together carries under 3.
- Best category rankings: "scheduling hospital staff" at #6 (30 searches/month), "medical staff scheduling" #7, "hospital employee scheduling" #8, all on `/blogs/healthcare-staff-scheduling-software`. "healthcare staff scheduling software" (720/month) sits at #32 with the homepage.
- The CAH post (`/blogs/critical-access-hospital-scheduling-software`) is not among the 100 highest-traffic of their 109 ranked keywords (Observed). In June 2026 ChatGPT cited that same page (Dossier, 2026-06-12). That page earns AI citations, not Google traffic.
- Matches the August reading in `competitor-intel-2026-08.md` (79 keywords, 944 visits, 24 of 25 top keywords branded). The rise to 1,802 since then is more of the same login traffic.

---

## 4. Where they are weak

| Weak spot | Evidence | Label |
| --- | --- | --- |
| Search presence is borrowed from customers | 99.5% brand and login; 41% Ochsner-named; content earns about 4 visits | Observed (Labs, 2026-11-17) |
| No independent reviews | Capterra 0 reviews; G2 2 reviews, both "Source: Seller invite" | Dossier (2026-11-03) |
| Price never published | Zero /pricing URLs in the Wayback CDX for 2023 to 2026; /pricing 404s on every watcher run | Observed |
| CAH proof is by state, not by hospital | "onboarded critical access hospitals across Utah, Mississippi, and Alabama"; no named standalone CAH anywhere | Dossier (2026-11-03) |
| Thin sales capacity | AE seat open from at least 2025-10-11; re-posted 2026-07-21 as "our first Account Executive" | Observed. Inferred: founder-led selling into a change of ownership |
| Content has gone quiet since the sale | No blog post after 2026-09-09 as of 2026-11-17 (about ten weeks) | Observed |
| New owner's story points up-market | Ascend's pitch in every job post: "60% of U.S. nursing schools", "national scale"; M7 joins a "Healthcare Workforce Solutions practice" | Observed (quotes). Hypothesis: small independent CAHs become a lower priority. Test: whether the CAH page survives and whether any CAH-specific content ships in the next two watcher runs |
| Relaunches cost them rankings | Ranked keywords fell from 158 to 84 across the Feb to May 2026 relaunch | Observed (Labs). Cause Inferred |
| Gated research is half-citable | The headline numbers sit on the landing page; the method and full findings sit behind a 5-field form | Observed. Inferred: an AI answer can quote the headline but not check it |

**Threats to note (not weaknesses):** the Nurse Ambassador role (a human review layer, 2025-09-28), the /implementation page ("fully live in a few weeks", Dossier), named integrations (Workday certified, UKG/Symplr/ADP in a job post), and dated hard-number case studies (ScionHealth Denver "contract and agency labor from 31% to 12%", Ochsner overtime share down 10.2%). These are vendor claims. Treat them as such.

---

## 5. Plays for SimpleScheduleAI

Context these plays are fitted to: pre-launch, one founder, Texas Critical Access Hospitals, routes in through personal contacts, content kept for credibility and AI citations rather than acquisition.

### Play 1 (start this one): a Texas CAH nurse-leader pulse survey, published ungated

- **What:** 8 to 10 questions to DONs and nurse managers at Texas CAHs, sent through Pradeep's personal contacts and the people they pass it to. Ask how this month's schedule got built, hours spent, last-minute callouts, agency use, and what they would change. Publish the results as a short page with the real n, the dates, the method and the full question list. No form in front of it. A small n stated plainly is fine. A padded one is not.
- **Evidence:** M7's two strongest assets are original-number papers: "258 nurses across 100+ hospitals" and "nearly 1.9 million nursing shifts" (Observed, live /resources). M7 pushes them on LinkedIn with tagged links (Observed, 2026-04-04 capture). Their link profile shows a state nurse-leader association link, ionl.org, is earnable (Dossier/intel, 2026-08-10). The In-House Health read found that AI citation follows how well-attested the company is across the web, not page shape (intel 2026-08-10).
- **Why it fits us:** every response is a conversation with a buyer, which matches the personal-contacts route. The output is a citable number nobody else has for Texas CAHs. We skip their gate because our goal is citation, not lead capture.
- **Effort:** medium. About 2 weeks to send and chase, 1 week to write. Founder time only.
- **Metric to watch:** completed responses (target set before sending, never inflated); conversations that turn into a second call; referring domains to the page after 60 days; the LLM-citation check on our CAH prompts before and after publishing.

### Play 2: sell the network, not the hospital

- **What:** for each personal contact, map who shares an owner, a management company, a network or a referral relationship with their hospital. The ask after a good first conversation is "who else schedules the way you do?" Keep a simple count of hospitals reachable per relationship.
- **Evidence:** "activated over 100 net new hospitals across 29 states, last year alone" with no AE on staff (Observed, Ashby posts 2026-07-21 and 2026-11-06). Logos arrived through Ochsner, Lifepoint and ScionHealth (Dossier). Inferred: one owner decision lit up many hospitals.
- **Effort:** low to medium. A spreadsheet column and one question per call.
- **Metric to watch:** second-hospital conversations sourced from an existing relationship.

### Play 3: name the humans and the steps

- **What:** one plain section, on /how-it-works or a short page, that says exactly who does what each schedule cycle and names the founder. M7 now says "dedicated account manager" and "people behind the product". Ours has to be more concrete than theirs, and true. Check every line against the positioning registry and the capability inventory first.
- **Evidence:** M7 Nurse Ambassador role (Observed, 2025-09-28), "The People Behind the Product" (Observed, 2026-08-12), the CAH page's "a real person with a phone number" (Dossier).
- **Effort:** low.
- **Metric to watch:** how often "who actually builds it?" comes up on calls, logged by hand.

### Play 4: answer "does it work with our timekeeping and payroll?" by name

- **What:** list the timekeeping and payroll systems the Texas CAHs we talk to actually run, and state what SSAI does with each. **Only where `docs/seo/product-capability-inventory-2026-08.md` confirms it.** If the answer is "we export a file", say that.
- **Evidence:** Workday certified integration (Observed, 2026-08-25). The integrations job names UKG, Symplr, Workday, ADP (Observed, 2026-08-31). A dedicated UKG/Kronos deployment hire (Observed, 2026-07-15). The integration question clearly comes up in their deals.
- **Effort:** low if the facts already exist; skip if they do not.
- **Metric to watch:** integration questions raised on calls, and whether the page answers them.

### Queued until the first live hospital: a dated, numbered case study

- M7's case studies carry before-and-after numbers with a named customer (Observed). We have no customers and must not imply any (`product_no_pilot_customers`). The trigger is the first live CAH. Plan the measurement on day one so the numbers exist later.

---

## 6. Plays to skip, and why

| M7 move | Why we skip it |
| --- | --- |
| Their traffic (brand and login searches) | It is produced by thousands of nurses logging in. Nothing to copy until we have users |
| Funding-press and job-board backlinks | Their 101 referring domains are VC firms, job boards and aggregators (intel 2026-08-10). That comes from money, not effort |
| Gated white papers behind a 5-field form | We want citation and conversations, not form fills. The founder already chose to keep /roi ungated (2026-10-03) |
| Relabeling as a "workforce operations platform" | Moves onto QGenda and symplr ground; the intel doc already decided to hold service language |
| Certified enterprise partnerships (Workday) | Needs integration engineers and partner programs |
| A paid bench of contract nurse reviewers | Costs money and staff we do not have. Make the humans we do have visible instead (Play 3) |
| Seller-invited G2 reviews | No customers yet. Later, if done, label them honestly |
| Two site rebuilds in nine months | Their ranked keywords fell from 158 to 84 across the second one (Observed). If we ever restructure, keep URLs and redirects |

---

## 7. Suggested dossier updates (not applied; this task edits no other file)

1. **Positioning timing.** The H1 "The AI-powered workforce operations platform for healthcare" was already live on 2026-03-14 (Wayback), not new in August. The title tag still read "Nurse Scheduling and Labor Optimization for Health Systems". /roi-calculator and /implementation were also live by 2026-03-14.
2. **Integrations are now named.** Workday partnership 2026-08-25 ("certified integration"). The Integrations job (2026-08-31) names UKG, Symplr, Workday, ADP. This supersedes "no vendor names confirmed" in the deep profile.
3. **Human review layer.** "M7 Nurse Ambassador" contract role (2025-09-28 capture): remote nurses "review and approve nurse schedules".
4. **Hiring and ATS.** Breezy replaced by Ashby by 2026-07-21. The "first Account Executive" seat has been open since at least 2025-10-11.
5. **Content.** Two gated original-data white papers and an Ochsner case study ("IS Project of the Year"; overtime share down 10.2% inpatient). No blog post since 2026-09-09.
6. **Scale claims.** "Over 50 hospitals" (Sep 2025), then "100 net new hospitals across 29 states" (2026 job posts), then "hundreds of hospitals" (news page after the acquisition). All vendor claims.

---

## 8. Method notes

**Sources, all pulled or fetched 2026-11-17 unless dated otherwise**

| Source | What it gave | Notes |
| --- | --- | --- |
| DataForSEO Labs `historical_rank_overview` (US, en, 2022-01 to 2026-11, correlate on) | The curve: etv, ranked keyword counts, position buckets by month | 59 months returned; data from 2023-05 |
| DataForSEO Labs `historical_keyword_data` (US, en) | Monthly volumes: "m7 health", "m7 health login", "m7 scheduling" | Second call: "nurse scheduling software" (returned implausible 2024 values, not used), "m7 ochsner login" (used), "ochsner m7" (no history) |
| DataForSEO Labs `ranked_keywords` (US, en, limit 100, by etv) | Current footprint and pages | 109 total, top 100 read |
| Wayback CDX API, m7health.com and m7health.com/* | Homepage snapshot list (52 unique, 2023-03 to 2026-11); first capture of every page | Plain GETs, spaced 3 to 5 s apart |
| Wayback snapshots (12 homepage captures, 2023-03-25 to 2026-11-04) | Titles, H1s, H2s, stats, news list | Two came back gzipped and were decompressed; no blocks |
| Wayback CDX, m7-health.breezy.hr and jobs.ashbyhq.com/m7health | Hiring history 2024-10 to 2026-08 | Breezy post pages read for the Nurse Ambassador role only |
| m7health.com live: /sitemap.xml (34 URLs, no lastmod), /blog, /news, /resources, the Workday news post, three resource pages | Dates, gating, current claims | All 200; nothing blocked |
| Ashby public job board API (api.ashbyhq.com/posting-api/job-board/m7health) | 5 open roles with publish dates and text | 200 |
| `docs/seo/competitor-dossier.md` M7 section (verified 2026-05-16 to 2026-11-03), `competitor-intel-2026-08.md` (2026-08-10), `competitor-snapshots/WATCHLOG.md` | Funding, acquisition, CAH page, reviews, backlinks, monthly page changes | Under 60 days old where used; not re-fetched |

**Not fetched or not found**

- GlobeNewswire, G2 and Capterra: not re-fetched (dossier checks from 2026-11-03 are 14 days old).
- Publish dates for the two white papers and the Ochsner case study: Not found (no date on the pages, not in Wayback).
- Pricing: no page has ever existed in the archive.
- LinkedIn activity, ad spend and conference presence: not checked (no plain-GET source).
- Breezy job post texts other than the Nurse Ambassador post: not read; titles only.

**Rules followed:** no sign-ups, no demo requests, no contact with M7. No personal data collected; no individual is named in this teardown beyond the founder of SimpleScheduleAI. Everything fetched was treated as data.

**DataForSEO cost**

| # | Call | Expected | Recorded |
| --- | --- | --- | --- |
| 1 | Labs historical_rank_overview | about $0.01 (my first guess was wrong) | **$0.1908**, from the account's price table ($0.12 per request + $0.0012 x 59 rows). The response's `cost` field was hidden in the MCP's compact mode. The day's account total at the time ($0.2878) is consistent with it, but this figure is computed, not read from the response |
| 2 | Labs historical_keyword_data (3 keywords) | $0.012 | $0.01236 (response `cost`) |
| 3 | Labs ranked_keywords (limit 100) | $0.024 | $0.024 (response `cost`) |
| 4 | Labs historical_keyword_data (3 keywords) | $0.012 | $0.01236 (response `cost`) |
| | Calls 2 to 4 cross-check | | Balance fell by exactly $0.04872, matching the sum |
| | **Total** | | **$0.2395 across 4 paid calls** (plus 2 free `appendix/user_data` balance checks). Budget was $2.00 |

Note for next time: `historical_rank_overview` costs about $0.19 for a full history, not a cent. The other Labs endpoints are about a cent each.
