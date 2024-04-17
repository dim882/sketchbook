import { range, getInteger, createPRNG, IPointTuple, tracePath } from './utils.js';

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

  grid.forEach((point: IPointTuple) => {
    context.beginPath();
    context.arc(...point, 30, 0, 2 * Math.PI);
    context.fillStyle = fillColor;
    context.fill();
  });

  console.log(grid);
}

const createGrid = (width: number, height: number, size: number) => {
  return range(0, width, size).flatMap((x) => range(0, height, size).map((y) => [x, y]));
};
