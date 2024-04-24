import { IPointTuple, getBoolean, getFloat, getInteger } from './arcs.utils';

const FULL_ROTATION = 2 * Math.PI;

const prng = Math.random;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  render(context);
});

function render(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;
  const center: IPointTuple = [width / 2, height / 2];

  const baseHue = getInteger(prng, 0, 270); // Doesn't have an effect yet

  let radius = 50;
  while (radius < width / 2) {
    const lightness = getInteger(prng, 10, 100);
    const arcColor = `lch(${lightness}% 0% ${baseHue} / 1)`;

    const startAngle = getFloat(prng, 0, FULL_ROTATION);
    const endAngle = getFloat(prng, startAngle, startAngle + Math.PI / 2);
    const arcWidth = getFloat(prng, 10, 50);

    traceArc(context, center, radius, startAngle, endAngle, arcWidth);

    getBoolean(prng, 0.3) ? stroke(context, arcColor) : fill(context, arcColor);

    radius += arcWidth + 5;
  }
}

function fill(context: CanvasRenderingContext2D, arcColor: string) {
  context.fillStyle = arcColor;
  context.fill();
}

function stroke(context: CanvasRenderingContext2D, arcColor: string) {
  context.strokeStyle = arcColor;
  context.lineWidth = 1;
  context.stroke();
}

function traceArc(
  context: CanvasRenderingContext2D,
  center: IPointTuple,
  radius: number,
  startAngle: number,
  endAngle: number,
  arcWidth: number
) {
  context.beginPath();
  context.arc(...center, radius, startAngle, endAngle);

  // Draw line connecting the end of the first arc to the start of the second arc
  const endX = center[0] + (radius + arcWidth) * Math.cos(endAngle);
  const endY = center[1] + (radius + arcWidth) * Math.sin(endAngle);
  context.lineTo(endX, endY);

  // Draw the second arc (lower arc)
  context.arc(...center, radius + arcWidth, endAngle, startAngle, true);

  // Draw line closing the shape back to the start of the first arc
  const startX = center[0] + radius * Math.cos(startAngle);
  const startY = center[1] + radius * Math.sin(startAngle);
  context.lineTo(startX, startY);
}
