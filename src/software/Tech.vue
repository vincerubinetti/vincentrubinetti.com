<script setup lang="ts">
import { pick } from "lodash-es";
import logos from "@/images/logos";
import { renderMarkdown } from "@/util/string";
import Dash from "./components/Dash.vue";

const tech = [
  {
    icons: pick(logos, ["TypeScript", "React", "Vue"]),
    description:
      "_Extensive_ experience building large-scale apps w/ modern **TypeScript**, **React** & **Vue**",
  },
  {
    icons: pick(logos, ["Html", "Css", "JavaScript"]),
    description:
      "_Extensive_ experience w/ _historical_ & _modern_ vanilla **HTML**, **CSS**, & **JavaScript**",
  },
  {
    icons: pick(logos, ["Svg", "Canvas", "D3"]),
    description:
      "_Extensive_ experience designing custom, interactive, animated graphics w/ **SVG**, **Canvas**, & **D3**",
  },
  {
    icons: pick(logos, ["Node", "Bun", "Actions"]),
    description:
      "Experience building pipelines, automation, bots, & CLIs w/ **Node**, **Bun**, & **GitHub Actions**",
  },
  {
    icons: pick(logos, ["Jekyll", "Astro", "Next"]),
    description:
      "Experience building static & server-rendered sites w/ **Jekyll**, **Astro**, & **Next**",
  },
  {
    icons: pick(logos, ["Playwright", "Tailwind", "Figma"]),
    description: `...and  \n&nbsp;&nbsp;much  \n&nbsp;&nbsp;&nbsp;&nbsp;more`,
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

        <p v-html="renderMarkdown(description)" class="text-balance" />
      </div>
    </div>
  </section>
</template>
