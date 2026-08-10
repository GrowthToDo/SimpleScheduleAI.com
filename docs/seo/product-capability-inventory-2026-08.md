# Product Capability Inventory — SimpleScheduleAI scheduler app

**Source of truth for what the product actually does.** Built by reading the application source, not the marketing site, not the product README, and not the founder's memory.

---

## 1. How to read this doc

**Repo inspected:** `SimpleScheduleAI-com/cah-scheduler` (GitHub redirects to `SimpleScheduleAIApp/cah-scheduler`; public).
**Commit SHA:** `4ca898cc0e7af654ef33c6086bacf09c75e7676b`
**Commit date:** 2026-07-25 21:49 +0530 (`fix(ui): sidebar version reads from package.json`)
**App version at that commit:** `1.7.26` (`package.json`)
**Inspected on:** 2026-08-09/10, from a read-only clone outside the marketing repo. Nothing was modified or committed in either repo.

**Stack (from `package.json`, `docs/ARCHITECTURE.md`):** Next.js 16 App Router, React 19, TypeScript, Drizzle ORM over **SQLite via better-sqlite3** (single file, no DB server), Radix UI + Tailwind, `xlsx` for Excel, Vitest for tests. Deployed on Railway with the SQLite file on a persistent volume.

### Status vocabulary

| Mark | Meaning |
| --- | --- |
| **SHIPPED** | Wired end to end — UI action → API route → DB mutation. Safe to claim. |
| **PARTIAL** | Real but incomplete: data model exists and is stored/configurable, but a workflow, UI control, or computation is missing. Claim only with the qualifier stated on the line. |
| **STUB** | Explicitly "Coming Soon", mock data, or a field with no consumer. **Do not claim.** |

### Rules for using this doc

1. Every capability line cites a file path. If a claim you want to make is not on a line here, it is not verified — do not publish it.
2. A route name is not evidence. Nothing in this doc was inferred from a URL alone.
3. Where the code could not settle a question (is this on for customers? is this stub on the roadmap?), it went to **§7 Open Questions**, not into a capability line.
4. `docs/` inside the app repo (`FEATURES.md`, `RULES_SPECIFICATION.md`, `README.md`) are the *team's* descriptions, not verification. Where they disagree with code, code wins. Two known drifts: `README.md` says "Vitest (202 tests)" — the actual count is **592 `it()` cases across 49 test files**; and `RULES_SPECIFICATION.md` §11.5 claims an "Export Data to Excel" button on `/setup` that **does not exist** (see §6).

---

## 1b. MODE APPLICABILITY (founder ruling 2026-08-10) — READ BEFORE CLAIMING ANYTHING

The repo is one codebase serving two commercial modes. **A capability existing in
code does not make it claimable in service copy.** Classify before you write.

- **SERVICE mode** (what we sell today, flat $1,000 to $1,500/month): the AI
  builds the schedule, our scheduling team checks it, the hospital's nurse
  manager approves. The hospital's NURSES never touch software. Anything whose
  value depends on a nurse logging in does not exist for a service customer.
- **PRODUCT mode** (the unlisted `/product` page, $10/user/month): the hospital
  operates the software itself and nurses do log in.

| Area | Mode | How to claim it |
| --- | --- | --- |
| Scheduling engine: three drafts, hard constraints, boundary-aware rest and weekend carryover, reproducible seeded runs, understaffed-with-reasons | BOTH | Service copy claims the OUTPUT ("the schedule you approve already respects..."), not the console |
| Callout ranking and coverage requests, charge-gap warning, escalation record | BOTH | Service: "when a nurse calls out you get a ranked shortlist". Do not describe buttons |
| PRN availability as a HARD constraint in generation | BOTH | Strong service claim: a per-diem nurse is never scheduled on a date they did not offer |
| Manager records PRN availability on behalf of a nurse; missing-submission flag | BOTH | Service: our team keeps it current from what the hospital tells us. Product: the manager clicks |
| Excel roster import, roster export, schedule export, audit CSV | BOTH | Service-critical: onboarding path in, and no data lock-in out |
| Rules configuration (22 evaluators, weights, per-unit quotas) | BOTH | Service: "configured with you at onboarding". Product: "you edit them in the UI" |
| Census and acuity tiers driving required staff | BOTH | Engine behaviour, claimable either way |
| **Nurse portal (`/my`): nurse-reported callouts, leave requests, swap proposals, nurse-submitted PRN availability, in-app notifications** | **PRODUCT ONLY** | NEVER in service copy. Service mode has no nurse login; this is the exact mistake the founder flagged |
| **Practice mode and the S0-S7 onboarding guide** | **PRODUCT ONLY** | Teaches a customer to operate the app. In service mode nobody needs to learn it |
| **Analytics dashboards and operational counters** | PRODUCT-LEANING | They assume someone logs in to look. In service mode, claim the reporting we deliver, not the dashboard |
| **Login, roles, session security** | PRODUCT ONLY | A service customer has no account to secure. Never a service selling point |

Two consequences worth stating plainly. First, a service claim describes what
ARRIVES (a compliant schedule, a ranked shortlist, an audit trail) and never who
clicked what. Second, when a capability is product-only, the honest service line
is often the inverse: not "your nurses can swap shifts in the app" but "your
nurses never have to learn a new app."

### The service-mode operating truth (founder, 2026-08-10)

> "In service mode our whole idea is they will not get to do anything. If they
> want to log in to approve, we can do that, but the whole idea behind service
> is we do everything and you tell us what to do. Approval will be through mail
> or whatever channel we decide."

So in service copy, the hospital logs into nothing by default, including the
manager. Approval is a DECISION the manager makes, communicated over email or an
agreed channel, not a button they press. Keep writing "the nurse manager
approves before anything posts" — that stays true — but never write or imply
"approves in the app", "logs in to review", or "from the dashboard" about a
service customer. A live-copy scan on 2026-08-10 found no violations: every
"log in" on the site refers to a competitor's product or explicitly contrasts us
("hospital staff never have to log into a new tool").

### Founder rulings on the load-bearing open questions (2026-08-10)

The inventory's section 7 lists 14 open questions. These five were the ones that
gate content; the rest are lower-stakes and get asked when a specific post needs
them.

1. **Who approves, and where?** Nobody at the hospital operates anything. Approval
   travels by email or an agreed channel. See the operating truth above.
2. **`AUTH_ENABLED` / login security.** A product-mode concern only. Service
   customers have no accounts, so it is irrelevant to service copy and to today's
   risk. At product launch the product runs in a separate environment with real
   customer data, and auth-on is a launch requirement there.
3. **Safe Harbor: DO NOT MENTION.** We have nothing specific to it. The fields and
   audit action found in code are not a capability. What we do have is per-nurse
   visibility of violations and overtime across a period, so a manager can see a
   nurse being leaned on and decide not to overuse her. Claim that as visibility
   supporting a human decision, never as a protection or a legal safeguard.
4. **Hourly rates: not planned.** All cost claims stay in hours.
5. **Multi-specialty:** wanted for the live demo, but the demo runs one department
   (ICU) today. Do not present multi-unit scheduling as demo-able yet.

### A code STUB or PARTIAL does not mean service-unavailable

This is the correction that makes the rest of the doc safe to use. The status
column describes the SOFTWARE. In service mode our team is part of the system,
so a missing button is not a missing capability.

