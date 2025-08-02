import * as utils from './whorley.utils';
import { lch, Rgb, rgb } from 'culori';

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

  const formHue = utils.getInteger(prng, 0, 270);
  const imageData = context.createImageData(width, height);
  const data = imageData.data;
  const scale = 0.002;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const noiseValue = utils.whorleyNoise(x * scale, y * scale);
      const index = (y * width + x) * 4;

      const lightness = 90 - noiseValue * 80; // Invert lightness: high noise = light, low noise = dark
      const colorString = `lch(${lightness}% ${30 * noiseValue} ${formHue})`;
      const color = rgb(colorString);

      if (color) {
        data[index] = Math.floor(color.r * 255); // R
        data[index + 1] = Math.floor(color.g * 255); // G
        data[index + 2] = Math.floor(color.b * 255); // B
        data[index + 3] = 255; // A
      }
    }
  }

  context.putImageData(imageData, 0, 0);
}
