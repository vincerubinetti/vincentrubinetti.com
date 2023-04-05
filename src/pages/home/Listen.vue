<template>
  <Section>
    <div class="buttons">
      <Button
        v-for="({ title, id, icon }, index) of playlists"
        :key="index"
        class="button"
        :outline="true"
        :data-color="playlist.id === id ? 'dark' : undefined"
        :data-active="playlist.id === id"
        :aria-current="playlist.id === id"
        :aria-label="`load ${title} playlist`"
        @click="playlist = playlists[index]"
      >
        <component :is="icon" style></component>
        {{ title }}
      </Button>
    </div>
    <Player :id="playlist.id" />
  </Section>
</template>

<script setup lang="ts">
import Section from "@/components/Section.vue";
import Button from "@/components/Button.vue";
import Player from "@/components/Player.vue";
import BestOf from "@/assets/best-of.svg?component";
import Orchestral from "@/assets/orchestral.svg?component";
import Electronic from "@/assets/electronic.svg?component";
import Rock from "@/assets/rock.svg?component";
import Other from "@/assets/other.svg?component";
import Remixes from "@/assets/remixes.svg?component";
import { ref } from "vue";

const playlists = [
  { title: "Best Of", id: "652705266", icon: BestOf },
  { title: "Orchestral", id: "96734347", icon: Orchestral },
  { title: "Electronic", id: "96734608", icon: Electronic },
  { title: "Pop/Rock", id: "96735483", icon: Rock },
  { title: "Other", id: "96735680", icon: Other },
  { title: "Remixes", id: "96735846", icon: Remixes },
];

const playlist = ref(playlists[0]);
</script>

<style scoped>
.buttons {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px 30px;
  width: 100%;
}

.button svg {
  height: 0;
  margin-right: -10px;
  transition: var(--fast);
  transition-property: height, margin;
}

.button[data-active="false"] > :deep(svg) path {
  animation: none;
}

.button[data-active="true"] svg {
  height: 25px;
  margin-right: 0;
}

@media (max-width: 1080px) {
  .buttons {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 600px) {
  .buttons {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 350px) {
  .buttons {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>
