<script setup lang="ts">
import { computed, useTemplateRef, watch } from "vue";
import { useIntervalFn, usePointer, useWindowSize } from "@vueuse/core";
import { range } from "lodash-es";
import svgFile from "@/images/brand/title.svg?raw";
import Grid from "@/software/components/Grid.vue";

/** elements */
const svg = useTemplateRef("svg");
const grid = useTemplateRef("grid");

/** svg animation duration in seconds */
const duration = 3;

/** svg parent container */
const parent = computed(() => svg.value);
/** mouse/touch */
const pointer = usePointer({ target: parent });

/** sync animation to pointer */
watch([pointer.isInside, pointer.x], () => {
  if (!svg.value) return;
  /** wait till first play of animation finishes */
  if (window.performance.now() < duration * 1000) return;

  if (pointer.isInside.value) {
    const { left, width } = svg.value.getBoundingClientRect();
    const position = pointer.x.value - left;
    const percent = 2 / 3 + position / width / 3;
    svg.value.pauseAnimations();
    svg.value.setCurrentTime(percent * duration);
  } else svg.value.unpauseAnimations();
});

/** parse raw title svg strings */
const [, svgTag, svgContent] = svgFile.match(/(<svg.*?>)(.*?)(<\/svg>)/s) ?? [];
const viewBox = svgTag
  .match(/viewBox="(.*?)"/)?.[1]
  .split(" ")
  .map(Number);

/** view box */
let [x = 0, y = 0, width = 100, height = 10] = viewBox ?? [];

/** corner padding */
const padding = 40;

/** add padding to view box */
x -= padding;
y -= padding;
width += padding * 2;
height += padding * 2;

/** svg transform center */
const transformOrigin = `${width / 2 - padding}px ${height / 2 - padding}px`;

/** svg fill pattern size */
const hatch = 16;

/** animate grid */
useIntervalFn(() => {
  if (!grid.value) return;
  const center = grid.value.getRandom();
  if (!center) return;
  const on = grid.value.getOn(center);
  for (const tile of grid.value.getTiles(center.col, center.row, 1))
    grid.value.setOn(tile, 1 - on, grid.value.getDistance(tile, center) * 0.25);
}, 500);

const windowSize = useWindowSize();

/** which grid tiles to include */
const filter = (tile: { col: number; row: number }) =>
  (Math.abs(tile.col + 3) <= 4 && Math.abs(tile.row + 10) <= 4) ||
  (Math.abs(tile.col - 3) <= 4 && Math.abs(tile.row - 9) <= 4);
</script>

<template>
  <header class="items-center bg-dark py-20 text-white">
    <Grid
      ref="grid"
      :tile-width="
        windowSize.width.value > 800
          ? 70
          : windowSize.width.value > 600
            ? 60
            : 50
      "
      :filter="filter"
      fill-top-on="oklch(50% 0.1 260)"
      fill-top="oklch(48% 0.1 260)"
      fill-left="oklch(46% 0.1 260)"
      fill-right="oklch(44% 0.1 260)"
      stroke="oklch(75% 0.1 260)"
      :dash-ratio="1 / 3"
      :fade="true"
      class="absolute inset-0 -z-10 size-full bg-[radial-gradient(ellipse_50%_100%_at_bottom_center,oklch(40%_0.1_260),transparent)]"
    />

    <hgroup class="flex flex-col items-center gap-2 text-center">
      <a href="/software" class="corners-4 w-100 max-w-full text-white">
        <svg
          ref="svg"
          xmlns="http://www.w3.org/2000/svg"
          :viewBox="[x, y, width, height].join(' ')"
        >
          <pattern
            id="hatch"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-45)"
            :width="hatch"
            :height="hatch"
          >
            <path
              class="stroke-current stroke-2"
              :d="
                [
                  ['M', 0, (0 / 2) * hatch, 'h', hatch],
                  ['M', 0, (1 / 2) * hatch, 'h', hatch],
                  ['M', 0, (2 / 2) * hatch, 'h', hatch],
                ]
                  .flat()
                  .join(' ')
              "
            />
          </pattern>

          <clipPath v-for="i in range(3)" :key="i" :id="`clip-${i + 1}`">
            <rect
              :x="-padding"
              :y="-padding"
              :width="0"
              :height="height"
              transform="skewX(-45)"
              :style="{ transformOrigin }"
            >
              <animate
                attributeName="width"
                from="0"
                :to="width"
                :dur="`${duration / 3}s`"
                :begin="`${i * (duration / 3)}s`"
                fill="freeze"
              />
              <animate
                v-if="i < 2"
                attributeName="x"
                :from="-padding"
                :to="width - padding"
                :dur="`${duration / 3}s`"
                :begin="`${(i + 1) * (duration / 3)}s`"
                fill="freeze"
              />
            </rect>
          </clipPath>

          <g>
            <rect
              class="stroke-current stroke-2"
              transform="skewX(-45)"
              :x="-padding"
              :y="-padding + height / 4"
              width="1"
              :height="height / 2"
              opacity="0"
              :style="{ transformOrigin }"
            >
              <animate
                attributeName="x"
                :to="width - padding"
                repeatCount="3"
                :dur="`${duration / 3}s`"
                fill="freeze"
              />
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                keyTimes="0;0.1;0.9;1"
                :dur="`${duration}s`"
                fill="freeze"
              />
            </rect>

            <g
              class="fill-none stroke-current stroke-2"
              clip-path="url(#clip-1)"
              v-html="svgContent"
            />
            <g
              class="stroke-current stroke-2"
              fill="url(#hatch)"
              clip-path="url(#clip-2)"
              v-html="svgContent"
            />
            <g
              class="fill-current"
              clip-path="url(#clip-3)"
              v-html="svgContent"
            />
          </g>
        </svg>
      </a>

      <p class="font-light tracking-wider text-balance">
        Frontend developer · UX/UI designer
      </p>
    </hgroup>
  </header>
</template>
