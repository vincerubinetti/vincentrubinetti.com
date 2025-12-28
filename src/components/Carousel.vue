<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import { useFullscreen } from "@vueuse/core";
import { clamp, range } from "lodash-es";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import type { SwiperEvents, Swiper as SwiperType } from "swiper/types";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";

type Props = {
  slides: { image: string }[];
};

defineProps<Props>();

const rootEl = useTemplateRef("rootEl");

const { toggle, isFullscreen } = useFullscreen(
  rootEl as unknown as HTMLElement,
);

/** swiper instance (non-reactive) */
const swiper = ref<SwiperType>();

/** reactive slide index */
const slide = ref(0);

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
    ref="rootEl"
    class="group aspect-square w-full"
    :class="isFullscreen ? 'cursor-zoom-out' : 'cursor-zoom-in'"
    :loop="true"
    :loop-prevents-sliding="false"
    :autoplay="{ disableOnInteraction: true }"
    :navigation="true"
    :pagination="true"
    :watch-slides-progress="true"
    :modules="[Autoplay, Navigation, Pagination]"
    @swiper="(value) => (swiper = value)"
    @slide-change="({ realIndex }) => (slide = realIndex)"
    @set-translate="onProgress"
    @set-transition="onSetTransition"
  >
    <SwiperSlide
      v-for="({ image }, index) in slides"
      :key="index"
      class="top-0 left-0 size-full select-none"
      @click="toggle()"
    >
      <img
        :src="image"
        loading="lazy"
        class="size-full object-cover object-top"
      />
    </SwiperSlide>

    <div
      class="absolute bottom-0 z-10 flex w-full bg-zinc-800 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
    >
      <button class="nav" @click="swiper?.slidePrev()">
        <ChevronLeft />
      </button>
      <div class="flex grow justify-center">
        <button
          v-for="index in range(slides.length)"
          :key="index"
          class="nav"
          :class="slide === index ? '' : 'text-current/25'"
          @click="swiper?.slideToLoop(index)"
        >
          <svg viewBox="-1 -1 2 2" class="size-2">
            <circle r="1" fill="currentColor" />
          </svg>
        </button>
      </div>
      <button class="nav" @click="swiper?.slideNext()">
        <ChevronRight />
      </button>
    </div>
  </Swiper>
</template>

<style scoped>
@reference "tailwindcss";

.nav {
  @apply size-8 hover:text-current/75;
}
</style>
