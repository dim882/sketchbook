import { createSeedState } from './blob-path.seed';
import { bindEvent, getFloat } from './random';

export type PseudoRandomNumberGenerator = () => number;
export type IPointTuple = [number, number];

const seedState = createSeedState();

window.addEventListener('DOMContentLoaded', () => {
  const context = document.querySelector('canvas')?.getContext('2d');

  if (!context) {
    return;
  }

  bindEvent(
    '.change-seed',
    'click',
    seedState.handleSeedChange((prng) => render(context, prng))
  );

  render(context, seedState.prng);
});

function getRandomEdgePoint(rand: PseudoRandomNumberGenerator, width: number, height: number): IPointTuple {
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

function normalizeVector([dx, dy]: IPointTuple): IPointTuple {
  const length = Math.sqrt(dx * dx + dy * dy);
  return length === 0 ? [0, 0] : [dx / length, dy / length];
}

function render(context: CanvasRenderingContext2D, rand: PseudoRandomNumberGenerator) {
  const { width, height } = context.canvas;
  const center: IPointTuple = [width / 2, height / 2];

  // Clear canvas
  context.clearRect(0, 0, width, height);

  // Create two points at random edges
  const point1: IPointTuple = getRandomEdgePoint(rand, width, height);
  const point2: IPointTuple = getRandomEdgePoint(rand, width, height);

  // Calculate vectors from each point to center
  const vec1: IPointTuple = [center[0] - point1[0], center[1] - point1[1]];
  const vec2: IPointTuple = [center[0] - point2[0], center[1] - point2[1]];

  // Normalize vectors
  const dir1 = normalizeVector(vec1);
  const dir2 = normalizeVector(vec2);

  // Find opposite edge intersection points by extending direction from center
  const getOppositeEdgePoint = (start: IPointTuple, dir: IPointTuple, width: number, height: number): IPointTuple => {
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
  };

  const opposite1 = getOppositeEdgePoint(point1, dir1, width, height);
  const opposite2 = getOppositeEdgePoint(point2, dir2, width, height);

  // Calculate total distance from start to opposite edge
  const totalDist1 = Math.sqrt(
    (opposite1[0] - point1[0]) * (opposite1[0] - point1[0]) + (opposite1[1] - point1[1]) * (opposite1[1] - point1[1])
  );
  const totalDist2 = Math.sqrt(
    (opposite2[0] - point2[0]) * (opposite2[0] - point2[0]) + (opposite2[1] - point2[1]) * (opposite2[1] - point2[1])
  );

  const step1 = totalDist1 / 10;
  const step2 = totalDist2 / 10;

  for (let i = 0; i < 10; i++) {
    const current1: IPointTuple = [point1[0] + dir1[0] * step1 * i, point1[1] + dir1[1] * step1 * i];
    const current2: IPointTuple = [point2[0] + dir2[0] * step2 * i, point2[1] + dir2[1] * step2 * i];

    // Draw circle for point 1
    context.beginPath();
    context.arc(current1[0], current1[1], 5, 0, Math.PI * 2);
    context.fill();

    // Draw circle for point 2
    context.beginPath();
    context.arc(current2[0], current2[1], 5, 0, Math.PI * 2);
    context.fill();
  }
}
