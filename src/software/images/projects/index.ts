import { toPairs } from "lodash-es";

/** import */
const imports = toPairs(
  import.meta.glob<{ default: string }>("./*.png", {
    eager: true,
    query: "url&w=800&format=jpeg",
  }),
);

/** group by name */
const files: Record<string, string[]> = {};
for (const [path, { default: _default }] of imports) {
  const name = path.match(/.*\/(.*)-\d+\.png/)?.[1];
  if (!name) continue;
  files[name] ??= [];
  files[name].push(_default);
}

export default files;
