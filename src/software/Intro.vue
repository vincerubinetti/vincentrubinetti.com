<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import { TresCanvas } from "@tresjs/core";
import { useEventListener, useMouseInElement } from "@vueuse/core";
import { pointerCoords } from "@/util/dom";
import Scene from "./IntroScene.vue";

const canvas = useTemplateRef("canvas");

const pointer = ref<ReturnType<typeof pointerCoords>>();
const { isOutside } = useMouseInElement(canvas);

useEventListener(canvas, "pointermove", (event) => {
  pointer.value = pointerCoords(event);
});
</script>

<template>
  <div ref="canvas" class="size-100 border">
    <TresCanvas
      transparency
      :clearAlpha="0"
      :fail-if-major-performance-caveat="true"
    >
      <Scene :pointer="pointer" :inside="!isOutside" />
    </TresCanvas>
  </div>
</template>
