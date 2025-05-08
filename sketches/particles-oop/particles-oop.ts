import { Particle } from './Particle';
import { Vector } from './Vector';
import { getCanvas, getCanvasContext, type IPointTuple, loop } from './particles-oop.utils.js';

document.body.onload = () => {
  const canvas = getCanvas();
  const context = getCanvasContext(canvas);
  const { width, height } = canvas;
  const center: IPointTuple = [width / 2, height / 2];

  // Give the particle a stronger (random) initial velocity
  const initialAngle = Math.random() * Math.PI * 2;
  const initialVelocity = Vector.fromAngle(initialAngle).multiply(150);
  const particle = new Particle({ position: Vector.fromTuple(center), velocity: initialVelocity });

  loop(render(context, { particle, width, height }), 60);
};

interface ISketchData {
  particle: Particle;
  width: number;
  height: number;
}

const render = (context: CanvasRenderingContext2D, data: ISketchData) => (t: number) => {
  const { width, height } = context.canvas;
  let { particle } = data;

  // Bounce back when it hits an edge
  if (particle.position.x < 0 || particle.position.x > width) {
    particle.velocity.x = -Math.sign(particle.position.x - width / 2) * Math.abs(particle.velocity.x);
  }

  if (particle.position.y < 0 || particle.position.y > height) {
    particle.velocity.y = -Math.sign(particle.position.y - height / 2) * Math.abs(particle.velocity.y);
  }

  particle.applyForce({
    force: new Vector(0, 0),
    deltaTime: 1 / 60,
  });

  context.clearRect(0, 0, width, height);

  context.beginPath();
  context.arc(...particle.position.toTuple(), 10, 0, 2 * Math.PI);
  context.fillStyle = 'purple';
  context.fill();
};
