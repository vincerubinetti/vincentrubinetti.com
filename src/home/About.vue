<script setup lang="ts">
import profile from "@/images/vince.png?url&format=webp";
</script>

<template>
  <section class="text-white">
    <div class="relative flex items-center gap-16 max-md:flex-col">
      <img
        :src="profile"
        class="size-48 rounded-full lg:absolute lg:right-full lg:-translate-x-16"
        alt="A handsome man"
      />
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
  </section>
</template>
