import { computeVoronoi } from './voronoi.utils';
export type PseudoRandomNumberGenerator = () => number;
export type IPointTuple = [number, number];

const getFloat = (generateNumber: PseudoRandomNumberGenerator, lower = 0, upper = 1) => {
  return (upper - lower) * generateNumber() + lower;
};

const getInteger = (generateNumber: PseudoRandomNumberGenerator, lower = 0, upper = 1) => {
  return Math.floor(getFloat(generateNumber, lower, upper));
};

const prng = Math.random;

const NUM_POINTS = 20;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  if (context) {
    render(context);
  }

  function render(context: CanvasRenderingContext2D) {
    const { width, height } = context.canvas;

    const points = Array.from({ length: NUM_POINTS }, () => ({
      x: getFloat(prng, 0, width),
      y: getFloat(prng, 0, height),
    }));
    const boundingPolygon = [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height },
    ];
    const diagram = computeVoronoi(points, boundingPolygon);
    console.log(diagram);

    diagram.forEach(({ cell, site }) => {
      context.beginPath();
      cell.forEach((point, index) => {
        if (index === 0) {
          context.moveTo(point.x, point.y);
        } else {
          context.lineTo(point.x, point.y);
        }
      });
      context.closePath();

      context.fillStyle = `hsl(${getFloat(prng, 0, 360)}, 70%, 70%)`;
      context.fill();
      context.strokeStyle = 'white';
      context.stroke();
    });
  }
});
