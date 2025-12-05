<script setup lang="ts">
import { computed, useTemplateRef, watchEffect } from "vue";
import { useIntervalFn } from "@vueuse/core";
import { Canvas } from "glsl-canvas-js";
import type { Canvas as CanvasType } from "glsl-canvas-js/dist/esm/glsl";
import shader from "./background.frag?raw";
import { playing, smoothedLevel, track } from "./state";

const canvas = useTemplateRef("canvas");

/** attach glsl lib to canvas element */
const glsl = computed(() => {
  if (!canvas.value) return null;
  return new Canvas(canvas.value, { fragmentString: shader }) as CanvasType;
});

/** play/pause */
watchEffect(() => {
  if (!glsl.value) return;
  if (playing.value) glsl.value.play();
  else glsl.value.pause();
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
  /** create "roving" value, fast when level high, slow when low */
  play += 0.01 + 0.15 * smoothedLevel.value ** 4;
  glsl.value.setUniform("u_play", play);
}, 20);

/** set shader "colors" uniforms */
watchEffect(() => {
  if (!glsl.value) return;
  track.value?.colors?.map((color, index) =>
    glsl.value?.setUniform(`u_colors[${index}]`, color),
  );
});
</script>

<template>
  <div>
    <canvas
      ref="canvas"
      class="size-full transition-opacity duration-1000"
      :class="playing ? 'opacity-75' : 'opacity-0'"
    />
  </div>
</template>
