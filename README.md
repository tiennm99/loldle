# loldle

LoLdle-style League of Legends daily champion guessing game — one repository, three parts:

| Directory | What it is |
| --- | --- |
| [`web/`](./web/) | The SvelteKit web app, deployed to [tiennm99.github.io/loldle](https://tiennm99.github.io/loldle/) |
| [`data/`](./data/) | Go scraper that refreshes `champions.json` weekly from Riot's Data Dragon API |
| [`android/`](./android/) | Android client (stub) |

The `Update champions data` workflow runs the scraper every Thursday, copies the
result into `web/static/champions.json`, and redeploys the site when the data
changed.

## License

Apache-2.0 — see [LICENSE](./web/LICENSE).
