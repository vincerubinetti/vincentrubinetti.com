<script setup lang="ts">
import { computed, useTemplateRef, watchEffect } from "vue";
import { useIntervalFn } from "@vueuse/core";
import { Canvas } from "glsl-canvas-js";
import type { Canvas as CanvasType } from "glsl-canvas-js/dist/esm/glsl";
import { range } from "lodash-es";
import shader from "./background.frag?raw";
import { playing, smoothedLevel, track } from "./state";

const canvas = useTemplateRef("canvas");

/** attach glsl lib to canvas element */
const glsl = computed(() => {
  if (!canvas.value) return null;
  return new Canvas(canvas.value, { fragmentString: shader }) as CanvasType;
});

/** set shader "level" uniform */
watchEffect(() => {
  glsl.value?.setUniform("u_level", smoothedLevel.value);
});

/** set shader "play" uniform */
let play = 0;
useIntervalFn(() => {
  /** create "roving" value, fast when level high, slow when low */
  play += 0.01 + 0.15 * smoothedLevel.value ** 4;
  glsl.value?.setUniform("u_play", play);
}, 20);

/** fallback colors */
const colors = range(1, 7)
  .map((v) => 0.1 * v)
  .map((v) => [v, v, v]);

/** set shader "colors" uniforms */
watchEffect(() => {
  (track.value?.colors || colors).map((color, index) =>
    glsl.value?.setUniform(`u_colors[${index}]`, color),
  );
});
</script>

<template>
  <div>
    <canvas
      ref="canvas"
      class="size-full transition-opacity duration-1000"
      :class="playing ? 'opacity-75' : 'opacity-25'"
    />
  </div>
</template>
