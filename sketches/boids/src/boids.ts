import * as utils from './boids.utils';
import { params } from './boids.params';
import { ParamsUI } from './boids.params.ui';

const prng = Math.random;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  if (!context) {
    return;
  }

  new ParamsUI();

  let flock = utils.createFlock(params.BOID_COUNT, canvas.width, canvas.height, prng);
  let boidPaths: utils.IPath[] = flock.map(() => []);

  function animate() {
    if (!context) return;

    const { width, height } = canvas;

    context.fillStyle = params.BACKGROUND_COLOR;
    context.clearRect(0, 0, width, height);

    flock = flock.map((boid, index) => {
      const newBoid = utils.flock(boid, flock, params.FLOCK_PARAMS, width, height);

      boidPaths = utils.appendPositionToPath(boidPaths, index, newBoid.position, params.WOIM_LENGTH);

      utils.drawPath(context, '#000', boidPaths[index]);

      return newBoid;
    });
  }

  utils.loop(context, animate);
});
