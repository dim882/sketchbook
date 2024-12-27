import { type IParticle, create } from './Particle.js';
import { getCanvas, getCanvasContext, type IPointTuple, loop } from './particles.utils.js';
import { fromAngle, fromTuple, type IVector, toTuple } from './Vector.js';

document.body.onload = () => {
  const canvas = getCanvas();
  const context = getCanvasContext(canvas);

  const { width, height } = context.canvas;
  const center: IPointTuple = [width / 2, height / 2];

  const particle = create({ position: fromTuple(center) });
  const force = fromAngle(1);

  loop(context, createRender(context, { particle, force }), 60);
};

interface ISetupData {
  particle: IParticle;
  force: IVector;
}

const createRender =
  (context: CanvasRenderingContext2D, { particle, force }: ISetupData) =>
  (t: number) => {
    console.log({ particle, force });

    context.beginPath();
    context.arc(...toTuple(particle.position), 10, 0, 2 * Math.PI);
    context.fillStyle = 'red';
    context.fill();
  };
