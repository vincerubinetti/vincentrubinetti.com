<template>
  <section
    ref="section"
    :id="id ? id : undefined"
    class="section"
    :data-dark="dark"
  >
    <h2 v-if="heading" class="heading visually-hidden">
      {{ heading }}
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
        alt=""
        loading="lazy"
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
  heading?: string;
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

.section[data-dark="true"] {
  background: var(--off-black);
  color: white;
  box-shadow: 0 0 75px #41004d80;
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
  }
}

@media (max-width: 400px) {
  .section {
    padding: 40px 20px;
  }
}
</style>
