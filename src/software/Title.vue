<script setup lang="ts">
import svgFile from "./title.svg?raw";

/** parse raw title svg strings */
const [, svgTag, svgContent] = svgFile.match(/(<svg.*?>)(.*?)(<\/svg>)/s) ?? [];
const viewBox = svgTag.match(/viewBox="(.*?)"/)?.[1] ?? "0 0 100 10";

/** svg fill pattern size */
const hatch = 7;
</script>

<template>
  <h1 class="sr-only">Vincent Rubinetti</h1>

  <svg
    ref="svg"
    xmlns="http://www.w3.org/2000/svg"
    class="text-marine max-w-100"
    :viewBox="viewBox"
  >
    <pattern
      id="hatch"
      patternUnits="userSpaceOnUse"
      patternTransform="rotate(-45)"
      :width="hatch"
      :height="hatch"
    >
      <path
        class="stroke-marine stroke-2"
        :d="['M', 0, hatch / 2, 'h', hatch].flat().join(' ')"
      />
    </pattern>

    <g class="animate-hatch" fill="url(#hatch)" v-html="svgContent" />
    <g class="animate-fill stroke-marine stroke-2" v-html="svgContent" />
  </svg>
</template>

<style scoped>
.animate-hatch {
  animation: animate-hatch 2s ease-in-out both;
  transform-origin: center center;
}

@keyframes animate-hatch {
  0% {
    clip-path: polygon(0 0, 0 0, 0 0);
    transform: skewX(-10deg);
  }
  50% {
    clip-path: polygon(0 0, 110% 0, 0 1000%);
    opacity: 1;
    transform: skewX(-10deg);
  }
  100% {
    opacity: 0;
    scale: 1 1;
  }
}

.animate-fill {
  animation: animate-fill 2s ease-in-out both;
  transform-origin: center center;
}

@keyframes animate-fill {
  0%,
  50% {
    fill-opacity: 0;
    stroke-opacity: 1;
    transform: skewX(-10deg);
  }
  100% {
    fill-opacity: 1;
    stroke-opacity: 0;
    scale: 1 1;
  }
}
</style>
