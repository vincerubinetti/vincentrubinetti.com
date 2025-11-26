export const formatValue = (value: unknown) => {
  if (typeof value !== "number") return value;
  if (value === undefined || value === null) return "-";
  return value?.toLocaleString(undefined, { notation: "compact" });
};
