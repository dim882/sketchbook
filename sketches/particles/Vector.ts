import type { IPointTuple } from './particles.utils';

export interface IVector {
  x: number;
  y: number;
  z?: number;
}

export const createVector = (x: number, y: number, z = 0): IVector => ({ x, y, z });

export const createVectorFromRadians = (angle: number) => createVector(Math.cos(angle), Math.sin(angle));

export const add = (v1: IVector, v2: IVector): IVector => {
  const z = v1.z !== undefined && v2.z !== undefined ? v1.z + v2.z : v1.z;

  const vector = {
    x: v1.x + v2.x,
    y: v1.y + v2.y,
  };

  return z ? { ...vector, z } : vector;
};

export const subtract = (v1: IVector, v2: IVector): IVector => {
  const x = v1.x - v2.x;
  const y = v1.y - v2.y;
  const z = v1.z !== undefined && v2.z !== undefined ? v1.z - v2.z : v1.z;

  return { x, y, z };
};

export const multiply = (v: IVector | number, factor: IVector | number): IVector => {
  if (typeof v === 'number') {
    const x = v * (typeof factor === 'number' ? factor : factor.x);
    const y = v * (typeof factor === 'number' ? factor : factor.y);
    const z = v * (typeof factor === 'number' ? factor : factor.z || 1);

    return { x, y, z };
  }

  const x = v.x * (typeof factor === 'number' ? factor : factor.x);
  const y = v.y * (typeof factor === 'number' ? factor : factor.y);
  const z = v.z ? (typeof factor === 'number' ? factor : factor.z || 1) : v.z;

  return { x, y, z };
};

export const divide = (v: IVector | number, divisor: IVector | number): IVector => {
  if (typeof v === 'number') {
    const x = v / (typeof divisor === 'number' ? divisor : divisor.x);
    const y = v / (typeof divisor === 'number' ? divisor : divisor.y);
    const z = v / (typeof divisor === 'number' ? divisor : divisor.z || 1);

    return { x, y, z };
  }
  const x = v.x / (typeof divisor === 'number' ? divisor : divisor.x);
  const y = v.y / (typeof divisor === 'number' ? divisor : divisor.y);
  const z = v.z ? (typeof divisor === 'number' ? divisor : divisor.z || 1) : v.z;

  return { x, y, z };
};

export const equals = (v1: IVector, v2: IVector): boolean => v1.x === v2.x && v1.y === v2.y && v1.z === v2.z;

export const normalize = (v: IVector): IVector => {
  const length = getMagnitude(v);

  if (length !== 0) {
    return multiply(v, 1 / length);
  }

  return createVector(0, 0, 0);
};

export const getMagnitudeSquared = (v: IVector): number => v.x * v.x + v.y * v.y + (v.z ? v.z * v.z : 0);

export const setMagnitude = (v: IVector, magnitude: number): IVector => multiply(normalize(v), magnitude);

export const getMagnitude = (v: IVector): number => Math.sqrt(getMagnitudeSquared(v));

export const limit = (v: IVector, value: number): IVector => {
  const magnitudeSquared = getMagnitudeSquared(v);

  if (magnitudeSquared > value * value) {
    return multiply(normalize(v), value);
  }

  return v;
};

export const length = (v: IVector): number => Math.sqrt(dot(v, v));

export const dot = (v1: IVector, v2: IVector): number =>
  v1.x * v2.x + v1.y * v2.y + (v1.z ? (v2.z !== undefined ? v1.z * v2.z : 0) : 0);

// Is this correct?
export const toArray = (v: IVector): number[] => [v.x, v.y, v.z ?? 0];

export const clone = (v: IVector): IVector => createVector(v.x, v.y, v.z);

export const toAngle = (v: IVector): number => Math.atan2(v.y, v.x);

export const copy = (v: IVector): IVector => clone(v);

export const fromAngle = (angleRadians: number, length = 1): IVector => {
  const x = length * Math.cos(angleRadians);
  const y = length * Math.sin(angleRadians);
  const z = 0;

  return { x, y, z };
};

export const fromTuple = ([x, y]: IPointTuple): IVector => createVector(x, y);
