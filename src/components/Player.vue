<template>
  <iframe
    ref="iframe"
    class="iframe"
    :src="`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/${id}&amp;amp;color=ff5500&amp;amp;auto_play=false&amp;amp;hide_related=true&amp;amp;show_comments=true&amp;amp;show_user=true&amp;amp;show_reposts=false`"
    title="Music player"
    allow="autoplay"
    frameborder="no"
    loading="lazy"
    :style="
      error
        ? {}
        : {
            position: 'fixed',
            opacity: 0,
            visibility: 'hidden',
            pointerEvents: 'none',
          }
    "
  ></iframe>

  <div v-if="!error && loading" class="placeholder"></div>

  <div v-if="!error && !loading" class="player">
    <div class="top">
      <div class="art">
        <img :src="track?.art" />
        <img :src="track?.art" />
      </div>

      <div class="info">
        <div class="title">
          {{ track?.title }}
        </div>

        <div class="counts">
          <Count
            v-if="track?.date"
            :count="track?.date"
            :to="track?.url"
            title="Date when song was finished"
            :aria-label="`song was finished ${track?.date}`"
          >
            <DateIcon />
          </Count>
          <Count
            v-if="track?.description"
            count="Notes"
            tabindex="0"
            v-tippy="linkify(track?.description)"
          >
            <StickyIcon />
          </Count>
          <Count
            v-if="track?.plays"
            :count="track?.plays"
            :to="track?.url"
            title="Number of plays on SoundCloud"
            :aria-label="`${track?.plays} plays on SoundCloud`"
          >
            <PlayIcon />
          </Count>
          <Count
            v-if="track?.likes"
            :count="track?.likes"
            :to="track?.url"
            title="Number of likes on SoundCloud"
            :aria-label="`${track?.likes} likes on SoundCloud`"
          >
            <LikeIcon />
          </Count>
          <Count
            v-if="track?.downloads"
            :count="track?.downloads"
            :to="track?.url"
            title="Number of downloads on SoundCloud"
            :aria-label="`${track?.downloads} downloads on SoundCloud`"
          >
            <DownloadIcon />
          </Count>
          <Count
            v-if="track?.comments"
            :count="track?.comments"
            :to="track?.url"
            title="Number of comments on SoundCloud"
            :aria-label="`${track?.comments} comments on SoundCloud`"
          >
            <CommentIcon />
          </Count>
          <Count
            v-if="track?.reposts"
            :count="track?.reposts"
            :to="track?.url"
            title="Number of reposts on SoundCloud"
            :aria-label="`${track?.reposts} reposts on SoundCloud`"
          >
            <RepostIcon />
          </Count>
        </div>
      </div>

      <div class="controls">
        <div class="controls-row">
          <button
            class="button button-fancy play-control"
            @click="onClickPrevious"
            aria-label="previous track"
          >
            <PreviousIcon />
          </button>
          <button
            class="button button-fancy play-control"
            @click="playing ? onClickPause() : onClickPlay()"
            :aria-label="playing ? 'pause' : 'play'"
          >
            <PauseIcon v-if="playing" />
            <PlayIcon v-else />
          </button>
          <button
            class="button button-fancy play-control"
            @click="onClickNext"
            aria-label="next track"
          >
            <NextIcon class="icon" />
          </button>
        </div>

        <div class="controls-row">
          <button
            class="mute-control"
            @click="muted = !muted"
            :aria-label="muted ? 'unmute' : 'mute'"
          >
            <VolumeMutedIcon v-if="muted" />
            <VolumeNoneIcon v-else-if="volume < 25" />
            <VolumeLowIcon v-else-if="volume < 50" />
            <VolumeMidIcon v-else-if="volume < 75" />
            <VolumeHighIcon v-else />
          </button>
          <Slider
            v-model="volume"
            min="0"
            max="100"
            step="1"
            aria-label="volume"
            :style="{
              filter: `saturate(${muted ? 0 : volume}%)`,
            }"
          />
        </div>
      </div>
    </div>

    <div>
      <svg
        viewBox="0 -10 100 10"
        class="waveform"
        preserveAspectRatio="none"
        @click="onClickWaveform"
        @keydown="onKeyWaveform"
        tabindex="0"
        :aria-label="formatTimeVerbose(position)"
      >
        <polygon
          fill="#808080"
          :style="{ transform: 'scaleY(-0.35)' }"
          opacity="0.15"
          :points="track?.waveform"
        />
        <polygon
          :fill="playing ? 'var(--dark)' : '#808080'"
          opacity="0.15"
          :points="track?.waveform"
          :style="{
            transform: 'scaleY(-0.35)',
            'clip-path': `inset(0 ${percentLeft}% 0 0)`,
          }"
        />
        <polygon fill="#808080" opacity="0.5" :points="track?.waveform" />
        <polygon
          :fill="playing ? 'var(--dark)' : '#808080'"
          :points="track?.waveform"
          :style="{
            'clip-path': `inset(0 ${percentLeft}% 0 0)`,
          }"
        />
      </svg>

      <div class="times">
        <span>
          {{ formatTime(position) }}
        </span>
        <span>
          {{ formatTime(length) }}
        </span>
      </div>
    </div>

    <div class="tracks">
      <button
        v-for="(t, index) in tracks"
        :key="index"
        class="button track"
        @click="onClickTrack(index)"
        :aria-label="`play ${t.title}`"
        :aria-current="t.id === track?.id"
      >
        <img :src="t.art" class="track-art" />
        <NoteIcon
          class="track-marker"
          :data-selected="t.id === track?.id"
          :data-playing="playing"
        />
        <span class="track-title">{{ t.title }}</span>
        <span class="track-tags">{{ t.tags.join(" ") }}</span>
        <Count :count="t.plays" :flip="true">
          <PlayIcon />
        </Count>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useScriptTag } from "@vueuse/core";
