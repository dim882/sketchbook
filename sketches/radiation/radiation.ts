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
  const [centerX, centerY]: IPointTuple = [width / 2, height / 2];

  addBackground(mainContext, width, height);

  saveAndRestore(mainContext, () => {
    mainContext.translate(centerX, centerY + height / 9);
    drawInnerRadiatingTriangle(mainContext);
  });

  saveAndRestore(scratchContexts[0], () => {
    scratchContexts[0].translate(centerX, centerY + height / 9);
    drawTriangleWithHole(scratchContexts[0], 0, 0, 900, 510);
    drawOuterRadiatingTriangle(scratchContexts[0], 510, 900, -1);
  });

  mainContext.drawImage(scratchContexts[0].canvas, 0, 0);

  saveAndRestore(scratchContexts[1], () => {
    scratchContexts[1].translate(centerX, centerY + height / 9);
    drawTriangleWithHole(scratchContexts[1], 0, 0, 1200, 910);
    drawOuterRadiatingTriangle(scratchContexts[1], 910, 1200, -2);
  });

  mainContext.drawImage(scratchContexts[1].canvas, 0, 0);
}
