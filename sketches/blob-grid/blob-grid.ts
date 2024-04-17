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

  const BLUR = 10;
  const ALPHA_TRANSFORM = 100;
  const CELL_SIZE = 100;
  const CIRCLE_OFFSET = 28;
  const RADIUS = 35;

  // prettier-ignore
  const grid = createGrid(width, height, CELL_SIZE)
    .map((point) => randomOffset(point, CIRCLE_OFFSET));

  // context.fillStyle = backgroundColor;
  // context.fillRect(0, 0, width, height);

  applyBlur(context, BLUR);

  drawGrid(context, grid, RADIUS, fillColor);

  // prettier-ignore
  const flattenMatrix = [
    [1, 0, 0, 0,    0], // R 
    [0, 1, 0, 0,    0], // G
    [0, 0, 1, 0,    0], // B
    [0, 0, 0, ALPHA_TRANSFORM, -15], // A
  ];

  applyColorMatrix(context, flattenMatrix);
}

function applyBlur(context: CanvasRenderingContext2D, BLUR: number) {
  context.filter = `blur(${BLUR}px)`;
}

function createGrid(width: number, height: number, size: number): IPointTuple[] {
  // prettier-ignore
  return range(0, width, size)
    .flatMap((x) => range(0, height, size)
    .map((y) => [x, y] as IPointTuple));
}

function drawGrid(context: CanvasRenderingContext2D, grid: IPointTuple[], radius: number, fillColor: string) {
  grid.forEach((point: IPointTuple) => {
    context.beginPath();
    context.arc(...point, radius, 0, 2 * Math.PI);
    context.fillStyle = fillColor;
    context.fill();
  });
}

function randomOffset([x, y]: IPointTuple, offset: number): IPointTuple {
  const offsetRange = [-offset, offset];
  return [x + getInteger(Math.random, ...offsetRange), y + getInteger(Math.random, ...offsetRange)];
}
