<script setup lang="ts">
import Apple from "@/assets/icons/apple.svg?component";
import Bandcamp from "@/assets/icons/bandcamp.svg?component";
import SoundCloud from "@/assets/icons/soundcloud.svg?component";
import Spotify from "@/assets/icons/spotify.svg?component";
import YouTube from "@/assets/icons/youtube.svg?component";
</script>

<template>
  <section class="bg-zinc-100">
    <h2 class="sr-only">Follow</h2>

    <div class="flex flex-col items-center gap-4">
      <a
        href="https://vincerubinetti.bandcamp.com/"
        class="button hover:bg-emerald-500/25"
      >
        <Bandcamp />
        Complete Discography
      </a>

      <p class="max-w-100">
        <b>Download</b> and <b>stream</b> the official, highest-quality, most
        up-to-date versions of <i>all of my music</i>, on <b>Bandcamp</b>.
      </p>
    </div>

    <div class="flex flex-col items-center gap-4">
      <div
        class="flex flex-wrap justify-center gap-4 max-md:grid max-md:grid-cols-2 max-sm:grid-cols-1"
      >
        <a
          href="https://music.apple.com/us/artist/vincent-rubinetti/274886492"
          class="button hover:bg-red-500/25"
        >
          <Apple />
          Apple Music
        </a>
        <a
          href="https://open.spotify.com/artist/2SRhEEt2tlDQWxzwfUo9Dl"
          class="button hover:bg-orange-500/25"
        >
          <Spotify />
          Spotify
        </a>
        <a
          href="https://soundcloud.com/vincerubinetti"
          class="button hover:bg-orange-500/25"
        >
          <SoundCloud />
          SoundCloud
        </a>
        <a
          href="https://www.youtube.com/c/VincentRubinetti"
          class="button hover:bg-red-500/25"
        >
          <YouTube />
          YouTube
        </a>
      </div>

      <p class="max-w-100">
        <b>Stream</b> and <b>share</b> <i>select</i> songs and albums.
      </p>
    </div>
  </section>
</template>
