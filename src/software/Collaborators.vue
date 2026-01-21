<script setup lang="ts">
import { slugify } from "@/util/string";
import collaborators from "./data/collaborators.json";
import collaboratorLogos from "./images/collaborators";
</script>

<template>
  <section class="bg-dark/3">
    <h2 class="sr-only">Collaborators</h2>

    <div
      class="grid max-w-full gap-8 self-center overflow-x-auto"
      :style="{
        gridTemplateColumns: `repeat(${collaborators.length}, auto)`,
      }"
    >
      <div
        v-for="({ name }, index) in collaborators"
        :key="index"
        :title="name"
        role="img"
      >
        <component
          :is="collaboratorLogos[slugify(name)]"
          class="size-12 opacity-50 grayscale transition-all hover:opacity-100 hover:grayscale-0"
        />
      </div>
    </div>
  </section>
</template>
