
import { NoiseFunction2D } from 'simplex-noise';

export type PseudoRandomNumberGenerator = () => number;
export type I2DTuple = [number, number];
export type IRange = [lower: number, upper: number];

export const getFloat = (generateNumber: PseudoRandomNumberGenerator, lower: number = 0, upper: number = 1) => {
  return (upper - lower) * generateNumber() + lower;
};

export const getInteger = (generateNumber: PseudoRandomNumberGenerator, lower: number = 0, upper: number = 1) => {
  return Math.floor(getFloat(generateNumber, lower, upper));
};

export const addEvent = (eventName: string, handler: (e: CustomEvent) => void) => (el: Element) => {
  el.addEventListener(eventName, handler);
  return el;
};

export const log =
  <T>(tag: string) =>
  (val: T) => (console.log(tag, val), val);

// The returned fuzzer function:
//  - Finds points random distance from the given point using a Gaussian distribution
//  - Draws lines at those points with random lengths at random angles
export function makeFuzzer({
  context,
  prng,
  radius = 200,
  iterations = 30,
  lengthRange = [0.4, 0.5],
}: {
  context: CanvasRenderingContext2D;
  prng: PseudoRandomNumberGenerator;
  radius?: number;
  iterations?: number;
  lengthRange?: IRange;
}) {
  const [lengthLower, lengthHigher] = lengthRange;
  const getGaussian = makeGaussianFactory(prng);

  return function drawFuzz(x: number, y: number, strokeStyle?: string) {
    for (let i = 0; i < iterations; i++) {
      // prettier-ignore
      const center: I2DTuple = [
        (getGaussian() * radius) / 2, 
        (getGaussian() * radius) / 2
      ];
      const length = getInteger(prng, radius * lengthLower, radius * lengthHigher);
      const angle = getFloat(prng, 0, 2 * Math.PI);
      // prettier-ignore
      const point: I2DTuple = [
        center[0] + length * Math.cos(angle), 
        center[1] + length * Math.sin(angle)
      ];

      context.save();
      if (strokeStyle) {
        context.strokeStyle = strokeStyle;
      }

      context.translate(x, y);
      context.beginPath();
      context.moveTo(...center);
      context.lineTo(...point);
      context.stroke();
      context.restore();
    }
  };
}

// GPL: https://github.com/mattdesl/canvas-sketch-util/blob/852fee9564c85d535ef82cc59f9b857b1bf08a3d/random.js#L301
const makeGaussianFactory = (generateRandomNumber: PseudoRandomNumberGenerator, mean = 0, standardDerivation = 1) => {
  // https://github.com/openjdk-mirror/jdk7u-jdk/blob/f4d80957e89a19a29bb9f9807d2a28351ed7f7df/src/share/classes/java/util/Random.java#L496

  let hasNextGaussian = false;
  let nextGaussian: number | null;

  return () => {
    if (hasNextGaussian) {
      hasNextGaussian = false;
      const result = nextGaussian as number;
      nextGaussian = null;

      return mean + standardDerivation * result;
    } else {
      let v1 = 0;
      let v2 = 0;
      let s = 0;

      do {
        v1 = generateRandomNumber() * 2 - 1; // between -1 and 1
        v2 = generateRandomNumber() * 2 - 1; // between -1 and 1
        s = v1 * v1 + v2 * v2;
      } while (s >= 1 || s === 0);

      const multiplier = Math.sqrt((-2 * Math.log(s)) / s);

      nextGaussian = v2 * multiplier;
      hasNextGaussian = true;

      return mean + standardDerivation * (v1 * multiplier);
    }
  };
};

export function renderDebugNoise({
  width,
  height,
  noise2D,
  context,
  scale = 100,
}: {
  width: number;
  height: number;
  noise2D: NoiseFunction2D;
  context: CanvasRenderingContext2D;
  scale?: number;
}) {
  applyNoise({ context, width, height, noise2D, scale, callback: drawNarrowBand });
}

export interface IApplyNoiseArgs {
  width: number;
  height: number;
  noise2D: NoiseFunction2D;
  scale: number;
  context: CanvasRenderingContext2D;
  callback: IDrawNoise;
}

export function applyNoise({ width, height, noise2D, scale, context, callback }: IApplyNoiseArgs) {
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const value = noise2D(x / scale, y / scale);

      callback({ value, context, x, y });
    }
  }
}

export interface IDrawNoiseArgs {
  value: number;
  context: CanvasRenderingContext2D;
  x: number;
  y: number;
}

export type IDrawNoise = (args: IDrawNoiseArgs) => void;

export const drawNarrowBand: IDrawNoise = ({ value, context, x, y }) => {
  const color = Math.floor((value + 1) * 128); // Normalize to [0, 255]

  if (color > 160 && color < 170) {
    // context.fillStyle = `rgb(${color}, ${color}, ${color})`;
    context.fillStyle = '#000';
    context.fillRect(x, y, 1, 1);
  }
};

export function getElement<K extends keyof HTMLElementTagNameMap>(selector: K): HTMLElementTagNameMap[K][];
export function getElement(selector: string): HTMLElement[];
export function getElement(selector: string) {
  return Array.from(document.querySelectorAll(selector));
}

export function setup(callback: () => void): void {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    // Document has already loaded
    callback();
  }
}
