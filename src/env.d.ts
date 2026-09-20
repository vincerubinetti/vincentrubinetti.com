declare module "vite-plugin-transform";

/** https://github.com/JonasKruckenberg/imagetools/issues/160 */
declare module "*url&format=webp" {
  const value: string;
  export default value;
}
