<script>
  // Scheduling cost calculator (ungated, 2026-10-01).
  // Every result is visible as the sliders move. Savings are never quoted as a
  // percentage: the only reduction we state is the approved `hours-returned`
  // line (1 to 2 hours of review, docs/seo/positioning-registry.md); anything
  // else is the visitor's own "what if".

  const CALL_LINK = 'https://cal.com/gautham-8bdvdx/30min';
  const NSI_LINK = 'https://www.nsinursingsolutions.com/documents/library/nsi_national_health_care_retention_report.pdf';

  // --- Hospital inputs ---
  let mgmtHours = $state(10); // hours/week the manager spends on scheduling, callouts, swaps
  let otHours = $state(48); // overtime hours per week, all RNs combined
  let agencyShifts = $state(3); // agency shifts per month
  let rnExits = $state(2); // RN exits in the past year where scheduling was a factor

  // --- Rates (editable). Sources: 2026 NSI National Health Care Retention & RN Staffing Report. ---
  let mgrRate = $state(50); // our estimate of a nurse manager's fully loaded hourly cost
  let otPremium = $state(23.63); // half of average RN base pay: $59.46 incl. 25.8% benefits / 1.258 / 2
  let agencyPremium = $state(31.77); // travel nurse fee $91.23 minus staff RN pay $59.46
  let agencyShiftHours = $state(12);
  let replaceCost = $state(60090); // average cost of turnover for a bedside RN

  // --- Costs per year ---
  const n = (v) => (Number.isFinite(+v) && +v > 0 ? +v : 0);
  let mgmtCost = $derived(Math.round(mgmtHours * 52 * n(mgrRate)));
  let otCost = $derived(Math.round(otHours * 52 * n(otPremium)));
  let agencyCost = $derived(Math.round(agencyShifts * n(agencyShiftHours) * n(agencyPremium) * 12));
  let turnoverCost = $derived(Math.round(rnExits * n(replaceCost)));
  let totalCost = $derived(mgmtCost + otCost + agencyCost + turnoverCost);

  let rows = $derived([
    { key: 'mgmt', label: 'Nurse manager time on scheduling', value: mgmtCost },
    { key: 'ot', label: 'Overtime premium', value: otCost },
    { key: 'agency', label: 'Agency premium over staff pay', value: agencyCost },
    { key: 'turnover', label: 'Replacing nurses who left', value: turnoverCost },
  ]);

  // --- Manager time back: the one reduction we state (1 to 2 hours of review) ---
  let backLow = $derived(Math.max(0, Math.round((mgmtHours - 2) * 52 * n(mgrRate))));
  let backHigh = $derived(Math.max(0, Math.round((mgmtHours - 1) * 52 * n(mgrRate))));

  // --- Visitor's own what-if ---
  let coverShifts = $state(1);
  let avoidOt = $state(8);
  let coverShiftsC = $derived(Math.min(coverShifts, agencyShifts));
  let avoidOtC = $derived(Math.min(avoidOt, otHours));
  let whatIf = $derived(
    Math.round(coverShiftsC * n(agencyShiftHours) * n(agencyPremium) * 12 + avoidOtC * 52 * n(otPremium))
  );

  function fmt(v) {
    return '$' + Math.round(v).toLocaleString('en-US');
  }
  const pct = (v) => (totalCost > 0 ? Math.max(2, Math.round((v / totalCost) * 100)) : 0);

  // --- Light analytics (Microsoft Clarity custom events), once per kind ---
  const sent = new Set();
  function track(name) {
    if (sent.has(name)) return;
    sent.add(name);
    try {
      window.clarity?.('event', name);
    } catch {}
  }

  // --- "Email me a one-page breakdown" ---
  // Same Apps Script web app as the template gate (one deployment, one URL); it routes on
  // `kind`, re-checks the email domain, recomputes every number from the inputs, emails a
  // one-page PDF and logs the request to the "Calculator breakdowns" tab.
  // Source and setup: docs/ops/leads-apps-script.md. Keep FREE_EMAIL_DOMAINS in step with it.
  const LEADS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxFlkPVZ9S6GBPFMmC0X34LF5OdGzriEZ117j75KnH_wgeGURq42NZudLfaKf1eoRBD/exec';
  const connected = LEADS_SCRIPT_URL.startsWith('https://');
  const showBreakdownForm = connected || import.meta.env.DEV;

  const FREE_EMAIL_DOMAINS = [
    'gmail.com', 'googlemail.com', 'yahoo.com', 'ymail.com', 'rocketmail.com', 'hotmail.com',
    'outlook.com', 'live.com', 'msn.com', 'aol.com', 'icloud.com', 'me.com', 'mac.com', 'proton.me',
    'protonmail.com', 'pm.me', 'gmx.com', 'gmx.net', 'mail.com', 'yandex.com', 'zoho.com',
    'zohomail.com', 'tutanota.com', 'fastmail.com', 'hey.com', 'comcast.net', 'att.net',
    'sbcglobal.net', 'verizon.net', 'cox.net', 'charter.net', 'bellsouth.net', 'earthlink.net',
    'juno.com', 'rediffmail.com', 'qq.com', '163.com',
  ];
  const ROLES = [
    'Director of Nursing / CNO',
    'Nurse manager or charge nurse',
    'CEO or administrator',
    'CFO or finance',
    'Staffing or scheduling coordinator',
    'Other',
  ];

  let bdEmail = $state('');
  let bdHospital = $state('');
  let bdRole = $state('');
  let bdTrap = $state('');
  let bdSending = $state(false);
  let bdError = $state('');
  let bdDone = $state('');

  async function requestBreakdown(e) {
    e.preventDefault();
    bdError = '';
    bdDone = '';
    const email = bdEmail.trim().toLowerCase();
    const domain = email.split('@')[1] || '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return (bdError = 'Please enter a valid email address.');
    if (FREE_EMAIL_DOMAINS.includes(domain))
      return (bdError =
        'Please use your work email. We send the breakdown to hospital and organization addresses only, not Gmail, Yahoo or other personal accounts.');
    if (!bdHospital.trim()) return (bdError = 'Please enter your hospital or organization.');
    if (!bdRole) return (bdError = 'Please select your role.');
    if (bdTrap) return;
    if (!connected) return (bdError = 'Preview only: the email service is not connected yet, so nothing was sent.');

    bdSending = true;
    try {
      await fetch(LEADS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          kind: 'roi_breakdown',
          email,
          hospital: bdHospital.trim(),
          role: bdRole,
          page: location.pathname,
          timestamp: new Date().toISOString(),
          inputs: { mgmtHours, otHours, agencyShifts, rnExits, coverShifts: coverShiftsC, avoidOt: avoidOtC },
          rates: { mgrRate: n(mgrRate), otPremium: n(otPremium), agencyPremium: n(agencyPremium), agencyShiftHours: n(agencyShiftHours), replaceCost: n(replaceCost) },
        }),
      });
      window.dataLayer = window.dataLayer || [];
      (function () {
        window.dataLayer.push(arguments);
      })('event', 'generate_lead', { lead_source: 'roi_breakdown', role: bdRole });
      track('roi_breakdown_requested');
      bdDone = `Sent. Your one-page breakdown is on its way to ${email}. If it hasn't arrived in 10 minutes, check your spam folder or write to support@simplescheduleai.com.`;
      bdEmail = '';
    } catch {
      bdError = 'Something went wrong sending the request. Please try again, or write to support@simplescheduleai.com.';
    } finally {
      bdSending = false;
    }
  }

  const fieldClass =
    'block w-full rounded-lg border border-hairline bg-white p-3 text-sm focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary';
