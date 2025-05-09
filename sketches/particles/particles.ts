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

  let { particle } = data;
  const { position, velocity, mass } = particle;

  const force = Vector.create(
    position.x < 0 || position.x > width ? (-2 * velocity.x * mass) / dt : 0,
    position.y < 0 || position.y > height ? (-2 * velocity.y * mass) / dt : 0
  );

  particle = applyForce({
    particle,
    force,
    deltaTime: dt,
  });

  data.particle = particle;

  context.clearRect(0, 0, width, height);

  context.beginPath();
  context.arc(...Vec.toTuple(particle.position), 10, 0, 2 * Math.PI);
  context.fillStyle = 'purple';
  context.fill();
};
