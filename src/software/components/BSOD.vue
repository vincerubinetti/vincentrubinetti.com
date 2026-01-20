<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { useEventListener, useIntervalFn } from "@vueuse/core";
import { range } from "lodash-es";

const copies = ref(0);

const { pause, resume } = useIntervalFn(
  () => {
    copies.value++;
    if (copies.value > 10) {
      pause();
      copies.value = -1;
    }
  },
  100,
  { immediate: false },
);

useEventListener("hashchange", () => {
  if (window.location.hash === "#bsod") resume();
});

watchEffect(() => {
  document.documentElement.style.filter = copies.value > 0 ? "url(#bsod)" : "";
});
</script>

<template>
  <svg v-if="copies > 0" xmlns="http://www.w3.org/2000/svg">
    <filter id="bsod">
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
    v-if="copies === -1"
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
