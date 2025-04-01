import { drawWave, resizeCanvas } from './sinewaves.utils.js';
import { IPointTuple, loop } from './utils.js';

document.body.onload = async () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  if (!context) {
    return;
  }

  resizeCanvas(canvas);
  window.addEventListener('resize', () => resizeCanvas(canvas));

  loop(context, render, 60);

  function render(context: CanvasRenderingContext2D, t: number) {
    const { width, height } = context.canvas;
    const center: IPointTuple = [width / 2, height / 2];

    context.fillStyle = '#000';
    context.fillRect(0, 0, width, height);

    context.lineWidth = 30;
    context.lineCap = 'round';

    drawWave(context, {
      width,
      yOffset: center[1] - 100,
      time: t,
      color: 'hsl(244, 89%, 69%)',
    });

    drawWave(context, {
      width,
      yOffset: center[1] + 100,
      time: -t + 100,
      color: 'hsl(15, 76%, 56%, .8)',
    });
  }
};
