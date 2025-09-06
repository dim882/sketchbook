import * as utils from './boids2.utils';
import { FLOCK_PARAMS, BOID_COUNT, WOIM_LENGTH as PATH_MAX_LENGTH, BACKGROUND_COLOR } from './boids2.params';
import { ParamsUI } from './boids2.params.ui';

const prng = Math.random;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  if (!context) {
    return;
  }

  new ParamsUI();

  let flock = utils.createFlock(BOID_COUNT, canvas.width, canvas.height, prng);
  let boidPaths: utils.IPath[] = flock.map(() => []);
  let animationId: number | null = null;
  const animationDuration = 2000;
  const startTime = Date.now();

  function animate() {
    if (!context) return;

    // Check if 4 seconds have passed
    if (Date.now() - startTime >= animationDuration) {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      return;
    }

    const { width, height } = canvas;

    context.fillStyle = BACKGROUND_COLOR;
    context.clearRect(0, 0, width, height);

    flock = flock.map((boid, index) => {
      const newBoid = utils.flock(boid, flock, FLOCK_PARAMS, width, height);

      boidPaths = utils.appendPositionToPath(boidPaths, index, newBoid.position, PATH_MAX_LENGTH);

      utils.drawPath(context, '#000', boidPaths[index]);

      return newBoid;
    });

    animationId = requestAnimationFrame(animate);
  }

  animate();
});
