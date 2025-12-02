import { ref } from "vue";
import { useIntervalFn } from "@vueuse/core";
import type { Track } from "@/components/SoundCloud";

/** currently selected track */
export const track = ref<Track>({
  colors: [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ],
});

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
