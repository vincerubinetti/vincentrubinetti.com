<script setup lang="ts">
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
    name: "TypeScript",
    description:
      "<i>Extensive</i> experience building large, robust apps w/ <b>TypeScript</b>",
  },
  {
    icons: [react],
    name: "React",
    description:
      "<i>Extensive</i> experience building large apps w/ modern <b>React</b>",
  },
  {
    icons: [vue],
    name: "Vue",
    description:
      "<i>Extensive</i> experience building large apps w/ <b>Vue</b> 3 and composition API",
  },
  {
    icons: [html, css, javascript],
    name: "HTML, CSS, JavaScript",
    description:
      "<i>Extensive</i> <i>historical</i> and <i>modern</i> exp. w/ <i>vanilla</i> <b>HTML</b>, <b>CSS</b>, <b>JavaScript</b>",
  },
  {
    icons: [node],
    name: "Node",
    description:
      "Experience building data processing, automation, etc. w/ <b>Node</b>",
  },
  {
    icons: [svg],
    name: "SVG",
    description:
      "<i>Extensive</i> experience designing and animating SVGs by hand",
  },
  {
    icons: [d3],
    name: "D3",
    description:
      "<i>Extensive</i> experience creating custom interactive visualizations w/ <b>D3</b>",
  },
  {
    icons: [tailwind],
    name: "Tailwind",
    description:
      "Experience building beautiful, responsive UIs w/ <b>Tailwind</b>",
  },
];
</script>

<template>
  <section>
    <div class="grid grid-cols-3 gap-8">
      <h3 class="sr-only">Proficiencies</h3>

      <div
        v-for="{ icons, name, description } in proficiencies"
        :key="name"
        class="relative flex items-center gap-4"
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
        <strong class="sr-only">{{ name }}</strong>
        <p v-html="description" />
      </div>
    </div>
  </section>
</template>
