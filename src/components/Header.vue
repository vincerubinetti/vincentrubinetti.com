<template>
  <header>
    <Background
      class="background"
      :style="{ opacity: playing ? 0.75 : 0.25 }"
    />
    <Logo
      class="logo"
      :style="{
        opacity: playing ? 0 : 1,
        pointerEvents: playing ? 'none' : '',
      }"
    />
  </header>
</template>

<script setup lang="ts">
import Background from "@/components/Background.vue";
import Logo from "@/components/Logo.vue";
import { playing } from "@/global/state";
</script>

<style scoped>
header {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
  padding: 40px;
  background: black;
  color: white;
  z-index: 0;
  box-shadow: var(--secondaryig-shadow);
}

.logo {
  transition: opacity 1s ease;
}

.logo {
  width: 100%;
  max-width: 500px;
}
</style>
