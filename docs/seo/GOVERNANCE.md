# Governance Map — Who Is Authoritative for What

One page. Every publish/content governance doc, its single responsibility, and what it is NOT
authoritative for. When two docs disagree, the conflict rule at the bottom decides — do not
reconcile by hand-picking the rule you like.

## The map

| Doc                                                                                | Single responsibility                                                                                                                                                                                    | NOT authoritative for                                                                                                                                                       |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.claude/skills/publish-pipeline.md`                                                | **The runbook.** Phase order, manifest fields, model roles, who sets which verdict, the proofread reference matrix. If you are publishing, this is the doc you follow.                                     | Individual writing rules (skills), mechanical checks (scripts), facts (dossiers).                                                                                             |
| `scripts/check-blog.mjs`, `check-links.mjs`, `publish-gate.mjs`, `smoke-routes.mjs` | **Mechanical law.** Every deterministic, grep-able rule lives here and ONLY here (incl. `scripts/lib/facts-rules.mjs`, the pre-commit hook). A new mechanical rule goes into a script + test, not a doc.   | Judgment calls (voice, hooks, image tone). A green gate never implies the judgment pass happened.                                                                             |
| `docs/seo/facts-dossier.md`                                                         | **Canonical facts.** Approved wording, URLs, and verification dates for every external stat/regulation and SSAI product truth. New facts get verified and ADDED here in the same session.                  | Process, style, competitor review quotes (competitor dossier).                                                                                                                |
| `docs/seo/competitor-dossier.md`                                                    | **Canonical competitor data.** Verbatim quotes, ratings, product-page verifications with dates.                                                                                                            | How to write competitor sections (competitor-reviews skill), non-competitor facts (facts dossier).                                                                            |
| `docs/seo/pre-publish-checklist.md`                                                 | **Judgment-item catalog ONLY.** The list of things a human or review agent must judge on every post. Mechanical items belong in scripts; the checklist may point at them but never re-specifies them.       | Process order (pipeline skill), mechanical rules (scripts), writing style (seo-aeo skill). Nothing in it overrides a script or dossier.                                       |
| `.claude/skills/seo-aeo-simplescheduleai.md`                                        | **Writing style + AEO.** How to write a post: structure, voice, AEO capsules, hard-won writing rules. Loaded by every writing agent.                                                                       | Publish process, mechanical enforcement, competitor data.                                                                                                                     |
| `.claude/skills/competitor-reviews.md`                                              | **Competitor content method.** How to source, quote, and frame competitor material (dossier-first, then live fetch).                                                                                       | The data itself (competitor dossier), general writing style.                                                                                                                  |
| `.claude/skills/trendjacking-articles.md`                                           | **/articles (Newsroom).** Relevance gradient, citable-hook rule, draft-then-publish flow for `src/data/article/*`.                                                                                         | Blog posts (`src/data/post`), the publish gate itself (pipeline + scripts govern those identically for articles).                                                             |
| `docs/seo/corpus-backlog.md`                                                        | **Debt ledger.** Known defects in already-live posts, each entry sized + tagged for a later fix session. (Created by the risk-ranked corpus audit; if the file does not exist yet, the ledger is empty.)   | Rules for NEW posts. A backlog entry is not permission to repeat the defect.                                                                                                  |
| `docs/design/DESIGN.md`                                                             | **Visual law (pending Phase 0 of `docs/design/redesign-plan-2026-07-07.md`).** Fonts, color tokens, radius/shadow language, callout + eyebrow idioms, illustration style. Every page and post conforms visually to it once the founder picks a style direction. Until it exists, the current site IS the visual law. | Copy, claims, positioning (registry + dossiers), process, mechanical checks. A visual rule never changes what a sentence says. |

## Conflict rule

**scripts > dossier > skill > checklist.**

- A script (gate) verdict beats any doc's prose. If the gate is wrong, fix the script (with a
  test), never override it by citing a doc.
- A dossier entry (facts or competitor) beats a skill's or checklist's remembered version of the
  same fact. Wording drift resolves toward the dossier.
- A skill (pipeline, seo-aeo, competitor-reviews, trendjacking) beats the checklist. The
  checklist's old "Part 0 overrides items below" pattern is retired: a checklist must not contain
  items that need overriding — if an item is superseded, delete it from the checklist and record
  the rule in the winning doc.
- Found a contradiction? Fix it in the LOSING doc immediately (delete or re-point), in the same
  session. Duplicated rules drift; a rule lives in exactly one place and everywhere else links to
  it.

## Where does a NEW rule go?

1. Grep-able / deterministic → `scripts/check-blog.mjs` (or the relevant gate) + a test. Never a doc.
2. A fact / approved wording / URL → the facts dossier (or competitor dossier).
3. A writing habit or style rule → the seo-aeo skill (or trendjacking skill for /articles).
4. A process step → the publish-pipeline skill (+ a manifest field if it must be gate-visible).
5. A judgment check a reviewer must run per-post → the pre-publish checklist.
6. A known defect in live posts, deferred → the corpus backlog.
