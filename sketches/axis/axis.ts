import { traceArc } from './axis.utils';

export type PseudoRandomNumberGenerator = () => number;
export type IPointTuple = [number, number];

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

  traceArc(context, radius, 0, Math.PI / 2, 20);
  traceArc(context, radius, Math.PI, (Math.PI / 2) * 3, 200);

  context.restore();
}
