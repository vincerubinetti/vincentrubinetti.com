<template>
  <section class="section" :data-dark="dark">
    <img v-if="background" :src="background" class="background" />
    <slot />
  </section>
</template>

<script setup lang="ts">
type Props = {
  background?: string;
  dark?: boolean;
};

defineProps<Props>();
</script>

<style scoped>
.section {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  padding: 60px max(40px, calc((100% - 1000px) / 2));
  z-index: 0;
}

.section[data-dark="true"] {
  background: black;
  color: white;
}

.background {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.25;
  z-index: -1;
}

@media (max-width: 600px) {
  section {
    padding-left: 20px;
    padding-right: 20px;
  }
}
</style>
