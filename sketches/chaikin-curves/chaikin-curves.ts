import * as utils from './chaikin-curves.utils';

const BACKGROUND_COLOR = '#ffffff';
const LINE_COLOR = '#000000';
const GRID_CELL_SIZE = 50;
const MAX_ITERATIONS = 1000;
const CHAIKIN_ITERATIONS = 3;
const LINE_WIDTH = 10;

const sketch = () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');
  const { width, height } = canvas;

  if (!context) {
    throw new Error('Could not get canvas context');
  }

  context.fillStyle = BACKGROUND_COLOR;
  context.fillRect(0, 0, width, height);

  const grid: utils.IGrid = {
    cols: Math.floor(width / GRID_CELL_SIZE),
    rows: Math.floor(height / GRID_CELL_SIZE),
    cellSize: GRID_CELL_SIZE,
  };
  const path = utils.generateRandomPath(grid, MAX_ITERATIONS);
  const smoothPath = utils.applyChaikinCurve(path, CHAIKIN_ITERATIONS);

  if (smoothPath.length > 0) {
    context.lineCap = 'round';

    for (let i = 1; i < smoothPath.length; i++) {
      drawLine(context, smoothPath, i, BACKGROUND_COLOR, 15);
      drawLine(context, smoothPath, i, LINE_COLOR, LINE_WIDTH);
    }
  }
};

window.addEventListener('load', sketch);

function drawLine(
  context: CanvasRenderingContext2D,
  smoothPath: utils.IPoint[],
  i: number,
  strokeStyle: string | CanvasGradient | CanvasPattern,
  lineWidth: number
) {
  context.strokeStyle = strokeStyle;
  context.lineWidth = lineWidth;
  context.beginPath();
  context.moveTo(smoothPath[i - 1].x, smoothPath[i - 1].y);
  context.lineTo(smoothPath[i].x, smoothPath[i].y);
  context.stroke();
}
