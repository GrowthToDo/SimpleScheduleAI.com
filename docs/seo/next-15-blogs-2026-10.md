# Next 15 blogs: October 2026 plan

Made 2026-10-02 from real search demand, not guesses. Sources:

- **Google Search Console** (GSC): searches that already show our site, 2026-07-02 to
  2026-09-30. "Impressions" = how many times we appeared for those searches. Position =
  where we ranked (1 is the top, 11+ is page 2 or lower).
- **Bing Webmaster**: the same for Bing, 2026-05-01 to 2026-09-25.
- **Search volume**: Google Ads US monthly searches (DataForSEO, 12-month average).
- **Drafts**: all 36 unpublished drafts, each run through the publish gate.

The earlier list (`next-15-topics-2026-08.md`) is fully live except its item 21 (Aladtec),
which carries over as #6 here.

## How to use this file

Work top to bottom. For each item, say "write #N" (or "publish #N" for the two that are
already written). Claude then runs the normal pipeline (`.claude/skills/publish-pipeline.md`):
keyword check, research brief, draft, gates, proofread, fact-check, your approval, live,
then IndexNow/GSC after your review. Tick the box here when an item goes live.

**Effort key:** _Ready_ = written and checked, needs inbound links and your go. _Draft_ =
a draft exists but needs real work. _Merge_ = several drafts combine into one post.
_New_ = written from scratch.

## The 15

| #   | Done | Working title                                                     | Primary keyword               | Why this one (demand)                                                                                                         | Starting point                                                                                                              | Effort |
| --- | ---- | ----------------------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | [x]  | Physician and Medical-Staff Scheduling for Small Hospitals        | physician scheduling          | About 134 impressions across 24 physician/hospitalist questions; 390 searches/mo ("physician scheduling software" 320/mo)       | Draft `physician-medical-staff-scheduling-small-hospital` (passes the content check; says plainly we do not schedule physicians) | Draft  |
| 2   | [x]  | What Is Symplr Smart Square?                                      | symplr smart square           | About 70 impressions across 12 Smart Square questions at positions 3 to 7, all landing on the alternatives page; "smart square scheduling" 390/mo | New                                                                                                                         | New    |
| 3   | [ ]  | How to Schedule Nursing Staff at a Small Hospital                 | nursing staff scheduling      | "nurse staff scheduling" 127 impressions, "nurse staffing schedule" 74, "how to create a nurse schedule" 18, all at positions 37 to 63 on pages not written for them | Merge drafts `how-to-schedule-nurses-critical-access-hospital` + `nursing-staff-scheduling-best-practices-25-bed` + `nurse-manager-guide-work-scheduling` | Merge  |
| 4   | [ ]  | Nurse Shift Schedules: Types and Rotation Patterns                | nurse shift schedule          | About 110 impressions on "typical nursing shifts / how do nurse schedules work" questions at positions 23 to 34, landing on the 12-hour post | Merge drafts `what-is-hospital-shift-scheduling` + `nurse-shift-schedule-daily-coverage`                                     | Merge  |
| 5   | [ ]  | How to Build a Fair Nurse Schedule at a Small Hospital            | fair nurse schedule           | Bing: 42 impressions on fairness and holiday-rotation questions; GSC "nurse rotation schedule" at position 5.4                  | Draft `fair-nurse-schedule-critical-access-hospital` (fold in `seniority-vs-fairness`; fix its placeholder 2099 date)         | Draft  |
| 6   | [ ]  | Aladtec Moved Out of Healthcare. What That Means for Your Hospital | aladtec healthcare            | 184 impressions across 16 Aladtec searches. Aladtec's own homepage now names fire, EMS and law enforcement only (competitor dossier, 2026-09-01)   | New (Newsroom-style; re-check Aladtec's homepage the day it is written)                                                      | New    |
| 7   | [ ]  | Why Your Nurse Scheduling App Keeps Logging You Out               | (AI-answer piece)             | No measured demand; here because it is finished                                                                                | Draft `nurse-scheduling-app-login-problems`: proofread READY, fact-check PASS                                                | Ready  |
| 8   | [ ]  | What Happens to Scheduling Software Support After You Sign?      | (AI-answer piece)             | No measured demand; here because it is finished                                                                                | Draft `vendor-support-decline-nurse-scheduling-software`: proofread READY, fact-check PASS                                   | Ready  |
| 9   | [ ]  | What Is Nursing Overtime?                                         | nursing overtime              | 40 searches/mo; pairs with the live mandatory-overtime post                                                                   | Draft `what-is-nursing-overtime` (never present 8-and-80 as something we do)                                                 | Draft  |
| 10  | [ ]  | Island Shifts: Why One Shift Between Days Off Hurts               | island shift nursing          | 20 searches/mo; nobody covers it for small hospitals                                                                           | Draft `island-shifts-night-nurses-cah`                                                                                       | Draft  |
| 11  | [ ]  | Charge Nurse Report Sheet Template                                | charge nurse report sheet     | 140 searches/mo                                                                                                               | New, and needs the template itself built                                                                                     | New    |
| 12  | [ ]  | Healthcare vs Generic Scheduling Software                         | employee scheduling software for healthcare | 880 searches/mo, low competition. **Your call:** it sits next to the head term we retired in July                     | Draft `employee-scheduling-software-for-healthcare`                                                                          | Draft  |
| 13  | [ ]  | Nurse Schedule Data: What a Small Hospital Should Track           | nurse staffing analytics      | Thin demand ("nurse staffing analytics software" 5 impressions)                                                               | Draft `cah-nurse-schedule-data-analysis` (passes the content check)                                                          | Draft  |
| 14  | [ ]  | Best ICU Nurse Scheduling Software                                | icu nurse scheduling          | "icu scheduling" 6 impressions                                                                                                | Draft `best-scheduling-software-icu-nurses`: blocked by 22 credential overclaims; fixable now the ICU-competency rule has shipped | Draft  |
| 15  | [ ]  | Home Health vs Hospital Scheduling                                | home health scheduling software | 140 searches/mo; 48 impressions on home-health questions. Weak fit: write only as a "where we stop" piece                    | Draft `home-health-care-scheduling-vs-hospital`                                                                              | Draft  |

