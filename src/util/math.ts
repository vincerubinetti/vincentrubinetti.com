import { clamp, range } from "lodash-es";

export const tau = 2 * Math.PI;

export const sin = (degrees: number) => Math.sin((degrees / 360) * tau);
export const cos = (degrees: number) => Math.cos((degrees / 360) * tau);

/** smooth and prune data */
export const smooth = (data: number[], radius: number) =>
  data
    .map((_, x) => {
      // https://www.mathsisfun.com/data/least-squares-regression.html
      let count = 0;
      let sumXY = 0;
      let sumX = 0;
      let sumY = 0;
      let sumXsq = 0;
      const window = range(x - radius, x + radius + 1);
      for (let x of window) {
        x = clamp(x, 0, data.length - 1);
        const y = data[x];
        count++;
        sumXY += x * y;
        sumX += x;
        sumY += y;
        sumXsq += x * x;
      }
      const m = (count * sumXY - sumX * sumY) / (count * sumXsq - sumX * sumX);
      const b = (sumY - m * sumX) / count;
      return m * x + b;
    })
    .filter((_, i) => i % radius === 0);

/** linear interpolate */

/** linear interpolate */
export const lerp = (
  value: number,
  sourceMin: number,
  sourceMax: number,
  targetMin: number,
  targetMax: number,
) =>
  targetMin +
  clamp((value - sourceMin) / (sourceMax - sourceMin || 1), 0, 1) *
    (targetMax - targetMin);
