<script>
  import { onMount } from 'svelte';

  let phase = $state('scanning'); // 'scanning' | 'checking' | 'done'
  let checkedCount = $state(0);

  const complianceRules = [
    'Charge nurse on every shift',
    'Minimum RN-to-patient ratio met per shift',
    'Minimum rest between shifts (default 10h)',
    'Maximum 5 working days per 7-day period',
    'No double-booking: no overlapping shifts',
    'No scheduling during approved PTO',
    'PRN staff within contracted availability',
    'On-call shift limits enforced (max 1/week, 1 weekend/month)',
    'ICU and ER assignments require Level 4+ competency',
    'Level 1 nurses require Level 5 preceptor on shift',
    'Level 2 nurses in ICU/ER require Level 4+ supervision',
    'Minimum total staff count per shift',
    'Maximum 60 hours in any 7-day rolling period',
  ];

  const fairnessGoals = [
    'Weekend equity: max 3 weekends per 6-week period',
    'Holiday shifts distributed fairly, tracked annually',
    'Charge duty distributed evenly across eligible staff',
    'Consecutive weekends capped (max 2 in a row)',
    'Staff shift preferences honored when possible',
    'Overtime spread evenly when OT is unavoidable',
    'Extra hours above FTE minimized per nurse',
    'Float pool assignments rotated fairly',
  ];

  const allRules = [...complianceRules, ...fairnessGoals];

  onMount(() => {
    const timers = [];

    function schedule(fn, delay) {
      const id = setTimeout(fn, delay);
      timers.push(id);
      return id;
    }

    function runLoop() {
      phase = 'scanning';
      checkedCount = 0;

      schedule(() => {
        phase = 'checking';
        for (let i = 0; i <= 20; i++) {
          const idx = i;
          schedule(() => {
            checkedCount = idx + 1;
          }, idx * 450);
        }
      }, 1500);

      schedule(() => {
        phase = 'done';
      }, 11000);

      schedule(runLoop, 14000);
    }

    runLoop();

    return () => timers.forEach(clearTimeout);
  });
</script>

<div
  class="rounded-xl border border-gray-700 bg-slate-900 shadow-lg overflow-hidden font-mono text-sm min-h-[660px]"
  class:ring-2={phase === 'done'}
  class:ring-green-400={phase === 'done'}
>
  <!-- Top bar -->
  <div class="flex items-center justify-between border-b border-gray-700 px-4 py-3 bg-slate-800/60">
    <span class="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
      Compliance Scan — 09:47:22 PM
    </span>
    <span class="text-[11px] font-bold {checkedCount === 21 ? 'text-green-400' : 'text-gray-400'}">
      {checkedCount} / 21
    </span>
  </div>

  <div class="p-5">

    <!-- Scanning phase -->
    {#if phase === 'scanning'}
      <div class="flex items-center gap-3 py-6 justify-center">
        <span class="h-2 w-2 rounded-full bg-gray-500 animate-pulse"></span>
        <span class="text-gray-400 text-sm">Running compliance scan...</span>
      </div>

    <!-- Checking / Done phase -->
    {:else}
      <!-- Compliance rules divider -->
      <p class="mb-2 text-[10px] font-semibold uppercase tracking-widest text-red-400">— 13 Compliance Rules —</p>

      <ul class="space-y-1 mb-4">
        {#each complianceRules as rule, i}
          {#if checkedCount > i}
            <li class="flex items-center gap-2 text-green-400 text-[11px]">
              <span class="shrink-0">✓</span>
              <span>{rule}</span>
            </li>
          {/if}
        {/each}
      </ul>

      <!-- Fairness goals divider — only show once we reach them -->
      {#if checkedCount > 13}
        <p class="mb-2 text-[10px] font-semibold uppercase tracking-widest text-blue-400">— 8 Fairness Goals —</p>
        <ul class="space-y-1 mb-4">
          {#each fairnessGoals as goal, i}
            {#if checkedCount > 13 + i}
              <li class="flex items-center gap-2 text-green-400 text-[11px]">
                <span class="shrink-0">✓</span>
                <span>{goal}</span>
              </li>
            {/if}
          {/each}
        </ul>
      {/if}

      <!-- Done banner -->
      {#if phase === 'done'}
        <div class="mt-2 rounded-lg bg-green-900/30 border border-green-700 px-4 py-3 text-center">
          <span class="text-green-400 font-semibold text-sm">✓ 21 / 21 — Schedule is compliant. Ready for your review.</span>
        </div>
      {/if}
    {/if}

  </div>
</div>
