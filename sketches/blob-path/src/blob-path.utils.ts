import { getFloat } from './random';

export type PseudoRandomNumberGenerator = () => number;
export type IPointTuple = [number, number];

export interface IVector {
  x: number;
  y: number;
}

export interface IMetaball {
  position: IVector;
  velocity: IVector;
  radius: number;
}

export function getRandomEdgePoint(rand: PseudoRandomNumberGenerator, width: number, height: number): IPointTuple {
  const edge = Math.floor(rand() * 4); // 0: top, 1: right, 2: bottom, 3: left

  switch (edge) {
    case 0: // top
      return [getFloat(rand, 0, width), 0];
    case 1: // right
      return [width, getFloat(rand, 0, height)];
    case 2: // bottom
      return [getFloat(rand, 0, width), height];
    case 3: // left
      return [0, getFloat(rand, 0, height)];
    default:
      return [0, 0];
  }
}

export function normalizeVector([dx, dy]: IPointTuple): IPointTuple {
  const length = Math.sqrt(dx * dx + dy * dy);
  return length === 0 ? [0, 0] : [dx / length, dy / length];
}

export function getOppositeEdgePoint(
  dir: IPointTuple,
  width: number,
  height: number,
  center: IPointTuple
): IPointTuple {
  // Extend from center in the same direction
  const maxDist = Math.max(width, height) * 2;
  let t = maxDist;

  // Find intersection with opposite edge
  if (dir[0] > 0) {
    // Moving right, intersect with right edge
    const tRight = (width - center[0]) / dir[0];
    if (tRight > 0 && tRight < t) t = tRight;
  } else if (dir[0] < 0) {
    // Moving left, intersect with left edge
    const tLeft = -center[0] / dir[0];
    if (tLeft > 0 && tLeft < t) t = tLeft;
  }

  if (dir[1] > 0) {
    // Moving down, intersect with bottom edge
    const tBottom = (height - center[1]) / dir[1];
    if (tBottom > 0 && tBottom < t) t = tBottom;
  } else if (dir[1] < 0) {
    // Moving up, intersect with top edge
    const tTop = -center[1] / dir[1];
    if (tTop > 0 && tTop < t) t = tTop;
  }

  return [center[0] + dir[0] * t, center[1] + dir[1] * t];
}

export const calculateMetaball = (x: number, y: number, metaballs: IMetaball[]): number => {
  return metaballs.reduce((acc, ball) => {
    const dx = x - ball.position.x;
    const dy = y - ball.position.y;
    const distanceSquared = dx * dx + dy * dy;

    return acc + (ball.radius * ball.radius) / distanceSquared;
  }, 0);
};
