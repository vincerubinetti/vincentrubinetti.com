<script setup lang="ts">
import { computed, useTemplateRef, watchEffect } from "vue";
import { useIntervalFn, useMouse, useWindowSize } from "@vueuse/core";
import Color from "color";
import { Canvas } from "glsl-canvas-js";
import shader from "./background.frag?raw";
import { playing, smoothedLevel, track } from "./state";

const canvas = useTemplateRef("canvas");

/** attach glsl lib to canvas element */
const glsl = computed(() => {
  if (!canvas.value) return null;
  return new Canvas(canvas.value, { fragmentString: shader });
});

/** set shader "level" uniform */
watchEffect(() => {
  if (!glsl.value) return;
  glsl.value.setUniform("u_level", smoothedLevel.value);
});

/** set shader "play" uniform */
let play = 0;
useIntervalFn(() => {
  if (!glsl.value) return;
  play += 0.01 + 0.15 * smoothedLevel.value ** 4;
  glsl.value.setUniform("u_play", play);
}, 20);

/** set shader "colors" uniforms */
watchEffect(() => {
  if (!glsl.value) return;
  track.value?.colors?.map((color, index) =>
    glsl.value.setUniform(
      `u_colors[${index}]`,
      new Color(color).lightness(25).unitArray(),
    ),
  );
});

/** set shader "mouse" uniforms */
const { x, y } = useMouse();
const { width, height } = useWindowSize();
watchEffect(() => {
  if (!glsl.value) return;
  const mouseX = -1 + 2 * (x.value / width.value);
  const mouseY = -1 + 2 * (y.value / height.value);
  glsl.value.setUniform("u_mouse_x", mouseX);
  glsl.value.setUniform("u_mouse_y", mouseY);
});
</script>

<template>
  <canvas
    ref="canvas"
    class="transition-opacity duration-1000"
    :class="playing ? 'opacity-50' : 'opacity-25'"
  />
</template>
