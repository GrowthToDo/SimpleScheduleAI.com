# Open work

Single list of everything outstanding, so nothing survives only in a chat
session. Created 2026-08-21 after a scheduled Bing recheck turned out to have
no artifact and its finding was unrecoverable.

**Keep this current.** When an item closes, delete the row rather than marking
it done, so the file stays a live list. Anything with a date gets the date.

---

## 1. Blocked on the founder

| Item | Why it matters |
| --- | --- |
| **Run the interview chain before NAINA CNO intros** | Highest leverage item on this list. It blocks three separate findings across `VOTERS.md`, `NEEDS-STACK.md` and `POSITIONING.md`, all of which currently rest on assumptions about what CAH administrators say rather than on anything one told us. |

## 2. Positioning

The five structural findings that blocked all positioning-derived shipping are
closed (`733bbdb5`, 2026-08-21): P4 quotes the registry row exactly, the
registry amendment table exists with every product-mode twin authored, every
statement carries a mode label, P12 covers N8, and P11 is held with P11a
separated. The approved copy shipped to the service and product pages on
2026-08-21 (`5799bb14`), with the eight registry rows it depends on.

The Excel counter-statement that was missing now exists as the third column in
`SoftwareVsService.astro` plus the `excel-counter` registry row.

Still open:

1. **P11 stays held** until the CNO interviews settle N9. Only its
   weekend/holiday mechanism (P11a, which sits at N3) is shippable today.
2. **P6's provenance is graded OBSERVED where the dossier requires REPORTED.**
   Low severity, no live copy depends on it.
3. The three copy calls from the pre-ship review are settled (founder,
   2026-08-21): the coverage promise stays, the 4-column `lg` breakpoint stays,
   and the per-hospital rename is finished (`4fe64b89`).

## 3. Strategy files with known gaps

- **`VOTERS.md`** — the rarity claim is unsupported until five non-software
  managed-scheduling providers are profiled. Extremity grades should not be
  trusted until `asb-who-me` runs.
- **`NEEDS-STACK.md`** — the administrator and CEO ladder was never walked.
  That is the second head of the sale. Numbering continues from N10.
- **Competitor dossier** — OnShift has no dedicated section, only maintenance-log
  entries. Founder decision 2026-08-20: leave for now. Blocks LTC-direction
  content if that is ever wanted.

## 4. Content pipeline

**Next-15 progress:** #1-#4 published. #5 Clairvia scrapped. #6, #7, #8
published. **#9 Joint Commission Nurse Staffing Standards is next** (320/mo,
KD 1). Its plan row is marked FACT-CAREFUL: every standard needs a primary
source, Joint Commission material is paywalled in places, and it needs the same
premise check #8 got, since accreditation standards may say nothing a 25-bed CAH
can act on. #10 through #15 follow.

**Three blocked drafts, all failing `check-blog`:**

| Draft | Problem |
| --- | --- |
| `best-scheduling-software-er-nurses` | 29 credential-filtering overclaims. Needs a new differentiator; no ED-specific rule exists in the engine. Recorded in `blocked-drafts.md`. |
| `best-scheduling-software-icu-nurses` | 22 of the same. Easier fix: `icu-competency` IS a shipped hard rule. Recorded in `blocked-drafts.md`. |
| `best-charge-nurse-scheduling-software` | Deliberately NOT in `blocked-drafts.md` (checked 2026-08-24): that file is for defects gates cannot catch, and this draft's 15 failures are ordinary gate failures ("utilized", three inline `<svg>` blocks, all three hub links missing, "CAH" in a heading, six broken TOC anchors). The normal pipeline fixes it; ~1 hour, unscheduled. Stale manifest note: its Aug-10 recorded rows (incl. founderApproval) were set by a bulk sweep against a different content hash and are not a green light. |

Also parked and failing: `nurse-manager-guide-work-scheduling`,
`nursing-software-critical-access-hospitals`, `cah-nurse-manager-scheduling-hours`.
Six dead AONL URLs sit across these drafts, all 404, all needing real sources or
removal before any of them publish.

## 4b. Open after the 2026-09-01 session

**Blocked on the founder:**

| Item | Why it matters |
| --- | --- |
| **GA4 internal-traffic filter is still not working** | Highest priority of these. Every AI-referral number is untrustworthy until it is fixed. Hyderabad is still the largest city in the property (43 sessions in August, and the user count held at 8 across June, July and August, so the session drop was less activity rather than a filter). Ruled out Testing mode: `testDataFilterName` returns `(not set)` for all 332 August sessions. So it is either never activated (GA4 creates data filters INACTIVE by default) or active with a non-matching IP, most often an IPv4/IPv6 mismatch. Gautham was never added, and 8 users in Hyderabad is more than one person. |
| **Manual Request Indexing** for `/blog/managed-service-vs-scheduling-software` | GSC URL Inspection, two minutes. The page is "Crawled, currently not indexed" and was just retargeted, so it needs a fresh signal. Google has no indexing API; sitemap resubmission (done 2026-09-01) is the only programmatic lever. |

**Decisions waiting on the founder:**

1. **Standardise the other 45 posts to KT-first?** 52 live posts open on `## Key Takeaways`, 45 open on prose. check-blog now WARNs on the prose shape and the rule applies to new work only (founder, 2026-09-01). Promoting it to `fail()` is a one-line change if the corpus is ever standardised.
2. **The 41 drafts.** Three are named in `next-15-topics-2026-08.md` as better than writing fresh: `scheduling-software-vendor-acquisition-support`, `self-scheduling-manager-workload-trap`, `what-is-nursing-overtime`.

**Unblocked, not yet done:**

- **Google Alerts** on the eight competitor names plus the three event queries (acquisition/retirement/price-rise, and the `site:linkedin.com/posts` one). Step-by-step was given to the founder 2026-09-01. Covers the social and news half; `competitor-watch` already covers the website half.
- **Software directory submissions.** Cheap, and the product-mode wording rules already exist. See the backlink-directories memory: software self-label, per-user pricing, never the flat service price.

## 5. Scheduled, do not run early

| When | What |
| --- | --- |
| **~2026-09-16** | GSC crawl-path read. Four LinkedIn posts scheduled Aug 21 to Aug 26; check whether the four never-fetched target pages got fetched. Before-state recorded in `linkedin/posts-crawl-path-set.md`: all four "Discovered - currently not indexed", `last_crawled: null`. If unchanged, mark the hypothesis dead. |
| **2026-10-01** | Monthly SEO audit. Founder triggers. Runbook: `monthly-seo-audit.md`. The 2026-09 run is at `monthly-audits/2026-09.md` and its carry-forward block lists 13 items, four of them decisions due next run: the 301 on `free-nurse-schedule-templates` (with its decision test written down), what to do with the two stranded `managed service` posts, the N1/N2 measurement (the test is clicks appearing at all, not position), and the first Common Crawl re-check. |
| **not before 2026-09-01** | Chief Healthcare Executive follow-up. One attempt maximum. |
| **after CHE resolves** | NRHA Rural Horizons query, held deliberately. Draft ready at `outreach/nrha-rural-horizons-query.md`. |

## 6. Housekeeping

- Stray zero-byte file named `93` in the repo root, an old shell redirect
  artifact. Untracked. Left alone rather than deleted unasked.
- `.claude-scan-low-census.md` sits untracked in the repo root.
- Local dev server runs on port 4331.
