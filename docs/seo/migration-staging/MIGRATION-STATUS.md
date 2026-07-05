# Migration Status Index

One row per staged post/article across the full positioning-migration corpus (service mode to
product mode). Covers every file that has gone through staging so far: 41 in
`docs/seo/migration-staging/post/` (batches S1-S4, H1-H2) plus 8 in `docs/seo/migration-dryrun/`
(round 1 + round 2). This is not the full 113-post live corpus; it is everything staged for
migration to date. Source: `docs/seo/migration-staging/LEDGER-*.md`,
`docs/seo/migration-dryrun/DECISIONS.md`, `docs/seo/migration-dryrun/round2/DECISIONS-R2.md`,
and `git hash-object` run against `src/data/post/` and `src/data/article/` on 2026-07-05.

**Runbook, read first:** on migration day, re-stage any row marked `DRIFTED` before flipping
service mode to product mode for that post. A drifted row means the live post changed after it
was staged, so the staged copy no longer reflects the current source and the conversion must be
re-run against the current file before it goes live. As of this pass: **3 of 49 rows are
DRIFTED** (2 dry-run posts/articles, 1 batch-staged post). All 3 are link-graph or wording
drifts introduced by later publishing work, not by anything wrong in the original staging.

## Summary

- **Total staged:** 49 (41 batch-staged + 8 dry-run)
- **By tier:** 34 script-tier (S1-S4, 7 posts each) + 13 hand-tier (H1: 7, H2: 6) + 8 dry-run
  (round1: 3, round2: 5)
- **By review state:** 8 adversarially-reviewed (round1 + round2 DECISIONS logs, hand-reviewed
  against premise-triage + link-graph + overcorrection checks) · 41 converter-gated (batch
  ledgers reconciled against full diffs per CONVERTER-BRIEF.md, not independently adversarially
  reviewed post-conversion)
- **DRIFTED:** 3 of 49
  - `nurse-burnout-scheduling-cah` (S2 batch) — internal link added post-staging (points to the
    new `nurse-retention-strategies-rural-hospital` post), not a positioning change
  - `shiftwizard-vs-managed-service` (round 1 dry-run) — "our team" -> "our scheduling team"
    wording normalization (commit `5b06eed`, `check-blog` triad-canonicalization pass), landed
    5 hours after this file was staged
  - `nurse-shortage-or-retention-crisis-rural-hospitals` (round 2 dry-run, `src/data/article/`)
    — internal link added post-staging (same new retention post), not a positioning change
- **Retitled in staging (Option-A vendor-vs-vendor pattern, needs a 301 on migration day):** 3
  — `managed-service-vs-scheduling-software` -> `guided-setup-vs-self-configured-nurse-scheduling-software`,
  `aladtec-vs-managed-service` -> `aladtec-vs-simplescheduleai`,
  `tcp-scheduling-software-vs-managed-service` -> `tcp-scheduling-software-vs-simplescheduleai`.
  `shiftwizard-vs-managed-service` (dry-run) has a retitle recommendation logged in
  `DECISIONS.md` but was not renamed in the dry-run body itself; still open for a founder
  decision on migration day (see `docs/seo/migration-staging/SLUG-DEPENDENCY-MAP.md`).

## Batch S1-S4 and H1-H2 (`docs/seo/migration-staging/post/`, converter-gated)

