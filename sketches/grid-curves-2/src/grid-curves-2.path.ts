import { IDirection, IGrid, IGridPosition, IPoint, IVector } from './grid-curves-2.types';

const DIRECTIONS: readonly IDirection[] = [
  { dx: 1, dy: 0 }, // Right
  { dx: 0, dy: 1 }, // Down
  { dx: 0, dy: -1 }, // Up
  { dx: -1, dy: 0 }, // Left
];

/**
 * Determines the next direction for the path, prioritizing unexplored areas
 */
const determineNextDirection = ({
  grid,
  position,
  direction,
  consecutiveSteps,
  maxConsecutiveSteps,
  visitedCells,
}: {
  grid: IGrid;
  position: IGridPosition;
  direction: IDirection;
  consecutiveSteps: number;
  maxConsecutiveSteps: number;
  visitedCells: Set<string>;
}): IDirection | undefined => {
  const possibleDirections = getPossibleDirections({
    grid,
    position,
    direction,
    consecutiveSteps,
    maxConsecutiveSteps,
  });

  return selectNextDirection(possibleDirections, position, visitedCells, grid);
};

/**
 * Generates a path that fills the canvas without returning to start
 * Continues until at least 50% of cells are filled
 */
export const generateRandomGridPath = (
  grid: IGrid,
  maxIterations: number,
  maxConsecutiveSteps: number,
  edgeMargin: number
): IGridPosition[] => {
  const startPosition: IGridPosition = {
    col: edgeMargin,
    row: Math.floor(grid.rows / 2),
  };

  const path: IGridPosition[] = [startPosition];
  const visitedCells = new Set<string>();
  const cellKey = (pos: IGridPosition) => `${pos.col},${pos.row}`;

  visitedCells.add(cellKey(startPosition));

  let position = { ...startPosition };
  let direction: IDirection = { dx: 1, dy: 0 }; // Initial direction
  let consecutiveSteps = 1;

  const totalCells = grid.cols * grid.rows;
  const targetCells = Math.ceil(totalCells * 0.9);

  for (let i = 1; i < maxIterations && visitedCells.size < targetCells; i++) {
    const nextDirection = determineNextDirection({
      grid,
      position,
      direction,
      consecutiveSteps,
      maxConsecutiveSteps,
      visitedCells,
    });

    if (!nextDirection) {
      // If no valid direction, try to find any unvisited adjacent cell
      const fallbackDirection = findFallbackDirection(position, grid, visitedCells);
      if (!fallbackDirection) {
        break; // No more moves possible
      }
      direction = fallbackDirection;
      consecutiveSteps = 1;
    } else {
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
    visitedCells.add(cellKey(position));
  }

  return path;
};

/**
 * Finds a fallback direction when normal pathfinding fails
 */
const findFallbackDirection = (
  position: IGridPosition,
  grid: IGrid,
  visitedCells: Set<string>
): IDirection | undefined => {
  const cellKey = (pos: IGridPosition) => `${pos.col},${pos.row}`;

  for (const dir of DIRECTIONS) {
    const newCol = position.col + dir.dx;
    const newRow = position.row + dir.dy;

    if (newCol >= 0 && newCol < grid.cols && newRow >= 0 && newRow < grid.rows) {
      const newPos = { col: newCol, row: newRow };
      if (!visitedCells.has(cellKey(newPos))) {
        return dir;
      }
    }
  }

  return undefined;
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
export const generateRandomPath = (
  grid: IGrid,
  maxIterations: number,
  maxConsecutiveSteps: number,
  edgeMargin: number
): IPoint[] => {
  const gridPath = generateRandomGridPath(grid, maxIterations, maxConsecutiveSteps, edgeMargin);
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

const selectNextDirection = (
  availableDirections: IDirection[],
  position: IGridPosition,
  visitedCells: Set<string>,
  grid: IGrid
): IDirection | undefined => {
  const weights = availableDirections.map((dir) => {
    const newCol = position.col + dir.dx;
    const newRow = position.row + dir.dy;

    if (newCol < 0 || newCol >= grid.cols || newRow < 0 || newRow >= grid.rows) {
      return 0; // Out of bounds
    }

    if (visitedCells.has(`${newCol},${newRow}`)) {
      return 0; // Already visited
    }

    // Prioritize unvisited cells
    if (dir.dx === 0 && dir.dy === 1) return 10; // Down
    if (dir.dx === 0 && dir.dy === -1) return 10; // Up
    if (dir.dx === 1 && dir.dy === 0) return 10; // Right
    if (dir.dx === -1 && dir.dy === 0) return 10; // Left

    // Fallback weights
    if (dir.dx === 0) return 5; // Up/Down
    if (dir.dy === 0) return 5; // Left/Right

    return 1; // Default weight
  });

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0 as number);

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
