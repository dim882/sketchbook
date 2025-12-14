import { createSeedState } from './blob-path.seed';
import { bindEvent } from './random';
import * as utils from './blob-path.utils';

const seedState = createSeedState();

const AllSettings = {
  blue: {
    STEP_COUNT: 50,
    BACKGROUND_COLOR: '#6c8693',
    COLOR_LINE: '#000000',
    COLOR_FORM: '#fcfaf7',
  },
  light: {
    STEP_COUNT: 10,
    BACKGROUND_COLOR: '#000',
    COLOR_LINE: '#fff',
    COLOR_FORM: '#ffffff00',
  },
};

const Settings = AllSettings.light;

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

  context.fillStyle = Settings.BACKGROUND_COLOR;
  context.fillRect(0, 0, width, height);

  const edge = utils.getRandomEdge(rand);
  const thing1 = utils.createBlobStreamData({
    point: utils.getRandomEdgePoint(rand, width, height, edge),
    width,
    height,
    center,
    stepCount: Settings.STEP_COUNT,
  });
  const thing2 = utils.createBlobStreamData({
    point: utils.getRandomEdgePoint(rand, width, height, edge),
    width,
    height,
    center,
    stepCount: Settings.STEP_COUNT,
  });

  const offscreenCanvases: OffscreenCanvas[] = [];

  for (let i = 0; i < Settings.STEP_COUNT; i++) {
    const offscreen = utils.createOffscreenCanvas(width, height);

    const metaballs: utils.IMetaball[] = [
      {
        position: utils.getPointAlongPath(thing1.point, thing1.dir, thing1.step, i),
        radius: 20 + 20 * Math.sin((i / Settings.STEP_COUNT) * Math.PI * 4),
      },
      {
        position: utils.getPointAlongPath(thing2.point, thing2.dir, thing2.step, i),
        radius: 40 + 20 * Math.cos((i / Settings.STEP_COUNT) * Math.PI * 4),
      },
    ];

    const imageData = offscreen.context.createImageData(width, height);
    const data = imageData.data;
    const thresholdMax = utils.getMaxThreshold(metaballs);
    const colorLine = utils.colorToRgba(Settings.COLOR_LINE);
    const colorForm = utils.colorToRgba(Settings.COLOR_FORM);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const sum = utils.calculateMetaball(x, y, metaballs);

        if (utils.isWithinThreshold(sum, metaballs)) {
          data[index] = colorLine.r;
          data[index + 1] = colorLine.g;
          data[index + 2] = colorLine.b;
          data[index + 3] = colorLine.a;
        } else if (sum > thresholdMax) {
          data[index] = colorForm.r;
          data[index + 1] = colorForm.g;
          data[index + 2] = colorForm.b;
          data[index + 3] = colorForm.a;
        } else {
          data[index + 3] = 0;
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
