import { IDirection, IGrid, IGridPosition, IPoint, IVector } from './grid-curves-2.types';

const DIRECTIONS: readonly IDirection[] = [
  { dx: 1, dy: 0 }, // Right
  { dx: 0, dy: 1 }, // Down
  { dx: 0, dy: -1 }, // Up
  { dx: -1, dy: 0 }, // Left
];

/**
 * Generates a path that fills the canvas without backtracking
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
  const targetCells = Math.ceil(totalCells * 0.5); // 50% coverage target

  for (let i = 1; i < maxIterations && visitedCells.size < targetCells; i++) {
    const possibleDirections = getPossibleDirections({
      grid,
      position,
      direction,
      consecutiveSteps,
      maxConsecutiveSteps,
      visitedCells,
    });

    if (possibleDirections.length === 0) {
      break; // No valid moves available
    }

    // Choose random direction from available options
    const randomIndex = Math.floor(Math.random() * possibleDirections.length);
    const nextDirection = possibleDirections[randomIndex];

    direction = nextDirection;

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
  visitedCells,
}: {
  grid: IGrid;
  position: IGridPosition;
  direction: IDirection;
  consecutiveSteps: number;
  maxConsecutiveSteps: number;
  visitedCells: Set<string>;
}): IDirection[] => {
  return DIRECTIONS.filter((dir) => {
    const newCol = position.col + dir.dx;
    const newRow = position.row + dir.dy;

    // Check bounds
    if (newCol < 0 || newCol >= grid.cols || newRow < 0 || newRow >= grid.rows) {
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
