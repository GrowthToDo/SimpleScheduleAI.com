<script>
  let { googleScriptUrl } = $props();

  // --- Slider state ---
  let mgmtHours   = $state(10);   // hours/week manager spends on scheduling
  let otHours     = $state(48);   // total overtime hours per week across all RNs
  let agencyShifts = $state(3);   // agency shifts per month
  let rnExits     = $state(2);    // RN exits in past year where scheduling was a factor

  // --- Derived costs ---
  // Manager time: hours/week × 52 weeks × $50 fully loaded rate
  let mgmtCost     = $derived(Math.round(mgmtHours * 52 * 50));
  // OT premium: hours/week × 52 weeks × $19 OT premium
  let otCost       = $derived(Math.round(otHours * 52 * 19));
  // Agency: shifts/month × 8 hr shift × $95/hr × 12 months
  let agencyCost   = $derived(Math.round(agencyShifts * 8 * 95 * 12));
  // Turnover: exits × $61,000 replacement cost
  let turnoverCost = $derived(rnExits * 61000);
  let totalCost    = $derived(mgmtCost + otCost + agencyCost + turnoverCost);

  // --- UI state ---
  let showForm    = $state(false);
  let showResults = $state(false);
  let submitting  = $state(false);
  let submitError = $state(false);

  // --- Form fields ---
  let formName     = $state("");
  let formTitle    = $state("");
  let formHospital = $state("");
  let formEmail    = $state("");

  function fmt(n) {
    return "$" + n.toLocaleString("en-US");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    submitting  = true;
    submitError = false;

    const payload = {
      timestamp:    new Date().toISOString(),
      name:         formName,
      title:        formTitle,
      hospital:     formHospital,
      email:        formEmail,
      mgmtHours,
      otHours,
      agencyShifts,
      rnExits,
      mgmtCost,
      otCost,
      agencyCost,
      turnoverCost,
      totalCost,
    };

    try {
      await fetch(googleScriptUrl, {
        method:  "POST",
        mode:    "no-cors",
        headers: { "Content-Type": "text/plain" },
        body:    JSON.stringify(payload),
      });
      showResults = true;
    } catch {
      submitError = true;
    } finally {
      submitting = false;
    }
  }
</script>