## Improve these live pages instead of writing new ones

Each of these searches already lands on us; the job is to strengthen the page that should
own it.

| Done | Live page                                    | Search to win                                                                                 | What to do                                                                                     |
| ---- | -------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [x]  | `/blog/prn-pool-critical-access-hospital`    | The long AI-assistant PRN-pool question (116 impressions, position 5.8) lands on the CAH software guide | Done 2026-10-02: the CAH guide now links to the PRN post. Re-check in November                 |
| [ ]  | `/blog/12-hour-hospital-shifts-scheduling`   | "12 hour rotating shift schedule" (21 at 26.9, 720 searches/mo); "how many 12-hour shifts can a nurse work in a row" (21 at 17.0) | Wait for the Q1 title test read on 2026-11-01, then add a section                              |
| [ ]  | `/blog/ukg-migration-small-hospital`         | "ukg migration" 48 at 26.7, "ukg data conversion" 23 at 28.1                                    | Registry re-aimed 2026-10-02; add a data-conversion section                                    |
| [ ]  | `/blog/nurse-schedule-generator`             | "nurse schedule maker" 48 at 31.4 and "nurse schedule generator free" 21 at 22.5 land on the free-software post | Add internal links with those words pointing to the generator post                             |
| [ ]  | `/blog/critical-access-hospital-requirements` | "cah staffing rules" 46 at 25.1 lands on the CAH pillar page                                   | Decide which page owns it; strengthen that one                                                 |

## Drafts to retire (your yes needed, then they are deleted)

| Reason                                                 | Drafts                                                                                                                                                                                         |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Already copied into a keeper                           | `hospital-shift-schedule-reduce-overtime`, `how-to-build-fair-nurse-rotation`, `nurse-schedule-maker`, `staff-scheduling-software-healthcare-vs-generic`, `what-is-clinical-scheduling-glossary` |
| Made-up or unverified competitor quotes                | `nursing-scheduling-software-support` (replaced by #8), `scheduling-software-overtime-errors`, `nurse-scheduling-software-hard-to-configure`, `hidden-compliance-cost-nurse-scheduling`          |
| Superseded                                             | `nursing-scheduling-app-what-to-look-for`                                                                                                                                                      |
| Compete with a live post for the same search           | `hospital-staff-scheduling-software`, `cah-nurse-manager-scheduling-hours`, `medical-scheduling-services-managed-vs-software`, `what-is-healthcare-workforce-management`, `hospital-workforce-management-software-cah`, `best-healthcare-scheduling-software`, `hospital-callout-coverage-ranked-shortlist` |

`best-scheduling-software-er-nurses` stays blocked: the scheduling engine has no
emergency-department rule yet.

## Reminders that apply to every item

- Content builds credibility and AI citations; it is not how we get customers (that is
  personal contacts). Judge a post by whether a DON would trust it, not by traffic.
- The publish gate now refuses a post with no keyword-registry entry, so pick the primary
  keyword before drafting (`npm run keyword-check -- "<keyword>"`).
- Re-check each item's demand at the monthly audit; drop or reorder if it moved.
