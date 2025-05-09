import * as Vector from './Vector';
import { IParticle } from './Particle';
import { DELTA_TIME } from './particles';

export type IRenderFunc = (t: number) => void;
export type IPointTuple = [number, number];

export function loop(render: IRenderFunc, fps = 60) {
  const frameDuration = 1000 / fps;
  let lastFrameTime = 0;
  let t = 0;

  function animate(time: number) {
    requestAnimationFrame(animate);

    if (time - lastFrameTime < frameDuration) return;
    lastFrameTime = time;

    render(t); // Assuming `context` is accessible in this scope
    t++;
  }

  requestAnimationFrame(animate);
}

export const getCanvas = (): HTMLCanvasElement => {
  const canvas = document.querySelector('canvas');
  if (!canvas) throw new Error('Canvas element not found');

  return canvas;
};

export const getCanvasContext = (canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get 2D context');

  return context;
};

export function handleEdges(particle: IParticle, width: number, height: number) {
  const { position, velocity, mass } = particle;

  const force = Vector.create(
    position.x < 0 || position.x > width ? (-2 * velocity.x * mass) / DELTA_TIME : 0,
    position.y < 0 || position.y > height ? (-2 * velocity.y * mass) / DELTA_TIME : 0
  );
  return force;
}
