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

export const range: Range = (start, end, step = 1) => {
  const result: number[] = [];

  if (start > end && step > 0) {
    step = -step;
  }

  if (step > 0) {
    for (let i = start; i <= end; i += step) {
      result.push(i);
    }
  } else {
    for (let i = start; i >= end; i += step) {
      result.push(i);
    }
  }

  return result;
};

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

export function tracePath(context: CanvasRenderingContext2D, points: IPointTuple[]) {
  context.beginPath();
  points.forEach(([x, y], index) => (index === 0 ? context.moveTo(x, y) : context.lineTo(x, y)));
  context.closePath();
}

export function saveAndRestore(context: CanvasRenderingContext2D, callback: () => void) {
  context.save();
  callback();
  context.restore();
}

export function applyColorMatrix(context: CanvasRenderingContext2D, matrix: number[][]) {
  const { width, height } = context.canvas;
  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    data[i] = r * matrix[0][0] + g * matrix[0][1] + b * matrix[0][2] + a * matrix[0][3] + matrix[0][4] * 255; // Red
    data[i + 1] = r * matrix[1][0] + g * matrix[1][1] + b * matrix[1][2] + a * matrix[1][3] + matrix[1][4] * 255; // Green
    data[i + 2] = r * matrix[2][0] + g * matrix[2][1] + b * matrix[2][2] + a * matrix[2][3] + matrix[2][4] * 255; // Blue
    data[i + 3] = r * matrix[3][0] + g * matrix[3][1] + b * matrix[3][2] + a * matrix[3][3] + matrix[3][4] * 255; // Alpha
  }

  context.putImageData(imageData, 0, 0);
}

export function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  return canvas.getContext('2d', { willReadFrequently: true });
}

export function flattenColors(context: CanvasRenderingContext2D, ALPHA_TRANSFORM: number) {
  const flattenMatrix = [
    [1, 0, 0, 0, 0], // R
    [0, 1, 0, 0, 0], // G
    [0, 0, 1, 0, 0], // B
    [0, 0, 0, ALPHA_TRANSFORM, -15], // A
  ];

  applyColorMatrix(context, flattenMatrix);
}

export function applyBlur(context: CanvasRenderingContext2D, BLUR: number) {
  context.filter = `blur(${BLUR}px)`;
}

export function createGrid(width: number, height: number, size: number): IPointTuple[] {
  // prettier-ignore
  return range(0, width, size)
    .flatMap((x) => range(0, height, size)
    .map((y) => [x, y] as IPointTuple));
}

export function drawGrid(context: CanvasRenderingContext2D, grid: IPointTuple[], radius: number, fillColor: string) {
  grid.forEach((point: IPointTuple) => {
    context.beginPath();
    context.arc(...point, radius, 0, 2 * Math.PI);
    context.fillStyle = fillColor;
    context.fill();
  });
}

export function randomOffset([x, y]: IPointTuple, offset: number): IPointTuple {
  const offsetRange = [-offset, offset];
  return [x + getInteger(Math.random, ...offsetRange), y + getInteger(Math.random, ...offsetRange)];
}
