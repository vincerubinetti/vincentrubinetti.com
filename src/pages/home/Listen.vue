<template>
  <AppSection id="listen">
    <div class="buttons">
      <AppButton
        v-for="({ title, id, icon }, index) of playlists"
        :key="index"
        class="button"
        :icon="icon"
        :text="title"
        :outline="playlist.id !== id"
        :design="playlist.id === id ? 'dark' : undefined"
        :data-active="playlist.id === id"
        :data-draw="playlist.id === id"
        :aria-current="playlist.id === id"
        :aria-label="`load ${title} playlist`"
        @click="playlist = playlists[index]"
      />
    </div>
    <Player :id="playlist.id" />
  </AppSection>
</template>

<script setup lang="ts">
import Player from "@/components/ThePlayer.vue";
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

.button {
  height: 45px;
}

.button > :deep(svg) {
  height: 0.01em !important;
  margin-right: -10px;
  transition: var(--fast);
  transition-property: height, margin;
}

.button[data-active="true"] > :deep(svg) {
  height: 1.4em !important;
  margin-right: 0;
}

@media (max-width: 1180px) {
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
