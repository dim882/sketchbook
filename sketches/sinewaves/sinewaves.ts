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
  context.lineWidth = 30;
  context.lineCap = 'round';

  for (let y = 0; y < height + 100; y += 50) {
    context.beginPath();
    const x1 = center[0] + Math.sin(y * 0.005 + t * 0.02) * 200;
    const x2 = center[0] + Math.cos(y * 0.006 + t * 0.06) * 200;
    context.moveTo(x1, y);
    context.lineTo(x2, y);
    context.stroke();
  }

  for (let y = 0; y < height; y++) {}

  context.stroke();
}
