<script setup lang="ts">
import { ref, useTemplateRef, watchEffect } from "vue";
import { useIntervalFn } from "@vueuse/core";
import { renderMarkdown } from "@/util/string";
import Divider from "./components/Divider.vue";
import Grid from "./components/Grid.vue";

const grid = useTemplateRef("grid");

/** grid props */
const tileWidth = 20;
const bounds = 8;

/** bitmap images */
const images = import.meta.glob<number[][]>("./images/philosophies/*.png", {
  eager: true,
  query: "?bitmap",
  import: "default",
});

/** get bitmap shape for given philosophy */
const getShape = (id: string) => images[`./images/philosophies/${id}.png`];

const philosophies = [
  {
    id: "craft",
    title: "Software is a craft",
    description:
      "It should be taken seriously, with extreme attention to detail.",
  },
  {
    id: "organization",
    title: "Organization is key",
    description:
      "Clean and thoughtful grouping and layout of info = more intuitive.",
  },
  {
    id: "show",
    title: "Show, don't tell",
    description:
      "Form a design language of colors, icons, type, etc. Simplify copy text.",
  },
  {
    id: "accessibility",
    title: "Accessibility ≠ afterthought",
    description:
      "Semantic HTML, keyboard navigation, color contrast, etc. are essential.",
  },
  {
    id: "dx",
    title: "Code is a user experience too",
    description: "Cleanness over cleverness. Clarity over micro-optimization.",
  },
  {
    id: "evolve",
    title: "Continually evolve",
    description: "Always seek out better techniques and tools.",
  },
];

/** current philosophy index */
const current = ref(0);

watchEffect(() => {
  if (!grid.value) return;
  const philosophy = philosophies[current.value % philosophies.length];
  /** get shape for current philosophy */
  const shape = getShape(philosophy.id);
  if (!shape) return;
  for (const tile of grid.value.getAll()) {
    /** get brightness value of bitmap pixel corresponding to tile */
    const value = shape[tile.row + bounds]?.[tile.col + bounds];
    /** toggle on/off */
    grid.value.setOn(tile, value > 127 ? 1 : 0);
  }
});

/** auto-cycle through list */
const cycle = useIntervalFn(
  () => (current.value = (current.value + 1) % philosophies.length),
  4000,
);

/** handle pointer events */
const hover = (index: number) => {
  current.value = index;
  cycle.pause();
};
const unhover = () => cycle.resume;
</script>

<template>
  <section class="bg-pale [--width:999]">
    <h2 class="sr-only"><Divider flip />Philosophies</h2>

    <div class="flex items-center justify-center gap-16 max-lg:flex-col">
      <div class="relative grid h-60 w-90 place-items-center">
        <Grid
          ref="grid"
          :tile-width="tileWidth"
          :bounds="bounds"
          fill-top-on="oklch(99% 0.02 40)"
          fill-top="oklch(95% 0.02 40)"
          fill-left="oklch(93% 0.03 40)"
          fill-right="oklch(88% 0.04 40)"
          stroke="oklch(90% 0.1 40)"
          :style="{
            width: tileWidth * (2 * bounds + 1) + 'px',
            height: tileWidth * (2 * bounds + 1) + 'px',
          }"
          class="absolute"
        />
      </div>

      <div class="grid grid-cols-3 gap-8 max-md:grid-cols-2 max-sm:grid-cols-1">
        <div
          v-for="({ title, description }, index) in philosophies"
          :key="index"
          class="flex max-w-80 flex-col items-start gap-4"
          @pointerenter="hover(index)"
          @pointerleave="unhover()"
        >
          <b class="relative">
            <span
              class="absolute -inset-1 -z-10 transition"
              :class="current === index ? '-skew-x-25 bg-mid' : 'bg-dark/10'"
            />
            {{ title }}
          </b>
          <p v-html="renderMarkdown(description ?? '')" class="text-balance" />
        </div>
      </div>
    </div>
  </section>
</template>
