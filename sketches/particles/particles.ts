import { type IParticle, create, applyForce } from './Particle.js';
import { getCanvas, getCanvasContext, type IPointTuple, loop } from './particles.utils.js';
import { fromTuple, type IVector, toTuple, fromAngle, multiply } from './Vector.js';

document.body.onload = () => {
  const canvas = getCanvas();
  const context = getCanvasContext(canvas);
  const { width, height } = canvas;
  const center: IPointTuple = [width / 2, height / 2];
  const particle = create({ position: fromTuple(center) });
  const lastForceTime = 0;
  const force: IVector = { x: 0, y: 0 };

  loop(context, createRender(context, { particle, lastForceTime, currentForce: force }), 60);
};

interface ISketchData {
  particle: IParticle;
  lastForceTime: number;
  currentForce: IVector;
}

const createRender = (context: CanvasRenderingContext2D, data: ISketchData) => (t: number) => {
  const { width, height } = context.canvas;

  // Apply force every 2 seconds
  if (t - data.lastForceTime >= 120) {
    // Stop any current motion
    data.particle.velocity = { x: 0, y: 0 };

    const angle = Math.random() * Math.PI * 2;
    const newForce = 100;

    data.currentForce = multiply(fromAngle(angle), newForce);
    data.lastForceTime = t;
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
