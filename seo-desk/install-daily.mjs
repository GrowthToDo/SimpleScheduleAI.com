// Installs (or removes) the launch agent that keeps the SEO Desk server running.
// The server itself runs the 06:00 refresh while it is alive, so the agent only has to
// start it at login and restart it if it stops.
//
//   node seo-desk/install-daily.mjs            install (safe to run again)
//   node seo-desk/install-daily.mjs --print    show the filled-in file, change nothing
//   node seo-desk/install-daily.mjs --remove   stop it and delete the file

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const LABEL = 'com.pandeyg.os.seo-desk';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_FILE = path.join(HERE, 'launchd', `${LABEL}.plist.template`);

// The running node is often a versioned Homebrew folder that disappears on upgrade. Prefer a
// stable path that points at the very same program.
export const STABLE_NODE_PATHS = [
  '/opt/homebrew/opt/node@22/bin/node',
  '/opt/homebrew/bin/node',
  '/usr/local/bin/node',
];

export function stableNodePath(execPath, { realpath, exists }) {
  let target;
  try {
    target = realpath(execPath);
  } catch {
    return execPath;
  }
  for (const candidate of STABLE_NODE_PATHS) {
    try {
      if (exists(candidate) && realpath(candidate) === target) return candidate;
    } catch {
      // Try the next one.
    }
  }
  return execPath;
}

export function parseArgs(argv) {
  const flags = { print: false, remove: false };
  for (const arg of argv) {
    if (arg === '--print') flags.print = true;
    else if (arg === '--remove') flags.remove = true;
    else throw new Error(`Unknown option ${arg}. Use --print, --remove, or nothing to install.`);
  }
  if (flags.print && flags.remove) throw new Error('Use --print or --remove, not both.');
  return flags;
}

export function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// The folder of the node binary first, then the usual places. launchd starts jobs with
// a bare PATH, and the data connections use npx, uvx and a program in ~/.local/bin.
export function buildPath(nodePath, home) {
  const parts = [
    path.dirname(nodePath),
    '/opt/homebrew/bin',
    '/usr/local/bin',
    '/usr/bin',
    '/bin',
    path.join(home, '.local', 'bin'),
  ];
  return [...new Set(parts)].join(':');
}

// Fills every {{NAME}} in the template. Each value is XML-escaped; a missing value is an error.
export function renderPlist(template, values) {
  return template.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => {
    if (values[key] === undefined) throw new Error(`The template needs a value for ${key}.`);
    return xmlEscape(values[key]);
  });
}

export function plistValues({ nodePath, repo, home }) {
  return {
    LABEL,
    NODE: nodePath,
    REPO: repo,
    HOME: home,
    PATH: buildPath(nodePath, home),
    LOGS: path.join(repo, 'seo-desk', 'data', 'logs'),
  };
}

export function plistFilePath(home) {
  return path.join(home, 'Library', 'LaunchAgents', `${LABEL}.plist`);
}

// Everything that touches the machine is passed in, so tests can use stand-ins.
//   launchctl(args) runs launchctl and throws if it fails
//   fsApi has mkdirSync, writeFileSync, existsSync, rmSync
//   sleep(ms) pauses between bootstrap tries
export const BOOTSTRAP_TRIES = 3;

export function install({ plist, file, logsDir, uid, launchctl, fsApi, sleep = () => {} }) {
  const steps = [];
  fsApi.mkdirSync(logsDir, { recursive: true });
  fsApi.mkdirSync(path.dirname(file), { recursive: true });
  // Running it again must work: clear any earlier copy first. Not loaded is fine.
  try {
    launchctl(['bootout', `gui/${uid}/${LABEL}`]);
    steps.push('stopped the earlier copy');
  } catch {
    // It was not loaded.
  }
  fsApi.writeFileSync(file, plist);
  steps.push(`wrote ${file}`);
  // bootout can return before the job is really gone, so bootstrap may need another try.
  for (let attempt = 1; ; attempt++) {
    try {
      launchctl(['bootstrap', `gui/${uid}`, file]);
      break;
    } catch (e) {
      if (attempt >= BOOTSTRAP_TRIES) throw e;
      sleep(1000);
    }
  }
  steps.push('started it');
  return steps;
}

export function remove({ file, uid, launchctl, fsApi }) {
  const steps = [];
  try {
    launchctl(['bootout', `gui/${uid}/${LABEL}`]);
    steps.push('stopped it');
  } catch {
    // It was not running.
  }
  if (fsApi.existsSync(file)) {
    fsApi.rmSync(file);
    steps.push(`deleted ${file}`);
  }
  return steps;
}

function main() {
  let flags;
  try {
    flags = parseArgs(process.argv.slice(2));
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
  const repo = path.resolve(HERE, '..');
  const home = os.homedir();
  const nodePath = stableNodePath(process.execPath, {
    realpath: (p) => fs.realpathSync(p),
    exists: (p) => fs.existsSync(p),
  });
  const values = plistValues({ nodePath, repo, home });
  const plist = renderPlist(fs.readFileSync(TEMPLATE_FILE, 'utf8'), values);
  if (flags.print) {
    process.stdout.write(plist);
    return;
  }
  const uid = process.getuid();
  const file = plistFilePath(home);
  const launchctl = (args) => execFileSync('launchctl', args, { stdio: 'pipe' });
  const pause = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
  try {
    const steps = flags.remove
      ? remove({ file, uid, launchctl, fsApi: fs })
      : install({ plist, file, logsDir: values.LOGS, uid, launchctl, fsApi: fs, sleep: pause });
    console.log(steps.length ? steps.join('\n') : 'Nothing to remove.');
    console.log(flags.remove ? 'The daily run is removed.' : 'The SEO Desk will now start at login and keep running.');
  } catch (e) {
    console.error(`That did not work: ${e.stderr?.toString().trim() || e.message}`);
    if (!flags.remove) {
      console.error('Try running it again with --remove, then install once more.');
    }
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
