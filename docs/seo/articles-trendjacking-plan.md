# /articles Trendjacking Plan — DR via First-and-Authoritative

_Status: approved 2026-07-01. Owner: Pradeep. Build is separate from the /blog pipeline._

## Objective

Raise Domain Rating by earning **topically-relevant** referring domains: be the first site to thoroughly answer a rising, ICP-adjacent, thin-competition question, hosted in a sectioned `/articles` area. When others research that question, we are the clearest first source, so they cite/link us.

## Locked decisions (and why)

- **Mechanism: rank-and-wait, no outreach.** On a young / low-DR domain we cannot rank-and-wait onto a breaking-viral SERP (owned by major news + Google Top Stories; we are not in Google News). Rank-and-wait works only when we are first to thoroughly answer a **rising, not-yet-saturated** question where SERP competition is thin. That is the same sweet spot the "reach" goal points to.
- **Host: `/articles` subfolder** — same domain so link equity flows to the root; sectioned so it does not blur the `/blog` nurse-scheduling topical cluster. NOT a subdomain (that would forfeit the equity that makes DR grow).
- **Scope: relevance gradient, Tier 1-2 only.** Off-topic viral (Tier 3) earns irrelevant links, junk traffic, and E-E-A-T dilution on a health-adjacent domain. A separate folder reduces cluster-blur but does NOT firewall the root domain, so scope discipline is the real protection.

## Topic scope (the relevance gradient)

- **Tier 1 (always write):** nurse staffing, rural hospital, CMS / Conditions of Participation, Texas health policy, nurse labor, shortage / turnover data drops (NSI, BLS, HRSA).
- **Tier 2 (write only if a real Critical Access Hospital / scheduling angle + a citable hook exist):** healthcare / labor-adjacent viral — nurse strikes, a viral nurse story, an AI-in-healthcare moment, a hospital-closure story.
- **Tier 3 (skip):** generic viral with a forced nurse hook.

## Weekly loop

