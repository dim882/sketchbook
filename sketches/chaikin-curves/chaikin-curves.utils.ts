interface IPoint {
  x: number;
  y: number;
}

/**
 * Generates a path that starts from the left edge and moves toward the right edge
 */
export const generateRandomPath = (
  width: number,
  height: number,
  gridSize: number,
  maxIterations: number
): IPoint[] => {
  const DIRECTIONS = [
    { dx: 1, dy: 0 }, // Right
    { dx: 0, dy: 1 }, // Down
    { dx: 0, dy: -1 }, // Up
    { dx: -1, dy: 0 }, // Left (with lower probability)
  ];
  const cols = Math.floor(width / gridSize);
  const rows = Math.floor(height / gridSize);

  // Start from the left edge (x = 0)
  const startCol = 0;
  const startRow = Math.floor(Math.random() * rows);
  let currentCol = startCol;
  let currentRow = startRow;

  const path: IPoint[] = [
    {
      x: currentCol * gridSize,
      y: currentRow * gridSize,
    },
  ];

  let lastDirection = { dx: 0, dy: 0 };
  let iterations = 0;

  while (iterations < maxIterations && currentCol < cols - 1) {
    const availableDirections = DIRECTIONS.filter((dir) => {
      const newCol = currentCol + dir.dx;
      const newRow = currentRow + dir.dy;

      // Check bounds
      if (newCol < 0 || newCol >= cols || newRow < 0 || newRow >= rows) {
        return false;
      }

      // Prevent 180-degree turns (up after down, down after up)
      if (lastDirection.dy === 1 && dir.dy === -1) return false; // Was going down, can't go up
      if (lastDirection.dy === -1 && dir.dy === 1) return false; // Was going up, can't go down

      return true;
    });

    if (availableDirections.length === 0) {
      break;
    }

    // Weight the directions: right has highest probability, left has lowest
    const weights = availableDirections.map((dir) => {
      if (dir.dx === 1) return 3; // Right: highest weight
      if (dir.dx === -1) return 1; // Left: lowest weight
      return 2; // Up/Down: medium weight
    });

    // Select direction based on weights
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    let selectedIndex = 0;

    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        selectedIndex = i;
        break;
      }
    }

    const direction = availableDirections[selectedIndex];
    lastDirection = direction;

    currentCol += direction.dx;
    currentRow += direction.dy;

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
