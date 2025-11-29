<script setup lang="ts">
import { computed, useTemplateRef, watchEffect } from "vue";
import { useElementSize } from "@vueuse/core";
import Color from "color";
import GlslCanvas from "glslCanvas";
import shader from "./background.frag?raw";
import { colors, level } from "./state";

const canvas = useTemplateRef("canvas");

/** attach glsl lib to canvas element */
const sandbox = computed(() =>
  canvas.value ? new GlslCanvas(canvas.value) : null,
);

/** load frag shader code */
watchEffect(() => sandbox.value?.load(shader));

const { width, height } = useElementSize(canvas);

/** resize canvas */
watchEffect(() => {
  if (!canvas.value) return;
  let scale = 1;
  canvas.value.width = Math.min(1000, width.value * scale);
  canvas.value.height = Math.min(1000, height.value * scale);
});

/** set shader params */
watchEffect(() => {
  if (!sandbox.value) return;
  sandbox.value.setUniform("u_level", level.value);
});
watchEffect(() => {
  if (!sandbox.value) return;

  colors.value.forEach((color, i) => {
    const vec = new Color(color).lightness(32).unitArray();
    sandbox.value!.setUniform(`u_color_${i + 1}`, ...vec);
  });
});
</script>

<template>
  <canvas ref="canvas"></canvas>
</template>
