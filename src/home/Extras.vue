<script setup lang="ts">
import { Code, Headphones, Leaf, Music } from "lucide-vue-next";
import Outline from "@/components/Outline.vue";
</script>

<template>
  <section>
    <h2 class="sr-only">Extras</h2>

    <div class="grid grid-cols-4 gap-4 max-md:grid-cols-2 max-sm:grid-cols-1">
      <a
        href="https://github.com/vincerubinetti"
        class="button hover:text-indigo-500"
      >
        <Outline />
        <Code />
        Software
      </a>
      <a href="studio" class="button hover:text-rose-500">
        <Outline />
        <Headphones />
        Studio
      </a>
      <a href="stems" class="button hover:text-emerald-500">
        <Outline />
        <Leaf />
        Stems
      </a>
      <a href="sheets" class="button hover:text-cyan-500">
        <Outline />
        <Music />
        Sheets
      </a>
    </div>
  </section>
</template>
