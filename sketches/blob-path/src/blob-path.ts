import { createSeedState } from './blob-path.seed';
import { bindEvent } from './random';
import {
  getRandomEdgePoint,
  getOppositeEdgePoint,
  normalizeVector,
  type IPointTuple,
  type PseudoRandomNumberGenerator,
} from './blob-path.utils';

export type { PseudoRandomNumberGenerator, IPointTuple };

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

function render(context: CanvasRenderingContext2D, rand: PseudoRandomNumberGenerator) {
  const { width, height } = context.canvas;
  const center: IPointTuple = [width / 2, height / 2];

  context.clearRect(0, 0, width, height);

  const point1: IPointTuple = getRandomEdgePoint(rand, width, height);
  const point2: IPointTuple = getRandomEdgePoint(rand, width, height);

  const vec1: IPointTuple = [center[0] - point1[0], center[1] - point1[1]];
  const vec2: IPointTuple = [center[0] - point2[0], center[1] - point2[1]];

  const dir1 = normalizeVector(vec1);
  const dir2 = normalizeVector(vec2);

  const opposite1 = getOppositeEdgePoint(dir1, width, height, center);
  const opposite2 = getOppositeEdgePoint(dir2, width, height, center);

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

    context.beginPath();
    context.arc(current1[0], current1[1], 5, 0, Math.PI * 2);
    context.fill();

    context.beginPath();
    context.arc(current2[0], current2[1], 5, 0, Math.PI * 2);
    context.fill();
  }
}
