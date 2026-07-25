import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import svelte from "eslint-plugin-svelte";
import globals from "globals";

export default defineConfig([
  globalIgnores([".svelte-kit/**", "build/**"]),

  js.configs.recommended,
  ...svelte.configs.recommended,

  // App code runs in the browser.
  {
    languageOptions: {
      globals: { ...globals.browser },
    },
  },

  // Config files and tests run in Node. Tests keep the browser globals too,
  // since the localStorage stub is installed onto globalThis.
  {
    files: ["*.config.js", "*.config.mjs", "test/**/*.js"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
]);
