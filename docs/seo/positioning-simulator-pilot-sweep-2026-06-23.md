# Positioning + Simulator + Pilot Sweep — Execution Checklist (2026-06-23)

Branch: `positioning-simulator-pilot-sweep`

## Goal

Three surgical changes sitewide. **Do not change any other existing content** (no titles, slugs, canonicals, meta, headings, publishDate, claims, structure, word count).

1. **Positioning** → target = **AI-native, human-verified**. Gold frame (verbatim standard to reuse):
   > the AI builds the schedule, our scheduling team checks it, you approve.
2. **Simulator links** → add `/simulator` to the **28 approved topical posts** (+ roi/pricing pages). Vary anchor text; place in the existing "How SimpleScheduleAI works/fits" section.
3. **Pilot offer removal** → remove every **pilot CTA / offer** ("Free 60-day pilot…", "Apply for a Pilot Spot", `/pilot` links). Replace with the live CTA (`/contact` "Book a call" / `/how-it-works`). **Keep** factual wording like "new service in active pilot phase" and "pilot observations" (company-stage facts, not the offer).

## Guardrails

- Edit only the specific flagged string in each file; everything else byte-identical.
- Do **not** touch generic/educational category definitions ("a medical scheduling service is… a specialist builds…") or competitor-comparison "managed service" topic usage.
- Keep the human-verify layer (AI-native **human-verified**, not "pure AI, no team").
- No simulator links in glossary/legal posts.
- Replace removed pilot CTAs — never leave a dead end or empty block.
- `healthcare-staff-scheduling.astro` → **NO CHANGE** (stays 301).
- `pilot.astro` page itself → **301 redirect to `/how-it-works`** as final step (owner-confirmed 2026-06-23), mirroring the `healthcare-staff-scheduling` retirement method.

---

## PHASE 1 — High-blast-radius components / pages / nav

- [ ] **`src/components/widgets/SoftwareVsService.astro`** (renders on homepage)
  - L10 `serv: 'We do, and a human checks it'` → `serv: 'Our AI builds it, our team checks it'`
  - L35 `…rules to enforce yourself. We deliver the finished schedule.` → `…rules to enforce yourself. Our AI builds the finished schedule; our team checks it.`
- [ ] **`src/navigation.ts`**
  - L19 header "Get Started" `href '/pilot'` → `'/contact'`
  - L48 footer "Get Started" `href '/pilot'` → `'/contact'`
  - Footer Product column → **add** `{ text: 'Live Demo', href: getPermalink('/simulator') }` (footer simulator gap)
- [ ] **`src/data/competitors.json`** (dormant/draft — fix before any go-live)
  - L34 `…The service builds and maintains the schedule` → `…Our AI builds and maintains the schedule; our scheduling team checks every draft`
  - L63 `Fully managed scheduling service; hospital reviews and approves` → `AI builds the schedule, our team checks it, hospital reviews and approves`
  - L100 `Free 60-day pilot, then managed-service pricing` → `Flat monthly managed-service pricing` (pilot removal)
- [ ] **`src/pages/how-it-works.astro`** L142-145 Step 3 "We build the schedule and check all 21 rules" → "Our AI builds the schedule and checks all 21 rules; our team validates" (soft; hero already gold)
- [ ] **`src/pages/about.astro`**
  - L37-41 / L114 list items: name AI as builder where currently "a draft schedule built to your rules" (soft tighten only if byte-safe)
  - L224 pilot line → reframe/remove pilot offer copy, repoint to book-a-call
- [ ] **`src/pages/pilot.astro`** → positioning + offer: FLAG for 301 decision (page-level). In this sweep: remove inbound links only; page disposition pending owner call.

---

## PHASE 2 — Blog HARD positioning (AI absent / human-as-builder)

Standard reframe = restore AI as builder, keep specialist as check/maintain layer.

