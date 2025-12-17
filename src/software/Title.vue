<script setup lang="ts">
import { computed, useTemplateRef, watch } from "vue";
import { useMouseInElement } from "@vueuse/core";
import { range } from "lodash-es";
import svgFile from "./title.svg?raw";

const svg = useTemplateRef("svg");

/** animation duration in seconds */
const duration = 2;

/** parent container */
const parent = computed(() => svg.value);
/** mouse relative to parent */
const mouse = useMouseInElement(parent);

/** sync animation to mouse */
watch([mouse.isOutside, mouse.elementX], () => {
  if (!svg.value) return;
  /** wait till first play of animation finishes */
  if (window.performance.now() < duration * 1000) return;

  if (mouse.isOutside.value) {
    svg.value.unpauseAnimations();
  } else {
    const position = mouse.elementX.value;
    const size = mouse.elementWidth.value;
    if (!size) return;
    const percent = 2 / 3 + position / size / 3;
    svg.value.pauseAnimations();
    svg.value.setCurrentTime(percent * duration);
  }
});

/** parse raw title svg strings */
const [, svgTag, svgContent] = svgFile.match(/(<svg.*?>)(.*?)(<\/svg>)/s) ?? [];
const viewBox = svgTag
  .match(/viewBox="(.*?)"/)?.[1]
  .split(" ")
  .map(Number);

/** view box */
let [x = 0, y = 0, w = 100, h = 10] = viewBox ?? [];

/** corner padding */
const p = 40;

/** add padding to view box */
x -= p;
y -= p;
w += p * 2;
h += p * 2;

const transformOrigin = `${w / 2 - p}px ${h / 2 - p}px`;

/** svg fill pattern size */
const hatch = 10;
</script>

<template>
  <hgroup class="flex flex-col items-center gap-2 py-8 text-center">
    <h1 class="sr-only">Vincent Rubinetti</h1>
    <div class="corners-2 w-full">
      <svg
        ref="svg"
        xmlns="http://www.w3.org/2000/svg"
        :viewBox="[x, y, w, h].join(' ')"
      >
        <filter id="filter">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.25"
            stitchTiles="noStitch"
            result="turbulence"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="turbulence"
            scale="5"
            xChannelSelector="G"
            yChannelSelector="A"
            result="displacement"
          >
            <animate
              attributeName="scale"
              to="1"
              :dur="`${duration}s`"
              fill="freeze"
            />
          </feDisplacementMap>
        </filter>

        <pattern
          id="hatch"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-45)"
          :width="hatch"
          :height="hatch"
        >
          <path
            class="stroke-marine stroke-3"
            :d="['M', 0, hatch / 2, 'h', hatch].flat().join(' ')"
          />
        </pattern>

        <clipPath v-for="i in range(3)" :key="i" :id="`clip-${i + 1}`">
          <rect
            :x="-p"
            :y="-p"
            width="0"
            :height="h"
            transform="skewX(-45)"
            :style="{ transformOrigin }"
          >
            <animate
              attributeName="width"
              from="0"
              :to="w"
              :dur="`${duration / 3}s`"
              :begin="`${i * (duration / 3)}s`"
              fill="freeze"
            />
            <animate
              v-if="i < 2"
              attributeName="x"
              :from="-p"
              :to="w - p"
              :dur="`${duration / 3}s`"
              :begin="`${(i + 1) * (duration / 3)}s`"
              fill="freeze"
            />
          </rect>
        </clipPath>

        <g>
          <rect
            class="stroke-marine stroke-3"
            transform="skewX(-45)"
            :x="-p"
            :y="-p"
            width="1"
            :height="h"
            opacity="0"
            :style="{ transformOrigin }"
          >
            <animate
              attributeName="x"
              :to="w - p"
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
            clip-path="url(#clip-1)"
            fill="url(#hatch)"
            filter="url(#filter)"
            v-html="svgContent"
          />
          <g
            class="stroke-marine stroke-3"
            fill="url(#hatch)"
            clip-path="url(#clip-2)"
            filter="url(#filter)"
            v-html="svgContent"
          />
          <g clip-path="url(#clip-3)" v-html="svgContent" />
        </g>
      </svg>
    </div>

    <div class="font-light tracking-wider">
      Frontend developer · UX/UI designer
    </div>
  </hgroup>
</template>
