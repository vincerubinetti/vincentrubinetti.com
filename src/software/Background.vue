<script setup lang="ts">
import { computed, onUnmounted, useTemplateRef, watch, watchEffect } from "vue";
import {
  useElementSize,
  useElementVisibility,
  useIntervalFn,
} from "@vueuse/core";
import gsap from "gsap";
import { clamp, orderBy, random, range, uniqWith } from "lodash-es";
import { sleep } from "@/util/misc";

/** size of tile */
const tileWidth = 40;
const tileHeight = 20;
/** size to block out in center of canvas */
const deadWidth = 300;
const deadHeight = 100;
/** colors */
const colorDark = "oklch(50% 0.1 260)";
const colorMid = "oklch(60% 0.1 260)";
const colorLight = "oklch(85% 0.1 40)";
/** animation */
const spread = 1.5;
const stagger = 0.1;

gsap.defaults({ ease: "sine.inOut", duration: 0.1 });

/** isometric coords to cartesian */
const isoToCart = (col: number, row: number) => ({
  x: (tileWidth / 2) * (col - row),
  y: (tileHeight / 2) * (col + row),
});

/** cartesian coords to isometric */
const cartToIso = (x: number, y: number) => ({
  col: Math.round(x / tileWidth + y / tileHeight),
  row: Math.round(y / tileHeight - x / tileWidth),
});

/** tile props */
const tiles = computed(() => {
  const xs = range(-width.value / 2, width.value / 2);
  const ys = range(-height.value / 2, height.value / 2 + tileHeight);
  let iso = xs.map((x) => ys.map((y) => cartToIso(x, y))).flat();
  iso = uniqWith(iso, (a, b) => a.col === b.col && a.row === b.row);
  let tiles = iso.map(({ col, row }) => ({
    col,
    row,
    ...isoToCart(col, row),
    b: 0,
  }));
  tiles = orderBy(tiles, ["y", "x"], ["asc", "asc"]);
  return tiles;
});

/** canvas element */
const canvas = useTemplateRef("canvas");

/** canvas size */
const { width, height } = useElementSize(canvas);

/** canvas in view */
const visible = useElementVisibility(canvas);

/** draw context */
const ctx = computed(() => canvas.value?.getContext("2d") || null);

/** init canvas */
watchEffect(() => {
  if (!canvas.value) return;
  if (!ctx.value) return;
  const scale = window.devicePixelRatio || 1;
  canvas.value.width = scale * width.value;
  canvas.value.height = scale * height.value;
  ctx.value.translate(scale * (width.value / 2), scale * (height.value / 2));
  ctx.value.scale(scale, scale);
});

/** draw isometric tile */
const drawTile = (x: number, y: number) => {
  const _ctx = ctx.value;
  if (!_ctx) return;
  _ctx.fillStyle = colorDark;
  _ctx.beginPath();
  _ctx.moveTo(x - tileWidth / 2, y);
  _ctx.lineTo(x, y - tileHeight / 2);
  _ctx.lineTo(x + tileWidth / 2, y);
  _ctx.lineTo(x, y + tileHeight / 2);
  _ctx.fill();
  _ctx.fillStyle = colorMid;
  _ctx.beginPath();
  _ctx.moveTo(x, y + tileHeight / 2);
  _ctx.lineTo(x - tileWidth / 2, y);
  _ctx.lineTo(x - tileWidth / 2, y + tileHeight);
  _ctx.lineTo(x, y + tileHeight + tileHeight / 2);
  _ctx.fill();
  _ctx.fillStyle = colorLight;
  _ctx.beginPath();
  _ctx.moveTo(x, y + tileHeight / 2);
  _ctx.lineTo(x + tileWidth / 2, y);
  _ctx.lineTo(x + tileWidth / 2, y + tileHeight);
  _ctx.lineTo(x, y + tileHeight + tileHeight / 2);
  _ctx.fill();
};

/** render loop */
const render = useIntervalFn(() => {
  if (!ctx.value) return;
  ctx.value.clearRect(
    -width.value / 2,
    -height.value / 2,
    width.value,
    height.value,
  );
  for (const { x, y, b } of tiles.value) drawTile(x, y - b * tileHeight);
}, 20);

/** bulge/de-bulge tiles around point */
const bulge = (x: number, y: number) => {
  if (window.performance.now() < 3 * 1000) return;
  const { col, row } = cartToIso(x, y);
  const tile = tiles.value.find((t) => t.col === col && t.row === row);
  const target = (tile?.b ?? 0.5) < 0.5 ? 1 : 0;
  for (const tile of tiles.value) {
    const distance = Math.hypot(tile.col - col, tile.row - row);
    const power = clamp(2 - distance / spread, 0, 1);
    if (!power) continue;
    sleep(distance * stagger * 1000).then(() =>
      gsap.to(tile, { b: target, overwrite: true }),
    );
  }
};

/** trigger new bulge */
const trigger = useIntervalFn(() => {
  for (let tries = 10; tries > 0; tries--) {
    const x = random(-width.value / 2, width.value / 2, true);
    const y = random(-height.value / 2, height.value / 2, true);
    if (Math.abs(x) > deadWidth || Math.abs(y) > deadHeight) {
      bulge(x, y);
      break;
    }
  }
}, 500);

/** pause when not visible */
watch(visible, () => {
  if (visible.value) {
    render.resume();
    trigger.resume();
  } else {
    render.pause();
    trigger.pause();
  }
});

/** on canvas click */
const click = (event: MouseEvent) => {
  const x = event.offsetX - width.value / 2;
  const y = event.offsetY - height.value / 2;
  bulge(x, y);
  trigger.pause();
};

/** on unload */
onUnmounted(() => gsap.killTweensOf(tiles.value));
</script>

<template>
  <canvas
    ref="canvas"
    class="absolute inset-0 -z-10 size-full"
    @click="click"
  />
</template>
