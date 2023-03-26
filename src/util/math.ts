export const sin = (degrees = 0) => Math.sin(degToRad(degrees));
export const cos = (degrees = 0) => Math.cos(degToRad(degrees));
export const degToRad = (degrees = 0) => (2 * Math.PI * degrees) / 360;

export interface Point3d {
  x: number;
  y: number;
  z: number;
}
export interface Point2d {
  x: number;
  y: number;
}

export const rotateX = ({ x, y, z }: Point3d, angle = 0): Point3d => ({
  x,
  y: y * cos(angle) - z * sin(angle),
  z: y * sin(angle) + z * cos(angle),
});

export const rotateY = ({ x, y, z }: Point3d, angle = 0): Point3d => ({
  x: x * cos(angle) + z * sin(angle),
  y,
  z: z * cos(angle) - x * sin(angle),
});

export const translate = (
  point: Point3d,
  offset: Point3d,
  scale = 1
): Point3d => ({
  x: point.x + offset.x * scale,
  y: point.y + offset.y * scale,
  z: point.z + offset.z * scale,
});

export const project = (
  point: Point3d,
  xAngle = 0,
  yAngle = 0,
  offsetX = 0,
  offsetY = 0
): Point2d => {
  const offset = { x: offsetX, y: offsetY, z: 0 };
  point = translate(point, offset, -1);
  point = rotateX(point, xAngle);
  point = rotateY(point, yAngle);
  point = translate(point, offset);
  const { x, y } = point;
  return { x, y };
};
