import { ComputedRef, onBeforeUnmount, onMounted, ref, watch } from "vue";

/** interval that can speed up or slow down */
export const useInterval = (func: Function, interval: ComputedRef<number>) => {
  const running = ref(false);
  let timeout: number;
  const run = () => {
    running.value = true;
    timeout = window.setTimeout(() => {
      running.value = false;
      func();
      if (interval.value !== Infinity && !document.hidden) run();
    }, interval.value);
  };
  watch(interval, () => {
    if (interval.value !== Infinity && !running.value && !document.hidden)
      run();
  });
  onBeforeUnmount(() => window.clearTimeout(timeout));
};

export const useOs = (regex: RegExp) => {
  const os = ref(false);
  onMounted(() => (os.value = regex.test(window.navigator.userAgent)));
  return os;
};
