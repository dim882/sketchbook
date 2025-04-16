import { IPoint, createOffscreenCanvas, drawConcentricRings, loop } from './xor1.utils';
import { palette } from './palette';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  let mousePosition: IPoint = { x: 0, y: 0 };

  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mousePosition = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  });

  if (context) {
    loop(context, (ctx) => render(ctx, mousePosition), 60);
  }
});

function render(context: CanvasRenderingContext2D, mousePosition: IPoint) {
  const { width, height } = context.canvas;
  const center: IPoint = { x: width / 2, y: height / 2 };

  const ringWidth = 40;
  const ringSpacing = 40;
  const maxRadius = Math.min(width, height) / 2 - ringWidth;
  const { offscreenContext, offscreenCanvas } = createOffscreenCanvas(width, height);

  if (!offscreenContext) return;

  // Calculate offset based on mouse position
  // Map mouse position to create an offset relative to the center
  let offsetX = (mousePosition.x - center.x) / 5;
  let offsetY = (mousePosition.y - center.y) / 5;

  const OFFSET_LIMIT = 30;
  offsetX = Math.max(-OFFSET_LIMIT, Math.min(OFFSET_LIMIT, offsetX));
  offsetY = Math.max(-OFFSET_LIMIT, Math.min(OFFSET_LIMIT, offsetY));

  offscreenContext.globalCompositeOperation = 'xor';
  drawConcentricRings(offscreenContext, center, maxRadius, ringWidth, ringSpacing);
  drawConcentricRings(
    offscreenContext,
    { x: center.x + offsetX, y: center.y + offsetY },
    maxRadius,
    ringWidth,
    ringSpacing
  );

  // Draw to the main canvas
  context.fillStyle = 'white';
  context.fillRect(0, 0, width, height);
  context.drawImage(offscreenCanvas, 0, 0);
}
