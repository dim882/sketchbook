export type IPoint = { x: number; y: number };
export type Polygon = IPoint[];
export type IPointTuple = [number, number];
export type PseudoRandomNumberGenerator = () => number;

// Clip a convex polygon by a half-plane using Sutherland–Hodgman.
const clipPolygon = (polygon: Polygon, isInside: (point: IPoint) => number): Polygon =>
  polygon.reduce<Polygon>((accumulatedPoints, currentPoint, index, points) => {
    const previousPoint = points[(index - 1 + points.length) % points.length];
    const currentInside = isInside(currentPoint) <= 0;
    const previousInside = isInside(previousPoint) <= 0;

    if (previousInside && currentInside) {
      return accumulatedPoints.concat(currentPoint);
    }

    if (previousInside && !currentInside) {
      const t = isInside(previousPoint) / (isInside(previousPoint) - isInside(currentPoint));
      const intersection: IPoint = {
        x: previousPoint.x + t * (currentPoint.x - previousPoint.x),
        y: previousPoint.y + t * (currentPoint.y - previousPoint.y),
      };

      return accumulatedPoints.concat(intersection);
    }

    if (!previousInside && currentInside) {
      const t = isInside(previousPoint) / (isInside(previousPoint) - isInside(currentPoint));
      const intersection: IPoint = {
        x: previousPoint.x + t * (currentPoint.x - previousPoint.x),
        y: previousPoint.y + t * (currentPoint.y - previousPoint.y),
      };

      return accumulatedPoints.concat(intersection, currentPoint);
    }

    return accumulatedPoints;
  }, []);

// Compute the Voronoi cell for a given site by clipping the bounding polygon
// with each half-plane that favors the current site over another site.
const computeCell = (currentSite: IPoint, allSites: IPoint[], boundingPolygon: Polygon): Polygon =>
  allSites
    .filter((otherSite) => otherSite.x !== currentSite.x || otherSite.y !== currentSite.y)
    .reduce<Polygon>((cellPolygon, otherSite) => {
      // Returns a positive number if point is closer to otherSite, negative if closer to currentSite.
      const halfPlaneTest = (point: IPoint) =>
        2 * (otherSite.x - currentSite.x) * point.x +
        2 * (otherSite.y - currentSite.y) * point.y -
        (otherSite.x ** 2 - currentSite.x ** 2 + (otherSite.y ** 2 - currentSite.y ** 2));

      return clipPolygon(cellPolygon, halfPlaneTest);
    }, boundingPolygon);

export const computeVoronoi = (sites: IPoint[], boundingPolygon: Polygon): { site: IPoint; cell: Polygon }[] =>
  sites.map((site) => ({
    site,
    cell: computeCell(site, sites, boundingPolygon),
  }));

// Poisson‐disk sampling in a rectangle
export function generatePoissonPoints(
  width: number,
  height: number,
  minDist: number,
  prng: PseudoRandomNumberGenerator,
  k = 30
): IPoint[] {
  const cellSize = minDist / Math.SQRT2;
  const gridCols = Math.ceil(width / cellSize);
  const gridRows = Math.ceil(height / cellSize);
  const grid: (IPoint | null)[] = new Array(gridCols * gridRows).fill(null);

  const result: IPoint[] = [];
  const active: IPoint[] = [];

  function gridIndex(p: IPoint) {
    const gx = Math.floor(p.x / cellSize);
    const gy = Math.floor(p.y / cellSize);
    return gy * gridCols + gx;
  }

  const initial: IPoint = { x: prng() * width, y: prng() * height };
  result.push(initial);
  active.push(initial);
  grid[gridIndex(initial)] = initial;

  while (active.length) {
    const idx = Math.floor(prng() * active.length);
    const point = active[idx];
    let placed = false;

    for (let i = 0; i < k; i++) {
      const r = minDist * (1 + prng());
      const theta = 2 * Math.PI * prng();
      const sample: IPoint = {
        x: point.x + r * Math.cos(theta),
        y: point.y + r * Math.sin(theta),
      };

      if (sample.x < 0 || sample.x >= width || sample.y < 0 || sample.y >= height) {
        continue;
      }

      const gx = Math.floor(sample.x / cellSize);
      const gy = Math.floor(sample.y / cellSize);
      let ok = true;

      for (let yOff = -1; yOff <= 1; yOff++) {
        for (let xOff = -1; xOff <= 1; xOff++) {
          const nx = gx + xOff;
          const ny = gy + yOff;

          if (nx >= 0 && nx < gridCols && ny >= 0 && ny < gridRows) {
            const neighbor = grid[ny * gridCols + nx];
            if (neighbor) {
              const dx = neighbor.x - sample.x;
              const dy = neighbor.y - sample.y;
              if (dx * dx + dy * dy < minDist * minDist) {
                ok = false;
                break;
              }
            }
          }
        }
        if (!ok) {
          break;
        }
      }

      if (ok) {
        result.push(sample);
        active.push(sample);
        grid[gridIndex(sample)] = sample;
        placed = true;
        break;
      }
    }

    if (!placed) {
      active.splice(idx, 1);
    }
  }

  return result;
}

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
