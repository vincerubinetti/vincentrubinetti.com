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
    alpha: true,
    antialias: true,
    depth: false,
    desynchronized: false,
    doubleSided: false,
    failIfMajorPerformanceCaveat: true,
    powerPreference: "low-power",
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    stencil: false,
  });
});
</script>

<template>
  <canvas ref="canvas" class="absolute inset-0 size-full" />
</template>
