import {
  getInteger,
  IPointTuple,
  createCanvas,
  flattenColors,
  drawGrid,
  applyBlur,
  randomOffset,
  createGrid,
} from './blob-grid-svg.utils.js';

window.addEventListener('DOMContentLoaded', () => {
  //
});

function render(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;
  const center: IPointTuple = [width / 2, height / 2];

  const formHue = getInteger(prng, 0, 270);
  const backgroundHue = formHue + 180;

  const backgroundColor = `lch(95% 40% ${backgroundHue})`;
  const fillColor = `lch(40% 50% ${formHue})`;

  const BLUR = 30;
  const ALPHA_TRANSFORM = 300;
  const CELL_SIZE = 250;
  const CIRCLE_OFFSET = 80;
  const RADIUS = 100;

  // prettier-ignore
  const grid = createGrid(width, height, CELL_SIZE)
    .map((point) => randomOffset(point, CIRCLE_OFFSET));

  // context.fillStyle = backgroundColor;
  // context.fillRect(0, 0, width, height);

  const blobContext = createCanvas(width, height);

  // applyBlur(blobContext, BLUR);

  context.filter = 'url(#goo)';
  drawGrid(context, grid, RADIUS, fillColor);

  // prettier-ignore
  // flattenColors(blobContext, ALPHA_TRANSFORM, );

  // context.drawImage(blobContext.canvas, 0, 0);
}
