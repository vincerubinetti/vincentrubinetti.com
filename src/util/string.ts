import linkifyStr from "linkify-string";
import { micromark } from "micromark";

/** format arbitrary value */
export const formatValue = (value: unknown) => {
  if (typeof value !== "number") return value;
  if (value === undefined || value === null) return "-";
  return value?.toLocaleString(undefined, { notation: "compact" });
};

/** format time in mm:ss */
export const formatTime = (ms: number) => {
  const mins = Math.floor(ms / 1000 / 60);
  const secs = Math.floor((ms / 1000) % 60);
  return [mins, secs]
    .map((part, index) =>
      index === 0 ? part : part.toString().padStart(2, "0"),
    )
    .join(":");
};

/** prune url string */
const shortenUrl = (url: string) => {
  try {
    const { origin, pathname } = new URL(url);
    return origin + pathname;
  } catch (error) {
    return url;
  }
};

/** replace links in plain text with anchors */
export const linkify = (content = "") =>
  linkifyStr(content, { format: shortenUrl, nl2br: true, target: "_blank" });

/** markdown to html */
export const renderMarkdown = (markdown = "") =>
  micromark(markdown).replace("<p>", "").replace("</p>", "");
