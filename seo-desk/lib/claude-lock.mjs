// One Claude run at a time for the whole desk: the Ask box and the Newsroom's "Ask Claude for this
// week's topic" share this lock, so two runs never overlap on the founder's sign-in.

let busy = false;

// True when the lock was free and is now taken; false when a run is going.
export function takeClaude() {
  if (busy) return false;
  busy = true;
  return true;
}

export function releaseClaude() {
  busy = false;
}

export const claudeBusy = () => busy;
