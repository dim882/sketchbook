export type PseudoRandomNumberGenerator = () => number;
export type IPointTuple = [number, number];

const GRID_CELL_SIZE = 50;
const CIRCLE_RADIUS_BASE = 4;
const BACKGROUND_COLOR = '#fcfaf7';
const CIRCLE_COLOR_1 = '#333333';
const CIRCLE_COLOR_2 = '#b94f46';
const BLOB_COLOR = '#d9b38c';

const getFloat = (generateNumber: PseudoRandomNumberGenerator, lower = 0, upper = 1) => {
  return (upper - lower) * generateNumber() + lower;
};

const getInteger = (generateNumber: PseudoRandomNumberGenerator, lower = 0, upper = 1) => {
  return Math.floor(getFloat(generateNumber, lower, upper));
};

const prng = Math.random;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  if (context) {
    render(context);
  }
});

function render(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;

  context.fillStyle = BACKGROUND_COLOR;
  context.fillRect(0, 0, width, height);

  // Draw large blob circle in bottom third, slightly left of center
  const blobRadius = Math.min(width, height) * 0.2;
  const blobX = width * 0.75;
  const blobY = height * 0.66;
  context.fillStyle = BLOB_COLOR;
  context.beginPath();
  context.arc(blobX, blobY, blobRadius, 0, Math.PI);
  context.fill();

  const cols = Math.floor(width / GRID_CELL_SIZE);
  const rows = Math.floor(height / GRID_CELL_SIZE);

  const startX = (width - cols * GRID_CELL_SIZE) / 2 + GRID_CELL_SIZE / 2;
  const startY = (height - rows * GRID_CELL_SIZE) / 2 + GRID_CELL_SIZE / 2;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = startX + col * GRID_CELL_SIZE;
      const y = startY + row * GRID_CELL_SIZE;

      const coefficient = Math.abs(Math.sin(x * 1.7)) * Math.abs(Math.sin(y * 2.9));

      const radius = CIRCLE_RADIUS_BASE * coefficient * 1.4;

      context.fillStyle = CIRCLE_COLOR_1;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
      console.log(radius);

      if (radius < 0.15) {
        context.fillStyle = CIRCLE_COLOR_2;
        context.beginPath();
        context.arc(x, y, radius * 100, 0, Math.PI * 2);
        context.fill();
      }
    }
  }
}
