<script setup lang="ts">
import {
  IconArrowDown,
  IconHeadphones,
  IconLeaf,
  IconMusic,
} from "@tabler/icons-vue";
import Outline from "./components/Outline.vue";
</script>

<template>
  <section class="bg-white">
    <h2 class="sr-only">Extras</h2>

    <div class="flex flex-wrap items-center justify-center gap-8 max-md:gap-4">
      <a href="studio" class="button flex-1 hover:text-red-500">
        <Outline />
        <IconHeadphones />
        Studio
      </a>

      <a href="stems" class="button flex-1 hover:text-green-500">
        <Outline />
        <IconLeaf />
        Stems
      </a>

      <a href="sheets" class="button flex-1 hover:text-cyan-500">
        <Outline />
        <IconMusic />
        Sheets
      </a>

      <a href="software" class="button flex-2 hover:text-indigo-500">
        <Outline />
        I also write software
        <IconArrowDown class="-rotate-90 animate-bounce" />
      </a>
    </div>
  </section>
</template>
