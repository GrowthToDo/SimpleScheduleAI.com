---
name: launch-video-remotion
description: How to build brand-faithful launch/marketing videos for SimpleScheduleAI as code, using Remotion (programmatic React → MP4). Load when creating, editing, re-timing, re-formatting, or QA-ing a product video. Covers project structure, the warm-editorial brand system, the beat/timeline pattern, multi-aspect output, audio, and the stills-based QA loop. The seed inspiration was the "brag" repo; the actual renderer is Remotion.
---

# SimpleScheduleAI — Launch Video (Remotion) Reference

Build product videos **as code**, not in a video editor. The video reuses the product's real engine, data shapes, palette, and fonts, so it looks like SimpleScheduleAI — not generic stock motion. One React source renders every aspect ratio, is re-renderable, diffable, and parametrizable.

> Origin note: the user calls this "the brag way." `brag` (github.com/latent-spaces/brag) was the brainstorm seed. We did **not** use brag to render — the renderer is **Remotion**. Keep that straight when talking to the user.

## When to use

- New launch / explainer / ad / social video for SSAI.
- Re-timing a beat (make a section longer/shorter), adding/removing a beat.
- Producing a new platform format (9:16, 16:9, 1:1) from the same content.
- QA-ing a render (you cannot watch video — you extract stills and look).

## Project location & stack

