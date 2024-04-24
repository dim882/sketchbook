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

  let radius = 50;
  while (radius < width / 2) {
    radius += getInteger(prng, 5, 100);
    const FULL_ROTATION = 2 * Math.PI;
    const startAngle = getFloat(prng, 0, FULL_ROTATION);
    const endAngle = getFloat(prng, startAngle, FULL_ROTATION);
    console.log(radius);

    context.strokeStyle = '#000';
    context.beginPath();
    context.arc(...center, radius, startAngle, endAngle);
    context.lineWidth = 20;
    context.stroke();
  }
}
