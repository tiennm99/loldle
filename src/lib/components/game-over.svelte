<script>
  import { getChampionImageUrl } from "$lib/champion-data";

  /** Win/loss message with optional new game button */
  let { isWon, target, guessCount, onNewGame } = $props();
</script>

<div class="text-center py-6 px-4 mx-auto max-w-[400px]">
  <h2
    class="text-2xl font-bold mb-2 {isWon
      ? 'text-[var(--color-correct)]'
      : 'text-[var(--color-wrong)]'}"
  >
    {isWon ? "You got it!" : "Game Over"}
  </h2>

  {#if isWon}
    <p class="text-[var(--color-text-muted)] mb-3">
      You found <strong class="text-[var(--color-text)]">{target.name}</strong> in
      <strong class="text-[var(--color-text)]">{guessCount}</strong>
      guess{guessCount > 1 ? "es" : ""}!
    </p>
  {:else}
    <p class="text-[var(--color-text-muted)] mb-3">
      The champion was <strong class="text-[var(--color-text)]"
        >{target.name}</strong
      >
    </p>
    <img
      src={getChampionImageUrl(target.id)}
      alt={target.name}
      width="80"
      height="80"
      class="rounded-lg object-cover mx-auto"
    />
  {/if}

  {#if onNewGame}
    <button
      onclick={onNewGame}
      class="mt-4 px-6 py-2.5 rounded-lg bg-[var(--color-accent)] text-[var(--color-text)] font-semibold cursor-pointer transition-opacity hover:opacity-85"
    >
      New Game
    </button>
  {/if}
</div>
