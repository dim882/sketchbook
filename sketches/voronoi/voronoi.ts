import { computeVoronoi, generatePoissonPoints, PseudoRandomNumberGenerator, IPoint } from './voronoi.utils';
import { palette } from './palette';

const prng: PseudoRandomNumberGenerator = Math.random;

// Configuration
const MIN_DIST = 50;
const K = 30;
const HUES = Object.keys(palette) as Array<keyof typeof palette>;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  if (context) {
    render(context);
  }

  function render(context: CanvasRenderingContext2D) {
    const { width, height } = context.canvas;

    const points: IPoint[] = generatePoissonPoints(width, height, MIN_DIST, prng, K);

    const boundingPolygon: IPoint[] = [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height },
    ];

    const diagram = computeVoronoi(points, boundingPolygon);

    diagram.forEach(({ cell }) => {
      context.beginPath();
      cell.forEach((p, idx) => {
        if (idx === 0) {
          context.moveTo(p.x, p.y);
        } else {
          context.lineTo(p.x, p.y);
        }
      });
      context.closePath();

      // pick a random hue category, then take the color at index 4
      const hueKey = HUES[Math.floor(prng() * HUES.length)];
      context.fillStyle = palette[hueKey][4];
      context.fill();

      context.strokeStyle = 'white';
      context.stroke();
    });
  }
});