<div class="mx-auto max-w-2xl">

  <!-- Sliders -->
  <div class="space-y-8">

    <!-- Slider 1: Manager hours -->
    <div>
      <div class="mb-2 flex items-center justify-between">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
          Hours your manager spends on scheduling each week
        </label>
        <span class="ml-4 shrink-0 text-sm font-bold text-primary">{mgmtHours} hrs</span>
      </div>
      <input
        type="range" min="2" max="20" step="1"
        bind:value={mgmtHours}
        class="w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700 accent-blue-600 h-2"
      />
      <div class="mt-1 flex justify-between text-xs text-muted">
        <span>2 hrs</span><span>20 hrs</span>
      </div>
    </div>

    <!-- Slider 2: OT hours -->
    <div>
      <div class="mb-2 flex items-center justify-between">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
          Total overtime hours per week (all RNs combined)
        </label>
        <span class="ml-4 shrink-0 text-sm font-bold text-primary">{otHours} hrs</span>
      </div>
      <input
        type="range" min="0" max="120" step="4"
        bind:value={otHours}
        class="w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700 accent-blue-600 h-2"
      />
      <div class="mt-1 flex justify-between text-xs text-muted">
        <span>0 hrs</span><span>120 hrs</span>
      </div>
    </div>

    <!-- Slider 3: Agency shifts -->
    <div>
      <div class="mb-2 flex items-center justify-between">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
          Agency shifts called in per month
        </label>
        <span class="ml-4 shrink-0 text-sm font-bold text-primary">{agencyShifts} {agencyShifts === 1 ? "shift" : "shifts"}</span>
      </div>
      <input
        type="range" min="0" max="20" step="1"
        bind:value={agencyShifts}
        class="w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700 accent-blue-600 h-2"
      />
      <div class="mt-1 flex justify-between text-xs text-muted">
        <span>0</span><span>20 shifts</span>
      </div>
    </div>

    <!-- Slider 4: RN exits -->
    <div>
      <div class="mb-2 flex items-center justify-between">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
          Nurse exits in the past year where scheduling was a factor
        </label>
        <span class="ml-4 shrink-0 text-sm font-bold text-primary">{rnExits} {rnExits === 1 ? "exit" : "exits"}</span>
      </div>
      <input
        type="range" min="0" max="6" step="1"
        bind:value={rnExits}
        class="w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700 accent-blue-600 h-2"
      />
      <div class="mt-1 flex justify-between text-xs text-muted">
        <span>0</span><span>6 exits</span>
      </div>
    </div>

  </div>
  <!-- end sliders -->

  <!-- Gate / Results -->
  {#if !showResults}

    <!-- Blurred teaser card -->
    <div class="mt-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 p-8 text-center shadow-sm">
      <p class="text-sm text-muted">Your estimated hidden scheduling cost</p>
      <div class="pointer-events-none mt-2 select-none text-5xl font-bold tracking-tight blur-2xl">
        $222,784
      </div>
      <p class="mt-3 text-sm text-muted">Enter your details to reveal your number</p>

      {#if !showForm}
        <button
          onclick={() => (showForm = true)}
          class="btn-primary mt-5"
        >
          Reveal My Cost Breakdown
        </button>
      {:else}
        <!-- Contact gate form -->
        <form onsubmit={handleSubmit} class="mt-6 space-y-3 text-left">
          <input
            type="text"
            placeholder="Your name"
            bind:value={formName}
            required
            class="block w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <input
            type="text"
            placeholder="Your title (e.g. CNO, Nurse Manager)"
            bind:value={formTitle}
            required
            class="block w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <input
            type="text"
            placeholder="Hospital name"
            bind:value={formHospital}
            required
            class="block w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <input
            type="email"
            placeholder="Work email"
            bind:value={formEmail}
            required
            class="block w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />

          {#if submitError}
            <p class="text-sm text-red-600">Something went wrong. Please try again.</p>
          {/if}

          <button
            type="submit"
            disabled={submitting}
            class="w-full rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Calculating…" : "Show My Results"}
          </button>

          <p class="text-center text-xs text-muted">
            No spam. We'll follow up once and only if we think we can help.
          </p>
        </form>
      {/if}
    </div>

  {:else}

    <!-- Full breakdown revealed -->
    <div class="mt-10 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-8 shadow-sm">
      <h3 class="mb-6 text-center text-lg font-semibold">
        Your estimated hidden scheduling cost
      </h3>

      <div class="space-y-3">
        <div class="flex items-center justify-between border-b border-blue-100 dark:border-blue-900 py-2">
          <span class="text-sm text-gray-700 dark:text-gray-300">Nurse manager time on scheduling</span>
          <span class="text-sm font-semibold">{fmt(mgmtCost)}/yr</span>
        </div>
        <div class="flex items-center justify-between border-b border-blue-100 dark:border-blue-900 py-2">
          <span class="text-sm text-gray-700 dark:text-gray-300">Overtime premium cost</span>
          <span class="text-sm font-semibold">{fmt(otCost)}/yr</span>
        </div>
        <div class="flex items-center justify-between border-b border-blue-100 dark:border-blue-900 py-2">
          <span class="text-sm text-gray-700 dark:text-gray-300">Agency fill cost</span>
          <span class="text-sm font-semibold">{fmt(agencyCost)}/yr</span>
        </div>
        <div class="flex items-center justify-between border-b border-blue-100 dark:border-blue-900 py-2">
          <span class="text-sm text-gray-700 dark:text-gray-300">Turnover from scheduling-related exits</span>
          <span class="text-sm font-semibold">{fmt(turnoverCost)}/yr</span>
        </div>
        <div class="flex items-center justify-between pt-3">
          <span class="text-base font-bold">Total hidden scheduling cost</span>
          <span class="text-2xl font-bold text-primary">{fmt(totalCost)}/yr</span>
        </div>
      </div>

      <p class="mt-4 text-center text-xs text-muted">
        Rates based on interviews with 30+ Texas CAH nurse managers. Manager rate $50/hr fully loaded,
        OT premium $19/hr, agency $95/hr, RN replacement cost $61,000.
      </p>

      <div class="mt-6 text-center">
        <a
          href="/contact"
          class="inline-flex items-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-secondary"
        >
          Get your first schedule
        </a>
      </div>
    </div>

  {/if}

</div>
