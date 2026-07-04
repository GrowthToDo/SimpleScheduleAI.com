/**
 * SimpleScheduleAI — interactive demo scheduling engine.
 *
 * Pure, dependency-free, deterministic. No DOM, no network, no randomness beyond
 * a fixed seed. Role-aware: every shift is staffed with the right SKILL MIX —
 * a charge nurse, registered nurses, and support aides (LPN/CNA) — mirroring how
 * a real Critical Access Hospital actually staffs a unit (see README for the
 * mapping to the production rules + intentional simplifications).
 */

// ───────────────────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────────────────

export type Level = 1 | 2 | 3 | 4 | 5;
export type ShiftType = 'day' | 'night';
/** 0 = Monday … 6 = Sunday */
export type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type Employment = 'full-time' | 'PRN';
export type Role = 'RN' | 'LPN' | 'CNA';
/** The kind of seat on a shift: a charge nurse, a staff RN, or a support aide. */
export type SlotKind = 'charge' | 'rn' | 'support';

export interface Nurse {
  id: string;
  name: string;
  role: Role;
  /** clinical competency 1–5. Drives RN rules (charge ≥ 4, ICU ≥ 2). Nominal for LPN/CNA. */
  level: Level;
  /** charge-qualified RNs only — the sole staff who may cover the charge seat */
  chargeQualified: boolean;
  employment: Employment;
  /** approved-leave day indices (never scheduled on these) */
  leaveDays?: DayIndex[];
  /** for PRN staff: the only day indices they are available */
  prnAvailableDays?: DayIndex[];
}

export interface ShiftDef {
  day: DayIndex;
  type: ShiftType;
  /** charge-qualified RN seats (≥1) */
  charge: number;
  /** additional staff-RN seats */
  rn: number;
  /** support aide (LPN/CNA) seats */
  support: number;
  /** total headcount = charge + rn + support */
  required: number;
}

export interface Assignment {
  nurseId: string;
  day: DayIndex;
  type: ShiftType;
}

export type Schedule = Assignment[];

export type RuleId =
  | 'rest10h'
  | 'maxConsecutive5'
  | 'maxHours60'
  | 'noOverlap'
  | 'chargeCoverage'
  | 'rnCoverage'
  | 'supportCoverage'
  | 'icuCompetency'
  | 'approvedLeave'
  | 'prnAvailability';

export interface Violation {
  rule: RuleId;
  nurseId?: string;
  day?: DayIndex;
  type?: ShiftType;
  /** plain-English, visitor-facing explanation */
  message: string;
}

export interface Candidate {
  nurse: Nurse;
  /** true = may be added to the slot with zero hard-rule / role violations */
  eligible: boolean;
  /** already assigned to this exact slot */
  already: boolean;
  /** hard-rule + role-fit violations that adding this nurse would cause (empty if eligible) */
  violations: Violation[];
  /** positive, plain-English reasons shown for eligible candidates */
  reasons: string[];
  /** soft-preference score; higher ranks first among eligible candidates */
  score: number;
}

export interface Dataset {
  nurses: Nurse[];
  shifts: ShiftDef[];
}

// ───────────────────────────────────────────────────────────────────────────
// Fixed, fictional dataset (identical every load) — "Demo data, not a real hospital"
// ───────────────────────────────────────────────────────────────────────────

export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
export const SHIFT_HOURS = 12;
export const SEED = 20260614;

const chargeable = (level: Level): boolean => level >= 4;

function rnStaff(
  id: string,
  name: string,
  level: Level,
  employment: Employment = 'full-time',
  extra: Partial<Nurse> = {}
): Nurse {
  return { id, name, role: 'RN', level, chargeQualified: chargeable(level), employment, ...extra };
}
function support(id: string, name: string, role: 'LPN' | 'CNA'): Nurse {
  // Support aides have a nominal competency level; their rules are role-based, not level-based.
  return { id, name, role, level: role === 'LPN' ? 3 : 2, chargeQualified: false, employment: 'full-time' };
}

