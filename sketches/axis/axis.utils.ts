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

// Usage examples:
// console.log(range(0, 5));        // [0, 1, 2, 3, 4]
// console.log(range(1, 10, 2));    // [1, 3, 5, 7, 9]
// console.log(range(5, 0, -1));    // [5, 4, 3, 2, 1]
