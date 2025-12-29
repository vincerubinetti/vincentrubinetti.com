<script setup lang="ts">
import { pick } from "lodash-es";
import * as logos from "@/images/logos";
import Dash from "./components/Dash.vue";

const tech = [
  {
    icons: pick(logos, ["TypeScript", "React", "Vue"]),
    description:
      "<i>Extensive</i> experience building large-scale apps w/ modern <b>TypeScript</b>, <b>React</b> & <b>Vue</b>",
  },
  {
    icons: pick(logos, ["Html", "Css", "JavaScript"]),
    description:
      "<i>Extensive</i> <i>historical</i> & <i>modern</i> experience w/ <i>vanilla</i> <b>HTML</b>, <b>CSS</b>, & <b>JavaScript</b>",
  },
  {
    icons: pick(logos, ["Svg", "Canvas", "D3"]),
    description:
      "<i>Extensive</i> experience designing custom, interactive, animated graphics w/ <b>SVG</b>, <b>Canvas</b>, & <b>D3</b>",
  },
  {
    icons: pick(logos, ["Node", "Bun", "Actions"]),
    description:
      "Experience building pipelines, automation, bots, & CLIs w/ <b>Node</b>, <b>Bun</b>, & <b>GitHub Actions</b>",
  },
  {
    icons: pick(logos, ["Jekyll", "Astro", "Next"]),
    description:
      "Experience building static & server-rendered sites w/ <b>Jekyll</b>, <b>Astro</b>, & <b>Next</b>",
  },
  {
    icons: pick(logos, ["Playwright", "Tailwind", "Figma"]),
    description: "...and<br/>&nbsp;&nbsp;much<br/>&nbsp;&nbsp;&nbsp;&nbsp;more",
  },
];
</script>

<template>
  <section class="bg-light paper">
    <h2>Tech<Dash /></h2>

    <div class="grid grid-cols-3 gap-8 max-lg:grid-cols-2 max-md:grid-cols-1">
      <div
        v-for="({ icons, description }, index) in tech"
        :key="index"
        class="corners-1 relative flex gap-6 pt-6 pl-6"
      >
        <div
          class="flex h-full w-6 shrink-0 flex-col items-center justify-between"
        >
          <component
            v-for="(icon, name, index) in icons"
            :key="index"
            :is="icon"
            :alt="name"
            class="aspect-square size-full h-[unset]!"
          />
        </div>

        <p v-html="description" class="text-balance" />
      </div>
    </div>
  </section>
</template>
