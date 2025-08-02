import * as utils from './whorley.utils';

const SCALE = 0.002;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  if (context) {
    render(context);
  }
});

function render(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;
  const hue = utils.getInteger(Math.random, 0, 270);
  const getColor = utils.createColorFactory(hue);
  const imageData = context.createImageData(width, height);
  const data = imageData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const noiseValue = utils.whorleyNoise(x * SCALE, y * SCALE);
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
