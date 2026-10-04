// @ts-check
import vue from "@astrojs/vue";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import sharp from "sharp";
import { loadEnv } from "vite";
import { imagetools } from "vite-imagetools";
import transformPlugin from "vite-plugin-transform";
import svgLoader from "vite-svg-loader";

export default defineConfig({
  vite: {
    plugins: [
      {
        name: "bitmap",
        enforce: "pre",
        async load(id) {
          const [path, query] = id.split("?");
          if (!path || !new URLSearchParams(query).has("bitmap")) return;
          this.addWatchFile(path);
          const {
            data,
            info: { width, height },
          } = await sharp(path)
            .flatten({ background: "#000" })
            .greyscale()
            .raw()
            .toBuffer({ resolveWithObject: true });
          const rows = Array(height)
            .fill(0)
            .map((_, row) =>
              Array(width)
                .fill(0)
                .map((_, col) => data[row * width + col] ?? 0),
            );
          return `export default ${JSON.stringify(rows)};`;
        },
      },
      imagetools(),
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
        tStart: "%{",
        tEnd: "}%",
        replace: loadEnv(import.meta.env.MODE, process.cwd(), [
          "WEBSITE_",
          "MAIL_",
          "RECAPTCHA",
        ]),
        replaceFiles: ["dist/email.php"],
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
