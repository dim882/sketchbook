export interface IVec {
  x: number;
  y: number;
  [Symbol.dispose](): void;
}

type Inner = IVec; // the actual object we pool

const pool: Inner[] = [];
const take = (): Inner => pool.pop() ?? { x: 0, y: 0, [Symbol.dispose]: dummy };
const give = (v: Inner) => {
  pool.push(v);
};

// replaced after creation so dummy() is not used
function dummy() {}

export function vec(x: number, y: number): IVec {
  const v = take();
  v.x = x;
  v.y = y;

  // attach the real disposer
  v[Symbol.dispose] = () => give(v);

  return v;
}

export function add(a: IVec, b: IVec): IVec {
  return vec(a.x + b.x, a.y + b.y);
}

export function sub(a: IVec, b: IVec): IVec {
  return vec(a.x - b.x, a.y - b.y);
}

export function scale(a: IVec, s: number): IVec {
  return vec(a.x * s, a.y * s);
}

export function multiply(a: IVec, s: number): IVec {
  return vec(a.x * s, a.y * s);
}

export function divide(a: IVec, s: number): IVec {
  return vec(a.x / s, a.y / s);
}

export function multiplyVectors(a: IVec, b: IVec): IVec {
  return vec(a.x * b.x, a.y * b.y);
}

export function divideVectors(a: IVec, b: IVec): IVec {
  return vec(a.x / b.x, a.y / b.y);
}

export function equals(a: IVec, b: IVec): boolean {
  return a.x === b.x && a.y === b.y;
}

export function magnitude(v: IVec): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function magnitudeSquared(v: IVec): number {
  return v.x * v.x + v.y * v.y;
}

export function normalize(v: IVec): IVec {
  const mag = magnitude(v);
  return mag > 0 ? divide(v, mag) : vec(0, 0);
}

export function setMagnitude(v: IVec, magnitude: number): IVec {
  return multiply(normalize(v), magnitude);
}

export function limit(v: IVec, max: number): IVec {
  const mag = magnitude(v);
  if (mag > max) {
    return multiply(normalize(v), max);
  }
  return vec(v.x, v.y);
}

export function length(v: IVec): number {
  return magnitude(v);
}

export function dot(a: IVec, b: IVec): number {
  return a.x * b.x + a.y * b.y;
}

export function distance(a: IVec, b: IVec): number {
  return magnitude(sub(a, b));
}

export function toArray(v: IVec): number[] {
  return [v.x, v.y];
}

export function clone(v: IVec): IVec {
  return vec(v.x, v.y);
}

export function toAngle(v: IVec): number {
  return Math.atan2(v.y, v.x);
}

export function fromAngle(angleRadians: number, length = 1): IVec {
  return vec(length * Math.cos(angleRadians), length * Math.sin(angleRadians));
}

export function fromRadians(angle: number): IVec {
  return fromAngle(angle);
}

export interface IPointTuple extends Array<number> {
  0: number;
  1: number;
  length: 2;
}

export function fromTuple([x, y]: IPointTuple): IVec {
  return vec(x, y);
}

export function toTuple(v: IVec): IPointTuple {
  return [v.x, v.y];
}

// User Code
// function step() {
//   using a = vec(1, 2);
//   using b = vec(3, 4);
//   using c = add(a, b);
//
//   console.log(c.x, c.y);
// } // all recycled here — no objects created, no GC
