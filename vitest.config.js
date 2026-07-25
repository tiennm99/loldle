import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./test/setup-local-storage.js"],
    include: ["test/**/*.test.js"],
  },
});
