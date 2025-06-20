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
  const DIRECTIONS = [
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: -1 },
  ];
  const cols = Math.floor(width / gridSize);
  const rows = Math.floor(height / gridSize);
  const startCol = Math.floor(Math.random() * cols);
  const startRow = Math.floor(Math.random() * rows);
  let currentCol = startCol;
  let currentRow = startRow;
  const path: IPoint[] = [
    {
      x: currentCol * gridSize,
      y: currentRow * gridSize,
    },
  ];
  const visited: boolean[][] = Array(cols)
    .fill(null)
    .map(() => Array(rows).fill(false));

  visited[currentCol][currentRow] = true;

  let iterations = 0;

  while (iterations < maxIterations) {
    const availableDirections = DIRECTIONS.filter((dir) => {
      const newCol = currentCol + dir.dx;
      const newRow = currentRow + dir.dy;

      return newCol >= 0 && newCol < cols && newRow >= 0 && newRow < rows && !visited[newCol][newRow];
    });

    if (availableDirections.length === 0) {
      break;
    }

    const direction = availableDirections[Math.floor(Math.random() * availableDirections.length)];

    currentCol += direction.dx;
    currentRow += direction.dy;
    visited[currentCol][currentRow] = true;

    path.push({ x: currentCol * gridSize, y: currentRow * gridSize });

    iterations++;
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
