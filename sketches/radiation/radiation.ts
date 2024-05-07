import {
  IPointTuple,
  addBackground,
  drawInnerRadiatingTriangle,
  drawOuterRadiatingTriangle,
  drawTriangleWithHole,
  saveAndRestore,
} from './radiation.utils';

window.addEventListener('DOMContentLoaded', () => {
  // prettier-ignore
  const contexts = Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => canvas.getContext('2d'));

  render(contexts);
});

function render(contexts: CanvasRenderingContext2D[]) {
  const [mainContext, ...scratchContexts] = contexts;
  const { width, height } = mainContext.canvas;
  const [centerX, centerY] = [width / 2, height / 2];

  addBackground(mainContext, width, height);

  saveAndRestore(mainContext, () => {
    mainContext.translate(centerX, centerY + height / 9);
    drawInnerRadiatingTriangle(mainContext);
  });

  saveAndRestore(scratchContexts[0], (ctx) => {
    ctx.translate(centerX, centerY + height / 9);
    drawTriangleWithHole(ctx, 0, 0, 900, 510);
    drawOuterRadiatingTriangle(ctx, -1);
  });

  mainContext.drawImage(scratchContexts[0].canvas, 0, 0);

  saveAndRestore(scratchContexts[1], (ctx) => {
    ctx.translate(centerX, centerY + height / 9);
    drawTriangleWithHole(ctx, 0, 0, 1200, 910);
    drawOuterRadiatingTriangle(ctx, -2);
  });

  mainContext.drawImage(scratchContexts[1].canvas, 0, 0);
}
