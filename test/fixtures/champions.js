/**
 * Hand-written champion fixtures, deliberately small so the weekly champions.json
 * sync can never break the suite. Shapes mirror the real data exactly:
 * `releaseDate` is a number, `attackType` is "close" | "range".
 *
 * Chosen to exercise every compareChampions branch against AATROX as target:
 *   AHRI    — disjoint genre, disjoint lane, older year (direction "up")
 *   AKALI   — disjoint genre, overlapping lane (partial), hyphenated region
 *   BELVETH — identical genre (correct), disjoint lane, empty resource ("—"),
 *             newer year (direction "down")
 */

export const AATROX = {
  id: "Aatrox",
  name: "Aatrox",
  title: "the Darkin Blade",
  resource: "Blood Well",
  genre: "Fighter",
  gender: "male",
  attackType: "close",
  releaseDate: 2013,
  region: "runeterra",
  lane: "top",
};

export const AHRI = {
  id: "Ahri",
  name: "Ahri",
  title: "the Nine-Tailed Fox",
  resource: "Mana",
  genre: "Mage,Assassin",
  gender: "female",
  attackType: "range",
  releaseDate: 2011,
  region: "ionia",
  lane: "mid",
};

export const AKALI = {
  id: "Akali",
  name: "Akali",
  title: "the Rogue Assassin",
  resource: "Energy",
  genre: "Assassin",
  gender: "female",
  attackType: "close",
  releaseDate: 2010,
  region: "shadow-isles",
  lane: "top,mid",
};

export const BELVETH = {
  id: "Belveth",
  name: "Bel'Veth",
  title: "the Empress of the Void",
  resource: "",
  genre: "Fighter",
  gender: "female",
  attackType: "close",
  releaseDate: 2022,
  region: "void",
  lane: "jungle",
};

/** Load order matters for getRandomChampion index assertions. */
export const CHAMPIONS = [AATROX, AHRI, AKALI, BELVETH];
