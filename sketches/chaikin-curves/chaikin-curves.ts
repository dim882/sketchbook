import * as utils from './chaikin-curves.utils';

const BACKGROUND_COLOR = '#ffffff';
const LINE_COLOR = '#000000';
const GRID_SIZE = 40;
const MAX_ITERATIONS = 1000;
const CHAIKIN_ITERATIONS = 3;
const LINE_WIDTH = 2;

const sketch = () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');
  const { width, height } = canvas;

  if (!context) {
    throw new Error('Could not get canvas context');
  }

  context.fillStyle = BACKGROUND_COLOR;
  context.fillRect(0, 0, width, height);

  const path = utils.generateRandomPath(width, height, GRID_SIZE, MAX_ITERATIONS);
  const smoothPath = utils.applyChaikinCurve(path, CHAIKIN_ITERATIONS);

  if (smoothPath.length > 0) {
    context.strokeStyle = LINE_COLOR;
    context.lineWidth = LINE_WIDTH;
    context.beginPath();
    context.moveTo(smoothPath[0].x, smoothPath[0].y);

    for (let i = 1; i < smoothPath.length; i++) {
      context.lineTo(smoothPath[i].x, smoothPath[i].y);
    }
    context.stroke();
  }
};

window.addEventListener('load', sketch);
