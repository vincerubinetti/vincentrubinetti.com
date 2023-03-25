<template>
  <canvas width="1000" height="1000" ref="canvas" />
  <img ref="image" src="note.svg" />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useIntervalFn } from "@vueuse/core";
import { sin, cos, degToRad } from "../util/math";

const canvas = ref<HTMLCanvasElement>();
let ctx: CanvasRenderingContext2D | null = null;
const image = ref<HTMLImageElement>();

const size = 1000;

type Particle = {
  angle: number;
  radius: number;
};

const particles = new Map<Symbol, Particle>();

const frame = () => {
  if (!ctx || !image.value) return;

  ctx.resetTransform();
  ctx.clearRect(0, 0, size, size);

  for (const [key, particle] of particles) {
    if (particle.radius > size) {
      particles.delete(key);
      continue;
    }

    particle.radius += 1;

    const scale = Math.max(
      0,
      1 - Math.abs(2 * (particle.radius / (size / 2)) - 1)
    );

    const x = size / 2 + sin(particle.angle) * particle.radius;
    const y = size / 2 + cos(particle.angle) * particle.radius;

    ctx.fillStyle = "white";
    ctx.globalAlpha = scale;
    ctx.setTransform(scale, 0, 0, scale, x, y);
    ctx.rotate(-degToRad(particle.angle + 180));
    ctx.drawImage(
      image.value,
      -image.value.naturalWidth / 2,
      -image.value.naturalHeight / 2
    );
  }
};

useIntervalFn(frame, 20);

let angle = 0;

const spawn = () => {
  particles.set(Symbol(), {
    angle: (angle += 33),
    radius: 0,
  });
};

useIntervalFn(spawn, 100);

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
  object-fit: contain;
  z-index: -1;
  animation: fade 2s both 1s, spin 60s linear infinite;
  mix-blend-mode: overlay;
}

img {
  width: 0;
}

@keyframes fade {
  from {
    opacity: 0;
  }
}

@keyframes spin {
  from {
    transform: rotate(0);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
