import linkifyStr from "linkify-string";

export const formatValue = (value: unknown) => {
  if (typeof value !== "number") return value;
  if (value === undefined || value === null) return "-";
  return value?.toLocaleString(undefined, { notation: "compact" });
};

const shortenUrl = (url: string) => {
  try {
    const { origin, pathname } = new URL(url);
    return origin + pathname;
  } catch (error) {
    return url;
  }
};

export const linkify = (content = "") =>
  linkifyStr(content, { format: shortenUrl, nl2br: true, target: "_blank" });
