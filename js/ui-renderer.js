// UI rendering: search autocomplete, guess grid, game state display

import { getChampionImageUrl } from "./data-loader.js";
import { CLASSIC_ATTRIBUTES } from "./classic-mode.js";

// Mutable callback refs — updated on each startGame, listeners bound only once
let _searchCallbacks = { onSelect: null, getExcluded: () => [] };
let _searchInitialized = false;

/** Update search callbacks (call on each new game) */
export function updateSearchCallbacks(onSelect, getExcluded) {
  _searchCallbacks.onSelect = onSelect;
  _searchCallbacks.getExcluded = getExcluded;
}

/** Initialize search autocomplete (call once) */
export function initSearch(container, champions) {
  if (_searchInitialized) return;
  _searchInitialized = true;

  const input = container.querySelector("#search-input");
  const dropdown = container.querySelector("#search-dropdown");

  input.addEventListener("input", () => {
    const query = input.value.trim();
    if (!query) {
      dropdown.innerHTML = "";
      dropdown.classList.remove("visible");
      return;
    }

    const excluded = _searchCallbacks.getExcluded();
    const lower = query.toLowerCase();
    const matches = champions
      .filter(
        (c) =>
          c.name.toLowerCase().includes(lower) &&
          !excluded.includes(c.name),
      )
      .sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(lower) ? 0 : 1;
        const bStarts = b.name.toLowerCase().startsWith(lower) ? 0 : 1;
        return aStarts - bStarts || a.name.localeCompare(b.name);
      })
      .slice(0, 8);

    renderDropdown(dropdown, matches, (champion) => {
      input.value = "";
      dropdown.innerHTML = "";
      dropdown.classList.remove("visible");
      if (_searchCallbacks.onSelect) _searchCallbacks.onSelect(champion);
    });
  });

  // Close dropdown on outside click
  document.addEventListener("click", (e) => {
    if (!container.contains(e.target)) {
      dropdown.innerHTML = "";
      dropdown.classList.remove("visible");
    }
  });

  // Keyboard navigation
  input.addEventListener("keydown", (e) => {
    const items = dropdown.querySelectorAll(".dropdown-item");
    const active = dropdown.querySelector(".dropdown-item.active");

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!active && items.length) {
        items[0].classList.add("active");
      } else if (active && active.nextElementSibling) {
        active.classList.remove("active");
        active.nextElementSibling.classList.add("active");
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (active && active.previousElementSibling) {
        active.classList.remove("active");
        active.previousElementSibling.classList.add("active");
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = dropdown.querySelector(".dropdown-item.active");
      if (selected) selected.click();
    }
  });
}

/** Render dropdown options */
function renderDropdown(dropdown, matches, onClick) {
  dropdown.innerHTML = "";
  if (!matches.length) {
    dropdown.classList.remove("visible");
    return;
  }

  matches.forEach((champion) => {
    const item = document.createElement("div");
    item.className = "dropdown-item";

    const img = document.createElement("img");
    img.src = getChampionImageUrl(champion.id);
    img.alt = champion.name;
    img.loading = "lazy";

    const name = document.createElement("span");
    name.textContent = champion.name;

    item.append(img, name);
    item.addEventListener("click", () => onClick(champion));
    dropdown.appendChild(item);
  });

  dropdown.classList.add("visible");
}

