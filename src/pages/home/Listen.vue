<template>
  <section id="listen" class="bg-zinc-900 text-white">
    <h2 class="sr-only">Listen</h2>

    <!-- playlists -->
    <div
      class="max-xs:grid-cols-1 grid grid-cols-6 place-content-center gap-2 self-center max-lg:grid-cols-3 max-md:grid-cols-2"
    >
      <button
        v-for="({ title, id }, index) of playlists"
        :key="index"
        class="group border-b-2 border-transparent hover:bg-white/25"
        :class="[selectedPlaylist.id === id ? 'border-white' : '']"
        :aria-current="selectedPlaylist.id === id"
        :aria-label="`Load ${title} playlist`"
        aria-controls="listen-player"
        @click="selectedPlaylist = playlists[index]"
      >
        {{ title }}
      </button>
    </div>

    <SoundCloud
      :playlist="selectedPlaylist.id"
      class="aspect-video w-full"
      id="listen-player"
    >
      <template
        #default="{
          status,
          tracks,
          track,
          playing,
          volume,
          time,
          length,
          waveform,
        }"
      >
        <div v-if="status === 'loading'">Loading</div>

        <template v-else-if="status === 'success'">
          <!-- current track -->
          <div v-if="track" class="flex items-center gap-8">
            <div>{{ track.title }}</div>
            <div class="flex items-center gap-2"><Play /></div>
            <Info />
          </div>

          <!-- player -->
          <div class="flex w-full items-center gap-8">
            <!-- controls -->
            <div class="flex items-center gap-2 text-3xl">
              <button class="hover:bg-white/25">
                <ChevronLeft />
              </button>
              <button class="hover:bg-white/25">
                <Play />
              </button>
              <button class="hover:bg-white/25">
                <ChevronRight />
              </button>
            </div>
            <!-- waveform -->
            <div class="grow bg-zinc-500"></div>
            <!-- thumbnail -->
            <img src="" />
          </div>

          <!-- tracks -->
          <div class="flex w-full flex-col">
            <button
              v-for="(_track, index) in tracks"
              :key="index"
              class="flex items-center gap-4 pt-0! pb-0! pl-0! hover:bg-white/25"
            >
              <img :src="_track.image" class="size-14" />
              <div class="flex grow gap-2 text-left">
                <Music
                  :class="[
                    isEqual(_track, track) ? 'opacity-100' : 'opacity-0',
                  ]"
                />
                {{ _track.title }}
              </div>
              <div class="flex items-center gap-2">
                <Play />
              </div>
            </button>
          </div>
        </template>
      </template>
    </SoundCloud>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { isEqual } from "lodash-es";
import { ChevronLeft, ChevronRight, Info, Music, Play } from "lucide-vue-next";
import SoundCloud from "@/components/SoundCloud.vue";

const playlists = [
  { title: "Best Of", id: "652705266" },
  { title: "Orchestral", id: "96734347" },
  { title: "Electronic", id: "96734608" },
  { title: "Pop/Rock", id: "96735483" },
  { title: "Other", id: "96735680" },
  { title: "Remixes", id: "96735846" },
];

const selectedPlaylist = ref(playlists[0]);
</script>
