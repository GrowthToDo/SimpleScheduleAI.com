# Logo concepts — SimpleScheduleAI

Four candidate marks, 2026-07-05. **Open `preview.html` in a browser to review** (double-click it; it needs internet once for the Fraunces/Inter webfonts).

## The system they live in

All four stay inside the site's existing warm-editorial identity, so whichever wins drops straight in:

| Token        | Value                                 |
| ------------ | ------------------------------------- |
| Wordmark     | Fraunces 560, `SimpleScheduleAI.` (green period kept) |
| Ink navy     | `#1A2332` (mark body on light)        |
| Forest green | `#2D5A4A` (accent on light)           |
| Sage         | `#7BAF9B` (accent on dark, dot)       |
| Warm ivory   | `#FAF7F2` (mark body on dark)         |

Deliberately avoided: medical cross, caduceus, heartbeat/pulse line, AI sparkles, circuits, gradients.

## The concepts

| # | Name              | File            | Idea                                                                 | Trade-off                          |
| - | ----------------- | --------------- | -------------------------------------------------------------------- | ---------------------------------- |
| A | The Coverage Mark | `a-coverage.svg` | Staggered shift bars; the green cell fills the open slot             | Most literal, instantly "schedule" |
| B | The Route         | `b-route.svg`    | An S drawn as one route through the schedule, from open shift (dot) to done | Most distinctive, least literal    |
| C | The Sign-off      | `c-signoff.svg`  | A check built from two shift bars; the DON's approval                | Safest, least ownable              |
| D | The Handoff       | `d-handoff.svg`  | Day and night shift bars interlocking; continuity of coverage        | Quietest, S only implied           |

## After a winner is picked

1. Refinement pass: optical corrections at 16/24/32px, spacing grid, clear-space rule
2. Outline the wordmark (no font dependency in the shipped SVG)
3. Exports: `favicon.svg` + `favicon.ico`, `apple-touch-icon.png`, OG-image corner mark, app-icon tile
4. Wire into `src/components/Logo.astro` and `src/config.yaml` / head icons
5. Nothing ships until the founder signs off (fitting, given concept C)
