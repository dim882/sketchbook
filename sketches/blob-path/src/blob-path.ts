import { createSeedState } from './blob-path.seed';
import { bindEvent } from './random';
import * as utils from './blob-path.utils';

const seedState = createSeedState();

const STEP_COUNT = 50;
const BACKGROUND_COLOR = '#6c8693';
const COLOR_BLACK = { r: 0, g: 0, b: 0, a: 255 };
const COLOR_LIGHT = { r: 252, g: 250, b: 247, a: 255 };
const ALPHA_TRANSPARENT = 0;

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

function render(context: CanvasRenderingContext2D, rand: utils.PseudoRandomNumberGenerator) {
  const { width, height } = context.canvas;
  const center: utils.IPoint = { x: width / 2, y: height / 2 };

  context.fillStyle = BACKGROUND_COLOR;
  context.fillRect(0, 0, width, height);

  const edge = utils.getRandomEdge(rand);
  const thing1 = utils.createBlobStreamData({
    point: utils.getRandomEdgePoint(rand, width, height, edge),
    width,
    height,
    center,
    stepCount: STEP_COUNT,
  });
  const thing2 = utils.createBlobStreamData({
    point: utils.getRandomEdgePoint(rand, width, height, edge),
    width,
    height,
    center,
    stepCount: STEP_COUNT,
  });

  const offscreenCanvases: OffscreenCanvas[] = [];

  for (let i = 0; i < STEP_COUNT; i++) {
    const offscreen = utils.createOffscreenCanvas(width, height);

    const metaballs: utils.IMetaball[] = [
      {
        position: utils.getPointAlongPath(thing1.point, thing1.dir, thing1.step, i),
        radius: 20 + 20 * Math.sin((i / STEP_COUNT) * Math.PI * 4),
      },
      {
        position: utils.getPointAlongPath(thing2.point, thing2.dir, thing2.step, i),
        radius: 40 + 20 * Math.cos((i / STEP_COUNT) * Math.PI * 4),
      },
    ];

    const imageData = offscreen.context.createImageData(width, height);
    const data = imageData.data;

    const averageRadius = metaballs.reduce((sum, ball) => sum + ball.radius, 0) / metaballs.length;
    const baseThreshold = 0.2;
    const rangeWidth = 0.01 - (averageRadius / 50) * (0.01 - 0.003);
    const thresholdMax = baseThreshold + rangeWidth;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const sum = utils.calculateMetaball(x, y, metaballs);

        if (utils.isWithinThreshold(sum, metaballs)) {
          data[index] = COLOR_BLACK.r;
          data[index + 1] = COLOR_BLACK.g;
          data[index + 2] = COLOR_BLACK.b;
          data[index + 3] = COLOR_BLACK.a;
        } else if (sum > thresholdMax) {
          data[index] = COLOR_LIGHT.r;
          data[index + 1] = COLOR_LIGHT.g;
          data[index + 2] = COLOR_LIGHT.b;
          data[index + 3] = COLOR_LIGHT.a;
        } else {
          data[index + 3] = ALPHA_TRANSPARENT;
        }
      }
    }

    offscreen.context.putImageData(imageData, 0, 0);
    offscreenCanvases.push(offscreen.canvas);
  }

  for (const offscreenCanvas of offscreenCanvases) {
    context.drawImage(offscreenCanvas, 0, 0);
  }
}
