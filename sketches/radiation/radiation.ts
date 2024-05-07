import {
  IPointTuple,
  addBackground,
  createCanvas,
  drawInnerRadiatingTriangle,
  drawRadiatingLines,
  drawTriangleWithHole,
  saveAndRestore,
} from './radiation.utils';

// const prng = createPRNG(40502);
const prng = Math.random;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  render(context);
});

function render(context: CanvasRenderingContext2D) {
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
    drawTriangleWithHole(context, 0, 0, 510, 900);
    saveAndRestore(context, () => {
      context.globalCompositeOperation = 'source-atop';
      drawRadiatingLines(context, 1000, 1);
    });
  });

  context.drawImage(scratchContext.canvas, 0, 0);

  scratchContext.fillRect(0, 0, width, height);

  saveAndRestore(scratchContext, () => {
    scratchContext.translate(centerX, centerY + height / 9);
    drawTriangleWithHole(context, 0, 0, 910, 1200);
    saveAndRestore(context, () => {
      context.globalCompositeOperation = 'source-atop';
      drawRadiatingLines(context, 1000, 1);
    });
  });

  context.drawImage(scratchContext.canvas, 0, 0);
}
