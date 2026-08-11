# Service Runbook — written routines

This file exists to satisfy the **written-routine test** in
`docs/seo/product-capability-inventory-2026-08.md` §1b:

> "Our team does it" is only a capability once the routine is WRITTEN DOWN in the
> onboarding/ops runbook — who tells us, what we do, what the hospital gets back,
> how fast. Until the routine is written: treat it as an intention, not a
> capability, and keep it out of published copy.

A routine listed here with all four fields filled is claimable in published
service copy. A routine that is missing a field, or that is not here at all, is
sales-conversation-safe only.

Every entry must answer four questions: **who tells us**, **what we do**, **what
the hospital gets back**, **how fast**. Owner is always SimpleScheduleAI unless
a row says otherwise, because in service mode the hospital operates nothing.

---

## R1. On-request fairness record

**Status:** WRITTEN — claimable in published copy (founder-confirmed 2026-08-11).

| Field | Value |
| --- | --- |
| Who tells us | The DON or the nurse manager, by email to their usual contact, asking for weekend/holiday distribution for a named period. |
| What we do | Pull the per-nurse counts for that period from the scheduling record: nights, weekends, and holidays worked, per nurse. |
| What the hospital gets back | A per-nurse count of nights, weekends and holidays for the requested period, as a PDF or a spreadsheet, whichever they ask for. |
| How fast | **1 business day** from the request. |
| Owner | SimpleScheduleAI's scheduling team. Nothing is asked of the hospital beyond the request itself. |
| Scope | The current or a prior scheduling period we built. Ranges older than the periods we have scheduled for that unit are best-effort, and we say so when a request falls outside what our record covers rather than reconstructing it. |

**Where the night counts come from.** Weekend and holiday counts come from the
fairness scoring described below. Night counts are read off the schedule record
itself, which stores every assignment as a day or night shift, so a per-nurse
night count for a period we built is a direct read, not an estimate.

**Why this exists.** The fairness argument runs through every scheduling post we
publish: a rotation only holds if someone can show the accumulated load. Until
this routine was written, we could say the record existed but not that the
hospital could have it, which left the strongest half of the argument unusable.

**Approved wording** is the `fairness-record` row in
`docs/seo/positioning-registry.md`. Use that row verbatim; do not invent
variants, and do not widen "on request" into an unbounded availability promise
("whenever you need it", "any time") — that reintroduces the single-point-of-
failure SLA shape the escalation promise was deliberately softened to avoid.

**Underlying capability** (so the routine is not claiming more than the software
holds): weekend counts carry across scheduling periods
(`historicalWeekendCounts`, inventory §3.1); holiday load is scored against the
team average (§4.3 #9); per-unit weekend quota and consecutive-weekend cap
(§3.5); every draft, swap and callout replacement is logged with a timestamp
(§5.4). The per-nurse weekend/holiday distribution also exists as an analytics
view (§3.8), which is PRODUCT-LEANING — hence this routine, which is how a
service customer receives the same information without logging in.

---

## Routines still UNWRITTEN (not claimable in published copy)

These are real things we do or intend to do, confirmed by the founder, that have
no written routine yet. They are safe in a live sales conversation and must stay
out of site copy until they are moved above with all four fields filled.

- **Low census.** The founder confirms we change the census band and release
  excess staff. The software detects and surfaces overstaffed shifts but has no
  execution workflow (inventory §1b). Honest product-mode line meanwhile:
  "flags overstaffed shifts and suggests who to flex."
