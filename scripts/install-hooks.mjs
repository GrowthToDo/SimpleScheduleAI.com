#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const hookDir = path.join(process.cwd(), '.git', 'hooks');
if (!fs.existsSync(hookDir)) {
  console.error('Not a git repo (no .git/hooks)');
  process.exit(1);
}
const hook = `#!/bin/sh\n# Installed by scripts/install-hooks.mjs — publish manifest gate\nnode scripts/hook-precommit.mjs || exit 1\n`;
const target = path.join(hookDir, 'pre-commit');
fs.writeFileSync(target, hook, { mode: 0o755 });
console.log(`Installed ${target}`);
