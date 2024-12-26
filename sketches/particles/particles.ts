import { type IPointTuple, loop } from './utils.js';

const getCanvas = (): HTMLCanvasElement => {
  const canvas = document.querySelector('canvas');
  if (!canvas) throw new Error('Canvas element not found');

  return canvas;
};

const getCanvasContext = (canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get 2D context');

  return context;
};

document.body.onload = () => {
  const canvas = getCanvas();
  const context = getCanvasContext(canvas);

  loop(context, render, 60);
};

function render(context: CanvasRenderingContext2D, t: number) {
  const { width, height } = context.canvas;
  const center: IPointTuple = [width / 2, height / 2];

  const radius = Math.floor(Math.abs(Math.sin(t * 0.05) * 100));

  context.clearRect(0, 0, width, height);

  context.fillStyle = '#fff';
  context.fillRect(0, 0, width, height);

  context.beginPath();
  context.arc(...center, radius, 0, 2 * Math.PI);
  context.fillStyle = 'red';
  context.fill();
}
