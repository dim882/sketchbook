import { createOffscreenCanvas, drawConcenticRings as drawConcentricRings, loop } from './xor1.utils';

export type PseudoRandomNumberGenerator = () => number;
export type IPointTuple = [number, number];

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  // Track mouse position
  let mousePosition: IPointTuple = [0, 0];

  // Add mouse move event listener
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
  const offsetX = (mousePosition[0] - center[0]) / 10;
  const offsetY = (mousePosition[1] - center[1]) / 10;

  offscreenContext.globalCompositeOperation = 'xor';
  drawConcentricRings(offscreenContext, center, maxRadius, ringWidth, ringSpacing);
  drawConcentricRings(offscreenContext, [center[0] + offsetX, center[1] + offsetY], maxRadius, ringWidth, ringSpacing);

  // Draw to the main canvas
  context.fillStyle = 'white';
  context.fillRect(0, 0, width, height);
  context.drawImage(offscreenCanvas, 0, 0);
}
