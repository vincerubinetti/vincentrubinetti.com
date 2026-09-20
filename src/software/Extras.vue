<script setup lang="ts">
import { IconArrowDown, IconLogs, IconMicroscope } from "@tabler/icons-vue";
import Braces from "./components/Braces.vue";
import UXUI from "./images/projects/ux-ui-for-researchers.pdf";
</script>

<template>
  <section class="bg-light">
    <h2 class="sr-only">Extras</h2>

    <Braces>
      <a href="/catalog" class="button self-center">
        <IconLogs />GitHub Catalog
      </a>

      <a :href="UXUI" class="button self-center">
        <IconMicroscope />Ideas on UX/UI
      </a>

      <a href="/" class="button-big self-center">
        I also write music
        <IconArrowDown class="-rotate-90 animate-bounce" />
      </a>
    </Braces>
  </section>
</template>