- [ ] `nurse-scheduling-software-vs-excel.md` L146 "our team handles the scheduling work" / L148 "We handle … the weekly schedule build" → AI builds; team checks.
- [ ] `self-scheduling-problems-critical-access-hospital.md` L176 (pilot CTA block — handled in Phase 5).
- [ ] `shiftwizard-alternatives.md` L150 "a scheduling specialist handles setup … builds draft schedules each cycle" → "the AI builds draft schedules each cycle; a scheduling specialist handles setup from your Excel roster, checks each draft, and maintains the system as the roster changes." L340 table cell.
- [ ] `shiftwizard-vs-managed-service.md` L23 "the service builds the schedule, the nurse manager approves it" → "the AI builds the schedule, our team checks it, the nurse manager approves it." L197.
- [ ] `qgenda-alternatives.md` L171 "a specialist … builds draft schedules each cycle" → AI builds; specialist checks. (AI absent from section — also add `/ai-nurse-scheduling` mention via simulator link in Phase 4.)
- [ ] `ukg-migration-small-hospital.md` pilot CTA L211/218 (Phase 5). Body L249 soft.
- [ ] `ukg-too-complex-small-hospital.md` pilot CTA (Phase 5). Body L220-222 soft.
- [ ] `what-automated-nurse-scheduling-actually-means.md` L197 "a managed service where a specialist builds the schedule draft, not a software tool…" → "a managed service where our AI builds the schedule draft and a scheduling specialist checks it, not a software tool…"

## PHASE 3 — Blog SOFT positioning (recurring template)

Template (alternatives posts), current:
> a scheduling specialist handles setup from an Excel roster upload, builds draft schedules each cycle, and maintains the system as the roster changes.

Reframe to:
> the AI builds draft schedules each cycle, while a scheduling specialist handles setup from an Excel roster upload, checks each draft, and maintains the system as the roster changes.

Apply (preserve surrounding sentence incl. "new service in active pilot phase" facts):
- [ ] `aladtec-alternatives.md` L163
- [ ] `nursegrid-alternatives.md` L173 (+36,181)
- [ ] `onshift-alternatives.md` L160
- [ ] `smart-square-alternatives-small-rural-hospitals.md` L162
- [ ] `schedule360-alternatives.md` L200 (+216,381 table)
- [ ] `tcp-scheduling-software-vs-managed-service.md` L75/149 "specialist builds the schedule each cycle" → AI builds; specialist checks.
- [ ] `smartlinx-alternatives.md` L175 "the service handles everything else" → AI builds; team checks/maintains.
- [ ] `ukg-alternatives-small-hospitals.md` L164 "the first schedule is delivered" → AI builds the first schedule; team checks.
- [ ] `12-hour-hospital-shifts-scheduling.md` L210 (managed-service lead before AI) tighten.
- [ ] `after-hours-callout-coverage-small-hospitals.md` L186 (ranked shortlist, AI unnamed) tighten.
- [ ] `best-nurse-scheduling-software-2026.md` L217/592, `best-scheduling-software-25-bed-hospital.md` L180/438, `best-tcp-alternative-for-cah.md` L142/286, `aladtec-vs-managed-service.md` L167-173, `deputy-alternatives-healthcare.md` L154, `healthcare-scheduling-crisis.md` L249, `hospital-staff-scheduling-software-critical-access.md` L148, `managed-service-vs-scheduling-software.md` L318, `nurse-scheduling-no-it-department-rural-hospital.md` L90, `nurse-scheduling-software-pricing.md` L54, `nurse-scheduling-software-small-hospital.md` L182, `nursing-scheduling-software-ai.md` L147 (minor).

CLEAN (no change): best-CAH-hospitals, can-nurses-trust-ai, what-is-CAH, what-is-per-diem, hipaa, how-to-stay-cms, inhouse-vs, m7-vs, texas-overtime, Footer.astro, Layout schema, pillar pages.

## PHASE 4 — Simulator links (28 approved posts + roi/pricing)

Place in existing "How SimpleScheduleAI works/fits" section; vary anchor; minimal insertion.

