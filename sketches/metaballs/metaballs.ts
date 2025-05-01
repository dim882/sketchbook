import * as Utils from './metaballs.utils';

const BACKGROUND_COLOR = 'black';
const METABALL_COLOR = '#0078ff';
const METABALL_COUNT = 15;
const THRESHOLD = 1.0;

document.body.onload = () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  if (!context) return;

  const { width, height } = canvas;

  const metaballs: Utils.IMetaball[] = [];

  for (let i = 0; i < METABALL_COUNT; i++) {
    const radius = 30 + Math.random() * 20;
    const x = radius + Math.random() * (width - 2 * radius);
    const y = radius + Math.random() * (height - 2 * radius);
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

  // Create image data for direct pixel manipulation
  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Draw metaball field by manipulating pixels directly
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
