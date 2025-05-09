import * as Vector from './Vector';
import { type IParticle, create, applyForce } from './Particle';
import { getCanvas, getCanvasContext, type IPointTuple, loop } from './particles.utils';
import * as Vec from './Vector';

const INITIAL_SPEED = 150;

document.body.onload = () => {
  const canvas = getCanvas();
  const context = getCanvasContext(canvas);
  const { width, height } = canvas;

  const center: IPointTuple = [width / 2, height / 2];
  const angle = Math.random() * Math.PI * 2;
  const initialForce = Vec.multiply(Vec.fromAngle(angle), INITIAL_SPEED);

  const data = {
    particle: create({ position: Vec.fromTuple(center), velocity: initialForce }),
  };

  const FPS = 60;

  loop(render(context, data), FPS);
};

interface ISketchData {
  particle: IParticle;
}

const render = (context: CanvasRenderingContext2D, data: ISketchData) => (t: number) => {
  const { width, height } = context.canvas;
  const dt = 1 / 60;

  let particle = data.particle;

  let x = 0;
  let y = 0;

  // Compute impulse to reverse velocity component on collision
  if (particle.position.x < 0 || particle.position.x > width) {
    x = (-2 * particle.velocity.x * particle.mass) / dt;
  }

  if (particle.position.y < 0 || particle.position.y > height) {
    y = (-2 * particle.velocity.y * particle.mass) / dt;
  }

  particle = applyForce({
    particle,
    force: Vector.create(x, y),
    deltaTime: dt,
  });

  data.particle = particle;

  context.clearRect(0, 0, width, height);

  context.beginPath();
  context.arc(...Vec.toTuple(particle.position), 10, 0, 2 * Math.PI);
  context.fillStyle = 'purple';
  context.fill();
};
