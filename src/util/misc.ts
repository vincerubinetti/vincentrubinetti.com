import { uniqueId } from "lodash-es";

export const sleep = (ms = 0) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

/** wait for func to return truthy value */
export const waitFor = async <Type>(func: () => Type) => {
  const waits = [0, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
  for (const wait of waits) {
    const result = await func();
    if (result) return result as Type;
    await sleep(wait);
  }
  throw new Error("waitFor timeout");
};

/** make generator function that auto-cancels previous runs */
export const generator = <Type>(func: () => AsyncGenerator<Type>) => {
  /** track latest run of func */
  let latest: string;
  /** return func that runs generator */
  return async () => {
    /** set this run as latest */
    const current = (latest = uniqueId());
    /** make generator */
    const generator = func();
    /** run generator step by step */
    for await (const _ of generator) {
      /** if this run not latest, abort */
      if (current !== latest) return console.debug("aborted");
    }
  };
};
