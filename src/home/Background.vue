<script setup lang="ts">
import { computed, useTemplateRef, watchEffect } from "vue";
import { useElementSize } from "@vueuse/core";
import GlslCanvas from "glslCanvas";
import shader from "./background.frag?raw";

const canvas = useTemplateRef("canvas");

const glsl = computed(() =>
  canvas.value ? new GlslCanvas(canvas.value) : null,
);

watchEffect(() => glsl.value?.load(shader));

const { width, height } = useElementSize(canvas);

watchEffect(() => {
  if (!canvas.value) return;
  let scale = 1;
  canvas.value.width = Math.min(1000, width.value * scale);
  canvas.value.height = Math.min(1000, height.value * scale);
});
</script>

<template>
  <canvas ref="canvas"></canvas>
</template>
