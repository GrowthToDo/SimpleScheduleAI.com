# Premium Redesign — Warm Editorial (Design Spec)

**Date:** 2026-06-12
**Status:** Approved by founder, not yet executed
**Scope:** Visual design only. Zero copy changes. Zero URL/slug/schema changes. SEO-neutral by construction.

## Goal

Make the site look premium and deliberately designed, not "vibe coded." Inspiration set reviewed: getrecharge.com, commerce-ui.com, domaineworldwide.com, impeccable.style. Direction chosen: **Warm Editorial** (Impeccable/Domaine family) — ivory base, serif display headings, ink navy, muted forest green accent. No nurse-scheduling competitor looks like this.

## Diagnosed "vibe coded" tells (current site)

1. Rocket emoji as logo
2. Inter for everything at default weights
3. Saturated default blue (#0161EF) on pure white + stray purple accent
4. 5 blue pill badges stacked in hero, repeated at bottom CTA
5. `bg-blue-50` tinted cards + drop shadows everywhere
6. Mixed button shapes (rounded-full pills)
7. Everything centered, identical rhythm every section
8. Emoji used as icons in places

## Decisions (locked with founder)

| Decision | Choice |
|---|---|
| Direction | B: Warm Editorial |
| Dark mode | **Dropped.** Single light mode. Toggle removed. |
| Accent | Muted forest green (#2D5A4A family) |
| Logo | Serif wordmark "SimpleScheduleAI", emoji removed. Optional small geometric mark later. |
| Rollout | Homepage + global chrome first → review → propagate site-wide in phase 2 |

## 1. Token foundation

Files: `src/components/CustomStyles.astro`, `tailwind.config.js`, `src/config.yaml`.

```
--aw-color-bg-page:      #FAF7F2   (warm ivory)
--aw-color-text-heading: #1A2332   (deep ink navy, never pure black)
--aw-color-text-default: #1A2332
--aw-color-text-muted:   #1A2332 at ~60%
--aw-color-primary:      #2D5A4A   (forest green — CTAs, links, eyebrows)
--aw-color-secondary:    #234739   (green hover)
--aw-color-accent:       remove purple; alias to primary
borders/hairlines:       #1A2332 at ~12%
dark anchor surface:     #1A2332 (footer, ScheduleStability, bottom CTA)
```

- **Fonts:** `@fontsource-variable/fraunces` → `--aw-font-heading`. Inter Variable stays for body/UI. Headings weight 500–600, tight tracking (serif needs less bold). Preload heading woff2; `font-display: swap`.
- **Radius:** cards 12px, buttons 8px. No `rounded-full` on buttons/badges.
- **Elevation:** hairline borders replace drop shadows. Max one soft ambient shadow, reserved for floating product mockups.
- **Dark mode removal:** force light theme in `config.yaml` / `ApplyColorMode`; remove header toggle. Existing `dark:` classes (incl. all blog tables) become inert — leave in place, do not strip. The "dark-mode variants on blog tables" rule is obsolete after this ships; update memory + pre-publish checklist at execution time.

## 2. Global chrome

- **Header** (`Header.astro`, `navigation.ts`): serif wordmark, no emoji. Slimmer bar. Ivory bg, hairline bottom border appears on scroll. Green primary CTA button. "Scheduling Cost Calculator" 2-line label → "Cost Calculator" one line.
- **Footer** (`Footer.astro`): ink navy bg, ivory text, serif column heads. The site's dark anchor.
- **Buttons** (`Button.astro` / CSS): primary = solid green; secondary = hairline navy outline on ivory; 8px radius; 200ms ease transitions.

## 3. Homepage section pass (design only — copy verbatim)

- **Hero:** H1 in Fraunces, larger/tighter. 5 pills → one muted small-caps caption line: "Texas Critical Access Hospitals · No IT · First schedule in under 2 weeks". Interview credibility line stays.
- **SchedulerDemoSection:** keep animation; reframe in ivory card, hairline border. Hero asset of the page.
- **Section rhythm:** alternate ivory / white surfaces; exactly one ink-navy anchor mid-page (ScheduleStability) + dark bottom CTA. Blue-50 tinted cards → white cards with hairline borders.
- **Eyebrows:** consistent system — small caps, letterspaced, muted green.
- **Bottom CTA:** ink navy, serif headline, green button; badge stack → same single caption line as hero (dedupe).
- **Icons:** any emoji-as-icon → Tabler SVG (already in stack).

## 4. Motion

Taste-skill "soft" dial ≈ 3/10: 200–250ms ease hovers; gentle fade-up on section entry (CSS-first, tiny IntersectionObserver if needed — no GSAP); `prefers-reduced-motion` fully respected. No parallax, no scroll-jacking.

## 5. Phase 2 (after homepage review)

Order: `/pricing` → `/how-it-works` → pillars (`/nurse-scheduling-software`, `/critical-access-hospital-scheduling`) → `/about`, `/pilot`, `/contact` → blog layout (inherits tokens automatically; dark CTA cards inside posts get a retune pass). Decks excluded.

## Verification

- Playwright screenshots 1440px + 390px (hero/mid/footer); side-by-side vs inspiration set
- Contrast: ink-on-ivory, white-on-green, ivory-on-navy all ≥ 4.5:1 — checked mechanically
- `npm run build` passes; Lighthouse perf no regression (one extra variable font, preloaded)
- `git diff` review confirms class/structure changes only — zero copy strings changed
- Prettier on changed files only

## Risks

- Serif headings shift brand feel hard → review locally before going live; single revertible commit
- Dark-preference visitors silently get light mode — accepted
- Font swap flash → preload heading woff2

## Out of scope

Copy, URLs, schema content, blogs (content), pitch decks, new imagery/photography (future consideration).
