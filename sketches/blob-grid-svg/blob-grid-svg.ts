import { getInteger, createGrid } from './blob-grid-svg.utils.js';

window.addEventListener('DOMContentLoaded', () => {
  //
});

function render(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;

  const formHue = getInteger(prng, 0, 270);
  const backgroundHue = formHue + 180;

  const backgroundColor = `lch(95% 40% ${backgroundHue})`;
  const fillColor = `lch(40% 50% ${formHue})`;

  const CELL_SIZE = 250;
  const RADIUS = 100;

  const grid = createGrid(width, height, CELL_SIZE);
}
