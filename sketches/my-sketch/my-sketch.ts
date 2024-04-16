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

  context.fillStyle = 'lch(10% 10% 10)';
  context.fillRect(0, 0, width, height);

  const fillColor = makeRandomColor();
  const strokeColor = 'rgba(255, 255, 255, .1)';

  R.range(0, 25).forEach((i) => {
    const val = 25 - i;

    saveAndRestore(context, () => {
      context.translate(...center);
      context.rotate(val * 0.2);
      traceEquilateralTriangle(context, 0, 0, val * 40);
      context.fillStyle = fillColor;
      context.fill();
      context.strokeStyle = strokeColor;
      context.stroke();
    });
  });
}

function makeRandomColor() {
  const hue = getInteger(Math.random, 0, 270);

  return `lch(60% 60% ${hue} / .1)`;
}

function traceEquilateralTriangle(context: CanvasRenderingContext2D, cx: number, cy: number, sideLength: number): void {
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

function saveAndRestore(context: CanvasRenderingContext2D, callback: () => void) {
  context.save();
  callback();
  context.restore();
}
