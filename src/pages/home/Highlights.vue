<template>
  <AppSection v-appear id="highlights" heading="Highlights">
    <div v-appear class="gallery">
      <AppButton
        v-for="(highlight, index) in highlights"
        :key="index"
        class="button"
        aria-controls="highlights-player"
        :aria-label="highlight.title"
        @click="onClickHighlight(highlight)"
      >
        <div class="overlay">
          <div class="title">{{ highlight.title }}</div>
        </div>
        <img :src="highlight.image" class="image" alt="" loading="lazy" />
      </AppButton>
    </div>

    <div v-appear ref="theater" id="highlights-player" class="theater">
      <iframe
        ref="iframe"
        class="iframe"
        style="aspect-ratio: 16 / 9; min-height: 200px"
        :src="src"
        allowfullscreen
        allow="autoplay"
        frameborder="no"
        loading="lazy"
      />

      <h3>{{ selected.title }}</h3>
      <div class="info">
        <span>Credits</span>
        <span v-html="selected.credits" />
        <span>Genre</span>
        <span>{{ selected.genre }}</span>
      </div>
      <p v-html="selected.description" />
      <div v-appear class="buttons">
        <AppButton
          v-for="(link, index) in selected.links"
          :key="index"
          :href="link.url"
          :icon="link.icon"
          :text="link.text"
          :outline="true"
        />
      </div>
    </div>
  </AppSection>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useEventListener, useScriptTag } from "@vueuse/core";
import type { icons } from "@/components/AppButton.vue";
import harmony from "@/assets/harmony-of-a-hunter-returns.jpg";
import emerald from "@/assets/emerald-cloud-lab.jpg";
import blue from "@/assets/3blue1brown.jpg";
import minute from "@/assets/minute-physics.jpg";
import hacky from "@/assets/hacky-zack.jpg";
import high from "@/assets/high-noon-revolver.jpg";
import ink from "@/assets/ink.jpg";
import remixes from "@/assets/remixes-and-remakes.jpg";
import { waitForEvent } from "@/util/func";

type Highlight = {
  title: string;
  image: string;
  video?: string;
  playlist?: string;
  credits?: string;
  genre?: string;
  description?: string;
  links?: { url: string; icon: keyof typeof icons; text?: string }[];
};

