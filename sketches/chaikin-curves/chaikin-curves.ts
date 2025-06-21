import * as utils from './chaikin-curves.utils';
import { calculateParallelPath, drawLine } from './chaikin-curves.utils';

const BACKGROUND_COLOR = '#ffffff';
const LINE_COLOR = '#000000';
const GRID_CELL_SIZE = 50;
const MAX_ITERATIONS = 1000;
const CHAIKIN_ITERATIONS = 3;
const LINE_WIDTH = 10;
const PARALLEL_OFFSET = 7; // Distance from the main path

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
  context.lineCap = 'round';

  if (smoothPath.length > 0) {
    // Calculate parallel paths
    const leftParallelPath = calculateParallelPath(smoothPath, PARALLEL_OFFSET, 'left');
    const rightParallelPath = calculateParallelPath(smoothPath, PARALLEL_OFFSET, 'right');

    // Draw main path on top
    for (let i = 1; i < smoothPath.length; i++) {
      drawLine(context, smoothPath, i, LINE_COLOR, LINE_WIDTH);
      drawLine(context, leftParallelPath, i, BACKGROUND_COLOR, LINE_WIDTH / 2);
      drawLine(context, rightParallelPath, i, BACKGROUND_COLOR, LINE_WIDTH / 2);
    }
  }
};

window.addEventListener('load', sketch);
