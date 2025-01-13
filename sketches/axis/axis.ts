import { range, saveAndRestore, traceArc } from './axis.utils';

export type IPointTuple = [number, number];
export type IQuadrant = [number, number];
export type IQuadrants = [IQuadrant, IQuadrant, IQuadrant, IQuadrant];

const QUADRANTS: IQuadrants = [
  [0, Math.PI / 2],
  [Math.PI / 2, Math.PI],
  [Math.PI, (Math.PI / 2) * 3],
  [(Math.PI / 2) * 3, 0],
];

const BLACK = '#000';
const BLUE = 'hsl(212, 65%, 54%)';

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

  saveAndRestore(context, () => {
    context.translate(...center);

    context.lineWidth = 0;
    context.beginPath();
    context.rect(0, -100, 100, 100);
    context.fillStyle = BLUE;
    context.fill();

    context.fillStyle = BLACK;

    saveAndRestore(context, () => {
      context.beginPath();
      range(0, 4).forEach(() => {
        context.moveTo(0, 0);
        context.lineTo((width / 2) * 0.7, 0);
        context.rotate(Math.PI / 2);
      });
      context.stroke();
    });

    const radius = Math.min(width, height) * 0.2;

    traceArc(context, radius, ...QUADRANTS[0], 20);
    traceArc(context, radius, ...QUADRANTS[2], 100);

    range(100, radius, 10).forEach((i) => traceArc(context, i, ...QUADRANTS[1], 1));
    // range(150, radius, 20).forEach((i) => traceArc(context, i, ...QUADRANTS[3], 1));
  });
}
