import { IPointTuple, createOffscreenCanvas, drawConcentricRings as drawConcentricRings, loop } from './xor1.utils';

export type PseudoRandomNumberGenerator = () => number;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  let mousePosition: IPointTuple = [0, 0];

  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mousePosition = [event.clientX - rect.left, event.clientY - rect.top];
  });

  if (context) {
    loop(context, (ctx) => render(ctx, mousePosition), 60);
  }
});

function render(context: CanvasRenderingContext2D, mousePosition: IPointTuple) {
  const { width, height } = context.canvas;
  const center: IPointTuple = [width / 2, height / 2];

  const ringWidth = 40;
  const ringSpacing = 40;
  const maxRadius = Math.min(width, height) / 2 - ringWidth;
  const { offscreenContext, offscreenCanvas } = createOffscreenCanvas(width, height);

  if (!offscreenContext) return;

  // Calculate offset based on mouse position
  // Map mouse position to create an offset relative to the center
  let offsetX = (mousePosition[0] - center[0]) / 5;
  let offsetY = (mousePosition[1] - center[1]) / 5;

  const OFFSET_LIMIT = 30;
  offsetX = Math.max(-OFFSET_LIMIT, Math.min(OFFSET_LIMIT, offsetX));
  offsetY = Math.max(-OFFSET_LIMIT, Math.min(OFFSET_LIMIT, offsetY));

  offscreenContext.globalCompositeOperation = 'xor';
  drawConcentricRings(offscreenContext, center, maxRadius, ringWidth, ringSpacing);
  drawConcentricRings(offscreenContext, [center[0] + offsetX, center[1] + offsetY], maxRadius, ringWidth, ringSpacing);

  // Draw to the main canvas
  context.fillStyle = 'white';
  context.fillRect(0, 0, width, height);
  context.drawImage(offscreenCanvas, 0, 0);
}
