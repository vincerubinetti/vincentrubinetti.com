<script setup lang="ts">
import { onMounted, useId, useTemplateRef, watchEffect } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Props = {
  flip?: boolean;
};

const { flip } = defineProps<Props>();

// unique per instance so patterns don't collide across multiple <Dash>
const id = useId();

onMounted(() => gsap.registerPlugin(ScrollTrigger));

const line = useTemplateRef("line");

watchEffect(() => {
  if (!line.value) return;

  gsap.fromTo(
    line.value,
    { clipPath: flip ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)" },
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

const hatch = 8;
</script>

<template>
  <svg ref="line" class="h-3 min-w-0 flex-1">
    <pattern
      :id="id"
      patternUnits="userSpaceOnUse"
      patternTransform="rotate(-45)"
      :width="hatch"
      :height="hatch"
    >
      <path
        class="stroke-dark stroke-1"
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
    <rect :fill="`url(#${id})`" x="0%" y="0%" width="100%" height="100%" />
  </svg>
</template>
