import { type IParticle, create, applyForce } from './Particle.js';
import { getCanvas, getCanvasContext, type IPointTuple, loop } from './particles.utils.js';
import * as Vec from './Vector.js';

document.body.onload = () => {
  const canvas = getCanvas();
  const context = getCanvasContext(canvas);
  const { width, height } = canvas;
  const center: IPointTuple = [width / 2, height / 2];
  const initialVelocity = 150;
  const angle = Math.random() * Math.PI * 2;
  const initialForce = Vec.multiply(Vec.fromAngle(angle), initialVelocity);
  const particle = create({ position: Vec.fromTuple(center), velocity: initialForce });
  const force: Vec.IVector = { x: 0, y: 0 };

  loop(render(context, { particle, force }), 60);
};

interface ISketchData {
  particle: IParticle;
  force: Vec.IVector;
}

const render = (context: CanvasRenderingContext2D, data: ISketchData) => (t: number) => {
  const { width, height } = context.canvas;

  let particle = data.particle;

  // Bounce off walls
  if (particle.position.x < 0 || particle.position.x > width) {
    particle = { ...particle, velocity: { ...particle.velocity, x: -particle.velocity.x } };
  }

  if (particle.position.y < 0 || particle.position.y > height) {
    particle = { ...particle, velocity: { ...particle.velocity, y: -particle.velocity.y } };
  }

  particle = applyForce({
    particle: particle,
    force: data.force,
    deltaTime: 1 / 60,
  });

  context.clearRect(0, 0, width, height);

  context.beginPath();
  context.arc(...Vec.toTuple(particle.position), 10, 0, 2 * Math.PI);
  context.fillStyle = 'purple';
  context.fill();
};
