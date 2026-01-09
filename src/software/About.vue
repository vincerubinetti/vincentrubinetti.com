<script setup lang="ts">
import { CornerRightDown } from "lucide-vue-next";
import profile from "@/images/vince.png?url&format=webp";
import Dash from "./components/Dash.vue";
</script>

<template>
  <section>
    <h2><Dash flip />About</h2>

    <div class="flex max-w-full items-center gap-(--gap) max-lg:flex-col">
      <div class="size-50 shrink-0">
        <img :src="profile" alt="A handsome man" />
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

    <p class="self-center">
      But really, the best way to understand what I do is to
      <i>see it yourself</i>...
      <CornerRightDown class="ml-2 animate-bounce" />
    </p>
  </section>
</template>
