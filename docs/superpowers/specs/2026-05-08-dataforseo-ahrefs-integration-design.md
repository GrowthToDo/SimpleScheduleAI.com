# DataForSEO + Ahrefs Integration Design

**Date:** 2026-05-08  
**Status:** Approved

## Goal

Enable live keyword research during Claude sessions and bulk CSV exports for the keywords spreadsheet, using DataForSEO (all 9 API modules) and Ahrefs Webmaster Tools (own-domain monitoring).

---

## Architecture

```
~/.claude/settings.json
  ├── dataforseo MCP  ← npx dataforseo-mcp-server (email + password)
  └── ahrefs MCP      ← @ahrefs/mcp (AWT API token)

Claude Code session commands:
  /seo dataforseo keywords <seed>       → keyword ideas + volume
  /seo dataforseo intent <keywords>     → Problem/Solution/Brand buckets
  /seo dataforseo serp <keyword>        → top 3 results + DR check
  /seo dataforseo difficulty <keywords> → filter DR < 50 targets
  /seo dataforseo ranked simplescheduleai.com → our current rankings
  /seo dataforseo backlinks simplescheduleai.com → our link profile
  /seo dataforseo ai-mentions simplescheduleai → GEO visibility

scripts/keyword-research.js
  input:  seed keywords (hardcoded list or CLI arg)
  output: docs/keywords/keywords-YYYY-MM-DD.csv
  fields: keyword, volume, difficulty, intent, top3_avg_dr, bucket, winnable
```

---

## Components

### 1. claude-seo Plugin (global)

- Installs to `~/.claude/skills/seo/` and `~/.claude/agents/`
- Adds 20+ `/seo` commands including the full DataForSEO extension
- One-time setup via `install.ps1`

### 2. DataForSEO MCP Server

- Package: `dataforseo-mcp-server` (official, via npx)
- Auth: HTTP Basic Auth — DataForSEO account email + password
- Config: written to `~/.claude/settings.json` by the DataForSEO extension installer
- Modules enabled: SERP, KEYWORDS_DATA, DATAFORSEO_LABS, BACKLINKS, ONPAGE, DOMAIN_ANALYTICS, BUSINESS_DATA, CONTENT_ANALYSIS, AI_OPTIMIZATION
- Field config: `~/.claude/skills/seo/dataforseo-field-config.json` (reduces response size ~75%)
- Cost: fractions of a cent per call; $6 balance covers hundreds of research sessions

### 3. Ahrefs MCP Server

- Package: `@ahrefs/mcp` (official Ahrefs package)
- Auth: AWT API token (generated from ahrefs.com/webmaster-tools → Settings → API)
- Scope: own verified domain only (simplescheduleai.com) — free tier limitation
- Config: manually added to `~/.claude/settings.json`
- Use case: monitor our own backlink profile and organic keyword rankings

### 4. Bulk Export Script (`scripts/keyword-research.js`)

- Runtime: Node.js (no additional deps — uses native `https` module)
- Auth: reads DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD from `.env.local`
- Input: seed keywords array (edit in script or pass via `node scripts/keyword-research.js "keyword1,keyword2"`)
- Output: `docs/keywords/keywords-YYYY-MM-DD.csv`
- Logic:
  1. For each seed, call DataForSEO Labs → keyword ideas (top 30 per seed)
  2. Batch call Keywords Data API → volume + difficulty
  3. Batch call SERP API → top 3 organic results per keyword
  4. Compute avg DR of top 3 (proxy via DataForSEO domain rank)
  5. Classify intent bucket (Problem/Solution/Brand) from Labs intent field
  6. Mark `winnable = true` if avg_top3_dr < 50 and volume > 50
  7. Write CSV sorted by (winnable DESC, volume DESC)

---

## Credentials Required (from Pradeep)

| Credential          | Where to find it                                       | Used by                 |
| ------------------- | ------------------------------------------------------ | ----------------------- |
| DataForSEO email    | Already logged in at app.dataforseo.com                | DataForSEO MCP + script |
| DataForSEO password | Account password                                       | DataForSEO MCP + script |
| Ahrefs AWT token    | ahrefs.com/webmaster-tools → Settings → API → Generate | Ahrefs MCP              |

---

## File Changes

| File                          | Action                 | Notes                                                                               |
| ----------------------------- | ---------------------- | ----------------------------------------------------------------------------------- |
| `~/.claude/settings.json`     | Modified by installers | DataForSEO + Ahrefs MCP entries added                                               |
| `scripts/keyword-research.js` | Created                | Bulk export script                                                                  |
| `docs/keywords/`              | Created                | CSV output directory                                                                |
| `.env.local`                  | Created                | DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD (already in .gitignore via Astro conventions) |
| `.gitignore`                  | Verify                 | Confirm `.env.local` is ignored                                                     |

---

## Setup Sequence

1. Clone claude-seo repo → run `install.ps1` (installs claude-seo plugin globally)
2. From cloned repo → run `extensions/dataforseo/install.ps1` (installs DataForSEO MCP, prompts for credentials)
3. Get Ahrefs AWT token → manually add `@ahrefs/mcp` block to `~/.claude/settings.json`
4. Create `.env.local` with DataForSEO credentials (for the script)
5. Claude writes `scripts/keyword-research.js`
6. Verify: run `/seo dataforseo keywords nurse scheduling` in a Claude session
7. Verify: run `node scripts/keyword-research.js` → check CSV output

---

## Out of Scope

- Ahrefs general keyword research (AWT = own domain only; paid plan needed for general research)
- Automated keyword tracking (manual script runs for now)
- CI/CD integration
