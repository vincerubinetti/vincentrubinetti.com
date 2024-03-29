import { sleep } from "@/util/func";

/**
 * special promise wrapper for horrible and buggy soundcloud api callbacks.
 * try calling a function (where result comes from callback argument) multiple
 * times until success criteria met, or until limit of tries exceeded.
 */
type Resolve<T> = (result: T | undefined) => void;
export const promisifySc = <T>(
  func: (resolve: Resolve<T>) => unknown,
  success: (result: T) => boolean = () => true,
  cancel: () => boolean = () => false,
  tries = 100,
  interval = 50
): Promise<T> =>
  new Promise(async (resolve, reject) => {
    for (let _try = 0; _try < tries; _try++) {
      if (cancel()) {
        reject("canceled");
        return;
      }
      console.info("Try", _try + 1);
      const result = await new Promise((resolve: Resolve<T>) => {
        func(resolve);
        window.setTimeout(() => resolve(undefined), interval);
      });
      if (result !== undefined && success(result)) {
        resolve(result);
        return;
      }
      await sleep(interval);
    }
    reject("Ran out of tries");
  });
