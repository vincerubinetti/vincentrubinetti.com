<template>
  <Section>
    <div class="buttons">
      <button
        v-for="({ title, id }, index) of playlists"
        :key="index"
        class="button button-fancy"
        :data-active="playlist.id === id"
        @click="playlist = playlists[index]"
      >
        {{ title }}
      </button>
    </div>
    <Player :id="playlist.id" />
  </Section>
</template>

<script setup lang="ts">
import Player from "@/components/Player.vue";
import Section from "@/components/Section.vue";
import { ref } from "vue";

const playlists = [
  { title: "Best Of", id: "652705266" },
  { title: "Orchestral", id: "96734347" },
  { title: "Electronic", id: "96734608" },
  { title: "Pop, Rock", id: "96735483" },
  { title: "Other", id: "96735680" },
  { title: "Remixes", id: "96735846" },
];

const playlist = ref(playlists[4]);
</script>

<style scoped>
.buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}
</style>
