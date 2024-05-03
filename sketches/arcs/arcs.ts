import { IPointTuple, getBoolean, getFloat, getInteger } from './arcs.utils';

const FULL_ROTATION = 2 * Math.PI;
const PADDING = 80;

const prng = Math.random;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  render(context);
});

function render(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;
  const center: IPointTuple = [width / 2, height / 2];

  const formHue = getInteger(prng, 0, 270);
  const backgroundHue = formHue + 180;
  context.fillStyle = `lch(99% 10% ${backgroundHue})`;
  context.fillRect(0, 0, width, height);

  let radius = 20;
  while (radius < width / 2 - PADDING) {
    let arcStartAngle = 0;
    const arcWidth = getFloat(prng, 10, 80);

    while (arcStartAngle < FULL_ROTATION) {
      const lightness = getInteger(prng, 10, 100);
      const arcColor = `lch(${lightness}% 20% ${formHue} / 1)`;

      const startAngle = getFloat(prng, arcStartAngle, arcStartAngle + Math.PI / 4);
      const endAngle = getFloat(prng, startAngle, startAngle + Math.PI / 3);

      traceArc(context, center, radius, startAngle, endAngle, arcWidth);

      getBoolean(prng, 0.3) ? stroke(context, arcColor) : fill(context, arcColor);
      arcStartAngle = endAngle + getFloat(prng, 0, Math.PI / 4);
      console.log({ radius, arcStartAngle });
    }

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
