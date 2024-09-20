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

class Point implements Iterable<number> {
  constructor(public x: number, public y: number) {}

  *[Symbol.iterator]() {
    yield this.x;
    yield this.y;
  }
}

export const point = (x: number, y: number) => new Point(x, y);

// Usage:
const center = point(10, 20);
const [x1, y1] = center; // Array destructuring
const { x: x2, y: y2 } = center; // Object destructuring
