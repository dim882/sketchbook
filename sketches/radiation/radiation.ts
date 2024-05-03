import { IPointTuple, drawRadiatingLines, traceEquilateralTriangle } from './radiation.utils';

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
  context.fillStyle = `#000`;
  context.fillRect(0, 0, width, height);

  context.translate(...center);

  traceEquilateralTriangle(context, 0, 0, 400);
  context.clip();

  drawRadiatingLines(context, 0, 0, 400);
}

// context.beginPath();
// context.arc(0, 0, 300, 0, Math.PI * 2);
// context.fill();
