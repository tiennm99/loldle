// Bootstrap: wire data, engine, classic mode, and UI together

import { loadChampions, getAllChampions, getRandomChampion, getTodaySeed } from "./data-loader.js";
import { createGame, submitGuess, getGuessedNames, clearUnlimitedState, saveUnlimitedStats, loadUnlimitedStats } from "./game-engine.js";
import { compareChampions } from "./classic-mode.js";
import {
  initSearch,
  updateSearchCallbacks,
  renderGuessRow,
  renderGridHeader,
  renderGameOver,
  updateGuessCounter,
  setSearchEnabled,
  renderStats,
} from "./ui-renderer.js";

const UNLIMITED_SEED_KEY = "loldle_unlimited_seed";

let currentGame = null;
let currentMode = "daily";

async function init() {
  try {
    await loadChampions();
  } catch (err) {
    document.getElementById("grid").textContent = "Failed to load champion data. Please refresh.";
    return;
  }

  const champions = getAllChampions();
  if (!champions.length) {
    document.getElementById("grid").textContent = "No champion data available.";
    return;
  }

  // Initialize search once with champion list
  const searchContainer = document.querySelector(".search-container");
  initSearch(searchContainer, champions);

  // Mode toggle buttons
  document.getElementById("mode-daily").addEventListener("click", () => switchMode("daily"));
  document.getElementById("mode-unlimited").addEventListener("click", () => switchMode("unlimited"));

  // Start with daily mode
  startGame("daily");
}

function switchMode(mode) {
  currentMode = mode;

  // Update toggle UI
  document.querySelectorAll(".mode-btn").forEach((btn) => btn.classList.remove("active"));
  document.getElementById(`mode-${mode}`).classList.add("active");

  startGame(mode);
}

function startGame(mode) {
  const gridContainer = document.getElementById("grid");
  const gameOverContainer = document.getElementById("game-over");
  const statsContainer = document.getElementById("stats");
  const searchContainer = document.querySelector(".search-container");
  const guessCounter = document.getElementById("guess-counter");

  // Clear previous state
  gridContainer.innerHTML = "";
  gameOverContainer.innerHTML = "";

  // Show/hide stats
  if (mode === "unlimited") {
    renderStats(statsContainer, loadUnlimitedStats());
  } else {
    statsContainer.innerHTML = "";
  }

  // Pick target champion
  let target;
  let seed = "";
  if (mode === "daily") {
    seed = getTodaySeed();
    target = getRandomChampion(seed);
  } else {
    // Unlimited: reuse persisted seed if game is in progress, else create new
    seed = getOrCreateUnlimitedSeed();
    target = getRandomChampion(seed);
  }

  // Create game
  const maxGuesses = mode === "daily" ? 6 : 0;
  currentGame = createGame({
    target,
    compareFn: compareChampions,
    maxGuesses,
    mode,
    seed,
  });

  // Render grid header
  renderGridHeader(gridContainer);

  // Restore previous guesses (from localStorage)
  if (currentGame.guesses.length > 0) {
    currentGame.results.forEach((result, i) => {
      renderGuessRow(gridContainer, currentGame.guesses[i], result);
    });
  }

  // Update counter
  updateGuessCounter(guessCounter, currentGame.guesses.length, currentGame.maxGuesses);

  // Handle already-finished game (restored from storage)
  if (currentGame.isOver) {
    setSearchEnabled(searchContainer, false);
    renderGameOver(gameOverContainer, currentGame.isWon, currentGame.target, currentGame.guesses.length);
    if (mode === "unlimited") {
      addNewGameButton(gameOverContainer);
    }
    return;
  }

  // Enable search and update callbacks for this game instance
  setSearchEnabled(searchContainer, true);
  const input = searchContainer.querySelector("#search-input");
  input.placeholder = "Type a champion name...";
  input.value = "";
  input.focus();

  updateSearchCallbacks(
    (champion) => handleGuess(champion, gridContainer, gameOverContainer, searchContainer, guessCounter, statsContainer),
    () => getGuessedNames(currentGame),
  );
}

function handleGuess(champion, gridContainer, gameOverContainer, searchContainer, guessCounter, statsContainer) {
  const result = submitGuess(currentGame, champion);
  if (!result) return;

  renderGuessRow(gridContainer, champion, result);
  updateGuessCounter(guessCounter, currentGame.guesses.length, currentGame.maxGuesses);

  if (currentGame.isOver) {
    setSearchEnabled(searchContainer, false);
    renderGameOver(gameOverContainer, currentGame.isWon, currentGame.target, currentGame.guesses.length);

    if (currentGame.mode === "unlimited") {
      saveUnlimitedStats(currentGame);
      renderStats(statsContainer, loadUnlimitedStats());
      addNewGameButton(gameOverContainer);
    }
  } else {
    // Refocus input for next guess
    searchContainer.querySelector("#search-input").focus();
  }
}

/** Get or create a persistent seed for unlimited mode */
function getOrCreateUnlimitedSeed() {
  try {
    const saved = localStorage.getItem(UNLIMITED_SEED_KEY);
    if (saved) return saved;
  } catch {
    // Ignore
  }
  return createNewUnlimitedSeed();
}

/** Create and persist a new unlimited seed */
function createNewUnlimitedSeed() {
  const seed = `unlimited_${Date.now()}_${Math.random()}`;
  try {
    localStorage.setItem(UNLIMITED_SEED_KEY, seed);
  } catch {
    // Ignore
  }
  return seed;
}

function addNewGameButton(container) {
  const btn = document.createElement("button");
  btn.className = "new-game-btn";
  btn.textContent = "New Game";
  btn.addEventListener("click", () => {
    clearUnlimitedState();
    // Clear the persisted seed so a new one is generated
    try {
      localStorage.removeItem(UNLIMITED_SEED_KEY);
    } catch {
      // Ignore
    }
    startGame("unlimited");
  });
  container.appendChild(btn);
}

// Start the app
init();
