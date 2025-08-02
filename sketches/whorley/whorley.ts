export type PseudoRandomNumberGenerator = () => number;
export type IPointTuple = [number, number];

const getFloat = (generateNumber: PseudoRandomNumberGenerator, lower = 0, upper = 1) => {
  return (upper - lower) * generateNumber() + lower;
};

const getInteger = (generateNumber: PseudoRandomNumberGenerator, lower = 0, upper = 1) => {
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

const whorleyNoise = (x: number, y: number): number => {
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

const prng = Math.random;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  if (context) {
    render(context);
  }
});

function render(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;
  const center: IPointTuple = [width / 2, height / 2];

  const formHue = getInteger(prng, 0, 270);
  const backgroundHue = formHue + 180;

  context.fillStyle = `lch(60% 10% ${backgroundHue})`;
  context.fillRect(0, 0, width, height);

  const imageData = context.createImageData(width, height);
  const data = imageData.data;

  const scale = 0.02;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const noiseValue = whorleyNoise(x * scale, y * scale);
      const index = (y * width + x) * 4;

      const intensity = Math.floor(noiseValue * 255);

      data[index] = intensity; // R
      data[index + 1] = intensity; // G
      data[index + 2] = intensity; // B
      data[index + 3] = 255; // A
    }
  }

  context.putImageData(imageData, 0, 0);
}
