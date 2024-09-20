export type IPoint = [number, number] & { x: number; y: number };

export const point = (coords: [number, number]): IPoint => {
  return new Proxy(coords, {
    get(target, prop) {
      if (prop === 'x') return target[0];
      if (prop === 'y') return target[1];
      return Reflect.get(target, prop);
    },
  }) as IPoint;
};
