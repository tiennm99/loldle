<script>
  import { onMount } from "svelte";
  import {
    getRandomChampion,
    getTodaySeed,
    loadChampions,
  } from "$lib/champion-data";
  import { compareChampions } from "$lib/classic-mode";
  import {
    clearExpiredCache,
    clearUnlimitedState,
    createGame,
    getOrCreateUnlimitedSeed,
    loadUnlimitedStats,
    saveUnlimitedStats,
    submitGuess,
  } from "$lib/game-engine";
  import ChampionSearch from "./champion-search.svelte";
  import GameOver from "./game-over.svelte";
  import GuessGrid from "./guess-grid.svelte";
  import StatsDisplay from "./stats-display.svelte";

  let mode = $state("daily");
  let game = $state(null);
  let loading = $state(true);
  let error = $state(null);
  let stats = $state(null);

  let excludeNames = $derived(game ? game.guesses.map((g) => g.name) : []);

  function initGame(gameMode) {
    const seed =
      gameMode === "daily" ? getTodaySeed() : getOrCreateUnlimitedSeed();
    const target = getRandomChampion(seed);
    const maxGuesses = gameMode === "daily" ? 6 : 0;

    game = createGame({
      target,
      compareFn: compareChampions,
      maxGuesses,
      mode: gameMode,
      seed,
    });
    stats = gameMode === "unlimited" ? loadUnlimitedStats() : null;
  }

  // Browser-only and once-only by construction: the prerender pass has no
  // localStorage and no champions.json to fetch.
  onMount(async () => {
    try {
      await loadChampions();
      clearExpiredCache(getTodaySeed());
      initGame("daily");
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });

  function switchMode(newMode) {
    mode = newMode;
    initGame(newMode);
  }

  function handleGuess(champion) {
    if (!game) return;

    const updated = submitGuess(game, champion);
    if (!updated) return;

    // Always reassign — submitGuess returns new objects, so mutation would
    // silently lose reactivity.
    game = updated;

    if (updated.isOver && updated.mode === "unlimited") {
      saveUnlimitedStats(updated);
      stats = loadUnlimitedStats();
    }
  }

  function handleNewGame() {
    clearUnlimitedState();
    initGame("unlimited");
  }
</script>

{#if loading}
  <p class="text-center text-[var(--color-text-muted)] py-8">
    Loading champions...
  </p>
{:else if error}
  <p class="text-center text-[var(--color-wrong)] py-8">
    Failed to load champion data. Please refresh.
  </p>
{:else if game}
  <!-- Mode toggle -->
  <div
    class="flex justify-center gap-1 my-3 bg-[var(--color-surface)] rounded-lg p-1 w-fit mx-auto"
  >
    <button
      onclick={() => switchMode("daily")}
      class="px-5 py-2 rounded-md border-none text-sm font-medium cursor-pointer transition-all {mode ===
      'daily'
        ? 'bg-[var(--color-accent)] text-[var(--color-text)]'
        : 'bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'}"
    >
      Daily
    </button>
    <button
      onclick={() => switchMode("unlimited")}
      class="px-5 py-2 rounded-md border-none text-sm font-medium cursor-pointer transition-all {mode ===
      'unlimited'
        ? 'bg-[var(--color-accent)] text-[var(--color-text)]'
        : 'bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'}"
    >
      Unlimited
    </button>
  </div>

  {#if stats}
    <StatsDisplay {stats} />
  {/if}

  <ChampionSearch
    {excludeNames}
    onSelect={handleGuess}
    disabled={game.isOver}
  />

  <p class="text-center text-[var(--color-text-muted)] text-sm my-3">
    {game.maxGuesses > 0
      ? `${game.guesses.length} / ${game.maxGuesses} guesses`
      : `${game.guesses.length} guess${game.guesses.length !== 1 ? "es" : ""}`}
  </p>

  <GuessGrid guesses={game.guesses} results={game.results} />

  {#if game.isOver}
    <GameOver
      isWon={game.isWon}
      target={game.target}
      guessCount={game.guesses.length}
      onNewGame={mode === "unlimited" ? handleNewGame : undefined}
    />
  {/if}
{/if}
