import { defineConfig, type ViteUserConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// Vitest 3 ships its own bundled Vite, so plugins typed against the top-level
// `vite` don't match `vitest/config`'s `Plugin`. Cast through the matching
// alias from `vitest/config` to keep us in one type universe.
const plugins: ViteUserConfig["plugins"] = [
  tsconfigPaths(),
  react(),
] as ViteUserConfig["plugins"];

export default defineConfig({
  plugins,
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
});
