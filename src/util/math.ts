export const sin = (degrees = 0) => Math.sin(degToRad(degrees));
export const cos = (degrees = 0) => Math.cos(degToRad(degrees));
export const degToRad = (degrees = 0) => (2 * Math.PI * degrees) / 360;
