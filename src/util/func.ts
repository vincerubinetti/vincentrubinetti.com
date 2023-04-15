export const sleep = (ms = 0) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

/** execute function N times */
export const repeat = (func: Function, n = 1) =>
  Array(n)
    .fill({})
    .forEach(() => func());

/** wait for event to be emitted from element */
export const waitForEvent = (element: Element | undefined, event: string) =>
  new Promise((resolve, reject) => {
    if (!element) return;
    element.addEventListener(event, resolve, { once: true });
    window.setTimeout(() => {
      element.removeEventListener(event, resolve);
      reject(`Event ${event} never occurred`);
    }, 1000);
  });
