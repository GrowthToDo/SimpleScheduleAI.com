---
name: skill-authoring
description: Load before creating, editing, splitting, or adding anything to a skill in .claude/skills/. Encodes this repo's skill conventions (router + reference-file pattern, what belongs in a skill vs a doc) on top of the generic craft in superpowers:writing-skills.
---

# Skill authoring (this repo)

For the generic craft of writing a skill, use `superpowers:writing-skills`. Do not
duplicate it here. This file covers only what is specific to this repo, and the
mistakes that have actually happened in it.

## The one test before you add anything to a skill

**Is this durable process, or is it state?**

A skill tells the reader HOW to do a recurring thing. It is loaded into context
every time that thing happens, so everything in it is paid for on every run.

- **Process** belongs in the skill: phase order, gates, decision rules, hard bans.
- **State** belongs in a doc under `docs/`, with a one-line pointer from the
  skill: which drafts are blocked, what a vendor emailed, current counts, this
  month's findings, anything with a date that will be wrong later.

If you cannot say what would make the text wrong six months from now, it is
probably process. If you can, it is state, and it goes in a doc.

## Conventions that already exist here

- **Router + reference files.** `seo-aeo-simplescheduleai.md` is a 125-line
  router: product context, non-negotiables, and a task-to-file table. The depth
  lives in `seo-aeo/*.md` and is loaded on demand. When a skill passes roughly
  150 lines, split it that way rather than letting it grow.
- **Gates outrank skills.** Where a rule is mechanically enforced
  (`check-blog.mjs`, `publish-gate.mjs`, the pre-commit hook), the script is the
  authority and the skill explains intent. Never restate a mechanical rule in a
  way that could drift from the script.
- **Docs are the source of truth for facts and claims.** `facts-dossier.md`,
  `competitor-dossier.md`, `positioning-registry.md`,
  `product-capability-inventory-2026-08.md`. Skills point at them; skills do not
  copy them.
- **Split files carry a provenance comment** at the top saying where the content
  came from and that the gate is the authority. If you add new material to a
  split file, the comment saying content is verbatim is no longer true unless
  your addition is clearly marked.

## Editing an existing skill

1. Read the whole file first. These files have structure (numbered PARTs,
   ordered phases) that a targeted insert can silently break.
2. Insert INSIDE the existing structure, never above the first heading. Two real
   regressions came from prepending: a transient BLOCKED-DRAFTS table pushed the
   pipeline's first command down the page, and a vendor note replaced the
   `## PART 6 — KEYWORD STRATEGY` heading outright, orphaning 6.1 and 6.2 under
   the wrong section.
3. After editing, grep the headings (`grep -n "^## \|^### " <file>`) and confirm
   the outline still reads correctly. The damage from a bad insert is invisible
   in a diff and obvious in the outline.
4. Keep the frontmatter `description` a trigger, not a summary: it should say
   WHEN to load the skill, because that is what the model matches on.

## Do not create a skill when

- A doc would do. Most new material is a doc plus a pointer.
- A plugin skill already covers it (`superpowers:writing-skills`,
  `superpowers:brainstorming`, and the rest). Point at it instead of forking it.
- It would only ever be read once. Skills earn their context cost through repeat
  use.
