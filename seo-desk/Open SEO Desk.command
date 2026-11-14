#!/bin/bash
# Opens the SEO Desk in the browser, starting its server first if it is not running.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT=8766
URL="http://127.0.0.1:$PORT"
LOGS="$ROOT/seo-desk/data/logs"

if ! nc -z 127.0.0.1 "$PORT" >/dev/null 2>&1; then
  mkdir -p "$LOGS"
  # A double-clicked file gets a bare PATH, so add the usual places for node.
  export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.local/bin:$PATH"
  cd "$ROOT" || exit 1
  nohup node seo-desk/server.mjs --no-open >>"$LOGS/desk.out.log" 2>>"$LOGS/desk.err.log" &
  for _ in $(seq 1 20); do
    nc -z 127.0.0.1 "$PORT" >/dev/null 2>&1 && break
    sleep 0.5
  done
  if ! nc -z 127.0.0.1 "$PORT" >/dev/null 2>&1; then
    echo "The SEO Desk did not start within 10 seconds. See $LOGS/desk.err.log"
    exit 1
  fi
fi

open "$URL"
