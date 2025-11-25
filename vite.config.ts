import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  // Remove frontend-specific plugins and config
  build: {
    // Remove frontend build config or adjust for backend needs
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
});