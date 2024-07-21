import { hsl, formatHsl, Hsl } from 'culori';

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

  return function makeFuzz(x: number, y: number, strokeStyle?: string) {
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
