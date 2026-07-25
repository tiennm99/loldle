# loldle

LoLdle-style League of Legends daily champion guessing game — data auto-updated from [loldle-data](https://github.com/tiennm99/loldle-data).

Live: https://tiennm99.github.io/loldle/

Built with SvelteKit and Svelte 5, styled with Tailwind CSS, and prerendered to a static site deployed on GitHub Pages.

## Quick start

```bash
pnpm install
pnpm dev
```

## Commands

```bash
pnpm dev      # dev server
pnpm build    # static build into build/
pnpm preview  # serve the production build
pnpm test     # unit tests
pnpm lint     # eslint
```

Champion data lives in `static/champions.json` and is refreshed weekly by the sync workflow.

## License

Apache-2.0 — see [LICENSE](LICENSE).
