export function traceArc(
  context: CanvasRenderingContext2D,
  radius: number,
  startAngle: number,
  endAngle: number,
  width: number
) {
  context.beginPath();
  context.arc(0, 0, radius + width, startAngle, endAngle);
  context.arc(0, 0, radius, endAngle, startAngle, true);
  context.closePath();
  context.fill();
}
