<script setup lang="ts">
import {
  computed,
  ref,
  useTemplateRef,
  watchEffect,
  type UnwrapRef,
} from "vue";
import { useEventListener, useIntervalFn, useScriptTag } from "@vueuse/core";
import ColorThief from "colorthief/dist/color-thief.mjs";
import { clamp, max, range, uniq } from "lodash-es";
import { lerp, smooth } from "@/util/math";
import { generator, waitFor } from "@/util/misc";
import type { AudioData, Events, Sound, Track, Widget } from "./SoundCloud";

type Props = {
  /** playlist id */
  playlist: string;
};

const { playlist } = defineProps<Props>();

defineOptions({ inheritAttrs: false });

/** iframe element */
const iframe = useTemplateRef("iframe");
/** status */
const status = ref<"loading" | "error" | "success">("loading");
/** playlist tracks */
const tracks = ref<Track[]>([]);
/** current track */
const track = ref<Track>({});
/** is playing */
const playing = ref(false);
/** current time in seconds */
const time = ref(0);
/** volume, 0-1 */
const volume = ref(1);
/** sound meter */
const level = ref(0);

/** soundcloud widget */
let widget: Widget;
let events: Events;

type Emit = {
  status: [UnwrapRef<typeof status>];
  tracks: [UnwrapRef<typeof tracks>];
  track: [UnwrapRef<typeof track>];
  playing: [UnwrapRef<typeof playing>];
  time: [UnwrapRef<typeof time>];
  volume: [UnwrapRef<typeof volume>];
  level: [UnwrapRef<typeof level>];
};

const emit = defineEmits<Emit>();

type SlotProps = {
  /** props */
  status: UnwrapRef<typeof status>;
  tracks: UnwrapRef<typeof tracks>;
  track: UnwrapRef<typeof track>;
  playing: UnwrapRef<typeof playing>;
  time: UnwrapRef<typeof time>;
  volume: UnwrapRef<typeof volume>;
  level: UnwrapRef<typeof level>;
  /** methods */
  previous: typeof previous;
  play: typeof play;
  pause: typeof pause;
  next: typeof next;
  seek: typeof seek;
  setTrack: typeof setTrack;
  setVolume: typeof setVolume;
};

type Slots = {
  default: (props: SlotProps) => unknown;
};

defineSlots<Slots>();

/** assemble embed src */
const src = computed(() => {
  const baseUrl = new URL("https://w.soundcloud.com/player");
  const apiUrl = new URL(`https://api.soundcloud.com/playlists/${playlist}`);
  apiUrl.searchParams.set("color", "ff5500");
  apiUrl.searchParams.set("auto_play", "false");
  apiUrl.searchParams.set("hide_related", "true");
  apiUrl.searchParams.set("show_comments", "true");
  apiUrl.searchParams.set("show_user", "true");
  apiUrl.searchParams.set("show_reposts", "false");
  baseUrl.searchParams.set("url", window.encodeURI(apiUrl.toString()));
  return baseUrl.toString();
});

/** soundcloud api script */
const { scriptTag: apiScript } = useScriptTag(
  "https://w.soundcloud.com/player/api.js",
);

const playlistCache: Record<string, Track[]> = {};

/** handle error */
const onError = (error?: unknown) => {
  console.error(error);
  status.value = "error";
};

/** on iframe load */
const onLoad = generator(async function* () {
  /** wait for soundcloud api script to load */
  yield waitFor(() => apiScript.value);

  if (!iframe.value) throw Error("iframe not defined");
  if (!window.SC) throw Error("SC not defined");

  /** create soundcloud widget (iframe embed) */
  widget = window.SC.Widget(iframe.value);
  events = window.SC.Widget.Events;

  if (!widget) throw Error("Widget couldn't be hooked up");

  /** wait for widget to be ready */
  yield new Promise<void>((resolve) => widget.bind(events.READY, resolve));

  status.value = "loading";

  /** load from cache */
  tracks.value = playlistCache[playlist] || [];

  /** if nothing loaded from cache */
  if (!tracks.value.length) {
    /** get number of tracks */
    let count = 0;
    yield waitFor(() => {
      widget.getSounds((sounds) => (count = sounds.length));
      return count;
    });

    /** go through each track and get details */
    for (const index of range(count)) {
      /** get current track */
      let track: Sound = {};
      yield waitFor(() => {
        widget.getCurrentSound((sound) => (track = sound));
        return track.artwork_url;
      });

      /** add track */
      tracks.value.push({
        ...track,
        waveform: await getWaveform(track),
        tags: getTags(track),
        colors: await getColors(track),
      });

      /** move to next track */
      widget.next();

      /** wait for track to actually change */
      let currentIndex = -1;
      yield waitFor(() => {
        widget.getCurrentSoundIndex((index) => (currentIndex = index));
        return currentIndex === index + 1 || index === count - 1;
      });
    }

    playlistCache[playlist] = tracks.value;
  }

  /** go back to first track */
  widget.skip(0);
  widget.pause();

  /** select first track */
  track.value = tracks.value[0];

  /** hook up callback events  */
  widget.bind(events.PLAY_PROGRESS, onPlayProgress);
  widget.bind(events.PLAY, onPlay);
  widget.bind(events.PAUSE, onPause);
  widget.bind(events.FINISH, onFinish);
  widget.bind(events.ERROR, onError);

  status.value = "success";
});

