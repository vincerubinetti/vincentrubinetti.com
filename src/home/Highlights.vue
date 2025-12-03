<script setup lang="ts">
import {
  computed,
  onMounted,
  shallowRef,
  useTemplateRef,
  watchEffect,
  type FunctionalComponent,
} from "vue";
import { useEventListener } from "@vueuse/core";
import blue from "@/assets/albums/3blue1brown.jpg?url";
import emerald from "@/assets/albums/emerald-cloud-lab.jpg?url";
import hacky from "@/assets/albums/hacky-zack.jpg?url";
import harmony from "@/assets/albums/harmony-of-a-hunter-returns.jpg?url";
import high from "@/assets/albums/high-noon-revolver.jpg?url";
import ink from "@/assets/albums/ink.jpg?url";
import minute from "@/assets/albums/minute-physics.jpg?url";
import remixes from "@/assets/albums/remixes-and-remakes.jpg?url";
import Apple from "@/assets/icons/apple.svg?component";
import Bandcamp from "@/assets/icons/bandcamp.svg?component";
import Spotify from "@/assets/icons/spotify.svg?component";
import Steam from "@/assets/icons/steam.svg?component";
import YouTube from "@/assets/icons/youtube.svg?component";
import { waitFor } from "@/util/misc";
import { renderMarkdown } from "@/util/string";
import "youtube-video-element";
import { getColor } from "./colors";

type Highlight = {
  title: string;
  image: string;
  video?: string;
  playlist?: string;
  credits?: string;
  genre?: string;
  description?: string;
  links?: { url: string; icon: FunctionalComponent; text?: string }[];
};

