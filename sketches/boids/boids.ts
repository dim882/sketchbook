import * as Boid from './Boid';
import * as utils from './boids.utils';

const BACKGROUND_COLOR = '#f5f5f5';
const BOID_COUNT = 100;
const SEPARATION_DISTANCE = 100;
const ALIGNMENT_DISTANCE = 50;
const COHESION_DISTANCE = 50;
const SEPARATION_WEIGHT = 1.5;
const ALIGNMENT_WEIGHT = 1.0;
const COHESION_WEIGHT = 1.0;
const PATH_LENGTH_LIMIT = 100;

const prng = Math.random;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  if (!context) {
    console.error('Could not get canvas context');
    return;
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

  // Store the paths of each boid
  const boidPaths: { x: number; y: number }[][] = flock.map(() => []);

  function animate() {
    const { width, height } = canvas;

    if (!context) {
      return;
    }

    // Clear canvas
    // context.fillStyle = BACKGROUND_COLOR;
    context.clearRect(0, 0, width, height);

    // Update and draw boids
    flock = flock.map((boid, index) => {
      let newBoid = utils.flock(boid, flock, flockParams, width, height);

      newBoid = Boid.update(newBoid);

      newBoid = Boid.wrap(newBoid, width, height);

      // Store the boid's position in its path
      boidPaths[index].push({ x: newBoid.position.x, y: newBoid.position.y });

      // Limit the path length
      if (boidPaths[index].length > PATH_LENGTH_LIMIT) {
        boidPaths[index].shift(); // Remove the oldest point
      }

      // Draw the boid's path
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
