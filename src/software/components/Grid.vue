<script setup lang="ts">
import { computed, onUnmounted, useTemplateRef, watch, watchEffect } from "vue";
import {
  refDebounced,
  useElementSize,
  useElementVisibility,
  useIntervalFn,
} from "@vueuse/core";
import gsap from "gsap";
import { clamp, orderBy, range, sample, uniqWith } from "lodash-es";
import { sleep } from "@/util/async";

type Props = {
  /** width in px */
  tileWidth: number;
  /** which tiles to use */
  filter: (tile: { col: number; row: number }) => boolean;
  /** colors */
  fillTopOn: string;
  fillTop: string;
  fillLeft: string;
  fillRight: string;
  stroke: string;
  dashRatio: number;
  /** whether to fade with on state */
  fade: boolean;
};

const {
  tileWidth,
  filter,
  fillTopOn,
  fillTop,
  fillLeft,
  fillRight,
  stroke,
  dashRatio,
  fade,
} = defineProps<Props>();

/** tile size props */
const tileHeight = computed(() => tileWidth / 1.73);
const tileHypot = computed(() =>
  Math.hypot(tileWidth / 2, tileHeight.value / 2),
);

gsap.defaults({ ease: "sine.inOut" });

/** isometric coords to cartesian */
const isoToCart = (col: number, row: number) => ({
  x: (tileWidth / 2) * (row + col),
  y: (tileHeight.value / 2) * (row - col),
});

/** cartesian coords to isometric */
const cartToIso = (x: number, y: number) => ({
  col: Math.round(x / tileWidth - y / tileHeight.value),
  row: Math.round(y / tileHeight.value + x / tileWidth),
});

/** tile props */
const tiles = computed(() => {
  let xs = range(
    -width.value / 2 - tileWidth,
    width.value / 2 + tileWidth,
    tileWidth / 4,
  );
  let ys = range(
    -height.value / 2 - tileHeight.value,
    height.value / 2 + tileHeight.value,
    tileHeight.value / 4,
  );
  let iso = xs.map((x) => ys.map((y) => cartToIso(x, y))).flat();
  iso = uniqWith(iso, (a, b) => a.col === b.col && a.row === b.row);
  iso = iso.filter(filter);
  let tiles = iso.map(({ col, row }) => ({
    col,
    row,
    ...isoToCart(col, row),
    on: 0,
  }));
  tiles = orderBy(tiles, ["y", "x"], ["asc", "asc"]);
  return tiles;
});

type Tile = (typeof tiles.value)[number];

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
  canvas.value.width = clamp(scale * width.value, 100, 10000);
  canvas.value.height = clamp(scale * height.value, 100, 10000);
  ctx.value.translate(scale * (width.value / 2), scale * (height.value / 2));
  ctx.value.scale(scale, scale);
});

/** dash stroke for top face */
const topStroke = computed(() => [
  dashRatio * tileHypot.value,
  (1 - dashRatio) * tileHypot.value,
]);

/** dash stroke for side faces */
const sideStroke = computed(() => [
  /** down stroke */
  (dashRatio / 2) * tileHeight.value,
  (1 - dashRatio) * tileHeight.value,
  (dashRatio / 2) * tileHeight.value +
    /** diagonal stroke */
    (dashRatio / 2) * tileHypot.value,
  (1 - dashRatio) * tileHypot.value,
  (dashRatio / 2) * tileHypot.value +
    /** up stroke */
    (dashRatio / 2) * tileHeight.value,
  (1 - dashRatio) * tileHeight.value,
  (dashRatio / 2) * tileHeight.value,
]);

/** left tile face relative coords*/
const leftFace = computed(() => [
  [-tileWidth / 2, 0],
  [-tileWidth / 2, tileHeight.value],
  [0, tileHeight.value + tileHeight.value / 2],
  [0, tileHeight.value / 2],
]);

/** right tile face relative coords */
const rightFace = computed(() => [
  [tileWidth / 2, 0],
  [tileWidth / 2, tileHeight.value],
  [0, tileHeight.value + tileHeight.value / 2],
  [0, tileHeight.value / 2],
]);

