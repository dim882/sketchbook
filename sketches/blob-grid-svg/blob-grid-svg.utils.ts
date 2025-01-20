export type PseudoRandomNumberGenerator = () => number;
export type IRange = [lower: number, upper: number];
export type I2DTuple = [number, number];

export type IPointTuple = [number, number];

export const getFloat = (generateNumber: PseudoRandomNumberGenerator, lower: number = 0, upper: number = 1) => {
  return (upper - lower) * generateNumber() + lower;
};

export const getInteger = (generateNumber: PseudoRandomNumberGenerator, lower: number = 0, upper: number = 1) => {
  return Math.floor(getFloat(generateNumber, lower, upper));
};

export const getBoolean = (generateNumber: PseudoRandomNumberGenerator, probabilityTrue: number = 0.5) => {
  return generateNumber() < probabilityTrue;
};

type Range = (start: number, end: number, step?: number) => number[];

type PRNG = () => number;

export const createPRNG = (seed: number): PRNG => {
  // Constants for the LCG. These are common values used in numerical recipes
  const a = 1664525;
  const c = 1013904223;
  const m = 2 ** 32;

  // Current state of the generator
  let state = seed;

  // The PRNG function that computes the next pseudorandom number
  const prng: PRNG = () => {
    // Update the state with the LCG formula
    state = (a * state + c) % m;
    // Normalize to the range 0 to 1 (exclusive)
    return state / m;
  };

  return prng;
};

export function saveAndRestore(context: CanvasRenderingContext2D, callback: () => void) {
  context.save();
  callback();
  context.restore();
}

export function createGrid(width: number, height: number, step: number): IPointTuple[] {
  // prettier-ignore
  return range(0, width, step)
    .flatMap((x) => range(0, height, step)
    .map((y) => [x, y] as IPointTuple));
}

export function randomOffset([x, y]: IPointTuple, offset: number): IPointTuple {
  const offsetRange = [-offset, offset];

  return [x + getInteger(Math.random, ...offsetRange), y + getInteger(Math.random, ...offsetRange)];
}

export const range = (start: number, end: number, step: number = 1): number[] =>
  Array.from({ length: Math.ceil((end - start) / step) }, (_, i) => start + i * step);
