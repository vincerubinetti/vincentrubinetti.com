export const sin = (degrees = 0) => Math.sin(degToRad(degrees));
export const cos = (degrees = 0) => Math.cos(degToRad(degrees));

export const degToRad = (degrees = 0) => (2 * Math.PI * degrees) / 360;

export const clamp = (number = 0, min = 0, max = 0) =>
  Math.max(min, Math.min(number, max));

export const rand = (min = 0, max = 1) => min + Math.random() * (max - min);

export const bounce = (position = 0, limit = 0, velocity = 0) => {
  if (position > limit) return -Math.abs(velocity);
  if (position < -limit) return Math.abs(velocity);
  return velocity;
};

export const triangle = (x = 0.5, l = 0, r = 1, b = 1, t = 0) =>
  (b - t) * Math.abs((l + r - 2 * x) / (l - r)) + t;
