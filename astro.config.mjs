// @ts-check
import vue from "@astrojs/vue";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import svgLoader from "vite-svg-loader";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [svgLoader({ svgo: false }), tailwindcss()],
  },

  integrations: [vue()],
});
