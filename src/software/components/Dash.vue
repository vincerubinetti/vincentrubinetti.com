<script setup lang="ts">
import { onMounted, useTemplateRef, watchEffect } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Props = {
  flip?: boolean;
};

defineProps<Props>();

onMounted(() => gsap.registerPlugin(ScrollTrigger));

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
  <svg
    ref="line"
    class="h-2 min-w-0 flex-1 opacity-25"
    :class="flip ? '-scale-x-100' : ''"
  >
    <line
      x1="0%"
      y1="50%"
      x2="100%"
      y2="50%"
      class="stroke-current stroke-2"
      stroke-dasharray="4 4"
    />
  </svg>
</template>
