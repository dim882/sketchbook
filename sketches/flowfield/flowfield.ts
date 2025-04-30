import { type IParticle, create, applyForce } from './Particle.js';
import { getCanvas, getCanvasContext, type IPointTuple, loop } from './flowfield.utils.js';
import * as Vec from './Vector.js';

document.body.onload = () => {
  const canvas = getCanvas();
  const context = getCanvasContext(canvas);
  const { width, height } = canvas;
  const center: IPointTuple = [width / 2, height / 2];
  const particle = create({ position: Vec.fromTuple(center) });
  const previousTime = 0;
  const force: Vec.IVector = { x: 0, y: 0 };

  loop(render(context, { particle, previousTime, force }), 60);
};

interface ISketchData {
  particle: IParticle;
  previousTime: number;
  force: Vec.IVector;
}

console.log('foo');

const render = (context: CanvasRenderingContext2D, data: ISketchData) => (t: number) => {
  const { width, height } = context.canvas;

  if (t - data.previousTime >= 120) {
    data.particle.velocity = { x: 0, y: 0 };

    const angle = Math.random() * Math.PI * 2;
    const newForce = 100;

    data.force = Vec.multiply(Vec.fromAngle(angle), newForce);
    data.previousTime = t;
  }

  data.particle = applyForce({
    particle: data.particle,
    force: data.force,
    deltaTime: 1 / 60,
  });

  context.clearRect(0, 0, width, height);

  context.beginPath();
  context.arc(...Vec.toTuple(data.particle.position), 10, 0, 2 * Math.PI);
  context.fillStyle = 'purple';
  context.fill();
};
