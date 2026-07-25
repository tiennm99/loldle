<script>
  import { CLASSIC_ATTRIBUTES } from "$lib/classic-mode";
  import GuessRow from "./guess-row.svelte";

  /** Grid with header row + guess rows */
  let { guesses, results } = $props();

  // Newest guess first. .reverse() acts on the fresh array from .map(),
  // so `guesses` itself is never mutated.
  let rows = $derived(
    guesses.map((champion, i) => ({ champion, results: results[i] })).reverse(),
  );
</script>

<div class="w-full max-w-[900px] px-4 overflow-x-auto">
  <!-- Header row -->
  <div class="guess-row header-row">
    <div class="guess-cell header-cell">Champion</div>
    {#each CLASSIC_ATTRIBUTES as attr (attr.key)}
      <div class="guess-cell header-cell">{attr.label}</div>
    {/each}
  </div>

  <!-- Guess rows — newest first -->
  {#each rows as row (row.champion.id)}
    <GuessRow champion={row.champion} results={row.results} />
  {/each}
</div>