| Slug (live) | Tier | Staged path | Batch/ledger ref | Source-hash (staged header) | Current src hash | Drifted? | Review state |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 12-hour-hospital-shifts-scheduling | script (S1) | migration-staging/post/12-hour-hospital-shifts-scheduling.md | LEDGER-S1 Post 1 | c4ce3066844d5871ec334991bb042d1e1f7bedd4 | c4ce3066844d5871ec334991bb042d1e1f7bedd4 | No | converter-gated |
| aladtec-alternatives | script (S1) | migration-staging/post/aladtec-alternatives.md | LEDGER-S1 Post 2 | 983f46ed2ee1a0e4aa7905f0262ac6d089f9fbbb | 983f46ed2ee1a0e4aa7905f0262ac6d089f9fbbb | No | converter-gated |
| best-nurse-scheduling-software-2026 | script (S1) | migration-staging/post/best-nurse-scheduling-software-2026.md | LEDGER-S1 Post 3 | e06f5509ff17d294f1175d375731655987da0ffb | e06f5509ff17d294f1175d375731655987da0ffb | No | converter-gated |
| best-nurse-scheduling-software-critical-access-hospitals | script (S1) | migration-staging/post/best-nurse-scheduling-software-critical-access-hospitals.md | LEDGER-S1 Post 4 | 3f21fae756f487796f990b7fba0a15a1c620ee23 | 3f21fae756f487796f990b7fba0a15a1c620ee23 | No | converter-gated |
| best-tcp-alternative-for-cah | script (S1) | migration-staging/post/best-tcp-alternative-for-cah.md | LEDGER-S1 Post 5 | 8da64cddc3a393b590bb069df637548674823529 | 8da64cddc3a393b590bb069df637548674823529 | No | converter-gated (1 correction applied during regeneration, see LEDGER-S1) |
| can-nurses-trust-ai-generated-schedule | script (S1) | migration-staging/post/can-nurses-trust-ai-generated-schedule.md | LEDGER-S1 Post 6 | 2b8a3f3c6033acfd1fa100cd3853e35a4d0d74af | 2b8a3f3c6033acfd1fa100cd3853e35a4d0d74af | No | converter-gated |
| deputy-alternatives-healthcare | script (S1) | migration-staging/post/deputy-alternatives-healthcare.md | LEDGER-S1 Post 7 | 4f6e4db26ba982a8384ed7c178a3f39e1939604e | 4f6e4db26ba982a8384ed7c178a3f39e1939604e | No | converter-gated |
| float-pool-nursing-small-hospitals | script (S2) | migration-staging/post/float-pool-nursing-small-hospitals.md | LEDGER-S2 Post 1 | 28a9a4671b8f918bc5726e5e51e468b963877ea1 | 28a9a4671b8f918bc5726e5e51e468b963877ea1 | No | converter-gated |
| free-nurse-scheduling-software | script (S2) | migration-staging/post/free-nurse-scheduling-software.md | LEDGER-S2 Post 2 | 3cdf256711117a18a1bf9bd33f3d6b50b4c995a6 | 3cdf256711117a18a1bf9bd33f3d6b50b4c995a6 | No | converter-gated |
| healthcare-scheduling-crisis | script (S2) | migration-staging/post/healthcare-scheduling-crisis.md | LEDGER-S2 Post 3 | a4d314c8f4b0e810b90c1f823c5b1db24fb01ffa | a4d314c8f4b0e810b90c1f823c5b1db24fb01ffa | No | converter-gated |
| hipaa-compliant-nurse-scheduling-software | script (S2) | migration-staging/post/hipaa-compliant-nurse-scheduling-software.md | LEDGER-S2 Post 4 | 401a112e4fd6d755ab9cc602dbb1be300a0c211a | 401a112e4fd6d755ab9cc602dbb1be300a0c211a | No | converter-gated |
| how-to-stay-cms-compliant-nurse-scheduling | script (S2) | migration-staging/post/how-to-stay-cms-compliant-nurse-scheduling.md | LEDGER-S2 Post 5 | 224e8409aa0d822d7f08ebadbd3ce70a816448b4 | 224e8409aa0d822d7f08ebadbd3ce70a816448b4 | No | converter-gated |
| night-shift-nurse-schedule-coverage | script (S2) | migration-staging/post/night-shift-nurse-schedule-coverage.md | LEDGER-S2 Post 6 | 4ae3f1e6fd3dd5e7c545fcfa5778484a55b82307 | 4ae3f1e6fd3dd5e7c545fcfa5778484a55b82307 | No | converter-gated |
| nurse-burnout-scheduling-cah | script (S2) | migration-staging/post/nurse-burnout-scheduling-cah.md | LEDGER-S2 Post 7 | 2c7bef927fd4688f5adfe191aa85114e83014c84 | 79ef44db5011c6dd6b7ac7aec8fde6781282ec8c | **Yes** | converter-gated; **re-stage before migration day** |
| nurse-scheduling-no-it-department-rural-hospital | script (S3) | migration-staging/post/nurse-scheduling-no-it-department-rural-hospital.md | LEDGER-S3 Post 1 | 91047fc9c080d094e2a00710c1218cc434ddd48b | 91047fc9c080d094e2a00710c1218cc434ddd48b | No | converter-gated |
| nurse-scheduling-software-pricing | script (S3) | migration-staging/post/nurse-scheduling-software-pricing.md | LEDGER-S3 Post 2 | 47270a8ce6f1a4f2ed00539a979b4677258c10b7 | 47270a8ce6f1a4f2ed00539a979b4677258c10b7 | No | converter-gated |
| nurse-scheduling-software-small-hospital | script (S3) | migration-staging/post/nurse-scheduling-software-small-hospital.md | LEDGER-S3 Post 3 | 3c1a5eeaed72843d21a73f1606166fb589a84bbb | 3c1a5eeaed72843d21a73f1606166fb589a84bbb | No | converter-gated |
| nurse-staffing-ratios-critical-access-hospital | script (S3) | migration-staging/post/nurse-staffing-ratios-critical-access-hospital.md | LEDGER-S3 Post 4 | 2beee0193597527ef21d44191443e0d297faf5ab | 2beee0193597527ef21d44191443e0d297faf5ab | No | converter-gated |
| nursegrid-alternatives | script (S3) | migration-staging/post/nursegrid-alternatives.md | LEDGER-S3 Post 5 | 4e8d62e74dc4e127f5f84715afb3c4f1afc17e79 | 4e8d62e74dc4e127f5f84715afb3c4f1afc17e79 | No | converter-gated |
| nursing-scheduling-software-ai | script (S3) | migration-staging/post/nursing-scheduling-software-ai.md | LEDGER-S3 Post 6 | a2cb211075e139c44369714598e34ba4d894a12e | a2cb211075e139c44369714598e34ba4d894a12e | No | converter-gated |
| onshift-alternatives | script (S3) | migration-staging/post/onshift-alternatives.md | LEDGER-S3 Post 7 | 93e423bcfce15557f58d0b1220eb86ebc89158a8 | 93e423bcfce15557f58d0b1220eb86ebc89158a8 | No | converter-gated |
| self-scheduling-problems-critical-access-hospital | script (S4) | migration-staging/post/self-scheduling-problems-critical-access-hospital.md | LEDGER-S4 Post 1 | 8d073864163ce9c841183cc3f95a68f98627be41 | 8d073864163ce9c841183cc3f95a68f98627be41 | No | converter-gated |
| shiftwizard-alternatives | script (S4) | migration-staging/post/shiftwizard-alternatives.md | LEDGER-S4 Post 2 | ee5e2b24712892e6b3cef5b64a407fd6d44f2305 | ee5e2b24712892e6b3cef5b64a407fd6d44f2305 | No | converter-gated |
| smartlinx-alternatives | script (S4) | migration-staging/post/smartlinx-alternatives.md | LEDGER-S4 Post 3 | a353f23b191d17c068316b432179881cf6f021d6 | a353f23b191d17c068316b432179881cf6f021d6 | No | converter-gated |
| ukg-alternatives-small-hospitals | script (S4) | migration-staging/post/ukg-alternatives-small-hospitals.md | LEDGER-S4 Post 4 | d8fb97461d47e56e1df3c07a248f2a6f4157dda4 | d8fb97461d47e56e1df3c07a248f2a6f4157dda4 | No | converter-gated |
| ukg-migration-small-hospital | script (S4) | migration-staging/post/ukg-migration-small-hospital.md | LEDGER-S4 Post 5 | add625f3c25076a88fa0a87ad48a5a7a4f3e24e8 | add625f3c25076a88fa0a87ad48a5a7a4f3e24e8 | No | converter-gated |
| ukg-too-complex-small-hospital | script (S4) | migration-staging/post/ukg-too-complex-small-hospital.md | LEDGER-S4 Post 6 | 1cebd1886c9193920a86d17960101708d7f5dc64 | 1cebd1886c9193920a86d17960101708d7f5dc64 | No | converter-gated |
| what-is-a-critical-access-hospital | script (S4) | migration-staging/post/what-is-a-critical-access-hospital.md | LEDGER-S4 Post 7 | a3edabbb83af444bc5302d0f14466050e5459f10 | a3edabbb83af444bc5302d0f14466050e5459f10 | No | converter-gated |
| managed-service-vs-scheduling-software | hand (H1) | migration-staging/post/guided-setup-vs-self-configured-nurse-scheduling-software.md (retitled output, Option-A) | LEDGER-H1 Post 1 | 6c227d2aafb568d2d22c92c8f9b2a1b4af1493aa | 6c227d2aafb568d2d22c92c8f9b2a1b4af1493aa | No | converter-gated, PREMISE-COLLAPSE full retitle |
| aladtec-vs-managed-service | hand (H1) | migration-staging/post/aladtec-vs-simplescheduleai.md (retitled output, Option-A) | LEDGER-H1 Post 2 | 95f482b2ef666365f24b2231eedf63bf2b2a9f5f | 95f482b2ef666365f24b2231eedf63bf2b2a9f5f | No | converter-gated, vendor-vs-vendor retitle; anchor also corrected in H2 Post 1/4 (see LEDGER-H2) |
| tcp-scheduling-software-vs-managed-service | hand (H1) | migration-staging/post/tcp-scheduling-software-vs-simplescheduleai.md (retitled output, Option-A) | LEDGER-H1 Post 3 | 6a262d89d9244130dfc86eaf20750c284df826b6 | 6a262d89d9244130dfc86eaf20750c284df826b6 | No | converter-gated, vendor-vs-vendor retitle |
| inhouse-health-vs-simplescheduleai | hand (H1) | migration-staging/post/inhouse-health-vs-simplescheduleai.md | LEDGER-H1 Post 4 | be0b50a10a8233b0a7eef86e95942cf36da84fff | be0b50a10a8233b0a7eef86e95942cf36da84fff | No | converter-gated |
| nurse-rostering-vs-scheduling-software | hand (H1) | migration-staging/post/nurse-rostering-vs-scheduling-software.md | LEDGER-H1 Post 5 | 4879b0ce6c24c2053ff1a2b85ec22f347e4e455f | 4879b0ce6c24c2053ff1a2b85ec22f347e4e455f | No | converter-gated |
| nurse-scheduling-software-vs-excel | hand (H1) | migration-staging/post/nurse-scheduling-software-vs-excel.md | LEDGER-H1 Post 6 | b42d3f61dd8f8489e0440b781cd53784dce0ca1f | b42d3f61dd8f8489e0440b781cd53784dce0ca1f | No | converter-gated |
| what-automated-nurse-scheduling-actually-means | hand (H1) | migration-staging/post/what-automated-nurse-scheduling-actually-means.md | LEDGER-H1 Post 7 | 11683333024d630395e50b547f3d031c1f16cb7b | 11683333024d630395e50b547f3d031c1f16cb7b | No | converter-gated |
| best-scheduling-software-25-bed-hospital | hand (H2) | migration-staging/post/best-scheduling-software-25-bed-hospital.md | LEDGER-H2 Post 1 | 3aab0a1af7f126e54bd9b879df0596ed814257ec | 3aab0a1af7f126e54bd9b879df0596ed814257ec | No | converter-gated (1 correction applied during consolidation, see LEDGER-H2) |
| cms-pbj-reporting-scheduling-software | hand (H2) | migration-staging/post/cms-pbj-reporting-scheduling-software.md | LEDGER-H2 Post 2 | 088e0187660e01b6cf97579c66b233ae8df18635 | 088e0187660e01b6cf97579c66b233ae8df18635 | No | converter-gated |
| healthcare-workforce-management-cah | hand (H2) | migration-staging/post/healthcare-workforce-management-cah.md | LEDGER-H2 Post 3 | 06f2e40abf66997ae94886904fc6d9ed5745edea | 06f2e40abf66997ae94886904fc6d9ed5745edea | No | converter-gated |
| hospital-staff-scheduling-software-critical-access | hand (H2) | migration-staging/post/hospital-staff-scheduling-software-critical-access.md | LEDGER-H2 Post 4 | ebee4b641ef4d3f2ce6cd481566ac7ad27caee33 | ebee4b641ef4d3f2ce6cd481566ac7ad27caee33 | No | converter-gated (1 correction applied during consolidation, see LEDGER-H2) |
| schedule360-alternatives | hand (H2) | migration-staging/post/schedule360-alternatives.md | LEDGER-H2 Post 5 | 25aca6018de2e71e8fe4dba299590ddaa79f164b | 25aca6018de2e71e8fe4dba299590ddaa79f164b | No | converter-gated |
| smart-square-alternatives-small-rural-hospitals | hand (H2) | migration-staging/post/smart-square-alternatives-small-rural-hospitals.md | LEDGER-H2 Post 6 | caa9d0ff18a49f1242569c8858e34c28b687d75c | caa9d0ff18a49f1242569c8858e34c28b687d75c | No | converter-gated |

