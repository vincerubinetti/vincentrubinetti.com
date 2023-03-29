export const wait = (ms = 0) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

/** special promise wrapper for finnicky soundcloud api callbacks */
type Resolve = (value: unknown) => void;
export const promisifySc = <T>(func: (resolve: Resolve) => void) =>
  new Promise((resolve, reject) => {
    func(resolve);
    window.setTimeout(reject, 100);
  }) as T;

/** execute function N times */
export const repeat = (func: Function, n = 1) =>
  Array(n)
    .fill({})
    .forEach(() => func());
