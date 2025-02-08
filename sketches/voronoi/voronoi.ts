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

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  if (context) {
    render(context);
  }

  function render(context: CanvasRenderingContext2D) {
    const { width, height } = context.canvas;

    // Generate random points
    const numPoints = 20;
    const points = Array.from({ length: numPoints }, () => ({
      x: getFloat(prng, 0, width),
      y: getFloat(prng, 0, height),
    }));

    // Generate the voronoi diagram
    const diagram = computeVoronoi(points);

    // Draw each cell
    diagram.forEach(({ cell, site }) => {
      // Draw cell
      context.beginPath();
      cell.forEach((point, index) => {
        if (index === 0) {
          context.moveTo(point.x, point.y);
        } else {
          context.lineTo(point.x, point.y);
        }
      });
      context.closePath();

      // Fill with random color
      context.fillStyle = `hsl(${getFloat(prng, 0, 360)}, 70%, 70%)`;
      context.fill();
      context.strokeStyle = 'white';
      context.stroke();

      // Draw site point
      context.beginPath();
      context.arc(site.x, site.y, 2, 0, Math.PI * 2);
      context.fillStyle = 'black';
      context.fill();
    });
  }
});
