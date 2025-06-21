import * as Path from './chaikin-curves.path';
import * as Drawing from './chaikin-curves.drawing';
import { IGrid } from './chaikin-curves.types';

const BACKGROUND_COLOR = '#ffffff';
const LINE_COLOR = '#000000';
const GRID_CELL_SIZE = 50;
const MAX_ITERATIONS = 1000;
const CHAIKIN_ITERATIONS = 3;
const LINE_WIDTH = 10;
const PARALLEL_OFFSET = 7;
const MAX_CONSECUTIVE_STEPS = 2;
const EDGE_MARGIN = 3; // Grid cells to stay away from left and right edges

const sketch = () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');
  const { width, height } = canvas;

  if (!context) {
    throw new Error('Could not get canvas context');
  }

  context.fillStyle = BACKGROUND_COLOR;
  context.fillRect(0, 0, width, height);

  const grid: IGrid = {
    cols: Math.floor(width / GRID_CELL_SIZE),
    rows: Math.floor(height / GRID_CELL_SIZE),
    cellSize: GRID_CELL_SIZE,
  };
  const path = Path.generateRandomPath(grid, MAX_ITERATIONS, MAX_CONSECUTIVE_STEPS, EDGE_MARGIN);
  const smoothPath = Drawing.applyChaikinCurve(path, CHAIKIN_ITERATIONS);
  context.lineCap = 'round';

  if (smoothPath.length > 0) {
    const leftParallelPath = Path.calculateParallelPath(smoothPath, PARALLEL_OFFSET, 'left');
    const rightParallelPath = Path.calculateParallelPath(smoothPath, PARALLEL_OFFSET, 'right');

    for (let i = 1; i < smoothPath.length; i++) {
      Drawing.drawLine(context, smoothPath, i, LINE_COLOR, LINE_WIDTH);
      Drawing.drawLine(context, leftParallelPath, i, BACKGROUND_COLOR, LINE_WIDTH / 2);
      Drawing.drawLine(context, rightParallelPath, i, BACKGROUND_COLOR, LINE_WIDTH / 2);
    }
  }
};

window.addEventListener('load', sketch);
