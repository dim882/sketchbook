export type IPoint = [number, number] & { x: number; y: number };

// export const point = (coords: [number, number]): IPoint => {
//   return new Proxy(coords, {
//     get(target, prop) {
//       if (prop === 'x') return target[0];
//       if (prop === 'y') return target[1];
//       return Reflect.get(target, prop);
//     },
//   }) as IPoint;
// };

// class Point implements Iterable<number> {
//   constructor(public x: number, public y: number) {}

//   *[Symbol.iterator]() {
//     yield this.x;
//     yield this.y;
//   }
// }
export class Point implements Iterable<number> {
  constructor(private values: number[]) {}

  get x() {
    return this.values[0];
  }
  get y() {
    return this.values[1];
  }
  get z() {
    return this.values[2];
  }

  [index: number]: number;
  get(index: number) {
    return this.values[index];
  }

  *[Symbol.iterator]() {
    yield* this.values;
  }
}

export const point = (...values: number[]) => new Point(values);

// Usage:
// const p2d = point(10, 20);
// const p3d = point(10, 20, 30);

// console.log(p2d.x, p2d.y); // 10 20
// console.log(p3d.x, p3d.y, p3d.z); // 10 20 30
// console.log(p3d[0], p3d[1], p3d[2]); // 10 20 30
// const [x, y, z] = p3d; // Array destructuring
// const { x: x2, y: y2, z: z2 } = p3d; // Object destructuring

class Vector {
  constructor(public x: number, public y: number, public z?: number, public w?: Vector) {}

  *[Symbol.iterator](): IterableIterator<number> {
    yield this.x;
    yield this.y;
    if (this.z !== undefined) yield this.z;
    if (this.w !== undefined) yield* this.w;
  }
}

const vec = (...coords: number[]): Vector => {
  const [x, y, z, ...rest] = coords;
  return new Vector(x, y, z, rest.length ? vec(...rest) : undefined);
};

// Usage:
// const v2 = vec(1, 2);
// const v3 = vec(1, 2, 3);
// const v4 = vec(1, 2, 3, 4);
// const v5 = vec(1, 2, 3, 4, 5);

// console.log(...v2); // 1 2
// console.log(...v3); // 1 2 3
// console.log(...v4); // 1 2 3 4
// console.log(...v5); // 1 2 3 4 5
