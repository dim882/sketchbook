export type PseudoRandomNumberGenerator = () => number;

export function saveAndRestore(context: CanvasRenderingContext2D, callback: () => void) {
  context.save();
  callback();
  context.restore();
}

export function drawArc(
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

const getFloat = (generateNumber: PseudoRandomNumberGenerator, lower = 0, upper = 1) => {
  return (upper - lower) * generateNumber() + lower;
};

const getInteger = (generateNumber: PseudoRandomNumberGenerator, lower = 0, upper = 1) => {
  return Math.floor(getFloat(generateNumber, lower, upper));
};
