import { readFileSync, statSync, writeFileSync } from "fs";
import { join } from "path";
import { subDays } from "date-fns";

/** split array into adjacent pairs */
export const pairs = <Type>(array: Type[]): [Type, Type][] =>
  Array(array.length - 1)
    .fill(null)
    .map((_, index) => [array[index]!, array[index + 1]!]);

type Path = string[];

/** relative path */
export const relative = (...path: Path) => join(__dirname, ...path);

/** read file */
export const read = (...path: Path) =>
  JSON.parse(readFileSync(relative(...path) + ".json", "utf-8"));

/** write file */
export const write = (data: unknown, ...path: Path) =>
  writeFileSync(
    relative(...path) + ".json",
    JSON.stringify(data, null, 2) + "\n",
  );

/** does fresh file exist */
export const exists = (...path: Path) => {
  try {
    const { mtime } = statSync(relative(...path) + ".json");
    if (mtime < subDays(new Date(), 1)) throw Error();
    return true;
  } catch {}
  return false;
};
