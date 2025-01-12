import { range, traceArc } from './axis.utils';

export type PseudoRandomNumberGenerator = () => number;
export type IPointTuple = [number, number];
export type IQuadrant = [number, number];

const getFloat = (generateNumber: PseudoRandomNumberGenerator, lower = 0, upper = 1) => {
  return (upper - lower) * generateNumber() + lower;
};

const getInteger = (generateNumber: PseudoRandomNumberGenerator, lower = 0, upper = 1) => {
  return Math.floor(getFloat(generateNumber, lower, upper));
};

const prng = Math.random;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  if (context) {
    render(context);
  }
});

function render(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;
  const center: IPointTuple = [width / 2, height / 2];

  context.save();
  context.translate(...center);

  const radius = Math.min(width, height) * 0.2;
  context.lineWidth = 1;
  const QUADRANT_1: IQuadrant = [0, Math.PI / 2];
  const QUADRANT_2: IQuadrant = [Math.PI / 2, Math.PI];
  const QUADRANT_3: IQuadrant = [Math.PI, (Math.PI / 2) * 3];
  const QUADRANT_4: IQuadrant = [(Math.PI / 2) * 3, 0];

  traceArc(context, radius, ...QUADRANT_1, 20);
  traceArc(context, radius, ...QUADRANT_3, 100);

  range(100, radius, 10).forEach((i) => traceArc(context, i, ...QUADRANT_2, 1));
  range(150, radius, 20).forEach((i) => traceArc(context, i, ...QUADRANT_4, 1));

  context.restore();
}
