# Slug Dependency Map

Consolidated from every ledger in the corpus: `LEDGER-H1.md`, `LEDGER-H2.md`, `LEDGER-S1.md`
(regenerated), `LEDGER-S2.md`, `LEDGER-S3.md`, `LEDGER-S4.md`, `docs/seo/migration-dryrun/DECISIONS.md`
(round 1), `docs/seo/migration-dryrun/round2/DECISIONS-R2.md` (round 2). This is the migration-day
link-graph pass input: every internal link whose anchor text carries positioning and was migrated,
every proposed slug rename with its required 301, and every H2 anchor-fragment rename. Read this
before touching any `src/` file on migration day.

## 1. Proposed slug renames (Option-A vendor-vs-vendor / category retitles)

Three posts in batch H1 were fully retitled and re-slugged in staging. All three require a 301
redirect from the OLD live slug to the NEW slug in `netlify.toml` on migration day, plus a
corpus-wide sweep to update every internal link's href (not just anchor text) that currently
points at the old slug.

| # | Old slug (live today) | New slug (staged) | New title | Ledger ref | 301 required |
| --- | --- | --- | --- | --- | --- |
| 1 | `/blog/managed-service-vs-scheduling-software` | `/blog/guided-setup-vs-self-configured-nurse-scheduling-software` | "Guided-Setup vs. Self-Configured Nurse Scheduling Software: What Critical Access Hospitals Need" | LEDGER-H1 Post 1 | Yes |
| 2 | `/blog/aladtec-vs-managed-service` | `/blog/aladtec-vs-simplescheduleai` | "Aladtec vs. SimpleScheduleAI for Critical Access Hospitals (2026)" | LEDGER-H1 Post 2 | Yes |
| 3 | `/blog/tcp-scheduling-software-vs-managed-service` | `/blog/tcp-scheduling-software-vs-simplescheduleai` | "TCP TimeClock+ vs. SimpleScheduleAI for Small Hospitals (2026)" | LEDGER-H1 Post 3 | Yes |

**One open founder decision, not yet resolved in staging:**

| # | Old slug (live today) | Status | Note |
| --- | --- | --- | --- |
| 4 | `/blog/shiftwizard-vs-managed-service` | Founder picked Option A (vendor-vs-vendor retitle + new slug + 301) per `DECISIONS.md` "Founder review corrections (2026-07-04)" log, but the dry-run body itself was NOT retitled (title kept unchanged in the staged file; see DECISIONS.md Post 1 row 1, "kept title unchanged in this dry-run body"). Recommended new title: **"ShiftWizard vs. Guided-Setup Nurse Scheduling Software for Critical Access Hospitals (2026)"** or a vendor-vs-vendor equivalent ("ShiftWizard vs. SimpleScheduleAI..."), consistent with the Option-A pattern applied to Posts 2/3 above. New slug not yet finalized. **Action needed before migration day:** re-run this file through the converter with the actual retitle applied (currently the staged file's title/slug do not match the founder's own decision), then add the 301. Also carries the `DRIFTED` status (see MIGRATION-STATUS.md) since the source has moved on independently. |

## 2. Internal links whose anchor text was migrated (href unchanged, pointing at old slugs)

