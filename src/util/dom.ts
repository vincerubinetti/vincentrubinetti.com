/** get coordinates of click relative to target element */
export const clickCoords = ({
  currentTarget,
  clientX,
  clientY,
}: PointerEvent) => {
  const target = currentTarget as HTMLElement;
  const { left, top, width, height } = target.getBoundingClientRect();
  const style = window.getComputedStyle(target);
  const paddingLeft = parseFloat(style.paddingLeft || "0");
  const paddingTop = parseFloat(style.paddingTop || "0");
  const paddingRight = parseFloat(style.paddingRight || "0");
  const paddingBottom = parseFloat(style.paddingBottom || "0");

  return {
    /* x in px */
    left: clientX - left - paddingLeft,
    /* y in px */
    top: clientY - top - paddingTop,
    /* x in % */
    x: (clientX - left - paddingLeft) / (width - paddingLeft - paddingRight),
    /* y in % */
    y: (clientY - top - paddingTop) / (height - paddingTop - paddingBottom),
  };
};
