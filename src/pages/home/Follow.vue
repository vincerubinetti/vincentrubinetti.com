<template>
  <AppSection
    v-appear
    id="follow"
    heading="Follow"
    class="follow"
    :background="background"
    :dark="true"
  >
    <AppButton
      href="https://vincerubinetti.bandcamp.com/"
      :outline="true"
      design="glass"
      icon="bandcamp"
      text="Complete Discography"
    />
    <p class="p">
      <b>Download</b> and <b>stream</b> the official, highest-quality, most
      up-to-date versions of <i>all of my music</i>, on <b>Bandcamp</b>.
    </p>

    <div class="spacer" />

    <div v-appear class="buttons">
      <AppButton
        v-for="(link, index) in links"
        :key="index"
        :icon="link.icon"
        :text="link.text"
        :href="link.url"
        :outline="true"
        design="glass"
      />
    </div>
    <p class="p">
      <b>Stream</b> and <b>share</b> <i>select</i> songs and albums.
    </p>
  </AppSection>
</template>

<script setup lang="ts">
import type { icons } from "@/components/AppButton.vue";
import background from "@/assets/sheet-music.jpg";

type Link = { url: string; icon: keyof typeof icons; text: string };

const links: Link[] = [
  {
    url: "https://soundcloud.com/vincerubinetti",
    icon: "soundcloud",
    text: "SoundCloud",
  },
  {
    url: "https://music.apple.com/us/artist/vincent-rubinetti/274886492",
    icon: "apple",
    text: "Apple Music",
  },
  {
    url: "https://open.spotify.com/artist/2SRhEEt2tlDQWxzwfUo9Dl",
    icon: "spotify",
    text: "Spotify",
  },
  {
    url: "https://www.youtube.com/c/VincentRubinetti",
    icon: "youtube",
    text: "YouTube",
  },
];
</script>

<style scoped>
.follow {
  align-items: flex-start !important;
}

.follow :deep(.image) {
  right: 0;
  -webkit-mask-image: linear-gradient(-90deg, #fff4, transparent);
  mask-image: linear-gradient(-90deg, #fff4, transparent);
}

.spacer {
  margin: -10px 0;
}

.p {
  margin-top: -20px;
  max-width: 500px;
}

.buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

@media (max-width: 820px) {
  .buttons {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 500px) {
  .buttons {
    display: flex;
    flex-direction: column;
  }
}
</style>
