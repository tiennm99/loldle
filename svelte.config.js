import adapter from "@sveltejs/adapter-static";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    // No options: output goes to build/. No fallback either — every route is
    // prerendered, so a fallback page would mask a real prerender failure.
    adapter: adapter(),
    paths: {
      base: process.env.BASE_PATH || "",
    },
  },
};

export default config;
