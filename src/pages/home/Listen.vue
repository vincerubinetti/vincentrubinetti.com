<script setup lang="ts">
import { ref } from "vue";
import { isEqual } from "lodash-es";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  MessageCircle,
  Play,
  RefreshCcw,
  Tag,
  ZoomIn,
  ZoomOut,
} from "lucide-vue-next";
import slugify from "slugify";
import type { Track } from "@/components/SoundCloud.vue";
import SoundCloud from "@/components/SoundCloud.vue";
import { formatValue, linkify } from "@/util/string";

const playlists = [
  { title: "Best Of", id: "652705266" },
  { title: "Orchestral", id: "96734347" },
  { title: "Electronic", id: "96734608" },
  { title: "Pop/Rock", id: "96735483" },
  { title: "Other", id: "96735680" },
  { title: "Remixes", id: "96735846" },
];

const selectedPlaylist = ref(playlists[0]);

const showInfo = ref(false);

/** track stats */
const getStats = (track: Track) => [
  {
    icon: Calendar,
    text: track.description?.match(/📅 ?(.*)$/m)?.[1] || "",
    title: "Date",
  },
  {
    icon: Play,
    text: formatValue(track.playback_count),
    title: "Plays",
  },
  {
    icon: Heart,
    text: formatValue(track.likes_count),
    title: "Likes",
  },
  {
    icon: Download,
    text: formatValue(track.download_count),
    title: "Downloads",
  },
  {
    icon: MessageCircle,
    text: formatValue(track.comment_count),
    title: "Comments",
  },
  {
    icon: RefreshCcw,
    text: formatValue(track.reposts_count),
    title: "Reposts",
  },
];

/** get clean description */
const getDescription = (track: Track) =>
  linkify(
    (track.description || "")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => !line.match(/📅/) && !line.match(/^-+$/))
      .join("\n")
      .replaceAll(/\n{3,}/gm, "\n\n"),
  );

/** get associated bandcamp album */
const getBandcamp = (track: Track) =>
  `https://vincerubinetti.bandcamp.com/track/${slugify(track.title ?? "", { lower: true, strict: true })}`;
</script>

<template>
  <section id="listen" class="bg-zinc-900 text-white">
    <h2 class="sr-only">Listen</h2>

    <!-- playlists -->
    <div
      class="max-xs:grid-cols-1 grid w-full grid-cols-6 max-lg:grid-cols-3 max-md:grid-cols-2"
    >
      <button
        v-for="({ title, id }, index) of playlists"
        :key="index"
        class="group border-b-2"
        :class="[
          selectedPlaylist.id === id ? 'border-white' : 'border-transparent',
        ]"
        :aria-current="selectedPlaylist.id === id"
        :title="`Load ${title} playlist`"
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

        <div
          v-else-if="status === 'success' && track"
          class="flex w-full flex-col items-center gap-4"
        >
          <!-- player -->
          <div class="flex w-full items-center gap-4">
            <!-- transport controls -->
            <div class="flex flex-col">
              <div class="flex items-center gap-2 text-2xl">
                <button>
                  <ChevronLeft />
                </button>
                <button>
                  <Play />
                </button>
                <button>
                  <ChevronRight />
                </button>
              </div>
            </div>

            <!-- waveform -->
            <div class="grow">
              <svg
                viewBox="0 0 1 1"
                preserveAspectRatio="none"
                class="h-12 w-full fill-zinc-500"
              >
                <polygon
                  :points="
                    track?.waveform
                      ?.map(({ x, y }) => `${x},${1 - y * 0.8}`)
                      ?.flat()
                      ?.join(' ')
                  "
                />
              </svg>
            </div>

            <!-- actions -->
            <div class="flex flex-col">
              <a
                :href="getBandcamp(track)"
                class="button"
                target="_blank"
                title="Download on Bandcamp"
              >
                <Download />
              </a>
              <button
                :aria-expanded="showInfo"
                aria-controls="track-info"
                title="Toggle track info"
                @click="showInfo = !showInfo"
              >
                <ZoomOut v-if="showInfo" />
                <ZoomIn v-else />
              </button>
            </div>
          </div>

          <!-- track info -->
          <div
            id="track-info"
            class="flex w-full flex-col gap-4 overflow-hidden transition-all"
            :class="showInfo ? 'max-h-100' : 'max-h-0'"
          >
            <div class="flex w-full flex-wrap justify-center gap-4">
              <div
                v-for="({ icon, text, title }, index) of getStats(track)"
                :key="index"
                class="flex items-center gap-1"
                :title="title"
              >
                <component :is="icon" />
                {{ text }}
              </div>
            </div>
            <div class="flex flex-wrap justify-center gap-4">
              <span v-for="tag in track.tags" :key="tag">#{{ tag }}</span>
            </div>
            <div
              class="overflow-y-auto leading-tight"
              v-html="getDescription(track)"
            />
          </div>

          <!-- tracks -->
          <div class="flex w-full flex-col">
            <template v-for="(_track, index) in tracks" :key="index">
              <button
                class="flex h-14 gap-4! p-0! pr-4! aria-selected:bg-white/10"
                :aria-selected="isEqual(track, _track)"
                :title="`Play ${_track.title}`"
              >
                <img :src="_track.artwork_url" class="h-full" />
                <div class="z-0 flex h-full grow items-center gap-2 text-left">
                  {{ _track.title }}
                </div>
                <div class="flex items-center gap-2 text-sm">
                  <Play />
                  {{ formatValue(_track.playback_count) }}
                </div>
              </button>
            </template>
          </div>
        </div>
      </template>
    </SoundCloud>
  </section>
</template>
