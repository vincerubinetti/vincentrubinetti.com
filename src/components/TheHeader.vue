<template>
  <header>
    <AppSection class="header" :dark="true" :background="true" :data-big="big">
      <TheBackground v-if="big" />
      <img
        v-if="big"
        class="art"
        :src="art"
        :style="{ opacity: playing ? 1 : 0 }"
        alt=""
      />
      <a
        :href="!big ? '/' : undefined"
        class="logo"
        :style="{
          opacity: playing ? 0 : 1,
          pointerEvents: playing ? 'none' : 'unset',
        }"
      >
        <TheLogo />
      </a>
    </AppSection>
  </header>
</template>

<script setup lang="ts">
import TheBackground from "@/components/TheBackground.vue";
import TheLogo from "@/components/TheLogo.vue";
import { art, playing } from "@/global/state";

type Props = {
  big?: boolean;
};

defineProps<Props>();
</script>

<style scoped>
.header {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background: black;
  color: white;
  z-index: 0;
}

.header[data-big="true"] {
  min-height: 500px;
}

.art {
  position: absolute;
  max-width: 100%;
  max-height: 100%;
  mix-blend-mode: screen;
  -webkit-mask-image: radial-gradient(closest-side, white 0%, transparent 100%);
  mask-image: radial-gradient(closest-side, white 0%, transparent 100%);
  transition: opacity var(--fast);
  pointer-events: none;
}

.logo {
  display: flex;
  width: 100%;
  max-width: 500px;
  color: inherit;
  transition: opacity var(--slow);
}

.logo svg {
  width: 100%;
}
</style>
