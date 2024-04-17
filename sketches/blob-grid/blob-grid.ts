import { range, getInteger, createPRNG, IPointTuple, tracePath, applyColorMatrix } from './utils.js';

// const prng = createPRNG(40502);
const prng = Math.random;

document.body.onload = () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  render(context);
};

function render(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;
  const center: IPointTuple = [width / 2, height / 2];

  const formHue = getInteger(prng, 0, 270);
  const backgroundHue = formHue + 180;

  const backgroundColor = `lch(95% 1% ${backgroundHue})`;
  const fillColor = `lch(20% 80% ${formHue})`;

  const grid = createGrid(width, height, 100);

  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, width, height);

  context.shadowColor = fillColor;
  context.shadowBlur = 40;
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;

  drawGrid(context, grid, fillColor);
  const invertMatrix = [
    [-1, 0, 0, 0, 1], // Red channel
    [0, -1, 0, 0, 1], // Green channel
    [0, 0, -1, 0, 1], // Blue channel
    [0, 0, 0, 1, 0], // Alpha channel (no change)
  ];

  const flattenMatrix = [
    [1, 0, 0, 0, 0], // Red channel transformation
    [0, 1, 0, 0, 0], // Green channel transformation
    [0, 0, 1, 0, 0], // Blue channel transformation
    [0, 0, 0, 18, -7], // Alpha channel transformation
  ];

  applyColorMatrix(context, flattenMatrix);
  console.log(grid);
}

function createGrid(width: number, height: number, size: number): IPointTuple[] {
  return range(0, width, size).flatMap((x) => range(0, height, size).map((y) => [x, y] as IPointTuple));
}

function drawGrid(context: CanvasRenderingContext2D, grid: IPointTuple[], fillColor: string) {
  grid.forEach((point: IPointTuple) => {
    context.beginPath();
    context.arc(...point, 30, 0, 2 * Math.PI);
    context.fillStyle = fillColor;
    context.fill();
  });
}

function drawWithShadow(context: CanvasRenderingContext2D) {
  context.shadowOffsetX = 10; // Sets the horizontal distance of the shadow from the shape
  context.shadowOffsetY = 10; // Sets the vertical distance of the shadow from the shape
  context.shadowBlur = 5; // Sets the blur level of the shadow
  context.shadowColor = 'rgba(0, 0, 0, 0.5)'; // Sets the color and transparency of the shadow
}
