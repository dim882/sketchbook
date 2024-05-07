import {
  IPointTuple,
  addBackground,
  createCanvas,
  drawInnerRadiatingTriangle,
  drawOuterRadiatingTriangle,
  drawRadiatingLines,
  drawTriangleWithHole,
  saveAndRestore,
  traceEquilateralTriangle,
} from './radiation.utils';

// const prng = createPRNG(40502);
const prng = Math.random;

window.addEventListener('DOMContentLoaded', () => {
  // prettier-ignore
  const contexts = Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => canvas.getContext('2d'));

  render(contexts);
});

function render(contexts: CanvasRenderingContext2D[]) {
  const context = contexts[0];
  const { width, height } = context.canvas;
  const [centerX, centerY]: IPointTuple = [width / 2, height / 2];

  addBackground(context, width, height);

  const scratchContext = createCanvas(width, height);

  saveAndRestore(context, () => {
    context.translate(centerX, centerY + height / 9);
    drawInnerRadiatingTriangle(context);
  });

  saveAndRestore(scratchContext, () => {
    scratchContext.translate(centerX, centerY + height / 9);
    drawOuterRadiatingTriangle(scratchContext, 510, 900, 1);
  });

  context.drawImage(scratchContext.canvas, 0, 0);

  scratchContext.fillRect(0, 0, width, height);

  saveAndRestore(scratchContext, () => {
    scratchContext.translate(centerX, centerY + height / 9);
    drawOuterRadiatingTriangle(scratchContext, 910, 1200, 4);
  });

  context.drawImage(scratchContext.canvas, 0, 0);
}
