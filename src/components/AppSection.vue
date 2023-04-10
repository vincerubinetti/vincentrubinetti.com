<template>
  <section ref="section" class="section" :data-dark="dark">
    <div v-if="background" class="background">
      <img
        class="image"
        :src="background"
        :style="{
          opacity: 0,
          transform: `translate(${translateX}%, ${translateY}%) scale(${scale})`,
        }"
      />
      <div class="gradient"></div>
    </div>
    <slot />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useElementBounding } from "@vueuse/core";
import { clamp } from "@/util/math";

const scale = 2;

type Props = {
  background?: string;
  dark?: boolean;
};

defineProps<Props>();

const section = ref();

const { top, height } = useElementBounding(section);

const percent = computed(() => {
  if (typeof window === "undefined") return 0;
  const percent =
    (window.innerHeight - top.value) / (window.innerHeight + height.value);
  clamp(percent, 0, 1);
  return percent;
});

const translateX = computed(() => -(scale - 1) * 50);
const translateY = computed(() => 2 * (percent.value - 0.5) * (scale - 1) * 50);
</script>

<style scoped>
.section {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  padding: 60px max(60px, calc((100% - 1100px) / 2));
  z-index: 0;
}

.section:nth-child(even) {
  background: #fafafa;
}

.section[data-dark="true"] {
  background: black;
  color: white;
  box-shadow: var(--color-shadow);
  z-index: 1;
}

.background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: -1;
}

.image {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  opacity: 0.25 !important;
  filter: saturate(50%);
  -webkit-mask-image: linear-gradient(90deg, transparent, white);
  mask-image: linear-gradient(90deg, transparent, white);
}

.gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    var(--tertiary),
    var(--secondary),
    var(--primary)
  );
  opacity: 0.25;
}

@media (max-width: 600px) {
  .section {
    padding-left: 20px;
    padding-right: 20px;
  }
}
</style>
