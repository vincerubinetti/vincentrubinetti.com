<script setup lang="ts">
import { IconArrowDown, IconLogs, IconMicroscope } from "@tabler/icons-vue";
import UXUI from "./images/projects/ux-ui-for-researchers.pdf";
</script>

<template>
  <section class="bg-dark/3">
    <h2 class="sr-only">Extras</h2>

    <div class="flex flex-wrap items-center justify-center gap-8 max-md:gap-4">
      <a href="/github" class="button self-center">
        <IconLogs />GitHub Catalog
      </a>

      <a
        :href="UXUI"
        class="button self-center"
        target="_blank"
        rel="noopener noreferrer"
      >
        <IconMicroscope />More on UX/UI
      </a>

      <a href="/" class="button-big self-center">
        I also write music
        <IconArrowDown class="-rotate-90 animate-bounce" />
      </a>
    </div>
  </section>
</template>
