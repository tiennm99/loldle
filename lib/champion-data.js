// Data layer: load, search, and select champions

let champions = [];
let loadPromise = null;

/** Fetch and parse champions data (deduplicated) */
export async function loadChampions() {
  if (champions.length > 0) return champions;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const response = await fetch(`${basePath}/champions.json`);
    if (!response.ok) {
      loadPromise = null;
      throw new Error(`Failed to load champions: ${response.status}`);
    }
    champions = await response.json();
    return champions;
  })();

  return loadPromise;
}

/** Get all loaded champions */
export function getAllChampions() {
  return champions;
}

/** Case-insensitive lookup by name */
export function getChampionByName(name) {
  const lower = name.toLowerCase();
  return champions.find((c) => c.name.toLowerCase() === lower) || null;
}

/** Filter champions for autocomplete (prefix-first, then substring) */
export function searchChampions(query, excludeNames = []) {
  if (!query) return [];
  const lower = query.toLowerCase();
  const excluded = new Set(excludeNames.map((n) => n.toLowerCase()));

  return champions
    .filter(
      (c) =>
        c.name.toLowerCase().includes(lower) &&
        !excluded.has(c.name.toLowerCase()),
    )
    .sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(lower) ? 0 : 1;
      const bStarts = b.name.toLowerCase().startsWith(lower) ? 0 : 1;
      return aStarts - bStarts || a.name.localeCompare(b.name);
    })
    .slice(0, 8);
}

/** Seeded random champion selection (deterministic for same seed string) */
export function getRandomChampion(seed) {
  if (!champions.length) return null;
  const hash = hashString(seed);
  const index = hash % champions.length;
  return champions[index];
}

/** Simple string hash (djb2) */
function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

/** Get today's local date string for daily seed */
export function getTodaySeed() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Get champion image URL from Data Dragon CDN */
export function getChampionImageUrl(championId) {
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/tiles/${championId}_0.jpg`;
}
