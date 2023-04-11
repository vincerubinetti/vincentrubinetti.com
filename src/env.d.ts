/// <reference types="astro/client" />
/// <reference types="vite-svg-loader" />

declare module "*";
declare interface Window {
  SC: any;
  YT: any;
  onYouTubeIframeAPIReady: any;
  widget: any;
  dataLayer: any;
  grecaptcha: any;
}
