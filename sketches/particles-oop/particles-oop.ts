import { Particle } from './Particle';
import { Vector } from './Vector';
import { getCanvas, getCanvasContext, type IPointTuple, loop, handleEdges } from './particles-oop.utils.js';

export const INITIAL_SPEED = 250;
export const FPS = 60;
export const DELTA_TIME = 1 / FPS;

interface ISketchData {
  particle: Particle;
  width: number;
  height: number;
}

document.body.onload = () => {
  const canvas = getCanvas();
  const context = getCanvasContext(canvas);
  const { width, height } = canvas;
  const center: IPointTuple = [width / 2, height / 2];
  const initialAngle = Math.random() * Math.PI * 2;
  const initialVelocity = Vector.fromAngle(initialAngle).multiply(INITIAL_SPEED);
  const particle = Particle.create({ position: Vector.fromTuple(center), velocity: initialVelocity });

  loop(render(context, { particle, width, height }), FPS);
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
  context.fillStyle = 'red';
  context.fill();
};
