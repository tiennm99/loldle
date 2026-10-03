import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  // tailwindcss() must precede sveltekit(), per the Tailwind v4 SvelteKit guide.
  plugins: [
    tailwindcss(),
    sveltekit({
      // No options: output goes to build/. No fallback either — every route is
      // prerendered, so a fallback page would mask a real prerender failure.
      adapter: adapter(),
      paths: { base: process.env.BASE_PATH || "" }
    })
  ]
});
