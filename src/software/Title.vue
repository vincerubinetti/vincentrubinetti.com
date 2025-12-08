<script setup lang="ts">
import { useTemplateRef, watchEffect } from "vue";

const svg = useTemplateRef("svg");

/** fit view box to contents */
watchEffect(async () => {
  if (!svg.value) return;
  const { x, y, width, height } = svg.value.getBBox();
  svg.value.setAttribute("viewBox", [x, y, width, height].join(" "));
});

const hatch = 10;
</script>

<template>
  <svg ref="svg" class="max-w-100">
    <pattern
      id="hatch"
      patternUnits="userSpaceOnUse"
      patternTransform="rotate(90)"
      :width="hatch"
      :height="hatch"
    >
      <path
        class="stroke-marine stroke-1"
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

    <g class="font-sans text-[100px] font-medium tracking-wider uppercase">
      <text class="draw-hatch" fill="url(#hatch)">Vincent Rubinetti</text>
      <text class="draw-fill stroke-marine fill-current">
        Vincent Rubinetti
      </text>
    </g>
  </svg>
</template>

<style scoped>
.draw-hatch {
  animation: draw-hatch 2s both;
}

@keyframes draw-hatch {
  from {
    clip-path: polygon(0 0, 0 0, 0 0);
  }
  to {
    clip-path: polygon(0 0, 110% 0, 0 1000%);
  }
}

.draw-fill {
  animation: draw-fill 2s 2s both;
}

@keyframes draw-fill {
  from {
    fill-opacity: 0;
    stroke-opacity: 1;
  }
  to {
    fill-opacity: 1;
    stroke-opacity: 0;
  }
}
</style>
