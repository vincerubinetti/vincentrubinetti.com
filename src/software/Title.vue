<script setup lang="ts">
import { ref, useTemplateRef, watchEffect } from "vue";
import { sleep } from "@/util/misc";

const svg = useTemplateRef("svg");
const word = useTemplateRef("word");

/** fit view box to contents */
const fit = () => {
  if (!svg.value) return;
  const { x, y, width, height } = svg.value.getBBox();
  svg.value.setAttribute("viewBox", [x, y, width, height].join(" "));
};

/** hatch size */
const hatch = 10;

const text = "Vincent Rubinetti";
const letters = text.split("");

/** measured x positions of chars (w/ kerning etc) */
const xs = ref<number[]>();

/** measure text */
watchEffect(async () => {
  if (!word.value) return;
  xs.value = letters.map(
    (_, index) => word.value!.getStartPositionOfChar(index).x,
  );
  await sleep();
  fit();
});
</script>

<template>
  <svg ref="svg" class="max-w-100" viewBox="0 -100 1040 125">
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

    <filter id="roughen">
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
        result="displacementMap"
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
      filter="url(#roughen)"
    >
      <text v-if="!xs" ref="word">{{ text }}</text>
      <template v-else>
        <g class="draw-hatch stroke-marine stroke-2" fill="url(#hatch)">
          <text v-for="(letter, index) in letters" :key="index" :x="xs[index]">
            {{ letter }}
          </text>
        </g>
        <g class="draw-fill stroke-marine fill-current stroke-2">
          <text v-for="(letter, index) in letters" :key="index" :x="xs[index]">
            {{ letter }}
          </text>
        </g>
      </template>
    </g>
  </svg>
</template>

<style scoped>
.draw-hatch {
  animation: draw-hatch 4s both;
  stroke-dasharray: 3;
}

@keyframes draw-hatch {
  0% {
    clip-path: polygon(0 0, 0 0, 0 0);
  }
  50% {
    clip-path: polygon(0 0, 110% 0, 0 1000%);
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.draw-fill {
  animation: draw-fill 4s both;
}

@keyframes draw-fill {
  0%,
  50% {
    fill-opacity: 0;
    stroke-opacity: 1;
  }
  100% {
    fill-opacity: 1;
    stroke-opacity: 0;
  }
}
</style>
