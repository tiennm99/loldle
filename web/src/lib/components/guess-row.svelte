<script>
  import { getChampionImageUrl } from "$lib/champion-data";

  /** Single guess row with colored attribute cells */
  let { champion, results } = $props();
</script>

<div class="guess-row">
  <!-- Champion name + image -->
  <div class="guess-cell champion-cell" style="animation-delay: 0s">
    <img
      src={getChampionImageUrl(champion.id)}
      alt={champion.name}
      width="40"
      height="40"
      class="rounded object-cover shrink-0"
    />
    <span class="text-xs font-semibold">{champion.name}</span>
  </div>

  <!-- Attribute cells: the within-row reveal stagger -->
  {#each results as r, i (r.key)}
    <div
      class="guess-cell cell-{r.result}"
      style="animation-delay: {(i + 1) * 0.08}s"
    >
      <span>{r.guessValue}</span>
      {#if r.direction}
        <span class="font-bold text-base">
          {r.direction === "up" ? " ↑" : " ↓"}
        </span>
      {/if}
    </div>
  {/each}
</div>
