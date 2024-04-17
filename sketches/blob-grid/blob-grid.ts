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

  const backgroundColor = `lch(20% 10% ${backgroundHue})`;

  const fillColor = `lch(60% 30% ${formHue} / .1)`;
  const size = 100;
  const grid = range(0, width, size).flatMap((x) => {
    return range(0, height, size).map((y) => {
      return [x, y];
    });
  });
  console.log(grid);
}
