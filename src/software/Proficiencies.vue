<script setup lang="ts">
import { Ellipsis } from "lucide-vue-next";
import css from "@/assets/logos/css.svg?component";
import d3 from "@/assets/logos/d3.svg?component";
import html from "@/assets/logos/html.svg?component";
import javascript from "@/assets/logos/javascript.svg?component";
import node from "@/assets/logos/node.svg?component";
import react from "@/assets/logos/react.svg?component";
import svg from "@/assets/logos/svg.svg?component";
import tailwind from "@/assets/logos/tailwind.svg?component";
import typescript from "@/assets/logos/typescript.svg?component";
import vue from "@/assets/logos/vue.svg?component";

const proficiencies = [
  {
    icons: [typescript],
    description:
      "<i>Extensive</i> experience building large, robust apps w/ <b>TypeScript</b>",
  },
  {
    icons: [react],
    description:
      "<i>Extensive</i> experience building large apps w/ modern functional composable <b>React</b>",
  },
  {
    icons: [vue],
    description:
      "<i>Extensive</i> experience building large apps w/ <b>Vue</b> 3 and composition API",
  },
  {
    icons: [html, css, javascript],
    description:
      "<i>Extensive</i> <i>historical</i> and <i>modern</i> experience w/ <i>vanilla</i> <b>HTML</b>, <b>CSS</b>, <b>JavaScript</b>",
  },
  {
    icons: [node],
    description:
      "Experience building pipelines, automation, scripts, etc. w/ <b>Node</b>",
  },

  {
    icons: [d3],
    description:
      "<i>Extensive</i> experience creating custom interactive visualizations w/ <b>D3</b>",
  },
  {
    icons: [svg],
    description:
      "<i>Extensive</i> experience designing and animating SVGs by hand",
  },
  {
    icons: [tailwind],
    description:
      "Experience building beautiful, responsive UIs w/ <b>Tailwind</b>",
  },
  {
    icons: [Ellipsis],
    description: "Much more",
  },
];
</script>

<template>
  <section class="bg-terracotta/25">
    <div class="grid grid-cols-3 gap-8 max-lg:grid-cols-2 max-md:grid-cols-1">
      <h3 class="sr-only">Proficiencies</h3>

      <div
        v-for="({ icons, description }, index) in proficiencies"
        :key="index"
        class="corners-1 relative flex gap-4 pt-4 pl-4"
      >
        <div class="flex w-10 shrink-0 flex-col items-center gap-1">
          <component
            v-for="(icon, index) in icons"
            :key="index"
            :is="icon"
            class="h-auto!"
            :class="icons.length > 1 ? 'w-5/8!' : 'w-full!'"
          />
        </div>

        <p v-html="description" class="text-balance" />
      </div>
    </div>
  </section>
</template>
