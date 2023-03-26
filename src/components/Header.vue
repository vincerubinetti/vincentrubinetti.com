<template>
  <header>
    <Background />
    <Logo class="logo" />
  </header>
</template>

<script setup lang="ts">
import Background from "./Background.vue";
import Logo from "./Logo.vue";
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
}

.logo {
  width: 100%;
  max-width: 500px;
}
</style>
