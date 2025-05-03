import * as Vector from './Vector';
import * as Boid from './Boid';
import * as utils from './boids.utils';
import { IBoid } from './Boid';

const BACKGROUND_COLOR = '#f5f5f5';
const BOID_COUNT = 100;
const SEPARATION_DISTANCE = 25;
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

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

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

    // Clear canvas
    context.fillStyle = BACKGROUND_COLOR;
    context.fillRect(0, 0, width, height);

    // Update and draw boids
    flock = flock.map((boid) => {
      // Apply flocking behavior
      let newBoid = utils.flock(boid, flock, flockParams);

      // Update position
      newBoid = Boid.update(newBoid);

      // Wrap around edges
      newBoid = Boid.wrap(newBoid, width, height);

      // Draw the boid
      utils.drawBoid(context, newBoid);

      return newBoid;
    });

    requestAnimationFrame(animate);
  }

  animate();
});
