import { fromPairs, toPairs } from "lodash-es";

export default fromPairs(
  toPairs(
    import.meta.glob<{ default: string }>("./*.svg", {
      eager: true,
      query: "component",
    }),
  ).map(([path, { default: _default }]) => {
    const name = path.match(/.*\/(.*)\.svg/)?.[1];
    return [name!, _default];
  }),
);
