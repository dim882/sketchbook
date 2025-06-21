import { IPoint, IVector } from './chaikin-curves.types';

export function drawLine(
  context: CanvasRenderingContext2D,
  smoothPath: IPoint[],
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

export function calculateParallelPath(path: IPoint[], offset: number, side: 'left' | 'right'): IPoint[] {
  if (path.length < 2) return path;

  const parallelPath: IPoint[] = [];

  for (let i = 0; i < path.length; i++) {
    let perpendicular: IVector;

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
