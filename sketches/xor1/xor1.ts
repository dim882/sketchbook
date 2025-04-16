import { createOffscreenCanvas, drawConcenticRings } from './xor1.utils';

export type PseudoRandomNumberGenerator = () => number;
export type IPointTuple = [number, number];

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  if (context) {
    render(context);
  }
});

function render(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;
  const center: IPointTuple = [width / 2, height / 2];

  const ringWidth = 40;
  const ringSpacing = 40;
  const maxRadius = Math.min(width, height) / 2 - ringWidth;
  const { offscreenContext, offscreenCanvas } = createOffscreenCanvas(width, height);

  if (!offscreenContext) return;

  offscreenContext.globalCompositeOperation = 'xor';
  drawConcenticRings(offscreenContext, center, maxRadius, ringWidth, ringSpacing);
  drawConcenticRings(offscreenContext, [center[0] + 20, center[1]], maxRadius, ringWidth, ringSpacing);

  // Draw to the main canvas
  context.fillStyle = 'white';
  context.fillRect(0, 0, width, height);
  context.drawImage(offscreenCanvas, 0, 0);
}
