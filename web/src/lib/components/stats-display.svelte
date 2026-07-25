<script>
  /** Unlimited mode stats display */
  let { stats } = $props();

  let winRate = $derived(
    stats && stats.gamesPlayed
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0,
  );

  let items = $derived([
    { value: stats?.gamesPlayed, label: "Played" },
    { value: `${winRate}%`, label: "Win Rate" },
    { value: stats?.gamesWon, label: "Won" },
  ]);
</script>

{#if stats && stats.gamesPlayed > 0}
  <div class="flex justify-center gap-6 py-3 mb-4">
    {#each items as { value, label } (label)}
      <div class="flex flex-col items-center gap-0.5">
        <span class="text-xl font-bold text-[var(--color-text)]">{value}</span>
        <span class="text-[0.7rem] text-[var(--color-text-muted)] uppercase"
          >{label}</span
        >
      </div>
    {/each}
  </div>
{/if}
