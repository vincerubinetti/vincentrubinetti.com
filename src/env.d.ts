/// <reference types="astro/client" />
/// <reference types="vite-svg-loader" />

declare module "*";
declare interface Window {
  dataLayer: any;
  grecaptcha: any;
}
