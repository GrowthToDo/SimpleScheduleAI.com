---
name: project-dev
description: Tech stack, key pages, schema injection pattern, and coding standards for the SimpleScheduleAI Astro site. Load when making code changes to pages, components, or schema — NOT needed for blog post writing or content work.
---

# SimpleScheduleAI — Dev Reference

## Tech Stack

- **Framework:** Astro 7 (static site)
- **Styling:** Tailwind CSS 3 via `postcss.config.mjs` (no Astro integration) — no custom CSS unless Tailwind cannot achieve it
- **Language:** TypeScript + MDX
- **SEO:** @astrolib/seo, @astrojs/sitemap
- **Deployment:** Netlify (`netlify.toml`) or Vercel (`vercel.json`)

## Key Pages

`/`, `/how-it-works`, `/pilot`, `/roi`, `/about`, `/contact`, `/blog`, `/simulator`, `/critical-access-hospital-scheduling`, `/nurse-scheduling-software`

## Schema Architecture

Pages inject page-specific JSON-LD via `<SchemaOrg slot="head" schema={[...]} />` inside `<Layout>`. The slot is forwarded through `PageLayout.astro` → `Layout.astro`. Organization schema is global (hardcoded in `Layout.astro`). Never inline JSON-LD manually in page files — always use `SchemaOrg.astro`.

## File Locations (dev-specific)

| What | Where |
|---|---|
| Blog route | `src/pages/[...blog]/index.astro` |
| Schema component | `src/components/common/SchemaOrg.astro` |
| New blog posts | `src/data/post/` (Markdown/MDX) |

## Coding Standards

- Do not add comments, docstrings, or type annotations to code you did not change
- Do not create helper utilities for one-time operations
- No inline `<svg>` in `.md` post files — SVG fill colors break dark mode and SVG text nodes render as raw concatenated strings. Use Tailwind `<div>` bar charts (percentage widths) and `<table>` with `dark:` variants instead
