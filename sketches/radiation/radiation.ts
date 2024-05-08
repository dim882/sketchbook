import { curry } from 'ramda';
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
  const center: IPointTuple = [width / 2, height / 2];
  const GAP_SIZE = 40;
  let startingSideLength = 500;

  addBackground(mainContext, width, height);

  const offset = offsetCenter(...center, height);

  saveAndRestore(mainContext, () => {
    mainContext.translate(...offset(9));
    drawInnerRadiatingTriangle(mainContext, startingSideLength);
  });

  saveAndRestore(scratchContexts[0], (ctx) => {
    ctx.translate(...offset(9));
    drawTriangleWithHole(540, 900, 0, 0, ctx);
  });
  saveAndRestore(scratchContexts[0], (ctx) => {
    ctx.translate(...center);
    drawOuterRadiatingTriangle(ctx, 0);
  });

  mainContext.drawImage(scratchContexts[0].canvas, 0, 0);

  saveAndRestore(scratchContexts[1], (ctx) => {
    ctx.translate(...offset(9));
    drawTriangleWithHole(940, 1200, 0, 0, ctx);
  });
  saveAndRestore(scratchContexts[1], (ctx) => {
    ctx.translate(...offset(6));
    drawOuterRadiatingTriangle(ctx, 0);
  });

  mainContext.drawImage(scratchContexts[1].canvas, 0, 0);
}

const offsetCenter = curry(
  (centerX: number, centerY: number, height: number, divisor: number) =>
    [centerX, centerY + height / divisor] as IPointTuple
);
