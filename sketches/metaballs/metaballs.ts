import * as Utils from './metaballs.utils';

const BACKGROUND_COLOR = '#fcfaf7';
const METABALL_COLOR = '#c27770';
const METABALL_COUNT = 11;
const THRESHOLD = 0.2;
export const PADDING = 200;

document.body.onload = () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  if (!context) return;

  const { width, height } = canvas;
  const metaballs: Utils.IMetaball[] = [];

  for (let i = 0; i < METABALL_COUNT; i++) {
    const radius = 30 + Math.random() * 20;
    // Apply PADDING to the position calculations
    const x = PADDING + radius + Math.random() * (width - 2 * radius - 2 * PADDING);
    const y = PADDING + radius + Math.random() * (height - 2 * radius - 2 * PADDING);
    const vx = (Math.random() * 2 - 1) * 2;
    const vy = (Math.random() * 2 - 1) * 2;

    metaballs.push(Utils.createMetaball(x, y, vx, vy, radius));
  }

  Utils.loop(context, render(metaballs, THRESHOLD), 60);
};

const render = (metaballs: Utils.IMetaball[], threshold: number) => (context: CanvasRenderingContext2D, t: number) => {
  const { width, height } = context.canvas;

  // Update metaballs
  for (let i = 0; i < metaballs.length; i++) {
    metaballs[i] = Utils.updateMetaball(metaballs[i], width, height);
  }

  context.clearRect(0, 0, width, height);
  context.fillStyle = BACKGROUND_COLOR;
  context.fillRect(0, 0, width, height);

  const rgbValues = Utils.getRgbValues(METABALL_COLOR);

  if (!rgbValues) return;

  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const isInside = Utils.calculateMetaballField(x, y, metaballs, threshold);

      if (isInside) {
        data[index] = rgbValues.r; // R
        data[index + 1] = rgbValues.g; // G
        data[index + 2] = rgbValues.b; // B
        data[index + 3] = rgbValues.a; // A
      }
    }
  }

  context.putImageData(imageData, 0, 0);
};