const highlights: Highlight[] = [
  {
    title: "Harmony of a Hunter Returns",
    image: harmony,
    playlist: "PL8CeOEg8N98-PWtlQ9-7jayyDpxa3dmJM",
    credits: "Music, orchestration 2022",
    genre: "Orchestral, electronic",
    description:
      "Arrangements of three beloved tracks from the Metroid series, featured on the acclaimed fan album [Harmony of a Hunter Returns](https://harmony.shinesparkers.net) celebrating the 35 year anniversary of Metroid.",
    links: [
      {
        url: "https://vincerubinetti.bandcamp.com/album/metroid",
        icon: Bandcamp,
        text: "Vince's tracks on Bandcamp",
      },
    ],
  },
  {
    title: "Emerald Cloud Lab",
    image: emerald,
    video: "DK2uhXYizEg",
    credits: "Music, sound-mixing, 2019",
    genre: "Classical, hybrid electronic",
    description:
      "[Emerald Cloud Lab](https://www.emeraldcloudlab.com/) is an advanced remote laboratory that allows scientists to automate their experiments. Narration by Grant Sanderson.",
    links: [
      {
        url: "https://vincerubinetti.bandcamp.com/album/emerald-cloud-lab",
        icon: Bandcamp,
        text: "Download on Bandcamp",
      },
    ],
  },
  {
    title: "3Blue1Brown",
    image: blue,
    playlist: "PL8CeOEg8N98-Zp5htiWQEsjNySnR-WE2A",
    credits: "Music, 2016 - present",
    genre: "Classical, hybrid electronic",
    description:
      "[3Blue1Brown](https://www.3blue1brown.com/) is a [Youtube channel](https://www.youtube.com/channel/UCYO_jab_esuFRV4b17AJtAw) that produces elucidating and captivating videos about mathematical concepts, with exquisite animations and a focus on intuitive understanding.",
    links: [
      {
        url: "https://vincerubinetti.bandcamp.com/album/the-music-of-3blue1brown",
        icon: Bandcamp,
        text: "Download on Bandcamp",
      },
      {
        url: "https://open.spotify.com/album/1dVyjwS8FBqXhRunaG5W5u",
        icon: Spotify,
        text: "Stream on Spotify",
      },
      {
        url: "https://itunes.apple.com/us/album/the-music-of-3blue1brown/1448166136",
        icon: Apple,
        text: "Stream on Apple Music",
      },
    ],
  },
  {
    title: "Minute Physics",
    image: minute,
    video: "zcqZHYo7ONs",
    credits:
      "Music, w/ [Nathaniel Schroeder](https://soundcloud.com/drschroeder), 2017",
    genre: "Classical, soft-rock",
    description:
      "A collaboration video project between [Minute Physics](https://www.youtube.com/user/minutephysics) and [3Blue1Brown](https://www.youtube.com/channel/UCYO_jab_esuFRV4b17AJtAw) on Bell's Theorem.",
    links: [
      {
        url: "https://www.youtube.com/watch?v=zcqZHYo7ONs",
        icon: YouTube,
        text: "Watch the Minute Physics video",
      },
      {
        url: "https://www.youtube.com/watch?v=MzRCDLre1b4",
        icon: YouTube,
        text: "Watch the 3Blue1Brown video",
      },
      {
        url: "https://vincerubinetti.bandcamp.com/album/the-music-of-3blue1brown",
        icon: Bandcamp,
        text: "Download on Bandcamp",
      },
    ],
  },
  {
    title: "Hacky Zack",
    image: hacky,
    video: "ivl5NlHd21Y",
    credits: "Music, 2017",
    genre: "Nu-jazz, down-tempo",
    description:
      "A game by Spaceboy Games. Juggle balls with special properties through a gauntlet of unique precision-platforming puzzles.",
    links: [
      {
        url: "https://store.steampowered.com/app/508530/HackyZack/",
        icon: Steam,
        text: "Get the game on Steam",
      },
      {
        url: "https://vincerubinetti.bandcamp.com/album/hackyzack",
        icon: Bandcamp,
        text: "Download on Bandcamp",
      },
      {
        url: "https://open.spotify.com/album/7w6ae71QrsvVmh2Ej6BPub",
        icon: Spotify,
        text: "Stream on Spotify",
      },
      {
        url: "https://music.apple.com/us/album/hackyzack-original-soundtrack/1434944909",
        icon: Apple,
        text: "Stream on Apple Music",
      },
    ],
  },
  {
    title: "High Noon Revolver",
    image: high,
    video: "4CgeVDJU7kc",
    credits: "Music, 2017",
    genre: "Hard-rock, western",
    description:
      "A game by Mike Studios and Spaceboy Games. Blast your way across 3 layers of platforming, collecting gold and obtaining upgrades helping you go from puny to powerhouse.",
    links: [
      {
        url: "https://store.steampowered.com/app/560510/High_Noon_Revolver/",
        icon: Steam,
        text: "Get the game on Steam",
      },
      {
        url: "https://vincerubinetti.bandcamp.com/album/high-noon-revolver",
        icon: Bandcamp,
        text: "Download on Bandcamp",
      },
      {
        url: "https://open.spotify.com/album/6FMgkXnTURg0DS5eh17nOR",
        icon: Spotify,
        text: "Stream on Spotify",
      },
      {
        url: "https://itunes.apple.com/us/album/high-noon-revolver-original-soundtrack/1434772948/",
        icon: Apple,
        text: "Stream on Apple Music",
      },
    ],
  },
  {
    title: "Ink",
    image: ink,
    playlist: "PL8CeOEg8N989YRe-jmlM5ebWQs5oNWcH9",
    credits: "Music, sound design, 2015",
    genre: "Ambient electronic",
    description:
      "A game by Zack Bell Games. Reveal your surroundings by splashing colorful ink in this hardcore platformer reminiscent of Super Meat Boy.",
    links: [
      {
        url: "https://store.steampowered.com/app/385710/INK/",
        icon: Steam,
        text: "Get the game on Steam",
      },
      {
        url: "https://vincerubinetti.bandcamp.com/album/ink",
        icon: Bandcamp,
        text: "Download on Bandcamp",
      },
      {
        url: "https://open.spotify.com/album/1F7HW6WwIUE29TleDXX4uh",
        icon: Spotify,
        text: "Stream on Spotify",
      },
      {
        url: "https://itunes.apple.com/us/album/ink-original-soundtrack/1434752108",
        icon: Apple,
        text: "Stream on Apple Music",
      },
    ],
  },
  {
    title: "Remixes and Remakes",
    image: remixes,
    playlist: "PL8CeOEg8N989RH9FV5kWUSTSfGnWXayRO",
    credits: "Music, 2009 – present",
    genre: "Various",
    description:
      "Over the years, Vince has authored a large collection of arrangements/remixes/remakes of classic game music that have gained popularity and [recognition](https://www.youtube.com/watch?v=ogX8Ygecxuc&feature=youtu.be&t=121) on YouTube.",
    links: [
      {
        url: "https://vincerubinetti.bandcamp.com/album/remixes-and-remakes",
        icon: Bandcamp,
        text: "Download on Bandcamp",
      },
    ],
  },
];

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
  <section>
    <h2 class="sr-only">Highlights</h2>

    <div class="max-xs:grid-cols-1 grid grid-cols-4 gap-2 max-sm:grid-cols-2">
      <button
        v-for="(highlight, index) in highlights"
        :key="index"
        class="group relative overflow-hidden rounded"
        aria-controls="highlights-player"
        :aria-label="highlight.title"
        @click="select(highlight)"
      >
        <div
          class="absolute inset-0 flex items-center justify-center bg-black p-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
        >
          {{ highlight.title }}
        </div>
        <img :src="highlight.image" alt="" loading="lazy" />
      </button>
    </div>

    <div class="grid grid-cols-2 gap-8 max-lg:grid-cols-1">
      <youtube-video
        ref="player"
        id="highlights-player"
        class="min-h-[unset]! min-w-0! max-lg:aspect-video"
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
            <component :is="link.icon" />
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
