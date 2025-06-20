interface IPoint {
  x: number;
  y: number;
}

interface IDirection {
  dx: number;
  dy: number;
}

const DIRECTIONS: readonly IDirection[] = [
  { dx: 1, dy: 0 }, // Right
  { dx: 0, dy: 1 }, // Down
  { dx: 0, dy: -1 }, // Up
  { dx: -1, dy: 0 }, // Left
];

/**
 * Generates a path that starts from the left edge and moves toward the right edge
 */
export const generateRandomPath = (
  width: number,
  height: number,
  gridSize: number,
  maxIterations: number
): IPoint[] => {
  const grid = {
    cols: Math.floor(width / gridSize),
    rows: Math.floor(height / gridSize),
  };

  let currentPosition = { col: 0, row: Math.floor(Math.random() * grid.rows) };
  let lastDirection: IDirection = { dx: 1, dy: 0 }; // Start with right direction

  const path: IPoint[] = [
    {
      x: currentPosition.col * gridSize,
      y: currentPosition.row * gridSize,
    },
  ];

  // First move is always to the right
  currentPosition.col += lastDirection.dx;
  currentPosition.row += lastDirection.dy;
  path.push({ x: currentPosition.col * gridSize, y: currentPosition.row * gridSize });

  // Continue with random directions for remaining moves
  for (let i = 1; i < maxIterations && currentPosition.col < grid.cols - 1; i++) {
    const availableDirections = getAvailableDirections({
      currentPosition,
      grid,
      lastDirection,
    });
    console.log(availableDirections);

    const direction = selectNextDirection(availableDirections);

    if (!direction) {
      break;
    }

    lastDirection = direction;
    currentPosition.col += direction.dx;
    currentPosition.row += direction.dy;

    path.push({ x: currentPosition.col * gridSize, y: currentPosition.row * gridSize });
  }

  return path;
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

const getAvailableDirections = ({
  currentPosition,
  grid,
  lastDirection,
}: {
  currentPosition: { col: number; row: number };
  grid: { cols: number; rows: number };
  lastDirection: IDirection;
}): IDirection[] => {
  return DIRECTIONS.filter((dir) => {
    const newCol = currentPosition.col + dir.dx;
    const newRow = currentPosition.row + dir.dy;

    // Check bounds
    if (newCol < 0 || newCol >= grid.cols || newRow < 0 || newRow >= grid.rows) {
      return false;
    }

    // Prevent 180-degree turns
    if (dir.dx !== 0 && dir.dx === -lastDirection.dx) return false;
    if (dir.dy !== 0 && dir.dy === -lastDirection.dy) return false;

    // Prevent leftward movement to ensure progress toward right edge
    if (dir.dx === -1) return false;

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
    random -= weights[i];

    if (random <= 0) {
      return availableDirections[i];
    }
  }

  // Fallback in case of floating point inaccuracies, though it's unlikely to be reached.
  return availableDirections[availableDirections.length - 1];
};
