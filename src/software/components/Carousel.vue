<script setup lang="ts">
import { ref, useTemplateRef, watchEffect } from "vue";
import {
  useElementVisibility,
  useEventListener,
  useFullscreen,
} from "@vueuse/core";
import { clamp, range } from "lodash-es";
import { Maximize, Minimize } from "lucide-vue-next";
import { Autoplay } from "swiper/modules";
import type { SwiperEvents, Swiper as SwiperType } from "swiper/types";
import { Swiper, SwiperSlide } from "swiper/vue";
import { mod } from "@/util/math";
import Chevron from "../images/chevron.svg?component";
import Circle from "../images/circle.svg?component";
import "swiper/css";

type Props = {
  slides: { image: string }[];
  controls?: boolean;
};

const { slides, controls } = defineProps<Props>();

const root = useTemplateRef("root");

/** fullscreen controls */
const { toggle, isFullscreen } = useFullscreen(root as unknown as HTMLElement);

/** swiper instance (non-reactive) */
const swiper = ref<SwiperType>();

const isVisible = useElementVisibility(() => swiper.value?.el, {
  threshold: 1,
});

/** autoplay control based on visibility */
watchEffect(() => {
  if (isVisible.value) swiper.value?.autoplay.start();
  else swiper.value?.autoplay.stop();
});

/** reactive slide index */
const slide = ref(0);

/** which slides should be loaded */
const loaded = ref<boolean[]>([]);

/** reset loaded when slides change */
watchEffect(() => {
  for (let index = 0; index < slides.length; index++)
    loaded.value[index] ??= false;
});

/** load current slide */
watchEffect(() => (loaded.value[slide.value] = true));

/** handle slide change */
const onSlideChange: SwiperEvents["slideChange"] = ({
  realIndex,
  progress,
  swipeDirection,
}) => {
  /** update slide number */
  slide.value = realIndex;

  /** if directly on current slide, load */
  loaded.value[realIndex] = true;

  /** if swiping/transitioning between slides, load destination slide */
  if (progress % 1) {
    if (swipeDirection === "next")
      loaded.value[mod(realIndex + 1, slides.length)] = true;
    if (swipeDirection === "prev")
      loaded.value[mod(realIndex - 1, slides.length)] = true;
  }
};

/** custom transition */
const onProgress: SwiperEvents["progress"] = (swiper) => {
  for (let index = 0; index < swiper.slides.length; index++) {
    const slide = swiper.slides[index] as HTMLElement & { progress: number };
    const { progress } = slide;
    slide.style.translate = [progress * swiper.width * 0.75, 0]
      .map((value) => `${value}px`)
      .join(" ");
    slide.style.opacity = String(clamp(1 - Math.abs(progress), 0, 1));
  }
};

/** custom transition */
const onSetTransition: (swiper: SwiperType, duration: number) => void = (
  swiper,
  duration,
) => {
  for (const slide of swiper.slides) {
    slide.style.transitionProperty = "all";
    slide.style.transitionDuration = `${duration}ms`;
  }
};

defineOptions({ inheritAttrs: false });

/** keyboard control */
useEventListener("keydown", (event: KeyboardEvent) => {
  if (controls) {
    if (event.key === "ArrowLeft") swiper.value?.slidePrev();
    if (event.key === "ArrowRight") swiper.value?.slideNext();
  }
});
</script>

<template>
  <Swiper
    ref="root"
    :v-bind="$attrs"
    :class="['group w-full bg-black shadow', $attrs.class]"
    :loop="slides.length > 1"
    :loop-prevents-sliding="false"
    :autoplay="{ disableOnInteraction: true }"
    :watch-slides-progress="true"
    :modules="[Autoplay]"
    @swiper="(value) => (swiper = value)"
    @slide-change="onSlideChange"
    @set-translate="onProgress"
    @set-transition="onSetTransition"
  >
    <SwiperSlide
      v-for="({ image }, index) in slides"
      :key="index"
      class="cursor-grab"
    >
      <img
        :src="loaded[index] ? image : ''"
        alt=""
        loading="lazy"
        class="size-full object-contain"
      />
    </SwiperSlide>

    <button
      v-if="isFullscreen"
      class="fixed top-0 right-0 z-100 size-8 bg-black text-white"
      aria-label="Exit fullscreen"
      @click="toggle()"
    >
      <Minimize />
    </button>
  </Swiper>

  <div v-if="controls" class="[&>*:hover]:text-dark flex items-center *:size-8">
    <template v-if="slides.length > 1">
      <button aria-label="Previous image" @click="swiper?.slidePrev()">
        <Chevron class="-scale-x-100" />
      </button>
      <button
        v-for="index in range(slides.length)"
        :key="index"
        :class="slide === index ? '' : 'opacity-25'"
        aria-label="Go to image {{ index + 1 }}"
        @click="swiper?.slideToLoop(index)"
      >
        <Circle />
      </button>
      <button aria-label="Next image" @click="swiper?.slideNext()">
        <Chevron />
      </button>
    </template>
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
</style>
