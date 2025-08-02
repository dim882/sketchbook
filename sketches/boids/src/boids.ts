import * as utils from './boids.utils';
import { FLOCK_PARAMS, BOID_COUNT, WOIM_LENGTH, BACKGROUND_COLOR } from './boids.params';
import { ParamsUI } from './boids.params.ui';

const prng = Math.random;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  if (!context) {
    return;
  }

  new ParamsUI();

  let flock = utils.createFlock(BOID_COUNT, canvas.width, canvas.height, prng);
  let boidPaths: utils.IBoidPaths = flock.map(() => []);

  function animate() {
    if (!context) return;

    const { width, height } = canvas;

    context.fillStyle = BACKGROUND_COLOR;
    context.clearRect(0, 0, width, height);

    flock = flock.map((boid, index) => {
      const newBoid = utils.flock(boid, flock, FLOCK_PARAMS, width, height);

      boidPaths = utils.updateBoidPath(boidPaths, index, newBoid.position, WOIM_LENGTH);

      utils.drawWoim(context, newBoid, boidPaths, index);

      return newBoid;
    });
  }

  utils.loop(context, animate);
});
