import * as utils from './boids.utils';

const BACKGROUND_COLOR = '#fcfaf7';
const BOID_COUNT = 500;
const WOIM_LENGTH = 20;
const FLOCK_PARAMS = {
  separationDist: 100,
  alignDist: 50,
  cohesionDist: 50,
  separationWeight: 1.5,
  alignmentWeight: 1.0,
  cohesionWeight: 1.0,
};

const prng = Math.random;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  let flock = utils.createFlock(BOID_COUNT, canvas.width, canvas.height, prng);
  let boidPaths: utils.IBoidPaths = flock.map(() => []);

  function animate() {
    if (!context) return;

    const { width, height } = canvas;

    context.fillStyle = BACKGROUND_COLOR;
    context.clearRect(0, 0, width, height);

    // Update and draw boids
    flock = flock.map((boid, index) => {
      const newBoid = utils.flock(boid, flock, FLOCK_PARAMS, width, height);

      boidPaths = utils.updateBoidPath(boidPaths, index, newBoid.position, WOIM_LENGTH);

      utils.drawWoim(context, newBoid, boidPaths, index);

      return newBoid;
    });

    requestAnimationFrame(animate);
  }

  animate();
});
