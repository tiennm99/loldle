# loldle-data

[LoLdleData](https://github.com/Kerrders/LoLdleData) rewritten in Go — fetches League of Legends champion data from Riot's Data Dragon API and outputs a structured JSON file for use in [loldle](https://github.com/tiennm99/loldle).

## What it extracts

For each champion, the tool collects:
- Name, title, resource type (Mana, Energy, etc.)
- Genre / class (Fighter, Mage, Assassin, …)
- Attack type (Melee / Ranged)
- Gender
- Release year
- Region (from community-maintained data)
- Role / lane (Top, Mid, ADC, Support, Jungle)
- Skin count

## Usage

```bash
go run .
```

Outputs `champions.json` in the current directory. Requires internet access to reach `ddragon.leagueoflegends.com`.

## Output schema

```json
{
  "id": "Aatrox",
  "name": "Aatrox",
  "title": "the Darkin Blade",
  "resource": "Blood Well",
  "genre": "Fighter",
  "skinCount": 41,
  "gender": "male",
  "attackType": "close",
  "releaseDate": 2013,
  "region": "runeterra",
  "lane": "top"
}
```

A human-readable `CHAMPIONS.md` table is also generated alongside the JSON.

## Used by

- [loldle](https://github.com/tiennm99/loldle) — the Wordle-style LoL guessing game that consumes this data.

## License

Apache-2.0 — see [LICENSE](LICENSE).
