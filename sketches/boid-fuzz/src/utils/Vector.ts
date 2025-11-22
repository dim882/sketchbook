export interface IPointTuple extends Array<number> {
  0: number;
  1: number;
  length: 2;
}

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

// Vector-vector operations
export const multiplyVectors = (v1: IVector, v2: IVector): IVector => create(v1.x * v2.x, v1.y * v2.y);
export const divideVectors = (v1: IVector, v2: IVector): IVector => create(v1.x / v2.x, v1.y / v2.y);

// Mutation versions
export const addInto = (v1: IVector, v2: IVector): IVector => {
  v1.x += v2.x;
  v1.y += v2.y;
  return v1;
};

export const subtractInto = (v1: IVector, v2: IVector): IVector => {
  v1.x -= v2.x;
  v1.y -= v2.y;
  return v1;
};

export const multiplyInto = (v: IVector, scalar: number): IVector => {
  v.x *= scalar;
  v.y *= scalar;
  return v;
};

export const divideInto = (v: IVector, scalar: number): IVector => {
  v.x /= scalar;
  v.y /= scalar;
  return v;
};

export const multiplyVectorsInto = (v1: IVector, v2: IVector): IVector => {
  v1.x *= v2.x;
  v1.y *= v2.y;
  return v1;
};

export const divideVectorsInto = (v1: IVector, v2: IVector): IVector => {
  v1.x /= v2.x;
  v1.y /= v2.y;
  return v1;
};

export const equals = (v1: IVector, v2: IVector): boolean => v1.x === v2.x && v1.y === v2.y && v1.z === v2.z;

export const magnitude = (v: IVector): number => Math.sqrt(v.x * v.x + v.y * v.y);

export const normalize = (v: IVector): IVector => {
  const mag = magnitude(v);
  return mag > 0 ? divide(v, mag) : create(0, 0);
};

export const normalizeInto = (v: IVector): IVector => {
  const mag = magnitude(v);
  if (mag > 0) {
    v.x /= mag;
    v.y /= mag;
  } else {
    v.x = 0;
    v.y = 0;
  }
  return v;
};

export const getMagnitudeSquared = (v: IVector): number => v.x * v.x + v.y * v.y + (v.z ? v.z * v.z : 0);

export const setMagnitude = (v: IVector, magnitude: number): IVector => multiply(normalize(v), magnitude);

export const setMagnitudeInto = (v: IVector, targetMagnitude: number): IVector => {
  const mag = magnitude(v);
  if (mag > 0) {
    const scale = targetMagnitude / mag;
    v.x *= scale;
    v.y *= scale;
  } else {
    v.x = 0;
    v.y = 0;
  }
  return v;
};

export const getMagnitude = (v: IVector): number => Math.sqrt(getMagnitudeSquared(v));

export const limit = (v: IVector, max: number): IVector => {
  const mag = magnitude(v);
  if (mag > max) {
    return multiply(normalize(v), max);
  }
  return v;
};

export const limitInto = (v: IVector, max: number): IVector => {
  const mag = magnitude(v);
  if (mag > max) {
    const scale = max / mag;
    v.x *= scale;
    v.y *= scale;
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
