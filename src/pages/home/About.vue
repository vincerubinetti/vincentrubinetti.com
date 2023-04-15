<template>
  <AppSection
    id="about"
    heading="About"
    class="about"
    :dark="true"
    :background="background"
  >
    <div v-appear class="row">
      <img
        :src="profile"
        class="profile"
        alt="picture of vince"
        loading="lazy"
      />
      <p class="p">
        I am a life-long lover of music. Over the past 10+ years I've worked on
        video games, videos, advertisements, ensemble pieces, and a variety of
        other collaborations, serving as composer, producer, arranger, musician,
        and more. My first goal in any musical project is to create the most
        impactful work possible; to replicate the profound way that so many
        great works of music have affected me. I also write software!
      </p>
    </div>

    <div v-appear class="buttons">
      <AppButton
        v-for="(link, index) in links"
        :key="index"
        :href="link.url"
        :icon="link.icon"
        :text="link.text"
        :outline="true"
        design="glass"
      />
    </div>
  </AppSection>
</template>

<script setup lang="ts">
import type { icons } from "@/components/AppButton.vue";
import profile from "@/assets/vince.png";
import background from "@/assets/piano.jpg";

type Link = { url: string; icon: keyof typeof icons; text: string };

const links: Link[] = [
  {
    url: "https://github.com/vincerubinetti",
    icon: "code",
    text: "Software",
  },
  {
    url: "studio",
    icon: "headphones",
    text: "Studio",
  },
  {
    url: "stems",
    icon: "leaf",
    text: "Stems",
  },
  {
    url: "sheets",
    icon: "notes",
    text: "Sheet Music",
  },
];
</script>

<style scoped>
.about :deep(.image) {
  left: 0;
  -webkit-mask-image: linear-gradient(-90deg, transparent, #fff4);
  mask-image: linear-gradient(-90deg, transparent, #fff4);
}

.row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 60px;
}

.profile {
  border-radius: 999px;
  width: 200px;
  height: 200px;
  max-width: 100%;
}

.p {
  flex-grow: 1;
}

.buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

@media (max-width: 820px) {
  .row {
    flex-direction: column;
  }

  .buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 500px) {
  .buttons {
    grid-template-columns: 1fr;
  }
}
</style>
