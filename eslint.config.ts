import vueParser from "vue-eslint-parser";
import js from "@eslint/js";
import astro from "eslint-plugin-astro";
import tailwind from "eslint-plugin-better-tailwindcss";
import { getDefaultSelectors } from "eslint-plugin-better-tailwindcss/defaults";
import {
  MatcherType,
  SelectorKind,
} from "eslint-plugin-better-tailwindcss/types";
import prettier from "eslint-plugin-prettier/recommended";
import vuePlugin from "eslint-plugin-vue";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tslint from "typescript-eslint";

const tailwindSelectors = [
  ...getDefaultSelectors(),
  {
    kind: SelectorKind.Callee,
    name: "^column$",
    match: [{ type: MatcherType.ObjectValue, path: "^className$" }],
  },
];

export default defineConfig([
  globalIgnores(["dist", "public", ".astro"]),

  {
    name: "TypeScript",
    extends: tslint.configs.recommended,
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { caughtErrors: "none" }],
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },

  {
    name: "Astro",
    extends: astro.configs.recommended,
  },

  {
    name: "JavaScript",
    files: ["**/*.{ts,tsx,js,jsx}"],
    ...js.configs.recommended,
    rules: {
      "prefer-const": ["error", { destructuring: "all" }],
    },
  },

  {
    name: "Vue",
    extends: vuePlugin.configs["flat/essential"],
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: "@typescript-eslint/parser",
      },
    },
    rules: {
      "vue/multi-word-component-names": "off",
    },
  },

  {
    name: "Prettier",
    extends: [prettier],
    ignores: ["**/*.astro/*.ts", "**/*.astro/*.js", "**/*.mdx"],
    rules: {
      "prettier/prettier": "warn",
    },
  },

  {
    name: "Tailwind",
    files: ["**/*.{astro,vue,ts}"],
    extends: [tailwind.configs.recommended],
    rules: {
      "better-tailwindcss/enforce-consistent-class-order": [
        "warn",
        { selectors: tailwindSelectors },
      ],
      "better-tailwindcss/enforce-consistent-line-wrapping": [
        "warn",
        {
          preferSingleLine: true,
          group: "never",
          printWidth: 0,
          selectors: tailwindSelectors,
        },
      ],
      "better-tailwindcss/no-unnecessary-whitespace": [
        "warn",
        { selectors: tailwindSelectors },
      ],
      "better-tailwindcss/no-unknown-classes": ["warn", { ignore: ["^_"] }],
    },
    settings: { "better-tailwindcss": { entryPoint: "./src/styles.css" } },
  },

  {
    name: "Tailwind (home)",
    files: [
      "src/home/**/*.{astro,vue,ts}",
      "src/studio/**/*.{astro,vue,ts}",
      "src/pages/index.{astro,vue,ts}",
      "src/pages/studio.{astro,vue,ts}",
      "src/pages/_images.{astro,vue,ts}",
    ],
    settings: {
      "better-tailwindcss": { entryPoint: "./src/home/styles.css" },
    },
  },

  {
    name: "Tailwind (software)",
    files: [
      "src/software/**/*.{astro,vue,ts}",
      "src/catalog/**/*.{astro,vue,ts}",
      "src/pages/software.{astro,vue,ts}",
      "src/pages/catalog.{astro,vue,ts}",
    ],
    settings: {
      "better-tailwindcss": { entryPoint: "./src/software/styles.css" },
    },
  },

  {
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: 2020,
    },
  },
]);
