// Generic MCP stdio session: one spawned server process, many tool calls.
//
// Reads only mcpServers[key].command / args / env from the repo's untracked
// .mcp.json to spawn the server. It never prints or logs that file or the env
// values, and it does not try to sign in: a server that needs OAuth fails with
// kind 'needs-sign-in' and the desk shows "needs sign-in".
//
// The line-splitting and JSON-RPC helpers are shared with scripts/lib/gsc-mcp.mjs.

import fs from 'node:fs';
import path from 'node:path';
import { spawn as realSpawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { splitLines, parseLine, isResponse } from '../../scripts/lib/gsc-mcp.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MCP_JSON = path.resolve(HERE, '../../.mcp.json');

export const SERVER_KEYS = {
  gsc: 'google-search-console',
  bing: 'bing-webmaster',
  ga4: 'google-analytics',
  clarity: 'microsoft-clarity',
  dfs: 'dataforseo',
};

const SIGN_IN_RE = /oauth|sign.?in|credential|token|unauthori[sz]ed|\b401\b|invalid_grant/i;
const trunc = (s, n = 500) => (s.length > n ? s.slice(0, n) : s);

export function classifyError(message) {
  return SIGN_IN_RE.test(String(message ?? '')) ? 'needs-sign-in' : 'failed';
}

// kind is decided from the message alone, before any stderr is added to it (a timeout whose
// stderr mentions a token is still a plain failure). Pass {kind} to keep a known kind.
export class McpError extends Error {
  constructor(message, { kind } = {}) {
    super(message);
    this.name = 'McpError';
    this.kind = kind ?? classifyError(message);
  }
}

// Adds the server's stderr to an error for the log, keeping the kind found from the message.
function withStderr(e, stderr) {
  const err = e instanceof McpError ? e : new McpError(String(e?.message ?? e));
  if (stderr && !String(err.message).includes('stderr:')) err.message += ` stderr: ${stderr}`;
  return err;
}

// tools/call result to parsed data: JSON when the text is JSON (unwrapping a
// JSON string held in `.result` once), else the raw text. Throws on isError.
export function unwrapToolResult(result) {
  const text = result?.content?.[0]?.text;
  if (result?.isError) throw new McpError(`Tool returned an error: ${trunc(String(text ?? ''))}`);
  // List tools (Bing) send one content item per row plus a trailing paging note;
  // the whole array is in structuredContent.result.
  if (Array.isArray(result?.structuredContent?.result)) return result.structuredContent.result;
  if (typeof text !== 'string') return result?.structuredContent ?? null;
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return text;
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

function serverEntry(serverKey) {
  if (!fs.existsSync(MCP_JSON)) throw new McpError('.mcp.json not found; cannot locate the MCP server.');
  const entry = JSON.parse(fs.readFileSync(MCP_JSON, 'utf8'))?.mcpServers?.[serverKey];
  if (!entry || !entry.command) throw new McpError(`.mcp.json has no mcpServers["${serverKey}"] entry.`);
  return entry;
}

// {timeoutMs, signal, spawn, entry}: an aborted signal closes the session and kills the
// server process, so a source the refresh engine gave up on leaves nothing running. spawn and
// entry are for tests.
export async function openServer(serverKey, { timeoutMs = 180000, signal, spawn = realSpawn, entry: given } = {}) {
  if (signal?.aborted) throw new McpError(`${serverKey} was stopped before it started.`, { kind: 'failed' });
  const entry = given ?? serverEntry(serverKey);
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
  let closing = false;

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
      if (msg.error)
        p.reject(new McpError(`MCP error: ${trunc(String(msg.error.message ?? JSON.stringify(msg.error)))}`));
      else p.resolve(msg.result);
    }
  });
  child.stdin.on('error', (e) => failAll(new McpError(`${serverKey} stdin closed: ${e.code || e.message}`)));
  child.on('error', (e) => failAll(new McpError(`Could not start ${serverKey}: ${e.code || e.message}`)));
  child.on('exit', (code) => {
    if (closing) return;
    failAll(withStderr(new McpError(`${serverKey} exited (code ${code}) before replying.`), stderr));
  });

  const send = (obj) => {
    if (dead) throw dead;
    child.stdin.write(JSON.stringify(obj) + '\n');
  };

  // One request with its own timeout, so a slow call never strands the session.
  const request = (method, params) =>
    new Promise((resolve, reject) => {
      const id = nextId++;
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(withStderr(new McpError(`${serverKey} ${method} timed out after ${timeoutMs}ms.`), stderr));
      }, timeoutMs);
      pending.set(id, {
        resolve: (v) => (clearTimeout(timer), resolve(v)),
        reject: (e) => (clearTimeout(timer), reject(e)),
      });
      try {
        send({ jsonrpc: '2.0', id, method, params });
      } catch (e) {
        clearTimeout(timer);
        pending.delete(id);
        reject(e);
      }
    });

  const close = () => {
    if (closing) return;
    closing = true;
    signal?.removeEventListener?.('abort', close);
    failAll(new McpError(`${serverKey} session closed.`, { kind: 'failed' }));
    try {
      child.stdin.end();
    } catch {
      // ignore
    }
    child.kill();
  };
  signal?.addEventListener?.('abort', close, { once: true });

  try {
    await request('initialize', {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'ssai-seo-desk', version: '1' },
    });
    send({ jsonrpc: '2.0', method: 'notifications/initialized' });
  } catch (e) {
    close();
    throw withStderr(e, stderr);
  }

  return {
    async call(tool, args) {
      try {
        return unwrapToolResult(await request('tools/call', { name: tool, arguments: args }));
      } catch (e) {
        throw withStderr(e, stderr);
      }
    },
    async listTools() {
      const res = await request('tools/list', {});
      return (res?.tools || []).map((t) => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
      }));
    },
    close,
  };
}
