import { fromPairs, toPairs } from "lodash-es";

/** import */
export default fromPairs(
  toPairs(
    import.meta.glob<{ default: string }>("./*.jpg", {
      eager: true,
      query: "url&w=800&format=webp",
    }),
  ).map(([path, { default: _default }]) => {
    const name = path.match(/.*\/(.*)\.jpg/)?.[1];
    return [name!, _default];
  }),
);