1. can-nurses-trust-ai-generated-schedule · 2. ai-nurse-scheduling-vs-traditional · 3. what-automated-nurse-scheduling-actually-means · 4. nursing-scheduling-software-ai · 5. after-hours-callout-coverage-small-hospitals · 6. managed-service-vs-scheduling-software · 7. nurse-rostering-vs-scheduling-software · 8. best-nurse-scheduling-software-critical-access-hospitals · 9. nurse-scheduling-software-vs-excel · 10. how-to-stay-cms-compliant-nurse-scheduling · 11. texas-nursing-overtime-compliance-cah · 12. 12-hour-hospital-shifts-scheduling · 13. deputy-alternatives-healthcare · 14. healthcare-scheduling-crisis · 15. hospital-staff-scheduling-software-critical-access · 16. nurse-scheduling-no-it-department-rural-hospital · 17. nurse-scheduling-software-pricing · 18. nurse-scheduling-software-small-hospital · 19. onshift-alternatives · 20. qgenda-alternatives · 21. schedule360-alternatives · 22. nursegrid-alternatives · 23. smart-square-alternatives-small-rural-hospitals · 24. shiftwizard-vs-managed-service · 25. self-scheduling-problems-critical-access-hospital · 26. tcp-scheduling-software-vs-managed-service · 27. what-is-per-diem-nursing · 28. ukg-too-complex-small-hospital

Pages: `roi.astro`, `pricing.astro` → add "Try the live demo" → `/simulator` beside existing CTA.

Excluded from simulator (positioning-fixed only, no link): aladtec-vs, best-25-bed, smartlinx, ukg-alternatives, shiftwizard-alternatives. Skipped entirely: aladtec-alternatives, best-2026, best-tcp, hipaa, inhouse, m7, ukg-migration, what-is-CAH.

## PHASE 5 — Pilot CTA / offer removal

Replacement CTA copy (standard): drop the "Free 60-day pilot…" line; keep the surrounding CTA card but repoint button to `/contact` ("Book a call") and `/how-it-works` ("See how it works"). Remove `/pilot` hrefs and "Apply for a Pilot Spot".

Pilot CTA `<p>`/text "Free 60-day pilot. No IT setup. No commitment. We build the schedule, you approve it." (and variants) in:
- [ ] best-nurse-scheduling-software-critical-access-hospitals L614 · best-nurse-scheduling-software-2026 L659 · december-nurse-callout-surge-cah L203 · can-nurses-trust-ai L173 · best-nurse-scheduling-software-texas L453 · cah-nurse-manager-scheduling-hours L158 · how-to-stay-cms-compliant L239 · island-shifts-night-nurses-cah L164 · fair-holiday-rotation-nurses-cah L203 · inhouse-health-vs L234 · nurse-scheduling-no-it L115 · nurse-scheduling-software-pricing L200 · ukg-migration L218 · seniority-vs-fairness L158 · self-scheduling-problems-cah L176 · night-shift-nurse-schedule-coverage L151 · ukg-too-complex L211/256/261
- [ ] `/pilot` link/button instances: ai-nurse-scheduling-vs-traditional L316/325 · best-healthcare-scheduling-software L215 · aladtec-vs-managed-service L426/440/443 · (full grep list in tool-results)
- [ ] nav L19/L48, about.astro L224, pricing.astro pilot line, pilot.astro (page pending)

NOTE: Keep "active pilot phase" / "pilot observations" / "in active pilot phase" — these are facts, not the offer.

## PHASE 6 — Verify

- [ ] `git diff` review every file — confirm only approved strings changed.
- [ ] Review subagent: diff vs intent, flag any out-of-scope content change.
- [ ] No remaining `/pilot` offer links (grep), no 404 dead-ends.
- [ ] Dash check (no `—`/`–` introduced), dark-mode classes intact on touched tables.
- [ ] Prettier --write + --check on changed files only.
- [ ] Leave on branch; do not merge/push without explicit go-ahead.
