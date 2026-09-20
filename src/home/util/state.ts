import type { Track } from "@/home/components/SoundCloud";
import { ref } from "vue";
import { useIntervalFn } from "@vueuse/core";

/** currently selected track */
export const track = ref<Track>();

/** play state */
export const playing = ref(false);

/** sound level volume */
export const level = ref(0);

/** smoothed sound level volume */
export const smoothedLevel = ref(0);

/** smooth level over time */
useIntervalFn(() => {
  if (level.value > smoothedLevel.value) smoothedLevel.value = level.value;
  else smoothedLevel.value += (level.value - smoothedLevel.value) / 10;
  if (smoothedLevel.value < 0.01) smoothedLevel.value = 0;
}, 20);
