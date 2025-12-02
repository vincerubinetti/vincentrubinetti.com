<script setup lang="ts">
import { Code, Headphones, Leaf, Music } from "lucide-vue-next";
import bg from "@/assets/images/sheet.jpg?url";
import profile from "@/assets/images/vince.png?url";
</script>

<template>
  <section class="dark">
    <div class="absolute inset-0 -z-10 opacity-10">
      <img :src="bg" alt="" class="h-full w-full object-cover" />
    </div>

    <div class="flex items-center gap-8 max-md:flex-col">
      <img :src="profile" alt="" class="size-40 rounded-full" />
      <p>
        I am a life-long lover of music. Over the past 10+ years I've worked on
        video games, videos, advertisements, ensemble pieces, and a variety of
        other collaborations, serving as composer, producer, arranger, musician,
        and more. My first goal in any musical project is to create the most
        impactful work possible; to replicate the profound way that so many
        great works of music have affected me. I also write software!
      </p>
    </div>

    <div class="flex flex-wrap justify-center gap-4">
      <a href="https://github.com/vincerubinetti" class="button">
        <Code />
        Software
      </a>
      <a href="studio" class="button">
        <Headphones />
        Studio
      </a>
      <a href="stems" class="button">
        <Leaf />
        Stems
      </a>
      <a href="sheets" class="button">
        <Music />
        Sheets
      </a>
    </div>
  </section>
</template>