- **SERVICE mode:** a capability is claimable if the software does it **or** our
  team does it manually as part of the service and the founder confirms we
  actually will. Example: low-census release has config and suggestions in code
  but no execution workflow, yet the founder confirms we do change the census
  band and release excess staff. That is a real service capability.
- **PRODUCT mode:** only what the software does unassisted is claimable. The
  same low-census example is NOT a product claim until the workflow ships.

When you use a PARTIAL or STUB line for service copy, say what the SERVICE
delivers, never what the screen shows, and get founder confirmation that the
manual step is genuinely part of the operating routine.

## 2. Route map

### 2a. Pages (24)

There are exactly **two roles** in the system: `manager` and `nurse` (`src/lib/auth/roles.ts`: `export type Role = "manager" | "nurse"`). There is **no separate admin/CNO role** in code. "Admin-side" below means the manager surface.

| Path | Audience | What the screen does | File |
| --- | --- | --- | --- |
| `/` | manager | Redirect to `/dashboard`. Nothing else. | `src/app/page.tsx` |
| `/login` | public | Email + password sign-in; routes managers to `/`, nurses to `/my`. | `src/app/login/page.tsx` |
| `/dashboard` | manager | Getting-started checklist, "Needs Attention" queue, fill-rate/staff/understaffed/callout stat cards, recent audit activity. | `src/app/dashboard/page.tsx` |
| `/schedule` | manager | List of schedule periods; create a new period (name, dates, unit). | `src/app/schedule/page.tsx` |
| `/schedule/[id]` | manager | The schedule grid: day/night cells, assigned nurses, charge + OT markers, violation summary, publish/unpublish, Excel export, per-shift assignment editing. | `src/app/schedule/[id]/page.tsx` |
| `/scenarios` | manager | Runs the 3-variant generation job with live progress, then compares Balanced / Fairness-Optimized / Cost-Optimized on 5 scores; apply or reject a variant. | `src/app/scenarios/page.tsx` |
| `/staff` | manager | Roster table; add/edit staff (role, employment type, FTE, competency level, cross-training, charge qualification, weekend exemption, VTO flag); per-nurse detail with preferences and calendar. | `src/app/staff/page.tsx` |
| `/availability` | manager | PRN (per-diem) availability: who submitted, which dates, **and who has not** ("Missing Submissions"); record availability on behalf of a PRN nurse. | `src/app/availability/page.tsx` |
| `/callouts` | manager | Log a callout, then work a ranked replacement list; callout history with escalation steps taken. | `src/app/callouts/page.tsx` |
| `/open-shifts` | manager | Titled "Coverage Requests" in the UI. Review auto-generated top-3 coverage candidates for a vacated shift and approve one, or cancel/waive coverage. | `src/app/open-shifts/page.tsx` |
| `/leave` | manager | Approve/deny leave (denial reason mandatory), or file leave on behalf of a nurse. | `src/app/leave/page.tsx` |
| `/swaps` | manager | Approve/deny nurse swap requests after an automatic rule validation; log a swap on behalf of staff. | `src/app/swaps/page.tsx` |
| `/census` | manager | Set a per-shift census/acuity tier (Blue/Green/Yellow/Red) by date; view read-only census band thresholds. | `src/app/census/page.tsx` |
| `/rules` | manager | View all scheduling rules; edit selected hard-rule parameters; enable/disable rules; set soft-rule weights; edit census bands. | `src/app/rules/page.tsx` |
| `/settings/units` | manager | Per-unit configuration: weekend/holiday quotas, schedule period length, on-call limits, OT approval threshold, minimum staffing floor. | `src/app/settings/units/page.tsx` |
| `/settings/holidays` | manager | Manage public holidays per year; one-click add of 10 standard US holidays. | `src/app/settings/holidays/page.tsx` |
| `/setup` | manager | 3-step Excel import wizard (download template → upload → review → import). Import **wipes all existing data**. | `src/app/setup/page.tsx` |
| `/audit` | manager | Filterable audit trail (entity, action, date range) with CSV export. | `src/app/audit/page.tsx` |
| `/analytics` | manager | Fill rate trend, overtime by staff, callout frequency, weekend distribution, holiday balance, staff workload, compliance overview. Read-only. | `src/app/analytics/page.tsx` |
| **`/my`** | **nurse** | Nurse home: upcoming shifts, month calendar, report a callout. | `src/app/my/page.tsx` |
| **`/my/availability`** | **nurse (per-diem only)** | PRN nurse submits their own available dates. Non-per-diem nurses see an explanatory message instead of the form. | `src/app/my/availability/page.tsx` |
| **`/my/leave`** | **nurse** | Submit a leave request and see its status. | `src/app/my/leave/page.tsx` |
| **`/my/swaps`** | **nurse** | Propose a swap, and accept/decline a swap someone proposed to them. Manager approval still required. | `src/app/my/swaps/page.tsx` |
| **`/my/notifications`** | **nurse** | In-app notification list; opening the page marks all read. | `src/app/my/notifications/page.tsx` |

**Nurse portal is a separate surface, not a responsive manager UI.** `src/app/my/layout.tsx` caps the whole section at `max-w-md` with a bottom tab bar — mobile-first by construction (`docs/ARCHITECTURE.md`, "Nurse portal"). `src/components/layout/app-shell.tsx` suppresses the manager sidebar for `/login*` and `/my*`.

**Nurse page access is default-deny.** `src/lib/auth/roles.ts` → `nursePageAllowed()` permits only `/login*` and `/my*`; every other page redirects a nurse to `/my`.

### 2b. API routes (50)

All under `src/app/api/**/route.ts`. Grouped by area; every one has a real handler.

| Area | Routes |
| --- | --- |
| Auth | `auth/login`, `auth/logout`, `auth/me` |
| Roster & config | `staff`, `staff/[id]`, `staff/[id]/schedule`, `staff-preferences/[staffId]`, `units`, `units/[id]`, `holidays`, `holidays/[id]`, `rules`, `rules/[id]`, `shift-definitions`, `shift-definitions/[id]`, `census-bands` |
| Scheduling | `schedules`, `schedules/[id]`, `schedules/[id]/assignments`, `schedules/[id]/export`, `scenarios`, `scenarios/[id]`, `scenarios/generate`, `scenarios/generate/status`, `assignments`, `shifts/[id]/acuity`, `shifts/[id]/eligible-staff`, `evaluate` |
| Daily ops | `callouts`, `callouts/[id]`, `open-shifts`, `open-shifts/[id]`, `staff-leave`, `staff-leave/[id]`, `swap-requests`, `swap-requests/[id]`, `swap-requests/[id]/validate`, `prn-availability`, `prn-availability/[id]`, `census` |
| Reporting | `dashboard`, `analytics`, `audit`, `notifications` |
| Nurse-scoped | `my/notifications`, `my/swap-options` |
| Import / demo | `import`, `demo/reset`, `demo/status`, `practice-examples` |

Nurse API access is an explicit ordered allow-list in `src/lib/auth/roles.ts` (`NURSE_RULES`); everything not listed is denied. Nurses may reach: `/api/auth/*`, all of `/api/my/*`, `GET /api/staff/[id]/schedule` (own only), `GET+POST /api/staff-leave`, `POST /api/callouts`, `GET+POST /api/swap-requests`, `PUT /api/swap-requests/[id]`, `GET+POST /api/prn-availability`, `GET /api/schedules` and `GET /api/schedules/[id]`.

