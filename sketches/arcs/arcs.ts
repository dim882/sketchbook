import { IPointTuple } from './base.utils';

const prng = Math.random;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  render(context);
});

function render(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;
  const center: IPointTuple = [width / 2, height / 2];

  context.strokeStyle = 'black';
  context.save();
  context.moveTo(...center);
  context.beginPath();
  context.arc(...center, 100, 0, 2 * Math.PI);
  context.lineWidth = 50;
  context.stroke();
  context.restore();
}
