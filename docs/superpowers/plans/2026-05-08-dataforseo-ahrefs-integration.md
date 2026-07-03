# DataForSEO + Ahrefs MCP Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect DataForSEO (9 API modules via MCP + bulk export script) and Ahrefs Webmaster Tools (own-domain monitoring via MCP) to Claude Code on Windows.

**Architecture:** claude-seo plugin installs globally to `~/.claude/`; DataForSEO and Ahrefs MCP servers are registered in `~/.claude/settings.json`; a standalone Node.js script hits the DataForSEO REST API directly (credentials from `.env.local`) and outputs a keyword CSV.

**Tech Stack:** PowerShell (Windows), Node.js (native `https` module, no extra deps), DataForSEO REST API v3, `dataforseo-mcp-server` npm package, `@ahrefs/mcp` npm package.

---

## File Map

| File                                                | Action                    | Notes                                                  |
| --------------------------------------------------- | ------------------------- | ------------------------------------------------------ |
| `~/.claude/skills/seo/`                             | Created by base installer | claude-seo skill suite                                 |
| `~/.claude/skills/seo-dataforseo/SKILL.md`          | Copied from repo          | DataForSEO extension skill                             |
| `~/.claude/agents/seo-dataforseo.md`                | Copied from repo          | DataForSEO agent                                       |
| `~/.claude/skills/seo/dataforseo-field-config.json` | Copied from repo          | Reduces API response size ~75%                         |
| `~/.claude/settings.json`                           | Modified                  | Adds dataforseo + ahrefs MCP entries                   |
| `.gitignore`                                        | Modified                  | Add `.env.local`                                       |
| `.env.local`                                        | Created                   | DATAFORSEO_LOGIN + DATAFORSEO_PASSWORD (not committed) |
| `scripts/keyword-research.js`                       | Created                   | Bulk CSV export script                                 |
| `docs/keywords/.gitkeep`                            | Created                   | Output directory placeholder                           |

---

## Task 1: Install claude-seo base plugin

**Files:** `~/.claude/skills/seo/`, `~/.claude/agents/`

- [ ] **Step 1: Download and run the base installer (non-interactive)**

```powershell
$tmp = "$env:TEMP\claude-seo-install.ps1"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/AgriciDaniel/claude-seo/main/install.ps1" -OutFile $tmp
powershell -ExecutionPolicy Bypass -File $tmp
```

Expected output ends with: `[+] Claude SEO installed successfully!`

- [ ] **Step 2: Verify base install**

```powershell
Test-Path "$env:USERPROFILE\.claude\skills\seo"
```

Expected: `True`

---

## Task 2: Install DataForSEO extension (non-interactive)

The extension installer uses `Read-Host` (interactive). We replicate its steps manually.
Clone the repo first to get the extension source files.

**Files:** `~/.claude/skills/seo-dataforseo/SKILL.md`, `~/.claude/agents/seo-dataforseo.md`, `~/.claude/skills/seo/dataforseo-field-config.json`, `~/.claude/settings.json`

- [ ] **Step 1: Clone claude-seo repo to get extension files**

```powershell
git clone --depth 1 https://github.com/AgriciDaniel/claude-seo.git C:\Temp\claude-seo-ext
```

Expected: Cloned to `C:\Temp\claude-seo-ext`

- [ ] **Step 2: Verify Node.js 20+ is installed**

```powershell
node -v
```

Expected: `v20.x.x` or higher. If not installed, download from https://nodejs.org/ before continuing.

- [ ] **Step 3: Copy DataForSEO skill file**

```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\skills\seo-dataforseo" | Out-Null
Copy-Item "C:\Temp\claude-seo-ext\extensions\dataforseo\skills\seo-dataforseo\SKILL.md" `
    "$env:USERPROFILE\.claude\skills\seo-dataforseo\SKILL.md" -Force
Write-Host "Copied skill"
```

Expected: `Copied skill`

- [ ] **Step 4: Copy DataForSEO agent**

```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\agents" | Out-Null
Copy-Item "C:\Temp\claude-seo-ext\extensions\dataforseo\agents\seo-dataforseo.md" `
    "$env:USERPROFILE\.claude\agents\seo-dataforseo.md" -Force
Write-Host "Copied agent"
```

Expected: `Copied agent`

- [ ] **Step 5: Copy field config**

```powershell
Copy-Item "C:\Temp\claude-seo-ext\extensions\dataforseo\field-config.json" `
    "$env:USERPROFILE\.claude\skills\seo\dataforseo-field-config.json" -Force
