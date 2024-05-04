import {
  IPointTuple,
  createCanvas,
  drawRadiatingLines,
  drawTriangleWithHole,
  traceEquilateralTriangle,
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

  saveAndRestore(context, () => {
    context.translate(centerX, centerY + height / 9);
    drawInnerRadiatingTriangle(context);
  });

  const scratchContext = createCanvas(width, height);

  saveAndRestore(scratchContext, () => {
    scratchContext.translate(centerX, centerY + height / 9);
    drawOuterRadiatingTriangle(scratchContext);
  });

  context.drawImage(scratchContext.canvas, 0, 0);
}

function drawOuterRadiatingTriangle(context: CanvasRenderingContext2D) {
  drawTriangleWithHole(context, 0, 0, 900, 500);
  context.globalCompositeOperation = 'source-atop';
  drawRadiatingLines(context, 900, 2);
  context.globalCompositeOperation = 'source-over';
}

function addBackground(context: CanvasRenderingContext2D, width: number, height: number) {
  context.fillStyle = `#000`;
  context.fillRect(0, 0, width, height);
}

function drawInnerRadiatingTriangle(context: CanvasRenderingContext2D) {
  traceEquilateralTriangle(context, 0, 0, 500);
  context.clip();
  drawRadiatingLines(context, 600, -0.7);
}

function saveAndRestore(context: CanvasRenderingContext2D, callback: () => void) {
  context.save();
  callback();
  context.restore();
}
