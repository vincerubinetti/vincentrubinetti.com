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
  Pause,
  Play,
  RefreshCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-vue-next";
import slugify from "slugify";
import Slider from "@/components/Slider.vue";
import type { Track } from "@/components/SoundCloud.vue";
import SoundCloud from "@/components/SoundCloud.vue";
import { clickCoords } from "@/util/dom";
import { formatTime, formatValue, linkify } from "@/util/string";
import { colors, level } from "./state";

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
  <h2 class="sr-only">Listen</h2>

  <!-- playlists -->
  <div
    class="max-xs:grid-cols-1 grid w-full grid-cols-6 gap-4 max-lg:grid-cols-3 max-md:grid-cols-2"
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
    id="listen-player"
    class="aspect-video w-full"
    :playlist="selectedPlaylist.id"
    v-model:level="level"
    v-model:colors="colors"
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
        class="grid h-100 w-full animate-pulse place-content-center bg-white/10"
      >
        Loading
      </div>

      <div
        v-else-if="status === 'success' && track"
        class="flex w-full flex-col items-center gap-4"
      >
        <!-- player -->
        <div class="flex w-full gap-4">
          <!-- transport controls -->
          <div class="flex flex-col">
            <div class="flex items-center gap-2 text-2xl">
              <button
                title="Previous track"
                @click="
                  if (time < 2000) previous();
                  seek(0);
                  play();
                "
              >
                <ChevronLeft />
              </button>
              <button title="Play/Pause" @click="playing ? pause() : play()">
                <Play v-if="!playing" />
                <Pause v-if="playing" />
              </button>
              <button
                title="Next track"
                @click="
                  next();
                  seek(0);
                  play();
                "
              >
                <ChevronRight />
              </button>
            </div>
            <Slider
              :model-value="[volume]"
              :min="0"
              :max="1"
              :step="0.05"
              @update:model-value="(value) => setVolume(value?.[0] ?? 1)"
            />
          </div>

          <!-- waveform -->
          <button
            class="group relative grow p-0!"
            title="Seek"
            @click="seek(clickCoords($event).x * (track.duration ?? 1))"
            @keydown.right.prevent="seek(time + 5000)"
            @keydown.left.prevent="seek(time - 5000)"
            @keydown.space.prevent="playing ? pause() : play()"
          >
            <svg
              viewBox="0 0 1 1.5"
              preserveAspectRatio="none"
              class="h-0 min-h-full w-full"
            >
              <filter id="waveform-filter">
                <feFlood
                  flood-color="red"
                  flood-opacity="1"
                  x="0"
                  y="0"
                  height="1"
                  :width="time / (track.duration ?? 1)"
                  result="left-alpha"
                />
                <feFlood
                  flood-color="red"
                  flood-opacity="0.25"
                  :x="time / (track.duration ?? 1)"
                  y="0"
                  height="1"
                  :width="1 - time / (track.duration ?? 1)"
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
                class="fill-white"
                :points="
                  track?.waveform?.smoothed
                    ?.map(({ x, y }) => `${x},${1 - y * 0.8}`)
                    ?.flat()
                    ?.join(' ')
                "
              />
              <use
                href="#waveform"
                transform="translate(0, 1) scale(1, -0.5) translate(0, -1)"
                :opacity="0.25"
              />
            </svg>
            <div
              class="absolute top-full -translate-x-1/2 translate-y-1 text-sm opacity-0 transition-opacity group-hover:opacity-100"
              :style="{ left: `${(time / (track.duration ?? 1)) * 100}%` }"
            >
              {{ formatTime(time) }}
            </div>
            <div
              class="absolute top-full right-0 translate-y-1 text-sm opacity-0 transition-opacity group-hover:opacity-100"
            >
              {{ formatTime(track.duration ?? 0) }}
            </div>
          </button>
        </div>

        <!-- track overview -->
        <div class="flex w-full flex-wrap items-center justify-center gap-2">
          <div class="font-medium">{{ track.title }}</div>
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

        <!-- track info -->
        <div
          id="track-info"
          class="flex w-full flex-col gap-4 overflow-hidden transition-[max-height]"
          :class="showInfo ? 'max-h-100' : 'max-h-0'"
        >
          <!-- track details -->
          <div
            class="flex w-full flex-wrap items-center justify-center gap-4 opacity-50"
          >
            <div v-for="tag in track.tags" :key="tag">#{{ tag }}</div>
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

          <!-- track description -->
          <div
            class="overflow-y-auto leading-tight"
            v-html="getDescription(track)"
          />
        </div>

        <!-- track list -->
        <div class="flex w-full flex-col">
          <template v-for="(_track, index) in tracks" :key="index">
            <button
              class="group flex h-14 gap-4! p-0! pr-4! aria-selected:bg-white/10"
              :aria-selected="isEqual(track, _track)"
              :title="`Play ${_track.title}`"
              @click="
                setTrack(index);
                seek(0);
                play();
              "
            >
              <img :src="_track.artwork_url ?? ''" class="h-full" />
              <div class="z-0 flex h-full grow items-center gap-2 text-left">
                {{ _track.title }}
              </div>
              <div class="relative text-sm opacity-50">
                <div
                  class="absolute right-0 flex items-center gap-2 opacity-100 transition-opacity group-hover:opacity-0"
                >
                  <Play />
                  {{ formatValue(_track.playback_count) }}
                </div>
                <div
                  class="truncate opacity-0 transition-opacity group-hover:flex group-hover:opacity-100"
                >
                  {{ _track.tags?.map((tag) => `#${tag}`).join(" ") }}
                </div>
              </div>
            </button>
          </template>
        </div>
      </div>
    </template>
  </SoundCloud>
</template>
