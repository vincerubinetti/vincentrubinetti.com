<template>
  <iframe
    ref="iframe"
    class="iframe"
    :src="`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/${playlist}&amp;amp;color=ff5500&amp;amp;auto_play=false&amp;amp;hide_related=true&amp;amp;show_comments=true&amp;amp;show_user=true&amp;amp;show_reposts=false`"
    allow="autoplay"
    frameborder="no"
    loading="lazy"
    :style="
      error
        ? {}
        : {
            position: 'fixed',
            top: 0,
            opacity: 0,
            visibility: 'hidden',
            pointerEvents: 'none',
          }
    "
  />

  <div v-if="!error" id="listen-player" class="player">
    <div class="current" :data-loading="loading">
      <div class="art">
        <img :src="track?.art || placeholder" alt="" loading="lazy" />
        <img :src="track?.art || placeholder" alt="album art" loading="lazy" />
      </div>

      <div class="info">
        <div class="title">
          {{ track?.title }}
        </div>

        <div v-appear class="counts">
          <AppCount
            v-if="track?.bandcamp"
            :to="track?.bandcamp"
            :icon="DownloadIcon"
            v-tippy="'High quality download on Bandcamp'"
          />
          <AppCount
            v-if="track?.description"
            :icon="StickyIcon"
            tabindex="0"
            v-tippy="linkify(track?.description)"
          />
          <AppCount
            v-if="track?.date"
            :icon="DateIcon"
            :count="track?.date"
            v-tippy="'Date when song was finished'"
            tabindex="0"
          />
          <AppCount
            v-if="track?.plays"
            :icon="PlayIcon"
            :count="track?.plays"
            :to="track?.url"
            v-tippy="'Plays on SoundCloud'"
          />
          <AppCount
            v-if="track?.likes"
            :icon="LikeIcon"
            :count="track?.likes"
            :to="track?.url"
            v-tippy="'Likes on SoundCloud'"
          />
          <AppCount
            v-if="track?.downloads"
            :icon="DownloadIcon"
            :count="track?.downloads"
            :to="track?.url"
            v-tippy="'Downloads on SoundCloud'"
          />
          <AppCount
            v-if="track?.comments"
            :icon="CommentIcon"
            :count="track?.comments"
            :to="track?.url"
            v-tippy="'Comments on SoundCloud'"
          />
          <AppCount
            v-if="track?.reposts"
            :icon="RepostIcon"
            :count="track?.reposts"
            :to="track?.url"
            v-tippy="'Reposts on SoundCloud'"
          />
        </div>
      </div>

      <div class="controls">
        <div v-appear class="controls-row">
          <AppButton
            class="play-control"
            :icon="PreviousIcon"
            :outline="true"
            @click="onClickPrevious"
            aria-label="previous track"
          />
          <AppButton
            class="play-control"
            :icon="playing ? PauseIcon : PlayIcon"
            :outline="true"
            @click="playing ? onClickPause() : onClickPlay()"
            :aria-label="playing ? 'pause' : 'play'"
          />
          <AppButton
            class="play-control"
            :icon="NextIcon"
            :outline="true"
            @click="onClickNext"
            aria-label="next track"
          />
        </div>

        <div v-if="!isIOS" v-appear class="controls-row">
          <AppButton
            class="mute-control button"
            :icon="VolumeIcon"
            @click="muted = !muted"
            :aria-label="muted ? 'unmute' : 'mute'"
          />
          <AppSlider
            :model-value="muted ? 0 : volume"
            @update:model-value="onChangeVolume"
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

    <div :data-loading="loading">
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
          fill="var(--gray)"
          :style="{ transform: 'scaleY(-0.35)' }"
          opacity="0.15"
          :points="track?.waveform"
        />
        <polygon
          :fill="playing ? 'var(--dark-gray)' : 'var(--gray)'"
          opacity="0.15"
          :points="track?.waveform"
          :style="{
            transform: 'scaleY(-0.35)',
            'clip-path': `inset(0 ${percentLeft}% 0 0)`,
          }"
        />
        <polygon fill="var(--gray)" opacity="0.5" :points="track?.waveform" />
        <polygon
          :fill="playing ? 'var(--dark-gray)' : 'var(--gray)'"
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

    <div v-appear class="tracks" :data-loading="loading">
      <AppButton
        v-for="(t, index) in tracks"
        :key="index"
        class="button track"
        @click="onClickTrack(index)"
        :aria-label="`play ${t.title}`"
        :aria-current="t.id === track?.id"
      >
        <img :src="t.art" class="track-art" alt="" loading="lazy" />
        <NoteIcon
          class="track-marker"
          :data-selected="t.id === track?.id"
          :data-playing="playing"
        />
        <span class="track-title">{{ t.title }}</span>
        <span class="track-tags">{{ t.tags.join(" ") }}</span>
        <AppCount :icon="PlayIcon" :count="t.plays" :flip="true" />
      </AppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useEventListener, useScriptTag } from "@vueuse/core";
