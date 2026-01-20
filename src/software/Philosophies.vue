<script setup lang="ts">
import { Microscope } from "lucide-vue-next";
import { renderMarkdown } from "@/util/string";
import Dash from "./components/Dash.vue";
import UXUI from "./images/projects/ux-ui-for-researchers.pdf";

const philosophies = [
  {
    description:
      "**Software is a craft**. It demands respect and extreme attention to detail.",
  },
  {
    description:
      "**Organization is paramount**. Clean and thoughtful layout, grouping, & alignment → more intuitive.",
  },
  {
    description:
      "**Show don't tell**. Form a design language of colors, icons, & type. Minimize & simplify copy text.",
  },
  {
    description:
      "**Accessibility ≠ afterthought**. Semantic HTML, keyboard nav, & color contrast are critical.",
  },
  {
    description:
      "**Code is a UX too**. Clarity and organization matter more than cleverness or micro-optimizations.",
  },
  {
    description:
      "**Continually evolve**. Seek out new techniques, tools, or features that can improve your software or process.",
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
        v-for="({ description }, index) in philosophies"
        :key="index"
        class="corners-1 max-md relative flex gap-6 pt-6 pl-6"
      >
        <p v-html="renderMarkdown(description)" class="text-balance" />
      </div>
    </div>
    <a
      :href="UXUI"
      class="button self-center"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Microscope />More on UX/UI
    </a>
  </section>
</template>
