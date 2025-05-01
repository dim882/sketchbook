import { type IPoint, type IGenerateAttractorPointsOptions } from './types';

export const getCanvas = (): HTMLCanvasElement => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;

  if (!canvas) {
    throw new Error('Canvas element not found');
  }

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  return canvas;
};

export const getCanvasContext = (canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Could not get canvas context');
  }

  return context;
};

export const generateAttractorPoints = (options: IGenerateAttractorPointsOptions): IPoint[] => {
  const { type, iterations, skipIterations, parameters, prng } = options;
  const points: IPoint[] = [];

  // Initial point with some randomness
  let x = (prng() - 0.5) * 0.1;
  let y = (prng() - 0.5) * 0.1;
  let z = (prng() - 0.5) * 0.1;

  // Time step
  const dt = 0.005;

  // Skip initial iterations to converge to the attractor
  for (let i = 0; i < skipIterations; i++) {
    const [dx, dy, dz] = calculateDerivatives(type, x, y, z, parameters);
    x += dx * dt;
    y += dy * dt;
    z += dz * dt;
  }

  // Generate points on the attractor
  for (let i = 0; i < iterations; i++) {
    const [dx, dy, dz] = calculateDerivatives(type, x, y, z, parameters);
    x += dx * dt;
    y += dy * dt;
    z += dz * dt;

    points.push({ x, y, z });
  }

  return points;
};

export const calculateDerivatives = (
  type: string,
  x: number,
  y: number,
  z: number,
  parameters: any
): [number, number, number] => {
  switch (type) {
    case 'lorenz': {
      const { sigma, rho, beta } = parameters.lorenz;
      const dx = sigma * (y - x);
      const dy = x * (rho - z) - y;
      const dz = x * y - beta * z;
      return [dx, dy, dz];
    }

    case 'aizawa': {
      const { a, b, c, d, e, f } = parameters.aizawa;
      const dx = (z - b) * x - d * y;
      const dy = d * x + (z - b) * y;
      const dz = c + a * z - (z * z * z) / 3 - (x * x + y * y) * (1 + e * z) + f * z * x * x * x;
      return [dx, dy, dz];
    }

    case 'rossler': {
      const { a, b, c } = parameters.rossler;
      const dx = -y - z;
      const dy = x + a * y;
      const dz = b + z * (x - c);
      return [dx, dy, dz];
    }

    case 'thomas': {
      const { b } = parameters.thomas;
      const dx = Math.sin(y) - b * x;
      const dy = Math.sin(z) - b * y;
      const dz = Math.sin(x) - b * z;
      return [dx, dy, dz];
    }

    default:
      throw new Error(`Unknown attractor type: ${type}`);
  }
};

export const scalePointsToCanvas = (points: IPoint[], width: number, height: number): IPoint[] => {
  // Find min and max values for each dimension
  let minX = Infinity,
    maxX = -Infinity;
  let minY = Infinity,
    maxY = -Infinity;
  let minZ = Infinity,
    maxZ = -Infinity;

  for (const point of points) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
    minZ = Math.min(minZ, point.z);
    maxZ = Math.max(maxZ, point.z);
  }

  // Calculate scale factors
  const padding = 50;
  const scaleX = (width - padding * 2) / (maxX - minX);
  const scaleY = (height - padding * 2) / (maxY - minY);
  const scale = Math.min(scaleX, scaleY);

  // Calculate center offsets to properly center the attractor
  const scaledWidth = (maxX - minX) * scale;
  const scaledHeight = (maxY - minY) * scale;
  const offsetX = (width - scaledWidth) / 2;
  const offsetY = (height - scaledHeight) / 2;

  // Scale and center points
  return points.map((point) => ({
    x: (point.x - minX) * scale + offsetX,
    y: (point.y - minY) * scale + offsetY,
    z: point.z,
  }));
};
