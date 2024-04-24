import { IPointTuple, getInteger } from './arcs.utils';

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
    console.log(radius);

    context.strokeStyle = '#000';
    context.beginPath();
    context.arc(...center, radius, 0, 2 * Math.PI);
    context.lineWidth = 50;
    context.stroke();
  }
}