/** top tile face relative coords */
const topFace = computed(() => [
  [-tileWidth / 2, 0],
  [0, -tileHeight.value / 2],
  [tileWidth / 2, 0],
  [0, tileHeight.value / 2],
]);

/** draw isometric tile */
const drawTile = (x: number, y: number, on: number) => {
  const _ctx = ctx.value;
  if (!_ctx) return;

  /** fade with on state */
  if (fade) _ctx.globalAlpha = on;

  /** if nothing to draw */
  if (fade && !on) return;

  /** draw left face */
  _ctx.beginPath();
  leftFace.value.forEach(([dx, dy], index) =>
    _ctx[index === 0 ? "moveTo" : "lineTo"](x + dx, y + dy),
  );
  _ctx.fillStyle = fillLeft;
  _ctx.fill();
  _ctx.lineDashOffset = 0;
  _ctx.setLineDash(sideStroke.value);
  _ctx.strokeStyle = stroke;
  _ctx.stroke();

  /** draw right face */
  _ctx.beginPath();
  rightFace.value.forEach(([dx, dy], index) =>
    _ctx[index === 0 ? "moveTo" : "lineTo"](x + dx, y + dy),
  );
  _ctx.fillStyle = fillRight;
  _ctx.fill();
  _ctx.stroke();

  /** draw top face */
  _ctx.beginPath();
  topFace.value.forEach(([dx, dy], index) =>
    _ctx[index === 0 ? "moveTo" : "lineTo"](x + dx, y + dy),
  );
  _ctx.closePath();
  _ctx.fillStyle = `color-mix(in srgb, ${fillTop}, ${fillTopOn} ${on * 100}%)`;
  _ctx.fill();
  _ctx.lineDashOffset = (dashRatio / 2) * tileHypot.value;
  _ctx.setLineDash(topStroke.value);
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
  for (const tile of tiles.value)
    drawTile(tile.x, tile.y - getOn(tile) * tileHeight.value, getOn(tile));
}, 20);

/** pause when not visible */
watch(visible, () => {
  if (visible.value) render.resume();
  else render.pause();
});

/** get distance between two tiles */
const getDistance = (a: Tile, b: Tile) =>
  Math.max(Math.abs(a.col - b.col), Math.abs(a.row - b.row));

/** get tile at col/row */
const getTile = (col: number, row: number) =>
  tiles.value.find((tile) => tile.col === col && tile.row === row);

/** get tiles in radius of col/row */
const getTiles = (col: number, row: number, distance: number) => {
  const center = getTile(col, row);
  if (!center) return [];
  return tiles.value.filter((tile) => getDistance(tile, center) <= distance);
};

/** get random tile */
const getRandom = () => sample(tiles.value);

/** get all tiles */
const getAll = () => tiles.value;

/** get tile "on" status */
const getOn = (tile: Tile) => tile.on;

/** set tile "on" status */
const setOn = (tile: Tile, value: number, delay = 0, duration = 0.5) =>
  sleep(delay * 1000).then(() =>
    gsap.to(tile, { on: value ? 1 : 0, overwrite: true, duration }),
  );

/** current "on" status for pointer */
let on = 0;

/** on canvas pointer move */
const onPointer = (first: boolean) => (event: PointerEvent) => {
  if (!event.buttons) return;
  const x = event.offsetX - width.value / 2;
  const y = event.offsetY - height.value / 2;
  const { col, row } = cartToIso(x, y);
  const center = fade ? getTile(col - 1, row + 1) : getTile(col, row);
  if (!center) return;
  if (first) on = 1 - getOn(center);
  setOn(center, on, 0, 0.05);
};

/** on unload */
onUnmounted(() => gsap.killTweensOf(tiles.value));

defineExpose({
  getDistance,
  getTile,
  getTiles,
  getRandom,
  getAll,
  getOn,
  setOn,
});
</script>

<template>
  <canvas
    ref="canvas"
    @pointerdown="(event) => onPointer(true)(event)"
    @pointermove="(event) => onPointer(false)(event)"
  />
</template>
