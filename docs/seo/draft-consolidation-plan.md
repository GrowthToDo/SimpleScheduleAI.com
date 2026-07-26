# Draft Consolidation Plan — cannibalization prevention

Created 2026-07-26 (follow-up to the keyword-targeting audit). Structural cannibalization
found across the 56 draft posts: 5 pairs are near-duplicates targeting the same keyword,
and both halves are already fully written. **Decision: publish ONE per pair, abandon/merge
the other. Do NOT publish both.** The 5 DROP drafts each carry a `#` marker in their
frontmatter pointing here.

## Merge decisions (KEEP = publish under this slug; DROP = do not publish)

| Shared keyword | KEEP (why) | DROP | Content action |
| --- | --- | --- | --- |
| "what is clinical scheduling" | `what-is-clinical-scheduling` — cleaner slug + the "vs nurse scheduling" angle (1630w) | `what-is-clinical-scheduling-glossary` (1233w) | Fold the plain-definition opener into the keeper |
| "healthcare vs generic scheduling software" | `employee-scheduling-software-for-healthcare` — better head keyword "employee scheduling software for healthcare" (2715w) | `staff-scheduling-software-healthcare-vs-generic` (2720w) | Near-identical; keep one, discard the other |
| "fair nurse schedule / rotation (small hospital)" | `fair-nurse-schedule-critical-access-hospital` — "fair nurse schedule" is the stronger query, ICP slug (1781w) | `how-to-build-fair-nurse-rotation` (3739w) | **DROP is richer — SALVAGE its rotation-building detail into the keeper before publishing** |
| "nurse schedule generator / maker" (tool intent) | `nurse-schedule-generator` — automation angle fits the AI product (1660w) | `nurse-schedule-maker` (1753w) | Keep generator, fold "maker" as a secondary term. Keep BOTH distinct from `/resources/nurse-schedule-template` (that page = download a template; this post = generate/automate a schedule) |
| "reduce nurse overtime" | `how-to-reduce-nurse-overtime` — stronger query, most developed (4120w) | `hospital-shift-schedule-reduce-overtime` (1728w) | Fold the shift-design angle into the keeper |

## Also flagged by the audit (NOT actioned yet — differentiate at publish time)

**Draft collides with a LIVE post (differentiate the draft or fold in):**

- `hospital-staff-scheduling-software` → live `hospital-staff-scheduling-software-critical-access` already owns "hospital staff scheduling software"
- `cah-nurse-manager-scheduling-hours` → live `nurse-manager-scheduling-time-breakdown`
- `self-scheduling-manager-workload-trap` → live `self-scheduling-problems-critical-access-hospital`
- `medical-scheduling-services-managed-vs-software` → live `managed-service-vs-scheduling-software`

**Segmented clusters (each needs a distinct primary + a volume check before writing):**

- "Best X scheduling software/app": `best-charge-`, `best-scheduling-software-er-nurses`, `best-scheduling-software-icu-nurses`, `best-nurse-scheduling-app`, `best-healthcare-scheduling-software` (+ the live `best-*` posts). Per the audit, competitor "alternatives" terms were ~0/mo — the ER/ICU/charge segments are likely near-zero and may just dilute. Verify volume; consolidate the dead ones.
- Workforce trio: `hospital-workforce-management-software-cah` + `what-is-healthcare-workforce-management` + live `healthcare-workforce-management-cah`.
- Nurse-manager trio: `what-is-a-nurse-manager` + `nurse-manager-guide-work-scheduling` + `cah-nurse-manager-scheduling-hours`.
- Callout cluster: `how-to-handle-nurse-callouts` + `hospital-callout-coverage-ranked-shortlist` + live `after-hours-callout-coverage-small-hospitals`.

## Rule going forward

Before writing or publishing any draft: assign one distinct primary keyword and run
`npm run keyword-check -- "<keyword>"`. That surfaces a collision at the brief stage,
not after 2,000 words are written.
