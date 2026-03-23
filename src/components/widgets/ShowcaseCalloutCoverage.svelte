<script>
  import { onMount } from 'svelte';

  let frame = $state(0); // 0=covered, 1=callout, 2=candidates, 3=filled

  const steps = [
    { label: 'Shift covered' },
    { label: 'Callout logged' },
    { label: 'Finding replacement' },
    { label: 'Replacement confirmed' },
  ];

  onMount(() => {
    const timers = [];

    function schedule(fn, delay) {
      const id = setTimeout(fn, delay);
      timers.push(id);
      return id;
    }

    function runLoop() {
      frame = 0;

      schedule(() => { frame = 1; }, 3000);
      schedule(() => { frame = 2; }, 6000);
      schedule(() => { frame = 3; }, 11000);
      schedule(runLoop, 14000);
    }

    runLoop();

    return () => timers.forEach(clearTimeout);
  });
</script>

<div class="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg overflow-hidden flex flex-col">

  <!-- Step indicator strip -->
  <div class="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 px-4 py-3">
    <div class="flex items-center gap-2 mb-1.5">
      {#each steps as step, i}
        <span class="h-2 w-2 rounded-full transition-colors duration-500 {i === frame ? 'bg-primary' : 'bg-gray-300 dark:bg-slate-600'}"></span>
      {/each}
    </div>
    <p class="text-[11px] font-semibold text-primary uppercase tracking-widest">
      Step {frame + 1} of 4 — {steps[frame].label}
    </p>
  </div>

  <!-- Frame 0: Shift covered (green badge) -->
  {#if frame === 0}
    <div class="flex-1 p-5 flex flex-col justify-center min-h-[280px]">
      <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Current schedule</p>
      <div class="rounded-xl border-2 border-green-400 bg-green-50 dark:bg-green-950/30 p-4">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-bold text-gray-800 dark:text-gray-200">Wed Mar 4 · Day Shift</span>
          <span class="rounded-full bg-green-100 dark:bg-green-900 border border-green-400 px-2.5 py-0.5 text-[11px] font-semibold text-green-700 dark:text-green-400">filled ✓</span>
        </div>
        <ul class="space-y-1.5">
          <li class="flex items-center gap-2 text-sm">
            <span class="h-2 w-2 rounded-full bg-blue-500 shrink-0"></span>
            <span class="font-medium text-gray-800 dark:text-gray-200">Emma C.</span>
            <span class="text-gray-400 text-xs">RN</span>
            <span class="ml-auto text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded px-1.5 py-0.5 font-semibold">Charge Nurse</span>
          </li>
          <li class="flex items-center gap-2 text-sm">
            <span class="h-2 w-2 rounded-full bg-gray-400 shrink-0"></span>
            <span class="font-medium text-gray-800 dark:text-gray-200">Grace E.</span>
            <span class="text-gray-400 text-xs">RN</span>
          </li>
        </ul>
      </div>
    </div>

  <!-- Frame 1: Callout logged -->
  {:else if frame === 1}
    <div class="flex-1 p-5 flex flex-col justify-center min-h-[280px]">
      <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-red-500">9:14 PM — Callout received</p>
      <div class="rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-4 mb-3">
        <div class="flex items-center justify-between">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Wed Mar 4 · Day Shift</span>
          <span class="rounded-full bg-red-100 dark:bg-red-900 border border-red-400 px-2 py-0.5 text-[11px] font-semibold text-red-700 dark:text-red-400">open</span>
        </div>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Emma C. called out · <span class="font-medium">Sick</span></p>
      </div>
      <button
        class="w-full rounded-lg border-2 border-red-400 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400"
        disabled
      >
        Find Replacement
      </button>
    </div>

  <!-- Frame 2: Candidate dialog -->
  {:else if frame === 2}
    <div class="flex-1 p-4 flex flex-col min-h-[280px]">
      <p class="mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Replacement Candidates</p>

      <!-- Amber warning banner -->
      <div class="mb-3 rounded-lg border border-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 px-3 py-2">
        <p class="text-[11px] font-semibold text-yellow-800 dark:text-yellow-300">⚠ Emma held charge role. Only charge-qualified staff shown.</p>
      </div>

      <!-- Candidate 1: Carol A. -->
      <div class="mb-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs font-bold text-gray-700 dark:text-gray-200">1. Carol A.</span>
          <span class="text-[10px] text-gray-400">RN</span>
          <span class="rounded px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Float Pool</span>
          <span class="ml-auto text-[11px] text-gray-500 dark:text-gray-400">24h this week</span>
        </div>
        <ul class="space-y-0.5 mb-2 text-[11px]">
          <li class="flex items-center gap-1.5 text-green-700 dark:text-green-400"><span>✓</span> Available for this shift</li>
          <li class="flex items-center gap-1.5 text-green-700 dark:text-green-400"><span>✓</span> Charge nurse qualified</li>
          <li class="flex items-center gap-1.5 text-green-700 dark:text-green-400"><span>✓</span> Within contracted hours</li>
          <li class="flex items-center gap-1.5 text-gray-400 dark:text-gray-500"><span>·</span> Rest before shift: 14h</li>
        </ul>
        <button class="w-full rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white" disabled>Assign</button>
      </div>

      <!-- Candidate 2: Dan B. -->
      <div class="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs font-bold text-gray-700 dark:text-gray-200">2. Dan B.</span>
          <span class="text-[10px] text-gray-400">RN</span>
          <span class="rounded px-1.5 py-0.5 text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Per Diem</span>
          <span class="ml-auto text-[11px] text-gray-500 dark:text-gray-400">36h this week</span>
        </div>
        <ul class="space-y-0.5 mb-2 text-[11px]">
          <li class="flex items-center gap-1.5 text-green-700 dark:text-green-400"><span>✓</span> Available for this shift</li>
          <li class="flex items-center gap-1.5 text-green-700 dark:text-green-400"><span>✓</span> Charge nurse qualified</li>
          <li class="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400"><span>⚠</span> 36h this week — OT if assigned</li>
          <li class="flex items-center gap-1.5 text-gray-400 dark:text-gray-500"><span>·</span> Rest before shift: 10h</li>
        </ul>
        <button class="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300" disabled>Assign</button>
      </div>
    </div>

  <!-- Frame 3: Shift filled with Carol (blue badge) -->
  {:else if frame === 3}
    <div class="flex-1 p-5 flex flex-col justify-center min-h-[280px]">
      <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Replacement confirmed</p>
      <div class="rounded-xl border-2 border-blue-400 bg-blue-50 dark:bg-blue-950/30 p-4">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-bold text-gray-800 dark:text-gray-200">Wed Mar 4 · Day Shift</span>
          <span class="rounded-full bg-blue-100 dark:bg-blue-900 border border-blue-400 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 dark:text-blue-400">filled ✓</span>
        </div>
        <ul class="space-y-1.5">
          <li class="flex items-center gap-2 text-sm">
            <span class="h-2 w-2 rounded-full bg-blue-500 shrink-0"></span>
            <span class="font-medium text-gray-800 dark:text-gray-200">Carol A.</span>
            <span class="text-gray-400 text-xs">RN</span>
            <span class="ml-auto text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded px-1.5 py-0.5 font-semibold">Charge Nurse</span>
          </li>
          <li class="flex items-center gap-2 text-sm">
            <span class="h-2 w-2 rounded-full bg-gray-400 shrink-0"></span>
            <span class="font-medium text-gray-800 dark:text-gray-200">Grace E.</span>
            <span class="text-gray-400 text-xs">RN</span>
          </li>
        </ul>
      </div>
    </div>
  {/if}

</div>