export const NURSES: Nurse[] = [
  // Registered nurses (12) — 4 charge-qualified, the rest staff RNs
  rnStaff('n1', 'Alicia Reyes', 5),
  rnStaff('n2', 'Grace Okoro', 5),
  rnStaff('n3', 'James Carter', 4),
  rnStaff('n4', 'Maria Santos', 4),
  rnStaff('n5', 'Sarah Mills', 3),
  rnStaff('n6', 'Tom Becker', 3),
  rnStaff('n7', 'Priya Nair', 3),
  rnStaff('n8', 'Sofia Lin', 3),
  rnStaff('n9', 'Hannah Cole', 2),
  rnStaff('n10', 'Marcus Webb', 2),
  rnStaff('n11', 'Olivia Park', 3, 'PRN', { prnAvailableDays: [5, 6] }), // PRN: weekends only
  rnStaff('n12', 'Ethan Ross', 3, 'full-time', { leaveDays: [2, 3] }), // on approved leave Wed–Thu
  // Licensed practical nurses (2)
  support('l1', 'Dana Cruz', 'LPN'),
  support('l2', 'Rosa Mehta', 'LPN'),
  // Certified nursing assistants (3)
  support('c1', 'Kevin Boyd', 'CNA'),
  support('c2', 'Tina Alvarez', 'CNA'),
  support('c3', 'Luis Romero', 'CNA'),
];

/**
 * Day = 1 charge RN + 2 staff RNs + 1 support aide (4).
 * Night = 1 charge RN + 1 staff RN + 1 support aide (3).
 * Every shift carries a real skill mix — a charge nurse, registered nurses, and an
 * aide — never RN-only. The RN-heavy ratio mirrors a small-ICU and spreads the
 * work so no one sits idle.
 */
function mkShift(day: DayIndex, type: ShiftType, charge: number, rn: number, supp: number): ShiftDef {
  return { day, type, charge, rn, support: supp, required: charge + rn + supp };
}
export const SHIFTS: ShiftDef[] = ([0, 1, 2, 3, 4, 5, 6] as DayIndex[]).flatMap((day) => [
  mkShift(day, 'day', 1, 2, 1),
  mkShift(day, 'night', 1, 1, 1),
]);

export const DATASET: Dataset = { nurses: NURSES, shifts: SHIFTS };

/** Display credential — the staff role. CAHs use RN / LPN / CNA, not a clinical ladder. */
export function designation(nurse: Nurse): string {
  return nurse.role;
}

// ───────────────────────────────────────────────────────────────────────────
// Time helpers (absolute hours from Monday 00:00) — exported for testing
// ───────────────────────────────────────────────────────────────────────────

/** Absolute [start, end) hours from Monday 00:00 for a given shift. */
export function shiftWindow(day: DayIndex, type: ShiftType): { start: number; end: number } {
  const base = day * 24;
  return type === 'day' ? { start: base + 7, end: base + 19 } : { start: base + 19, end: base + 31 };
}

function overlaps(a: { start: number; end: number }, b: { start: number; end: number }): boolean {
  return a.start < b.end && b.start < a.end;
}

/** Rest hours between two shifts. Returns -1 if they overlap. Touching shifts = 0h. */
export function restGapHours(a: Assignment, b: Assignment): number {
  const wa = shiftWindow(a.day, a.type);
  const wb = shiftWindow(b.day, b.type);
  if (overlaps(wa, wb)) return -1;
  return wa.end <= wb.start ? wb.start - wa.end : wa.start - wb.end;
}

/** Longest run of consecutive integers (calendar days) in the list. */
export function longestConsecutiveRun(days: number[]): number {
  const uniq = [...new Set(days)].sort((x, y) => x - y);
  let best = 0;
  let run = 0;
  let prev = Number.NaN;
  for (const d of uniq) {
    run = d === prev + 1 ? run + 1 : 1;
    prev = d;
    if (run > best) best = run;
  }
  return best;
}

export function nurseHoursInWeek(schedule: Schedule, nurseId: string): number {
  return schedule.filter((a) => a.nurseId === nurseId).length * SHIFT_HOURS;
}

/** Max hours in any 7-consecutive-day window containing `pivotDay`. */
function maxRolling7Hours(workedDays: number[], pivotDay: number): number {
  let max = 0;
  for (let start = pivotDay - 6; start <= pivotDay; start++) {
    const count = workedDays.filter((d) => d >= start && d <= start + 6).length;
    max = Math.max(max, count * SHIFT_HOURS);
  }
  return max;
}

