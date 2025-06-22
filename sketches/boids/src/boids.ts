import * as Boid from './Boid';
import * as utils from './boids.utils';

type IBoidPaths = {
  x: number;
  y: number;
}[][];

const BACKGROUND_COLOR = '#fcfaf7';
const BOID_COUNT = 500;
const SEPARATION_DISTANCE = 100;
const ALIGNMENT_DISTANCE = 50;
const COHESION_DISTANCE = 50;
const SEPARATION_WEIGHT = 1.5;
const ALIGNMENT_WEIGHT = 1.0;
const COHESION_WEIGHT = 1.0;
const PATH_LENGTH_LIMIT = 20;

const prng = Math.random;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  if (!context) {
    console.error('Could not get canvas context');
  }

  const flockParams = {
    separationDist: SEPARATION_DISTANCE,
    alignDist: ALIGNMENT_DISTANCE,
    cohesionDist: COHESION_DISTANCE,
    separationWeight: SEPARATION_WEIGHT,
    alignmentWeight: ALIGNMENT_WEIGHT,
    cohesionWeight: COHESION_WEIGHT,
  };

  let flock = utils.createFlock(BOID_COUNT, canvas.width, canvas.height, prng);
  const boidPaths: IBoidPaths = flock.map(() => []);

  function animate() {
    if (!context) return;

    const { width, height } = canvas;

    context.fillStyle = BACKGROUND_COLOR;
    context.clearRect(0, 0, width, height);

    // Update and draw boids
    flock = flock.map((boid, index) => {
      let newBoid = utils.flock(boid, flock, flockParams, width, height);

      newBoid = Boid.update(newBoid);
      newBoid = Boid.wrap(newBoid, width, height);

      boidPaths[index].push(newBoid.position);

      // Limit the path length
      if (boidPaths[index].length > PATH_LENGTH_LIMIT) {
        boidPaths[index].shift();
      }

      context.beginPath();
      context.strokeStyle = newBoid.color;
      context.lineWidth = 0.5;

      if (boidPaths[index].length > 1) {
        context.moveTo(boidPaths[index][0].x, boidPaths[index][0].y);

        for (let i = 1; i < boidPaths[index].length; i++) {
          context.lineTo(boidPaths[index][i].x, boidPaths[index][i].y);
        }
      }

      context.stroke();

      return newBoid;
    });

    requestAnimationFrame(animate);
  }

  animate();
});
