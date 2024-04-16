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

  drawEquilateralTriangle(context, width / 2, height / 2, 100);
}

function drawEquilateralTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, sideLength: number): void {
  const height = (sideLength * Math.sqrt(3)) / 2;

  const vertex1 = { x: x, y: y };
  const vertex2 = { x: x + sideLength / 2, y: y + height };
  const vertex3 = { x: x - sideLength / 2, y: y + height };

  ctx.beginPath();
  ctx.moveTo(vertex1.x, vertex1.y);
  ctx.lineTo(vertex2.x, vertex2.y);
  ctx.lineTo(vertex3.x, vertex3.y);
  ctx.closePath();

  ctx.strokeStyle = 'white';
  ctx.stroke();
}