Write-Host "Copied field config"
```

Expected: `Copied field config`

- [ ] **Step 6: Add DataForSEO MCP entry to settings.json**

```powershell
$settingsPath = "$env:USERPROFILE\.claude\settings.json"
$settings = if (Test-Path $settingsPath) {
    Get-Content $settingsPath -Raw | ConvertFrom-Json
} else {
    [PSCustomObject]@{}
}
if (-not $settings.PSObject.Properties['mcpServers']) {
    $settings | Add-Member -NotePropertyName 'mcpServers' -NotePropertyValue ([PSCustomObject]@{})
}
$fieldConfigPath = "$env:USERPROFILE\.claude\skills\seo\dataforseo-field-config.json"
$settings.mcpServers | Add-Member -NotePropertyName 'dataforseo' -NotePropertyValue ([PSCustomObject]@{
    command = 'npx'
    args    = @('-y', 'dataforseo-mcp-server')
    env     = [PSCustomObject]@{
        DATAFORSEO_USERNAME = 'pradeep.pandey99@gmail.com'
        DATAFORSEO_PASSWORD = 'YOUR_DATAFORSEO_PASSWORD'
        ENABLED_MODULES     = 'SERP,KEYWORDS_DATA,ONPAGE,DATAFORSEO_LABS,BACKLINKS,DOMAIN_ANALYTICS,BUSINESS_DATA,CONTENT_ANALYSIS,AI_OPTIMIZATION'
        FIELD_CONFIG_PATH   = $fieldConfigPath
    }
}) -Force
$settings | ConvertTo-Json -Depth 10 | Set-Content $settingsPath -Encoding utf8
Write-Host "settings.json updated"
```

Replace `YOUR_DATAFORSEO_PASSWORD` with the actual password before running.
`~/.claude/settings.json` is NOT in the project repo — credentials here are safe.

- [ ] **Step 7: Pre-warm the npm package**

```powershell
npx -y dataforseo-mcp-server --help 2>&1 | Out-Null
Write-Host "dataforseo-mcp-server cached"
```

- [ ] **Step 8: Verify MCP entry**

```powershell
Get-Content "$env:USERPROFILE\.claude\settings.json" | ConvertFrom-Json | Select-Object -ExpandProperty mcpServers | Select-Object -ExpandProperty dataforseo
```

Expected: Object showing `command: npx`, `args: [-y, dataforseo-mcp-server]`, env with username.

- [ ] **Step 9: Clean up temp clone**

```powershell
Remove-Item -Recurse -Force C:\Temp\claude-seo-ext
```

---

## Task 3: Configure Ahrefs MCP

**Prerequisite — user must do this first:**

1. Go to https://ahrefs.com/webmaster-tools
2. Verify `simplescheduleai.com` (if not already done)
3. Settings → API → Generate token
4. Copy the token — paste it in Step 2 below

**Files:** `~/.claude/settings.json`

- [ ] **Step 1: Check the @ahrefs/mcp package env var name**

```powershell
npx -y @ahrefs/mcp --help 2>&1 | Select-Object -First 20
```

Note the correct env var name from output. Expected: `AHREFS_API_KEY`.
If different, use the name shown in the output in Step 2.

- [ ] **Step 2: Add Ahrefs MCP entry to settings.json**

```powershell
$settingsPath = "$env:USERPROFILE\.claude\settings.json"
$settings = Get-Content $settingsPath -Raw | ConvertFrom-Json
$settings.mcpServers | Add-Member -NotePropertyName 'ahrefs' -NotePropertyValue ([PSCustomObject]@{
    command = 'npx'
    args    = @('-y', '@ahrefs/mcp')
    env     = [PSCustomObject]@{
        AHREFS_API_KEY = 'YOUR_AWT_API_TOKEN'
    }
}) -Force
$settings | ConvertTo-Json -Depth 10 | Set-Content $settingsPath -Encoding utf8
Write-Host "Ahrefs MCP configured"
```

Replace `YOUR_AWT_API_TOKEN` with the token from the AWT dashboard.
If the env var name from Step 1 differs from `AHREFS_API_KEY`, update accordingly.

- [ ] **Step 3: Verify**

```powershell
Get-Content "$env:USERPROFILE\.claude\settings.json" | ConvertFrom-Json | Select-Object -ExpandProperty mcpServers | Select-Object -ExpandProperty ahrefs
```

Expected: Object showing `command: npx`, `args: [-y, @ahrefs/mcp]`, env with API key.

---

## Task 4: Add .env.local and output directory

**Files:** `.gitignore`, `.env.local`, `docs/keywords/.gitkeep`

- [ ] **Step 1: Add .env.local to .gitignore**

Current `.gitignore` has `.env` and `.env.production` but NOT `.env.local`.
Add it:

Open `.gitignore` and add `.env.local` on a new line after the existing `.env` entry.

```
# environment variables
.env
.env.local
.env.production
```

- [ ] **Step 2: Create .env.local with DataForSEO credentials**

Create `.env.local` in the project root:

```
DATAFORSEO_LOGIN=pradeep.pandey99@gmail.com
DATAFORSEO_PASSWORD=YOUR_DATAFORSEO_PASSWORD
```

Replace `YOUR_DATAFORSEO_PASSWORD` with the actual password.
This file must never be committed.

- [ ] **Step 3: Create docs/keywords/ output directory**

```powershell
New-Item -ItemType Directory -Force -Path "docs\keywords" | Out-Null
New-Item -ItemType File -Force -Path "docs\keywords\.gitkeep" | Out-Null
Write-Host "Created docs/keywords/"
```

- [ ] **Step 4: Commit**

```powershell
git add .gitignore docs/keywords/.gitkeep
git commit -m "chore: add .env.local to gitignore, create keywords output dir"
```

---

## Task 5: Create scripts/keyword-research.js

**Files:** `scripts/keyword-research.js`

- [ ] **Step 1: Create the script**

Create `scripts/keyword-research.js` with the following content:

```javascript
// scripts/keyword-research.js
// Usage: node scripts/keyword-research.js "seed1,seed2,seed3"
// Reads: .env.local (DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD)
// Writes: docs/keywords/keywords-YYYY-MM-DD.csv

