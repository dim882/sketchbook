import {
  IPointTuple,
  addBackground,
  drawInnerRadiatingTriangle,
  drawOuterRadiatingTriangle,
  saveAndRestore,
} from './radiation.utils';

window.addEventListener('DOMContentLoaded', () => {
  // prettier-ignore
  const contexts = Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => canvas.getContext('2d'));

  render(contexts);
});

function render(contexts: CanvasRenderingContext2D[]) {
  const [mainContext, scratchContext] = contexts;
  const { width, height } = mainContext.canvas;
  const [centerX, centerY]: IPointTuple = [width / 2, height / 2];

  addBackground(mainContext, width, height);

  saveAndRestore(mainContext, () => {
    mainContext.translate(centerX, centerY + height / 9);
    drawInnerRadiatingTriangle(mainContext);
  });

  saveAndRestore(scratchContext, () => {
    scratchContext.translate(centerX, centerY + height / 9);
    drawOuterRadiatingTriangle(scratchContext, 510, 900, 1);
  });

  mainContext.drawImage(scratchContext.canvas, 0, 0);

  scratchContext.fillRect(0, 0, width, height);

  saveAndRestore(scratchContext, () => {
    scratchContext.translate(centerX, centerY + height / 9);
    drawOuterRadiatingTriangle(scratchContext, 910, 1200, 4);
  });

  mainContext.drawImage(scratchContext.canvas, 0, 0);
}
