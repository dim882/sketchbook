import * as Boid from './Boid';
import * as utils from './boids.utils';

const BACKGROUND_COLOR = '#f5f5f5';
const BOID_COUNT = 300;
const SEPARATION_DISTANCE = 45;
const ALIGNMENT_DISTANCE = 50;
const COHESION_DISTANCE = 50;
const SEPARATION_WEIGHT = 1.5;
const ALIGNMENT_WEIGHT = 1.0;
const COHESION_WEIGHT = 1.0;

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

  function animate() {
    const { width, height } = canvas;

    if (!context) {
      return;
    }

    // Clear canvas
    context.fillStyle = BACKGROUND_COLOR;
    context.fillRect(0, 0, width, height);

    // Update and draw boids
    flock = flock.map((boid) => {
      let newBoid = utils.flock(boid, flock, flockParams);

      newBoid = Boid.update(newBoid);

      newBoid = Boid.wrap(newBoid, width, height);

      utils.drawBoid(context, newBoid);

      return newBoid;
    });

    requestAnimationFrame(animate);
  }

  animate();
});
