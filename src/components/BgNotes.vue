<template>
  <canvas ref="canvas" />
  <img ref="image" src="note.svg" />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useEventListener, useIntervalFn } from "@vueuse/core";
import { sin, cos, degToRad, project } from "../util/math";

const canvas = ref<HTMLCanvasElement>();
let ctx: CanvasRenderingContext2D | null = null;
const image = ref<HTMLImageElement>();

const size = 500;

let rx = 0;
let ry = 0;

function rotate(event: MouseEvent | TouchEvent) {
  const x = "clientX" in event ? event.clientX : event.touches[0].clientX;
  const y = "clientY" in event ? event.clientY : event.touches[0].clientY;
  rx = (0.5 - y / window.innerHeight) * 90;
  ry = -(0.5 - x / window.innerWidth) * 90;
}

type Particle = {
  a: number;
  r: number;
  z: number;
};

const particles = new Map<Symbol, Particle>();

const frame = () => {
  if (!ctx || !image.value) return;

  ctx.resetTransform();
  ctx.clearRect(0, 0, size, size);
  for (const [key, particle] of particles) {
    if (particle.r > size / 2) {
      particles.delete(key);
      continue;
    }
  }

  for (const [key, particle] of particles) {
    if (particle.r > size / 2) {
      particles.delete(key);
      continue;
    }

    particle.r += size / 500;
    particle.z++;
    particle.a -= 0.1;

    const percent = Math.max(
      0,
      1 - Math.abs(2 * (particle.r / (size / 2)) - 1)
    );

    const { x, y } = project(
      {
        x: size / 2 + sin(particle.a) * particle.r,
        y: size / 2 + cos(particle.a) * particle.r,
        z: particle.z,
      },
      rx,
      ry,
      size / 2,
      size / 2
    );

    ctx.globalAlpha = percent;
    ctx.setTransform(particle.r / 30, 0, 0, particle.r / 30, x, y);
    ctx.rotate(-degToRad(particle.a + 180));
    ctx.drawImage(
      image.value,
      -image.value.naturalWidth / 2,
      -image.value.naturalHeight / 2
    );
  }
};

useIntervalFn(frame, 20);

let a = 0;

const spawn = () => {
  particles.set(Symbol(), {
    a: (a += 53),
    r: 0,
    z: -100,
  });
};

useIntervalFn(spawn, 100);

onMounted(() => {
  if (!canvas.value) return;
  canvas.value.width = size;
  canvas.value.height = size;
  ctx = canvas.value.getContext("2d");

  useEventListener(window, "mousemove", rotate);
  useEventListener(window, "touchmove", rotate);
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
  animation: fade 2s both 1s;
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
</style>
