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
    @load="() => onLoad()"
  />
  <slot
    v-bind="{ status, tracks, track, playing, volume, time, length, waveform }"
  />
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef, type UnwrapRef } from "vue";
import { useScriptTag } from "@vueuse/core";
import { debounce, max, range, uniq } from "lodash-es";
import { generator, waitFor } from "@/util/misc";
import type { Sound, Widget } from "./SoundCloud";

type Props = {
  /** playlist id */
  playlist: string;
};

const { playlist } = defineProps<Props>();

type Track = Sound & {
  waveform?: number[];
  art?: string;
  tags?: string[];
};

/** assemble embed src */

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
/** total length in seconds */
const length = ref<number>();
/** waveform data */
const waveform = ref<number[]>([]);

/** soundcloud widget */
let widget: Widget;

type SlotProps = {
  status: UnwrapRef<typeof status>;
  tracks: UnwrapRef<typeof tracks>;
  track: UnwrapRef<typeof track>;
  playing: UnwrapRef<typeof playing>;
  volume: UnwrapRef<typeof volume>;
  time: UnwrapRef<typeof time>;
  length: UnwrapRef<typeof length>;
  waveform: UnwrapRef<typeof waveform>;
};

type Slots = {
  default: (props: SlotProps) => unknown;
};

defineSlots<Slots>();

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

const onLoad = generator(async function* () {
  try {
    /** wait for soundcloud api script to load */
    yield waitFor(() => apiScript.value);

    if (!iframe.value) throw Error("iframe not defined");
    if (!window.SC) throw Error("SC not defined");

    /** create soundcloud widget (iframe embed) */
    widget = window.SC.Widget(iframe.value);

    if (!widget) throw Error("Widget couldn't be hooked up");

    /** wait for widget to be ready */
    yield new Promise<void>((resolve) => {
      widget.bind(window.SC!.Widget.Events.READY, debounce(resolve, 500));
    });

    /** reset */
    status.value = "loading";
    tracks.value = [];

    /** go through each track and get details */
    for (const index of range(30)) {
      /** get current track */
      let track: Sound = {};
      widget.getCurrentSound((sound) => (track = sound));
      yield waitFor(async () => track.artwork_url);

      /** add track */
      tracks.value.push({
        ...track,
        waveform: await getWaveform(track.waveform_url),
        art: await getArt(track.artwork_url),
        tags: getTags(track.tag_list),
      });

      /** move to next track */
      widget.next();
      widget.seekTo(0);

      /** if index same, we reached end */
      const next = await new Promise(widget.getCurrentSoundIndex.bind(widget));
      if (next === index) break;
    }

    /** go back to first track */
    widget.skip(0);
    widget.pause();

    track.value = tracks.value[0];

    status.value = "success";
  } catch (error) {
    console.error(error);
    status.value = "error";
  }
});

/** get waveform data */
const getWaveform = async (url = "") => {
  if (!url) return [];
  type Waveform = {
    width: number;
    height: number;
    samples: number[];
  };
  const { height, samples } = (await (await fetch(url)).json()) as Waveform;
  const maximum = max(samples) || height;
  return samples.map((value) => value / maximum);
};

/** get art url */
const getArt = async (url = "") => {
  if (!url) return "";
  /** try to get higher res art */
  const bigurl = url.replace("large", "t500x500");
  try {
    await fetch(bigurl);
    return bigurl;
  } catch (error) {}
  return url;
};

/** parse and de-duplicate tags */
const getTags = (string = "") =>
  uniq(
    (string.match(/"[^"]*"|\S+/g) || [])
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
</script>