import { waitForEvent } from "@/util/func";
import { max } from "@/util/math";
import { playing, level } from "@/global/state";
import { promisifySc } from "@/util/soundcloud";
import { formatTime, formatTimeVerbose, linkify } from "@/util/string";
import Count from "@/components/Count.vue";
import PreviousIcon from "@/assets/previous.svg?component";
import PlayIcon from "@/assets/play.svg?component";
import PauseIcon from "@/assets/pause.svg?component";
import NextIcon from "@/assets/next.svg?component";
import DateIcon from "@/assets/date.svg?component";
import StickyIcon from "@/assets/sticky.svg?component";
import VolumeHighIcon from "@/assets/volume-high.svg?component";
import VolumeMidIcon from "@/assets/volume-mid.svg?component";
import VolumeNoneIcon from "@/assets/volume-none.svg?component";
import VolumeLowIcon from "@/assets/volume-low.svg?component";
import VolumeMutedIcon from "@/assets/volume-muted.svg?component";
import LikeIcon from "@/assets/heart.svg?component";
import DownloadIcon from "@/assets/download.svg?component";
import CommentIcon from "@/assets/comment.svg?component";
import RepostIcon from "@/assets/repost.svg?component";
import NoteIcon from "@/assets/note.svg?component";
import Slider from "@/components/Slider.vue";

type Props = {
  /** playlist id */
  id: string;
};

const props = defineProps<Props>();

const iframe = ref<HTMLIFrameElement>();
let widget: any;

