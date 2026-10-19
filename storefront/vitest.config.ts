import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Next.js tidak memakai Vite, tapi Vitest memakai config Vite. Alias `@/*` di sini
// harus sama dengan `paths` di tsconfig.json.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
