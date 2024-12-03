export type PseudoRandomNumberGenerator = () => number;
export type IPointTuple = [number, number];

const SQUARE_SIZE = 200;

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

  drawSquareOutline(context, 20, centerY - SQUARE_SIZE / 2, SQUARE_SIZE);

  context.restore();
}

function drawSquareOutline(context: CanvasRenderingContext2D, x: number, y: number, size: number) {
  context.strokeStyle = '#000';
  context.strokeRect(x, y, size, size);
}
