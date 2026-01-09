<script setup lang="ts">
import { Headphones, Leaf, Music } from "lucide-vue-next";
import profile from "@/images/vince.png?url&format=webp";
import Outline from "./components/Outline.vue";
</script>

<template>
  <section class="text-white">
    <div class="flex items-center gap-(--gap) max-lg:flex-col">
      <img :src="profile" class="size-50 rounded-full" alt="A handsome man" />
      <p>
        I started writing music over 20 years ago, with a humble notation
        program and an obsession with video game music. Throughout my academic
        years, I was part of drumlines, choirs, and other bands, where I
        continued to discover all the emotions and perspectives that music has
        to offer. Since those days, I've worked on indie games, videos, ads,
        collabs, and all sorts of other projects, serving as composer, producer,
        arranger, musician, and more. I am driven to create music that impacts
        others in the same way that so many great works of art have profoundly
        impacted me.
      </p>
    </div>

    <div
      class="grid max-w-max grid-cols-3 gap-4 self-center max-sm:grid-cols-1"
    >
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
    </div>
  </section>
</template>
