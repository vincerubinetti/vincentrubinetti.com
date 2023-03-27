<template>
  <div v-if="loading">Loading</div>
  <div v-else-if="!fallback" class="player" :style="{ '--accent': accent }">
    <div class="controls">
      <button class="button control" aria-label="previous track">
        <img class="icon" :src="previous" />
      </button>
      <button
        class="button control"
        @click="playing ? onClickPause() : onClickPlay()"
        :aria-label="playing ? 'pause' : 'play'"
      >
        <img v-if="!playing" class="icon" :src="play" />
        <img v-if="playing" class="icon" :src="pause" />
      </button>
      <button class="button control" aria-label="next track">
        <img class="icon" :src="next" />
      </button>
      <svg
        viewBox="0 -10 100 20"
        class="waveform"
        preserveAspectRatio="none"
        @click="onClickWaveform"
      >
        <path
          fill="none"
          stroke="var(--gray)"
          stroke-width="0.1"
          :d="track?.waveform"
        />
        <path
          fill="none"
          :stroke="accent"
          stroke-width="0.1"
          :d="track?.waveform"
          :style="{
            'clip-path': `inset(0 ${100 * (1 - position)}% 0 0)`,
          }"
        />
      </svg>
    </div>

    <div class="current">
      <div>
        {{ track?.title }}
      </div>
      <div>
        {{ track?.date }}
      </div>
      <div>
        <a :href="track?.url" target="_blank">On SoundCloud</a>
      </div>
    </div>

    <div class="tracks">
      <button
        v-for="(track, index) in tracks"
        :key="index"
        class="button track"
        @click="onClickTrack(index)"
      >
        <img :src="track.art" class="track-art" />
        <span class="track-title">{{ track.title }}</span>
        <span>{{ count(track.plays) }}</span>
        <span>{{ count(track.likes) }}</span>
        <span>{{ count(track.downloads) }}</span>
        <span>{{ count(track.reposts) }}</span>
      </button>
    </div>
  </div>
  <iframe
    ref="iframe"
    class="widget"
    :src="`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/${id}&amp;amp;color=ff5500&amp;amp;auto_play=false&amp;amp;hide_related=true&amp;amp;show_comments=true&amp;amp;show_user=true&amp;amp;show_reposts=false`"
    title="Music player"
    allow="autoplay"
    loading="lazy"
    :style="fallback ? {} : { position: 'fixed', opacity: 0 }"
  ></iframe>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useScriptTag } from "@vueuse/core";
import { wait } from "@/util/func";
import { max } from "@/util/math";
import previous from "@/assets/previous.svg";
import play from "@/assets/play.svg";
import pause from "@/assets/pause.svg";
import next from "@/assets/next.svg";

type Props = {
  id: string;
  accent: string;
};

defineProps<Props>();

const iframe = ref<HTMLIFrameElement>();
let widget: any;

/** track info */
type Track = {
  id: number;
  length: number;
  waveform: string;
  levels: number[];
  art: string;
  title: string;
  description: string[];
  caption: string;
  plays: number;
  likes: number;
  comments: number;
  downloads: number;
  reposts: number;
  date: string;
  created: Date;
  modified: Date;
  url: string;
  tags: string[];
};
/** list of tracks in playlist */
const tracks = ref<Track[]>([]);

/** play state */
const loading = ref(false);
const playing = ref(false);
const track = ref<Track>();
const position = ref(0);
const level = ref(0);

/** fallback to soundcloud iframe if error */
const fallback = ref(false);
const onError =
  (func: Function) =>
  (...args: any[]) => {
    try {
      func(...args);
    } catch (error) {
      console.info(error);
      fallback.value = true;
      loading.value = false;
    }
  };

