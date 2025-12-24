<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import { TresCanvas } from "@tresjs/core";
import { useEventListener, useMouseInElement } from "@vueuse/core";
import { pointerCoords } from "@/util/dom";
import Scene from "./HeroScene.vue";

const canvas = useTemplateRef("canvas");

const pointer = ref<ReturnType<typeof pointerCoords>>();
const { isOutside } = useMouseInElement(canvas);

useEventListener(
  canvas,
  "pointermove",
  (event) => (pointer.value = pointerCoords(event)),
);

/** list of "features" */
const features = [
  { model: "arrow", label: "Feature A" },
  { model: "check", label: "Feature B" },
  { model: "flask", label: "Feature C" },
  { model: "star", label: "Feature D" },
];

/** selected feature shape name */
const shape = ref<string>();
</script>

<template>
  <section>
    <div class="flex items-center gap-8">
      <div class="flex flex-col gap-2">
        <button
          v-for="({ model, label }, index) in features"
          :key="index"
          class="border-b-2 p-2 transition-[border]"
          :class="model === shape ? 'border-current' : 'border-transparent'"
          @mouseenter="shape = model"
          @click="shape = shape ? undefined : model"
        >
          {{ label }}
        </button>
      </div>

      <div ref="canvas" class="size-75">
        <TresCanvas
          transparency
          :clearAlpha="0"
          :fail-if-major-performance-caveat="true"
        >
          <Scene :pointer="pointer" :inside="!isOutside" :shape="shape" />
        </TresCanvas>
      </div>
    </div>
  </section>
</template>
