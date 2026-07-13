# Content Refresh Program

Rolling refresh of live posts. SEO rationale: freshness on money/comparison pages compounds
(Dunning "quick wins from existing content"), and every refresh clears standing debt
(self-label wording, stale claims, missing internal links to newer pieces).

## Rules

1. **Trigger:** a live post enters the refresh queue when (a) it turns ~90 days old, (b) it
   appears in `docs/seo/ctr-rewrite-queue.md`, or (c) a dossier fact it cites changes.
2. **A refresh is a real update, never a date bump.** Minimum bar: re-verify every dossier
   fact it uses (60-day rule), add internal links to relevant pieces published since, fix any
   "managed service" self-label to "AI-native nurse scheduling service", check the CTA matches
   the current standard (one button + book-a-call text link), re-run
   `node scripts/check-blog.mjs src/data/post/<slug>.md`.
3. **updateDate moves only when content substantively changed.** Cosmetic-only passes do not
   touch updateDate (that is the founder's no-fake-freshness rule).
4. **Comparison/alternatives posts also re-verify competitor quotes** against
   `docs/seo/competitor-dossier.md` (60-day verification window per the dossier rule).
5. Cadence: 2-3 refreshes per week alongside new publishing; oldest and highest-traffic first.

## Queue — first batch (2026-07-12)

| Priority | Slug | Published | Why now |
| -------- | ---- | --------- | ------- |
| 1 | healthcare-scheduling-crisis | 2025-01-07 | Oldest live post by over a year; likely stale stats + pre-dates all standards |
| 2 | best-nurse-scheduling-software-2026 | 2026-04-02 | Money-cluster head post; also in the registry near-collision pair |
| 3 | ukg-too-complex-small-hospital | 2026-04-11 | 90+ days; competitor claims need 60-day re-verify |
| 4 | self-scheduling-problems-critical-access-hospital | 2026-04-12 | 90+ days; proofread-reference post, keep exemplary |
| 5 | can-nurses-trust-ai-generated-schedule | 2026-04-14 | 90 days; ALSO carries the known CTA deviation (two side-by-side buttons) |
| 6 | ukg-alternatives-small-hospitals | 2026-04-21 | Approaching 90 days; competitor quotes re-verify |
| 7 | aladtec-alternatives | 2026-04-24 | In CTR queue (position 2.5!); meta already rewritten 2026-07-12, body facts next |
| 8 | shiftwizard-alternatives | 2026-04-26 | In CTR queue (shares a query with shiftwizard-vs-managed-service — differentiate during refresh) |

Note: grep found only 1 live post still carrying a hard "is a managed service" self-label
pattern; the 19-post figure from June counted softer variants — each refresh re-checks all
"managed service" usages against the positioning registry regardless.
