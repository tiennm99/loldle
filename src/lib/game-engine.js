// Mode-agnostic game state machine with localStorage persistence

const STORAGE_KEY_PREFIX = "loldle_";
const UNLIMITED_SEED_KEY = `${STORAGE_KEY_PREFIX}unlimited_seed`;

/**
 * Create a new game instance
 * @param {Object} config
 * @param {Object} config.target - Target champion to guess
 * @param {Function} config.compareFn - (guess, target) => comparison results
 * @param {number} config.maxGuesses - Max allowed guesses (0 = unlimited)
 * @param {string} config.mode - "daily" or "unlimited"
 * @param {string} config.seed - Seed string for mode
 */
export function createGame(config) {
  const { target, compareFn, maxGuesses = 6, mode = "daily", seed = "" } = config;

  // Try to restore saved state
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

/** Submit a guess and return updated game state (immutable) */
export function submitGuess(game, champion) {
  if (game.isOver) return null;
  if (game.guesses.some((g) => g.name === champion.name)) return null;

  const result = game.compareFn(champion, game.target);
  const guesses = [...game.guesses, champion];
  const results = [...game.results, result];

  let isWon = false;
  let isOver = false;

  if (champion.name === game.target.name) {
    isWon = true;
    isOver = true;
  } else if (game.maxGuesses > 0 && guesses.length >= game.maxGuesses) {
    isOver = true;
  }

  const updated = { ...game, guesses, results, isWon, isOver };
  saveState(updated);
  return updated;
}

/** Get or create a persistent seed for unlimited mode */
export function getOrCreateUnlimitedSeed() {
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

/** Clear unlimited mode saved state (for new game) */
export function clearUnlimitedState() {
  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}unlimited_current`);
    localStorage.removeItem(UNLIMITED_SEED_KEY);
  } catch {
    // Ignore
  }
}

/** Save unlimited mode stats */
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
    // Ignore
  }
}

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

/** Remove stale daily entries from localStorage (keeps only today's) */
export function clearExpiredCache(todaySeed) {
  try {
    const todayKey = `${STORAGE_KEY_PREFIX}daily_${todaySeed}`;
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${STORAGE_KEY_PREFIX}daily_`) && key !== todayKey) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Ignore
  }
}

function getStorageKey(mode, seed) {
  if (mode === "daily") return `${STORAGE_KEY_PREFIX}daily_${seed}`;
  return `${STORAGE_KEY_PREFIX}unlimited_current`;
}