const highlights: Highlight[] = [
  {
    title: "Harmony of a Hunter Returns",
    image: harmony,
    playlist: "PL8CeOEg8N98-PWtlQ9-7jayyDpxa3dmJM",
    credits: "Music, orchestration 2022",
    genre: "Orchestral, electronic",
    description:
      "Arrangements of three beloved tracks from the Metroid series, featured on the acclaimed fan album <a href='https://harmony.shinesparkers.net/' target='_blank'>Harmony of a Hunter Returns</a> celebrating the 35 year anniversary of Metroid.",
    links: [
      {
        url: "https://vincerubinetti.bandcamp.com/album/metroid",
        icon: "bandcamp",
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
      "<a href='https://www.emeraldcloudlab.com/' target='_blank'>Emerald Cloud Lab</a> is an advanced remote laboratory that allows scientists to automate their experiments. Narration by Grant Sanderson.",
    links: [
      {
        url: "https://vincerubinetti.bandcamp.com/album/emerald-cloud-lab",
        icon: "bandcamp",
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
      "<a href='https://www.3blue1brown.com/' target='_blank'>3Blue1Brown</a> is a <a href='https://www.youtube.com/channel/UCYO_jab_esuFRV4b17AJtAw' target='_blank'>Youtube channel</a> that produces elucidating and captivating videos about mathematical concepts, with exquisite animations and a focus on intuitive understanding.",
    links: [
      {
        url: "https://vincerubinetti.bandcamp.com/album/the-music-of-3blue1brown",
        icon: "bandcamp",
        text: "Download on Bandcamp",
      },
      {
        url: "https://open.spotify.com/album/1dVyjwS8FBqXhRunaG5W5u",
        icon: "spotify",
        text: "Stream on Spotify",
      },
      {
        url: "https://itunes.apple.com/us/album/the-music-of-3blue1brown/1448166136",
        icon: "apple",
        text: "Stream on Apple Music",
      },
    ],
  },
  {
    title: "Minute Physics",
    image: minute,
    video: "zcqZHYo7ONs",
    credits:
      "Music, w/ <a href='https://soundcloud.com/drschroeder' target='_blank'>Nathaniel Schroeder</a>, 2017",
    genre: "Classical, soft-rock",
    description:
      "A collaboration video project between <a href='https://www.youtube.com/user/minutephysics' target='_blank'>Minute Physics</a> and <a href='https://www.youtube.com/channel/UCYO_jab_esuFRV4b17AJtAw' target='_blank'>3Blue1Brown</a> on Bell's Theorem.",
    links: [
      {
        url: "https://www.youtube.com/watch?v=zcqZHYo7ONs",
        icon: "youtube",
        text: "Watch the Minute Physics video",
      },
      {
        url: "https://www.youtube.com/watch?v=MzRCDLre1b4",
        icon: "youtube",
        text: "Watch the 3Blue1Brown video",
      },
      {
        url: "https://vincerubinetti.bandcamp.com/album/the-music-of-3blue1brown",
        icon: "bandcamp",
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
        icon: "steam",
        text: "Get the game on Steam",
      },
      {
        url: "https://vincerubinetti.bandcamp.com/album/hackyzack",
        icon: "bandcamp",
        text: "Download on Bandcamp",
      },
      {
        url: "https://open.spotify.com/album/7w6ae71QrsvVmh2Ej6BPub",
        icon: "spotify",
        text: "Stream on Spotify",
      },
      {
        url: "https://music.apple.com/us/album/hackyzack-original-soundtrack/1434944909",
        icon: "apple",
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
        icon: "steam",
        text: "Get the game on Steam",
      },
      {
        url: "https://vincerubinetti.bandcamp.com/album/high-noon-revolver",
        icon: "bandcamp",
        text: "Download on Bandcamp",
      },
      {
        url: "https://open.spotify.com/album/6FMgkXnTURg0DS5eh17nOR",
        icon: "spotify",
        text: "Stream on Spotify",
      },
      {
        url: "https://itunes.apple.com/us/album/high-noon-revolver-original-soundtrack/1434772948/",
        icon: "apple",
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
        icon: "steam",
        text: "Get the game on Steam",
      },
      {
        url: "https://vincerubinetti.bandcamp.com/album/ink",
        icon: "bandcamp",
        text: "Download on Bandcamp",
      },
      {
        url: "https://open.spotify.com/album/1F7HW6WwIUE29TleDXX4uh",
        icon: "spotify",
        text: "Stream on Spotify",
      },
      {
        url: "https://itunes.apple.com/us/album/ink-original-soundtrack/1434752108",
        icon: "apple",
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
      "Over the years, Vince has authored a large collection of arrangements/remixes/remakes of classic game music that have gained popularity and <a href=''https://www.youtube.com/watch?v=ogX8Ygecxuc&feature=youtu.be&t=121>recognition</a> on YouTube.",
    links: [
      {
        url: "https://vincerubinetti.bandcamp.com/album/remixes-and-remakes",
        icon: "bandcamp",
        text: "Download on Bandcamp",
      },
    ],
  },
];

const theater = ref();
const iframe = ref();
let player: any;

const selected = ref<Highlight>(highlights[0]);
const autoplay = ref(false);

const src = computed(() => {
  const { playlist = "", video = "" } = selected.value;
  const params = new URLSearchParams();
  if (playlist) params.set("list", playlist);
  if (autoplay.value) params.set("autoplay", "1");
  params.set("enablejsapi", "1");
  if (typeof window !== "undefined") params.set("origin", window.location.host);
  if (playlist)
    return `https://www.youtube.com/embed/videoseries?${params.toString()}`;
  else if (video)
    return `https://www.youtube.com/embed/${video}?${params.toString()}`;
  else return "";
});

const onClickHighlight = async (highlight: Highlight) => {
  selected.value = highlight;
  theater.value?.scrollIntoView({ behavior: "smooth", block: "start" });
  window.dispatchEvent(new Event("stop-soundcloud"));
  autoplay.value = true;
};

onMounted(() => {
  window.onYouTubeIframeAPIReady = onLoad;

  /** allow global event to stop playback */
  useEventListener(window, "stop-youtube", () => {
    player?.stopVideo?.();
  });
});

/** load youtube player */
const onLoad = () => {
  player = new window.YT.Player(iframe.value, {
    events: {
      onStateChange: (event: any) => {
        if (event.data === 1)
          window.dispatchEvent(new Event("stop-soundcloud"));
      },
    },
  });
};

/** when selected src changes */
watch(src, async () => {
  await waitForEvent(iframe.value, "load");
  onLoad();
});

/** load youtube api script */
useScriptTag("https://www.youtube.com/iframe_api");
</script>

<style scoped>
.gallery {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 20px;
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: black;
  color: white;
  opacity: 0;
  transition: opacity var(--fast);
  z-index: 0;
}

*:where(:hover, :focus) > .overlay {
  opacity: 1;
}

.image {
  width: 100%;
}

.theater {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  padding-top: 20px;
}

.iframe {
  width: 100%;
  aspect-ratio: 16 / 9;
  min-height: 200px;
}

.info {
  display: grid;
  grid-template-columns: min-content 1fr;
  gap: 10px 20px;
  width: 100%;
}

.info > *:nth-child(odd) {
  color: var(--gray);
  text-transform: uppercase;
}

.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

@media (max-width: 600px) {
  .gallery {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
