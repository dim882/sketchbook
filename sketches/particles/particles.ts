import { type IParticle, create, applyForce } from './Particle.js';
import { getCanvas, getCanvasContext, type IPointTuple, loop } from './particles.utils.js';
import { fromTuple, type IVector, toTuple, fromAngle, multiply } from './Vector.js';

document.body.onload = () => {
  const canvas = getCanvas();
  const context = getCanvasContext(canvas);
  const { width, height } = context.canvas;
  const center: IPointTuple = [width / 2, height / 2];
  const particle = create({ position: fromTuple(center) });
  const lastForceTime = 0;
  const currentForce: IVector = { x: 0, y: 0 };

  loop(context, createRender(context, { particle, lastForceTime, currentForce }), 60);
};

interface ISketchData {
  particle: IParticle;
  lastForceTime: number;
  currentForce: IVector;
}

const createRender = (context: CanvasRenderingContext2D, data: ISketchData) => (t: number) => {
  const { width, height } = context.canvas;

  // Apply new force every 2 seconds
  if (t - data.lastForceTime >= 120) {
    // 60 fps * 2 seconds = 120 frames
    const randomAngle = Math.random() * Math.PI * 2;
    const forceMagnitude = 100;

    data.currentForce = multiply(fromAngle(randomAngle), forceMagnitude);
    data.lastForceTime = t;

    // Reset particle velocity
    data.particle = {
      ...data.particle,
      velocity: { x: 0, y: 0 },
    };
  }

  data.particle = applyForce({
    particle: data.particle,
    force: data.currentForce,
    deltaTime: 1 / 60, // assuming 60 FPS
  });

  context.clearRect(0, 0, width, height);

  context.beginPath();
  context.arc(...toTuple(data.particle.position), 10, 0, 2 * Math.PI);
  context.fillStyle = 'purple';
  context.fill();
};
