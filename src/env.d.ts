/// <reference types="astro/client" />
/// <reference types="vite-svg-loader" />

declare module "vite-plugin-transform";

// eslint-disable-next-line
declare interface Window {
  // eslint-disable-next-line
  grecaptcha: any;
}

/** https://github.com/JonasKruckenberg/imagetools/issues/160 */
declare module "*url&format=webp" {
  const value: string;
  export default value;
}
