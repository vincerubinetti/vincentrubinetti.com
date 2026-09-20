<script setup lang="ts">
import { useId, useTemplateRef } from "vue";
import { useElementVisibility } from "@vueuse/core";

type Props = {
  flip?: boolean;
};

const { flip } = defineProps<Props>();

const id = useId();

const line = useTemplateRef("line");

/** whether line has scrolled into view */
const visible = useElementVisibility(line, { threshold: 0 });

const hatch = 8;
</script>

<template>
  <svg
    ref="line"
    class="h-2 min-w-0 flex-1 transition-all duration-1000"
    :class="
      visible
        ? '[clip-path:inset(0%_0%_0%_0%)]'
        : flip
          ? '[clip-path:inset(0%_0%_0%_100%)]'
          : '[clip-path:inset(0%_100%_0%_0%)]'
    "
  >
    <pattern
      :id="id"
      patternUnits="userSpaceOnUse"
      patternTransform="rotate(-45)"
      :width="hatch"
      :height="hatch"
    >
      <path
        class="stroke-dark stroke-1"
        :d="
          [
            ['M', 0, (0 / 2) * hatch, 'h', hatch],
            ['M', 0, (1 / 2) * hatch, 'h', hatch],
            ['M', 0, (2 / 2) * hatch, 'h', hatch],
          ]
            .flat()
            .join(' ')
        "
      />
    </pattern>
    <rect :fill="`url(#${id})`" x="0%" y="0%" width="100%" height="100%" />
  </svg>
</template>
