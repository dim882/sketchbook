import { IPointTuple } from './base.utils';

// const prng = createPRNG(40502);
const prng = Math.random;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  render(context);
});

function render(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;
  const center: IPointTuple = [width / 2, height / 2];

  //  Do work here
  context.fillStyle = `#000`;
  context.fillRect(0, 0, width, height);

  context.translate(...center);
  traceEquilateralTriangle(context, 0, 0, 400);
  context.fillStyle = '#fff';
  context.fill();
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
