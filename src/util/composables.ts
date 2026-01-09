import { computed, ref } from "vue";
import type { MaybeRefOrGetter } from "vue";
import { useElementSize, useEventListener, useWindowSize } from "@vueuse/core";

/** track swipe gesture across element */
export const useSwipe = ({
  target,
  onStart,
  onMove,
  onEnd,
}: {
  target?: MaybeRefOrGetter<HTMLElement | null | undefined>;
  onStart?: () => void;
  onMove?: () => void;
  onEnd?: () => void;
}) => {
  /** starting pointer position */
  const start = ref({ x: 0, y: 0 });
  /** ending pointer position */
  const end = ref({ x: 0, y: 0 });
  /** whether swipe in progress */
  const swiping = ref(false);

  /** size of target element */
  const { width, height } = computed(() =>
    target ? useElementSize(target) : useWindowSize(),
  ).value;

  /** start */
  useEventListener(
    target ?? globalThis,
    "pointerdown",
    (event: PointerEvent) => {
      event.preventDefault();
      swiping.value = true;
      start.value = { x: event.clientX, y: event.clientY };
      end.value = { x: event.clientX, y: event.clientY };
      onStart?.();
    },
  );

  /** progress */
  useEventListener("pointermove", (event: PointerEvent) => {
    event.preventDefault();
    if (!swiping.value) return;
    end.value = { x: event.clientX, y: event.clientY };
    onMove?.();
  });

  /** end */
  useEventListener(["pointerup", "pointercancel"], (event: PointerEvent) => {
    event.preventDefault();
    swiping.value = false;
    start.value = { x: 0, y: 0 };
    end.value = { x: 0, y: 0 };
    onEnd?.();
  });

  /** x position as % of target element */
  const x = computed(() => (end.value.x - start.value.x) / (width.value || 1));
  /** y position as % of target element */
  const y = computed(() => (end.value.y - start.value.y) / (height.value || 1));

  return { x, y, swiping };
};
