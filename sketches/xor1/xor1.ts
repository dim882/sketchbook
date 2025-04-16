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

  context.fillStyle = 'white';
  context.fillRect(0, 0, width, height);

  drawConcenticRings(context, center, maxRadius, ringWidth, ringSpacing);
}