/** get waveform data */
const getWaveform = async (track: Track) => {
  if (!track.waveform_url) return { raw: [], smoothed: [] };
  type Waveform = { width: number; height: number; samples: number[] };
  const { height, samples } = (await (
    await fetch(track.waveform_url)
  ).json()) as Waveform;
  const maximum = max(samples) || height;
  const raw = samples.map((value) => value / maximum);
  const smoothed = [0, ...smooth(raw, 2), 0];
  const toXy = (array: number[]) =>
    array.map((y, i, a) => ({ x: i / a.length, y }));
  return { raw: toXy(raw), smoothed: toXy(smoothed) };
};

/** parse and de-duplicate tags */
const getTags = (track: Track) =>
  uniq(
    ((track.tag_list ?? "").match(/"[^"]*"|\S+/g) ?? [])
      .map((tag) =>
        tag
          .toLowerCase()
          .replaceAll('"', "")
          .replaceAll(" ", "-")
          .replaceAll("-&-", "&")
          .trim(),
      )
      .filter(Boolean),
  );

/** get dominant colors of art */
const getColors = async (track: Track) => {
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.src = track.artwork_url || "";
  await new Promise((resolve) => (img.onload = () => resolve(true)));
  return new ColorThief().getPalette(img, 5, 2) as number[][];
};

/** previous track */
const previous = () => widget.prev();

/** play current track */
const play = () => widget.play();

/** pause current track */
const pause = () => widget.pause();

/** next track */
const next = () => widget.next();

/** seek to time */
const seek = (ms: number) => {
  ms = clamp(ms, 0, track.value?.duration ?? 1);
  widget.seekTo(ms);
  time.value = ms;
};

/** set track by index */
const setTrack = (index: number) => widget.skip(index);

/** set volume */
const setVolume = (value: number) => {
  widget.setVolume(value * 100);
  volume.value = value;
};

/** on play progress */
const onPlayProgress = ({ currentPosition }: AudioData) => {
  time.value = currentPosition;
  /** waveform samples */
  const waveform = track.value?.waveform?.raw || [];
  /** percent through track */
  const percent = time.value / (track.value?.duration ?? 1);
  /** fractional sample index */
  const indexPercent = (percent * waveform.length) % 1;
  /** lower sample index */
  const leftIndex = Math.floor(percent * waveform.length);
  /** upper sample index */
  const rightIndex = Math.ceil(percent * waveform.length);
  /** lower sample level */
  const leftSample = waveform[leftIndex]?.y ?? 0;
  /** upper sample level */
  const rightSample = waveform[rightIndex]?.y ?? 0;
  /** interpolated sample level */
  level.value = level.value = lerp(indexPercent, 0, 1, leftSample, rightSample);
  /** if paused, set level to 0 */
  widget.isPaused((paused) => {
    if (paused) level.value = 0;
  });
};

/** on track start */
const onPlay = async () => {
  let currentIndex = -1;
  widget.getCurrentSoundIndex((index) => (currentIndex = index));
  await waitFor(() => currentIndex !== -1);
  track.value = tracks.value[currentIndex];
  /** event triggered on seek when paused too, so check if paused */
  widget.isPaused((paused) => {
    playing.value = !paused;
    if (playing.value) window.dispatchEvent(new Event("soundcloud-play"));
  });
};

/** allow global event to stop playback */
useEventListener(window, "stop-soundcloud", pause);

/** on track pause */
const onPause = () => (playing.value = false);
/** on track finish */
const onFinish = () => (playing.value = false);

/** emit state changes */
watchEffect(() => emit("status", status.value));
watchEffect(() => emit("tracks", tracks.value));
watchEffect(() => emit("track", track.value));
watchEffect(() => emit("playing", playing.value));
watchEffect(() => emit("time", time.value));
watchEffect(() => emit("volume", volume.value));
watchEffect(() => emit("level", level.value));
</script>

<template>
  <iframe
    v-bind="$attrs"
    ref="iframe"
    :src="src"
    allow="autoplay"
    frameborder="no"
    loading="lazy"
    :style="
      status !== 'error' && {
        position: 'fixed',
        top: 0,
        opacity: 0,
        visibility: 'hidden',
        pointerEvents: 'none',
      }
    "
    @load="() => onLoad().catch(onError)"
  />
  <slot
    v-bind="{
      status,
      tracks,
      track,
      playing,
      time,
      volume,
      level,
      previous,
      play,
      pause,
      next,
      seek,
      setTrack,
      setVolume,
    }"
  />
</template>
