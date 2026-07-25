import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  // tailwindcss() must precede sveltekit(), per the Tailwind v4 SvelteKit guide.
  plugins: [tailwindcss(), sveltekit()],
});
