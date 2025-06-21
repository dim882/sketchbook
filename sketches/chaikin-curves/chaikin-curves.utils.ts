interface IPoint {
  x: number;
  y: number;
}

interface IDirection {
  dx: number;
  dy: number;
}

interface IGridPosition {
  col: number;
  row: number;
}

export interface IGrid {
  cols: number;
  rows: number;
}

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
export const generateRandomGridPath = (grid: IGrid, maxIterations: number): IGridPosition[] => {
  let position: IGridPosition = {
    col: 0,
    row: Math.floor(grid.rows / 2),
  };
  let direction: IDirection = { dx: 1, dy: 0 }; // Always go right first
  const path: IGridPosition[] = [position];

  for (let i = 0; i < maxIterations && position.col < grid.cols - 1; i++) {
    if (i > 0) {
      const possibleDirections = getPossibleDirections({ grid, position, direction });
      const nextDirection = selectNextDirection(possibleDirections);

      if (!nextDirection) break;

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
export const generateRandomPath = (grid: IGrid, gridSize: number, maxIterations: number): IPoint[] => {
  const gridPath = generateRandomGridPath(grid, maxIterations);
  return mapGridPathToCoordinates(gridPath, gridSize);
};

export const applyChaikinCurve = (points: IPoint[], iterations: number): IPoint[] => {
  if (points.length < 2) {
    return points;
  }

  let result = [...points];

  for (let iter = 0; iter < iterations; iter++) {
    const newPoints: IPoint[] = [];

    newPoints.push(result[0]);

    // Apply Chaikin's algorithm to each pair of points
    for (let i = 0; i < result.length - 1; i++) {
      const p0 = result[i];
      const p1 = result[i + 1];

      // Create two new points at 1/4 and 3/4 positions between p0 and p1
      const q = {
        x: p0.x * 0.75 + p1.x * 0.25,
        y: p0.y * 0.75 + p1.y * 0.25,
      };
      const r = {
        x: p0.x * 0.25 + p1.x * 0.75,
        y: p0.y * 0.25 + p1.y * 0.75,
      };

      newPoints.push(q);
      newPoints.push(r);
    }

    // Keep the last point
    newPoints.push(result[result.length - 1]);

    result = newPoints;
  }

  return result;
};

const getPossibleDirections = ({
  position,
  grid,
  direction,
}: {
  position: { col: number; row: number };
  grid: IGrid;
  direction: IDirection;
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

    return true;
  });
};

const selectNextDirection = (availableDirections: IDirection[]): IDirection | undefined => {
  if (availableDirections.length === 0) {
    return undefined;
  }

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
