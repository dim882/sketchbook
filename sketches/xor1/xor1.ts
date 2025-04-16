export type PseudoRandomNumberGenerator = () => number;
export type IPointTuple = [number, number];

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  if (context) {
    render(context);
  }
});

function drawConcenticRings(
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

function render(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;
  const center: IPointTuple = [width / 2, height / 2];

  const ringWidth = 40;
  const ringSpacing = 40;
  const maxRadius = Math.min(width, height) / 2 - ringWidth;

  // Create offscreen canvas
  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = width;
  offscreenCanvas.height = height;
  const offscreenContext = offscreenCanvas.getContext('2d');

  if (!offscreenContext) return;

  // Draw to offscreen canvas with XOR
  offscreenContext.globalCompositeOperation = 'xor';

  // Draw first set of rings
  drawConcenticRings(offscreenContext, center, maxRadius, ringWidth, ringSpacing);

  // Draw second set of rings with offset
  const offsetCenter: IPointTuple = [center[0] + 20, center[1]];
  drawConcenticRings(offscreenContext, offsetCenter, maxRadius, ringWidth, ringSpacing);

  // Now draw to the main canvas
  // First, clear with white background
  context.fillStyle = 'white';
  context.fillRect(0, 0, width, height);

  // Draw the offscreen canvas content onto the main canvas
  context.drawImage(offscreenCanvas, 0, 0);
}
