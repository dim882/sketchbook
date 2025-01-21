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

  context.fillStyle = '#fff';
  context.fillRect(0, 0, width, height);

  context.lineWidth = 30;
  context.lineCap = 'round';

  context.beginPath();
  context.strokeStyle = 'hsl(80, 76%, 56%, .7)';
  context.save();
  context.translate(center[0] - 100, 0);
  drawWave(height, t, context);
  context.stroke();
  context.restore();

  context.beginPath();
  context.strokeStyle = 'hsl(15, 76%, 56%, .7)';
  context.save();
  context.translate(center[0] + 100, 0);
  drawWave(height, t + 100, context);
  context.stroke();
  context.restore();
}

function drawWave(height: number, t: number, context: CanvasRenderingContext2D) {
  for (let y = 0; y < height + 100; y += 50) {
    const x1 = Math.sin(y * 0.005 + t * 0.01) * 200;
    const x2 = Math.cos(y * 0.006 + t * 0.03) * 200;

    context.beginPath();
    context.moveTo(x1, y);
    context.lineTo(x2, y);
    context.stroke();
  }
}
