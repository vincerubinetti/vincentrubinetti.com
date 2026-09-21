<script setup lang="ts">
import { ref, useTemplateRef, watch } from "vue";
import {
  IconChevronLeft,
  IconChevronRight,
  IconMaximize,
  IconMinimize,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconPointFilled,
} from "@tabler/icons-vue";
import {
  useElementVisibility,
  useEventListener,
  useFullscreen,
  useIntervalFn,
} from "@vueuse/core";
import { range } from "lodash-es";
import { useSwipe } from "@/util/composables";
import { mod } from "@/util/math";

type Props = {
  images: { image: string }[];
  fit?: "cover" | "contain";
  controls?: boolean;
};

const { images, controls, fit = "contain" } = defineProps<Props>();

const rootRef = useTemplateRef("root");

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
const { pause, resume, isActive } = useIntervalFn(() => next(false), 3000, {
  immediate: false,
});

/** control auto-play */
watch([visible, () => images.length], () => {
  if (visible.value && images.length > 1) resume();
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
  <div ref="root" class="group relative touch-none overflow-hidden">
    <div
      v-for="index in range(
        Math.floor(current) - 1,
        Math.ceil(current) + 1 + 1,
      )"
      :key="index"
      class="image absolute inset-0 size-full cursor-grab transition-all"
      :class="
        isActive
          ? 'duration-500'
          : state === 'idle'
            ? 'duration-250'
            : 'duration-0'
      "
      :style="{ '--percent': index - current }"
    >
      <img
        :src="images[mod(index, images.length)]?.image"
        alt=""
        loading="lazy"
        class="size-full scale-101"
        :class="[
          fit === 'cover' && 'object-cover',
          fit === 'contain' && 'object-contain',
        ]"
      />
    </div>

    <div
      v-if="controls"
      class="absolute bottom-0 -mt-4 flex w-full items-center justify-center bg-black text-white opacity-0 transition-opacity *:size-8 group-focus-within:opacity-100 group-hover:opacity-100 *:hover:opacity-50"
      @pointerdown.stop
    >
      <template v-if="images.length > 1">
        <button
          class="mr-auto"
          :title="`${isActive ? 'Pause' : 'Resume'} autoplay`"
          @click="isActive ? pause() : resume()"
        >
          <IconPlayerPauseFilled v-if="isActive" />
          <IconPlayerPlayFilled v-else />
        </button>

        <button title="Previous image" @click="previous()">
          <IconChevronLeft />
        </button>

        <button
          v-for="index in range(images.length)"
          :key="index"
          :class="
            index === mod(Math.round(current), images.length)
              ? 'opacity-100!'
              : 'opacity-25'
          "
          :title="`Go to image ${index + 1}`"
          @click="goTo(index)"
        >
          <IconPointFilled />
        </button>

        <button title="Next image" @click="next()">
          <IconChevronRight />
        </button>
      </template>

      <button
        class="ml-auto"
        :title="isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
        @click="toggle()"
      >
        <IconMinimize v-if="isFullscreen" />
        <IconMaximize v-else />
      </button>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.image {
  transform: translateX(calc(var(--percent) * 25%));
  opacity: calc(clamp(1 - abs(var(--percent)), 0, 1));
}
</style>
