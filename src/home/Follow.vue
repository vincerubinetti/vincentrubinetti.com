<script setup lang="ts">
import Apple from "@/images/logos/apple.svg?component";
import Bandcamp from "@/images/logos/bandcamp.svg?component";
import SoundCloud from "@/images/logos/soundcloud.svg?component";
import Spotify from "@/images/logos/spotify.svg?component";
import YouTube from "@/images/logos/youtube.svg?component";
import Outline from "./components/Outline.vue";
import { getColor } from "./util/colors";
</script>

<template>
  <section class="bg-light">
    <h2 class="sr-only">Follow</h2>

    <div class="grid grid-cols-2 items-center gap-(--gap) max-md:contents">
      <a
        href="https://vincerubinetti.bandcamp.com/"
        class="button"
        :class="getColor('Bandcamp')"
      >
        <Outline />
        <Bandcamp />
        Complete Discography
      </a>

      <p class="text-balance">
        <b>Download</b> and <b>stream</b> the official, highest-quality, most
        up-to-date versions of <i>all of my music</i>, on Bandcamp.
      </p>

      <hr class="col-start-1 -col-end-1" />

      <div class="grid grid-cols-2 gap-4 max-xl:grid-cols-1">
        <a
          href="https://music.apple.com/us/artist/vincent-rubinetti/274886492"
          class="button"
          :class="getColor('Apple')"
        >
          <Outline />
          <Apple />
          Apple Music
        </a>
        <a
          href="https://open.spotify.com/artist/2SRhEEt2tlDQWxzwfUo9Dl"
          class="button"
          :class="getColor('Spotify')"
        >
          <Outline />
          <Spotify />
          Spotify
        </a>
        <a
          href="https://soundcloud.com/vincerubinetti"
          class="button"
          :class="getColor('SoundCloud')"
        >
          <Outline />
          <SoundCloud />
          SoundCloud
        </a>
        <a
          href="https://www.youtube.com/c/VincentRubinetti"
          class="button"
          :class="getColor('YouTube')"
        >
          <Outline />
          <YouTube />
          YouTube
        </a>
      </div>

      <p class="text-balance">
        <b>Stream</b> and <b>share</b> <i>select</i> songs and albums.
      </p>
    </div>
  </section>
</template>
