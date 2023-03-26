<template>
  <canvas ref="canvas" />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useIntervalFn } from "@vueuse/core";
import { sin, cos } from "../util/math";

const canvas = ref<HTMLCanvasElement>();
let ctx: CanvasRenderingContext2D | null = null;

const size = 200;
let gradients: Array<CanvasGradient>;

const onFrame = () => {
  if (!ctx) return;

  ctx.resetTransform();
  ctx.clearRect(0, 0, size, size);
  // ctx.globalCompositeOperation = "overlay";

  const time = window.performance.now() / 1000;

  for (let index = 0; index < gradients.length; index++) {
    const x = sin(time * 30 + index * 120) * size * 0.25;
    const y = cos(time * 30 + index * 120) * size * 0.25;

    ctx.resetTransform();
    ctx.translate(x, y);
    ctx.fillStyle = gradients[index];
    ctx.fillRect(0, 0, size, size);
  }
};

useIntervalFn(onFrame, 50);

onMounted(() => {
  if (!canvas.value) return;
  canvas.value.width = size;
  canvas.value.height = size;
  ctx = canvas.value.getContext("2d");
  if (ctx === null) return;

  gradients = ["#2196f3", "#ec407a", "#ab47bc"].map((color) => {
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    gradient.addColorStop(0, color + "ff");
    gradient.addColorStop(0.7, color + "80");
    gradient.addColorStop(1, color + "00");
    return gradient;
  });
});
</script>

<style scoped>
canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.2;
  z-index: -1;
  animation: fade 2s both;
}

@keyframes fade {
  from {
    opacity: 0;
  }
}
</style>
