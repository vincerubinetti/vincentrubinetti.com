<script setup lang="ts">
import { ref, useTemplateRef, watchEffect } from "vue";
import { useElementVisibility, useFullscreen } from "@vueuse/core";
import { clamp, range } from "lodash-es";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import type { SwiperEvents, Swiper as SwiperType } from "swiper/types";
import { Swiper, SwiperSlide } from "swiper/vue";
import { mod } from "@/util/math";
import Chevron from "../images/chevron.svg?component";
import Circle from "../images/circle.svg?component";
import "swiper/css";

type Props = {
  slides: { image: string }[];
};

const { slides } = defineProps<Props>();

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

/** which slides should be loaded */
const loaded = ref<boolean[]>([]);

/** reset loaded when slides change */
watchEffect(() => {
  for (let index = 0; index < slides.length; index++)
    loaded.value[index] ??= false;
});

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
</script>

<template>
  <Swiper
    ref="root"
    class="group w-full"
    :loop="true"
    :loop-prevents-sliding="false"
    :autoplay="{ disableOnInteraction: true }"
    :navigation="true"
    :pagination="true"
    :watch-slides-progress="true"
    :modules="[Autoplay, Navigation, Pagination]"
    @swiper="(value) => (swiper = value)"
    @slide-change="onSlideChange"
    @set-translate="onProgress"
    @set-transition="onSetTransition"
  >
    <SwiperSlide
      v-for="({ image }, index) in slides"
      :key="index"
      :class="isFullscreen ? 'cursor-zoom-out' : 'cursor-zoom-in'"
      @click="toggle()"
    >
      <img
        :src="loaded[index] ? image : ''"
        alt=""
        loading="lazy"
        class="size-full object-contain"
      />
    </SwiperSlide>

    <div
      class="absolute bottom-0 z-10 flex w-full items-center justify-center bg-black text-white opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
    >
      <button
        class="nav-button"
        @click="swiper?.slidePrev()"
        aria-label="Previous image"
      >
        <Chevron class="-scale-x-100" />
      </button>
      <div class="grow" />
      <button
        v-for="index in range(slides.length)"
        :key="index"
        class="nav-button"
        :class="slide === index ? 'opacity-100!' : ''"
        aria-label="Go to image {{ index + 1 }}"
        @click="swiper?.slideToLoop(index)"
      >
        <Circle />
      </button>
      <div class="grow" />
      <button
        class="nav-button"
        @click="swiper?.slideNext()"
        aria-label="Next image"
      >
        <Chevron />
      </button>
    </div>
  </Swiper>
</template>

<style scoped>
@reference "tailwindcss";

.nav-button {
  @apply size-8 opacity-50 hover:opacity-100;
}
</style>
