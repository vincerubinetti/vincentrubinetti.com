<script setup lang="ts">
import { ref, useTemplateRef, watch } from "vue";
import {
  useElementSize,
  useElementVisibility,
  useEventListener,
  useFullscreen,
  useIntervalFn,
} from "@vueuse/core";
import { range } from "lodash-es";
import { Maximize, Minimize, Pause, Play } from "lucide-vue-next";
import { useSwipe } from "@/util/composables";
import { mod } from "@/util/math";
import Chevron from "../images/chevron.svg?component";
import Circle from "../images/circle.svg?component";

type Props = {
  images: { image: string }[];
  controls?: boolean;
};

const { images, controls } = defineProps<Props>();

const rootRef = useTemplateRef("root");

const size = useElementSize(rootRef);

/** current image index */
const current = ref(0);

/** go to previous image */
const previous = (userAction = true) => {
  current.value--;
  if (userAction) pause();
};

/** go to next image */
const next = (userAction = true) => {
  current.value++;
  if (userAction) pause();
};

/** go to specific image */
const goTo = (index: number, userAction = true) => {
  current.value = index;
  if (userAction) pause();
};

/** current image index at start of swipe */
const startCurrent = ref(0);

/** swiping gesture */
const { x, state } = useSwipe({
  target: rootRef,
  onStart: () => (startCurrent.value = current.value),
  onMove: () => (current.value = startCurrent.value - x.value),
  onEnd: () => (current.value = Math.round(current.value)),
});

/** is carousel fully in viewport */
const visible = useElementVisibility(rootRef, { threshold: 1 });

/** auto-play */
const { pause, resume, isActive } = useIntervalFn(() => next(false), 3000);

/** control auto-play */
watch(visible, () => {
  if (visible.value) resume();
  else pause();
});

/** pause autoplay while swiping */
watch(state, () => {
  if (state.value !== "idle") pause();
});

/** keyboard control */
useEventListener("keydown", (event: KeyboardEvent) => {
  if (controls) {
    if (event.key === "ArrowLeft") previous();
    if (event.key === "ArrowRight") next();
  }
});

/** fullscreen controls */
const { toggle, isFullscreen } = useFullscreen(rootRef);
</script>

<template>
  <div
    ref="root"
    v-bind="$attrs"
    class="relative touch-none overflow-hidden perspective-distant"
    :style="{ '--width': size.width.value + 'px' }"
  >
    <div
      v-for="index in range(
        Math.floor(current) - 1,
        Math.ceil(current) + 1 + 1,
      )"
      :key="index"
      class="image absolute inset-0 size-full cursor-grab transition-all backface-hidden"
      :class="state === 'idle' ? 'duration-500' : 'duration-0'"
      :style="{ '--percent': index - current }"
    >
      <img
        :src="images[mod(index, images.length)]?.image"
        alt=""
        loading="lazy"
        class="size-full object-contain"
      />
    </div>

    <button
      v-if="isFullscreen"
      class="fixed top-0 right-0 z-100 size-8 bg-black text-white"
      aria-label="Exit fullscreen"
      @click="toggle()"
    >
      <Minimize />
    </button>
  </div>

  <div
    v-if="controls"
    class="[&>*:hover]:text-dark flex max-w-full items-center justify-center *:size-8"
  >
    <button
      :aria-label="`${isActive ? 'Pause' : 'Resume'} autoplay`"
      @click="isActive ? pause() : resume()"
    >
      <Pause v-if="isActive" />
      <Play v-else />
    </button>

    <div />

    <template v-if="images.length > 1">
      <button aria-label="Previous image" @click="previous()">
        <Chevron class="-scale-x-100" />
      </button>
      <button
        v-for="index in range(images.length)"
        :key="index"
        :class="
          index === mod(Math.round(current), images.length) ? '' : 'opacity-25'
        "
        aria-label="Go to image {{ index + 1 }}"
        @click="goTo(index)"
      >
        <Circle />
      </button>
      <button aria-label="Next image" @click="next()">
        <Chevron />
      </button>
    </template>

    <div />

    <button
      v-if="!isFullscreen"
      aria-label="Enter fullscreen"
      @click="toggle()"
    >
      <Maximize />
    </button>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.image {
  --depth: calc(var(--width) / 2);
  transform: translateZ(2px) translateZ(calc(-1 * var(--depth)))
    rotateY(calc(var(--percent) * 90deg)) translateZ(var(--depth));
  opacity: calc(clamp(1 - abs(var(--percent)), 0, 1));
}
</style>
