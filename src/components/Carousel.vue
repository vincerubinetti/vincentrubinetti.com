<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import { useFullscreen } from "@vueuse/core";
import { range } from "lodash-es";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper/types";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";

type Props = {
  slides: { image: string }[];
};

defineProps<Props>();

const rootEl = useTemplateRef("rootEl");

const { toggle } = useFullscreen(rootEl as unknown as HTMLElement);

const swiper = ref<SwiperType>();

const slide = ref(0);
</script>

<template>
  <Swiper
    ref="rootEl"
    class="group aspect-square w-full cursor-pointer shadow"
    :loop="true"
    :speed="300"
    :autoplay="{ delay: 2000 }"
    :navigation="true"
    :pagination="true"
    :watch-slides-progress="true"
    :modules="[Autoplay, Navigation, Pagination]"
    @swiper="(value) => (swiper = value)"
    @slide-change="(s) => (slide = s.realIndex)"
  >
    <SwiperSlide
      v-for="({ image }, index) in slides"
      :key="index"
      class="size-full select-none"
      @click="toggle"
    >
      <img
        :src="image"
        loading="lazy"
        class="size-full object-cover object-top"
      />
    </SwiperSlide>

    <div
      class="absolute bottom-0 z-10 flex w-full bg-white opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
    >
      <button class="nav" @click="swiper?.slidePrev()">
        <ChevronLeft />
      </button>
      <div class="flex grow justify-center">
        <button
          v-for="index in range(slides.length)"
          :key="index"
          class="nav"
          :class="slide === index ? '' : 'text-zinc-200'"
          @click="swiper?.slideToLoop(index)"
        >
          &bull;
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
  @apply size-8 hover:text-zinc-500;
}
</style>
