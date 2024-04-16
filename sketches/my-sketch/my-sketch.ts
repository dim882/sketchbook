import * as R from 'ramda';
import { makeFuzzer } from './utils.js';

type IPoint = [number, number];
document.body.onload = () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');

  render(ctx);
};

function render(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;
  const center: IPoint = [width / 2, height / 2];

  context.fillStyle = '#000';
  context.fillRect(0, 0, width, height);

  const makeFuzz = makeFuzzer({ context, radius: 200, iterations: 30 });

  makeFuzz(...center, 'green');

  R.range(0, 20).forEach((i) => {
    context.save();
    context.translate(...center);
    context.rotate(i * 0.2);
    drawEquilateralTriangle(context, 0, 0, i * 40);
    context.restore();
  });
}

function drawEquilateralTriangle(ctx: CanvasRenderingContext2D, cx: number, cy: number, sideLength: number): void {
  // Height of the triangle
  const height = (sideLength * Math.sqrt(3)) / 2;

  // The vertical offset from the centroid to the top vertex is 2/3 of the height
  const verticalOffset = (2 / 3) * height;

  // The vertices are now defined in terms of the centroid (cx, cy)
  const vertex1 = { x: cx, y: cy - verticalOffset };
  const vertex2 = { x: cx + sideLength / 2, y: cy + (1 / 3) * height };
  const vertex3 = { x: cx - sideLength / 2, y: cy + (1 / 3) * height };

  // Drawing the triangle
  ctx.beginPath();
  ctx.moveTo(vertex1.x, vertex1.y);
  ctx.lineTo(vertex2.x, vertex2.y);
  ctx.lineTo(vertex3.x, vertex3.y);
  ctx.closePath();

  // Styling
  ctx.strokeStyle = 'white';
  ctx.stroke();
}
