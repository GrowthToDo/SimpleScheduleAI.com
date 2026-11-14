import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const {
  LABEL,
  parseArgs,
  xmlEscape,
  buildPath,
  renderPlist,
  plistValues,
  plistFilePath,
  install,
  remove,
  stableNodePath,
  STABLE_NODE_PATHS,
} = await import('../install-daily.mjs');

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE = fs.readFileSync(path.join(HERE, '..', 'launchd', `${LABEL}.plist.template`), 'utf8');

const sample = { nodePath: '/opt/node/bin/node', repo: '/Users/x/SSAI website', home: '/Users/x' };

test('parseArgs reads the three modes and rejects the rest', () => {
  assert.deepEqual(parseArgs([]), { print: false, remove: false });
  assert.deepEqual(parseArgs(['--print']), { print: true, remove: false });
  assert.deepEqual(parseArgs(['--remove']), { print: false, remove: true });
  assert.throws(() => parseArgs(['--now']), /Unknown option/);
  assert.throws(() => parseArgs(['--print', '--remove']), /not both/);
});

test('xmlEscape escapes the five XML characters', () => {
  assert.equal(xmlEscape(`a&b<c>d"e'f`), 'a&amp;b&lt;c&gt;d&quot;e&apos;f');
});

test('buildPath starts with the node folder, has the usual places, and has no repeats', () => {
  const p = buildPath('/opt/node/bin/node', '/Users/x').split(':');
  assert.equal(p[0], '/opt/node/bin');
  for (const want of ['/opt/homebrew/bin', '/usr/local/bin', '/usr/bin', '/bin', '/Users/x/.local/bin']) {
    assert.ok(p.includes(want), want);
  }
  const again = buildPath('/opt/homebrew/bin/node', '/Users/x').split(':');
  assert.equal(again.filter((d) => d === '/opt/homebrew/bin').length, 1);
});

