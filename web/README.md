# loldle

LoLdle-style League of Legends daily champion guessing game — data auto-updated by the scraper in [`data/`](../data/).

Live: https://tiennm99.github.io/loldle/

Built with SvelteKit and Svelte 5, styled with Tailwind CSS, and prerendered to a static site deployed on GitHub Pages.

## Quick start

```bash
npm install
npm run dev
```

## Commands

```bash
npm run dev      # dev server
npm run build    # static build into build/
npm run preview  # serve the production build
npm test         # unit tests
npm run lint     # eslint
```

Champion data lives in `static/champions.json` and is refreshed weekly by the sync workflow.

## License

Apache-2.0 — see [LICENSE](LICENSE).
