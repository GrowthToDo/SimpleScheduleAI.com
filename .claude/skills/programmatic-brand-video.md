---
name: programmatic-brand-video
description: Build a brand-faithful launch / marketing / explainer / social video for ANY product or website as code, using Remotion (programmatic React → MP4). Load when creating, editing, re-timing, re-formatting (9:16 / 16:9 / 1:1), or QA-ing a product video. Product-agnostic method derived from the "brag" skill's pipeline + a Remotion renderer: inspect the brand, plan a storyboard, compose beats, QA on frames.
---

# Programmatic Brand Video (Remotion)

Build a product's video **as code**, not in a video editor. Reuse the product's **own** palette, fonts, UI, and (if it has one) real data — so the video looks like _that product_, not stock motion. One React source renders every aspect ratio, re-renderable and diffable.

This skill is **product-agnostic** — it applies to any website/app. Concrete values appear only in the "Worked example: SimpleScheduleAI" section at the end; treat those as a template to swap, not as fixed truth.

**Lineage:** the _method_ (the four gates, the inspection rubric, the timing floors, tone presets, audio cue-sync, the QA tiers) is adapted from the **brag** skill — https://github.com/latent-spaces/brag — which is genuinely useful reading. brag itself drives a _closed_ renderer (Hyperframes) from HTML/CSS; **here we replace that renderer with Remotion** (plain React + TS, pixel control, versionable). Read brag's `references/*.md` for the source schemas; don't run its `npx hyperframes *` commands.

## When to use

- A new launch / explainer / ad / social video for any product.
- Re-timing a beat, adding/removing a beat, or producing a new format (9:16, 16:9, 1:1).
- QA-ing a render — you can't watch video, so you extract stills and look.

---

## Workflow: four gates

Adapted from brag. Each gate produces an artifact; don't start the next until the prior artifact exists and passes.

```
Gate 1 Inspect → Gate 2 Plan → Gate 3 Compose → Gate 4 Deliver
 (brand+brief)   (storyboard)   (Remotion build)  (QA + render)
```

---

## Gate 1 — Inspect: derive the brand and the brief

**Extract brand tokens from the real product, in this order** (brag's order — don't eyeball-approximate):

1. `index.html` / rendered DOM → `:root` CSS custom properties = the palette.
2. `styles.css` / Tailwind config → `font-family` for display vs body.
3. `README` → product definition, positioning, claims rules.
4. `package.json` → name, framework, real component/data modules worth reusing.

**Answer brag's 9 inspection questions before planning** (from `references/step-1-inspect.md`):
app definition · the hook (the pain) · the _visual_ hook (what real UI to show) · which UI screens/flows · target duration · tone · audio intent · share caption · the user flow to depict.

**Bias rule:** show a **real user flow / real UI animating**, never a diagram or bullet list _about_ the product. The product doing its job is the footage.

## Gate 2 — Plan: the storyboard artifact

Write a markdown storyboard (`plan.md`) — the single north-star input that the Remotion `scenes[]` mirrors. One block per scene:

```
### Scene N — <name> — <seconds>s
On-screen: <copy / which UI>
Motion: <sequential reveal / interaction / hold>
Audio: <cue intent>   Transition: <mood>
```

### Readability-first timing floors (hard constraints, from brag's `step-2`)

- A short **label** must sit settled ≥ **0.8s** after it finishes animating in.
- A **sentence** needs ~**0.3s per word**, minimum **1.2s** settled.
- Entrances run **0.3–0.6s**.
- **Never fix "too much text" by speeding up.** Cut the copy or split into two scenes.
- Compute frames from words: `durationInFrames = max(floor, ceil(words * 0.3 * fps) + entranceFrames + holdFrames)` and assert it against the floor.

### Tone presets

Ship a `TONES` config; the chosen tone sets typography case/weight, scene count (≈3–8), per-scene seconds, transition style/length, and energy. brag's seven: `default · polished · yc-parody · chaotic · deadpan · cinematic · app-store`. Pick one per video; keep it consistent.

## Gate 3 — Compose: build it in Remotion

### Stack & setup

- `remotion`, `@remotion/cli`; fonts via `@remotion/google-fonts/<Family>` (in-bundle, no render-time network) or `@remotion/fonts` for local files.
- Scaffold with `npx create-video@latest` (Blank).
- **ffmpeg/ffprobe for QA** (often not on PATH): use the Python `imageio_ffmpeg` binary —
  ```bash
  FF="$(python -c "import imageio_ffmpeg as m; print(m.get_ffmpeg_exe())")"   # ffprobe sits beside it
  ```

### Project structure

