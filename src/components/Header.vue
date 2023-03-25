<template>
  <header>
    <Background />
    <svg class="center" viewBox="0 0 270 50">
      <Logo x="0" y="0" width="50" height="50" class="logo" />
      <Text
        x="70"
        y="-11"
        width="200"
        class="title"
        text="VINCENT RUBINETTI"
        role="heading"
        aria-level="1"
      />
      <Text
        x="70"
        y="11"
        width="200"
        class="subtitle"
        text="COMPOSER, PRODUCER, AND MORE"
      />
    </svg>
  </header>
</template>

<script setup lang="ts">
import Background from "./Background.vue";
import Logo from "./Logo.vue";
import Text from "./Text.vue";
</script>

<style scoped>
header {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background: black;
  color: white;
  min-height: 500px;
  z-index: 0;
}

.center {
  width: 100%;
  max-width: 500px;
}

.title,
.subtitle {
  letter-spacing: 2px;
}

.title {
  grid-area: title;
  animation: fade 2s ease both 1s;
}

.subtitle {
  grid-area: subtitle;
  opacity: 0.5;
  animation: fade 2s ease both 1.5s;
}

@keyframes fade {
  from {
    opacity: 0;
  }
}
</style>
