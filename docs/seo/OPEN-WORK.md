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
| **Decide the `what-is-a-nurse-manager` draft** | Retarget it to "what is a nurse manager" (210/mo) and publish, or retire it. Its competing vs-section, the false AONL attribution, and the bare $26,000 figure are already fixed, so it is publishable either way. Its URL currently 404s, which is correct for a draft. |
| **Decide the two unattributed 8-12 hour instances** | The homepage and `/how-it-works` hero lines state the range with no attribution. Twenty other live surfaces now credit our own interviews. These two were left because a citation clause damages hero copy and the how-it-works subtitle is a plain string prop that cannot carry a link. Say the word and the homepage number can be linked without adding words. |

## 2. Positioning — blocks all positioning-derived shipping

`docs/strategy/POSITIONING.md` carries a DO-NOT-FINALIZE header on five
structural findings. Verbatim status as of 2026-08-21:

1. **P4 is not registry-verbatim despite saying it is.** It copied
   `index.astro:122`, which had drifted. **The live drift is now fixed**
   (2026-08-21, `6b3b8d29`) so the registry line and the page agree again; what
   remains is correcting P4 itself to quote the row exactly.
2. **The governance claim is true as intent, false as executed.** A section
   listing every registry row this file would amend, each with its product-mode
   twin authored, must exist before adoption. P9 also breaks registry authoring
   rule 5, "never restate pricing in any other shape".
3. **No statement carries a mode label.** Six novel statements generate six
   units of migration debt under registry authoring rule 2.
4. **N8, the second promise, has no statement at all.** N3 has three. N8 has
   zero, despite having the most registry-backed proof already written.
5. **P11 builds copy on N9, which `NEEDS-STACK.md` forbids** until the CNO
   interviews settle that level. Hold P11, or ship only its weekend/holiday
   mechanism, which sits at N3.

Lower severity, not yet applied: P6's provenance is graded OBSERVED where the
dossier requires REPORTED; no counter-statement exists against Excel.

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
| `best-charge-nurse-scheduling-software` | **Not recorded in `blocked-drafts.md`.** 15 mechanical failures: "utilized", three inline `<svg>` blocks, all three required hub links missing, "CAH" in a heading, six broken TOC anchors. All mechanical, no rewrite needed. |

Also parked and failing: `nurse-manager-guide-work-scheduling`,
`nursing-software-critical-access-hospitals`, `cah-nurse-manager-scheduling-hours`.
Six dead AONL URLs sit across these drafts, all 404, all needing real sources or
removal before any of them publish.

## 5. Scheduled, do not run early

| When | What |
| --- | --- |
| **~2026-09-16** | GSC crawl-path read. Four LinkedIn posts scheduled Aug 21 to Aug 26; check whether the four never-fetched target pages got fetched. Before-state recorded in `linkedin/posts-crawl-path-set.md`: all four "Discovered - currently not indexed", `last_crawled: null`. If unchanged, mark the hypothesis dead. |
| **2026-09-01** | Monthly SEO audit. Founder triggers. Runbook: `monthly-seo-audit.md`. |
| **not before 2026-09-01** | Chief Healthcare Executive follow-up. One attempt maximum. |
| **after CHE resolves** | NRHA Rural Horizons query, held deliberately. Draft ready at `outreach/nrha-rural-horizons-query.md`. |

## 6. Housekeeping

- Stray zero-byte file named `93` in the repo root, an old shell redirect
  artifact. Untracked. Left alone rather than deleted unasked.
- `.claude-scan-low-census.md` sits untracked in the repo root.
- Local dev server runs on port 4331.
