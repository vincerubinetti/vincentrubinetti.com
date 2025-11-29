<script lang="ts">
export type Track = Sound & {
  waveform?: {
    raw: { x: number; y: number }[];
    simplified: { x: number; y: number }[];
  };
  tags?: string[];
  colors?: number[][];
};
</script>

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
import { smooth } from "@/util/math";
import { generator, waitFor } from "@/util/misc";
import type { AudioData, Events, Sound, Widget } from "./SoundCloud";

type Props = {
  /** playlist id */
  playlist: string;
};

const { playlist } = defineProps<Props>();

const level = defineModel<number>("level");
const colors = defineModel<number[][]>("colors");

defineOptions({ inheritAttrs: false });

/** iframe element */
const iframe = useTemplateRef("iframe");
/** status */
const status = ref<"loading" | "error" | "success">("loading");
/** playlist tracks */
const tracks = ref<Track[]>([]);
/** current track */
const track = ref<Track>();
/** is playing */
const playing = ref<boolean>(false);
/** volume, 0-1 */
const volume = ref<number>(1);
/** current time in seconds */
const time = ref<number>(0);

/** soundcloud widget */
let widget: Widget;
let events: Events;

type SlotProps = {
  status: UnwrapRef<typeof status>;
  tracks: UnwrapRef<typeof tracks>;
  track: UnwrapRef<typeof track>;
  playing: UnwrapRef<typeof playing>;
  volume: UnwrapRef<typeof volume>;
  time: UnwrapRef<typeof time>;
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
  if (!track.waveform_url) return { raw: [], simplified: [] };
  type Waveform = { width: number; height: number; samples: number[] };
  const { height, samples } = (await (
    await fetch(track.waveform_url)
  ).json()) as Waveform;
  const maximum = max(samples) || height;
  const raw = samples.map((value) => value / maximum);
  const simplified = [0, ...smooth(raw, 2), 0];
  const toXy = (array: number[]) =>
    array.map((y, i, a) => ({ x: i / a.length, y }));
  return { raw: toXy(raw), simplified: toXy(simplified) };
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
  return new ColorThief().getPalette(img, 5, 1) as number[][];
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
const onPlayProgress = ({ currentPosition }: AudioData) =>
  (time.value = currentPosition);

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

/* update level */
useIntervalFn(() => {
  if (!playing.value) return;
  const waveform = track.value?.waveform?.raw || [];
  const percent = time.value / (track.value?.duration ?? 1);
  const sample = Math.floor(percent * waveform.length);
  level.value = waveform[sample]?.y || 0;
}, 20);

/** update colors */
watchEffect(() => (colors.value = track.value?.colors || []));
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
  />
</template>
