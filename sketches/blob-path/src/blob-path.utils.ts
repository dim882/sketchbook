import { getFloat } from './random';
import { parse, converter } from 'culori';

const BASE_THRESHOLD = 0.2;

export type PseudoRandomNumberGenerator = () => number;

export type IPoint = {
  x: number;
  y: number;
};

export function toTuple(point: IPoint): [number, number] {
  return [point.x, point.y];
}

export enum Edge {
  Top = 0,
  Right = 1,
  Bottom = 2,
  Left = 3,
}

export interface IVector {
  x: number;
  y: number;
}

export interface IMetaball {
  position: IVector;
  radius: number;
}

export interface IBlobStreamData {
  point: IPoint;
  dir: IPoint;
  step: number;
}

export function getRandomEdge(rand: PseudoRandomNumberGenerator): Edge {
  return Math.floor(rand() * 4) as Edge;
}

export function getRandomEdgePoint(
  rand: PseudoRandomNumberGenerator,
  width: number,
  height: number,
  edge: Edge
): IPoint {
  switch (edge) {
    case Edge.Top:
      return {
        x: getFloat(rand, 0, width),
        y: 0,
      };
    case Edge.Right:
      return {
        x: width,
        y: getFloat(rand, 0, height),
      };
    case Edge.Bottom:
      return {
        x: getFloat(rand, 0, width),
        y: height,
      };
    case Edge.Left:
      return {
        x: 0,
        y: getFloat(rand, 0, height),
      };
    default:
      return {
        x: 0,
        y: 0,
      };
  }
}

function getAverageRadius(metaballs: IMetaball[]): number {
  return metaballs.reduce((sum, ball) => sum + ball.radius, 0) / metaballs.length;
}

function getRangeWidth(averageRadius: number): number {
  const rangeWidthInitial = 0.01;
  const rangeWidthMin = 0.003;
  const rangeWidthDivisor = 50;

  return rangeWidthInitial - (averageRadius / rangeWidthDivisor) * (rangeWidthInitial - rangeWidthMin);
}

export function getMaxThreshold(metaballs: IMetaball[]) {
  const averageRadius = getAverageRadius(metaballs);
  const rangeWidth = getRangeWidth(averageRadius);

  return BASE_THRESHOLD + rangeWidth;
}

export function normalizeVector(vec: IPoint): IPoint {
  const length = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
  return length === 0
    ? { x: 0, y: 0 }
    : {
        x: vec.x / length,
        y: vec.y / length,
      };
}

export function getPointAlongPath(start: IPoint, dir: IVector, stepSize: number, stepIndex: number): IPoint {
  return {
    x: start.x + dir.x * stepSize * stepIndex,
    y: start.y + dir.y * stepSize * stepIndex,
  };
}

export function getOppositeEdgePoint(dir: IPoint, width: number, height: number): IPoint {
  const center = { x: width / 2, y: height / 2 };
  const maxDist = Math.max(width, height) * 2;
  let t = maxDist;

  if (dir.x > 0) {
    const tRight = (width - center.x) / dir.x;

    if (tRight > 0 && tRight < t) t = tRight;
  } else if (dir.x < 0) {
    const tLeft = -center.x / dir.x;

    if (tLeft > 0 && tLeft < t) t = tLeft;
  }

  if (dir.y > 0) {
    const tBottom = (height - center.y) / dir.y;

    if (tBottom > 0 && tBottom < t) t = tBottom;
  } else if (dir.y < 0) {
    const tTop = -center.y / dir.y;

    if (tTop > 0 && tTop < t) t = tTop;
  }

  return {
    x: center.x + dir.x * t,
    y: center.y + dir.y * t,
  };
}

export interface ICreateThingParams {
  point: IPoint;
  width: number;
  height: number;
  center: IPoint;
  stepCount: number;
}
export function createBlobStreamData({ point, width, height, center, stepCount }: ICreateThingParams): IBlobStreamData {
  const OVERSHOOT_DISTANCE = 200;
  const dir = normalizeVector({
    x: center.x - point.x,
    y: center.y - point.y,
  });
  const opposite = getOppositeEdgePoint(dir, width, height);
  const distToOpposite = Math.sqrt(
    (opposite.x - point.x) * (opposite.x - point.x) + (opposite.y - point.y) * (opposite.y - point.y)
  );
  const totalDist = distToOpposite + OVERSHOOT_DISTANCE;
  const step = totalDist / stepCount;

  return {
    point,
    dir,
    step,
  };
}

export const calculateMetaball = (x: number, y: number, metaballs: IMetaball[]): number => {
  return metaballs.reduce((acc, ball) => {
    const dx = x - ball.position.x;
    const dy = y - ball.position.y;
    const distanceSquared = dx * dx + dy * dy;

    return acc + (ball.radius * ball.radius) / distanceSquared;
  }, 0);
};

export function createOffscreenCanvas(
  width: number,
  height: number
): {
  canvas: OffscreenCanvas;
  context: OffscreenCanvasRenderingContext2D;
} {
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (!context) {
    throw new Error('Failed to get 2d context from OffscreenCanvas');
  }

  return { canvas, context };
}

export function isWithinThreshold(sum: number, metaballs: IMetaball[]): boolean {
  const maxThreshold = getMaxThreshold(metaballs);

  return sum > BASE_THRESHOLD && sum < maxThreshold;
}

export function colorToRgba(color: string, defaultAlpha: number = 255): { r: number; g: number; b: number; a: number } {
  const parsed = parse(color);

  if (!parsed) {
    console.error(`Invalid color string: ${color}. Returning grey`);

    return { r: 128, g: 128, b: 128, a: defaultAlpha };
  }

  const rgb = parsed.mode === 'rgb' ? parsed : converter('rgb')(parsed);

  return {
    r: Math.round(rgb.r * 255),
    g: Math.round(rgb.g * 255),
    b: Math.round(rgb.b * 255),
    a: rgb.alpha !== undefined ? Math.round(rgb.alpha * 255) : defaultAlpha,
  };
}
