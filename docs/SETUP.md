# Local Environment Setup

This project depends on several Claude Code layers that live **outside the repo**
(in your user-global `~/.claude/`), so a fresh clone does not restore them
automatically. This doc lists every layer and how to bring it back on a new machine.

## Layer overview

| Layer                     | Location                                   | In repo?                                 |
| ------------------------- | ------------------------------------------ | ---------------------------------------- |
| Shared project settings   | `.claude/settings.json`                    | Yes (this is the manifest)               |
| Personal project settings | `.claude/settings.local.json`              | No (gitignored: your grants + hooks)     |
| Project skills            | `.claude/skills/`                          | Yes                                      |
| MCP servers (4)           | `.mcp.json`                                | No (gitignored: plaintext keys)          |
| User skills (SEO suite)   | `~/.claude/skills/`                        | No (user-global)                         |
| Plugins (6)               | `~/.claude/settings.json` `enabledPlugins` | Declared here in `.claude/settings.json` |

## 1. Plugins

Enabled plugins, all from the official Claude Code marketplace `claude-plugins-official`:

- `frontend-design`, `superpowers`, `context7`, `code-review`, `feature-dev`, `playwright`

They are declared in the committed `.claude/settings.json` under `enabledPlugins`.
On any machine with Claude Code the official marketplace auto-installs, and these
enable when the project opens. If one is missing, reinstall it from the `/plugin`
menu (the marketplace is the built-in official one).

## 2. MCP servers (4)

Defined in `.mcp.json`, which is **gitignored** because it holds plaintext keys.
To set up on a new machine:

1. Copy the template: `cp .mcp.json.example .mcp.json`
2. Fill in credentials:
   - **dataforseo**: DataForSEO API username + API password
   - **google-search-console**: path to your Google OAuth client-secret JSON
   - **microsoft-clarity**: Clarity API token
   - **bing-webmaster**: Bing Webmaster API key
3. `enabledMcpjsonServers` in `.claude/settings.json` already pre-approves all four,
   so Claude Code will not prompt for each one.

### Google Search Console: required pinned install

The `mcp-gsc` server must be installed **persistently and pinned**. The
`uvx --from git+...` launch form rebuilds the package from GitHub on every startup
(~15s) and routinely times out before registering its tools, which leaves GSC
showing zero tools. Install it once:

```
uv tool install "git+https://github.com/AminForou/mcp-gsc@daab327277e28f8efcc83d9964fb1466a91a1d68"
```

Then point `.mcp.json` -> `google-search-console.command` at the installed
executable (`~/.local/bin/mcp-gsc`, or `...\.local\bin\mcp-gsc.exe` on Windows)
with `"args": []`. Warm start is ~4s and needs no network.

## 3. User skills (SEO suite)

The `seo` and `seo-*` skill suite (`seo-audit`, `seo-backlinks`, `seo-bing`,
`seo-dataforseo`, `seo-unlighthouse`, and ~15 more) lives in `~/.claude/skills/`,
user-global. It is not in this repo. To restore, copy `~/.claude/skills/` from a
backup or reinstall from its source. The `seo` skill also reads
`~/.claude/skills/seo/dataforseo-field-config.json`.

## 4. Global settings

`~/.claude/settings.json` holds machine-global config: status line, model, effort
level, plugin enablement, and a `PreToolUse` hook (`rtk hook claude`). Back this
file up **after stripping any plaintext secrets**. Note: it currently carries a
DataForSEO MCP entry with an inline password. Do not copy that value into any
shared or committed location.

## Security notes

- Never commit `.mcp.json` (it is gitignored). If a key is ever exposed, rotate it.
- Prefer DataForSEO's dedicated API password over your account login password.
- `.claude/settings.local.json` is personal (gitignored): your permission grants and
  the session hook live there, not in the shared manifest.
