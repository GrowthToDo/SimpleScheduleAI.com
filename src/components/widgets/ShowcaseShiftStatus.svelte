<script>
  import { onMount } from 'svelte';

  let highlight = $state(null); // null | 'B' | 'C'
  let showPopup = $state(false);

  onMount(() => {
    const timers = [];

    function schedule(fn, delay) {
      const id = setTimeout(fn, delay);
      timers.push(id);
      return id;
    }

    function runLoop() {
      highlight = null;
      showPopup = false;

      // t=2000: highlight B
      schedule(() => {
        highlight = 'B';
        showPopup = true;
      }, 2000);

      // t=4500: highlight C
      schedule(() => {
        highlight = 'C';
        showPopup = true;
      }, 4500);

      // t=7000: back to overview
      schedule(() => {
        highlight = null;
        showPopup = false;
      }, 7000);

      // t=10000: loop
      schedule(runLoop, 10000);
    }

    runLoop();

    return () => timers.forEach(clearTimeout);
  });

  function cellClass(cell) {
    const isHighlighted = highlight === cell;
    const isOther = highlight !== null && highlight !== cell;
    return [
      'relative rounded-xl border p-3 transition-all duration-300',
      cell === 'A' ? 'border-green-400 bg-green-50 dark:bg-green-950/30 dark:border-green-700' : '',
      cell === 'B' ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-600' : '',
      cell === 'C' ? 'border-red-400 bg-red-50 dark:bg-red-950/30 dark:border-red-700' : '',
      isHighlighted ? 'scale-105 shadow-lg z-10' : '',
      isOther ? 'opacity-40' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }
</script>

<div class="relative space-y-3 select-none">

  <!-- Cell A: Fully staffed (green) -->
  <div class={cellClass('A')}>
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs font-bold text-green-800 dark:text-green-300">Day Shift · 2/2</span>
    </div>
    <ul class="space-y-1 mb-2">
      <li class="flex items-center gap-1.5 text-xs">
        <span class="h-2 w-2 rounded-full bg-blue-500 shrink-0"></span>
        <span class="font-medium text-gray-800 dark:text-gray-200">Carol A.</span>
        <span class="text-gray-400 text-[10px]">RN</span>
      </li>
      <li class="flex items-center gap-1.5 text-xs">
        <span class="h-2 w-2 rounded-full bg-gray-400 shrink-0"></span>
        <span class="font-medium text-gray-800 dark:text-gray-200">Dan B.</span>
        <span class="text-gray-400 text-[10px]">RN</span>
      </li>
    </ul>
    <p class="text-[11px] font-semibold text-green-700 dark:text-green-400">✓ Fully staffed</p>
  </div>

  <!-- Cell B: Overtime warning (yellow) -->
  <div class={cellClass('B')}>
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs font-bold text-yellow-800 dark:text-yellow-300">Day Shift · 2/2</span>
      <span class="text-sm text-yellow-600 dark:text-yellow-400">⚠</span>
    </div>
    <ul class="space-y-1 mb-2">
      <li class="flex items-center gap-1.5 text-xs">
        <span class="h-2 w-2 rounded-full bg-blue-500 shrink-0"></span>
        <span class="font-medium text-gray-800 dark:text-gray-200">Carol A.</span>
        <span class="text-gray-400 text-[10px]">RN</span>
      </li>
      <li class="flex items-center gap-1.5 text-xs">
        <span class="h-2 w-2 rounded-full bg-gray-400 shrink-0"></span>
        <span class="font-medium text-gray-800 dark:text-gray-200">Dan B.</span>
        <span class="text-gray-400 text-[10px]">RN</span>
        <span class="ml-1 rounded bg-red-100 px-1 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-900 dark:text-red-300">OT</span>
      </li>
    </ul>
    <p class="text-[11px] font-semibold text-yellow-700 dark:text-yellow-400">⚠ Dan already at 36h this week — overtime cost if assigned</p>

    <!-- Popup for B -->
    {#if highlight === 'B' && showPopup}
      <div
        class="absolute left-0 right-0 top-full mt-2 z-20 rounded-xl border border-yellow-400 bg-yellow-50 dark:bg-yellow-950 p-3 shadow-xl transition-all duration-300 lg:left-auto lg:right-auto lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-[calc(100%+0.75rem)] lg:w-56"
      >
        <p class="text-xs font-bold text-yellow-800 dark:text-yellow-300 mb-1">⚠ Shift Issues (1)</p>
        <p class="text-[11px] font-semibold text-yellow-700 dark:text-yellow-400 mb-0.5">Overtime Risk</p>
        <p class="text-[11px] text-yellow-700 dark:text-yellow-400">Dan B. is at 36h — this shift adds OT cost.</p>
      </div>
    {/if}
  </div>

  <!-- Cell C: Missing charge nurse (red) -->
  <div class={cellClass('C')}>
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs font-bold text-red-800 dark:text-red-300">Day Shift · 1/2</span>
      <span class="text-sm text-red-600 dark:text-red-400">✕</span>
    </div>
    <ul class="space-y-1 mb-2">
      <li class="flex items-center gap-1.5 text-xs">
        <span class="h-2 w-2 rounded-full bg-gray-400 shrink-0"></span>
        <span class="font-medium text-gray-800 dark:text-gray-200">Emma C.</span>
        <span class="text-gray-400 text-[10px]">RN</span>
      </li>
    </ul>
    <p class="text-[11px] font-semibold text-red-700 dark:text-red-400">✕ Charge nurse required — must fix before publishing</p>

    <!-- Popup for C -->
    {#if highlight === 'C' && showPopup}
      <div
        class="absolute left-0 right-0 top-full mt-2 z-20 rounded-xl border border-red-400 bg-red-50 dark:bg-red-950 p-3 shadow-xl transition-all duration-300 lg:left-auto lg:right-auto lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-[calc(100%+0.75rem)] lg:w-56"
      >
        <p class="text-xs font-bold text-red-800 dark:text-red-300 mb-1">✕ Shift Issues (1)</p>
        <p class="text-[11px] font-semibold text-red-700 dark:text-red-400 mb-0.5">Charge Nurse Required</p>
        <p class="text-[11px] text-red-700 dark:text-red-400">This shift requires a designated charge nurse.</p>
      </div>
    {/if}
  </div>

</div>
