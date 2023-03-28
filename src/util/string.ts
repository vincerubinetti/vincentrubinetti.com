export const formatCount = (number = 0): string =>
  number.toLocaleString(undefined, { notation: "compact" }).toLowerCase();

export const formatTime = (seconds = 0) =>
  [Math.floor(seconds / 60), Math.floor(seconds % 60)]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
