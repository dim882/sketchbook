import * as utils from './chaikin-curves.utils';

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

function calculateParallelPath(path: utils.IPoint[], offset: number, side: 'left' | 'right'): utils.IPoint[] {
  if (path.length < 2) return path;

  const parallelPath: utils.IPoint[] = [];

  for (let i = 0; i < path.length; i++) {
    let perpendicular: { x: number; y: number };

    if (i === 0) {
      // First point: use direction to next point
      const dx = path[1].x - path[0].x;
      const dy = path[1].y - path[0].y;
      perpendicular = { x: -dy, y: dx };
    } else if (i === path.length - 1) {
      // Last point: use direction from previous point
      const dx = path[i].x - path[i - 1].x;
      const dy = path[i].y - path[i - 1].y;
      perpendicular = { x: -dy, y: dx };
    } else {
      // Middle points: average the directions from previous and to next
      const dx1 = path[i].x - path[i - 1].x;
      const dy1 = path[i].y - path[i - 1].y;
      const dx2 = path[i + 1].x - path[i].x;
      const dy2 = path[i + 1].y - path[i].y;

      // Average the perpendiculars
      const perp1 = { x: -dy1, y: dx1 };
      const perp2 = { x: -dy2, y: dx2 };
      perpendicular = {
        x: (perp1.x + perp2.x) / 2,
        y: (perp1.y + perp2.y) / 2,
      };
    }

    // Normalize the perpendicular vector
    const length = Math.sqrt(perpendicular.x * perpendicular.x + perpendicular.y * perpendicular.y);
    if (length > 0) {
      perpendicular.x /= length;
      perpendicular.y /= length;
    }

    // Apply offset in the correct direction
    const offsetMultiplier = side === 'left' ? -1 : 1;
    const offsetPoint = {
      x: path[i].x + perpendicular.x * offset * offsetMultiplier,
      y: path[i].y + perpendicular.y * offset * offsetMultiplier,
    };

    parallelPath.push(offsetPoint);
  }

  return parallelPath;
}