| File                    | Role                                                                                                                   |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `src/Root.tsx`          | One `<Composition>` per aspect ratio. `FPS` + a single shared `DURATION` (total frames) keeps all formats in lockstep. |
| `src/<Project>.tsx`     | The timeline: `<Audio>` + one `<Sequence>` per beat. Houses `useBeat`/`useLayout` + beat components.                   |
| `src/theme.ts`          | `COLORS` (palette copied from the product) + font loading + named easings.                                             |
| `src/data.ts`           | The real content shown on screen (mirror the product's shapes).                                                        |
| `src/<engine>.ts`       | (Optional) vendored copy of the product's **pure** logic so data is authentic. Re-vendor when the product changes.     |
| `src/components/ui.tsx` | Brand primitives: `Stage`, `Card`, `Eyebrow`, `Display`, `Chip`, the `appear()` spring.                                |
| `src/components/*`      | The product's real visuals (dashboard / grid / chart / cards).                                                         |

### Brand system (theme.ts)

- Copy the product's real tokens. Keep BOTH a primary accent for **light** surfaces and a lighter variant for **dark** surfaces.
- **Contrast rule (bites everyone):** a saturated accent that pops on white is often **unreadable on a dark stage**. Keep `accentOnDark` for highlighted words / pills / icons on dark. Test every accent on its real background (WCAG ≥ 3:1 large, ≥ 4.5:1 body).
- Mirror the product's display + UI font pairing. Define one `Card` surface (bg, radius, border, soft large shadow) and reuse it.
- **Named easing tokens** (brag uses these exact curves): `easeOut = Easing.bezier(0.22, 1, 0.36, 1)`, `easeExpo = Easing.bezier(0.16, 1, 0.3, 1)`. Reference them everywhere instead of ad-hoc curves.

### The beat pattern

Each beat is a `<Sequence>` rendering a component that uses `useBeat`: an **entrance** spring (rise+fade) combined with an **exit fade** over the last 12 frames, so beats hand off cleanly. Reusable verbatim:

```tsx
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const appear = (frame: number, fps: number, delay = 0, { y = 26, dur = 18 } = {}) => {
  const p = spring({ frame: frame - delay, fps, durationInFrames: dur, config: { damping: 200 } });
  return { opacity: p, transform: `translateY(${(1 - p) * y}px)` } as React.CSSProperties;
};

const useBeat = (dur: number, fadeTail = true) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = fadeTail
    ? interpolate(frame, [dur - 12, dur], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 1;
  const enter = (delay = 0, y = 26): React.CSSProperties => {
    const a = appear(frame, fps, delay, { y });
    return { opacity: (a.opacity as number) * out, transform: a.transform };
  };
  return { frame, fps, enter };
};
```

**Gotcha:** `style={{ opacity: o, ...appear() }}` lets the spread's `opacity` clobber your fade. `useBeat` multiplies entrance × exit into one opacity. Always style beat content with `enter()`. A final/outro beat passes `fadeTail = false` so it **holds**.

### Timeline / frame math

Sequences tile by `from` + `durationInFrames`; `from` values are **cumulative**; the sum = `DURATION`.

**Recipe — extend/shorten a beat by Δ frames:** (1) change that `<Sequence durationInFrames>` and its `useBeat(dur)` by Δ; (2) add Δ to **every downstream** Sequence's `from`; (3) add Δ to `DURATION`; (4) shift the audio fade-out window by Δ. Entrance timing is unchanged, so this only lengthens the **hold** — exactly what "make this bit more readable" means.

### Multi-format: one source, every aspect

Register one composition per aspect, all sharing `DURATION`:

```tsx
<Composition id="Vertical"  component={Main} width={1080} height={1920} fps={30} durationInFrames={DURATION} />
<Composition id="Landscape" component={Main} width={1920} height={1080} fps={30} durationInFrames={DURATION} />
<Composition id="Square"    component={Main} width={1080} height={1080} fps={30} durationInFrames={DURATION} />
```

`useLayout()` reads `useVideoConfig()` and returns aspect-aware values. **Gate every layout that differs by aspect on a flag** (e.g. `vertical`) so other formats stay byte-identical when you tweak one:

```tsx
const useLayout = () => {
  const { width, height } = useVideoConfig();
  const vertical = height >= width;
  return { vertical, cardW: vertical ? 980 : 1240 };
};
```

**Overflow principle:** tall content (a many-row panel) fits a tall 9:16 canvas but **clips a short-wide 16:9 canvas**. Fix by **splitting into columns** for the wide format (gated on `!vertical`), not by scaling everything down. Centered text-only beats fit any frame.

### Audio (cue-sync with restraint — brag's `audio.md`)

```tsx
<Audio
  src={staticFile('track.mp3')}
  volume={
    (f) =>
      0.35 * // music base; see levels below
      interpolate(f, [0, 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) * // fade in
      interpolate(f, [DURATION - 48, DURATION], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) // fade out
  }
/>
```

- **Levels:** music **0.3–0.4**, SFX **0.55–0.85**, duck to **0.12–0.15** under any voice-over.
- **Track-index convention:** music = 10, SFX = 11+ (keeps layering legible).
- **Cue-sync, sparingly:** run a librosa script (`beat_track` / `onset_detect` / `rms`) to emit `{tempo, beats:[{time,intensity}], strongCues}` in **seconds**; convert `time * fps` → frames. Anchor only **1–3 strong cues** (±0.15s) to scene changes; snap sequential cards to a ±0.10s grid. Don't beat-match every entrance.
- **Reactivity is subtle only:** RMS → a faint hero glow, bass → card presence. **No** waveforms, EQ bars, or strobing.
- **Always ffprobe the track length** ≥ composition seconds, or the tail goes silent. You can't hear audio — judge tracks with librosa (tempo/energy), never claim to have "listened."

## Gate 4 — Deliver: QA and render

### Render & preview

```
npx remotion studio                                 # live hot-reload preview
npx remotion render <CompId> out/<name>.mp4         # full render (add --quality / scale tiers: draft vs final)
npx remotion still  <CompId> out/x.png --frame=N    # one frame, fast (re-bundles each call)
```

Add `render` / `render:landscape` / `render:square` to `package.json`. Render **draft** quality while iterating; **final** only when shipping. Keep prior renders (timestamp or version the output name) so you can compare.

### Three-tier QA (you can't watch video — look at frames)

Modeled on brag's `lint → validate → inspect`:

1. **Lint** — structural: audio tracks don't overlap badly, every beat has a unique id, `DURATION` = sum of beats, fade window inside the last beat.
2. **Validate** — render the MP4, then ffprobe it: resolution / DAR, duration, and that an `Audio: aac` stream is present. Check WCAG contrast of text on its background; check for missing assets.
3. **Inspect** — extract a still at each beat's **mid-point and end** and `Read` the PNG:
   ```bash
   "$FF" -y -i out/<name>.mp4 -ss <seconds> -frames:v 1 out/check.png -loglevel error   # seconds = frame / fps
   ```
   Look for: overflow / clipping, edge collisions (logo vs heading), contrast, text fit/wrap, and **reveal completeness at the beat's end** (sample the end, not just the middle).

### Share copy & hygiene

Auto-draft a `share-copy.txt` (caption + 1–2 variants) alongside the renders. Don't overwrite prior outputs blindly.

---

## Content arc (reusable template)

A 6-beat arc that works for most products — adapt the copy:

1. **Hook** — the pain in the user's words (text-only, big).
2. **Build / Do** — the product doing its core job (real UI animating).
3. **Proof** — rules checked / results / numbers (a panel beat).
4. **Fast win** — a hard case resolved quickly.
5. **Positioning line** — the one-sentence "how it works."
6. **Outro / CTA** — payoff + brand + CTA; **holds ~5s** so it's readable.

Keep copy concrete and product-true; obey the product's own positioning/claims rules — never invent stats or overclaim in a video.

## Bug log (don't re-discover)

- **Opacity clobber** — spreading `appear()` after `opacity:` kills the fade → use `useBeat`'s `enter()`.
- **Accent invisible on dark** — keep a lightened `accentOnDark` variant.
- **Panel overflow on wide formats** — split tall content into columns for landscape/square, gated on the aspect flag.
- **List/relation data bug** — when an item is removed and you rank replacements, filter the removed item out of its own list.
- **Outro too fast** — hold the final frame ~5s (`fadeTail=false` + long final beat).
- **ffmpeg missing on PATH** — use the `imageio_ffmpeg` binary.
- **Commit messages with quotes (PowerShell)** — here-string arg-split breaks `git commit -m` → write the message to a file and `git commit -F`.

---

## Worked example: SimpleScheduleAI (one full instantiation)

The example this skill was extracted from. Swap every value for your own product.

- **Project:** `d:/Pradeep/Personal/Projects/ssai-launch-video/` (separate from the website repo). Compositions `SSAILaunchVertical` (1080×1920) + `SSAILaunchLandscape` (1920×1080), both `DURATION = 860` @ 30 fps (~28.7s). Renders in `out/`.
- **Brand (warm editorial), copied from the site's `CustomStyles.astro`:**
  ```ts
  ink:'#1a2332'  ivory:'#faf7f2'  green:'#2d5a4a'  greenOnDark:'#8ec9b1'  amber:'#b45309'  red:'#b91c1c'
  // green is unreadable on the ink stage → greenOnDark for accents on dark
  ```
  Fonts: Fraunces (display 600, `-0.02em`) + Inter (UI) — the site pairing.
- **Real data:** vendored the product's pure scheduling `engine.ts` + `data.ts`, so the on-screen week is genuine.
- **6 beats:** Hook ("A nurse just called out. Again.") → Build ("Your AI builds the schedule." + week grid) → Compliance ("21 rules. Checked automatically.") → Callout ("Filled in under two minutes.") → Verified ("The AI builds it. Our team checks it. You approve.") → Outro ("Scheduling, done." + CTA, holds).
- **Multi-format fix:** the 7-row week grid clips on 16:9 → a `cols` prop on `ScheduleGrid` (`cols={vertical ? 1 : 2}`, splitting Mon–Thu | Fri–Sun), gated on `vertical` so the vertical render is untouched.
- **Positioning rules obeyed:** "AI-native nurse scheduling service" (not "managed service" as self-label); no fabricated stats, no pilot-customer or credential-tracking claims.
