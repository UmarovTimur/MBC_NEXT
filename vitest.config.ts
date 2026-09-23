import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests for the shared packages and the az app. apps/uz keeps its own config.
export default defineConfig({
  resolve: {
    // The az app's "@/..." import alias; matches "@/x" only, never "@mbc/...".
    alias: { "@": fileURLToPath(new URL("./apps/az/src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["packages/*/src/**/*.test.ts", "apps/az/src/**/*.test.ts"],
  },
});
