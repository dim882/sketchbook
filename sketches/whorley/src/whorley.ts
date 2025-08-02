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

  // Pre-calculate color values to avoid repeated string parsing
  const colorCache = new Map<number, [number, number, number]>();

  const getColor = (noiseValue: number): [number, number, number] => {
    const roundedNoise = Math.round(noiseValue * 1000) / 1000; // Round to 3 decimal places for caching

    if (colorCache.has(roundedNoise)) {
      return colorCache.get(roundedNoise)!;
    }

    const lightness = 90 - noiseValue * 80;
    const colorString = `lch(${lightness}% ${30 * noiseValue} ${formHue})`;
    const color = rgb(colorString);

    if (color) {
      const rgbValues: [number, number, number] = [
        Math.floor(color.r * 255),
        Math.floor(color.g * 255),
        Math.floor(color.b * 255),
      ];
      colorCache.set(roundedNoise, rgbValues);
      return rgbValues;
    }

    return [0, 0, 0]; // Fallback to black
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const noiseValue = utils.whorleyNoise(x * scale, y * scale);
      const index = (y * width + x) * 4;

      const [r, g, b] = getColor(noiseValue);

      data[index] = r; // R
      data[index + 1] = g; // G
      data[index + 2] = b; // B
      data[index + 3] = 255; // A
    }
  }

  context.putImageData(imageData, 0, 0);
}
