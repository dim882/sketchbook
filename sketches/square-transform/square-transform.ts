export type PseudoRandomNumberGenerator = () => number;
export type IPointTuple = [number, number];

const SQUARE_SIZE = 200;
const SQUARE_COUNT = 10;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  if (context) {
    render(context);
  }
});

function render(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;
  const centerY = height / 2;

  context.fillStyle = '#fff';
  context.fillRect(0, 0, width, height);

  const stepX = (width - 20 - SQUARE_SIZE) / SQUARE_COUNT;

  Array.from({ length: SQUARE_COUNT }).forEach((_, i) => {
    drawSquare(context, 20 + stepX * i, centerY - SQUARE_SIZE / 2, SQUARE_SIZE);
  });

  context.restore();
}

function drawSquare(context: CanvasRenderingContext2D, x: number, y: number, size: number) {
  context.strokeStyle = '#000';
  context.strokeRect(x, y, size, size);
}
