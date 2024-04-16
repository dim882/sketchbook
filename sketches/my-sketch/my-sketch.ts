import { makeFuzzer } from './utils.js';

document.body.onload = () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');

  render(ctx);
};

function render(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;

  context.fillStyle = '#000';
  context.fillRect(0, 0, width, height);
  const makeFuzz = makeFuzzer({ context, radius: 200, iterations: 30 });

  makeFuzz(width / 2, height / 2, 'green');
}
