// @ts-check
import vue from "@astrojs/vue";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import transformPlugin from "vite-plugin-transform";
import svgLoader from "vite-svg-loader";

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
      transformPlugin({
        tStart: "__{",
        tEnd: "}__",
        replace: loadEnv(import.meta.env.MODE, process.cwd(), [
          "WEBSITE_",
          "MAIL_",
          "RECAPTCHA",
        ]),
        replaceFiles: ["public/email.php"],
      }),
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
