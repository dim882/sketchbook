import * as utils from './whorley.utils';
import { getInteger } from './whorley.utils';

const prng = Math.random;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  if (context) {
    render(context);
  }
});

function render(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;

  const formHue = getInteger(prng, 0, 270);
  const backgroundHue = formHue + 180;

  context.fillStyle = `lch(60% 10% ${backgroundHue})`;
  context.fillRect(0, 0, width, height);

  const imageData = context.createImageData(width, height);
  const data = imageData.data;

  const scale = 0.002;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const noiseValue = utils.whorleyNoise(x * scale, y * scale);
      const index = (y * width + x) * 4;

      const intensity = Math.floor(noiseValue * 255);

      data[index] = intensity; // R
      data[index + 1] = intensity; // G
      data[index + 2] = intensity; // B
      data[index + 3] = 255; // A
    }
  }

  context.putImageData(imageData, 0, 0);
}
