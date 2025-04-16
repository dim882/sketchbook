import { IPointTuple } from './xor1';

export function createOffscreenCanvas(width: number, height: number) {
  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = width;
  offscreenCanvas.height = height;

  const offscreenContext = offscreenCanvas.getContext('2d');
  return { offscreenContext, offscreenCanvas };
}

export function drawConcenticRings(
  context: CanvasRenderingContext2D,
  center: IPointTuple,
  maxRadius: number,
  ringWidth: number,
  ringSpacing: number
) {
  for (let radius = ringWidth; radius <= maxRadius; radius += ringWidth + ringSpacing) {
    context.beginPath();
    context.arc(center[0], center[1], radius, 0, Math.PI * 2);
    context.lineWidth = ringWidth;
    context.strokeStyle = 'black';
    context.stroke();
  }
}
