<script setup lang="ts">
import { useTemplateRef } from "vue";
import { useElementVisibility } from "@vueuse/core";
import Brace from "./brace.svg?component";

const container = useTemplateRef("container");

const visible = useElementVisibility(container);
</script>

<template>
  <div class="relative max-w-max self-center">
    <Brace
      ref="left"
      class="text-dark absolute top-1/2 -translate-x-16 -translate-y-1/2 scale-500 transition-all duration-1000 max-sm:-translate-x-8"
      :class="visible ? 'left-0 opacity-25' : 'left-1/2'"
    />
    <div
      ref="container"
      class="flex flex-wrap items-center justify-center gap-8 self-center transition-all duration-1000"
      :class="
        visible
          ? '[clip-path:inset(-10%_-10%_-10%_-10%)]'
          : '[clip-path:inset(-10%_50%_-10%_50%)]'
      "
    >
      <slot />
    </div>
    <Brace
      ref="right"
      class="text-dark absolute top-1/2 translate-x-16 -translate-y-1/2 scale-500 -scale-x-500 transition-all duration-1000 "
      :class="visible ? 'right-0 opacity-25' : 'right-1/2'"
    />
  </div>
</template>
