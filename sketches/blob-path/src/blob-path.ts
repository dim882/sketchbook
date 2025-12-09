import { createSeedState } from './blob-path.seed';
import { bindEvent } from './random';
import {
  getRandomEdgePoint,
  getOppositeEdgePoint,
  normalizeVector,
  calculateMetaball,
  createOffscreenCanvas,
  type IPointTuple,
  type PseudoRandomNumberGenerator,
  type IMetaball,
} from './blob-path.utils';

export type { PseudoRandomNumberGenerator, IPointTuple };

const seedState = createSeedState();

const STEP_COUNT = 50;

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

  const step1 = totalDist1 / STEP_COUNT;
  const step2 = totalDist2 / STEP_COUNT;

  const offscreenCanvases: HTMLCanvasElement[] = [];

  for (let i = 0; i < STEP_COUNT; i++) {
    const current1: IPointTuple = [point1[0] + dir1[0] * step1 * i, point1[1] + dir1[1] * step1 * i];
    const current2: IPointTuple = [point2[0] + dir2[0] * step2 * i, point2[1] + dir2[1] * step2 * i];

    const offscreen = createOffscreenCanvas(width, height);
    if (!offscreen) continue;

    const { canvas: offscreenCanvas, context: offscreenContext } = offscreen;

    const metaballs: IMetaball[] = [
      {
        position: { x: current1[0], y: current1[1] },
        velocity: { x: 0, y: 0 },
        radius: 30 + 20 * Math.sin((i / STEP_COUNT) * Math.PI * 2),
      },
      {
        position: { x: current2[0], y: current2[1] },
        velocity: { x: 0, y: 0 },
        radius: 30 + 20 * Math.cos((i / STEP_COUNT) * Math.PI * 2),
      },
    ];

    const imageData = offscreenContext.createImageData(width, height);
    const data = imageData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const sum = calculateMetaball(x, y, metaballs);

        if (sum > 0.2 && sum < 0.203) {
          data[index] = 0; // r
          data[index + 1] = 0; // g
          data[index + 2] = 0; // b
          data[index + 3] = 255; // a
        } else {
          data[index + 3] = 0; // transparent
        }
      }
    }

    offscreenContext.putImageData(imageData, 0, 0);
    offscreenCanvases.push(offscreenCanvas);
  }

  for (const offscreenCanvas of offscreenCanvases) {
    context.drawImage(offscreenCanvas, 0, 0);
  }
}
