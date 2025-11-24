import eslintJs from "@eslint/js";
import eslintPluginAstro from "eslint-plugin-astro";
import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";
import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import typescriptEslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["dist", ".astro"]),
  ...eslintPluginAstro.configs.recommended,
  {
    files: ["**/*.{astro,vue,ts}"],
    extends: [eslintJs.configs.recommended, eslintPluginPrettierRecommended],
    plugins: {
      prettier: eslintPluginPrettier,
      "better-tailwindcss": eslintPluginBetterTailwindcss,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      ...eslintPluginBetterTailwindcss.configs["recommended-warn"].rules,
      "prettier/prettier": "warn",
      "prefer-const": ["error", { destructuring: "all" }],
      "better-tailwindcss/enforce-consistent-variable-syntax": "warn",
      "better-tailwindcss/enforce-shorthand-classes": "warn",
      "better-tailwindcss/no-deprecated-classes": "warn",
    },
    settings: {
      "better-tailwindcss": { entryPoint: "src/styles.css" },
    },
  },
  {
    files: ["**/*.{vue,ts}"],
    extends: [typescriptEslint.configs.recommended],
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { caughtErrors: "none" }],
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
]);
