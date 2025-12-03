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
    <h2 class="sr-only">Follow</h2>

    <div
      class="grid grid-cols-[1fr_1px_1fr] items-center gap-12 max-lg:grid-cols-1"
    >
      <a
        href="https://vincerubinetti.bandcamp.com/"
        class="button"
        :class="getColor(Bandcamp)"
      >
        <Bandcamp />
        Complete Discography
      </a>

      <hr
        class="col-start-2 row-span-2 h-[unset]! self-stretch bg-current/25 max-lg:hidden"
      />

      <p class=" ">
        <b>Download</b> and <b>stream</b> the official, highest-quality, most
        up-to-date versions of <i>all of my music</i>, on Bandcamp.
      </p>

      <hr class="lg:hidden" />

      <div class="grid grid-cols-2 gap-4 max-xl:grid-cols-1">
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

      <p class=" ">
        <b>Stream</b> and <b>share</b> <i>select</i> songs and albums.
      </p>
    </div>
  </section>
</template>
