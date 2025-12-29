<script setup lang="ts">
import { useTemplateRef } from "vue";
import { useEventListener } from "@vueuse/core";
import Logo from "@/images/brand/vr.svg?component";
import { finishAnimations } from "@/util/dom";

const overlay = useTemplateRef("overlay");

const hideOverlay = () => {
  if (!overlay.value) return;
  finishAnimations(overlay.value);
};

useEventListener("pointerdown", hideOverlay);
useEventListener("keydown", hideOverlay);
useEventListener("scroll", hideOverlay);
</script>

<template>
  <div
    ref="overlay"
    class="overlay pointer-events-none fixed inset-0 z-100 grid place-content-center bg-black"
  >
    <Logo class="logo size-16 text-white" />
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.overlay {
  animation: overlay 1s 1s both;
}

@keyframes overlay {
  to {
    background: transparent;
  }
}

.logo {
  animation: logo 1s 1s both;
}

@keyframes logo {
  to {
    opacity: 0;
    scale: 0.9;
  }
}
</style>
