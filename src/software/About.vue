<script setup lang="ts">
import { CornerRightDown } from "lucide-vue-next";
import profile from "@/assets/images/vince.png?url";
</script>

<template>
  <section>
    <h2 class="sr-only">About</h2>

    <div class="flex max-w-full items-center gap-8 max-lg:flex-col">
      <div class="highlight w-50 shrink-0">
        <img :src="profile" alt="" />
      </div>
      <p>
        I started writing software over 20 years ago, making humble games,
        websites, and other tinkerings throughout my childhood. As the web grew,
        I grew with it, watching technologies emerge and evolve, and slowly
        planting myself in that world. Along the way, I've worked on countless
        personal, freelance, and professional sites and apps. I've taken complex
        projects from nascency to maturity &ndash; from research, to mockups, to
        implementation, to testing. My approach is holistic and obsessively
        thorough, always chasing the most clean and robust product possible.
      </p>
    </div>

    <p class="highlight">
      But really, the best way to understand what I do is to
      <i>see it yourself</i>.
      <CornerRightDown />
    </p>
  </section>
</template>