// ───────────────────────────────────────────────────────────────────────────
// Roles — who may fill which kind of seat
// ───────────────────────────────────────────────────────────────────────────

/** True if `nurse` may occupy a `kind` seat. RN can take charge (if qualified) or rn; aides take support. */
export function roleFits(nurse: Nurse, kind: SlotKind): boolean {
  if (kind === 'charge') return nurse.role === 'RN' && nurse.chargeQualified;
  if (kind === 'rn') return nurse.role === 'RN';
  return nurse.role === 'LPN' || nurse.role === 'CNA';
}

/** The plain-English "wrong seat" reason, or null if the role fits. */
function roleFitViolation(nurse: Nurse, kind: SlotKind, day: DayIndex, type: ShiftType): Violation | null {
  if (roleFits(nurse, kind)) return null;
  const at = { nurseId: nurse.id, day, type };
  if (kind === 'charge') {
    const message =
      nurse.role !== 'RN'
        ? `${nurse.name} is a ${nurse.role} — the charge nurse must be an RN.`
        : `${nurse.name} isn't charge-qualified — the charge seat needs a charge-qualified RN.`;
    return { rule: 'chargeCoverage', ...at, message };
  }
  if (kind === 'rn') {
    return {
      rule: 'rnCoverage',
      ...at,
      message: `${nurse.name} is a ${nurse.role} — this is a registered-nurse seat.`,
    };
  }
  return {
    rule: 'supportCoverage',
    ...at,
    message: `${nurse.name} is an RN — this seat is for a support aide (LPN/CNA).`,
  };
}

/** Count who currently fills each role-category on a given shift. */
function countOnShift(
  schedule: Schedule,
  day: DayIndex,
  type: ShiftType,
  ds: Dataset
): { charge: number; rn: number; support: number; total: number } {
  const here = schedule.filter((a) => a.day === day && a.type === type);
  let charge = 0;
  let rn = 0;
  let supp = 0;
  for (const a of here) {
    const n = ds.nurses.find((nn) => nn.id === a.nurseId);
    if (!n) continue;
    if (n.role === 'RN') {
      rn += 1;
      if (n.chargeQualified) charge += 1;
    } else {
      supp += 1;
    }
  }
  return { charge, rn, support: supp, total: here.length };
}

/** The next unfilled seat kind on a shift (charge → rn → support), or null when fully staffed. */
export function neededSlotKind(schedule: Schedule, def: ShiftDef, ds: Dataset = DATASET): SlotKind | null {
  const c = countOnShift(schedule, def.day, def.type, ds);
  if (c.charge < def.charge) return 'charge';
  if (c.rn < def.charge + def.rn) return 'rn';
  if (c.support < def.support) return 'support';
  return null;
}

// ───────────────────────────────────────────────────────────────────────────
// Hard rules — placement-level (one nurse onto one slot, given the rest)
// ───────────────────────────────────────────────────────────────────────────

/**
 * Every hard-rule (safety) violation that adding `cand` to `schedule` would cause.
 * Role fit is checked separately (by eligibleCandidates) since it depends on which
 * SEAT is being filled; these rules apply to the person regardless of seat. Empty
 * array = the move breaks no safety rule.
 */
