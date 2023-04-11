<template>
  <header>
    <AppSection class="header" :dark="true" :background="true">
      <TheBackground />
      <img class="art" :src="art" :style="{ opacity: playing ? 1 : 0 }" />
      <TheLogo
        class="logo"
        :style="{
          opacity: playing ? 0 : 1,
          pointerEvents: playing ? 'none' : '',
        }"
      />
    </AppSection>
  </header>
</template>

<script setup lang="ts">
import TheBackground from "@/components/TheBackground.vue";
import TheLogo from "@/components/TheLogo.vue";
import { art, playing } from "@/global/state";
</script>

<style scoped>
.header {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
  padding: 40px;
  background: black;
  color: white;
  overflow: hidden;
  box-shadow: 0 0 100px #9c27b080;
  z-index: 0;
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
  transition: opacity 1s ease;
}

.logo {
  width: 100%;
  max-width: 500px;
}
</style>
