interface IPoint {
  x: number;
  y: number;
}

/**
 * Generates a random path on a grid that doesn't overlap itself
 */
export const generateRandomPath = (
  width: number,
  height: number,
  gridSize: number,
  maxIterations: number
): IPoint[] => {
  // Calculate grid dimensions
  const cols = Math.floor(width / gridSize);
  const rows = Math.floor(height / gridSize);

  // Initialize visited cells grid
  const visited: boolean[][] = Array(cols)
    .fill(null)
    .map(() => Array(rows).fill(false));

  // Possible directions: right, down, left, up
  const directions = [
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: -1 },
  ];

  // Start at a random position
  const startCol = Math.floor(Math.random() * cols);
  const startRow = Math.floor(Math.random() * rows);

  let currentCol = startCol;
  let currentRow = startRow;

  // Mark starting position as visited
  visited[currentCol][currentRow] = true;

  // Initialize path with starting point
  const path: IPoint[] = [{ x: currentCol * gridSize, y: currentRow * gridSize }];

  let iterations = 0;

  while (iterations < maxIterations) {
    // Find available directions
    const availableDirections = directions.filter((dir) => {
      const newCol = currentCol + dir.dx;
      const newRow = currentRow + dir.dy;

      return newCol >= 0 && newCol < cols && newRow >= 0 && newRow < rows && !visited[newCol][newRow];
    });

    // If no available directions, break
    if (availableDirections.length === 0) {
      break;
    }

    // Choose a random direction
    const direction = availableDirections[Math.floor(Math.random() * availableDirections.length)];

    // Move to new position
    currentCol += direction.dx;
    currentRow += direction.dy;

    // Mark as visited
    visited[currentCol][currentRow] = true;

    // Add to path
    path.push({ x: currentCol * gridSize, y: currentRow * gridSize });

    iterations++;
  }

  return path;
};

/**
 * Applies the Chaikin curve algorithm to smooth a path
 */
export const applyChaikinCurve = (points: IPoint[], iterations: number): IPoint[] => {
  if (points.length < 2) {
    return points;
  }

  let result = [...points];

  for (let iter = 0; iter < iterations; iter++) {
    const newPoints: IPoint[] = [];

    // Keep the first point
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
