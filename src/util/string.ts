import linkifyStr from "linkify-string";

export const formatCount = (number = 0): string =>
  number.toLocaleString(undefined, { notation: "compact" }).toLowerCase();

export const formatTime = (seconds = 0) =>
  [Math.floor(seconds / 60), Math.floor(seconds % 60)]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");

export const formatTimeVerbose = (seconds = 0) =>
  [
    String(Math.floor(seconds / 60)),
    "minutes",
    String(Math.floor(seconds % 60)),
    "seconds",
  ].join(" ");

export const linkify = (content = "") =>
  linkifyStr(content, {
    format: (value) => {
      try {
        const { hostname, pathname, search, hash } = new URL(value);
        return truncate(
          hostname.replace(/^www\./, "") +
            pathname.replace(/\/$/, "") +
            search +
            hash
        );
      } catch (error) {
        return truncate(value);
      }
    },
    nl2br: true,
  });

export const truncate = (string = "", limit = 40) =>
  string.length > limit ? string.substring(0, limit - 3) + "..." : string;
