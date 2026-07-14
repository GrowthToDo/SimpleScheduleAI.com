# Texas Overtime Premise — Sitewide Correction Sweep (COMPLETE 2026-07-14)

> **STATUS: DONE — commit 289e00e.** Swept sitewide across 48 posts + 6 pages (incl. the
> /slides deck ×9, /nurse-scheduling-software, /ai-nurse-scheduling,
> /critical-access-hospital-scheduling) + competitors.json. A ground-truth grep found the
> footprint ~2x this doc's original estimate (28 → ~55 files); all three §62.002-as-overtime
> gate-failures removed. KEEP (do not "fix" in future passes): "Texas has no state overtime
> law", "FLSA overtime thresholds (Texas)", mandatory-overtime discussions, and Texas Payday
> Law framed as wage-payment/documentation (not overtime calculation).


**The error:** many live posts state or imply that "Texas Labor Code Chapter 62" (or "Texas
overtime rules" / "Texas-specific overtime rules") adds an overtime layer on top of the FLSA.
**This is false.** Verified 2026-07-11 (facts-dossier "Texas overtime law (none; FLSA
governs)"): Chapter 62 is a minimum-wage statute; §62.151 exempts FLSA-covered workers;
**Texas has no state overtime law.** Overtime for Texas hospitals is governed entirely by the
federal FLSA; the only real overtime nuance is the federal healthcare **8-and-80** option.

**Correction pattern** (already applied to the Texas post, /pricing, /ai-nurse-scheduling,
/nurse-scheduling-software, qgenda-alternatives on 2026-07-13, commit ba4b5a4):
- "Texas overtime rules" / "Texas-specific overtime rules" / "Texas overtime constraints" ->
  "FLSA overtime thresholds"
- "Texas overtime compliance (FLSA overtime thresholds)" -> "FLSA overtime threshold tracking"
- "[Texas Labor Code §62.002](...) overtime rules" -> remove the §62.002 overtime cite (it is
  the minimum-wage section; check-blog rule 8 now FAILS on it). Reframe to FLSA / 8-and-80.
- "Texas Labor Code provisions" as a compliance layer -> delete (not a scheduling requirement)
- SSAI must never claim it implements 8-and-80 — say "FLSA overtime threshold tracking"

**Note:** several of these posts now FAIL `node scripts/check-blog.mjs` on the §62.002 rule,
so they cannot be re-published or refreshed until corrected.

## Affected live posts (from sitewide grep 2026-07-13; verify each line before editing)

- ai-nurse-scheduling-vs-traditional.md
- aladtec-alternatives.md
- best-nurse-scheduling-software-2026.md (money-cluster head post — priority)
- hospital-staff-scheduling-software.md (§62.002)
- how-to-schedule-nurses-critical-access-hospital.md (Labor Code Chapter 62)
- nurse-schedule-generator.md
- nurse-scheduling-software-minimum-employees.md
- nurse-scheduling-software-pricing.md
- nurse-scheduling-software-small-hospital.md
- nurse-shift-schedule-daily-coverage.md
- nursegrid-alternatives.md
- nursing-scheduling-app-what-to-look-for.md (§62.002)
- nursing-scheduling-software-ai.md
- nursing-software-critical-access-hospitals.md
- onshift-alternatives.md
- schedule360-alternatives.md (a proofread REFERENCE post — fix early)
- smart-square-alternatives-small-rural-hospitals.md
- staff-scheduling-software-healthcare-vs-generic.md (§62.002)
- texas-nursing-overtime-compliance-cah.md (line ~226 still has it)
- ukg-alternatives-small-hospitals.md
- what-is-nursing-overtime.md ("Texas-specific overtime rules for healthcare workers?" FAQ)

## Pages / decks (lower priority, noindex)

- src/pages/slide1.astro, slide2.astro, slides.astro — "Texas overtime rules" +
  "CMS PBJ reporting" (the PBJ claim is separately wrong for CAHs per pbj-swing-bed-exempt).

## Execution notes
- The canonical alternatives-boilerplate line "Texas overtime compliance (FLSA overtime
  thresholds) and CMS CAH requirements are defaults" recurs across ~6 alternatives posts —
  fix once, apply to all.
- After each edit: `node scripts/check-blog.mjs <path>` (the §62.002 rule must clear).
- Re-verify no correct "Texas has no state overtime" statements get clobbered.
