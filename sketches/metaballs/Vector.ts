export interface IVector {
  x: number;
  y: number;
  z?: number;
}

export const add = (v1: IVector, v2: IVector): IVector => {
  const z = v1.z !== undefined && v2.z !== undefined ? v1.z + v2.z : v1.z;

  const vector = {
    x: v1.x + v2.x,
    y: v1.y + v2.y,
  };

  return z ? { ...vector, z } : vector;
};

export const fromAngle = (angleRadians: number, length = 1): IVector => {
  const x = length * Math.cos(angleRadians);
  const y = length * Math.sin(angleRadians);
  const z = 0;

  return { x, y, z };
};

export const copy = (v: IVector): IVector => ({ ...v });

export const toTuple = (v: IVector): [number, number] => [v.x, v.y];
