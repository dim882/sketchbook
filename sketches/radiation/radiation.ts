import { IPointTuple, drawRadiatingLines, drawTriangleWithHole, traceEquilateralTriangle } from './radiation.utils';

// const prng = createPRNG(40502);
const prng = Math.random;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  render(context);
});

function render(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;
  const [centerX, centerY]: IPointTuple = [width / 2, height / 2];

  // addBackground(context, width, height);

  context.translate(centerX, centerY + height / 9);

  drawTriangleWithHole(context, 0, 0, 800, 0.3);

  // drawRadiationTriangle(context);
}

function addBackground(context: CanvasRenderingContext2D, width: number, height: number) {
  context.fillStyle = `#000`;
  context.fillRect(0, 0, width, height);
}

function drawRadiationTriangle(context: CanvasRenderingContext2D) {
  traceEquilateralTriangle(context, 0, 0, 800);
  context.clip();
  drawRadiatingLines(context, 0, 0, 600);
}
