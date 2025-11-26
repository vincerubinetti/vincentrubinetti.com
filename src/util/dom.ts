/** get coordinates of click relative to target element */
export const clickCoords = ({
  currentTarget,
  clientX,
  clientY,
}: PointerEvent) => {
  const target = currentTarget as HTMLElement;
  const { left, top, width, height } = target.getBoundingClientRect();
  return {
    /* x in px */
    left: clientX - left,
    /* y in px */
    top: clientY - top,
    /* x in % */
    x: (clientX - left) / width,
    /* y in % */
    y: (clientY - top) / height,
  };
};
