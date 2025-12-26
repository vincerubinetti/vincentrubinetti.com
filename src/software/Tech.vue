<script setup lang="ts">
import Actions from "@/assets/logos/actions.svg?component";
import Astro from "@/assets/logos/astro.svg?component";
import Bun from "@/assets/logos/bun.svg?component";
import Canvas from "@/assets/logos/canvas.svg?component";
import Css from "@/assets/logos/css.svg?component";
import D3 from "@/assets/logos/d3.svg?component";
import Figma from "@/assets/logos/figma.svg?component";
import Html from "@/assets/logos/html.svg?component";
import JavaScript from "@/assets/logos/javascript.svg?component";
import Jekyll from "@/assets/logos/jekyll.svg?component";
import Next from "@/assets/logos/next.svg?component";
import Node from "@/assets/logos/node.svg?component";
import Playwright from "@/assets/logos/playwright.svg?component";
import React from "@/assets/logos/react.svg?component";
import Svg from "@/assets/logos/svg.svg?component";
import Tailwind from "@/assets/logos/tailwind.svg?component";
import TypeScript from "@/assets/logos/typescript.svg?component";
import Vue from "@/assets/logos/vue.svg?component";
import Scroll from "@/software/Scroll.vue";

const tech = [
  {
    icons: { TypeScript, React, Vue },
    description:
      "<i>Extensive</i> experience building large-scale apps w/ modern <b>TypeScript</b>, <b>React</b> & <b>Vue</b>",
  },
  {
    icons: { Html, Css, JavaScript },
    description:
      "<i>Extensive</i> <i>historical</i> & <i>modern</i> experience w/ <i>vanilla</i> <b>HTML</b>, <b>CSS</b>, & <b>JavaScript</b>",
  },
  {
    icons: { Svg, Canvas, D3 },
    description:
      "<i>Extensive</i> experience designing custom, interactive, animated graphics w/ <b>SVG</b>, <b>Canvas</b>, & <b>D3</b>",
  },
  {
    icons: { Node, Bun, Actions },
    description:
      "Experience building pipelines, automation, bots, & CLIs w/ <b>Node</b>, <b>Bun</b>, & <b>GitHub Actions</b>",
  },
  {
    icons: { Jekyll, Astro, Next },
    description:
      "Experience building static & server-rendered sites w/ <b>Jekyll</b>, <b>Astro</b>, & <b>Next</b>",
  },
  {
    icons: { Playwright, Tailwind, Figma },
    description: "...and<br/>&nbsp;&nbsp;much<br/>&nbsp;&nbsp;&nbsp;&nbsp;more",
  },
];
</script>

<template>
  <section class="bg-light paper">
    <h2 class="w-full"><Scroll class="-scale-x-100" />Tech</h2>

    <div class="grid grid-cols-3 gap-8 max-lg:grid-cols-2 max-md:grid-cols-1">
      <div
        v-for="({ icons, description }, index) in tech"
        :key="index"
        class="corners-1 relative flex gap-6 pt-6 pl-6"
      >
        <div class="flex w-6 shrink-0 flex-col items-center gap-3">
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
