export type PseudoRandomNumberGenerator = () => number;
export type IPointTuple = [number, number];

const GRID_CELL_SIZE = 50;
const CIRCLE_RADIUS = 8;
const BACKGROUND_COLOR = '#fcfaf7';
const CIRCLE_COLOR = '#333333';

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

  const cols = Math.floor(width / GRID_CELL_SIZE);
  const rows = Math.floor(height / GRID_CELL_SIZE);

  const startX = (width - cols * GRID_CELL_SIZE) / 2 + GRID_CELL_SIZE / 2;
  const startY = (height - rows * GRID_CELL_SIZE) / 2 + GRID_CELL_SIZE / 2;

  context.fillStyle = CIRCLE_COLOR;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = startX + col * GRID_CELL_SIZE;
      const y = startY + row * GRID_CELL_SIZE;

      const wave = Math.sin(x * 0.02) * Math.sin(y * 0.02);
      const radius = CIRCLE_RADIUS + wave * 3;

      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
  }
}