import { waitForEvent } from "@/util/func";
import { max } from "@/util/math";
import { useOs } from "@/util/composables";
import { playing, level, art } from "@/global/state";
import { promisifySc } from "@/util/soundcloud";
import { formatTime, formatTimeVerbose, linkify } from "@/util/string";
import AppCount from "@/components/AppCount.vue";
import AppSlider from "@/components/AppSlider.vue";
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
import bandcamp from "@/assets/bandcamp.json";
import placeholder from "@/assets/placeholder.jpg";

type Props = {
  /** playlist id */
  playlist: string;
};

const props = defineProps<Props>();

/** detect ios */
const isIOS = useOs(/(iPhone|iPad)/g);

/** objects */
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
  date: string;
  description: string;
  bandcamp: string;
  plays: number;
  likes: number;
  comments: number;
  downloads: number;
  reposts: number;
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
const track = ref<Track>(tracks.value[0]);
const percent = ref(0);
const volume = ref(100);
const muted = ref(false);

/** computed */
const percentLeft = computed(() => 100 * (1 - percent.value));
const position = computed(
  () => (percent.value * (track.value?.length || 0)) / 1000
);
const length = computed(() => (track.value?.length || 0) / 1000);
const VolumeIcon = computed(() => {
  if (muted.value) return VolumeMutedIcon;
  if (volume.value < 25) return VolumeNoneIcon;
  if (volume.value < 50) return VolumeLowIcon;
  if (volume.value < 75) return VolumeMidIcon;
  return VolumeHighIcon;
});

/** latest onReady run */
let latest = Symbol();

/** cache of full track info */
const cache: Record<Props["playlist"], Track[]> = {};

