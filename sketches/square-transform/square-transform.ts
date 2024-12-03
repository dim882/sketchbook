const SQUARE_SIZE = 200;
const SQUARE_COUNT = 10;
const MAX_ROTATION = Math.PI / 2;

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

  context.fillStyle = 'goldenrod';
  context.fillRect(0, 0, width, height);

  const stepX = (width - 20 - SQUARE_SIZE) / SQUARE_COUNT;

  Array.from({ length: SQUARE_COUNT }).forEach((_, i) => {
    const x = 20 + stepX * i;
    const y = centerY - SQUARE_SIZE / 2;
    const rotation = MAX_ROTATION * (i / (SQUARE_COUNT - 1));

    context.save();
    translateAndRotate(context, x, y, rotation);
    drawSquare(context, x, y, SQUARE_SIZE);
    context.restore();
  });
}

function translateAndRotate(context: CanvasRenderingContext2D, x: number, y: number, rotation: number) {
  const halfSide = SQUARE_SIZE / 2;

  context.translate(x + halfSide, y + halfSide);
  context.rotate(rotation);
  context.translate(-x - halfSide, -y - halfSide);
}

function drawSquare(context: CanvasRenderingContext2D, x: number, y: number, size: number) {
  context.strokeStyle = '#fff';
  context.strokeRect(x, y, size, size);
}
