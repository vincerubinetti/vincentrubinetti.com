<script setup lang="ts">
import { ref } from "vue";
import { useEventListener } from "@vueuse/core";
import { range } from "lodash-es";
import { sleep } from "@/util/misc";

const copies = ref(0);

const max = 5;

const crop = { x: 0, y: 0, w: 0, h: 0 };

const run = async () => {
  if (copies.value === 0) {
    crop.x = window.scrollX;
    crop.y = window.scrollY;
    crop.w = window.innerWidth;
    crop.h = window.innerHeight;
    document.body.style.filter = "url(#bsod)";
  }
  copies.value++;
  if (copies.value >= max) {
    document.body.style.filter = "";
    return;
  }
  await sleep(100);
  run();
};

useEventListener("hashchange", () => {
  if (window.location.hash === "#bsod") run();
});
</script>

<template>
  <svg v-if="copies > 0" xmlns="http://www.w3.org/2000/svg" class="hidden">
    <filter
      id="bsod"
      filterUnits="userSpaceOnUse"
      :x="crop.x"
      :y="crop.y"
      :width="crop.w"
    >
      <template v-for="n in range(copies)" :key="n">
        <feOffset
          :in="n === 0 ? 'SourceGraphic' : undefined"
          :dx="20"
          :dy="20"
        />
        <feBlend mode="darken" in2="SourceGraphic" />
      </template>
    </filter>
  </svg>
  <div
    v-if="copies >= max"
    class="fixed inset-0 z-100 grid place-items-center bg-blue-500 p-8 font-sans text-white"
  >
    <div class="flex flex-col gap-8">
      <div class="self-start text-[10rem]">:(</div>
      <div class="text-2xl leading-relaxed">
        Your website ran into a problem and needs to restart.
        <br />
        Please refresh the page.
      </div>
      <div class="text-sm leading-loose">
        If you call a support person, give them this info:
        <br />
        Stop code: USER TRIGGERED INFINITE RECURSION
      </div>
    </div>
  </div>
</template>
