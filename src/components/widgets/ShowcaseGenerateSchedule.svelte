<script>
  import { onMount } from 'svelte';

  // Each cell: date label, shift label, and two nurses
  const cells = [
    {
      date: 'Mon, Mar 2',
      shift: 'Day',
      nurses: [
        { name: 'Carol A.', charge: true },
        { name: 'Dan B.', charge: false },
      ],
    },
    {
      date: 'Mon, Mar 2',
      shift: 'Night',
      nurses: [
        { name: 'Emma C.', charge: true },
        { name: 'Frank D.', charge: false },
      ],
    },
    {
      date: 'Tue, Mar 3',
      shift: 'Day',
      nurses: [
        { name: 'Dan B.', charge: true },
        { name: 'Grace E.', charge: false },
      ],
    },
    {
      date: 'Tue, Mar 3',
      shift: 'Night',
      nurses: [
        { name: 'Carol A.', charge: true },
        { name: 'Hank F.', charge: false },
      ],
    },
    {
      date: 'Wed, Mar 4',
      shift: 'Day',
      nurses: [
        { name: 'Grace E.', charge: true },
        { name: 'Emma C.', charge: false },
      ],
    },
    {
      date: 'Wed, Mar 4',
      shift: 'Night',
      nurses: [
        { name: 'Frank D.', charge: true },
        { name: 'Dan B.', charge: false },
      ],
    },
  ];

  // Total chips = 12 (2 per cell × 6 cells)
  // chip index = cellIndex * 2 + nurseIndex
  let phase = $state(0); // 0=empty, 1=filling, 2=complete, 3=pause
  let filledChips = $state(0); // 0–12
  let buttonPulse = $state(false);

  // How many chips are visible in cell i
  function cellFilledCount(cellIdx) {
    const base = cellIdx * 2;
    return Math.min(2, Math.max(0, filledChips - base));
  }

  function isCellComplete(cellIdx) {
    return cellFilledCount(cellIdx) === 2;
  }

  onMount(() => {
    const timers = [];

    function schedule(fn, delay) {
      const id = setTimeout(fn, delay);
      timers.push(id);
      return id;
    }

    function runLoop() {
      phase = 0;
      filledChips = 0;
      buttonPulse = false;

      // Phase 0 → 1: after 2s, pulse button then start filling
      schedule(() => {
        buttonPulse = true;
        phase = 1;

        // Fill 12 chips, one every 220ms
        for (let i = 0; i < 12; i++) {
          schedule(() => {
            filledChips = i + 1;
          }, 300 + i * 220);
        }
      }, 2000);

      // Phase 2: all complete banner — at 2000 + 300 + 11*220 + 200 ≈ 5000ms
      schedule(() => {
        phase = 2;
        buttonPulse = false;
      }, 5000);

      // Phase 3: pause
      schedule(() => {
        phase = 3;
      }, 6500);

      // Reset and loop
      schedule(runLoop, 8000);
    }

    runLoop();

    return () => timers.forEach(clearTimeout);
  });
</script>

