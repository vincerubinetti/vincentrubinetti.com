<script setup lang="ts">
import { useTemplateRef, watch } from "vue";
import { Canvas } from "glsl-canvas-js";
import shader from "./components/background.frag?raw";

const canvas = useTemplateRef("canvas");

/** attach glsl lib to canvas element */
watch(canvas, () => {
  if (!canvas.value) return null;
  new Canvas(canvas.value, {
    fragmentString: shader,
    failIfMajorPerformanceCaveat: true,
  });
});
</script>

<template>
  <canvas ref="canvas" class="absolute inset-0 size-full" />
</template>
