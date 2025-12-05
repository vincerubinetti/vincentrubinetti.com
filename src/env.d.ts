/// <reference types="astro/client" />
/// <reference types="vite-svg-loader" />

declare module "vite-plugin-transform";

// eslint-disable-next-line
declare interface Window {
  // eslint-disable-next-line
  dataLayer: any;
  // eslint-disable-next-line
  grecaptcha: any;
}
