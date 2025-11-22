import * as utils from './utils/boid-fuzz.utils';
import * as flockUtils from './utils/flock';
import { createSeedState } from './utils/seed';
import * as params from './boid-fuzz.params';
import { createParamsUI } from './ui/boid-fuzz.ui.params';
import './ui/boid-fuzz.ui.fps';
import { FPSDisplay } from './ui/boid-fuzz.ui.fps';
import { createFPSTracker } from './utils/fps';
import * as Vector from './utils/Vector';

const palette = ['#d19994', '#c27770', '#b94f46', '#8f443d'];

const seedState = createSeedState();

interface IFlockWithFrame {
  flock: ReturnType<typeof flockUtils.createFlock>;
  createdAtFrame: number;
}

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  if (!context) return;

  const center = { x: canvas.width / 2, y: canvas.height / 2 };
  const fpsTracker = createFPSTracker();
  const startAnimation = utils.makeLoop(context, animate, {
    onRAF: fpsTracker.onRAF,
    onRenderStart: fpsTracker.onRenderStart,
    onRenderEnd: fpsTracker.onRenderEnd,
  });

  createParamsUI();
  (document.querySelector('fps-display') as FPSDisplay | null)?.startTracking(fpsTracker);
  utils.bindEvent('.change-seed', 'click', seedState.handleSeedChange(startAnimation));

  let flocks: IFlockWithFrame[] = [
    {
      flock: flockUtils.createFlock({
        boidCount: params.BOID_COUNT,
        center,
        distance: params.FLOCK_SPAWN_DISTANCE,
        prng: seedState.prng,
      }),
      createdAtFrame: 0,
    },
  ];
  let frameCount = 0;
  let lastSpawnFrame = 0;

  startAnimation();

  function animate() {
    if (!context) return;

    const { width, height } = canvas;

    frameCount++;

    // Create a new flock every spawn interval
    if (frameCount - lastSpawnFrame >= params.FLOCK_SPAWN_INTERVAL_FRAMES) {
      flocks.push({
        flock: flockUtils.createFlock({
          boidCount: params.BOID_COUNT,
          center,
          distance: params.FLOCK_SPAWN_DISTANCE,
          prng: seedState.prng,
        }),
        createdAtFrame: frameCount,
      });

      lastSpawnFrame = frameCount;
    }

    flocks = flocks.filter((flock) => frameCount - flock.createdAtFrame < params.FLOCK_LIFETIME_FRAMES);

    context.fillStyle = params.BACKGROUND_COLOR;
    context.fillRect(0, 0, width, height);

    flocks = flocks.map(({ flock, createdAtFrame }) => {
      const updatedFlock = flock
        .map((boid) =>
          flockUtils.flock({
            boid,
            boids: flock,
            params: params.FLOCK_PARAMS,
            width,
            height,
          })
        )
        .map((boid) => {
          const newPath = [...boid.path, Vector.clone(boid.position)];
          const path = newPath.length > params.WOIM_LENGTH ? newPath.slice(1) : newPath;

          return {
            ...boid,
            path,
          };
        });

      context.save();
      context.globalAlpha = 1 - (frameCount - createdAtFrame) / params.FLOCK_LIFETIME_FRAMES;
      updatedFlock.forEach((boid) => {
        utils.drawPath(context, params.BOID_COLOR, boid.path);
      });
      context.restore();

      return {
        flock: updatedFlock,
        createdAtFrame,
      };
    });
  }
});
