<script setup lang="ts">
import { ref, useTemplateRef, watchEffect } from "vue";

const svg = useTemplateRef("svg");
const word = useTemplateRef("word");

/** svg view box */
const viewBox = ref([0, -100, 1040, 125]);

/** hatch size */
const hatch = 10;

const text = "Vincent Rubinetti";
const letters = text.split("");

/** measured positions of chars (w/ kerning etc) */
const spacing = ref<DOMPoint[]>();

watchEffect(() => {
  if (!svg.value) return;
  if (!word.value) return;
  if (spacing.value) return;
  /** fit view box to contents */
  const { x, y, width, height } = svg.value.getBBox();
  viewBox.value = [x, y, width, height];
  /** measure text */
  spacing.value = letters.map((_, index) =>
    word.value!.getStartPositionOfChar(index),
  );
});
</script>

<template>
  <svg
    ref="svg"
    xmlns="http://www.w3.org/2000/svg"
    class="max-w-100"
    :viewBox="viewBox.join(' ')"
  >
    <pattern
      id="hatch"
      patternUnits="userSpaceOnUse"
      patternTransform="rotate(90)"
      :width="hatch"
      :height="hatch"
    >
      <path
        class="stroke-marine stroke-2"
        :d="
          [
            ['M', -1, -1],
            ['l', hatch + 1, hatch + 1],
            ['M', hatch, 0],
            ['m', -1, -1],
            ['l', hatch + 1, hatch + 1],
            ['M', 0, hatch],
            ['m', -1, -1],
            ['l', hatch + 1, hatch + 1],
          ]
            .flat()
            .join(' ')
        "
      />
    </pattern>

    <filter id="filter">
      <feTurbulence
        type="turbulence"
        baseFrequency="0.1"
        numOctaves="1"
        stitchTiles="noStitch"
        result="turbulence"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="turbulence"
        scale="3"
        xChannelSelector="G"
        yChannelSelector="A"
        result="displacement"
      >
        <animate
          attributeName="scale"
          begin="1s"
          from="3"
          to="0"
          dur="2s"
          fill="freeze"
        />
      </feDisplacementMap>
    </filter>

    <g
      class="font-sans text-[100px] font-medium tracking-wider uppercase"
      filter="url(#filter)"
    >
      <text
        v-if="!spacing"
        ref="word"
        class="opacity-0"
        text-anchor="middle"
        dominant-baseline="central"
      >
        {{ text }}
      </text>
      <template v-else>
        <g
          class="animate-hatch stroke-marine stroke-2"
          fill="url(#hatch)"
          dominant-baseline="central"
        >
          <text
            v-for="(letter, index) in letters"
            :key="index"
            :x="spacing[index].x"
            :y="spacing[index].y"
          >
            {{ letter }}
          </text>
        </g>
        <g
          class="animate-fill stroke-marine fill-current stroke-2"
          dominant-baseline="central"
        >
          <text
            v-for="(letter, index) in letters"
            :key="index"
            :x="spacing[index].x"
            :y="spacing[index].y"
          >
            {{ letter }}
          </text>
        </g>
      </template>
    </g>
  </svg>
</template>

<style scoped>
.animate-hatch {
  animation: animate-hatch 4s both;
  stroke-dasharray: 3;
}

@keyframes animate-hatch {
  0% {
    clip-path: polygon(0 0, 0 0, 0 0);
    scale: 1.5;
  }
  50% {
    clip-path: polygon(0 0, 110% 0, 0 1000%);
    opacity: 1;
    scale: 1.5;
  }
  100% {
    opacity: 0;
    scale: 1;
  }
}

.animate-fill {
  animation: animate-fill 4s both;
}

@keyframes animate-fill {
  0%,
  50% {
    fill-opacity: 0;
    stroke-opacity: 1;
    scale: 1.5;
  }
  100% {
    fill-opacity: 1;
    stroke-opacity: 0;
    scale: 1;
  }
}
</style>
