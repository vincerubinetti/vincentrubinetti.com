// @ts-check
import vue from "@astrojs/vue";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import svgLoader from "vite-svg-loader";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [
      svgLoader({
        svgoConfig: {
          plugins: [
            {
              name: "addClassesToSVGElement",
              params: { classNames: ["icon"] },
            },
          ],
        },
      }),
      tailwindcss(),
    ],
  },

  integrations: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith("youtube-video"),
        },
      },
    }),
  ],
});
