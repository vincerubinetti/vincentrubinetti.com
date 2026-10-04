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
  /** hard boundary on tiles, in iso space */
  bounds: number;
  /** colors */
  fillTopOn: string;
  fillTop: string;
  fillLeft: string;
  fillRight: string;
  stroke: string;
};

const { tileWidth, bounds, fillTopOn, fillTop, fillLeft, fillRight, stroke } =
  defineProps<Props>();

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
  const xs = range(-width.value / 2, width.value / 2, tileWidth / 4);
  const ys = range(-height.value / 2, height.value / 2, tileHeight.value / 4);
  let iso = xs.map((x) => ys.map((y) => cartToIso(x, y))).flat();
  iso = uniqWith(iso, (a, b) => a.col === b.col && a.row === b.row);
  iso = iso.filter(
    (tile) => Math.abs(tile.col) <= bounds && Math.abs(tile.row) <= bounds,
  );
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

/** dash stroke for side faces */
const sideStroke = [
  /** down stroke */
  tileHeight.value / 8,
  tileHeight.value / 4,
  tileHeight.value / 4,
  tileHeight.value / 4,
  tileHeight.value / 8 +
    /** diagonal stroke */
    tileHypot.value / 8,
  tileHypot.value / 4,
  tileHypot.value / 4,
  tileHypot.value / 4,
  tileHypot.value / 8 +
    /** up stroke */
    tileHeight.value / 8,
  tileHeight.value / 4,
  tileHeight.value / 4,
  tileHeight.value / 4,
  tileHeight.value / 8,
];

/** draw isometric tile */
const drawTile = (x: number, y: number, on: number) => {
  const _ctx = ctx.value;
  if (!_ctx) return;
  _ctx.strokeStyle = stroke;

  /** left face */
  _ctx.beginPath();
  _ctx.moveTo(x - tileWidth / 2, y);
  _ctx.lineTo(x - tileWidth / 2, y + tileHeight.value);
  _ctx.lineTo(x, y + tileHeight.value + tileHeight.value / 2);
  _ctx.lineTo(x, y + tileHeight.value / 2);
  _ctx.fillStyle = fillLeft;
  _ctx.fill();
  _ctx.lineDashOffset = 0;
  _ctx.setLineDash(sideStroke);
  _ctx.stroke();

  /** right face */
  _ctx.beginPath();
  _ctx.moveTo(x + tileWidth / 2, y);
  _ctx.lineTo(x + tileWidth / 2, y + tileHeight.value);
  _ctx.lineTo(x, y + tileHeight.value + tileHeight.value / 2);
  _ctx.lineTo(x, y + tileHeight.value / 2);
  _ctx.fillStyle = fillRight;
  _ctx.fill();
  _ctx.stroke();

  /** top face */
  _ctx.beginPath();
  _ctx.moveTo(x - tileWidth / 2, y);
  _ctx.lineTo(x, y - tileHeight.value / 2);
  _ctx.lineTo(x + tileWidth / 2, y);
  _ctx.lineTo(x, y + tileHeight.value / 2);
  _ctx.closePath();
  _ctx.fillStyle = `color-mix(in srgb, ${fillTop}, ${fillTopOn} ${on * 100}%)`;
  _ctx.fill();
  _ctx.lineDashOffset = tileHypot.value / 8;
  _ctx.setLineDash([tileHypot.value / 4]);
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
    drawTile(tile.x, tile.y - tile.on * tileHeight.value, getOn(tile));
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
const setOn = (tile: Tile, value: number, delay = 0, duration = 0.25) =>
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
  const center = getTile(col, row);
  if (!center) return;
  if (first) on = 1 - getOn(center);
  setOn(center, on, 0, 0.1);
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
