<script setup lang="ts">
import Apple from "@/assets/icons/apple.svg?component";
import Bandcamp from "@/assets/icons/bandcamp.svg?component";
import SoundCloud from "@/assets/icons/soundcloud.svg?component";
import Spotify from "@/assets/icons/spotify.svg?component";
import YouTube from "@/assets/icons/youtube.svg?component";
import { getColor } from "./colors";
</script>

<template>
  <section class="bg-cream">
    <hr />

    <h2 class="sr-only">Follow</h2>

    <div class="flex flex-col items-center gap-4">
      <a
        href="https://vincerubinetti.bandcamp.com/"
        class="button text-lg font-medium"
        :class="getColor(Bandcamp)"
      >
        <Bandcamp />
        Complete Discography
      </a>

      <p class="max-w-100">
        <b>Download</b> and <b>stream</b> the official, highest-quality, most
        up-to-date versions of <i>all of my music</i>, on Bandcamp.
      </p>
    </div>

    <div class="flex flex-col items-center gap-4">
      <div
        class="flex flex-wrap justify-center gap-4 max-md:grid max-md:grid-cols-2 max-sm:grid-cols-1"
      >
        <a
          href="https://music.apple.com/us/artist/vincent-rubinetti/274886492"
          class="button"
          :class="getColor(Apple)"
        >
          <Apple />
          Apple Music
        </a>
        <a
          href="https://open.spotify.com/artist/2SRhEEt2tlDQWxzwfUo9Dl"
          class="button"
          :class="getColor(Spotify)"
        >
          <Spotify />
          Spotify
        </a>
        <a
          href="https://soundcloud.com/vincerubinetti"
          class="button"
          :class="getColor(SoundCloud)"
        >
          <SoundCloud />
          SoundCloud
        </a>
        <a
          href="https://www.youtube.com/c/VincentRubinetti"
          class="button"
          :class="getColor(YouTube)"
        >
          <YouTube />
          YouTube
        </a>
      </div>

      <p class="max-w-100">
        <b>Stream</b> and <b>share</b> <i>select</i> songs and albums.
      </p>
    </div>

    <hr />
  </section>
</template>
