export type IPointTuple = [number, number];

export interface IVector {
  x: number;
  y: number;
  z?: number;
}

export const create = (x: number, y: number, z?: number): IVector => (z === undefined ? { x, y } : { x, y, z });

export const fromRadians = (angle: number) => create(Math.cos(angle), Math.sin(angle));

export const add = (v1: IVector, v2: IVector): IVector => create(v1.x + v2.x, v1.y + v2.y);

export const subtract = (v1: IVector, v2: IVector): IVector => create(v1.x - v2.x, v1.y - v2.y);

export const multiply = (v: IVector, scalar: number): IVector => create(v.x * scalar, v.y * scalar);

export const divide = (v: IVector, scalar: number): IVector => create(v.x / scalar, v.y / scalar);

export const equals = (v1: IVector, v2: IVector): boolean => v1.x === v2.x && v1.y === v2.y && v1.z === v2.z;

export const magnitude = (v: IVector): number => Math.sqrt(v.x * v.x + v.y * v.y);

export const normalize = (v: IVector): IVector => {
  const mag = magnitude(v);
  return mag > 0 ? divide(v, mag) : create(0, 0);
};

export const getMagnitudeSquared = (v: IVector): number => v.x * v.x + v.y * v.y + (v.z ? v.z * v.z : 0);

export const setMagnitude = (v: IVector, magnitude: number): IVector => multiply(normalize(v), magnitude);

export const getMagnitude = (v: IVector): number => Math.sqrt(getMagnitudeSquared(v));

export const limit = (v: IVector, max: number): IVector => {
  const mag = magnitude(v);
  if (mag > max) {
    return multiply(normalize(v), max);
  }
  return v;
};

export const length = (v: IVector): number => Math.sqrt(dot(v, v));

export const dot = (v1: IVector, v2: IVector): number =>
  v1.x * v2.x + v1.y * v2.y + (v1.z ? (v2.z !== undefined ? v1.z * v2.z : 0) : 0);

export const distance = (v1: IVector, v2: IVector): number => magnitude(subtract(v1, v2));

// Is this correct?
export const toArray = (v: IVector): number[] => [v.x, v.y, v.z ?? 0];

export const clone = (v: IVector): IVector => create(v.x, v.y, v.z);

export const toAngle = (v: IVector): number => Math.atan2(v.y, v.x);

export const copy = (v: IVector): IVector => clone(v);

export const fromAngle = (angleRadians: number, length = 1): IVector => {
  const x = length * Math.cos(angleRadians);
  const y = length * Math.sin(angleRadians);
  const z = 0;

  return { x, y, z };
};

export const fromTuple = ([x, y]: IPointTuple): IVector => create(x, y);

export const toTuple = (v: IVector): IPointTuple => [v.x, v.y];
