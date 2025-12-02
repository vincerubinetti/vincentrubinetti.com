<script setup lang="ts">
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from "reka-ui";

type Props = {
  /** minimum value */
  min?: number;
  /** maximum value */
  max?: number;
  /** step value */
  step?: number;
};

const { min = 0, max = 100, step = 1 } = defineProps<Props>();

const value = defineModel<number[]>();
</script>

<template>
  <div class="px-2">
    <SliderRoot
      v-model="value"
      :min="min"
      :max="max"
      :step="step"
      class="relative flex h-5 shrink-0 cursor-pointer touch-none items-center rounded px-2 hover:bg-current/10"
    >
      <SliderTrack class="relative h-1 grow rounded-full bg-current/10">
        <SliderRange class="absolute h-full rounded-full bg-current" />
      </SliderTrack>
      <SliderThumb class="size-3 rounded-full bg-current" aria-label="Volume" />
    </SliderRoot>
  </div>
</template>
