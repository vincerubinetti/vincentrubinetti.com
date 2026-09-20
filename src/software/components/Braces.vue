<script setup lang="ts">
import { useId, useTemplateRef } from "vue";
import { useElementVisibility } from "@vueuse/core";
import Brace from "@/software/images/brace.svg?component";

const id = useId();

const container = useTemplateRef("container");

const visible = useElementVisibility(container, { threshold: 0 });
</script>

<template>
  <Brace
    ref="left"
    class="text-dark/25 absolute top-[anchor(center)] -translate-x-16 -translate-y-1/2 scale-500 transition-all duration-1000"
    :class="visible ? 'left-[anchor(left)]' : 'left-1/2'"
    :style="{ positionAnchor: `--${id}` }"
  />
  <div
    ref="container"
    class="flex flex-wrap items-center justify-center gap-8 self-center transition-all duration-1000 max-md:gap-4"
    :class="
      visible
        ? '[clip-path:inset(-10%_-10%_-10%_-10%)]'
        : '[clip-path:inset(-10%_50%_-10%_50%)]'
    "
    :style="{ anchorName: `--${id}` }"
  >
    <slot />
  </div>
  <Brace
    ref="right"
    class="text-dark/25 absolute top-[anchor(center)] translate-x-16 -translate-y-1/2 scale-500 -scale-x-500 transition-all duration-1000"
    :class="visible ? 'right-[anchor(right)]' : 'right-1/2'"
    :style="{ positionAnchor: `--${id}` }"
  />
</template>
