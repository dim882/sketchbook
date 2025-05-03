import * as utils from './chaikin-curves.utils';

const sketch = () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  const { width, height } = canvas;

  const BACKGROUND_COLOR = '#ffffff';
  const LINE_COLOR = '#000000';
  const GRID_SIZE = 40;
  const MAX_ITERATIONS = 1000;
  const CHAIKIN_ITERATIONS = 3;
  const LINE_WIDTH = 2;
  console.log(MAX_ITERATIONS);

  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, width, height);

  const path = utils.generateRandomPath(width, height, GRID_SIZE, MAX_ITERATIONS);

  const smoothPath = utils.applyChaikinCurve(path, CHAIKIN_ITERATIONS);

  ctx.strokeStyle = LINE_COLOR;
  ctx.lineWidth = LINE_WIDTH;
  ctx.beginPath();

  if (smoothPath.length > 0) {
    ctx.moveTo(smoothPath[0].x, smoothPath[0].y);

    for (let i = 1; i < smoothPath.length; i++) {
      ctx.lineTo(smoothPath[i].x, smoothPath[i].y);
    }
  }

  ctx.stroke();
};

window.addEventListener('load', sketch);
