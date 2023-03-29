import { ComputedRef, ref, watch } from "vue";

export const useInterval = (func: Function, interval: ComputedRef<number>) => {
  const running = ref(false);
  const run = () => {
    running.value = true;
    window.setTimeout(() => {
      running.value = false;
      func();
      if (interval.value !== Infinity && !document.hidden) run();
    }, interval.value);
  };
  watch(interval, () => {
    if (interval.value !== Infinity && !running.value && !document.hidden)
      run();
  });
};
