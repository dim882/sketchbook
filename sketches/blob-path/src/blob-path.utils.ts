import { getFloat } from './random';

export type PseudoRandomNumberGenerator = () => number;
export type IPoint = { x: number; y: number };

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
  velocity: IVector;
  radius: number;
}

export interface IThing {
  point: IPoint;
  vec: IPoint;
  dir: IPoint;
  opposite: IPoint;
  distToOpposite: number;
  totalDist: number;
  step: number;
}

export interface ICreateThingParams {
  rand: PseudoRandomNumberGenerator;
  width: number;
  height: number;
  edge: Edge;
  center: IPoint;
  stepCount: number;
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
      return { x: getFloat(rand, 0, width), y: 0 };
    case Edge.Right:
      return { x: width, y: getFloat(rand, 0, height) };
    case Edge.Bottom:
      return { x: getFloat(rand, 0, width), y: height };
    case Edge.Left:
      return { x: 0, y: getFloat(rand, 0, height) };
    default:
      return { x: 0, y: 0 };
  }
}

export function normalizeVector(vec: IPoint): IPoint {
  const length = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
  return length === 0 ? { x: 0, y: 0 } : { x: vec.x / length, y: vec.y / length };
}

export function getPointAlongPath(start: IPoint, dir: IPoint, stepSize: number, stepIndex: number): IPoint {
  return {
    x: start.x + dir.x * stepSize * stepIndex,
    y: start.y + dir.y * stepSize * stepIndex,
  };
}

export function getOppositeEdgePoint(dir: IPoint, width: number, height: number, center: IPoint): IPoint {
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

  return { x: center.x + dir.x * t, y: center.y + dir.y * t };
}

export function createThing({ rand, width, height, edge, center, stepCount }: ICreateThingParams): IThing {
  const extension = 200;
  const point = getRandomEdgePoint(rand, width, height, edge);
  const vec = {
    x: center.x - point.x,
    y: center.y - point.y,
  };
  const dir = normalizeVector(vec);
  const opposite = getOppositeEdgePoint(dir, width, height, center);
  const distToOpposite = Math.sqrt(
    (opposite.x - point.x) * (opposite.x - point.x) + (opposite.y - point.y) * (opposite.y - point.y)
  );
  const totalDist = distToOpposite + extension;
  const step = totalDist / stepCount;

  return {
    point,
    vec,
    dir,
    opposite,
    distToOpposite,
    totalDist,
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
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
} | null {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (!context) return null;

  return { canvas, context };
}

export function isWithinThreshold(sum: number, metaballs: IMetaball[]): boolean {
  const averageRadius = metaballs.reduce((sum, ball) => sum + ball.radius, 0) / metaballs.length;
  const baseThreshold = 0.2;
  const rangeWidth = 0.01 - (averageRadius / 50) * (0.01 - 0.003);

  return sum > baseThreshold && sum < baseThreshold + rangeWidth;
}
