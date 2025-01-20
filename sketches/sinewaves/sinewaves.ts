import { IPointTuple, loop } from './utils.js';

document.body.onload = () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  if (context) {
    loop(context, render, 60);
  }
};

function render(context: CanvasRenderingContext2D, t: number) {
  const { width, height } = context.canvas;
  const center: IPointTuple = [width / 2, height / 2];

  context.fillStyle = '#fff';
  context.fillRect(0, 0, width, height);

  context.beginPath();
  context.strokeStyle = '#000';
  context.lineWidth = 2;

  context.beginPath();
  for (let y = 0; y < height; y++) {
    const x = center[0] + Math.sin(y * 0.005 + t * 0.1) * 200;
    context.lineTo(x, y);
  }
  context.stroke();
  context.beginPath();

  for (let y = 0; y < height; y++) {
    const x = center[0] + Math.cos(y * 0.006 + t * 0.06) * 200;
    context.lineTo(x, y);
  }

  context.stroke();
}
