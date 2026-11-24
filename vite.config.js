import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // User site (RoinujPlaza.github.io) is served from the domain root.
  base: "/",
  plugins: [react()],
});
