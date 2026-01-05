<script setup lang="ts">
import { ArrowDown } from "lucide-vue-next";
import Outline from "./components/Outline.vue";
</script>

<template>
  <section class="bg-white">
    <h2 class="sr-only">Extras</h2>

    <a
      href="software"
      class="button col-span-full self-center hover:text-indigo-500"
    >
      <Outline />

      I also write software
      <ArrowDown class="-rotate-90 animate-bounce" />
    </a>
  </section>
</template>
