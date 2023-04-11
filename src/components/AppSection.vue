<template>
  <section
    ref="section"
    :id="(id || '').split(' ').join('-').toLowerCase()"
    class="section"
    :data-dark="dark"
  >
    <h2 v-if="id" class="heading visually-hidden">
      {{ id }}
    </h2>
    <div v-if="background" class="background" aria-hidden="true">
      <img
        v-if="typeof background === 'string'"
        class="image"
        :src="background"
        :style="{
          transform: `translate(0%, ${translate}%) scale(${scale})`,
          opacity: clamp(width - 300, 0, 1000) / 1000,
        }"
      />
      <div class="color" />
    </div>
    <slot />
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useWindowSize } from "@vueuse/core";
import { useParallax } from "@/util/composables";
import { clamp } from "@/util/math";

type Props = {
  id?: string;
  background?: string | boolean;
  dark?: boolean;
};

defineProps<Props>();

const section = ref();

const { scale, translate } = useParallax(section, 2);

const { width } = useWindowSize();
</script>

<style scoped>
.section {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 50px;
  padding: 100px max(50px, calc((100% - 1100px) / 2));
  z-index: 0;
}

.section:nth-child(even) {
  background: var(--off-white);
}

.section[data-dark="true"] {
  background: var(--off-black);
  color: white;
  box-shadow: 2px 4px 20px #40405040;
  z-index: 1;
}

.background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: -1;
  pointer-events: none;
}

.image {
  position: absolute;
  top: 0;
  height: 100%;
  filter: sepia(100%) saturate(200%) hue-rotate(234deg);
}

.color {
  position: absolute;
  inset: 0;
  background: radial-gradient(
      ellipse at 25% 150%,
      #e8009760 0%,
      transparent 50%
    ),
    radial-gradient(ellipse at 75% -50%, #0085f260 0%, transparent 50%);
}

@media (max-width: 800px) {
  .section {
    padding: 60px 30px;
    align-items: center !important;
  }
}
</style>
