import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Relative paths make the build deployable to a GitHub Pages project site.
  base: "./",
  plugins: [react()],
});
