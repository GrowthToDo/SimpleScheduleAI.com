# Design: Rebrand offering to "AI nurse scheduling service" — website copy only

Date: 2026-06-07. Status: PLAN (no execution). Blogs are out of scope (handled in a later part).

## Decision summary (founder-confirmed)

- **Category label:** "AI nurse scheduling service" replaces "managed service" / "done-for-you" as the *identity* across the site.
- **Emphasis:** shift forward to AI / technology framing.
- **Keep (founder-confirmed):** a light "we run it for you, no IT, nothing to install" reassurance line — kept as a supporting benefit, NOT deleted, NOT the headline. This preserves the differentiator CAHs actually buy.
- **AI honesty:** "clean AI service label." The AI + human-review mechanics live on `/how-it-works` only — not in every hero line. No "fully autonomous AI" phrasing anywhere (engine is an early/prototype that we operate; no-overclaim rule).
- This is the lighter alternative to the parked self-serve-SaaS reposition plan (`~/.claude/plans/ok-lets-plan-something-shiny-nova.md`). That direction is parked; this is what we are doing.

## Why

"Managed service / done-for-you" reads as outsourcing labor. "AI nurse scheduling service" reframes the same offering as technology-led (current buyer expectation + buzzword pull) while staying honest: an AI engine builds the schedule, our team reviews it, the hospital approves. Also aligns with the existing `/ai-nurse-scheduling` pillar and "AI nurse scheduling" search intent.

## Surface-by-surface change inventory

| Surface | File | Change |
|---|---|---|
| Hero eyebrow / H1 / subhead | `src/components/widgets/Hero.astro`, `src/pages/index.astro` | Lead AI. Subhead e.g. "An AI nurse scheduling service for Texas Critical Access Hospitals." Keep one light reassurance clause: "We run it for you — no IT, nothing to install." |
| Announcement badge / credential strip | `src/pages/index.astro` | "Full Managed Service" badge → "AI Nurse Scheduling Service". Keep "No IT Setup" / "First Schedule < 2 Weeks" as supporting benefits. |
| `SoftwareVsService` component | `src/pages/index.astro` (~L162) | Reframe "service vs software" thesis → "How the AI service works" (AI builds, we run it, you approve). De-emphasize done-for-you as identity; keep no-IT benefit. |
| Homepage FAQ + FAQPage schema | `src/pages/index.astro` | "managed service" answers → "AI nurse scheduling service". |
| Pillar pages | `src/pages/nurse-scheduling-software.astro`, `src/pages/critical-access-hospital-scheduling.astro` | Identity lines → "AI nurse scheduling service". Keep no-IT reassurance. |
| `ai-nurse-scheduling.astro` | — | Already on-theme; tighten label to "AI nurse scheduling service". |
| `about.astro` H1, `config.yaml` site description | — | → "AI nurse scheduling service for Texas CAHs". |
| `how-it-works.astro` | — | THE single place the AI + human mechanics are spelled out: "An AI engine builds your schedule. Our team reviews it. You approve." Honest human-in-loop, no autonomy claim. |
| `pilot.astro` | — | Keep the 60-day pilot; frame it as the AI service pilot. CTA unchanged. |
| Org JSON-LD description | `src/layouts/Layout.astro` (~L35) | → "AI nurse scheduling service for Texas Critical Access Hospitals". |
| Nav CTA | `src/navigation.ts` | Unchanged: "Apply for a Pilot Spot" → `/pilot`. |

CTAs already standardized (primary "Apply for a Pilot Spot" → `/pilot`, secondary "Book a call with our team" → cal.com); no CTA change in this rebrand.

## Copy guardrails

- Allowed: "AI nurse scheduling service", "an AI engine builds your schedule", "AI-built schedule, reviewed by our team".
- Banned site-wide: "fully autonomous", "AI does it all", "no humans involved", or any phrasing implying a shipped self-serve/login product (none exists yet).
- Reassurance phrase (keep, light): "We run it for you — no IT, nothing to install." Supporting line, never the H1.

## Risks + mitigations

1. **De-emphasizing "we run it / no IT" weakens the CAH purchase driver.** Mitigation: keep the reassurance line on hero + pillars (founder-confirmed). This is the main risk of the AI-forward shift.
2. **"AI" + healthcare trust** — admins may distrust AI near clinical-adjacent decisions. Mitigation: the `/how-it-works` "AI builds, humans review, you approve" framing; never claim autonomy.
3. **No-overclaim (prototype).** Mitigation: clean label only; mechanics confined to `/how-it-works`; grep for banned phrases before any future execution.
4. **SEO drift on pillars.** Mitigation (at execution time): keep slugs/titles/canonicals; reframe body + schema only; capture `seo-drift` baseline first; refresh `dateModified`.

## Verification (for execution phase, later)

- Grep `src/pages` + `src/components` for "managed service" / "done-for-you" as identity → expect replaced (reassurance line allowed).
- Grep for banned autonomy phrases → expect zero.
- JSON-LD validates on homepage + pillars.
- Mobile hero: H1 ≤ 2 lines, subhead readable at 375px.
- `seo-drift` baseline vs after on the two pillars + homepage: only intended deltas.

## Out of scope

Blog posts (later part). Self-serve app / login / pricing tiers (parked). No file edits until a separate execution go-ahead.
