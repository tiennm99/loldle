// Mode-agnostic game state machine with localStorage persistence

const STORAGE_KEY_PREFIX = "loldle_";

/**
 * Create a new game instance
 * @param {Object} config
 * @param {Object} config.target - Target champion to guess
 * @param {Function} config.compareFn - (guess, target) => comparison results
 * @param {number} config.maxGuesses - Max allowed guesses (0 = unlimited)
 * @param {string} config.mode - "daily" or "unlimited"
 * @param {string} config.seed - Seed string for daily mode
 */
export function createGame(config) {
  const { target, compareFn, maxGuesses = 6, mode = "daily", seed = "" } = config;

  // Try to restore saved state for daily mode
  const saved = loadState(mode, seed);
  if (saved && saved.targetName === target.name) {
    return {
      target,
      compareFn,
      maxGuesses,
      mode,
      seed,
      guesses: saved.guesses,
      results: saved.results,
      isOver: saved.isOver,
      isWon: saved.isWon,
    };
  }

  return {
    target,
    compareFn,
    maxGuesses,
    mode,
    seed,
    guesses: [],
    results: [],
    isOver: false,
    isWon: false,
  };
}

/**
 * Submit a guess and return comparison result
 * @returns {Object|null} Comparison result, or null if game is over
 */
export function submitGuess(game, champion) {
  if (game.isOver) return null;

  // Prevent duplicate guesses
  if (game.guesses.some((g) => g.name === champion.name)) return null;

  const result = game.compareFn(champion, game.target);
  game.guesses.push(champion);
  game.results.push(result);

  // Check win
  if (champion.name === game.target.name) {
    game.isWon = true;
    game.isOver = true;
  }
  // Check loss (only if maxGuesses > 0)
  else if (game.maxGuesses > 0 && game.guesses.length >= game.maxGuesses) {
    game.isOver = true;
  }

  saveState(game);
  return result;
}

/** Get names of already-guessed champions */
export function getGuessedNames(game) {
  return game.guesses.map((g) => g.name);
}

/** Save game state to localStorage */
function saveState(game) {
  const key = getStorageKey(game.mode, game.seed);
  const data = {
    targetName: game.target.name,
    guesses: game.guesses,
    results: game.results,
    isOver: game.isOver,
    isWon: game.isWon,
    timestamp: Date.now(),
  };
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

/** Load saved game state from localStorage */
function loadState(mode, seed) {
  const key = getStorageKey(mode, seed);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Build storage key based on mode */
function getStorageKey(mode, seed) {
  if (mode === "daily") {
    return `${STORAGE_KEY_PREFIX}daily_${seed}`;
  }
  return `${STORAGE_KEY_PREFIX}unlimited_current`;
}

/** Clear unlimited mode saved state (for new game) */
export function clearUnlimitedState() {
  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}unlimited_current`);
  } catch {
    // Ignore
  }
}

/** Save unlimited mode stats (wins, total games, guess distribution) */
export function saveUnlimitedStats(game) {
  if (game.mode !== "unlimited" || !game.isOver) return;

  const key = `${STORAGE_KEY_PREFIX}unlimited_stats`;
  let stats;
  try {
    stats = JSON.parse(localStorage.getItem(key)) || createEmptyStats();
  } catch {
    stats = createEmptyStats();
  }

  stats.gamesPlayed++;
  if (game.isWon) {
    stats.gamesWon++;
    const guessCount = game.guesses.length;
    stats.guessDistribution[guessCount] = (stats.guessDistribution[guessCount] || 0) + 1;
  }
  stats.lastPlayed = Date.now();

  try {
    localStorage.setItem(key, JSON.stringify(stats));
  } catch {
    // Ignore
  }
}

/** Load unlimited stats */
export function loadUnlimitedStats() {
  try {
    return JSON.parse(localStorage.getItem(`${STORAGE_KEY_PREFIX}unlimited_stats`)) || createEmptyStats();
  } catch {
    return createEmptyStats();
  }
}

function createEmptyStats() {
  return { gamesPlayed: 0, gamesWon: 0, guessDistribution: {}, lastPlayed: null };
}
