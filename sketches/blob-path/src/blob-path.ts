import { createSeedState } from './blob-path.seed';
import { bindEvent } from './random';
import {
  getRandomEdge,
  getRandomEdgePoint,
  getOppositeEdgePoint,
  normalizeVector,
  calculateMetaball,
  createOffscreenCanvas,
  isWithinThreshold,
  toTuple,
  type IPoint,
  type PseudoRandomNumberGenerator,
  type IMetaball,
} from './blob-path.utils';

export type { PseudoRandomNumberGenerator, IPoint as IPointTuple };

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
  const center: IPoint = { x: width / 2, y: height / 2 };

  context.fillStyle = '#6c8693';
  context.fillRect(0, 0, width, height);

  const edge = getRandomEdge(rand);
  const point1: IPoint = getRandomEdgePoint(rand, width, height, edge);
  const point2: IPoint = getRandomEdgePoint(rand, width, height, edge);

  const vec1: IPoint = { x: center.x - point1.x, y: center.y - point1.y };
  const vec2: IPoint = { x: center.x - point2.x, y: center.y - point2.y };

  const dir1 = normalizeVector(vec1);
  const dir2 = normalizeVector(vec2);

  const opposite1 = getOppositeEdgePoint(dir1, width, height, center);
  const opposite2 = getOppositeEdgePoint(dir2, width, height, center);

  const totalDist1 = Math.sqrt(
    (opposite1.x - point1.x) * (opposite1.x - point1.x) + (opposite1.y - point1.y) * (opposite1.y - point1.y)
  );
  const totalDist2 = Math.sqrt(
    (opposite2.x - point2.x) * (opposite2.x - point2.x) + (opposite2.y - point2.y) * (opposite2.y - point2.y)
  );

  const step1 = totalDist1 / STEP_COUNT;
  const step2 = totalDist2 / STEP_COUNT;

  const offscreenCanvases: HTMLCanvasElement[] = [];

  for (let i = 0; i < STEP_COUNT; i++) {
    const current1: IPoint = { x: point1.x + dir1.x * step1 * i, y: point1.y + dir1.y * step1 * i };
    const current2: IPoint = { x: point2.x + dir2.x * step2 * i, y: point2.y + dir2.y * step2 * i };

    const offscreen = createOffscreenCanvas(width, height);
    if (!offscreen) continue;

    const { canvas: offscreenCanvas, context: offscreenContext } = offscreen;

    const metaballs: IMetaball[] = [
      {
        position: current1,
        velocity: { x: 0, y: 0 },
        radius: 30 + 20 * Math.sin((i / STEP_COUNT) * Math.PI * 2),
      },
      {
        position: current2,
        velocity: { x: 0, y: 0 },
        radius: 30 + 20 * Math.cos((i / STEP_COUNT) * Math.PI * 2),
      },
    ];
    console.log('heye!!');

    const imageData = offscreenContext.createImageData(width, height);
    const data = imageData.data;

    const averageRadius = metaballs.reduce((sum, ball) => sum + ball.radius, 0) / metaballs.length;
    const baseThreshold = 0.2;
    const rangeWidth = 0.01 - (averageRadius / 50) * (0.01 - 0.003);
    const thresholdMax = baseThreshold + rangeWidth;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const sum = calculateMetaball(x, y, metaballs);

        if (isWithinThreshold(sum, metaballs)) {
          data[index] = 0; // r
          data[index + 1] = 0; // g
          data[index + 2] = 0; // b
          data[index + 3] = 255; // a
        } else if (sum > thresholdMax) {
          data[index] = 252; // r
          data[index + 1] = 250; // g
          data[index + 2] = 247; // b
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
