import { Particle } from './Particle';
import { Vector } from './Vector';
import { getCanvas, getCanvasContext, loop, handleEdges } from './boids-oop.utils';
console.log('oo');

export const INITIAL_SPEED = 250;
export const FPS = 60;
export const DELTA_TIME = 1 / FPS;
export const PARTICLE_COLOR = 'black';

interface ISketchData {
  particle: Particle;
}

document.body.onload = () => {
  const canvas = getCanvas();
  const context = getCanvasContext(canvas);
  const initialAngle = Math.random() * Math.PI * 2;
  const particle = Particle.create({
    position: Vector.fromTuple([canvas.width / 2, canvas.height / 2]),
    velocity: Vector.fromAngle(initialAngle).multiply(INITIAL_SPEED),
  });

  loop(render(context, { particle }), FPS);
};

const render = (context: CanvasRenderingContext2D, data: ISketchData) => (t: number) => {
  const { width, height } = context.canvas;
  const { particle } = data;

  particle.applyForce({
    force: handleEdges(particle, width, height),
    deltaTime: DELTA_TIME,
  });

  context.clearRect(0, 0, width, height);

  context.beginPath();
  context.arc(...particle.position.toTuple(), 10, 0, 2 * Math.PI);
  context.fillStyle = PARTICLE_COLOR;
  context.fill();
};
