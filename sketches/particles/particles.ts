import { type IParticle, create } from './Particle.js';
import { getCanvas, getCanvasContext, type IPointTuple, loop } from './particles.utils.js';
import { fromTuple, type IVector, toTuple } from './Vector.js';

document.body.onload = () => {
  const canvas = getCanvas();
  const context = getCanvasContext(canvas);

  const { width, height } = context.canvas;
  const center: IPointTuple = [width / 2, height / 2];

  const particle = create({ position: fromTuple(center) });
  loop(context, createRender(context, { particle }), 60);
};

interface ISetupData {
  particle: IParticle;
}

const createRender =
  (context: CanvasRenderingContext2D, { particle }: ISetupData) =>
  (t: number) => {
    // Clear the canvas
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    // Draw the particle
    context.beginPath();
    context.arc(...toTuple(particle.position), 10, 0, 2 * Math.PI);
    context.fillStyle = 'blue';
    context.fill();
  };
