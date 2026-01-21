<script setup lang="ts">
import { ArrowDown, Logs, Microscope } from "lucide-vue-next";
import UXUI from "./images/projects/ux-ui-for-researchers.pdf";
</script>

<template>
  <section class="bg-dark/3">
    <h2 class="sr-only">Extras</h2>

    <div class="flex flex-wrap items-center justify-center gap-8 max-md:gap-4">
      <a href="/github" class="button self-center"> <Logs />GitHub Catalog </a>

      <a
        :href="UXUI"
        class="button self-center"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Microscope />More on UX/UI
      </a>

      <a href="/" class="button-big self-center">
        I also write music
        <ArrowDown class="-rotate-90 animate-bounce" />
      </a>
    </div>
  </section>
</template>
