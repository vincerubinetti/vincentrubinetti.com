<template>
  <svg ref="svg" viewBox="0 0 0 0">
    <text x="0" y="0" dominant-baseline="hanging">{{ text }}</text>
  </svg>
</template>

<script setup lang="ts">
import { ref, onMounted, onUpdated } from "vue";

interface Props {
  text: string;
}

defineProps<Props>();

const svg = ref();

const fit = () => {
  const { x, y, width, height } = svg.value.getBBox();
  svg.value.setAttribute("viewBox", [x, y, width, height].join(" "));
};

onMounted(() => {
  fit();
  document.fonts.ready.then(fit);
});
onUpdated(fit);
</script>

<style scoped>
text {
  fill: currentColor;
}
</style>
