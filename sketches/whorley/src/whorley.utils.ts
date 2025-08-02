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
  return Math.sqrt(dx * dx + dy * dy);
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

  return Math.min(minDistance * 2, 1);
};
