// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
  // The `site` property specifies the base URL for your site.
  site: "https://mindcharting.github.io",
  base: "/SimpleScheduleAI",
  prefetch: true,
  trailingSlash: "never",
  integrations: [
    react(),
    svelte(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  output: "static",
});
