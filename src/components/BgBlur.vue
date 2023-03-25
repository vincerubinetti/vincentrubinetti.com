<template>
  <canvas width="2000" height="2000" ref="canvas" />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useIntervalFn } from "@vueuse/core";
import { sin, cos } from "../util/math";

const canvas = ref<HTMLCanvasElement>();
let ctx: CanvasRenderingContext2D | null = null;

const size = 2000;
const colors = ["#e91e63", "#9c27b0", "#2196f3"];

const onFrame = () => {
  if (!ctx) return;

  ctx.clearRect(0, 0, size, size);
  ctx.globalCompositeOperation = "overlay";

  const time = window.performance.now() / 1000;

  for (let index = 0; index < colors.length; index++) {
    const x = size / 2 + sin(time * 30 + index * 120) * size * 0.5;
    const y = size / 2 + cos(time * 30 + index * 120) * size * 0.5;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 0.75);
    gradient.addColorStop(0, colors[index] + "30");
    gradient.addColorStop(0.5, colors[index] + "20");
    gradient.addColorStop(1, colors[index] + "00");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
};

useIntervalFn(onFrame, 20);

onMounted(() => {
  if (!canvas.value) return;
  ctx = canvas.value.getContext("2d");
});
</script>

<style scoped>
canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  animation: fade 2s both;
  filter: blur(50px);
}

@keyframes fade {
  from {
    opacity: 0;
  }
}
</style>
