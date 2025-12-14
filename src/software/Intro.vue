<script setup lang="ts">
import { TresCanvas } from "@tresjs/core";
import Scene from "./IntroScene.vue";
</script>

<template>
  <div class="size-200">
    <TresCanvas
      transparency
      :clearAlpha="0"
      :fail-if-major-performance-caveat="true"
    >
      <Scene />
    </TresCanvas>
  </div>
</template>