- **Project dir:** `d:/Pradeep/Personal/Projects/ssai-launch-video/` (separate from the website repo).
- **Renderer:** [Remotion](https://remotion.dev) — `remotion`, `@remotion/cli`, `@remotion/google-fonts`.
- **Fonts:** loaded in-bundle via `@remotion/google-fonts/Fraunces` and `/Inter` (no network at render time).
- **ffmpeg/ffprobe for QA:** **NOT on PATH on this machine.** Get the binary from the Python `imageio_ffmpeg` package:
  ```bash
  FF="$(python -c "import imageio_ffmpeg as m; print(m.get_ffmpeg_exe())")"
  # ffprobe sits next to it: ...\binaries\ffprobe-win-x86_64-v7.1.exe
  ```

## File map

| File                                              | Role                                                                                                                                             |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/Root.tsx`                                    | Registers `<Composition>`s + the `FPS` and `DURATION` (total frames) constants. One composition per aspect ratio, all sharing `DURATION`.        |
| `src/SSAILaunch.tsx`                              | The timeline. `<Audio>` + one `<Sequence>` per beat. Houses the `useBeat`/`useLayout` helpers and every beat component.                          |
| `src/theme.ts`                                    | `COLORS` (warm-editorial palette) + Fraunces/Inter font loading. Mirrors the site's `CustomStyles.astro`.                                        |
| `src/data.ts`                                     | Real schedule / checklist / callout data — same shapes the simulator uses. Keeps content authentic.                                              |
| `src/engine.ts`                                   | Vendored copy of the product's **pure** scheduling engine, so on-screen data is real, not mocked. Re-vendor from the site if the engine changes. |
| `src/components/ui.tsx`                           | Primitives: `Stage`, `Card`, `Eyebrow`, `Display`, `Chip`, and the `appear()` spring.                                                            |
| `src/components/ScheduleGrid.tsx`                 | The week grid (day/night sub-rows). Has a `cols` prop: 1 = tall single column (vertical), 2 = Mon–Thu \| Fri–Sun (landscape).                    |
| `src/components/Checklist.tsx`, `CalloutCard.tsx` | The compliance and call-out card visuals.                                                                                                        |

## Brand system (must match the site exactly)

```ts
COLORS = {
  ink: '#1a2332', // dark stage + text on light
  ivory: '#faf7f2', // light surfaces + text on dark
  green: '#2d5a4a', // primary accent ON LIGHT surfaces / "done"
  greenOnDark: '#8ec9b1', // accent that stays legible ON the ink-navy stage
  amber: '#b45309',
  red: '#b91c1c',
  inkMuted: 'rgba(26,35,50,0.62)',
  ivoryMuted: 'rgba(250,247,242,0.66)',
  hairline: 'rgba(26,35,50,0.12)',
};
```

- **Fonts:** Fraunces (display, weight 600, `letterSpacing -0.02em`) for headings; Inter for all UI/body. Exactly the site pairing.
- **Contrast rule (learned the hard way):** forest `green` (#2d5a4a) is unreadable on the `ink` stage. For any green accent on the dark stage (highlighted verbs, the CTA pill), use `greenOnDark` (#8ec9b1). `green` is only for light (ivory) cards.
- **Card:** ivory bg, `borderRadius: 28`, hairline border, `boxShadow: 0 40px 90px rgba(0,0,0,0.45)`.

## The beat pattern

Every beat is a `<Sequence>` rendering a component that uses `useBeat`. `useBeat` combines an **entrance** (rise + fade-in spring) with an **exit fade** over the beat's last 12 frames, so beats hand off cleanly. Returns an `enter(delay, y)` helper for staggering elements.

```tsx
const useBeat = (dur: number, fadeTail = true) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = fadeTail
    ? interpolate(frame, [dur - 12, dur], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 1;
  const enter = (delay = 0, y = 26): React.CSSProperties => {
    const a = appear(frame, fps, delay, { y }); // spring rise+fade from ui.tsx
    return { opacity: (a.opacity as number) * out, transform: a.transform };
  };
  return { frame, fps, enter };
};
```

**Gotcha this solves:** if you write `style={{ opacity: o, ...appear() }}`, the spread's `opacity` clobbers your fade. `useBeat` multiplies entrance × exit into one opacity. Always use `enter()` for beat content. The Outro passes `fadeTail = false` so it holds instead of fading.

## Timeline / frame math

Sequences tile by `from` + `durationInFrames`; `from` values are **cumulative**. Current arc (30 fps):

| Beat       | from | dur | content                                              |
| ---------- | ---- | --- | ---------------------------------------------------- |
| Hook       | 0    | 84  | "A nurse just called out. Again." (the pain)         |
| Build      | 84   | 180 | "Your AI builds the schedule." + week grid           |
| Compliance | 264  | 132 | "21 rules. Checked automatically." + checklist       |
| Callout    | 396  | 156 | "Call-out? Filled in under two minutes."             |
| Verified   | 552  | 114 | "The AI builds it. Our team checks it. You approve." |
| Outro      | 666  | 194 | "Scheduling, done." + CTA (holds, no fade)           |

`DURATION = 860` (Root.tsx). Audio fade-out window `[812, 860]`.

### Recipe: extend/shorten a beat by Δ frames

1. Change that beat's `<Sequence durationInFrames>` by Δ **and** its `useBeat(dur)` argument to match.
2. Add Δ to **every downstream** Sequence's `from`.
3. Add Δ to `DURATION` in `Root.tsx`.
4. Shift the audio fade window by Δ (`[end-48, end]`).

> Worked example (done): +2s on Verified = +60 frames. Verified dur 54→114 + `useBeat(54→114)`; Outro from 606→666; DURATION 800→860; audio fade `[752,800]→[812,860]`. Entrance timing is unchanged, so only the **hold** lengthens — which is exactly what "make this bit longer / more readable" means.

## Multi-format (one source, many aspects)

Compositions in `Root.tsx` (all share `DURATION`):

```tsx
<Composition id="SSAILaunchVertical"  component={SSAILaunch} width={1080} height={1920} fps={30} durationInFrames={DURATION} />
<Composition id="SSAILaunchLandscape" component={SSAILaunch} width={1920} height={1080} fps={30} durationInFrames={DURATION} />
// add SSAILaunchSquare 1080×1080 the same way when needed
```

`useLayout()` reads `useVideoConfig()` and returns `{ vertical, cardW }`. **Gate every layout that must differ by aspect on `vertical`** so the other format's output stays byte-identical:

```tsx
const useLayout = () => {
  const { width, height } = useVideoConfig();
  const vertical = height >= width;
  return { vertical, cardW: vertical ? 980 : 1240 };
};
```

**Worked example — the landscape overflow fix:** the 7-row schedule card is ~1000px tall. It fits a 1920-tall vertical canvas but **clips on a 1080-tall landscape canvas**. Fix: `ScheduleGrid` got a `cols` prop; Build passes `cols={vertical ? 1 : 2}` and a wider card on landscape. `cols=2` splits the week Mon–Thu \| Fri–Sun, halving the height and using the 16:9 width. The `cols=1` branch is markup-identical to the original, so the approved vertical render is unaffected. **Principle: when content overflows a short-wide canvas, split it into columns rather than scaling it down.**

Text-only beats (Hook/Verified/Outro) are centered columns and need no per-aspect work — they fit any frame.

## Audio

```tsx
<Audio
  src={staticFile('the_mountain-hopeful-492806.mp3')}
  volume={
    (f) =>
      0.72 *
      interpolate(f, [0, 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) * // fade in
      interpolate(f, [DURATION - 48, DURATION], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) // fade out
  }
/>
```

- Music lives in `public/` and is referenced with `staticFile()`.
- **Always ffprobe the track length** and confirm it's ≥ composition seconds, or the tail renders silent. (The current track is 90s; the cut is ~29s.)
- The agent cannot hear audio. To judge a track, analyze it with Python `librosa` (tempo, energy curve) — never claim to have "listened."

## Render & preview commands (package.json)

```
npm run studio            # live preview at localhost (remotion studio)
npm run render            # → out/ssai-launch-vertical.mp4
npm run render:landscape  # → out/ssai-launch-landscape.mp4
npx remotion still SSAILaunchLandscape out/x.png --frame=250   # one frame, fast (re-bundles)
```

## QA loop (you cannot watch the video — look at frames)

1. Render the MP4 (or a `remotion still` for fast single-frame iteration).
2. Extract a still at each beat's **mid-point and end** and `Read` the PNG:
   ```bash
   "$FF" -y -i out/ssai-launch-landscape.mp4 -ss <seconds> -frames:v 1 out/check.png -loglevel error
   # seconds = frame / 30
   ```
   Sample the END of animated beats too (e.g. Build frame ~250) to confirm reveals complete and nothing clips.
3. Check each still for: overflow/clipping, edge collisions (brand mark vs heading), contrast (green-on-dark), text fit/wrap, reveal completeness.
4. Verify the final file with ffprobe: resolution (`DAR 9:16`/`16:9`), duration, **and** that an `Audio: aac` stream is present.

## Content arc & positioning guardrails

The 6-beat arc that worked: **pain → product builds it → rules checked → fast recovery → AI-builds/human-checks/you-approve → CTA.** Keep it concrete and product-true.

Video copy obeys the same SSAI positioning rules as the site (see project memory):

- "AI-native nurse scheduling service" — **not** "managed service" as a self-label.
- No fabricated stats, no pilot-customer claims, no credential/license-tracking claims.
- The "AI builds it · our team checks it · you approve" line is the canonical positioning beat.

## Bug log (don't re-discover these)

- **Opacity clobber:** spreading `appear()` after `opacity:` kills the beat fade → use `useBeat`'s `enter()`.
- **Green-on-dark:** `green` invisible on `ink` → `greenOnDark` for dark-stage accents.
- **Landscape card overflow:** tall card clips on 1080-tall canvas → split into `cols=2`, gated on `!vertical`.
- **Callout data bug:** the dropped nurse showed up as her own #1 replacement → filter `c.nurse.id !== dropped.id` when ranking replacements.
- **Outro too fast to read:** hold the final frame ~5s (`fadeTail=false` + long Outro dur).
- **ffmpeg missing:** not on PATH → use the `imageio_ffmpeg` binary path.
- **Commit messages w/ quotes (PowerShell):** here-string arg-split breaks `git commit -m` → write to a file and `git commit -F`.