const path = require('path');
const fs = require('fs');
const https = require('https');

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const eqIdx = line.indexOf('=');
    if (eqIdx > 0) {
      const k = line.slice(0, eqIdx).trim();
      const v = line.slice(eqIdx + 1).trim();
      if (k && !process.env[k]) process.env[k] = v;
    }
  }
}

const LOGIN = process.env.DATAFORSEO_LOGIN;
const PASSWORD = process.env.DATAFORSEO_PASSWORD;

if (!LOGIN || !PASSWORD) {
  console.error('Add DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD to .env.local');
  process.exit(1);
}

const AUTH = Buffer.from(`${LOGIN}:${PASSWORD}`).toString('base64');

function dfsPost(endpoint, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(
      {
        hostname: 'api.dataforseo.com',
        path: endpoint,
        method: 'POST',
        headers: {
          Authorization: `Basic ${AUTH}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => {
          raw += c;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(raw));
          } catch (e) {
            reject(new Error(`Parse error: ${raw.slice(0, 200)}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getKeywordIdeas(seeds) {
  const body = seeds.map((seed) => ({
    keyword: seed,
    language_code: 'en',
    location_code: 2840,
    limit: 30,
  }));
  const res = await dfsPost('/v3/dataforseo_labs/google/keyword_ideas/live', body);
  const seen = new Set(seeds);
  const keywords = [...seeds];
  for (const task of res.tasks || []) {
    for (const item of task.result?.[0]?.items || []) {
      if (!seen.has(item.keyword)) {
        seen.add(item.keyword);
        keywords.push(item.keyword);
      }
    }
  }
  return keywords;
}

async function getVolumes(keywords) {
  const results = {};
  for (let i = 0; i < keywords.length; i += 1000) {
    const res = await dfsPost('/v3/keywords_data/google_ads/search_volume/live', [
      { keywords: keywords.slice(i, i + 1000), language_code: 'en', location_code: 2840 },
    ]);
    for (const task of res.tasks || [])
      for (const item of task.result || []) results[item.keyword] = item.search_volume ?? 0;
  }
  return results;
}

async function getDifficulty(keywords) {
  const results = {};
  for (let i = 0; i < keywords.length; i += 1000) {
    const res = await dfsPost('/v3/dataforseo_labs/google/bulk_keyword_difficulty/live', [
      { keywords: keywords.slice(i, i + 1000), language_code: 'en', location_code: 2840 },
    ]);
    for (const task of res.tasks || [])
      for (const item of task.result || []) results[item.keyword] = item.keyword_difficulty ?? null;
  }
  return results;
}

async function getIntent(keywords) {
  const results = {};
  for (let i = 0; i < keywords.length; i += 1000) {
    const res = await dfsPost('/v3/dataforseo_labs/google/search_intent/live', [
      { keywords: keywords.slice(i, i + 1000), language_code: 'en', location_code: 2840 },
    ]);
    for (const task of res.tasks || [])
      for (const item of task.result || []) results[item.keyword] = item.search_intent ?? 'unknown';
  }
  return results;
}

async function getTop3DR(keywords) {
  const results = {};
  for (const kw of keywords) {
    const res = await dfsPost('/v3/serp/google/organic/live/advanced', [
      { keyword: kw, language_code: 'en', location_code: 2840, depth: 3 },
    ]);
    const items = (res.tasks?.[0]?.result?.[0]?.items || []).filter((i) => i.type === 'organic').slice(0, 3);
    results[kw] = items.length ? Math.round(items.reduce((s, i) => s + (i.domain_rank ?? 0), 0) / items.length) : null;
    await sleep(300);
  }
  return results;
}

function classifyBucket(intent) {
  const i = (intent || '').toLowerCase();
  if (i.includes('commercial') || i.includes('transactional')) return 'Solution';
  if (i.includes('navigational')) return 'Brand';
  return 'Problem';
}

async function main() {
  const seedArg = process.argv[2] || 'nurse scheduling,critical access hospital scheduling,nurse scheduling software';
  const seeds = seedArg
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  console.log(`Seeds: ${seeds.join(', ')}`);
  process.stdout.write('Fetching keyword ideas... ');
  const keywords = await getKeywordIdeas(seeds);
  console.log(`${keywords.length} found`);

  process.stdout.write('Fetching volumes + difficulty + intent... ');
  const [volumes, difficulty, intent] = await Promise.all([
    getVolumes(keywords),
    getDifficulty(keywords),
    getIntent(keywords),
  ]);
  console.log('done');

  const worthFetching = keywords.filter((k) => (volumes[k] ?? 0) > 10);
  console.log(`Fetching SERP top-3 DR for ${worthFetching.length} keywords (volume > 10)...`);
  const top3DR = await getTop3DR(worthFetching);

  const rows = keywords.map((kw) => ({
    keyword: kw,
    volume: volumes[kw] ?? 0,
    difficulty: difficulty[kw] ?? '',
    intent: intent[kw] ?? 'unknown',
    bucket: classifyBucket(intent[kw]),
    avg_top3_dr: top3DR[kw] ?? '',
    winnable: (volumes[kw] ?? 0) > 50 && top3DR[kw] != null && top3DR[kw] < 50,
  }));

  rows.sort((a, b) => Number(b.winnable) - Number(a.winnable) || b.volume - a.volume);

  const date = new Date().toISOString().slice(0, 10);
  const outDir = path.join(process.cwd(), 'docs', 'keywords');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `keywords-${date}.csv`);

  const lines = [
    'keyword,volume,difficulty,intent,bucket,avg_top3_dr,winnable',
    ...rows.map(
      (r) =>
        `"${r.keyword.replace(/"/g, '""')}",${r.volume},${r.difficulty},"${r.intent}","${r.bucket}",${r.avg_top3_dr},${r.winnable}`
    ),
  ];
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');

  const winnable = rows.filter((r) => r.winnable).length;
  console.log(`\nSaved ${rows.length} keywords → ${path.relative(process.cwd(), outPath)}`);
  console.log(`Winnable (vol>50 & avg_top3_dr<50): ${winnable}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
```

- [ ] **Step 2: Commit**

```powershell
git add scripts/keyword-research.js
git commit -m "feat: add DataForSEO bulk keyword research export script"
```

---

## Task 6: Verify DataForSEO MCP in Claude session

**This task runs in a new Claude Code session after Tasks 1–5 are complete.**

- [ ] **Step 1: Restart Claude Code to load new MCP servers**

Close Claude Code completely and reopen it.

- [ ] **Step 2: Check MCP servers are connected**

In Claude Code terminal: `/mcp`

Expected: `dataforseo` and `ahrefs` appear in the connected servers list.
If a server shows as failed, check `~/.claude/settings.json` for typos in credentials.

- [ ] **Step 3: Run a live keyword lookup**

In Claude: `/seo dataforseo keywords nurse scheduling`

Expected: A list of keyword ideas with volumes and difficulty scores.

- [ ] **Step 4: Run intent classification**

In Claude: `/seo dataforseo intent "nurse scheduling software,critical access hospital scheduling,nurse staffing software"`

Expected: Each keyword labeled with informational / commercial / transactional intent.

- [ ] **Step 5: Check own-domain rankings (Ahrefs AWT)**

In Claude: `/seo dataforseo ranked simplescheduleai.com`

Expected: List of keywords simplescheduleai.com currently ranks for.
(Ahrefs MCP can be tested separately once the AWT token is confirmed working.)

---

## Task 7: Verify bulk export script

- [ ] **Step 1: Run script with default seeds**

```powershell
node scripts/keyword-research.js
```

Expected output:

```
Seeds: nurse scheduling, critical access hospital scheduling, nurse scheduling software
Fetching keyword ideas... N found
Fetching volumes + difficulty + intent... done
Fetching SERP top-3 DR for N keywords (volume > 10)...
Saved N keywords → docs/keywords/keywords-2026-05-08.csv
Winnable (vol>50 & avg_top3_dr<50): N
```

- [ ] **Step 2: Inspect CSV**

```powershell
Get-Content "docs\keywords\keywords-2026-05-08.csv" | Select-Object -First 15
```

Expected: Header row followed by keyword rows, winnable=true rows first, sorted by volume descending within each group.

- [ ] **Step 3: Run with custom seeds**

```powershell
node scripts/keyword-research.js "critical access hospital,rural hospital scheduling,nurse retention"
```

Expected: New CSV at `docs/keywords/keywords-2026-05-08.csv` with results for those seeds.
