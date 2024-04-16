import * as R from 'ramda';
import { getInteger, makeFuzzer } from './utils.js';

type IPointTuple = [number, number];

document.body.onload = () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');

  render(ctx);
};

function render(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;
  const center: IPointTuple = [width / 2, height / 2];

  context.fillStyle = '#000';
  context.fillRect(0, 0, width, height);

  // makeFuzzer({ context, radius: 200, iterations: 30 })(...center, 'green');

  const hue = getInteger(Math.random, 0, 270);
  R.range(0, 25).forEach((i) => {
    const val = 25 - i;
    context.save();
    context.translate(...center);
    context.rotate(val * 0.2);

    drawEquilateralTriangle(context, 0, 0, val * 40);

    fill(context, hue);

    stroke(context);

    context.restore();
  });
}

function stroke(context: CanvasRenderingContext2D) {
  context.strokeStyle = 'rgba(255, 255, 255, .1)';
  context.stroke();
}

function fill(context: CanvasRenderingContext2D, hue: number) {
  context.fillStyle = `hsla(${hue}, 70%, 70%, .1)`;
  context.fill();
}

function drawEquilateralTriangle(context: CanvasRenderingContext2D, cx: number, cy: number, sideLength: number): void {
  const height = (sideLength * Math.sqrt(3)) / 2;
  const verticalOffset = (2 / 3) * height;

  tracePath(context, [
    [cx, cy - verticalOffset],
    [cx + sideLength / 2, cy + (1 / 3) * height],
    [cx - sideLength / 2, cy + (1 / 3) * height],
  ]);
}

function tracePath(context: CanvasRenderingContext2D, points: IPointTuple[]) {
  context.beginPath();
  points.forEach(([x, y], index) => (index === 0 ? context.moveTo(x, y) : context.lineTo(x, y)));
  context.closePath();
}