/** track info */
type _Track = Record<string, any>;
type Track = {
  id: number;
  length: number;
  waveform: string;
  levels: number[];
  art: string;
  title: string;
  description: string;
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

/** state */
const loading = ref(true);
const error = ref(false);
const track = ref<Track>();
const percent = ref(0);
const volume = ref(100);
const muted = ref(false);

/** computed */
const percentLeft = computed(() => 100 * (1 - percent.value));
const position = computed(
  () => (percent.value * (track.value?.length || 0)) / 1000
);
const length = computed(() => (track.value?.length || 0) / 1000);

/** cache of full track info */
const cache: Record<Props["id"], Track[]> = {};

/** soundcloud callback - on widget ready */
const onReady = async () => {
  const { id = "" } = props;

  try {
    /** load new tracks from cache */
    const newTracks: Track[] = cache[id] || [];

    if (!newTracks.length) {
      /** get number of tracks */
      console.info("Tracks");
      let sounds = await promisifySc<_Track[]>(
        (resolve) => widget.getSounds(resolve),
        (result) => !!result?.length
      );

      /** fill-in missing track information */
      for (const number of Object.keys(sounds)) {
        console.info("Track number", number);
        /** get full details of one track at a time */
        const sound = await promisifySc<_Track>(
          (resolve) => widget.getCurrentSound(resolve),
          /** check if full info has loaded for current sound yet */
          (result) => result.artwork_url
        );

        /** record full info and transform into desired format */
        newTracks.push({
          id: sound.id || 0,
          length: Math.max(sound.duration || 0, sound.full_duration || 0),
          ...(await getWaveform(sound.waveform_url || "")),
          art: (await getArt(sound.artwork_url)) || "",
          title: sound.title || "",
          description: (sound.description || "")
            .replace(/📅 ?(.*)$/m, "")
            .split("©")[0]
            .trim()
            .split(/\n{3,}/)
            .join("\n"),
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
          tags: getTags(sound.tag_list + ` "${sound.genre || ""}"`) || "",
        });

        /** move to next track */
        widget.next();
        widget.pause();
      }

      /** go back to first track again */
      widget.skip(0);
      widget.seekTo(0);
      widget.pause();

      /** set cache */
      cache[id] = newTracks;
    }

    /** reset state */
    percent.value = 0;
    playing.value = false;
    loading.value = false;

    /** set tracks */
    if (newTracks.length) {
      tracks.value = newTracks;
      track.value = newTracks[0];
      console.info("Resulting full tracks info", newTracks);
    } else throw Error("No tracks");

    /** after widget ACTUALLY ready, when getSounds returns something... */
    await promisifySc<_Track[]>(
      (resolve) => widget.getSounds(resolve),
      (result) => !!result?.length
    );

    /** hook up callback events  */
    widget.bind(window.SC.Widget.Events.PLAY_PROGRESS, onPlayProgress);
    widget.bind(window.SC.Widget.Events.PLAY, onPlay);
    widget.bind(window.SC.Widget.Events.PAUSE, onStop);
    widget.bind(window.SC.Widget.Events.FINISH, onStop);
    widget.bind(window.SC.Widget.Events.ERROR, onError);
  } catch (error) {
    onError(error);
  }
};

/** transform soundcloud waveform json url into svg path */
const getWaveform = async (url = "") => {
  try {
    let samples = ((await (await fetch(url)).json()).samples || []) as number[];
    samples = [0].concat(samples).concat([0]);
    const height = max(samples);
    const levels: number[] = [];
    let waveform = samples
      .map((sample, index) => {
        const percent = index / samples.length;
        const level = Math.pow(sample / height, 3);
        levels.push(level);
        const x = 100 * percent;
        const y = 10 * level;
        return { x, y };
      })
      .map(({ x, y }) => x.toFixed(2) + "," + -y.toFixed(2))
      .join(" ");
    return { waveform, levels };
  } catch (error) {
    console.error("Couldn't get waveform");
    return { waveform: "", levels: [0] };
  }
};

/** pick soundcloud art url */
const getArt = async (url = "") => {
  const bigurl = url.replace("large", "t500x500");
  try {
    await fetch(bigurl);
    return bigurl;
  } catch (error) {
    console.error("Couldn't get art", bigurl);
  }
  try {
    await fetch(url);
    return url;
  } catch (error) {
    console.error("Couldn't get art", url);
    return "";
  }
};

/** parse and de-duplicate tags */
const getTags = (string = "") =>
  Array.from(
    new Set(
      (string.match(/"[^"]*"|\S+/g) || [])
        .map((tag) =>
          tag
            .toLowerCase()
            .replaceAll('"', "")
            .replaceAll(" ", "-")
            .replaceAll("-&-", "&")
            .trim()
        )
        .filter(Boolean)
        .map((tag) => "#" + tag)
    )
  );

/** soundcloud callback - on play progress */
const onPlayProgress = ({ relativePosition }: { relativePosition: number }) => {
  percent.value = relativePosition;
  const levels = track.value?.levels || [];
  level.value = playing.value
    ? levels[Math.floor(relativePosition * levels.length) + 2] || 0
    : 0;
};

/** soundcloud callback - on track start */
const onPlay = async () => {
  const index = (await new Promise((resolve) =>
    widget.getCurrentSoundIndex(resolve)
  )) as any;
  track.value = tracks.value[index];
};

/** soundcloud callback - on track stop */
const onStop = () => {
  level.value = 0;
};

/** soundcloud callback - on error */
const onError = (...args: any[]) => {
  console.error(...args);
  error.value = true;
  loading.value = false;
};

/** when soundcloud api script loaded */
const onLoadScript = async () => {
  try {
    /** load widget */
    loading.value = true;
    if (!iframe.value) return;
    if (!window.SC) throw Error("SC not defined");
    widget = window.SC.Widget(iframe.value);
    if (!widget) throw Error("Widget couldn't be hooked up");
    widget.bind(window.SC.Widget.Events.READY, onReady);
  } catch (error) {
    onError(error);
  }
};
/** load soundcloud api script */
useScriptTag("https://w.soundcloud.com/player/api.js", onLoadScript);

/** switch playlist */
watch(
  () => props.id,
  async () => {
    loading.value = true;
    await waitForEvent(iframe.value, "load");
    onLoadScript();
  }
);

/** when user clicks controls */
const onClickPrevious = () => {
  widget.prev();
  widget.seekTo(0);
  widget.play();
  percent.value = 0;
  playing.value = true;
};
const onClickPlay = () => {
  widget.play();
  playing.value = true;
};
const onClickPause = () => {
  widget.pause();
  playing.value = false;
};
const onClickNext = () => {
  widget.next();
  widget.seekTo(0);
  widget.play();
  percent.value = 0;
  playing.value = true;
};

/** when user clicks waveform */
const onClickWaveform = (event: MouseEvent) => {
  const element = event.target as HTMLElement;
  var { left, width } = element.getBoundingClientRect();
  const percent = (event.clientX - left) / width;
  widget.seekTo(percent * (track.value?.length || 0));
  widget.play();
  playing.value = true;
};

/** when user presses key on waveform */
const onKeyWaveform = (event: KeyboardEvent) => {
  const key = event.key;
  if (key === " ") {
    event.preventDefault();
    playing.value ? onClickPause() : onClickPlay();
  }
  if (key === "ArrowLeft") {
    event.preventDefault();
    widget.seekTo((position.value - 5) * 1000);
  }
  if (key === "ArrowRight") {
    event.preventDefault();
    widget.seekTo((position.value + 5) * 1000);
  }
};

/** when user selects track */
const onClickTrack = (index: number) => {
  widget.skip(index);
  widget.seekTo(0);
  track.value = tracks.value[index];
  percent.value = 0;
  playing.value = true;
};

/** when volume changes */
watch([volume, muted], () => widget.setVolume(muted.value ? 0 : volume.value));
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

.iframe {
  width: 100%;
  height: 700px;
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
  gap: 40px;
}

.art {
  position: relative;
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  box-shadow: var(--shadow);
  align-self: flex-start;
}

.art > * {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.art > *:not(:last-child) {
  filter: blur(20px) saturate(200%);
  opacity: 0.5;
  z-index: -1;
}

.info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  line-height: 1.4em;
}

.title {
  font-size: var(--large);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.counts {
  display: flex;
  gap: 5px 20px;
  flex-wrap: wrap;
  padding-right: 10px;
}

.controls {
  display: flex;
  justify-content: center;
  align-items: stretch;
  flex-direction: column;
  gap: 10px;
}

.controls-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.controls-row:last-child {
  gap: 0;
  position: relative;
  left: 5px;
}

.controls-row:last-child input {
  max-width: 145px;
}

.play-control {
  width: 60px;
  height: 60px;
  padding: 22.5px;
}

.mute-control {
  width: 30px;
  height: 30px;
  padding: 5px;
}

.waveform {
  width: 100%;
  height: 60px;
  overflow: visible;
  cursor: pointer;
}

.waveform:not(:focus-visible) {
  outline: none;
}

.waveform * {
  transition: fill var(--fast);
}

.times {
  display: flex;
  justify-content: space-between;
  font-size: var(--tiny);
  line-height: 1em;
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
  padding: 0;
  padding-right: 10px;
}

.track-art {
  width: 40px;
  height: 40px;
}

.track-marker {
  width: 0;
  opacity: 0.5;
  transition-property: width, margin;
  transition: var(--fast);
}

.track-marker[data-selected="true"] {
  width: 15px;
  margin: 0 5px 0 10px;
}

.track-marker[data-selected="true"][data-playing="true"] {
  animation: beat 3s ease-in-out infinite;
}

@keyframes beat {
  0%,
  33%,
  66%,
  100% {
    opacity: 0.5;
    color: black;
    transform: scale(1);
  }
  16.5%,
  49.5%,
  82.5% {
    opacity: 1;
    transform: scale(1.1);
  }
  16.5% {
    color: var(--primary);
  }
  49.5% {
    color: var(--secondary);
  }
  82.5% {
    color: var(--tertiary);
  }
}

.track-title {
  text-align: left;
  flex-grow: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.track-tags {
  width: 0;
  font-size: var(--tiny);
  text-align: right;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  opacity: 0;
  transition: opacity var(--fast);
}

.track:where(:hover, :focus) .track-tags {
  width: unset;
  opacity: 0.35;
}

@media (max-width: 600px) {
  .top {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .art {
    align-self: unset;
  }

  .counts {
    justify-content: center;
  }

  .controls {
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>
