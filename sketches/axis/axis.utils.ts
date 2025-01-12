export function traceArc(
  context: CanvasRenderingContext2D,
  radius: number,
  startAngle: number,
  endAngle: number,
  width: number
) {
  const innerRadius = radius - width / 2;
  const outerRadius = radius + width / 2;

  context.beginPath();
  context.arc(0, 0, outerRadius, startAngle, endAngle);
  context.arc(0, 0, innerRadius, endAngle, startAngle, true);
  context.closePath();
  context.fill();
}
