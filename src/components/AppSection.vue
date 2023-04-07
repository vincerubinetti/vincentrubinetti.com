<template>
  <section ref="section" class="section" :data-dark="dark">
    <img
      v-if="background"
      :src="background"
      class="background"
      :style="{
        transform: `translateY(${translate}%) scale(${scale})`,
      }"
    />
    <slot />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useElementBounding } from "@vueuse/core";

const scale = 2;

type Props = {
  background?: string;
  dark?: boolean;
};

defineProps<Props>();

const section = ref();

const { top, height } = useElementBounding(section);
const translate = computed(() => {
  if (typeof window === "undefined") return 0;
  const percent =
    (window.innerHeight - top.value) / (window.innerHeight + height.value);
  const offset = 2 * (percent - 0.5);
  return offset * (scale - 1) * 50;
});
</script>

<style scoped>
.section {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  padding: 60px max(40px, calc((100% - 1100px) / 2));
  overflow: hidden;
  z-index: 0;
}

.section:nth-child(even) {
  background: #fafafa;
}

.section[data-dark="true"] {
  background: black;
  color: white;
  box-shadow: 0 0 100px #9c27b040, 0 0 10px 2px #9c27b040;
  z-index: 1;
}

.background {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.15;
  z-index: -1;
}

@media (max-width: 600px) {
  section {
    padding-left: 20px;
    padding-right: 20px;
  }
}
</style>
