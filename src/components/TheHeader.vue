<template>
  <header class="header">
    <TheBackground class="background" />
    <TheLogo
      class="logo"
      :style="{
        opacity: playing ? 0 : 1,
        pointerEvents: playing ? 'none' : '',
      }"
    />
  </header>
</template>

<script setup lang="ts">
import TheBackground from "@/components/TheBackground.vue";
import TheLogo from "@/components/TheLogo.vue";
import { playing } from "@/global/state";
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
  box-shadow: 0 0 100px #9c27b040, 0 0 10px 2px #9c27b040;
  z-index: 0;
}

.logo {
  transition: opacity 1s ease;
}

.logo {
  width: 100%;
  max-width: 500px;
}
</style>
