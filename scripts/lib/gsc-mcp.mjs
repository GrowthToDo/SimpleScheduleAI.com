// Minimal MCP stdio client for the local Google Search Console server.
//
// WHY: GSC is only reachable through the MCP server configured in .mcp.json
// (untracked, holds secrets paths), not from plain node. This spawns that same
// server, speaks newline-delimited JSON-RPC 2.0 over stdio, and returns one tool
// result. It reads only mcpServers["google-search-console"] (command, args, env)
// and never prints env values or file contents. If the server needs interactive
// OAuth it fails; this client does not try to authenticate for you.

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const MCP_JSON = path.join(ROOT, '.mcp.json');
const SERVER_KEY = 'google-search-console';
export const SITE_URL = 'https://simplescheduleai.com/';

const trunc = (s, n = 500) => (s.length > n ? s.slice(0, n) : s);

// ---------------------------------------------------------------- pure helpers

// Split a stdout buffer into complete lines plus the unfinished tail.
export function splitLines(buffer) {
  const parts = buffer.split('\n');
  const rest = parts.pop();
  return { lines: parts.map((l) => l.replace(/\r$/, '')).filter((l) => l.trim()), rest };
}

// One stdout line to a JSON-RPC message object, or null for non-JSON noise.
export function parseLine(line) {
  const t = line.trim();
  if (!t.startsWith('{')) return null;
  try {
    const msg = JSON.parse(t);
    return msg && typeof msg === 'object' ? msg : null;
  } catch {
    return null;
  }
}

// A response (has an id and result/error) as opposed to a notification or request.
export function isResponse(msg) {
  return msg && msg.id !== undefined && msg.id !== null && ('result' in msg || 'error' in msg) && !msg.method;
}

// tools/call result to parsed data. Throws on isError. Tolerant of a text that is
// JSON, JSON with a `result` string (parsed once more), or a bare array/object.
export function unwrapToolResult(result) {
  const text = result?.content?.[0]?.text;
  if (result?.isError) throw new Error(`GSC tool returned an error: ${trunc(String(text ?? ''))}`);
  if (typeof text !== 'string') throw new Error('GSC tool result had no content[0].text.');
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`GSC tool result was not JSON: ${trunc(text, 200)}`);
  }
  if (data && !Array.isArray(data) && typeof data.result === 'string') {
    try {
      data = JSON.parse(data.result);
    } catch {
      // leave as is
    }
  }
  return data;
}

// Rows array out of whatever shape the tool returned (null when absent).
export function rowsOf(data) {
  const rows = Array.isArray(data) ? data : data?.rows;
  return Array.isArray(rows) ? rows : null;
}

// ---------------------------------------------------------------- client

function serverEntry() {
  if (!fs.existsSync(MCP_JSON)) throw new Error('.mcp.json not found; cannot locate the GSC MCP server.');
  const entry = JSON.parse(fs.readFileSync(MCP_JSON, 'utf8'))?.mcpServers?.[SERVER_KEY];
  if (!entry || !entry.command) throw new Error(`.mcp.json has no mcpServers["${SERVER_KEY}"] entry.`);
  return entry;
}

export async function gscCall(tool, args, { timeoutMs = 180000 } = {}) {
  const entry = serverEntry();
  const child = spawn(entry.command, entry.args || [], {
    env: { ...process.env, ...(entry.env || {}) },
    stdio: ['pipe', 'pipe', 'pipe'],
    windowsHide: true,
  });

  let stderr = '';
  child.stderr.on('data', (d) => {
    if (stderr.length < 500) stderr = trunc(stderr + d.toString());
  });

  const pending = new Map();
  let nextId = 1;
  let buf = '';
  let dead = null;

  const failAll = (err) => {
    dead = dead || err;
    for (const p of pending.values()) p.reject(err);
    pending.clear();
  };

  child.stdout.on('data', (d) => {
    buf += d.toString();
    const { lines, rest } = splitLines(buf);
    buf = rest;
    for (const line of lines) {
      const msg = parseLine(line);
      if (!isResponse(msg)) continue;
      const p = pending.get(msg.id);
      if (!p) continue;
      pending.delete(msg.id);
      if (msg.error) p.reject(new Error(`MCP error: ${trunc(String(msg.error.message ?? JSON.stringify(msg.error)))}`));
      else p.resolve(msg.result);
    }
  });
  child.on('error', (e) => failAll(new Error(`Could not start GSC server: ${e.code || e.message}`)));
  child.on('exit', (code) =>
    failAll(new Error(`GSC server exited (code ${code}) before replying.${stderr ? ` stderr: ${stderr}` : ''}`))
  );

  const send = (obj) => {
    if (dead) throw dead;
    child.stdin.write(JSON.stringify(obj) + '\n');
  };
  const request = (method, params) =>
    new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, { resolve, reject });
      try {
        send({ jsonrpc: '2.0', id, method, params });
      } catch (e) {
        pending.delete(id);
        reject(e);
      }
    });

  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`GSC call timed out after ${timeoutMs}ms.${stderr ? ` stderr: ${stderr}` : ''}`)),
      timeoutMs
    );
  });

  try {
    const run = (async () => {
      await request('initialize', {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: { name: 'ssai-scripts', version: '1' },
      });
      send({ jsonrpc: '2.0', method: 'notifications/initialized' });
      const result = await request('tools/call', { name: tool, arguments: args });
      return unwrapToolResult(result);
    })();
    run.catch(() => {}); // avoid unhandled rejection when the timeout wins
    return await Promise.race([run, timeout]);
  } catch (e) {
    if (stderr && !String(e.message).includes('stderr:')) e.message += ` stderr: ${stderr}`;
    throw e;
  } finally {
    clearTimeout(timer);
    try {
      child.stdin.end();
    } catch {
      // ignore
    }
    child.kill();
  }
}

// Rows for one dimension set over [start, end].
export async function pullRows({ dimensions, start, end, rowLimit = 1000, dataState = 'final' }) {
  const data = await gscCall('get_advanced_search_analytics', {
    site_url: SITE_URL,
    start_date: start,
    end_date: end,
    dimensions,
    search_type: 'WEB',
    row_limit: rowLimit,
    sort_by: 'impressions',
    sort_direction: 'descending',
    data_state: dataState,
  });
  const rows = rowsOf(data);
  if (!rows) throw new Error(`GSC pull (${dimensions}) returned no rows array.`);
  return rows;
}
