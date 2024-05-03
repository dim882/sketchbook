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

  context.translate(...center);

  traceEquilateralTriangle(context, 0, 0, 400);
  context.clip();

  // context.beginPath();
  // context.arc(0, 0, 300, 0, Math.PI * 2);
  // context.fill();

  const numLines = 100; // Total number of lines
  const angleIncrement = 360 / numLines;

  for (let i = 0; i < numLines; i++) {
    const angle = angleIncrement * i;
    const radians = (angle * Math.PI) / 180;
    const x = Math.cos(radians) * 400; // Line length of 400 pixels
    const y = Math.sin(radians) * 400;

    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(x, y);
    context.strokeStyle = '#000';
    context.stroke();
  }
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
