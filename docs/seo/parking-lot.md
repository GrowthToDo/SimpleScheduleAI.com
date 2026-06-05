# Blog Parking Lot

Drafts deliberately deferred. Each entry: **why parked**, **what would make us revive it**, **next review date**.

Convention: parked drafts use `publishDate: 2099-01-01T00:00:00Z` so they stay out of the schedule but remain in `src/data/post/` with `draft: true`. Killed drafts are `git rm`'d and recovered from history if needed (`git log --all --diff-filter=D -- <path>`).

When a parked draft is revived, the entry moves to the bottom of this file under a `## Revived` section with the actual publish date — this keeps the parking history auditable.

---

## Currently parked

### best-healthcare-scheduling-software

- **File:** `src/data/post/best-healthcare-scheduling-software.md`
- **Parked:** 2026-06-05 (commit at this entry)
- **Reason:** Generic title with no clear differentiation from the live `/blog/best-nurse-scheduling-software-2026`. As written, it cannibalizes the workhorse post (currently the #1 GSC impression page sitewide).
- **Revival trigger:** A unique positioning angle emerges, such as a "healthcare scheduling software" treatment specifically for physician + nurse + ancillary multi-role facilities (which is genuinely different from the nursing-only 2026 post). Or: an "AI healthcare scheduling" angle that complements `/ai-nurse-scheduling` rather than the buyer's-guide 2026 post.
- **Next review:** 2026-09-05 (quarterly)

### cah-nurse-schedule-data-analysis

- **File:** `src/data/post/cah-nurse-schedule-data-analysis.md`
- **Parked:** Date unknown (already at `publishDate: 2099-01-01` before parking-lot doc existed)
- **Reason:** Not logged at time of parking. Founder to fill in when convenient.
- **Revival trigger:** TBD
- **Next review:** 2026-09-05 (quarterly)

### fair-nurse-schedule-critical-access-hospital

- **File:** `src/data/post/fair-nurse-schedule-critical-access-hospital.md`
- **Parked:** Date unknown (already at `publishDate: 2099-01-01` before parking-lot doc existed)
- **Reason:** Not logged at time of parking. Founder to fill in when convenient.
- **Revival trigger:** TBD
- **Next review:** 2026-09-05 (quarterly)

### free-nurse-schedule-templates

- **File:** `src/data/post/free-nurse-schedule-templates.md`
- **Parked:** Date unknown (already at `publishDate: 2099-01-01` before parking-lot doc existed)
- **Reason:** Not logged at time of parking. Founder to fill in when convenient.
- **Revival trigger:** TBD
- **Next review:** 2026-09-05 (quarterly)

---

## Recently killed (kept for reference)

Removed from repo via `git rm` because they were cannibalizing live posts beyond reframe. Recoverable from git history if needed.

| Date killed | File                                                          | Reason                                                                                      | Recovery                                                                                                              |
| ----------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 2026-06-05  | `best-nurse-scheduling-software-critical-access-hospitals.md` | Pure duplicate of live `/blog/best-nurse-scheduling-software-2026` (already CAH-positioned) | `git log --all --diff-filter=D --follow -- src/data/post/best-nurse-scheduling-software-critical-access-hospitals.md` |
| 2026-06-05  | `best-nurse-scheduling-software.md` (Buyer's Guide)           | Generic title cannibalizes the live 2026 post                                               | Same recovery pattern                                                                                                 |
| 2026-06-05  | `best-nurse-scheduling-software-small-hospitals.md`           | Cannibalizes the live 2026 post (which targets 25-bed = small)                              | Same                                                                                                                  |
| 2026-06-05  | `best-nurse-scheduling-software-rural-hospitals.md`           | Overlaps the MOFU `nurse-scheduling-no-it-department-rural-hospital` shipped 2026-06-05     | Same                                                                                                                  |
| 2026-06-05  | `best-nurse-scheduling-software-no-it.md`                     | Overlaps the MOFU no-IT post shipped 2026-06-05                                             | Same                                                                                                                  |

---

## Revived

_(No entries yet. When a parked draft goes live, move its entry here with the publish date and the change that triggered revival.)_
