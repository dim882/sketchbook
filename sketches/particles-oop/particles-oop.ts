import { Particle } from './Particle';
import { Vector } from './Vector';
import { getCanvas, getCanvasContext, type IPointTuple, loop } from './particles-oop.utils.js';

document.body.onload = () => {
  const canvas = getCanvas();
  const context = getCanvasContext(canvas);
  const { width, height } = canvas;
  const center: IPointTuple = [width / 2, height / 2];
  const particle = Particle.create({ position: Vector.fromTuple(center) });
  let previousTime = 0;
  let force: Vector = new Vector(0, 0);

  loop(render(context, { particle, previousTime, force }), 60);
};

interface ISketchData {
  particle: Particle;
  previousTime: number;
  force: Vector;
}

const render = (context: CanvasRenderingContext2D, data: ISketchData) => (t: number) => {
  const { width, height } = context.canvas;

  if (t - data.previousTime >= 120) {
    data.particle.velocity = new Vector(0, 0);

    const angle = Math.random() * Math.PI * 2;
    const newForce = 100;

    data.force = Vector.fromAngle(angle).multiply(newForce);
    data.previousTime = t;
  }

  data.particle = data.particle.applyForce({
    force: data.force,
    deltaTime: 1 / 60,
  });

  context.clearRect(0, 0, width, height);

  context.beginPath();
  context.arc(...data.particle.position.toTuple(), 10, 0, 2 * Math.PI);
  context.fillStyle = 'purple';
  context.fill();
};
