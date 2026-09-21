<script setup lang="ts">
import { IconArrowDown, IconBulb } from "@tabler/icons-vue";
import GitHub from "@/images/logos/github.svg?component";
import Braces from "./components/Braces.vue";
import UXUI from "./images/projects/ux-ui-for-researchers.pdf";
</script>

<template>
  <section class="bg-light paper">
    <h2 class="sr-only">Extras</h2>

    <Braces>
      <a href="/catalog" class="button self-center">
        <GitHub />GitHub Catalog
      </a>

      <a :href="UXUI" class="button self-center">
        <IconBulb />Ideas on UX/UI
      </a>

      <a href="/" class="button-big self-center">
        I also write music
        <IconArrowDown class="-rotate-90 animate-bounce" />
      </a>
    </Braces>
  </section>
</template>
