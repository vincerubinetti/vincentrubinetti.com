<script setup lang="ts">
import { renderMarkdown } from "@/util/string";
import Dash from "./components/Dash.vue";

const philosophies = [
  {
    color: "bg-red-50",
    title: "Software is a craft",
    description: "It demands respect and extreme attention to detail.",
  },
  {
    color: "bg-green-50",
    title: "Organization is key",
    description:
      "Clean and thoughtful grouping and layout of info → more intuitive.",
  },
  {
    color: "bg-blue-50",
    title: "Show, don't tell",
    description:
      "Form a design language of colors, icons, type, etc. Simplify copy text.",
  },
  {
    color: "bg-yellow-50",
    title: "Accessibility ≠ afterthought",
    description:
      "Semantic HTML, keyboard nav, color contrast, etc. are critical.",
  },
  {
    color: "bg-cyan-50",
    title: "Code is a UX too",
    description: "Cleanness over cleverness. Clarity over micro-optimization.",
  },
  {
    color: "bg-purple-50",
    title: "Continually evolve",
    description:
      "Seek out better techniques, tools, or features for your software or process.",
  },
];
</script>

<template>
  <section>
    <h2>Philosophies<Dash /></h2>

    <div
      class="grid grid-cols-3 gap-8 max-lg:grid-cols-2 max-lg:gap-6 max-md:grid-cols-1 max-md:gap-4"
    >
      <div
        v-for="({ color, title, description }, index) in philosophies"
        :key="index"
        class="corners-1 max-md relative flex flex-col gap-4 pt-6 pl-6"
      >
        <b class="relative">
          <span class="absolute -inset-1 -z-10" :class="color" />
          {{ title }}</b
        >
        <p v-html="renderMarkdown(description)" class="text-balance" />
      </div>
    </div>
  </section>
</template>
