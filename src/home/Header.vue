<script setup lang="ts">
import Logo from "@/images/brand/vr.svg?component";

/** share.png generate */
const share = true;
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
        <h1>Vincent Rubinetti</h1>
        <div class="font-light tracking-wider">Composer · Producer</div>
      </hgroup>
    </a>
  </header>
</template>
