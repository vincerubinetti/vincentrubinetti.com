<script setup lang="ts">
import { computed, useTemplateRef, watchEffect } from "vue";
import { Canvas } from "glsl-canvas-js";
import type { Canvas as CanvasType } from "glsl-canvas-js";
import shader from "./components/background.frag?raw";

const canvas = useTemplateRef("canvas");

/** attach glsl lib to canvas element */
const glsl = computed(() => {
  if (!canvas.value) return null;
  return new Canvas(canvas.value, { fragmentString: shader }) as CanvasType;
});

watchEffect(() => {
  console.log(glsl.value);
});
</script>

<template>
  <canvas ref="canvas" class="absolute inset-0 size-full opacity-50" />
</template>
