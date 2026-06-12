# Motion + Editorial Pass (Approach B) — Design

Date: 2026-06-12 · Status: approved (founder), execute local-only, no commit until review

## Problem

Site reads "AI-made": fully static, every section centered-symmetric, flat ivory with no depth, schedule demo widget off-palette, header broken at 640-1100px (logo overlaps nav, items clip under CTA).

## Design

1. **Header fix** — hamburger below `xl` (1280px); full nav only above. Verify 375/768/1024/1140/1440.
2. **Motion system** — single IntersectionObserver utility + CSS classes, no animation library:
   - `reveal` (fade-up 20px, 500ms, cubic-bezier(0.22,1,0.36,1))
   - `reveal-stagger` (children 80ms apart)
   - Hero load cascade (eyebrow → H1 → subhead → buttons)
   - Count-up on "21 rules" numeral
   - Card hover: lift 2px, shadow deepens
   - `prefers-reduced-motion` disables everything
3. **Animated schedule demo** — on scroll into view, cells fill staggered with nurse names, compliance checks tick green, counter reaches 45/45. Restyle widget to ivory/ink/green palette.
4. **Editorial layout** — left-aligned section headers w/ 2-col splits, oversized serif section numerals (01-05), asymmetric scenario card (sticky left header), navy sections left-aligned + radial green glow, alternating section alignment.
5. **Depth** — subtle CSS grain (~2%) on ivory, layered card shadows (sm resting → md hover).

Scope: homepage widgets + global header/footer. Inner pages inherit motion utilities; layout rework there is follow-up.

## Verification

Playwright at 5 widths, reduced-motion check, Lighthouse perf ≥ 90, `npm run build` clean.