---

## 3. Capability list by area

### 3.1 Scheduling engine

| Status | Capability | Evidence |
| --- | --- | --- |
| **SHIPPED** | Automated schedule generation across a manager-defined date range and unit, run as a background job with progress percentage and phase text. | `src/lib/engine/scheduler/runner.ts`, `src/app/api/scenarios/generate/route.ts`, `generation_job` table in `src/db/schema.ts` |
| **SHIPPED** | **Three draft schedule options** produced per run — "Balanced", "Fairness Optimized", "Cost Optimized" — each scored on Coverage / Fairness / Cost / Preference / Skill Mix plus an overall score. Balanced is applied automatically; the manager can apply a different one. | `src/lib/engine/scheduler/runner.ts` (three `db.insert(scenario)` blocks), `src/lib/engine/scheduler/weight-profiles.ts`, `src/app/scenarios/page.tsx` |
| **SHIPPED** | Generation is **deterministic and reproducible**: a base seed is generated per job and written to the audit log so a run can be reproduced. | `runner.ts` — `const baseSeed = Date.now() & 0x7fffffff;` … `newState: { …, baseSeed, seed: balancedSeed }` |
| **SHIPPED** | Understaffed shifts are reported back with **human-readable reasons** per shift rather than silently left blank. | `src/lib/engine/scheduler/greedy.ts` → `collectRejectionReasonsSummary()`; `src/lib/engine/scheduler/eligibility.ts` → `getRejectionReasons()` |
| **SHIPPED** | Self-check for scheduler bugs: shifts left short *without* a documented hard-rule reason despite available staff are flagged as "SUSPICIOUS" in the audit entry. | `src/lib/engine/scheduler/validate-output.ts`, called from `runner.ts` |
| **SHIPPED** | Generation looks **across the schedule boundary** — the prior period's last 7 days are seeded into engine state so rest, consecutive-day, and 60h-window checks are not reset at period start. | `src/lib/engine/scheduler/index.ts` (`priorAssignments`), `src/__tests__/rules/prior-schedule-boundary.test.ts` |
| **SHIPPED** | Weekend quota scales to the actual schedule length (a 2-week period does not inherit the 6-week quota). | `src/lib/engine/scheduler/index.ts` — `const scaledRequired = Math.max(1, Math.round(unitConfig.weekendShiftsRequired * actualWeeks / standardWeeks))` |
| **SHIPPED** | Weekend history carries over between periods, so the same nurses do not land on weekends every run. | `src/lib/engine/scheduler/scoring.ts` §3 (`historicalWeekendCounts`) |
| **SHIPPED** | Manual override: a manager can assign, designate as charge, or remove any nurse on any shift directly on the grid. The assignment dialog shows, per candidate, weekly hours, "would cause OT", preference mismatches, and an "Unavailable" section with the specific hard rule that blocks them. | `src/components/schedule/assignment-dialog.tsx`, `src/app/api/shifts/[id]/eligible-staff/route.ts`, `src/app/api/schedules/[id]/assignments/route.ts` |
| **SHIPPED** | Generation guardrails: refuses to regenerate a **published** schedule (409, "Unpublish it first"), refuses when the unit has no active staff or the period has no shifts (422), and auto-reclaims a job stuck over 10 minutes so a schedule can never become permanently un-regenerable. | `src/app/api/scenarios/generate/route.ts` |
| **PARTIAL** | Generation runs **in-process** via `setImmediate` after the HTTP response — there is no job queue or worker. A process restart mid-run is handled by the stuck-job reclaim above, not by resumption. | `src/app/api/scenarios/generate/route.ts` |

### 3.2 Callout and coverage handling

| Status | Capability | Evidence |
| --- | --- | --- |
| **SHIPPED** | Log a callout against a specific nurse/shift with a reason (sick, family emergency, personal, no-show, other) and free-text detail. | `src/app/callouts/page.tsx`, `src/app/api/callouts/route.ts`, `callout` table |
| **SHIPPED** | **Ranked replacement candidates** returned immediately on logging, with pros/cons per candidate and eligibility screening. Top 3 eligible + top 3 ineligible (shown for visibility, with reasons). | `src/lib/callout/escalation.ts` — `const MAX_ELIGIBLE = 3; const MAX_INELIGIBLE = 3;` |
| **SHIPPED** | Every escalation step attempted is recorded on the callout record (`escalationStepsTaken` JSON: step, attempted, result, timestamp). | `callout` table in `src/db/schema.ts` |
| **SHIPPED** | Separate **coverage-request** workflow for non-urgent vacancies (leave approved outside the callout window): the system generates top-3 recommendations, the manager approves one, and the assignment is created. | `src/lib/coverage/find-candidates.ts`, `src/app/api/open-shifts/[id]/route.ts`, `src/app/open-shifts/page.tsx`, `open_shift` table |
| **SHIPPED** | Approving leave automatically decides between "urgent callout" and "coverage request" based on a per-unit day threshold. | `unit.calloutThresholdDays` (default 7) in `src/db/schema.ts`; `src/app/api/staff-leave/[id]/route.ts` |
| **SHIPPED** | Charge-nurse gap warning: when the called-out nurse held charge and no candidate is charge-qualified, the UI says so explicitly rather than offering an invalid fill. | `src/app/callouts/page.tsx`, `src/lib/coverage/find-candidates.ts` (agency is skipped entirely on charge shifts) |
| **PARTIAL** | "Agency" is offered as a last-resort option, but it is a **bookkeeping action only** — approving it records the decision; there is no agency integration or outbound request. Candidate reason text says so: `"Requires phone call to agency"`. | `src/lib/coverage/find-candidates.ts` (`staffId: "agency"`), `src/app/api/open-shifts/[id]/route.ts` |

### 3.3 Nurse self-service (`/my`)

