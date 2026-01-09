import { computed, ref } from "vue";
import type { MaybeRefOrGetter } from "vue";
import {
  useElementSize,
  useEventListener,
  useRafFn,
  useWindowSize,
} from "@vueuse/core";

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
  /** current pointer position */
  const position = ref({ x: 0, y: 0 });
  /** pointer speed */
  const speed = ref({ x: 0, y: 0 });
  /** swipe state */
  const state = ref<"idle" | "swiping" | "releasing">("idle");

  /** size of target element */
  const { width, height } = computed(() =>
    target ? useElementSize(target) : useWindowSize(),
  ).value;

  /** mouse/touch start */
  useEventListener(
    target ?? globalThis,
    "pointerdown",
    (event: PointerEvent) => {
      event.preventDefault();
      state.value = "swiping";
      start.value = { x: event.clientX, y: event.clientY };
      position.value = start.value;
      speed.value = { x: 0, y: 0 };
      onStart?.();
    },
  );

  /** exponential limit */
  const falloff = (value: number, w = 100, h = 100) =>
    Math.sign(value) * h * (1 - 2 ** (-Math.abs(value) / w));

  /** mouse/touch move */
  useEventListener("pointermove", (event: PointerEvent) => {
    if (state.value !== "swiping") return;
    event.preventDefault();
    position.value = {
      x: event.clientX - start.value.x,
      y: event.clientY - start.value.y,
    };
    speed.value = { x: falloff(event.movementX), y: falloff(event.movementY) };
    onMove?.();
  });

  /** mouse/touch end */
  useEventListener(["pointerup", "pointercancel"], (event: PointerEvent) => {
    if (state.value !== "swiping") return;
    event.preventDefault();
    state.value = "releasing";
  });

  useRafFn(() => {
    if (state.value !== "releasing") return;

    /** if speed is low enough, stop */
    if (Math.abs(speed.value.x) < 1 && Math.abs(speed.value.y) < 1) {
      speed.value = { x: 0, y: 0 };
      state.value = "idle";
      onEnd?.();
      return;
    }

    /** reduce speed (friction) */
    speed.value.x -= Math.sign(speed.value.x);
    speed.value.y -= Math.sign(speed.value.y);

    /** keep moving position */
    position.value.x += speed.value.x;
    position.value.y += speed.value.y;

    onMove?.();
  });

  return {
    /** x position as % of target element */
    x: computed(() => position.value.x / (width.value || 1)),
    /** y position as % of target element */
    y: computed(() => position.value.y / (height.value || 1)),
    state,
  };
};
