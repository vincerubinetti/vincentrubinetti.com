<script setup lang="ts">
import { ArrowDown, Headphones, Leaf, Music } from "lucide-vue-next";
import Outline from "./components/Outline.vue";
</script>

<template>
  <section class="bg-white">
    <h2 class="sr-only">Extras</h2>

    <div class="flex flex-wrap items-center justify-center gap-8 max-md:gap-4">
      <a href="studio" class="button hover:text-red-500">
        <Outline />
        <Headphones />
        Studio
      </a>

      <a href="stems" class="button hover:text-green-500">
        <Outline />
        <Leaf />
        Stems
      </a>

      <a href="sheets" class="button hover:text-cyan-500">
        <Outline />
        <Music />
        Sheets
      </a>

      <a href="software" class="button self-center hover:text-indigo-500">
        <Outline />

        I also write software
        <ArrowDown class="-rotate-90 animate-bounce" />
      </a>
    </div>
  </section>
</template>