## Dry-run round 1 + round 2 (`docs/seo/migration-dryrun/`, adversarially-reviewed)

Dry-run staged files predate the `source-hash` header convention (introduced for the batch
runs); their headers carry a `source:` path only. Drift below is computed by diffing the staged
copy directly against the current `src/` file, cross-checked against `git log` commit dates for
that file after the dry-run's own commit timestamp.

| Slug (live) | Tier | Staged path | Batch/ledger ref | Source-hash (staged header) | Current src hash | Drifted? | Review state |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ai-nurse-scheduling-vs-traditional | dry-run (round 1) | migration-dryrun/ai-nurse-scheduling-vs-traditional.md | DECISIONS.md Post 2/3 (see file) | not recorded (predates hash convention) | d9a31f9be628179622b9bb5990ec29a59b2d540d | No (last src commit 188fefc, 2026-06-27, before round-1 staging 2026-07-04) | adversarially-reviewed |
| m7-health-vs-simplescheduleai | dry-run (round 1) | migration-dryrun/m7-health-vs-simplescheduleai.md | DECISIONS.md (see file) | not recorded (predates hash convention) | a1291954c1679c76f4cb8ab2c8e10a7efebb446b | No (last src commit ee51125, 2026-07-04 09:15, before round-1 staging commit 21:44) | adversarially-reviewed |
| shiftwizard-vs-managed-service | dry-run (round 1) | migration-dryrun/shiftwizard-vs-managed-service.md | DECISIONS.md Post 1 | not recorded (predates hash convention) | bd24a99d1efc301f316c0d67088d6422f0a6848b | **Yes** (src commit `5b06eed`, 2026-07-04 22:11, lands 27 min after round-1 staging commit at 21:44) | adversarially-reviewed; **re-stage before migration day** — drift is the same "our team" -> "our scheduling team" triad-wording normalization the dry-run itself was testing conversions against, so re-running the conversion is low-risk but mandatory before flip |
| after-hours-callout-coverage-small-hospitals | dry-run (round 2) | migration-dryrun/round2/after-hours-callout-coverage-small-hospitals.md | DECISIONS-R2.md (see file) | not recorded (predates hash convention) | 12c1a473f8d7139487a1d7620aaeb7e66faeea00 | No (last src commit 2f2ac8b, 2026-07-03, before round-2 staging 2026-07-04 22:30) | adversarially-reviewed |
| nurse-shortage-or-retention-crisis-rural-hospitals | dry-run (round 2), `src/data/article/` | migration-dryrun/round2/nurse-shortage-or-retention-crisis-rural-hospitals.md | DECISIONS-R2.md (see file) | not recorded (predates hash convention) | 7e456aaeaca324408972e45923abe02ff7ab1963 | **Yes** (src commit `303bc78`, 2026-07-05, adds an inbound link to the new `nurse-retention-strategies-rural-hospital` post) | adversarially-reviewed; **re-stage before migration day** — drift is a link addition, not a positioning change, but the staged copy is stale regardless |
| qgenda-alternatives | dry-run (round 2) | migration-dryrun/round2/qgenda-alternatives.md | DECISIONS-R2.md Post 1 | not recorded (predates hash convention) | 52d52f15adab552a6c5b324b0aa0823d3d85d659 | No (last src commit 0148401, 2026-07-04 21:58, before round-2 staging commit 22:30) | adversarially-reviewed |
| texas-nursing-overtime-compliance-cah | dry-run (round 2) | migration-dryrun/round2/texas-nursing-overtime-compliance-cah.md | DECISIONS-R2.md (see file) | not recorded (predates hash convention) | c0967abb042ef3b755009eb3702b59d3b409fc6f | No (last src commit ee51125, 2026-07-04 09:15, before round-2 staging) | adversarially-reviewed |
| what-is-per-diem-nursing | dry-run (round 2) | migration-dryrun/round2/what-is-per-diem-nursing.md | DECISIONS-R2.md (see file) | not recorded (predates hash convention) | 4ed9b8c8148a5fa6e991a63bd8e1104246bb9eac | No (last src commit 5b06eed, 2026-07-04 22:11, before round-2 staging commit 22:30) | adversarially-reviewed |