1. **Detect (~30 min):** rising items from the last 7 days. Sources: Google Trends (DataForSEO trends), Google News / WebSearch on seeds (`nurse staffing`, `nurse shortage`, `CMS rule`, `rural hospital closure`, `nurse strike`, `Texas nursing`), r/nursing hot, trade press (Becker's, Fierce Healthcare, HealthLeaders).
2. **Score (pick 1, max 2 per week):** Relevance (1-5) x Rising (1-5) x Can-we-be-first-and-authoritative (1-5) x Citable-hook-exists (0/1). Require hook = 1 and relevance >= 3. Log what was dropped and why.
3. **Write fast (same or next day):** tight, original-angle piece with ONE citable hook (an original stat, a worked calc, a sharp framing, or a fast expert take with a quotable line), Pradeep byline, every claim sourced. Run `check-blog` + `check-links` (adapted for `/articles`).
4. **Publish:** `/articles/<slug>`, NewsArticle schema, internally linked from 2-3 related evergreen `/blog` posts, submitted via IndexNow (Bing) + GSC. Target: rising topic to published within 24-48h.
5. **Measure (monthly):** referring-domain growth via the backlinks MCP (`backlinks_summary`, `referring_domains`), plus GSC / Bing impressions and positions for the `/articles` section. Kill topics that never earn links; repeat the shapes that do.

## Guardrails

- **Accuracy is non-negotiable (YMYL).** No fabricated stats (existing hard rule). Every claim sourced and every source URL resolves.
- **One citable original hook per piece.** Reactive summaries do not get cited; an original data point, calculation, or framing does.
- **E-E-A-T:** Pradeep byline + NewsArticle schema (datePublished, author, publisher).

## Build tasks (do once, before the first article)

1. Scaffold the `/articles` route in Astro (a content collection or `pages/articles/[...slug]` mirroring the blog renderer) plus a section index at `/articles`.
2. NewsArticle schema component (instead of BlogPosting) + a section breadcrumb.
3. Teach `check-blog` / `check-links` to accept `/articles` (or a lighter gate variant for speed).
4. Add `/articles` to the sitemap and a subtle "Newsroom" / "Analysis" nav link.
5. Save the detection query set (the seeds + sources above) as a repeatable weekly checklist.

## First run

Pick one Tier-1 rising question this week, write and publish it to `/articles`, and measure referring domains at 30 days. Iterate from there.

## Topic queue (held, with reasons)

The skill requires logging what was considered and not written, and why. Held topics
carry their peg and their unverified claims so a later session does not re-research
from scratch or publish an unchecked hook.

### HELD - Palo Verde Hospital (Blythe, CA) accreditation, a peg for a CAH survey-readiness piece

- **Held on:** 2026-09-18, founder. **Reconsider:** week of 2026-09-21, if no stronger
  Tier 1 item appears in that week's detection pass.
- **Peg:** Palo Verde Hospital, a bankrupt Critical Access Hospital under Riverside
  County management, received three-year national accreditation as a critical access
  hospital from DNV Healthcare USA. Announced September 2026.
  Source: https://heysocal.com/2026/09/14/hospital-in-blythe-under-county-management-receives-national-certification/
- **Score:** Relevance 4 x Rising 2 x Can-we-be-first 5 x Hook 1 = 40. The news itself
  barely rises (hyperlocal SoCal outlet, negligible search volume) and the hospital is
  in California, not Texas. It qualifies as a peg, not as a story: the durable question
  underneath it is what a CAH has to prove on staffing and scheduling to pass an
  accreditation survey, which no low-DR competitor owns.
- **Candidate hook, UNVERIFIED - verify before writing:** a search snippet indicates
  DNV's NIAHO Revision 25-1 requires a facility to produce the survey team's requested
  documents within three hours of arrival, with nonconformance if it cannot. If true,
  the hook is "can you produce twelve months of nurse schedules, on-call rosters and
  coverage records in three hours?" **The test that settles it:** read the primary DNV
  source directly, not a summary - https://www.dnv.us/publications/niaho-requirements-revision-25-1-updated/
  (secondary: https://www.hfmmagazine.com/dnv-changes-its-accreditation-process).
  If the three-hour rule is not in the primary source, the piece needs a different hook
  or gets dropped.
- **Accuracy notes for whoever writes it:** the hospital is California, so do not frame
  it as a Texas story. Do not imply the accreditation was won because of scheduling
  practice - nothing in the source says that. Bed count not confirmed in the source;
  verify before stating it.

- **VERIFICATION RESULT, 2026-09-21: the candidate hook FAILED. Do not write it as held.**
  The three-hour rule is real and verbatim in DNV's own words, but it is in the NIAHO
  *Accreditation Process* manual, not the *Accreditation Requirements* standard, and it
  traces to Revision 18 (eff. 8/7/2016, p.6) and Revision 17 (eff. 2015-04-23, pp.4 and 8):
  "no later than 3 hours after the request is made."
  Rev 18 PDF: https://nhiso.com/wp-content/uploads/2018/11/NIAHO-Accreditation-Process-Rev18-872016-1.pdf
  **Revision 25-1 was NOT read** (dnv.us landing page is a lead-capture form; it states only
  that Rev 25-1 supersedes prior revisions effective 2025-09-08, and carries no document-timing
  language). So never attribute the rule to Revision 25-1.
  **The hook itself is unsupported:** nurse schedules are NOT on DNV's day-one Survey Document
  Request List. That list names the org chart, the nursing services org chart, the nursing
  service plan of administrative authority, the leadership roster, the restraint log, and
  "Surgery/procedure schedule" (the only schedule on it). Staffing schedules and nurse rosters
  are not enumerated day-one items. Request list:
  https://s3.amazonaws.com/cms.ipressroom.com/107/files/20167/DNV_GL_Healthcare-Survey_Document_Request_List.pdf
  That same list also says documents are wanted "usually by mid-morning on day one," so DNV's
  two primaries state the deadline differently. The "nonconformance" consequence appears only
  in HFM Magazine (2024-12-15), not in the Rev 17 or Rev 18 primary text.
- **Score revised down, 2026-09-21: Relevance 4 -> 2.** Our own live post
  `src/data/post/joint-commission-nurse-staffing-standards.md` (line 71) records that only about
  30 percent of Critical Access Hospitals hold accreditation at all, and that the accredited
  minority "skewed toward larger, system-affiliated facilities." DNV is one of four CMS-approved
  accreditors splitting that third, so the addressable audience is a minority of a minority and
  skews away from the ICP. Revised score 2 x 2 x 5 x 1 = 20. The thin SERP reflects a thin
  audience, not an opening.

### Detection pass 2026-10-07 (founder-supplied links, triaged by two agents)

### HELD - Northern Maine Medical Center ED nurse resignations (founder: "save for next week")

- **Held on:** 2026-10-07, founder. **Reconsider:** week of 2026-10-12 (after the JAMA
  piece). Score 36: Relevance 4 (Tier 1, nurse labor at a 25-bed CAH) x Rising 3 x
  First 3 x Hook 1. Not a Texas story; say so plainly, the lesson travels.
- **Sources to cite (only these):** Bangor Daily News, Kathleen Phalen Tomaselli,
  2026-10-01 and 2026-10-02; The Maine Monitor, John Forbes, 2026-10-01 (direct fetch
  failed with a header error; a Yahoo syndicated copy was read). Never cite
  news.ssbcrack.com (2026-10-06): an unsourced rewrite site with a "News Desk" byline.
- **What the triage read (2026-10-07, agent-read, UNVERIFIED until the writer re-reads
  the originals and quotes them):** NMMC, Fort Kent, Maine, described by BDN as a
  25-bed Critical Access Hospital. ED sees about 7,000 visits a year. In June the ED had
  13 RNs (10 full-time, 3 per-diem); 5 full-time and 1 per-diem have since left or
  given notice. No ED diversion or closure reported. Three contract nurses brought in.
  Night registration clerk position cut 2026-09-06. A plan to go from two overnight
  RNs to one was withdrawn. The nurses' letter cites pressure to work a day/night
  rotation, "changes to scheduling practices", short staffing, and travelers paid
  $50 to $90/hr plus housing. Hospital says the departures were for other
  opportunities. NMMC lost $3.6M in FY2025 (Maine Monitor). Confirm CAH status
  independently (Flex Monitoring CAH list) and the bed count.
- **Candidate hook:** the coverage arithmetic of a 24/7 ED staffed with two RNs per
  shift (shifts per week x 2 RNs, against 10 full-time RNs at their contracted hours),
  and what losing 5 of them does to the remaining nurses' nights; labelled
  illustrative, built only from the published headcounts. Second strand: a mandatory
  day/night rotation is a schedule policy a hospital controls; what the evidence says
  about rotating shifts (find a primary study before claiming any health or retention
  effect).
- **Guardrails:** labor dispute, so stay neutral and carry the hospital's own
  explanation in its words. Overlaps `nurse-shortage-or-retention-crisis-rural-hospitals`
  (it already has a "cost of one resignation" calc), so lead with rotation policy and
  night coverage, not resignation cost. Light overlap with `july-2026-nurse-strikes-staffing`.
  No force-fit product section. Re-check the story the day it is written (more
  resignations, diversion, or a hospital statement may have followed).

Kept (see recommendation in session): **UPDATE** `texas-medicaid-freeze-critical-access-hospitals`
with the CMS 9/16/2026 CHIRP approval record (score 60; primary docs on
pfd.hhs.texas.gov CHIRP page); **WRITE** JAMA Netw Open 2026-09-28, Poisler & Gujral,
"Rural Hospital Closures and Mortality From Time-Sensitive Conditions in Texas" (48;
PUBLISHED 2026-10-07 as `/articles/rural-hospital-closures-mortality-texas-jama`; brief at `docs/seo/briefs/2026-10-jama-texas-rural-closures-mortality.md`,
facts read from the full text via Europe PMC PMC13621260. Corrections to the triage:
the 6.85 is a broader-definition sensitivity estimate incl. injuries, not significant;
the 79 excluded counties were dropped for CDC suppression of counts under 10, not
chosen as "most rural" (they skew smaller and more rural); license CC-BY-NC-ND, so
quote briefly and link figures, never reproduce them); **HOLD** Northern Maine
Medical Center (Fort Kent, 25-bed CAH) ED nurse resignations over day/night rotation
(36; cite Bangor Daily News Oct 1-2 and The Maine Monitor Oct 1 only, never
news.ssbcrack.com, an unsourced rewrite site; carry the hospital's explanation;
overlaps nurse-shortage-or-retention-crisis on resignation cost, so lead with rotation
policy and night coverage).

Dropped, with reasons:

- **Modoc Medical Center (Alturas, CA, 12-bed CAH) data breach** (HIPAA Journal 2026-09-28):
  score 0. Breach was Jan 2026 data theft with no reported scheduling or clinical
  outage, so a 485.625 downtime angle would overclaim; overlaps
  `where-does-your-nurse-schedule-live`; SERP is legal-intent.
- **Exceptional Community Hospital, Rapid City**: score 0. A for-profit urban
  micro-hospital, not a CAH.
- **$51M rural Texas chronic-disease awards** (KSST 2026-09-29; CMS release 2026-09-28):
  score 0. No districts named, so no checkable CAH hook; the $281M award is already
  covered in `rural-health-transformation-deadline-nurse-salaries`.
- **"How 1 critical access hospital is facing 2027 cuts"** (Becker's 2026-10-01): score 0
  as a peg. Arbuckle Memorial (Sulphur, OK) CFO Q&A; the cuts are never named. The
  Texas 2027 angle lives in the CHIRP freeze and 2028 phase-down instead.
- **Texas hospital names CNO** (Becker's 2026-09-18): score 0. Medical City North Hills
  (HCA, DFW metro), not a CAH, no news value.
- Also noted: 24/7 Wall St (via Yahoo, 2026-10-05) wrongly says the September freeze was
  the first CMS stop "since 2014"; THA documents a Sept 2021 to Mar 2022 hold. Do not
  cite it.

### DROPPED - "Physician Scheduling Software Market" (openPR / Worldwide Market Reports)

- **Dropped on:** 2026-09-18. **Reason:** citable-hook score 0, an automatic fail.
  Syndicated market-research lead-gen with no actual market size or CAGR in the body,
  so there is nothing to cite that would not violate the no-fabricated-stats rule.
  Also physician scheduling, not nurse scheduling.
- **Salvage value (not an article):** it names ten vendors - QGenda, AMiON, Lightning
  Bolt, ShiftWizard, TigerConnect, symplr, Smart Square, Omnigo, Hospital IQ, Kronos
  Workforce Central. Worth diffing that list against `competitor-dossier.md` for gaps.
