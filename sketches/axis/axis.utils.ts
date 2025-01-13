export function saveAndRestore(context: CanvasRenderingContext2D, callback: () => void) {
  context.save();
  callback();
  context.restore();
}

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

export const range = (start: number, end: number, step: number = 1): number[] =>
  Array.from({ length: Math.ceil((end - start) / step) }, (_, i) => start + i * step);
