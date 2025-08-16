export type PseudoRandomNumberGenerator = () => number;

export const getFloat = (generateNumber: PseudoRandomNumberGenerator, lower: number = 0, upper: number = 1) => {
  return (upper - lower) * generateNumber() + lower;
};

export const getInteger = (generateNumber: PseudoRandomNumberGenerator, lower: number = 0, upper: number = 1) => {
  return Math.floor(getFloat(generateNumber, lower, upper));
};

export const getBoolean = (generateNumber: PseudoRandomNumberGenerator, probabilityTrue: number = 0.5) => {
  return generateNumber() < probabilityTrue;
};

type PRNG = () => number;

export const createPRNG = (seed: number): PRNG => {
  const a = 1664525;
  const c = 1013904223;
  const m = 2 ** 32;

  let state = seed;

  const prng: PRNG = () => {
    state = (a * state + c) % m;
    return state / m;
  };

  return prng;
};

export const makeGaussianFactory = (
  generateRandomNumber: PseudoRandomNumberGenerator,
  mean = 0,
  standardDerivation = 1
): PseudoRandomNumberGenerator => {
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