<!-- Schedule grid widget -->
<div class="rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden dark:bg-slate-900 dark:border-slate-700">

  <!-- Window chrome -->
  <div class="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
    <span class="h-2.5 w-2.5 rounded-full bg-gray-400 dark:bg-slate-600"></span>
    <span class="h-2.5 w-2.5 rounded-full bg-gray-400 dark:bg-slate-600"></span>
    <span class="h-2.5 w-2.5 rounded-full bg-gray-400 dark:bg-slate-600"></span>
    <span class="ml-3 text-xs text-gray-500 dark:text-gray-400 font-mono">ICU · Week of Mar 2</span>
  </div>

  <!-- Column headers -->
  <div class="grid border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
    style="grid-template-columns: 5.5rem 1fr 1fr">
    <span></span>
    <span class="pr-2">
      Day Shift
      <span class="block font-normal normal-case tracking-normal text-gray-400 dark:text-gray-500">07:00–19:00</span>
    </span>
    <span>
      Night Shift
      <span class="block font-normal normal-case tracking-normal text-gray-400 dark:text-gray-500">19:00–07:00</span>
    </span>
  </div>

  <!-- Rows: Mon, Tue, Wed -->
  {#each ['Mon, Mar 2', 'Tue, Mar 3', 'Wed, Mar 4'] as date, rowIdx}
    <div
      class="grid border-b border-gray-100 dark:border-slate-700/50 px-3 py-2.5 last:border-b-0"
      style="grid-template-columns: 5.5rem 1fr 1fr"
    >
      <!-- Date label -->
      <div class="flex flex-col justify-start pt-0.5">
        <span class="text-xs font-semibold text-gray-700 dark:text-gray-300">{date}</span>
      </div>

      <!-- Day cell (even cell index: rowIdx*2) -->
      {#each [0, 1] as shiftIdx}
        {@const cellIdx = rowIdx * 2 + shiftIdx}
        {@const filled = cellFilledCount(cellIdx)}
        {@const complete = isCellComplete(cellIdx)}
        <div
          class="rounded-lg border p-2 transition-all duration-500 {shiftIdx === 0 ? 'mr-2' : ''}
            {complete
              ? 'border-green-400 bg-green-50 dark:bg-green-950/30 dark:border-green-700'
              : 'border-gray-200 bg-gray-50 dark:bg-slate-800 dark:border-slate-600'}"
        >
          <!-- Cell header: counter top-right -->
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[10px] text-gray-400 dark:text-gray-500">
              {#if complete}
                <span class="text-green-600 dark:text-green-400">✓</span>
              {/if}
            </span>
            <span class="text-[10px] font-semibold {complete ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}">
              {filled}/2
            </span>
          </div>

          {#if phase === 0}
            <!-- Empty state -->
            <p class="text-[11px] italic text-gray-400 dark:text-gray-500">No staff assigned</p>
          {:else}
            <!-- Chip list -->
            <ul class="space-y-1">
              {#each cells[cellIdx].nurses as nurse, nIdx}
                {#if nIdx < filled}
                  <li class="flex items-center gap-1.5 text-xs">
                    <span class="h-2 w-2 rounded-full shrink-0 {nurse.charge ? 'bg-blue-500' : 'bg-gray-400'}"></span>
                    <span class="text-gray-800 dark:text-gray-200 font-medium">{nurse.name}</span>
                    <span class="text-[10px] text-gray-400 dark:text-gray-500">RN</span>
                    {#if nurse.charge}
                      <span class="ml-auto text-[9px] bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded px-1 py-0.5 font-semibold uppercase tracking-wide">Charge</span>
                    {/if}
                  </li>
                {:else}
                  <!-- Placeholder for not-yet-filled chip -->
                  <li class="h-4"></li>
                {/if}
              {/each}
            </ul>
          {/if}
        </div>
      {/each}
    </div>
  {/each}

  <!-- Generate button / banner -->
  <div class="px-3 py-3 bg-gray-50 dark:bg-slate-800/40 border-t border-gray-200 dark:border-slate-700">
    {#if phase === 2 || phase === 3}
      <!-- Success banner -->
      <div class="flex items-center justify-center gap-2 rounded-lg bg-green-100 dark:bg-green-950/40 border border-green-400 px-4 py-2 text-sm font-semibold text-green-700 dark:text-green-400">
        ✓ All shifts filled · 0 violations
      </div>
    {:else}
      <!-- Generate button -->
      <button
        class="flex w-full items-center justify-center gap-2 rounded-lg border border-primary bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-all duration-300
          {buttonPulse ? 'scale-105 bg-primary text-white shadow-md' : ''}"
        disabled
      >
        {#if buttonPulse}
          <span class="inline-block animate-spin">⟳</span> Generating…
        {:else}
          Generate Schedule ▶
        {/if}
      </button>
    {/if}
  </div>
</div>
