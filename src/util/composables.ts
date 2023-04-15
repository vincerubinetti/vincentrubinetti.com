import { clamp } from "@/util/math";
import { useElementBounding } from "@vueuse/core";
import {
  ComputedRef,
  Ref,
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";

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

/** match user agent against regex */
export const useOs = (regex: RegExp) => {
  const os = ref(false);
  onMounted(() => (os.value = regex.test(window.navigator.userAgent)));
  return os;
};

/** get translate for simple parallax */
export const useParallax = (element: Ref, scale = 1) => {
  const { top, height } = useElementBounding(element);

  const percent = computed(() => {
    if (typeof window === "undefined") return 0;
    const percent =
      (window.innerHeight - top.value) / (window.innerHeight + height.value);
    clamp(percent, 0, 1);
    return percent;
  });

  const translate = computed(
    () => 2 * (percent.value - 0.5) * (scale - 1) * 50
  );

  return { percent, scale, translate };
};
