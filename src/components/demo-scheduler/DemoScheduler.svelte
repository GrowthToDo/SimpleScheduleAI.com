<script lang="ts">
  /*
   * SimpleScheduleAI — interactive "try it yourself" scheduler demo.
   * Svelte 5 island. All scheduling logic lives in ./engine (pure + unit-tested);
   * this component is presentation + interaction only. No network except the
   * optional email capture on the closing CTA. "Demo data, not a real hospital."
   */
  import {
    DATASET,
    DAY_NAMES,
    NURSES,
    SHIFTS,
    checkSchedule,
    eligibleCandidates,
    generateSchedule,
    neededSlotKind,
    nurseHoursInWeek,
    placementViolations,
    type Assignment,
    type Candidate,
    type DayIndex,
    type Nurse,
    type ShiftType,
    type SlotKind,
    type Violation,
  } from './engine';

  // ── Config the team can swap without touching logic ──────────────────────
  const CONFIG = {
    calUrl: 'https://cal.com/gautham-8bdvdx/30min',
    captureUrl:
      'https://script.google.com/macros/s/AKfycbx5BZhSHWIljxWLWBPngX1CuHyIO4jvd3vQH-HYuPbgfPjj7kA8O4rhQoIHaK10RSJJ/exec',
  };

  const COVERAGE_RULES = new Set(['chargeCoverage', 'rnCoverage', 'supportCoverage']);
  // Each checklist item maps to the engine rule(s) it represents, so the header
  // reflects the LIVE schedule: ✓ when clean, ○ on a coverage gap, ⚠ on a real break.
  const CHECKLIST = [
    { label: '10-hour rest between shifts', rules: ['rest10h'] },
    { label: 'No 6th consecutive day', rules: ['maxConsecutive5'] },
    { label: 'Charge nurse on every shift', rules: ['chargeCoverage'] },
    { label: 'Right skill mix (RNs + aides)', rules: ['rnCoverage', 'supportCoverage'] },
    { label: 'Under 60 hours per nurse', rules: ['maxHours60'] },
    { label: 'Approved leave respected', rules: ['approvedLeave'] },
  ];

  type Phase = 'intro' | 'generating' | 'ready';
  type PickerMode = 'fill' | 'breakit' | 'callout';
  interface Picker {
    day: DayIndex;
    type: ShiftType;
    mode: PickerMode;
    /** which seat is being filled — gates the picker by role */
    kind: SlotKind;
    highlightId?: string;
    calledOut?: string;
  }

  // ── State (runes) ─────────────────────────────────────────────────────────
  let phase = $state<Phase>('intro');
  let target = $state<Assignment[]>([]); // the deterministic generated schedule
  let schedule = $state<Assignment[]>([]); // the live, possibly-edited schedule
  let reveal = $state(0); // cells revealed during the generate animation
  let ticked = $state(0); // checklist items ticked during generate
  let picker = $state<Picker | null>(null);
  let undoStack = $state<Assignment[][]>([]);
  let toast = $state<string | null>(null);
  let stressNote = $state<string | null>(null); // explainer banner for the "try to break it" stress test
  // Guided-tour progress — drives the pulsing "click here" dot through each step.
  let didBreak = $state(false);
  let didCallout = $state(false);

  // CTA form
  let email = $state('');
  let role = $state('');
  let sending = $state(false);
  let sent = $state(false);

  // ── Derived ────────────────────────────────────────────────────────────────
  const view = $derived(phase === 'generating' ? target.slice(0, reveal) : schedule);
  const violations = $derived<Violation[]>(phase === 'ready' ? checkSchedule(schedule) : []);
  const safetyBreaks = $derived(violations.filter((v) => !COVERAGE_RULES.has(v.rule)));
  const totalShifts = SHIFTS.length;
  const coveredShifts = $derived(SHIFTS.filter((s) => neededSlotKind(schedule, s, DATASET) === null).length);
  const coverageGaps = $derived(violations.filter((v) => COVERAGE_RULES.has(v.rule)));
  // Roster + fairness: every staff member, their live weekly hours (animating with the
  // reveal via `view`), and visible constraints. Shown at the top in every phase.
  const roster = $derived(NURSES.map((nurse) => ({ nurse, hours: nurseHoursInWeek(view, nurse.id) })));
  const fairness = $derived.by(() => {
    const hrs = roster.filter((r) => r.hours > 0).map((r) => r.hours);
    const weekendNurses = new Set(schedule.filter((a) => a.day >= 5).map((a) => a.nurseId)).size;
    return { min: hrs.length ? Math.min(...hrs) : 0, max: hrs.length ? Math.max(...hrs) : 0, weekendNurses };
  });
  const pickerCandidates = $derived<Candidate[]>(
    picker ? eligibleCandidates(schedule, { day: picker.day, type: picker.type }, picker.kind, DATASET) : []
  );
  // The single control to pulse next, so a first-timer always knows where to click.
  const guide = $derived.by(() => {
    if (phase === 'intro') return 'fill';
    if (picker) return picker.mode === 'breakit' ? 'pick-hl' : picker.mode === 'callout' ? 'pick-top' : null;
    if (phase !== 'ready') return null;
    if (!didBreak) return 'breakit';
    if (!didCallout) return 'staffout';
    return null;
  });
  // In a call-out, the recommended replacement is the top-ranked eligible candidate.
  const topEligibleId = $derived(
    picker?.mode === 'callout' ? (pickerCandidates.find((c) => c.eligible)?.nurse.id ?? null) : null
  );

  // Live checklist state: while generating, animate the tick; once ready, each item
  // reflects the current schedule — ✓ clean, 'warn' (○) coverage gap, 'bad' (⚠) break.
  type CheckState = 'pending' | 'done' | 'warn' | 'bad';
  const checklistState = $derived<CheckState[]>(
    CHECKLIST.map((item, i) => {
      if (phase !== 'ready') return i < ticked ? 'done' : 'pending';
      const vs = violations.filter((v) => item.rules.includes(v.rule));
      if (vs.length === 0) return 'done';
      return vs.some((v) => COVERAGE_RULES.has(v.rule)) ? 'warn' : 'bad';
    })
  );

  // Per-nurse summary of safety breaks — a manager thinks "one nurse over two limits",
  // not "12 broken rules" (one illegal run trips several rules across several shifts).
  const brokenByNurse = $derived.by(() => {
    const m = new Map<string, Set<string>>();
    for (const v of safetyBreaks) {
      if (!v.nurseId) continue;
      const set = m.get(v.nurseId) ?? new Set<string>();
      set.add(v.rule);
      m.set(v.nurseId, set);
    }
    return m;
  });
  const safetySummary = $derived.by(() => {
    const m = brokenByNurse;
    if (m.size === 0) return '';
    if (m.size === 1) {
      const [id, rules] = [...m.entries()][0]!;
      return `${nurseById(id).name} is over ${rules.size} safety limit${rules.size > 1 ? 's' : ''}`;
    }
    return `${m.size} nurses over their safety limits`;
  });
  // One-line summary of the current coverage gap(s) for the amber attention box.
  const coverageSummary = $derived.by(() => {
    if (coverageGaps.length === 0) return '';
    const shifts = new Set(coverageGaps.map((g) => `${g.day}-${g.type}`));
    if (shifts.size > 1) return `${shifts.size} shifts still need coverage.`;
    // One shift, possibly several unmet needs — name the primary one (charge > RN > aide)
    // and say WHY it's still open: a lower role can't cover a higher seat.
    const g = coverageGaps.find((x) => x.day !== undefined) ?? coverageGaps[0]!;
    const where = g.day !== undefined && g.type !== undefined ? `${DAY_NAMES[g.day]} ${g.type} shift` : 'This shift';
    if (coverageGaps.some((x) => x.rule === 'chargeCoverage'))
      return `${where} still needs a charge nurse — only a charge-qualified RN can cover the charge seat.`;
    if (coverageGaps.some((x) => x.rule === 'rnCoverage'))
      return `${where} still needs another registered nurse — an aide (LPN/CNA) can't fill a nursing seat.`;
    return `${where} still needs a support aide (an LPN or CNA).`;
  });

  const nurseById = (id: string): Nurse => NURSES.find((n) => n.id === id)!;
  const isCharge = (id: string) => nurseById(id).chargeQualified;
  const dayShort = (d: number) => (DAY_NAMES[d] ?? '').slice(0, 3);
  const seatLabel = (k: SlotKind) => (k === 'charge' ? 'charge nurse' : k === 'rn' ? 'registered nurse' : 'support aide');

  // Chip tone by role: charge RN (green + shield), staff RN, LPN, CNA — so the
  // skill mix reads at a glance. (No clinical ladder — see designation() in the engine.)
  function roleTone(nurse: Nurse): string {
    if (nurse.chargeQualified) return 'tone-charge';
    if (nurse.role === 'LPN') return 'tone-lpn';
    if (nurse.role === 'CNA') return 'tone-cna';
    return 'tone-rn';
  }

  function track(event: string, extra: Record<string, unknown> = {}) {
    if (typeof window === 'undefined') return;
    const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event, demo: 'nurse-scheduler', ...extra });
  }

  function flash(msg: string) {
    toast = msg;
    const ms = Math.min(8000, 3500 + msg.length * 45); // keep longer messages on screen long enough to read
    if (typeof window !== 'undefined') window.setTimeout(() => (toast = null), ms);
  }

  // ── 1. GENERATE ─────────────────────────────────────────────────────────────
  function build() {
    track('demo_generate');
    target = generateSchedule();
    schedule = [];
    undoStack = [];
    reveal = 0;
    ticked = 0;
    stressNote = null;
    didBreak = false;
    didCallout = false;
    phase = 'generating';

    const stepCell = () => {
      if (reveal < target.length) {
        reveal += 1;
        window.setTimeout(stepCell, 55);
      }
    };
    const stepTick = () => {
      if (ticked < CHECKLIST.length) {
        ticked += 1;
        window.setTimeout(stepTick, 480);
      } else {
        schedule = [...target];
        phase = 'ready';
      }
    };
    window.setTimeout(stepCell, 250);
    window.setTimeout(stepTick, 500);
  }

  // ── Cell model ──────────────────────────────────────────────────────────────
  function cellOf(day: DayIndex, type: ShiftType) {
    const def = SHIFTS.find((s) => s.day === day && s.type === type)!;
    const here = view.filter((a) => a.day === day && a.type === type);
    const vs = violations.filter((v) => v.day === day && v.type === type);
    const broke = vs.filter((v) => !COVERAGE_RULES.has(v.rule));
    const need = neededSlotKind(view, def, DATASET); // the missing seat kind, or null when fully staffed
    const status: 'full' | 'gap' | 'break' = broke.length ? 'break' : need ? 'gap' : 'full';
    const needLabel = need === 'charge' ? 'needs charge' : need === 'rn' ? 'needs RN' : need === 'support' ? 'needs aide' : '';
    return { def, here, broke, status, need, needLabel };
  }

  // ── 2. TRY TO BREAK IT — honest "stress test": stack a staff nurse onto 5 days
  //      straight (the legal max), then show the 6th-consecutive-day block. ──────
  function tryToBreak() {
    const block: DayIndex[] = [0, 1, 2, 3, 4]; // Mon–Fri
    const sixth: DayIndex = 5; // Saturday
    const candidates = NURSES.filter((n) => n.role === 'RN' && !n.chargeQualified && n.employment === 'full-time' && !n.leaveDays);
    for (const nurse of candidates) {
      let trial: Assignment[] = [...schedule];
      let ok = true;
      for (const d of block) {
        if (trial.some((a) => a.nurseId === nurse.id && a.day === d)) continue; // already working that day (counts toward the streak)
        // Swap a spare staff (non-charge) RN out of this Day shift and drop the nurse in —
        // a reassignment, not an extra body, so no shift ends up overstaffed.
        const spare = trial.find((a) => {
          if (a.day !== d || a.type !== 'day') return false;
          const n = nurseById(a.nurseId);
          return n.role === 'RN' && !n.chargeQualified;
        });
        const base = spare ? trial.filter((a) => a !== spare) : trial;
        if (placementViolations(base, { nurseId: nurse.id, day: d, type: 'day' }, DATASET).length === 0) {
          trial = [...base, { nurseId: nurse.id, day: d, type: 'day' }];
        } else {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      // Clean demo: the 6th day must be blocked PURELY by the consecutive-day rule
      // (not also a rest conflict), so the reason reads "6th day in a row".
      const sixthViolations = placementViolations(trial, { nurseId: nurse.id, day: sixth, type: 'day' }, DATASET);
      if (sixthViolations[0]?.rule === 'maxConsecutive5') {
        pushUndo();
        schedule = trial;
        track('demo_break_attempt', { nurse: nurse.name, rule_target: 'maxConsecutive5' });
        stressNote = `Stress test: we stacked ${nurse.name} onto Mon–Fri — 5 days straight, ${nurseHoursInWeek(schedule, nurse.id)}h (the weekly cap). Now try adding them to Saturday.`;
        picker = { day: sixth, type: 'day', mode: 'breakit', kind: 'rn', highlightId: nurse.id };
        return;
      }
    }
    flash('Could not set up a stress test on this roster — try a call-out instead.');
  }

  // ── 3. CALL-OUTS — each leaves a role-specific gap the picker fills by skill. ──
  // A staff RN calls out → the picker offers RNs (aides are role-blocked).
  function callOut() {
    const day: DayIndex = 1; // Tuesday
    const type: ShiftType = 'day';
    const here = schedule.filter((a) => a.day === day && a.type === type);
    const victim = here.find((a) => nurseById(a.nurseId).role === 'RN' && !isCharge(a.nurseId)) ?? here[0];
    if (!victim) return;
    pushUndo();
    stressNote = null;
    schedule = schedule.filter((a) => a !== victim);
    track('demo_callout', { nurse: nurseById(victim.nurseId).name, role: 'rn' });
    picker = { day, type, mode: 'callout', kind: 'rn', calledOut: victim.nurseId };
  }

  // A charge nurse calls out → only a charge-qualified RN restores coverage;
  // filling the seat with a non-charge RN won't clear the flag.
  function chargeCallOut() {
    const day: DayIndex = 3; // Thursday
    const type: ShiftType = 'night';
    const here = schedule.filter((a) => a.day === day && a.type === type);
    const victim = here.find((a) => isCharge(a.nurseId));
    if (!victim) return;
    pushUndo();
    stressNote = null;
    schedule = schedule.filter((a) => a !== victim);
    track('demo_callout', { nurse: nurseById(victim.nurseId).name, role: 'charge' });
    picker = { day, type, mode: 'callout', kind: 'charge', calledOut: victim.nurseId };
  }

  // A support aide (LPN/CNA) calls out → the picker offers aides (RNs are reserved
  // for nursing seats). Shows that the product schedules the whole team, not just RNs.
  function aideCallOut() {
    const day: DayIndex = 4; // Friday
    const type: ShiftType = 'day';
    const here = schedule.filter((a) => a.day === day && a.type === type);
    const victim = here.find((a) => nurseById(a.nurseId).role !== 'RN');
    if (!victim) return;
    pushUndo();
    stressNote = null;
    schedule = schedule.filter((a) => a !== victim);
    track('demo_callout', { nurse: nurseById(victim.nurseId).name, role: 'aide' });
    picker = { day, type, mode: 'callout', kind: 'support', calledOut: victim.nurseId };
  }

  // ── Mutations ───────────────────────────────────────────────────────────────
  function pushUndo() {
    undoStack = [...undoStack, schedule.map((a) => ({ ...a }))];
  }

  function assign(c: Candidate) {
    if (!picker) return;
    const slot = { day: picker.day, type: picker.type };
    pushUndo();
    stressNote = null; // resolving the picker ends any running stress test
    const wasCallout = picker.mode === 'callout';
    schedule = [...schedule, { nurseId: c.nurse.id, day: slot.day, type: slot.type }];
    if (wasCallout) {
      const def = SHIFTS.find((s) => s.day === slot.day && s.type === slot.type)!;
      const stillNeeds = neededSlotKind(schedule, def, DATASET);
      if (stillNeeds) {
        const label =
          stillNeeds === 'charge' ? 'a charge-qualified RN' : stillNeeds === 'rn' ? 'another RN' : 'a support aide (LPN/CNA)';
        track('demo_callout_resolved', { nurse: c.nurse.name, stillNeeds });
        flash(`${c.nurse.name} fills the seat — but the shift still needs ${label}.`);
      } else {
        track('demo_callout_resolved', { nurse: c.nurse.name });
        flash(`${c.nurse.name} picked up the shift. Gap filled, still zero violations.`);
      }
      didCallout = true; // tour: the call-out step is done
    }
    picker = null;
  }

  function forceAnyway(c: Candidate) {
    if (!picker) return;
    const p = picker;
    pushUndo();
    stressNote = null; // forcing the 6th day completes the stress test — clear the prompt
    const safety = c.violations.find((v) => !COVERAGE_RULES.has(v.rule));
    const reason = (safety ?? c.violations[0])?.message ?? 'breaks a rule';
    // In the stress-test (breakit) flow the shift is already full — swap a spare staff RN out
    // so the forced pick shows the broken rule without also overstaffing the shift.
    let base = schedule;
    if (p.mode === 'breakit') {
      const spare = schedule.find((a) => {
        if (a.day !== p.day || a.type !== p.type || a.nurseId === c.nurse.id) return false;
        const n = nurseById(a.nurseId);
        return n.role === 'RN' && !n.chargeQualified;
      });
      if (spare) base = schedule.filter((a) => a !== spare);
    }
    schedule = [...base, { nurseId: c.nurse.id, day: p.day, type: p.type }];
    if (p.mode === 'breakit') didBreak = true; // tour: the "try to break a rule" step is done
    track('demo_force_violation', { nurse: c.nurse.name, rule: c.violations[0]?.rule });
    flash(`Forced — and flagged: ${reason}`);
    picker = null;
  }

  function undo() {
    const prev = undoStack[undoStack.length - 1];
    if (!prev) return;
    schedule = prev;
    undoStack = undoStack.slice(0, -1);
    stressNote = null;
  }

  function reset() {
    schedule = [...target];
    undoStack = [];
    picker = null;
    toast = null;
    stressNote = null;
    didBreak = false;
    didCallout = false;
    track('demo_reset');
  }

  function openPicker(day: DayIndex, type: ShiftType) {
    if (phase !== 'ready') return;
    const def = SHIFTS.find((s) => s.day === day && s.type === type)!;
    const kind = neededSlotKind(schedule, def, DATASET) ?? 'rn';
    picker = { day, type, mode: 'fill', kind };
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && picker) picker = null;
  }

  async function submitEmail(e: SubmitEvent) {
    e.preventDefault();
    if (!email || sending) return;
    sending = true;
    try {
      await fetch(CONFIG.captureUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          source: 'simulator-demo',
          email,
          role,
          message: 'Wants to see the demo on their own roster (from /simulator).',
        }),
      });
    } catch {
      /* no-cors: opaque response, treat as delivered (mirrors site contact form) */
    }
    sending = false;
    sent = true;
    track('demo_email_submit');
  }
