import { IDirection, IGrid, IGridPosition, IPoint, IVector } from './chaikin-curves.types';

const DIRECTIONS: readonly IDirection[] = [
  { dx: 1, dy: 0 }, // Right
  { dx: 0, dy: 1 }, // Down
  { dx: 0, dy: -1 }, // Up
  { dx: -1, dy: 0 }, // Left
];

/**
 * Generates a path that starts from the left edge and moves toward the right edge
 * Returns grid positions (col, row) rather than actual coordinates
 */
export const generateRandomGridPath = (
  grid: IGrid,
  maxIterations: number,
  maxConsecutiveSteps: number
): IGridPosition[] => {
  let position: IGridPosition = {
    col: 0,
    row: Math.floor(grid.rows / 2),
  };
  let direction: IDirection = { dx: 1, dy: 0 }; // Always go right first
  let consecutiveSteps = 1; // Track consecutive steps in current direction
  const path: IGridPosition[] = [position];

  for (let i = 0; i < maxIterations && position.col < grid.cols; i++) {
    if (i > 0) {
      const possibleDirections = getPossibleDirections({
        grid,
        position,
        direction,
        consecutiveSteps,
        maxConsecutiveSteps,
      });
      const nextDirection = selectNextDirection(possibleDirections);

      if (!nextDirection) {
        break;
      }

      // Reset or increment consecutive steps counter
      if (nextDirection.dx === direction.dx && nextDirection.dy === direction.dy) {
        consecutiveSteps++;
      } else {
        consecutiveSteps = 1;
      }

      direction = nextDirection;
    }

    position = {
      col: position.col + direction.dx,
      row: position.row + direction.dy,
    };

    path.push(position);
  }

  return path;
};

/**
 * Maps grid positions to actual x,y coordinates
 */
export const mapGridPathToCoordinates = (gridPath: IGridPosition[], gridSize: number): IPoint[] => {
  return gridPath.map((position) => ({
    x: position.col * gridSize,
    y: position.row * gridSize,
  }));
};

/**
 * Generates a random path and maps it to coordinates
 * This is a convenience function that combines the two operations
 */
export const generateRandomPath = (grid: IGrid, maxIterations: number, maxConsecutiveSteps: number): IPoint[] => {
  const gridPath = generateRandomGridPath(grid, maxIterations, maxConsecutiveSteps);
  return mapGridPathToCoordinates(gridPath, grid.cellSize);
};

const getPossibleDirections = ({
  position,
  grid,
  direction,
  consecutiveSteps,
  maxConsecutiveSteps,
}: {
  grid: IGrid;
  position: IGridPosition;
  direction: IDirection;
  consecutiveSteps: number;
  maxConsecutiveSteps: number;
}): IDirection[] => {
  return DIRECTIONS.filter((dir) => {
    const newCol = position.col + dir.dx;
    const newRow = position.row + dir.dy;

    // Check bounds
    if (newCol < 0 || newCol > grid.cols || newRow < 0 || newRow >= grid.rows) {
      return false;
    }

    // Prevent 180-degree turns
    if (dir.dx !== 0 && dir.dx === -direction.dx) return false;
    if (dir.dy !== 0 && dir.dy === -direction.dy) return false;

    // Prevent continuing in the same direction if we've reached the limit
    if (dir.dx === direction.dx && dir.dy === direction.dy && consecutiveSteps >= maxConsecutiveSteps) {
      return false;
    }

    return true;
  });
};

const selectNextDirection = (availableDirections: IDirection[]): IDirection | undefined => {
  const weights = availableDirections.map((dir) => {
    if (dir.dx === 1) return 3; // Right: highest weight
    if (dir.dx === -1) return 1; // Left: lowest weight
    return 2; // Up/Down: medium weight
  });

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

  let random = Math.random() * totalWeight;

  for (let i = 0; i < weights.length; i++) {
    random = random - weights[i];

    if (random <= 0) {
      return availableDirections[i];
    }
  }

  // Fallback in case of floating point inaccuracies, though it's unlikely to be reached.
  return availableDirections[availableDirections.length - 1];
};

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
