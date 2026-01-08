import { toPairs } from "lodash-es";

const imageImports = toPairs(
  import.meta.glob<{ default: string }>("./*.png", {
    eager: true,
    query: "url&w=1200&format=webp",
  }),
);

const images: Record<string, string[]> = {};
for (const [path, { default: _default }] of imageImports) {
  const name = path.match(/.*\/(.*)-\d+\.png/)?.[1];
  if (!name) continue;
  images[name] ??= [];
  images[name].push(_default);
}

const fileImports = toPairs(
  import.meta.glob<{ default: string }>("./*.*", { eager: true }),
);

const files: Record<string, string> = {};
for (const [path, { default: _default }] of fileImports) {
  const name = path.match(/.*\/(.*)/)?.[1];
  if (!name) continue;
  files[name] = _default;
}

export { images, files };
