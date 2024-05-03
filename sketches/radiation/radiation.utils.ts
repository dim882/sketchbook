export type IPointTuple = [number, number];

export function traceEquilateralTriangle(
  context: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  sideLength: number
): void {
  const height = (sideLength * Math.sqrt(3)) / 2;
  const verticalOffset = (2 / 3) * height;

  tracePath(context, [
    [cx, cy - verticalOffset],
    [cx + sideLength / 2, cy + (1 / 3) * height],
    [cx - sideLength / 2, cy + (1 / 3) * height],
  ]);
}

export function tracePath(context: CanvasRenderingContext2D, points: IPointTuple[]) {
  context.beginPath();
  points.forEach(([x, y], index) => (index === 0 ? context.moveTo(x, y) : context.lineTo(x, y)));
  context.closePath();
}

export function drawRadiatingLines(context: CanvasRenderingContext2D) {
  const numLines = 100;
  const angleIncrement = 360 / numLines;

  for (let i = 0; i < numLines; i++) {
    const angle = angleIncrement * i;
    const radians = (angle * Math.PI) / 180;
    const x = Math.cos(radians) * 400; // Line length of 400 pixels
    const y = Math.sin(radians) * 400;

    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(x, y);
    context.strokeStyle = '#fff';
    context.stroke();
  }
}
