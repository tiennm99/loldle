import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Vitest does not read svelte.config.js, so $lib must be declared here too.
    alias: {
      $lib: fileURLToPath(new URL("./src/lib", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    setupFiles: ["./test/setup-local-storage.js"],
    include: ["test/**/*.test.js"],
  },
});