## Notes on tier and review-state distinctions

- **Script-tier (S1-S4, 28 posts):** run through the converter per `CONVERTER-BRIEF.md` with
  registry tokens doing most of the work; ledger-reconciled against full diffs including
  cosmetic hunks, but not independently hand-reviewed post-conversion the way round1/round2 were.
- **Hand-tier (H1-H2, 13 posts):** flagged for premise-sensitive content (vs-class titles,
  first-person compliance sections, links to not-yet-migrated slugs); converted by hand per the
  same brief, same ledger-reconciliation standard, still converter-gated rather than
  adversarially reviewed as a second independent pass.
- **Dry-run (round1 + round2, 8 posts/articles):** the only rows in this index that received a
  second, independent, adversarially-reviewed pass (premise triage + link-graph check +
  overcorrection sweep) beyond the initial conversion + ledger reconciliation. These 8 are ahead
  of the batch-staged 41 on review depth even though they are earlier in the corpus timeline;
  the registry's runbook lessons 1-10 were extracted FROM these dry-run rounds and then applied
  forward to the S1-S4/H1-H2 batches.
- No row in this index has been through Pass 3 (`npm run build && npm run smoke` + the
  standard judgment-only review) — that is explicitly reserved for migration day per
  `positioning-registry.md`'s Pass 3 gate, not for staging.

## Migration-day runbook (top of file, restated for visibility)

1. **Re-stage every `DRIFTED` row above before flipping that post to product mode.** A drifted
   row means the staged copy no longer matches the live source; converting stale content risks
   either losing the newer edit (link additions) or missing a wording change that needs its own
   token pass (the shiftwizard-vs-managed-service triad-wording drift).
2. Re-run `docs/seo/migration-staging/SLUG-DEPENDENCY-MAP.md` after re-staging any drifted row,
   since a re-stage can change anchor text or add new internal links that the dependency map
   needs to capture.
3. Then proceed to positioning-registry.md's migration-day runbook Pass 2 (judgment list) and
   Pass 3 (gates) as normal.
