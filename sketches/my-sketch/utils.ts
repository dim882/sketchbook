export type PseudoRandomNumberGenerator = () => number;
export type IRange = [lower: number, upper: number];
export type I2DTuple = [number, number];

export type MakeFuzzerArgs = {
  context: CanvasRenderingContext2D;
  radius: number;
  iterations: number;
  lengthRange?: IRange;
};

export function makeFuzzer({ context, radius, iterations, lengthRange = [0.4, 0.5] }: MakeFuzzerArgs) {
  const [lengthLower, lengthHigher] = lengthRange;

  // The returned fuzzer function:
  //  - Finds points random distance from the given point using a Gaussian distribution
  //  - Draws lines at those points with random lengths at random angles
  return function makeFuzz(x: number, y: number, strokeStyle?: string) {
    for (let i = 0; i < iterations; i++) {
      const center: I2DTuple = [(Math.random() * radius) / 2, (Math.random() * radius) / 2];
      const length = getInteger(Math.random, radius * lengthLower, radius * lengthHigher);
      const angle1 = getFloat(Math.random, 0, 2 * Math.PI);
      const point1: I2DTuple = [center[0] + length * Math.cos(angle1), center[1] + length * Math.sin(angle1)];

      context.save();
      if (strokeStyle) {
        context.strokeStyle = strokeStyle;
      }

      context.translate(x, y);
      context.beginPath();
      context.moveTo(...center);
      context.lineTo(...point1);
      context.stroke();
      context.restore();
    }
  };
}

export const getFloat = (generateNumber: PseudoRandomNumberGenerator, lower: number = 0, upper: number = 1) => {
  return (upper - lower) * generateNumber() + lower;
};

export const getInteger = (generateNumber: PseudoRandomNumberGenerator, lower: number = 0, upper: number = 1) => {
  return Math.floor(getFloat(generateNumber, lower, upper));
};

export const getBoolean = (generateNumber: PseudoRandomNumberGenerator, probabilityTrue: number = 0.5) => {
  return generateNumber() < probabilityTrue;
};
