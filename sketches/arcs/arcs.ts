import { IPointTuple, getFloat, getInteger } from './arcs.utils';

const prng = Math.random;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  render(context);
});

function render(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;
  const center: IPointTuple = [width / 2, height / 2];

  const baseHue = getInteger(prng, 0, 270);

  let radius = 50;
  while (radius < width / 2) {
    const FULL_ROTATION = 2 * Math.PI;
    const startAngle = getFloat(prng, 0, FULL_ROTATION);
    const endAngle = getFloat(prng, startAngle, FULL_ROTATION);
    const width = getFloat(prng, 10, 50);
    const lightness = getInteger(prng, 10, 100);
    const arcColor = `lch(${lightness}% 0% ${baseHue} / 1)`;

    context.strokeStyle = arcColor;
    context.beginPath();
    context.arc(...center, radius, startAngle, endAngle);
    context.lineWidth = width;
    context.stroke();
    radius += width + 5;
  }
}
