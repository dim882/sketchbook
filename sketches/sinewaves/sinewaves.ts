import { drawWave, resizeCanvas } from './sinewaves.utils.js';
import { IPointTuple, loop } from './utils.js';

document.body.onload = () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  function render(context: CanvasRenderingContext2D, t: number) {
    const { width, height } = context.canvas;
    const center: IPointTuple = [width / 2, height / 2];

    context.fillStyle = '#000';
    context.fillRect(0, 0, width, height);

    context.lineWidth = 30;
    context.lineCap = 'round';

    context.beginPath();
    context.strokeStyle = 'hsl(244, 89%, 69%)';
    context.save();
    context.translate(0, center[1] - 100);
    drawWave(width, t, context);
    context.stroke();
    context.restore();

    context.beginPath();
    context.strokeStyle = 'hsl(15, 76%, 56%, .8)';
    context.save();
    context.translate(0, center[1] + 100);
    drawWave(width, -t + 100, context);
    context.stroke();
    context.restore();
  }

  if (context) {
    resizeCanvas(canvas);
    window.addEventListener('resize', () => resizeCanvas(canvas));
    loop(context, render, 60);
  }
};