export function placementViolations(schedule: Schedule, cand: Assignment, ds: Dataset = DATASET): Violation[] {
  const v: Violation[] = [];
  const nurse = ds.nurses.find((n) => n.id === cand.nurseId);
  if (!nurse) return v;
  const name = nurse.name;
  const dayName = DAY_NAMES[cand.day];
  const at = { nurseId: nurse.id, day: cand.day, type: cand.type };

  // ICU competency — RNs assigned to the unit must be Level ≥ 2. (Aides are governed by role, not level.)
  if (nurse.role === 'RN' && nurse.level < 2) {
    v.push({
      rule: 'icuCompetency',
      ...at,
      message: `${name} isn't checked off for ICU yet — ICU shifts need an ICU-competent RN.`,
    });
  }
  // Approved leave — never scheduled during it.
  if (nurse.leaveDays?.includes(cand.day)) {
    v.push({ rule: 'approvedLeave', ...at, message: `${name} is on approved leave ${dayName}.` });
  }
  // PRN — only on the dates they marked available.
  if (nurse.employment === 'PRN' && !(nurse.prnAvailableDays ?? []).includes(cand.day)) {
    v.push({ rule: 'prnAvailability', ...at, message: `${name} is per-diem (PRN) and isn't available ${dayName}.` });
  }

  // Rest (≥10h) and no-overlap, versus this nurse's other shifts.
  const others = schedule.filter((a) => a.nurseId === cand.nurseId);
  let overlapFlagged = false;
  let restFlagged = false;
  for (const o of others) {
    const gap = restGapHours(o, cand);
    if (gap < 0 && !overlapFlagged) {
      v.push({ rule: 'noOverlap', ...at, message: `${name} is already on another shift at that time.` });
      overlapFlagged = true;
    } else if (gap >= 0 && gap < 10 && !restFlagged) {
      v.push({
        rule: 'rest10h',
        ...at,
        message: `${name} would get only ${gap}h rest between shifts — under the 10-hour minimum.`,
      });
      restFlagged = true;
    }
  }

  // ≤5 consecutive working days.
  const workedDays = [...others.map((o) => o.day), cand.day];
  const run = longestConsecutiveRun(workedDays);
  if (run > 5) {
    v.push({
      rule: 'maxConsecutive5',
      ...at,
      message: `${name} would be on their ${run}th day in a row — that breaks the 5-day-in-a-row limit.`,
    });
  }

  // ≤60h in any rolling 7-day window.
  const hours = maxRolling7Hours(workedDays, cand.day);
  if (hours > 60) {
    v.push({ rule: 'maxHours60', ...at, message: `${name} would reach ${hours}h this week — over the 60-hour limit.` });
  }

  return v;
}

// ───────────────────────────────────────────────────────────────────────────
// Whole-schedule validation (placement rules per assignment + skill-mix coverage)
// ───────────────────────────────────────────────────────────────────────────

export function checkSchedule(schedule: Schedule, ds: Dataset = DATASET): Violation[] {
  const out: Violation[] = [];

  for (const asg of schedule) {
    const rest = schedule.filter((x) => x !== asg);
    out.push(...placementViolations(rest, asg, ds));
  }

  for (const shift of ds.shifts) {
    const c = countOnShift(schedule, shift.day, shift.type, ds);
    const where = `${DAY_NAMES[shift.day]} ${shift.type} shift`;
    if (c.charge < shift.charge) {
      out.push({
        rule: 'chargeCoverage',
        day: shift.day,
        type: shift.type,
        message: `${where} has no charge nurse — every shift needs a charge-qualified RN.`,
      });
    }
    if (c.rn < shift.charge + shift.rn) {
      out.push({
        rule: 'rnCoverage',
        day: shift.day,
        type: shift.type,
        message: `${where} is short ${shift.charge + shift.rn - c.rn} registered nurse(s).`,
      });
    }
    if (c.support < shift.support) {
      out.push({
        rule: 'supportCoverage',
        day: shift.day,
        type: shift.type,
        message: `${where} needs a support aide (LPN/CNA).`,
      });
    }
  }

  return out;
}

// ───────────────────────────────────────────────────────────────────────────
// Soft preferences (ranking only — never block) + deterministic jitter
// ───────────────────────────────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Stable per-(seed, nurse) jitter in [0,1) — keeps the schedule deterministic but not alphabetical. */
function jitterFor(nurseId: string, seed: number): number {
  return mulberry32((seed ^ hashStr(nurseId)) >>> 0)();
}

const isWeekendDay = (d: number): boolean => d === 5 || d === 6;

/** Higher = better fit. Encodes the soft preferences; eligibility is decided separately by the hard rules. */
function scoreFor(nurse: Nurse, schedule: Schedule, slot: { day: DayIndex; type: ShiftType }, seed: number): number {
  const hours = nurseHoursInWeek(schedule, nurse.id);
  let s = 1000 - hours * 5; // keep staff roughly even (≈36–48h), spread the load
  const worksDay = (d: number) => schedule.some((a) => a.nurseId === nurse.id && a.day === d);
  if (worksDay(slot.day - 1) || worksDay(slot.day + 1)) s -= 8; // avoid clustering consecutive days
  if (isWeekendDay(slot.day) && schedule.some((a) => a.nurseId === nurse.id && isWeekendDay(a.day))) s -= 15; // weekend fairness
  s += jitterFor(nurse.id, seed) * 4;
  return s;
}