</script>

<div class="mx-auto max-w-3xl">
  <!-- Inputs -->
  <div class="space-y-8" oninput={() => track('roi_used')}>
    {#each [
      { id: 'roi-mgmt', label: 'Hours your manager spends each week on the schedule, callouts and swaps', min: 2, max: 20, step: 1, unit: 'hrs', get: () => mgmtHours, set: (v) => (mgmtHours = v) },
      { id: 'roi-ot', label: 'Overtime hours per week, all RNs combined', min: 0, max: 120, step: 4, unit: 'hrs', get: () => otHours, set: (v) => (otHours = v) },
      { id: 'roi-agency', label: 'Agency shifts called in per month', min: 0, max: 20, step: 1, unit: 'shifts', get: () => agencyShifts, set: (v) => (agencyShifts = v) },
      { id: 'roi-exits', label: 'Nurses who left in the past year with scheduling as a factor', min: 0, max: 6, step: 1, unit: 'nurses', get: () => rnExits, set: (v) => (rnExits = v) },
    ] as s (s.id)}
      <div>
        <div class="mb-2 flex items-center justify-between gap-4">
          <label for={s.id} class="text-sm font-medium text-gray-700">{s.label}</label>
          <span class="shrink-0 text-sm font-bold text-primary tabular-nums">{s.get()} {s.unit}</span>
        </div>
        <input
          id={s.id}
          type="range"
          min={s.min}
          max={s.max}
          step={s.step}
          value={s.get()}
          oninput={(e) => s.set(+e.currentTarget.value)}
          class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-primary"
        />
        <div class="mt-1 flex justify-between text-xs text-muted tabular-nums">
          <span>{s.min}</span><span>{s.max}</span>
        </div>
      </div>
    {/each}
  </div>

  <!-- Rates -->
  <details class="mt-8 rounded-xl border border-hairline bg-white p-5" ontoggle={() => track('roi_rates_opened')}>
    <summary class="cursor-pointer text-sm font-semibold text-gray-800">Adjust the rates to match your hospital</summary>
    <div class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2" oninput={() => track('roi_rates_changed')}>
      <label class="block text-sm">
        <span class="text-gray-700">Nurse manager cost per hour</span>
        <input id="rate-mgr" type="number" min="0" step="1" bind:value={mgrRate} class="mt-1 block w-full rounded-lg border border-hairline px-3 py-2 tabular-nums" />
        <span class="mt-1 block text-xs text-muted">Our estimate, fully loaded</span>
      </label>
      <label class="block text-sm">
        <span class="text-gray-700">Overtime premium per hour</span>
        <input id="rate-ot" type="number" min="0" step="0.01" bind:value={otPremium} class="mt-1 block w-full rounded-lg border border-hairline px-3 py-2 tabular-nums" />
        <span class="mt-1 block text-xs text-muted">Half of average RN base pay (NSI)</span>
      </label>
      <label class="block text-sm">
        <span class="text-gray-700">Agency premium per hour over staff pay</span>
        <input id="rate-agency" type="number" min="0" step="0.01" bind:value={agencyPremium} class="mt-1 block w-full rounded-lg border border-hairline px-3 py-2 tabular-nums" />
        <span class="mt-1 block text-xs text-muted">$91.23 travel fee minus $59.46 staff RN pay (NSI)</span>
      </label>
      <label class="block text-sm">
        <span class="text-gray-700">Hours per agency shift</span>
        <input id="rate-shift" type="number" min="0" step="1" bind:value={agencyShiftHours} class="mt-1 block w-full rounded-lg border border-hairline px-3 py-2 tabular-nums" />
        <span class="mt-1 block text-xs text-muted">Use 8 if your unit runs 8-hour shifts</span>
      </label>
      <label class="block text-sm sm:col-span-2">
        <span class="text-gray-700">Cost to replace one RN</span>
        <input id="rate-replace" type="number" min="0" step="100" bind:value={replaceCost} class="mt-1 block w-full rounded-lg border border-hairline px-3 py-2 tabular-nums" />
        <span class="mt-1 block text-xs text-muted">Average cost of turnover for a bedside RN (NSI)</span>
      </label>
    </div>
    <p class="mt-4 text-xs text-muted">
      NSI figures are national averages from the
      <a href={NSI_LINK} target="_blank" rel="noopener noreferrer" class="underline underline-offset-2 hover:text-primary">2026 NSI National Health Care Retention &amp; RN Staffing Report</a>.
      Your hospital's pay may differ, so change any number to your own.
    </p>
  </details>

  <!-- Results -->
  <div class="mt-10 rounded-2xl border border-hairline bg-white p-6 shadow-sm sm:p-8" aria-live="polite">
    <p class="text-sm font-medium text-muted">What these four cost your hospital each year</p>
    <p class="mt-1 text-5xl font-bold tracking-tight text-gray-900 tabular-nums">{fmt(totalCost)}</p>

    <div class="mt-6 space-y-4">
      {#each rows as r (r.key)}
        <div>
          <div class="flex items-baseline justify-between gap-4 text-sm">
            <span class="text-gray-700">{r.label}</span>
            <span class="font-semibold tabular-nums">{fmt(r.value)}/yr</span>
          </div>
          <div class="mt-1.5 h-2 w-full rounded-full bg-gray-100">
            <div class="h-2 rounded-full bg-primary opacity-75 transition-all" style="width: {pct(r.value)}%"></div>
          </div>
        </div>
      {/each}
    </div>

    <p class="mt-5 text-xs text-muted">
      Not all of this comes from scheduling. It is what these four costs add up to with your numbers, so you can see
      where the money goes.
    </p>
  </div>

  <!-- Where SimpleScheduleAI helps -->
  <div class="mt-8 rounded-2xl border border-hairline bg-page p-6 sm:p-8">
    <h3 class="text-xl font-semibold text-gray-900">Where SimpleScheduleAI helps</h3>
    <ul class="mt-5 space-y-5">
      <li>
        <p class="text-sm font-semibold text-gray-900">Manager time</p>
        <p class="mt-1 text-sm text-default">Most of those hours go back to the floor. What's left is 1 to 2 hours of review.</p>
        {#if backHigh > 0}
          <p class="mt-1 text-sm font-semibold text-primary tabular-nums">
            {#if backLow > 0}About {fmt(backLow)} to {fmt(backHigh)}{:else}Up to {fmt(backHigh)}{/if} a year of manager time back,
            using your numbers.
          </p>
        {/if}
      </li>
      <li>
        <p class="text-sm font-semibold text-gray-900">Overtime</p>
        <p class="mt-1 text-sm text-default">
          Overtime shows up on the draft, before anyone works it. When someone calls out, nurses who can cover without
          going into overtime are ranked first.
        </p>
      </li>
      <li>
        <p class="text-sm font-semibold text-gray-900">Agency</p>
        <p class="mt-1 text-sm text-default">
          When someone calls out, you get a ranked list in under two minutes. Your own nurses come first. Agency comes
          last.
        </p>
      </li>
      <li>
        <p class="text-sm font-semibold text-gray-900">Turnover</p>
        <p class="mt-1 text-sm text-default">
          Weekends and holidays are shared evenly, so the same few nurses don't carry them.
        </p>
      </li>
    </ul>
  </div>

  <!-- Visitor's what-if -->
  <div class="mt-8 rounded-2xl border border-hairline bg-white p-6 sm:p-8" oninput={() => track('roi_whatif')}>
    <h3 class="text-xl font-semibold text-gray-900">Your what-if</h3>
    <p class="mt-1 text-sm text-muted">
      Set your own assumption. We don't quote savings percentages; these numbers are yours.
    </p>

    <div class="mt-6 space-y-6">
      <div>
        <div class="mb-2 flex items-center justify-between gap-4">
          <label for="whatif-agency" class="text-sm font-medium text-gray-700">Agency shifts a month your own nurses could cover instead</label>
          <span class="shrink-0 text-sm font-bold text-primary tabular-nums">{coverShiftsC} of {agencyShifts}</span>
        </div>
        <input
          id="whatif-agency"
          type="range"
          min="0"
          max={agencyShifts}
          step="1"
          bind:value={coverShifts}
          disabled={agencyShifts === 0}
          class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-primary disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <div>
        <div class="mb-2 flex items-center justify-between gap-4">
          <label for="whatif-ot" class="text-sm font-medium text-gray-700">Overtime hours a week you could avoid</label>
          <span class="shrink-0 text-sm font-bold text-primary tabular-nums">{avoidOtC} of {otHours} hrs</span>
        </div>
        <input
          id="whatif-ot"
          type="range"
          min="0"
          max={otHours}
          step="4"
          bind:value={avoidOt}
          disabled={otHours === 0}
          class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-primary disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    </div>

    <div class="mt-6 grid grid-cols-1 gap-4 border-t border-hairline pt-5 sm:grid-cols-2">
      <div>
        <p class="text-xs font-semibold uppercase tracking-widest text-muted">Your what-if</p>
        <p class="mt-1 text-2xl font-bold text-gray-900 tabular-nums">{fmt(whatIf)}/yr</p>
      </div>
      <div>
        <p class="text-xs font-semibold uppercase tracking-widest text-muted">With manager time back</p>
        <p class="mt-1 text-2xl font-bold text-primary tabular-nums">
          {#if backLow !== backHigh}{fmt(whatIf + backLow)} to {fmt(whatIf + backHigh)}/yr{:else}{fmt(whatIf + backHigh)}/yr{/if}
        </p>
      </div>
    </div>
  </div>

  <!-- Email me a one-page breakdown (work emails only) -->
  {#if showBreakdownForm}
    <div class="mt-8 rounded-2xl border border-hairline bg-page p-6 sm:p-8">
      <h3 class="text-xl font-semibold text-gray-900">Email me a one-page breakdown of my numbers</h3>
      <p class="mt-1 text-sm text-muted">
        Your costs, the rates behind them and your what-if on one page, ready to forward to your CEO or CFO.
      </p>
      <form class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2" onsubmit={requestBreakdown} novalidate>
        <div class="sm:col-span-2">
          <label for="bd-email" class="mb-1 block text-sm font-medium">Work email</label>
          <input id="bd-email" type="email" bind:value={bdEmail} class={fieldClass} placeholder="you@yourhospital.org" autocomplete="email" required />
        </div>
        <div>
          <label for="bd-hospital" class="mb-1 block text-sm font-medium">Hospital or organization</label>
          <input id="bd-hospital" type="text" bind:value={bdHospital} class={fieldClass} autocomplete="organization" required />
        </div>
        <div>
          <label for="bd-role" class="mb-1 block text-sm font-medium">Your role</label>
          <select id="bd-role" bind:value={bdRole} class={fieldClass} required>
            <option value="">Select your role</option>
            {#each ROLES as r (r)}<option value={r}>{r}</option>{/each}
          </select>
        </div>
        <input type="text" name="website" bind:value={bdTrap} class="hidden" tabindex="-1" autocomplete="off" aria-hidden="true" />
        <div class="sm:col-span-2">
          <button type="submit" class="btn btn-primary w-full" disabled={bdSending}>
            {bdSending ? 'Sending...' : 'Email me my breakdown'}
          </button>
          {#if bdError}
            <p class="mt-3 rounded-lg bg-red-100 p-3 text-sm text-red-800" role="alert">{bdError}</p>
          {/if}
          {#if bdDone}
            <p class="mt-3 rounded-lg bg-green-100 p-3 text-sm text-green-800" role="status">{bdDone}</p>
          {/if}
          <p class="mt-3 text-xs text-muted">Work email only, no personal accounts.</p>
        </div>
      </form>
    </div>
  {/if}

  <!-- CTA: one button + Book-a-call text link -->
  <div class="mt-10 text-center">
    <h3 class="text-xl font-semibold text-gray-900">Want to walk through these numbers for your hospital?</h3>
    <p class="mx-auto mt-2 max-w-xl text-sm text-muted">
      We'll go through your unit and show you what next week's schedule would look like. Nothing needed from your side
      to start.
    </p>
    <div class="mt-5">
      <a href="/contact" class="btn btn-primary inline-flex px-6 py-3 text-base" onclick={() => track('roi_cta_contact')}>
        Get your first schedule
      </a>
    </div>
    <a
      href={CALL_LINK}
      target="_blank"
      rel="noopener noreferrer"
      class="mt-3 inline-block text-sm font-medium text-primary underline underline-offset-4"
      onclick={() => track('roi_cta_call')}
    >
      Or book a call with our team
    </a>
  </div>
</div>
