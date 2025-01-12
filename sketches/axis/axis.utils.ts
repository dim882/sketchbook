export function traceArc(context: CanvasRenderingContext2D, radius: number, startAngle: number, endAngle: number) {
  context.beginPath();
  context.arc(0, 0, radius, startAngle, endAngle);
  context.stroke();
}
