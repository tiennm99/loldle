import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getChampionImageUrl, getTodaySeed } from "$lib/champion-data";
import { AATROX, CHAMPIONS } from "./fixtures/champions";

// $app/paths is a SvelteKit build-time construct with no meaning to a bare
// Vitest run. Base-path behaviour is verified by the production preview check,
// not here, so the identity stub is the honest unit-test substitute.
vi.mock("$app/paths", () => ({ asset: (p) => p }));

/**
 * `champions` is module-private with no reset export, so each group gets a fresh
 * module instance instead of adding production code for testability.
 */
async function freshModule({ champions = CHAMPIONS, ok = true, status = 200 } = {}) {
  vi.resetModules();
  const fetchMock = vi.fn(async () => ({
    ok,
    status,
    json: async () => champions,
  }));
  vi.stubGlobal("fetch", fetchMock);
  const mod = await import("$lib/champion-data");
  return { mod, fetchMock };
}

/** Load a module instance with its champion list already populated. */
async function loadedModule(champions = CHAMPIONS) {
  const { mod, fetchMock } = await freshModule({ champions });
  await mod.loadChampions();
  return { mod, fetchMock };
}

function named(names) {
  return names.map((name) => ({ ...AATROX, id: name, name }));
}

describe("loadChampions", () => {
  it("fetches the static champions file and returns the parsed list", async () => {
    const { mod, fetchMock } = await freshModule();
    await expect(mod.loadChampions()).resolves.toEqual(CHAMPIONS);
    expect(fetchMock).toHaveBeenCalledWith("/champions.json");
  });

  it("serves later calls from the cache without refetching", async () => {
    const { mod, fetchMock } = await loadedModule();
    await mod.loadChampions();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("is single-flight — concurrent callers share one fetch", async () => {
    const { mod, fetchMock } = await freshModule();
    const [first, second] = await Promise.all([
      mod.loadChampions(),
      mod.loadChampions(),
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(first).toBe(second);
  });

  it("rejects with the status code when the response is not ok", async () => {
    const { mod } = await freshModule({ ok: false, status: 404 });
    await expect(mod.loadChampions()).rejects.toThrow(
      "Failed to load champions: 404",
    );
  });

  it("clears the in-flight promise on failure so a retry can succeed", async () => {
    const { mod, fetchMock } = await freshModule({ ok: false, status: 500 });
    await expect(mod.loadChampions()).rejects.toThrow();

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => CHAMPIONS,
    });

    await expect(mod.loadChampions()).resolves.toEqual(CHAMPIONS);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("searchChampions", () => {
  it("returns nothing for an empty query", async () => {
    const { mod } = await loadedModule();
    expect(mod.searchChampions("")).toEqual([]);
  });

  it("matches case-insensitively on a substring", async () => {
    const { mod } = await loadedModule();
    expect(mod.searchChampions("AATR").map((c) => c.name)).toEqual(["Aatrox"]);
  });

  it("sorts prefix matches ahead of substring matches", async () => {
    const { mod } = await loadedModule(named(["Akali", "Kayle", "Kayn"]));
    // "Kayle"/"Kayn" start with "ka"; "Akali" only contains it
    expect(mod.searchChampions("ka").map((c) => c.name)).toEqual([
      "Kayle",
      "Kayn",
      "Akali",
    ]);
  });

  it("sorts alphabetically within each tier", async () => {
    const { mod } = await loadedModule(named(["Azir", "Ahri", "Aatrox"]));
    expect(mod.searchChampions("a").map((c) => c.name)).toEqual([
      "Aatrox",
      "Ahri",
      "Azir",
    ]);
  });

  it("caps the result at 8", async () => {
    const many = named([
      "Aatrox", "Ahri", "Akali", "Alistar", "Amumu",
      "Anivia", "Annie", "Aphelios", "Ashe", "Azir",
    ]);
    const { mod } = await loadedModule(many);
    expect(mod.searchChampions("a")).toHaveLength(8);
  });

  it("filters excluded names case-insensitively", async () => {
    const { mod } = await loadedModule(named(["Kayle", "Kayn"]));
    expect(mod.searchChampions("ka", ["kAyN"]).map((c) => c.name)).toEqual([
      "Kayle",
    ]);
  });

  it("returns an empty list when nothing matches", async () => {
    const { mod } = await loadedModule();
    expect(mod.searchChampions("zzzz")).toEqual([]);
  });
});

describe("getRandomChampion", () => {
  it("is deterministic for a given seed", async () => {
    const { mod } = await loadedModule();
    expect(mod.getRandomChampion("2026-07-25")).toBe(
      mod.getRandomChampion("2026-07-25"),
    );
  });

  it("always returns a champion from the loaded list", async () => {
    const { mod } = await loadedModule();
    for (const seed of ["a", "b", "2026-07-25", "unlimited_1_0.5", ""]) {
      expect(CHAMPIONS).toContain(mod.getRandomChampion(seed));
    }
  });

  it("returns null before champions are loaded", async () => {
    const { mod } = await freshModule();
    expect(mod.getRandomChampion("2026-07-25")).toBeNull();
  });
});

describe("getTodaySeed", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats as YYYY-MM-DD", () => {
    vi.setSystemTime(new Date("2026-07-25T09:00:00Z"));
    expect(getTodaySeed()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("reflects the local date, not the UTC date", () => {
    // 18:00 UTC is already the next day in UTC+7 and still the same day in UTC,
    // so this instant fails any implementation that reaches for UTC getters.
    vi.setSystemTime(new Date("2026-07-25T18:00:00Z"));
    // en-CA renders as YYYY-MM-DD — an independent derivation of the same date.
    expect(getTodaySeed()).toBe(new Date().toLocaleDateString("en-CA"));
  });

  it("zero-pads single-digit months and days", () => {
    vi.setSystemTime(new Date(2026, 0, 5, 12, 0, 0));
    expect(getTodaySeed()).toBe("2026-01-05");
  });

  it("advances by one day across a local midnight", () => {
    vi.setSystemTime(new Date(2026, 6, 25, 23, 59, 0));
    const before = getTodaySeed();
    vi.setSystemTime(new Date(2026, 6, 26, 0, 1, 0));
    expect(getTodaySeed()).not.toBe(before);
    expect(getTodaySeed()).toBe("2026-07-26");
  });
});

describe("getChampionImageUrl", () => {
  it("returns the absolute Data Dragon tile URL", () => {
    expect(getChampionImageUrl("Aatrox")).toBe(
      "https://ddragon.leagueoflegends.com/cdn/img/champion/tiles/Aatrox_0.jpg",
    );
  });

  it("stays absolute — it must never be rewritten through a base path", () => {
    expect(getChampionImageUrl("Belveth")).toMatch(/^https:\/\//);
  });
});