/** soundcloud callback - on widget ready */
/** https://stackoverflow.com/questions/48550585/soundcloud-api-getsounds-only-returns-the-first-5-objects */
const onReady = async () => {
  /** timeout countdown */
  const timeout = window.setTimeout(
    () => onError("Tracks not loaded after a few seconds"),
    3 * 1000
  );

  try {
    /** capture playlist id, which can change partway through func */
    const { playlist = "" } = props;

    /** current onReady run */
    const current = (latest = Symbol());

    /** check if still latest onReady run */
    const isCanceled = () => latest != current;

    /** load new tracks from cache */
    const newTracks: Track[] = cache[playlist] || [];

    /** if no cached track data */
    if (!newTracks.length) {
      /** get number of tracks */
      console.info("Tracks");
      let sounds = await promisifySc<_Track[]>(
        (resolve) => widget.getSounds(resolve),
        (result) => !!result?.length,
        isCanceled
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
          date: sound.description.match(/📅 ?(.*)$/m)?.[1] || "",
          description: (sound.description || "")
            .replace(/📅 ?(.*)$/m, "")
            .split("©")[0]
            .trim()
            .split(/\n{3,}/)
            .join("\n"),
          bandcamp: getBandcamp(sound.title),
          plays: sound.playback_count || 0,
          likes: sound.likes_count || 0,
          comments: sound.comment_count || 0,
          downloads: sound.download_count || 0,
          reposts: sound.reposts_count || 0,
          created:
            new Date(sound.created_at || sound.display_date) || new Date(),
          modified: new Date(sound.last_modified) || new Date(),
          url: sound.permalink_url || "",
          tags: getTags(sound.tag_list + ` "${sound.genre || ""}"`) || "",
        });

        if (isCanceled()) throw Error("canceled");

        /** move to next track */
        widget.next();
        widget.seekTo(0);
        widget.pause();
      }

      /** go back to first track again */
      widget.skip(0);
      widget.seekTo(0);
      widget.pause();

      /** set cache */
      cache[playlist] = newTracks;
    }

    /** finish loading */
    loading.value = false;

    /** set tracks */
    if (newTracks.length) {
      tracks.value = newTracks;
      track.value = newTracks[0];
      console.info("Full tracks", newTracks);
    } else throw Error("No tracks");

    /** wait for getSounds to return something (even if using tracks from cache)
     * because widget not ACTUALLY ready until it does, and binding callbacks
     * directly below (keep co-located) will fail */
    await promisifySc<_Track[]>(
      (resolve) => widget.getSounds(resolve),
      (result) => !!result?.length,
      isCanceled
    );

    /** hook up callback events  */
    widget.bind(window.SC.Widget.Events.PLAY_PROGRESS, onPlayProgress);
    widget.bind(window.SC.Widget.Events.PLAY, onPlay);
    widget.bind(window.SC.Widget.Events.PAUSE, onPause);
    widget.bind(window.SC.Widget.Events.FINISH, onFinish);
    widget.bind(window.SC.Widget.Events.ERROR, onError);

    /** cancel timeout */
    window.clearTimeout(timeout);
  } catch (error) {
    if (
      (error instanceof Error && error.message == "canceled") ||
      (typeof error == "string" && error == "canceled")
    ) {
      console.info("CANCELED");
      /** cancel timeout */
      window.clearTimeout(timeout);
    } else onError(error);
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

/** get associated bandcamp album */
const getBandcamp = (title = "") => {
  type Map = Record<string, string>;
  const album = (bandcamp as Map)[title.toLowerCase()]?.replaceAll(" ", "-");
  return album ? "https://vincerubinetti.bandcamp.com/album/" + album : "";
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
  console.info("Current track");
  const index = await promisifySc<number>(
    (resolve) => widget.getCurrentSoundIndex(resolve),
    (result) => typeof result === "number"
  );
  track.value = tracks.value[index];
  art.value = track.value.art;
  playing.value = true;
  window.dispatchEvent(new Event("stop-youtube"));
};

/** soundcloud callback - on track pause */
const onPause = () => {
  level.value = 0;
  playing.value = false;
};

/** soundcloud callback - on track finish */
const onFinish = () => {
  level.value = 0;
  playing.value = false;
};

/** soundcloud callback - on error */
const onError = (...args: any[]) => {
  console.error(...args);
  error.value = true;
  loading.value = false;
};

/** load soundcloud widget */
const onLoad = async () => {
  try {
    /** timeout countdown */
    const timeout = window.setTimeout(
      () => onError("Widget not ready after a few seconds"),
      3 * 1000
    );

    loading.value = true;

    /** catch misc unlikely errors */
    if (!iframe.value) return;
    if (!window.SC) throw Error("SC not defined");
    widget = window.SC.Widget(iframe.value);
    if (!widget) throw Error("Widget couldn't be hooked up");

    /** wait for widget to be ready */
    widget.bind(window.SC.Widget.Events.READY, () => {
      onReady();
      /** cancel timeout */
      window.clearTimeout(timeout);
    });
  } catch (error) {
    onError(error);
  }
};
/** load soundcloud api script */
useScriptTag("https://w.soundcloud.com/player/api.js", onLoad);

/** when playlist switched */
watch(
  () => props.playlist,
  async () => {
    /** reset state */
    widget?.unbind(window.SC.Widget.Events.PLAY_PROGRESS);
    widget?.unbind(window.SC.Widget.Events.PLAY);
    widget?.unbind(window.SC.Widget.Events.PAUSE);
    widget?.unbind(window.SC.Widget.Events.FINISH);
    widget?.unbind(window.SC.Widget.Events.ERROR);
    loading.value = true;
    error.value = false;
    playing.value = false;
    percent.value = 0;
    level.value = 0;

    /** wait for new iframe src to load */
    await waitForEvent(iframe.value, "load");

    onLoad();
  }
);

/** when user clicks controls */
const onClickPrevious = () => {
  if (position.value < 2) widget.prev();
  percent.value = 0;
  widget.seekTo(0);
  widget.play();
};
const onClickPlay = () => {
  widget.play();
};
const onClickPause = () => {
  widget.pause();
};
const onClickNext = () => {
  percent.value = 0;
  widget.next();
  widget.seekTo(0);
  widget.play();
};
const onChangeVolume = (value: number) => {
  muted.value = false;
  volume.value = value;
};

/** when user clicks waveform */
const onClickWaveform = (event: MouseEvent) => {
  const element = event.target as HTMLElement;
  var { left, width } = element.getBoundingClientRect();
  const percent = (event.clientX - left) / width;
  widget.seekTo(percent * (track.value?.length || 0));
  if (!playing.value) widget.play();
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
  percent.value = 0;
  widget.skip(index);
  widget.seekTo(0);
  track.value = tracks.value[index];
};

/** when volume changes */
watch([volume, muted], () => {
  widget.setVolume(muted.value ? 0 : volume.value);
});

onMounted(() => {
  /** allow global event to stop playback */
  useEventListener(window, "stop-soundcloud", onClickPause);
});
</script>

<style scoped>
[data-loading] {
  transition: filter var(--fast);
}

[data-loading="true"] {
  filter: saturate(0) contrast(0);
  pointer-events: none;
  animation: pulse 0.5s linear infinite alternate;
}

@keyframes pulse {
  from {
    opacity: 0.1;
  }
  to {
    opacity: 0.2;
  }
}

.iframe {
  width: 100%;
  height: 700px;
  border: none;
}

.player {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.current {
  display: flex;
  align-items: center;
  gap: 40px;
}

.art {
  position: relative;
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  align-self: flex-start;
}

.art > * {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.art > *:not(:last-child) {
  filter: blur(10px) saturate(200%);
  opacity: 0.5;
}

.info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  line-height: 1.5em;
}

.title {
  font-size: var(--large);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-decoration: none;
  color: currentColor;
}

.counts {
  display: flex;
  gap: 5px 10px;
  flex-wrap: wrap;
  padding-right: 10px;
  line-height: 1em;
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
  padding: 20px !important;
}

.mute-control {
  width: 30px;
  height: 30px;
  padding: 8px !important;
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
}

.tracks {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-height: 300px;
}

.track {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0;
  padding-right: 10px !important;
}

.track-art {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
}

.track-marker {
  flex-shrink: 0;
  height: 0.01em;
  opacity: 0.5;
  transition-property: height, margin;
  transition: var(--fast);
}

.track-marker[data-selected="true"] {
  height: 0.75em;
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
    color: var(--dark-gray);
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
  .current {
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