Every row below is an internal link found DURING staging whose anchor text was updated to
product-mode wording per registry lesson 9, while the href/link TARGET was deliberately left
pointing at the live (old) slug, since only the anchor text was in scope for that batch. On
migration day, once the target slug renames (section 1 above), every href below also needs
updating to the new slug — either directly, or it will resolve through the 301 chain (functionally
correct but wastes a redirect hop and dilutes link-equity signals; direct updates are preferred
per LEDGER-H1's cross-post observation 4).

### Target: `/blog/managed-service-vs-scheduling-software` (renames to `/blog/guided-setup-vs-self-configured-nurse-scheduling-software`)

| Referencing file (staged) | Batch | Anchor text before → after | Ledger ref |
| --- | --- | --- | --- |
| `aladtec-vs-simplescheduleai.md` (formerly aladtec-vs-managed-service.md) | H1 Post 2 | "TCP scheduling software versus a managed service" → "TCP scheduling software versus guided-setup software" | LEDGER-H1 Post 2 (cross-links to TCP post, not this one directly — see note) |
| `inhouse-health-vs-simplescheduleai.md` | H1 Post 4 | "managed service versus scheduling software" / "managed service versus a self-operated platform" → "guided-setup versus self-configured nurse scheduling software" / "guided-setup software versus a self-operated platform" | LEDGER-H1 Post 4 |
| `nurse-rostering-vs-scheduling-software.md` | H1 Post 5 | "compare scheduling software vs. a managed service" → "compare guided-setup vs. self-configured scheduling software" | LEDGER-H1 Post 5 |
| `what-automated-nurse-scheduling-actually-means.md` | H1 Post 7 | "managed service vs. scheduling software" → "guided-setup vs. self-configured scheduling software" | LEDGER-H1 Post 7 |
| `best-scheduling-software-25-bed-hospital.md` | H2 Post 1 | "managed service vs scheduling software" → "guided-setup software vs. self-configured platforms" | LEDGER-H2 Post 1 |
| `healthcare-workforce-management-cah.md` | H2 Post 3 | link present, anchor migrated (see LEDGER-H2 Post 3 row) | LEDGER-H2 Post 3 |
| `hospital-staff-scheduling-software-critical-access.md` | H2 Post 4 | "scheduling software versus a managed service" → "scheduling software versus guided-setup software" | LEDGER-H2 Post 4 |
| `schedule360-alternatives.md` | H2 Post 5 | "managed service vs. scheduling software" → "guided-setup software vs. scheduling software" | LEDGER-H2 Post 5 |
| `smart-square-alternatives-small-rural-hospitals.md` | H2 Post 6 | "managed scheduling service vs. scheduling software" → "guided-setup software vs. scheduling software" | LEDGER-H2 Post 6 |
| `ai-nurse-scheduling-vs-traditional.md` | dry-run round 1, Post 3 | "managed service vs. scheduling software" → "guided-setup vs. self-configured scheduling software" (link target NOT converted; anchor only) | DECISIONS.md Post 3 |
| `after-hours-callout-coverage-small-hospitals.md` | dry-run round 2, Post 3 | "the same tradeoff at review time" (managed scheduling service) → "guided-setup scheduling software handles the same tradeoff" | DECISIONS-R2.md Post 3 |

**Count: 11 referencing files, all pointing at this single target.** This is the single most-linked-to slug in the entire corpus and the highest-priority link-graph item for migration day (matches LEDGER-H1's own "largest cross-post dependency" flag).

**Note on `aladtec-vs-simplescheduleai.md`:** its own ledger entry (LEDGER-H1 Post 2, "What Is Aladtec?" body) links to the **TCP post**, not to `managed-service-vs-scheduling-software` directly — cross-referenced above only because both retitled H1 posts share the same cross-link web; see section 3 for the TCP-target row.

### Target: `/blog/aladtec-vs-managed-service` (renames to `/blog/aladtec-vs-simplescheduleai`)

| Referencing file (staged) | Batch | Anchor text before → after | Ledger ref |
| --- | --- | --- | --- |
| `best-scheduling-software-25-bed-hospital.md` | H2 Post 1 | "Aladtec vs managed service" → "Aladtec vs SimpleScheduleAI" | LEDGER-H2 Post 1 (**CORRECTION applied in consolidation pass, 2026-07-05** — see task 1) |
| `hospital-staff-scheduling-software-critical-access.md` | H2 Post 4 | "Aladtec versus a managed service" → "Aladtec vs SimpleScheduleAI" | LEDGER-H2 Post 4 (**CORRECTION applied in consolidation pass, 2026-07-05** — see task 1) |

**Count: 2 referencing files.** Both anchor-text fixes were applied during THIS consolidation session (see LEDGER-H2's updated Post 1 and Post 4 rows, and the corresponding correction notes). Both hrefs still point at the live old slug `/blog/aladtec-vs-managed-service`; both need the href updated to `/blog/aladtec-vs-simplescheduleai` on migration day alongside the 301.

### Target: `/blog/tcp-scheduling-software-vs-managed-service` (renames to `/blog/tcp-scheduling-software-vs-simplescheduleai`)

| Referencing file (staged) | Batch | Anchor text before → after | Ledger ref |
| --- | --- | --- | --- |
| `guided-setup-vs-self-configured-nurse-scheduling-software.md` (formerly managed-service-vs-scheduling-software.md) | H1 Post 1 | "TCP scheduling software versus a managed service" → "TCP scheduling software versus guided-setup software" | LEDGER-H1 Post 1, What to Do This Week item 5 |
| `aladtec-vs-simplescheduleai.md` (formerly aladtec-vs-managed-service.md) | H1 Post 2 | "TCP scheduling software versus a managed service" → "TCP scheduling software versus guided-setup software" | LEDGER-H1 Post 2, "What Is Aladtec?" section |

**Count: 2 referencing files**, both from within the same H1 batch (cross-links between the batch's own retitled posts).

### Target: `/how-it-works` (page itself converts on migration day, not a blog slug — no rename, but anchor-text migrations logged for completeness)

| Referencing file (staged) | Batch | Anchor text before → after | Ledger ref |
| --- | --- | --- | --- |
| `hipaa-compliant-nurse-scheduling-software.md` | S2 Post 4 | "how the managed service works" → "how the software works" | LEDGER-S2 Post 4 |
| `best-tcp-alternative-for-cah.md` | S1 Post 5 | "see how the managed service works" → "see how the guided-setup software works" | LEDGER-S1 Post 5 |

**Count: 2 referencing files.** No slug rename needed (href stays `/how-it-works`); flagged only because the `/how-it-works` PAGE content itself is a positioning surface that converts on migration day per the registry runbook Pass 2 rule 3-4, so these anchors should be re-verified against that page's post-migration copy.

## 3. H2 / TOC anchor-fragment renames (heading text + anchor slug both changed)

Every row below changed a heading's rendered text AND its auto-generated URL fragment. On
migration day, any external bookmark or inbound link to the OLD fragment breaks; each row states
whether a same-corpus inbound fragment reference was found (all checks below were scoped to
`src/data/post/` and `src/data/article/` only — external backlinks and bookmarks are not covered).

| Post (staged) | Old H2 text | New H2 text | Old anchor fragment | New anchor fragment | Inbound fragment refs found in corpus? |
| --- | --- | --- | --- | --- | --- |
| `guided-setup-vs-self-configured-nurse-scheduling-software.md` (H1 Post 1) | "What Is Scheduling Software vs. a Managed Scheduling Service?" | "What Is Self-Configured Software vs. Guided-Setup Scheduling Software?" | `#what-is-scheduling-software-vs-a-managed-scheduling-service` | `#what-is-self-configured-software-vs-guided-setup-scheduling-software` | None found |
| same post | "Feature Comparison: Software vs. Managed Service" | "Feature Comparison: Self-Configured vs. Guided-Setup Software" | `#feature-comparison-software-vs-managed-service` | `#feature-comparison-self-configured-vs-guided-setup-software` | None found |
| same post | "When Is Scheduling Software the Right Choice?" | "When Is Self-Configured Software the Right Choice?" | `#when-is-scheduling-software-the-right-choice` | `#when-is-self-configured-software-the-right-choice` | None found |
| same post | "When Is a Managed Service the Right Choice?" | "When Is Guided-Setup Software the Right Choice?" | `#when-is-a-managed-service-the-right-choice` | `#when-is-guided-setup-software-the-right-choice` | None found |
| same post | "What Can a Managed Service Not Do?" | "What Can Guided-Setup Software Not Do?" | `#what-can-a-managed-service-not-do` | `#what-can-guided-setup-software-not-do` | None found |
| same post | "How Does SimpleScheduleAI Work as a Managed Service?" | "How Does SimpleScheduleAI Work as Guided-Setup Software?" | `#how-does-simplescheduleai-work-as-a-managed-service` | `#how-does-simplescheduleai-work-as-guided-setup-software` | None found |
| `aladtec-vs-simplescheduleai.md` (H1 Post 2) | "What Is a Managed Scheduling Service?" | "What Is SimpleScheduleAI's Guided-Setup Model?" | `#what-is-a-managed-scheduling-service` | `#what-is-simplescheduleais-guided-setup-model` | None found |
| same post | "When Is a Managed Service the Right Choice?" | "When Is SimpleScheduleAI the Right Choice?" | `#when-is-a-managed-service-the-right-choice` | `#when-is-simplescheduleai-the-right-choice` | None found |
| `tcp-scheduling-software-vs-simplescheduleai.md` (H1 Post 3) | "What Does a Managed Scheduling Service Do Differently?" | "What Does SimpleScheduleAI's Guided-Setup Model Do Differently?" | `#what-does-a-managed-scheduling-service-do-differently` | `#what-does-simplescheduleais-guided-setup-model-do-differently` | None found |
| same post | "Where Does a Managed Service Win?" | "Where Does SimpleScheduleAI Win?" | `#where-does-a-managed-service-win` | `#where-does-simplescheduleai-win` | None found |
| `hospital-staff-scheduling-software-critical-access.md` (H2 Post 4) | "Is Self-Serve Software or a Managed Service Right for Your Hospital?" | "Is Self-Serve Software or Guided-Setup Software Right for Your Hospital?" | `#is-self-serve-software-or-a-managed-service-right-for-your-hospital` | `#is-self-serve-software-or-guided-setup-software-right-for-your-hospital` | None found (checked via corpus-wide grep, LEDGER-H2) |
| `nurse-scheduling-no-it-department-rural-hospital.md` (S3 Post 1) | "How Does a Managed Scheduling Service Differ From Scheduling Software?" | "How Does Guided-Setup Scheduling Software Differ From Self-Configured Software?" | `#how-does-a-managed-scheduling-service-differ-from-scheduling-software` | `#how-does-guided-setup-scheduling-software-differ-from-self-configured-software` | None found (checked, LEDGER-S3) |
| `m7-health-vs-simplescheduleai.md` (dry-run round 1, Post 2) | "Two Different Models: Managed Service vs. Software You Run Yourself" | "Two Different Models: Guided-Setup Software vs. Software You Integrate Yourself" | `#two-different-models-managed-service-vs-software-you-run-yourself` | `#two-different-models-guided-setup-software-vs-software-you-integrate-yourself` | None found (checked, DECISIONS.md) |
| same post | FAQ 4 heading: "Why does SimpleScheduleAI use a managed service model instead of software?" | "Why does SimpleScheduleAI use a guided-setup model instead of an integration project?" | (FAQ, not in TOC — no anchor fragment) | (FAQ, not in TOC — no anchor fragment) | N/A |
| `ai-nurse-scheduling-vs-traditional.md` (dry-run round 1, Post 3) | "Is AI Scheduling Software or an AI Managed Service Better for a Small Hospital?" | "Is a Self-Configured AI Platform or a Guided-Setup AI Software Better for a Small Hospital?" | `#is-ai-scheduling-software-or-an-ai-managed-service-better-for-a-small-hospital` | `#is-a-self-configured-ai-platform-or-a-guided-setup-ai-software-better-for-a-small-hospital` | None found |

**Total: 15 H2/TOC anchor renames** across 6 posts (H1 Posts 1/2/3, H2 Post 4, S3 Post 1, dry-run round-1 Posts 2/3). Zero same-corpus inbound fragment references were found for any of them (all checks scoped to `src/data/post/` + `src/data/article/`; external backlinks/bookmarks not covered by any ledger's check). S2 and S4 batches had **zero** H2/TOC renames (confirmed in both ledgers' batch-totals sections).

## 4. Tag / metadata slug-adjacent changes (not URL slugs, but positioning-bearing metadata)

| Post | Old tag | New tag | Ledger ref |
| --- | --- | --- | --- |
| `guided-setup-vs-self-configured-nurse-scheduling-software.md` (H1 Post 1) | `managed-service` | `guided-setup-software` | LEDGER-H1 Post 1 |
| `aladtec-vs-simplescheduleai.md` (H1 Post 2) | `managed-service` | `guided-setup-software` | LEDGER-H1 Post 2 |
| `tcp-scheduling-software-vs-simplescheduleai.md` (H1 Post 3) | `managed-scheduling-service` | `guided-setup-software` | LEDGER-H1 Post 3 |
| `inhouse-health-vs-simplescheduleai.md` (H1 Post 4) | `managed-service` | `guided-setup-software` | LEDGER-H1 Post 4 |

Tags are not URL-bearing in this codebase's routing (confirmed against `src/pages/` structure
during ledger review — no `/tag/<slug>` route pattern found referencing these specific tag
strings), so no 301 is needed for tag changes; listed here only because tags are a
positioning-bearing metadata surface per the registry's frontmatter-in-scope rule, and a
migration-day content audit should confirm no tag-based archive page depends on the old string.

## 5. Summary counts

| Category | Count |
| --- | --- |
| Slug renames requiring a 301 | 3 (all in H1, all vendor-vs-vendor Option-A) |
| Slug renames recommended but not yet applied to a staged file (open founder decision) | 1 (shiftwizard-vs-managed-service, DRIFTED, needs re-conversion with the retitle actually applied) |
| Internal links with migrated anchor text (href unchanged, pointing at old slugs) | 17 total: 11 to `/managed-service-vs-scheduling-software`, 2 to `/aladtec-vs-managed-service`, 2 to `/tcp-scheduling-software-vs-managed-service`, 2 to `/how-it-works` |
| H2/TOC anchor-fragment renames | 15 across 6 posts |
| Tag metadata changes (non-URL) | 4 |

## 6. Migration-day sequencing recommendation

1. **Resolve the open founder decision on `shiftwizard-vs-managed-service` first** (section 1, row
   4) — re-run the converter with the actual retitle applied, since the founder already picked
   Option A but the staged body doesn't reflect it, and the source has also drifted since staging
   (see `MIGRATION-STATUS.md`).
2. **Publish the 4 retitled/renamed posts together** (the 3 in section 1 plus the resolved
   ShiftWizard post), add all 4 redirects to `netlify.toml` in the same commit.
3. **In the same pass, update every href in section 2's table** from the old slug to the new slug
   directly (do not rely on the 301 chain for internal links — LEDGER-H1's own recommendation).
4. **Re-verify the 15 H2 anchor fragments in section 3** did not pick up any NEW inbound fragment
   reference from posts published between this staging pass and migration day (the "none found"
   checks above are point-in-time as of 2026-07-05).
5. **Re-run this dependency map after resolving item 1**, since a retitled ShiftWizard post may
   introduce new anchor renames or cross-links not captured here.
