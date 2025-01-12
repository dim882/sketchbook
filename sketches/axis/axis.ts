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

export type IQuadrants = [IQuadrant, IQuadrant, IQuadrant, IQuadrant];

const QUADRANTS: IQuadrants = [
  [0, Math.PI / 2],
  [Math.PI / 2, Math.PI],
  [Math.PI, (Math.PI / 2) * 3],
  [(Math.PI / 2) * 3, 0],
];

function render(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;
  const center: IPointTuple = [width / 2, height / 2];

  context.save();
  context.translate(...center);

  const radius = Math.min(width, height) * 0.2;
  context.lineWidth = 1;

  traceArc(context, radius, ...QUADRANTS[0], 20);
  traceArc(context, radius, ...QUADRANTS[2], 100);

  range(100, radius, 10).forEach((i) => traceArc(context, i, ...QUADRANTS[1], 1));
  range(150, radius, 20).forEach((i) => traceArc(context, i, ...QUADRANTS[3], 1));

  context.restore();
}