| Status | Capability | Evidence |
| --- | --- | --- |
| **SHIPPED** | Nurse sees their own upcoming shifts and a month calendar. Nurses only see published schedules. | `src/app/my/page.tsx`, `src/components/nurse/nurse-month-calendar.tsx`, `src/lib/nurse/schedule-helpers.ts` |
| **SHIPPED** | Nurse reports their own callout from the phone. | `src/app/my/page.tsx` → `fetch("/api/callouts", { method: "POST" })` |
| **SHIPPED** | Nurse submits a leave request with type and dates. | `src/app/my/leave/page.tsx` → `POST /api/staff-leave` |
| **SHIPPED** | Nurse proposes a shift swap (directed at a colleague, or an open request), and accepts/declines a swap proposed to them. Swap partners are filtered to the **same role only** (RN↔RN, LPN↔LPN). | `src/app/my/swaps/page.tsx` → `POST /api/swap-requests`, `PUT /api/swap-requests/[id]`; `src/lib/swap/swap-options.ts` (`eligibleSwapColleagues`) |
| **SHIPPED** | A nurse accepting a swap **does not execute it** — status stays `pending` with `validationNotes: "Accepted by target nurse …"` and the UI shows "Awaiting manager". Only a manager `PUT { status: "approved" }` moves the assignments. A decline does terminate the request. | `src/app/api/swap-requests/[id]/route.ts` |
| **SHIPPED** | Nurses see only **published** schedules on their own schedule route — enforced server-side, not in the UI: for `role === "nurse"` the query adds `eq(schedule.status, "published")`. | `src/app/api/staff/[id]/schedule/route.ts` |
| **SHIPPED** | **PRN nurse submits their own availability** from the phone, using weekday preset chips ("all Saturdays") plus a multi-select calendar. Gated to `employmentType === "per_diem"`. | `src/app/my/availability/page.tsx`, `src/lib/prn-availability.ts` (`datesForWeekdays`, `togglePreset`) |
| **SHIPPED** | Server-side identity enforcement: when the caller's role is `nurse`, writes are forced onto the caller's own staff row — a nurse cannot submit for another nurse by tampering with the request body. | `src/app/api/prn-availability/route.ts` — `const staffId = role === "nurse" && callerStaffId ? callerStaffId : body.staffId;` |
| **SHIPPED** | In-app notifications on schedule publish, swap request, swap response, swap decision, and leave decision. Opening the notifications page marks all read. | `src/lib/notifications/notify.ts` (5 composers), `notification` table, `src/app/my/notifications/page.tsx` |
| **PARTIAL** | Notification delivery is **pull-based polling only** — the bell re-fetches on mount, on tab visibility change, and on a custom window event. The component comment says "no websockets". A nurse learns about a published schedule only when they next open the app. | `src/components/nurse/notification-bell.tsx` |
| **PARTIAL** | "Add to home screen" metadata exists (`start_url: "/my"`, `display: "standalone"`), but `icons` is an empty array and there is no service worker. It is a mobile web app, **not an installable PWA and not offline-capable**. | `public/manifest.webmanifest` |
| **PARTIAL** | Nurses can **create and view** leave and swap requests but cannot cancel or edit them — there is no UI, and `roles.ts` denies nurses `/api/staff-leave/[id]` and `DELETE /api/swap-requests/[id]`. | `src/lib/auth/roles.ts`, `src/app/my/leave/page.tsx` |
| **STUB** | Nurses can technically reach `GET /api/schedules` (the schedule *list*), which still returns drafts. Their own assignment view is correctly published-only (above); this is a metadata leak, documented as a known gap. | `src/lib/auth/roles.ts` — `// PHASE 2 TODO: published-only filtering for nurses (a nurse should not see draft schedules).` |
| **STUB** | `GET /api/prn-availability` is **not scoped to the caller** — a nurse can read every PRN nurse's availability. The nurse page's own comment claims the server scopes it; the handler only filters on an optional query param. | `src/app/api/prn-availability/route.ts` (GET); comment in `src/app/my/availability/page.tsx` |

### 3.4 PRN / per-diem management

| Status | Capability | Evidence |
| --- | --- | --- |
| **SHIPPED** | Dedicated PRN Availability page listing every per-diem nurse's submitted dates. | `src/app/availability/page.tsx` |
| **SHIPPED** | **Flags PRN nurses who have not submitted** ("Missing Submissions" card), and the count feeds the dashboard "Needs Attention" queue and the sidebar badge. | `src/app/availability/page.tsx` — `const missingSubmissions = prnStaff.filter(s => !submittedStaffIds.has(s.id));`; `prnMissingCount` in `src/app/api/dashboard/route.ts` |
| **SHIPPED** | Manager can **record availability on behalf of a PRN nurse** (from the availability page, from a missing-nurse chip pre-selected to that nurse, or from the staff detail dialog). | `src/components/prn-availability/record-availability-dialog.tsx`, `src/app/api/prn-availability/route.ts` |
| **SHIPPED** | PRN availability is a **hard constraint** in generation: a per-diem nurse is not assignable to a date they did not submit. | `src/lib/engine/scheduler/eligibility.ts` step 2; `src/lib/engine/rules/prn-availability.ts` |
| **SHIPPED** | PRN availability can also arrive via the Excel import ("PRN available days" column). | `src/lib/import/parse-excel.ts` — `// PRN available days — only relevant for per_diem employment type` |
| **SHIPPED** | One availability record per nurse, upserted (saving replaces prior availability, no duplicate rows). | `uniqueIndex("prn_availability_unique_idx")` in `src/db/schema.ts`; `src/lib/prn-availability.ts` |

> **Not a feature:** there is no "per-diem bench", no bench roster, no bench-health metric, and no bench-maintenance workflow anywhere in the codebase (`grep -rni "bench"` returns only an unrelated performance-benchmark line in a planning doc). Do not claim it.

### 3.5 Rules configuration

| Status | Capability | Evidence |
| --- | --- | --- |
| **SHIPPED** | 22 rule evaluators registered: **13 hard** (min-staff, charge-nurse, patient-ratio, rest-hours, max-consecutive, icu-competency, level1-preceptor, level2-supervision, no-overlapping-shifts, prn-availability, staff-on-leave, on-call-limits, max-hours-60) and **9 soft** (overtime-v2, weekend-count, consecutive-weekends, holiday-fairness, preference-match, float-penalty, charge-clustering, skill-mix, weekend-exempt). | `src/lib/engine/rules/index.ts` |
| **SHIPPED** | Managers can enable/disable rules and adjust soft-rule weights (0–10) from the UI. | `src/app/rules/page.tsx` → `PUT /api/rules/[id]` |
| **SHIPPED** | `no-overlapping-shifts` is locked on and cannot be disabled. | `src/app/rules/page.tsx` — `const LOCKED_RULES = new Set(["no-overlapping-shifts"])` |
| **SHIPPED** | Per-unit configuration of weekend/holiday quotas, schedule period length, on-call limits, consecutive-weekend cap, OT approval threshold, absolute minimum staffing day/night, acuity extra-staff counts. | `unit` table in `src/db/schema.ts`; `src/app/settings/units/page.tsx` |
| **PARTIAL** | Hard-rule *parameter* editing exists but only for the 8 rules present in a hardcoded map (`rest-hours`, `max-consecutive`, `max-hours-60`, `icu-competency`, `level1-preceptor`, `level2-supervision`, on-call ×2). Other hard rules show "—" and have no Edit button. | `src/app/rules/page.tsx` (`RULE_PARAMS`) |
| **PARTIAL** | Callout escalation order (`escalationSequence`, default `float → per_diem → overtime → agency`) and low-census send-home order (`lowCensusOrder`) are stored per unit and **displayed** on the unit card, but there is **no form control to change either**. Configurable only by direct API call or seed. | `src/db/schema.ts` (`unit.escalationSequence`, `unit.lowCensusOrder`); `src/app/settings/units/page.tsx` |

### 3.6 Census / acuity

| Status | Capability | Evidence |
| --- | --- | --- |
| **SHIPPED** | Census bands map a patient-count range to required RNs / LPNs / CNAs / charge nurses and a patient-to-licensed-staff ratio, per unit. | `census_band` table; `src/lib/engine/census-calculator.ts` |
| **SHIPPED** | Manager sets a per-shift census tier (Blue / Green / Yellow / Red) by date; staffing requirements update from it. | `src/app/census/page.tsx` → `POST /api/shifts/[id]/acuity`; `src/lib/analytics/effective-required.ts` |
| **SHIPPED** | Acuity tier adds extra required staff to a shift, and the generator honours the inflated requirement. | `src/lib/engine/scheduler/greedy.ts` — `const required = shift.requiredStaffCount + shift.acuityExtraStaff;` |
| **STUB** | `sitterCount` (1:1 sitters) is editable and stored, and is loaded into the engine's shift context — but **no rule or scheduler code reads it**. It has zero effect on staffing requirements today. | `src/db/schema.ts` (`shift.sitterCount`), `src/app/api/shifts/[id]/acuity/route.ts`, `src/lib/engine/rules/types.ts:69`; no consumer in `src/lib/engine/rules/*.ts` or `src/lib/engine/scheduler/*.ts` |

