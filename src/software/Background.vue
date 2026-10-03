<script setup lang="ts">
import { computed, onUnmounted, useTemplateRef, watch, watchEffect } from "vue";
import {
  refDebounced,
  useElementSize,
  useElementVisibility,
  useIntervalFn,
} from "@vueuse/core";
import gsap from "gsap";
import { orderBy, random, range, uniqWith } from "lodash-es";
import { sleep } from "@/util/misc";

/** size of tile */
const tileWidth = 100;
const tileHeight = tileWidth / 1.73;
const tileHypot = Math.hypot(tileWidth / 2, tileHeight / 2);
/** hard boundary on tiles, in iso space */
const bounds = 8;
/** colors */
const fillTop = "oklch(50% 0.1 260)";
const fillLeft = "oklch(45% 0.1 260)";
const fillRight = "oklch(55% 0.1 260)";
const stroke = "white";
/** animation */
const spread = 2;
const stagger = 0.25;
const period = 500;

gsap.defaults({ ease: "sine.inOut", duration: 0.5 });

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
  const xs = range(-width.value / 2, width.value / 2, tileWidth / 4);
  const ys = range(
    -height.value / 2,
    height.value / 2 + tileHeight,
    tileHeight / 4,
  );
  let iso = xs.map((x) => ys.map((y) => cartToIso(x, y))).flat();
  iso = uniqWith(iso, (a, b) => a.col === b.col && a.row === b.row);
  iso = iso.filter(
    (tile) => Math.abs(tile.col) < bounds && Math.abs(tile.row) < bounds,
  );
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
const size = useElementSize(canvas);
const width = refDebounced(size.width, 100);
const height = refDebounced(size.height, 100);

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

/** dash stroke for side faces */
const sideStroke = [
  /** down stroke */
  tileHeight / 8,
  tileHeight / 4,
  tileHeight / 4,
  tileHeight / 4,
  tileHeight / 8 +
    /** diagonal stroke */
    tileHypot / 8,
  tileHypot / 4,
  tileHypot / 4,
  tileHypot / 4,
  tileHypot / 8 +
    /** up stroke */
    tileHeight / 8,
  tileHeight / 4,
  tileHeight / 4,
  tileHeight / 4,
  tileHeight / 8,
];

/** draw isometric tile */
const drawTile = (x: number, y: number) => {
  const _ctx = ctx.value;
  if (!_ctx) return;
  _ctx.strokeStyle = stroke;

  /** left face */
  _ctx.beginPath();
  _ctx.moveTo(x - tileWidth / 2, y);
  _ctx.lineTo(x - tileWidth / 2, y + tileHeight);
  _ctx.lineTo(x, y + tileHeight + tileHeight / 2);
  _ctx.lineTo(x, y + tileHeight / 2);
  _ctx.fillStyle = fillLeft;
  _ctx.fill();
  _ctx.lineDashOffset = 0;
  _ctx.setLineDash(sideStroke);
  _ctx.stroke();

  /** right face */
  _ctx.beginPath();
  _ctx.moveTo(x + tileWidth / 2, y);
  _ctx.lineTo(x + tileWidth / 2, y + tileHeight);
  _ctx.lineTo(x, y + tileHeight + tileHeight / 2);
  _ctx.lineTo(x, y + tileHeight / 2);
  _ctx.fillStyle = fillRight;
  _ctx.fill();
  _ctx.stroke();

  /** top face */
  _ctx.beginPath();
  _ctx.moveTo(x - tileWidth / 2, y);
  _ctx.lineTo(x, y - tileHeight / 2);
  _ctx.lineTo(x + tileWidth / 2, y);
  _ctx.lineTo(x, y + tileHeight / 2);
  _ctx.closePath();
  _ctx.fillStyle = fillTop;
  _ctx.fill();
  _ctx.lineDashOffset = tileHypot / 8;
  _ctx.setLineDash([tileHypot / 4]);
  _ctx.stroke();
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
  const { col, row } = cartToIso(x, y);
  const center = tiles.value.find((t) => t.col === col && t.row === row);
  if (!center) return;
  const target = center?.b < 0.5 ? 1 : 0;
  for (const tile of tiles.value) {
    const distance = Math.max(
      Math.abs(tile.col - col),
      Math.abs(tile.row - row),
    );
    if (distance >= spread) continue;
    sleep(stagger * distance * 1000).then(() =>
      gsap.to(tile, { b: target, overwrite: true }),
    );
  }
};

/** trigger new bulge */
const trigger = useIntervalFn(() => {
  const x = random(-width.value / 2, width.value / 2, true);
  const y = random(-height.value / 2, height.value / 2, true);
  bulge(x, y);
}, period);

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
    class="absolute inset-0 -z-10 size-full opacity-50"
    @click="click"
  />
</template>
