<script setup lang="ts">
import Braces from "./components/Braces.vue";
import { slugify } from "@/util/string";
import collaborators from "./data/collaborators.json";
import collaboratorLogos from "./images/collaborators";
</script>

<template>
  <section class="bg-dark/3">
    <h2 class="sr-only">Collaborators</h2>

    <Braces>
      <div
        v-for="({ name }, index) in collaborators"
        :key="index"
        :title="name"
        role="img"
        class="size-12 opacity-50 grayscale transition-all hover:opacity-100 hover:grayscale-0"
      >
        <component :is="collaboratorLogos[slugify(name)]" class="size-full" />
      </div>
    </Braces>
  </section>
</template>