### 3.7 Data in / data out

| Status | Capability | Evidence |
| --- | --- | --- |
| **SHIPPED** | Excel onboarding import: a 5-sheet template (Staff, Units, Holidays, Census Bands, Staff Leave) with per-row validation errors and warnings shown before commit. | `src/app/setup/page.tsx`, `src/app/api/import/route.ts`, `src/lib/import/parse-excel.ts` |
| **SHIPPED** | Import is transactional and explicitly destructive — the UI warns "Importing will delete ALL existing data" and requires a second confirmation. | `src/app/setup/page.tsx`; `src/__tests__/import/import-transaction.test.ts` |
| **SHIPPED** | Schedule export to Excel, 3 sheets: **Schedule Grid**, **Leave & Callouts**, **Per-Staff List**. | `src/app/api/schedules/[id]/export/route.ts` (`XLSX.utils.book_append_sheet(...)` ×3) |
| **SHIPPED** | Audit trail CSV export (client-side, BOM-prefixed, `audit-trail-YYYY-MM-DD.csv`). | `src/app/audit/page.tsx` |
| **SHIPPED** | **Full roster export to Excel** — `GET /api/import` returns the current Staff, Units, Holidays, Census Bands, and Staff Leave data as a 5-sheet workbook (PRN availability is summarised back into a day pattern such as "Mon, Wed, Fri"). It falls back to a bundled sample workbook only when the roster is empty. Round-trips into the import template, so a customer's data is not locked in. | `src/app/api/import/route.ts` — `GET()` at line 674, `exportCurrentData()` at line 734, 5 × `book_append_sheet` |
| **PARTIAL** | That export is **mislabelled in the UI**: the only button that calls it says "Download Template (.xlsx)". A manager with a populated roster gets their live data and may believe it is a blank template. `RULES_SPECIFICATION.md` §11.5 describes a separate "Export Data" button on `/setup` that does not exist. | `src/app/setup/page.tsx`; `src/components/layout/sidebar.tsx` (nav label "Import / Export") |

### 3.8 Reporting

| Status | Capability | Evidence |
| --- | --- | --- |
| **SHIPPED** | Analytics: fill-rate trend, overtime by staff (top 10), callout frequency trend, weekend distribution, holiday balance, staff workload, compliance overview (hard/soft violations, overtime instances, unfilled shifts). | `src/app/api/analytics/route.ts` sections 1–5, 7–8 |
| **SHIPPED** | Dashboard operational counters: active staff, total FTE, fill rate, understaffed and overstaffed shifts, open callouts, pending swaps/leave, open coverage requests, PRN missing count, "schedule ends in N days". | `src/app/api/dashboard/route.ts` |
| **STUB** | **Labor cost reporting does not exist.** Both the "Total Labor Cost" KPI and the "Labor Cost Breakdown" chart render a "Coming Soon" panel: *"Labor cost tracking requires staff hourly rates. Configure rates per staff member to enable this report."* There is no hourly-rate field in the schema. | `src/app/analytics/page.tsx:216-224, 380-394`; `src/app/api/analytics/route.ts:242` — `// ─── 6. Cost Analysis (coming soon — kept in API for future use) ───` |
| **STUB** | Dashboard sparklines are hardcoded arrays, not data. | `src/app/dashboard/page.tsx` — `// Mock sparkline data (in production, fetch from API)` |
| **PARTIAL** | Audit page is capped at `limit=200` with no pagination. | `src/app/audit/page.tsx` |

### 3.9 Onboarding / demo scaffolding

| Status | Capability | Evidence |
| --- | --- | --- |
| **SHIPPED** | Stage-machine onboarding guide (S0–S7) driving a getting-started checklist and a "suggested next step" beacon in the sidebar. | `src/lib/onboarding/guide.ts`, `src/lib/onboarding/use-onboarding.tsx` |
| **SHIPPED** | **Practice mode**: seeds clearly-marked `[PRACTICE]` leave/swap/callout records built from the real roster, tints those rows amber, and intercepts any action on a *real* record with a confirmation ("This one isn't part of the practice tutorial — it's a real callout from your roster"). Teardown is a transactional delete. | `src/app/api/practice-examples/route.ts`, `src/components/ui/confirm-real-action-dialog.tsx`, `src/lib/onboarding/practice-marker.ts` |
| **PARTIAL** | Demo reset endpoint wipes to an empty hospital — gated behind `DEMO_MODE=true` plus a `DEMO_RESET_SECRET`. Demo-only, not a customer feature. | `src/app/api/demo/reset/route.ts`, `src/lib/demo/reset-demo.ts` |

### 3.10 Authentication

| Status | Capability | Evidence |
| --- | --- | --- |
| **SHIPPED** | Email/password login with scrypt password hashing and a stateless HMAC-SHA-256 signed session cookie (`ssai_session`), rolling re-issue after ~1 day. | `src/lib/auth/password.ts`, `src/lib/auth/session.ts` |
| **SHIPPED** | Route-level role authorization as a pure, unit-tested allow-list. | `src/lib/auth/roles.ts`, `src/__tests__/auth/roles.test.ts` |
| **PARTIAL** | **Auth is off unless `AUTH_ENABLED=true`.** With the flag unset the middleware is a total no-op and every manager route is open. Production throws at startup if `AUTH_ENABLED=true` without `AUTH_SECRET`. | `src/middleware.ts` — `if (!AUTH_ENABLED) return NextResponse.next();` |
| **PARTIAL** | No self-serve signup, password reset, invite flow, SSO, or MFA. Accounts are provisioned by seed/import (`provisionAuthUsers()`), with a default manager `admin@cah.local` / `changeme-dev`. | `src/lib/auth/provision-users.ts`, `src/db/create-users.ts`, `DEMO-LOGINS.md` |

---

## 4. Scheduling and ranking engine — detail

### 4.1 Pipeline

`generateSchedule()` in `src/lib/engine/scheduler/index.ts` runs five phases:

1. **Greedy construction** (`greedy.ts`) — shifts processed most-constrained-first.
2. **Hard-violation repair** (`repair.ts`) — moves specialised staff into critical slots and back-fills.
3. **Local search** (`local-search.ts`) — Late Acceptance metaheuristic, seeded PRNG, 1500 iterations for the Balanced variant.
4. **Overtime-reduction sweep** — deterministically tries every OT assignment as a swap candidate.
5. **Weekend-redistribution sweep** — moves weekend shifts from above-average to below-average nurses.

`runner.ts` then derives the two alternatives from the Balanced result rather than running three independent generations:

- **Fairness Optimized** = Balanced + `weekendRedistributionSweep()` under FAIR weights.
- **Cost Optimized** = Balanced + `overtimeReductionSweep()` + `weekendRedistributionSweep()` under COST weights.

Shift processing order (`greedy.ts` → `getShiftPriority()`): weekend ICU/ER charge → weekday ICU/ER charge → ICU/ER non-charge → night → day/evening → on-call.