test('renderPlist fills every placeholder and keeps the key settings', () => {
  const out = renderPlist(TEMPLATE, plistValues(sample));
  assert.doesNotMatch(out, /\{\{/);
  assert.match(out, /<string>com\.pandeyg\.os\.seo-desk<\/string>/);
  assert.match(
    out,
    /<string>\/opt\/node\/bin\/node<\/string>\s*<string>\/Users\/x\/SSAI website\/seo-desk\/server\.mjs<\/string>\s*<string>--no-open<\/string>/
  );
  assert.match(out, /<key>WorkingDirectory<\/key>\s*<string>\/Users\/x\/SSAI website<\/string>/);
  assert.match(out, /<key>RunAtLoad<\/key>\s*<true\/>/);
  // Restarted after a crash (exit 1), not after a clean exit such as a second copy finding the port taken.
  assert.match(out, /<key>KeepAlive<\/key>\s*<dict>\s*<key>SuccessfulExit<\/key>\s*<false\/>\s*<\/dict>/);
  assert.match(out, /<key>HOME<\/key>\s*<string>\/Users\/x<\/string>/);
  assert.match(out, /<key>PATH<\/key>\s*<string>\/opt\/node\/bin:\/opt\/homebrew\/bin:/);
  assert.match(out, /\/Users\/x\/SSAI website\/seo-desk\/data\/logs\/desk\.out\.log/);
  assert.match(out, /\/Users\/x\/SSAI website\/seo-desk\/data\/logs\/desk\.err\.log/);
});

test('renderPlist escapes paths and refuses a missing value', () => {
  const out = renderPlist(TEMPLATE, plistValues({ ...sample, repo: '/Users/x/A & B <site>' }));
  assert.match(out, /A &amp; B &lt;site&gt;/);
  assert.doesNotMatch(out, /A & B/);
  assert.throws(() => renderPlist('{{NOPE}}', {}), /NOPE/);
});

function fakeFs(existing = []) {
  const files = new Map(existing.map((f) => [f, '']));
  const dirs = [];
  return {
    files,
    dirs,
    mkdirSync: (d) => dirs.push(d),
    writeFileSync: (f, c) => files.set(f, c),
    existsSync: (f) => files.has(f),
    rmSync: (f) => files.delete(f),
  };
}

test('install makes the folders, writes the file, then bootstraps it', () => {
  const fsApi = fakeFs();
  const calls = [];
  const file = plistFilePath('/Users/x');
  const steps = install({
    plist: '<plist/>',
    file,
    logsDir: '/repo/seo-desk/data/logs',
    uid: 501,
    launchctl: (args) => {
      calls.push(args);
      if (args[0] === 'bootout') throw new Error('not loaded');
    },
    fsApi,
  });
  assert.deepEqual(calls, [
    ['bootout', `gui/501/${LABEL}`],
    ['bootstrap', 'gui/501', file],
  ]);
  assert.equal(fsApi.files.get(file), '<plist/>');
  assert.ok(fsApi.dirs.includes('/repo/seo-desk/data/logs'));
  assert.equal(file, `/Users/x/Library/LaunchAgents/${LABEL}.plist`);
  assert.ok(steps.some((s) => s.startsWith('wrote ')));
});

test('install twice works: the second run stops the first copy', () => {
  const fsApi = fakeFs();
  const calls = [];
  const args = {
    plist: '<plist/>',
    file: '/h/L.plist',
    logsDir: '/l',
    uid: 501,
    launchctl: (a) => calls.push(a[0]),
    fsApi,
  };
  install(args);
  install(args);
  assert.deepEqual(calls, ['bootout', 'bootstrap', 'bootout', 'bootstrap']);
});

test('remove boots it out and deletes the file, and is fine when nothing is there', () => {
  const file = '/h/L.plist';
  const fsApi = fakeFs([file]);
  const calls = [];
  const steps = remove({ file, uid: 501, launchctl: (a) => calls.push(a), fsApi });
  assert.deepEqual(calls, [['bootout', `gui/501/${LABEL}`]]);
  assert.equal(fsApi.files.has(file), false);
  assert.equal(steps.length, 2);
  const none = remove({
    file,
    uid: 501,
    launchctl: () => {
      throw new Error('not loaded');
    },
    fsApi,
  });
  assert.deepEqual(none, []);
});

test('stableNodePath picks the first stable path that is the same program', () => {
  const cellar = '/opt/homebrew/Cellar/node@22/22.23.4_2/bin/node';
  const real = { [cellar]: cellar, '/opt/homebrew/opt/node@22/bin/node': cellar, '/opt/homebrew/bin/node': cellar };
  const deps = (existing) => ({ realpath: (p) => real[p] ?? p, exists: (p) => existing.includes(p) });
  assert.equal(
    stableNodePath(cellar, deps(['/opt/homebrew/opt/node@22/bin/node', '/opt/homebrew/bin/node'])),
    '/opt/homebrew/opt/node@22/bin/node'
  );
  assert.equal(stableNodePath(cellar, deps(['/opt/homebrew/bin/node'])), '/opt/homebrew/bin/node');
});

test('stableNodePath keeps execPath when no stable path matches or exists', () => {
  const exec = '/Users/x/.nvm/versions/node/v22/bin/node';
  const other = { realpath: (p) => (p === exec ? exec : '/somewhere/else/node'), exists: () => true };
  assert.equal(stableNodePath(exec, other), exec);
  assert.equal(stableNodePath(exec, { realpath: (p) => p, exists: () => false }), exec);
  assert.equal(
    stableNodePath(exec, {
      realpath: () => {
        throw new Error('gone');
      },
      exists: () => true,
    }),
    exec
  );
  assert.equal(STABLE_NODE_PATHS[0], '/opt/homebrew/opt/node@22/bin/node');
});

test('install retries bootstrap up to three times with a pause, then gives up', () => {
  const run = (failures) => {
    const calls = [];
    const pauses = [];
    const fsApi = fakeFs();
    const go = () =>
      install({
        plist: '<plist/>',
        file: '/h/L.plist',
        logsDir: '/l',
        uid: 501,
        launchctl: (a) => {
          calls.push(a[0]);
          if (a[0] === 'bootstrap' && calls.filter((c) => c === 'bootstrap').length <= failures) {
            throw new Error('Input/output error');
          }
        },
        fsApi,
        sleep: (ms) => pauses.push(ms),
      });
    return { go, calls, pauses };
  };
  const ok = run(2);
  ok.go();
  assert.deepEqual(ok.calls, ['bootout', 'bootstrap', 'bootstrap', 'bootstrap']);
  assert.deepEqual(ok.pauses, [1000, 1000]);
  const bad = run(5);
  assert.throws(bad.go, /Input\/output/);
  assert.equal(bad.calls.filter((c) => c === 'bootstrap').length, 3);
});