/** Render a single guess row with comparison results */
export function renderGuessRow(container, champion, results) {
  const row = document.createElement("div");
  row.className = "guess-row";

  // Champion name + image cell
  const nameCell = document.createElement("div");
  nameCell.className = "guess-cell champion-cell";
  const img = document.createElement("img");
  img.src = getChampionImageUrl(champion.id);
  img.alt = champion.name;
  const nameSpan = document.createElement("span");
  nameSpan.textContent = champion.name;
  nameCell.append(img, nameSpan);
  row.appendChild(nameCell);

  // Attribute cells
  results.forEach((r) => {
    const cell = document.createElement("div");
    cell.className = `guess-cell cell-${r.result}`;
    cell.dataset.attribute = r.key;

    const valueSpan = document.createElement("span");
    valueSpan.textContent = r.guessValue;
    cell.appendChild(valueSpan);

    // Direction arrow for year
    if (r.direction) {
      const arrow = document.createElement("span");
      arrow.className = "direction-arrow";
      arrow.textContent = r.direction === "up" ? " ↑" : " ↓";
      cell.appendChild(arrow);
    }

    row.appendChild(cell);
  });

  // Staggered animation
  const cells = row.querySelectorAll(".guess-cell");
  cells.forEach((cell, i) => {
    cell.style.animationDelay = `${i * 0.08}s`;
  });

  container.appendChild(row);

  // Scroll to latest guess
  row.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/** Render column headers for the guess grid */
export function renderGridHeader(container) {
  const header = document.createElement("div");
  header.className = "guess-row header-row";

  // Champion column header
  const champHeader = document.createElement("div");
  champHeader.className = "guess-cell header-cell";
  champHeader.textContent = "Champion";
  header.appendChild(champHeader);

  CLASSIC_ATTRIBUTES.forEach((attr) => {
    const cell = document.createElement("div");
    cell.className = "guess-cell header-cell";
    cell.textContent = attr.label;
    header.appendChild(cell);
  });

  container.appendChild(header);
}

/** Show game over message */
export function renderGameOver(container, isWon, target, guessCount) {
  const msg = document.createElement("div");
  msg.className = `game-over ${isWon ? "won" : "lost"}`;

  const h2 = document.createElement("h2");
  const p = document.createElement("p");

  if (isWon) {
    h2.textContent = "You got it!";
    const nameStrong = document.createElement("strong");
    nameStrong.textContent = target.name;
    const countStrong = document.createElement("strong");
    countStrong.textContent = guessCount;
    p.append("You found ", nameStrong, " in ", countStrong, ` guess${guessCount > 1 ? "es" : ""}!`);
  } else {
    h2.textContent = "Game Over";
    const nameStrong = document.createElement("strong");
    nameStrong.textContent = target.name;
    p.append("The champion was ", nameStrong);
    const img = document.createElement("img");
    img.src = getChampionImageUrl(target.id);
    img.alt = target.name;
    img.className = "reveal-image";
    msg.append(h2, p, img);
    container.appendChild(msg);
    return;
  }

  msg.append(h2, p);
  container.appendChild(msg);
}

/** Update guess counter display */
export function updateGuessCounter(element, current, max) {
  if (max > 0) {
    element.textContent = `${current} / ${max} guesses`;
  } else {
    element.textContent = `${current} guess${current !== 1 ? "es" : ""}`;
  }
}

/** Show/hide search input */
export function setSearchEnabled(container, enabled) {
  const input = container.querySelector("#search-input");
  if (input) {
    input.disabled = !enabled;
    if (!enabled) {
      input.placeholder = "Game over";
      container.querySelector("#search-dropdown").innerHTML = "";
      container.querySelector("#search-dropdown").classList.remove("visible");
    }
  }
}

/** Render unlimited mode stats */
export function renderStats(container, stats) {
  container.innerHTML = "";
  if (!stats || stats.gamesPlayed === 0) return;

  const winRate = Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
  const statsDiv = document.createElement("div");
  statsDiv.className = "stats";

  const items = [
    { value: stats.gamesPlayed, label: "Played" },
    { value: `${winRate}%`, label: "Win Rate" },
    { value: stats.gamesWon, label: "Won" },
  ];

  items.forEach(({ value, label }) => {
    const item = document.createElement("div");
    item.className = "stat-item";
    const valSpan = document.createElement("span");
    valSpan.className = "stat-value";
    valSpan.textContent = value;
    const labelSpan = document.createElement("span");
    labelSpan.className = "stat-label";
    labelSpan.textContent = label;
    item.append(valSpan, labelSpan);
    statsDiv.appendChild(item);
  });

  container.appendChild(statsDiv);
}