function positiveReasons(nurse: Nurse, schedule: Schedule, slot: { day: DayIndex; type: ShiftType }): string[] {
  const hours = nurseHoursInWeek(schedule, nurse.id);
  const reasons: string[] = [nurse.role];
  if (nurse.chargeQualified) reasons.push('charge-qualified');
  reasons.push(`${hours}h so far this week`);
  const others = schedule.filter((a) => a.nurseId === nurse.id);
  if (others.length) {
    const gaps = others
      .map((o) => restGapHours(o, { nurseId: nurse.id, day: slot.day, type: slot.type }))
      .filter((g) => g >= 0);
    if (gaps.length) reasons.push(`${Math.min(...gaps)}h rest ✓`);
  }
  return reasons;
}

// ───────────────────────────────────────────────────────────────────────────
// The picker: who can fill THIS kind of seat on this shift, who can't, and why
// ───────────────────────────────────────────────────────────────────────────

export function eligibleCandidates(
  schedule: Schedule,
  slot: { day: DayIndex; type: ShiftType },
  kind: SlotKind,
  ds: Dataset = DATASET,
  seed: number = SEED
): Candidate[] {
  const onShift = new Set(schedule.filter((a) => a.day === slot.day && a.type === slot.type).map((a) => a.nurseId));
  const list: Candidate[] = ds.nurses.map((nurse) => {
    const already = onShift.has(nurse.id);
    const cand: Assignment = { nurseId: nurse.id, day: slot.day, type: slot.type };
    let violations: Violation[] = [];
    if (!already) {
      // Role fit shows first (it's the seat-specific reason), then any safety conflicts.
      const rf = roleFitViolation(nurse, kind, slot.day, slot.type);
      violations = [...(rf ? [rf] : []), ...placementViolations(schedule, cand, ds)];
    }
    const eligible = !already && violations.length === 0;
    return {
      nurse,
      eligible,
      already,
      violations,
      reasons: eligible ? positiveReasons(nurse, schedule, slot) : [],
      score: scoreFor(nurse, schedule, slot, seed),
    };
  });
  list.sort((x, y) => {
    if (x.eligible !== y.eligible) return x.eligible ? -1 : 1;
    if (y.score !== x.score) return y.score - x.score;
    return x.nurse.id < y.nurse.id ? -1 : 1;
  });
  return list;
}

// ───────────────────────────────────────────────────────────────────────────
// Deterministic schedule generation — fills the skill mix, never a hard violation
// ───────────────────────────────────────────────────────────────────────────

export function generateSchedule(seed: number = SEED, ds: Dataset = DATASET): Schedule {
  const schedule: Schedule = [];
  const onShift = (day: DayIndex, type: ShiftType) =>
    new Set(schedule.filter((a) => a.day === day && a.type === type).map((a) => a.nurseId));

  for (const shift of ds.shifts) {
    // Fill in skill-mix priority: charge (scarcest) → staff RN → support aide.
    const kinds: SlotKind[] = ['charge', 'rn', 'support'];
    for (const kind of kinds) {
      const target = kind === 'charge' ? shift.charge : kind === 'rn' ? shift.charge + shift.rn : shift.support;
      for (;;) {
        const c = countOnShift(schedule, shift.day, shift.type, ds);
        const have = kind === 'charge' ? c.charge : kind === 'rn' ? c.rn : c.support;
        if (have >= target) break;
        const here = onShift(shift.day, shift.type);
        let cands = eligibleCandidates(schedule, shift, kind, ds, seed).filter(
          (cd) => cd.eligible && !here.has(cd.nurse.id)
        );
        if (kind === 'rn') {
          // Prefer non-charge RNs for staff seats to preserve scarce charge capacity.
          cands = cands.sort((x, y) => {
            const cx = x.nurse.chargeQualified ? 1 : 0;
            const cy = y.nurse.chargeQualified ? 1 : 0;
            if (cx !== cy) return cx - cy;
            if (y.score !== x.score) return y.score - x.score;
            return x.nurse.id < y.nurse.id ? -1 : 1;
          });
        }
        if (cands.length === 0) break; // infeasible; checkSchedule would surface it
        schedule.push({ nurseId: cands[0]!.nurse.id, day: shift.day, type: shift.type });
      }
    }
  }

  return schedule;
}
