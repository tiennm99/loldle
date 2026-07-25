<script>
  import { getChampionImageUrl, searchChampions } from "$lib/champion-data";

  /** Autocomplete search input for champion selection */
  let { excludeNames, onSelect, disabled } = $props();

  let query = $state("");
  let activeIndex = $state(-1);
  let isOpen = $state(false);
  // $state because the dropdown is conditionally mounted, so bind:this
  // reassigns these after the initial render.
  let inputEl = $state();
  let dropdownEl = $state();

  let matches = $derived.by(() =>
    query.trim() ? searchChampions(query, excludeNames) : [],
  );

  // Derived, never assigned from an effect — writing state that the same effect
  // reads is the classic runes loop.
  let isVisible = $derived(isOpen && matches.length > 0);

  // Close dropdown on outside click. The element refs are read inside the
  // handler, not during setup, so this registers once like the React effect did.
  $effect(() => {
    function handleClick(e) {
      if (
        inputEl &&
        !inputEl.contains(e.target) &&
        dropdownEl &&
        !dropdownEl.contains(e.target)
      ) {
        isOpen = false;
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  });

  function selectChampion(champion) {
    query = "";
    isOpen = false;
    activeIndex = -1;
    onSelect(champion);
  }

  function handleKeyDown(e) {
    if (!isVisible || !matches.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, matches.length - 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < matches.length) {
        selectChampion(matches[activeIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      isOpen = false;
      activeIndex = -1;
    }
  }
</script>

<div class="relative w-full max-w-[400px] mx-auto px-4">
  <input
    bind:this={inputEl}
    type="text"
    role="combobox"
    aria-expanded={isVisible}
    aria-controls="champion-listbox"
    aria-autocomplete="list"
    aria-activedescendant={activeIndex >= 0
      ? `champion-option-${activeIndex}`
      : undefined}
    bind:value={query}
    oninput={() => {
      activeIndex = -1;
      isOpen = true;
    }}
    onkeydown={handleKeyDown}
    {disabled}
    placeholder={disabled ? "Game over" : "Type a champion name..."}
    autocomplete="off"
    class="w-full px-4 py-3 rounded-lg bg-[var(--color-input-bg)] border-2 border-[var(--color-input-border)] text-[var(--color-text)] text-base outline-none transition-colors focus:border-[var(--color-accent)] disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-[var(--color-text-muted)]"
  />

  {#if isVisible}
    <ul
      bind:this={dropdownEl}
      id="champion-listbox"
      role="listbox"
      class="absolute top-full left-4 right-4 list-none m-0 p-0 bg-[var(--color-surface)] border border-[var(--color-input-border)] rounded-b-lg max-h-80 overflow-y-auto z-50"
    >
      {#each matches as champion, i (champion.id)}
        <li id="champion-option-{i}" role="option" aria-selected={i === activeIndex}>
          <button
            type="button"
            onclick={() => selectChampion(champion)}
            class="w-full text-left flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors {i ===
            activeIndex
              ? 'bg-[var(--color-surface-hover)]'
              : 'hover:bg-[var(--color-surface-hover)]'}"
          >
            <img
              src={getChampionImageUrl(champion.id)}
              alt={champion.name}
              width="36"
              height="36"
              class="rounded object-cover"
            />
            <span class="text-sm">{champion.name}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>
