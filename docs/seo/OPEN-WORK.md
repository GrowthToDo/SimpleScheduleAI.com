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
| **Decide the last unattributed 8-12 hour instance** | The `/how-it-works` hero states the range with no attribution. Every other live surface now credits our own interviews (the homepage line was attributed and linked on 2026-08-21, `5799bb14`). This one was left because the how-it-works subtitle is a plain string prop that cannot carry a link. Options: drop the number from that subtitle, or convert the prop to a slot. |
| **Three positioning copy calls left open by the pre-ship review** | (1) "Every shift covered" is an absolute promise from a company with no customers, and our own engine deliberately returns understaffed shifts with reasons rather than pretending coverage exists. Keep it, or soften to a mechanism claim. (2) "Flat" and "facility" are now half-renamed: the pricing hero and homepage CTA say "one price per hospital", but `index.astro:172`, `:259`, `:298`, `pricing.astro:132` and three schema blocks still say flat/per-facility. Finish the rename or revert it. (3) The software-vs-service table now needs `lg` width for four columns, so tablets get the stacked layout that used to appear only on phones. |

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
3. **The three copy calls from the pre-ship review** are in section 1, because
   they need a founder decision, not more work.

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
