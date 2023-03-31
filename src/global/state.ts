import { ref, watch } from "vue";

export const playing = ref(false);
export const level = ref(0);
export const smoothedLevel = ref(0);

/** smooth level */
const smooth = () => {
  if (Math.abs(smoothedLevel.value - level.value) < 0.01)
    smoothedLevel.value = level.value;
  else {
    smoothedLevel.value += (level.value - smoothedLevel.value) / 20;
    window.requestAnimationFrame(smooth);
  }
};
watch(level, smooth);
