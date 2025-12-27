<script setup lang="ts">
import { useTemplateRef, watchEffect } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const line = useTemplateRef("line");

watchEffect(() => {
  if (!line.value) return;

  gsap.fromTo(
    line.value,
    { clipPath: "inset(0% 100% 0% 0%)" },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      scrollTrigger: {
        trigger: line.value,
        start: "top 100%",
        end: "bottom 0%",
        toggleActions: "play reset play reset",
      },
      duration: 2,
    },
  );
});
</script>

<template>
  <svg ref="line" class="h-2 grow opacity-25">
    <defs>
      <pattern
        id="dash-pattern"
        width="8"
        height="8"
        patternUnits="userSpaceOnUse"
        viewBox="0 -4 8 8"
      >
        <path
          d="M 0 0 L 2 2 L 6 -2 L 8 0"
          fill="none"
          stroke="currentColor"
          stroke-width="1"
          stroke-linecap="square"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dash-pattern)" />
  </svg>
</template>
