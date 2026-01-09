<script setup lang="ts">
import { ref } from "vue";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  Info,
  MessageCircle,
  Pause,
  Play,
  RefreshCcw,
} from "lucide-vue-next";
import { pointerCoords } from "@/util/dom";
import { sleep } from "@/util/misc";
import { formatTime, formatValue, linkify } from "@/util/string";
import Slider from "./components/Slider.vue";
import type { Track } from "./components/SoundCloud";
import SoundCloud from "./components/SoundCloud.vue";
import bandcamp from "./data/bandcamp.json";
import { level, playing, track } from "./util/state";

const playlists = [
  { title: "Best Of", id: "652705266" },
  { title: "Orchestral", id: "96734347" },
  { title: "Electronic", id: "96734608" },
  { title: "Pop/Rock", id: "96735483" },
  { title: "Other", id: "96735680" },
  { title: "Remixes", id: "96735846" },
];

const selectedPlaylist = ref(playlists[0]);

/** show full track info */
const showInfo = ref(false);

/** track stats */
const getStats = (track: Track) => [
  {
    icon: Calendar,
    text: track.description?.match(/📅 ?(.*)$/m)?.[1] || "",
    title: "Date finished",
  },
  {
    icon: Heart,
    text: formatValue(track.likes_count),
    title: "Likes on SoundCloud",
  },
  {
    icon: Download,
    text: formatValue(track.download_count),
    title: "Downloads on SoundCloud",
  },
  {
    icon: MessageCircle,
    text: formatValue(track.comment_count),
    title: "Comments on SoundCloud",
  },
  {
    icon: RefreshCcw,
    text: formatValue(track.reposts_count),
    title: "Reposts on SoundCloud",
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
  bandcamp.find((t) => t.track === track.title)?.album_link ?? "";
</script>

<template>
  <section class="pt-0 text-white">
    <h2 class="sr-only">Listen</h2>

    <!-- playlists -->
    <div
      class="max-xs:grid-cols-1 grid w-full grid-cols-6 gap-4 max-lg:grid-cols-3 max-md:grid-cols-2"
    >
      <button
        v-for="({ title, id }, index) of playlists"
        :key="index"
        class="button-dark"
        :class="[selectedPlaylist.id === id ? 'bg-current/10' : '']"
        :aria-current="selectedPlaylist.id === id"
        :title="`Load ${title} playlist`"
        aria-controls="listen-player"
        @click="selectedPlaylist = playlists[index]"
      >
        {{ title }}
      </button>
    </div>

    <SoundCloud
      id="listen-player"
      class="aspect-video w-full"
      :playlist="selectedPlaylist.id"
      @track="track = $event"
      @playing="playing = $event"
      @level="level = $event"
    >
      <template
        #default="{
          status,
          tracks,
          track,
          playing,
          volume,
          time,
          previous,
          play,
          pause,
          next,
          seek,
          setTrack,
          setVolume,
        }"
      >
        <div
          v-if="status === 'loading'"
          class="grid h-100 w-full animate-pulse place-content-center rounded bg-white/10"
        >
          Loading
        </div>

        <div
          v-else-if="status === 'success' && track"
          class="flex w-full flex-col items-center gap-4"
        >
          <!-- track list -->
          <div class="flex w-full flex-col">
            <template v-for="(_track, index) in tracks" :key="index">
              <!-- track button -->
              <button
                class="button-dark group h-14 gap-4 p-0 pr-4 aria-pressed:rounded-br-none aria-pressed:bg-black/25"
                :title="`Play ${_track.title}`"
                :aria-pressed="track.id === _track.id"
                @click="
                  async (event) => {
                    if (track.id === _track.id) setTrack(-1);
                    else {
                      setTrack(index);
                      seek(0);
                      play();
                      const target = event.currentTarget as HTMLElement;
                      await sleep(100);
                      target.scrollIntoView({ block: 'nearest' });
                    }
                  }
                "
              >
                <img :src="_track.artwork_url ?? ''" alt="" class="h-full" />
                <div class="grow truncate text-left">
                  {{ _track.title }}
                </div>
                <div
                  class="flex items-center gap-1 text-right text-sm opacity-50 group-hover:hidden"
                >
                  <span class="truncate">
                    {{ formatValue(_track.playback_count) }}
                  </span>
                  <Play />
                </div>
                <div
                  class="hidden max-w-1/2 truncate text-right text-sm opacity-50 group-hover:block"
                >
                  {{ _track.tags?.join(",  ") }}
                </div>
              </button>

              <!-- track controls -->
              <div
                v-if="track.id === _track.id"
                class="flex flex-col gap-4 rounded-br bg-black/25 p-2"
              >
                <div
                  class="flex items-center justify-center *:shrink-0 max-md:flex-wrap"
                >
                  <!-- controls -->
                  <button
                    class="button-dark"
                    title="Previous track"
                    @click="
                      if (time < 2000) previous();
                      seek(0);
                      play();
                    "
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    class="button-dark"
                    title="Play/Pause"
                    @click="playing ? pause() : play()"
                  >
                    <Play v-if="!playing" />
                    <Pause v-if="playing" />
                  </button>
                  <button
                    class="button-dark"
                    title="Next track"
                    @click="
                      next();
                      seek(0);
                      play();
                    "
                  >
                    <ChevronRight />
                  </button>

                  <!-- waveform -->
                  <button
                    class="button-dark group h-12 grow px-2 py-0 max-md:-order-1 max-md:w-full"
                    title="Seek"
                    @click="
                      seek(pointerCoords($event).x * (track.duration ?? 1))
                    "
                    @keydown.right.prevent="seek(time + 5000)"
                    @keydown.left.prevent="seek(time - 5000)"
                    @keydown.space.prevent="playing ? pause() : play()"
                  >
                    <svg
                      viewBox="0 0 1 1"
                      preserveAspectRatio="none"
                      class="size-full"
                    >
                      <filter id="waveform-filter">
                        <feFlood
                          flood-opacity="1"
                          x="0"
                          y="0"
                          height="1"
                          :width="(time || 1) / (track.duration ?? 1)"
                          result="left-alpha"
                        />
                        <feFlood
                          flood-opacity="0.25"
                          :x="(time || 1) / (track.duration ?? 1)"
                          y="0"
                          height="1"
                          :width="1 - (time || 1) / (track.duration ?? 1)"
                          result="right-alpha"
                        />
                        <feComposite
                          in="SourceGraphic"
                          in2="left-alpha"
                          operator="in"
                          result="left-waveform"
                        />
                        <feComposite
                          in="SourceGraphic"
                          in2="right-alpha"
                          operator="in"
                          result="right-waveform"
                        />
                        <feMerge>
                          <feMergeNode in="left-waveform" />
                          <feMergeNode in="right-waveform" />
                        </feMerge>
                      </filter>
                      <polygon
                        id="waveform"
                        filter="url(#waveform-filter)"
                        class="fill-current"
                        :points="
                          track?.waveform?.smoothed
                            ?.map(({ x, y }) => `${x},${1 - y ** 2}`)
                            ?.flat()
                            ?.join(' ')
                        "
                      />
                    </svg>
                    <div
                      class="absolute bottom-full -translate-x-1/2 text-sm opacity-0 transition-opacity group-hover:opacity-50"
                      :style="{
                        left: `${(time / (track.duration ?? 1)) * 100}%`,
                      }"
                    >
                      {{ formatTime(time) }}
                    </div>
                    <div
                      class="absolute right-0 bottom-full text-sm opacity-0 transition-opacity group-hover:opacity-50"
                      :style="{
                        visibility:
                          time / (track.duration ?? 1) < 0.75
                            ? undefined
                            : 'hidden',
                      }"
                    >
                      {{ formatTime(track.duration ?? 0) }}
                    </div>
                  </button>

                  <div class="w-16 px-2 max-sm:hidden">
                    <Slider
                      :model-value="[volume]"
                      :min="0"
                      :max="1"
                      :step="0.05"
                      label="Volume"
                      @update:model-value="
                        (value) => setVolume(value?.[0] ?? 1)
                      "
                    />
                  </div>

                  <!-- actions -->
                  <div class="flex items-center">
                    <a
                      :href="getBandcamp(track)"
                      class="button-dark"
                      title="Download on Bandcamp"
                    >
                      <Download />
                    </a>
                    <button
                      class="button-dark"
                      :aria-expanded="showInfo"
                      aria-controls="track-info"
                      :title="showInfo ? 'Hide track info' : 'Show track info'"
                      @click="showInfo = !showInfo"
                    >
                      <Info />
                    </button>
                  </div>
                </div>

                <!-- track info -->
                <div
                  v-if="showInfo"
                  id="track-info"
                  class="flex flex-col gap-6 p-4"
                >
                  <!-- track details -->
                  <div class="flex w-full flex-wrap items-center gap-6">
                    <div
                      v-for="({ icon, text, title }, index) of getStats(track)"
                      :key="index"
                      class="flex items-center gap-2"
                      :title="title"
                    >
                      <component :is="icon" class="opacity-50" />
                      {{ text }}
                    </div>
                  </div>

                  <!-- track description -->
                  <p
                    class="description wrap-break-word"
                    v-html="getDescription(track)"
                  />
                </div>
              </div>
            </template>
          </div>
        </div>
      </template>
    </SoundCloud>
  </section>
</template>

<style scoped>
@reference "tailwindcss";
@import "./styles.css";

.description :deep(a) {
  @apply text-mid hover:text-current;
}
</style>
