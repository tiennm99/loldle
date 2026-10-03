import { defineConfig } from "vitest/config";

// #lib/* resolves through package.json "imports", so no alias is needed here.
export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./test/setup-local-storage.js"],
    include: ["test/**/*.test.js"],
  },
});
