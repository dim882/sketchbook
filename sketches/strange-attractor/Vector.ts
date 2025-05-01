import { type IPoint } from './types';

export const create = (x: number, y: number, z?: number): IPoint => (z === undefined ? { x, y, z: 0 } : { x, y, z });

export const add = (v1: IPoint, v2: IPoint): IPoint => ({
  x: v1.x + v2.x,
  y: v1.y + v2.y,
  z: v1.z + v2.z,
});

export const multiply = (v: IPoint, scalar: number): IPoint => ({
  x: v.x * scalar,
  y: v.y * scalar,
  z: v.z * scalar,
});

export const subtract = (v1: IPoint, v2: IPoint): IPoint => ({
  x: v1.x - v2.x,
  y: v1.y - v2.y,
  z: v1.z - v2.z,
});

export const magnitude = (v: IPoint): number => Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);

export const normalize = (v: IPoint): IPoint => {
  const mag = magnitude(v);

  if (mag === 0) {
    return { x: 0, y: 0, z: 0 };
  }

  return {
    x: v.x / mag,
    y: v.y / mag,
    z: v.z / mag,
  };
};
