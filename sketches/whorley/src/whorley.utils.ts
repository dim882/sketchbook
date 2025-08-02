import { rgb } from 'culori';

export type IPointTuple = [number, number];

export type PseudoRandomNumberGenerator = () => number;

const getFloat = (generateNumber: PseudoRandomNumberGenerator, lower = 0, upper = 1) => {
  return (upper - lower) * generateNumber() + lower;
};

export const getInteger = (generateNumber: PseudoRandomNumberGenerator, lower = 0, upper = 1) => {
  return Math.floor(getFloat(generateNumber, lower, upper));
};

const featurePointsCache = new Map<string, IPointTuple[]>();

const hash = (x: number, y: number): string => {
  return `${Math.floor(x)},${Math.floor(y)}`;
};

const pseudoRandom = (x: number, y: number, offset: number): number => {
  let hashValue = (x * 12.9898 + y * 78.233 + offset * 37.719) % 1;
  hashValue = Math.sin(hashValue) * 43758.5453;
  return hashValue - Math.floor(hashValue);
};

const distance = (a: IPointTuple, b: IPointTuple): number => {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy; // Use squared distance to avoid sqrt
};

const getFeaturePoints = (gridX: number, gridY: number): IPointTuple[] => {
  const key = hash(gridX, gridY);

  if (featurePointsCache.has(key)) {
    return featurePointsCache.get(key)!;
  }

  const points: IPointTuple[] = [];
  const numPoints = 3;

  for (let i = 0; i < numPoints; i++) {
    const x = gridX + pseudoRandom(gridX, gridY, i * 2);
    const y = gridY + pseudoRandom(gridX, gridY, i * 2 + 1);
    points.push([x, y]);
  }

  featurePointsCache.set(key, points);
  return points;
};

export const whorleyNoise = (x: number, y: number): number => {
  const gridX = Math.floor(x);
  const gridY = Math.floor(y);

  let minDistance = Infinity;

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const cellX = gridX + dx;
      const cellY = gridY + dy;
      const points = getFeaturePoints(cellX, cellY);

      for (const point of points) {
        const dist = distance([x, y], point);
        minDistance = Math.min(minDistance, dist);
      }
    }
  }

  return Math.min(Math.sqrt(minDistance) * 2, 1);
};

export const createColorFactory = (formHue: number) => {
  const colorCache = new Map<number, [number, number, number]>();

  return (noiseValue: number): [number, number, number] => {
    const roundedNoise = Math.round(noiseValue * 1000) / 1000; // Round to 3 decimal places for caching

    if (colorCache.has(roundedNoise)) {
      return colorCache.get(roundedNoise)!;
    }

    const lightness = 90 - noiseValue * 80;
    const colorString = `lch(${lightness}% ${30 * noiseValue} ${formHue})`;
    const color = rgb(colorString);

    if (color) {
      const rgbValues: [number, number, number] = [
        Math.floor(color.r * 255),
        Math.floor(color.g * 255),
        Math.floor(color.b * 255),
      ];
      colorCache.set(roundedNoise, rgbValues);
      return rgbValues;
    }

    return [0, 0, 0]; // Fallback to black
  };
};
