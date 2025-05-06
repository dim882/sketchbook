import { computeVoronoi, generatePoissonPoints, PseudoRandomNumberGenerator, Point } from './voronoi.utils';

const prng: PseudoRandomNumberGenerator = Math.random;

const MIN_DIST = 50;
const K = 30;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  if (context) {
    render(context);
  }

  function render(context: CanvasRenderingContext2D) {
    const { width, height } = context.canvas;

    const points: Point[] = generatePoissonPoints(width, height, MIN_DIST, prng, K);

    const boundingPolygon: Point[] = [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height },
    ];
    const diagram = computeVoronoi(points, boundingPolygon);

    diagram.forEach(({ cell, site }) => {
      context.beginPath();
      cell.forEach((p, i) => {
        if (i === 0) {
          context.moveTo(p.x, p.y);
        } else {
          context.lineTo(p.x, p.y);
        }
      });
      context.closePath();

      context.fillStyle = `hsl(${prng() * 360}, 70%, 70%)`;
      context.fill();
      context.strokeStyle = 'white';
      context.stroke();
    });
  }
});
