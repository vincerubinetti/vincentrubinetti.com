import { ref } from "vue";
import { useIntervalFn } from "@vueuse/core";
import type { Track } from "@/components/SoundCloud";

export const track = ref<Track>({});
export const playing = ref(false);
export const level = ref(0);

export const smoothedLevel = ref(0);

useIntervalFn(() => {
  if (level.value > smoothedLevel.value) smoothedLevel.value = level.value;
  else smoothedLevel.value += (level.value - smoothedLevel.value) / 10;
  if (smoothedLevel.value < 0.01) smoothedLevel.value = 0;
}, 20);
