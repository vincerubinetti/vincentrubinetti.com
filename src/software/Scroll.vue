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
      scrollTrigger: { trigger: line.value, scrub: 1, end: "bottom-=25%" },
    },
  );
});
</script>

<template>
  <svg ref="line" class="h-0.5 grow opacity-50">
    <line
      x1="0%"
      y1="0%"
      x2="100%"
      y2="0%"
      stroke="black"
      stroke-width="99"
      stroke-dasharray="10"
    />
  </svg>
</template>
