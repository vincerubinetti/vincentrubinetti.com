<template>
  <div v-if="loading" class="placeholder"></div>
  <div v-else-if="!fallback" class="player">
    <div class="top">
      <img :src="track?.art" class="art" />

      <div class="info">
        <div class="title">
          {{ track?.title }}
        </div>
        <div>
          {{ formatTime((position * (track?.length || 0)) / 1000) }} &ndash;
          {{ formatTime((track?.length || 0) / 1000) }}
        </div>
      </div>

      <div class="controls">
        <button class="button control" aria-label="previous track">
          <Previous class="icon" />
        </button>
        <button
          class="button control"
          @click="playing ? onClickPause() : onClickPlay()"
          :aria-label="playing ? 'pause' : 'play'"
        >
          <Pause v-if="playing" class="icon" />
          <Play v-else class="icon" />
        </button>
        <button class="button control" aria-label="next track">
          <Next class="icon" />
        </button>
      </div>
    </div>

    <svg
      viewBox="0 -10 100 20"
      tabindex="0"
      class="waveform"
      preserveAspectRatio="none"
      @click="onClickWaveform"
    >
      <polygon fill="var(--gray)" :points="track?.waveform" />
      <polygon
        fill="var(--dark-gray)"
        :points="track?.waveform"
        :style="{
          'clip-path': `inset(0 ${100 * (1 - position)}% 0 0)`,
        }"
      />
    </svg>

    <div class="tracks">
      <button
        v-for="(track, index) in tracks"
        :key="index"
        class="button track"
        @click="onClickTrack(index)"
      >
        <img :src="track.art" class="track-art" />
        <span class="track-title">{{ track.title }}</span>
        <span class="track-count">
          {{ formatCount(track.plays) }} <Play class="track-icon"
        /></span>
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
import { level } from "@/global/state";
import { formatTime, formatCount } from "@/util/string";
import Previous from "@/assets/previous.svg?component";
import Play from "@/assets/play.svg?component";
import Pause from "@/assets/pause.svg?component";
import Next from "@/assets/next.svg?component";

type Props = {
  id: string;
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
          art: (await getArt(sound.artwork_url)) || "",
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
    widget.pause();
  }

  /** go back to first track again */
  widget.skip(0);
  widget.seekTo(0);
  widget.pause();

  loading.value = false;

  /** set tracks */
  if (newTracks.length) {
    tracks.value = newTracks;
    track.value = newTracks[0];
  } else throw Error("no tracks");
};

/** transform waveform json url into svg path */
const getWaveform = async (url = "") => {
  let samples = ((await (await fetch(url)).json()).samples || []) as number[];
  samples = [0].concat(samples).concat([0]);
  const height = max(samples);
  const levels: number[] = [];
  let points = samples.map((sample, index) => {
    const position = index / samples.length;
    const level = Math.pow(sample / height, 3);
    levels.push(level);
    const x = 100 * position;
    const y = 10 * level;
    return { x, y };
  });
  const reversed = points.reverse().map(({ x, y }) => ({ x, y: -y }));
  points = points.concat(reversed);
  const waveform = points
    .map(({ x, y }) => x.toFixed(2) + "," + y.toFixed(2))
    .join(" ");
  return { waveform, levels };
};

/** get artwork from url */
const getArt = async (url = "") => {
  const bigurl = url.replace("large", "t500x500");
  try {
    await fetch(bigurl);
    return bigurl;
  } catch (error) {}
  try {
    await fetch(url);
    return url;
  } catch (error) {
    return "";
  }
};

/** on play progress */
const onPlayProgress = ({ relativePosition }: { relativePosition: number }) => {
  position.value = relativePosition;
  const levels = track.value?.levels || [];
  level.value = playing.value
    ? levels[Math.floor(relativePosition * levels.length) + 2] || 0
    : 0;
};

/** on track start */
const onPlay = async () => {
  const index = (await new Promise((resolve) =>
    widget.getCurrentSoundIndex(resolve)
  )) as any;
  track.value = tracks.value[index];
};

/** on track stop */
const onStop = () => {
  level.value = 0;
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
  widget.bind(window.SC.Widget.Events.PAUSE, onError(onStop));
  widget.bind(window.SC.Widget.Events.FINISH, onError(onStop));
};
useScriptTag("https://w.soundcloud.com/player/api.js", onError(onLoad));

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
.placeholder {
  height: 700px;
  background: black;
  animation: pulse 0.5s linear infinite alternate;
}

@keyframes pulse {
  from {
    opacity: 0;
  }
  to {
    opacity: 0.1;
  }
}

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

.top {
  display: flex;
  align-items: center;
  gap: 20px;
}

@media (max-width: 600px) {
  .top {
    flex-direction: column;
  }
}

.art {
  width: 100px;
  max-width: 100%;
  box-shadow: var(--shadow);
}

.info {
  flex-grow: 1;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 10px;
  line-height: 1em;
}

.title {
  font-size: var(--large);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.button {
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
}

.button:hover {
  box-shadow: var(--small-shadow);
  transform: translate(-1px, -1px);
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
  width: 100%;
  height: 60px;
  cursor: pointer;
}

.waveform:not(:focus-visible) {
  outline: none;
}

.tracks {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 20px;
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
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.track-count {
  color: var(--gray);
  width: 50px;
  font-size: var(--tiny);
  text-align: right;
  white-space: nowrap;
  letter-spacing: 1px;
}

.track-icon {
  height: 10px;
  margin-left: 5px;
}
</style>
