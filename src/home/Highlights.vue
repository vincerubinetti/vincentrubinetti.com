<script setup lang="ts">
import {
  computed,
  onMounted,
  shallowRef,
  useTemplateRef,
  watchEffect,
} from "vue";
import { useEventListener } from "@vueuse/core";
import logos from "@/images/logos";
import { waitFor } from "@/util/misc";
import { renderMarkdown, slugify } from "@/util/string";
import Outline from "./components/Outline.vue";
import highlights from "./data/highlights.json";
import albums from "./images/albums";
import { getColor } from "./util/colors";
import "youtube-video-element";

type Highlight = (typeof highlights)[number];

/** player element */
const player = useTemplateRef<HTMLVideoElement>("player");

/** player src */
const src = computed(() => {
  const { playlist = "", video = "" } = selected.value;
  if (playlist) return `https://www.youtube.com/playlist?list=${playlist}`;
  else if (video) return `https://www.youtube.com/watch?v=${video}`;
  else return "";
});

/** selected highlight */
const selected = shallowRef<Highlight>(highlights[0]);

/** select/deselect a highlight */
const select = async (highlight: Highlight) => {
  selected.value = highlight;
  /** wait for player to be ready */
  await waitFor(() => player.value?.readyState ?? 0 > 0);
  /** play video */
  player.value?.play();
  /** scroll to player */
  player.value?.scrollIntoView({ behavior: "smooth", block: "center" });
};

/** stop soundcloud when youtube plays */
watchEffect(() =>
  player.value?.addEventListener("play", () =>
    window.dispatchEvent(new Event("stop-soundcloud")),
  ),
);

/** prevent ssr error */
onMounted(() =>
  /** stop youtube when soundcloud plays */
  useEventListener(window, "soundcloud-play", () => player.value?.pause()),
);
</script>

<template>
  <section class="bg-white">
    <h2 class="sr-only">Highlights</h2>

    <div class="max-xs:grid-cols-1 grid grid-cols-4 gap-2 max-sm:grid-cols-2">
      <button
        v-for="(highlight, index) in highlights"
        :key="index"
        class="group relative overflow-hidden rounded"
        aria-controls="highlights-player"
        :title="highlight.title"
        @click="select(highlight)"
      >
        <div
          class="absolute inset-0 flex items-center justify-center bg-black p-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
        >
          {{ highlight.title }}
        </div>
        <img :src="albums[slugify(highlight.title)]" alt="" loading="lazy" />
      </button>
    </div>

    <div class="grid grid-cols-2 gap-8 max-lg:grid-cols-1 max-md:gap-4">
      <youtube-video
        ref="player"
        id="highlights-player"
        class="min-h-[unset] min-w-0 max-lg:aspect-video"
        :src="src"
        controls
        allowfullscreen
        allow="autoplay"
      ></youtube-video>

      <div class="flex flex-col gap-4">
        <h3>{{ selected.title }}</h3>

        <div class="grid grid-cols-[auto_1fr] gap-x-4 leading-loose">
          <span class="opacity-50">Credits</span>
          <span v-html="renderMarkdown(selected.credits)" />
          <span class="opacity-50">Genre</span>
          <span>{{ selected.genre }}</span>
        </div>

        <p v-html="renderMarkdown(selected.description)" />

        <div class="flex flex-wrap gap-4">
          <a
            v-for="(link, index) in selected.links"
            :key="index"
            :href="link.url"
            class="button"
            :class="getColor(link.icon)"
            :title="link.text"
          >
            <Outline />
            <component :is="logos[link.icon as keyof typeof logos]" />
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
