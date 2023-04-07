<template>
  <AppSection class="discography" :background="background" :dark="true">
    <AppButton
      href="https://vincerubinetti.bandcamp.com/"
      :outline="true"
      design="glass"
      type="bandcamp"
      text="Complete Discography"
    />
    <p>
      <b>Download</b> and <b>stream</b> the official, highest-quality, most
      up-to-date versions of <i>all of my music</i>, on <b>Bandcamp</b>.
    </p>
  </AppSection>

  <AppSection>
    <div class="buttons">
      <AppButton
        v-for="(link, index) in links"
        :key="index"
        :type="link.type"
        :href="link.url"
        :outline="true"
      />
    </div>
    <p><b>Share</b> and <b>stream</b> <i>select</i> songs and albums.</p>
  </AppSection>
</template>

<script setup lang="ts">
import type { types } from "@/components/AppButton.vue";
import background from "@/assets/discography.jpg";

const links: { type: keyof typeof types; url: string }[] = [
  {
    type: "soundcloud",
    url: "https://soundcloud.com/vincerubinetti",
  },
  {
    type: "applemusic",
    url: "https://music.apple.com/us/artist/vincent-rubinetti/274886492",
  },
  {
    type: "spotify",
    url: "https://open.spotify.com/artist/2SRhEEt2tlDQWxzwfUo9Dl",
  },
  {
    type: "youtube",
    url: "https://www.youtube.com/c/VincentRubinetti",
  },
];
</script>

<style scoped>
.discography {
  padding-top: 100px !important;
  padding-bottom: 100px !important;
}

.discography > p {
  max-width: 480px;
}

.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

@media (max-width: 800px) {
  .buttons {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 500px) {
  .buttons {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>
