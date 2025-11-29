<script setup lang="ts">
import { computed, useTemplateRef, watchEffect } from "vue";
import Color from "color";
import { Canvas } from "glsl-canvas-js";
import shader from "./background.frag?raw";
import { colors, level } from "./state";
import { useIntervalFn } from "@vueuse/core";

const canvas = useTemplateRef("canvas");

/** attach glsl lib to canvas element */
const glsl = computed(() => {
  if (!canvas.value) return null;
  return new Canvas(canvas.value, { fragmentString: shader });
});

/** set shader params */

watchEffect(() => {
  if (!glsl.value) return;
  glsl.value.setUniform("u_level", level.value);
});

let play = 0;
useIntervalFn(() => {
  if (!glsl.value) return;
  play += level.value / 5;
  glsl.value.setUniform("u_play", play);
}, 20);

watchEffect(() => {
  if (!glsl.value) return;
  colors.value.map((color, index) =>
    glsl.value.setUniform(
      `u_colors[${index}]`,
      new Color(color).lightness(25).unitArray(),
    ),
  );
});
</script>

<template>
  <canvas ref="canvas"></canvas>
</template>
