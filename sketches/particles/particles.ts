import * as Vector from './Vector';
import { type IParticle, create, applyForce } from './Particle';
import { getCanvas, getCanvasContext, handleEdges, type IPointTuple, loop } from './particles.utils';
import * as Vec from './Vector';

export const INITIAL_SPEED = 250;
export const FPS = 60;
export const DELTA_TIME = 1 / FPS;

interface ISketchData {
  particle: IParticle;
}

document.body.onload = () => {
  const canvas = getCanvas();
  const context = getCanvasContext(canvas);
  const { width, height } = canvas;
  const angle = Math.random() * Math.PI * 2;
  const data = {
    particle: create({
      position: Vector.create(width / 2, height / 2),
      velocity: Vec.multiply(Vec.fromAngle(angle), INITIAL_SPEED),
    }),
  };

  loop(render(context, data), FPS);
};

const render = (context: CanvasRenderingContext2D, data: ISketchData) => (t: number) => {
  const { width, height } = context.canvas;
  let { particle } = data;

  particle = applyForce({
    particle,
    force: handleEdges(particle, width, height),
    deltaTime: DELTA_TIME,
  });

  context.clearRect(0, 0, width, height);
  context.beginPath();
  context.arc(...Vec.toTuple(particle.position), 10, 0, 2 * Math.PI);
  context.fillStyle = 'black';
  context.fill();
};
