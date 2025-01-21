import { IPointTuple, loop } from './utils.js';

document.body.onload = () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  if (context) {
    resizeCanvas(canvas);
    window.addEventListener('resize', () => resizeCanvas(canvas));
    loop(context, render, 60);
  }
};

function resizeCanvas(canvas: HTMLCanvasElement) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function render(context: CanvasRenderingContext2D, t: number) {
  const { width, height } = context.canvas;
  const center: IPointTuple = [width / 2, height / 2];

  context.fillStyle = '#000';
  context.fillRect(0, 0, width, height);

  context.lineWidth = 30;
  context.lineCap = 'round';

  context.beginPath();
  context.strokeStyle = 'hsl(80, 76%, 56%, .8)';
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

function drawWave(width: number, t: number, context: CanvasRenderingContext2D) {
  for (let x = 0; x < width + 100; x += 50) {
    const y1 = Math.sin(x * 0.005 + t * 0.01) * 150;
    const y2 = Math.cos(x * 0.005 + t * 0.007) * 150;

    context.beginPath();
    context.moveTo(x, y1);
    context.lineTo(x, y2);
    context.stroke();
  }
}