### 4.2 Hard constraints enforced (never violated by generation)

Quoted in order from `src/lib/engine/scheduler/eligibility.ts` → `passesHardRules()`:

1. **Approved leave blocks assignment.**
2. **PRN availability** — `if (staffInfo.employmentType === "per_diem") { … if (!avail || !avail.availableDates.includes(shiftInfo.date)) return false; }`
3. **ICU/ER competency** — `if (isICUUnit(shiftInfo.unit) && staffInfo.icuCompetencyLevel < 2) return false;`
   - 3b. Level 1 requires a **Level 5 preceptor already on the same shift**.
   - 3c. Level 2 on ICU/ER requires a **Level 4+ supervisor already on the same shift**.
4. **No overlapping shifts.**
5. **Minimum rest 10 hours**, checked both before and after the proposed shift.
6. **Max consecutive days** — `const maxConsec = Math.min(staffInfo.preferences?.maxConsecutiveDays ?? 5, 5);`
7. **Max 60 hours in any rolling 7-day window** — all seven windows containing the date are checked, not just the backward one.
8. **On-call limits** — per-week cap and per-month weekend cap, from unit config.

Charge slots additionally require `isChargeNurseQualified && icuCompetencyLevel >= 4` (`greedy.ts`, Pass 1).

### 4.3 What the generator ranks candidates by (soft penalty, lower = better)

The ten scoring terms, verbatim section headings from `src/lib/engine/scheduler/scoring.ts` → `softPenalty()`:

| # | Factor | How it scores |
| --- | --- | --- |
| 1 | **Overtime** | `> 40h` in the week: `penalty += weights.overtime * (otHours / 12)`. Above FTE target but `≤ 40h`: `weights.overtime * 0.3 * (extraHours / 12)`. Plus a capacity-spreading bonus `penalty -= weights.overtime * 0.1 * (remainingBeforeOT / 40)` — described in code as mirroring "ask whoever has worked the least this week". |
| 2 | **Preference mismatch** | wrong shift type `× 0.5`; a preferred day off `× 0.7`; `avoidWeekends` on a weekend `× 0.6`. |
| 3 | **Weekend count equity** | Below quota → bonus `−weights.weekendCount * 0.5`. At/over quota → `+weights.weekendCount * (0.4 + excess * 0.3)`. Seeded with the prior period's weekend counts. |
| 3a | **Weekend-exempt deterrent** | `penalty += weights.preference * 1.5` — exemption is "a quota exemption, not a hard ban … makes them the LAST resort". |
| 3b | **Consecutive weekends** | Streak past the unit cap → `+weights.consecutiveWeekends * (0.5 + excess * 0.5)`. |
| 4 | **Float penalty** | `weights.float * (isCrossTrained ? 0.3 : 1.0)`. |
| 5 | **Skill mix** | Duplicate competency level on the shift `× 0.6` if all identical, `× 0.1` otherwise. |
| 6 | **Competency pairing incentive** | Level 5 onto a shift that has a Level 1: `−weights.skillMix * 0.8`. Level 4+ onto an ICU/ER shift that has a Level 2: `−weights.skillMix * 0.6`. |
| 7 | **Charge clustering** | Second+ charge-qualified nurse on one shift: `+weights.chargeClustering * (0.8 + (excess - 1) * 0.5)`. |
| 8 | **Agency** | `if (staffInfo.employmentType === "agency") penalty += weights.agency * 1.0;` — comment: "Agency nurses cost 2–3× the base hourly rate … last resort". |
| 9 | **Holiday fairness** | Nurse above the team's holiday average: `+weights.holidayFairness * 0.5 * holidayExcess`. |
| 10 | **Per-nurse load fairness** | Only active when `weights.weekendCount > 1.0` (i.e. the FAIR variant): `+weights.weekendCount * 0.2 * loadExcess`. |

Two preferences are applied as **hard tiers before scoring**, not as penalties (`greedy.ts`):

- **Non-OT first** — "any nurse who can cover this shift without crossing the 40h overtime threshold is used before nurses who would go into OT, regardless of employment type or current FTE utilisation."
- **Charge-distribution** — once a charge-qualified nurse is on the shift, non-charge-qualified nurses are preferred for the remaining slots.

### 4.4 The three variants' weights (verbatim from `weight-profiles.ts`)

| Weight | BALANCED | FAIR | COST_OPTIMIZED |
| --- | --- | --- | --- |
| overtime | 1.5 | 0.5 | 3.0 |
| preference | 1.5 | 2.0 | 0.5 |
| weekendCount | 1.0 | 3.0 | 1.0 |
| consecutiveWeekends | 1.0 | 15.0 | 1.0 |
| holidayFairness | 1.0 | 3.0 | 1.0 |
| skillMix | 1.0 | 1.0 | 0.5 |
| float | 1.0 | 0.5 | 2.0 |
| chargeClustering | 1.0 | 1.0 | 0.5 |
| agency | 2.5 | 1.5 | 5.0 |

### 4.5 Callout replacement ranking (`src/lib/callout/escalation.ts`)

Score formula, verbatim:

```
const effectiveLevel = Math.min(s.icuCompetencyLevel, calledOutLevel);
const overflowLevel  = Math.max(0, s.icuCompetencyLevel - calledOutLevel);
const competencyScore = effectiveLevel * 10 + overflowLevel * 2;

const sourceBonusMap = { float: 30, per_diem: 20, overtime: 10, agency: 0 };

let score = competencyScore + (sourceBonusMap[source] ?? 0);
if (isAvailable) score += 50;
score += s.reliabilityRating * 3;
if (chargeNurseRequired && s.isChargeNurseQualified) score += 15;
if (source === "overtime" && !wouldBeOvertime) score += 10;
score += Math.max(0, 40 - hoursThisWeek) * 0.2;   // prefer less-loaded staff
```

The **sort key is overtime status first, score second**:

> "Ordering rule: never rank an overtime candidate above a straight-time one within the same group. Reducing overtime cost is the core value proposition, so `wouldBeOvertime` is the PRIMARY sort key (straight-time first) and the existing score is SECONDARY."

A candidate whose role rank is below the called-out nurse's is **skipped entirely**, not shown as ineligible: "A CNA/LPN cannot perform RN duties regardless of circumstances."

Displayed per candidate: source, competency vs. the called-out nurse, hours already this week, reliability rating, rest hours before the shift, weekends already worked this period, consecutive days worked before the shift.

The near-identical coverage-request ranker (`src/lib/coverage/find-candidates.ts`) walks the escalation tiers in order — `float → per_diem → overtime → agency` — and sorts with **agency always last**, then straight-time before overtime, then score. It adds `+5` for the nurse's home unit and returns the top 3.

### 4.6 What the engine does NOT consider

Verified absent from `eligibility.ts`, `scoring.ts`, `find-candidates.ts`, `escalation.ts`, and the rule registry:

- **Actual hours worked.** Every hours calculation is over *scheduled* shift durations. There is no time clock, punch, timesheet, or actual-vs-scheduled reconciliation anywhere in the schema.
- **Pay rates or dollar cost.** Cost is a *relative penalty weight*, not currency. No hourly-rate field exists.
- **Seniority or union tenure rules.** `hireDate` is stored but never read by any rule or scoring function.
- **Credential/certification validity.** `certifications` is a `string[]` with no expiry dates and is not consulted by any rule (see §6).
- **Nurse-requested specific shifts / bidding.** Preferences are shift type, days off, max hours, max consecutive days — not named shifts.
- **Travel/contract nurse availability windows.** No contract start/end dates exist.
- **Commute, geography, or multi-site travel.**
- **The 8-and-80 (80-hour / 14-day) overtime method.** See §5.
- **Sitters.** `sitterCount` is stored but has no consumer.
- **Patient acuity beyond the four-tier colour band.** No per-patient acuity scoring.

---

## 5. Compliance detail

### 5.1 Overtime — what is computed

**Overtime is the FLSA 7-day, over-40-hours method, and only that.**

- Weekly buckets are Monday–Sunday via a UTC-safe helper: `const weekStart = getWeekStart(a.date);` (`src/lib/engine/rules/overtime-v2.ts`, `src/lib/date/week.ts`).
- The threshold is a literal 40: `if (!actualOtFlagged && cumulativeHours > 40) { const overtimeHours = cumulativeHours - 40; … }`
- A second, lower-penalty tier separates *extra hours above a part-timer's FTE but still under 40* from true overtime — the rule's own header: *"Hours > 40 in a fixed work week = HIGH penalty (actual overtime). Hours > (FTE * 40) but <= 40 = LOW penalty (extra hours but not OT)."*
- Every assignment carries an `isOvertime` boolean, recomputed in calendar order after each optimisation sweep (`recomputeOvertimeFlags`).
- Agency and zero-FTE staff are skipped: `if (staffInfo.fte === 0) continue;`

### 5.2 8-and-80 — NOT IMPLEMENTED

I searched the entire repo (`src/`, `docs/`, `RULES_SPECIFICATION.md`, `FEATURES.md`, `CLAUDE.md`) for `8-and-80`, `8/80`, `80 hour`, `14 day`, `fourteen`. **Zero matches** relate to overtime. Every hit was an unrelated date window (a 14-day test schedule, a "10-14 days out" practice-data comment).

There is no 14-day work-period concept, no biweekly pay-period boundary, no 8-hours-in-a-day overtime trigger, and no configuration switch for either. `unit.schedulePeriodWeeks` (default 6) is a **fairness quota window**, not a pay period.

**The marketing site must continue to say "FLSA overtime thresholds" and must not claim 8-and-80.** This confirms the existing rule in `MEMORY.md`.

### 5.3 Hours and rest caps — computed and enforced

| Cap | Value | Where enforced |
| --- | --- | --- |
| Max hours in any rolling 7-day window | 60 | `eligibility.ts` step 7; `validate-swap.ts` step 7; `src/lib/engine/rules/on-call-limits.ts` (`maxHoursRule`) |
| Minimum rest between shifts | 10 hours, both directions | `eligibility.ts` steps 5a/5b; `validate-swap.ts` step 6 |
| Max consecutive working days | 5 (or lower per nurse preference) | `eligibility.ts` step 6; `validate-swap.ts` step 8 |
| On-call per week / weekend on-call per month | per-unit config | `eligibility.ts` step 8; `src/lib/engine/rules/on-call-limits.ts` |
| Absolute minimum staffing floor day/night | per-unit config | `unit.minStaffDay` / `minStaffNight`; `src/lib/engine/rules/min-staff.ts` |
| Patient-to-licensed-staff ratio | per census band; **RN + LPN count as licensed, CNA does not** | `src/lib/engine/rules/patient-ratio.ts`; `src/__tests__/rules/patient-ratio.test.ts` — `it("does not count CNA as licensed staff")` |

These same checks re-run on **swap approval** — a swap that would break rest, the 60h window, consecutive days, competency pairing, or the charge requirement is blocked, and the Confirm button is not even rendered (`src/lib/swap/validate-swap.ts`, `src/app/swaps/page.tsx`).

Publishing a schedule is **blocked while hard violations exist**: `disabled={publishing || disabledByViolations}` with the tooltip `Fix ${n} compliance issues before publishing` (`src/app/schedule/[id]/page.tsx:338-361`).

### 5.4 Audit trail — what is recorded

`exception_log` (`src/db/schema.ts`) is an append-only change log with `entityType`, `entityId`, `action`, `description`, `previousState` and `newState` JSON snapshots, an optional `overriddenRuleId` + `justification`, `performedBy`, and timestamp.

**35 distinct logged actions**, including: `created`, `updated`, `deleted`, `override_hard_rule`, `override_soft_rule`, `published`, `archived`, `callout_logged`, `callout_filled`, `scenario_selected`, `scenario_applied`, `swap_requested`, `swap_approved`, `open_swap_approved`, `swap_denied`, `forced_overtime`, `manual_assignment`, `leave_requested`, `leave_approved`, `leave_denied`, `pull_back`, `flex_home`, `safe_harbor`, `acuity_changed`, `census_changed`, `agency_called`, `open_shift_created`, `open_shift_filled`, `open_shift_cancelled`, `schedule_auto_generated`, `assignment_cancelled_for_leave`, `callout_created_for_leave`.

Audit writes are wired into **21 API route files** (verified by grepping `logAudit` / `exceptionLog` under `src/app/api`), plus `runner.ts` which logs one entry per generated variant with the score breakdown, the assignment count, the understaffed count, and the reproduction seed.

Leave denial **requires a written reason** — the UI copy is explicit: `"Explain why this request is being denied (required for the audit trail)"` (`src/app/leave/page.tsx:471`).

The audit trail is filterable by entity, action, and date range, and exportable as CSV (`src/app/audit/page.tsx`).

### 5.5 Compliance features that are stored but NOT computed

| Item | Reality | Evidence |
| --- | --- | --- |
| **Safe Harbor (Texas)** | `safeHarborInvoked` and `safeHarborFormId` exist on the assignment table and are accepted by the assignments API, and `safe_harbor` is a valid audit action. **There is no UI anywhere to invoke it**, and no form generation or storage. Data-model only. | `src/db/schema.ts` (`assignment.safeHarborInvoked`), `src/app/api/schedules/[id]/assignments/route.ts:102-103`; no match in any `.tsx` |
| **Low census / flex-home / VTO** | Per-unit send-home order and a per-nurse "available for VTO" flag and `flexHoursYearToDate` counter are stored and editable, and the assignment-dialog *suggests* who to flex when a shift is overstaffed. There is **no workflow that executes a flex-home** — nothing writes assignment status `flexed`, nothing increments `flexHoursYearToDate`, and nothing emits the `flex_home` audit action. | `src/db/schema.ts`; `src/components/schedule/assignment-dialog.tsx:114`; `src/app/settings/units/page.tsx:213` |
| **`overtimeApprovalThreshold`** | `unit.otApprovalThreshold` (default 4 hours, "beyond which CNO approval needed") is stored and editable in unit settings, but **no approval workflow reads it** — there is no CNO approval step in the codebase. | `src/db/schema.ts:49`; `src/app/settings/units/page.tsx` |
| **CMS / CFR / PBJ / Joint Commission / HIPAA** | **No code references any of these.** A repo-wide grep for `flsa|cfr|cms|medicare|joint commission|hipaa|pbj` in `src/` returns exactly one hit — a comment in a test file. There is no PBJ export, no CMS report, no regulatory filing feature. | `src/__tests__/rules/registry.test.ts:5` (only hit) |

