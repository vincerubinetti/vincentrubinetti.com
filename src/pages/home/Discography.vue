<template>
  <Section :background="background" :dark="true">
    <Button
      href="https://vincerubinetti.bandcamp.com/"
      :outline="true"
      color="fill"
    >
      <DiscIcon />
      Complete Discography
    </Button>
    <p>
      <b>Download</b> and <b>stream</b> the official, highest-quality, most
      up-to-date versions of <i>all of my music</i>, on <b>Bandcamp</b>.
    </p>
  </Section>
</template>

<script setup lang="ts">
import Section from "@/components/Section.vue";
import Button from "@/components/Button.vue";
import background from "@/assets/discography.jpg";
import DiscIcon from "@/assets/remixes.svg?component";
</script>
