<script setup lang="ts">
import { computed, ref, useTemplateRef, watchEffect } from "vue";
import { useIntervalFn } from "@vueuse/core";
import Grid from "@/software/Grid.vue";
import { renderMarkdown } from "@/util/string";
import Divider from "./components/Divider.vue";

const grid = useTemplateRef("grid");

const tileWidth = 20;
const bounds = 8;

const images = import.meta.glob<number[][]>("./images/philosophies/*.png", {
  eager: true,
  query: "?bitmap",
  import: "default",
});

const getShape = (id: string) => images[`./images/philosophies/${id}.png`];

const philosophies = [
  {
    id: "craft",
    title: "Software is a craft",
    description: "It demands respect and extreme attention to detail.",
  },
  {
    id: "organization",
    title: "Organization is key",
    description:
      "Clean and thoughtful grouping and layout of info → more intuitive.",
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
      "Semantic HTML, keyboard nav, color contrast, etc. are critical.",
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

const current = ref(0);

const philosophy = computed(
  () => philosophies[current.value % philosophies.length],
);

watchEffect(() => {
  if (!grid.value) return;
  const shape = getShape(philosophy.value.id);
  if (!shape) return;
  for (const tile of grid.value.getAll()) {
    const value = shape[tile.row + bounds]?.[tile.col + bounds];
    grid.value.setOn(tile, value > 127 ? 1 : 0);
  }
});

useIntervalFn(
  () => (current.value = (current.value + 1) % philosophies.length),
  4000,
);
</script>

<template>
  <section class="bg-pale">
    <h2 class="sr-only"><Divider flip />Philosophies</h2>

    <div class="flex flex-wrap items-center justify-center gap-12">
      <div class="relative grid h-60 w-80 place-items-center">
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

      <Transition name="_fade" mode="out-in">
        <div :key="current" class="flex grow flex-col items-center gap-4">
          <b class="relative">
            <span class="absolute -inset-1 -z-10 -skew-x-25 bg-mid" />
            {{ philosophies[current]?.title }}
          </b>
          <p
            v-html="renderMarkdown(philosophies[current]?.description ?? '')"
            class="text-center text-balance"
          />
        </div>
      </Transition>
    </div>
  </section>
</template>

<style scoped>
._fade-enter-active,
._fade-leave-active {
  transition: opacity 0.5s ease;
}

._fade-enter-from,
._fade-leave-to {
  opacity: 0;
}
</style>
