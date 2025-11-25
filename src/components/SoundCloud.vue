<template>
  <iframe
    v-bind="$attrs"
    ref="iframe"
    :src="`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/${playlist}&amp;amp;color=ff5500&amp;amp;auto_play=false&amp;amp;hide_related=true&amp;amp;show_comments=true&amp;amp;show_user=true&amp;amp;show_reposts=false`"
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
import { ref, useTemplateRef, type UnwrapRef } from "vue";
import { useScriptTag } from "@vueuse/core";
import { generator, waitFor } from "@/util/misc";
import { awaitEvent, type Events, type Widget } from "./SoundCloud";

type Props = {
  /** playlist id */
  playlist: string;
};

defineProps<Props>();

defineOptions({ inheritAttrs: false });

export type Track = {
  title: string;
  image: string;
};

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
let widget: Widget | undefined;

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

/** soundcloud api script */
const { scriptTag: apiScript } = useScriptTag(
  "https://w.soundcloud.com/player/api.js",
);

const onLoad = generator(
  async function* () {
    try {
      /** reset */
      status.value = "loading";
      widget = undefined;

      /** wait for soundcloud api script to load */
      yield waitFor(() => (apiScript.value ? true : undefined));

      if (!iframe.value) throw Error("Iframe not defined");
      if (!window.SC) throw Error("SC not defined");

      /** create soundcloud widget (iframe embed) */
      widget = window.SC.Widget(iframe.value);

      if (!widget) throw Error("Widget couldn't be hooked up");

      /** wait for widget to be ready */
      yield awaitEvent(widget, "READY");

      /** get playlist track count */
      let count = 0;
      widget.getSounds((sounds) => (count = sounds.length));
      yield waitFor(() => (count > 0 ? count : undefined));

      status.value = "success";
    } catch (error) {
      console.error((error as Error).message);
      status.value = "error";
    }
  },
  (error) => {
    console.error(error);
    status.value = "error";
  },
);
</script>