</script>

<svelte:window onkeydown={onKeydown} />

<div class="ssa-root">
<section class="ssa-demo" aria-labelledby="ssa-demo-title">
  <header class="ssa-head">
    <span class="ssa-badge"><span aria-hidden="true">●</span> Demo data — not a real hospital</span>
    <h2 id="ssa-demo-title">Build a safe ICU week in under a minute.</h2>
    <p class="ssa-sub">
      One unit, one week, 17 fictional staff — RNs, LPNs and CNAs. The same explainable safety rules our
      scheduling team relies on — every decision traceable, nothing hidden in a black box.
    </p>
  </header>

  <!-- The team — shown up top, in every phase. Hours fill in live as the week is built. -->
  <div class="ssa-team">
    <div class="ssa-team-head">
      <h3>{phase === 'ready' ? 'Team this week' : 'The team available this week'}</h3>
      {#if phase === 'ready'}
        <span class="ssa-fair">
          Balanced: {fairness.min}–{fairness.max}h each · weekends across {fairness.weekendNurses} people · nobody over 60h
        </span>
      {:else}
        <span class="ssa-fair">17 staff — 12 RNs, 2 LPNs, 3 CNAs · every shift gets the right mix</span>
      {/if}
    </div>
    <ul class="ssa-roster">
      {#each roster as r (r.nurse.id)}
        <li class="ssa-rrow">
          <span class="ssa-rname">
            {#if isCharge(r.nurse.id)}<span class="ssa-shield" aria-label="charge nurse">⬢</span>{/if}
            {r.nurse.name}
            <span class="ssa-chip-lvl">{r.nurse.role}</span>
          </span>
          <span class="ssa-rbadges">
            {#if r.nurse.chargeQualified}<span class="ssa-badge2 charge">charge</span>{/if}
            {#if r.nurse.role === 'LPN'}<span class="ssa-badge2 lpn">LPN</span>{/if}
            {#if r.nurse.role === 'CNA'}<span class="ssa-badge2 cna">CNA</span>{/if}
            {#if r.nurse.employment === 'PRN'}<span class="ssa-badge2 prn">PRN · weekends</span>{/if}
            {#if r.nurse.leaveDays}<span class="ssa-badge2 leave">on leave {(r.nurse.leaveDays ?? []).map(dayShort).join('–')}</span>{/if}
          </span>
          <span class="ssa-rbar" aria-hidden="true"><span class="ssa-rfill" style="width:{Math.round((r.hours / 60) * 100)}%"></span></span>
          <span class="ssa-rhours">{r.hours}h</span>
        </li>
      {/each}
    </ul>
  </div>

  <!-- Action area -->
  {#if phase === 'intro'}
    <div class="ssa-cta-build">
      <span class="ssa-cta-wrap">
        <button class="ssa-btn ssa-btn-primary ssa-btn-lg ssa-pulse-cta" onclick={build}>Fill all the slots →</button>
        {#if guide === 'fill'}<span class="ssa-cta-dot" aria-hidden="true"></span>{/if}
      </span>
      <p class="ssa-hint">Every seat below is empty. <strong>Click to start</strong> — one click staffs the whole week, safely.</p>
    </div>
  {:else}
    <!-- Rule checklist -->
    <ul class="ssa-checklist" aria-label="Safety rules verified">
      {#each CHECKLIST as item, i}
        {@const st = checklistState[i]}
        <li class:done={st === 'done'} class:warn={st === 'warn'} class:bad={st === 'bad'}>
          <span class="ssa-check" aria-hidden="true">{st === 'done' ? '✓' : st === 'bad' ? '⚠' : '○'}</span>
          <span>{item.label}</span>
        </li>
      {/each}
    </ul>

    <!-- Action bar -->
    {#if phase === 'ready'}
      <div class="ssa-actions">
        <span
          class="ssa-status"
          class:ok={safetyBreaks.length === 0 && coverageGaps.length === 0}
          class:bad={safetyBreaks.length > 0}
          class:warn={safetyBreaks.length === 0 && coverageGaps.length > 0}
        >
          <span aria-hidden="true">{safetyBreaks.length > 0 ? '⚠' : coverageGaps.length > 0 ? '○' : '✓'}</span>
          {#if safetyBreaks.length > 0}
            {safetySummary}
          {:else if coverageGaps.length > 0}
            {coveredShifts}/{totalShifts} shifts staffed · {coverageGaps.some((v) => v.rule === 'chargeCoverage')
              ? 'needs a charge nurse'
              : coverageGaps.some((v) => v.rule === 'rnCoverage')
                ? 'needs an RN'
                : 'needs a support aide'}
          {:else}
            {coveredShifts}/{totalShifts} shifts staffed · 0 violations
          {/if}
        </span>
        <div class="ssa-action-btns">
          <button class="ssa-btn" onclick={tryToBreak}
            >Try to break a rule{#if guide === 'breakit'}<span class="ssa-cta-dot" aria-hidden="true"></span>{/if}</button
          >
          <button class="ssa-btn" onclick={callOut}
            >Staff calls out{#if guide === 'staffout'}<span class="ssa-cta-dot" aria-hidden="true"></span>{/if}</button
          >
          <button class="ssa-btn" onclick={chargeCallOut}>Charge nurse calls out</button>
          <button class="ssa-btn" onclick={aideCallOut}>Aide calls out</button>
          <button class="ssa-btn ssa-btn-ghost" onclick={undo} disabled={!undoStack.length}>Undo</button>
          <button class="ssa-btn ssa-btn-ghost" onclick={reset}>Reset</button>
        </div>
      </div>

      {#if safetyBreaks.length > 0}
        <div class="ssa-alert" role="alert">
          <span aria-hidden="true">⚠</span>
          <div>
            <strong>That broke a safety rule.</strong>
            <span>{safetyBreaks[0]?.message}</span>
          </div>
          <button class="ssa-btn ssa-btn-sm" onclick={undo}>Undo</button>
        </div>
      {/if}

      {#if coverageGaps.length > 0}
        <div class="ssa-alert ssa-warn" role="status">
          <span aria-hidden="true">○</span>
          <div>
            <strong>{safetyBreaks.length > 0 ? "Plus a coverage gap — the shift isn't fully staffed." : "Coverage gap — safe, but the shift isn't fully staffed."}</strong>
            <span>{coverageSummary}</span>
          </div>
        </div>
      {/if}
    {/if}

    {#if stressNote}
      <div class="ssa-note" role="status">
        <span aria-hidden="true">🧪</span>
        <span>{stressNote}</span>
      </div>
    {/if}
  {/if}

  <!-- Schedule grid (all phases; every seat empty until "Fill all the slots") -->
  <div class="ssa-grid" role="table" aria-label="ICU weekly schedule">
    <div class="ssa-col-head" role="row" aria-hidden="true">
      <span></span>
      <span>Day · 07:00–19:00</span>
      <span>Night · 19:00–07:00</span>
    </div>
    {#each DAY_NAMES as name, d}
      <div class="ssa-day-row" role="row">
        <span class="ssa-day-label" role="rowheader">
          <strong>{dayShort(d)}</strong>
          <small>{(d as number) >= 5 ? 'weekend' : ''}</small>
        </span>
        {#each ['day', 'night'] as const as type}
          {@const cell = cellOf(d as DayIndex, type)}
          <button
            class={`ssa-cell ${phase === 'ready' ? 'ssa-' + cell.status : ''}`}
            role="cell"
            onclick={() => openPicker(d as DayIndex, type)}
            disabled={phase !== 'ready'}
            aria-label={`${name} ${type} shift, ${cell.here.length} of ${cell.def.required} staffed${phase === 'ready' && cell.status === 'break' ? ', safety rule broken' : phase === 'ready' && cell.status === 'gap' ? ', ' + cell.needLabel : ''}. Click to edit.`}
          >
            <span class="ssa-cell-shift" aria-hidden="true">{type === 'day' ? 'Day' : 'Night'}</span>
            <span class="ssa-chips">
              {#each cell.here as a (a.nurseId + a.day + a.type)}
                {@const n = nurseById(a.nurseId)}
                <span class="ssa-chip {roleTone(n)}">
                  {#if isCharge(a.nurseId)}<span class="ssa-shield" title="Charge nurse" aria-label="charge nurse">⬢</span>{/if}
                  <span class="ssa-chip-name">{n.name.split(' ')[0]}</span>
                  <span class="ssa-chip-lvl">{n.role}</span>
                </span>
              {/each}
              {#each Array(Math.max(0, cell.def.required - cell.here.length)) as _}
                <span class="ssa-chip ssa-empty">+ open</span>
              {/each}
            </span>
            {#if cell.status !== 'full' && phase === 'ready'}
              <span class="ssa-cell-flag">{cell.status === 'break' ? '⚠ unsafe' : '○ ' + cell.needLabel}</span>
            {/if}
          </button>
        {/each}
      </div>
    {/each}
  </div>

  {#if phase === 'ready'}
    <!-- What you'd actually get — bridge the demo to the managed service -->
    <div class="ssa-deliver">
      <div class="ssa-deliver-item">
        <span class="ssa-deliver-icon" aria-hidden="true">⏳</span>
        <span><strong>The boring part of the week — handled.</strong> By hand, a schedule like this takes hours of a nurse manager's week, every week.</span>
      </div>
      <div class="ssa-deliver-item">
        <span class="ssa-deliver-icon" aria-hidden="true">📨</span>
        <span><strong>Every Thursday, it lands in your inbox.</strong> A clean PDF + Excel, already checked by our scheduling team. You review and approve — that's it.</span>
      </div>
    </div>

    <!-- CONVERT -->
    <div class="ssa-convert">
      <h3>That was one unit and one week. Your hospital is harder — that's the point.</h3>
        <p>Send us last month's real schedule and we'll show you this on your own roster, free.</p>
        {#if !sent}
          <form class="ssa-form" onsubmit={submitEmail}>
            <input
              type="email"
              required
              bind:value={email}
              placeholder="you@hospital.org"
              aria-label="Work email"
            />
            <input type="text" bind:value={role} placeholder="Role (DON, Nurse Manager…)" aria-label="Your role" />
            <button class="ssa-btn ssa-btn-primary" type="submit" disabled={sending}>
              {sending ? 'Sending…' : 'Show me on my roster'}
            </button>
          </form>
          <a class="ssa-booklink" href={CONFIG.calUrl} target="_blank" rel="noopener" onclick={() => track('demo_book_click')}>
            …or book a 30-minute call →
          </a>
        {:else}
          <p class="ssa-sent" role="status">✓ Thanks — we'll be in touch within one business day.</p>
          <a class="ssa-btn ssa-btn-primary" href={CONFIG.calUrl} target="_blank" rel="noopener" onclick={() => track('demo_book_click')}>
            Book a 30-minute call →
          </a>
        {/if}
      </div>
  {/if}
</section>

<!-- Staff picker (dialog / mobile bottom-sheet) -->
{#if picker}
  {@const p = picker}
  <div class="ssa-backdrop" onclick={() => (picker = null)} aria-hidden="true"></div>
  <div class="ssa-sheet" role="dialog" aria-modal="true" aria-labelledby="ssa-picker-title">
    <div class="ssa-sheet-head">
      <h3 id="ssa-picker-title">
        {#if p.mode === 'callout'}
          {nurseById(p.calledOut ?? '').name} called out — find a {seatLabel(p.kind)}
        {:else if p.mode === 'breakit'}
          Who can take the {DAY_NAMES[p.day]} {p.type} shift?
        {:else}
          {DAY_NAMES[p.day]} · {p.type === 'day' ? 'Day' : 'Night'} — fill the {seatLabel(p.kind)} seat
        {/if}
      </h3>
      <button class="ssa-x" onclick={() => (picker = null)} aria-label="Close">✕</button>
    </div>

    {#if p.mode === 'breakit' && p.highlightId}
      <p class="ssa-tip">
        Tip: try assigning <strong>{nurseById(p.highlightId).name}</strong> — the engine will explain why it can't.
      </p>
    {:else if p.kind === 'charge'}
      <p class="ssa-tip">This is the <span class="ssa-shield">⬢</span> charge seat — only a charge-qualified RN can take it.</p>
    {:else if p.kind === 'rn'}
      <p class="ssa-tip">This is a registered-nurse seat — aides are reserved for support seats.</p>
    {:else}
      <p class="ssa-tip">This is a support-aide seat — for an LPN or CNA.</p>
    {/if}

    <ul class="ssa-cands">
      {#each pickerCandidates as c (c.nurse.id)}
        <li class="ssa-cand" class:elig={c.eligible} class:inelig={!c.eligible && !c.already} class:hl={c.nurse.id === p.highlightId}>
          <div class="ssa-cand-main">
            <span class="ssa-cand-icon" aria-hidden="true">{c.eligible ? '✓' : c.already ? '•' : '⚠'}</span>
            <span class="ssa-cand-name">
              {#if isCharge(c.nurse.id)}<span class="ssa-shield" aria-label="charge nurse">⬢</span>{/if}
              {c.nurse.name}
              <span class="ssa-chip-lvl">{c.nurse.role}</span>
            </span>
          </div>
          <div class="ssa-cand-reason">
            {#if c.already}
              <span class="ssa-muted">Already on this shift</span>
            {:else if c.eligible}
              <span class="ssa-ok-reason">{c.reasons.join(' · ')}</span>
            {:else}
              {#each c.violations as v}
                <span class="ssa-bad-reason">{v.message}</span>
              {/each}
            {/if}
          </div>
          <div class="ssa-cand-act">
            {#if c.eligible}
              <button class="ssa-btn ssa-btn-sm ssa-btn-primary" onclick={() => assign(c)}
                >Assign{#if guide === 'pick-top' && c.nurse.id === topEligibleId}<span
                    class="ssa-cta-dot ssa-cta-dot--left"
                    aria-hidden="true"
                  ></span>{/if}</button
              >
            {:else if !c.already}
              <button class="ssa-btn ssa-btn-sm ssa-btn-danger" onclick={() => forceAnyway(c)}
                >Force anyway{#if guide === 'pick-hl' && c.nurse.id === p.highlightId}<span
                    class="ssa-cta-dot ssa-cta-dot--left"
                    aria-hidden="true"
                  ></span>{/if}</button
              >
            {/if}
          </div>
        </li>
      {/each}
    </ul>
  </div>
{/if}

{#if toast}
  <div class="ssa-toast" role="status">{toast}</div>
{/if}
</div>

<style>
  /* Tokens: use the site's CSS variables where present, with safe fallbacks so the
     component also renders correctly when previewed standalone. */
  /* Vars live on the wrapper so the picker + toast (rendered as siblings of
     .ssa-demo, e.g. position:fixed) resolve them too — not just the widget. */
  .ssa-root {
    --green: var(--aw-color-primary, #2d5a4a);
    --green-2: var(--aw-color-secondary, #234739);
    --ink: #1a2332;
    --ivory: var(--aw-color-bg-page, #faf7f2);
    --line: rgb(26 35 50 / 12%);
    --amber: #b45309;
    --red: #b91c1c;
    font-family: var(--aw-font-sans, 'Inter Variable', Inter, system-ui, sans-serif);
    color: var(--ink);
  }
  .ssa-demo {
    max-width: 60rem;
    margin: 0 auto;
    padding: 1rem;
  }
  .ssa-head {
    text-align: center;
    margin-bottom: 1.25rem;
  }
  .ssa-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--green);
    background: color-mix(in srgb, var(--green) 10%, transparent);
    border-radius: 999px;
    padding: 0.3rem 0.75rem;
  }
  .ssa-badge span {
    color: var(--amber);
  }
  .ssa-head h2 {
    font-family: var(--aw-font-heading, 'Fraunces Variable', Fraunces, Georgia, serif);
    font-size: clamp(1.5rem, 4vw, 2.1rem);
    line-height: 1.15;
    margin: 0.75rem 0 0.5rem;
  }
  .ssa-sub {
    color: rgb(26 35 50 / 70%);
    max-width: 40rem;
    margin: 0 auto;
    font-size: 0.95rem;
  }
  .ssa-cta-build {
    text-align: center;
    padding: 2rem 0;
  }
  .ssa-cta-wrap {
    position: relative;
    display: inline-block;
  }
  .ssa-cta-dot {
    position: absolute;
    top: -5px;
    right: -5px;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: #dc2626;
    border: 2px solid #faf7f2;
    animation: ssa-cta-pulse 1.2s ease-in-out infinite;
    pointer-events: none;
  }
  .ssa-cta-dot--left {
    right: auto;
    left: -5px;
  }
  .ssa-pulse-cta {
    animation: ssa-cta-glow 1.5s ease-out infinite;
  }
  @keyframes ssa-cta-pulse {
    0%,
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.5);
    }
    50% {
      transform: scale(1.4);
      box-shadow: 0 0 0 7px rgba(220, 38, 38, 0);
    }
  }
  @keyframes ssa-cta-glow {
    0% {
      box-shadow: 0 0 0 0 color-mix(in srgb, var(--green) 35%, transparent);
    }
    70% {
      box-shadow: 0 0 0 12px color-mix(in srgb, var(--green) 0%, transparent);
    }
    100% {
      box-shadow: 0 0 0 0 transparent;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .ssa-pulse-cta {
      animation: none;
    }
    /* Keep a gentle, motion-free opacity pulse so the cue still reads as "live". */
    .ssa-cta-dot {
      animation: ssa-cta-fade 1.4s ease-in-out infinite;
    }
  }
  @keyframes ssa-cta-fade {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }
  .ssa-hint {
    color: rgb(26 35 50 / 60%);
    font-size: 0.85rem;
    margin-top: 0.75rem;
  }

  /* buttons */
  .ssa-btn {
    position: relative;
    appearance: none;
    border: 1px solid var(--line);
    background: #fff;
    color: var(--ink);
    border-radius: 0.6rem;
    padding: 0.55rem 0.9rem;
    font: inherit;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, transform 0.05s;
  }
  .ssa-btn:hover {
    background: rgb(26 35 50 / 4%);
  }
  .ssa-btn:active {
    transform: translateY(1px);
  }
  .ssa-btn:focus-visible {
    outline: 2px solid var(--green);
    outline-offset: 2px;
  }
  .ssa-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  .ssa-btn-primary {
    background: var(--green);
    border-color: var(--green);
    color: #fff;
  }
  .ssa-btn-primary:hover {
    background: var(--green-2);
  }
  .ssa-btn-danger {
    color: var(--red);
    border-color: color-mix(in srgb, var(--red) 40%, transparent);
  }
  .ssa-btn-danger:hover {
    background: color-mix(in srgb, var(--red) 8%, transparent);
  }
  .ssa-btn-ghost {
    background: transparent;
  }
  .ssa-btn-lg {
    padding: 0.85rem 1.5rem;
    font-size: 1rem;
  }
  .ssa-btn-sm {
    padding: 0.35rem 0.7rem;
    font-size: 0.8rem;
  }

  /* checklist */
  .ssa-checklist {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem 1rem;
    justify-content: center;
    list-style: none;
    padding: 0;
    margin: 0 0 1rem;
  }
  .ssa-checklist li {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.82rem;
    color: rgb(26 35 50 / 45%);
    transition: color 0.3s;
  }
  .ssa-checklist li.done {
    color: var(--green);
    font-weight: 600;
  }
  .ssa-checklist li.warn {
    color: var(--amber);
    font-weight: 600;
  }
  .ssa-checklist li.bad {
    color: var(--red);
    font-weight: 600;
  }
  .ssa-check {
    font-weight: 700;
  }

  /* action bar */
  .ssa-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }
  .ssa-status {
    font-size: 0.85rem;
    font-weight: 600;
    display: inline-flex;
    gap: 0.35rem;
    align-items: center;
  }
  .ssa-status.ok {
    color: var(--green);
  }
  .ssa-status.bad {
    color: var(--red);
  }
  .ssa-status.warn {
    color: var(--amber);
  }
  .ssa-action-btns {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }
  .ssa-alert {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    background: color-mix(in srgb, var(--red) 7%, #fff);
    border: 1px solid color-mix(in srgb, var(--red) 30%, transparent);
    color: var(--red);
    border-radius: 0.6rem;
    padding: 0.6rem 0.8rem;
    font-size: 0.85rem;
    margin-bottom: 0.75rem;
  }
  .ssa-alert div {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .ssa-alert span {
    color: rgb(26 35 50 / 75%);
  }
  .ssa-alert.ssa-warn {
    background: color-mix(in srgb, var(--amber) 8%, #fff);
    border-color: color-mix(in srgb, var(--amber) 32%, transparent);
    color: var(--amber);
  }

  /* grid */
  .ssa-grid {
    border: 1px solid var(--line);
    border-radius: 0.8rem;
    overflow: hidden;
    background: #fff;
  }
  .ssa-col-head,
  .ssa-day-row {
    display: grid;
    grid-template-columns: 84px 1fr 1fr;
  }
  .ssa-col-head {
    background: var(--ivory);
    border-bottom: 1px solid var(--line);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: rgb(26 35 50 / 60%);
    text-transform: uppercase;
  }
  .ssa-col-head span {
    padding: 0.5rem 0.6rem;
  }
  .ssa-day-row {
    border-bottom: 1px solid var(--line);
  }
  .ssa-day-row:last-child {
    border-bottom: 0;
  }
  .ssa-day-label {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0.6rem;
    background: var(--ivory);
    border-right: 1px solid var(--line);
    font-size: 0.85rem;
  }
  .ssa-day-label small {
    color: var(--amber);
    font-size: 0.65rem;
    text-transform: uppercase;
    font-weight: 700;
  }
  .ssa-cell {
    text-align: left;
    border: 0;
    border-right: 1px solid var(--line);
    border-left: 3px solid transparent;
    background: #fff;
    padding: 0.5rem;
    min-height: 64px;
    cursor: pointer;
    font: inherit;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    transition: background 0.12s;
  }
  .ssa-cell:last-child {
    border-right: 0;
  }
  .ssa-cell:hover:not(:disabled) {
    background: rgb(45 90 74 / 4%);
  }
  .ssa-cell:focus-visible {
    outline: 2px solid var(--green);
    outline-offset: -2px;
  }
  .ssa-cell:disabled {
    cursor: default;
  }
  .ssa-full {
    border-left-color: #16a34a;
  }
  .ssa-gap {
    border-left-color: var(--amber);
    background: #fffdf5;
  }
  .ssa-break {
    border-left-color: var(--red);
    background: color-mix(in srgb, var(--red) 5%, #fff);
  }
  .ssa-cell-shift {
    display: none;
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    color: rgb(26 35 50 / 50%);
  }
  .ssa-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  .ssa-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    border-radius: 0.35rem;
    padding: 0.12rem 0.4rem;
    font-size: 0.74rem;
    font-weight: 600;
    line-height: 1.3;
  }
  .tone-charge {
    background: #dfe9e4;
    color: #1f4538;
  }
  .tone-rn {
    background: #eef2ff;
    color: #3730a3;
  }
  .tone-lpn {
    background: #fef3c7;
    color: #92400e;
  }
  .tone-cna {
    background: #f1e9fb;
    color: #6b21a8;
  }
  .ssa-empty {
    background: transparent;
    border: 1px dashed var(--line);
    color: rgb(26 35 50 / 45%);
    font-weight: 500;
  }
  .ssa-chip-lvl {
    opacity: 0.7;
    font-weight: 700;
    font-size: 0.68rem;
  }
  .ssa-shield {
    color: var(--green);
    font-size: 0.7rem;
  }
  .ssa-cell-flag {
    font-size: 0.68rem;
    font-weight: 700;
  }
  .ssa-break .ssa-cell-flag {
    color: var(--red);
  }
  .ssa-gap .ssa-cell-flag {
    color: var(--amber);
  }

  /* stress-test note */
  .ssa-note {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    background: #fff8e6;
    border: 1px solid color-mix(in srgb, var(--amber) 35%, transparent);
    color: #7c4a03;
    border-radius: 0.6rem;
    padding: 0.6rem 0.8rem;
    font-size: 0.85rem;
    margin-bottom: 0.75rem;
  }

  /* team roster + fairness */
  .ssa-team {
    margin-top: 1.25rem;
    border: 1px solid var(--line);
    border-radius: 0.8rem;
    background: #fff;
    padding: 1rem 1.1rem;
  }
  .ssa-team-head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.3rem 0.75rem;
    margin-bottom: 0.6rem;
  }
  .ssa-team-head h3 {
    margin: 0;
    font-family: var(--aw-font-heading, 'Fraunces Variable', Fraunces, Georgia, serif);
    font-size: 1.05rem;
  }
  .ssa-fair {
    font-size: 0.8rem;
    color: var(--green);
    font-weight: 600;
  }
  .ssa-roster {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.1rem 1.5rem;
  }
  .ssa-rrow {
    display: grid;
    grid-template-columns: minmax(8rem, auto) 1fr 4rem 2.4rem;
    align-items: center;
    gap: 0.4rem;
    padding: 0.3rem 0;
    border-bottom: 1px solid color-mix(in srgb, var(--ink) 6%, transparent);
    font-size: 0.82rem;
  }
  .ssa-rname {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-weight: 600;
    white-space: nowrap;
  }
  .ssa-rbadges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  .ssa-badge2 {
    font-size: 0.62rem;
    font-weight: 700;
    border-radius: 999px;
    padding: 0.05rem 0.45rem;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }
  .ssa-badge2.charge {
    background: #dfe9e4;
    color: #1f4538;
  }
  .ssa-badge2.lpn {
    background: #fef3c7;
    color: #92400e;
  }
  .ssa-badge2.cna {
    background: #f1e9fb;
    color: #6b21a8;
  }
  .ssa-badge2.prn {
    background: #e0f2fe;
    color: #075985;
  }
  .ssa-badge2.leave {
    background: #fee2e2;
    color: #991b1b;
  }
  .ssa-rbar {
    height: 7px;
    border-radius: 999px;
    background: rgb(26 35 50 / 8%);
    overflow: hidden;
  }
  .ssa-rfill {
    display: block;
    height: 100%;
    background: var(--green);
    border-radius: 999px;
  }
  .ssa-rhours {
    text-align: right;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: rgb(26 35 50 / 70%);
  }
  .ssa-team-foot {
    margin: 0.6rem 0 0;
    font-size: 0.72rem;
    color: rgb(26 35 50 / 50%);
  }

  /* what you'd actually get — bridge to the managed service */
  .ssa-deliver {
    margin-top: 1.25rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }
  .ssa-deliver-item {
    display: flex;
    gap: 0.6rem;
    align-items: flex-start;
    background: #fff;
    border: 1px solid var(--line);
    border-left: 3px solid var(--green);
    border-radius: 0.6rem;
    padding: 0.8rem 0.9rem;
    font-size: 0.88rem;
    line-height: 1.45;
    color: rgb(26 35 50 / 80%);
  }
  .ssa-deliver-item strong {
    color: var(--ink);
  }
  .ssa-deliver-icon {
    font-size: 1.1rem;
    line-height: 1.2;
  }
  @media (max-width: 640px) {
    .ssa-deliver {
      grid-template-columns: 1fr;
    }
  }

  /* convert */
  .ssa-convert {
    margin-top: 1.5rem;
    text-align: center;
    background: var(--ivory);
    border: 1px solid var(--line);
    border-radius: 0.9rem;
    padding: 1.5rem;
  }
  .ssa-convert h3 {
    font-family: var(--aw-font-heading, 'Fraunces Variable', Fraunces, Georgia, serif);
    font-size: 1.25rem;
    margin: 0 0 0.4rem;
  }
  .ssa-convert p {
    color: rgb(26 35 50 / 70%);
    font-size: 0.92rem;
    margin: 0 auto 1rem;
    max-width: 34rem;
  }
  .ssa-form {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    max-width: 32rem;
    margin: 0 auto;
  }
  .ssa-form input {
    flex: 1 1 12rem;
    border: 1px solid var(--line);
    border-radius: 0.6rem;
    padding: 0.6rem 0.8rem;
    font: inherit;
    font-size: 0.9rem;
    background: #fff;
  }
  .ssa-form input:focus-visible {
    outline: 2px solid var(--green);
    outline-offset: 1px;
  }
  .ssa-booklink {
    display: inline-block;
    margin-top: 0.8rem;
    color: var(--green);
    font-weight: 600;
    font-size: 0.88rem;
  }
  .ssa-sent {
    color: var(--green);
    font-weight: 600;
  }

  /* picker sheet */
  .ssa-backdrop {
    position: fixed;
    inset: 0;
    background: rgb(26 35 50 / 45%);
    z-index: 60;
  }
  .ssa-sheet {
    position: fixed;
    z-index: 61;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: min(34rem, calc(100vw - 2rem));
    max-height: 80vh;
    overflow: auto;
    background: #fff;
    border-radius: 0.9rem;
    box-shadow: 0 24px 60px rgb(26 35 50 / 25%);
    padding: 1rem 1.1rem 1.2rem;
  }
  .ssa-sheet-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .ssa-sheet-head h3 {
    font-size: 1.05rem;
    margin: 0;
    font-family: var(--aw-font-heading, 'Fraunces Variable', Fraunces, Georgia, serif);
  }
  .ssa-x {
    border: 0;
    background: transparent;
    font-size: 1.1rem;
    cursor: pointer;
    color: rgb(26 35 50 / 55%);
    padding: 0.2rem 0.4rem;
  }
  .ssa-x:focus-visible {
    outline: 2px solid var(--green);
  }
  .ssa-tip {
    font-size: 0.82rem;
    color: rgb(26 35 50 / 70%);
    background: var(--ivory);
    border-radius: 0.5rem;
    padding: 0.5rem 0.7rem;
    margin: 0 0 0.6rem;
  }
  .ssa-cands {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .ssa-cand {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-areas: 'main act' 'reason act';
    gap: 0.1rem 0.5rem;
    align-items: center;
    border: 1px solid var(--line);
    border-left: 3px solid var(--line);
    border-radius: 0.5rem;
    padding: 0.5rem 0.6rem;
  }
  .ssa-cand.elig {
    border-left-color: #16a34a;
  }
  .ssa-cand.inelig {
    border-left-color: var(--red);
    background: color-mix(in srgb, var(--red) 3%, #fff);
    opacity: 0.92;
  }
  .ssa-cand.hl {
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--amber) 60%, transparent);
  }
  .ssa-cand-main {
    grid-area: main;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .ssa-cand-icon {
    font-weight: 700;
  }
  .ssa-cand.elig .ssa-cand-icon {
    color: #16a34a;
  }
  .ssa-cand.inelig .ssa-cand-icon {
    color: var(--red);
  }
  .ssa-cand-name {
    font-weight: 600;
    font-size: 0.9rem;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
  }
  .ssa-cand-reason {
    grid-area: reason;
    font-size: 0.78rem;
    padding-left: 1.4rem;
  }
  .ssa-ok-reason {
    color: rgb(26 35 50 / 65%);
  }
  .ssa-bad-reason {
    display: block;
    color: var(--red);
  }
  .ssa-bad-reason + .ssa-bad-reason {
    margin-top: 0.15rem;
  }
  .ssa-muted {
    color: rgb(26 35 50 / 45%);
  }
  .ssa-cand-act {
    grid-area: act;
  }

  .ssa-toast {
    position: fixed;
    left: 50%;
    bottom: 1.25rem;
    transform: translateX(-50%);
    z-index: 70;
    background: #1a2332;
    color: #fff;
    padding: 0.65rem 1rem;
    border-radius: 0.6rem;
    font-size: 0.85rem;
    max-width: calc(100vw - 2rem);
    box-shadow: 0 12px 30px rgb(26 35 50 / 30%);
  }

  /* ── Mobile: stack the week into day cards ─────────────────────────────── */
  @media (max-width: 640px) {
    .ssa-col-head {
      display: none;
    }
    .ssa-roster {
      grid-template-columns: 1fr;
    }
    /* Roster row: keep name/bar/hours on the top line and drop badges to their own
       wrapping line, so wide badges (PRN · weekends, on leave …) can't push the
       widget past the viewport and clip the page. */
    .ssa-rrow {
      grid-template-columns: 1fr 2.5rem auto;
      grid-template-areas:
        'name bar hours'
        'badges badges badges';
      gap: 0.25rem 0.4rem;
    }
    .ssa-rname {
      grid-area: name;
      min-width: 0;
    }
    .ssa-rbadges {
      grid-area: badges;
    }
    .ssa-rbar {
      grid-area: bar;
    }
    .ssa-rhours {
      grid-area: hours;
      text-align: right;
    }
    .ssa-day-row {
      grid-template-columns: 1fr;
    }
    .ssa-day-label {
      flex-direction: row;
      gap: 0.4rem;
      align-items: baseline;
      border-right: 0;
      border-bottom: 1px solid var(--line);
    }
    .ssa-cell {
      border-right: 0;
      border-bottom: 1px solid var(--line);
    }
    .ssa-cell-shift {
      display: block;
    }
    .ssa-sheet {
      top: auto;
      bottom: 0;
      left: 0;
      transform: none;
      width: 100vw;
      max-height: 85vh;
      border-radius: 0.9rem 0.9rem 0 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ssa-btn,
    .ssa-cell,
    .ssa-checklist li {
      transition: none;
    }
  }
</style>
