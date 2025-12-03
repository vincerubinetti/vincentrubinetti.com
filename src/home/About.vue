<script setup lang="ts">
import profile from "@/assets/images/vince.png?url";
import bg from "@/assets/images/sheet.jpg?url";
</script>

<template>
  <section class="dark">
    <div
      class="absolute inset-0 -z-10 bg-cover bg-fixed bg-center opacity-15"
      :style="{ backgroundImage: `url(${bg})` }"
    />

    <div class="flex items-center gap-16 max-md:flex-col">
      <img :src="profile" alt="" class="size-50 rounded-full" />
      <p>
        I am a life-long lover of music. Over the past 10+ years I've worked on
        video games, videos, advertisements, ensemble pieces, and a variety of
        other collaborations, serving as composer, producer, arranger, musician,
        and more. My first goal in any musical project is to create the most
        impactful work possible; to replicate the profound way that so many
        great works of music have affected me. I also write software!
      </p>
    </div>
  </section>
</template>