---

## 6. NOTABLE ABSENCES

Things a reader could reasonably assume exist. **These do not exist. Do not claim any of them.**

1. **No EHR integration.** No Epic, Cerner, Meditech, athenahealth, HL7, or FHIR anywhere. Verified by repo-wide grep.
2. **No payroll or HRIS integration.** No ADP, Paycom, Kronos/UKG, Workday, or generic payroll export.
3. **No time clock / actual-hours tracking.** All hours are *scheduled* hours. There is no punch, timesheet, or actual-vs-scheduled reconciliation. Every OT number in the product is projected OT, not paid OT.
4. **No labor cost in dollars.** No hourly-rate field exists on `staff`; both labor-cost analytics panels render "Coming Soon". Cost is an internal relative weight only.
5. **No credential or licence EXPIRY tracking.** `staff.certifications` is a plain `string[]` (e.g. `["ACLS","TNCC"]`) with **no expiry dates**, no renewal reminders, no compliance dashboard, and no rule that consults it. Competency is a 1–5 integer level, which is a different thing. This confirms the existing "no credential tracking" rule in `MEMORY.md`.
6. **No travel-nurse or contract-nurse management.** `employment_type` is `full_time | part_time | per_diem | float | agency` — there is no "travel" type, no contract start/end dates, no guaranteed-hours tracking, and no travel availability window.
7. **No physician, provider, or non-nursing scheduling.** `staff.role` is exactly `RN | LPN | CNA`. No MD/DO/APP/NP/PA, no respiratory therapy, no lab, no environmental services.
8. **No native mobile app.** No React Native, Capacitor, or Expo. The nurse portal is a mobile-first web surface; `public/manifest.webmanifest` has an empty `icons` array and there is no service worker, so it is not an installable or offline-capable PWA.
9. **No self-scheduling and no open-shift claiming by nurses.** Coverage requests are manager-approved only: `/api/open-shifts` is not on the nurse allow-list in `src/lib/auth/roles.ts`, and the fill action is a manager `PUT … {action:"approve", selectedStaffId}` in `src/app/api/open-shifts/[id]/route.ts`. Nurses cannot see, bid on, or claim open shifts.
10. **No email or SMS notifications.** Notifications are in-app rows only — the schema comment says `Phase 3 — in-app only; email/SMS deferred`. No nodemailer, Twilio, SendGrid, Resend, or SMTP dependency exists.
11. **No per-diem "bench" concept.** No bench roster, bench health metric, bench-depth report, or bench-maintenance workflow. The word does not appear in the product code.
12. **No agency integration.** Selecting agency records a decision; the candidate's own reason text is "Requires phone call to agency".
13. **No multi-tenant / multi-hospital architecture.** One SQLite file per deployment, keyed by `DATABASE_PATH`; no organisation or tenant table.
14. **No self-serve signup, password reset, invite, SSO, or MFA.** Accounts are provisioned by seed or import.
15. **No shift bidding, marketplace, incentive/bonus pay, or float-pool marketplace.**
16. **Nurses cannot set their own shift preferences.** The engine consumes preferred shift type, preferred days off, max hours per week, and max consecutive days — but `/api/staff-preferences/[staffId]` is manager-only and there is no nurse-facing preferences screen. A nurse tells their manager; the manager enters it. Do not describe preferences as nurse self-service.
17. **No real-time push of any kind.** No WebSocket, no server-sent events, no service worker, no queue. Everything the nurse sees arrives by polling when the app is open.
18. **No forecasting or predictive census.** Census tiers are entered by the manager for a date; nothing projects them.
19. **No CI pipeline in the repo.** There is a `.githooks/pre-commit` and a `scripts/verify.mjs`, but no `.github/workflows`.

---

## 7. OPEN QUESTIONS FOR THE FOUNDER

The code cannot settle these. Answer before writing marketing copy that depends on them.

1. **Is `AUTH_ENABLED=true` in the live customer/demo deployment?** With it unset, the entire manager surface is unauthenticated. The marketing site should not describe access control until this is confirmed on for every real environment. (`src/middleware.ts`)
2. **Is `DEMO_PREFILL` off in production?** The code emits a startup warning that it "will pre-fill demo nurse credentials and expose a shared demo account".
3. **Sitters:** `sitterCount` is captured but ignored by the engine. Is that a known gap on the roadmap, or dead schema to remove? Until answered, sitters must not appear in any staffing-accuracy claim. (`src/db/schema.ts`, `src/lib/engine/rules/types.ts:69`)
4. **Safe Harbor:** the fields exist but no UI invokes them. Is Texas Safe Harbor documentation a planned feature, a manual-process placeholder, or abandoned? This is a Texas-specific selling point, so the answer matters.
5. **Low census / flex-home / VTO:** config and per-nurse flags are shipped, the execution workflow is not. Is "low census management" something we can claim as *guidance* ("shows you who to send home first"), or should we stay silent until the workflow ships?
6. **OT approval threshold:** `otApprovalThreshold` is configurable but no approval workflow consumes it. Is a CNO approval step planned?
7. **Escalation order editing:** `escalationSequence` and `lowCensusOrder` are per-unit but have no UI control. Are these configured for customers during onboarding (by us, via API/seed), and can we describe them as "configurable"?
8. **Labor cost:** the analytics panels say hourly rates are needed. Is per-nurse rate capture on the near roadmap? If yes, cost-savings marketing claims should stay framed as *hours* (OT hours avoided, agency shifts avoided), not dollars, until it ships.
9. **Multi-unit:** the schema supports units, home units, cross-training, and float, and the `/settings/units` page is real. But census bands and the sample data are ICU-heavy, and the staff form's unit list is hardcoded to `["ICU","ER","Med-Surg","PACU","L&D"]`. Do we support an arbitrary unit set today, or is multi-unit best described as "ICU/ER plus configured units"? (`src/components/staff/staff-form.tsx`)
10. **Nurse draft-schedule visibility:** the code flags that nurses can currently reach `GET /api/schedules` including drafts. Is this fixed in an unreleased branch, or a live gap? It affects any "nurses only see published schedules" claim. (`src/lib/auth/roles.ts` PHASE 2 TODO)
11. **Export labelling:** roster export genuinely works (`GET /api/import`), but the only button that triggers it is labelled "Download Template (.xlsx)". Should marketing claim "export your data any time"? The capability is real; the UI does not advertise it, so a demo would not show it. Worth a UI label fix before we claim it.
12. **PRN availability read scope:** `GET /api/prn-availability` lets any nurse read the whole roster's availability. Is that intended (shared visibility) or a bug? It affects any privacy claim in the nurse portal.
13. **Notification expectations:** delivery is polling-only and in-app-only. If a CAH evaluates us as an after-hours callout tool, "nurse gets notified" is not true unless they open the app. Do we position the nurse portal as a *record-keeping* surface rather than an *alerting* one until email/SMS ships?
14. **Scale:** SQLite single-file, no CI, `typescript: { ignoreBuildErrors: true }` on the production build. Is there a stated concurrent-user or facility-count ceiling we should avoid over-promising against? (`next.config.ts`, `docs/ARCHITECTURE.md` "Deploy")

---

*Compiled 2026-08-09/10 from commit `4ca898cc0e7af654ef33c6086bacf09c75e7676b`. Re-verify against a fresh clone before reusing after the next material release.*
