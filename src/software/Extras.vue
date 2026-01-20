<script setup lang="ts">
import { ArrowDown } from "lucide-vue-next";
</script>

<template>
  <section class="bg-light-2">
    <h2 class="sr-only">Extras</h2>

    <div class="flex flex-wrap items-center justify-center gap-8 max-md:gap-4">
      <a href="/" class="button-big highlight corners-4 self-center">
        I also write music
        <ArrowDown class="-rotate-90 animate-bounce" />
      </a>
    </div>
  </section>
</template>
