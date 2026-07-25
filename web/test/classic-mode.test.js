import { describe, expect, it } from "vitest";
import { CLASSIC_ATTRIBUTES, compareChampions } from "$lib/classic-mode";
import { AATROX, AHRI, AKALI, BELVETH } from "./fixtures/champions";

/** Pull one attribute's comparison out of the 7-entry result array. */
function cell(guess, target, key) {
  return compareChampions(guess, target).find((r) => r.key === key);
}

describe("CLASSIC_ATTRIBUTES", () => {
  it("exposes 7 attributes with gender first and releaseDate last", () => {
    expect(CLASSIC_ATTRIBUTES).toHaveLength(7);
    expect(CLASSIC_ATTRIBUTES[0].key).toBe("gender");
    expect(CLASSIC_ATTRIBUTES[6].key).toBe("releaseDate");
  });

  it("keeps the display order the grid header depends on", () => {
    expect(CLASSIC_ATTRIBUTES.map((a) => a.key)).toEqual([
      "gender",
      "genre",
      "attackType",
      "resource",
      "region",
      "lane",
      "releaseDate",
    ]);
  });
});

describe("compareChampions — result shape", () => {
  it("returns one entry per attribute, carrying label and type through", () => {
    const results = compareChampions(AHRI, AATROX);
    expect(results).toHaveLength(7);
    expect(results[0]).toMatchObject({
      key: "gender",
      label: "Gender",
      type: "exact",
    });
  });
});

describe("compareChampions — exact", () => {
  it("marks an identical value correct", () => {
    expect(cell(AKALI, AHRI, "gender").result).toBe("correct");
  });

  it("marks a differing value wrong", () => {
    expect(cell(AHRI, AATROX, "gender").result).toBe("wrong");
  });

  it("compares case-insensitively", () => {
    const shouty = { ...AATROX, gender: "MALE" };
    expect(cell(shouty, AATROX, "gender").result).toBe("correct");
  });

  it("treats a missing value as not matching a present one", () => {
    expect(cell(BELVETH, AATROX, "resource").result).toBe("wrong");
  });
});

describe("compareChampions — multi", () => {
  it("marks identical sets correct", () => {
    expect(cell(BELVETH, AATROX, "genre").result).toBe("correct");
  });

  it("marks intersecting sets partial", () => {
    // AKALI lane "top,mid" overlaps AATROX lane "top"
    expect(cell(AKALI, AATROX, "lane").result).toBe("partial");
  });

  it("marks disjoint sets wrong", () => {
    expect(cell(AHRI, AATROX, "lane").result).toBe("wrong");
  });

  it("marks two empty sets correct", () => {
    const a = { ...AATROX, lane: "" };
    const b = { ...AATROX, lane: "" };
    expect(cell(a, b, "lane").result).toBe("correct");
  });

  it("marks one empty set against a populated one wrong", () => {
    const empty = { ...AATROX, lane: "" };
    expect(cell(empty, AATROX, "lane").result).toBe("wrong");
  });

  it("ignores order and whitespace when comparing sets", () => {
    const spaced = { ...AKALI, lane: " mid , top " };
    expect(cell(spaced, AKALI, "lane").result).toBe("correct");
  });
});

describe("compareChampions — year", () => {
  it("marks the same year correct with no direction hint", () => {
    const twin = { ...AHRI, releaseDate: 2013 };
    const result = cell(twin, AATROX, "releaseDate");
    expect(result.result).toBe("correct");
    expect(result.direction).toBeUndefined();
  });

  it("points up when the guess is older than the target", () => {
    expect(cell(AHRI, AATROX, "releaseDate")).toMatchObject({
      result: "wrong",
      direction: "up",
    });
  });

  it("points down when the guess is newer than the target", () => {
    expect(cell(BELVETH, AATROX, "releaseDate")).toMatchObject({
      result: "wrong",
      direction: "down",
    });
  });

  it("gives no direction when either year is unparseable", () => {
    const undated = { ...AHRI, releaseDate: "" };
    const result = cell(undated, AATROX, "releaseDate");
    expect(result.result).toBe("wrong");
    expect(result.direction).toBeUndefined();
  });

  it("renders a missing year as ?", () => {
    const undated = { ...AHRI, releaseDate: "" };
    expect(cell(undated, AATROX, "releaseDate").guessValue).toBe("?");
  });

  it("passes the year through unformatted", () => {
    expect(cell(AHRI, AATROX, "releaseDate")).toMatchObject({
      guessValue: 2011,
      targetValue: 2013,
    });
  });
});

describe("compareChampions — value formatting", () => {
  it("capitalizes gender", () => {
    expect(cell(AATROX, AATROX, "gender").guessValue).toBe("Male");
  });

  it("renders attackType close as Melee and range as Ranged", () => {
    expect(cell(AATROX, AATROX, "attackType").guessValue).toBe("Melee");
    expect(cell(AHRI, AHRI, "attackType").guessValue).toBe("Ranged");
  });

  it("splits hyphenated regions into capitalized words", () => {
    expect(cell(AKALI, AKALI, "region").guessValue).toBe("Shadow Isles");
  });

  it("title-cases comma lists and rejoins them with a space", () => {
    expect(cell(AHRI, AHRI, "genre").guessValue).toBe("Mage, Assassin");
    expect(cell(AKALI, AKALI, "lane").guessValue).toBe("Top, Mid");
  });

  it("renders an empty value as an em dash", () => {
    expect(cell(BELVETH, BELVETH, "resource").guessValue).toBe("—");
  });

  it("formats the target value the same way as the guess value", () => {
    expect(cell(AHRI, AKALI, "region")).toMatchObject({
      guessValue: "Ionia",
      targetValue: "Shadow Isles",
    });
  });
});
