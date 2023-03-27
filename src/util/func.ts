export const wait = (ms = 0) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));
