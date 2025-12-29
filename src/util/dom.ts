/** get coordinates of click relative to target element */
export const pointerCoords = ({
  currentTarget,
  clientX,
  clientY,
}: PointerEvent) => {
  const target = currentTarget as HTMLElement;
  const bbox = target.getBoundingClientRect();
  const style = window.getComputedStyle(target);
  const paddingLeft = parseFloat(style.paddingLeft || "0");
  const paddingTop = parseFloat(style.paddingTop || "0");
  const paddingRight = parseFloat(style.paddingRight || "0");
  const paddingBottom = parseFloat(style.paddingBottom || "0");

  return {
    /** x in % of width */
    x:
      (clientX - bbox.left - paddingLeft) /
      (bbox.width - paddingLeft - paddingRight),
    /** y in % of height */
    y:
      (clientY - bbox.top - paddingTop) /
      (bbox.height - paddingTop - paddingBottom),
  };
};

/** finish animations on a given dom element */
export const finishAnimations = (element: Element): void => {
  for (const animation of document.getAnimations())
    if (
      animation.effect instanceof KeyframeEffect &&
      element.contains(animation.effect.target)
    )
      animation.finish();
};