/** on widget ready */
const onReady = async () => {
  /** get tracks */
  const sounds = (await new Promise((resolve) =>
    widget.getSounds(resolve)
  )) as any[];

  const newTracks: Track[] = [];

  /** fill-in missing track information */
  for (const _ of sounds) {
    /** make periodic attempts to get the full info */
    for (let tries = 0; ; tries++) {
      /** up to limit */
      if (tries > 100) throw Error("full track info couldn't be loaded");

      /** get full details of one track at a time */
      const sound = (await new Promise((resolve) =>
        widget.getCurrentSound(resolve)
      )) as any;

      /** check if full info has loaded for current sound yet */
      if (sound.artwork_url) {
        /** record full info */
        newTracks.push({
          id: sound.id || 0,
          length: Math.max(sound.duration || 0, sound.full_duration || 0),
          ...(await getWaveform(sound.waveform_url || "")),
          art: sound.artwork_url || "",
          title: sound.title || "",
          description: (sound.description || "")
            .split("©")[0]
            .trim()
            .split("\n"),
          caption: sound.caption || "",
          plays: sound.playback_count || 0,
          likes: sound.likes_count || 0,
          comments: sound.comment_count || 0,
          downloads: sound.download_count || 0,
          reposts: sound.reposts_count || 0,
          date: sound.description.match(/📅 ?(.*)$/m)?.[1] || "",
          created:
            new Date(sound.created_at || sound.display_date) || new Date(),
          modified: new Date(sound.last_modified) || new Date(),
          url: sound.permalink_url || "",
          tags: sound.tag_list?.split(/\s/) || "",
        });
        /** stop re-trying */
        break;
      } else {
        /** wait a bit before re-trying */
        await wait(10);
      }
    }

    /** move to next track */
    widget.next();
  }

  /** go back to first track again */
  widget.skip(0);
  widget.pause();
  widget.seekTo(0);

  loading.value = false;

  /** set tracks */
  if (newTracks.length) {
    tracks.value = newTracks;
    track.value = newTracks[0];
  } else throw Error("no tracks");
};

/** transform waveform json url into svg path */
const getWaveform = async (url = "") => {
  let points = ((await (await fetch(url)).json()).samples || []) as number[];
  const height = max(points);

  const levels: number[] = [];
  const waveform = points
    .map((point, index) => {
      const position = index / points.length;
      const level = Math.pow(point / height, 3);
      levels.push(level);
      const x = (100 * position).toFixed(2);
      const y = (10 * level).toFixed(2);
      return `M ${x} ${y} L ${x} ${-y}`;
    })
    .join(" ");

  return { waveform, levels };
};

/** on play progress */
const onPlayProgress = ({ relativePosition }: { relativePosition: number }) => {
  position.value = relativePosition;
  const levels = track.value?.levels || [];
  level.value = levels[Math.floor(relativePosition * levels.length)];
  window.dispatchEvent(
    new CustomEvent("level", { detail: { level: level.value } })
  );
};

/** on track start */
const onPlay = async () => {
  const index = (await new Promise((resolve) =>
    widget.getCurrentSoundIndex(resolve)
  )) as any;
  track.value = tracks.value[index];
};

/** on script load */
const onLoad = () => {
  /** load widget */
  loading.value = true;
  if (!iframe.value) return;
  if (!window.SC) throw Error("SC not defined");
  widget = window.SC.Widget(iframe.value);
  if (!widget) throw Error("widget couldn't be hooked up");

  /** events */
  widget.bind(window.SC.Widget.Events.READY, onError(onReady));
  widget.bind(window.SC.Widget.Events.PLAY_PROGRESS, onError(onPlayProgress));
  widget.bind(window.SC.Widget.Events.PLAY, onError(onPlay));
};
useScriptTag("https://w.soundcloud.com/player/api.js", onError(onLoad));

/** compact count */
const count = (number = 0): string =>
  number.toLocaleString(undefined, { notation: "compact" });

/** controls */
const onClickPlay = () => {
  widget.play();
  playing.value = true;
};
const onClickPause = () => {
  widget.pause();
  playing.value = false;
};
const onClickWaveform = (event: MouseEvent) => {
  const element = event.target as HTMLElement;
  var { left, width } = element.getBoundingClientRect();
  const position = (event.clientX - left) / width;
  widget.seekTo(position * (track.value?.length || 0));
  widget.play();
  playing.value = true;
};
const onClickTrack = (index: number) => {
  widget.skip(index);
  widget.seekTo(0);
  track.value = tracks.value[index];
  playing.value = true;
};
</script>

<style scoped>
.widget {
  width: 100%;
  height: 800px;
  border: none;
}

.player {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.button {
  position: relative;
}

.button:after {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0;
  background: var(--accent);
  filter: hue-rotate(-360deg);
  z-index: -1;
  transition: var(--fast);
  transition-property: opacity, filter;
}

.button:hover:after {
  opacity: 0.2;
  filter: hue-rotate(0);
}

.controls {
  display: flex;
  gap: 10px;
}

.control {
  width: 60px;
  height: 60px;
}

.icon {
  width: 20px;
  height: 20px;
}

.waveform {
  flex-grow: 1;
  height: 60px;
  cursor: pointer;
}

.tracks {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.track {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-right: 10px;
}

.track-art {
  width: 40px;
  height: 40px;
}

.track-title {
  text-align: left;
  flex-grow: 1;
}
</style>
