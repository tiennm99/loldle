// Data layer: load, search, and select champions from champions.json

let champions = [];

/** Fetch and parse champions data */
export async function loadChampions() {
  const response = await fetch("assets/champions.json");
  if (!response.ok) {
    throw new Error(`Failed to load champions: ${response.status}`);
  }
  champions = await response.json();
  return champions;
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

/** Get today's date string for daily seed */
export function getTodaySeed() {
  return new Date().toISOString().slice(0, 10);
}

/** Get champion image URL from Data Dragon CDN */
export function getChampionImageUrl(championId) {
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/tiles/${championId}_0.jpg`;
}
