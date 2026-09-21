<script setup lang="ts">
import Logo from "@/images/brand/vr.svg?component";

/** share.png generate */
const share = false;
</script>

<template>
  <header
    class="text-white"
    :class="
      share &&
      'aspect-3/2 w-150 items-center justify-center gap-6 bg-black/50 p-0'
    "
  >
    <Logo v-if="share" class="size-14" />
    <a href="/" class="my-8" :class="share && 'm-0!'">
      <hgroup class="flex flex-col items-center gap-4 text-center">
        <div class="font-sans text-3xl font-light tracking-widest uppercase">
          Vincent Rubinetti
        </div>
        <div class="font-light tracking-wider">Composer · Producer</div>
      </hgroup>
    </a>
  </header>
</template>
